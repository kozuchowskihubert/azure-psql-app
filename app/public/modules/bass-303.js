/**
 * Bass303 Module
 * Modular wrapper for TB-303 synthesis
 */

class Bass303 {
    constructor(coreEngine) {
        this.coreEngine = coreEngine;
        this.context = coreEngine.audioContext;
        
        // Create output node
        this.output = this.context.createGain();
        this.output.gain.value = 0.8;
        
        // TB-303 parameters
        this.params = {
            cutoff: 800,
            resonance: 18,
            envMod: 0.7,
            decay: 0.4,
            waveform: 'sawtooth',
            slideTime: 0.1
        };
        
        this.currentFrequency = null;
    }
    
    playNote(noteData) {
        const { note, accent = false, slide = false, duration = 0.3 } = noteData;
        const frequency = this.noteToFrequency(note);
        const time = this.context.currentTime;
        
        // Oscillator
        const osc = this.context.createOscillator();
        osc.type = this.params.waveform;
        
        // Glide
        if (slide && this.currentFrequency) {
            osc.frequency.setValueAtTime(this.currentFrequency, time);
            osc.frequency.exponentialRampToValueAtTime(frequency, time + this.params.slideTime);
        } else {
            osc.frequency.setValueAtTime(frequency, time);
        }
        
        this.currentFrequency = frequency;
        
        // Filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        
        const cutoffBase = this.params.cutoff;
        const cutoffPeak = cutoffBase + (cutoffBase * this.params.envMod * 4);
        const accentMult = accent ? 1.5 : 1;
        
        filter.frequency.setValueAtTime(cutoffBase, time);
        filter.frequency.exponentialRampToValueAtTime(cutoffPeak * accentMult, time + 0.01);
        filter.frequency.exponentialRampToValueAtTime(cutoffBase, time + this.params.decay);
        filter.Q.value = this.params.resonance;
        
        // Amplitude
        const amp = this.context.createGain();
        const ampPeak = accent ? 0.9 : 0.6;
        
        amp.gain.setValueAtTime(0, time);
        amp.gain.linearRampToValueAtTime(ampPeak, time + 0.003);
        amp.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        // Connect
        osc.connect(filter);
        filter.connect(amp);
        amp.connect(this.output);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    setParam(param, value) {
        if (this.params.hasOwnProperty(param)) {
            this.params[param] = value;
        }
    }
    
    noteToFrequency(note) {
        const notes = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        
        const match = note.match(/^([A-G]#?)(\d+)$/);
        if (!match) return 440;
        
        const [, noteName, octave] = match;
        const noteNumber = notes[noteName];
        const octaveNumber = parseInt(octave);
        
        const midiNote = (octaveNumber + 1) * 12 + noteNumber;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
    
    connect(destination) {
        this.output.connect(destination);
        return this;
    }
    
    disconnect() {
        this.output.disconnect();
        return this;
    }
}

// Make available globally
window.Bass303 = Bass303;
