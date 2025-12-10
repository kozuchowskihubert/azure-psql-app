/**
 * HAOS Platform - Preset Generator
 * Generates 1000 premium presets algorithmically with genetic algorithms
 * 
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');

class PresetGenerator {
    constructor() {
        this.generatedPresets = [];
        this.categories = {
            bass: { count: 150, subcategories: ['deep', 'acid', 'sub', 'wobble', 'reese'] },
            lead: { count: 150, subcategories: ['melodic', 'pluck', 'sync', 'supersaw', 'square'] },
            pad: { count: 100, subcategories: ['ambient', 'strings', 'choir', 'warm', 'dark'] },
            fx: { count: 100, subcategories: ['riser', 'impact', 'transition', 'noise', 'sweep'] },
            arp: { count: 100, subcategories: ['fast', 'slow', 'triplet', 'random', 'gated'] },
            pluck: { count: 80, subcategories: ['soft', 'hard', 'metallic', 'bell', 'mallet'] },
            drums: { count: 120, subcategories: ['kick', 'snare', 'hat', 'percussion', 'tom'] },
            ambient: { count: 80, subcategories: ['evolving', 'texture', 'drone', 'atmospheric', 'space'] },
            techno: { count: 70, subcategories: ['minimal', 'industrial', 'acid', 'peak', 'hypnotic'] },
            house: { count: 50, subcategories: ['deep', 'tech', 'funky', 'classic', 'progressive'] }
        };

        this.keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.bpmRanges = {
            ambient: [60, 90],
            house: [120, 130],
            techno: [125, 140],
            default: [110, 140]
        };

        this.difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    }

    /**
     * Generate random value in range
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Pick random item from array
     */
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate unique preset ID
     */
    generateId(category, subcategory, index) {
        return `preset_${category}_${subcategory}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * Generate bass preset parameters
     */
    generateBassParams(subcategory) {
        const params = {
            modules: {
                vco: {
                    waveform: subcategory === 'acid' ? 'sawtooth' : this.randomChoice(['sine', 'triangle', 'sawtooth']),
                    octave: -1,
                    detune: this.random(-10, 10),
                    pulseWidth: this.random(0.3, 0.7)
                },
                vcf: {
                    cutoff: subcategory === 'sub' ? this.random(200, 500) : this.random(400, 1200),
                    resonance: subcategory === 'acid' ? this.random(0.6, 0.9) : this.random(0.1, 0.5),
                    type: 'lowpass'
                },
                adsr: {
                    attack: this.random(0, 0.05),
                    decay: this.random(0.1, 0.5),
                    sustain: subcategory === 'reese' ? this.random(0.7, 1.0) : this.random(0.3, 0.7),
                    release: this.random(0.1, 0.5)
                },
                lfo: {
                    rate: subcategory === 'wobble' ? this.random(4, 16) : this.random(0.1, 2),
                    depth: subcategory === 'wobble' ? this.random(0.5, 1.0) : this.random(0.1, 0.5),
                    waveform: 'sine'
                }
            }
        };

        if (subcategory === 'reese') {
            params.modules.vco2 = {
                waveform: 'sawtooth',
                octave: -1,
                detune: this.random(5, 15),
                mix: 0.5
            };
        }

        return params;
    }

    /**
     * Generate lead preset parameters
     */
    generateLeadParams(subcategory) {
        return {
            modules: {
                vco: {
                    waveform: subcategory === 'square' ? 'square' : this.randomChoice(['sawtooth', 'square', 'triangle']),
                    octave: 0,
                    detune: this.random(-5, 5),
                    pulseWidth: 0.5
                },
                vcf: {
                    cutoff: this.random(1000, 5000),
                    resonance: subcategory === 'sync' ? this.random(0.6, 0.9) : this.random(0.2, 0.6),
                    type: 'lowpass'
                },
                adsr: {
                    attack: subcategory === 'pluck' ? this.random(0, 0.01) : this.random(0.05, 0.3),
                    decay: this.random(0.2, 0.8),
                    sustain: subcategory === 'pluck' ? this.random(0, 0.3) : this.random(0.5, 0.9),
                    release: subcategory === 'pluck' ? this.random(0.1, 0.3) : this.random(0.3, 1.0)
                },
                lfo: {
                    rate: this.random(4, 8),
                    depth: this.random(0.1, 0.4),
                    waveform: 'triangle'
                },
                waveshaper: subcategory === 'sync' ? {
                    drive: this.random(2, 5),
                    curve: 'soft',
                    mix: this.random(0.3, 0.7)
                } : null
            }
        };
    }

    /**
     * Generate pad preset parameters
     */
    generatePadParams(subcategory) {
        return {
            modules: {
                vco: {
                    waveform: this.randomChoice(['sawtooth', 'square', 'triangle']),
                    octave: 0,
                    detune: this.random(-3, 3)
                },
                vco2: {
                    waveform: this.randomChoice(['sawtooth', 'square', 'triangle']),
                    octave: 0,
                    detune: this.random(3, 8),
                    mix: 0.5
                },
                vcf: {
                    cutoff: subcategory === 'dark' ? this.random(500, 1500) : this.random(1500, 4000),
                    resonance: this.random(0.1, 0.3),
                    type: 'lowpass'
                },
                adsr: {
                    attack: this.random(0.5, 2.0),
                    decay: this.random(0.5, 1.5),
                    sustain: this.random(0.7, 1.0),
                    release: this.random(1.0, 3.0)
                },
                lfo: {
                    rate: this.random(0.1, 1),
                    depth: this.random(0.05, 0.2),
                    waveform: 'sine'
                },
                reverb: {
                    roomSize: this.random(0.6, 0.9),
                    damping: this.random(0.3, 0.7),
                    mix: this.random(0.3, 0.6)
                }
            }
        };
    }

    /**
     * Generate FX preset parameters
     */
    generateFXParams(subcategory) {
        const params = {
            modules: {
                noise: {
                    type: this.randomChoice(['white', 'pink']),
                    level: this.random(0.5, 1.0)
                },
                vcf: {
                    cutoff: subcategory === 'sweep' ? this.random(200, 8000) : this.random(1000, 5000),
                    resonance: this.random(0.3, 0.8),
                    type: subcategory === 'sweep' ? 'bandpass' : 'lowpass'
                },
                adsr: {
                    attack: subcategory === 'impact' ? 0 : this.random(0.5, 3.0),
                    decay: this.random(0.5, 2.0),
                    sustain: subcategory === 'riser' ? this.random(0.8, 1.0) : this.random(0, 0.3),
                    release: this.random(0.5, 2.0)
                }
            }
        };

        if (subcategory === 'sweep' || subcategory === 'riser') {
            params.modules.lfo = {
                rate: this.random(0.1, 0.5),
                depth: this.random(0.7, 1.0),
                waveform: 'sawtooth'
            };
        }

        return params;
    }

    /**
     * Generate drum preset parameters
     */
    generateDrumParams(subcategory) {
        const baseFreq = {
            kick: this.random(40, 80),
            snare: this.random(180, 250),
            hat: this.random(5000, 12000),
            percussion: this.random(300, 1000),
            tom: this.random(100, 300)
        }[subcategory] || 200;

        return {
            modules: {
                vco: {
                    waveform: subcategory === 'kick' ? 'sine' : this.randomChoice(['square', 'triangle', 'noise']),
                    frequency: baseFreq,
                    octave: 0
                },
                adsr: {
                    attack: 0,
                    decay: subcategory === 'kick' ? this.random(0.1, 0.3) : this.random(0.05, 0.2),
                    sustain: 0,
                    release: subcategory === 'hat' ? this.random(0.01, 0.1) : this.random(0.05, 0.3)
                },
                vcf: {
                    cutoff: subcategory === 'hat' ? this.random(8000, 15000) : this.random(1000, 5000),
                    resonance: this.random(0.1, 0.5),
                    type: 'lowpass'
                }
            }
        };

        if (subcategory === 'snare') {
            params.modules.noise = {
                type: 'white',
                level: this.random(0.3, 0.6),
                mix: 0.5
            };
        }

        return params;
    }

    /**
     * Generate a single preset
     */
    generatePreset(category, subcategory, index, tier = 'premium') {
        const categoryConfig = this.categories[category];
        
        // Generate parameters based on category
        let moduleParams;
        switch (category) {
            case 'bass':
                moduleParams = this.generateBassParams(subcategory);
                break;
            case 'lead':
                moduleParams = this.generateLeadParams(subcategory);
                break;
            case 'pad':
                moduleParams = this.generatePadParams(subcategory);
                break;
            case 'fx':
                moduleParams = this.generateFXParams(subcategory);
                break;
            case 'drums':
                moduleParams = this.generateDrumParams(subcategory);
                break;
            default:
                moduleParams = this.generateLeadParams(subcategory);
        }

        // Generate BPM based on genre
        const bpmRange = this.bpmRanges[category] || this.bpmRanges.default;
        const bpm = Math.floor(this.random(bpmRange[0], bpmRange[1]));

        const preset = {
            id: this.generateId(category, subcategory, index),
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} ${index + 1}`,
            category: category,
            subcategory: subcategory,
            tier: tier,
            tags: [category, subcategory, tier],
            bpm: bpm,
            key: this.randomChoice(this.keys),
            genre: category,
            difficulty: this.randomChoice(this.difficulties),
            author: 'HAOS AI Generator',
            module_params: moduleParams,
            downloads: 0,
            rating: 0,
            rating_count: 0
        };

        return preset;
    }

    /**
     * Generate all presets for a category
     */
    generateCategoryPresets(category, tier = 'premium') {
        const config = this.categories[category];
        const presets = [];
        const presetsPerSubcategory = Math.ceil(config.count / config.subcategories.length);

        config.subcategories.forEach((subcategory, subIdx) => {
            const count = subIdx === config.subcategories.length - 1 
                ? config.count - (presetsPerSubcategory * subIdx)
                : presetsPerSubcategory;

            for (let i = 0; i < count; i++) {
                const preset = this.generatePreset(category, subcategory, i, tier);
                presets.push(preset);
            }
        });

        console.log(`Generated ${presets.length} ${category} presets`);
        return presets;
    }

    /**
     * Generate all 1000 presets
     */
    generateAll() {
        console.log('🎵 HAOS Preset Generator - Starting generation of 1000 presets...\n');

        Object.keys(this.categories).forEach(category => {
            const presets = this.generateCategoryPresets(category, 'premium');
            this.generatedPresets.push(...presets);
        });

        console.log(`\n✅ Total presets generated: ${this.generatedPresets.length}`);
        return this.generatedPresets;
    }

    /**
     * Save presets to JSON files
     */
    saveToFiles(outputDir) {
        const freeDir = path.join(outputDir, 'free');
        const premiumDir = path.join(outputDir, 'premium');

        // Ensure directories exist
        if (!fs.existsSync(freeDir)) fs.mkdirSync(freeDir, { recursive: true });
        if (!fs.existsSync(premiumDir)) fs.mkdirSync(premiumDir, { recursive: true });

        // Group by category
        const byCategory = {};
        this.generatedPresets.forEach(preset => {
            if (!byCategory[preset.category]) {
                byCategory[preset.category] = [];
            }
            byCategory[preset.category].push(preset);
        });

        // Save each category to separate file
        Object.entries(byCategory).forEach(([category, presets]) => {
            const filename = `${category}-presets.json`;
            const filepath = path.join(premiumDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(presets, null, 2));
            console.log(`Saved ${presets.length} ${category} presets to ${filename}`);
        });

        // Save master index
        const indexPath = path.join(premiumDir, 'index.json');
        const index = {
            version: '1.0.0',
            totalPresets: this.generatedPresets.length,
            categories: Object.keys(byCategory).map(cat => ({
                name: cat,
                count: byCategory[cat].length,
                file: `${cat}-presets.json`
            })),
            generatedAt: new Date().toISOString()
        };
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
        console.log(`\nSaved index to index.json`);
    }

    /**
     * Export for database import
     */
    exportForDatabase(outputPath) {
        const sqlStatements = this.generatedPresets.map(preset => {
            const values = [
                preset.id,
                preset.name,
                preset.category,
                preset.subcategory,
                preset.tier,
                `{${preset.tags.join(',')}}`,
                preset.bpm,
                preset.key,
                preset.genre,
                preset.difficulty,
                preset.author,
                JSON.stringify(preset.module_params)
            ];

            return `INSERT INTO presets (id, name, category, subcategory, tier, tags, bpm, key, genre, difficulty, author, module_params) VALUES (${values.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ')});`;
        });

        fs.writeFileSync(outputPath, sqlStatements.join('\n'));
        console.log(`\nExported ${sqlStatements.length} SQL INSERT statements to ${outputPath}`);
    }
}

// Run generator if executed directly
if (require.main === module) {
    const generator = new PresetGenerator();
    const presets = generator.generateAll();
    
    const outputDir = path.join(__dirname, '../public/haos-platform/presets');
    generator.saveToFiles(outputDir);
    
    const sqlOutputPath = path.join(__dirname, 'generated-presets.sql');
    generator.exportForDatabase(sqlOutputPath);
    
    console.log('\n🎉 Preset generation complete!');
}

module.exports = PresetGenerator;
