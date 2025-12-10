/**
 * AI Patch Designer - Intelligent Sound Design & Modulation System
 * HAOS.fm - Hardware Analog Oscillator Synthesis
 *
 * Features:
 * - Intelligent patch generation based on genre/mood
 * - Automatic modulation routing
 * - Parameter optimization for different sound types
 * - Preset morphing and evolution
 * - Sound analysis and suggestions
 */

class AIPatchDesigner {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.synths = {};
        this.currentPatch = null;
        this.patchHistory = [];
        this.maxHistorySize = 50;

        // AI Knowledge Base - Genre characteristics
        this.genreProfiles = {
            'acid-techno': {
                tb303: {
                    cutoff: { min: 400, max: 2000, dynamic: true },
                    resonance: { min: 12, max: 18, dynamic: true },
                    envMod: { min: 60, max: 90, dynamic: true },
                    decay: { min: 100, max: 400, dynamic: false },
                    accent: 0.8,
                    modulation: {
                        lfo1: { target: 'cutoff', depth: 0.4, rate: 4 },
                        env1: { target: 'cutoff', amount: 0.8 },
                    },
                },
                tr808: {
                    kickTune: -12,
                    kickDecay: 0.6,
                    hatDecay: 0.1,
                    snareTune: 0,
                    modulation: {
                        lfo1: { target: 'kickTune', depth: 0.2, rate: 0.5 },
                    },
                },
            },
            'hard-techno': {
                tb303: {
                    cutoff: { min: 800, max: 1500, dynamic: false },
                    resonance: { min: 8, max: 12, dynamic: false },
                    envMod: { min: 40, max: 60, dynamic: false },
                    decay: { min: 200, max: 300, dynamic: false },
                    accent: 0.9,
                    distortion: 0.7,
                },
                tr808: {
                    kickTune: -8,
                    kickDecay: 0.5,
                    kickDistortion: 0.6,
                    hatDecay: 0.08,
                    clapReverb: 0.3,
                },
                arp2600: {
                    vco1Wave: 'sawtooth',
                    vco2Wave: 'square',
                    vco2Detune: 7,
                    filterCutoff: 1200,
                    filterResonance: 0.5,
                    modulation: {
                        lfo1: { target: 'filterCutoff', depth: 0.3, rate: 8 },
                        env1: { target: 'vco1Pitch', amount: 0.2 },
                    },
                },
            },
            'minimal-techno': {
                tb303: {
                    cutoff: { min: 600, max: 1200, dynamic: true },
                    resonance: { min: 6, max: 10, dynamic: false },
                    envMod: { min: 30, max: 50, dynamic: true },
                    decay: { min: 300, max: 600, dynamic: false },
                    accent: 0.5,
                },
                tr808: {
                    kickTune: -10,
                    kickDecay: 0.7,
                    hatDecay: 0.12,
                    volume: 0.7,
                },
                arp2600: {
                    vco1Wave: 'sine',
                    vco2Wave: 'triangle',
                    filterCutoff: 800,
                    filterResonance: 0.3,
                    modulation: {
                        lfo1: { target: 'filterCutoff', depth: 0.15, rate: 0.25 },
                    },
                },
            },
            trap: {
                tr808: {
                    kickTune: -15,
                    kickDecay: 0.8,
                    snareTune: 5,
                    snareDecay: 0.4,
                    hatDecay: 0.05,
                    modulation: {
                        lfo1: { target: 'hatTune', depth: 0.3, rate: 16 },
                    },
                },
                tb303: {
                    cutoff: { min: 200, max: 800, dynamic: true },
                    resonance: { min: 15, max: 20, dynamic: false },
                    envMod: { min: 70, max: 95, dynamic: true },
                    decay: { min: 500, max: 1000, dynamic: false },
                    glide: 0.3,
                },
            },
            ambient: {
                arp2600: {
                    vco1Wave: 'sine',
                    vco2Wave: 'triangle',
                    vco2Detune: 3,
                    filterCutoff: 600,
                    filterResonance: 0.2,
                    ampAttack: 1.5,
                    ampDecay: 2.0,
                    ampSustain: 0.7,
                    ampRelease: 3.0,
                    modulation: {
                        lfo1: { target: 'filterCutoff', depth: 0.2, rate: 0.1 },
                        lfo2: { target: 'vco2Detune', depth: 0.1, rate: 0.15 },
                        env1: { target: 'filterCutoff', amount: 0.4 },
                    },
                },
                stringMachine: {
                    attack: 1.2,
                    release: 2.5,
                    chorus: 0.8,
                    ensemble: 0.6,
                },
            },
            industrial: {
                tb303: {
                    cutoff: { min: 1500, max: 3000, dynamic: true },
                    resonance: { min: 14, max: 18, dynamic: true },
                    envMod: { min: 50, max: 80, dynamic: true },
                    distortion: 0.85,
                    accent: 0.95,
                },
                tr808: {
                    kickDistortion: 0.8,
                    snareDistortion: 0.7,
                    hatDistortion: 0.5,
                },
                arp2600: {
                    vco1Wave: 'square',
                    vco2Wave: 'sawtooth',
                    vco2Detune: 12,
                    filterCutoff: 2000,
                    filterResonance: 0.7,
                    ringMod: 0.6,
                    modulation: {
                        lfo1: { target: 'ringMod', depth: 0.5, rate: 6 },
                    },
                },
            },
        };

        // Sound type characteristics
        this.soundTypes = {
            bass: {
                frequencyRange: { min: 40, max: 250 },
                characteristics: ['sub', 'punch', 'growl', 'distortion'],
                preferredSynths: ['tb303', 'arp2600-bass'],
                modulation: {
                    priority: ['filterCutoff', 'resonance', 'pitch'],
                    lfoRates: { min: 0.1, max: 4 },
                },
            },
            lead: {
                frequencyRange: { min: 200, max: 2000 },
                characteristics: ['bright', 'cutting', 'melodic', 'expressive'],
                preferredSynths: ['arp2600-lead', 'tb303'],
                modulation: {
                    priority: ['filterCutoff', 'pitch', 'pulseWidth'],
                    lfoRates: { min: 2, max: 12 },
                },
            },
            pad: {
                frequencyRange: { min: 100, max: 1500 },
                characteristics: ['warm', 'evolving', 'atmospheric', 'smooth'],
                preferredSynths: ['arp2600-pad', 'stringMachine'],
                modulation: {
                    priority: ['filterCutoff', 'detune', 'chorus'],
                    lfoRates: { min: 0.05, max: 0.5 },
                },
            },
            drums: {
                frequencyRange: { min: 60, max: 8000 },
                characteristics: ['punchy', 'tight', 'dynamic', 'rhythmic'],
                preferredSynths: ['tr808'],
                modulation: {
                    priority: ['tune', 'decay', 'distortion'],
                    lfoRates: { min: 0, max: 0 },
                },
            },
            fx: {
                frequencyRange: { min: 100, max: 8000 },
                characteristics: ['sweeping', 'evolving', 'textural', 'dynamic'],
                preferredSynths: ['arp2600-fx'],
                modulation: {
                    priority: ['filterCutoff', 'resonance', 'ringMod', 'feedback'],
                    lfoRates: { min: 0.1, max: 20 },
                },
            },
        };
    }

    /**
     * Register synth engines for AI control
     */
    setSynths(synthInstances) {
        this.synths = synthInstances;
        console.log('✓ AI Patch Designer: Synths registered', Object.keys(synthInstances));
    }

    /**
     * Generate intelligent patch based on genre and sound type
     */
    generatePatch(genre, soundType, mood = 'balanced') {
        console.log(`🎨 AI Generating patch: ${genre} / ${soundType} / ${mood}`);

        const genreProfile = this.genreProfiles[genre] || this.genreProfiles['minimal-techno'];
        const soundProfile = this.soundTypes[soundType] || this.soundTypes.lead;

        const patch = {
            id: this.generatePatchId(),
            name: `${genre}-${soundType}-${Date.now()}`,
            genre,
            soundType,
            mood,
            timestamp: Date.now(),
            parameters: {},
            modulation: {},
            routing: [],
        };

        // Determine which synth to use
        const preferredSynth = this.selectOptimalSynth(soundType, genreProfile);
        patch.synth = preferredSynth;

        // Generate parameters based on AI analysis
        if (preferredSynth.includes('tb303') && genreProfile.tb303) {
            patch.parameters.tb303 = this.generateTB303Params(genreProfile.tb303, soundProfile, mood);
        }

        if (preferredSynth.includes('tr808') && genreProfile.tr808) {
            patch.parameters.tr808 = this.generateTR808Params(genreProfile.tr808, soundProfile, mood);
        }

        if (preferredSynth.includes('arp2600') && genreProfile.arp2600) {
            patch.parameters.arp2600 = this.generateARP2600Params(genreProfile.arp2600, soundProfile, mood);
        }

        if (preferredSynth.includes('string') && genreProfile.stringMachine) {
            patch.parameters.stringMachine = genreProfile.stringMachine;
        }

        // Generate intelligent modulation routing
        patch.modulation = this.generateModulationRouting(preferredSynth, genreProfile, soundProfile, mood);

        // Add to history
        this.addToHistory(patch);
        this.currentPatch = patch;

        return patch;
    }

    /**
     * Select optimal synth for sound type
     */
    selectOptimalSynth(soundType, genreProfile) {
        const soundProfile = this.soundTypes[soundType];

        // Check genre profile for available synths
        const availableSynths = Object.keys(genreProfile);
        const { preferredSynths } = soundProfile;

        // Find best match
        for (const preferred of preferredSynths) {
            for (const available of availableSynths) {
                if (preferred.includes(available)) {
                    return available;
                }
            }
        }

        return availableSynths[0] || 'arp2600';
    }

    /**
     * Generate TB-303 parameters with AI intelligence
     */
    generateTB303Params(profile, soundProfile, mood) {
        const params = {};

        // Mood adjustments
        const moodMultipliers = {
            aggressive: { resonance: 1.2, envMod: 1.3, accent: 1.2 },
            balanced: { resonance: 1.0, envMod: 1.0, accent: 1.0 },
            subtle: { resonance: 0.8, envMod: 0.7, accent: 0.8 },
        };

        const multiplier = moodMultipliers[mood] || moodMultipliers.balanced;

        // Generate cutoff
        if (profile.cutoff.dynamic) {
            params.cutoff = this.randomRange(profile.cutoff.min, profile.cutoff.max);
        } else {
            params.cutoff = (profile.cutoff.min + profile.cutoff.max) / 2;
        }

        // Generate resonance with mood adjustment
        const resBase = profile.resonance.dynamic
            ? this.randomRange(profile.resonance.min, profile.resonance.max)
            : (profile.resonance.min + profile.resonance.max) / 2;
        params.resonance = Math.min(20, resBase * multiplier.resonance);

        // Generate envelope modulation
        const envBase = profile.envMod.dynamic
            ? this.randomRange(profile.envMod.min, profile.envMod.max)
            : (profile.envMod.min + profile.envMod.max) / 2;
        params.envMod = Math.min(100, envBase * multiplier.envMod);

        // Decay
        params.decay = profile.decay.dynamic
            ? this.randomRange(profile.decay.min, profile.decay.max)
            : (profile.decay.min + profile.decay.max) / 2;

        // Accent
        params.accent = (profile.accent || 0.5) * multiplier.accent;

        // Optional parameters
        if (profile.distortion !== undefined) {
            params.distortion = profile.distortion;
        }
        if (profile.glide !== undefined) {
            params.glide = profile.glide;
        }

        return params;
    }

    /**
     * Generate TR-808 parameters
     */
    generateTR808Params(profile, soundProfile, mood) {
        const params = {};

        // Copy profile parameters
        Object.keys(profile).forEach(key => {
            if (key !== 'modulation') {
                params[key] = profile[key];
            }
        });

        // Mood adjustments for drums
        if (mood === 'aggressive') {
            params.kickTune = (params.kickTune || 0) - 2;
            params.kickDistortion = Math.min(1, (params.kickDistortion || 0) + 0.2);
        } else if (mood === 'subtle') {
            params.volume = (params.volume || 0.8) * 0.7;
        }

        return params;
    }

    /**
     * Generate ARP-2600 parameters with advanced AI
     */
    generateARP2600Params(profile, soundProfile, mood) {
        const params = {};

        // VCO configuration
        params.vco1Wave = profile.vco1Wave || 'sawtooth';
        params.vco2Wave = profile.vco2Wave || 'square';
        params.vco2Detune = profile.vco2Detune || 5;

        // Filter configuration
        params.filterCutoff = profile.filterCutoff || 1000;
        params.filterResonance = profile.filterResonance || 0.5;

        // Envelope configuration
        params.ampAttack = profile.ampAttack || 0.01;
        params.ampDecay = profile.ampDecay || 0.3;
        params.ampSustain = profile.ampSustain || 0.7;
        params.ampRelease = profile.ampRelease || 0.5;

        // FX
        if (profile.ringMod !== undefined) {
            params.ringMod = profile.ringMod;
        }

        // Mood adjustments
        if (mood === 'aggressive') {
            params.filterResonance = Math.min(1, params.filterResonance * 1.3);
            params.vco2Detune *= 1.5;
        } else if (mood === 'subtle') {
            params.filterCutoff *= 0.7;
            params.ampAttack *= 2;
        }

        return params;
    }

    /**
     * Generate intelligent modulation routing
     */
    generateModulationRouting(synth, genreProfile, soundProfile, mood) {
        const routing = {
            lfos: [],
            envelopes: [],
            matrix: [],
        };

        const synthProfile = genreProfile[synth];
        if (!synthProfile || !synthProfile.modulation) {
            return routing;
        }

        const modProfile = synthProfile.modulation;

        // Generate LFO routings
        Object.keys(modProfile).forEach(modSource => {
            const config = modProfile[modSource];

            if (modSource.startsWith('lfo')) {
                routing.lfos.push({
                    lfo: modSource,
                    target: config.target,
                    depth: config.depth,
                    rate: config.rate,
                    waveform: this.selectLFOWaveform(config.target, mood),
                });
            } else if (modSource.startsWith('env')) {
                routing.envelopes.push({
                    envelope: modSource,
                    target: config.target,
                    amount: config.amount,
                });
            }
        });

        // Generate modulation matrix for ARP-2600
        if (synth === 'arp2600') {
            routing.matrix = this.generateModulationMatrix(soundProfile, mood);
        }

        return routing;
    }

    /**
     * Generate modulation matrix for ARP-2600
     */
    generateModulationMatrix(soundProfile, mood) {
        const matrix = [];
        const priorities = soundProfile.modulation.priority;

        // Create intelligent routings based on sound type
        priorities.forEach((target, index) => {
            if (index < 3) { // Limit to 3 main routings
                const source = this.selectModSource(target, mood);
                const amount = this.calculateModAmount(target, mood);

                matrix.push({
                    source,
                    target,
                    amount,
                });
            }
        });

        return matrix;
    }

    /**
     * Select appropriate modulation source
     */
    selectModSource(target, mood) {
        const sources = {
            filterCutoff: mood === 'aggressive' ? 'lfo1' : 'env1',
            resonance: 'lfo2',
            pitch: mood === 'subtle' ? 'lfo1' : 'env1',
            pulseWidth: 'lfo1',
            detune: 'lfo2',
            ringMod: 'lfo1',
        };

        return sources[target] || 'lfo1';
    }

    /**
     * Calculate modulation amount
     */
    calculateModAmount(target, mood) {
        const baseAmounts = {
            filterCutoff: 0.5,
            resonance: 0.3,
            pitch: 0.2,
            pulseWidth: 0.4,
            detune: 0.3,
            ringMod: 0.4,
        };

        const moodMultipliers = {
            aggressive: 1.4,
            balanced: 1.0,
            subtle: 0.6,
        };

        const base = baseAmounts[target] || 0.3;
        const multiplier = moodMultipliers[mood] || 1.0;

        return Math.min(1, base * multiplier);
    }

    /**
     * Select LFO waveform based on target and mood
     */
    selectLFOWaveform(target, mood) {
        const waveforms = {
            filterCutoff: mood === 'aggressive' ? 'sawtooth' : 'sine',
            pitch: 'triangle',
            pulseWidth: 'triangle',
            resonance: 'square',
            ringMod: 'random',
        };

        return waveforms[target] || 'sine';
    }

    /**
     * Apply patch to synth
     */
    applyPatch(patch, synthInstances = null) {
        const synths = synthInstances || this.synths;

        console.log('🎛️ Applying AI patch:', patch.name);

        // Apply TB-303 parameters
        if (patch.parameters.tb303 && synths.tb303) {
            this.applyTB303Patch(synths.tb303, patch.parameters.tb303);
        }

        // Apply TR-808 parameters
        if (patch.parameters.tr808 && synths.tr808) {
            this.applyTR808Patch(synths.tr808, patch.parameters.tr808);
        }

        // Apply ARP-2600 parameters
        if (patch.parameters.arp2600 && synths.arp2600) {
            this.applyARP2600Patch(synths.arp2600, patch.parameters.arp2600);
        }

        // Apply String Machine parameters
        if (patch.parameters.stringMachine && synths.stringMachine) {
            this.applyStringMachinePatch(synths.stringMachine, patch.parameters.stringMachine);
        }

        // Apply modulation routing
        if (patch.modulation) {
            this.applyModulationRouting(patch.synth, patch.modulation, synths);
        }

        this.currentPatch = patch;

        return patch;
    }

    /**
     * Apply TB-303 patch
     */
    applyTB303Patch(tb303, params) {
        Object.keys(params).forEach(key => {
            if (typeof tb303.setParam === 'function') {
                tb303.setParam(key, params[key]);
            }
        });
    }

    /**
     * Apply TR-808 patch
     */
    applyTR808Patch(tr808, params) {
        Object.keys(params).forEach(key => {
            if (typeof tr808.setParam === 'function') {
                tr808.setParam(key, params[key]);
            } else if (key === 'volume' && typeof tr808.setVolume === 'function') {
                tr808.setVolume(params[key]);
            }
        });
    }

    /**
     * Apply ARP-2600 patch
     */
    applyARP2600Patch(arp2600, params) {
        // Create preset object
        const preset = {
            name: 'ai-generated',
            ...params,
        };

        // If ARP has loadPreset method, use custom preset
        if (typeof arp2600.loadPreset === 'function') {
            // Store as custom preset
            if (arp2600.presets) {
                arp2600.presets['ai-generated'] = preset;
            }
            arp2600.loadPreset('ai-generated');
        }
    }

    /**
     * Apply String Machine patch
     */
    applyStringMachinePatch(stringMachine, params) {
        Object.keys(params).forEach(key => {
            if (typeof stringMachine.setParam === 'function') {
                stringMachine.setParam(key, params[key]);
            }
        });
    }

    /**
     * Apply modulation routing
     */
    applyModulationRouting(synth, modulation, synths) {
        const synthInstance = synths[synth];
        if (!synthInstance) return;

        // Apply LFO routings
        modulation.lfos?.forEach((routing, index) => {
            if (typeof synthInstance.setModulation === 'function') {
                synthInstance.setModulation({
                    source: routing.lfo,
                    target: routing.target,
                    amount: routing.depth,
                    rate: routing.rate,
                    waveform: routing.waveform,
                });
            }
        });

        // Apply envelope routings
        modulation.envelopes?.forEach((routing) => {
            if (typeof synthInstance.setModulation === 'function') {
                synthInstance.setModulation({
                    source: routing.envelope,
                    target: routing.target,
                    amount: routing.amount,
                });
            }
        });

        // Apply modulation matrix for ARP-2600
        if (synth === 'arp2600' && modulation.matrix) {
            modulation.matrix.forEach(connection => {
                if (typeof synthInstance.setMatrixConnection === 'function') {
                    synthInstance.setMatrixConnection(
                        connection.source,
                        connection.target,
                        connection.amount,
                    );
                }
            });
        }
    }

    /**
     * Morph between two patches
     */
    morphPatches(patchA, patchB, morphAmount = 0.5) {
        console.log(`🔄 Morphing patches: ${morphAmount * 100}%`);

        const morphedPatch = {
            id: this.generatePatchId(),
            name: `morph-${patchA.name}-${patchB.name}`,
            genre: morphAmount < 0.5 ? patchA.genre : patchB.genre,
            soundType: patchA.soundType,
            mood: 'balanced',
            timestamp: Date.now(),
            parameters: {},
            modulation: {},
        };

        // Morph TB-303 parameters
        if (patchA.parameters.tb303 && patchB.parameters.tb303) {
            morphedPatch.parameters.tb303 = this.morphParameters(
                patchA.parameters.tb303,
                patchB.parameters.tb303,
                morphAmount,
            );
        }

        // Morph ARP-2600 parameters
        if (patchA.parameters.arp2600 && patchB.parameters.arp2600) {
            morphedPatch.parameters.arp2600 = this.morphParameters(
                patchA.parameters.arp2600,
                patchB.parameters.arp2600,
                morphAmount,
            );
        }

        return morphedPatch;
    }

    /**
     * Morph parameter objects
     */
    morphParameters(paramsA, paramsB, amount) {
        const morphed = {};

        // Get all unique keys
        const allKeys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]);

        allKeys.forEach(key => {
            const valA = paramsA[key];
            const valB = paramsB[key];

            if (typeof valA === 'number' && typeof valB === 'number') {
                morphed[key] = valA + (valB - valA) * amount;
            } else if (typeof valA === 'string' && typeof valB === 'string') {
                morphed[key] = amount < 0.5 ? valA : valB;
            } else {
                morphed[key] = valA !== undefined ? valA : valB;
            }
        });

        return morphed;
    }

    /**
     * Evolve current patch (add variation)
     */
    evolvePatch(patch, evolutionStrength = 0.2) {
        console.log(`🧬 Evolving patch: ${evolutionStrength * 100}% mutation`);

        const evolved = JSON.parse(JSON.stringify(patch));
        evolved.id = this.generatePatchId();
        evolved.name = `${patch.name}-evolved`;
        evolved.timestamp = Date.now();

        // Evolve parameters
        Object.keys(evolved.parameters).forEach(synthType => {
            const params = evolved.parameters[synthType];
            Object.keys(params).forEach(param => {
                if (typeof params[param] === 'number') {
                    const variation = (Math.random() - 0.5) * 2 * evolutionStrength;
                    params[param] = params[param] * (1 + variation);

                    // Clamp to reasonable ranges
                    params[param] = Math.max(0, Math.min(params[param], 10000));
                }
            });
        });

        return evolved;
    }

    /**
     * Utility functions
     */
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    generatePatchId() {
        return `patch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    addToHistory(patch) {
        this.patchHistory.unshift(patch);
        if (this.patchHistory.length > this.maxHistorySize) {
            this.patchHistory.pop();
        }
    }

    /**
     * Get patch suggestions based on current patch
     */
    getSuggestions(currentPatch) {
        const suggestions = [];

        // Suggest mood variations
        ['aggressive', 'balanced', 'subtle'].forEach(mood => {
            if (mood !== currentPatch.mood) {
                suggestions.push({
                    type: 'mood-variation',
                    description: `Try ${mood} version`,
                    patch: this.generatePatch(currentPatch.genre, currentPatch.soundType, mood),
                });
            }
        });

        // Suggest evolution
        suggestions.push({
            type: 'evolution',
            description: 'Evolve this sound',
            patch: this.evolvePatch(currentPatch, 0.15),
        });

        return suggestions.slice(0, 5);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPatchDesigner;
}
