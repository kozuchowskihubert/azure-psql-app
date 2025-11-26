/**
 * Sequencer Engine Module
 * 
 * Professional 16-step sequencer with pattern storage, BPM sync, and module triggering.
 * 
 * Features:
 * - 16-step grid sequencer
 * - Multiple instrument tracks
 * - Pattern storage and presets
 * - BPM synchronization
 * - Swing/shuffle support
 * - Pattern chaining
 * - Transport controls (play, stop, pause)
 * - Step callbacks for visualization
 * 
 * @module Sequencer
 * @version 2.6.0
 */

class Sequencer {
    constructor(audioEngine, options = {}) {
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error('Sequencer requires CoreAudioEngine instance');
        }

        this.engine = audioEngine;
        this.ctx = audioEngine.audioContext;

        // Sequencer parameters
        this.bpm = options.bpm || 120;
        this.steps = options.steps || 16;
        this.swing = options.swing || 0; // 0-1 (0 = straight, 1 = max swing)

        // Pattern storage (instrument name -> array of step indices)
        this.pattern = {};
        
        // Velocity patterns (instrument name -> array of velocities 0-1)
        this.velocities = {};

        // Module routing (instrument name -> trigger function)
        this.modules = new Map();

        // Playback state
        this.isPlaying = false;
        this.currentStep = 0;
        this.nextStepTime = 0;
        this.schedulerInterval = null;
        this.lookahead = 25.0; // How far ahead to schedule (ms)
        this.scheduleAheadTime = 0.1; // How far ahead to schedule (seconds)

        // Callbacks
        this.onStepCallback = options.onStep || null;
        this.onPatternEndCallback = options.onPatternEnd || null;

        // Pattern chain
        this.chain = [];
        this.chainIndex = 0;
        this.loopPattern = options.loop !== false; // Default true
    }

    /**
     * Register a module for triggering
     * @param {string} instrumentName - Name of the instrument track
     * @param {function} triggerFn - Function to call on trigger (velocity, time)
     */
    registerModule(instrumentName, triggerFn) {
        this.modules.set(instrumentName, triggerFn);
        
        // Initialize pattern arrays if not exists
        if (!this.pattern[instrumentName]) {
            this.pattern[instrumentName] = [];
        }
        if (!this.velocities[instrumentName]) {
            this.velocities[instrumentName] = Array(this.steps).fill(0);
        }
        
        return this;
    }

    /**
     * Set pattern for an instrument
     * @param {string} instrumentName - Instrument track name
     * @param {array} pattern - Array of step indices (0-15) or velocities
     * @param {boolean} asVelocities - If true, pattern is array of velocities 0-1
     */
    setPattern(instrumentName, pattern, asVelocities = false) {
        if (asVelocities) {
            // Pattern is array of velocities [0, 0.8, 0, 1, ...]
            this.velocities[instrumentName] = [...pattern];
            this.pattern[instrumentName] = pattern.map((v, i) => v > 0 ? i : null).filter(i => i !== null);
        } else {
            // Pattern is array of active step indices [0, 4, 8, 12]
            this.pattern[instrumentName] = [...pattern];
            
            // Set default velocities
            if (!this.velocities[instrumentName]) {
                this.velocities[instrumentName] = Array(this.steps).fill(0);
            }
            pattern.forEach(step => {
                this.velocities[instrumentName][step] = 1.0;
            });
        }
    }

    /**
     * Set velocity for a specific step
     * @param {string} instrumentName - Instrument track
     * @param {number} step - Step index (0-15)
     * @param {number} velocity - Velocity 0-1
     */
    setStepVelocity(instrumentName, step, velocity) {
        if (!this.velocities[instrumentName]) {
            this.velocities[instrumentName] = Array(this.steps).fill(0);
        }
        this.velocities[instrumentName][step] = velocity;
        
        // Update pattern array
        if (velocity > 0 && !this.pattern[instrumentName].includes(step)) {
            this.pattern[instrumentName].push(step);
        } else if (velocity === 0) {
            const index = this.pattern[instrumentName].indexOf(step);
            if (index > -1) {
                this.pattern[instrumentName].splice(index, 1);
            }
        }
    }

    /**
     * Toggle step on/off
     * @param {string} instrumentName - Instrument track
     * @param {number} step - Step index (0-15)
     * @param {number} velocity - Velocity if turning on (default 1.0)
     */
    toggleStep(instrumentName, step, velocity = 1.0) {
        const currentVelocity = this.velocities[instrumentName]?.[step] || 0;
        this.setStepVelocity(instrumentName, step, currentVelocity > 0 ? 0 : velocity);
    }

    /**
     * Clear pattern for instrument
     * @param {string} instrumentName - Instrument to clear
     */
    clearPattern(instrumentName) {
        if (instrumentName) {
            this.pattern[instrumentName] = [];
            this.velocities[instrumentName] = Array(this.steps).fill(0);
        } else {
            // Clear all
            Object.keys(this.pattern).forEach(inst => {
                this.pattern[inst] = [];
                this.velocities[inst] = Array(this.steps).fill(0);
            });
        }
    }

    /**
     * Start sequencer
     */
    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextStepTime = this.ctx.currentTime;

        // Start scheduler
        this.schedulerInterval = setInterval(() => {
            this._schedule();
        }, this.lookahead);

        console.log('▶️ Sequencer started');
    }

    /**
     * Stop sequencer
     */
    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.currentStep = 0;

        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }

        console.log('⏹️ Sequencer stopped');
    }

    /**
     * Pause sequencer
     */
    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.schedulerInterval = null;
        }

        console.log('⏸️ Sequencer paused');
    }

    /**
     * Resume sequencer
     */
    resume() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.nextStepTime = this.ctx.currentTime;

        this.schedulerInterval = setInterval(() => {
            this._schedule();
        }, this.lookahead);

        console.log('▶️ Sequencer resumed');
    }

    /**
     * Internal scheduler (called by interval)
     * @private
     */
    _schedule() {
        while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this._scheduleStep(this.currentStep, this.nextStepTime);
            this._nextStep();
        }
    }

    /**
     * Schedule a single step
     * @private
     */
    _scheduleStep(step, time) {
        // Trigger all instruments for this step
        this.modules.forEach((triggerFn, instrumentName) => {
            const velocity = this.velocities[instrumentName]?.[step] || 0;
            if (velocity > 0) {
                triggerFn(velocity, time);
            }
        });

        // Call step callback
        if (this.onStepCallback) {
            this.onStepCallback(step, time);
        }
    }

    /**
     * Advance to next step
     * @private
     */
    _nextStep() {
        // Calculate next step time
        const secondsPerBeat = 60.0 / this.bpm;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes

        // Apply swing to odd steps
        let stepDuration = secondsPerStep;
        if (this.swing > 0 && this.currentStep % 2 === 1) {
            stepDuration *= (1 + this.swing * 0.5); // Max 50% longer
        }

        this.nextStepTime += stepDuration;
        this.currentStep++;

        // Loop back to start
        if (this.currentStep >= this.steps) {
            this.currentStep = 0;

            // Call pattern end callback
            if (this.onPatternEndCallback) {
                this.onPatternEndCallback();
            }

            // Handle pattern chain
            if (this.chain.length > 0) {
                this.chainIndex = (this.chainIndex + 1) % this.chain.length;
                this.loadPatternFromChain(this.chainIndex);
            }

            // Stop if not looping
            if (!this.loopPattern && this.chain.length === 0) {
                this.stop();
            }
        }
    }

    /**
     * Set BPM
     * @param {number} bpm - Beats per minute (40-300)
     */
    setBPM(bpm) {
        this.bpm = Math.max(40, Math.min(300, bpm));
    }

    /**
     * Set swing amount
     * @param {number} swing - Swing amount 0-1
     */
    setSwing(swing) {
        this.swing = Math.max(0, Math.min(1, swing));
    }

    /**
     * Load preset pattern
     * @param {string} presetName - Preset identifier
     */
    loadPreset(presetName) {
        const presets = {
            // Trap basic
            trapBasic: {
                Kick:   [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                Snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                HiHat:  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                Clap:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                Ride:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                Crash:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            // Trap rolling
            trapRolling: {
                Kick:   [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.6, 0],
                Snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                HiHat:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.6],
                Clap:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                Ride:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                Crash:  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            // Four-on-the-floor techno
            technoBasic: {
                Kick:   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                Snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                HiHat:  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                Clap:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                Ride:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                Crash:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            // Minimal techno
            technoMinimal: {
                Kick:   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                Snare:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                HiHat:  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                Perc:   [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
                Ride:   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                Crash:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            // Hard techno
            technoHard: {
                Kick:   [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
                Snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                HiHat:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                Clap:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                Ride:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                Crash:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            }
        };

        const preset = presets[presetName];
        if (preset) {
            Object.keys(preset).forEach(instrumentName => {
                this.setPattern(instrumentName, preset[instrumentName], true);
            });
            console.log(`🎹 Pattern loaded: ${presetName}`);
            return preset;
        } else {
            console.warn(`Preset '${presetName}' not found`);
            return null;
        }
    }

    /**
     * Add pattern to chain
     * @param {object} pattern - Pattern object
     */
    addToChain(pattern) {
        this.chain.push(pattern);
    }

    /**
     * Load pattern from chain
     * @param {number} index - Chain index
     */
    loadPatternFromChain(index) {
        if (index < 0 || index >= this.chain.length) return;

        const pattern = this.chain[index];
        Object.keys(pattern).forEach(instrumentName => {
            this.setPattern(instrumentName, pattern[instrumentName], true);
        });
    }

    /**
     * Clear chain
     */
    clearChain() {
        this.chain = [];
        this.chainIndex = 0;
    }

    /**
     * Get current pattern
     */
    getPattern() {
        return {
            pattern: { ...this.pattern },
            velocities: { ...this.velocities }
        };
    }

    /**
     * Get sequencer status
     */
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentStep: this.currentStep,
            bpm: this.bpm,
            swing: this.swing,
            steps: this.steps,
            instruments: Array.from(this.modules.keys()),
            patternLength: Object.keys(this.pattern).length,
            chainLength: this.chain.length
        };
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.stop();
        this.modules.clear();
        this.pattern = {};
        this.velocities = {};
        this.chain = [];
        console.log('🔴 Sequencer disposed');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sequencer;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.Sequencer = Sequencer;
}
