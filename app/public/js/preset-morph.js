/**
 * HAOS.fm Preset Morphing
 * A/B preset crossfading and morphing system
 * 
 * Features:
 * - A/B preset slots
 * - Smooth crossfading between presets
 * - Visual mixer UI
 * - Preset interpolation
 * - Save/load preset banks
 */

class PresetMorph {
    constructor(liveParams) {
        this.liveParams = liveParams;
        this.presetA = null;
        this.presetB = null;
        this.morphPosition = 0; // 0 = full A, 1 = full B
        this.presetBank = new Map();
        this.currentBank = 'default';
        
        // Initialize with empty presets
        this.initializePresets();
    }

    /**
     * Initialize empty A/B presets
     */
    initializePresets() {
        this.presetA = {
            name: 'Preset A',
            parameters: {},
            timestamp: Date.now()
        };
        this.presetB = {
            name: 'Preset B',
            parameters: {},
            timestamp: Date.now()
        };
    }

    /**
     * Capture current parameter state to preset A
     */
    captureA(name = 'Preset A') {
        this.presetA = {
            name,
            parameters: this.liveParams.snapshot(),
            timestamp: Date.now()
        };
        console.log(`Captured Preset A: ${name}`, this.presetA);
    }

    /**
     * Capture current parameter state to preset B
     */
    captureB(name = 'Preset B') {
        this.presetB = {
            name,
            parameters: this.liveParams.snapshot(),
            timestamp: Date.now()
        };
        console.log(`Captured Preset B: ${name}`, this.presetB);
    }

    /**
     * Recall preset A
     */
    recallA(duration = 500) {
        if (!this.presetA || Object.keys(this.presetA.parameters).length === 0) {
            console.warn('Preset A is empty');
            return;
        }
        this.liveParams.restore(this.presetA.parameters, duration);
        this.morphPosition = 0;
        this.updateMorphUI();
    }

    /**
     * Recall preset B
     */
    recallB(duration = 500) {
        if (!this.presetB || Object.keys(this.presetB.parameters).length === 0) {
            console.warn('Preset B is empty');
            return;
        }
        this.liveParams.restore(this.presetB.parameters, duration);
        this.morphPosition = 1;
        this.updateMorphUI();
    }

    /**
     * Set morph position (0 = A, 1 = B)
     */
    setMorphPosition(position, duration = 0) {
        if (!this.presetA || !this.presetB) {
            console.warn('Both presets must be set before morphing');
            return;
        }

        this.morphPosition = Math.max(0, Math.min(1, position));

        // Calculate interpolated values
        const morphedState = {};
        const allParams = new Set([
            ...Object.keys(this.presetA.parameters),
            ...Object.keys(this.presetB.parameters)
        ]);

        allParams.forEach(paramId => {
            const valueA = this.presetA.parameters[paramId] || 0;
            const valueB = this.presetB.parameters[paramId] || 0;
            
            // Linear interpolation
            morphedState[paramId] = valueA + (valueB - valueA) * this.morphPosition;
        });

        // Apply morphed state
        if (duration === 0) {
            this.liveParams.restore(morphedState, 0);
        } else {
            this.liveParams.morphMultiple(morphedState, duration);
        }

        this.updateMorphUI();
    }

    /**
     * Morph to position with easing curve
     */
    morphTo(position, duration = 1000, easing = 'easeInOut') {
        const start = this.morphPosition;
        const target = Math.max(0, Math.min(1, position));
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Apply easing (reuse from LiveParams)
            let easedProgress;
            switch (easing) {
                case 'linear':
                    easedProgress = progress;
                    break;
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

            const currentPosition = start + (target - start) * easedProgress;
            this.setMorphPosition(currentPosition, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Crossfade from A to B
     */
    crossfadeToB(duration = 2000, easing = 'easeInOut') {
        this.morphTo(1, duration, easing);
    }

    /**
     * Crossfade from B to A
     */
    crossfadeToA(duration = 2000, easing = 'easeInOut') {
        this.morphTo(0, duration, easing);
    }

    /**
     * Crossfade to center (50/50 mix)
     */
    crossfadeToCenter(duration = 1000, easing = 'easeInOut') {
        this.morphTo(0.5, duration, easing);
    }

    /**
     * Save preset to bank
     */
    saveToBank(slot, preset = null) {
        if (!this.presetBank.has(this.currentBank)) {
            this.presetBank.set(this.currentBank, new Map());
        }

        const bank = this.presetBank.get(this.currentBank);
        const presetToSave = preset || {
            name: `Preset ${slot}`,
            parameters: this.liveParams.snapshot(),
            timestamp: Date.now()
        };

        bank.set(slot, presetToSave);
        console.log(`Saved preset to bank '${this.currentBank}', slot ${slot}:`, presetToSave);
    }

    /**
     * Load preset from bank
     */
    loadFromBank(slot, target = 'current', duration = 500) {
        if (!this.presetBank.has(this.currentBank)) {
            console.warn(`Bank '${this.currentBank}' does not exist`);
            return null;
        }

        const bank = this.presetBank.get(this.currentBank);
        const preset = bank.get(slot);

        if (!preset) {
            console.warn(`Preset slot ${slot} is empty in bank '${this.currentBank}'`);
            return null;
        }

        switch (target) {
            case 'A':
                this.presetA = { ...preset };
                break;
            case 'B':
                this.presetB = { ...preset };
                break;
            case 'current':
            default:
                this.liveParams.restore(preset.parameters, duration);
                break;
        }

        console.log(`Loaded preset from bank '${this.currentBank}', slot ${slot}:`, preset);
        return preset;
    }

    /**
     * Swap A and B presets
     */
    swapAB() {
        const temp = this.presetA;
        this.presetA = this.presetB;
        this.presetB = temp;
        this.morphPosition = 1 - this.morphPosition;
        this.setMorphPosition(this.morphPosition, 0);
        console.log('Swapped presets A and B');
    }

    /**
     * Copy A to B
     */
    copyAtoB() {
        this.presetB = { ...this.presetA, name: this.presetA.name + ' (copy)' };
        console.log('Copied preset A to B');
    }

    /**
     * Copy B to A
     */
    copyBtoA() {
        this.presetA = { ...this.presetB, name: this.presetB.name + ' (copy)' };
        console.log('Copied preset B to A');
    }

    /**
     * Create interpolated preset between A and B
     */
    createInterpolated(position = 0.5, name = 'Interpolated') {
        const interpolated = {
            name,
            parameters: {},
            timestamp: Date.now()
        };

        const allParams = new Set([
            ...Object.keys(this.presetA.parameters),
            ...Object.keys(this.presetB.parameters)
        ]);

        allParams.forEach(paramId => {
            const valueA = this.presetA.parameters[paramId] || 0;
            const valueB = this.presetB.parameters[paramId] || 0;
            interpolated.parameters[paramId] = valueA + (valueB - valueA) * position;
        });

        return interpolated;
    }

    /**
     * Randomize current morph position
     */
    randomizeMorph(amount = 1.0, duration = 500) {
        const center = this.morphPosition;
        const maxDeviation = 0.5 * amount;
        const randomPosition = Math.max(0, Math.min(1, center + (Math.random() - 0.5) * 2 * maxDeviation));
        this.morphTo(randomPosition, duration);
    }

    /**
     * Update morph UI (to be connected to visual elements)
     */
    updateMorphUI() {
        // Emit event for UI update
        const event = new CustomEvent('morphPositionChanged', {
            detail: {
                position: this.morphPosition,
                presetA: this.presetA.name,
                presetB: this.presetB.name
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Export current preset bank to JSON
     */
    exportBank(bankName = null) {
        const name = bankName || this.currentBank;
        const bank = this.presetBank.get(name);
        
        if (!bank) {
            console.warn(`Bank '${name}' does not exist`);
            return null;
        }

        const exported = {
            name,
            presets: Array.from(bank.entries()).map(([slot, preset]) => ({
                slot,
                ...preset
            })),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exported, null, 2);
    }

    /**
     * Import preset bank from JSON
     */
    importBank(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const bank = new Map();

            data.presets.forEach(preset => {
                const { slot, ...presetData } = preset;
                bank.set(slot, presetData);
            });

            this.presetBank.set(data.name, bank);
            console.log(`Imported bank '${data.name}' with ${bank.size} presets`);
            return true;
        } catch (error) {
            console.error('Failed to import bank:', error);
            return false;
        }
    }

    /**
     * Switch to different preset bank
     */
    switchBank(bankName) {
        if (!this.presetBank.has(bankName)) {
            this.presetBank.set(bankName, new Map());
        }
        this.currentBank = bankName;
        console.log(`Switched to bank '${bankName}'`);
    }

    /**
     * List all available banks
     */
    listBanks() {
        return Array.from(this.presetBank.keys());
    }

    /**
     * Get current bank contents
     */
    getCurrentBankContents() {
        const bank = this.presetBank.get(this.currentBank);
        if (!bank) return [];

        return Array.from(bank.entries()).map(([slot, preset]) => ({
            slot,
            name: preset.name,
            timestamp: preset.timestamp,
            paramCount: Object.keys(preset.parameters).length
        }));
    }

    /**
     * Clear preset slot
     */
    clearSlot(slot) {
        const bank = this.presetBank.get(this.currentBank);
        if (bank) {
            bank.delete(slot);
            console.log(`Cleared slot ${slot} in bank '${this.currentBank}'`);
        }
    }

    /**
     * Clear entire bank
     */
    clearBank(bankName = null) {
        const name = bankName || this.currentBank;
        this.presetBank.delete(name);
        console.log(`Cleared bank '${name}'`);
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresetMorph;
}
