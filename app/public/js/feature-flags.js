/**
 * HAOS Feature Flag System
 * Enables/disables features without redeployment
 */

class FeatureFlagManager {
    constructor() {
        this.config = null;
        this.loaded = false;
        this.cacheKey = 'haos_feature_flags';
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.configUrl = '/config/features.json';
    }

    /**
     * Load feature flags from config
     * Uses cache with TTL to minimize network requests
     */
    async loadFeatures() {
        // Check cache first
        const cached = this.getCachedConfig();
        if (cached) {
            this.config = cached;
            this.loaded = true;
            console.log('🎛️ Feature flags loaded from cache');
            return this.config;
        }

        try {
            // Fetch from server
            const response = await fetch(this.configUrl + '?t=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.config = await response.json();
            this.loaded = true;

            // Cache the config
            this.setCachedConfig(this.config);

            console.log(`🎛️ Feature flags loaded (v${this.config.version})`);
            console.log(`📅 Last updated: ${this.config.lastUpdated}`);

            return this.config;

        } catch (error) {
            console.error('❌ Failed to load feature flags:', error);
            
            // Fallback: all features enabled
            this.config = this.getDefaultConfig();
            this.loaded = true;
            
            console.warn('⚠️ Using default feature configuration (all enabled)');
            return this.config;
        }
    }

    /**
     * Check if a feature is enabled
     * @param {string} path - Feature path (e.g., 'haos_platform.midi_export')
     * @returns {boolean}
     */
    isEnabled(path) {
        if (!this.loaded) {
            console.warn('⚠️ Feature flags not loaded yet, defaulting to enabled');
            return true;
        }

        const parts = path.split('.');
        let current = this.config.features;

        for (const part of parts) {
            if (!current || !current[part]) {
                console.warn(`⚠️ Feature flag not found: ${path}`);
                return false;
            }

            // If it has 'enabled' property, return it
            if (current[part].hasOwnProperty('enabled')) {
                return current[part].enabled;
            }

            // Navigate deeper
            if (current[part].subFeatures) {
                current = current[part].subFeatures;
            } else {
                current = current[part];
            }
        }

        return false;
    }

    /**
     * Check if beta features should be shown
     */
    showBetaFeatures() {
        if (!this.loaded) return false;
        return this.config.features.global?.show_beta_features || false;
    }

    /**
     * Check if in maintenance mode
     */
    isMaintenanceMode() {
        if (!this.loaded) return false;
        return this.config.features.global?.maintenance_mode || false;
    }

    /**
     * Get all enabled features for a module
     * @param {string} module - Module name (e.g., 'haos_platform')
     */
    getEnabledFeatures(module) {
        if (!this.loaded) return [];

        const moduleConfig = this.config.features[module];
        if (!moduleConfig || !moduleConfig.subFeatures) {
            return [];
        }

        const enabled = [];
        for (const [key, feature] of Object.entries(moduleConfig.subFeatures)) {
            if (feature.enabled) {
                // Hide beta features unless explicitly enabled
                if (feature.beta && !this.showBetaFeatures()) {
                    continue;
                }
                enabled.push({
                    key,
                    description: feature.description,
                    beta: feature.beta || false
                });
            }
        }

        return enabled;
    }

    /**
     * Cache management
     */
    getCachedConfig() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age > this.cacheDuration) {
                localStorage.removeItem(this.cacheKey);
                return null;
            }

            return data;
        } catch (e) {
            return null;
        }
    }

    setCachedConfig(config) {
        try {
            const cacheData = {
                data: config,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('⚠️ Failed to cache feature flags');
        }
    }

    /**
     * Force refresh config (bypass cache)
     */
    async refresh() {
        localStorage.removeItem(this.cacheKey);
        return await this.loadFeatures();
    }

    /**
     * Default config (all features enabled)
     */
    getDefaultConfig() {
        return {
            version: '1.0.0-fallback',
            lastUpdated: new Date().toISOString(),
            features: {
                haos_platform: {
                    enabled: true,
                    subFeatures: {
                        midi_export: { enabled: true, description: 'MIDI Export', beta: false },
                        audio_recording: { enabled: true, description: 'Audio Recording', beta: false },
                        pattern_management: { enabled: true, description: 'Pattern Management', beta: false },
                        tb303_presets: { enabled: true, description: 'TB-303 Presets', beta: false }
                    }
                },
                global: {
                    maintenance_mode: false,
                    show_beta_features: false,
                    debug_mode: false
                }
            }
        };
    }

    /**
     * Debug: Show all feature states
     */
    debugFeatures() {
        if (!this.loaded) {
            console.log('Feature flags not loaded');
            return;
        }

        console.group('🎛️ Feature Flags Status');
        console.log('Version:', this.config.version);
        console.log('Last Updated:', this.config.lastUpdated);
        console.log('Show Beta:', this.showBetaFeatures());
        console.log('Maintenance Mode:', this.isMaintenanceMode());
        
        for (const [module, moduleConfig] of Object.entries(this.config.features)) {
            if (module === 'global') continue;
            
            console.group(`📦 ${module}`);
            if (moduleConfig.subFeatures) {
                for (const [feature, config] of Object.entries(moduleConfig.subFeatures)) {
                    const status = config.enabled ? '✅' : '❌';
                    const beta = config.beta ? ' [BETA]' : '';
                    console.log(`${status} ${feature}${beta} - ${config.description}`);
                }
            }
            console.groupEnd();
        }
        console.groupEnd();
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.FeatureFlags = new FeatureFlagManager();
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureFlagManager;
}
