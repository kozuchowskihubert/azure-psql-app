/**
 * HAOS.fm - Comprehensive Preset Pattern Library
 * 
 * Genre-specific multi-track patterns with full instrumentation:
 * - Drums (kick, snare, hihat, clap)
 * - Chords (piano, organ, synth)
 * - Melody (trumpet, horn, trombone)
 * - Strings (violin, viola, cello)
 */

// Note frequencies (12-tone equal temperament, A4 = 440 Hz)
export const NOTES = {
  // Octave 1
  C1: 32.70, Db1: 34.65, D1: 36.71, Eb1: 38.89, E1: 41.20, F1: 43.65, 
  Gb1: 46.25, G1: 49.00, Ab1: 51.91, A1: 55.00, Bb1: 58.27, B1: 61.74,
  
  // Octave 2
  C2: 65.41, Db2: 69.30, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31,
  Gb2: 92.50, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  
  // Octave 3
  C3: 130.81, Db3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61,
  Gb3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  
  // Octave 4 (Middle octave)
  C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23,
  Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  
  // Octave 5
  C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46,
  Gb5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
  
  // Octave 6
  C6: 1046.50, Db6: 1108.73, D6: 1174.66, Eb6: 1244.51, E6: 1318.51, F6: 1396.91,
  Gb6: 1479.98, G6: 1567.98, Ab6: 1661.22, A6: 1760.00, Bb6: 1864.66, B6: 1975.53
};

// ============================================================================
// HIP-HOP PRESETS
// ============================================================================

export const HIP_HOP_PRESETS = [
  {
    id: 'hiphop_classic_1',
    name: 'Classic Boom Bap',
    genre: 'Hip-Hop',
    bpm: 90,
    description: 'Classic 90s boom bap with piano and trumpet',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'piano', root: NOTES.C4, type: 'minor7', duration: 4.0, velocity: 0.6 },
        { beat: 8, instrument: 'piano', root: NOTES.Bb3, type: 'major7', duration: 4.0, velocity: 0.6 },
      ],
      melody: [
        { beat: 2, instrument: 'trumpet', freq: NOTES.C5, duration: 0.3, velocity: 0.7 },
        { beat: 4, instrument: 'trumpet', freq: NOTES.Eb5, duration: 0.3, velocity: 0.8 },
        { beat: 6, instrument: 'trumpet', freq: NOTES.G5, duration: 0.5, velocity: 0.75 },
        { beat: 10, instrument: 'trumpet', freq: NOTES.F5, duration: 0.3, velocity: 0.7 },
        { beat: 12, instrument: 'trumpet', freq: NOTES.Eb5, duration: 0.3, velocity: 0.75 },
        { beat: 14, instrument: 'trumpet', freq: NOTES.C5, duration: 0.5, velocity: 0.8 },
      ]
    }
  },
  
  {
    id: 'hiphop_trap_1',
    name: 'Modern Trap',
    genre: 'Hip-Hop',
    bpm: 140,
    description: 'Hard-hitting trap with 808 kicks and hi-hat rolls',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        clap: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.Eb3, type: 'minor', duration: 8.0, velocity: 0.7 },
      ],
      melody: [
        { beat: 0, instrument: 'horn', freq: NOTES.Bb4, duration: 1.0, velocity: 0.6 },
        { beat: 4, instrument: 'horn', freq: NOTES.G4, duration: 1.0, velocity: 0.6 },
        { beat: 8, instrument: 'horn', freq: NOTES.Eb4, duration: 1.0, velocity: 0.65 },
        { beat: 12, instrument: 'horn', freq: NOTES.F4, duration: 1.0, velocity: 0.6 },
      ]
    }
  },
  
  {
    id: 'hiphop_jazz_1',
    name: 'Jazz Hip-Hop',
    genre: 'Hip-Hop',
    bpm: 85,
    description: 'Smooth jazz-influenced hip-hop with rich chords',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'piano', root: NOTES.D4, type: 'minor7', duration: 3.0, velocity: 0.55 },
        { beat: 4, instrument: 'piano', root: NOTES.G3, type: 'dominant7', duration: 3.0, velocity: 0.55 },
        { beat: 8, instrument: 'piano', root: NOTES.C4, type: 'major7', duration: 3.0, velocity: 0.55 },
        { beat: 12, instrument: 'piano', root: NOTES.F3, type: 'major7', duration: 3.0, velocity: 0.55 },
      ],
      melody: [
        { beat: 1, instrument: 'trumpet', freq: NOTES.F5, duration: 0.4, velocity: 0.65 },
        { beat: 3, instrument: 'trumpet', freq: NOTES.E5, duration: 0.4, velocity: 0.65 },
        { beat: 5, instrument: 'trumpet', freq: NOTES.D5, duration: 0.6, velocity: 0.7 },
        { beat: 9, instrument: 'trumpet', freq: NOTES.C5, duration: 0.4, velocity: 0.65 },
        { beat: 11, instrument: 'trumpet', freq: NOTES.B4, duration: 0.4, velocity: 0.65 },
        { beat: 13, instrument: 'trumpet', freq: NOTES.A4, duration: 0.6, velocity: 0.7 },
      ]
    }
  },
  
  {
    id: 'hiphop_soul_1',
    name: 'Soulful Hip-Hop',
    genre: 'Hip-Hop',
    bpm: 95,
    description: 'Warm soul-influenced beat with organ and strings',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'organ', root: NOTES.A3, type: 'minor7', duration: 8.0, velocity: 0.65 },
      ],
      strings: [
        { beat: 0, instrument: 'violin', freq: NOTES.C5, duration: 8.0, velocity: 0.5, vibrato: 5.0 },
        { beat: 0, instrument: 'cello', freq: NOTES.E3, duration: 8.0, velocity: 0.6, vibrato: 4.5 },
      ],
      melody: [
        { beat: 4, instrument: 'horn', freq: NOTES.E5, duration: 0.5, velocity: 0.6 },
        { beat: 6, instrument: 'horn', freq: NOTES.D5, duration: 0.5, velocity: 0.6 },
        { beat: 8, instrument: 'horn', freq: NOTES.C5, duration: 1.0, velocity: 0.65 },
        { beat: 12, instrument: 'horn', freq: NOTES.A4, duration: 1.0, velocity: 0.6 },
      ]
    }
  },
  
  {
    id: 'hiphop_gfunk_1',
    name: 'G-Funk Classic',
    genre: 'Hip-Hop',
    bpm: 92,
    description: 'West Coast G-Funk with synth leads',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.D3, type: 'minor', duration: 4.0, velocity: 0.7 },
        { beat: 8, instrument: 'synth', root: NOTES.C3, type: 'major', duration: 4.0, velocity: 0.7 },
      ],
      melody: [
        { beat: 0, instrument: 'trumpet', freq: NOTES.D5, duration: 0.3, velocity: 0.75 },
        { beat: 1, instrument: 'trumpet', freq: NOTES.F5, duration: 0.3, velocity: 0.75 },
        { beat: 2, instrument: 'trumpet', freq: NOTES.A5, duration: 0.5, velocity: 0.8 },
        { beat: 4, instrument: 'trumpet', freq: NOTES.G5, duration: 0.3, velocity: 0.75 },
        { beat: 6, instrument: 'trumpet', freq: NOTES.F5, duration: 0.5, velocity: 0.7 },
        { beat: 8, instrument: 'trumpet', freq: NOTES.E5, duration: 0.5, velocity: 0.75 },
        { beat: 10, instrument: 'trumpet', freq: NOTES.C5, duration: 0.5, velocity: 0.7 },
      ]
    }
  },
];

// ============================================================================
// TECHNO PRESETS
// ============================================================================

export const TECHNO_PRESETS = [
  {
    id: 'techno_minimal_1',
    name: 'Minimal Techno',
    genre: 'Techno',
    bpm: 128,
    description: 'Hypnotic minimal techno with synth stabs',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.A2, type: 'minor', duration: 0.2, velocity: 0.8 },
        { beat: 4, instrument: 'synth', root: NOTES.A2, type: 'minor', duration: 0.2, velocity: 0.8 },
        { beat: 8, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.2, velocity: 0.8 },
        { beat: 12, instrument: 'synth', root: NOTES.F2, type: 'minor', duration: 0.2, velocity: 0.8 },
      ],
    }
  },
  
  {
    id: 'techno_acid_1',
    name: 'Acid Techno',
    genre: 'Techno',
    bpm: 135,
    description: 'Squelchy acid bassline with driving beats',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.E2, type: 'minor', duration: 0.15, velocity: 0.9 },
        { beat: 2, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.15, velocity: 0.85 },
        { beat: 4, instrument: 'synth', root: NOTES.A2, type: 'minor', duration: 0.15, velocity: 0.9 },
        { beat: 6, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.15, velocity: 0.85 },
        { beat: 8, instrument: 'synth', root: NOTES.E2, type: 'minor', duration: 0.15, velocity: 0.9 },
        { beat: 10, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.15, velocity: 0.85 },
        { beat: 12, instrument: 'synth', root: NOTES.A2, type: 'minor', duration: 0.15, velocity: 0.9 },
        { beat: 14, instrument: 'synth', root: NOTES.C3, type: 'minor', duration: 0.15, velocity: 0.85 },
      ],
    }
  },
  
  {
    id: 'techno_detroit_1',
    name: 'Detroit Techno',
    genre: 'Techno',
    bpm: 130,
    description: 'Classic Detroit sound with emotional strings',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.F3, type: 'major7', duration: 8.0, velocity: 0.6 },
      ],
      strings: [
        { beat: 0, instrument: 'violin', freq: NOTES.A4, duration: 16.0, velocity: 0.4, vibrato: 5.5 },
        { beat: 0, instrument: 'cello', freq: NOTES.F3, duration: 16.0, velocity: 0.45, vibrato: 4.5 },
      ],
    }
  },
  
  {
    id: 'techno_industrial_1',
    name: 'Industrial Techno',
    genre: 'Techno',
    bpm: 145,
    description: 'Dark and heavy industrial sound',
    pattern: {
      drums: {
        kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.C2, type: 'minor', duration: 0.2, velocity: 0.95 },
        { beat: 4, instrument: 'synth', root: NOTES.C2, type: 'minor', duration: 0.2, velocity: 0.95 },
        { beat: 8, instrument: 'synth', root: NOTES.Bb1, type: 'minor', duration: 0.2, velocity: 0.95 },
        { beat: 12, instrument: 'synth', root: NOTES.Ab1, type: 'minor', duration: 0.2, velocity: 0.95 },
      ],
    }
  },
  
  {
    id: 'techno_progressive_1',
    name: 'Progressive Techno',
    genre: 'Techno',
    bpm: 126,
    description: 'Melodic progressive techno with evolving pads',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.D3, type: 'minor7', duration: 16.0, velocity: 0.55 },
      ],
      strings: [
        { beat: 0, instrument: 'violin', freq: NOTES.F4, duration: 16.0, velocity: 0.35, vibrato: 6.0 },
        { beat: 0, instrument: 'viola', freq: NOTES.D4, duration: 16.0, velocity: 0.35, vibrato: 5.5 },
        { beat: 0, instrument: 'cello', freq: NOTES.A3, duration: 16.0, velocity: 0.4, vibrato: 5.0 },
      ],
    }
  },
];

// ============================================================================
// DRUM & BASS PRESETS
// ============================================================================

export const DNB_PRESETS = [
  {
    id: 'dnb_liquid_1',
    name: 'Liquid DnB',
    genre: 'Drum & Bass',
    bpm: 174,
    description: 'Smooth liquid funk with lush strings',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'piano', root: NOTES.A3, type: 'major7', duration: 8.0, velocity: 0.5 },
        { beat: 8, instrument: 'piano', root: NOTES.F3, type: 'major7', duration: 8.0, velocity: 0.5 },
      ],
      strings: [
        { beat: 0, instrument: 'violin', freq: NOTES.E5, duration: 16.0, velocity: 0.5, vibrato: 6.0 },
        { beat: 0, instrument: 'viola', freq: NOTES.C5, duration: 16.0, velocity: 0.45, vibrato: 5.5 },
        { beat: 0, instrument: 'cello', freq: NOTES.A3, duration: 16.0, velocity: 0.5, vibrato: 5.0 },
      ],
    }
  },
  
  {
    id: 'dnb_neurofunk_1',
    name: 'Neurofunk',
    genre: 'Drum & Bass',
    bpm: 172,
    description: 'Dark neurofunk with complex breaks',
    pattern: {
      drums: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
        hihat: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.C2, type: 'minor', duration: 0.3, velocity: 0.85 },
        { beat: 8, instrument: 'synth', root: NOTES.Bb1, type: 'minor', duration: 0.3, velocity: 0.85 },
      ],
    }
  },
  
  {
    id: 'dnb_jump_up_1',
    name: 'Jump Up',
    genre: 'Drum & Bass',
    bpm: 170,
    description: 'Energetic jump up with bouncy bassline',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.E2, type: 'minor', duration: 0.2, velocity: 0.9 },
        { beat: 2, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.2, velocity: 0.85 },
        { beat: 4, instrument: 'synth', root: NOTES.A2, type: 'minor', duration: 0.2, velocity: 0.9 },
        { beat: 6, instrument: 'synth', root: NOTES.G2, type: 'minor', duration: 0.2, velocity: 0.85 },
        { beat: 8, instrument: 'synth', root: NOTES.E2, type: 'minor', duration: 0.2, velocity: 0.9 },
        { beat: 10, instrument: 'synth', root: NOTES.D2, type: 'minor', duration: 0.2, velocity: 0.85 },
        { beat: 12, instrument: 'synth', root: NOTES.C2, type: 'minor', duration: 0.2, velocity: 0.9 },
        { beat: 14, instrument: 'synth', root: NOTES.B1, type: 'minor', duration: 0.2, velocity: 0.85 },
      ],
    }
  },
  
  {
    id: 'dnb_atmospheric_1',
    name: 'Atmospheric DnB',
    genre: 'Drum & Bass',
    bpm: 168,
    description: 'Ethereal atmospheric drum & bass',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'piano', root: NOTES.Db4, type: 'major7', duration: 16.0, velocity: 0.45 },
      ],
      strings: [
        { beat: 0, instrument: 'violin', freq: NOTES.F4, duration: 16.0, velocity: 0.4, vibrato: 6.5 },
        { beat: 0, instrument: 'viola', freq: NOTES.Db4, duration: 16.0, velocity: 0.38, vibrato: 6.0 },
        { beat: 0, instrument: 'cello', freq: NOTES.Ab3, duration: 16.0, velocity: 0.42, vibrato: 5.5 },
      ],
      melody: [
        { beat: 4, instrument: 'horn', freq: NOTES.F5, duration: 1.0, velocity: 0.5 },
        { beat: 8, instrument: 'horn', freq: NOTES.Eb5, duration: 1.0, velocity: 0.5 },
        { beat: 12, instrument: 'horn', freq: NOTES.Db5, duration: 1.0, velocity: 0.5 },
      ]
    }
  },
  
  {
    id: 'dnb_rollers_1',
    name: 'Rollers',
    genre: 'Drum & Bass',
    bpm: 175,
    description: 'Deep rolling bassline with tight breaks',
    pattern: {
      drums: {
        kick: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0],
        snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
        hihat: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      chords: [
        { beat: 0, instrument: 'synth', root: NOTES.G2, type: 'minor7', duration: 8.0, velocity: 0.7 },
        { beat: 8, instrument: 'synth', root: NOTES.F2, type: 'minor7', duration: 8.0, velocity: 0.7 },
      ],
      strings: [
        { beat: 0, instrument: 'cello', freq: NOTES.G3, duration: 16.0, velocity: 0.55, vibrato: 4.5 },
      ],
    }
  },
];

// Export all presets combined
export const ALL_PRESETS = [
  ...HIP_HOP_PRESETS,
  ...TECHNO_PRESETS,
  ...DNB_PRESETS,
];

// Get presets by genre
export const getPresetsByGenre = (genre) => {
  return ALL_PRESETS.filter(preset => preset.genre === genre);
};

// Get preset by ID
export const getPresetById = (id) => {
  return ALL_PRESETS.find(preset => preset.id === id);
};
