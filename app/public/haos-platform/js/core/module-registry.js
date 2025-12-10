/**
 * HAOS Platform - Module Registry
 * Manages registration, loading, and lifecycle of audio modules
 * 
 * @version 1.0.0
 * @license MIT
 */

class ModuleRegistry {
    constructor() {
        this.modules = new Map(); // id -> module instance
        this.moduleDefinitions = new Map(); // name -> module class/definition
        this.categories = new Map(); // category -> module names[]
        this.loadedScripts = new Set();
        
        // Performance tracking
        this.totalCpuUsage = 0;
        this.performanceMonitor = null;
        
        // Event handlers
        this.eventHandlers = {};
        
        console.log('[ModuleRegistry] Initialized');
    }

    /**
     * Register a module definition (class or factory function)
     * @param {string} name - Module name
     * @param {Function} moduleClass - Module class constructor
     * @param {Object} metadata - Module metadata (category, tier, etc.)
     */
    register(name, moduleClass, metadata = {}) {
        if (this.moduleDefinitions.has(name)) {
            console.warn(`[ModuleRegistry] Module "${name}" already registered, overwriting`);
        }

        const definition = {
            name,
            class: moduleClass,
            category: metadata.category || 'utilities',
            tier: metadata.tier || 'free',
            cpuRating: metadata.cpuRating || 'medium',
            version: metadata.version || '1.0.0',
            author: metadata.author || 'HAOS Platform',
            description: metadata.description || '',
            icon: metadata.icon || '🎛️',
            tags: metadata.tags || [],
            scriptUrl: metadata.scriptUrl || null
        };

        this.moduleDefinitions.set(name, definition);

        // Add to category index
        const category = definition.category;
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        if (!this.categories.get(category).includes(name)) {
            this.categories.get(category).push(name);
        }

        console.log(`[ModuleRegistry] Registered module: ${name} (${category}, ${definition.tier})`);
        this.emit('moduleRegistered', { name, definition });

        return true;
    }

    /**
     * Create an instance of a module
     * @param {string} name - Module name
     * @param {Object} options - Module options
     * @returns {Promise<AudioModule>} Module instance
     */
    async createInstance(name, options = {}) {
        const definition = this.moduleDefinitions.get(name);
        
        if (!definition) {
            throw new Error(`[ModuleRegistry] Module "${name}" not found. Available: ${Array.from(this.moduleDefinitions.keys()).join(', ')}`);
        }

        // Check tier access (would integrate with subscription system)
        if (definition.tier === 'premium' && !this.checkPremiumAccess()) {
            throw new Error(`[ModuleRegistry] Premium module "${name}" requires premium subscription`);
        }

        try {
            // Create instance
            const ModuleClass = definition.class;
            const instance = new ModuleClass(name, definition.category, {
                ...definition,
                ...options
            });

            // Store instance
            this.modules.set(instance.id, instance);

            console.log(`[ModuleRegistry] Created instance: ${name} (ID: ${instance.id})`);
            this.emit('instanceCreated', { name, instance });

            return instance;
        } catch (error) {
            console.error(`[ModuleRegistry] Failed to create instance of "${name}":`, error);
            throw error;
        }
    }

    /**
     * Get a module instance by ID
     * @param {string} id - Module instance ID
     * @returns {AudioModule|null} Module instance or null
     */
    getInstance(id) {
        return this.modules.get(id) || null;
    }

    /**
     * Get all instances of a specific module type
     * @param {string} name - Module name
     * @returns {AudioModule[]} Array of module instances
     */
    getInstancesByName(name) {
        return Array.from(this.modules.values()).filter(m => m.name === name);
    }

    /**
     * Get all instances in a category
     * @param {string} category - Category name
     * @returns {AudioModule[]} Array of module instances
     */
    getInstancesByCategory(category) {
        return Array.from(this.modules.values()).filter(m => m.category === category);
    }

    /**
     * Remove and dispose a module instance
     * @param {string} id - Module instance ID
     */
    removeInstance(id) {
        const instance = this.modules.get(id);
        
        if (!instance) {
            console.warn(`[ModuleRegistry] Instance "${id}" not found`);
            return false;
        }

        try {
            // Dispose of the module
            instance.dispose();
            
            // Remove from registry
            this.modules.delete(id);
            
            console.log(`[ModuleRegistry] Removed instance: ${instance.name} (ID: ${id})`);
            this.emit('instanceRemoved', { id, name: instance.name });
            
            return true;
        } catch (error) {
            console.error(`[ModuleRegistry] Failed to remove instance "${id}":`, error);
            return false;
        }
    }

    /**
     * Load a module script dynamically
     * @param {string} url - Script URL
     * @returns {Promise<boolean>} Success status
     */
    async loadModuleScript(url) {
        if (this.loadedScripts.has(url)) {
            console.log(`[ModuleRegistry] Script already loaded: ${url}`);
            return true;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            script.onload = () => {
                this.loadedScripts.add(url);
                console.log(`[ModuleRegistry] Loaded script: ${url}`);
                this.emit('scriptLoaded', { url });
                resolve(true);
            };

            script.onerror = (error) => {
                console.error(`[ModuleRegistry] Failed to load script: ${url}`, error);
                reject(new Error(`Failed to load module script: ${url}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Install a module from URL or package
     * @param {string} source - Module URL or package name
     * @returns {Promise<boolean>} Success status
     */
    async install(source) {
        try {
            console.log(`[ModuleRegistry] Installing module from: ${source}`);

            // Load the module script
            await this.loadModuleScript(source);

            this.emit('moduleInstalled', { source });
            return true;
        } catch (error) {
            console.error(`[ModuleRegistry] Installation failed:`, error);
            this.emit('moduleInstallFailed', { source, error });
            return false;
        }
    }

    /**
     * Unregister a module definition
     * @param {string} name - Module name
     */
    unregister(name) {
        const definition = this.moduleDefinitions.get(name);
        
        if (!definition) {
            console.warn(`[ModuleRegistry] Module "${name}" not registered`);
            return false;
        }

        // Remove all instances of this module
        const instances = this.getInstancesByName(name);
        instances.forEach(instance => this.removeInstance(instance.id));

        // Remove from registry
        this.moduleDefinitions.delete(name);

        // Remove from category index
        const category = definition.category;
        if (this.categories.has(category)) {
            const modules = this.categories.get(category);
            this.categories.set(category, modules.filter(m => m !== name));
        }

        console.log(`[ModuleRegistry] Unregistered module: ${name}`);
        this.emit('moduleUnregistered', { name });

        return true;
    }

    /**
     * Get list of all registered module definitions
     * @param {Object} filters - Filter options (category, tier, tags)
     * @returns {Array} Array of module definitions
     */
    listModules(filters = {}) {
        let modules = Array.from(this.moduleDefinitions.values());

        if (filters.category) {
            modules = modules.filter(m => m.category === filters.category);
        }

        if (filters.tier) {
            modules = modules.filter(m => m.tier === filters.tier);
        }

        if (filters.tags && filters.tags.length > 0) {
            modules = modules.filter(m => 
                filters.tags.some(tag => m.tags.includes(tag))
            );
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            modules = modules.filter(m => 
                m.name.toLowerCase().includes(search) ||
                m.description.toLowerCase().includes(search) ||
                m.tags.some(tag => tag.toLowerCase().includes(search))
            );
        }

        return modules;
    }

    /**
     * Get list of all module instances
     * @returns {Array} Array of module instances
     */
    listInstances() {
        return Array.from(this.modules.values());
    }

    /**
     * Get module categories
     * @returns {Array} Array of category names
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * Check if user has premium access (stub - integrate with auth)
     * @returns {boolean} Premium access status
     */
    checkPremiumAccess() {
        // TODO: Integrate with subscription API
        const userProfile = localStorage.getItem('userProfile');
        if (!userProfile) return false;

        try {
            const profile = JSON.parse(userProfile);
            return profile.subscription === 'premium' || profile.roles?.includes('premium');
        } catch {
            return false;
        }
    }

    /**
     * Calculate total CPU usage of all modules
     * @returns {number} Total CPU usage percentage
     */
    calculateTotalCpu() {
        this.totalCpuUsage = Array.from(this.modules.values())
            .reduce((sum, module) => sum + (module.cpuUsage || 0), 0);
        
        return this.totalCpuUsage;
    }

    /**
     * Start performance monitoring
     * @param {number} interval - Monitoring interval in ms
     */
    startPerformanceMonitoring(interval = 1000) {
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
        }

        this.performanceMonitor = setInterval(() => {
            const cpuUsage = this.calculateTotalCpu();
            this.emit('performanceUpdate', {
                totalCpuUsage: cpuUsage,
                moduleCount: this.modules.size,
                timestamp: Date.now()
            });
        }, interval);

        console.log('[ModuleRegistry] Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
            this.performanceMonitor = null;
            console.log('[ModuleRegistry] Performance monitoring stopped');
        }
    }

    /**
     * Export registry state
     * @returns {Object} Registry state
     */
    exportState() {
        return {
            modules: Array.from(this.modules.values()).map(m => m.serialize()),
            definitions: Array.from(this.moduleDefinitions.entries()).map(([name, def]) => ({
                name,
                category: def.category,
                tier: def.tier,
                version: def.version
            }))
        };
    }

    /**
     * Clear all modules and reset registry
     */
    clear() {
        // Dispose all instances
        Array.from(this.modules.keys()).forEach(id => this.removeInstance(id));
        
        // Clear definitions
        this.moduleDefinitions.clear();
        this.categories.clear();
        
        console.log('[ModuleRegistry] Cleared all modules');
        this.emit('registryCleared');
    }

    /**
     * Event emitter
     */
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }
}

// Create global singleton instance
if (typeof window !== 'undefined') {
    window.ModuleRegistry = window.ModuleRegistry || new ModuleRegistry();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleRegistry;
}
