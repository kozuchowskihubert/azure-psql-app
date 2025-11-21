/**
 * Web Audio Synthesis Engine for Behringer 2600 Studio
 * Real-time audio synthesis with visualization
 */

class SynthesisEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.masterGain = null;
        
        // Oscillators
        this.vco1 = null;
        this.vco2 = null;
        this.lfo = null;
        
        // Filters
        this.filter = null;
        
        // Envelopes
        this.ampEnvelope = null;
        this.filterEnvelope = null;
        
        // Analyzers for visualization
        this.analyzer = null;
        this.waveformAnalyzer = null;
        this.spectrumAnalyzer = null;
        
        // Current parameters
        this.params = {
            vco1: { frequency: 440, waveform: 'sawtooth', detune: 0 },
            vco2: { frequency: 440, waveform: 'sawtooth', detune: 5 },
            vcf: { cutoff: 1000, resonance: 0.5, mode: 'lowpass' },
            lfo: { frequency: 0.5, waveform: 'sine', depth: 0 },
            env: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 }
        };
    }
    
    initialize() {
        if (this.audioContext) return;
        
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        
        // Create analyzers
        this.waveformAnalyzer = this.audioContext.createAnalyser();
        this.waveformAnalyzer.fftSize = 2048;
        
        this.spectrumAnalyzer = this.audioContext.createAnalyser();
        this.spectrumAnalyzer.fftSize = 2048;
        this.spectrumAnalyzer.smoothingTimeConstant = 0.8;
        
        // Connect master gain to analyzers to output
        this.masterGain.connect(this.waveformAnalyzer);
        this.waveformAnalyzer.connect(this.spectrumAnalyzer);
        this.spectrumAnalyzer.connect(this.audioContext.destination);
        
        console.log('✅ Audio engine initialized');
    }
    
    createVoice() {
        const now = this.audioContext.currentTime;
        
        // Create VCO1 (Oscillator 1)
        this.vco1 = this.audioContext.createOscillator();
        this.vco1.type = this.params.vco1.waveform;
        this.vco1.frequency.value = this.params.vco1.frequency;
        this.vco1.detune.value = this.params.vco1.detune;
        
        // Create VCO2 (Oscillator 2)
        this.vco2 = this.audioContext.createOscillator();
        this.vco2.type = this.params.vco2.waveform;
        this.vco2.frequency.value = this.params.vco2.frequency;
        this.vco2.detune.value = this.params.vco2.detune;
        
        // Create LFO for modulation
        this.lfo = this.audioContext.createOscillator();
        this.lfo.type = this.params.lfo.waveform;
        this.lfo.frequency.value = this.params.lfo.frequency;
        
        // Create LFO gain for depth control
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = this.params.lfo.depth * 500; // Modulation depth
        
        // Connect LFO to filter cutoff
        this.lfo.connect(lfoGain);
        
        // Create mixer (gain nodes for VCO1 and VCO2)
        const vco1Gain = this.audioContext.createGain();
        vco1Gain.gain.value = 0.5;
        
        const vco2Gain = this.audioContext.createGain();
        vco2Gain.gain.value = 0.5;
        
        // Create VCF (Filter)
        this.filter = this.audioContext.createBiquadFilter();
        this.filter.type = this.params.vcf.mode;
        this.filter.frequency.value = this.params.vcf.cutoff;
        this.filter.Q.value = this.params.vcf.resonance * 30; // Scale resonance
        
        // Connect LFO to filter
        lfoGain.connect(this.filter.frequency);
        
        // Create VCA (Amplitude envelope)
        const vca = this.audioContext.createGain();
        vca.gain.value = 0;
        
        // Apply ADSR envelope
        const env = this.params.env;
        const attackTime = now + env.attack;
        const decayTime = attackTime + env.decay;
        
        // Attack
        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(1.0, attackTime);
        
        // Decay
        vca.gain.linearRampToValueAtTime(env.sustain, decayTime);
        
        // Connect signal chain: VCO → Mixer → VCF → VCA → Master
        this.vco1.connect(vco1Gain);
        this.vco2.connect(vco2Gain);
        
        vco1Gain.connect(this.filter);
        vco2Gain.connect(this.filter);
        
        this.filter.connect(vca);
        vca.connect(this.masterGain);
        
        // Start oscillators
        this.vco1.start(now);
        this.vco2.start(now);
        this.lfo.start(now);
        
        // Store VCA for release
        this.currentVCA = vca;
        
        return { vco1: this.vco1, vco2: this.vco2, lfo: this.lfo, vca, filter: this.filter };
    }
    
    playNote(frequency = null, duration = 2.0) {
        if (!this.audioContext) {
            this.initialize();
        }
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (frequency) {
            this.params.vco1.frequency = frequency;
            this.params.vco2.frequency = frequency;
        }
        
        const voice = this.createVoice();
        this.isPlaying = true;
        
        // Schedule release
        const now = this.audioContext.currentTime;
        const releaseTime = now + duration;
        const releaseEndTime = releaseTime + this.params.env.release;
        
        voice.vca.gain.setValueAtTime(voice.vca.gain.value, releaseTime);
        voice.vca.gain.linearRampToValueAtTime(0, releaseEndTime);
        
        // Stop oscillators after release
        setTimeout(() => {
            if (voice.vco1) voice.vco1.stop();
            if (voice.vco2) voice.vco2.stop();
            if (voice.lfo) voice.lfo.stop();
            this.isPlaying = false;
        }, (duration + this.params.env.release) * 1000);
        
        return voice;
    }
    
    stop() {
        if (this.currentVCA && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.currentVCA.gain.cancelScheduledValues(now);
            this.currentVCA.gain.setValueAtTime(this.currentVCA.gain.value, now);
            this.currentVCA.gain.linearRampToValueAtTime(0, now + this.params.env.release);
        }
        
        if (this.vco1) {
            setTimeout(() => {
                if (this.vco1) this.vco1.stop();
                if (this.vco2) this.vco2.stop();
                if (this.lfo) this.lfo.stop();
            }, this.params.env.release * 1000);
        }
        
        this.isPlaying = false;
    }
    
    updateParameter(module, param, value) {
        if (!this.params[module]) return;
        
        this.params[module][param] = value;
        
        // Update live parameters if playing
        if (this.audioContext) {
            const now = this.audioContext.currentTime;
            
            if (module === 'vco1' && this.vco1) {
                if (param === 'frequency') this.vco1.frequency.setValueAtTime(value, now);
                if (param === 'waveform') this.vco1.type = value;
                if (param === 'detune') this.vco1.detune.setValueAtTime(value, now);
            }
            
            if (module === 'vco2' && this.vco2) {
                if (param === 'frequency') this.vco2.frequency.setValueAtTime(value, now);
                if (param === 'waveform') this.vco2.type = value;
                if (param === 'detune') this.vco2.detune.setValueAtTime(value, now);
            }
            
            if (module === 'vcf' && this.filter) {
                if (param === 'cutoff') this.filter.frequency.setValueAtTime(value, now);
                if (param === 'resonance') this.filter.Q.setValueAtTime(value * 30, now);
                if (param === 'mode') this.filter.type = value;
            }
            
            if (module === 'lfo' && this.lfo) {
                if (param === 'frequency') this.lfo.frequency.setValueAtTime(value, now);
                if (param === 'waveform') this.lfo.type = value;
            }
        }
    }
    
    getWaveformData() {
        if (!this.waveformAnalyzer) return new Uint8Array(0);
        
        const bufferLength = this.waveformAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.waveformAnalyzer.getByteTimeDomainData(dataArray);
        return dataArray;
    }
    
    getSpectrumData() {
        if (!this.spectrumAnalyzer) return new Uint8Array(0);
        
        const bufferLength = this.spectrumAnalyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.spectrumAnalyzer.getByteFrequencyData(dataArray);
        return dataArray;
    }
    
    loadPreset(preset) {
        // Load preset parameters
        const modules = preset.modules || {};
        const modulators = preset.modulators || {};
        
        // VCO1
        if (modules.VCO1) {
            const vco1Params = modules.VCO1.parameters || {};
            this.params.vco1.frequency = vco1Params.frequency || 440;
            this.params.vco1.waveform = vco1Params.waveform || 'sawtooth';
        }
        
        // VCO2
        if (modules.VCO2) {
            const vco2Params = modules.VCO2.parameters || {};
            this.params.vco2.frequency = vco2Params.frequency || 440;
            this.params.vco2.waveform = vco2Params.waveform || 'sawtooth';
        }
        
        // VCF
        if (modules.VCF) {
            const vcfParams = modules.VCF.parameters || {};
            const cutoffNormalized = vcfParams.cutoff || 0.5;
            this.params.vcf.cutoff = 20 + (cutoffNormalized * 19980); // 20Hz - 20kHz
            this.params.vcf.resonance = vcfParams.resonance || 0;
            this.params.vcf.mode = vcfParams.mode === 'LP' ? 'lowpass' : 
                                  vcfParams.mode === 'HP' ? 'highpass' : 
                                  vcfParams.mode === 'BP' ? 'bandpass' : 'lowpass';
        }
        
        // LFO
        if (modulators.LFO1) {
            this.params.lfo.frequency = modulators.LFO1.rate || 0.5;
            this.params.lfo.waveform = modulators.LFO1.waveform || 'sine';
            this.params.lfo.depth = modulators.LFO1.depth || 0;
        }
        
        // Envelope
        if (modulators.ENV1) {
            this.params.env.attack = modulators.ENV1.attack || 0.01;
            this.params.env.decay = modulators.ENV1.decay || 0.2;
            this.params.env.sustain = modulators.ENV1.sustain || 0.6;
            this.params.env.release = modulators.ENV1.release || 0.3;
        }
        
        console.log('✅ Preset loaded:', preset.name);
    }
}

// Audio Visualization
class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.animationId = null;
    }
    
    drawWaveform(dataArray) {
        if (!this.ctx || !dataArray || dataArray.length === 0) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const bufferLength = dataArray.length;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw waveform
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#00d4ff';
        this.ctx.beginPath();
        
        const sliceWidth = width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
        
        // Draw center line
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
    }
    
    drawSpectrum(dataArray) {
        if (!this.ctx || !dataArray || dataArray.length === 0) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const bufferLength = dataArray.length;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw spectrum
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            
            // Color gradient based on frequency
            const hue = (i / bufferLength) * 180 + 180; // Cyan to purple
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            this.ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    
    start(engine, mode = 'waveform') {
        if (!this.ctx) return;
        
        const animate = () => {
            if (mode === 'waveform') {
                const data = engine.getWaveformData();
                this.drawWaveform(data);
            } else {
                const data = engine.getSpectrumData();
                this.drawSpectrum(data);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SynthesisEngine, AudioVisualizer };
}
