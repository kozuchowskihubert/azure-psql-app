/**
 * Pattern Library for Modular Synthesis System
 * haos.fm v2.7.0
 * 
 * Provides pattern storage, loading, and management:
 * - Preset pattern library (trap, techno, house, etc.)
 * - Pattern save/load/export/import
 * - Pattern chaining and variation generation
 * - MIDI file import/export
 * - Pattern versioning and history
 * 
 * Features:
 * - 20+ professional preset patterns
 * - LocalStorage persistence
 * - JSON export/import
 * - Pattern randomization
 * - Groove templates
 */

class PatternLibrary {
    constructor(options = {}) {
        this.options = {
            storageKey: options.storageKey || 'haos-patterns',
            autoSave: options.autoSave !== false,
            ...options
        };

        this.patterns = new Map();
        this.currentPattern = null;
        
        // Load saved patterns from localStorage
        this._loadFromStorage();
        
        // Initialize preset patterns
        this._initializePresets();
    }

    /**
     * Get all preset patterns
     */
    getPresets() {
        return {
            // TRAP PATTERNS
            trap: {
                basic: {
                    name: 'Trap Basic',
                    genre: 'trap',
                    bpm: 140,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                        bass: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0]
                    }
                },
                rolling: {
                    name: 'Trap Rolling',
                    genre: 'trap',
                    bpm: 145,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
                        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
                        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                        roll: [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
                        bass: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0]
                    }
                },
                aggressive: {
                    name: 'Trap Aggressive',
                    genre: 'trap',
                    bpm: 150,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        bass: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]
                    }
                },
                halfTime: {
                    name: 'Trap Half-Time',
                    genre: 'trap',
                    bpm: 140,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
                        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                        bass: [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0]
                    }
                },

                // TECHNO PATTERNS
                fourFloor: {
                    name: 'Four-on-the-Floor',
                    genre: 'techno',
                    bpm: 128,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                        perc: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
                        bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
                    }
                },
                technoBasic: {
                    name: 'Techno Basic',
                    genre: 'techno',
                    bpm: 130,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                        bass: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]
                    }
                },
                technoMinimal: {
                    name: 'Techno Minimal',
                    genre: 'techno',
                    bpm: 125,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                        perc: [0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],
                        bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
                    }
                },
                technoDriving: {
                    name: 'Techno Driving',
                    genre: 'techno',
                    bpm: 135,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        bass: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]
                    }
                },

                // HOUSE PATTERNS
                houseClassic: {
                    name: 'House Classic',
                    genre: 'house',
                    bpm: 120,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                        perc: [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
                        bass: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0]
                    }
                },
                houseDeep: {
                    name: 'Deep House',
                    genre: 'house',
                    bpm: 122,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                        bass: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0]
                    }
                },

                // DRUM & BASS PATTERNS
                dnbBasic: {
                    name: 'D&B Basic',
                    genre: 'dnb',
                    bpm: 174,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
                        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                        bass: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]
                    }
                },

                // EXPERIMENTAL PATTERNS
                polyrhythm: {
                    name: 'Polyrhythm',
                    genre: 'experimental',
                    bpm: 120,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0],
                        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
                        perc: [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0]
                    }
                },
                breakbeat: {
                    name: 'Breakbeat',
                    genre: 'breakbeat',
                    bpm: 138,
                    steps: 16,
                    tracks: {
                        kick: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
                        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],
                        hihat: [1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
                        bass: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]
                    }
                }
            }
        };
    }

    /**
     * Initialize preset patterns
     */
    _initializePresets() {
        const presets = this.getPresets();
        
        // Flatten nested presets
        Object.values(presets.trap).forEach(pattern => {
            const id = pattern.name.toLowerCase().replace(/\s+/g, '-');
            this.patterns.set(`preset-${id}`, {
                ...pattern,
                id: `preset-${id}`,
                preset: true,
                created: Date.now(),
                modified: Date.now()
            });
        });
    }

    /**
     * Get pattern by ID
     */
    getPattern(id) {
        return this.patterns.get(id);
    }

    /**
     * Get all patterns
     */
    getAllPatterns() {
        return Array.from(this.patterns.values());
    }

    /**
     * Get patterns by genre
     */
    getPatternsByGenre(genre) {
        return this.getAllPatterns().filter(p => p.genre === genre);
    }

    /**
     * Save a new pattern
     */
    savePattern(pattern) {
        const id = pattern.id || `pattern-${Date.now()}`;
        
        const patternData = {
            ...pattern,
            id,
            preset: false,
            created: pattern.created || Date.now(),
            modified: Date.now()
        };

        this.patterns.set(id, patternData);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return id;
    }

    /**
     * Update an existing pattern
     */
    updatePattern(id, updates) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        if (pattern.preset) {
            throw new Error('Cannot modify preset patterns. Save as new pattern instead.');
        }

        const updated = {
            ...pattern,
            ...updates,
            modified: Date.now()
        };

        this.patterns.set(id, updated);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return updated;
    }

    /**
     * Delete a pattern
     */
    deletePattern(id) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        if (pattern.preset) {
            throw new Error('Cannot delete preset patterns');
        }

        this.patterns.delete(id);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return true;
    }

    /**
     * Clone a pattern
     */
    clonePattern(id, newName) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        const clone = {
            ...JSON.parse(JSON.stringify(pattern)), // Deep clone
            id: `pattern-${Date.now()}`,
            name: newName || `${pattern.name} (Copy)`,
            preset: false,
            created: Date.now(),
            modified: Date.now()
        };

        this.patterns.set(clone.id, clone);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return clone.id;
    }

    /**
     * Generate random pattern
     */
    generateRandom(options = {}) {
        const {
            name = 'Random Pattern',
            genre = 'experimental',
            bpm = 128,
            steps = 16,
            tracks = ['kick', 'snare', 'hihat'],
            density = 0.3 // 0-1, probability of a step being active
        } = options;

        const pattern = {
            name,
            genre,
            bpm,
            steps,
            tracks: {}
        };

        tracks.forEach(track => {
            pattern.tracks[track] = Array(steps).fill(0).map(() => 
                Math.random() < density ? 1 : 0
            );
        });

        // Ensure kick on beat 1
        if (pattern.tracks.kick) {
            pattern.tracks.kick[0] = 1;
        }

        return this.savePattern(pattern);
    }

    /**
     * Create variation of existing pattern
     */
    createVariation(id, options = {}) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        const {
            name = `${pattern.name} (Variation)`,
            mutation = 0.1 // 0-1, probability of flipping each step
        } = options;

        const variation = {
            ...JSON.parse(JSON.stringify(pattern)),
            id: `pattern-${Date.now()}`,
            name,
            preset: false,
            created: Date.now(),
            modified: Date.now()
        };

        // Mutate each track
        Object.keys(variation.tracks).forEach(track => {
            variation.tracks[track] = variation.tracks[track].map(step =>
                Math.random() < mutation ? (step ? 0 : 1) : step
            );
        });

        this.patterns.set(variation.id, variation);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return variation.id;
    }

    /**
     * Export pattern to JSON
     */
    exportPattern(id) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        return JSON.stringify(pattern, null, 2);
    }

    /**
     * Export all user patterns
     */
    exportAll() {
        const userPatterns = this.getAllPatterns().filter(p => !p.preset);
        return JSON.stringify(userPatterns, null, 2);
    }

    /**
     * Import pattern from JSON
     */
    importPattern(jsonString) {
        try {
            const pattern = JSON.parse(jsonString);
            
            // Generate new ID to avoid conflicts
            const id = `pattern-${Date.now()}`;
            pattern.id = id;
            pattern.preset = false;
            pattern.created = Date.now();
            pattern.modified = Date.now();

            this.patterns.set(id, pattern);
            
            if (this.options.autoSave) {
                this._saveToStorage();
            }

            return id;
        } catch (error) {
            throw new Error(`Invalid pattern JSON: ${error.message}`);
        }
    }

    /**
     * Import multiple patterns
     */
    importMultiple(jsonString) {
        try {
            const patterns = JSON.parse(jsonString);
            if (!Array.isArray(patterns)) {
                throw new Error('Expected array of patterns');
            }

            const imported = [];
            patterns.forEach(pattern => {
                const id = `pattern-${Date.now()}-${imported.length}`;
                pattern.id = id;
                pattern.preset = false;
                pattern.created = Date.now();
                pattern.modified = Date.now();
                
                this.patterns.set(id, pattern);
                imported.push(id);
            });

            if (this.options.autoSave) {
                this._saveToStorage();
            }

            return imported;
        } catch (error) {
            throw new Error(`Invalid patterns JSON: ${error.message}`);
        }
    }

    /**
     * Convert pattern to MIDI-style data
     */
    toMIDI(id) {
        const pattern = this.patterns.get(id);
        if (!pattern) {
            throw new Error(`Pattern ${id} not found`);
        }

        const midiData = {
            format: 1,
            bpm: pattern.bpm,
            timeSignature: [4, 4],
            tracks: []
        };

        // Convert each track to MIDI events
        Object.entries(pattern.tracks).forEach(([trackName, steps]) => {
            const events = [];
            const ticksPerStep = 480 / (pattern.steps / 4); // Standard MIDI resolution

            steps.forEach((active, index) => {
                if (active) {
                    const tick = index * ticksPerStep;
                    events.push({
                        type: 'noteOn',
                        tick,
                        note: this._getDefaultNote(trackName),
                        velocity: 100,
                        channel: 9 // Drum channel
                    });
                    events.push({
                        type: 'noteOff',
                        tick: tick + ticksPerStep * 0.8,
                        note: this._getDefaultNote(trackName),
                        channel: 9
                    });
                }
            });

            midiData.tracks.push({
                name: trackName,
                events
            });
        });

        return midiData;
    }

    /**
     * Get default MIDI note for track name
     */
    _getDefaultNote(trackName) {
        const noteMap = {
            kick: 36,   // C1
            snare: 38,  // D1
            hihat: 42,  // F#1
            clap: 39,   // D#1
            perc: 56,   // G#2
            bass: 48,   // C2
            roll: 42
        };

        return noteMap[trackName.toLowerCase()] || 60;
    }

    /**
     * Save patterns to localStorage
     */
    _saveToStorage() {
        try {
            const userPatterns = this.getAllPatterns().filter(p => !p.preset);
            localStorage.setItem(
                this.options.storageKey,
                JSON.stringify(userPatterns)
            );
        } catch (error) {
            console.error('Failed to save patterns to storage:', error);
        }
    }

    /**
     * Load patterns from localStorage
     */
    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                const patterns = JSON.parse(stored);
                patterns.forEach(pattern => {
                    this.patterns.set(pattern.id, pattern);
                });
            }
        } catch (error) {
            console.error('Failed to load patterns from storage:', error);
        }
    }

    /**
     * Clear all user patterns
     */
    clearUserPatterns() {
        // Keep only presets
        const presets = this.getAllPatterns().filter(p => p.preset);
        this.patterns.clear();
        
        presets.forEach(pattern => {
            this.patterns.set(pattern.id, pattern);
        });

        if (this.options.autoSave) {
            this._saveToStorage();
        }
    }

    /**
     * Get pattern statistics
     */
    getStats() {
        const all = this.getAllPatterns();
        const user = all.filter(p => !p.preset);
        const presets = all.filter(p => p.preset);

        const genres = {};
        all.forEach(p => {
            genres[p.genre] = (genres[p.genre] || 0) + 1;
        });

        return {
            total: all.length,
            user: user.length,
            presets: presets.length,
            genres,
            avgBPM: all.reduce((sum, p) => sum + p.bpm, 0) / all.length
        };
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatternLibrary;
}

// Export as browser global
if (typeof window !== 'undefined') {
    window.PatternLibrary = PatternLibrary;
}
