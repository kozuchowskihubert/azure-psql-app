/**
 * Sequencer Module for Behringer 2600 Studio
 * 16-step sequencer with CV, Gate, and Velocity outputs
 */

class StepSequencer {
    constructor() {
        this.steps = 16;
        this.currentStep = 0;
        this.isPlaying = false;
        this.bpm = 120;
        this.sequence = this.initializeSequence();
        this.intervalId = null;
        this.listeners = [];
    }

    initializeSequence() {
        const sequence = [];
        for (let i = 0; i < this.steps; i++) {
            sequence.push({
                pitch: 60, // Middle C
                gate: true,
                velocity: 100,
                active: i % 4 === 0, // Every 4th step active by default
            });
        }
        return sequence;
    }

    setStep(index, data) {
        if (index >= 0 && index < this.steps) {
            this.sequence[index] = { ...this.sequence[index], ...data };
            this.notifyListeners('stepChange', { index, data });
        }
    }

    getStep(index) {
        return this.sequence[index];
    }

    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        
        const interval = (60 / this.bpm) * 250; // 16th notes
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, interval);
        
        this.notifyListeners('start');
    }

    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.currentStep = 0;
        
        this.notifyListeners('stop');
    }

    reset() {
        this.currentStep = 0;
        this.notifyListeners('reset');
    }

    tick() {
        const step = this.sequence[this.currentStep];
        
        if (step.active && step.gate) {
            const cvVoltage = (step.pitch - 60) / 12; // 1V/octave
            const gateSignal = step.gate ? 1 : 0;
            const velocitySignal = step.velocity / 127;
            
            this.notifyListeners('step', {
                index: this.currentStep,
                cv: cvVoltage,
                gate: gateSignal,
                velocity: velocitySignal,
                pitch: step.pitch,
            });
        }
        
        this.currentStep = (this.currentStep + 1) % this.steps;
    }

    setBPM(bpm) {
        this.bpm = Math.max(40, Math.min(300, bpm));
        
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
        
        this.notifyListeners('bpmChange', { bpm: this.bpm });
    }

    randomize() {
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9],
            blues: [0, 3, 5, 6, 7, 10],
        };
        
        const scale = scales.pentatonic;
        const rootNote = 48 + Math.floor(Math.random() * 24); // C3 to B4
        
        for (let i = 0; i < this.steps; i++) {
            const scaleNote = scale[Math.floor(Math.random() * scale.length)];
            const octave = Math.floor(Math.random() * 2) * 12;
            
            this.sequence[i] = {
                pitch: rootNote + scaleNote + octave,
                gate: Math.random() > 0.3, // 70% chance of gate
                velocity: 60 + Math.floor(Math.random() * 67), // 60-127
                active: Math.random() > 0.2, // 80% chance active
            };
        }
        
        this.notifyListeners('randomize');
    }

    loadPattern(pattern) {
        const patterns = {
            bassline: [
                { pitch: 48, gate: true, velocity: 127, active: true },
                { pitch: 48, gate: false, velocity: 0, active: false },
                { pitch: 55, gate: true, velocity: 100, active: true },
                { pitch: 55, gate: false, velocity: 0, active: false },
                { pitch: 52, gate: true, velocity: 110, active: true },
                { pitch: 52, gate: false, velocity: 0, active: false },
                { pitch: 50, gate: true, velocity: 100, active: true },
                { pitch: 50, gate: false, velocity: 0, active: false },
                { pitch: 48, gate: true, velocity: 127, active: true },
                { pitch: 48, gate: false, velocity: 0, active: false },
                { pitch: 53, gate: true, velocity: 100, active: true },
                { pitch: 53, gate: false, velocity: 0, active: false },
                { pitch: 55, gate: true, velocity: 110, active: true },
                { pitch: 55, gate: false, velocity: 0, active: false },
                { pitch: 52, gate: true, velocity: 100, active: true },
                { pitch: 52, gate: false, velocity: 0, active: false },
            ],
            arpeggio: [
                { pitch: 60, gate: true, velocity: 100, active: true },
                { pitch: 64, gate: true, velocity: 90, active: true },
                { pitch: 67, gate: true, velocity: 95, active: true },
                { pitch: 72, gate: true, velocity: 100, active: true },
                { pitch: 67, gate: true, velocity: 95, active: true },
                { pitch: 64, gate: true, velocity: 90, active: true },
                { pitch: 60, gate: true, velocity: 100, active: true },
                { pitch: 64, gate: true, velocity: 90, active: true },
                { pitch: 67, gate: true, velocity: 95, active: true },
                { pitch: 72, gate: true, velocity: 100, active: true },
                { pitch: 67, gate: true, velocity: 95, active: true },
                { pitch: 64, gate: true, velocity: 90, active: true },
                { pitch: 60, gate: true, velocity: 100, active: true },
                { pitch: 64, gate: true, velocity: 90, active: true },
                { pitch: 67, gate: true, velocity: 95, active: true },
                { pitch: 72, gate: true, velocity: 100, active: true },
            ],
            rhythm: [
                { pitch: 36, gate: true, velocity: 127, active: true },
                { pitch: 36, gate: false, velocity: 0, active: false },
                { pitch: 36, gate: false, velocity: 0, active: false },
                { pitch: 36, gate: true, velocity: 80, active: true },
                { pitch: 38, gate: true, velocity: 110, active: true },
                { pitch: 38, gate: false, velocity: 0, active: false },
                { pitch: 36, gate: true, velocity: 90, active: true },
                { pitch: 36, gate: false, velocity: 0, active: false },
                { pitch: 36, gate: true, velocity: 127, active: true },
                { pitch: 36, gate: false, velocity: 0, active: false },
                { pitch: 38, gate: true, velocity: 100, active: true },
                { pitch: 36, gate: true, velocity: 80, active: true },
                { pitch: 38, gate: true, velocity: 110, active: true },
                { pitch: 38, gate: false, velocity: 0, active: false },
                { pitch: 36, gate: true, velocity: 90, active: true },
                { pitch: 36, gate: false, velocity: 0, active: false },
            ],
        };
        
        if (patterns[pattern]) {
            this.sequence = [...patterns[pattern]];
            this.notifyListeners('patternLoad', { pattern });
        }
    }

    addEventListener(callback) {
        this.listeners.push(callback);
    }

    removeEventListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners(event, data = {}) {
        this.listeners.forEach(listener => {
            listener({ event, data, sequencer: this });
        });
    }

    getState() {
        return {
            steps: this.steps,
            currentStep: this.currentStep,
            isPlaying: this.isPlaying,
            bpm: this.bpm,
            sequence: [...this.sequence],
        };
    }
}

/**
 * Virtual Keyboard for Behringer 2600 Studio
 * Provides CV, Gate, and Velocity outputs
 */

class VirtualKeyboard {
    constructor() {
        this.activeNotes = new Map();
        this.listeners = [];
        this.octave = 4; // Default octave
        this.velocity = 100;
        
        // Computer keyboard to MIDI note mapping
        this.keyMap = {
            'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65, 
            't': 66, 'g': 67, 'y': 68, 'h': 69, 'u': 70, 'j': 71, 
            'k': 72, 'o': 73, 'l': 74, 'p': 75, ';': 76, "'": 77,
            'z': 48, 'x': 50, 'c': 52, 'v': 53, 'b': 55, 'n': 57, 'm': 59,
        };
    }

    noteOn(midiNote, velocity = 100) {
        if (this.activeNotes.has(midiNote)) return;
        
        this.activeNotes.set(midiNote, velocity);
        const cvVoltage = (midiNote - 60) / 12; // 1V/octave from C4
        
        this.notifyListeners('noteOn', {
            note: midiNote,
            cv: cvVoltage,
            gate: 1,
            velocity: velocity / 127,
            frequency: this.midiToFrequency(midiNote),
        });
    }

    noteOff(midiNote) {
        if (!this.activeNotes.has(midiNote)) return;
        
        this.activeNotes.delete(midiNote);
        
        this.notifyListeners('noteOff', {
            note: midiNote,
            cv: 0,
            gate: 0,
            velocity: 0,
        });
    }

    allNotesOff() {
        const notes = Array.from(this.activeNotes.keys());
        notes.forEach(note => this.noteOff(note));
    }

    midiToFrequency(midiNote) {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    setOctave(octave) {
        this.octave = Math.max(0, Math.min(8, octave));
        this.notifyListeners('octaveChange', { octave: this.octave });
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Octave controls
        if (key === 'z' && event.shiftKey) {
            this.setOctave(this.octave - 1);
            return;
        }
        if (key === 'x' && event.shiftKey) {
            this.setOctave(this.octave + 1);
            return;
        }
        
        // Note mapping
        if (this.keyMap[key] !== undefined) {
            const baseNote = this.keyMap[key];
            const note = baseNote + (this.octave - 4) * 12;
            this.noteOn(note, this.velocity);
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        
        if (this.keyMap[key] !== undefined) {
            const baseNote = this.keyMap[key];
            const note = baseNote + (this.octave - 4) * 12;
            this.noteOff(note);
        }
    }

    addEventListener(callback) {
        this.listeners.push(callback);
    }

    removeEventListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners(event, data = {}) {
        this.listeners.forEach(listener => {
            listener({ event, data, keyboard: this });
        });
    }

    getState() {
        return {
            activeNotes: Array.from(this.activeNotes.entries()),
            octave: this.octave,
            velocity: this.velocity,
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StepSequencer, VirtualKeyboard };
}
