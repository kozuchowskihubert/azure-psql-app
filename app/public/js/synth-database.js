/**
 * HAOS.fm Synthesizer Database
 * Comprehensive collection of virtual synthesizers and their characteristics
 * "Where Chaos Becomes Creation"
 */

(function() {
  'use strict';

  // ============================================================================
  // SYNTHESIZER DEFINITIONS
  // Each synth has unique characteristics that affect sound generation
  // ============================================================================

  const SYNTH_DATABASE = {
    
    // === ROLAND ===
    'tb303': {
      name: 'Roland TB-303',
      manufacturer: 'Roland',
      year: 1981,
      type: 'Bass Synthesizer',
      category: 'Acid',
      icon: '🎹',
      color: '#FF5500',
      description: 'The legendary acid bass synthesizer',
      oscillators: {
        count: 1,
        types: ['sawtooth', 'square'],
        range: { min: 32.7, max: 1046.5 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.5 },
        cutoff: { min: 100, max: 10000, default: 1000 },
        envelope: true
      },
      envelope: {
        attack: { min: 0.001, max: 0.1, default: 0.01 },
        decay: { min: 0.05, max: 2, default: 0.3 },
        sustain: { min: 0, max: 1, default: 0 },
        release: { min: 0.01, max: 0.5, default: 0.1 }
      },
      features: ['accent', 'slide', 'sequencer'],
      tags: ['acid', 'techno', 'bass', 'classic']
    },

    'tr808': {
      name: 'Roland TR-808',
      manufacturer: 'Roland',
      year: 1980,
      type: 'Drum Machine',
      category: 'Drums',
      icon: '🥁',
      color: '#FF6B35',
      description: 'Legendary drum machine with iconic sounds',
      voices: ['kick', 'snare', 'clap', 'hihat_closed', 'hihat_open', 'tom_low', 'tom_mid', 'tom_high', 'cowbell', 'clave', 'rimshot', 'cymbal'],
      synthesis: 'analog',
      features: ['step_sequencer', 'accent', 'shuffle'],
      tags: ['drums', 'hip-hop', 'electronic', 'classic']
    },

    'tr909': {
      name: 'Roland TR-909',
      manufacturer: 'Roland',
      year: 1984,
      type: 'Drum Machine',
      category: 'Drums',
      icon: '🥁',
      color: '#00D9FF',
      description: 'The backbone of techno and house music',
      voices: ['kick', 'snare', 'clap', 'hihat_closed', 'hihat_open', 'tom_low', 'tom_mid', 'tom_high', 'crash', 'ride'],
      synthesis: 'hybrid',
      features: ['step_sequencer', 'accent', 'flam', 'shuffle'],
      tags: ['drums', 'techno', 'house', 'classic']
    },

    'juno106': {
      name: 'Roland Juno-106',
      manufacturer: 'Roland',
      year: 1984,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#4A90D9',
      description: 'Classic polyphonic synth with chorus',
      oscillators: {
        count: 1,
        types: ['sawtooth', 'square', 'pulse'],
        subOscillator: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 100, max: 12000, default: 5000 },
        envelope: true,
        keyTracking: true
      },
      envelope: {
        attack: { min: 0.001, max: 3, default: 0.01 },
        decay: { min: 0.01, max: 10, default: 0.5 },
        sustain: { min: 0, max: 1, default: 0.7 },
        release: { min: 0.01, max: 10, default: 0.3 }
      },
      lfo: {
        rate: { min: 0.1, max: 20, default: 5 },
        destinations: ['pitch', 'filter', 'pwm']
      },
      effects: ['chorus'],
      polyphony: 6,
      features: ['chorus', 'portamento', 'arpeggiator'],
      tags: ['pads', 'leads', 'bass', 'classic', '80s']
    },

    'jupiter8': {
      name: 'Roland Jupiter-8',
      manufacturer: 'Roland',
      year: 1981,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#D4AF37',
      description: 'The flagship analog polysynth',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse', 'triangle'],
        sync: true,
        crossMod: true,
        range: { min: 16.35, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 16000, default: 8000 },
        envelope: true,
        keyTracking: true
      },
      envelope: {
        attack: { min: 0.001, max: 5, default: 0.01 },
        decay: { min: 0.01, max: 15, default: 1 },
        sustain: { min: 0, max: 1, default: 0.8 },
        release: { min: 0.01, max: 15, default: 0.5 }
      },
      lfo: {
        count: 2,
        rate: { min: 0.1, max: 30, default: 5 },
        destinations: ['pitch', 'filter', 'pwm', 'vca']
      },
      polyphony: 8,
      features: ['split', 'layer', 'arpeggiator', 'portamento'],
      tags: ['pads', 'leads', 'strings', 'brass', 'classic', 'premium']
    },

    // === MOOG ===
    'minimoog': {
      name: 'Moog Minimoog Model D',
      manufacturer: 'Moog',
      year: 1970,
      type: 'Monophonic Synthesizer',
      category: 'Lead',
      icon: '🎛️',
      color: '#8B4513',
      description: 'The definitive analog synthesizer',
      oscillators: {
        count: 3,
        types: ['triangle', 'sawtooth', 'square', 'pulse', 'reverse_saw'],
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 20000, default: 5000 },
        envelope: true,
        keyTracking: true
      },
      envelope: {
        attack: { min: 0.001, max: 10, default: 0.01 },
        decay: { min: 0.01, max: 10, default: 0.5 },
        sustain: { min: 0, max: 1, default: 0.7 },
        release: { min: 0.01, max: 10, default: 0.3 }
      },
      modulation: {
        sources: ['osc3', 'noise'],
        destinations: ['osc1', 'osc2', 'filter']
      },
      polyphony: 1,
      features: ['glide', 'mod_wheel', 'pitch_wheel'],
      tags: ['bass', 'leads', 'classic', 'fat', 'warm']
    },

    'moogOne': {
      name: 'Moog One',
      manufacturer: 'Moog',
      year: 2018,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎛️',
      color: '#2C2C2C',
      description: 'Modern flagship polyphonic Moog',
      oscillators: {
        count: 3,
        types: ['triangle', 'sawtooth', 'square', 'pulse', 'mix'],
        sync: true,
        hardSync: true,
        range: { min: 16.35, max: 8372 }
      },
      filter: {
        type: 'dual',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 20000, default: 10000 },
        envelope: true,
        serial: true,
        parallel: true
      },
      envelope: {
        count: 3,
        attack: { min: 0.001, max: 30, default: 0.01 },
        decay: { min: 0.01, max: 30, default: 1 },
        sustain: { min: 0, max: 1, default: 0.7 },
        release: { min: 0.01, max: 30, default: 0.5 }
      },
      lfo: {
        count: 4,
        rate: { min: 0.01, max: 100, default: 5 }
      },
      polyphony: 16,
      effects: ['reverb', 'delay', 'chorus', 'eq'],
      features: ['split', 'layer', 'arpeggiator', 'sequencer', 'mod_matrix'],
      tags: ['pads', 'leads', 'bass', 'modern', 'premium']
    },

    'subsequent37': {
      name: 'Moog Subsequent 37',
      manufacturer: 'Moog',
      year: 2017,
      type: 'Paraphonic Synthesizer',
      category: 'Lead',
      icon: '🎛️',
      color: '#1A1A1A',
      description: 'Modern paraphonic Moog with duo mode',
      oscillators: {
        count: 2,
        types: ['triangle', 'sawtooth', 'square', 'pulse'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 20000, default: 5000 },
        multidrive: true
      },
      polyphony: 2,
      features: ['duo_mode', 'arpeggiator', 'sequencer'],
      tags: ['bass', 'leads', 'modern', 'fat']
    },

    'grandmother': {
      name: 'Moog Grandmother',
      manufacturer: 'Moog',
      year: 2018,
      type: 'Semi-Modular Synthesizer',
      category: 'Modular',
      icon: '🎛️',
      color: '#2F4F4F',
      description: 'Semi-modular synth with spring reverb',
      oscillators: {
        count: 2,
        types: ['triangle', 'sawtooth', 'square', 'pulse'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.5 },
        cutoff: { min: 20, max: 20000, default: 3000 }
      },
      polyphony: 1,
      effects: ['spring_reverb'],
      features: ['semi_modular', 'arpeggiator', 'sequencer', 'cv_patch'],
      tags: ['bass', 'leads', 'experimental', 'modular']
    },

    // === BEHRINGER ===
    'crave': {
      name: 'Behringer Crave',
      manufacturer: 'Behringer',
      year: 2019,
      type: 'Semi-Modular Synthesizer',
      category: 'Modular',
      icon: '🔧',
      color: '#333333',
      description: 'Affordable semi-modular mono synth',
      oscillators: {
        count: 1,
        types: ['sawtooth', 'square', 'pulse', 'triangle'],
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.5 },
        cutoff: { min: 20, max: 20000, default: 2000 }
      },
      envelope: {
        attack: { min: 0.001, max: 3, default: 0.01 },
        decay: { min: 0.01, max: 3, default: 0.3 },
        sustain: { min: 0, max: 1, default: 0.5 },
        release: { min: 0.01, max: 3, default: 0.2 }
      },
      polyphony: 1,
      features: ['semi_modular', 'sequencer', 'cv_patch'],
      tags: ['bass', 'leads', 'affordable', 'modular']
    },

    'td3': {
      name: 'Behringer TD-3',
      manufacturer: 'Behringer',
      year: 2019,
      type: 'Bass Synthesizer',
      category: 'Acid',
      icon: '🎹',
      color: '#C0C0C0',
      description: 'Clone of the TB-303',
      oscillators: {
        count: 1,
        types: ['sawtooth', 'square'],
        range: { min: 32.7, max: 1046.5 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.5 },
        cutoff: { min: 100, max: 10000, default: 1000 }
      },
      polyphony: 1,
      features: ['accent', 'slide', 'sequencer', 'distortion'],
      tags: ['acid', 'bass', 'affordable', 'clone']
    },

    'deepmind12': {
      name: 'Behringer DeepMind 12',
      manufacturer: 'Behringer',
      year: 2016,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#1E90FF',
      description: '12-voice analog poly with effects',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse'],
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 12,
      effects: ['reverb', 'delay', 'chorus', 'flanger', 'phaser', 'distortion'],
      features: ['mod_matrix', 'arpeggiator', 'sequencer', 'wifi'],
      tags: ['pads', 'leads', 'ambient', 'affordable']
    },

    'rd8': {
      name: 'Behringer RD-8',
      manufacturer: 'Behringer',
      year: 2019,
      type: 'Drum Machine',
      category: 'Drums',
      icon: '🥁',
      color: '#FF4500',
      description: 'Analog drum machine based on TR-808',
      voices: ['kick', 'snare', 'clap', 'hihat_closed', 'hihat_open', 'tom_low', 'tom_mid', 'tom_high', 'cowbell', 'clave', 'rimshot', 'cymbal'],
      synthesis: 'analog',
      features: ['step_sequencer', 'accent', 'shuffle', 'wave_designer'],
      tags: ['drums', 'hip-hop', 'affordable', 'clone']
    },

    // === SEQUENTIAL / DAVE SMITH ===
    'prophet5': {
      name: 'Sequential Prophet-5',
      manufacturer: 'Sequential',
      year: 1978,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#8B0000',
      description: 'First fully programmable polysynth',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 5,
      features: ['poly_mod', 'unison'],
      tags: ['pads', 'leads', 'strings', 'classic', 'premium']
    },

    'prophet6': {
      name: 'Sequential Prophet-6',
      manufacturer: 'Sequential',
      year: 2015,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#4B0082',
      description: 'Modern Prophet with vintage soul',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse', 'triangle'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 16000, default: 8000 },
        highpass: true
      },
      polyphony: 6,
      effects: ['reverb', 'delay', 'distortion'],
      features: ['poly_mod', 'unison', 'arpeggiator', 'sequencer'],
      tags: ['pads', 'leads', 'bass', 'modern']
    },

    'ob6': {
      name: 'Sequential OB-6',
      manufacturer: 'Sequential',
      year: 2016,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#FFD700',
      description: 'Tom Oberheim collab with Dave Smith',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse', 'triangle'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 2,
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 6,
      effects: ['reverb', 'delay', 'chorus'],
      features: ['x_mod', 'unison', 'arpeggiator'],
      tags: ['pads', 'brass', 'strings', 'warm']
    },

    // === KORG ===
    'ms20': {
      name: 'Korg MS-20',
      manufacturer: 'Korg',
      year: 1978,
      type: 'Semi-Modular Synthesizer',
      category: 'Modular',
      icon: '🔌',
      color: '#000080',
      description: 'Iconic semi-modular with aggressive filter',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse', 'triangle', 'ring_mod'],
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'dual',
        lowpass: { poles: 2 },
        highpass: { poles: 2 },
        resonance: { min: 0, max: 1, default: 0.6 },
        cutoff: { min: 20, max: 16000, default: 2000 },
        selfOscillation: true
      },
      polyphony: 1,
      features: ['semi_modular', 'external_input', 'cv_patch'],
      tags: ['leads', 'bass', 'noise', 'aggressive', 'classic']
    },

    'minilogue': {
      name: 'Korg Minilogue',
      manufacturer: 'Korg',
      year: 2016,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#708090',
      description: 'Affordable 4-voice analog poly',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'triangle'],
        sync: true,
        ringMod: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 2,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 4,
      effects: ['delay'],
      features: ['arpeggiator', 'sequencer', 'oscilloscope'],
      tags: ['pads', 'leads', 'bass', 'affordable']
    },

    'prologue': {
      name: 'Korg Prologue',
      manufacturer: 'Korg',
      year: 2018,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#2F4F4F',
      description: 'Flagship analog/digital hybrid',
      oscillators: {
        count: 3,
        types: ['sawtooth', 'square', 'triangle', 'digital'],
        sync: true,
        range: { min: 32.7, max: 8372 }
      },
      filter: {
        type: 'lowpass',
        poles: 2,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 20000, default: 10000 }
      },
      polyphony: 16,
      effects: ['reverb', 'delay', 'modulation'],
      features: ['user_oscillators', 'user_effects', 'arpeggiator'],
      tags: ['pads', 'leads', 'ambient', 'modern']
    },

    'volcaKeys': {
      name: 'Korg Volca Keys',
      manufacturer: 'Korg',
      year: 2013,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#DAA520',
      description: 'Compact analog loop synth',
      oscillators: {
        count: 3,
        types: ['sawtooth'],
        unison: true,
        detune: true,
        range: { min: 65.4, max: 2093 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 100, max: 10000, default: 5000 }
      },
      polyphony: 3,
      features: ['delay', 'sequencer', 'flux'],
      tags: ['pads', 'leads', 'portable', 'affordable']
    },

    // === ARTURIA ===
    'minibrute': {
      name: 'Arturia MiniBrute',
      manufacturer: 'Arturia',
      year: 2012,
      type: 'Monophonic Synthesizer',
      category: 'Lead',
      icon: '🎹',
      color: '#1C1C1C',
      description: 'Modern analog mono with Steiner filter',
      oscillators: {
        count: 1,
        types: ['sawtooth', 'square', 'triangle'],
        ultrasaw: true,
        metalizer: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'steiner',
        modes: ['lowpass', 'bandpass', 'highpass'],
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 18000, default: 3000 },
        brute: true
      },
      polyphony: 1,
      features: ['arpeggiator', 'sequencer', 'cv_patch'],
      tags: ['bass', 'leads', 'aggressive', 'modern']
    },

    'matrixbrute': {
      name: 'Arturia MatrixBrute',
      manufacturer: 'Arturia',
      year: 2016,
      type: 'Monophonic Synthesizer',
      category: 'Lead',
      icon: '🎹',
      color: '#2C2C2C',
      description: 'Flagship mono with massive mod matrix',
      oscillators: {
        count: 3,
        types: ['sawtooth', 'square', 'triangle', 'pulse'],
        ultrasaw: true,
        metalizer: true,
        sync: true,
        range: { min: 16.35, max: 8372 }
      },
      filter: {
        type: 'dual',
        steiner: true,
        ladder: true,
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 20000, default: 5000 }
      },
      polyphony: 1,
      effects: ['delay', 'chorus', 'distortion'],
      modMatrix: { sources: 16, destinations: 16 },
      features: ['mod_matrix', 'arpeggiator', 'sequencer'],
      tags: ['bass', 'leads', 'fx', 'premium']
    },

    'polybrute': {
      name: 'Arturia PolyBrute',
      manufacturer: 'Arturia',
      year: 2020,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#0D0D0D',
      description: 'Modern flagship polysynth',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'triangle', 'pulse', 'supersaw'],
        sync: true,
        range: { min: 16.35, max: 8372 }
      },
      filter: {
        type: 'dual',
        ladder: true,
        steiner: true,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 20000, default: 8000 }
      },
      polyphony: 6,
      effects: ['reverb', 'delay', 'chorus', 'flanger', 'distortion'],
      features: ['morphee', 'mod_matrix', 'arpeggiator', 'sequencer'],
      tags: ['pads', 'leads', 'bass', 'modern', 'premium']
    },

    // === OBERHEIM ===
    'obXa': {
      name: 'Oberheim OB-Xa',
      manufacturer: 'Oberheim',
      year: 1981,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#8B4513',
      description: 'Warm vintage analog polysynth',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 2,
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 8,
      features: ['split', 'layer', 'unison'],
      tags: ['pads', 'brass', 'strings', 'warm', 'classic', 'premium']
    },

    // === ARP ===
    'arp2600': {
      name: 'ARP 2600',
      manufacturer: 'ARP',
      year: 1971,
      type: 'Semi-Modular Synthesizer',
      category: 'Modular',
      icon: '🔌',
      color: '#4A4A4A',
      description: 'Legendary semi-modular synthesizer',
      oscillators: {
        count: 3,
        types: ['sawtooth', 'square', 'pulse', 'triangle', 'sine'],
        sync: true,
        ringMod: true,
        range: { min: 16.35, max: 8372 }
      },
      filter: {
        type: 'lowpass',
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.5 },
        cutoff: { min: 20, max: 16000, default: 3000 },
        selfOscillation: true
      },
      polyphony: 1,
      features: ['semi_modular', 'sample_hold', 'ring_mod', 'noise', 'cv_patch'],
      tags: ['fx', 'leads', 'bass', 'experimental', 'classic']
    },

    'odyssey': {
      name: 'ARP Odyssey',
      manufacturer: 'ARP',
      year: 1972,
      type: 'Duophonic Synthesizer',
      category: 'Lead',
      icon: '🎹',
      color: '#FFA500',
      description: 'Duophonic synth with aggressive sound',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse'],
        sync: true,
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        poles: 2,
        resonance: { min: 0, max: 1, default: 0.6 },
        cutoff: { min: 20, max: 16000, default: 3000 }
      },
      polyphony: 2,
      features: ['sample_hold', 'ring_mod', 'portamento'],
      tags: ['leads', 'bass', 'aggressive', 'classic']
    },

    // === YAMAHA ===
    'dx7': {
      name: 'Yamaha DX7',
      manufacturer: 'Yamaha',
      year: 1983,
      type: 'FM Synthesizer',
      category: 'FM',
      icon: '📊',
      color: '#00008B',
      description: 'Revolutionary FM synthesis',
      operators: 6,
      algorithms: 32,
      envelope: {
        stages: 8,
        rates: { min: 0, max: 99 },
        levels: { min: 0, max: 99 }
      },
      polyphony: 16,
      features: ['velocity', 'aftertouch', 'breath_control'],
      tags: ['electric_piano', 'bass', 'bells', 'fm', 'classic', '80s']
    },

    'cs80': {
      name: 'Yamaha CS-80',
      manufacturer: 'Yamaha',
      year: 1977,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '🎹',
      color: '#4169E1',
      description: 'Expressive polysynth legend',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'pulse'],
        range: { min: 32.7, max: 4186 }
      },
      filter: {
        type: 'lowpass',
        resonance: { min: 0, max: 1, default: 0.4 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 8,
      features: ['aftertouch', 'polyphonic_aftertouch', 'ring_mod', 'ribbon'],
      tags: ['pads', 'strings', 'brass', 'expressive', 'classic', 'premium']
    },

    // === ELEKTRON ===
    'analogFour': {
      name: 'Elektron Analog Four',
      manufacturer: 'Elektron',
      year: 2012,
      type: 'Polyphonic Synthesizer',
      category: 'Synth',
      icon: '⚡',
      color: '#1A1A1A',
      description: 'Performance-focused analog synth',
      oscillators: {
        count: 2,
        types: ['sawtooth', 'square', 'triangle', 'pulse', 'pwm'],
        subOscillator: true,
        noise: true,
        range: { min: 32.7, max: 8372 }
      },
      filter: {
        type: 'multimode',
        modes: ['lowpass', 'highpass', 'bandpass', 'notch'],
        poles: 4,
        resonance: { min: 0, max: 1, default: 0.3 },
        cutoff: { min: 20, max: 16000, default: 8000 }
      },
      polyphony: 4,
      effects: ['overdrive', 'delay', 'reverb', 'chorus'],
      features: ['sequencer', 'performance', 'cv_out', 'overbridge'],
      tags: ['techno', 'leads', 'bass', 'modern', 'performance']
    },

    'analogRytm': {
      name: 'Elektron Analog Rytm',
      manufacturer: 'Elektron',
      year: 2014,
      type: 'Drum Machine',
      category: 'Drums',
      icon: '🥁',
      color: '#333333',
      description: 'Hybrid analog/sample drum machine',
      voices: 8,
      synthesis: 'hybrid',
      sampler: true,
      filter: {
        type: 'multimode',
        perVoice: true
      },
      effects: ['overdrive', 'delay', 'reverb', 'compressor'],
      features: ['sequencer', 'performance', 'overbridge', 'sampling'],
      tags: ['drums', 'techno', 'hybrid', 'modern', 'performance']
    }
  };

  // ============================================================================
  // PRESET TEMPLATES BY SYNTH TYPE
  // ============================================================================

  const PRESET_TEMPLATES = {
    bass: {
      vco1: { waveform: 'sawtooth', octave: -1 },
      vco2: { waveform: 'square', octave: -1, detune: 5 },
      vcf: { cutoff: 800, resonance: 0.4 },
      vca: { level: 0.8 },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.2 }
    },
    lead: {
      vco1: { waveform: 'sawtooth', octave: 0 },
      vco2: { waveform: 'square', octave: 0, detune: 7 },
      vcf: { cutoff: 3000, resonance: 0.3 },
      vca: { level: 0.7 },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 }
    },
    pad: {
      vco1: { waveform: 'sawtooth', octave: 0 },
      vco2: { waveform: 'triangle', octave: 1, detune: 3 },
      vcf: { cutoff: 5000, resonance: 0.2 },
      vca: { level: 0.6 },
      envelope: { attack: 0.5, decay: 0.8, sustain: 0.8, release: 1.5 }
    },
    acid: {
      vco1: { waveform: 'sawtooth', octave: -1 },
      vcf: { cutoff: 500, resonance: 0.8 },
      vca: { level: 0.9 },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
    },
    pluck: {
      vco1: { waveform: 'square', octave: 0 },
      vco2: { waveform: 'sawtooth', octave: 0, detune: 2 },
      vcf: { cutoff: 4000, resonance: 0.5 },
      vca: { level: 0.7 },
      envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.3 }
    },
    strings: {
      vco1: { waveform: 'sawtooth', octave: 0 },
      vco2: { waveform: 'sawtooth', octave: 0, detune: 10 },
      vcf: { cutoff: 6000, resonance: 0.1 },
      vca: { level: 0.5 },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 1.0 }
    },
    brass: {
      vco1: { waveform: 'sawtooth', octave: 0 },
      vco2: { waveform: 'square', octave: 0, detune: 0 },
      vcf: { cutoff: 2000, resonance: 0.3, envAmount: 0.7 },
      vca: { level: 0.7 },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.4 }
    }
  };

  // ============================================================================
  // CATEGORY DEFINITIONS
  // ============================================================================

  const CATEGORIES = {
    'Acid': { icon: '🧪', color: '#39FF14', synths: ['tb303', 'td3'] },
    'Bass': { icon: '🎸', color: '#FF6B35', synths: ['minimoog', 'subsequent37', 'tb303', 'crave'] },
    'Lead': { icon: '🎺', color: '#FFD700', synths: ['minimoog', 'subsequent37', 'ms20', 'minibrute', 'odyssey'] },
    'Pad': { icon: '🌊', color: '#4A90D9', synths: ['juno106', 'jupiter8', 'obXa', 'prophet5', 'cs80', 'polybrute'] },
    'Drums': { icon: '🥁', color: '#FF4500', synths: ['tr808', 'tr909', 'rd8', 'analogRytm'] },
    'FM': { icon: '📊', color: '#00D9FF', synths: ['dx7'] },
    'Modular': { icon: '🔌', color: '#9370DB', synths: ['arp2600', 'ms20', 'crave', 'grandmother'] },
    'Synth': { icon: '🎹', color: '#D4AF37', synths: ['juno106', 'jupiter8', 'prophet5', 'prophet6', 'ob6', 'moogOne', 'deepmind12', 'minilogue', 'prologue', 'analogFour', 'matrixbrute', 'polybrute'] },
    'Classic': { icon: '⭐', color: '#B8860B', synths: ['minimoog', 'arp2600', 'jupiter8', 'prophet5', 'obXa', 'cs80', 'dx7'] }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get synth by ID
   */
  function getSynth(synthId) {
    return SYNTH_DATABASE[synthId] || null;
  }

  /**
   * Get all synths
   */
  function getAllSynths() {
    return Object.entries(SYNTH_DATABASE).map(([id, synth]) => ({
      id,
      ...synth
    }));
  }

  /**
   * Get synths by category
   */
  function getSynthsByCategory(category) {
    const categoryConfig = CATEGORIES[category];
    if (!categoryConfig) return [];
    
    return categoryConfig.synths.map(id => ({
      id,
      ...SYNTH_DATABASE[id]
    })).filter(s => s.name);
  }

  /**
   * Get synths by manufacturer
   */
  function getSynthsByManufacturer(manufacturer) {
    return Object.entries(SYNTH_DATABASE)
      .filter(([_, synth]) => synth.manufacturer === manufacturer)
      .map(([id, synth]) => ({ id, ...synth }));
  }

  /**
   * Get synths by tag
   */
  function getSynthsByTag(tag) {
    return Object.entries(SYNTH_DATABASE)
      .filter(([_, synth]) => synth.tags?.includes(tag))
      .map(([id, synth]) => ({ id, ...synth }));
  }

  /**
   * Search synths
   */
  function searchSynths(query) {
    const q = query.toLowerCase();
    return Object.entries(SYNTH_DATABASE)
      .filter(([id, synth]) => 
        id.toLowerCase().includes(q) ||
        synth.name.toLowerCase().includes(q) ||
        synth.manufacturer.toLowerCase().includes(q) ||
        synth.description?.toLowerCase().includes(q) ||
        synth.tags?.some(t => t.includes(q))
      )
      .map(([id, synth]) => ({ id, ...synth }));
  }

  /**
   * Get all manufacturers
   */
  function getManufacturers() {
    const manufacturers = new Set();
    Object.values(SYNTH_DATABASE).forEach(synth => {
      manufacturers.add(synth.manufacturer);
    });
    return Array.from(manufacturers).sort();
  }

  /**
   * Get all tags
   */
  function getAllTags() {
    const tags = new Set();
    Object.values(SYNTH_DATABASE).forEach(synth => {
      synth.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Generate preset parameters for a synth
   */
  function generatePresetForSynth(synthId, presetType = 'bass') {
    const synth = SYNTH_DATABASE[synthId];
    if (!synth) return null;

    const template = PRESET_TEMPLATES[presetType] || PRESET_TEMPLATES.bass;
    
    return {
      synth: synthId,
      synthName: synth.name,
      manufacturer: synth.manufacturer,
      ...template,
      // Add synth-specific variations
      vcf: {
        ...template.vcf,
        cutoff: Math.min(template.vcf.cutoff, synth.filter?.cutoff?.max || 10000),
        type: synth.filter?.type || 'lowpass'
      }
    };
  }

  /**
   * Get category config
   */
  function getCategory(categoryName) {
    return CATEGORIES[categoryName] || null;
  }

  /**
   * Get all categories
   */
  function getCategories() {
    return Object.entries(CATEGORIES).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  // ============================================================================
  // EXPORT API
  // ============================================================================

  window.HAOSSynthDatabase = {
    // Data
    synths: SYNTH_DATABASE,
    categories: CATEGORIES,
    presetTemplates: PRESET_TEMPLATES,
    
    // Synth methods
    getSynth,
    getAllSynths,
    getSynthsByCategory,
    getSynthsByManufacturer,
    getSynthsByTag,
    searchSynths,
    
    // Metadata methods
    getManufacturers,
    getAllTags,
    getCategory,
    getCategories,
    
    // Preset methods
    generatePresetForSynth,
    
    // Stats
    getStats: () => ({
      totalSynths: Object.keys(SYNTH_DATABASE).length,
      manufacturers: getManufacturers().length,
      categories: Object.keys(CATEGORIES).length,
      tags: getAllTags().length
    })
  };

  console.log(`✅ HAOS Synth Database loaded: ${Object.keys(SYNTH_DATABASE).length} synthesizers`);

})();
