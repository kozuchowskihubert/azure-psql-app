/**
 * HAOS.fm Virtual Instruments Library
 * Orchestral and band instruments: Strings, Violin, Bass Guitar, Electric Guitar, etc.
 * Sample-based playback with articulations
 */

import { Audio } from 'expo-av';

class VirtualInstruments {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    
    // Instrument definitions
    this.instruments = {
      // String Section
      strings: {
        name: 'String Ensemble',
        type: 'orchestral',
        articulations: ['sustain', 'staccato', 'pizzicato', 'tremolo'],
        range: ['C2', 'C6'],
        polyphony: 16,
        params: {
          expression: 0.7,
          vibrato: 0.3,
          attack: 0.3,
          release: 0.8,
          brightness: 0.6,
        }
      },
      
      // Solo Violin
      violin: {
        name: 'Solo Violin',
        type: 'orchestral',
        articulations: ['sustain', 'staccato', 'pizzicato', 'tremolo', 'trill', 'harmonics'],
        range: ['G3', 'E7'],
        polyphony: 1,
        params: {
          expression: 0.8,
          vibrato: 0.5,
          attack: 0.15,
          release: 0.4,
          bow_pressure: 0.7,
          bow_position: 0.5, // Sul tasto to sul ponticello
        }
      },
      
      // Cello
      cello: {
        name: 'Cello',
        type: 'orchestral',
        articulations: ['sustain', 'staccato', 'pizzicato', 'tremolo', 'spiccato'],
        range: ['C2', 'C6'],
        polyphony: 1,
        params: {
          expression: 0.8,
          vibrato: 0.4,
          attack: 0.2,
          release: 0.6,
          bow_pressure: 0.7,
        }
      },
      
      // Bass Guitar
      bassGuitar: {
        name: 'Bass Guitar',
        type: 'band',
        articulations: ['fingered', 'picked', 'slap', 'pop', 'harmonics', 'muted'],
        range: ['E1', 'G4'],
        polyphony: 4,
        params: {
          tone: 0.6,
          attack: 0.01,
          release: 0.3,
          sustain: 0.7,
          pickup: 0.5, // Bridge to neck
          compression: 0.4,
        }
      },
      
      // Electric Guitar
      electricGuitar: {
        name: 'Electric Guitar',
        type: 'band',
        articulations: ['clean', 'palm_mute', 'harmonics', 'bend', 'slide', 'vibrato'],
        range: ['E2', 'E6'],
        polyphony: 6,
        params: {
          gain: 0.3,
          tone: 0.7,
          attack: 0.005,
          release: 0.3,
          pickup: 0.5, // Bridge, middle, neck
          distortion: 0,
        }
      },
      
      // Acoustic Guitar
      acousticGuitar: {
        name: 'Acoustic Guitar',
        type: 'band',
        articulations: ['fingered', 'strummed', 'harmonics', 'muted', 'percussive'],
        range: ['E2', 'B5'],
        polyphony: 6,
        params: {
          brightness: 0.7,
          attack: 0.005,
          release: 0.5,
          body_resonance: 0.6,
          string_type: 'steel', // steel or nylon
        }
      },
      
      // Trumpet
      trumpet: {
        name: 'Trumpet',
        type: 'brass',
        articulations: ['sustain', 'staccato', 'flutter', 'growl', 'muted'],
        range: ['F#3', 'D6'],
        polyphony: 1,
        params: {
          expression: 0.7,
          vibrato: 0.3,
          attack: 0.05,
          release: 0.2,
          brightness: 0.8,
        }
      },
      
      // Saxophone
      saxophone: {
        name: 'Saxophone (Alto)',
        type: 'woodwind',
        articulations: ['sustain', 'staccato', 'flutter', 'growl', 'slap'],
        range: ['D3', 'A5'],
        polyphony: 1,
        params: {
          expression: 0.7,
          vibrato: 0.4,
          attack: 0.03,
          release: 0.3,
          breathiness: 0.3,
        }
      },
      
      // Piano
      piano: {
        name: 'Grand Piano',
        type: 'keyboard',
        articulations: ['normal', 'staccato', 'pedal_sustain'],
        range: ['A0', 'C8'],
        polyphony: 32,
        params: {
          velocity_curve: 0.5,
          release: 0.5,
          damper_resonance: 0.4,
          brightness: 0.6,
        }
      },
      
      // Electric Piano
      electricPiano: {
        name: 'Electric Piano',
        type: 'keyboard',
        articulations: ['normal', 'bell', 'tine'],
        range: ['A0', 'C7'],
        polyphony: 16,
        params: {
          tone: 0.6,
          tremolo_rate: 0,
          tremolo_depth: 0,
          release: 0.4,
        }
      },
    };
    
    // Current instrument
    this.currentInstrument = 'strings';
    this.currentArticulation = 'sustain';
    
    // Active voices
    this.voices = [];
  }
  
  /**
   * Initialize audio
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });
      
      this.isInitialized = true;
      console.log('✅ VirtualInstruments initialized');
    } catch (error) {
      console.error('❌ VirtualInstruments init error:', error);
    }
  }
  
  /**
   * Set active instrument
   */
  setInstrument(instrumentName) {
    if (this.instruments[instrumentName]) {
      this.currentInstrument = instrumentName;
      const inst = this.instruments[instrumentName];
      this.currentArticulation = inst.articulations[0];
      console.log(`🎻 Instrument: ${inst.name}`);
      return true;
    }
    return false;
  }
  
  /**
   * Set articulation
   */
  setArticulation(articulation) {
    const inst = this.instruments[this.currentInstrument];
    if (inst && inst.articulations.includes(articulation)) {
      this.currentArticulation = articulation;
      console.log(`🎼 Articulation: ${articulation}`);
      return true;
    }
    return false;
  }
  
  /**
   * Play note
   */
  playNote(note, velocity = 1.0, duration = null) {
    if (!this.isInitialized) return;
    
    const inst = this.instruments[this.currentInstrument];
    if (!inst) return;
    
    const frequency = this.noteToFrequency(note);
    
    // Check if note is in range
    const noteValue = this.noteToValue(note);
    const minValue = this.noteToValue(inst.range[0]);
    const maxValue = this.noteToValue(inst.range[1]);
    
    if (noteValue < minValue || noteValue > maxValue) {
      console.warn(`⚠️ Note ${note} out of range for ${inst.name}`);
    }
    
    const voice = {
      id: Date.now() + Math.random(),
      instrument: this.currentInstrument,
      articulation: this.currentArticulation,
      note,
      frequency,
      velocity,
      startTime: Date.now(),
      duration,
      active: true,
    };
    
    this.voices.push(voice);
    
    // Limit polyphony
    while (this.voices.length > inst.polyphony) {
      this.voices.shift();
    }
    
    // Trigger playback (simplified)
    this._playVoice(voice);
    
    return voice.id;
  }
  
  /**
   * Stop note
   */
  stopNote(voiceId) {
    const voice = this.voices.find(v => v.id === voiceId);
    if (voice) {
      voice.active = false;
      // Trigger release phase
    }
  }
  
  /**
   * Internal playback (simplified for mobile)
   */
  _playVoice(voice) {
    // In full implementation, this would:
    // 1. Load appropriate sample for note/velocity/articulation
    // 2. Apply pitch correction if needed
    // 3. Apply instrument parameters
    // 4. Apply effects (vibrato, tremolo, etc.)
    // 5. Trigger playback
    
    const inst = this.instruments[voice.instrument];
    console.log(`🎵 ${inst.name}: ${voice.note} (${voice.articulation})`);
  }
  
  /**
   * Set instrument parameter
   */
  setParameter(param, value) {
    const inst = this.instruments[this.currentInstrument];
    if (inst && inst.params.hasOwnProperty(param)) {
      inst.params[param] = value;
    }
  }
  
  /**
   * Get instrument info
   */
  getInstrumentInfo(instrumentName = null) {
    const name = instrumentName || this.currentInstrument;
    return this.instruments[name];
  }
  
  /**
   * Get all instruments by type
   */
  getInstrumentsByType(type) {
    return Object.keys(this.instruments)
      .filter(key => this.instruments[key].type === type)
      .map(key => ({
        id: key,
        ...this.instruments[key]
      }));
  }
  
  /**
   * Get all instrument categories
   */
  getCategories() {
    return {
      orchestral: this.getInstrumentsByType('orchestral'),
      band: this.getInstrumentsByType('band'),
      brass: this.getInstrumentsByType('brass'),
      woodwind: this.getInstrumentsByType('woodwind'),
      keyboard: this.getInstrumentsByType('keyboard'),
    };
  }
  
  /**
   * Note to frequency
   */
  noteToFrequency(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteMatch = note.match(/([A-G]#?)(\d)/);
    if (!noteMatch) return 440;
    
    const noteName = noteMatch[1];
    const octave = parseInt(noteMatch[2]);
    const noteIndex = notes.indexOf(noteName);
    const midiNote = (octave + 1) * 12 + noteIndex;
    
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }
  
  /**
   * Note to MIDI value
   */
  noteToValue(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteMatch = note.match(/([A-G]#?)(\d)/);
    if (!noteMatch) return 69;
    
    const noteName = noteMatch[1];
    const octave = parseInt(noteMatch[2]);
    const noteIndex = notes.indexOf(noteName);
    
    return (octave + 1) * 12 + noteIndex;
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.voices = [];
    this.isInitialized = false;
  }
}

export default VirtualInstruments;
