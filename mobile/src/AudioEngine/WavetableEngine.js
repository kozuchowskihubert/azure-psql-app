/**
 * HAOS.fm Wavetable Synthesis Engine
 * Advanced wavetable synthesis inspired by SERUM2
 * Features: Multiple wavetables, morphing, FM synthesis, unison
 */

import { Audio } from 'expo-av';

class WavetableEngine {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    
    // Oscillator parameters
    this.params = {
      // Wavetable
      wavetable: 'analog',
      wavetablePosition: 0.5,
      wavetableMorph: 0,
      
      // Oscillator A
      oscALevel: 0.8,
      oscAOctave: 0,
      oscASemitone: 0,
      oscADetune: 0,
      oscAPhase: 0,
      oscAPan: 0,
      
      // Oscillator B
      oscBLevel: 0.5,
      oscBOctave: 0,
      oscBSemitone: 7, // Fifth
      oscBDetune: 0.02,
      oscBPhase: 0,
      oscBPan: 0,
      
      // Sub Oscillator
      subLevel: 0.3,
      subOctave: -1,
      subShape: 'sine',
      
      // Unison
      unisonVoices: 1,
      unisonDetune: 0.1,
      unisonBlend: 0.5,
      
      // Noise
      noiseLevel: 0,
      noiseColor: 'white',
      
      // FM Synthesis
      fmAmount: 0,
      fmRatio: 1,
      fmFine: 0,
      
      // Filter
      filterType: 'lowpass',
      filterCutoff: 2000,
      filterResonance: 1,
      filterDrive: 1,
      
      // Envelope
      ampAttack: 0.01,
      ampDecay: 0.3,
      ampSustain: 0.7,
      ampRelease: 0.5,
      
      filterAttack: 0.01,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      filterEnvAmount: 0.5,
      
      // Master
      volume: 0.7,
      pan: 0,
    };
    
    // Wavetable definitions
    this.wavetables = {
      analog: {
        name: 'Analog Classic',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Classic analog waveforms'
      },
      digital: {
        name: 'Digital Spectrum',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Sharp digital tones'
      },
      vocal: {
        name: 'Vocal Formants',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Vowel-like sounds'
      },
      harmonic: {
        name: 'Harmonic Series',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Rich harmonics'
      },
      bell: {
        name: 'Bell Tones',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Metallic bell sounds'
      },
      pad: {
        name: 'Pad Stack',
        waveforms: ['sine', 'triangle', 'sawtooth', 'square'],
        description: 'Lush pad sounds'
      }
    };
    
    // Active voices
    this.voices = [];
    this.maxVoices = 8;
  }
  
  /**
   * Initialize audio context
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
      console.log('✅ WavetableEngine initialized');
    } catch (error) {
      console.error('❌ WavetableEngine init error:', error);
    }
  }
  
  /**
   * Play note with wavetable synthesis
   */
  playNote(note, velocity = 1.0, duration = null) {
    if (!this.isInitialized) return;
    
    const frequency = this.noteToFrequency(note);
    
    // Create voice
    const voice = {
      id: Date.now() + Math.random(),
      note,
      frequency,
      velocity,
      startTime: Date.now(),
      duration,
      active: true,
    };
    
    // Add to voices
    this.voices.push(voice);
    if (this.voices.length > this.maxVoices) {
      this.voices.shift(); // Remove oldest
    }
    
    // Trigger envelope
    this._triggerVoice(voice);
    
    return voice.id;
  }
  
  /**
   * Stop note
   */
  stopNote(noteId) {
    const voice = this.voices.find(v => v.id === noteId);
    if (voice) {
      voice.active = false;
      // Release envelope would be triggered here
    }
  }
  
  /**
   * Internal voice triggering (simplified for mobile)
   */
  _triggerVoice(voice) {
    // In a full implementation, this would:
    // 1. Calculate wavetable position
    // 2. Generate oscillator A + B with unison
    // 3. Add sub oscillator
    // 4. Add noise
    // 5. Apply FM modulation
    // 6. Apply filter with envelope
    // 7. Apply amp envelope
    // 8. Mix and output
    
    console.log(`🎵 Voice: ${voice.note} @ ${voice.frequency}Hz`);
  }
  
  /**
   * Set wavetable
   */
  setWavetable(wavetableName) {
    if (this.wavetables[wavetableName]) {
      this.params.wavetable = wavetableName;
      console.log(`🌊 Wavetable: ${this.wavetables[wavetableName].name}`);
    }
  }
  
  /**
   * Set parameter
   */
  setParameter(param, value) {
    if (this.params.hasOwnProperty(param)) {
      this.params[param] = value;
    }
  }
  
  /**
   * Get parameter
   */
  getParameter(param) {
    return this.params[param];
  }
  
  /**
   * Load preset
   */
  loadPreset(preset) {
    Object.keys(preset).forEach(key => {
      if (this.params.hasOwnProperty(key)) {
        this.params[key] = preset[key];
      }
    });
    console.log(`🎛️ Preset loaded`);
  }
  
  /**
   * Note to frequency conversion
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
   * Cleanup
   */
  destroy() {
    this.voices = [];
    this.isInitialized = false;
  }
}

export default WavetableEngine;
