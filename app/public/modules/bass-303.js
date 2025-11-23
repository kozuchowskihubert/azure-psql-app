/**
 * TB-303 Acid Bass Synthesis Module
 * 
 * Authentic TB-303 bass synthesizer emulation with ladder filter and accent system.
 * Signal flow: VCO → Ladder Filter → Distortion → VCA → Output
 * 
 * Features:
 * - Sawtooth/square oscillator
 * - 24dB/oct ladder filter emulation (cascaded low-pass)
 * - Accent system (velocity-sensitive)
 * - Glide/portamento (slide between notes)
 * - Filter envelope with decay
 * - Resonance with self-oscillation
 * - Wave shaping distortion
 * 
 * @module Bass303
 * @version 2.6.0
 */

class Bass303 {
    constructor(audioEngine, options = {}) {
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error('Bass303 requires CoreAudioEngine instance');
        }

        this.engine = audioEngine;
        this.ctx = audioEngine.audioContext;

        // Default parameters (authentic TB-303 ranges)
        this.params = {
            waveform: options.waveform || 'sawtooth', // 'sawtooth' or 'square'
            cutoff: options.cutoff || 800, // Hz (200-4000)
            resonance: options.resonance || 0.7, // 0-1 (Q: 0.7-30)
            envMod: options.envMod || 0.6, // Envelope modulation amount (0-1)
            decay: options.decay || 0.2, // Filter envelope decay (0.05-2.0)
            accent: options.accent || 0.5, // Accent amount (0-1)
            glide: options.glide || 0.0, // Glide time in seconds (0-0.5)
            distortion: options.distortion || 30, // Wave shaping amount (0-100)
            gain: options.gain || 0.8,
            ...options
        };

        // Audio nodes
        this.nodes = {};
        this._buildSignalChain();

        // State
        this.isPlaying = false;
        this.lastFrequency = 0;
        this.currentOscillator = null;
    }

    /**
     * Build TB-303 signal chain
     */
    _buildSignalChain() {
        // === VCO (Voltage Controlled Oscillator) ===
        this.currentOscillator = null; // Created on trigger

        // === Ladder Filter (24dB/oct) ===
        // Emulate Moog-style ladder filter with 4 cascaded low-pass stages
        this.nodes.filter1 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);
        this.nodes.filter2 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);
        this.nodes.filter3 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);
        this.nodes.filter4 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);

        // Chain filters for 24dB/oct slope
        this.nodes.filter1.connect(this.nodes.filter2);
        this.nodes.filter2.connect(this.nodes.filter3);
        this.nodes.filter3.connect(this.nodes.filter4);

        // === Distortion/Wave Shaping ===
        this.nodes.distortion = this.ctx.createWaveShaper();
        this.nodes.distortion.curve = this._makeDistortionCurve(this.params.distortion);
        this.nodes.distortion.oversample = '4x';

        this.nodes.filter4.connect(this.nodes.distortion);

        // === VCA (Voltage Controlled Amplifier) ===
        this.nodes.vca = this.engine.createGain(0);
        this.nodes.distortion.connect(this.nodes.vca);

        // === Output ===
        this.output = this.nodes.vca;
    }

    /**
     * Trigger TB-303 note
     * @param {number} frequency - Note frequency in Hz
     * @param {number} velocity - Note velocity 0-1 (accent)
     * @param {boolean} slide - Enable slide/glide from previous note
     * @param {number} startTime - When to start (AudioContext time)
     */
    trigger(frequency, velocity = 1.0, slide = false, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const isAccented = velocity > 0.7; // Accent threshold
        const accentMultiplier = isAccented ? (1 + this.params.accent) : 1.0;

        // === Create Oscillator (VCO) ===
        this.currentOscillator = this.engine.createOscillator(this.params.waveform, frequency);

        // Connect to filter
        this.currentOscillator.connect(this.nodes.filter1);

        // === Pitch Glide/Slide ===
        if (slide && this.lastFrequency > 0 && this.params.glide > 0) {
            // Start from last frequency and slide to target
            this.currentOscillator.frequency.setValueAtTime(this.lastFrequency, now);
            this.currentOscillator.frequency.exponentialRampToValueAtTime(
                frequency,
                now + this.params.glide
            );
        } else {
            // No glide, jump directly
            this.currentOscillator.frequency.setValueAtTime(frequency, now);
        }

        // === Filter Envelope ===
        const baseCutoff = this.params.cutoff;
        const envMod = this.params.envMod * accentMultiplier;
        const peakCutoff = baseCutoff + (baseCutoff * envMod * 3); // Up to 3x cutoff
        const decayTime = this.params.decay;

        // Set resonance (Q factor)
        const resonanceQ = 0.7 + (this.params.resonance * 29.3); // 0.7 to 30
        const filters = [this.nodes.filter1, this.nodes.filter2, this.nodes.filter3, this.nodes.filter4];

        filters.forEach(filter => {
            // Cancel previous automation
            filter.frequency.cancelScheduledValues(now);
            filter.Q.cancelScheduledValues(now);

            // Set Q (resonance)
            filter.Q.setValueAtTime(resonanceQ, now);

            // Filter envelope: Attack → Decay
            filter.frequency.setValueAtTime(baseCutoff, now);
            filter.frequency.exponentialRampToValueAtTime(
                Math.max(peakCutoff, baseCutoff + 100), // Ensure > 0
                now + 0.05 // Fast attack (50ms)
            );
            filter.frequency.exponentialRampToValueAtTime(
                Math.max(baseCutoff * 0.8, 100), // Ensure > 0
                now + decayTime
            );
        });

        // === Amplitude Envelope (VCA) ===
        const attackTime = 0.001; // Instant attack (1ms)
        const releaseTime = 0.25; // 250ms release
        const baseGain = this.params.gain * velocity;
        const accentGain = baseGain * accentMultiplier;

        this.nodes.vca.gain.cancelScheduledValues(now);
        this.nodes.vca.gain.setValueAtTime(0, now);
        this.nodes.vca.gain.linearRampToValueAtTime(accentGain, now + attackTime);
        this.nodes.vca.gain.setValueAtTime(accentGain, now + decayTime);
        this.nodes.vca.gain.exponentialRampToValueAtTime(
            0.001,
            now + decayTime + releaseTime
        );

        // === Start Oscillator ===
        this.currentOscillator.start(now);

        // === Stop Oscillator ===
        const stopTime = now + decayTime + releaseTime + 0.1;
        this.currentOscillator.stop(stopTime);

        // Cleanup
        this.currentOscillator.onended = () => {
            if (this.currentOscillator) {
                this.currentOscillator.disconnect();
                this.currentOscillator = null;
            }
            this.isPlaying = false;
        };

        // Update state
        this.lastFrequency = frequency;
        this.isPlaying = true;
    }

    /**
     * Stop currently playing note
     */
    stop(when = null) {
        const now = when || this.ctx.currentTime;

        if (this.currentOscillator && this.isPlaying) {
            this.nodes.vca.gain.cancelScheduledValues(now);
            this.nodes.vca.gain.setValueAtTime(this.nodes.vca.gain.value, now);
            this.nodes.vca.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            this.currentOscillator.stop(now + 0.1);
        }

        this.isPlaying = false;
    }

    /**
     * Parameter setters with live update
     */
    setWaveform(waveform) {
        if (waveform === 'sawtooth' || waveform === 'square') {
            this.params.waveform = waveform;
        }
    }

    setCutoff(freq) {
        this.params.cutoff = Math.max(100, Math.min(8000, freq));
        if (!this.isPlaying) {
            const filters = [this.nodes.filter1, this.nodes.filter2, this.nodes.filter3, this.nodes.filter4];
            filters.forEach(filter => {
                filter.frequency.setValueAtTime(this.params.cutoff, this.ctx.currentTime);
            });
        }
    }

    setResonance(value) {
        this.params.resonance = Math.max(0, Math.min(1, value));
        if (!this.isPlaying) {
            const q = 0.7 + (this.params.resonance * 29.3);
            const filters = [this.nodes.filter1, this.nodes.filter2, this.nodes.filter3, this.nodes.filter4];
            filters.forEach(filter => {
                filter.Q.setValueAtTime(q, this.ctx.currentTime);
            });
        }
    }

    setEnvMod(value) {
        this.params.envMod = Math.max(0, Math.min(1, value));
    }

    setDecay(value) {
        this.params.decay = Math.max(0.05, Math.min(2.0, value));
    }

    setAccent(value) {
        this.params.accent = Math.max(0, Math.min(1, value));
    }

    setGlide(value) {
        this.params.glide = Math.max(0, Math.min(0.5, value));
    }

    setDistortion(value) {
        this.params.distortion = Math.max(0, Math.min(100, value));
        this.nodes.distortion.curve = this._makeDistortionCurve(this.params.distortion);
    }

    setGain(value) {
        this.params.gain = Math.max(0, Math.min(1, value));
    }

    /**
     * Batch parameter update
     */
    setParameters(params) {
        if (params.waveform !== undefined) this.setWaveform(params.waveform);
        if (params.cutoff !== undefined) this.setCutoff(params.cutoff);
        if (params.resonance !== undefined) this.setResonance(params.resonance);
        if (params.envMod !== undefined) this.setEnvMod(params.envMod);
        if (params.decay !== undefined) this.setDecay(params.decay);
        if (params.accent !== undefined) this.setAccent(params.accent);
        if (params.glide !== undefined) this.setGlide(params.glide);
        if (params.distortion !== undefined) this.setDistortion(params.distortion);
        if (params.gain !== undefined) this.setGain(params.gain);
    }

    /**
     * Get current parameters
     */
    getParameters() {
        return { ...this.params };
    }

    /**
     * Load preset
     */
    loadPreset(presetName) {
        const presets = {
            // Classic acid bass
            classic: {
                waveform: 'sawtooth',
                cutoff: 800,
                resonance: 0.7,
                envMod: 0.6,
                decay: 0.2,
                accent: 0.5,
                glide: 0.1,
                distortion: 30
            },
            // Aggressive acid
            aggressive: {
                waveform: 'square',
                cutoff: 1200,
                resonance: 0.85,
                envMod: 0.8,
                decay: 0.15,
                accent: 0.7,
                glide: 0.05,
                distortion: 50
            },
            // Deep minimal
            deep: {
                waveform: 'sawtooth',
                cutoff: 400,
                resonance: 0.4,
                envMod: 0.4,
                decay: 0.4,
                accent: 0.3,
                glide: 0.15,
                distortion: 20
            },
            // Squelchy
            squelchy: {
                waveform: 'sawtooth',
                cutoff: 600,
                resonance: 0.9,
                envMod: 0.9,
                decay: 0.3,
                accent: 0.6,
                glide: 0.08,
                distortion: 40
            },
            // Hard techno
            hard: {
                waveform: 'square',
                cutoff: 1500,
                resonance: 0.75,
                envMod: 0.7,
                decay: 0.12,
                accent: 0.8,
                glide: 0,
                distortion: 60
            },
            // Detroit style
            detroit: {
                waveform: 'sawtooth',
                cutoff: 900,
                resonance: 0.6,
                envMod: 0.5,
                decay: 0.25,
                accent: 0.4,
                glide: 0.12,
                distortion: 25
            },
            // Liquid acid
            liquid: {
                waveform: 'sawtooth',
                cutoff: 700,
                resonance: 0.8,
                envMod: 0.85,
                decay: 0.35,
                accent: 0.5,
                glide: 0.2,
                distortion: 35
            }
        };

        const preset = presets[presetName];
        if (preset) {
            this.setParameters(preset);
            console.log(`🔊 TB-303 Preset loaded: ${presetName}`);
            return preset;
        } else {
            console.warn(`Preset '${presetName}' not found`);
            return null;
        }
    }

    /**
     * Create distortion curve for wave shaper
     * @private
     */
    _makeDistortionCurve(amount) {
        const k = amount;
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }

        return curve;
    }

    /**
     * Classic TB-303 note frequencies
     */
    static get NOTES() {
        return {
            C2: 65.41,
            'C#2': 69.30,
            D2: 73.42,
            'D#2': 77.78,
            E2: 82.41,
            F2: 87.31,
            'F#2': 92.50,
            G2: 98.00,
            'G#2': 103.83,
            A2: 110.00,
            'A#2': 116.54,
            B2: 123.47,
            C3: 130.81,
            'C#3': 138.59,
            D3: 146.83,
            'D#3': 155.56,
            E3: 164.81,
            F3: 174.61,
            'F#3': 185.00,
            G3: 196.00,
            'G#3': 207.65,
            A3: 220.00,
            'A#3': 233.08,
            B3: 246.94
        };
    }

    /**
     * Get note frequency by name
     */
    static getNoteFrequency(note) {
        return Bass303.NOTES[note] || 130.81; // Default C3
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.stop();

        if (this.output) {
            this.output.disconnect();
        }

        Object.keys(this.nodes).forEach(key => {
            if (this.nodes[key] && this.nodes[key].disconnect) {
                this.nodes[key].disconnect();
            }
        });

        this.nodes = {};
        this.output = null;

        console.log('🔴 TB-303 disposed');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bass303;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.Bass303 = Bass303;
}
