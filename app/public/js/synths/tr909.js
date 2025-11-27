/**
 * TR-909 Drum Machine Module
 * Emulates Roland TR-909 drum synthesis
 * 
 * Features:
 * - High-quality analog-modeled drum synthesis
 * - Classic 909 sounds: Kick, Snare, Hi-Hat (Open/Closed), Toms, Cymbals
 * - Individual tuning and decay controls
 * - Sample-accurate timing
 * - Multiple variations per voice
 */

class TR909 {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // Current drum variations
        this.currentVariations = {
            kick: 'classic',
            snare: 'classic',
            hatClosed: 'classic',
            hatOpen: 'classic',
            tomLow: 'classic',
            tomMid: 'classic',
            tomHigh: 'classic',
            rimshot: 'classic',
            ride: 'classic',
            crash: 'classic'
        };
        
        // Master volume
        this.masterVolume = 0.8;
        
        // Individual drum tuning and parameters
        this.params = {
            kick: {
                tune: 0,        // -12 to +12 semitones
                decay: 0.5,     // 0 to 1
                attack: 0.001,
                punch: 0.7      // 0 to 1
            },
            snare: {
                tune: 0,
                decay: 0.3,
                snappy: 0.7,    // Snare wire amount
                tone: 0.5       // Body vs snap balance
            },
            hatClosed: {
                decay: 0.05,
                metallic: 0.6
            },
            hatOpen: {
                decay: 0.3,
                metallic: 0.6
            },
            tom: {
                lowTune: -12,
                midTune: 0,
                highTune: 12,
                decay: 0.4
            },
            rimshot: {
                tune: 0,
                decay: 0.1
            },
            ride: {
                decay: 0.8,
                bell: 0.5
            },
            crash: {
                decay: 1.5,
                tone: 0.6
            }
        };
        
        // Accent level (909 has accent feature)
        this.accentLevel = 1.5;

        // Sequencer
        this.pattern = Array(16).fill(null).map(() => ({
            kick: false, snare: false, hatClosed: false, hatOpen: false
        }));
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = 135;
        this.interval = null;
    }

    /**
     * Exports the current synth state as a patch object.
     * @returns {object} A patch object containing params, pattern, and other settings.
     */
    getPatch() {
        return {
            masterVolume: this.masterVolume,
            accentLevel: this.accentLevel,
            currentVariations: { ...this.currentVariations },
            params: JSON.parse(JSON.stringify(this.params)), // Deep copy
            pattern: JSON.parse(JSON.stringify(this.pattern)), // Deep copy
            bpm: this.bpm
        };
    }

    /**
     * Imports a patch object to configure the synth's state.
     * @param {object} patch - A patch object.
     */
    setPatch(patch) {
        if (!patch) return;

        if (patch.masterVolume !== undefined) {
            this.masterVolume = patch.masterVolume;
        }
        if (patch.accentLevel !== undefined) {
            this.accentLevel = patch.accentLevel;
        }
        if (patch.currentVariations) {
            this.currentVariations = { ...this.currentVariations, ...patch.currentVariations };
        }
        if (patch.params) {
            // Deep merge params
            for (const drum in patch.params) {
                if (this.params[drum]) {
                    this.params[drum] = { ...this.params[drum], ...patch.params[drum] };
                }
            }
        }
        if (patch.pattern) {
            this.pattern = JSON.parse(JSON.stringify(patch.pattern));
        }
        if (patch.bpm) {
            this.bpm = patch.bpm;
            // If playing, update the interval
            if (this.isPlaying) {
                this.stop();
                this.play();
            }
        }
    }

    /**
     * Set parameter for specific drum
     */
    setParam(drum, param, value) {
        if (this.params[drum] && this.params[drum].hasOwnProperty(param)) {
            this.params[drum][param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Play 909 Kick Drum
     * Classic punchy analog kick with pitch envelope
     */
    playKick(variation = null, time = null, accent = false) {
        const v = variation || this.currentVariations.kick;
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0);
        
        const variations = {
            classic: () => {
                // Body oscillator with pitch envelope
                const osc = this.audioContext.createOscillator();
                const oscGain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                osc.type = 'sine';
                const basePitch = 60 * Math.pow(2, this.params.kick.tune / 12);
                osc.frequency.setValueAtTime(basePitch, startTime);
                osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.05);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(150, startTime);
                filter.Q.value = 1;
                
                oscGain.gain.setValueAtTime(volume * this.params.kick.punch, startTime);
                oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.kick.decay);
                
                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.audioContext.destination);
                
                osc.start(startTime);
                osc.stop(startTime + this.params.kick.decay);
                
                // Click/punch transient
                const noiseBuffer = this._createNoiseBuffer(0.01);
                const noise = this.audioContext.createBufferSource();
                const noiseGain = this.audioContext.createGain();
                const noiseFilter = this.audioContext.createBiquadFilter();
                
                noise.buffer = noiseBuffer;
                noiseFilter.type = 'lowpass';
                noiseFilter.frequency.value = 1000;
                
                noiseGain.gain.setValueAtTime(volume * 0.3, startTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.01);
                
                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(this.audioContext.destination);
                
                noise.start(startTime);
            },
            hard: () => {
                const osc = this.audioContext.createOscillator();
                const oscGain = this.audioContext.createGain();
                const distortion = this.audioContext.createWaveShaper();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(70, startTime);
                osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.04);
                
                // Add distortion for harder sound
                const curve = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = (i - 128) / 128;
                    curve[i] = Math.tanh(x * 3);
                }
                distortion.curve = curve;
                
                oscGain.gain.setValueAtTime(volume * 1.2, startTime);
                oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                
                osc.connect(distortion);
                distortion.connect(oscGain);
                oscGain.connect(this.audioContext.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.4);
            },
            deep: () => {
                const osc = this.audioContext.createOscillator();
                const oscGain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(50, startTime);
                osc.frequency.exponentialRampToValueAtTime(25, startTime + 0.08);
                
                oscGain.gain.setValueAtTime(volume, startTime);
                oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
                
                osc.connect(oscGain);
                oscGain.connect(this.audioContext.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.6);
            }
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play 909 Snare Drum
     * Combination of tonal body and noise (snare wires)
     */
    playSnare(variation = null, time = null, accent = false) {
        const v = variation || this.currentVariations.snare;
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0);
        
        const variations = {
            classic: () => {
                // Tonal component (body) - 2 oscillators
                [185, 325].forEach((freq, i) => {
                    const osc = this.audioContext.createOscillator();
                    const oscGain = this.audioContext.createGain();
                    
                    osc.type = i === 0 ? 'triangle' : 'sine';
                    osc.frequency.setValueAtTime(freq * Math.pow(2, this.params.snare.tune / 12), startTime);
                    
                    oscGain.gain.setValueAtTime(volume * 0.3 * this.params.snare.tone, startTime);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.snare.decay);
                    
                    osc.connect(oscGain);
                    oscGain.connect(this.audioContext.destination);
                    
                    osc.start(startTime);
                    osc.stop(startTime + this.params.snare.decay);
                });
                
                // Noise component (snare wires)
                const noiseBuffer = this._createNoiseBuffer(this.params.snare.decay);
                const noise = this.audioContext.createBufferSource();
                const noiseGain = this.audioContext.createGain();
                const noiseFilter = this.audioContext.createBiquadFilter();
                
                noise.buffer = noiseBuffer;
                noiseFilter.type = 'highpass';
                noiseFilter.frequency.value = 2000;
                noiseFilter.Q.value = 1;
                
                noiseGain.gain.setValueAtTime(volume * 0.7 * this.params.snare.snappy, startTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.snare.decay);
                
                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(this.audioContext.destination);
                
                noise.start(startTime);
            },
            tight: () => {
                // Tighter, more focused snare
                const osc = this.audioContext.createOscillator();
                const oscGain = this.audioContext.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, startTime);
                
                oscGain.gain.setValueAtTime(volume * 0.4, startTime);
                oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
                
                osc.connect(oscGain);
                oscGain.connect(this.audioContext.destination);
                
                osc.start(startTime);
                osc.stop(startTime + 0.15);
                
                // Short, crisp noise
                this._createNoiseHit(startTime, 0.12, 4000, volume * 0.6);
            },
            fat: () => {
                // Fatter, more room sound
                [160, 240, 380].forEach(freq => {
                    const osc = this.audioContext.createOscillator();
                    const oscGain = this.audioContext.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    
                    oscGain.gain.setValueAtTime(volume * 0.25, startTime);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                    
                    osc.connect(oscGain);
                    oscGain.connect(this.audioContext.destination);
                    
                    osc.start(startTime);
                    osc.stop(startTime + 0.4);
                });
                
                this._createNoiseHit(startTime, 0.35, 2500, volume * 0.8);
            }
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play Closed Hi-Hat
     */
    playHatClosed(variation = null, time = null, accent = false) {
        const v = variation || this.currentVariations.hatClosed;
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0) * 0.3;
        
        // 909 hi-hats use square wave oscillators at metallic frequencies
        const frequencies = [296, 387, 512, 661, 805, 954];
        
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.value = freq * this.params.hatClosed.metallic;
            
            filter.type = 'highpass';
            filter.frequency.value = 7000;
            
            oscGain.gain.setValueAtTime(volume / frequencies.length, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.hatClosed.decay);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + this.params.hatClosed.decay);
        });
    }
    
    /**
     * Play Open Hi-Hat
     */
    playHatOpen(variation = null, time = null, accent = false) {
        const v = variation || this.currentVariations.hatOpen;
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0) * 0.35;
        
        const frequencies = [296, 387, 512, 661, 805, 954];
        
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.value = freq * this.params.hatOpen.metallic;
            
            filter.type = 'highpass';
            filter.frequency.value = 7000;
            
            oscGain.gain.setValueAtTime(volume / frequencies.length, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.hatOpen.decay);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + this.params.hatOpen.decay);
        });
    }
    
    /**
     * Play Tom (Low, Mid, or High)
     */
    playTom(type = 'mid', time = null, accent = false) {
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0);
        
        const tunings = {
            low: this.params.tom.lowTune,
            mid: this.params.tom.midTune,
            high: this.params.tom.highTune
        };
        
        const baseFreq = 80 * Math.pow(2, tunings[type] / 12);
        
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 2, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + 0.02);
        
        filter.type = 'lowpass';
        filter.frequency.value = baseFreq * 4;
        filter.Q.value = 2;
        
        oscGain.gain.setValueAtTime(volume * 0.8, startTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.tom.decay);
        
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + this.params.tom.decay);
    }
    
    /**
     * Play Rimshot
     */
    playRimshot(time = null, accent = false) {
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0);
        
        // Rimshot is a combination of high-pitched oscillators
        [1047, 1480].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.value = freq * Math.pow(2, this.params.rimshot.tune / 12);
            
            filter.type = 'bandpass';
            filter.frequency.value = freq;
            filter.Q.value = 10;
            
            oscGain.gain.setValueAtTime(volume * 0.4, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.rimshot.decay);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + this.params.rimshot.decay);
        });
    }
    
    /**
     * Play Ride Cymbal
     */
    playRide(time = null, accent = false) {
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0) * 0.4;
        
        const frequencies = [3520, 4435, 5680, 6300, 7520];
        
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            filter.type = 'highpass';
            filter.frequency.value = 5000;
            
            oscGain.gain.setValueAtTime(volume / frequencies.length, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.ride.decay);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + this.params.ride.decay);
        });
    }
    
    /**
     * Play Crash Cymbal
     */
    playCrash(time = null, accent = false) {
        const startTime = time || this.audioContext.currentTime;
        const volume = this.masterVolume * (accent ? this.accentLevel : 1.0) * 0.5;
        
        const frequencies = [2840, 3690, 4720, 5940, 7100, 8350];
        
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            filter.type = 'highpass';
            filter.frequency.value = 4000;
            
            oscGain.gain.setValueAtTime(volume / frequencies.length, startTime);
            oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + this.params.crash.decay);
            
            osc.connect(filter);
            filter.connect(oscGain);
            oscGain.connect(this.audioContext.destination);
            
            osc.start(startTime);
            osc.stop(startTime + this.params.crash.decay);
        });
    }
    
    /**
     * Helper: Create noise buffer
     */
    _createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    /**
     * Helper: Create noise hit
     */
    _createNoiseHit(time, duration, filterFreq, volume) {
        const noiseBuffer = this._createNoiseBuffer(duration);
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        noise.buffer = noiseBuffer;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = filterFreq;
        
        noiseGain.gain.setValueAtTime(volume, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start(time);
    }
    
    /**
     * Set master volume
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Export configuration
     */
    exportConfig() {
        return {
            variations: { ...this.currentVariations },
            params: JSON.parse(JSON.stringify(this.params)),
            volume: this.masterVolume,
            accentLevel: this.accentLevel
        };
    }
    
    /**
     * Import configuration
     */
    importConfig(config) {
        if (config.variations) {
            this.currentVariations = { ...config.variations };
        }
        if (config.params) {
            this.params = JSON.parse(JSON.stringify(config.params));
        }
        if (config.volume !== undefined) {
            this.masterVolume = config.volume;
        }
        if (config.accentLevel !== undefined) {
            this.accentLevel = config.accentLevel;
        }
    }

    toggleStep(index, active) {
        if (index >= 0 && index < 16) {
            this.pattern[index].kick = active;
        }
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;
        const stepTime = (60 / this.bpm) * 1000 / 4;
        this.interval = setInterval(() => {
            const step = this.pattern[this.currentStep];
            if (step.kick) this.playKick();
            if (step.snare) this.playSnare();
            if (step.hatClosed) this.playHatClosed();
            if (step.hatOpen) this.playHatOpen();
            this.currentStep = (this.currentStep + 1) % 16;
        }, stepTime);
    }

    stop() {
        this.isPlaying = false;
        if (this.interval) clearInterval(this.interval);
        this.currentStep = 0;
    }
}

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TR909;
}
