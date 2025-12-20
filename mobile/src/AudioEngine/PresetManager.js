/**
 * HAOS.fm Advanced Preset Manager
 * Comprehensive preset system with categories, morphing, and dynamic mapping
 */

class PresetManager {
  constructor() {
    this.presets = {
      bass: this.getBassPresets(),
      arp: this.getArpPresets(),
      lead: this.getLeadPresets(),
      pad: this.getPadPresets(),
      pluck: this.getPluckPresets(),
      fx: this.getFXPresets(),
      strings: this.getStringsPresets(),
      brass: this.getBrassPresets(),
      keys: this.getKeysPresets(),
    };
    
    this.currentPreset = null;
    this.morphState = {
      presetA: null,
      presetB: null,
      morphAmount: 0, // 0 = A, 1 = B
    };
  }
  
  /**
   * Get bass presets (inspired by QUAKE)
   */
  getBassPresets() {
    return {
      subQuake: {
        name: 'Sub Quake',
        category: 'bass',
        description: 'Massive sub-bass rumble with harmonic boost',
        color: '#00ff94',
        tags: ['sub', 'deep', 'powerful'],
        params: {
          osc1Waveform: 'sine',
          osc1Level: 1.0,
          osc2Waveform: 'sine',
          osc2Level: 0.3,
          osc2Semitone: 12,
          subLevel: 0.9,
          filter1Cutoff: 150,
          filter1Resonance: 2,
          filterEnvAmount: 0.3,
          ampAttack: 0.01,
          ampDecay: 0.8,
          ampSustain: 0.5,
          ampRelease: 0.5,
          distortion: 0.2,
          bassBoost: 0.8,
          subHarmonic: 0.6,
        },
        modulation: {
          lfo1: { rate: 0.25, waveform: 'sine', depth: 0.1, target: 'filterCutoff' },
        }
      },
      
      acidBass: {
        name: 'Acid Bass',
        category: 'bass',
        description: 'TB-303 style squelchy acid bass',
        color: '#00ff94',
        tags: ['acid', 'squelch', 'resonant'],
        params: {
          osc1Waveform: 'sawtooth',
          osc1Level: 0.9,
          filter1Type: 'lowpass',
          filter1Cutoff: 800,
          filter1Resonance: 12,
          filterEnvAmount: 0.9,
          filterAttack: 0.001,
          filterDecay: 0.2,
          filterSustain: 0.3,
          ampAttack: 0.001,
          ampDecay: 0.15,
          ampSustain: 0.7,
          distortion: 0.3,
        },
        modulation: {
          lfo1: { rate: 16, waveform: 'sine', depth: 0.2, target: 'filterCutoff' },
          env1: { amount: 1.0, target: 'filterCutoff' },
        }
      },
      
      wobbleBass: {
        name: 'Wobble Bass',
        category: 'bass',
        description: 'Dubstep LFO modulated wobble',
        color: '#00ffff',
        tags: ['dubstep', 'lfo', 'aggressive'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.8,
          osc2Level: 0.6,
          osc2Detune: 0.03,
          filter1Cutoff: 1500,
          filter1Resonance: 10,
          filterEnvAmount: 0.4,
          distortion: 0.5,
        },
        modulation: {
          lfo1: { rate: 8, waveform: 'sine', depth: 0.9, target: 'filterCutoff' },
          lfo2: { rate: 0.5, waveform: 'triangle', depth: 0.3, target: 'osc2Detune' },
        }
      },
      
      reeseBass: {
        name: 'Reese Bass',
        category: 'bass',
        description: 'Detuned sawtooth stack with wide stereo',
        color: '#9370DB',
        tags: ['reese', 'detuned', 'wide'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'sawtooth',
          osc1Unison: 4,
          osc2Unison: 4,
          osc1UnisonDetune: 0.2,
          osc2UnisonDetune: 0.25,
          osc2Detune: 0.05,
          filter1Cutoff: 1000,
          filter1Resonance: 4,
          stereoWidth: 0.8,
        },
        modulation: {
          lfo1: { rate: 0.125, waveform: 'sine', depth: 0.1, target: 'osc2Detune' },
        }
      },
      
      bass808: {
        name: '808 Bass',
        category: 'bass',
        description: 'Classic TR-808 bass drum as synth',
        color: '#ff8800',
        tags: ['808', 'kick', 'boom'],
        params: {
          osc1Waveform: 'sine',
          osc1Level: 1.0,
          subLevel: 0.8,
          filter1Cutoff: 200,
          ampAttack: 0.001,
          ampDecay: 0.8,
          ampSustain: 0,
          ampRelease: 0.1,
          distortion: 0.2,
        },
        modulation: {
          env1: { amount: 0.8, target: 'osc1Pitch', range: [-24, 0] },
        }
      },
      
      fmBass: {
        name: 'FM Bass',
        category: 'bass',
        description: 'Frequency modulation bass with harmonics',
        color: '#ff00ff',
        tags: ['fm', 'digital', 'bright'],
        params: {
          osc1Waveform: 'sine',
          osc2Waveform: 'sine',
          osc1Level: 0.8,
          osc2Semitone: 7,
          fmAmount: 0.6,
          fmRatio: 2,
          filter1Cutoff: 2000,
          filter1Resonance: 3,
          ampDecay: 0.4,
        },
        modulation: {
          env1: { amount: 0.5, target: 'fmAmount' },
        }
      },
    };
  }
  
  /**
   * Get arp presets (inspired by SERUM2)
   */
  getArpPresets() {
    return {
      pluckArp: {
        name: 'Pluck Arp',
        category: 'arp',
        description: 'Short percussive plucked sound',
        color: '#FFD700',
        tags: ['pluck', 'short', 'percussive'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.7,
          osc2Level: 0.5,
          filter1Cutoff: 3000,
          filter1Resonance: 4,
          filterAttack: 0.001,
          filterDecay: 0.1,
          ampAttack: 0.001,
          ampDecay: 0.15,
          ampSustain: 0,
        }
      },
      
      supersawArp: {
        name: 'Supersaw Arp',
        category: 'arp',
        description: 'Massive detuned saw stack',
        color: '#00ff94',
        tags: ['supersaw', 'massive', 'wide'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'sawtooth',
          osc1Unison: 7,
          osc2Unison: 7,
          osc1UnisonDetune: 0.3,
          osc2UnisonDetune: 0.35,
          osc2Semitone: 12,
          filter1Cutoff: 2500,
          filter1Resonance: 2,
          stereoWidth: 1.0,
        }
      },
      
      sequenceArp: {
        name: 'Sequence Arp',
        category: 'arp',
        description: 'Step-sequenced filter modulation',
        color: '#00ffff',
        tags: ['sequence', 'rhythmic', 'stepped'],
        params: {
          osc1Waveform: 'square',
          filter1Cutoff: 1500,
          filter1Resonance: 10,
          ampDecay: 0.3,
        },
        modulation: {
          lfo1: { rate: 16, waveform: 'square', depth: 0.6, target: 'filterCutoff' },
        }
      },
      
      bellArp: {
        name: 'Bell Arp',
        category: 'arp',
        description: 'FM bell tones',
        color: '#FFA500',
        tags: ['bell', 'fm', 'bright'],
        params: {
          osc1Waveform: 'sine',
          osc2Waveform: 'sine',
          osc2Semitone: 19,
          fmAmount: 0.4,
          filter1Cutoff: 5000,
          ampDecay: 1.5,
          ampSustain: 0.3,
        }
      },
    };
  }
  
  /**
   * Get lead presets
   */
  getLeadPresets() {
    return {
      monoLead: {
        name: 'Mono Lead',
        category: 'lead',
        description: 'Classic monophonic analog lead',
        color: '#ff8800',
        tags: ['mono', 'analog', 'classic'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'square',
          osc1Level: 0.8,
          osc2Level: 0.6,
          osc2Detune: 0.02,
          filter1Cutoff: 2000,
          filter1Resonance: 8,
          filterEnvAmount: 0.6,
          filterAttack: 0.01,
          filterDecay: 0.4,
          ampAttack: 0.01,
        },
        modulation: {
          lfo1: { rate: 6, waveform: 'sine', depth: 0.05, target: 'osc1Pitch' },
          lfo2: { rate: 5, waveform: 'sine', depth: 0.2, target: 'filterCutoff' },
        }
      },
      
      syncLead: {
        name: 'Sync Lead',
        category: 'lead',
        description: 'Hard sync aggressive lead',
        color: '#ff0000',
        tags: ['sync', 'aggressive', 'harsh'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'sawtooth',
          osc2Detune: 0.2,
          filter1Cutoff: 3000,
          filter1Resonance: 6,
          distortion: 0.4,
        }
      },
    };
  }
  
  /**
   * Get pad presets
   */
  getPadPresets() {
    return {
      warmPad: {
        name: 'Warm Pad',
        category: 'pad',
        description: 'Lush detuned pad with slow attack',
        color: '#9370DB',
        tags: ['warm', 'lush', 'slow'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'triangle',
          osc1Unison: 4,
          osc2Unison: 4,
          osc1UnisonDetune: 0.15,
          osc2UnisonDetune: 0.18,
          filter1Cutoff: 1500,
          filter1Resonance: 2,
          ampAttack: 0.8,
          ampRelease: 2.0,
          stereoWidth: 0.7,
        },
        modulation: {
          lfo1: { rate: 0.25, waveform: 'sine', depth: 0.1, target: 'filterCutoff' },
          lfo2: { rate: 0.5, waveform: 'sine', depth: 0.05, target: 'osc2Detune' },
        }
      },
      
      stringPad: {
        name: 'String Pad',
        category: 'pad',
        description: 'Orchestral string ensemble',
        color: '#8B4513',
        tags: ['strings', 'orchestral', 'ensemble'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'triangle',
          osc1Unison: 6,
          osc1Level: 0.7,
          osc2Level: 0.5,
          filter1Cutoff: 2000,
          filter1Resonance: 1,
          ampAttack: 0.4,
          ampRelease: 1.5,
        },
        modulation: {
          lfo1: { rate: 5, waveform: 'sine', depth: 0.3, target: 'osc1Pitch', amount: 0.05 },
        }
      },
    };
  }
  
  /**
   * Get pluck presets
   */
  getPluckPresets() {
    return {
      guitarPluck: {
        name: 'Guitar Pluck',
        category: 'pluck',
        description: 'Acoustic guitar-like pluck',
        color: '#8B4513',
        tags: ['guitar', 'acoustic', 'natural'],
        params: {
          osc1Waveform: 'sawtooth',
          osc2Waveform: 'triangle',
          filter1Cutoff: 2500,
          filter1Resonance: 3,
          filterDecay: 0.2,
          ampAttack: 0.001,
          ampDecay: 0.4,
          ampSustain: 0,
        }
      },
      
      bassPluck: {
        name: 'Bass Pluck',
        category: 'pluck',
        description: 'Percussive bass pluck',
        color: '#00ff94',
        tags: ['bass', 'percussive', 'short'],
        params: {
          osc1Waveform: 'sine',
          subLevel: 0.6,
          filter1Cutoff: 1000,
          ampAttack: 0.001,
          ampDecay: 0.2,
          ampSustain: 0,
        }
      },
    };
  }
  
  /**
   * Get FX presets
   */
  getFXPresets() {
    return {
      riser: {
        name: 'Riser',
        category: 'fx',
        description: 'Uplifting sweep effect',
        color: '#00D9FF',
        tags: ['riser', 'sweep', 'transition'],
        params: {
          osc1Waveform: 'noise',
          filter1Cutoff: 100,
          filter1Resonance: 8,
        },
        modulation: {
          env1: { amount: 1.0, target: 'filterCutoff', range: [100, 10000] },
        }
      },
      
      impact: {
        name: 'Impact',
        category: 'fx',
        description: 'Powerful impact hit',
        color: '#ff0000',
        tags: ['impact', 'hit', 'power'],
        params: {
          osc1Waveform: 'sine',
          subLevel: 1.0,
          filter1Cutoff: 200,
          ampAttack: 0.001,
          ampDecay: 1.0,
          ampSustain: 0,
          distortion: 0.6,
        }
      },
    };
  }
  
  /**
   * Get strings presets
   */
  getStringsPresets() {
    return {
      ensembleStrings: {
        name: 'Ensemble Strings',
        category: 'strings',
        description: 'Full string orchestra',
        color: '#8B4513',
        articulation: 'sustain',
        params: {
          expression: 0.7,
          vibrato: 0.3,
          attack: 0.3,
          release: 0.8,
          brightness: 0.6,
        }
      },
      
      soloViolin: {
        name: 'Solo Violin',
        category: 'strings',
        description: 'Expressive solo violin',
        color: '#A0522D',
        articulation: 'sustain',
        params: {
          expression: 0.8,
          vibrato: 0.5,
          attack: 0.15,
          release: 0.4,
          bow_pressure: 0.7,
        }
      },
    };
  }
  
  /**
   * Get brass presets
   */
  getBrassPresets() {
    return {
      brassSection: {
        name: 'Brass Section',
        category: 'brass',
        description: 'Full brass ensemble',
        color: '#DAA520',
        articulation: 'sustain',
        params: {
          expression: 0.7,
          attack: 0.1,
          release: 0.3,
          brightness: 0.8,
        }
      },
    };
  }
  
  /**
   * Get keys presets
   */
  getKeysPresets() {
    return {
      grandPiano: {
        name: 'Grand Piano',
        category: 'keys',
        description: 'Concert grand piano',
        color: '#000000',
        articulation: 'normal',
        params: {
          velocity_curve: 0.5,
          release: 0.5,
          damper_resonance: 0.4,
          brightness: 0.6,
        }
      },
      
      electricPiano: {
        name: 'Electric Piano',
        category: 'keys',
        description: 'Rhodes-style electric piano',
        color: '#4B0082',
        articulation: 'normal',
        params: {
          tone: 0.6,
          tremolo_rate: 4,
          tremolo_depth: 0.3,
          release: 0.4,
        }
      },
    };
  }
  
  /**
   * Load preset
   */
  loadPreset(category, presetName) {
    if (!this.presets[category] || !this.presets[category][presetName]) {
      console.warn(`⚠️ Preset not found: ${category}/${presetName}`);
      return null;
    }
    
    this.currentPreset = {
      category,
      name: presetName,
      ...this.presets[category][presetName]
    };
    
    console.log(`🎛️ Loaded: ${this.currentPreset.name}`);
    return this.currentPreset;
  }
  
  /**
   * Set morphing presets
   */
  setMorphPresets(categoryA, presetA, categoryB, presetB) {
    this.morphState.presetA = this.presets[categoryA]?.[presetA];
    this.morphState.presetB = this.presets[categoryB]?.[presetB];
    this.morphState.morphAmount = 0;
    
    if (this.morphState.presetA && this.morphState.presetB) {
      console.log(`🔄 Morph: ${presetA} ↔ ${presetB}`);
      return true;
    }
    return false;
  }
  
  /**
   * Set morph amount (0-1)
   */
  setMorphAmount(amount) {
    this.morphState.morphAmount = Math.max(0, Math.min(1, amount));
    return this.getMorphedParams();
  }
  
  /**
   * Get morphed parameters
   */
  getMorphedParams() {
    if (!this.morphState.presetA || !this.morphState.presetB) {
      return this.currentPreset?.params || {};
    }
    
    const paramsA = this.morphState.presetA.params;
    const paramsB = this.morphState.presetB.params;
    const amount = this.morphState.morphAmount;
    
    const morphed = {};
    
    // Morph numeric parameters
    Object.keys(paramsA).forEach(key => {
      if (typeof paramsA[key] === 'number' && typeof paramsB[key] === 'number') {
        morphed[key] = paramsA[key] + (paramsB[key] - paramsA[key]) * amount;
      } else {
        // Use preset B's value if morph > 0.5, otherwise A's
        morphed[key] = amount > 0.5 ? paramsB[key] : paramsA[key];
      }
    });
    
    return morphed;
  }
  
  /**
   * Get all presets in category
   */
  getPresetsInCategory(category) {
    return this.presets[category] || {};
  }
  
  /**
   * Get all categories
   */
  getCategories() {
    return Object.keys(this.presets);
  }
  
  /**
   * Search presets by tag
   */
  searchByTag(tag) {
    const results = [];
    
    Object.keys(this.presets).forEach(category => {
      Object.keys(this.presets[category]).forEach(presetName => {
        const preset = this.presets[category][presetName];
        if (preset.tags && preset.tags.includes(tag)) {
          results.push({
            category,
            name: presetName,
            ...preset
          });
        }
      });
    });
    
    return results;
  }
  
  /**
   * Get preset count
   */
  getPresetCount() {
    let count = 0;
    Object.keys(this.presets).forEach(category => {
      count += Object.keys(this.presets[category]).length;
    });
    return count;
  }
}

export default PresetManager;
