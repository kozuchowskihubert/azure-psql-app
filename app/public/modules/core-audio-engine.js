/**
 * Core Audio Engine
 * Central Web Audio API manager with master gain control
 */

class CoreAudioEngine {
    constructor(config = {}) {
        this.config = {
            masterGain: config.masterGain || 0.7,
            sampleRate: config.sampleRate || 48000,
            latency: config.latency || 'interactive'
        };
        
        this.audioContext = null;
        this.masterGainNode = null;
        this.analyzerNode = null;
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) {
            console.warn('Audio engine already initialized');
            return this;
        }
        
        try {
            // Create AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({
                sampleRate: this.config.sampleRate,
                latencyHint: this.config.latency
            });
            
            // Create master gain node
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = this.config.masterGain;
            
            // Create analyzer for visualization
            this.analyzerNode = this.audioContext.createAnalyser();
            this.analyzerNode.fftSize = 2048;
            
            // Connect chain: masterGain -> analyzer -> destination
            this.masterGainNode.connect(this.analyzerNode);
            this.analyzerNode.connect(this.audioContext.destination);
            
            // Resume context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.initialized = true;
            
            console.log('🎛️ Core Audio Engine initialized:', {
                sampleRate: this.audioContext.sampleRate + ' Hz',
                state: this.audioContext.state,
                baseLatency: this.audioContext.baseLatency,
                outputLatency: this.audioContext.outputLatency
            });
            
            return this;
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            throw error;
        }
    }
    
    // Resume audio context (needed after user interaction)
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('Audio context resumed');
        }
    }
    
    // Get current time in audio context
    getCurrentTime() {
        return this.audioContext ? this.audioContext.currentTime : 0;
    }
    
    // Set master volume
    setMasterVolume(value) {
        if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(
                value,
                this.audioContext.currentTime
            );
        }
    }
    
    // Get analyzer data for visualization
    getAnalyzerData() {
        if (!this.analyzerNode) return null;
        
        const bufferLength = this.analyzerNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyzerNode.getByteFrequencyData(dataArray);
        
        return dataArray;
    }
    
    // Create a basic oscillator (for testing)
    createOscillator(frequency = 440, type = 'sine') {
        if (!this.audioContext) return null;
        
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.value = frequency;
        
        return osc;
    }
    
    // Create a gain node
    createGain(initialValue = 1.0) {
        if (!this.audioContext) return null;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = initialValue;
        
        return gain;
    }
    
    // Create a filter
    createFilter(type = 'lowpass', frequency = 1000, q = 1) {
        if (!this.audioContext) return null;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = q;
        
        return filter;
    }
    
    // Utility: Note to frequency conversion
    noteToFrequency(note) {
        const notes = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        
        const match = note.match(/^([A-G]#?)(\d+)$/);
        if (!match) return 440; // Default to A4
        
        const [, noteName, octave] = match;
        const noteNumber = notes[noteName];
        const octaveNumber = parseInt(octave);
        
        // A4 = 440 Hz (MIDI note 69)
        const midiNote = (octaveNumber + 1) * 12 + noteNumber;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
    
    // Clean up
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
            this.initialized = false;
            console.log('Audio engine disposed');
        }
    }
}

// Make available globally
window.CoreAudioEngine = CoreAudioEngine;
