/**
 * HAOS Platform - Stereo Delay Module
 * Advanced stereo/ping-pong delay with tempo sync and filtering
 * 
 * @module DelayModule
 * @extends AudioModule
 */

import { AudioModule } from '../AudioModule.js';

export class DelayModule extends AudioModule {
    constructor(audioContext, id = null) {
        super(audioContext, id);
        
        this.metadata = {
            name: 'Stereo Delay',
            type: 'effect',
            category: 'time',
            description: 'Stereo and ping-pong delay with tempo sync',
            author: 'HAOS Platform',
            version: '1.0.0',
            tags: ['delay', 'echo', 'stereo', 'ping-pong', 'time'],
            inputs: ['audio_in_L', 'audio_in_R'],
            outputs: ['audio_out_L', 'audio_out_R'],
            parameters: {
                time_left: { min: 0.01, max: 2.0, default: 0.25, unit: 's', description: 'Left delay time' },
                time_right: { min: 0.01, max: 2.0, default: 0.375, unit: 's', description: 'Right delay time' },
                feedback: { min: 0, max: 0.95, default: 0.4, description: 'Feedback amount' },
                mix: { min: 0, max: 1, default: 0.3, description: 'Dry/wet mix' },
                filter_freq: { min: 200, max: 10000, default: 4000, unit: 'Hz', description: 'Filter frequency' },
                filter_resonance: { min: 0.1, max: 20, default: 1, description: 'Filter resonance' },
                stereo_mode: { min: 0, max: 2, default: 1, step: 1, description: 'Mode: 0=Stereo, 1=Ping-Pong, 2=Cross' },
                sync: { min: 0, max: 1, default: 0, description: 'Tempo sync (0=off, 1=on)' },
                bpm: { min: 60, max: 200, default: 120, unit: 'BPM', description: 'Tempo for sync' }
            },
            cpuUsage: 'medium',
            presets: [
                { name: 'Short Slap', params: { time_left: 0.08, time_right: 0.12, feedback: 0.2, mix: 0.25, filter_freq: 8000, stereo_mode: 0 } },
                { name: 'Eighth Note', params: { time_left: 0.25, time_right: 0.25, feedback: 0.4, mix: 0.3, filter_freq: 5000, stereo_mode: 0, sync: 1, bpm: 120 } },
                { name: 'Ping Pong', params: { time_left: 0.25, time_right: 0.375, feedback: 0.5, mix: 0.4, filter_freq: 4000, stereo_mode: 1 } },
                { name: 'Dotted Eighth', params: { time_left: 0.375, time_right: 0.375, feedback: 0.45, mix: 0.35, filter_freq: 6000, stereo_mode: 0, sync: 1, bpm: 120 } },
                { name: 'Long Tape', params: { time_left: 0.5, time_right: 0.6, feedback: 0.65, mix: 0.5, filter_freq: 3000, filter_resonance: 2, stereo_mode: 1 } },
                { name: 'Dub Echo', params: { time_left: 0.75, time_right: 1.0, feedback: 0.7, mix: 0.6, filter_freq: 2500, filter_resonance: 3, stereo_mode: 1 } }
            ]
        };

        // Audio nodes
        this.inputLeft = null;
        this.inputRight = null;
        this.outputLeft = null;
        this.outputRight = null;
        this.delayLeft = null;
        this.delayRight = null;
        this.feedbackLeft = null;
        this.feedbackRight = null;
        this.filterLeft = null;
        this.filterRight = null;
        this.dryGainLeft = null;
        this.dryGainRight = null;
        this.wetGainLeft = null;
        this.wetGainRight = null;
        this.crossLeft = null;
        this.crossRight = null;

        // Parameters
        this.params = {
            time_left: this.metadata.parameters.time_left.default,
            time_right: this.metadata.parameters.time_right.default,
            feedback: this.metadata.parameters.feedback.default,
            mix: this.metadata.parameters.mix.default,
            filter_freq: this.metadata.parameters.filter_freq.default,
            filter_resonance: this.metadata.parameters.filter_resonance.default,
            stereo_mode: this.metadata.parameters.stereo_mode.default,
            sync: this.metadata.parameters.sync.default,
            bpm: this.metadata.parameters.bpm.default
        };
    }

    /**
     * Initialize the delay module
     */
    async init() {
        if (this.initialized) return;

        try {
            await this.createAudioGraph();
            this.initialized = true;
            console.log(`[DelayModule] Initialized: ${this.id}`);
        } catch (error) {
            console.error('[DelayModule] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create the audio processing graph
     */
    createAudioGraph() {
        // Input/output nodes
        this.inputLeft = this.audioContext.createGain();
        this.inputRight = this.audioContext.createGain();
        this.outputLeft = this.audioContext.createGain();
        this.outputRight = this.audioContext.createGain();

        // Delay lines
        const maxDelay = 2.0;
        this.delayLeft = this.audioContext.createDelay(maxDelay);
        this.delayRight = this.audioContext.createDelay(maxDelay);
        this.delayLeft.delayTime.value = this.params.time_left;
        this.delayRight.delayTime.value = this.params.time_right;

        // Feedback nodes
        this.feedbackLeft = this.audioContext.createGain();
        this.feedbackRight = this.audioContext.createGain();
        this.feedbackLeft.gain.value = this.params.feedback;
        this.feedbackRight.gain.value = this.params.feedback;

        // Filters for feedback path
        this.filterLeft = this.audioContext.createBiquadFilter();
        this.filterRight = this.audioContext.createBiquadFilter();
        this.filterLeft.type = 'lowpass';
        this.filterRight.type = 'lowpass';
        this.filterLeft.frequency.value = this.params.filter_freq;
        this.filterRight.frequency.value = this.params.filter_freq;
        this.filterLeft.Q.value = this.params.filter_resonance;
        this.filterRight.Q.value = this.params.filter_resonance;

        // Dry/wet mix nodes
        this.dryGainLeft = this.audioContext.createGain();
        this.dryGainRight = this.audioContext.createGain();
        this.wetGainLeft = this.audioContext.createGain();
        this.wetGainRight = this.audioContext.createGain();

        // Cross-feed nodes for ping-pong
        this.crossLeft = this.audioContext.createGain();
        this.crossRight = this.audioContext.createGain();
        this.crossLeft.gain.value = 0; // Initially off
        this.crossRight.gain.value = 0;

        // Routing based on stereo mode
        this.updateRouting();

        // Set initial mix
        this.updateMix();

        console.log('[DelayModule] Audio graph created');
    }

    /**
     * Update routing based on stereo mode
     */
    updateRouting() {
        if (!this.initialized) return;

        // Disconnect everything first
        try {
            this.inputLeft.disconnect();
            this.inputRight.disconnect();
            this.delayLeft.disconnect();
            this.delayRight.disconnect();
            this.feedbackLeft.disconnect();
            this.feedbackRight.disconnect();
            this.filterLeft.disconnect();
            this.filterRight.disconnect();
            this.crossLeft.disconnect();
            this.crossRight.disconnect();
        } catch (e) {
            // Some nodes may not be connected yet
        }

        const mode = Math.floor(this.params.stereo_mode);

        // Dry signal routing
        this.inputLeft.connect(this.dryGainLeft);
        this.inputRight.connect(this.dryGainRight);
        this.dryGainLeft.connect(this.outputLeft);
        this.dryGainRight.connect(this.outputRight);

        if (mode === 0) {
            // STEREO MODE: Independent left/right delays
            this.inputLeft.connect(this.delayLeft);
            this.inputRight.connect(this.delayRight);
            
            this.delayLeft.connect(this.filterLeft);
            this.delayRight.connect(this.filterRight);
            
            this.filterLeft.connect(this.feedbackLeft);
            this.filterRight.connect(this.feedbackRight);
            
            this.feedbackLeft.connect(this.delayLeft);
            this.feedbackRight.connect(this.delayRight);
            
            this.filterLeft.connect(this.wetGainLeft);
            this.filterRight.connect(this.wetGainRight);
            
            this.wetGainLeft.connect(this.outputLeft);
            this.wetGainRight.connect(this.outputRight);

            this.crossLeft.gain.value = 0;
            this.crossRight.gain.value = 0;

        } else if (mode === 1) {
            // PING-PONG MODE: Left feeds right, right feeds left
            this.inputLeft.connect(this.delayLeft);
            this.inputRight.connect(this.delayRight);
            
            this.delayLeft.connect(this.filterLeft);
            this.delayRight.connect(this.filterRight);
            
            // Feedback with cross-feed
            this.filterLeft.connect(this.feedbackLeft);
            this.filterRight.connect(this.feedbackRight);
            
            this.feedbackLeft.connect(this.crossRight);
            this.feedbackRight.connect(this.crossLeft);
            
            this.crossLeft.connect(this.delayLeft);
            this.crossRight.connect(this.delayRight);
            
            this.filterLeft.connect(this.wetGainLeft);
            this.filterRight.connect(this.wetGainRight);
            
            this.wetGainLeft.connect(this.outputLeft);
            this.wetGainRight.connect(this.outputRight);

            this.crossLeft.gain.value = this.params.feedback;
            this.crossRight.gain.value = this.params.feedback;
            this.feedbackLeft.gain.value = 0;
            this.feedbackRight.gain.value = 0;

        } else if (mode === 2) {
            // CROSS MODE: Stereo widening with cross-feedback
            this.inputLeft.connect(this.delayLeft);
            this.inputRight.connect(this.delayRight);
            
            this.delayLeft.connect(this.filterLeft);
            this.delayRight.connect(this.filterRight);
            
            // Both direct and cross feedback
            this.filterLeft.connect(this.feedbackLeft);
            this.filterRight.connect(this.feedbackRight);
            
            this.feedbackLeft.connect(this.delayLeft);
            this.feedbackRight.connect(this.delayRight);
            
            this.filterLeft.connect(this.crossRight);
            this.filterRight.connect(this.crossLeft);
            
            this.crossLeft.connect(this.delayLeft);
            this.crossRight.connect(this.delayRight);
            
            this.filterLeft.connect(this.wetGainLeft);
            this.filterRight.connect(this.wetGainRight);
            
            this.wetGainLeft.connect(this.outputLeft);
            this.wetGainRight.connect(this.outputRight);

            const crossAmount = this.params.feedback * 0.3; // Reduce cross-feed
            this.crossLeft.gain.value = crossAmount;
            this.crossRight.gain.value = crossAmount;
            this.feedbackLeft.gain.value = this.params.feedback * 0.7;
            this.feedbackRight.gain.value = this.params.feedback * 0.7;
        }

        console.log(`[DelayModule] Routing updated to mode ${mode}`);
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
     * Calculate delay time from BPM and note division
     */
    calculateSyncedTime(bpm, division = 1) {
        // division: 1 = quarter note, 0.5 = eighth, 0.75 = dotted eighth, etc.
        const quarterNote = 60 / bpm; // seconds per beat
        return quarterNote * division;
    }

    /**
     * Connect input to this module
     */
    connect(destination) {
        if (!this.outputLeft || !this.outputRight) {
            console.warn('[DelayModule] Cannot connect - not initialized');
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
            console.warn(`[DelayModule] Unknown parameter: ${paramName}`);
            return;
        }

        const paramDef = this.metadata.parameters[paramName];
        const clampedValue = Math.max(paramDef.min, Math.min(paramDef.max, value));
        this.params[paramName] = clampedValue;

        switch (paramName) {
            case 'time_left':
                this.setTimeLeft(clampedValue);
                break;
            case 'time_right':
                this.setTimeRight(clampedValue);
                break;
            case 'feedback':
                this.setFeedback(clampedValue);
                break;
            case 'mix':
                this.setMix(clampedValue);
                break;
            case 'filter_freq':
                this.setFilterFreq(clampedValue);
                break;
            case 'filter_resonance':
                this.setFilterResonance(clampedValue);
                break;
            case 'stereo_mode':
                this.setStereoMode(clampedValue);
                break;
            case 'bpm':
                this.setBPM(clampedValue);
                break;
        }
    }

    setTimeLeft(value) {
        this.params.time_left = value;
        if (this.delayLeft && this.audioContext) {
            this.delayLeft.delayTime.setValueAtTime(value, this.audioContext.currentTime);
        }
    }

    setTimeRight(value) {
        this.params.time_right = value;
        if (this.delayRight && this.audioContext) {
            this.delayRight.delayTime.setValueAtTime(value, this.audioContext.currentTime);
        }
    }

    setFeedback(value) {
        this.params.feedback = value;
        
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;

        const mode = Math.floor(this.params.stereo_mode);
        
        if (mode === 0) {
            // Stereo mode
            if (this.feedbackLeft) this.feedbackLeft.gain.setValueAtTime(value, now);
            if (this.feedbackRight) this.feedbackRight.gain.setValueAtTime(value, now);
        } else if (mode === 1) {
            // Ping-pong mode
            if (this.crossLeft) this.crossLeft.gain.setValueAtTime(value, now);
            if (this.crossRight) this.crossRight.gain.setValueAtTime(value, now);
        } else if (mode === 2) {
            // Cross mode
            const crossAmount = value * 0.3;
            if (this.feedbackLeft) this.feedbackLeft.gain.setValueAtTime(value * 0.7, now);
            if (this.feedbackRight) this.feedbackRight.gain.setValueAtTime(value * 0.7, now);
            if (this.crossLeft) this.crossLeft.gain.setValueAtTime(crossAmount, now);
            if (this.crossRight) this.crossRight.gain.setValueAtTime(crossAmount, now);
        }
    }

    setMix(value) {
        this.params.mix = value;
        this.updateMix();
    }

    setFilterFreq(value) {
        this.params.filter_freq = value;
        if (this.filterLeft && this.filterRight && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.filterLeft.frequency.setValueAtTime(value, now);
            this.filterRight.frequency.setValueAtTime(value, now);
        }
    }

    setFilterResonance(value) {
        this.params.filter_resonance = value;
        if (this.filterLeft && this.filterRight && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.filterLeft.Q.setValueAtTime(value, now);
            this.filterRight.Q.setValueAtTime(value, now);
        }
    }

    setStereoMode(value) {
        const mode = Math.floor(value);
        if (mode !== this.params.stereo_mode) {
            this.params.stereo_mode = mode;
            this.updateRouting();
        }
    }

    setBPM(value) {
        this.params.bpm = value;
        if (this.params.sync === 1) {
            // Update delay times based on BPM
            const eighthNote = this.calculateSyncedTime(value, 0.5);
            this.setTimeLeft(eighthNote);
            this.setTimeRight(eighthNote);
        }
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
            console.warn(`[DelayModule] Preset not found: ${presetName}`);
            return;
        }

        Object.entries(preset.params).forEach(([param, value]) => {
            this.setParam(param, value);
        });

        console.log(`[DelayModule] Loaded preset: ${presetName}`);
    }

    /**
     * Cleanup
     */
    destroy() {
        [this.inputLeft, this.inputRight, this.outputLeft, this.outputRight,
         this.delayLeft, this.delayRight, this.feedbackLeft, this.feedbackRight,
         this.filterLeft, this.filterRight, this.dryGainLeft, this.dryGainRight,
         this.wetGainLeft, this.wetGainRight, this.crossLeft, this.crossRight].forEach(node => {
            if (node) {
                try {
                    node.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }
        });

        this.initialized = false;
        console.log(`[DelayModule] Destroyed: ${this.id}`);
    }
}

// Register module
if (window.ModuleRegistry) {
    window.ModuleRegistry.register('delay', DelayModule);
    console.log('[DelayModule] Registered with ModuleRegistry');
}
