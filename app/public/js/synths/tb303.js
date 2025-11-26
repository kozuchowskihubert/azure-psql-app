/**
 * TB-303 Acid Bass Synthesizer Module
 * Emulates Roland TB-303 / Behringer TD-3
 * 
 * Features:
 * - Classic sawtooth/square oscillator
 * - Resonant lowpass filter with envelope modulation
 * - Accent, slide, and gate controls
 * - 16-step sequencer
 */

class TB303 {
    constructor(audioContext) {
        this.audioContext = audioContext;
        
        // Synth parameters
        this.params = {
            cutoff: 800,          // Filter cutoff frequency (Hz)
            resonance: 15,        // Filter Q factor
            envMod: 70,          // Envelope modulation amount (%)
            decay: 0.3,          // Envelope decay time (s)
            accentLevel: 50,     // Accent intensity (%)
            waveform: 'sawtooth', // Oscillator waveform
            tuning: 0,           // Fine tuning (cents)
            volume: 70,          // Master volume (%)
            distortion: 20,      // Distortion amount (%)
            delay: 0             // Delay mix (%)
        };
        
        // Pattern (16 steps)
        this.pattern = Array(16).fill(null).map(() => ({
            active: false,
            note: 'C3',
            accent: false,
            slide: false,
            gate: false
        }));
        
        // Playback state
        this.isPlaying = false;
        this.currentStep = 0;
        this.interval = null;
        this.bpm = 130;
        
        // Enhanced modulation system
        this.modulation = {
            lfo: {
                enabled: false,
                rate: 5,           // Hz
                depth: 0,          // 0-100
                waveform: 'sine',  // sine, square, triangle, sawtooth
                destination: 'cutoff' // cutoff, resonance, pitch, distortion
            },
            envelope: {
                cutoffAmount: 70,  // Filter envelope amount (existing as envMod)
                pitchAmount: 0,    // Pitch envelope amount
                distortionAmount: 0 // Distortion envelope amount
            },
            external: {
                enabled: false,
                source: null,      // External audio node
                amount: 0.5,
                destination: 'cutoff'
            }
        };
        
        // LFO node (created on demand)
        this.lfoNode = null;
        this.lfoGain = null;
        
        // Note frequency table
        this.noteFrequencies = {
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
            'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63
        };
    }
    
    /**
     * Set synthesizer parameter
     */
    setParam(param, value) {
        if (this.params.hasOwnProperty(param)) {
            this.params[param] = parseFloat(value);
            return true;
        }
        return false;
    }
    
    /**
     * Set modulation parameter
     */
    setModulation(type, param, value) {
        if (this.modulation[type] && this.modulation[type].hasOwnProperty(param)) {
            this.modulation[type][param] = value;
            
            // Update LFO if it's running
            if (type === 'lfo' && this.lfoNode) {
                if (param === 'rate') {
                    this.lfoNode.frequency.value = value;
                } else if (param === 'waveform') {
                    this.lfoNode.type = value;
                } else if (param === 'depth' && this.lfoGain) {
                    this.lfoGain.gain.value = value / 100;
                }
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Enable/disable LFO
     */
    setLFO(enabled) {
        this.modulation.lfo.enabled = enabled;
        
        if (enabled && !this.lfoNode) {
            this.lfoNode = this.audioContext.createOscillator();
            this.lfoGain = this.audioContext.createGain();
            this.lfoNode.type = this.modulation.lfo.waveform;
            this.lfoNode.frequency.value = this.modulation.lfo.rate;
            this.lfoGain.gain.value = this.modulation.lfo.depth / 100;
            this.lfoNode.connect(this.lfoGain);
            this.lfoNode.start();
        } else if (!enabled && this.lfoNode) {
            this.lfoNode.stop();
            this.lfoNode = null;
            this.lfoGain = null;
        }
    }
    
    /**
     * Set external modulation source
     */
    setExternalModulation(enabled, source = null, amount = 0.5, destination = 'cutoff') {
        this.modulation.external.enabled = enabled;
        this.modulation.external.source = source;
        this.modulation.external.amount = Math.max(0, Math.min(1, amount));
        this.modulation.external.destination = destination;
    }
    
    /**
     * Get synthesizer parameter
     */
    getParam(param) {
        return this.params[param];
    }
    
    /**
     * Set pattern step
     */
    setStep(index, data) {
        if (index >= 0 && index < 16) {
            this.pattern[index] = { ...this.pattern[index], ...data };
            return true;
        }
        return false;
    }
    
    /**
     * Get pattern step
     */
    getStep(index) {
        return this.pattern[index];
    }
    
    /**
     * Toggle step active state
     */
    toggleStep(index) {
        if (index >= 0 && index < 16) {
            this.pattern[index].active = !this.pattern[index].active;
            return this.pattern[index].active;
        }
        return false;
    }
    
    /**
     * Clear entire pattern
     */
    clearPattern() {
        this.pattern = Array(16).fill(null).map(() => ({
            active: false,
            note: 'C3',
            accent: false,
            slide: false,
            gate: false
        }));
    }
    
    /**
     * Randomize pattern
     */
    randomizePattern() {
        const notes = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'D3', 'E3', 'F3'];
        this.pattern.forEach(step => {
            step.active = Math.random() > 0.4;
            step.note = notes[Math.floor(Math.random() * notes.length)];
            step.accent = Math.random() > 0.7;
            step.slide = Math.random() > 0.85;
            step.gate = Math.random() > 0.6;
        });
    }
    
    /**
     * Load preset pattern
     */
    loadPresetPattern(patternName) {
        const presets = {
            'classic303': [
                { active: true, note: 'C3', accent: true, slide: false, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'D#3', accent: false, slide: true, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'C3', accent: false, slide: false, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'G3', accent: true, slide: false, gate: true },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'C3', accent: false, slide: false, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'D#3', accent: false, slide: true, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'C3', accent: true, slide: false, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false },
                { active: true, note: 'D3', accent: false, slide: false, gate: false },
                { active: false, note: 'C3', accent: false, slide: false, gate: false }
            ],
            'squelch': Array(16).fill(null).map((_, i) => ({
                active: i % 2 === 0,
                note: ['C3', 'E3', 'G3', 'C3', 'F3', 'A#2', 'G3', 'C3'][i % 8],
                accent: i % 4 === 0,
                slide: i % 3 === 1,
                gate: false
            })),
            'driving': Array(16).fill(null).map((_, i) => ({
                active: true,
                note: 'C3',
                accent: i % 4 === 0,
                slide: false,
                gate: i % 2 === 0
            })),
            'minimal': Array(16).fill(null).map((_, i) => ({
                active: [0, 4, 8, 12].includes(i),
                note: 'C3',
                accent: i === 0,
                slide: false,
                gate: true
            })),
            'acidhouse': Array(16).fill(null).map((_, i) => ({
                active: ![1, 5, 9, 13].includes(i),
                note: ['C3', 'D#3', 'F3', 'G3'][i % 4],
                accent: i % 8 === 0,
                slide: i % 5 === 2,
                gate: false
            })),
            'psy': Array(16).fill(null).map((_, i) => ({
                active: true,
                note: ['C3', 'D3', 'E3', 'D3'][i % 4],
                accent: i % 3 === 0,
                slide: i % 4 === 3,
                gate: i % 2 === 1
            }))
        };
        
        if (presets[patternName]) {
            this.pattern = presets[patternName];
            return true;
        }
        return false;
    }
    
    /**
     * Play single note
     */
    playNote(step, time = null) {
        if (!this.audioContext) return;
        
        const startTime = time || this.audioContext.currentTime;
        const baseFreq = this.noteFrequencies[step.note] || 130.81;
        const freq = baseFreq * Math.pow(2, this.params.tuning / 1200);
        
        // VCO (Oscillator)
        const osc = this.audioContext.createOscillator();
        osc.type = this.params.waveform;
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Apply pitch modulation from envelope if enabled
        if (this.modulation.envelope.pitchAmount > 0) {
            const pitchEnv = this.modulation.envelope.pitchAmount * 2; // Semitones
            const pitchFreq = freq * Math.pow(2, pitchEnv / 12);
            osc.frequency.setValueAtTime(pitchFreq, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq, startTime + this.params.decay);
        }
        
        // Apply LFO modulation if enabled
        if (this.modulation.lfo.enabled && this.lfoGain && this.modulation.lfo.destination === 'pitch') {
            this.lfoGain.connect(osc.frequency);
        }
        
        // VCF (Filter)
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.setValueAtTime(this.params.resonance, startTime);
        
        // Envelope modulation on filter
        const envelopeAmount = (this.params.envMod / 100) * (this.params.cutoff * 2);
        const accentMultiplier = step.accent ? (1 + this.params.accentLevel / 100) : 1;
        const peakCutoff = Math.min(this.params.cutoff + (envelopeAmount * accentMultiplier), 8000);
        
        filter.frequency.setValueAtTime(peakCutoff, startTime);
        filter.frequency.exponentialRampToValueAtTime(
            Math.max(this.params.cutoff, 50), 
            startTime + this.params.decay
        );
        
        // Apply LFO modulation to filter if enabled
        if (this.modulation.lfo.enabled && this.lfoGain && this.modulation.lfo.destination === 'cutoff') {
            const lfoDepth = this.audioContext.createGain();
            lfoDepth.gain.value = this.params.cutoff * (this.modulation.lfo.depth / 100);
            this.lfoGain.connect(lfoDepth);
            lfoDepth.connect(filter.frequency);
        }
        
        // Apply external modulation if enabled
        if (this.modulation.external.enabled && this.modulation.external.source) {
            if (this.modulation.external.destination === 'cutoff') {
                const extModGain = this.audioContext.createGain();
                extModGain.gain.value = this.params.cutoff * this.modulation.external.amount;
                this.modulation.external.source.connect(extModGain);
                extModGain.connect(filter.frequency);
            }
        }
        
        // VCA (Envelope)
        const gainNode = this.audioContext.createGain();
        const baseGain = (this.params.volume / 100) * 0.3;
        const accentedGain = baseGain * accentMultiplier;
        const gateTime = step.gate ? 0.25 : 0.1;
        
        gainNode.gain.setValueAtTime(accentedGain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + gateTime);
        
        // Distortion (optional)
        let currentNode = filter;
        if (this.params.distortion > 0) {
            const distortion = this.audioContext.createWaveShaper();
            const amount = this.params.distortion / 100;
            const k = amount * 100;
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                const x = (i * 2 / samples) - 1;
                curve[i] = (3 + k) * x * 20 * (Math.PI / 180) / (Math.PI + k * Math.abs(x));
            }
            distortion.curve = curve;
            distortion.oversample = '4x';
            currentNode.connect(distortion);
            currentNode = distortion;
        }
        
        // Connect audio graph
        osc.connect(filter);
        currentNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start & stop
        osc.start(startTime);
        osc.stop(startTime + gateTime + 0.1);
        
        return { osc, filter, gainNode };
    }
    
    /**
     * Start pattern playback
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        
        const stepTime = (60 / this.bpm) * 1000 / 4; // 16th notes
        
        this.interval = setInterval(() => {
            const step = this.pattern[this.currentStep];
            
            if (step.active) {
                this.playNote(step);
            }
            
            this.currentStep = (this.currentStep + 1) % 16;
            
            // Trigger step change event
            if (this.onStepChange) {
                this.onStepChange(this.currentStep);
            }
        }, stepTime);
    }
    
    /**
     * Stop pattern playback
     */
    stop() {
        this.isPlaying = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.currentStep = 0;
        
        if (this.onStop) {
            this.onStop();
        }
    }
    
    /**
     * Set BPM
     */
    setBPM(bpm) {
        this.bpm = Math.max(60, Math.min(200, bpm));
        
        // Restart playback with new BPM if playing
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
    }
    
    /**
     * Export pattern to JSON
     */
    exportPattern() {
        return {
            params: { ...this.params },
            pattern: JSON.parse(JSON.stringify(this.pattern)),
            bpm: this.bpm
        };
    }
    
    /**
     * Import pattern from JSON
     */
    importPattern(data) {
        if (data.params) {
            this.params = { ...this.params, ...data.params };
        }
        if (data.pattern && Array.isArray(data.pattern)) {
            this.pattern = data.pattern;
        }
        if (data.bpm) {
            this.bpm = data.bpm;
        }
        return true;
    }
}

// Export for use in ES6 modules
export default TB303;

// Also support CommonJS for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TB303;
}
