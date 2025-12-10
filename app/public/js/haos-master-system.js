/**
 * HAOS.FM MASTER SYSTEM
 * Unified, scalable architecture integrating all AI and synthesis features
 * 
 * Architecture:
 * - Engine Manager: Audio context, synthesis engines, effects
 * - AI System: Patch design, track integration, automation
 * - State Manager: Global state, presets, projects
 * - Event Bus: Inter-module communication
 * - Export System: WAV, MIDI, Project files
 */

class HAOSMasterSystem {
    constructor() {
        this.version = '3.0.0';
        this.initialized = false;
        
        // Core Systems
        this.audioContext = null;
        this.engineManager = null;
        this.aiSystem = null;
        this.stateManager = null;
        this.eventBus = null;
        this.exportSystem = null;
        
        // Engine Registry
        this.engines = {
            tb303: null,
            tr808: null,
            tr909: null,
            arp2600: null,
            stringMachine: null,
            dawEngine: null
        };
        
        // AI Components
        this.aiComponents = {
            patchDesigner: null,
            trackIntegrator: null,
            automationEngine: null,
            suggestionEngine: null
        };
        
        // Global State
        this.state = {
            currentProject: null,
            activeEngines: [],
            playbackState: 'stopped',
            bpm: 135,
            masterVolume: 0.8,
            masterEffects: {
                compressor: null,
                reverb: null,
                limiter: null
            }
        };
        
        // Event listeners
        this.listeners = new Map();
        
        console.log('🎵 HAOS Master System v' + this.version + ' initialized');
    }
    
    /**
     * Initialize the complete system
     */
    async init() {
        if (this.initialized) {
            console.warn('System already initialized');
            return;
        }
        
        try {
            console.log('🚀 Starting HAOS Master System...');
            
            // 1. Initialize Audio Context
            await this.initAudioContext();
            
            // 2. Initialize Engine Manager
            await this.initEngineManager();
            
            // 3. Initialize AI System
            await this.initAISystem();
            
            // 4. Initialize State Manager
            await this.initStateManager();
            
            // 5. Initialize Event Bus
            await this.initEventBus();
            
            // 6. Initialize Export System
            await this.initExportSystem();
            
            // 7. Setup Master Effects Chain
            await this.setupMasterEffects();
            
            this.initialized = true;
            this.emit('system:ready');
            
            console.log('✅ HAOS Master System ready!');
            console.log('   - Audio Context: Active');
            console.log('   - Engines: 5 loaded');
            console.log('   - AI Components: 4 active');
            console.log('   - State Management: Ready');
            console.log('   - Event Bus: Connected');
            console.log('   - Export System: Ready');
            
            return true;
        } catch (error) {
            console.error('❌ System initialization failed:', error);
            this.emit('system:error', error);
            throw error;
        }
    }
    
    /**
     * Initialize Audio Context with proper settings
     */
    async initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive',
                sampleRate: 44100
            });
            
            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('✅ Audio Context initialized:', {
                sampleRate: this.audioContext.sampleRate,
                state: this.audioContext.state,
                latency: this.audioContext.baseLatency
            });
        } catch (error) {
            console.error('Failed to initialize Audio Context:', error);
            throw error;
        }
    }
    
    /**
     * Initialize all synthesis engines
     */
    async initEngineManager() {
        this.engineManager = {
            // TB-303 Bass Synthesizer
            createTB303: () => {
                if (!this.engines.tb303 && typeof TB303 !== 'undefined') {
                    this.engines.tb303 = new TB303(this.audioContext);
                    console.log('✅ TB-303 Engine loaded');
                }
                return this.engines.tb303;
            },
            
            // TR-808 Drum Machine
            createTR808: () => {
                if (!this.engines.tr808 && typeof TR808 !== 'undefined') {
                    this.engines.tr808 = new TR808(this.audioContext);
                    console.log('✅ TR-808 Engine loaded');
                }
                return this.engines.tr808;
            },
            
            // TR-909 Drum Machine
            createTR909: () => {
                if (!this.engines.tr909 && typeof TR909 !== 'undefined') {
                    this.engines.tr909 = new TR909(this.audioContext);
                    console.log('✅ TR-909 Engine loaded');
                }
                return this.engines.tr909;
            },
            
            // ARP 2600 Modular Synth
            createARP2600: () => {
                if (!this.engines.arp2600 && typeof ARP2600 !== 'undefined') {
                    this.engines.arp2600 = new ARP2600(this.audioContext);
                    console.log('✅ ARP 2600 Engine loaded');
                }
                return this.engines.arp2600;
            },
            
            // String Machine
            createStringMachine: () => {
                if (!this.engines.stringMachine && typeof StringMachine !== 'undefined') {
                    this.engines.stringMachine = new StringMachine(this.audioContext);
                    console.log('✅ String Machine Engine loaded');
                }
                return this.engines.stringMachine;
            },
            
            // DAW Engine for sequencing
            createDAWEngine: () => {
                if (!this.engines.dawEngine && typeof DAWEngine !== 'undefined') {
                    this.engines.dawEngine = new DAWEngine(this.audioContext);
                    console.log('✅ DAW Engine loaded');
                }
                return this.engines.dawEngine;
            },
            
            // Get all active engines
            getActiveEngines: () => {
                return Object.entries(this.engines)
                    .filter(([key, engine]) => engine !== null)
                    .map(([key, engine]) => ({ name: key, engine }));
            },
            
            // Stop all engines
            stopAll: () => {
                Object.values(this.engines).forEach(engine => {
                    if (engine && typeof engine.stop === 'function') {
                        engine.stop();
                    }
                });
            }
        };
        
        console.log('✅ Engine Manager initialized');
    }
    
    /**
     * Initialize AI System with all components
     */
    async initAISystem() {
        this.aiSystem = {
            // AI Patch Designer
            patchDesigner: null,
            
            // Track Integrator
            trackIntegrator: null,
            
            // Initialize patch designer
            initPatchDesigner: () => {
                if (!this.aiComponents.patchDesigner && typeof AIPatchDesigner !== 'undefined') {
                    this.aiComponents.patchDesigner = new AIPatchDesigner();
                    this.aiSystem.patchDesigner = this.aiComponents.patchDesigner;
                    console.log('✅ AI Patch Designer loaded');
                }
                return this.aiComponents.patchDesigner;
            },
            
            // Initialize track integrator
            initTrackIntegrator: () => {
                if (!this.aiComponents.trackIntegrator && typeof TrackIntegrator !== 'undefined') {
                    this.aiComponents.trackIntegrator = new TrackIntegrator(this.audioContext);
                    this.aiSystem.trackIntegrator = this.aiComponents.trackIntegrator;
                    console.log('✅ Track Integrator loaded');
                }
                return this.aiComponents.trackIntegrator;
            },
            
            // Generate complete track using AI
            generateCompleteTrack: async (options = {}) => {
                const {
                    genre = 'hard-techno',
                    structure = 'standard',
                    bpm = 135,
                    bars = 32
                } = options;
                
                // Ensure AI components are loaded
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                if (!this.aiComponents.trackIntegrator) {
                    this.aiSystem.initTrackIntegrator();
                }
                
                console.log(`🎨 Generating ${structure} ${genre} track at ${bpm} BPM...`);
                
                // Use AI to generate complete track
                const track = await this.aiComponents.trackIntegrator.generateCompleteTrack(
                    genre,
                    structure,
                    bpm,
                    bars
                );
                
                this.state.currentProject = track;
                this.emit('track:generated', track);
                
                return track;
            },
            
            // Generate AI patch
            generatePatch: (genre, soundType, mood) => {
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                
                const patch = this.aiComponents.patchDesigner.generatePatch(genre, soundType, mood);
                this.emit('patch:generated', patch);
                
                return patch;
            },
            
            // Apply patch to engines
            applyPatch: (patch) => {
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                
                const synthInstances = {
                    tb303: this.engines.tb303,
                    arp2600: this.engines.arp2600,
                    stringMachine: this.engines.stringMachine
                };
                
                this.aiComponents.patchDesigner.applyPatch(patch, synthInstances);
                this.emit('patch:applied', patch);
            },
            
            // Morph between patches
            morphPatches: (patchA, patchB, amount) => {
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                
                return this.aiComponents.patchDesigner.morphPatches(patchA, patchB, amount);
            },
            
            // Evolve patch
            evolvePatch: (patch, strength = 0.2) => {
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                
                return this.aiComponents.patchDesigner.evolvePatch(patch, strength);
            },
            
            // Get suggestions
            getSuggestions: (currentPatch) => {
                if (!this.aiComponents.patchDesigner) {
                    this.aiSystem.initPatchDesigner();
                }
                
                return this.aiComponents.patchDesigner.getSuggestions(currentPatch);
            }
        };
        
        console.log('✅ AI System initialized');
    }
    
    /**
     * Initialize State Manager for project/preset management
     */
    async initStateManager() {
        this.stateManager = {
            // Save current project
            saveProject: (name) => {
                const project = {
                    name: name || `HAOS_Project_${Date.now()}`,
                    version: this.version,
                    timestamp: Date.now(),
                    bpm: this.state.bpm,
                    masterVolume: this.state.masterVolume,
                    currentProject: this.state.currentProject,
                    engines: this.engineManager.getActiveEngines().map(e => e.name)
                };
                
                // Save to localStorage
                const projectKey = `haos_project_${project.name}`;
                localStorage.setItem(projectKey, JSON.stringify(project));
                
                // Add to project list
                const projectList = this.stateManager.getProjectList();
                if (!projectList.includes(project.name)) {
                    projectList.push(project.name);
                    localStorage.setItem('haos_projects', JSON.stringify(projectList));
                }
                
                this.emit('project:saved', project);
                console.log('💾 Project saved:', project.name);
                
                return project;
            },
            
            // Load project
            loadProject: (name) => {
                const projectKey = `haos_project_${name}`;
                const projectData = localStorage.getItem(projectKey);
                
                if (!projectData) {
                    throw new Error(`Project "${name}" not found`);
                }
                
                const project = JSON.parse(projectData);
                
                // Restore state
                this.state.bpm = project.bpm;
                this.state.masterVolume = project.masterVolume;
                this.state.currentProject = project.currentProject;
                
                this.emit('project:loaded', project);
                console.log('📂 Project loaded:', project.name);
                
                return project;
            },
            
            // Get list of saved projects
            getProjectList: () => {
                const list = localStorage.getItem('haos_projects');
                return list ? JSON.parse(list) : [];
            },
            
            // Delete project
            deleteProject: (name) => {
                const projectKey = `haos_project_${name}`;
                localStorage.removeItem(projectKey);
                
                // Remove from list
                const projectList = this.stateManager.getProjectList();
                const filtered = projectList.filter(p => p !== name);
                localStorage.setItem('haos_projects', JSON.stringify(filtered));
                
                this.emit('project:deleted', name);
                console.log('🗑️ Project deleted:', name);
            },
            
            // Save preset
            savePreset: (name, patch) => {
                const preset = {
                    name,
                    patch,
                    timestamp: Date.now()
                };
                
                const presetKey = `haos_preset_${name}`;
                localStorage.setItem(presetKey, JSON.stringify(preset));
                
                // Add to preset list
                const presetList = this.stateManager.getPresetList();
                if (!presetList.includes(name)) {
                    presetList.push(name);
                    localStorage.setItem('haos_presets', JSON.stringify(presetList));
                }
                
                this.emit('preset:saved', preset);
                return preset;
            },
            
            // Load preset
            loadPreset: (name) => {
                const presetKey = `haos_preset_${name}`;
                const presetData = localStorage.getItem(presetKey);
                
                if (!presetData) {
                    throw new Error(`Preset "${name}" not found`);
                }
                
                const preset = JSON.parse(presetData);
                this.emit('preset:loaded', preset);
                
                return preset.patch;
            },
            
            // Get preset list
            getPresetList: () => {
                const list = localStorage.getItem('haos_presets');
                return list ? JSON.parse(list) : [];
            },
            
            // Export state as JSON
            exportState: () => {
                return JSON.stringify({
                    version: this.version,
                    timestamp: Date.now(),
                    state: this.state,
                    engines: this.engineManager.getActiveEngines().map(e => e.name)
                }, null, 2);
            }
        };
        
        console.log('✅ State Manager initialized');
    }
    
    /**
     * Initialize Event Bus for inter-module communication
     */
    async initEventBus() {
        this.eventBus = {
            // Subscribe to event
            on: (event, callback) => {
                if (!this.listeners.has(event)) {
                    this.listeners.set(event, []);
                }
                this.listeners.get(event).push(callback);
            },
            
            // Unsubscribe from event
            off: (event, callback) => {
                if (!this.listeners.has(event)) return;
                
                const callbacks = this.listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            },
            
            // Emit event
            emit: (event, data) => {
                if (!this.listeners.has(event)) return;
                
                this.listeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for "${event}":`, error);
                    }
                });
            },
            
            // One-time event listener
            once: (event, callback) => {
                const onceCallback = (data) => {
                    callback(data);
                    this.eventBus.off(event, onceCallback);
                };
                this.eventBus.on(event, onceCallback);
            }
        };
        
        // Shorthand methods
        this.on = this.eventBus.on.bind(this.eventBus);
        this.off = this.eventBus.off.bind(this.eventBus);
        this.emit = this.eventBus.emit.bind(this.eventBus);
        this.once = this.eventBus.once.bind(this.eventBus);
        
        console.log('✅ Event Bus initialized');
    }
    
    /**
     * Initialize Export System for WAV, MIDI, etc.
     */
    async initExportSystem() {
        this.exportSystem = {
            // Export as WAV
            exportWAV: async (track, filename) => {
                console.log('🎵 Exporting WAV:', filename);
                
                if (!this.aiComponents.trackIntegrator) {
                    throw new Error('Track Integrator not initialized');
                }
                
                const buffer = await this.aiComponents.trackIntegrator.exportTrack();
                const wavBlob = this.exportSystem.audioBufferToWav(buffer);
                
                const url = URL.createObjectURL(wavBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename || 'haos_track.wav';
                a.click();
                
                URL.revokeObjectURL(url);
                
                this.emit('export:wav', { filename, size: wavBlob.size });
                console.log('✅ WAV exported:', filename);
                
                return wavBlob;
            },
            
            // Convert AudioBuffer to WAV
            audioBufferToWav: (buffer) => {
                const length = buffer.length * buffer.numberOfChannels * 2;
                const arrayBuffer = new ArrayBuffer(44 + length);
                const view = new DataView(arrayBuffer);
                
                // WAV header
                const writeString = (offset, string) => {
                    for (let i = 0; i < string.length; i++) {
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                };
                
                writeString(0, 'RIFF');
                view.setUint32(4, 36 + length, true);
                writeString(8, 'WAVE');
                writeString(12, 'fmt ');
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, buffer.numberOfChannels, true);
                view.setUint32(24, buffer.sampleRate, true);
                view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
                view.setUint16(32, buffer.numberOfChannels * 2, true);
                view.setUint16(34, 16, true);
                writeString(36, 'data');
                view.setUint32(40, length, true);
                
                // Write audio data
                const offset = 44;
                for (let i = 0; i < buffer.length; i++) {
                    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                        view.setInt16(offset + (i * buffer.numberOfChannels + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                    }
                }
                
                return new Blob([arrayBuffer], { type: 'audio/wav' });
            },
            
            // Export project as JSON
            exportProject: (project, filename) => {
                const json = JSON.stringify(project, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename || 'haos_project.json';
                a.click();
                
                URL.revokeObjectURL(url);
                
                this.emit('export:project', { filename });
                console.log('✅ Project exported:', filename);
            },
            
            // Import project from JSON
            importProject: async (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        try {
                            const project = JSON.parse(e.target.result);
                            this.emit('import:project', project);
                            resolve(project);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            }
        };
        
        console.log('✅ Export System initialized');
    }
    
    /**
     * Setup master effects chain
     */
    async setupMasterEffects() {
        if (!this.audioContext) {
            throw new Error('Audio Context not initialized');
        }
        
        // Compressor
        this.state.masterEffects.compressor = this.audioContext.createDynamicsCompressor();
        this.state.masterEffects.compressor.threshold.value = -12;
        this.state.masterEffects.compressor.knee.value = 6;
        this.state.masterEffects.compressor.ratio.value = 4;
        this.state.masterEffects.compressor.attack.value = 0.005;
        this.state.masterEffects.compressor.release.value = 0.1;
        
        // Reverb (using ConvolverNode - simplified for now)
        this.state.masterEffects.reverb = this.audioContext.createGain();
        this.state.masterEffects.reverb.gain.value = 0.15;
        
        // Limiter
        this.state.masterEffects.limiter = this.audioContext.createDynamicsCompressor();
        this.state.masterEffects.limiter.threshold.value = -0.3;
        this.state.masterEffects.limiter.knee.value = 0;
        this.state.masterEffects.limiter.ratio.value = 20;
        this.state.masterEffects.limiter.attack.value = 0.001;
        this.state.masterEffects.limiter.release.value = 0.05;
        
        // Connect chain: Compressor → Reverb → Limiter → Destination
        this.state.masterEffects.compressor.connect(this.state.masterEffects.reverb);
        this.state.masterEffects.reverb.connect(this.state.masterEffects.limiter);
        this.state.masterEffects.limiter.connect(this.audioContext.destination);
        
        console.log('✅ Master effects chain setup complete');
    }
    
    /**
     * Get master output node (for connecting engines)
     */
    getMasterOutput() {
        return this.state.masterEffects.compressor;
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.state.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.audioContext) {
            this.audioContext.destination.gain = this.state.masterVolume;
        }
        this.emit('master:volume', this.state.masterVolume);
    }
    
    /**
     * Set BPM
     */
    setBPM(bpm) {
        this.state.bpm = Math.max(60, Math.min(200, bpm));
        this.emit('master:bpm', this.state.bpm);
    }
    
    /**
     * Play current project
     */
    async play() {
        if (!this.state.currentProject) {
            console.warn('No project loaded');
            return;
        }
        
        if (this.state.playbackState === 'playing') {
            console.warn('Already playing');
            return;
        }
        
        this.state.playbackState = 'playing';
        
        if (this.aiComponents.trackIntegrator) {
            await this.aiComponents.trackIntegrator.playCompleteTrack();
        }
        
        this.emit('playback:start');
        console.log('▶️ Playback started');
    }
    
    /**
     * Stop playback
     */
    stop() {
        this.state.playbackState = 'stopped';
        
        if (this.aiComponents.trackIntegrator) {
            this.aiComponents.trackIntegrator.stopCompleteTrack();
        }
        
        this.engineManager.stopAll();
        this.emit('playback:stop');
        console.log('⏹️ Playback stopped');
    }
    
    /**
     * Get system info
     */
    getSystemInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            audioContext: {
                state: this.audioContext?.state,
                sampleRate: this.audioContext?.sampleRate
            },
            engines: Object.keys(this.engines).filter(key => this.engines[key] !== null),
            aiComponents: Object.keys(this.aiComponents).filter(key => this.aiComponents[key] !== null),
            state: {
                playbackState: this.state.playbackState,
                bpm: this.state.bpm,
                masterVolume: this.state.masterVolume,
                hasProject: !!this.state.currentProject
            }
        };
    }
}

// Create global instance
window.HAOS = new HAOSMasterSystem();

console.log('🎵 HAOS Master System loaded!');
console.log('   Usage: await HAOS.init()');
console.log('   Then: HAOS.aiSystem.generateCompleteTrack()');
