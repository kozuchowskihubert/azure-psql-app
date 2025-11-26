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
     * Play kick drum
     */
    playKick(variation = null, time = null) {
        const v = variation || this.currentVariations.kick;
        const startTime = time || this.audioContext.currentTime;
        
        const variations = {
            classic: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.frequency.setValueAtTime(150, startTime);
                osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.5);
                gain.gain.setValueAtTime(this.masterVolume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.5);
            },
            deep: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.frequency.setValueAtTime(120, startTime);
                osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.6);
                gain.gain.setValueAtTime(this.masterVolume * 1.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.6);
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
                osc.frequency.setValueAtTime(180, startTime);
                osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.3);
                gain.gain.setValueAtTime(this.masterVolume * 1.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                osc.connect(dist);
                dist.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            },
            sub: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(60, startTime);
                osc.frequency.exponentialRampToValueAtTime(20, startTime + 0.8);
                gain.gain.setValueAtTime(this.masterVolume * 1.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.8);
            },
            acid: () => {
                const osc = this.audioContext.createOscillator();
                const filter = this.audioContext.createBiquadFilter();
                const gain = this.audioContext.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, startTime);
                osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.4);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, startTime);
                filter.frequency.exponentialRampToValueAtTime(80, startTime + 0.4);
                filter.Q.value = 10;
                gain.gain.setValueAtTime(this.masterVolume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.4);
            },
            minimal: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100, startTime);
                osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.2);
                gain.gain.setValueAtTime(this.masterVolume * 0.9, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.2);
            },
            rumble: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(50, startTime);
                osc.frequency.exponentialRampToValueAtTime(15, startTime + 1.0);
                gain.gain.setValueAtTime(this.masterVolume * 1.5, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 1.0);
            },
            tribal: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(120, startTime);
                osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.5);
                gain.gain.setValueAtTime(this.masterVolume * 1.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.5);
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
                osc.frequency.setValueAtTime(160, startTime);
                osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.4);
                gain.gain.setValueAtTime(this.masterVolume * 1.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                osc.connect(dist);
                dist.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.4);
            },
            fm: () => {
                const carrier = this.audioContext.createOscillator();
                const modulator = this.audioContext.createOscillator();
                const modGain = this.audioContext.createGain();
                const gain = this.audioContext.createGain();
                carrier.frequency.setValueAtTime(150, startTime);
                carrier.frequency.exponentialRampToValueAtTime(40, startTime + 0.4);
                modulator.frequency.setValueAtTime(75, startTime);
                modGain.gain.setValueAtTime(100, startTime);
                gain.gain.setValueAtTime(this.masterVolume, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                modulator.connect(modGain);
                modGain.connect(carrier.frequency);
                carrier.connect(gain);
                gain.connect(this.audioContext.destination);
                carrier.start(startTime);
                modulator.start(startTime);
                carrier.stop(startTime + 0.4);
                modulator.stop(startTime + 0.4);
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
        
        const variations = {
            classic: () => this._createNoiseHit(startTime, 0.05, 8000, this.masterVolume * 0.3),
            tight: () => this._createNoiseHit(startTime, 0.03, 10000, this.masterVolume * 0.25),
            open: () => this._createNoiseHit(startTime, 0.2, 8000, this.masterVolume * 0.35),
            crispy: () => this._createNoiseHit(startTime, 0.04, 12000, this.masterVolume * 0.4)
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
        
        const variations = {
            classic: () => {
                [0, 0.03, 0.06].forEach(offset => {
                    this._createNoiseHit(startTime + offset, 0.1, 2000, this.masterVolume * 0.5);
                });
            },
            tight: () => {
                [0, 0.02].forEach(offset => {
                    this._createNoiseHit(startTime + offset, 0.08, 3000, this.masterVolume * 0.45);
                });
            },
            reverb: () => {
                [0, 0.03, 0.06, 0.1, 0.15].forEach((offset, i) => {
                    const decay = 0.1 + (i * 0.02);
                    const vol = this.masterVolume * (0.5 - i * 0.08);
                    this._createNoiseHit(startTime + offset, decay, 2000, vol);
                });
            },
            snap: () => {
                this._createNoiseHit(startTime, 0.05, 4000, this.masterVolume * 0.6);
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
}

// Export for use in ES6 modules
export default TR808;

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TR808;
}
