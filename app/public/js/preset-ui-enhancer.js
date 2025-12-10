/**
 * HAOS.fm Preset UI Enhancer
 * Enhanced UX/UI components for preset visualization and selection
 * Integrates with preset-mapper.js for better user experience
 */

export class PresetUIEnhancer {
    constructor(presetMapper) {
        this.presetMapper = presetMapper;
        this.colors = {
            difficulty: {
                beginner: '#39FF14',
                intermediate: '#FF6B35',
                advanced: '#FF1493',
                expert: '#00FFFF',
            },
            soundCharacter: {
                brightness: '#FFD700',
                warmth: '#FF6B35',
                aggression: '#FF1493',
                complexity: '#00FFFF',
            },
            genre: {
                techno: '#39FF14',
                trap: '#FF6B35',
                house: '#FFD700',
                ambient: '#00FFFF',
                industrial: '#FF1493',
                minimal: '#FFFFFF',
                'acid house': '#39FF14',
            },
        };
    }

    /**
     * Generate enhanced preset card with visual feedback
     * @param {string} synthName - Synth identifier
     * @param {string} presetKey - Preset key
     * @param {object} preset - Preset metadata
     * @param {string} theme - 'techno' or 'trap'
     * @returns {string} HTML string
     */
    generateEnhancedCard(synthName, presetKey, preset, theme = 'techno') {
        const themeColors = theme === 'techno' ? {
            accent: '#39FF14',
            secondary: '#FF6B35',
        } : {
            accent: '#FF6B35',
            secondary: '#39FF14',
        };

        return `
            <div class="enhanced-preset-card" 
                 data-synth="${synthName}"
                 data-preset="${presetKey}"
                 style="
                     background: rgba(26,26,46,0.9);
                     border-radius: 12px;
                     padding: 20px;
                     border-left: 4px solid ${preset.color || themeColors.accent};
                     cursor: pointer;
                     transition: all 0.3s;
                     margin-bottom: 15px;
                 "
                 onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 5px 20px rgba(57,255,20,0.3)'"
                 onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                
                <!-- Header with Preset Name and Difficulty -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5em;">${preset.icon || '🎵'}</span>
                        <h3 style="color: ${themeColors.accent}; font-family: 'Bebas Neue', sans-serif; font-size: 1.4em; margin: 0;">
                            ${preset.name}
                        </h3>
                    </div>
                    
                    <span class="difficulty-badge" style="
                        background: ${this.colors.difficulty[preset.difficulty]};
                        color: #000;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 0.75em;
                        font-weight: bold;
                        text-transform: uppercase;
                    ">
                        ${preset.difficulty}
                    </span>
                </div>
                
                <!-- Description -->
                <p style="color: rgba(255,255,255,0.7); font-size: 0.9em; margin-bottom: 15px; line-height: 1.4;">
                    ${preset.description}
                </p>
                
                <!-- Sound Character Visualization -->
                <div class="sound-character-bars" style="margin-bottom: 15px;">
                    ${this.generateCharacterBars(preset.soundCharacter, themeColors.accent)}
                </div>
                
                <!-- Metadata Tags -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                    <!-- Genre Tags -->
                    ${preset.genre.map(g => `
                        <span style="
                            background: ${this.colors.genre[g] || themeColors.secondary}33;
                            color: ${this.colors.genre[g] || themeColors.secondary};
                            padding: 4px 10px;
                            border-radius: 8px;
                            font-size: 0.75em;
                            border: 1px solid ${this.colors.genre[g] || themeColors.secondary};
                        ">
                            ${g}
                        </span>
                    `).join('')}
                    
                    <!-- BPM Range -->
                    <span style="
                        background: rgba(255,255,255,0.1);
                        color: #FFD700;
                        padding: 4px 10px;
                        border-radius: 8px;
                        font-size: 0.75em;
                        border: 1px solid #FFD700;
                    ">
                        ${preset.bpm[0]}-${preset.bpm[1]} BPM
                    </span>
                </div>
                
                <!-- Use Case -->
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 10px;
                    border-radius: 8px;
                    border-left: 3px solid ${themeColors.secondary};
                    margin-bottom: 12px;
                ">
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.85em; margin: 0;">
                        <strong style="color: ${themeColors.secondary};">💡 Use Case:</strong> ${preset.useCase}
                    </p>
                </div>
                
                <!-- Waveform Visual -->
                <div style="text-align: center; color: rgba(255,255,255,0.5); font-size: 0.8em;">
                    ${this.getWaveformIcon(preset.visualWaveform)}
                </div>
            </div>
        `;
    }

    /**
     * Generate character bars with visual feedback
     */
    generateCharacterBars(soundCharacter, accentColor) {
        const chars = ['brightness', 'warmth', 'aggression', 'complexity'];
        return chars.map(char => {
            const value = soundCharacter[char] || 0;
            const percentage = (value / 10) * 100;
            const color = this.colors.soundCharacter[char];

            return `
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span style="color: ${color}; font-size: 0.75em; text-transform: uppercase; font-weight: bold;">
                            ${char}
                        </span>
                        <span style="color: rgba(255,255,255,0.6); font-size: 0.75em;">
                            ${value}/10
                        </span>
                    </div>
                    <div style="
                        background: rgba(0,0,0,0.5);
                        height: 6px;
                        border-radius: 3px;
                        overflow: hidden;
                        border: 1px solid ${color}33;
                    ">
                        <div style="
                            width: ${percentage}%;
                            height: 100%;
                            background: linear-gradient(90deg, ${color}88, ${color});
                            transition: width 0.3s;
                            box-shadow: 0 0 10px ${color}88;
                        "></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get waveform icon based on type
     */
    getWaveformIcon(waveform) {
        const icons = {
            sawtooth: '🌊 Sawtooth Wave',
            square: '⬜ Square Wave',
            sine: '〰️ Sine Wave',
            complex: '🌀 Complex Wave',
            noise: '📡 Noise',
        };
        return icons[waveform] || '🎵 Waveform';
    }

    /**
     * Create filter panel for preset browsing
     */
    createFilterPanel(containerId, synthName, onFilterChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const presets = this.presetMapper.getPresetsForSynth(synthName);
        const categories = [...new Set(Object.values(presets).map(p => p.category))];
        const genres = [...new Set(Object.values(presets).flatMap(p => p.genre))];
        const difficulties = [...new Set(Object.values(presets).map(p => p.difficulty))];

        container.innerHTML = `
            <div style="
                background: rgba(0,0,0,0.5);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 2px solid #39FF14;
            ">
                <h3 style="color: #39FF14; margin-bottom: 15px; font-family: 'Bebas Neue', sans-serif;">
                    🔍 FILTER PRESETS
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <!-- Category Filter -->
                    <div>
                        <label style="color: #FFD700; font-size: 0.85em; display: block; margin-bottom: 5px;">
                            Category
                        </label>
                        <select id="category-filter" style="
                            width: 100%;
                            background: rgba(0,0,0,0.7);
                            border: 1px solid #39FF14;
                            color: #fff;
                            padding: 8px;
                            border-radius: 6px;
                        ">
                            <option value="all">All</option>
                            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Genre Filter -->
                    <div>
                        <label style="color: #FFD700; font-size: 0.85em; display: block; margin-bottom: 5px;">
                            Genre
                        </label>
                        <select id="genre-filter" style="
                            width: 100%;
                            background: rgba(0,0,0,0.7);
                            border: 1px solid #39FF14;
                            color: #fff;
                            padding: 8px;
                            border-radius: 6px;
                        ">
                            <option value="all">All</option>
                            ${genres.map(genre => `<option value="${genre}">${genre}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Difficulty Filter -->
                    <div>
                        <label style="color: #FFD700; font-size: 0.85em; display: block; margin-bottom: 5px;">
                            Difficulty
                        </label>
                        <select id="difficulty-filter" style="
                            width: 100%;
                            background: rgba(0,0,0,0.7);
                            border: 1px solid #39FF14;
                            color: #fff;
                            padding: 8px;
                            border-radius: 6px;
                        ">
                            <option value="all">All</option>
                            ${difficulties.map(diff => `<option value="${diff}">${diff}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Search -->
                    <div>
                        <label style="color: #FFD700; font-size: 0.85em; display: block; margin-bottom: 5px;">
                            Search
                        </label>
                        <input type="text" id="preset-search" placeholder="Search..." style="
                            width: 100%;
                            background: rgba(0,0,0,0.7);
                            border: 1px solid #39FF14;
                            color: #fff;
                            padding: 8px;
                            border-radius: 6px;
                        ">
                    </div>
                </div>
                
                <!-- Reset Button -->
                <button onclick="resetPresetFilters()" style="
                    margin-top: 15px;
                    background: #FF6B35;
                    color: #000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    🔄 Reset Filters
                </button>
            </div>
        `;

        // Add event listeners
        ['category-filter', 'genre-filter', 'difficulty-filter', 'preset-search'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', onFilterChange);
                if (id === 'preset-search') {
                    element.addEventListener('input', onFilterChange);
                }
            }
        });
    }

    /**
     * Filter presets based on criteria
     */
    filterPresets(synthName, filters) {
        const presets = this.presetMapper.getPresetsForSynth(synthName);

        // Convert to array
        let presetArray = Object.entries(presets).map(([key, preset]) => ({
            key,
            ...preset,
        }));

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            presetArray = presetArray.filter(p => p.category === filters.category);
        }

        // Apply genre filter
        if (filters.genre && filters.genre !== 'all') {
            presetArray = presetArray.filter(p => p.genre.includes(filters.genre));
        }

        // Apply difficulty filter
        if (filters.difficulty && filters.difficulty !== 'all') {
            presetArray = presetArray.filter(p => p.difficulty === filters.difficulty);
        }

        // Apply search
        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            presetArray = presetArray.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm)),
            );
        }

        return presetArray;
    }

    /**
     * Render preset grid with enhanced cards
     */
    renderPresetGrid(containerId, synthName, presets, theme, onPresetClick) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (presets.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255,255,255,0.5);
                ">
                    <div style="font-size: 3em; margin-bottom: 20px;">😔</div>
                    <h3 style="color: #FF6B35; margin-bottom: 10px;">No Presets Found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = presets.map(preset => {
            const card = this.generateEnhancedCard(synthName, preset.key, preset, theme);
            return `<div onclick="loadPreset_${synthName}('${preset.key}')">${card}</div>`;
        }).join('');
    }

    /**
     * Create recommendation panel
     */
    createRecommendationPanel(containerId, synthName, context) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const recommendations = this.presetMapper.getRecommendations(context);
        const synthRecs = recommendations
            .filter(rec => rec.synthName === synthName)
            .slice(0, 3);

        if (synthRecs.length === 0) return;

        container.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(57,255,20,0.1), rgba(255,107,53,0.1));
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 2px solid #FFD700;
            ">
                <h3 style="color: #FFD700; margin-bottom: 15px; font-family: 'Bebas Neue', sans-serif;">
                    ⭐ RECOMMENDED FOR YOU
                </h3>
                
                <div style="display: grid; gap: 15px;">
                    ${synthRecs.map(rec => {
                        const preset = this.presetMapper.getPresetsForSynth(synthName)[rec.presetKey];
                        return this.generateEnhancedCard(synthName, rec.presetKey, preset, context.theme || 'techno');
                    }).join('')}
                </div>
            </div>
        `;
    }
}

// Export for use in studios
export default PresetUIEnhancer;
