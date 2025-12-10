/**
 * HAOS State Manager
 *
 * Synchronizes presets, patterns, and settings between
 * haos-platform.html and studio.html using localStorage + API
 *
 * @module state-manager
 */

class HAOSStateManager {
    constructor() {
        this.apiBase = '/api/studio';
        this.syncInterval = 10000; // Sync every 10 seconds
        this.autoSync = true;
        this.lastSyncTime = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize state manager
     */
    async init() {
        console.log('🔄 HAOS State Manager initialized');

        // Load initial state from localStorage
        this.loadFromLocalStorage();

        // Sync with API
        await this.syncWithAPI();

        // Start auto-sync if enabled
        if (this.autoSync) {
            this.startAutoSync();
        }

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
    }

    /**
     * Load state from localStorage
     */
    loadFromLocalStorage() {
        const presets = localStorage.getItem('haos_presets');
        const patterns = localStorage.getItem('haos_patterns');
        const settings = localStorage.getItem('haos_settings');

        return {
            presets: presets ? JSON.parse(presets) : [],
            patterns: patterns ? JSON.parse(patterns) : [],
            settings: settings ? JSON.parse(settings) : {},
        };
    }

    /**
     * Save state to localStorage
     */
    saveToLocalStorage(type, data) {
        localStorage.setItem(`haos_${type}`, JSON.stringify(data));
        console.log(`💾 Saved ${type} to localStorage`);
    }

    /**
     * Sync with API server
     */
    async syncWithAPI() {
        try {
            const response = await fetch(`${this.apiBase}/sync`);
            const result = await response.json();

            if (result.success) {
                // Update localStorage with server data
                this.saveToLocalStorage('presets', result.data.presets);
                this.saveToLocalStorage('patterns', result.data.patterns);
                this.saveToLocalStorage('settings', result.data.settings);

                this.lastSyncTime = new Date().toISOString();
                console.log('✅ Synced with API server');

                // Dispatch event for UI to update
                window.dispatchEvent(new CustomEvent('haos:state-synced', {
                    detail: result.data,
                }));

                return result.data;
            }
        } catch (error) {
            console.warn('⚠️ API sync failed, using local storage:', error);
            return this.loadFromLocalStorage();
        }
    }

    /**
     * Push local state to API
     */
    async pushToAPI() {
        const localState = this.loadFromLocalStorage();

        try {
            const response = await fetch(`${this.apiBase}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(localState),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Pushed state to API');
                this.lastSyncTime = new Date().toISOString();
            }
        } catch (error) {
            console.warn('⚠️ Failed to push state to API:', error);
        }
    }

    /**
     * Start automatic synchronization
     */
    startAutoSync() {
        this.syncIntervalId = setInterval(() => {
            this.syncWithAPI();
        }, this.syncInterval);

        console.log(`🔄 Auto-sync started (every ${this.syncInterval / 1000}s)`);
    }

    /**
     * Stop automatic synchronization
     */
    stopAutoSync() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
            console.log('⏸️ Auto-sync stopped');
        }
    }

    /**
     * Handle storage changes from other tabs
     */
    handleStorageChange(event) {
        if (event.key && event.key.startsWith('haos_')) {
            const type = event.key.replace('haos_', '');
            console.log(`🔄 Storage changed: ${type}`);

            // Dispatch event for UI to update
            window.dispatchEvent(new CustomEvent('haos:storage-changed', {
                detail: {
                    type,
                    data: JSON.parse(event.newValue || '{}'),
                },
            }));
        }
    }

    // ========================================================================
    // Presets API
    // ========================================================================

    /**
     * Get all presets
     */
    async getPresets() {
        try {
            const response = await fetch(`${this.apiBase}/presets`);
            const result = await response.json();

            if (result.success) {
                this.saveToLocalStorage('presets', result.presets);
                return result.presets;
            }
        } catch (error) {
            console.warn('Using local presets:', error);
            return this.loadFromLocalStorage().presets;
        }
    }

    /**
     * Save a preset
     */
    async savePreset(name, type, parameters) {
        const preset = { name, type, parameters };

        try {
            const response = await fetch(`${this.apiBase}/presets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preset),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Preset saved:', result.preset.name);

                // Update local storage
                const presets = await this.getPresets();

                // Dispatch event
                window.dispatchEvent(new CustomEvent('haos:preset-saved', {
                    detail: result.preset,
                }));

                return result.preset;
            }
        } catch (error) {
            console.warn('Failed to save preset to API, saving locally:', error);

            // Fallback: save to localStorage
            const localPresets = this.loadFromLocalStorage().presets;
            const newPreset = {
                id: Date.now().toString(),
                name,
                type,
                parameters,
                createdAt: new Date().toISOString(),
            };
            localPresets.push(newPreset);
            this.saveToLocalStorage('presets', localPresets);

            return newPreset;
        }
    }

    /**
     * Delete a preset
     */
    async deletePreset(id) {
        try {
            const response = await fetch(`${this.apiBase}/presets/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Preset deleted');
                await this.getPresets(); // Refresh

                window.dispatchEvent(new CustomEvent('haos:preset-deleted', {
                    detail: { id },
                }));
            }
        } catch (error) {
            console.warn('Failed to delete preset:', error);
        }
    }

    // ========================================================================
    // Patterns API
    // ========================================================================

    /**
     * Get all patterns
     */
    async getPatterns() {
        try {
            const response = await fetch(`${this.apiBase}/patterns`);
            const result = await response.json();

            if (result.success) {
                this.saveToLocalStorage('patterns', result.patterns);
                return result.patterns;
            }
        } catch (error) {
            console.warn('Using local patterns:', error);
            return this.loadFromLocalStorage().patterns;
        }
    }

    /**
     * Save a pattern
     */
    async savePattern(name, steps, bpm) {
        const pattern = { name, steps, bpm };

        try {
            const response = await fetch(`${this.apiBase}/patterns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pattern),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Pattern saved:', result.pattern.name);

                // Update local storage
                await this.getPatterns();

                // Dispatch event
                window.dispatchEvent(new CustomEvent('haos:pattern-saved', {
                    detail: result.pattern,
                }));

                return result.pattern;
            }
        } catch (error) {
            console.warn('Failed to save pattern to API, saving locally:', error);

            // Fallback: save to localStorage
            const localPatterns = this.loadFromLocalStorage().patterns;
            const newPattern = {
                id: Date.now().toString(),
                name,
                steps,
                bpm,
                createdAt: new Date().toISOString(),
            };
            localPatterns.push(newPattern);
            this.saveToLocalStorage('patterns', localPatterns);

            return newPattern;
        }
    }

    /**
     * Delete a pattern
     */
    async deletePattern(id) {
        try {
            const response = await fetch(`${this.apiBase}/patterns/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Pattern deleted');
                await this.getPatterns(); // Refresh

                window.dispatchEvent(new CustomEvent('haos:pattern-deleted', {
                    detail: { id },
                }));
            }
        } catch (error) {
            console.warn('Failed to delete pattern:', error);
        }
    }

    // ========================================================================
    // Settings API
    // ========================================================================

    /**
     * Get all settings
     */
    async getSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            const result = await response.json();

            if (result.success) {
                this.saveToLocalStorage('settings', result.settings);
                return result.settings;
            }
        } catch (error) {
            console.warn('Using local settings:', error);
            return this.loadFromLocalStorage().settings;
        }
    }

    /**
     * Update settings
     */
    async updateSettings(settings) {
        try {
            const response = await fetch(`${this.apiBase}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Settings updated');
                this.saveToLocalStorage('settings', result.settings);

                window.dispatchEvent(new CustomEvent('haos:settings-updated', {
                    detail: result.settings,
                }));

                return result.settings;
            }
        } catch (error) {
            console.warn('Failed to update settings:', error);
            this.saveToLocalStorage('settings', settings);
            return settings;
        }
    }

    /**
     * Get a specific setting
     */
    getSetting(key, defaultValue = null) {
        const { settings } = this.loadFromLocalStorage();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    /**
     * Set a specific setting
     */
    async setSetting(key, value) {
        const settings = await this.getSettings();
        settings[key] = value;
        return this.updateSettings(settings);
    }
}

// Create global instance
window.HAOSState = new HAOSStateManager();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HAOSStateManager;
}
