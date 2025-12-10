/**
 * Module Integration System (Patch Bay)
 * haos.fm v2.7.0
 * 
 * Provides module routing and patch management:
 * - Virtual patch bay for connecting modules
 * - Preset patch configurations
 * - Patch save/load/export
 * - Signal routing visualization
 * - Module lifecycle management
 * 
 * Features:
 * - Drag-and-drop virtual cables
 * - Preset patches (trap, techno, ambient, etc.)
 * - Patch history and versioning
 * - Signal flow visualization
 * - Module auto-connect suggestions
 */

class ModuleIntegration {
    constructor(audioEngine, options = {}) {
        if (!audioEngine) {
            throw new Error('AudioEngine required for ModuleIntegration');
        }

        this.audioEngine = audioEngine;
        this.options = {
            storageKey: options.storageKey || 'haos-patches',
            autoSave: options.autoSave !== false,
            ...options
        };

        this.modules = new Map(); // Module instances
        this.connections = new Map(); // Active connections
        this.patches = new Map(); // Saved patches
        this.currentPatch = null;

        // Load saved patches
        this._loadFromStorage();
        
        // Initialize preset patches
        this._initializePresets();
    }

    /**
     * Register a module instance
     */
    registerModule(id, module, metadata = {}) {
        if (this.modules.has(id)) {
            throw new Error(`Module ${id} already registered`);
        }

        const moduleData = {
            id,
            instance: module,
            type: metadata.type || 'unknown',
            name: metadata.name || id,
            inputs: metadata.inputs || ['input'],
            outputs: metadata.outputs || ['output'],
            parameters: metadata.parameters || {},
            created: Date.now()
        };

        this.modules.set(id, moduleData);
        
        console.log(`[ModuleIntegration] Registered module: ${id} (${moduleData.type})`);
        
        return moduleData;
    }

    /**
     * Unregister a module
     */
    unregisterModule(id) {
        // Disconnect all connections involving this module
        this.connections.forEach((conn, connId) => {
            if (conn.source.moduleId === id || conn.target.moduleId === id) {
                this.disconnect(connId);
            }
        });

        const module = this.modules.get(id);
        if (module && module.instance && module.instance.dispose) {
            module.instance.dispose();
        }

        this.modules.delete(id);
        console.log(`[ModuleIntegration] Unregistered module: ${id}`);
    }

    /**
     * Connect two modules
     */
    connect(sourceModuleId, targetModuleId, options = {}) {
        const source = this.modules.get(sourceModuleId);
        const target = this.modules.get(targetModuleId);

        if (!source) throw new Error(`Source module ${sourceModuleId} not found`);
        if (!target) throw new Error(`Target module ${targetModuleId} not found`);

        const {
            sourceOutput = 'output',
            targetInput = 'input',
            gain = 1.0
        } = options;

        // Get Web Audio nodes
        const sourceNode = this._getNode(source.instance, sourceOutput);
        const targetNode = this._getNode(target.instance, targetInput);

        if (!sourceNode) {
            throw new Error(`Source output "${sourceOutput}" not found on ${sourceModuleId}`);
        }
        if (!targetNode) {
            throw new Error(`Target input "${targetInput}" not found on ${targetModuleId}`);
        }

        // Create gain node for connection
        const gainNode = this.audioEngine.createGain(gain);
        sourceNode.connect(gainNode);
        gainNode.connect(targetNode);

        // Store connection
        const connId = `${sourceModuleId}:${sourceOutput}->${targetModuleId}:${targetInput}`;
        const connection = {
            id: connId,
            source: { moduleId: sourceModuleId, output: sourceOutput, node: sourceNode },
            target: { moduleId: targetModuleId, input: targetInput, node: targetNode },
            gainNode,
            gain,
            created: Date.now()
        };

        this.connections.set(connId, connection);
        
        console.log(`[ModuleIntegration] Connected: ${connId} (gain: ${gain})`);
        
        return connId;
    }

    /**
     * Disconnect modules
     */
    disconnect(connectionId) {
        const conn = this.connections.get(connectionId);
        if (!conn) {
            console.warn(`Connection ${connectionId} not found`);
            return false;
        }

        // Disconnect audio nodes
        try {
            conn.source.node.disconnect(conn.gainNode);
            conn.gainNode.disconnect(conn.target.node);
        } catch (error) {
            console.warn('Error disconnecting:', error);
        }

        this.connections.delete(connectionId);
        console.log(`[ModuleIntegration] Disconnected: ${connectionId}`);
        
        return true;
    }

    /**
     * Disconnect all connections
     */
    disconnectAll() {
        const connectionIds = Array.from(this.connections.keys());
        connectionIds.forEach(id => this.disconnect(id));
        console.log(`[ModuleIntegration] Disconnected all (${connectionIds.length} connections)`);
    }

    /**
     * Set connection gain
     */
    setConnectionGain(connectionId, gain) {
        const conn = this.connections.get(connectionId);
        if (!conn) {
            throw new Error(`Connection ${connectionId} not found`);
        }

        conn.gainNode.gain.setValueAtTime(gain, this.audioEngine.getCurrentTime());
        conn.gain = gain;
    }

    /**
     * Get output node from module instance
     */
    _getNode(moduleInstance, nodeName) {
        // Try direct property access
        if (moduleInstance[nodeName]) {
            return moduleInstance[nodeName];
        }

        // Try getter method
        if (typeof moduleInstance[`get${nodeName.charAt(0).toUpperCase() + nodeName.slice(1)}`] === 'function') {
            return moduleInstance[`get${nodeName.charAt(0).toUpperCase() + nodeName.slice(1)}`]();
        }

        // Common patterns
        if (nodeName === 'output' && moduleInstance.output) return moduleInstance.output;
        if (nodeName === 'input' && moduleInstance.input) return moduleInstance.input;
        
        return null;
    }

    /**
     * Load a preset patch
     */
    loadPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) {
            throw new Error(`Patch ${patchId} not found`);
        }

        console.log(`[ModuleIntegration] Loading patch: ${patch.name}`);

        // Disconnect all existing connections
        this.disconnectAll();

        // Unregister existing modules (except those in patch)
        const patchModuleIds = patch.modules.map(m => m.id);
        this.modules.forEach((_, id) => {
            if (!patchModuleIds.includes(id)) {
                this.unregisterModule(id);
            }
        });

        // Create and configure modules
        patch.modules.forEach(moduleDef => {
            if (!this.modules.has(moduleDef.id)) {
                // Module needs to be created by user code
                console.warn(`Module ${moduleDef.id} not registered. Please create and register it.`);
            } else {
                // Apply module configuration
                const module = this.modules.get(moduleDef.id);
                if (moduleDef.preset && module.instance.loadPreset) {
                    module.instance.loadPreset(moduleDef.preset);
                }
                if (moduleDef.parameters && module.instance.setParameters) {
                    module.instance.setParameters(moduleDef.parameters);
                }
            }
        });

        // Create connections
        patch.connections.forEach(connDef => {
            try {
                this.connect(connDef.source, connDef.target, {
                    sourceOutput: connDef.sourceOutput || 'output',
                    targetInput: connDef.targetInput || 'input',
                    gain: connDef.gain || 1.0
                });
            } catch (error) {
                console.error(`Failed to create connection ${connDef.source} -> ${connDef.target}:`, error);
            }
        });

        this.currentPatch = patchId;
        console.log(`[ModuleIntegration] Loaded patch: ${patch.name} (${this.connections.size} connections)`);
        
        return patch;
    }

    /**
     * Save current state as patch
     */
    savePatch(name, description = '') {
        const patchId = `patch-${Date.now()}`;
        
        // Capture current module states
        const modules = [];
        this.modules.forEach((module, id) => {
            const moduleDef = {
                id,
                type: module.type,
                name: module.name
            };

            // Capture preset if available
            if (module.instance.getCurrentPreset) {
                moduleDef.preset = module.instance.getCurrentPreset();
            }

            // Capture parameters if available
            if (module.instance.getParameters) {
                moduleDef.parameters = module.instance.getParameters();
            }

            modules.push(moduleDef);
        });

        // Capture connections
        const connections = [];
        this.connections.forEach((conn) => {
            connections.push({
                source: conn.source.moduleId,
                sourceOutput: conn.source.output,
                target: conn.target.moduleId,
                targetInput: conn.target.input,
                gain: conn.gain
            });
        });

        const patch = {
            id: patchId,
            name,
            description,
            modules,
            connections,
            preset: false,
            created: Date.now(),
            modified: Date.now()
        };

        this.patches.set(patchId, patch);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        console.log(`[ModuleIntegration] Saved patch: ${name} (${modules.length} modules, ${connections.length} connections)`);
        
        return patchId;
    }

    /**
     * Delete a patch
     */
    deletePatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) {
            throw new Error(`Patch ${patchId} not found`);
        }

        if (patch.preset) {
            throw new Error('Cannot delete preset patches');
        }

        this.patches.delete(patchId);
        
        if (this.options.autoSave) {
            this._saveToStorage();
        }

        return true;
    }

    /**
     * Export patch to JSON
     */
    exportPatch(patchId) {
        const patch = this.patches.get(patchId);
        if (!patch) {
            throw new Error(`Patch ${patchId} not found`);
        }

        return JSON.stringify(patch, null, 2);
    }

    /**
     * Import patch from JSON
     */
    importPatch(jsonString) {
        try {
            const patch = JSON.parse(jsonString);
            
            const patchId = `patch-${Date.now()}`;
            patch.id = patchId;
            patch.preset = false;
            patch.created = Date.now();
            patch.modified = Date.now();

            this.patches.set(patchId, patch);
            
            if (this.options.autoSave) {
                this._saveToStorage();
            }

            return patchId;
        } catch (error) {
            throw new Error(`Invalid patch JSON: ${error.message}`);
        }
    }

    /**
     * Get all patches
     */
    getAllPatches() {
        return Array.from(this.patches.values());
    }

    /**
     * Get all modules
     */
    getAllModules() {
        return Array.from(this.modules.values());
    }

    /**
     * Get all connections
     */
    getAllConnections() {
        return Array.from(this.connections.values());
    }

    /**
     * Get signal flow graph
     */
    getSignalFlow() {
        const graph = {
            nodes: [],
            edges: []
        };

        // Add nodes (modules)
        this.modules.forEach((module, id) => {
            graph.nodes.push({
                id,
                type: module.type,
                name: module.name
            });
        });

        // Add edges (connections)
        this.connections.forEach((conn) => {
            graph.edges.push({
                source: conn.source.moduleId,
                target: conn.target.moduleId,
                gain: conn.gain
            });
        });

        return graph;
    }

    /**
     * Initialize preset patches
     */
    _initializePresets() {
        // Trap Studio Patch
        this.patches.set('preset-trap-basic', {
            id: 'preset-trap-basic',
            name: 'Trap Studio',
            description: '808 bass + drums + effects',
            preset: true,
            modules: [
                { id: 'drums', type: 'Drums', name: 'Trap Drums', preset: 'trap' },
                { id: 'bass808', type: 'Bass808', name: '808 Bass', preset: 'deep' },
                { id: 'effects', type: 'Effects', name: 'Effects Rack', preset: 'dub' },
                { id: 'sequencer', type: 'Sequencer', name: 'Sequencer' }
            ],
            connections: [
                { source: 'drums', target: 'effects', gain: 0.8 },
                { source: 'bass808', target: 'effects', gain: 0.7 },
                { source: 'effects', target: 'master', gain: 1.0 }
            ],
            created: Date.now(),
            modified: Date.now()
        });

        // Techno Creator Patch
        this.patches.set('preset-techno-basic', {
            id: 'preset-techno-basic',
            name: 'Techno Creator',
            description: 'TB-303 + drums + effects',
            preset: true,
            modules: [
                { id: 'drums', type: 'Drums', name: 'Techno Drums', preset: 'techno' },
                { id: 'bass303', type: 'Bass303', name: 'TB-303', preset: 'squelchy' },
                { id: 'effects', type: 'Effects', name: 'Effects Rack', preset: 'space' },
                { id: 'sequencer', type: 'Sequencer', name: 'Sequencer' }
            ],
            connections: [
                { source: 'drums', target: 'effects', gain: 0.8 },
                { source: 'bass303', target: 'effects', gain: 0.6 },
                { source: 'effects', target: 'master', gain: 1.0 }
            ],
            created: Date.now(),
            modified: Date.now()
        });

        // Full Modular Patch
        this.patches.set('preset-full-modular', {
            id: 'preset-full-modular',
            name: 'Full Modular',
            description: 'All modules connected',
            preset: true,
            modules: [
                { id: 'drums', type: 'Drums', name: 'Drums', preset: 'hybrid' },
                { id: 'bass808', type: 'Bass808', name: '808 Bass', preset: 'subby' },
                { id: 'bass303', type: 'Bass303', name: 'TB-303', preset: 'classic' },
                { id: 'effects', type: 'Effects', name: 'Effects', preset: 'lush' },
                { id: 'sequencer', type: 'Sequencer', name: 'Sequencer' }
            ],
            connections: [
                { source: 'drums', target: 'effects', gain: 0.7 },
                { source: 'bass808', target: 'effects', gain: 0.5 },
                { source: 'bass303', target: 'effects', gain: 0.4 },
                { source: 'effects', target: 'master', gain: 1.0 }
            ],
            created: Date.now(),
            modified: Date.now()
        });

        // Minimal Techno Patch
        this.patches.set('preset-minimal-techno', {
            id: 'preset-minimal-techno',
            name: 'Minimal Techno',
            description: 'Stripped-down techno setup',
            preset: true,
            modules: [
                { id: 'drums', type: 'Drums', name: 'Minimal Drums', preset: 'techno' },
                { id: 'bass303', type: 'Bass303', name: 'Acid Bass', preset: 'minimal' },
                { id: 'effects', type: 'Effects', name: 'Reverb/Delay', preset: 'echo' }
            ],
            connections: [
                { source: 'drums', target: 'effects', gain: 0.8 },
                { source: 'bass303', target: 'effects', gain: 0.6 },
                { source: 'effects', target: 'master', gain: 1.0 }
            ],
            created: Date.now(),
            modified: Date.now()
        });

        // Ambient Patch
        this.patches.set('preset-ambient', {
            id: 'preset-ambient',
            name: 'Ambient Soundscape',
            description: 'Effects-heavy ambient setup',
            preset: true,
            modules: [
                { id: 'bass303', type: 'Bass303', name: 'Synth Pad', preset: 'liquid' },
                { id: 'effects', type: 'Effects', name: 'Reverb + Delay', preset: 'space' }
            ],
            connections: [
                { source: 'bass303', target: 'effects', gain: 0.5 },
                { source: 'effects', target: 'master', gain: 0.8 }
            ],
            created: Date.now(),
            modified: Date.now()
        });

        console.log(`[ModuleIntegration] Loaded ${this.patches.size} preset patches`);
    }

    /**
     * Save patches to localStorage
     */
    _saveToStorage() {
        try {
            const userPatches = this.getAllPatches().filter(p => !p.preset);
            localStorage.setItem(
                this.options.storageKey,
                JSON.stringify(userPatches)
            );
        } catch (error) {
            console.error('Failed to save patches:', error);
        }
    }

    /**
     * Load patches from localStorage
     */
    _loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                const patches = JSON.parse(stored);
                patches.forEach(patch => {
                    this.patches.set(patch.id, patch);
                });
                console.log(`[ModuleIntegration] Loaded ${patches.length} user patches from storage`);
            }
        } catch (error) {
            console.error('Failed to load patches:', error);
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            modules: this.modules.size,
            connections: this.connections.size,
            patches: this.patches.size,
            userPatches: this.getAllPatches().filter(p => !p.preset).length,
            presetPatches: this.getAllPatches().filter(p => p.preset).length
        };
    }

    /**
     * Cleanup and dispose all modules
     */
    dispose() {
        console.log('[ModuleIntegration] Disposing all modules and connections...');
        
        this.disconnectAll();
        
        this.modules.forEach((module, id) => {
            if (module.instance && module.instance.dispose) {
                module.instance.dispose();
            }
        });
        
        this.modules.clear();
        this.connections.clear();
        
        console.log('[ModuleIntegration] Cleanup complete');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleIntegration;
}

// Export as browser global
if (typeof window !== 'undefined') {
    window.ModuleIntegration = ModuleIntegration;
}
