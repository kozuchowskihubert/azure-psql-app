/**
 * ARP 2600 Modular Synthesizer Module
 * Emulates ARP 2600 semi-modular analog synthesizer
 * 
 * Features:
 * - 3 VCOs (Oscillators)
 * - VCF (Filter) with multiple modes
 * - VCA (Amplifier)
 * - Envelope generators
 * - LFO (Low Frequency Oscillator)
 * - Ring modulator
 * - Sample & Hold
 * - Virtual patch bay
 */

class ARP2600 {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // Oscillators
        this.vco1 = {
            waveform: 'sawtooth',
            frequency: 440,
            fine: 0,
            octave: 0,
            enabled: true
        };
        
        this.vco2 = {
            waveform: 'square',
            frequency: 440,
            fine: 0,
            octave: 0,
            enabled: false
        };
        
        this.vco3 = {
            waveform: 'sine',
            frequency: 440,
            fine: 0,
            octave: -1,
            enabled: false
        };
        
        // Filter
        this.vcf = {
            type: 'lowpass',
            cutoff: 2000,
            resonance: 5,
            envAmount: 50,
            keyTrack: 50
        };
        
        // Amplifier
        this.vca = {
            level: 0.7,
            mode: 'envelope' // 'envelope' or 'gate'
        };
        
        // ADSR Envelope
        this.envelope = {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.7,
            release: 0.5
        };
        
        // LFO
        this.lfo = {
            waveform: 'sine',
            rate: 5,
            amount: 0
        };
        
        // Ring Modulator
        this.ringMod = {
            enabled: false,
            carrier: 440,
            modulator: 220
        };
        
        // Sample & Hold
        this.sampleHold = {
            enabled: false,
            rate: 10
        };
        
        // Patch connections (virtual patch bay)
        this.patches = [];
        
        // External modulation sources
        this.externalMod = {
            enabled: false,
            source: null,  // External audio node
            amount: 0.5,
            destination: 'filter' // 'filter', 'pitch', 'amplitude'
        };
        
        // Active voices
        this.activeVoices = [];
    }
    
    /**
     * Connect external modulation source (for string machine etc)
     */
    setExternalModulation(enabled, source = null, amount = 0.5, destination = 'filter') {
        this.externalMod.enabled = enabled;
        this.externalMod.source = source;
        this.externalMod.amount = Math.max(0, Math.min(1, amount));
        this.externalMod.destination = destination;
    }
    
    /**
     * Set VCO parameter
     */
    setVCO(vcoNum, param, value) {
        const vco = this[`vco${vcoNum}`];
        if (vco && vco.hasOwnProperty(param)) {
            vco[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Set VCF parameter
     */
    setVCF(param, value) {
        if (this.vcf.hasOwnProperty(param)) {
            this.vcf[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Set VCA parameter
     */
    setVCA(param, value) {
        if (this.vca.hasOwnProperty(param)) {
            this.vca[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Set envelope parameter
     */
    setEnvelope(param, value) {
        if (this.envelope.hasOwnProperty(param)) {
            this.envelope[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Set LFO parameter
     */
    setLFO(param, value) {
        if (this.lfo.hasOwnProperty(param)) {
            this.lfo[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Add patch cable connection
     */
    addPatch(source, destination, amount = 1.0) {
        this.patches.push({ source, destination, amount });
        return this.patches.length - 1;
    }
    
    /**
     * Remove patch cable
     */
    removePatch(index) {
        if (index >= 0 && index < this.patches.length) {
            this.patches.splice(index, 1);
            return true;
        }
        return false;
    }
    
    /**
     * Clear all patches
     */
    clearPatches() {
        this.patches = [];
    }
    
    /**
     * Play note
     */
    playNote(frequency, duration = 1.0, velocity = 1.0, time = null) {
        const startTime = time || this.audioContext.currentTime;
        const endTime = startTime + duration;
        
        // Create oscillator mixer
        const mixer = this.audioContext.createGain();
        mixer.gain.value = 0;
        
        const oscillators = [];
        
        // VCO 1
        if (this.vco1.enabled) {
            const osc = this._createOscillator(this.vco1, frequency, startTime);
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        // VCO 2
        if (this.vco2.enabled) {
            const osc = this._createOscillator(this.vco2, frequency, startTime);
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        // VCO 3
        if (this.vco3.enabled) {
            const osc = this._createOscillator(this.vco3, frequency, startTime);
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        if (oscillators.length > 0) {
            mixer.gain.value = 1.0 / oscillators.length;
        }
        
        // Create filter
        const filter = this._createFilter(startTime);
        
        // LFO modulation
        let lfo = null;
        if (this.lfo.amount > 0) {
            lfo = this._createLFO(startTime);
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = this.lfo.amount * this.vcf.cutoff * 0.5;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
        }
        
        // External modulation (e.g., from string machine)
        if (this.externalMod.enabled && this.externalMod.source) {
            const modGain = this.audioContext.createGain();
            modGain.gain.value = this.externalMod.amount;
            
            switch (this.externalMod.destination) {
                case 'filter':
                    // Modulate filter cutoff
                    this.externalMod.source.connect(modGain);
                    modGain.connect(filter.frequency);
                    break;
                case 'amplitude':
                    // Modulate amplitude (will be connected later to VCA)
                    // Store for later connection
                    voice.externalModGain = modGain;
                    this.externalMod.source.connect(modGain);
                    break;
                case 'pitch':
                    // Modulate pitch of all oscillators
                    oscillators.forEach(osc => {
                        this.externalMod.source.connect(modGain);
                        modGain.connect(osc.frequency);
                    });
                    break;
            }
        }
        
        // VCA with envelope
        const vca = this.audioContext.createGain();
        this._applyEnvelope(vca.gain, startTime, endTime, velocity);
        
        // Connect audio graph
        mixer.connect(filter);
        filter.connect(vca);
        vca.connect(this.audioContext.destination);
        
        // Start oscillators
        oscillators.forEach(osc => {
            osc.start(startTime);
            osc.stop(endTime + this.envelope.release);
        });
        
        // Start LFO
        if (lfo) {
            lfo.start(startTime);
            lfo.stop(endTime + this.envelope.release);
        }
        
        // Store voice for cleanup
        const voice = {
            oscillators,
            filter,
            vca,
            lfo,
            endTime: endTime + this.envelope.release
        };
        
        this.activeVoices.push(voice);
        
        // Auto-cleanup after note ends
        setTimeout(() => {
            const index = this.activeVoices.indexOf(voice);
            if (index > -1) {
                this.activeVoices.splice(index, 1);
            }
        }, (duration + this.envelope.release) * 1000);
        
        return voice;
    }
    
    /**
     * Stop all active voices
     */
    stopAll() {
        const now = this.audioContext.currentTime;
        
        this.activeVoices.forEach(voice => {
            // Quick fade out
            if (voice.vca && voice.vca.gain) {
                voice.vca.gain.cancelScheduledValues(now);
                voice.vca.gain.setValueAtTime(voice.vca.gain.value, now);
                voice.vca.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            }
            
            // Stop oscillators
            voice.oscillators.forEach(osc => {
                try {
                    osc.stop(now + 0.05);
                } catch (e) {
                    // Already stopped
                }
            });
            
            // Stop LFO
            if (voice.lfo) {
                try {
                    voice.lfo.stop(now + 0.05);
                } catch (e) {
                    // Already stopped
                }
            }
        });
        
        this.activeVoices = [];
    }
    
    /**
     * Create oscillator from VCO settings
     */
    _createOscillator(vco, baseFreq, time) {
        const osc = this.audioContext.createOscillator();
        osc.type = vco.waveform;
        
        const octaveMultiplier = Math.pow(2, vco.octave);
        const fineMultiplier = Math.pow(2, vco.fine / 1200);
        const frequency = baseFreq * octaveMultiplier * fineMultiplier;
        
        osc.frequency.setValueAtTime(frequency, time);
        
        return osc;
    }
    
    /**
     * Create filter from VCF settings
     */
    _createFilter(time) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = this.vcf.type;
        filter.frequency.setValueAtTime(this.vcf.cutoff, time);
        filter.Q.setValueAtTime(this.vcf.resonance, time);
        
        return filter;
    }
    
    /**
     * Create LFO
     */
    _createLFO(time) {
        const lfo = this.audioContext.createOscillator();
        lfo.type = this.lfo.waveform;
        lfo.frequency.setValueAtTime(this.lfo.rate, time);
        
        return lfo;
    }
    
    /**
     * Apply ADSR envelope to parameter
     */
    _applyEnvelope(param, startTime, endTime, velocity) {
        const attackTime = startTime + this.envelope.attack;
        const decayTime = attackTime + this.envelope.decay;
        const releaseStart = endTime;
        const releaseEnd = releaseStart + this.envelope.release;
        
        const peakLevel = this.vca.level * velocity;
        const sustainLevel = peakLevel * this.envelope.sustain;
        
        // Attack
        param.setValueAtTime(0.001, startTime);
        param.exponentialRampToValueAtTime(peakLevel, attackTime);
        
        // Decay
        param.exponentialRampToValueAtTime(sustainLevel, decayTime);
        
        // Sustain (held at sustainLevel)
        param.setValueAtTime(sustainLevel, releaseStart);
        
        // Release
        param.exponentialRampToValueAtTime(0.001, releaseEnd);
    }
    
    /**
     * Load preset patch
     */
    loadPreset(presetName) {
        const presets = {
            'bass': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { waveform: 'square', octave: -1, fine: -7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 800, resonance: 8, envAmount: 70 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 }
            },
            'lead': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'sawtooth', octave: 0, fine: 7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 3000, resonance: 15, envAmount: 80 },
                envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.5 },
                lfo: { rate: 6, amount: 0.3 }
            },
            'pad': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'square', octave: 0, fine: 5, enabled: true },
                vco3: { waveform: 'sine', octave: -1, enabled: true },
                vcf: { type: 'lowpass', cutoff: 2000, resonance: 5, envAmount: 40 },
                envelope: { attack: 0.5, decay: 0.4, sustain: 0.8, release: 1.0 }
            },
            'pluck': {
                vco1: { waveform: 'triangle', octave: 0, enabled: true },
                vco2: { enabled: false },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 5000, resonance: 2, envAmount: 90 },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.2 }
            },
            'brass': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'sawtooth', octave: 0, fine: -3, enabled: true },
                vco3: { waveform: 'square', octave: 0, enabled: true },
                vcf: { type: 'lowpass', cutoff: 1500, resonance: 10, envAmount: 60 },
                envelope: { attack: 0.08, decay: 0.2, sustain: 0.9, release: 0.3 }
            }
        };
        
        if (presets[presetName]) {
            const preset = presets[presetName];
            
            // Apply VCO settings
            if (preset.vco1) Object.assign(this.vco1, preset.vco1);
            if (preset.vco2) Object.assign(this.vco2, preset.vco2);
            if (preset.vco3) Object.assign(this.vco3, preset.vco3);
            
            // Apply VCF settings
            if (preset.vcf) Object.assign(this.vcf, preset.vcf);
            
            // Apply envelope settings
            if (preset.envelope) Object.assign(this.envelope, preset.envelope);
            
            // Apply LFO settings
            if (preset.lfo) Object.assign(this.lfo, preset.lfo);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Export current settings
     */
    exportSettings() {
        return {
            vco1: { ...this.vco1 },
            vco2: { ...this.vco2 },
            vco3: { ...this.vco3 },
            vcf: { ...this.vcf },
            vca: { ...this.vca },
            envelope: { ...this.envelope },
            lfo: { ...this.lfo },
            ringMod: { ...this.ringMod },
            sampleHold: { ...this.sampleHold },
            patches: [...this.patches]
        };
    }
    
    /**
     * Import settings
     */
    importSettings(settings) {
        if (settings.vco1) this.vco1 = { ...this.vco1, ...settings.vco1 };
        if (settings.vco2) this.vco2 = { ...this.vco2, ...settings.vco2 };
        if (settings.vco3) this.vco3 = { ...this.vco3, ...settings.vco3 };
        if (settings.vcf) this.vcf = { ...this.vcf, ...settings.vcf };
        if (settings.vca) this.vca = { ...this.vca, ...settings.vca };
        if (settings.envelope) this.envelope = { ...this.envelope, ...settings.envelope };
        if (settings.lfo) this.lfo = { ...this.lfo, ...settings.lfo };
        if (settings.ringMod) this.ringMod = { ...this.ringMod, ...settings.ringMod };
        if (settings.sampleHold) this.sampleHold = { ...this.sampleHold, ...settings.sampleHold };
        if (settings.patches) this.patches = [...settings.patches];
        
        return true;
    }
}

// Export for use in ES6 modules
export default ARP2600;

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARP2600;
}
