/**
 * HAOS Platform - Phaser Effect Module
 * Classic phase shifting effect using cascaded all-pass filters
 * 
 * @module PhaserModule
 * @extends AudioModule
 */

import { AudioModule } from '../AudioModule.js';

export class PhaserModule extends AudioModule {
    constructor(audioContext, id = null) {
        super(audioContext, id);
        
        this.metadata = {
            name: 'Phaser',
            type: 'effect',
            category: 'modulation',
            description: 'Classic phase shifting effect with LFO modulation',
            author: 'HAOS Platform',
            version: '1.0.0',
            tags: ['phaser', 'modulation', 'sweep', 'vintage'],
            inputs: ['audio_in'],
            outputs: ['audio_out'],
            parameters: {
                rate: { min: 0.01, max: 10, default: 0.5, unit: 'Hz', description: 'LFO rate' },
                depth: { min: 0, max: 1, default: 0.7, description: 'Modulation depth' },
                feedback: { min: 0, max: 0.95, default: 0.5, description: 'Feedback amount' },
                stages: { min: 2, max: 12, default: 4, step: 2, description: 'Number of all-pass stages' },
                frequency: { min: 200, max: 5000, default: 1000, unit: 'Hz', description: 'Center frequency' },
                mix: { min: 0, max: 1, default: 0.5, description: 'Dry/wet mix' }
            },
            cpuUsage: 'medium',
            presets: [
                { name: 'Subtle Sweep', params: { rate: 0.3, depth: 0.4, feedback: 0.3, stages: 4, frequency: 800, mix: 0.3 } },
                { name: 'Classic Phaser', params: { rate: 0.5, depth: 0.7, feedback: 0.5, stages: 6, frequency: 1000, mix: 0.5 } },
                { name: 'Deep Phase', params: { rate: 0.2, depth: 0.9, feedback: 0.7, stages: 8, frequency: 600, mix: 0.6 } },
                { name: 'Fast Swirl', params: { rate: 2.0, depth: 0.8, feedback: 0.6, stages: 6, frequency: 1200, mix: 0.5 } },
                { name: 'Resonant Sweep', params: { rate: 0.4, depth: 0.6, feedback: 0.85, stages: 8, frequency: 1500, mix: 0.4 } },
                { name: 'Vintage Jet', params: { rate: 0.15, depth: 1.0, feedback: 0.8, stages: 12, frequency: 1000, mix: 0.7 } }
            ]
        };

        // Audio nodes
        this.inputNode = null;
        this.outputNode = null;
        this.dryNode = null;
        this.wetNode = null;
        this.feedbackNode = null;
        this.lfo = null;
        this.lfoGain = null;
        this.allpassFilters = [];

        // Parameters
        this.params = {
            rate: this.metadata.parameters.rate.default,
            depth: this.metadata.parameters.depth.default,
            feedback: this.metadata.parameters.feedback.default,
            stages: this.metadata.parameters.stages.default,
            frequency: this.metadata.parameters.frequency.default,
            mix: this.metadata.parameters.mix.default
        };
    }

    /**
     * Initialize the phaser module
     */
    async init() {
        if (this.initialized) return;

        try {
            await this.createAudioGraph();
            this.initialized = true;
            console.log(`[PhaserModule] Initialized: ${this.id}`);
        } catch (error) {
            console.error('[PhaserModule] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create the audio processing graph
     */
    createAudioGraph() {
        // Input/output nodes
        this.inputNode = this.audioContext.createGain();
        this.outputNode = this.audioContext.createGain();
        this.dryNode = this.audioContext.createGain();
        this.wetNode = this.audioContext.createGain();
        this.feedbackNode = this.audioContext.createGain();

        // LFO for frequency modulation
        this.lfo = this.audioContext.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.value = this.params.rate;

        this.lfoGain = this.audioContext.createGain();
        this.lfoGain.gain.value = this.params.depth * this.params.frequency;

        // Create all-pass filter chain
        this.rebuildAllpassChain();

        // Connect LFO
        this.lfo.connect(this.lfoGain);

        // Routing: input -> dry path + wet path -> output
        this.inputNode.connect(this.dryNode);
        this.dryNode.connect(this.outputNode);

        // Wet path goes through all-pass chain
        if (this.allpassFilters.length > 0) {
            this.inputNode.connect(this.allpassFilters[0]);
            this.allpassFilters[this.allpassFilters.length - 1].connect(this.wetNode);
            this.wetNode.connect(this.outputNode);

            // Feedback loop
            this.allpassFilters[this.allpassFilters.length - 1].connect(this.feedbackNode);
            this.feedbackNode.connect(this.allpassFilters[0]);
        }

        // Set initial mix
        this.updateMix();

        // Start LFO
        this.lfo.start();

        console.log(`[PhaserModule] Audio graph created with ${this.allpassFilters.length} stages`);
    }

    /**
     * Rebuild the all-pass filter chain based on stages parameter
     */
    rebuildAllpassChain() {
        // Disconnect old filters
        this.allpassFilters.forEach(filter => {
            try {
                filter.disconnect();
            } catch (e) {
                // Already disconnected
            }
        });
        this.allpassFilters = [];

        // Create new all-pass filters
        const numStages = Math.floor(this.params.stages / 2) * 2; // Ensure even number
        for (let i = 0; i < numStages; i++) {
            const allpass = this.audioContext.createBiquadFilter();
            allpass.type = 'allpass';
            allpass.frequency.value = this.params.frequency;
            allpass.Q.value = 1.0;
            this.allpassFilters.push(allpass);

            // Connect LFO to modulate frequency
            if (this.lfoGain) {
                this.lfoGain.connect(allpass.frequency);
            }
        }

        // Chain the filters together
        for (let i = 0; i < this.allpassFilters.length - 1; i++) {
            this.allpassFilters[i].connect(this.allpassFilters[i + 1]);
        }

        console.log(`[PhaserModule] Rebuilt ${this.allpassFilters.length} all-pass stages`);
    }

    /**
     * Update dry/wet mix
     */
    updateMix() {
        if (!this.dryNode || !this.wetNode || !this.audioContext) return;

        const mix = this.params.mix;
        const now = this.audioContext.currentTime;
        
        // Equal power crossfade
        const dryGain = Math.cos(mix * Math.PI / 2);
        const wetGain = Math.sin(mix * Math.PI / 2);

        this.dryNode.gain.setValueAtTime(dryGain, now);
        this.wetNode.gain.setValueAtTime(wetGain, now);
    }

    /**
     * Connect input to this module
     */
    connect(destination) {
        if (!this.outputNode) {
            console.warn('[PhaserModule] Cannot connect - not initialized');
            return;
        }

        if (destination.inputNode) {
            this.outputNode.connect(destination.inputNode);
        } else {
            this.outputNode.connect(destination);
        }
    }

    /**
     * Disconnect output from destination
     */
    disconnect(destination = null) {
        if (!this.outputNode) return;

        if (destination) {
            if (destination.inputNode) {
                this.outputNode.disconnect(destination.inputNode);
            } else {
                this.outputNode.disconnect(destination);
            }
        } else {
            this.outputNode.disconnect();
        }
    }

    /**
     * Get input node for external connections
     */
    getInput() {
        return this.inputNode;
    }

    /**
     * Get output node for external connections
     */
    getOutput() {
        return this.outputNode;
    }

    /**
     * Set parameter value
     */
    setParam(paramName, value) {
        if (!this.metadata.parameters[paramName]) {
            console.warn(`[PhaserModule] Unknown parameter: ${paramName}`);
            return;
        }

        const paramDef = this.metadata.parameters[paramName];
        const clampedValue = Math.max(paramDef.min, Math.min(paramDef.max, value));
        this.params[paramName] = clampedValue;

        // Apply parameter changes
        switch (paramName) {
            case 'rate':
                this.setRate(clampedValue);
                break;
            case 'depth':
                this.setDepth(clampedValue);
                break;
            case 'feedback':
                this.setFeedback(clampedValue);
                break;
            case 'stages':
                this.setStages(clampedValue);
                break;
            case 'frequency':
                this.setFrequency(clampedValue);
                break;
            case 'mix':
                this.setMix(clampedValue);
                break;
        }
    }

    /**
     * Set LFO rate
     */
    setRate(value) {
        const clampedValue = Math.max(0.01, Math.min(10, value));
        this.params.rate = clampedValue;

        if (this.lfo && this.audioContext) {
            this.lfo.frequency.setValueAtTime(clampedValue, this.audioContext.currentTime);
        }
    }

    /**
     * Set modulation depth
     */
    setDepth(value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        this.params.depth = clampedValue;

        if (this.lfoGain && this.audioContext) {
            const modulationAmount = clampedValue * this.params.frequency;
            this.lfoGain.gain.setValueAtTime(modulationAmount, this.audioContext.currentTime);
        }
    }

    /**
     * Set feedback amount
     */
    setFeedback(value) {
        const clampedValue = Math.max(0, Math.min(0.95, value));
        this.params.feedback = clampedValue;

        if (this.feedbackNode && this.audioContext) {
            this.feedbackNode.gain.setValueAtTime(clampedValue, this.audioContext.currentTime);
        }
    }

    /**
     * Set number of all-pass stages
     */
    setStages(value) {
        const clampedValue = Math.max(2, Math.min(12, Math.floor(value / 2) * 2)); // Even numbers only
        
        if (clampedValue !== this.params.stages) {
            this.params.stages = clampedValue;
            
            if (this.initialized) {
                // Rebuild the all-pass chain
                this.rebuildAllpassChain();
                
                // Reconnect the audio graph
                if (this.allpassFilters.length > 0) {
                    this.inputNode.connect(this.allpassFilters[0]);
                    this.allpassFilters[this.allpassFilters.length - 1].connect(this.wetNode);
                    this.allpassFilters[this.allpassFilters.length - 1].connect(this.feedbackNode);
                    this.feedbackNode.connect(this.allpassFilters[0]);
                }
            }
        }
    }

    /**
     * Set center frequency
     */
    setFrequency(value) {
        const clampedValue = Math.max(200, Math.min(5000, value));
        this.params.frequency = clampedValue;

        if (this.allpassFilters && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.allpassFilters.forEach(filter => {
                filter.frequency.setValueAtTime(clampedValue, now);
            });

            // Update LFO gain for depth scaling
            if (this.lfoGain) {
                const modulationAmount = this.params.depth * clampedValue;
                this.lfoGain.gain.setValueAtTime(modulationAmount, now);
            }
        }
    }

    /**
     * Set dry/wet mix
     */
    setMix(value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        this.params.mix = clampedValue;
        this.updateMix();
    }

    /**
     * Get all parameters
     */
    getParams() {
        return { ...this.params };
    }

    /**
     * Load preset by name
     */
    loadPreset(presetName) {
        const preset = this.metadata.presets.find(p => p.name === presetName);
        if (!preset) {
            console.warn(`[PhaserModule] Preset not found: ${presetName}`);
            return;
        }

        Object.entries(preset.params).forEach(([param, value]) => {
            this.setParam(param, value);
        });

        console.log(`[PhaserModule] Loaded preset: ${presetName}`);
    }

    /**
     * Cleanup and disconnect
     */
    destroy() {
        if (this.lfo) {
            try {
                this.lfo.stop();
            } catch (e) {
                // Already stopped
            }
        }

        this.allpassFilters.forEach(filter => {
            try {
                filter.disconnect();
            } catch (e) {
                // Already disconnected
            }
        });

        [this.inputNode, this.outputNode, this.dryNode, this.wetNode, 
         this.feedbackNode, this.lfo, this.lfoGain].forEach(node => {
            if (node) {
                try {
                    node.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }
        });

        this.initialized = false;
        console.log(`[PhaserModule] Destroyed: ${this.id}`);
    }
}

// Register module
if (window.ModuleRegistry) {
    window.ModuleRegistry.register('phaser', PhaserModule);
    console.log('[PhaserModule] Registered with ModuleRegistry');
}
