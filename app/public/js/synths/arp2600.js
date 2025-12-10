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
        
        // Enhanced modulation matrix
        this.modMatrix = {
            env1ToFilter: 50,      // Envelope 1 -> Filter Cutoff
            env1ToPitch: 0,        // Envelope 1 -> Pitch
            env2ToAmplitude: 100,  // Envelope 2 -> VCA (standard ADSR)
            lfoToFilter: 0,        // LFO -> Filter Cutoff
            lfoToPitch: 0,         // LFO -> Pitch
            lfoToAmplitude: 0,     // LFO -> Amplitude (tremolo)
            lfoToPWM: 0,           // LFO -> Pulse Width Modulation
            keyTrackToFilter: 50,  // Keyboard tracking to filter
            velocityToFilter: 30,  // Velocity -> Filter
            velocityToAmplitude: 50 // Velocity -> Amplitude
        };
        
        // Second envelope generator
        this.envelope2 = {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.7,
            release: 0.5
        };
        
        // Active voices
        this.activeVoices = [];

        // Sequencer
        this.pattern = Array(16).fill(false);
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = 135;
        this.interval = null;
        this.noteToPlay = 'C3'; // Default note for the sequencer
        this.noteFrequencies = {
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63
        };
    }

    /**
     * Set modulation matrix parameter
     */
    setModMatrix(param, value) {
        if (this.modMatrix.hasOwnProperty(param)) {
            this.modMatrix[param] = Math.max(0, Math.min(100, value));
            return true;
        }
        return false;
    }
    
    /**
     * Get modulation matrix parameter
     */
    getModMatrix(param) {
        return this.modMatrix[param];
    }
    
    /**
     * Set second envelope parameter
     */
    setEnvelope2(param, value) {
        if (this.envelope2.hasOwnProperty(param)) {
            this.envelope2[param] = value;
            return true;
        }
        return false;
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
        
        // Apply pitch envelope if enabled
        const pitchEnvAmount = this.modMatrix.env1ToPitch / 100;
        
        // VCO 1
        if (this.vco1.enabled) {
            const osc = this._createOscillator(this.vco1, frequency, startTime);
            
            // Apply pitch envelope modulation
            if (pitchEnvAmount > 0) {
                const pitchMod = pitchEnvAmount * frequency * 0.5; // Up to 50% pitch change
                osc.frequency.setValueAtTime(frequency + pitchMod, startTime);
                osc.frequency.exponentialRampToValueAtTime(frequency, startTime + this.envelope.attack + this.envelope.decay);
            }
            
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        // VCO 2
        if (this.vco2.enabled) {
            const osc = this._createOscillator(this.vco2, frequency, startTime);
            
            // Apply pitch envelope modulation
            if (pitchEnvAmount > 0) {
                const pitchMod = pitchEnvAmount * frequency * 0.5;
                osc.frequency.setValueAtTime(frequency + pitchMod, startTime);
                osc.frequency.exponentialRampToValueAtTime(frequency, startTime + this.envelope.attack + this.envelope.decay);
            }
            
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        // VCO 3
        if (this.vco3.enabled) {
            const osc = this._createOscillator(this.vco3, frequency, startTime);
            
            // Apply pitch envelope modulation
            if (pitchEnvAmount > 0) {
                const pitchMod = pitchEnvAmount * frequency * 0.5;
                osc.frequency.setValueAtTime(frequency + pitchMod, startTime);
                osc.frequency.exponentialRampToValueAtTime(frequency, startTime + this.envelope.attack + this.envelope.decay);
            }
            
            osc.connect(mixer);
            oscillators.push(osc);
        }
        
        if (oscillators.length > 0) {
            mixer.gain.value = 1.0 / oscillators.length;
        }
        
        // Create filter with enhanced envelope modulation
        const filter = this._createFilter(startTime);
        
        // Apply filter envelope (Env1 -> Filter)
        const filterEnvAmount = (this.modMatrix.env1ToFilter / 100) * this.vcf.cutoff * 2;
        const velocityFilterMod = (this.modMatrix.velocityToFilter / 100) * this.vcf.cutoff * 0.5 * velocity;
        const keyTrackMod = (this.modMatrix.keyTrackToFilter / 100) * (frequency - 440) * 2;
        
        const peakCutoff = Math.min(
            this.vcf.cutoff + filterEnvAmount + velocityFilterMod + keyTrackMod,
            20000
        );
        
        filter.frequency.setValueAtTime(peakCutoff, startTime);
        filter.frequency.exponentialRampToValueAtTime(
            Math.max(this.vcf.cutoff, 50),
            startTime + this.envelope.attack + this.envelope.decay
        );
        
        // LFO modulation
        let lfo = null;
        if (this.lfo.amount > 0 || this.modMatrix.lfoToFilter > 0 || this.modMatrix.lfoToPitch > 0) {
            lfo = this._createLFO(startTime);
            
            // LFO -> Filter
            if (this.modMatrix.lfoToFilter > 0) {
                const lfoFilterGain = this.audioContext.createGain();
                lfoFilterGain.gain.value = (this.modMatrix.lfoToFilter / 100) * this.vcf.cutoff * 0.3;
                lfo.connect(lfoFilterGain);
                lfoFilterGain.connect(filter.frequency);
            }
            
            // LFO -> Pitch
            if (this.modMatrix.lfoToPitch > 0) {
                const lfoPitchGain = this.audioContext.createGain();
                lfoPitchGain.gain.value = (this.modMatrix.lfoToPitch / 100) * frequency * 0.05;
                oscillators.forEach(osc => {
                    lfo.connect(lfoPitchGain);
                    lfoPitchGain.connect(osc.frequency);
                });
            }
        }
        
        // External modulation (e.g., from string machine)
        if (this.externalMod.enabled && this.externalMod.source) {
            const modGain = this.audioContext.createGain();
            modGain.gain.value = this.externalMod.amount;
            
            switch (this.externalMod.destination) {
                case 'filter':
                    // Modulate filter cutoff
                    const extFilterGain = this.audioContext.createGain();
                    extFilterGain.gain.value = this.vcf.cutoff * this.externalMod.amount;
                    this.externalMod.source.connect(extFilterGain);
                    extFilterGain.connect(filter.frequency);
                    break;
                case 'amplitude':
                    // Will be connected to VCA
                    break;
                case 'pitch':
                    // Modulate pitch of all oscillators
                    const extPitchGain = this.audioContext.createGain();
                    extPitchGain.gain.value = frequency * this.externalMod.amount * 0.1;
                    oscillators.forEach(osc => {
                        this.externalMod.source.connect(extPitchGain);
                        extPitchGain.connect(osc.frequency);
                    });
                    break;
            }
        }
        
        // VCA with envelope and velocity modulation
        const vca = this.audioContext.createGain();
        this._applyEnvelope(vca.gain, startTime, endTime, velocity);
        
        // LFO -> Amplitude (tremolo)
        if (lfo && this.modMatrix.lfoToAmplitude > 0) {
            const lfoAmpGain = this.audioContext.createGain();
            lfoAmpGain.gain.value = (this.modMatrix.lfoToAmplitude / 100) * this.vca.level * 0.3;
            lfo.connect(lfoAmpGain);
            lfoAmpGain.connect(vca.gain);
        }
        
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
            // BASS SOUNDS
            'bass': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { waveform: 'square', octave: -1, fine: -7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 800, resonance: 8, envAmount: 70 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 }
            },
            'sub-bass': {
                vco1: { waveform: 'sine', octave: -2, enabled: true },
                vco2: { waveform: 'triangle', octave: -1, fine: -12, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 300, resonance: 2, envAmount: 20 },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0.9, release: 0.2 }
            },
            'acid-bass': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { enabled: false },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 1200, resonance: 25, envAmount: 95 },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0.3, release: 0.15 },
                lfo: { rate: 8, amount: 0.4 }
            },
            'fat-bass': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { waveform: 'sawtooth', octave: -1, fine: 5, enabled: true },
                vco3: { waveform: 'square', octave: -2, enabled: true },
                vcf: { type: 'lowpass', cutoff: 600, resonance: 12, envAmount: 65 },
                envelope: { attack: 0.01, decay: 0.25, sustain: 0.7, release: 0.3 }
            },
            
            // LEAD SOUNDS
            'lead': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'sawtooth', octave: 0, fine: 7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 3000, resonance: 15, envAmount: 80 },
                envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.5 },
                lfo: { rate: 6, amount: 0.3 }
            },
            'sync-lead': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'square', octave: 1, fine: 12, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 4000, resonance: 18, envAmount: 85 },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.4 },
                lfo: { rate: 7, amount: 0.5 }
            },
            'screaming-lead': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'square', octave: 0, fine: -3, enabled: true },
                vco3: { waveform: 'sawtooth', octave: 1, enabled: true },
                vcf: { type: 'lowpass', cutoff: 5000, resonance: 20, envAmount: 90 },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0.8, release: 0.3 },
                lfo: { rate: 9, amount: 0.6 }
            },
            
            // PAD SOUNDS
            'pad': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'square', octave: 0, fine: 5, enabled: true },
                vco3: { waveform: 'sine', octave: -1, enabled: true },
                vcf: { type: 'lowpass', cutoff: 2000, resonance: 5, envAmount: 40 },
                envelope: { attack: 0.5, decay: 0.4, sustain: 0.8, release: 1.0 }
            },
            'string-pad': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'sawtooth', octave: 0, fine: 8, enabled: true },
                vco3: { waveform: 'sawtooth', octave: 0, fine: -8, enabled: true },
                vcf: { type: 'lowpass', cutoff: 2500, resonance: 3, envAmount: 30 },
                envelope: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 1.5 },
                lfo: { rate: 0.5, amount: 0.1 }
            },
            'dark-pad': {
                vco1: { waveform: 'triangle', octave: 0, enabled: true },
                vco2: { waveform: 'sine', octave: -1, fine: 7, enabled: true },
                vco3: { waveform: 'square', octave: -2, enabled: true },
                vcf: { type: 'lowpass', cutoff: 800, resonance: 2, envAmount: 25 },
                envelope: { attack: 1.5, decay: 0.8, sustain: 0.85, release: 2.0 }
            },
            'evolving-pad': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'triangle', octave: 0, fine: 12, enabled: true },
                vco3: { waveform: 'square', octave: -1, enabled: true },
                vcf: { type: 'lowpass', cutoff: 1500, resonance: 8, envAmount: 50 },
                envelope: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 2.5 },
                lfo: { rate: 0.3, amount: 0.4 }
            },
            
            // PLUCK & PERCUSSIVE
            'pluck': {
                vco1: { waveform: 'triangle', octave: 0, enabled: true },
                vco2: { enabled: false },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 5000, resonance: 2, envAmount: 90 },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0.1, release: 0.2 }
            },
            'marimba': {
                vco1: { waveform: 'sine', octave: 0, enabled: true },
                vco2: { waveform: 'sine', octave: 2, fine: 3, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 3000, resonance: 1, envAmount: 70 },
                envelope: { attack: 0.001, decay: 0.3, sustain: 0.05, release: 0.4 }
            },
            'kalimba': {
                vco1: { waveform: 'triangle', octave: 1, enabled: true },
                vco2: { waveform: 'sine', octave: 2, fine: 7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'bandpass', cutoff: 2500, resonance: 5, envAmount: 80 },
                envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.3 }
            },
            
            // BRASS & WIND
            'brass': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'sawtooth', octave: 0, fine: -3, enabled: true },
                vco3: { waveform: 'square', octave: 0, enabled: true },
                vcf: { type: 'lowpass', cutoff: 1500, resonance: 10, envAmount: 60 },
                envelope: { attack: 0.08, decay: 0.2, sustain: 0.9, release: 0.3 }
            },
            'soft-brass': {
                vco1: { waveform: 'sawtooth', octave: 0, enabled: true },
                vco2: { waveform: 'triangle', octave: 0, fine: -5, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 1800, resonance: 6, envAmount: 50 },
                envelope: { attack: 0.15, decay: 0.3, sustain: 0.85, release: 0.4 }
            },
            'flute': {
                vco1: { waveform: 'sine', octave: 1, enabled: true },
                vco2: { waveform: 'triangle', octave: 1, fine: 2, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 2000, resonance: 3, envAmount: 40 },
                envelope: { attack: 0.1, decay: 0.15, sustain: 0.7, release: 0.2 },
                lfo: { rate: 5, amount: 0.15 }
            },
            
            // FX & EXPERIMENTAL
            'sweep': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { waveform: 'square', octave: -1, fine: 7, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 200, resonance: 15, envAmount: 95 },
                envelope: { attack: 0.01, decay: 2.0, sustain: 0.2, release: 0.5 },
                lfo: { rate: 0.5, amount: 0.7 }
            },
            'wobble': {
                vco1: { waveform: 'sawtooth', octave: -1, enabled: true },
                vco2: { waveform: 'square', octave: -1, fine: -12, enabled: true },
                vco3: { enabled: false },
                vcf: { type: 'lowpass', cutoff: 500, resonance: 20, envAmount: 50 },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.3 },
                lfo: { rate: 4, amount: 0.9 }
            },
            'space-sweep': {
                vco1: { waveform: 'sine', octave: 0, enabled: true },
                vco2: { waveform: 'triangle', octave: 1, fine: 19, enabled: true },
                vco3: { waveform: 'sawtooth', octave: -2, enabled: true },
                vcf: { type: 'lowpass', cutoff: 1000, resonance: 18, envAmount: 80 },
                envelope: { attack: 1.0, decay: 1.5, sustain: 0.5, release: 2.0 },
                lfo: { rate: 0.2, amount: 0.8 }
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
     * Get current patch settings
     */
    getPatch() {
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
     * Load patch from settings object
     */
    setPatch(settings) {
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

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARP2600;
}
