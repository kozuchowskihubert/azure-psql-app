/**
 * HAOS.fm Macro System
 * One-knob multi-parameter control system
 * 
 * Features:
 * - Define macros that control multiple parameters
 * - Custom scaling and curves per parameter
 * - Preset macro mappings
 * - Real-time macro morphing
 */

class MacroSystem {
    constructor(liveParams) {
        this.liveParams = liveParams;
        this.macros = new Map();
        this.macroValues = new Map();
        
        // Initialize default macros
        this.initDefaultMacros();
    }

    /**
     * Register a macro control
     * @param {string} macroId - Unique macro identifier
     * @param {string} label - Display label
     * @param {Array} mappings - Array of parameter mappings
     */
    registerMacro(macroId, label, mappings) {
        this.macros.set(macroId, {
            id: macroId,
            label,
            mappings, // [{param, min, max, curve}]
            value: 0.5
        });
        
        this.macroValues.set(macroId, 0.5);
    }

    /**
     * Set macro value and update all mapped parameters
     * @param {string} macroId - Macro ID
     * @param {number} value - Macro value (0-1)
     * @param {number} duration - Morph duration in ms
     */
    setMacro(macroId, value, duration = 0) {
        const macro = this.macros.get(macroId);
        if (!macro) return;

        value = Math.max(0, Math.min(1, value));
        this.macroValues.set(macroId, value);
        macro.value = value;

        // Calculate parameter values based on mappings
        const paramUpdates = {};
        
        macro.mappings.forEach(mapping => {
            let scaledValue;
            
            // Apply curve
            switch (mapping.curve || 'linear') {
                case 'exponential':
                    scaledValue = Math.pow(value, 2);
                    break;
                case 'logarithmic':
                    scaledValue = Math.sqrt(value);
                    break;
                case 'sine':
                    scaledValue = Math.sin(value * Math.PI / 2);
                    break;
                case 'linear':
                default:
                    scaledValue = value;
            }

            // Map to parameter range
            const paramValue = mapping.min + (mapping.max - mapping.min) * scaledValue;
            paramUpdates[mapping.param] = paramValue;
        });

        // Apply updates
        if (duration === 0) {
            Object.entries(paramUpdates).forEach(([param, val]) => {
                this.liveParams.setValue(param, val, true);
            });
        } else {
            this.liveParams.morphMultiple(paramUpdates, duration);
        }

        // Dispatch event
        this.dispatchMacroEvent(macroId, value);
    }

    /**
     * Get current macro value
     */
    getMacro(macroId) {
        return this.macroValues.get(macroId) || 0;
    }

    /**
     * Morph macro value
     */
    morphMacro(macroId, targetValue, duration = 1000, easing = 'easeInOut') {
        const startValue = this.getMacro(macroId);
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing
            let easedProgress;
            switch (easing) {
                case 'easeIn':
                    easedProgress = progress * progress;
                    break;
                case 'easeOut':
                    easedProgress = progress * (2 - progress);
                    break;
                case 'easeInOut':
                default:
                    easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                    break;
            }

            const currentValue = startValue + (targetValue - startValue) * easedProgress;
            this.setMacro(macroId, currentValue, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Initialize default macro mappings
     */
    initDefaultMacros() {
        // TB-303 Intensity Macro
        this.registerMacro('tb303-intensity', 'TB-303 INTENSITY', [
            { param: 'tb303-cutoff', min: 0.2, max: 1.0, curve: 'exponential' },
            { param: 'tb303-resonance', min: 0.3, max: 0.9, curve: 'linear' },
            { param: 'tb303-envmod', min: 0.1, max: 0.8, curve: 'linear' },
            { param: 'tb303-distortion', min: 0.0, max: 0.6, curve: 'exponential' }
        ]);

        // TB-303 Darkness Macro (inverse of brightness)
        this.registerMacro('tb303-darkness', 'TB-303 DARKNESS', [
            { param: 'tb303-cutoff', min: 1.0, max: 0.1, curve: 'exponential' },
            { param: 'tb303-resonance', min: 0.2, max: 0.7, curve: 'linear' },
            { param: 'tb303-decay', min: 0.2, max: 0.8, curve: 'linear' }
        ]);

        // TB-303 Aggression Macro
        this.registerMacro('tb303-aggression', 'TB-303 AGGRESSION', [
            { param: 'tb303-resonance', min: 0.4, max: 0.95, curve: 'linear' },
            { param: 'tb303-envmod', min: 0.3, max: 0.9, curve: 'linear' },
            { param: 'tb303-accent', min: 0.2, max: 1.0, curve: 'linear' },
            { param: 'tb303-distortion', min: 0.0, max: 0.8, curve: 'exponential' }
        ]);

        // TR-909 Punch Macro
        this.registerMacro('tr909-punch', 'TR-909 PUNCH', [
            { param: 'tr909-kick-punch', min: 0.3, max: 1.0, curve: 'linear' },
            { param: 'tr909-snare-snap', min: 0.4, max: 1.0, curve: 'linear' }
        ]);

        // TR-909 Tightness Macro
        this.registerMacro('tr909-tightness', 'TR-909 TIGHTNESS', [
            { param: 'tr909-hat-decay', min: 0.8, max: 0.2, curve: 'exponential' }
        ]);

        // Global Energy Macro
        this.registerMacro('global-energy', 'GLOBAL ENERGY', [
            { param: 'tb303-cutoff', min: 0.3, max: 0.9, curve: 'exponential' },
            { param: 'tb303-resonance', min: 0.4, max: 0.8, curve: 'linear' },
            { param: 'tb303-envmod', min: 0.3, max: 0.7, curve: 'linear' },
            { param: 'tr909-kick-punch', min: 0.5, max: 1.0, curve: 'linear' },
            { param: 'tr909-snare-snap', min: 0.4, max: 0.9, curve: 'linear' }
        ]);

        // Global Darkness Macro
        this.registerMacro('global-darkness', 'GLOBAL DARKNESS', [
            { param: 'tb303-cutoff', min: 0.8, max: 0.2, curve: 'exponential' },
            { param: 'tb303-decay', min: 0.2, max: 0.7, curve: 'linear' },
            { param: 'tr909-hat-decay', min: 0.3, max: 0.8, curve: 'linear' }
        ]);
    }

    /**
     * Get all macro definitions
     */
    getMacros() {
        return Array.from(this.macros.values());
    }

    /**
     * Get macro definition
     */
    getMacroDefinition(macroId) {
        return this.macros.get(macroId);
    }

    /**
     * Randomize macro value
     */
    randomizeMacro(macroId, amount = 1.0, duration = 500) {
        const current = this.getMacro(macroId);
        const randomValue = Math.max(0, Math.min(1, current + (Math.random() - 0.5) * amount));
        this.morphMacro(macroId, randomValue, duration);
    }

    /**
     * Randomize all macros
     */
    randomizeAll(amount = 0.5, duration = 500) {
        this.macros.forEach((macro, macroId) => {
            this.randomizeMacro(macroId, amount, duration);
        });
    }

    /**
     * Reset macro to center (0.5)
     */
    resetMacro(macroId, duration = 500) {
        this.morphMacro(macroId, 0.5, duration);
    }

    /**
     * Reset all macros
     */
    resetAll(duration = 500) {
        this.macros.forEach((macro, macroId) => {
            this.resetMacro(macroId, duration);
        });
    }

    /**
     * Snapshot macro states
     */
    snapshot() {
        const state = {};
        this.macroValues.forEach((value, macroId) => {
            state[macroId] = value;
        });
        return state;
    }

    /**
     * Restore macro states
     */
    restore(state, duration = 0) {
        Object.entries(state).forEach(([macroId, value]) => {
            if (duration === 0) {
                this.setMacro(macroId, value, 0);
            } else {
                this.morphMacro(macroId, value, duration);
            }
        });
    }

    /**
     * Dispatch custom event
     */
    dispatchMacroEvent(macroId, value) {
        const event = new CustomEvent('macroChanged', {
            detail: {
                macroId,
                value,
                macro: this.macros.get(macroId)
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Create custom macro mapping
     */
    createMacro(macroId, label, mappings) {
        this.registerMacro(macroId, label, mappings);
        console.log(`Created custom macro: ${label}`, mappings);
    }

    /**
     * Delete macro
     */
    deleteMacro(macroId) {
        this.macros.delete(macroId);
        this.macroValues.delete(macroId);
    }

    /**
     * Link macro to MIDI CC
     */
    linkToMIDI(macroId, ccNumber) {
        // Store MIDI mapping
        const macro = this.macros.get(macroId);
        if (macro) {
            macro.midiCC = ccNumber;
            console.log(`Macro "${macro.label}" linked to MIDI CC ${ccNumber}`);
        }
    }

    /**
     * Handle MIDI CC input
     */
    handleMIDICC(ccNumber, value) {
        // Find macro linked to this CC
        this.macros.forEach((macro, macroId) => {
            if (macro.midiCC === ccNumber) {
                // Convert MIDI value (0-127) to macro value (0-1)
                const macroValue = value / 127;
                this.setMacro(macroId, macroValue, 0);
            }
        });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MacroSystem;
}
