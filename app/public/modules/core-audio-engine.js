/**
 * Core Audio Engine Module
 * 
 * Provides centralized Web Audio API initialization and management
 * for haos.fm music production applications.
 * 
 * @module CoreAudioEngine
 * @version 2.6.0
 */

class CoreAudioEngine {
    constructor(options = {}) {
        this.options = {
            sampleRate: options.sampleRate || 44100,
            latencyHint: options.latencyHint || 'interactive', // 'interactive', 'balanced', 'playback'
            autoInit: options.autoInit !== undefined ? options.autoInit : false,
            masterGain: options.masterGain || 0.8,
            ...options
        };

        this.audioContext = null;
        this.masterGainNode = null;
        this.analyzerNode = null;
        this.isInitialized = false;
        this.modules = new Map(); // Registered audio modules
        this.connections = new Map(); // Module routing connections
    }

    /**
     * Initialize the Web Audio API context
     * Must be called from user interaction due to browser autoplay policy
     */
    async init() {
        if (this.isInitialized) {
            console.warn('CoreAudioEngine already initialized');
            return this.audioContext;
        }

        try {
            // Create AudioContext with optimal settings
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass({
                sampleRate: this.options.sampleRate,
                latencyHint: this.options.latencyHint
            });

            // Create master gain node (final output control)
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(
                this.options.masterGain,
                this.audioContext.currentTime
            );
            this.masterGainNode.connect(this.audioContext.destination);

            // Create analyzer node for visualization
            this.analyzerNode = this.audioContext.createAnalyser();
            this.analyzerNode.fftSize = 2048;
            this.analyzerNode.smoothingTimeConstant = 0.8;
            this.analyzerNode.connect(this.masterGainNode);

            // Resume context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isInitialized = true;
            console.log('✅ CoreAudioEngine initialized:', {
                sampleRate: this.audioContext.sampleRate,
                state: this.audioContext.state,
                latency: this.audioContext.baseLatency
            });

            return this.audioContext;

        } catch (error) {
            console.error('❌ Failed to initialize CoreAudioEngine:', error);
            throw error;
        }
    }

    /**
     * Get or create AudioContext (auto-init if needed)
     */
    getContext() {
        if (!this.isInitialized && this.options.autoInit) {
            this.init();
        }
        return this.audioContext;
    }

    /**
     * Get master output node for module connections
     */
    getMasterOutput() {
        return this.analyzerNode || this.masterGainNode;
    }

    /**
     * Set master volume
     * @param {number} value - Volume (0-1)
     * @param {number} rampTime - Ramp time in seconds (default: 0.01)
     */
    setMasterVolume(value, rampTime = 0.01) {
        if (!this.masterGainNode) return;
        
        const now = this.audioContext.currentTime;
        this.masterGainNode.gain.cancelScheduledValues(now);
        this.masterGainNode.gain.setValueAtTime(
            this.masterGainNode.gain.value,
            now
        );
        this.masterGainNode.gain.linearRampToValueAtTime(
            Math.max(0, Math.min(1, value)),
            now + rampTime
        );
    }

    /**
     * Register an audio module
     * @param {string} name - Module identifier
     * @param {object} module - Audio module instance
     */
    registerModule(name, module) {
        if (this.modules.has(name)) {
            console.warn(`Module '${name}' already registered, replacing...`);
        }
        this.modules.set(name, module);
        console.log(`📦 Registered module: ${name}`);
        return module;
    }

    /**
     * Get registered module by name
     * @param {string} name - Module identifier
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Connect two modules together
     * @param {string} source - Source module name
     * @param {string} destination - Destination module name or 'master'
     */
    connect(source, destination = 'master') {
        const sourceModule = this.modules.get(source);
        if (!sourceModule) {
            throw new Error(`Source module '${source}' not found`);
        }

        let destinationNode;
        if (destination === 'master') {
            destinationNode = this.getMasterOutput();
        } else {
            const destModule = this.modules.get(destination);
            if (!destModule) {
                throw new Error(`Destination module '${destination}' not found`);
            }
            destinationNode = destModule.input || destModule;
        }

        const sourceNode = sourceModule.output || sourceModule;
        sourceNode.connect(destinationNode);

        // Track connection
        if (!this.connections.has(source)) {
            this.connections.set(source, new Set());
        }
        this.connections.get(source).add(destination);

        console.log(`🔌 Connected: ${source} → ${destination}`);
    }

    /**
     * Disconnect module
     * @param {string} source - Source module name
     * @param {string} destination - Optional specific destination
     */
    disconnect(source, destination = null) {
        const sourceModule = this.modules.get(source);
        if (!sourceModule) return;

        const sourceNode = sourceModule.output || sourceModule;
        
        if (destination) {
            // Disconnect specific destination
            let destNode;
            if (destination === 'master') {
                destNode = this.getMasterOutput();
            } else {
                const destModule = this.modules.get(destination);
                destNode = destModule ? (destModule.input || destModule) : null;
            }
            if (destNode) {
                sourceNode.disconnect(destNode);
            }
            
            const connections = this.connections.get(source);
            if (connections) {
                connections.delete(destination);
            }
        } else {
            // Disconnect all
            sourceNode.disconnect();
            this.connections.delete(source);
        }
    }

    /**
     * Create standard audio nodes
     */
    createGain(initialValue = 1.0) {
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(initialValue, this.audioContext.currentTime);
        return gain;
    }

    createFilter(type = 'lowpass', frequency = 1000, q = 1) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        filter.Q.setValueAtTime(q, this.audioContext.currentTime);
        return filter;
    }

    createOscillator(type = 'sine', frequency = 440) {
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        return osc;
    }

    createDelay(delayTime = 0.5) {
        const delay = this.audioContext.createDelay(10); // Max 10 seconds
        delay.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);
        return delay;
    }

    createConvolver() {
        return this.audioContext.createConvolver();
    }

    createWaveShaper() {
        return this.audioContext.createWaveShaper();
    }

    createAnalyser(fftSize = 2048) {
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = 0.8;
        return analyser;
    }

    /**
     * Utility: Create noise buffer for drums
     * @param {number} duration - Duration in seconds
     * @param {string} type - 'white', 'pink', or 'brown'
     */
    createNoiseBuffer(duration = 1, type = 'white') {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'white') {
            // White noise: equal power at all frequencies
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            // Pink noise: -3dB per octave (1/f spectrum)
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // Compensate for volume
                b6 = white * 0.115926;
            }
        } else if (type === 'brown') {
            // Brown noise: -6dB per octave
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume
            }
        }

        return buffer;
    }

    /**
     * Utility: Create distortion curve for wave shaping
     * @param {number} amount - Distortion amount (0-100)
     */
    createDistortionCurve(amount = 50) {
        const k = amount;
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }

        return curve;
    }

    /**
     * Utility: Create soft clipping curve (tanh)
     * @param {number} drive - Drive amount (1-10)
     */
    createSoftClipCurve(drive = 2) {
        const samples = 2048;
        const curve = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const x = (i * 2 / samples) - 1;
            const processed = Math.tanh(x * drive);
            curve[i] = processed / Math.max(Math.abs(processed), 1.0);
        }

        return curve;
    }

    /**
     * Get current time from AudioContext
     */
    getCurrentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }

    /**
     * Schedule parameter change with exponential ramp
     * @param {AudioParam} param - Audio parameter
     * @param {number} value - Target value
     * @param {number} duration - Ramp duration in seconds
     */
    scheduleExponentialRamp(param, value, duration = 0.01) {
        const now = this.getCurrentTime();
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.exponentialRampToValueAtTime(
            Math.max(0.001, value), // Avoid zero for exponential
            now + duration
        );
    }

    /**
     * Schedule parameter change with linear ramp
     * @param {AudioParam} param - Audio parameter
     * @param {number} value - Target value
     * @param {number} duration - Ramp duration in seconds
     */
    scheduleLinearRamp(param, value, duration = 0.01) {
        const now = this.getCurrentTime();
        param.cancelScheduledValues(now);
        param.setValueAtTime(param.value, now);
        param.linearRampToValueAtTime(value, now + duration);
    }

    /**
     * Get analyzer data for visualization
     * @param {string} type - 'frequency' or 'waveform'
     */
    getAnalyzerData(type = 'frequency') {
        if (!this.analyzerNode) return null;

        if (type === 'frequency') {
            const bufferLength = this.analyzerNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyzerNode.getByteFrequencyData(dataArray);
            return dataArray;
        } else {
            const bufferLength = this.analyzerNode.fftSize;
            const dataArray = new Uint8Array(bufferLength);
            this.analyzerNode.getByteTimeDomainData(dataArray);
            return dataArray;
        }
    }

    /**
     * Suspend audio context (pause all audio)
     */
    async suspend() {
        if (this.audioContext && this.audioContext.state === 'running') {
            await this.audioContext.suspend();
            console.log('⏸️  Audio suspended');
        }
    }

    /**
     * Resume audio context
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('▶️  Audio resumed');
        }
    }

    /**
     * Close audio context and cleanup
     */
    async dispose() {
        if (this.audioContext) {
            // Disconnect all modules
            for (const [name] of this.modules) {
                this.disconnect(name);
            }

            await this.audioContext.close();
            this.audioContext = null;
            this.masterGainNode = null;
            this.analyzerNode = null;
            this.isInitialized = false;
            this.modules.clear();
            this.connections.clear();
            
            console.log('🔴 CoreAudioEngine disposed');
        }
    }

    /**
     * Get engine status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            state: this.audioContext?.state,
            sampleRate: this.audioContext?.sampleRate,
            currentTime: this.audioContext?.currentTime,
            baseLatency: this.audioContext?.baseLatency,
            modulesCount: this.modules.size,
            connectionsCount: Array.from(this.connections.values())
                .reduce((sum, set) => sum + set.size, 0)
        };
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreAudioEngine;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.CoreAudioEngine = CoreAudioEngine;
}
