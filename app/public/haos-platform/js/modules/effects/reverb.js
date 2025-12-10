/**
 * HAOS Platform - Algorithmic Reverb Module
 * Freeverb-style reverb with Schroeder/Moorer topology
 * 
 * @module ReverbModule
 * @extends AudioModule
 */

import { AudioModule } from '../AudioModule.js';

export class ReverbModule extends AudioModule {
    constructor(audioContext, id = null) {
        super(audioContext, id);
        
        this.metadata = {
            name: 'Reverb',
            type: 'effect',
            category: 'space',
            description: 'Algorithmic reverb with multiple room types',
            author: 'HAOS Platform',
            version: '1.0.0',
            tags: ['reverb', 'space', 'hall', 'room', 'ambient'],
            inputs: ['audio_in_L', 'audio_in_R'],
            outputs: ['audio_out_L', 'audio_out_R'],
            parameters: {
                size: { min: 0.1, max: 1.0, default: 0.5, description: 'Room size' },
                damping: { min: 0, max: 1, default: 0.5, description: 'High frequency damping' },
                mix: { min: 0, max: 1, default: 0.25, description: 'Dry/wet mix' },
                predelay: { min: 0, max: 0.1, default: 0.02, unit: 's', description: 'Pre-delay time' },
                width: { min: 0, max: 1, default: 1.0, description: 'Stereo width' },
                diffusion: { min: 0, max: 1, default: 0.7, description: 'Early reflections diffusion' },
                decay: { min: 0.1, max: 20, default: 2.5, unit: 's', description: 'Decay time' }
            },
            cpuUsage: 'high',
            presets: [
                { name: 'Small Room', params: { size: 0.2, damping: 0.7, mix: 0.15, predelay: 0.01, width: 0.8, diffusion: 0.5, decay: 1.0 } },
                { name: 'Medium Hall', params: { size: 0.5, damping: 0.5, mix: 0.25, predelay: 0.02, width: 1.0, diffusion: 0.7, decay: 2.5 } },
                { name: 'Large Hall', params: { size: 0.8, damping: 0.4, mix: 0.35, predelay: 0.03, width: 1.0, diffusion: 0.8, decay: 4.0 } },
                { name: 'Cathedral', params: { size: 0.95, damping: 0.3, mix: 0.4, predelay: 0.05, width: 1.0, diffusion: 0.9, decay: 8.0 } },
                { name: 'Plate', params: { size: 0.6, damping: 0.8, mix: 0.3, predelay: 0.001, width: 0.9, diffusion: 0.6, decay: 2.0 } },
                { name: 'Ambient Wash', params: { size: 0.9, damping: 0.2, mix: 0.5, predelay: 0.04, width: 1.0, diffusion: 0.85, decay: 12.0 } },
                { name: 'Tight Room', params: { size: 0.15, damping: 0.85, mix: 0.2, predelay: 0.005, width: 0.6, diffusion: 0.4, decay: 0.5 } },
                { name: 'Vocal Plate', params: { size: 0.45, damping: 0.65, mix: 0.28, predelay: 0.015, width: 0.85, diffusion: 0.65, decay: 2.2 } }
            ]
        };

        // Audio nodes
        this.inputLeft = null;
        this.inputRight = null;
        this.outputLeft = null;
        this.outputRight = null;
        this.predelayLeft = null;
        this.predelayRight = null;
        this.dryGainLeft = null;
        this.dryGainRight = null;
        this.wetGainLeft = null;
        this.wetGainRight = null;
        this.widthGain = null;

        // Comb filters (parallel for reverb tail)
        this.combFiltersLeft = [];
        this.combFiltersRight = [];
        this.combFeedbackLeft = [];
        this.combFeedbackRight = [];
        this.combDampingLeft = [];
        this.combDampingRight = [];

        // Allpass filters (series for diffusion)
        this.allpassFiltersLeft = [];
        this.allpassFiltersRight = [];

        // Freeverb comb filter delays (in samples at 44.1kHz, scaled for other rates)
        this.combTunings = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
        this.allpassTunings = [556, 441, 341, 225];

        // Parameters
        this.params = {
            size: this.metadata.parameters.size.default,
            damping: this.metadata.parameters.damping.default,
            mix: this.metadata.parameters.mix.default,
            predelay: this.metadata.parameters.predelay.default,
            width: this.metadata.parameters.width.default,
            diffusion: this.metadata.parameters.diffusion.default,
            decay: this.metadata.parameters.decay.default
        };
    }

    /**
     * Initialize the reverb module
     */
    async init() {
        if (this.initialized) return;

        try {
            await this.createAudioGraph();
            this.initialized = true;
            console.log(`[ReverbModule] Initialized: ${this.id}`);
        } catch (error) {
            console.error('[ReverbModule] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create the audio processing graph
     */
    createAudioGraph() {
        const sampleRate = this.audioContext.sampleRate;
        const scaleFactor = sampleRate / 44100; // Scale tunings to current sample rate

        // Input/output nodes
        this.inputLeft = this.audioContext.createGain();
        this.inputRight = this.audioContext.createGain();
        this.outputLeft = this.audioContext.createGain();
        this.outputRight = this.audioContext.createGain();

        // Pre-delay
        this.predelayLeft = this.audioContext.createDelay(0.1);
        this.predelayRight = this.audioContext.createDelay(0.1);
        this.predelayLeft.delayTime.value = this.params.predelay;
        this.predelayRight.delayTime.value = this.params.predelay;

        // Dry/wet mix
        this.dryGainLeft = this.audioContext.createGain();
        this.dryGainRight = this.audioContext.createGain();
        this.wetGainLeft = this.audioContext.createGain();
        this.wetGainRight = this.audioContext.createGain();

        // Width control for stereo spread
        this.widthGain = this.audioContext.createGain();
        this.widthGain.gain.value = this.params.width;

        // Create comb filters (parallel bank for each channel)
        for (let i = 0; i < this.combTunings.length; i++) {
            const delayTime = (this.combTunings[i] * scaleFactor) / sampleRate;
            
            // Left channel comb
            const combLeft = this.audioContext.createDelay(2.0);
            combLeft.delayTime.value = delayTime;
            const feedbackLeft = this.audioContext.createGain();
            const dampingLeft = this.audioContext.createBiquadFilter();
            dampingLeft.type = 'lowpass';
            dampingLeft.frequency.value = this.calculateDampingFreq(this.params.damping);
            
            this.combFiltersLeft.push(combLeft);
            this.combFeedbackLeft.push(feedbackLeft);
            this.combDampingLeft.push(dampingLeft);

            // Right channel comb (slightly detuned for stereo)
            const combRight = this.audioContext.createDelay(2.0);
            combRight.delayTime.value = delayTime * 1.01; // 1% detune
            const feedbackRight = this.audioContext.createGain();
            const dampingRight = this.audioContext.createBiquadFilter();
            dampingRight.type = 'lowpass';
            dampingRight.frequency.value = this.calculateDampingFreq(this.params.damping);
            
            this.combFiltersRight.push(combRight);
            this.combFeedbackRight.push(feedbackRight);
            this.combDampingRight.push(dampingRight);
        }

        // Create allpass filters (series for diffusion)
        for (let i = 0; i < this.allpassTunings.length; i++) {
            const delayTime = (this.allpassTunings[i] * scaleFactor) / sampleRate;
            
            // Left channel allpass
            const allpassLeft = this.audioContext.createBiquadFilter();
            allpassLeft.type = 'allpass';
            allpassLeft.frequency.value = 1000 / (i + 1); // Decreasing frequencies
            allpassLeft.Q.value = 0.5;
            this.allpassFiltersLeft.push(allpassLeft);

            // Right channel allpass
            const allpassRight = this.audioContext.createBiquadFilter();
            allpassRight.type = 'allpass';
            allpassRight.frequency.value = 1000 / (i + 1);
            allpassRight.Q.value = 0.5;
            this.allpassFiltersRight.push(allpassRight);
        }

        // Connect the graph
        this.connectGraph();

        // Update parameters
        this.updateDecay();
        this.updateMix();

        console.log('[ReverbModule] Audio graph created with Freeverb topology');
    }

    /**
     * Connect all nodes in the reverb graph
     */
    connectGraph() {
        // Dry path
        this.inputLeft.connect(this.dryGainLeft);
        this.inputRight.connect(this.dryGainRight);
        this.dryGainLeft.connect(this.outputLeft);
        this.dryGainRight.connect(this.outputRight);

        // Wet path with pre-delay
        this.inputLeft.connect(this.predelayLeft);
        this.inputRight.connect(this.predelayRight);

        // Connect to comb filter banks
        const combMixer = this.audioContext.createGain();
        combMixer.gain.value = 1.0 / this.combFiltersLeft.length; // Normalize

        // Left channel combs (parallel)
        this.predelayLeft.connect(combMixer);
        for (let i = 0; i < this.combFiltersLeft.length; i++) {
            combMixer.connect(this.combFiltersLeft[i]);
            this.combFiltersLeft[i].connect(this.combDampingLeft[i]);
            this.combDampingLeft[i].connect(this.combFeedbackLeft[i]);
            this.combFeedbackLeft[i].connect(this.combFiltersLeft[i]); // Feedback loop
            this.combDampingLeft[i].connect(this.allpassFiltersLeft[0]); // To allpass chain
        }

        // Right channel combs (parallel)
        const combMixerRight = this.audioContext.createGain();
        combMixerRight.gain.value = 1.0 / this.combFiltersRight.length;
        this.predelayRight.connect(combMixerRight);
        for (let i = 0; i < this.combFiltersRight.length; i++) {
            combMixerRight.connect(this.combFiltersRight[i]);
            this.combFiltersRight[i].connect(this.combDampingRight[i]);
            this.combDampingRight[i].connect(this.combFeedbackRight[i]);
            this.combFeedbackRight[i].connect(this.combFiltersRight[i]); // Feedback loop
            this.combDampingRight[i].connect(this.allpassFiltersRight[0]); // To allpass chain
        }

        // Chain allpass filters (series for diffusion)
        for (let i = 0; i < this.allpassFiltersLeft.length - 1; i++) {
            this.allpassFiltersLeft[i].connect(this.allpassFiltersLeft[i + 1]);
            this.allpassFiltersRight[i].connect(this.allpassFiltersRight[i + 1]);
        }

        // Output from allpass chains
        const lastLeft = this.allpassFiltersLeft[this.allpassFiltersLeft.length - 1];
        const lastRight = this.allpassFiltersRight[this.allpassFiltersRight.length - 1];

        lastLeft.connect(this.wetGainLeft);
        lastRight.connect(this.wetGainRight);

        this.wetGainLeft.connect(this.outputLeft);
        this.wetGainRight.connect(this.outputRight);
    }

    /**
     * Calculate damping filter frequency from damping parameter
     */
    calculateDampingFreq(damping) {
        // Map 0-1 to 20kHz-500Hz (more damping = lower cutoff)
        return 20000 * Math.pow(0.025, damping);
    }

    /**
     * Update decay time (affects feedback gains)
     */
    updateDecay() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const size = this.params.size;
        const decay = this.params.decay;

        // Calculate feedback gain for desired RT60 decay time
        // feedback = 10^(-3 * delayTime / (decay * sampleRate))
        const sampleRate = this.audioContext.sampleRate;

        for (let i = 0; i < this.combFeedbackLeft.length; i++) {
            const delayTime = this.combFiltersLeft[i].delayTime.value;
            const feedbackGain = Math.pow(10, (-3 * delayTime) / decay);
            const scaledFeedback = feedbackGain * (0.28 + size * 0.7); // Size affects feedback
            
            this.combFeedbackLeft[i].gain.setValueAtTime(scaledFeedback, now);
            this.combFeedbackRight[i].gain.setValueAtTime(scaledFeedback, now);
        }
    }

    /**
     * Update dry/wet mix
     */
    updateMix() {
        if (!this.dryGainLeft || !this.audioContext) return;

        const mix = this.params.mix;
        const now = this.audioContext.currentTime;
        
        // Equal power crossfade
        const dryGain = Math.cos(mix * Math.PI / 2);
        const wetGain = Math.sin(mix * Math.PI / 2);

        this.dryGainLeft.gain.setValueAtTime(dryGain, now);
        this.dryGainRight.gain.setValueAtTime(dryGain, now);
        this.wetGainLeft.gain.setValueAtTime(wetGain, now);
        this.wetGainRight.gain.setValueAtTime(wetGain, now);
    }

    /**
     * Connect input to this module
     */
    connect(destination) {
        if (!this.outputLeft || !this.outputRight) {
            console.warn('[ReverbModule] Cannot connect - not initialized');
            return;
        }

        if (destination.inputNode) {
            this.outputLeft.connect(destination.inputNode);
            this.outputRight.connect(destination.inputNode);
        } else {
            this.outputLeft.connect(destination);
            this.outputRight.connect(destination);
        }
    }

    /**
     * Disconnect output
     */
    disconnect(destination = null) {
        if (!this.outputLeft || !this.outputRight) return;

        if (destination) {
            if (destination.inputNode) {
                this.outputLeft.disconnect(destination.inputNode);
                this.outputRight.disconnect(destination.inputNode);
            } else {
                this.outputLeft.disconnect(destination);
                this.outputRight.disconnect(destination);
            }
        } else {
            this.outputLeft.disconnect();
            this.outputRight.disconnect();
        }
    }

    /**
     * Get input nodes
     */
    getInput(channel = 'left') {
        return channel === 'right' ? this.inputRight : this.inputLeft;
    }

    /**
     * Get output nodes
     */
    getOutput(channel = 'left') {
        return channel === 'right' ? this.outputRight : this.outputLeft;
    }

    /**
     * Set parameter value
     */
    setParam(paramName, value) {
        if (!this.metadata.parameters[paramName]) {
            console.warn(`[ReverbModule] Unknown parameter: ${paramName}`);
            return;
        }

        const paramDef = this.metadata.parameters[paramName];
        const clampedValue = Math.max(paramDef.min, Math.min(paramDef.max, value));
        this.params[paramName] = clampedValue;

        switch (paramName) {
            case 'size':
                this.setSize(clampedValue);
                break;
            case 'damping':
                this.setDamping(clampedValue);
                break;
            case 'mix':
                this.setMix(clampedValue);
                break;
            case 'predelay':
                this.setPredelay(clampedValue);
                break;
            case 'width':
                this.setWidth(clampedValue);
                break;
            case 'diffusion':
                this.setDiffusion(clampedValue);
                break;
            case 'decay':
                this.setDecay(clampedValue);
                break;
        }
    }

    setSize(value) {
        this.params.size = value;
        this.updateDecay();
    }

    setDamping(value) {
        this.params.damping = value;
        
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        const freq = this.calculateDampingFreq(value);

        this.combDampingLeft.forEach(filter => {
            filter.frequency.setValueAtTime(freq, now);
        });
        this.combDampingRight.forEach(filter => {
            filter.frequency.setValueAtTime(freq, now);
        });
    }

    setMix(value) {
        this.params.mix = value;
        this.updateMix();
    }

    setPredelay(value) {
        this.params.predelay = value;
        
        if (this.predelayLeft && this.predelayRight && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.predelayLeft.delayTime.setValueAtTime(value, now);
            this.predelayRight.delayTime.setValueAtTime(value, now);
        }
    }

    setWidth(value) {
        this.params.width = value;
        
        if (this.widthGain && this.audioContext) {
            this.widthGain.gain.setValueAtTime(value, this.audioContext.currentTime);
        }
    }

    setDiffusion(value) {
        this.params.diffusion = value;
        
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;

        // Adjust allpass Q values for diffusion amount
        const Q = 0.1 + value * 0.9; // Range 0.1 to 1.0
        
        this.allpassFiltersLeft.forEach(filter => {
            filter.Q.setValueAtTime(Q, now);
        });
        this.allpassFiltersRight.forEach(filter => {
            filter.Q.setValueAtTime(Q, now);
        });
    }

    setDecay(value) {
        this.params.decay = value;
        this.updateDecay();
    }

    /**
     * Get all parameters
     */
    getParams() {
        return { ...this.params };
    }

    /**
     * Load preset
     */
    loadPreset(presetName) {
        const preset = this.metadata.presets.find(p => p.name === presetName);
        if (!preset) {
            console.warn(`[ReverbModule] Preset not found: ${presetName}`);
            return;
        }

        Object.entries(preset.params).forEach(([param, value]) => {
            this.setParam(param, value);
        });

        console.log(`[ReverbModule] Loaded preset: ${presetName}`);
    }

    /**
     * Cleanup
     */
    destroy() {
        // Disconnect all nodes
        [this.inputLeft, this.inputRight, this.outputLeft, this.outputRight,
         this.predelayLeft, this.predelayRight, this.dryGainLeft, this.dryGainRight,
         this.wetGainLeft, this.wetGainRight, this.widthGain].forEach(node => {
            if (node) {
                try {
                    node.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }
        });

        this.combFiltersLeft.forEach(n => n && n.disconnect && n.disconnect());
        this.combFiltersRight.forEach(n => n && n.disconnect && n.disconnect());
        this.combFeedbackLeft.forEach(n => n && n.disconnect && n.disconnect());
        this.combFeedbackRight.forEach(n => n && n.disconnect && n.disconnect());
        this.combDampingLeft.forEach(n => n && n.disconnect && n.disconnect());
        this.combDampingRight.forEach(n => n && n.disconnect && n.disconnect());
        this.allpassFiltersLeft.forEach(n => n && n.disconnect && n.disconnect());
        this.allpassFiltersRight.forEach(n => n && n.disconnect && n.disconnect());

        this.initialized = false;
        console.log(`[ReverbModule] Destroyed: ${this.id}`);
    }
}

// Register module
if (window.ModuleRegistry) {
    window.ModuleRegistry.register('reverb', ReverbModule);
    console.log('[ReverbModule] Registered with ModuleRegistry');
}
