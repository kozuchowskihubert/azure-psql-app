/**
 * HAOS.fm Synthesizer Presets
 * Professional preset libraries for Juno-106 and Minimoog
 */

// Juno-106 Presets (20 classic sounds)
export const JUNO106_PRESETS = {
  // BASS Category (4 presets)
  junoDeepBass: {
    name: '🔊 DEEP BASS',
    category: 'bass',
    emoji: '🔊',
    description: 'Deep sub bass foundation',
    filterCutoff: 400,
    filterResonance: 5,
    chorusDepth: 0.003,
    attack: 0.005,
    decay: 0.3,
    sustain: 0.8,
    release: 0.4,
    gradient: ['#1E3A8A', '#3B82F6']
  },
  junoSyncBass: {
    name: '🎵 SYNC BASS',
    category: 'bass',
    emoji: '🎵',
    description: 'Synced oscillator bass',
    filterCutoff: 600,
    filterResonance: 12,
    chorusDepth: 0.005,
    attack: 0.002,
    decay: 0.25,
    sustain: 0.7,
    release: 0.3,
    gradient: ['#7C2D12', '#DC2626']
  },
  junoFilterBass: {
    name: '🎚️ FILTER BASS',
    category: 'bass',
    emoji: '🎚️',
    description: 'Resonant filter bass',
    filterCutoff: 500,
    filterResonance: 18,
    chorusDepth: 0.002,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.75,
    release: 0.35,
    gradient: ['#059669', '#10B981']
  },
  junoClassicBass: {
    name: '🎸 CLASSIC BASS',
    category: 'bass',
    emoji: '🎸',
    description: 'Vintage Juno bassline',
    filterCutoff: 700,
    filterResonance: 8,
    chorusDepth: 0.006,
    attack: 0.008,
    decay: 0.3,
    sustain: 0.6,
    release: 0.4,
    gradient: ['#92400E', '#EA580C']
  },

  // LEAD Category (4 presets)
  junoVintageLead: {
    name: '🎹 VINTAGE LEAD',
    category: 'lead',
    emoji: '🎹',
    description: 'Classic 80s lead',
    filterCutoff: 4500,
    filterResonance: 10,
    chorusDepth: 0.008,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.85,
    release: 0.6,
    gradient: ['#DC2626', '#F87171']
  },
  junoSoftLead: {
    name: '✨ SOFT LEAD',
    category: 'lead',
    emoji: '✨',
    description: 'Smooth melodic lead',
    filterCutoff: 3800,
    filterResonance: 6,
    chorusDepth: 0.010,
    attack: 0.05,
    decay: 0.25,
    sustain: 0.9,
    release: 0.8,
    gradient: ['#EC4899', '#F472B6']
  },
  junoBrightLead: {
    name: '⚡ BRIGHT LEAD',
    category: 'lead',
    emoji: '⚡',
    description: 'Cutting bright lead',
    filterCutoff: 6000,
    filterResonance: 14,
    chorusDepth: 0.007,
    attack: 0.005,
    decay: 0.2,
    sustain: 0.85,
    release: 0.5,
    gradient: ['#F59E0B', '#FBBF24']
  },
  junoAnalogLead: {
    name: '🎛️ ANALOG LEAD',
    category: 'lead',
    emoji: '🎛️',
    description: 'Warm analog character',
    filterCutoff: 4200,
    filterResonance: 12,
    chorusDepth: 0.012,
    attack: 0.02,
    decay: 0.3,
    sustain: 0.8,
    release: 0.7,
    gradient: ['#8B5CF6', '#A78BFA']
  },

  // PAD Category (6 presets)
  junoChorusStrings: {
    name: '🎻 CHORUS STRINGS',
    category: 'pad',
    emoji: '🎻',
    description: 'Lush chorus strings',
    filterCutoff: 3500,
    filterResonance: 4,
    chorusDepth: 0.015,
    attack: 0.8,
    decay: 0.4,
    sustain: 0.95,
    release: 2.0,
    gradient: ['#7C3AED', '#A78BFA']
  },
  junoWarmPad: {
    name: '☀️ WARM PAD',
    category: 'pad',
    emoji: '☀️',
    description: 'Warm analog pad',
    filterCutoff: 2800,
    filterResonance: 5,
    chorusDepth: 0.012,
    attack: 1.2,
    decay: 0.5,
    sustain: 0.9,
    release: 2.5,
    gradient: ['#D97706', '#FBBF24']
  },
  junoCrystalPad: {
    name: '💎 CRYSTAL',
    category: 'pad',
    emoji: '💎',
    description: 'Bright crystalline pad',
    filterCutoff: 5000,
    filterResonance: 8,
    chorusDepth: 0.018,
    attack: 0.6,
    decay: 0.4,
    sustain: 0.9,
    release: 1.8,
    gradient: ['#06B6D4', '#22D3EE']
  },
  junoSpacePad: {
    name: '🚀 SPACE PAD',
    category: 'pad',
    emoji: '🚀',
    description: 'Cosmic atmosphere',
    filterCutoff: 2500,
    filterResonance: 6,
    chorusDepth: 0.020,
    attack: 1.5,
    decay: 0.8,
    sustain: 0.85,
    release: 3.0,
    gradient: ['#312E81', '#6366F1']
  },
  junoSweepPad: {
    name: '🌊 SWEEP PAD',
    category: 'pad',
    emoji: '🌊',
    description: 'Sweeping filter pad',
    filterCutoff: 1800,
    filterResonance: 12,
    attack: 1.0,
    decay: 0.6,
    sustain: 0.9,
    release: 2.2,
    gradient: ['#059669', '#34D399']
  },
  junoChoirPad: {
    name: '👥 CHOIR',
    category: 'pad',
    emoji: '👥',
    description: 'Vocal choir ensemble',
    filterCutoff: 3200,
    filterResonance: 7,
    chorusDepth: 0.022,
    attack: 1.0,
    decay: 0.5,
    sustain: 0.95,
    release: 2.0,
    gradient: ['#FFC0CB', '#FFB6C1']
  },

  // PLUCK Category (3 presets)
  junoHoover: {
    name: '🌀 HOOVER',
    category: 'pluck',
    emoji: '🌀',
    description: 'Classic hoover stab',
    filterCutoff: 5500,
    filterResonance: 20,
    chorusDepth: 0.025,
    attack: 0.001,
    decay: 0.4,
    sustain: 0.5,
    release: 0.6,
    gradient: ['#8B5CF6', '#C4B5FD']
  },
  junoPluck: {
    name: '🎸 PLUCK',
    category: 'pluck',
    emoji: '🎸',
    description: 'Sharp pluck sound',
    filterCutoff: 6500,
    filterResonance: 15,
    chorusDepth: 0.008,
    attack: 0.001,
    decay: 0.3,
    sustain: 0.1,
    release: 0.4,
    gradient: ['#10B981', '#6EE7B7']
  },
  junoStab: {
    name: '💥 STAB',
    category: 'pluck',
    emoji: '💥',
    description: 'Punchy stab sound',
    filterCutoff: 4800,
    filterResonance: 18,
    chorusDepth: 0.010,
    attack: 0.002,
    decay: 0.25,
    sustain: 0.3,
    release: 0.35,
    gradient: ['#DC2626', '#EF4444']
  },

  // BRASS Category (2 presets)
  junoAnalogBrass: {
    name: '🎺 ANALOG BRASS',
    category: 'brass',
    emoji: '🎺',
    description: 'Warm brass ensemble',
    filterCutoff: 2200,
    filterResonance: 10,
    chorusDepth: 0.012,
    attack: 0.08,
    decay: 0.3,
    sustain: 0.85,
    release: 0.5,
    gradient: ['#B45309', '#F59E0B']
  },
  junoBellPad: {
    name: '🔔 BELL PAD',
    category: 'brass',
    emoji: '🔔',
    description: 'Bell-like pad texture',
    filterCutoff: 4500,
    filterResonance: 16,
    chorusDepth: 0.015,
    attack: 0.005,
    decay: 0.8,
    sustain: 0.4,
    release: 1.5,
    gradient: ['#0891B2', '#22D3EE']
  },

  // FX Category (1 preset)
  junoArpSequence: {
    name: '🎼 ARP SEQUENCE',
    category: 'fx',
    emoji: '🎼',
    description: 'Rhythmic arpeggio',
    filterCutoff: 5500,
    filterResonance: 12,
    chorusDepth: 0.010,
    attack: 0.001,
    decay: 0.15,
    sustain: 0.5,
    release: 0.3,
    gradient: ['#7C3AED', '#A78BFA']
  },
};

// Minimoog Presets (20 classic sounds)
export const MINIMOOG_PRESETS = {
  // BASS Category (6 presets)
  moogSubBass: {
    name: '💎 MOOG SUB BASS',
    category: 'bass',
    emoji: '💎',
    description: 'Deep Moog sub bass',
    osc1Level: 0.5,
    osc2Level: 0.0,
    osc3Level: 0.5,
    filterCutoff: 300,
    filterResonance: 5,
    attack: 0.005,
    decay: 0.4,
    sustain: 0.9,
    release: 0.5,
    gradient: ['#000080', '#0000CD']
  },
  moogLeadBass: {
    name: '🎸 LEAD BASS',
    category: 'bass',
    emoji: '🎸',
    description: 'Lead bass line',
    osc1Level: 0.4,
    osc2Level: 0.3,
    osc3Level: 0.5,
    filterCutoff: 800,
    filterResonance: 12,
    attack: 0.01,
    decay: 0.25,
    sustain: 0.8,
    release: 0.4,
    gradient: ['#7C2D12', '#EA580C']
  },
  moogClassicBass: {
    name: '🔊 CLASSIC BASS',
    category: 'bass',
    emoji: '🔊',
    description: 'Vintage Moog bass',
    osc1Level: 0.45,
    osc2Level: 0.35,
    osc3Level: 0.4,
    filterCutoff: 600,
    filterResonance: 10,
    attack: 0.008,
    decay: 0.3,
    sustain: 0.75,
    release: 0.4,
    gradient: ['#1E40AF', '#3B82F6']
  },
  moogFatBass: {
    name: '🎵 FAT BASS',
    category: 'bass',
    emoji: '🎵',
    description: 'Thick fat bass',
    osc1Level: 0.5,
    osc2Level: 0.4,
    osc3Level: 0.5,
    filterCutoff: 500,
    filterResonance: 8,
    attack: 0.005,
    decay: 0.35,
    sustain: 0.85,
    release: 0.45,
    gradient: ['#059669', '#10B981']
  },
  moogDeepSub: {
    name: '🌊 DEEP SUB',
    category: 'bass',
    emoji: '🌊',
    description: 'Ultra deep sub',
    osc1Level: 0.6,
    osc2Level: 0.0,
    osc3Level: 0.4,
    filterCutoff: 200,
    filterResonance: 4,
    attack: 0.01,
    decay: 0.5,
    sustain: 0.9,
    release: 0.6,
    gradient: ['#000000', '#1F2937']
  },
  moogWobble: {
    name: '🌀 WOBBLE',
    category: 'bass',
    emoji: '🌀',
    description: 'Wobble bass effect',
    osc1Level: 0.5,
    osc2Level: 0.45,
    osc3Level: 0.5,
    filterCutoff: 700,
    filterResonance: 22,
    attack: 0.001,
    decay: 0.15,
    sustain: 0.85,
    release: 0.25,
    gradient: ['#7C3AED', '#A78BFA']
  },

  // LEAD Category (6 presets)
  moogScreamingLead: {
    name: '🔥 SCREAMING LEAD',
    category: 'lead',
    emoji: '🔥',
    description: 'Aggressive lead',
    osc1Level: 0.45,
    osc2Level: 0.4,
    osc3Level: 0.35,
    filterCutoff: 5500,
    filterResonance: 18,
    attack: 0.002,
    decay: 0.2,
    sustain: 0.9,
    release: 0.4,
    gradient: ['#DC2626', '#EF4444']
  },
  moogSyncLead: {
    name: '⚡ SYNC LEAD',
    category: 'lead',
    emoji: '⚡',
    description: 'Oscillator sync lead',
    osc1Level: 0.4,
    osc2Level: 0.35,
    osc3Level: 0.4,
    filterCutoff: 4800,
    filterResonance: 14,
    attack: 0.005,
    decay: 0.25,
    sustain: 0.85,
    release: 0.5,
    gradient: ['#F59E0B', '#FBBF24']
  },
  moogSquareLead: {
    name: '🔲 SQUARE LEAD',
    category: 'lead',
    emoji: '🔲',
    description: 'Square wave lead',
    osc1Level: 0.0,
    osc2Level: 0.0,
    osc3Level: 0.5,
    filterCutoff: 4500,
    filterResonance: 12,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.8,
    release: 0.6,
    gradient: ['#8B5CF6', '#A78BFA']
  },
  moogPWMLead: {
    name: '〰️ PWM LEAD',
    category: 'lead',
    emoji: '〰️',
    description: 'Pulse width modulation',
    osc1Level: 0.4,
    osc2Level: 0.4,
    osc3Level: 0.3,
    filterCutoff: 5000,
    filterResonance: 16,
    attack: 0.008,
    decay: 0.28,
    sustain: 0.82,
    release: 0.55,
    gradient: ['#EC4899', '#F472B6']
  },
  moogHardLead: {
    name: '⚡ HARD LEAD',
    category: 'lead',
    emoji: '⚡',
    description: 'Hard hitting lead',
    osc1Level: 0.5,
    osc2Level: 0.45,
    osc3Level: 0.4,
    filterCutoff: 6000,
    filterResonance: 20,
    attack: 0.001,
    decay: 0.18,
    sustain: 0.85,
    release: 0.35,
    gradient: ['#B91C1C', '#DC2626']
  },
  moogSoftLead: {
    name: '✨ SOFT LEAD',
    category: 'lead',
    emoji: '✨',
    description: 'Smooth soft lead',
    osc1Level: 0.35,
    osc2Level: 0.35,
    osc3Level: 0.3,
    filterCutoff: 4000,
    filterResonance: 8,
    attack: 0.05,
    decay: 0.3,
    sustain: 0.9,
    release: 0.8,
    gradient: ['#10B981', '#34D399']
  },

  // PAD Category (4 presets)
  moogDarkPad: {
    name: '🌑 DARK PAD',
    category: 'pad',
    emoji: '🌑',
    description: 'Dark atmospheric pad',
    osc1Level: 0.4,
    osc2Level: 0.35,
    osc3Level: 0.35,
    filterCutoff: 1200,
    filterResonance: 6,
    attack: 1.5,
    decay: 0.8,
    sustain: 0.9,
    release: 2.5,
    gradient: ['#1F2937', '#374151']
  },
  moogPad: {
    name: '🌌 MOOG PAD',
    category: 'pad',
    emoji: '🌌',
    description: 'Classic Moog pad',
    osc1Level: 0.35,
    osc2Level: 0.3,
    osc3Level: 0.35,
    filterCutoff: 2500,
    filterResonance: 8,
    attack: 1.2,
    decay: 0.6,
    sustain: 0.9,
    release: 2.0,
    gradient: ['#4C1D95', '#7C3AED']
  },
  moogAnalogStrings: {
    name: '🎻 ANALOG STRINGS',
    category: 'pad',
    emoji: '🎻',
    description: 'Analog string pad',
    osc1Level: 0.3,
    osc2Level: 0.3,
    osc3Level: 0.3,
    filterCutoff: 3000,
    filterResonance: 5,
    attack: 0.8,
    decay: 0.4,
    sustain: 0.95,
    release: 1.8,
    gradient: ['#7C2D12', '#D97706']
  },
  moogOrgan: {
    name: '🎹 ORGAN',
    category: 'pad',
    emoji: '🎹',
    description: 'Organ-like sustain',
    osc1Level: 0.35,
    osc2Level: 0.35,
    osc3Level: 0.3,
    filterCutoff: 3500,
    filterResonance: 4,
    attack: 0.01,
    decay: 0.1,
    sustain: 1.0,
    release: 0.2,
    gradient: ['#B45309', '#F59E0B']
  },

  // PLUCK Category (2 presets)
  moogPluck: {
    name: '🎸 MOOG PLUCK',
    category: 'pluck',
    emoji: '🎸',
    description: 'Plucked Moog sound',
    osc1Level: 0.45,
    osc2Level: 0.4,
    osc3Level: 0.0,
    filterCutoff: 5500,
    filterResonance: 18,
    attack: 0.001,
    decay: 0.35,
    sustain: 0.0,
    release: 0.5,
    gradient: ['#059669', '#10B981']
  },
  moogStab: {
    name: '💥 STAB',
    category: 'pluck',
    emoji: '💥',
    description: 'Sharp stab',
    osc1Level: 0.5,
    osc2Level: 0.45,
    osc3Level: 0.4,
    filterCutoff: 4500,
    filterResonance: 20,
    attack: 0.002,
    decay: 0.2,
    sustain: 0.4,
    release: 0.3,
    gradient: ['#DC2626', '#F87171']
  },

  // BRASS Category (1 preset)
  moogBrass: {
    name: '🎺 MOOG BRASS',
    category: 'brass',
    emoji: '🎺',
    description: 'Brass section sound',
    osc1Level: 0.4,
    osc2Level: 0.4,
    osc3Level: 0.3,
    filterCutoff: 2500,
    filterResonance: 12,
    attack: 0.08,
    decay: 0.3,
    sustain: 0.85,
    release: 0.5,
    gradient: ['#92400E', '#EA580C']
  },

  // FX Category (1 preset)
  moogFilterSweep: {
    name: '🌊 FILTER SWEEP',
    category: 'fx',
    emoji: '🌊',
    description: 'Sweeping filter effect',
    osc1Level: 0.45,
    osc2Level: 0.4,
    osc3Level: 0.35,
    filterCutoff: 1500,
    filterResonance: 22,
    attack: 0.5,
    decay: 1.0,
    sustain: 0.7,
    release: 1.5,
    gradient: ['#0891B2', '#06B6D4']
  },
};

// Helper functions
export const getJuno106PresetsByCategory = (category) => {
  return Object.entries(JUNO106_PRESETS)
    .filter(([_, preset]) => category === 'all' || preset.category === category)
    .map(([id, _]) => id);  // Return just the ID
};

export const getMinimoogPresetsByCategory = (category) => {
  return Object.entries(MINIMOOG_PRESETS)
    .filter(([_, preset]) => category === 'all' || preset.category === category)
    .map(([id, _]) => id);  // Return just the ID
};

export const getJuno106Categories = () => {
  const categories = new Set();
  Object.values(JUNO106_PRESETS).forEach(preset => categories.add(preset.category));
  return ['all', ...Array.from(categories)];
};

export const getMinimoogCategories = () => {
  const categories = new Set();
  Object.values(MINIMOOG_PRESETS).forEach(preset => categories.add(preset.category));
  return ['all', ...Array.from(categories)];
};

export const getJuno106PresetsCount = () => Object.keys(JUNO106_PRESETS).length;
export const getMinimoogPresetsCount = () => Object.keys(MINIMOOG_PRESETS).length;
