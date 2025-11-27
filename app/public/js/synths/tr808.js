/**
 * TR-808 Drum Machine
 * Iconic Roland TR-808 drum synthesizer
 */

class TR808 {
    constructor(audioContext) {
        this.context = audioContext;
        this.output = this.context.createGain();
        this.output.gain.value = 0.9;
        
        // Drum parameters
        this.params = {
            kick: {
                pitch: 50,
                decay: 0.5,
                tone: 0.5,
                level: 1.0
            },
            snare: {
                tune: 200,
                tone: 0.5,
                snappy: 0.5,
                level: 0.8
            },
            clap: {
                level: 0.7
            },
            hat: {
                decay: 0.05,
                level: 0.6
            }
        };
        
        // Pattern
        this.pattern = [];
        this.bpm = 90;
    }
    
    // Play 808 kick
    playKick(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.kick;
        
        // 808 kick uses a sine wave with dramatic pitch envelope
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        
        // Pitch envelope (starts higher, drops quickly)
        const startFreq = params.pitch * 7;
        const endFreq = params.pitch;
        
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.05);
        
        // Amplitude envelope
        const amp = this.context.createGain();
        amp.gain.setValueAtTime(params.level, t);
        amp.gain.exponentialRampToValueAtTime(0.001, t + params.decay);
        
        // Slight distortion for punch
        const waveshaper = this.context.createWaveShaper();
        waveshaper.curve = this.makeDistortionCurve(10);
        
        // Connect
        osc.connect(waveshaper);
        waveshaper.connect(amp);
        amp.connect(this.output);
        
        osc.start(t);
        osc.stop(t + params.decay);
    }
    
    // Play 808 snare
    playSnare(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.snare;
        
        // Two triangle waves
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = params.tune;
        osc2.frequency.value = params.tune * 1.6;
        
        const oscGain = this.context.createGain();
        oscGain.gain.setValueAtTime(0.2, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        
        // Noise component
        const noise = this.context.createBufferSource();
        const bufferSize = this.context.sampleRate * 0.1;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(params.level, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        
        // Mix
        const mix = this.context.createGain();
        oscGain.connect(mix);
        noiseGain.connect(mix);
        mix.connect(this.output);
        
        osc1.start(t);
        osc2.start(t);
        noise.start(t);
        osc1.stop(t + 0.1);
        osc2.stop(t + 0.1);
    }
    
    // Play 808 clap
    playClap(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.clap;
        
        // 808 clap is 3-4 short noise bursts
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.025;
            const noise = this.context.createBufferSource();
            const bufferSize = this.context.sampleRate * 0.05;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const filter = this.context.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1500;
            filter.Q.value = 10;
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(params.level * (1 - i * 0.15), t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.output);
            
            noise.start(t + delay);
        }
    }
    
    // Play 808 hi-hat
    playHat(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.hat;
        
        // Six square waves for metallic sound
        const fundamental = 40;
        const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
        
        const mix = this.context.createGain();
        mix.gain.setValueAtTime(params.level, t);
        mix.gain.exponentialRampToValueAtTime(0.001, t + params.decay);
        
        ratios.forEach(ratio => {
            const osc = this.context.createOscillator();
            osc.type = 'square';
            osc.frequency.value = fundamental * ratio;
            
            const oscGain = this.context.createGain();
            oscGain.gain.value = 1 / ratios.length;
            
            osc.connect(oscGain);
            oscGain.connect(mix);
            
            osc.start(t);
            osc.stop(t + params.decay);
        });
        
        // Highpass filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        mix.connect(filter);
        filter.connect(this.output);
    }
    
    // Utility: Create distortion curve
    makeDistortionCurve(amount = 50) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    // Connect to destination
    connect(destination) {
        this.output.connect(destination);
        return this;
    }
    
    // Disconnect
    disconnect() {
        this.output.disconnect();
        return this;
    }
}

// Make available globally
window.TR808 = TR808;
