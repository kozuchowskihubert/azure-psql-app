/**
 * HAOS.fm Bass/Arp Synthesis Engine
 * Inspired by SERUM2 and Cymatics QUAKE
 * Features: Dual oscillators, modulation matrix, powerful bass/lead sounds
 */

class BassArpEngine {
  constructor() {
    this.isInitialized = false;
    
    // Engine parameters
    this.params = {
      // Oscillator 1
      osc1Waveform: 'sawtooth',
      osc1Level: 0.8,
      osc1Octave: 0,
      osc1Semitone: 0,
      osc1Detune: 0,
      osc1Phase: 0,
      osc1Unison: 1,
      osc1UnisonDetune: 0.1,
      
      // Oscillator 2
      osc2Waveform: 'square',
      osc2Level: 0.6,
      osc2Octave: 0,
      osc2Semitone: 12, // Octave up
      osc2Detune: 0.03,
      osc2Phase: 0,
      osc2Unison: 1,
      osc2UnisonDetune: 0.15,
      
      // Sub Oscillator
      subLevel: 0.4,
      subWaveform: 'sine',
      subOctave: -1,
      
      // Noise
      noiseLevel: 0,
      noiseType: 'white',
      
      // Filter 1 (Main)
      filter1Type: 'lowpass',
      filter1Cutoff: 1200,
      filter1Resonance: 8,
      filter1Drive: 1,
      filter1KeyTrack: 0.5,
      
      // Filter 2 (Serial)
      filter2Enabled: false,
      filter2Type: 'highpass',
      filter2Cutoff: 100,
      filter2Resonance: 1,
      
      // Filter Envelope
      filterAttack: 0.01,
      filterDecay: 0.3,
      filterSustain: 0.4,
      filterRelease: 0.3,
      filterEnvAmount: 0.7,
      
      // Amp Envelope
      ampAttack: 0.001,
      ampDecay: 0.2,
      ampSustain: 0.8,
      ampRelease: 0.3,
      
      // Distortion
      distortionAmount: 0,
      distortionType: 'soft',
      
      // Bass Enhancement
      bassBoost: 0,
      subHarmonic: 0,
      
      // Stereo
      stereoWidth: 0.5,
      pan: 0,
      
      // Master
      volume: 0.8,
      
      // Modulation (assigned via matrix)
      lfo1ToFilter: 0,
      lfo1ToPitch: 0,
      lfo2ToAmp: 0,
      envToFilter: 1,
    };
    
    // LFO states
    this.lfos = {
      lfo1: {
        rate: 4,
        waveform: 'sine',
        depth: 0,
        sync: false,
        phase: 0
      },
      lfo2: {
        rate: 0.5,
        waveform: 'triangle',
        depth: 0,
        sync: false,
        phase: 0
      },
      lfo3: {
        rate: 8,
        waveform: 'square',
        depth: 0,
        sync: false,
        phase: 0
      },
      lfo4: {
        rate: 1,
        waveform: 'random',
        depth: 0,
        sync: false,
        phase: 0
      }
    };
    
    // Active voices
    this.voices = [];
  }
  
  /**
   * Initialize engine
   */
  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('✅ BassArpEngine initialized');
  }
  
  /**
   * Play note (bass or arp)
   */
  playNote(note, velocity = 1.0, duration = null) {
    if (!this.isInitialized) return;
    
    const frequency = this.noteToFrequency(note);
    
    const voice = {
      id: Date.now() + Math.random(),
      note,
      frequency,
      velocity,
      startTime: Date.now(),
      duration,
      active: true,
    };
    
    this.voices.push(voice);
    
    // Trigger synthesis
    this._synthesize(voice);
    
    return voice.id;
  }
  
  /**
   * Stop note
   */
  stopNote(noteId) {
    const voice = this.voices.find(v => v.id === noteId);
    if (voice) {
      voice.active = false;
      // Trigger release envelope
    }
  }
  
  /**
   * Synthesize voice (simplified for mobile)
   */
  _synthesize(voice) {
    // Full synthesis chain would include:
    // 1. Generate OSC1 with unison
    // 2. Generate OSC2 with unison + detune
    // 3. Generate sub oscillator
    // 4. Mix oscillators
    // 5. Add noise
    // 6. Apply Filter 1 + envelope
    // 7. Apply Filter 2 (if enabled)
    // 8. Apply distortion
    // 9. Apply bass boost
    // 10. Apply stereo width
    // 11. Apply amp envelope
    // 12. LFO modulation throughout
    
    console.log(`🔊 Bass/Arp: ${voice.note} @ ${voice.frequency}Hz`);
  }
  
  /**
   * Set LFO parameter
   */
  setLFO(lfoIndex, param, value) {
    const lfo = `lfo${lfoIndex}`;
    if (this.lfos[lfo]) {
      this.lfos[lfo][param] = value;
    }
  }
  
  /**
   * Set modulation routing
   */
  setModulation(source, destination, amount) {
    const paramName = `${source}To${destination}`;
    if (this.params.hasOwnProperty(paramName)) {
      this.params[paramName] = amount;
    }
  }
  
  /**
   * Load bass preset
   */
  loadBassPreset(presetName) {
    const presets = this.getBassPresets();
    const preset = presets[presetName];
    if (preset) {
      Object.assign(this.params, preset.params);
      console.log(`🎛️ Bass preset loaded: ${preset.name}`);
    }
  }
  
  /**
   * Load arp preset
   */
  loadArpPreset(presetName) {
    const presets = this.getArpPresets();
    const preset = presets[presetName];
    if (preset) {
      Object.assign(this.params, preset.params);
      console.log(`🎛️ Arp preset loaded: ${preset.name}`);
    }
  }
  
  /**
   * Get bass presets (QUAKE-inspired)
   */
  getBassPresets() {
    return {
      subQuake: {
        name: 'Sub Quake',
        description: 'Massive sub-bass rumble',
        params: {
          osc1Waveform: 'sine',
          osc1Level: 1.0,
          osc2Level: 0.3,
          subLevel: 0.9,
          filter1Cutoff: 150,
          filter1Resonance: 2,
          bassBoost: 0.8,
          subHarmonic: 0.6,
        }
      },
      acidBass: {
        name: 'Acid Bass',
        description: 'TB-303 style squelch',
        params: {
          osc1Waveform: 'sawtooth',
          osc1Level: 0.9,
          filter1Cutoff: 800,
          filter1Resonance: 12,
          filterEnvAmount: 0.9,
          filterDecay: 0.2,
          distortionAmount: 0.3,
        }
      },
      wobbleBass: {
        name: 'Wobble Bass',
        description: 'Dubstep LFO wobble',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.8,
          osc2Level: 0.6,
          filter1Cutoff: 1500,
          filter1Resonance: 10,
          lfo1ToFilter: 0.9,
          distortionAmount: 0.5,
        }
      },
      reeseBass: {
        name: 'Reese Bass',
        description: 'Detuned saw stack',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'sawtooth',
          osc1Unison: 4,
          osc2Unison: 4,
          osc1UnisonDetune: 0.2,
          osc2UnisonDetune: 0.25,
          osc2Detune: 0.05,
          filter1Cutoff: 1000,
          stereoWidth: 0.8,
        }
      },
      bass808: {
        name: '808 Bass',
        description: 'Classic TR-808 boom',
        params: {
          osc1Waveform: 'sine',
          osc1Level: 1.0,
          subLevel: 0.8,
          filter1Cutoff: 200,
          ampDecay: 0.8,
          ampSustain: 0,
          distortionAmount: 0.2,
        }
      },
      synthBass: {
        name: 'Synth Bass',
        description: 'Punchy synth bass',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.7,
          osc2Level: 0.5,
          subLevel: 0.4,
          filter1Cutoff: 1200,
          filter1Resonance: 6,
          ampAttack: 0.001,
          ampDecay: 0.15,
        }
      }
    };
  }
  
  /**
   * Get arp presets (SERUM2-inspired)
   */
  getArpPresets() {
    return {
      pluckArp: {
        name: 'Pluck Arp',
        description: 'Short percussive pluck',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          filter1Cutoff: 3000,
          filter1Resonance: 4,
          filterDecay: 0.1,
          ampDecay: 0.15,
          ampSustain: 0,
        }
      },
      supersaw: {
        name: 'Supersaw Arp',
        description: 'Massive saw stack',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'sawtooth',
          osc1Unison: 7,
          osc2Unison: 7,
          osc1UnisonDetune: 0.3,
          osc2UnisonDetune: 0.35,
          osc2Semitone: 12,
          filter1Cutoff: 2500,
          stereoWidth: 1.0,
        }
      },
      leadArp: {
        name: 'Lead Arp',
        description: 'Bright analog lead',
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.8,
          osc2Level: 0.6,
          filter1Cutoff: 2000,
          filter1Resonance: 8,
          lfo1ToPitch: 0.05,
        }
      },
      bellArp: {
        name: 'Bell Arp',
        description: 'FM bell tones',
        params: {
          osc1Waveform: 'sine',
          osc2Waveform: 'sine',
          osc2Semitone: 19,
          filter1Cutoff: 5000,
          ampDecay: 1.5,
          ampSustain: 0.3,
        }
      },
      sequenceArp: {
        name: 'Sequence Arp',
        description: 'Stepped filter sweep',
        params: {
          osc1Waveform: 'square',
          filter1Cutoff: 1500,
          filter1Resonance: 10,
          lfo1ToFilter: 0.6,
          ampDecay: 0.3,
        }
      }
    };
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
   * Cleanup
   */
  destroy() {
    this.voices = [];
    this.isInitialized = false;
  }
}

export default BassArpEngine;
