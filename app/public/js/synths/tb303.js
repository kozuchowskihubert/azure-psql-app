/**
 * TB-303 Bass Synthesizer
 * Classic acid bassline synthesis with resonant filter
 */

class TB303 {
    constructor(audioContext) {
        this.context = audioContext;
        this.output = this.context.createGain();
        this.output.gain.value = 0.8;

        // TB-303 parameters
        this.params = {
            // Oscillator
            waveform: 'sawtooth', // sawtooth or square
            tuning: 0, // cents

            // Filter
            cutoff: 800, // Hz
            resonance: 18, // 0-30
            envMod: 0.7, // envelope modulation amount (0-1)

            // Envelope
            decay: 0.4, // seconds
            accent: false,

            // Glide
            slide: false,
            slideTime: 0.1, // seconds
        };

        // Current state
        this.currentNote = null;
        this.currentFrequency = null;

        // Pattern (16 steps)
        this.pattern = [];
    }

    // Play a note
    playNote(noteData) {
        const { note, accent = false, slide = false, duration = 0.3 } = noteData;

        const frequency = this.noteToFrequency(note);
        const time = this.context.currentTime;

        // Create oscillator
        const osc = this.context.createOscillator();
        osc.type = this.params.waveform;

        // Glide/slide
        if (slide && this.currentFrequency) {
            osc.frequency.setValueAtTime(this.currentFrequency, time);
            osc.frequency.exponentialRampToValueAtTime(
                frequency,
                time + this.params.slideTime,
            );
        } else {
            osc.frequency.setValueAtTime(frequency, time);
        }

        this.currentFrequency = frequency;

        // Create filter (the iconic 303 sound)
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';

        // Filter cutoff with envelope
        const cutoffBase = this.params.cutoff;
        const cutoffPeak = cutoffBase + (cutoffBase * this.params.envMod * 4);
        const accentMultiplier = accent ? 1.5 : 1;

        filter.frequency.setValueAtTime(cutoffBase, time);
        filter.frequency.exponentialRampToValueAtTime(
            cutoffPeak * accentMultiplier,
            time + 0.01,
        );
        filter.frequency.exponentialRampToValueAtTime(
            cutoffBase,
            time + this.params.decay,
        );

        // Resonance
        filter.Q.value = this.params.resonance;

        // Amplitude envelope
        const amp = this.context.createGain();
        const ampPeak = accent ? 0.9 : 0.6;

        amp.gain.setValueAtTime(0, time);
        amp.gain.linearRampToValueAtTime(ampPeak, time + 0.003);
        amp.gain.exponentialRampToValueAtTime(
            0.001,
            time + duration,
        );

        // Connect: osc -> filter -> amp -> output
        osc.connect(filter);
        filter.connect(amp);
        amp.connect(this.output);

        // Start and stop
        osc.start(time);
        osc.stop(time + duration);

        this.currentNote = note;
    }

    // Set parameter
    setParam(param, value) {
        if (this.params.hasOwnProperty(param)) {
            this.params[param] = value;
            console.log(`TB-303: ${param} = ${value}`);
        }
    }

    // Note to frequency
    noteToFrequency(note) {
        const notes = {
            C: 0,
'C#': 1,
D: 2,
'D#': 3,
E: 4,
F: 5,
            'F#': 6,
G: 7,
'G#': 8,
A: 9,
'A#': 10,
B: 11,
        };

        const match = note.match(/^([A-G]#?)(\d+)$/);
        if (!match) return 440;

        const [, noteName, octave] = match;
        const noteNumber = notes[noteName];
        const octaveNumber = parseInt(octave);

        const midiNote = (octaveNumber + 1) * 12 + noteNumber;
        return 440 * 2 ** ((midiNote - 69) / 12);
    }

    // Connect to destination
    connect(destination) {
        this.output.connect(destination);
        return this;
    }

    // Disconnect
    disconnect() {
        this.output.disconnect();
        return this;
    }
}

// Make available globally
window.TB303 = TB303;
