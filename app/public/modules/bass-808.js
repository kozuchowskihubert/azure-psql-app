/**
 * 808 Bass Synthesis Module
 *
 * Professional 808 sub-bass synthesizer with authentic analog modeling.
 * Signal flow: VCO → VCF → Distortion → VCA → Output
 *
 * Features:
 * - Dual sine oscillators with detune
 * - 24dB/oct low-pass filter
 * - Resonance control with self-oscillation
 * - Pitch envelope (glide/portamento)
 * - Harmonic distortion/saturation
 * - ADSR amplitude envelope
 *
 * @module Bass808
 * @version 2.6.0
 */

class Bass808 {
    constructor(audioEngine, options = {}) {
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error('Bass808 requires CoreAudioEngine instance');
        }

        this.engine = audioEngine;
        this.ctx = audioEngine.audioContext;

        // Default parameters
        this.params = {
            frequency: options.frequency || 55, // A1 (default 808 pitch)
            decay: options.decay || 0.5, // 500ms decay
            cutoff: options.cutoff || 250, // Hz
            resonance: options.resonance || 0.5, // 0-1
            distortion: options.distortion || 0.2, // 20%
            glide: options.glide || 0.05, // 50ms glide
            detune: options.detune || 0.99, // Slight detune for thickness
            envelopeAmount: options.envelopeAmount || 0.7, // Filter envelope depth
            gain: options.gain || 0.9,
            ...options,
        };

        // Audio nodes
        this.nodes = {};
        this._buildSignalChain();

        // State
        this.isPlaying = false;
        this.lastFrequency = this.params.frequency;
    }

    /**
     * Build the 808 synthesis signal chain
     */
    _buildSignalChain() {
        // === VCO (Voltage Controlled Oscillators) ===
        // Dual sine oscillators for thickness
        this.nodes.osc1 = null; // Created on trigger
        this.nodes.osc2 = null; // Created on trigger

        // === VCF (Voltage Controlled Filter) ===
        // 24dB/oct low-pass filter (cascaded biquads)
        this.nodes.filter1 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);
        this.nodes.filter2 = this.engine.createFilter('lowpass', this.params.cutoff, 0.7);

        // Connect filters in series for 24dB/oct slope
        this.nodes.filter1.connect(this.nodes.filter2);

        // === Distortion/Saturation ===
        this.nodes.distortion = this.ctx.createWaveShaper();
        this.nodes.distortion.curve = this._createDistortionCurve(this.params.distortion * 100);
        this.nodes.distortion.oversample = '4x'; // Anti-aliasing

        this.nodes.filter2.connect(this.nodes.distortion);

        // === VCA (Voltage Controlled Amplifier) ===
        this.nodes.vca = this.engine.createGain(0); // Start silent
        this.nodes.distortion.connect(this.nodes.vca);

        // === Output ===
        this.output = this.nodes.vca;
    }

    /**
     * Trigger 808 bass note
     * @param {number} frequency - Note frequency in Hz (optional, uses last or default)
     * @param {number} velocity - Note velocity 0-1 (affects accent)
     * @param {number} startTime - When to start (AudioContext time)
     */
    trigger(frequency = null, velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const targetFreq = frequency || this.lastFrequency;

        // Store for next time
        if (frequency) {
            this.lastFrequency = frequency;
        }

        // === Create Oscillators (VCO) ===
        this.nodes.osc1 = this.engine.createOscillator('sine', targetFreq);
        this.nodes.osc2 = this.engine.createOscillator('sine', targetFreq * this.params.detune);

        // Connect oscillators to filter
        this.nodes.osc1.connect(this.nodes.filter1);
        this.nodes.osc2.connect(this.nodes.filter1);

        // === Pitch Envelope (Glide/Portamento) ===
        if (this.params.glide > 0 && this.isPlaying) {
            const glideDuration = this.params.glide;
            const glideTarget = targetFreq * 0.7; // Slide down

            // OSC1 glide
            this.nodes.osc1.frequency.setValueAtTime(targetFreq, now);
            this.nodes.osc1.frequency.exponentialRampToValueAtTime(
                glideTarget,
                now + glideDuration,
            );

            // OSC2 glide (detuned)
            this.nodes.osc2.frequency.setValueAtTime(
                targetFreq * this.params.detune,
                now,
            );
            this.nodes.osc2.frequency.exponentialRampToValueAtTime(
                glideTarget * this.params.detune,
                now + glideDuration,
            );
        }

        // === Filter Envelope (VCF) ===
        const filterCutoff = this.params.cutoff;
        const filterPeak = filterCutoff + (this.params.envelopeAmount * filterCutoff * 2);
        const filterEnd = filterCutoff * 0.5;

        // Set resonance (Q factor)
        const resonanceQ = 0.7 + (this.params.resonance * 9.3); // 0.7 to 10
        this.nodes.filter1.Q.setValueAtTime(resonanceQ, now);
        this.nodes.filter2.Q.setValueAtTime(resonanceQ, now);

        // Filter envelope: Attack → Decay
        this.nodes.filter1.frequency.cancelScheduledValues(now);
        this.nodes.filter2.frequency.cancelScheduledValues(now);

        this.nodes.filter1.frequency.setValueAtTime(filterCutoff, now);
        this.nodes.filter2.frequency.setValueAtTime(filterCutoff, now);

        this.nodes.filter1.frequency.linearRampToValueAtTime(filterPeak, now + 0.001); // Fast attack
        this.nodes.filter2.frequency.linearRampToValueAtTime(filterPeak, now + 0.001);

        this.nodes.filter1.frequency.exponentialRampToValueAtTime(
            filterEnd,
            now + this.params.decay * 0.7,
        );
        this.nodes.filter2.frequency.exponentialRampToValueAtTime(
            filterEnd,
            now + this.params.decay * 0.7,
        );

        // === Amplitude Envelope (VCA) ===
        const attackTime = 0.001; // 1ms attack (instant)
        const decayTime = this.params.decay;
        const gain = this.params.gain * velocity;

        this.nodes.vca.gain.cancelScheduledValues(now);
        this.nodes.vca.gain.setValueAtTime(0, now);
        this.nodes.vca.gain.linearRampToValueAtTime(gain, now + attackTime);
        this.nodes.vca.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

        // === Start Oscillators ===
        this.nodes.osc1.start(now);
        this.nodes.osc2.start(now);

        // === Stop Oscillators ===
        const stopTime = now + decayTime + 0.1;
        this.nodes.osc1.stop(stopTime);
        this.nodes.osc2.stop(stopTime);

        // Cleanup
        this.nodes.osc1.onended = () => {
            this.nodes.osc1.disconnect();
            this.nodes.osc2.disconnect();
            this.nodes.osc1 = null;
            this.nodes.osc2 = null;
            this.isPlaying = false;
        };

        this.isPlaying = true;
    }

    /**
     * Stop currently playing note
     */
    stop(when = null) {
        const now = when || this.ctx.currentTime;

        if (this.nodes.osc1) {
            this.nodes.vca.gain.cancelScheduledValues(now);
            this.nodes.vca.gain.setValueAtTime(this.nodes.vca.gain.value, now);
            this.nodes.vca.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            this.nodes.osc1.stop(now + 0.1);
            this.nodes.osc2.stop(now + 0.1);
        }

        this.isPlaying = false;
    }

    /**
     * Parameter setters with live update
     */
    setFrequency(freq) {
        this.params.frequency = freq;
        this.lastFrequency = freq;
    }

    setDecay(value) {
        this.params.decay = Math.max(0.1, Math.min(2.0, value));
    }

    setCutoff(freq) {
        this.params.cutoff = Math.max(50, Math.min(8000, freq));
        if (!this.isPlaying) {
            this.nodes.filter1.frequency.setValueAtTime(this.params.cutoff, this.ctx.currentTime);
            this.nodes.filter2.frequency.setValueAtTime(this.params.cutoff, this.ctx.currentTime);
        }
    }

    setResonance(value) {
        this.params.resonance = Math.max(0, Math.min(1, value));
        if (!this.isPlaying) {
            const q = 0.7 + (this.params.resonance * 9.3);
            this.nodes.filter1.Q.setValueAtTime(q, this.ctx.currentTime);
            this.nodes.filter2.Q.setValueAtTime(q, this.ctx.currentTime);
        }
    }

    setDistortion(value) {
        this.params.distortion = Math.max(0, Math.min(1, value));
        this.nodes.distortion.curve = this._createDistortionCurve(this.params.distortion * 100);
    }

    setGlide(value) {
        this.params.glide = Math.max(0, Math.min(0.5, value));
    }

    setEnvelopeAmount(value) {
        this.params.envelopeAmount = Math.max(0, Math.min(1, value));
    }

    setGain(value) {
        this.params.gain = Math.max(0, Math.min(1, value));
    }

    /**
     * Batch parameter update
     * @param {object} params - Parameter object
     */
    setParameters(params) {
        if (params.frequency !== undefined) this.setFrequency(params.frequency);
        if (params.decay !== undefined) this.setDecay(params.decay);
        if (params.cutoff !== undefined) this.setCutoff(params.cutoff);
        if (params.resonance !== undefined) this.setResonance(params.resonance);
        if (params.distortion !== undefined) this.setDistortion(params.distortion);
        if (params.glide !== undefined) this.setGlide(params.glide);
        if (params.envelopeAmount !== undefined) this.setEnvelopeAmount(params.envelopeAmount);
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
     * @param {string} presetName - Preset identifier
     */
    loadPreset(presetName) {
        const presets = {
            // Deep sub bass
            deep: {
                frequency: 45,
                decay: 1.2,
                cutoff: 200,
                resonance: 0.4,
                distortion: 0.15,
                glide: 0.08,
                envelopeAmount: 0.5,
            },
            // Classic 808
            classic: {
                frequency: 55,
                decay: 0.6,
                cutoff: 250,
                resonance: 0.5,
                distortion: 0.2,
                glide: 0.05,
                envelopeAmount: 0.7,
            },
            // Punchy kick-style
            punchy: {
                frequency: 65,
                decay: 0.3,
                cutoff: 180,
                resonance: 0.3,
                distortion: 0.1,
                glide: 0,
                envelopeAmount: 0.6,
            },
            // Rolling bass
            rolling: {
                frequency: 50,
                decay: 0.9,
                cutoff: 300,
                resonance: 0.6,
                distortion: 0.3,
                glide: 0.1,
                envelopeAmount: 0.8,
            },
            // Distorted modern
            distorted: {
                frequency: 60,
                decay: 0.5,
                cutoff: 400,
                resonance: 0.7,
                distortion: 0.5,
                glide: 0.06,
                envelopeAmount: 0.9,
            },
            // Melodic bass
            melodic: {
                frequency: 55,
                decay: 0.8,
                cutoff: 350,
                resonance: 0.5,
                distortion: 0.25,
                glide: 0.12,
                envelopeAmount: 0.75,
            },
        };

        const preset = presets[presetName];
        if (preset) {
            this.setParameters(preset);
            console.log(`🎵 808 Preset loaded: ${presetName}`);
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
    _createDistortionCurve(amount) {
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
     * Frequency presets (musical notes)
     */
    static get NOTES() {
        return {
            C: 32.7,
            'C#': 34.6,
            Db: 34.6,
            D: 36.7,
            'D#': 38.9,
            Eb: 38.9,
            E: 41.2,
            F: 43.7,
            'F#': 44.0,
            Gb: 44.0,
            G: 49.0,
            'G#': 51.9,
            Ab: 51.9,
            A: 55.0, // Default
            'A#': 58.3,
            Bb: 58.3,
            B: 61.7,
            C2: 65.4, // Octave up
        };
    }

    /**
     * Get note frequency by name
     * @param {string} note - Note name (e.g., 'A', 'C#', 'Bb')
     */
    static getNoteFrequency(note) {
        return Bass808.NOTES[note] || 55.0;
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

        console.log('🔴 808 Bass disposed');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Bass808;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.Bass808 = Bass808;
}
