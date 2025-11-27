/**
 * TR-808 Drum Machine Module
 * Emulates Roland TR-808 drum synthesis
 * 
 * Features:
 * - 6 drum voices: Kick, Hat, Clap, Perc, Ride, Crash
 * - Multiple variations per voice
 * - Web Audio synthesis
 */

class TR808 {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // Current drum variations
        this.currentVariations = {
            kick: 'classic',
            hat: 'classic',
            clap: 'classic',
            perc: 'classic',
            ride: 'classic',
            crash: 'classic'
        };
        
        // Master volume
        this.masterVolume = 0.7;
        
        // Individual drum parameters
        this.params = {
            kick: { volume: 1.0, tune: 0, decay: 0.5 },
            snare: { volume: 1.0, tune: 0, decay: 0.2, snappy: 0.5 },
            hat: { volume: 0.8, tune: 0, decay: 0.05 },
            clap: { volume: 1.0, tune: 0, decay: 0.1 },
            perc: { volume: 1.0, tune: 0, decay: 0.2 },
            ride: { volume: 1.0, tune: 0, decay: 1.0 },
            crash: { volume: 1.0, tune: 0, decay: 2.0 }
        };

        // Enhanced modulation per drum voice
        this.modulation = {
            kick: {
                pitchDecay: 0.5,    // Pitch envelope decay time
                punchAmount: 0,     // Extra attack transient
                toneColor: 50,      // Tone/click balance
                lfoAmount: 0        // LFO modulation depth
            },
            hat: {
                decay: 0.1,
                tone: 5000,         // High-pass frequency
                metallic: 50        // Metallic character
            },
            clap: {
                reverb: 0.3,
                tightness: 50,
                layers: 3
            },
            perc: {
                pitch: 800,
                decay: 0.2,
                tone: 50
            },
            ride: {
                decay: 1.0,
                tone: 8000,
                bell: 50
            },
            crash: {
                decay: 2.0,
                tone: 12000,
                noise: 70
            }
        };
        
        // LFO for global modulation
        this.lfo = {
            enabled: false,
            rate: 4,
            depth: 0,
            destination: 'pitch' // pitch, tone, decay
        };

        // Sequencer
        this.pattern = Array(16).fill(null).map(() => ({
            kick: false, snare: false, hat: false, clap: false
        }));
        this.isPlaying = false;
        this.currentStep = 0;
        this.bpm = 135;
        this.interval = null;
    }
    
    /**
     * Set modulation parameter for specific drum
     */
    setDrumModulation(drum, param, value) {
        if (this.modulation[drum] && this.modulation[drum].hasOwnProperty(param)) {
            this.modulation[drum][param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Get modulation parameter
     */
    getDrumModulation(drum, param) {
        return this.modulation[drum]?.[param];
    }
    
    /**
     * Set LFO parameters
     */
    setLFO(param, value) {
        if (this.lfo.hasOwnProperty(param)) {
            this.lfo[param] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Set parameter for a specific drum sound.
     */
    setParam(drum, param, value) {
        if (this.params[drum] && this.params[drum].hasOwnProperty(param)) {
            this.params[drum][param] = parseFloat(value);
            return true;
        }
        return false;
    }

    /**
     * Set drum variation
     */
    setVariation(drum, variation) {
        if (this.currentVariations.hasOwnProperty(drum)) {
            this.currentVariations[drum] = variation;
            return true;
        }
        return false;
    }
    
    /**
     * Get current variation
     */
    getVariation(drum) {
        return this.currentVariations[drum];
    }
    
    /**
     * Set master volume
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Toggle sequencer step
     */
    toggleStep(index, active) {
        if (index >= 0 && index < 16) {
            this.pattern[index].kick = active;
        }
    }

    /**
     * Play sequencer pattern
     */
    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentStep = 0;
        const stepTime = (60 / this.bpm) * 1000 / 4;
        this.interval = setInterval(() => {
            const step = this.pattern[this.currentStep];
            if (step.kick) this.playKick();
            if (step.snare) this.playSnare();
            if (step.hat) this.playHat();
            if (step.clap) this.playClap();
            this.currentStep = (this.currentStep + 1) % 16;
        }, stepTime);
    }

    /**
     * Stop sequencer
     */
    stop() {
        this.isPlaying = false;
        if (this.interval) clearInterval(this.interval);
        this.currentStep = 0;
    }
    
    /**
     * Play kick drum
     */
    playKick(variation = null, time = null) {
        const v = variation || this.currentVariations.kick;
        const startTime = time || this.audioContext.currentTime;
        const params = this.params.kick;
        const volume = this.masterVolume * params.volume;
        const baseFreq = 60 * Math.pow(2, params.tune / 12);

        const variations = {
            classic: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.frequency.setValueAtTime(baseFreq * 2.5, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq, startTime + params.decay);
                gain.gain.setValueAtTime(volume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            deep: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.frequency.setValueAtTime(baseFreq * 2, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            punchy: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const dist = this.audioContext.createWaveShaper();
                const curve = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = (i - 128) / 128;
                    curve[i] = Math.tanh(x * 2);
                }
                dist.curve = curve;
                osc.frequency.setValueAtTime(baseFreq * 2.2, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(dist);
                dist.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            sub: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * 0.5, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            acid: () => {
                const osc = this.audioContext.createOscillator();
                const filter = this.audioContext.createBiquadFilter();
                const gain = this.audioContext.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(baseFreq * 2.5, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, startTime + params.decay);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, startTime);
                filter.frequency.exponentialRampToValueAtTime(80, startTime + params.decay);
                filter.Q.value = 10;
                gain.gain.setValueAtTime(volume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            minimal: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * 0.8, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 0.9, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            rumble: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq * 0.4, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.1, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.5, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            tribal: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(baseFreq * 1.2, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            distorted: () => {
                const osc = this.audioContext.createOscillator();
                const dist = this.audioContext.createWaveShaper();
                const gain = this.audioContext.createGain();
                const curve = new Float32Array(256);
                for (let i = 0; i < 256; i++) {
                    const x = (i - 128) / 128;
                    curve[i] = Math.tanh(x * 5);
                }
                dist.curve = curve;
                osc.frequency.setValueAtTime(baseFreq * 2, startTime);
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, startTime + params.decay);
                gain.gain.setValueAtTime(volume * 1.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                osc.connect(dist);
                dist.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + params.decay);
            },
            fm: () => {
                const carrier = this.audioContext.createOscillator();
                const modulator = this.audioContext.createOscillator();
                const modGain = this.audioContext.createGain();
                const gain = this.audioContext.createGain();
                carrier.frequency.setValueAtTime(baseFreq * 2.5, startTime);
                carrier.frequency.exponentialRampToValueAtTime(baseFreq, startTime + params.decay);
                modulator.frequency.setValueAtTime(baseFreq * 0.5, startTime);
                modGain.gain.setValueAtTime(100, startTime);
                gain.gain.setValueAtTime(volume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                carrier.connect(gain);
                gain.connect(this.audioContext.destination);
                carrier.start(startTime);
                modulator.start(startTime);
                carrier.stop(startTime + params.decay);
                modulator.stop(startTime + params.decay);
            }
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play hi-hat
     */
    playHat(variation = null, time = null) {
        const v = variation || this.currentVariations.hat;
        const startTime = time || this.audioContext.currentTime;
        const params = this.params.hat;
        const volume = this.masterVolume * params.volume;
        const baseFreq = 8000 * Math.pow(2, params.tune / 12);

        const variations = {
            classic: () => this._createNoiseHit(startTime, params.decay, baseFreq, volume * 0.3),
            tight: () => this._createNoiseHit(startTime, params.decay * 0.6, baseFreq * 1.2, volume * 0.25),
            open: () => this._createNoiseHit(startTime, params.decay * 4, baseFreq, volume * 0.35),
            crispy: () => this._createNoiseHit(startTime, params.decay * 0.8, baseFreq * 1.5, volume * 0.4)
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play clap
     */
    playClap(variation = null, time = null) {
        const v = variation || this.currentVariations.clap;
        const startTime = time || this.audioContext.currentTime;
        const params = this.params.clap;
        const volume = this.masterVolume * params.volume;

        const variations = {
            classic: () => {
                [0, 0.03, 0.06].forEach(offset => {
                    this._createNoiseHit(startTime + offset, params.decay, 2000, volume * 0.5);
                });
            },
            tight: () => {
                [0, 0.02].forEach(offset => {
                    this._createNoiseHit(startTime + offset, 0.08, 3000, volume * 0.45);
                });
            },
            reverb: () => {
                [0, 0.03, 0.06, 0.1, 0.15].forEach((offset, i) => {
                    const decay = 0.1 + (i * 0.02);
                    const vol = volume * (0.5 - i * 0.08);
                    this._createNoiseHit(startTime + offset, decay, 2000, vol);
                });
            },
            snap: () => {
                this._createNoiseHit(startTime, 0.05, 4000, volume * 0.6);
            }
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play snare drum
     */
    playSnare(variation = null, time = null) {
        const v = variation || this.currentVariations.snare || 'classic';
        const startTime = time || this.audioContext.currentTime;
        const params = this.params.snare;
        const volume = this.masterVolume * params.volume;
        const baseFreq = 180 * Math.pow(2, params.tune / 12);

        const variations = {
            classic: () => {
                // Tonal component (body)
                const bodyOsc = this.audioContext.createOscillator();
                const bodyGain = this.audioContext.createGain();
                bodyOsc.type = 'triangle';
                bodyOsc.frequency.setValueAtTime(baseFreq, startTime);
                bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, startTime + params.decay);
                bodyGain.gain.setValueAtTime(volume * 0.3, startTime);
                bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                bodyOsc.connect(bodyGain);
                bodyGain.connect(this.audioContext.destination);
                bodyOsc.start(startTime);
                bodyOsc.stop(startTime + params.decay);
                
                // Noise component (snares)
                this._createNoiseHit(startTime, params.decay * (1 + params.snappy), 3000, volume * 0.6);
            },
            tight: () => {
                const bodyOsc = this.audioContext.createOscillator();
                const bodyGain = this.audioContext.createGain();
                bodyOsc.type = 'triangle';
                bodyOsc.frequency.setValueAtTime(baseFreq * 1.1, startTime);
                bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + params.decay);
                bodyGain.gain.setValueAtTime(volume * 0.35, startTime);
                bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                bodyOsc.connect(bodyGain);
                bodyGain.connect(this.audioContext.destination);
                bodyOsc.start(startTime);
                bodyOsc.stop(startTime + params.decay);
                
                this._createNoiseHit(startTime, params.decay, 4000, volume * 0.5);
            },
            fat: () => {
                const bodyOsc = this.audioContext.createOscillator();
                const bodyGain = this.audioContext.createGain();
                bodyOsc.type = 'sine';
                bodyOsc.frequency.setValueAtTime(baseFreq * 0.9, startTime);
                bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, startTime + params.decay);
                bodyGain.gain.setValueAtTime(volume * 0.4, startTime);
                bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                bodyOsc.connect(bodyGain);
                bodyGain.connect(this.audioContext.destination);
                bodyOsc.start(startTime);
                bodyOsc.stop(startTime + params.decay);
                
                this._createNoiseHit(startTime, params.decay * 1.2, 2500, volume * 0.7);
            },
            crisp: () => {
                const bodyOsc = this.audioContext.createOscillator();
                const bodyGain = this.audioContext.createGain();
                bodyOsc.type = 'triangle';
                bodyOsc.frequency.setValueAtTime(baseFreq * 1.2, startTime);
                bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.0, startTime + params.decay);
                bodyGain.gain.setValueAtTime(volume * 0.3, startTime);
                bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay);
                bodyOsc.connect(bodyGain);
                bodyGain.connect(this.audioContext.destination);
                bodyOsc.start(startTime);
                bodyOsc.stop(startTime + params.decay);
                
                this._createNoiseHit(startTime, params.decay * 0.6, 5000, volume * 0.5);
            }
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play percussion
     */
    playPerc(variation = null, time = null) {
        const v = variation || this.currentVariations.perc;
        const startTime = time || this.audioContext.currentTime;
        
        const variations = {
            conga: () => this._createTonalHit(startTime, 200, 0.2, this.masterVolume * 0.6),
            tom: () => this._createTonalHit(startTime, 120, 0.3, this.masterVolume * 0.7),
            cowbell: () => this._createTonalHit(startTime, 800, 0.15, this.masterVolume * 0.5),
            wood: () => this._createNoiseHit(startTime, 0.04, 3000, this.masterVolume * 0.4)
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play ride cymbal
     */
    playRide(variation = null, time = null) {
        const v = variation || this.currentVariations.ride;
        const startTime = time || this.audioContext.currentTime;
        
        const variations = {
            classic: () => this._createMetallicHit(startTime, [4000, 5000, 6000], 0.3, this.masterVolume * 0.4),
            bell: () => this._createMetallicHit(startTime, [2000, 3000], 0.2, this.masterVolume * 0.5),
            ping: () => this._createMetallicHit(startTime, [6000, 7000, 8000], 0.15, this.masterVolume * 0.35)
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Play crash cymbal
     */
    playCrash(variation = null, time = null) {
        const v = variation || this.currentVariations.crash;
        const startTime = time || this.audioContext.currentTime;
        
        const variations = {
            classic: () => this._createMetallicHit(startTime, [3000, 4000, 5000, 6000], 1.0, this.masterVolume * 0.5),
            splash: () => this._createMetallicHit(startTime, [5000, 6000, 7000], 0.6, this.masterVolume * 0.45),
            china: () => this._createMetallicHit(startTime, [2000, 3000, 4000], 0.8, this.masterVolume * 0.6)
        };
        
        if (variations[v]) {
            variations[v]();
        }
    }
    
    /**
     * Helper: Create noise-based hit (hats, claps)
     */
    _createNoiseHit(time, duration, filterFreq, volume) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // White noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = filterFreq;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        noise.start(time);
    }
    
    /**
     * Helper: Create tonal hit (toms, congas)
     */
    _createTonalHit(time, frequency, duration, volume) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, time);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, time + duration);
        
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    /**
     * Helper: Create metallic hit (cymbals)
     */
    _createMetallicHit(time, frequencies, duration, volume) {
        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(volume / frequencies.length, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(time);
            osc.stop(time + duration);
        });
    }
    
    /**
     * Export current configuration
     */
    exportConfig() {
        return {
            variations: { ...this.currentVariations },
            volume: this.masterVolume
        };
    }
    
    /**
     * Import configuration
     */
    importConfig(config) {
        if (config.variations) {
            this.currentVariations = { ...this.currentVariations, ...config.variations };
        }
        if (config.volume !== undefined) {
            this.masterVolume = config.volume;
        }
    }

    /**
     * Exports the current synth state as a patch object.
     * @returns {object} A patch object containing params, pattern, and modulation settings.
     */
    getPatch() {
        return {
            masterVolume: this.masterVolume,
            currentVariations: { ...this.currentVariations },
            modulation: JSON.parse(JSON.stringify(this.modulation)), // Deep copy
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
            this.setVolume(patch.masterVolume);
        }
        if (patch.currentVariations) {
            this.currentVariations = { ...this.currentVariations, ...patch.currentVariations };
        }
        if (patch.modulation) {
            this.modulation = JSON.parse(JSON.stringify(patch.modulation));
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
}

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TR808;
}
