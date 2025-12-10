// HAOS Patch Library - Integrates ARP 2600 and TB-303 presets
class HAOSPatchLibrary {
    constructor() {
        this.arp2600Presets = [];
        this.tb303Presets = [];
        this.currentPatch = null;
        this.audioContext = null;
    }

    async init() {
        console.log('🎛️ HAOS Patch Library initializing...');

        // Load ARP 2600 presets (200 patches)
        await this.loadARP2600Presets();

        // Load TB-303 presets
        await this.loadTB303Presets();

        console.log(`✓ Loaded ${this.arp2600Presets.length} ARP 2600 patches`);
        console.log(`✓ Loaded ${this.tb303Presets.length} TB-303 presets`);

        return this;
    }

    async loadARP2600Presets() {
        try {
            const response = await fetch('/ableton-cli/output/presets/preset_library.json');
            const data = await response.json();
            this.arp2600Presets = data.presets || [];
        } catch (err) {
            console.error('Failed to load ARP 2600 presets:', err);
            this.arp2600Presets = [];
        }
    }

    async loadTB303Presets() {
        try {
            const response = await fetch('/data/factory-presets.json');
            const data = await response.json();
            this.tb303Presets = data.filter(p => p.type === 'tb303') || [];
        } catch (err) {
            console.error('Failed to load TB-303 presets:', err);
            this.tb303Presets = [];
        }
    }

    /**
     * Get random preset by category
     */
    getRandomPreset(type = 'arp2600', category = null) {
        let presets = type === 'arp2600' ? this.arp2600Presets : this.tb303Presets;

        if (category) {
            presets = presets.filter(p => p.category === category);
        }

        if (presets.length === 0) return null;

        return presets[Math.floor(Math.random() * presets.length)];
    }

    /**
     * Get preset by name
     */
    getPresetByName(name, type = 'arp2600') {
        const presets = type === 'arp2600' ? this.arp2600Presets : this.tb303Presets;
        return presets.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
    }

    /**
     * Get all categories for a type
     */
    getCategories(type = 'arp2600') {
        const presets = type === 'arp2600' ? this.arp2600Presets : this.tb303Presets;
        const categories = new Set(presets.map(p => p.category));
        return Array.from(categories);
    }

    /**
     * Get presets by category
     */
    getPresetsByCategory(category, type = 'arp2600') {
        const presets = type === 'arp2600' ? this.arp2600Presets : this.tb303Presets;
        return presets.filter(p => p.category === category);
    }

    /**
     * Apply ARP 2600 patch to sequencer or synth
     */
    applyARP2600Patch(preset, targetEngine) {
        if (!preset) return false;

        console.log(`🎛️ Applying ARP 2600 patch: ${preset.name}`);
        this.currentPatch = preset;

        // Extract patch parameters
        const modules = preset.modules || {};
        const modulators = preset.modulators || {};

        // Apply to target engine if available
        if (targetEngine && targetEngine.setParameters) {
            const params = this.convertARP2600ToEngineParams(preset);
            targetEngine.setParameters(params);
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('haos:patch-applied', {
            detail: {
                type: 'arp2600',
                preset,
                name: preset.name,
                category: preset.category,
            },
        }));

        return true;
    }

    /**
     * Apply TB-303 preset
     */
    applyTB303Preset(preset, targetEngine) {
        if (!preset) return false;

        console.log(`🎹 Applying TB-303 preset: ${preset.name}`);
        this.currentPatch = preset;

        // Apply parameters
        if (targetEngine && targetEngine.tb303) {
            const params = preset.parameters || {};

            // Apply to TB-303 engine
            if (targetEngine.tb303.setParams) {
                targetEngine.tb303.setParams(params);
            } else {
                // Manual parameter application
                if (targetEngine.tb303.filter) {
                    targetEngine.tb303.filter.frequency.value = params.cutoff || 800;
                    targetEngine.tb303.filter.Q.value = params.resonance || 10;
                }

                targetEngine.tb303.envMod = params.envMod || 0.5;
                targetEngine.tb303.decay = params.decay || 0.3;
                targetEngine.tb303.slideTime = params.slideTime || 0.1;
            }
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('haos:patch-applied', {
            detail: {
                type: 'tb303',
                preset,
                name: preset.name,
                category: preset.category,
            },
        }));

        return true;
    }

    /**
     * Convert ARP 2600 patch to engine parameters
     */
    convertARP2600ToEngineParams(preset) {
        const modules = preset.modules || {};
        const modulators = preset.modulators || {};

        const params = {
            // VCO parameters
            vco1Frequency: modules.VCO1?.parameters?.frequency || 440,
            vco1Waveform: modules.VCO1?.parameters?.waveform || 'saw',

            // VCF parameters
            filterCutoff: modules.VCF?.parameters?.cutoff || 0.5,
            filterResonance: modules.VCF?.parameters?.resonance || 0.5,
            filterMode: modules.VCF?.parameters?.mode || 'LP',

            // Envelope parameters
            attack: modulators.ENV1?.attack || 0.01,
            decay: modulators.ENV1?.decay || 0.3,
            sustain: modulators.ENV1?.sustain || 0.7,
            release: modulators.ENV1?.release || 0.1,

            // Modulation
            envMod: modulators.ENV2?.depth || 0.5,
            lfoRate: modulators.LFO?.rate || 2,
            lfoDepth: modulators.LFO?.depth || 0.3,
        };

        return params;
    }

    /**
     * Get patch statistics
     */
    getStats() {
        return {
            arp2600: {
                total: this.arp2600Presets.length,
                categories: this.getCategories('arp2600'),
                byCategory: this.getCategoryStats('arp2600'),
            },
            tb303: {
                total: this.tb303Presets.length,
                categories: this.getCategories('tb303'),
                byCategory: this.getCategoryStats('tb303'),
            },
        };
    }

    getCategoryStats(type) {
        const categories = this.getCategories(type);
        const stats = {};

        categories.forEach(cat => {
            stats[cat] = this.getPresetsByCategory(cat, type).length;
        });

        return stats;
    }

    /**
     * Create randomized sound variation
     */
    createVariation(basePreset, variationAmount = 0.2) {
        if (!basePreset) return null;

        const variation = JSON.parse(JSON.stringify(basePreset)); // Deep clone
        variation.name = `${basePreset.name} (Variation)`;

        // Randomize parameters slightly
        if (variation.modules) {
            Object.keys(variation.modules).forEach(moduleName => {
                const module = variation.modules[moduleName];
                if (module.parameters) {
                    Object.keys(module.parameters).forEach(paramName => {
                        if (typeof module.parameters[paramName] === 'number') {
                            const value = module.parameters[paramName];
                            const randomOffset = (Math.random() - 0.5) * 2 * variationAmount;
                            module.parameters[paramName] = value * (1 + randomOffset);
                        }
                    });
                }
            });
        }

        return variation;
    }

    /**
     * Morph between two presets
     */
    morphPresets(presetA, presetB, position = 0.5) {
        if (!presetA || !presetB) return null;

        const morphed = JSON.parse(JSON.stringify(presetA));
        morphed.name = `${presetA.name} → ${presetB.name} (${Math.round(position * 100)}%)`;

        // Morph numerical parameters
        if (morphed.modules && presetB.modules) {
            Object.keys(morphed.modules).forEach(moduleName => {
                if (presetB.modules[moduleName]?.parameters && morphed.modules[moduleName].parameters) {
                    Object.keys(morphed.modules[moduleName].parameters).forEach(paramName => {
                        const valueA = morphed.modules[moduleName].parameters[paramName];
                        const valueB = presetB.modules[moduleName].parameters[paramName];

                        if (typeof valueA === 'number' && typeof valueB === 'number') {
                            morphed.modules[moduleName].parameters[paramName] =
                                valueA * (1 - position) + valueB * position;
                        }
                    });
                }
            });
        }

        return morphed;
    }
}

// Initialize global patch library
window.HAOSPatchLibrary = new HAOSPatchLibrary();

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await window.HAOSPatchLibrary.init();
        console.log('📊 Patch Library Stats:', window.HAOSPatchLibrary.getStats());
    });
} else {
    window.HAOSPatchLibrary.init().then(() => {
        console.log('📊 Patch Library Stats:', window.HAOSPatchLibrary.getStats());
    });
}
