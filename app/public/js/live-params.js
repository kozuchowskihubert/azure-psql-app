/**
 * HAOS.fm Live Parameters
 * Real-time parameter morphing and automation system
 *
 * Features:
 * - Smooth parameter transitions
 * - Multi-parameter morphing
 * - Automation recording/playback
 * - Parameter linking and scaling
 */

class LiveParams {
    constructor() {
        this.parameters = new Map();
        this.morphing = new Map();
        this.automations = new Map();
        this.animationFrame = null;
        this.lastUpdate = performance.now();
    }

    /**
     * Register a parameter for live control
     * @param {string} id - Unique parameter identifier
     * @param {object} config - Parameter configuration
     */
    register(id, config) {
        this.parameters.set(id, {
            value: config.value || 0,
            min: config.min || 0,
            max: config.max || 1,
            curve: config.curve || 'linear', // linear, exponential, logarithmic
            onChange: config.onChange || (() => {}),
            label: config.label || id,
            unit: config.unit || '',
            step: config.step || 0.01,
        });
    }

    /**
     * Get current parameter value
     */
    getValue(id) {
        const param = this.parameters.get(id);
        return param ? param.value : null;
    }

    /**
     * Set parameter value immediately
     */
    setValue(id, value, notify = true) {
        const param = this.parameters.get(id);
        if (!param) return;

        // Clamp value
        value = Math.max(param.min, Math.min(param.max, value));
        param.value = value;

        if (notify) {
            param.onChange(value);
        }
    }

    /**
     * Morph parameter from current to target value over duration
     * @param {string} id - Parameter ID
     * @param {number} target - Target value
     * @param {number} duration - Duration in milliseconds
     * @param {string} easing - Easing function (linear, easeIn, easeOut, easeInOut)
     */
    morph(id, target, duration = 1000, easing = 'easeInOut') {
        const param = this.parameters.get(id);
        if (!param) return;

        const start = param.value;
        const startTime = performance.now();

        this.morphing.set(id, {
            start,
            target,
            startTime,
            duration,
            easing,
        });

        // Start animation loop if not running
        if (!this.animationFrame) {
            this.animate();
        }
    }

    /**
     * Morph multiple parameters simultaneously
     * @param {object} targets - Object mapping parameter IDs to target values
     * @param {number} duration - Duration in milliseconds
     */
    morphMultiple(targets, duration = 1000, easing = 'easeInOut') {
        Object.entries(targets).forEach(([id, target]) => {
            this.morph(id, target, duration, easing);
        });
    }

    /**
     * Animation loop for smooth morphing
     */
    animate() {
        const now = performance.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;

        let activeMorphs = 0;

        this.morphing.forEach((morph, id) => {
            const elapsed = now - morph.startTime;
            const progress = Math.min(elapsed / morph.duration, 1);

            // Apply easing
            const easedProgress = this.applyEasing(progress, morph.easing);

            // Calculate morphed value
            const value = morph.start + (morph.target - morph.start) * easedProgress;

            // Update parameter
            this.setValue(id, value, true);

            // Remove completed morphs
            if (progress >= 1) {
                this.morphing.delete(id);
            } else {
                activeMorphs++;
            }
        });

        // Continue animation if morphs are active
        if (activeMorphs > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.animationFrame = null;
        }
    }

    /**
     * Apply easing function to progress
     */
    applyEasing(t, easing) {
        switch (easing) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return t * (2 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            case 'exponential':
                return t === 0 ? 0 : 2 ** (10 * (t - 1));
            case 'bounce':
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            default:
                return t;
        }
    }

    /**
     * Record automation for a parameter
     */
    startRecording(id) {
        this.automations.set(id, {
            points: [],
            startTime: performance.now(),
            recording: true,
        });
    }

    /**
     * Stop recording automation
     */
    stopRecording(id) {
        const auto = this.automations.get(id);
        if (auto) {
            auto.recording = false;
        }
    }

    /**
     * Record automation point
     */
    recordPoint(id) {
        const auto = this.automations.get(id);
        const param = this.parameters.get(id);

        if (auto && auto.recording && param) {
            const time = performance.now() - auto.startTime;
            auto.points.push({ time, value: param.value });
        }
    }

    /**
     * Playback recorded automation
     */
    playbackAutomation(id, loop = false) {
        const auto = this.automations.get(id);
        if (!auto || auto.points.length === 0) return;

        const startTime = performance.now();
        const duration = auto.points[auto.points.length - 1].time;

        const playback = () => {
            const elapsed = performance.now() - startTime;
            const time = loop ? elapsed % duration : Math.min(elapsed, duration);

            // Find interpolation points
            let prev = auto.points[0];
            let next = auto.points[auto.points.length - 1];

            for (let i = 0; i < auto.points.length - 1; i++) {
                if (auto.points[i].time <= time && auto.points[i + 1].time >= time) {
                    prev = auto.points[i];
                    next = auto.points[i + 1];
                    break;
                }
            }

            // Interpolate value
            const segmentProgress = (time - prev.time) / (next.time - prev.time);
            const value = prev.value + (next.value - prev.value) * segmentProgress;

            this.setValue(id, value, true);

            // Continue playback
            if (loop || elapsed < duration) {
                requestAnimationFrame(playback);
            }
        };

        playback();
    }

    /**
     * Link two parameters with optional scaling
     */
    link(sourceId, targetId, scale = 1, offset = 0) {
        const source = this.parameters.get(sourceId);
        if (!source) return;

        const originalOnChange = source.onChange;
        source.onChange = (value) => {
            originalOnChange(value);
            const scaledValue = value * scale + offset;
            this.setValue(targetId, scaledValue, true);
        };
    }

    /**
     * Randomize parameter value within range
     */
    randomize(id, amount = 1.0) {
        const param = this.parameters.get(id);
        if (!param) return;

        const range = param.max - param.min;
        const center = param.value;
        const maxDeviation = range * amount * 0.5;

        const randomValue = center + (Math.random() - 0.5) * 2 * maxDeviation;
        this.setValue(id, randomValue, true);
    }

    /**
     * Randomize multiple parameters
     */
    randomizeMultiple(ids, amount = 1.0, duration = 500) {
        ids.forEach(id => {
            const param = this.parameters.get(id);
            if (!param) return;

            const range = param.max - param.min;
            const randomValue = param.min + Math.random() * range * amount;
            this.morph(id, randomValue, duration);
        });
    }

    /**
     * Snapshot current parameter state
     */
    snapshot() {
        const state = {};
        this.parameters.forEach((param, id) => {
            state[id] = param.value;
        });
        return state;
    }

    /**
     * Restore parameter state
     */
    restore(state, duration = 0) {
        if (duration === 0) {
            Object.entries(state).forEach(([id, value]) => {
                this.setValue(id, value, true);
            });
        } else {
            this.morphMultiple(state, duration);
        }
    }

    /**
     * Clear all morphing and automation
     */
    clear() {
        this.morphing.clear();
        this.animationFrame = null;
    }

    /**
     * Reset parameter to default value
     */
    reset(id, duration = 500) {
        const param = this.parameters.get(id);
        if (!param) return;

        const defaultValue = (param.min + param.max) / 2;
        this.morph(id, defaultValue, duration);
    }

    /**
     * Reset all parameters
     */
    resetAll(duration = 500) {
        this.parameters.forEach((param, id) => {
            this.reset(id, duration);
        });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveParams;
}
