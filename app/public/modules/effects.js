/**
 * Effects Rack Module
 *
 * Professional effects processing chain with multiple effects units.
 * Supports both serial and parallel routing with wet/dry mix controls.
 *
 * Effects:
 * - Stereo Delay (ping-pong, sync)
 * - Reverb (algorithmic impulse response)
 * - Filter (multi-mode with resonance)
 * - Distortion (wave shaping)
 * - Compressor (dynamic range control)
 * - Chorus (modulated delay)
 *
 * @module Effects
 * @version 2.6.0
 */

class Effects {
    constructor(audioEngine, options = {}) {
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error('Effects requires CoreAudioEngine instance');
        }

        this.engine = audioEngine;
        this.ctx = audioEngine.audioContext;

        // Effect units
        this.units = {
            delay: null,
            reverb: null,
            filter: null,
            distortion: null,
            compressor: null,
            chorus: null,
        };

        // Routing
        this.input = this.engine.createGain(1.0);
        this.output = this.engine.createGain(1.0);

        // Wet/dry mix nodes
        this.dryGain = this.engine.createGain(1.0);
        this.wetGain = this.engine.createGain(0.0);

        // Initialize effects
        this._initializeEffects();

        // Default routing: input -> dry -> output
        this.input.connect(this.dryGain);
        this.dryGain.connect(this.output);
    }

    /**
     * Initialize all effect units
     * @private
     */
    _initializeEffects() {
        // Delay
        this.units.delay = this._createDelay();

        // Reverb
        this.units.reverb = this._createReverb();

        // Filter
        this.units.filter = this._createFilter();

        // Distortion
        this.units.distortion = this._createDistortion();

        // Compressor
        this.units.compressor = this._createCompressor();

        // Chorus
        this.units.chorus = this._createChorus();
    }

    /**
     * Create stereo delay effect
     * @private
     */
    _createDelay() {
        const delayL = this.ctx.createDelay(5.0);
        const delayR = this.ctx.createDelay(5.0);
        const feedbackL = this.engine.createGain(0.3);
        const feedbackR = this.engine.createGain(0.3);
        const mix = this.engine.createGain(0.5);
        const merger = this.ctx.createChannelMerger(2);
        const splitter = this.ctx.createChannelSplitter(2);

        // Default settings
        delayL.delayTime.value = 0.375; // Dotted eighth at 120 BPM
        delayR.delayTime.value = 0.375;

        // Ping-pong routing: L->R, R->L
        delayL.connect(feedbackL);
        delayR.connect(feedbackR);
        feedbackL.connect(delayR);
        feedbackR.connect(delayL);

        // Stereo output
        delayL.connect(merger, 0, 0);
        delayR.connect(merger, 0, 1);
        merger.connect(mix);

        return {
            input: splitter,
            output: mix,
            delayL,
            delayR,
            feedbackL,
            feedbackR,
            nodes: { delayL, delayR, feedbackL, feedbackR, mix, merger, splitter },
        };
    }

    /**
     * Create reverb effect (algorithmic impulse response)
     * @private
     */
    _createReverb() {
        const convolver = this.ctx.createConvolver();
        const mix = this.engine.createGain(0.3);

        // Create impulse response
        const reverbTime = 2.0; // seconds
        const { sampleRate } = this.ctx;
        const length = sampleRate * reverbTime;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);

        // Generate algorithmic reverb impulse
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponential decay with random noise
                const decay = Math.exp(-i / (sampleRate * 0.5));
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }

        convolver.buffer = impulse;
        convolver.connect(mix);

        return {
            input: convolver,
            output: mix,
            convolver,
            nodes: { convolver, mix },
        };
    }

    /**
     * Create multi-mode filter
     * @private
     */
    _createFilter() {
        const filter = this.engine.createFilter('lowpass', 1000, 1);
        const mix = this.engine.createGain(1.0);

        filter.connect(mix);

        return {
            input: filter,
            output: mix,
            filter,
            nodes: { filter, mix },
        };
    }

    /**
     * Create distortion effect
     * @private
     */
    _createDistortion() {
        const shaper = this.ctx.createWaveShaper();
        const mix = this.engine.createGain(1.0);

        // Default distortion curve
        shaper.curve = this._makeDistortionCurve(50);
        shaper.oversample = '4x';

        shaper.connect(mix);

        return {
            input: shaper,
            output: mix,
            shaper,
            nodes: { shaper, mix },
        };
    }

    /**
     * Create dynamic compressor
     * @private
     */
    _createCompressor() {
        const compressor = this.ctx.createDynamicsCompressor();
        const mix = this.engine.createGain(1.0);

        // Default settings
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        compressor.connect(mix);

        return {
            input: compressor,
            output: mix,
            compressor,
            nodes: { compressor, mix },
        };
    }

    /**
     * Create chorus effect
     * @private
     */
    _createChorus() {
        const delay = this.ctx.createDelay(0.04);
        const lfo = this.ctx.createOscillator();
        const depth = this.engine.createGain(0.002);
        const mix = this.engine.createGain(0.5);

        // LFO modulates delay time
        lfo.frequency.value = 3; // 3 Hz
        lfo.connect(depth);
        depth.connect(delay.delayTime);

        delay.delayTime.value = 0.02; // 20ms base delay
        delay.connect(mix);

        lfo.start();

        return {
            input: delay,
            output: mix,
            delay,
            lfo,
            depth,
            nodes: { delay, lfo, depth, mix },
        };
    }

    /**
     * Enable/disable delay effect
     * @param {boolean} enabled - Enable state
     * @param {number} time - Delay time in seconds
     * @param {number} feedback - Feedback amount 0-1
     */
    setDelay(enabled, time = 0.375, feedback = 0.3) {
        if (enabled) {
            this.units.delay.delayL.delayTime.value = time;
            this.units.delay.delayR.delayTime.value = time;
            this.units.delay.feedbackL.gain.value = feedback;
            this.units.delay.feedbackR.gain.value = feedback;

            // Route through delay
            this.input.disconnect();
            this.input.connect(this.units.delay.input);
            this.input.connect(this.dryGain);
            this.units.delay.output.connect(this.wetGain);
            this.wetGain.connect(this.output);
        } else {
            // Bypass
            this._bypass();
        }
    }

    /**
     * Enable/disable reverb effect
     * @param {boolean} enabled - Enable state
     * @param {number} mix - Wet/dry mix 0-1
     * @param {number} decay - Reverb time in seconds
     */
    setReverb(enabled, mix = 0.3, decay = 2.0) {
        if (enabled) {
            // Regenerate impulse response with new decay
            const { sampleRate } = this.ctx;
            const length = sampleRate * decay;
            const impulse = this.ctx.createBuffer(2, length, sampleRate);

            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const decayFactor = Math.exp(-i / (sampleRate * (decay * 0.25)));
                    channelData[i] = (Math.random() * 2 - 1) * decayFactor;
                }
            }

            this.units.reverb.convolver.buffer = impulse;
            this.units.reverb.nodes.mix.gain.value = mix;

            // Route through reverb
            this.input.disconnect();
            this.input.connect(this.units.reverb.input);
            this.input.connect(this.dryGain);
            this.units.reverb.output.connect(this.wetGain);
            this.wetGain.connect(this.output);
        } else {
            this._bypass();
        }
    }

    /**
     * Set filter parameters
     * @param {boolean} enabled - Enable state
     * @param {string} type - Filter type (lowpass, highpass, bandpass, notch)
     * @param {number} frequency - Cutoff frequency in Hz
     * @param {number} resonance - Q factor 0.1-30
     */
    setFilter(enabled, type = 'lowpass', frequency = 1000, resonance = 1) {
        if (enabled) {
            this.units.filter.filter.type = type;
            this.units.filter.filter.frequency.value = frequency;
            this.units.filter.filter.Q.value = resonance;

            // Route through filter
            this.input.disconnect();
            this.input.connect(this.units.filter.input);
            this.units.filter.output.connect(this.output);
        } else {
            this._bypass();
        }
    }

    /**
     * Set distortion parameters
     * @param {boolean} enabled - Enable state
     * @param {number} amount - Distortion amount 0-100
     */
    setDistortion(enabled, amount = 50) {
        if (enabled) {
            this.units.distortion.shaper.curve = this._makeDistortionCurve(amount);

            // Route through distortion
            this.input.disconnect();
            this.input.connect(this.units.distortion.input);
            this.units.distortion.output.connect(this.output);
        } else {
            this._bypass();
        }
    }

    /**
     * Set compressor parameters
     * @param {boolean} enabled - Enable state
     * @param {number} threshold - Threshold in dB
     * @param {number} ratio - Compression ratio
     */
    setCompressor(enabled, threshold = -24, ratio = 12) {
        if (enabled) {
            this.units.compressor.compressor.threshold.value = threshold;
            this.units.compressor.compressor.ratio.value = ratio;

            // Route through compressor
            this.input.disconnect();
            this.input.connect(this.units.compressor.input);
            this.units.compressor.output.connect(this.output);
        } else {
            this._bypass();
        }
    }

    /**
     * Set chorus parameters
     * @param {boolean} enabled - Enable state
     * @param {number} rate - LFO rate in Hz
     * @param {number} depth - Modulation depth 0-1
     */
    setChorus(enabled, rate = 3, depth = 0.5) {
        if (enabled) {
            this.units.chorus.lfo.frequency.value = rate;
            this.units.chorus.depth.gain.value = depth * 0.004;

            // Route through chorus
            this.input.disconnect();
            this.input.connect(this.units.chorus.input);
            this.input.connect(this.dryGain);
            this.units.chorus.output.connect(this.wetGain);
            this.wetGain.connect(this.output);
        } else {
            this._bypass();
        }
    }

    /**
     * Set wet/dry mix
     * @param {number} wet - Wet amount 0-1
     */
    setMix(wet) {
        const dry = 1 - wet;
        this.dryGain.gain.setValueAtTime(dry, this.ctx.currentTime);
        this.wetGain.gain.setValueAtTime(wet, this.ctx.currentTime);
    }

    /**
     * Load preset
     * @param {string} presetName - Preset identifier
     */
    loadPreset(presetName) {
        const presets = {
            // Spacious reverb
            space: {
                reverb: { enabled: true, mix: 0.4, decay: 3.0 },
            },
            // Ping-pong delay
            echo: {
                delay: { enabled: true, time: 0.375, feedback: 0.4 },
            },
            // Low-pass filter sweep
            filter: {
                filter: { enabled: true, type: 'lowpass', frequency: 800, resonance: 5 },
            },
            // Warm distortion
            warm: {
                distortion: { enabled: true, amount: 30 },
            },
            // Heavy compression
            punchy: {
                compressor: { enabled: true, threshold: -18, ratio: 8 },
            },
            // Chorus + reverb
            lush: {
                chorus: { enabled: true, rate: 2, depth: 0.6 },
                reverb: { enabled: true, mix: 0.3, decay: 2.5 },
            },
            // Dub delay
            dub: {
                delay: { enabled: true, time: 0.5, feedback: 0.6 },
                filter: { enabled: true, type: 'lowpass', frequency: 1200, resonance: 2 },
            },
        };

        const preset = presets[presetName];
        if (preset) {
            // Reset all effects
            this._bypass();

            // Apply preset
            if (preset.delay) {
                this.setDelay(preset.delay.enabled, preset.delay.time, preset.delay.feedback);
            }
            if (preset.reverb) {
                this.setReverb(preset.reverb.enabled, preset.reverb.mix, preset.reverb.decay);
            }
            if (preset.filter) {
                this.setFilter(preset.filter.enabled, preset.filter.type, preset.filter.frequency, preset.filter.resonance);
            }
            if (preset.distortion) {
                this.setDistortion(preset.distortion.enabled, preset.distortion.amount);
            }
            if (preset.compressor) {
                this.setCompressor(preset.compressor.enabled, preset.compressor.threshold, preset.compressor.ratio);
            }
            if (preset.chorus) {
                this.setChorus(preset.chorus.enabled, preset.chorus.rate, preset.chorus.depth);
            }

            console.log(`🎚️ Effects preset loaded: ${presetName}`);
            return preset;
        } else {
            console.warn(`Preset '${presetName}' not found`);
            return null;
        }
    }

    /**
     * Bypass all effects
     * @private
     */
    _bypass() {
        this.input.disconnect();
        this.input.connect(this.output);
        this.dryGain.gain.value = 1.0;
        this.wetGain.gain.value = 0.0;
    }

    /**
     * Create distortion curve
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
     * Get current effect status
     */
    getStatus() {
        return {
            delay: {
                time: this.units.delay.delayL.delayTime.value,
                feedback: this.units.delay.feedbackL.gain.value,
            },
            reverb: {
                mix: this.units.reverb.nodes.mix.gain.value,
            },
            filter: {
                type: this.units.filter.filter.type,
                frequency: this.units.filter.filter.frequency.value,
                Q: this.units.filter.filter.Q.value,
            },
            compressor: {
                threshold: this.units.compressor.compressor.threshold.value,
                ratio: this.units.compressor.compressor.ratio.value,
            },
            chorus: {
                rate: this.units.chorus.lfo.frequency.value,
                depth: this.units.chorus.depth.gain.value,
            },
        };
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        // Stop oscillators
        if (this.units.chorus && this.units.chorus.lfo) {
            this.units.chorus.lfo.stop();
        }

        // Disconnect all nodes
        Object.values(this.units).forEach(unit => {
            if (unit && unit.nodes) {
                Object.values(unit.nodes).forEach(node => {
                    if (node && node.disconnect) {
                        node.disconnect();
                    }
                });
            }
        });

        this.input.disconnect();
        this.output.disconnect();
        this.dryGain.disconnect();
        this.wetGain.disconnect();

        console.log('🔴 Effects disposed');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Effects;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.Effects = Effects;
}
