/**
 * TR-909 Drum Machine
 * Legendary Roland TR-909 drum synthesizer
 */

class TR909 {
    constructor(audioContext) {
        this.context = audioContext;
        this.output = this.context.createGain();
        this.output.gain.value = 0.9;
        
        // Drum parameters
        this.params = {
            kick: {
                pitch: 60,
                decay: 0.5,
                tone: 0.5,
                level: 0.9
            },
            snare: {
                tune: 200,
                tone: 0.5,
                snappy: 0.7,
                decay: 0.2,
                level: 0.8
            },
            hatClosed: {
                tune: 0.5,
                decay: 0.05,
                level: 0.6
            },
            hatOpen: {
                tune: 0.5,
                decay: 0.3,
                level: 0.7
            },
            clap: {
                tone: 0.5,
                decay: 0.2,
                level: 0.8
            }
        };
        
        // Pattern
        this.pattern = [];
        this.bpm = 128;
    }
    
    // Play kick drum
    playKick(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.kick;
        
        // Oscillator for body
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        
        // Pitch envelope
        osc.frequency.setValueAtTime(150 * (params.pitch / 60), t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
        
        // Amplitude envelope
        const amp = this.context.createGain();
        amp.gain.setValueAtTime(params.level, t);
        amp.gain.exponentialRampToValueAtTime(0.001, t + params.decay);
        
        // Tone control (filter)
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150 + (params.tone * 200);
        
        // Connect
        osc.connect(filter);
        filter.connect(amp);
        amp.connect(this.output);
        
        osc.start(t);
        osc.stop(t + params.decay);
    }
    
    // Play snare drum
    playSnare(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.snare;
        
        // Tonal component (two oscillators)
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = params.tune;
        osc2.frequency.value = params.tune * 1.5;
        
        const oscGain = this.context.createGain();
        oscGain.gain.setValueAtTime(0.3 * params.tone, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + params.decay);
        
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        
        // Noise component
        const bufferSize = this.context.sampleRate * params.decay;
        const noise = this.context.createBufferSource();
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000 * params.snappy;
        
        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(params.level, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + params.decay);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        
        // Mix and output
        const mix = this.context.createGain();
        oscGain.connect(mix);
        noiseGain.connect(mix);
        mix.connect(this.output);
        
        osc1.start(t);
        osc2.start(t);
        noise.start(t);
        osc1.stop(t + params.decay);
        osc2.stop(t + params.decay);
    }
    
    // Play closed hi-hat
    playHatClosed(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.hatClosed;
        
        this.playHat(t, params.decay, params.level, params.tune);
    }
    
    // Play open hi-hat
    playHatOpen(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.hatOpen;
        
        this.playHat(t, params.decay, params.level, params.tune);
    }
    
    // Generic hi-hat synthesis
    playHat(time, decay, level, tune) {
        // Use multiple square waves for metallic sound
        const fundamental = 40;
        const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
        
        const mix = this.context.createGain();
        mix.gain.setValueAtTime(level, time);
        mix.gain.exponentialRampToValueAtTime(0.001, time + decay);
        
        ratios.forEach(ratio => {
            const osc = this.context.createOscillator();
            osc.type = 'square';
            osc.frequency.value = fundamental * ratio * (0.5 + tune);
            
            const oscGain = this.context.createGain();
            oscGain.gain.value = 1 / ratios.length;
            
            osc.connect(oscGain);
            oscGain.connect(mix);
            
            osc.start(time);
            osc.stop(time + decay);
        });
        
        // Highpass filter for brightness
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        mix.connect(filter);
        filter.connect(this.output);
    }
    
    // Play clap
    playClap(time = null) {
        const t = time || this.context.currentTime;
        const params = this.params.clap;
        
        // Multiple short bursts of noise
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.03;
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
            filter.frequency.value = 1000 + (params.tone * 2000);
            filter.Q.value = 10;
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(params.level * (1 - i * 0.2), t + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, t + delay + params.decay);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.output);
            
            noise.start(t + delay);
        }
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
window.TR909 = TR909;
