/**
 * HAOS Platform - Base Audio Module
 * Standard interface for all audio modules in the modular synthesis system
 * 
 * @version 1.0.0
 * @license MIT
 */

class AudioModule {
    /**
     * @param {string} name - Module name (e.g., "Waveshaper", "TB-303")
     * @param {string} category - Category: oscillators, filters, effects, modulators, utilities, sequencers
     * @param {Object} options - Module-specific configuration
     */
    constructor(name, category, options = {}) {
        this.id = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.category = category;
        this.options = options;
        
        // Audio graph nodes
        this.audioContext = null;
        this.inputNode = null;
        this.outputNode = null;
        
        // Module state
        this.enabled = true;
        this.bypassed = false;
        this.parameters = new Map();
        
        // Connections
        this.connections = [];
        
        // Metadata
        this.tier = options.tier || 'free'; // 'free' or 'premium'
        this.cpuRating = options.cpuRating || 'medium'; // 'light', 'medium', 'heavy'
        this.version = options.version || '1.0.0';
        this.author = options.author || 'HAOS Platform';
        this.description = options.description || '';
        
        // Performance tracking
        this.cpuUsage = 0;
        this.lastProcessTime = 0;
    }

    /**
     * Initialize the audio module with an AudioContext
     * Must be called before using the module
     * @param {AudioContext} audioContext - Web Audio API context
     */
    async init(audioContext) {
        if (!audioContext) {
            throw new Error(`[${this.name}] AudioContext is required for initialization`);
        }
        
        this.audioContext = audioContext;
        
        // Create audio graph (must be implemented by subclasses)
        await this.createAudioGraph();
        
        // Validate that input/output nodes were created
        if (!this.inputNode || !this.outputNode) {
            throw new Error(`[${this.name}] Module must create inputNode and outputNode in createAudioGraph()`);
        }
        
        console.log(`[${this.name}] Initialized successfully`);
    }

    /**
     * Create the audio processing graph
     * MUST BE IMPLEMENTED by subclasses
     * Should create this.inputNode and this.outputNode
     */
    async createAudioGraph() {
        throw new Error(`[${this.name}] createAudioGraph() must be implemented by subclass`);
    }

    /**
     * Connect this module to another module or audio node
     * @param {AudioModule|AudioNode} target - Target module or audio node
     * @param {number} outputIndex - Output index (for multi-output modules)
     * @param {number} inputIndex - Input index (for multi-input modules)
     */
    connect(target, outputIndex = 0, inputIndex = 0) {
        try {
            const targetNode = target instanceof AudioModule ? target.inputNode : target;
            
            if (!this.outputNode || !targetNode) {
                throw new Error(`Cannot connect: missing nodes`);
            }
            
            this.outputNode.connect(targetNode, outputIndex, inputIndex);
            
            this.connections.push({
                target: target,
                outputIndex,
                inputIndex,
                timestamp: Date.now()
            });
            
            console.log(`[${this.name}] Connected to ${target.name || 'AudioNode'}`);
            return true;
        } catch (error) {
            console.error(`[${this.name}] Connection failed:`, error);
            return false;
        }
    }

    /**
     * Disconnect from all targets or a specific target
     * @param {AudioModule|AudioNode} target - Optional specific target to disconnect
     */
    disconnect(target = null) {
        try {
            if (target) {
                const targetNode = target instanceof AudioModule ? target.inputNode : target;
                this.outputNode.disconnect(targetNode);
                this.connections = this.connections.filter(conn => conn.target !== target);
                console.log(`[${this.name}] Disconnected from ${target.name || 'AudioNode'}`);
            } else {
                this.outputNode.disconnect();
                this.connections = [];
                console.log(`[${this.name}] Disconnected from all targets`);
            }
            return true;
        } catch (error) {
            console.error(`[${this.name}] Disconnect failed:`, error);
            return false;
        }
    }

    /**
     * Get a parameter value
     * @param {string} name - Parameter name
     * @returns {*} Parameter value
     */
    getParam(name) {
        return this.parameters.get(name);
    }

    /**
     * Set a parameter value with validation
     * @param {string} name - Parameter name
     * @param {*} value - Parameter value
     * @param {boolean} notify - Whether to trigger change event
     */
    setParam(name, value, notify = true) {
        const oldValue = this.parameters.get(name);
        this.parameters.set(name, value);
        
        // Call parameter-specific handler if it exists
        const handlerName = `set${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        if (typeof this[handlerName] === 'function') {
            this[handlerName](value);
        }
        
        if (notify && oldValue !== value) {
            this.emit('paramChange', { name, value, oldValue });
        }
        
        return true;
    }

    /**
     * Get all parameters as an object
     * @returns {Object} All parameters
     */
    getAllParams() {
        const params = {};
        this.parameters.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    /**
     * Set multiple parameters at once
     * @param {Object} params - Object with parameter key-value pairs
     */
    setParams(params) {
        Object.entries(params).forEach(([name, value]) => {
            this.setParam(name, value, false);
        });
        this.emit('paramsChange', params);
    }

    /**
     * Enable or disable the module
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (this.enabled && this.bypassed) {
            // Reconnect audio path
            this.inputNode.connect(this.outputNode);
        } else if (!this.enabled) {
            // Disconnect for CPU savings
            this.disconnect();
        }
        
        this.emit('enabledChange', enabled);
    }

    /**
     * Toggle bypass (pass audio through without processing)
     * @param {boolean} bypassed - Bypass state
     */
    setBypass(bypassed) {
        this.bypassed = bypassed;
        this.emit('bypassChange', bypassed);
    }

    /**
     * Clean up resources when module is removed
     */
    dispose() {
        try {
            this.disconnect();
            
            // Disconnect and clear all audio nodes
            if (this.inputNode) {
                this.inputNode.disconnect();
            }
            if (this.outputNode) {
                this.outputNode.disconnect();
            }
            
            // Clear parameters
            this.parameters.clear();
            this.connections = [];
            
            console.log(`[${this.name}] Disposed successfully`);
        } catch (error) {
            console.error(`[${this.name}] Disposal error:`, error);
        }
    }

    /**
     * Serialize module state to JSON
     * @returns {Object} Serialized state
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            tier: this.tier,
            enabled: this.enabled,
            bypassed: this.bypassed,
            parameters: this.getAllParams(),
            connections: this.connections.map(conn => ({
                targetId: conn.target.id,
                outputIndex: conn.outputIndex,
                inputIndex: conn.inputIndex
            })),
            metadata: {
                cpuRating: this.cpuRating,
                version: this.version,
                author: this.author
            }
        };
    }

    /**
     * Restore module state from JSON
     * @param {Object} state - Serialized state
     */
    deserialize(state) {
        if (state.enabled !== undefined) this.enabled = state.enabled;
        if (state.bypassed !== undefined) this.bypassed = state.bypassed;
        if (state.parameters) this.setParams(state.parameters);
        
        console.log(`[${this.name}] State restored from serialized data`);
    }

    /**
     * Get module info for UI display
     * @returns {Object} Module information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            tier: this.tier,
            cpuRating: this.cpuRating,
            enabled: this.enabled,
            bypassed: this.bypassed,
            parameterCount: this.parameters.size,
            connectionCount: this.connections.length,
            cpuUsage: this.cpuUsage,
            version: this.version,
            author: this.author,
            description: this.description
        };
    }

    /**
     * Simple event emitter for module events
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.eventHandlers && this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }

    /**
     * Register event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    on(event, handler) {
        if (!this.eventHandlers) {
            this.eventHandlers = {};
        }
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    /**
     * Remove event handler
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    off(event, handler) {
        if (this.eventHandlers && this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioModule;
}
