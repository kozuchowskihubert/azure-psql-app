/**
 * HAOS.fm Factory Presets Library
 * Complete collection of factory presets for all instruments
 */

export const FACTORY_PRESETS = {
  // ============================================================================
  // DRUM MACHINES
  // ============================================================================
  
  tb303: [
    {
      id: 'acid_classic',
      name: 'Classic Acid',
      parameters: {
        cutoff: 800,
        resonance: 12,
        envMod: 0.8,
        decay: 0.2,
        accent: 0.7,
        waveform: 'sawtooth',
      },
      description: '303 classic acid sound with high resonance',
    },
    {
      id: 'acid_squelch',
      name: 'Squelch Bass',
      parameters: {
        cutoff: 1200,
        resonance: 15,
        envMod: 0.9,
        decay: 0.15,
        accent: 0.8,
        waveform: 'sawtooth',
      },
      description: 'Aggressive squelchy acid bass',
    },
    {
      id: 'acid_deep',
      name: 'Deep Bass',
      parameters: {
        cutoff: 400,
        resonance: 8,
        envMod: 0.5,
        decay: 0.3,
        accent: 0.6,
        waveform: 'sawtooth',
      },
      description: 'Deep sub-bass tone',
    },
    {
      id: 'acid_lead',
      name: 'Acid Lead',
      parameters: {
        cutoff: 2000,
        resonance: 10,
        envMod: 0.7,
        decay: 0.25,
        accent: 0.9,
        waveform: 'square',
      },
      description: 'Bright lead sound for melodies',
    },
    {
      id: 'acid_minimal',
      name: 'Minimal',
      parameters: {
        cutoff: 600,
        resonance: 6,
        envMod: 0.4,
        decay: 0.35,
        accent: 0.5,
        waveform: 'sawtooth',
      },
      description: 'Subtle minimal techno bass',
    },
    {
      id: 'acid_aggressive',
      name: 'Aggressive',
      parameters: {
        cutoff: 1500,
        resonance: 18,
        envMod: 0.95,
        decay: 0.1,
        accent: 1.0,
        waveform: 'sawtooth',
      },
      description: 'Maximum aggression acid sound',
    },
  ],

  tr808: [
    {
      id: '808_house',
      name: 'House Groove',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        openhat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      },
      description: 'Classic 4/4 house beat',
    },
    {
      id: '808_techno',
      name: 'Techno Drive',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      },
      description: 'Hard techno rhythm',
    },
    {
      id: '808_trap',
      name: 'Trap 808',
      pattern: {
        kick: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        rim: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      },
      description: 'Modern trap pattern',
    },
    {
      id: '808_minimal',
      name: 'Minimal Tech',
      pattern: {
        kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        rim: [0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
      },
      description: 'Minimal techno groove',
    },
  ],

  tr909: [
    {
      id: '909_classic',
      name: 'Classic 909',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        accent: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      },
      description: 'Iconic 909 techno beat',
    },
    {
      id: '909_industrial',
      name: 'Industrial',
      pattern: {
        kick: [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
        snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
      },
      description: 'Hard industrial rhythm',
    },
    {
      id: '909_breakbeat',
      name: 'Breakbeat',
      pattern: {
        kick: [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
        snare: [0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
        hihat: [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],
        ride: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      },
      description: 'Funky breakbeat pattern',
    },
    {
      id: '909_rave',
      name: 'Rave Energy',
      pattern: {
        kick: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        clap: [0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      },
      description: 'High-energy rave beat',
    },
  ],

  linndrum: [
    {
      id: 'linn_pop',
      name: 'Pop Groove',
      pattern: {
        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        tambourine: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
      },
      description: '80s pop drum pattern',
    },
    {
      id: 'linn_funk',
      name: 'Funk Beat',
      pattern: {
        kick: [1,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0],
        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],
        cowbell: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      },
      description: 'Funky LinnDrum groove',
    },
    {
      id: 'linn_rock',
      name: 'Rock Solid',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      description: 'Classic rock beat',
    },
    {
      id: 'linn_rnb',
      name: 'R&B Smooth',
      pattern: {
        kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],
        hihat: [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1],
        tambourine: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
      },
      description: 'Smooth R&B groove',
    },
  ],

  dmx: [
    {
      id: 'dmx_hiphop',
      name: 'Hip-Hop Classic',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      },
      description: 'Classic hip-hop beat',
    },
    {
      id: 'dmx_boom_bap',
      name: 'Boom Bap',
      pattern: {
        kick: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      description: 'Old school boom bap',
    },
    {
      id: 'dmx_trap',
      name: 'Trap Hi-Hats',
      pattern: {
        kick: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        clap: [0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      },
      description: 'Modern trap with rolls',
    },
    {
      id: 'dmx_shuffle',
      name: 'Shuffle Groove',
      pattern: {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0],
        hihat: [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0],
        shaker: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      },
      description: 'Shuffling hip-hop groove',
    },
  ],

  cr78: [
    {
      id: 'cr78_disco',
      name: 'Disco Fever',
      preset: 14, // Disco 1
      tempo: 120,
      metalMode: false,
      volumes: {
        kick: 90,
        snare: 80,
        hihat: 70,
        tambourine: 60,
        cymbal: 50,
      },
      description: 'Classic disco groove',
    },
    {
      id: 'cr78_rock',
      name: 'Rock Steady',
      preset: 11, // Rock 1
      tempo: 110,
      metalMode: true,
      volumes: {
        kick: 100,
        snare: 90,
        hihat: 75,
        crash: 60,
      },
      description: 'Solid rock rhythm',
    },
    {
      id: 'cr78_samba',
      name: 'Samba Night',
      preset: 4, // Samba
      tempo: 140,
      metalMode: false,
      volumes: {
        kick: 85,
        snare: 70,
        tambourine: 80,
        claves: 75,
        guiro: 60,
      },
      description: 'Latin samba rhythm',
    },
    {
      id: 'cr78_boogie',
      name: 'Boogie Down',
      preset: 8, // Boogie
      tempo: 115,
      metalMode: false,
      volumes: {
        kick: 90,
        snare: 85,
        hihat: 80,
        cowbell: 50,
      },
      description: 'Funky boogie beat',
    },
  ],

  // ============================================================================
  // SYNTHESIZERS
  // ============================================================================

  arp2600: [
    {
      id: 'arp_lead',
      name: 'Classic Lead',
      parameters: {
        osc1Level: 0.7,
        osc2Level: 0.5,
        osc2Detune: 0.005,
        filterCutoff: 2500,
        filterResonance: 15,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.4,
      },
      description: 'Bright vintage lead sound',
    },
    {
      id: 'arp_bass',
      name: 'Sub Bass',
      parameters: {
        osc1Level: 0.9,
        osc2Level: 0.3,
        osc2Detune: 0.002,
        filterCutoff: 400,
        filterResonance: 8,
        attack: 0.001,
        decay: 0.1,
        sustain: 0.9,
        release: 0.2,
      },
      description: 'Deep sub-bass tone',
    },
    {
      id: 'arp_fx',
      name: 'Space FX',
      parameters: {
        osc1Level: 0.6,
        osc2Level: 0.6,
        osc2Detune: 0.02,
        filterCutoff: 3000,
        filterResonance: 20,
        attack: 0.5,
        decay: 1.0,
        sustain: 0.4,
        release: 2.0,
      },
      description: 'Atmospheric space effects',
    },
    {
      id: 'arp_pad',
      name: 'Warm Pad',
      parameters: {
        osc1Level: 0.5,
        osc2Level: 0.5,
        osc2Detune: 0.008,
        filterCutoff: 1800,
        filterResonance: 5,
        attack: 0.8,
        decay: 0.5,
        sustain: 0.7,
        release: 1.5,
      },
      description: 'Lush warm pad',
    },
    {
      id: 'arp_aggressive',
      name: 'Aggressive Saw',
      parameters: {
        osc1Level: 0.8,
        osc2Level: 0.7,
        osc2Detune: 0.015,
        filterCutoff: 3500,
        filterResonance: 18,
        attack: 0.005,
        decay: 0.15,
        sustain: 0.5,
        release: 0.3,
      },
      description: 'Aggressive sawtooth lead',
    },
    {
      id: 'arp_sweep',
      name: 'Filter Sweep',
      parameters: {
        osc1Level: 0.7,
        osc2Level: 0.6,
        osc2Detune: 0.01,
        filterCutoff: 500,
        filterResonance: 25,
        attack: 0.01,
        decay: 2.0,
        sustain: 0.2,
        release: 0.5,
      },
      description: 'Long filter sweep effect',
    },
  ],

  juno106: [
    {
      id: 'juno_strings',
      name: 'Lush Strings',
      parameters: {
        filterCutoff: 2000,
        filterResonance: 1,
        chorusDepth: 0.008,
        attack: 0.5,
        decay: 0.3,
        sustain: 0.9,
        release: 1.0,
      },
      description: 'Classic Juno string ensemble',
    },
    {
      id: 'juno_pad',
      name: 'Warm Pad',
      parameters: {
        filterCutoff: 1500,
        filterResonance: 2,
        chorusDepth: 0.007,
        attack: 0.8,
        decay: 0.5,
        sustain: 0.8,
        release: 1.5,
      },
      description: 'Warm analog pad',
    },
    {
      id: 'juno_bass',
      name: 'Poly Bass',
      parameters: {
        filterCutoff: 800,
        filterResonance: 5,
        chorusDepth: 0.003,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.3,
      },
      description: 'Fat polyphonic bass',
    },
    {
      id: 'juno_lead',
      name: 'Poly Lead',
      parameters: {
        filterCutoff: 3000,
        filterResonance: 4,
        chorusDepth: 0.005,
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 0.4,
      },
      description: 'Bright poly lead',
    },
    {
      id: 'juno_brass',
      name: 'Brass Section',
      parameters: {
        filterCutoff: 2500,
        filterResonance: 3,
        chorusDepth: 0.006,
        attack: 0.1,
        decay: 0.4,
        sustain: 0.7,
        release: 0.5,
      },
      description: 'Synthetic brass',
    },
    {
      id: 'juno_poly',
      name: 'Full Poly',
      parameters: {
        filterCutoff: 2200,
        filterResonance: 2,
        chorusDepth: 0.009,
        attack: 0.05,
        decay: 0.4,
        sustain: 0.8,
        release: 0.8,
      },
      description: 'Full polyphonic sound',
    },
  ],

  minimoog: [
    {
      id: 'moog_bass',
      name: 'Monster Bass',
      parameters: {
        osc1Level: 0.9,
        osc2Level: 0.3,
        osc3Level: 0.7,
        filterCutoff: 500,
        filterResonance: 12,
        attack: 0.001,
        decay: 0.3,
        sustain: 0.6,
        release: 0.5,
      },
      description: 'Classic Moog bass',
    },
    {
      id: 'moog_lead',
      name: 'Screaming Lead',
      parameters: {
        osc1Level: 0.8,
        osc2Level: 0.6,
        osc3Level: 0.4,
        filterCutoff: 2000,
        filterResonance: 15,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.7,
        release: 0.4,
      },
      description: 'Aggressive lead sound',
    },
    {
      id: 'moog_fx',
      name: 'Cosmic FX',
      parameters: {
        osc1Level: 0.5,
        osc2Level: 0.5,
        osc3Level: 0.5,
        filterCutoff: 3000,
        filterResonance: 20,
        attack: 0.5,
        decay: 1.5,
        sustain: 0.3,
        release: 2.0,
      },
      description: 'Spacey sound effects',
    },
    {
      id: 'moog_sub',
      name: 'Deep Sub',
      parameters: {
        osc1Level: 0.5,
        osc2Level: 0.0,
        osc3Level: 1.0,
        filterCutoff: 300,
        filterResonance: 5,
        attack: 0.001,
        decay: 0.4,
        sustain: 0.9,
        release: 0.6,
      },
      description: 'Ultra-deep sub bass',
    },
    {
      id: 'moog_aggressive',
      name: 'Aggressive Saw',
      parameters: {
        osc1Level: 1.0,
        osc2Level: 0.8,
        osc3Level: 0.6,
        filterCutoff: 2500,
        filterResonance: 18,
        attack: 0.005,
        decay: 0.15,
        sustain: 0.5,
        release: 0.3,
      },
      description: 'Maximum aggression',
    },
    {
      id: 'moog_classic',
      name: 'Classic Moog',
      parameters: {
        osc1Level: 0.7,
        osc2Level: 0.5,
        osc3Level: 0.5,
        filterCutoff: 1500,
        filterResonance: 10,
        attack: 0.01,
        decay: 0.3,
        sustain: 0.7,
        release: 0.5,
      },
      description: 'Iconic Moog sound',
    },
  ],
};

/**
 * Get factory presets for a specific instrument
 * @param {string} instrumentId - Instrument identifier
 * @returns {Array} Array of preset objects
 */
export const getFactoryPresets = (instrumentId) => {
  return FACTORY_PRESETS[instrumentId] || [];
};

/**
 * Get a specific factory preset
 * @param {string} instrumentId - Instrument identifier
 * @param {string} presetId - Preset identifier
 * @returns {object|null} Preset object or null
 */
export const getFactoryPreset = (instrumentId, presetId) => {
  const presets = FACTORY_PRESETS[instrumentId] || [];
  return presets.find(p => p.id === presetId) || null;
};

/**
 * Get total count of factory presets
 * @returns {number} Total preset count
 */
export const getTotalPresetCount = () => {
  return Object.values(FACTORY_PRESETS).reduce((total, presets) => total + presets.length, 0);
};
