/**
 * HAOS Admin Feature Toggle System
 * Manages enabling/disabling of instruments, services, and core functionalities
 */

class HAOSAdminFeatureToggle {
    constructor() {
        this.features = new Map();
        this.instruments = new Map();
        this.services = new Map();
        this.listeners = new Set();
        this.apiEndpoint = '/api/admin/features';
        this.authRequired = true; // Enable authentication for admin features
        this.init();
    }

    async init() {
        await this.loadFeatureState();
        this.registerFeatures();
        this.registerInstruments();
        this.registerServices();
        this.setupRealtimeSync();
    }

    /**
     * Register core platform features
     */
    registerFeatures() {
        const coreFeatures = [
            {
                id: 'platform.auth',
                name: 'User Authentication',
                description: 'Login/logout, user sessions, OAuth providers',
                category: 'core',
                enabled: true,
                dependencies: [],
                impact: 'critical'
            },
            {
                id: 'platform.collaboration',
                name: 'Real-time Collaboration',
                description: 'Multi-user sessions, live collaboration features',
                category: 'core',
                enabled: true,
                dependencies: ['platform.auth'],
                impact: 'high'
            },
            {
                id: 'platform.presets',
                name: 'Preset Management',
                description: 'Save, load, and share instrument presets',
                category: 'core',
                enabled: true,
                dependencies: ['platform.auth'],
                impact: 'medium'
            },
            {
                id: 'platform.export',
                name: 'Audio Export',
                description: 'Export to WAV, MIDI, and other formats',
                category: 'core',
                enabled: true,
                dependencies: [],
                impact: 'medium'
            },
            {
                id: 'platform.radio',
                name: '24/7 Radio Stream',
                description: 'Continuous music streaming service',
                category: 'streaming',
                enabled: true,
                dependencies: [],
                impact: 'low'
            },
            {
                id: 'platform.virtualization',
                name: 'Audio Virtualization',
                description: 'Web Audio API, virtual instruments processing',
                category: 'audio',
                enabled: true,
                dependencies: [],
                impact: 'high'
            },
            {
                id: 'platform.midi',
                name: 'MIDI Support',
                description: 'MIDI input/output, hardware controller support',
                category: 'audio',
                enabled: true,
                dependencies: [],
                impact: 'medium'
            },
            {
                id: 'platform.analytics',
                name: 'Usage Analytics',
                description: 'Track usage patterns, performance metrics',
                category: 'monitoring',
                enabled: false,
                dependencies: [],
                impact: 'low'
            }
        ];

        coreFeatures.forEach(feature => {
            this.features.set(feature.id, feature);
        });
    }

    /**
     * Register individual instruments
     */
    registerInstruments() {
        const instruments = [
            {
                id: 'instrument.arp2600',
                name: 'ARP 2600 Synthesizer',
                description: 'Legendary semi-modular analog synthesizer',
                category: 'synthesizer',
                legendary: true,
                enabled: true,
                dependencies: ['platform.virtualization', 'platform.midi'],
                resources: { cpu: 'high', memory: 'medium', audio: 'high' },
                urls: ['/synth-2600.html', '/synth-2600-studio.html'],
                presetCount: 24,
                impact: 'high'
            },
            {
                id: 'instrument.violin',
                name: 'Virtual Violin',
                description: 'Expressive violin with realistic bowing physics',
                category: 'strings',
                enabled: true,
                dependencies: ['platform.virtualization'],
                resources: { cpu: 'medium', memory: 'medium', audio: 'high' },
                urls: ['/instruments/violin.html'],
                presetCount: 12,
                impact: 'medium'
            },
            {
                id: 'instrument.guitar',
                name: 'Virtual Guitar',
                description: 'Acoustic and electric guitar with effects',
                category: 'strings',
                enabled: true,
                dependencies: ['platform.virtualization'],
                resources: { cpu: 'medium', memory: 'low', audio: 'medium' },
                urls: ['/instruments/guitar.html'],
                presetCount: 16,
                impact: 'medium'
            },
            {
                id: 'instrument.drums',
                name: 'Drum Machine',
                description: '808/909-style drum machine with patterns',
                category: 'percussion',
                enabled: true,
                dependencies: ['platform.virtualization'],
                resources: { cpu: 'low', memory: 'low', audio: 'medium' },
                urls: ['/drum-machine.html'],
                presetCount: 32,
                impact: 'medium'
            },
            {
                id: 'instrument.tb303',
                name: 'TB-303 Bass',
                description: 'Classic acid bass synthesizer',
                category: 'synthesizer',
                enabled: true,
                dependencies: ['platform.virtualization', 'platform.midi'],
                resources: { cpu: 'medium', memory: 'low', audio: 'high' },
                urls: ['/tb-303.html'],
                presetCount: 20,
                impact: 'medium'
            }
        ];

        instruments.forEach(instrument => {
            this.instruments.set(instrument.id, instrument);
        });
    }

    /**
     * Register platform services
     */
    registerServices() {
        const services = [
            {
                id: 'service.workspace.techno',
                name: 'Techno Workspace',
                description: 'Live modular techno creation environment',
                category: 'workspace',
                enabled: true,
                dependencies: ['platform.virtualization', 'platform.collaboration'],
                resources: { cpu: 'high', memory: 'high', audio: 'high' },
                urls: ['/techno-workspace.html'],
                impact: 'high'
            },
            {
                id: 'service.workspace.intuitive',
                name: 'Intuitive Workspace',
                description: 'Simplified interface for beginners',
                category: 'workspace',
                enabled: true,
                dependencies: ['platform.virtualization'],
                resources: { cpu: 'medium', memory: 'medium', audio: 'medium' },
                urls: ['/techno-intuitive.html'],
                impact: 'medium'
            },
            {
                id: 'service.workspace.creator',
                name: 'Creator Workspace',
                description: 'Advanced production environment',
                category: 'workspace',
                enabled: true,
                dependencies: ['platform.virtualization', 'platform.presets'],
                resources: { cpu: 'high', memory: 'high', audio: 'high' },
                urls: ['/techno-creator.html'],
                impact: 'high'
            },
            {
                id: 'service.collaboration',
                name: 'Collaboration Engine',
                description: 'Real-time multi-user collaboration',
                category: 'collaboration',
                enabled: true,
                dependencies: ['platform.auth', 'platform.virtualization'],
                resources: { cpu: 'medium', memory: 'medium', network: 'high' },
                urls: ['/collab-studio.html'],
                impact: 'high'
            },
            {
                id: 'service.preset.library',
                name: 'Preset Library',
                description: 'Cloud preset storage and sharing',
                category: 'storage',
                enabled: true,
                dependencies: ['platform.auth', 'platform.presets'],
                resources: { storage: 'high', network: 'medium' },
                urls: ['/preset-library.html'],
                impact: 'medium'
            },
            {
                id: 'service.virtual.lab',
                name: 'Virtual Lab',
                description: 'Experimental instruments and features',
                category: 'experimental',
                enabled: false,
                dependencies: ['platform.virtualization'],
                resources: { cpu: 'high', memory: 'high', audio: 'high' },
                urls: ['/virtual-lab.html'],
                impact: 'low'
            }
        ];

        services.forEach(service => {
            this.services.set(service.id, service);
        });
    }

    /**
     * Toggle feature/instrument/service
     */
    async toggle(id, enabled) {
        const item = this.getItem(id);
        if (!item) {
            throw new Error(`Item with ID "${id}" not found`);
        }

        // Check dependencies before disabling
        if (!enabled && this.hasDependents(id)) {
            const dependents = this.getDependents(id);
            throw new Error(`Cannot disable "${item.name}" - required by: ${dependents.map(d => d.name).join(', ')}`);
        }

        // Check dependencies before enabling
        if (enabled && item.dependencies) {
            const missingDeps = item.dependencies.filter(depId => !this.isEnabled(depId));
            if (missingDeps.length > 0) {
                throw new Error(`Cannot enable "${item.name}" - missing dependencies: ${missingDeps.join(', ')}`);
            }
        }

        // Update state
        item.enabled = enabled;

        // Save to backend
        await this.saveFeatureState();

        // Apply changes
        await this.applyFeatureChanges(id, enabled);

        // Notify listeners
        this.notifyListeners('toggle', { id, enabled, item });

        return { success: true, item };
    }

    /**
     * Bulk toggle operations
     */
    async bulkToggle(operations) {
        const results = [];
        const errors = [];

        // Validate all operations first
        for (const op of operations) {
            try {
                this.validateToggle(op.id, op.enabled);
            } catch (error) {
                errors.push({ id: op.id, error: error.message });
            }
        }

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }

        // Apply all operations
        for (const op of operations) {
            try {
                const result = await this.toggle(op.id, op.enabled);
                results.push(result);
            } catch (error) {
                errors.push({ id: op.id, error: error.message });
            }
        }

        return { results, errors };
    }

    /**
     * Get current feature state
     */
    getFeatureState() {
        return {
            features: Array.from(this.features.entries()).map(([id, item]) => ({ id, ...item })),
            instruments: Array.from(this.instruments.entries()).map(([id, item]) => ({ id, ...item })),
            services: Array.from(this.services.entries()).map(([id, item]) => ({ id, ...item })),
            summary: this.getStateSummary()
        };
    }

    /**
     * Get state summary
     */
    getStateSummary() {
        const all = [...this.features.values(), ...this.instruments.values(), ...this.services.values()];
        
        return {
            total: all.length,
            enabled: all.filter(item => item.enabled).length,
            disabled: all.filter(item => !item.enabled).length,
            critical: all.filter(item => item.impact === 'critical').length,
            legendary: all.filter(item => item.legendary).length,
            categories: this.getCategorySummary(),
            resources: this.getResourceUsage()
        };
    }

    /**
     * Get category summary
     */
    getCategorySummary() {
        const categories = {};
        const all = [...this.features.values(), ...this.instruments.values(), ...this.services.values()];
        
        all.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = { total: 0, enabled: 0 };
            }
            categories[item.category].total++;
            if (item.enabled) categories[item.category].enabled++;
        });

        return categories;
    }

    /**
     * Get resource usage estimate
     */
    getResourceUsage() {
        const enabled = [...this.instruments.values(), ...this.services.values()].filter(item => item.enabled);
        
        const usage = {
            cpu: 0,
            memory: 0,
            audio: 0,
            network: 0,
            storage: 0
        };

        const weights = { low: 1, medium: 2, high: 3 };

        enabled.forEach(item => {
            if (item.resources) {
                Object.entries(item.resources).forEach(([resource, level]) => {
                    usage[resource] = (usage[resource] || 0) + (weights[level] || 0);
                });
            }
        });

        return usage;
    }

    /**
     * Apply feature changes to the platform
     */
    async applyFeatureChanges(id, enabled) {
        const item = this.getItem(id);
        
        if (item.urls) {
            // Update navigation visibility
            this.updateNavigationVisibility(item.urls, enabled);
        }

        if (item.category === 'core') {
            // Handle core feature changes
            await this.applyCoreFeatureChange(id, enabled);
        }

        // Trigger page refresh if needed
        if (item.impact === 'critical') {
            this.schedulePageRefresh();
        }
    }

    /**
     * Update navigation visibility
     */
    updateNavigationVisibility(urls, enabled) {
        urls.forEach(url => {
            const navLinks = document.querySelectorAll(`a[href="${url}"]`);
            navLinks.forEach(link => {
                if (enabled) {
                    link.style.display = '';
                    link.classList.remove('disabled');
                } else {
                    link.style.opacity = '0.3';
                    link.classList.add('disabled');
                    link.onclick = (e) => {
                        e.preventDefault();
                        alert('This feature is currently disabled by the administrator.');
                    };
                }
            });
        });
    }

    /**
     * Apply core feature changes
     */
    async applyCoreFeatureChange(id, enabled) {
        switch (id) {
            case 'platform.auth':
                if (!enabled) {
                    // Force logout all users
                    await fetch('/api/admin/force-logout-all', { method: 'POST' });
                }
                break;
                
            case 'platform.collaboration':
                if (!enabled) {
                    // Disconnect all collaboration sessions
                    if (window.haosCollaboration) {
                        window.haosCollaboration.disconnectAll();
                    }
                }
                break;
                
            case 'platform.virtualization':
                if (!enabled) {
                    // Stop all audio engines
                    if (window.audioContext) {
                        window.audioContext.suspend();
                    }
                }
                break;
        }
    }

    /**
     * Utility methods
     */
    getItem(id) {
        return this.features.get(id) || this.instruments.get(id) || this.services.get(id);
    }

    isEnabled(id) {
        const item = this.getItem(id);
        return item ? item.enabled : false;
    }

    hasDependents(id) {
        return this.getDependents(id).length > 0;
    }

    getDependents(id) {
        const all = [...this.features.values(), ...this.instruments.values(), ...this.services.values()];
        return all.filter(item => item.dependencies && item.dependencies.includes(id) && item.enabled);
    }

    validateToggle(id, enabled) {
        const item = this.getItem(id);
        if (!item) {
            throw new Error(`Item with ID "${id}" not found`);
        }

        if (!enabled && this.hasDependents(id)) {
            const dependents = this.getDependents(id);
            throw new Error(`Cannot disable "${item.name}" - required by: ${dependents.map(d => d.name).join(', ')}`);
        }

        if (enabled && item.dependencies) {
            const missingDeps = item.dependencies.filter(depId => !this.isEnabled(depId));
            if (missingDeps.length > 0) {
                throw new Error(`Cannot enable "${item.name}" - missing dependencies: ${missingDeps.join(', ')}`);
            }
        }
    }

    /**
     * Make authenticated API call
     */
    async authenticatedFetch(endpoint, options = {}) {
        if (this.authRequired && typeof window !== 'undefined' && window.authFetch) {
            return await window.authFetch(endpoint, options);
        }
        
        // Fallback to regular fetch if auth not available
        return await fetch(endpoint, options);
    }

    /**
     * Persistence methods with authentication
     */
    async loadFeatureState() {
        try {
            const response = await this.authenticatedFetch(`${this.apiEndpoint}/state`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.state) {
                    this.applyLoadedState(data.state);
                }
            }
        } catch (error) {
            console.log('Could not load feature state:', error.message);
        }
    }

    async saveFeatureState() {
        try {
            const state = this.getFeatureState();
            await this.authenticatedFetch(`${this.apiEndpoint}/state`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state })
            });
        } catch (error) {
            console.error('Could not save feature state:', error);
        }
    }

    applyLoadedState(state) {
        // Apply loaded state to features, instruments, and services
        ['features', 'instruments', 'services'].forEach(category => {
            if (state[category]) {
                state[category].forEach(item => {
                    const existing = this[category].get(item.id);
                    if (existing) {
                        existing.enabled = item.enabled;
                    }
                });
            }
        });
    }

    /**
     * Real-time synchronization
     */
    setupRealtimeSync() {
        // WebSocket connection for real-time feature updates
        if (window.WebSocket) {
            const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/admin/features`;
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'feature_toggle') {
                    this.handleRemoteToggle(data.payload);
                }
            };
            
            this.ws.onclose = () => {
                // Attempt reconnection
                setTimeout(() => this.setupRealtimeSync(), 5000);
            };
        }
    }

    handleRemoteToggle(payload) {
        const { id, enabled } = payload;
        const item = this.getItem(id);
        if (item) {
            item.enabled = enabled;
            this.applyFeatureChanges(id, enabled);
            this.notifyListeners('remote_toggle', { id, enabled, item });
        }
    }

    /**
     * Event system
     */
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Feature toggle listener error:', error);
            }
        });
    }

    schedulePageRefresh() {
        if (!this.refreshScheduled) {
            this.refreshScheduled = true;
            setTimeout(() => {
                if (confirm('Critical features have been modified. Refresh the page to apply changes?')) {
                    window.location.reload();
                }
                this.refreshScheduled = false;
            }, 1000);
        }
    }
}

// Initialize feature toggle system
if (typeof window !== 'undefined') {
    window.haosFeatureToggle = new HAOSAdminFeatureToggle();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HAOSAdminFeatureToggle;
}