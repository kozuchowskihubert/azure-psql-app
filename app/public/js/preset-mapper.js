/**
 * HAOS.fm Preset Mapper & UI/UX Enhancement System
 * Maps synthesizers to preset sounds with enhanced visual feedback
 * Provides intelligent categorization and user experience optimization
 */

class PresetMapper {
    constructor() {
        this.presets = {
            tb303: this.getTB303PresetMap(),
            tr808: this.getTR808PresetMap(),
            arp2600: this.getARP2600PresetMap(),
            stringMachine: this.getStringMachinePresetMap()
        };
        
        this.categories = this.getCategoryMap();
        this.colors = this.getColorScheme();
        this.icons = this.getIconMap();
    }
    
    /**
     * TB-303 Preset Mapping with UI/UX metadata
     */
    getTB303PresetMap() {
        return {
            'acid_squelch': {
                name: 'Acid Squelch',
                description: 'Classic 303 acid sound with high resonance',
                category: 'bass',
                subcategory: 'acid',
                difficulty: 'beginner',
                color: '#39FF14',
                icon: '🔊',
                tags: ['acid', 'techno', 'resonant', 'classic'],
                soundCharacter: {
                    brightness: 8,
                    warmth: 6,
                    aggression: 9,
                    complexity: 7
                },
                genre: ['techno', 'acid house', 'trance'],
                bpm: [120, 145],
                parameters: {
                    cutoff: 40,
                    resonance: 85,
                    envMod: 70,
                    decay: 30,
                    accent: 80
                },
                useCase: 'Main bassline for peak-time techno',
                visualWaveform: 'square-saw-resonant',
                previewNotes: [36, 48, 36, 60],  // C2, C3, C2, C4
                audioExample: '/audio/presets/tb303_acid_squelch.mp3'
            },
            
            'deep_bass': {
                name: 'Deep Bass',
                description: 'Sub-heavy bass for underground techno',
                category: 'bass',
                subcategory: 'sub',
                difficulty: 'beginner',
                color: '#FF6B35',
                icon: '🔉',
                tags: ['deep', 'sub', 'minimal', 'dark'],
                soundCharacter: {
                    brightness: 3,
                    warmth: 9,
                    aggression: 4,
                    complexity: 3
                },
                genre: ['minimal techno', 'deep house', 'dub techno'],
                bpm: [120, 128],
                parameters: {
                    cutoff: 25,
                    resonance: 30,
                    envMod: 20,
                    decay: 60,
                    accent: 40
                },
                useCase: 'Low-frequency foundation for minimal tracks',
                visualWaveform: 'sine-sub',
                previewNotes: [24, 31, 24, 36],  // C1, G1, C1, C2
                audioExample: '/audio/presets/tb303_deep_bass.mp3'
            },
            
            'plucky_lead': {
                name: 'Plucky Lead',
                description: 'Percussive pluck for melodic sequences',
                category: 'lead',
                subcategory: 'pluck',
                difficulty: 'intermediate',
                color: '#00FFFF',
                icon: '🎵',
                tags: ['pluck', 'melodic', 'percussive', 'bright'],
                soundCharacter: {
                    brightness: 9,
                    warmth: 4,
                    aggression: 6,
                    complexity: 5
                },
                genre: ['techno', 'electro', 'industrial'],
                bpm: [128, 145],
                parameters: {
                    cutoff: 70,
                    resonance: 40,
                    envMod: 90,
                    decay: 15,
                    accent: 70
                },
                useCase: 'Melodic sequences and arpeggios',
                visualWaveform: 'saw-pluck',
                previewNotes: [60, 64, 67, 72],  // C4, E4, G4, C5
                audioExample: '/audio/presets/tb303_plucky_lead.mp3'
            },
            
            'rubbery_bass': {
                name: 'Rubbery Bass',
                description: 'Bouncy, elastic bass character',
                category: 'bass',
                subcategory: 'groove',
                difficulty: 'intermediate',
                color: '#FF00FF',
                icon: '🎸',
                tags: ['bouncy', 'groove', 'funky', 'elastic'],
                soundCharacter: {
                    brightness: 6,
                    warmth: 7,
                    aggression: 7,
                    complexity: 6
                },
                genre: ['techno', 'electro', 'acid'],
                bpm: [125, 135],
                parameters: {
                    cutoff: 50,
                    resonance: 70,
                    envMod: 60,
                    decay: 40,
                    accent: 65
                },
                useCase: 'Groovy basslines with character',
                visualWaveform: 'square-bounce',
                previewNotes: [36, 43, 48, 55],  // C2, G2, C3, G3
                audioExample: '/audio/presets/tb303_rubbery_bass.mp3'
            },
            
            'screaming_lead': {
                name: 'Screaming Lead',
                description: 'Aggressive high-resonance lead',
                category: 'lead',
                subcategory: 'aggressive',
                difficulty: 'advanced',
                color: '#FF0000',
                icon: '⚡',
                tags: ['aggressive', 'distorted', 'lead', 'wild'],
                soundCharacter: {
                    brightness: 10,
                    warmth: 3,
                    aggression: 10,
                    complexity: 8
                },
                genre: ['hard techno', 'industrial', 'acid'],
                bpm: [135, 150],
                parameters: {
                    cutoff: 85,
                    resonance: 95,
                    envMod: 85,
                    decay: 25,
                    accent: 90
                },
                useCase: 'Peak-time lead lines and hooks',
                visualWaveform: 'saw-distorted',
                previewNotes: [72, 76, 79, 84],  // C5, E5, G5, C6
                audioExample: '/audio/presets/tb303_screaming_lead.mp3'
            }
        };
    }
    
    /**
     * TR-808 Preset Mapping
     */
    getTR808PresetMap() {
        return {
            'classic_808': {
                name: 'Classic 808',
                description: 'Authentic 808 drum sound',
                category: 'drums',
                subcategory: 'classic',
                difficulty: 'beginner',
                color: '#909090',
                icon: '🥁',
                tags: ['808', 'classic', 'drums', 'authentic'],
                soundCharacter: {
                    punch: 8,
                    depth: 7,
                    snap: 6,
                    character: 8
                },
                genre: ['hip-hop', 'trap', 'techno'],
                bpm: [80, 150],
                useCase: 'Foundation for any electronic beat',
                visualPattern: 'kick-snare-hat-pattern',
                audioExample: '/audio/presets/tr808_classic.mp3'
            },
            
            'trap_808': {
                name: 'Trap 808',
                description: 'Modern trap-style 808 with sub',
                category: 'drums',
                subcategory: 'trap',
                difficulty: 'intermediate',
                color: '#FF006E',
                icon: '🔥',
                tags: ['trap', 'sub', 'modern', 'heavy'],
                soundCharacter: {
                    punch: 9,
                    depth: 10,
                    snap: 7,
                    character: 9
                },
                genre: ['trap', 'hip-hop', 'drill'],
                bpm: [60, 80],
                useCase: 'Heavy trap sub bass and drums',
                visualPattern: 'trap-pattern',
                audioExample: '/audio/presets/tr808_trap.mp3'
            },
            
            'techno_808': {
                name: 'Techno 808',
                description: 'Hard-hitting techno drums',
                category: 'drums',
                subcategory: 'techno',
                difficulty: 'intermediate',
                color: '#39FF14',
                icon: '⚙️',
                tags: ['techno', 'hard', 'industrial', 'driving'],
                soundCharacter: {
                    punch: 10,
                    depth: 6,
                    snap: 9,
                    character: 7
                },
                genre: ['techno', 'industrial', 'electro'],
                bpm: [125, 145],
                useCase: 'Peak-time techno percussion',
                visualPattern: 'four-floor-pattern',
                audioExample: '/audio/presets/tr808_techno.mp3'
            }
        };
    }
    
    /**
     * ARP-2600 Preset Mapping
     */
    getARP2600PresetMap() {
        return {
            'acid_bass': {
                name: 'TB-303 Acid',
                description: 'Classic 303-style resonant bass',
                category: 'bass',
                subcategory: 'acid',
                difficulty: 'intermediate',
                color: '#39FF14',
                icon: '🔊',
                tags: ['acid', 'resonant', '303-style', 'classic'],
                soundCharacter: {
                    brightness: 8,
                    warmth: 6,
                    aggression: 9,
                    complexity: 7
                },
                genre: ['acid', 'techno', 'trance'],
                bpm: [120, 145],
                modulation: {
                    filterSweep: 'high',
                    lfoAmount: 'medium',
                    envDepth: 'high'
                },
                useCase: 'Squelchy acid basslines',
                visualWaveform: 'resonant-sweep',
                audioExample: '/audio/presets/arp2600_acid.mp3'
            },
            
            'techno_bass': {
                name: 'Techno Bass',
                description: 'Deep sub bass with filter',
                category: 'bass',
                subcategory: 'techno',
                difficulty: 'beginner',
                color: '#FF6B35',
                icon: '🎸',
                tags: ['techno', 'sub', 'deep', 'foundational'],
                soundCharacter: {
                    brightness: 5,
                    warmth: 9,
                    aggression: 6,
                    complexity: 5
                },
                genre: ['techno', 'minimal', 'dub'],
                bpm: [120, 135],
                modulation: {
                    filterSweep: 'low',
                    lfoAmount: 'low',
                    envDepth: 'medium'
                },
                useCase: 'Foundational bass for techno tracks',
                visualWaveform: 'sub-bass',
                audioExample: '/audio/presets/arp2600_techno_bass.mp3'
            },
            
            'pad': {
                name: 'Dub Pad',
                description: 'Lush atmospheric pad with LFO',
                category: 'pad',
                subcategory: 'ambient',
                difficulty: 'intermediate',
                color: '#00FFFF',
                icon: '🌊',
                tags: ['pad', 'ambient', 'lush', 'atmospheric'],
                soundCharacter: {
                    brightness: 6,
                    warmth: 8,
                    aggression: 3,
                    complexity: 7
                },
                genre: ['dub techno', 'ambient', 'minimal'],
                bpm: [115, 128],
                modulation: {
                    filterSweep: 'medium',
                    lfoAmount: 'high',
                    envDepth: 'low'
                },
                useCase: 'Atmospheric backgrounds and breakdowns',
                visualWaveform: 'pad-wash',
                audioExample: '/audio/presets/arp2600_pad.mp3'
            },
            
            'lead': {
                name: 'Lead Synth',
                description: 'Bright resonant lead tones',
                category: 'lead',
                subcategory: 'melodic',
                difficulty: 'intermediate',
                color: '#FF00FF',
                icon: '🎹',
                tags: ['lead', 'bright', 'melodic', 'resonant'],
                soundCharacter: {
                    brightness: 9,
                    warmth: 5,
                    aggression: 7,
                    complexity: 6
                },
                genre: ['techno', 'trance', 'electro'],
                bpm: [128, 140],
                modulation: {
                    filterSweep: 'high',
                    lfoAmount: 'medium',
                    envDepth: 'high'
                },
                useCase: 'Melodic sequences and hooks',
                visualWaveform: 'lead-bright',
                audioExample: '/audio/presets/arp2600_lead.mp3'
            },
            
            'pluck': {
                name: 'Pluck',
                description: 'Percussive pluck sound',
                category: 'pluck',
                subcategory: 'percussive',
                difficulty: 'beginner',
                color: '#FFFF00',
                icon: '🎵',
                tags: ['pluck', 'percussive', 'short', 'staccato'],
                soundCharacter: {
                    brightness: 8,
                    warmth: 4,
                    aggression: 5,
                    complexity: 4
                },
                genre: ['techno', 'minimal', 'house'],
                bpm: [120, 135],
                modulation: {
                    filterSweep: 'high',
                    lfoAmount: 'low',
                    envDepth: 'very high'
                },
                useCase: 'Rhythmic melodic elements',
                visualWaveform: 'pluck-short',
                audioExample: '/audio/presets/arp2600_pluck.mp3'
            },
            
            'brass': {
                name: 'Brass',
                description: 'Fat brass sound',
                category: 'brass',
                subcategory: 'harmonic',
                difficulty: 'advanced',
                color: '#FFD700',
                icon: '🎺',
                tags: ['brass', 'fat', 'harmonic', 'rich'],
                soundCharacter: {
                    brightness: 7,
                    warmth: 8,
                    aggression: 6,
                    complexity: 8
                },
                genre: ['house', 'disco', 'funk'],
                bpm: [115, 128],
                modulation: {
                    filterSweep: 'medium',
                    lfoAmount: 'medium',
                    envDepth: 'medium'
                },
                useCase: 'Stabs and harmonic elements',
                visualWaveform: 'brass-fat',
                audioExample: '/audio/presets/arp2600_brass.mp3'
            }
        };
    }
    
    /**
     * String Machine Preset Mapping
     */
    getStringMachinePresetMap() {
        return {
            'lush_strings': {
                name: 'Lush Strings',
                description: 'Classic full string ensemble',
                category: 'strings',
                subcategory: 'ensemble',
                difficulty: 'beginner',
                color: '#9370DB',
                icon: '🎻',
                tags: ['strings', 'lush', 'ensemble', 'classic'],
                soundCharacter: {
                    brightness: 7,
                    warmth: 8,
                    richness: 9,
                    space: 7
                },
                genre: ['ambient', 'techno', 'house'],
                bpm: [100, 130],
                sections: {
                    violin: true,
                    viola: true,
                    cello: true,
                    brass: false
                },
                effects: {
                    chorus: 0.5,
                    reverb: 0.35,
                    vibrato: 0.15
                },
                useCase: 'Rich harmonic pads and atmospheres',
                visualWaveform: 'ensemble-chorus',
                audioExample: '/audio/presets/strings_lush.mp3'
            },
            
            'techno_pad': {
                name: 'Techno Pad',
                description: 'Wide detuned layers for buildups',
                category: 'pad',
                subcategory: 'techno',
                difficulty: 'intermediate',
                color: '#39FF14',
                icon: '🌊',
                tags: ['pad', 'techno', 'wide', 'buildup'],
                soundCharacter: {
                    brightness: 8,
                    warmth: 6,
                    richness: 8,
                    space: 9
                },
                genre: ['techno', 'progressive', 'trance'],
                bpm: [120, 135],
                sections: {
                    violin: true,
                    viola: true,
                    cello: false,
                    brass: false
                },
                effects: {
                    chorus: 0.7,
                    reverb: 0.5,
                    vibrato: 0
                },
                useCase: 'Atmospheric buildups and breakdowns',
                visualWaveform: 'wide-stereo',
                audioExample: '/audio/presets/strings_techno_pad.mp3'
            },
            
            'dark_ambient': {
                name: 'Dark Ambient',
                description: 'Low frequency wash for dark atmospheres',
                category: 'ambient',
                subcategory: 'dark',
                difficulty: 'intermediate',
                color: '#1a1a2e',
                icon: '🌑',
                tags: ['dark', 'ambient', 'low', 'atmospheric'],
                soundCharacter: {
                    brightness: 3,
                    warmth: 7,
                    richness: 8,
                    space: 10
                },
                genre: ['minimal', 'ambient', 'industrial'],
                bpm: [110, 125],
                sections: {
                    violin: false,
                    viola: true,
                    cello: true,
                    brass: false
                },
                effects: {
                    chorus: 0.3,
                    reverb: 0.6,
                    vibrato: 0.1
                },
                useCase: 'Dark undercurrent and tension',
                visualWaveform: 'low-rumble',
                audioExample: '/audio/presets/strings_dark_ambient.mp3'
            },
            
            'brass_section': {
                name: 'Brass Section',
                description: 'Punchy brass stabs',
                category: 'brass',
                subcategory: 'stabs',
                difficulty: 'beginner',
                color: '#FFD700',
                icon: '🎺',
                tags: ['brass', 'stabs', 'punchy', 'bright'],
                soundCharacter: {
                    brightness: 9,
                    warmth: 7,
                    richness: 7,
                    space: 5
                },
                genre: ['house', 'disco', 'techno'],
                bpm: [115, 128],
                sections: {
                    violin: false,
                    viola: false,
                    cello: false,
                    brass: true
                },
                effects: {
                    chorus: 0.4,
                    reverb: 0.25,
                    vibrato: 0.2
                },
                useCase: 'Harmonic stabs and fills',
                visualWaveform: 'brass-punch',
                audioExample: '/audio/presets/strings_brass.mp3'
            },
            
            'ethereal_wash': {
                name: 'Ethereal Wash',
                description: 'Spacious atmosphere with heavy effects',
                category: 'ambient',
                subcategory: 'ethereal',
                difficulty: 'advanced',
                color: '#00CED1',
                icon: '✨',
                tags: ['ethereal', 'spacious', 'ambient', 'reverb'],
                soundCharacter: {
                    brightness: 6,
                    warmth: 6,
                    richness: 9,
                    space: 10
                },
                genre: ['ambient', 'dub techno', 'downtempo'],
                bpm: [90, 120],
                sections: {
                    violin: true,
                    viola: true,
                    cello: true,
                    brass: false
                },
                effects: {
                    chorus: 0.8,
                    reverb: 0.7,
                    vibrato: 0.25
                },
                useCase: 'Ambient backgrounds and intros',
                visualWaveform: 'ethereal-wash',
                audioExample: '/audio/presets/strings_ethereal.mp3'
            }
        };
    }
    
    /**
     * Category mapping for organization
     */
    getCategoryMap() {
        return {
            bass: {
                name: 'Bass',
                icon: '🔉',
                color: '#FF6B35',
                description: 'Low-frequency foundation sounds',
                subcategories: ['acid', 'sub', 'groove', 'techno']
            },
            lead: {
                name: 'Lead',
                icon: '🎹',
                color: '#FF00FF',
                description: 'Melodic lead sounds',
                subcategories: ['pluck', 'aggressive', 'melodic', 'bright']
            },
            pad: {
                name: 'Pad',
                icon: '🌊',
                color: '#00FFFF',
                description: 'Atmospheric pad sounds',
                subcategories: ['ambient', 'techno', 'lush', 'dark']
            },
            drums: {
                name: 'Drums',
                icon: '🥁',
                color: '#909090',
                description: 'Rhythmic percussion',
                subcategories: ['classic', 'trap', 'techno', 'industrial']
            },
            strings: {
                name: 'Strings',
                icon: '🎻',
                color: '#9370DB',
                description: 'String ensemble sounds',
                subcategories: ['ensemble', 'dark', 'bright', 'ethereal']
            },
            brass: {
                name: 'Brass',
                icon: '🎺',
                color: '#FFD700',
                description: 'Brass and horn sounds',
                subcategories: ['stabs', 'harmonic', 'fat', 'punchy']
            },
            pluck: {
                name: 'Pluck',
                icon: '🎵',
                color: '#FFFF00',
                description: 'Percussive pluck sounds',
                subcategories: ['percussive', 'staccato', 'melodic']
            },
            ambient: {
                name: 'Ambient',
                icon: '✨',
                color: '#00CED1',
                description: 'Atmospheric textures',
                subcategories: ['dark', 'ethereal', 'space', 'minimal']
            }
        };
    }
    
    /**
     * Color scheme for visual consistency
     */
    getColorScheme() {
        return {
            difficulty: {
                beginner: '#00FF41',
                intermediate: '#FFD700',
                advanced: '#FF6B35',
                expert: '#FF0000'
            },
            soundCharacter: {
                bright: '#FFFF00',
                warm: '#FF6B35',
                dark: '#1a1a2e',
                aggressive: '#FF0000',
                smooth: '#9370DB'
            },
            genre: {
                techno: '#39FF14',
                trap: '#FF006E',
                house: '#00FFFF',
                ambient: '#9370DB',
                industrial: '#909090'
            }
        };
    }
    
    /**
     * Icon mapping for visual representation
     */
    getIconMap() {
        return {
            synth: {
                tb303: '🔊',
                tr808: '🥁',
                arp2600: '🎛️',
                stringMachine: '🎻'
            },
            category: {
                bass: '🔉',
                lead: '🎹',
                pad: '🌊',
                drums: '🥁',
                strings: '🎻',
                brass: '🎺',
                pluck: '🎵',
                ambient: '✨'
            },
            action: {
                play: '▶️',
                stop: '⏹️',
                save: '💾',
                load: '📂',
                favorite: '⭐',
                share: '🔗'
            }
        };
    }
    
    /**
     * Get all presets for a synth
     */
    getPresetsForSynth(synthName) {
        return this.presets[synthName] || {};
    }
    
    /**
     * Get presets by category
     */
    getPresetsByCategory(category) {
        const results = {};
        
        Object.keys(this.presets).forEach(synthName => {
            const synthPresets = this.presets[synthName];
            Object.keys(synthPresets).forEach(presetKey => {
                const preset = synthPresets[presetKey];
                if (preset.category === category) {
                    if (!results[synthName]) {
                        results[synthName] = {};
                    }
                    results[synthName][presetKey] = preset;
                }
            });
        });
        
        return results;
    }
    
    /**
     * Get presets by genre
     */
    getPresetsByGenre(genre) {
        const results = {};
        
        Object.keys(this.presets).forEach(synthName => {
            const synthPresets = this.presets[synthName];
            Object.keys(synthPresets).forEach(presetKey => {
                const preset = synthPresets[presetKey];
                if (preset.genre && preset.genre.includes(genre)) {
                    if (!results[synthName]) {
                        results[synthName] = {};
                    }
                    results[synthName][presetKey] = preset;
                }
            });
        });
        
        return results;
    }
    
    /**
     * Get presets by difficulty
     */
    getPresetsByDifficulty(difficulty) {
        const results = {};
        
        Object.keys(this.presets).forEach(synthName => {
            const synthPresets = this.presets[synthName];
            Object.keys(synthPresets).forEach(presetKey => {
                const preset = synthPresets[presetKey];
                if (preset.difficulty === difficulty) {
                    if (!results[synthName]) {
                        results[synthName] = {};
                    }
                    results[synthName][presetKey] = preset;
                }
            });
        });
        
        return results;
    }
    
    /**
     * Search presets by tags
     */
    searchPresetsByTags(tags) {
        const results = {};
        const searchTags = Array.isArray(tags) ? tags : [tags];
        
        Object.keys(this.presets).forEach(synthName => {
            const synthPresets = this.presets[synthName];
            Object.keys(synthPresets).forEach(presetKey => {
                const preset = synthPresets[presetKey];
                if (preset.tags) {
                    const hasTag = searchTags.some(tag => 
                        preset.tags.some(presetTag => 
                            presetTag.toLowerCase().includes(tag.toLowerCase())
                        )
                    );
                    
                    if (hasTag) {
                        if (!results[synthName]) {
                            results[synthName] = {};
                        }
                        results[synthName][presetKey] = preset;
                    }
                }
            });
        });
        
        return results;
    }
    
    /**
     * Get preset recommendations based on current context
     */
    getRecommendations(context = {}) {
        const { genre, bpm, category, currentSynth } = context;
        const recommendations = [];
        
        Object.keys(this.presets).forEach(synthName => {
            const synthPresets = this.presets[synthName];
            Object.keys(synthPresets).forEach(presetKey => {
                const preset = synthPresets[presetKey];
                let score = 0;
                
                // Genre matching
                if (genre && preset.genre && preset.genre.includes(genre)) {
                    score += 3;
                }
                
                // BPM matching
                if (bpm && preset.bpm) {
                    if (bpm >= preset.bpm[0] && bpm <= preset.bpm[1]) {
                        score += 2;
                    }
                }
                
                // Category matching
                if (category && preset.category === category) {
                    score += 2;
                }
                
                // Prefer different synth for variety
                if (currentSynth && synthName !== currentSynth) {
                    score += 1;
                }
                
                if (score > 0) {
                    recommendations.push({
                        synth: synthName,
                        presetKey,
                        preset,
                        score
                    });
                }
            });
        });
        
        // Sort by score
        recommendations.sort((a, b) => b.score - a.score);
        
        return recommendations.slice(0, 10);  // Top 10 recommendations
    }
    
    /**
     * Generate preset card HTML
     */
    generatePresetCard(synthName, presetKey, preset) {
        const difficulty = preset.difficulty || 'intermediate';
        const difficultyColor = this.colors.difficulty[difficulty];
        
        return `
            <div class="preset-card" 
                 data-synth="${synthName}" 
                 data-preset="${presetKey}"
                 data-category="${preset.category}"
                 data-difficulty="${difficulty}"
                 style="background: linear-gradient(135deg, ${preset.color}15, ${preset.color}30); border: 2px solid ${preset.color}; cursor: pointer; border-radius: 12px; padding: 20px; transition: all 0.3s;">
                
                <div class="preset-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div class="preset-icon" style="font-size: 2.5em;">${preset.icon}</div>
                    <div class="preset-difficulty" style="background: ${difficultyColor}; color: #000; padding: 4px 10px; border-radius: 12px; font-size: 0.7em; font-weight: bold; text-transform: uppercase;">
                        ${difficulty}
                    </div>
                </div>
                
                <h4 class="preset-name" style="color: ${preset.color}; margin: 0 0 8px 0; font-size: 1.1em;">
                    ${preset.name}
                </h4>
                
                <p class="preset-description" style="color: rgba(255,255,255,0.7); font-size: 0.85em; margin: 0 0 12px 0; min-height: 40px;">
                    ${preset.description}
                </p>
                
                <div class="preset-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
                    ${preset.tags.slice(0, 3).map(tag => `
                        <span style="background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); padding: 3px 8px; border-radius: 10px; font-size: 0.7em;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
                
                <div class="preset-character" style="margin-bottom: 12px;">
                    ${this.generateCharacterBars(preset.soundCharacter)}
                </div>
                
                <div class="preset-actions" style="display: flex; gap: 8px; justify-content: space-between;">
                    <button class="preset-play-btn" onclick="previewPreset('${synthName}', '${presetKey}')" 
                            style="flex: 1; background: ${preset.color}; color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                        ▶️ Preview
                    </button>
                    <button class="preset-load-btn" onclick="loadPreset('${synthName}', '${presetKey}')"
                            style="flex: 1; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid ${preset.color}; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                        📂 Load
                    </button>
                </div>
                
                <div class="preset-meta" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.75em; color: rgba(255,255,255,0.5);">
                    <div>Genre: ${preset.genre.join(', ')}</div>
                    ${preset.bpm ? `<div>BPM: ${preset.bpm[0]}-${preset.bpm[1]}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Generate character bars for sound characteristics
     */
    generateCharacterBars(character) {
        if (!character) return '';
        
        const bars = [];
        Object.keys(character).forEach(trait => {
            const value = character[trait];
            const percentage = (value / 10) * 100;
            
            bars.push(`
                <div style="margin-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.7em; color: rgba(255,255,255,0.6); margin-bottom: 3px;">
                        <span style="text-transform: capitalize;">${trait}</span>
                        <span>${value}/10</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #39FF14, #00FFFF); height: 100%; width: ${percentage}%; transition: width 0.5s;"></div>
                    </div>
                </div>
            `);
        });
        
        return bars.join('');
    }
}

// Create and export singleton instance
const presetMapper = new PresetMapper();

// Export for ES6 modules
export default presetMapper;

// Also support CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = presetMapper;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.presetMapper = presetMapper;
}
