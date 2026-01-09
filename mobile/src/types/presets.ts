/**
 * HAOS.fm Preset Library Type Definitions
 * Complete type system for Pattern Studio & Preset Library
 */

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

export type PresetCategory = 
  | 'bass'          // 10 presets - Sub frequencies, growls, wobbles
  | 'lead'          // 10 presets - Melodies, supersaws, plucks
  | 'pad'           // 9 presets - Atmospheres, textures, ambience
  | 'pluck'         // 6 presets - Percussive, mallet, pizzicato
  | 'brass'         // 6 presets - Horns, trumpets, saxophones
  | 'bell'          // 5 presets - Chimes, glass, gongs
  | 'vocal'         // 4 presets - Vowel formants
  | 'fx'            // 8 presets - Risers, impacts, sweeps
  | 'techno'        // 6 presets - 303, acid, minimal
  | 'trance'        // 8 presets - Uplifting, gated, supersaws
  | 'dnb'           // 8 presets - Reese, neuro, jump-up
  | 'dubstep'       // 8 presets - Wobbles, growls, screams
  | 'trap'          // 8 presets - 808s, hi-hats, flutes
  | 'hardstyle'     // 8 presets - Kicks, screeches, euphoric
  | 'futurebass'    // 8 presets - Kawaii, chords, vocal chops
  | 'lofi'          // 8 presets - Vinyl, tape, dusty
  | 'ambient'       // 6 presets - Drones, textures, space
  | 'percussion';   // 26 presets - Drums, cymbals, percussion

export type Genre = 
  | 'techno' | 'house' | 'minimal' | 'acid'
  | 'trance' | 'uplifting' | 'progressive'
  | 'dnb' | 'jungle' | 'neurofunk' | 'liquid'
  | 'dubstep' | 'riddim' | 'brostep'
  | 'trap' | 'hip-hop'
  | 'hardstyle' | 'hardcore' | 'raw'
  | 'futurebass' | 'edm' | 'pop'
  | 'lofi' | 'chillhop' | 'beats'
  | 'ambient' | 'downtempo' | 'chill';

export type Mood = 
  | 'dark' | 'light' | 'aggressive' | 'soft'
  | 'energetic' | 'calm' | 'heavy' | 'airy'
  | 'warm' | 'cold' | 'bright' | 'deep'
  | 'atmospheric' | 'percussive' | 'melodic';

export type PatternType = 
  | 'up_major'           // Major scale ascending
  | 'up_minor'           // Minor scale ascending
  | 'updown_penta'       // Pentatonic up-down
  | 'chord';             // Major chord

export type ArpeggioPattern = 
  | 'up' | 'down' | 'up_down' | 'down_up'
  | 'random' | 'chord' | 'alternate' | 'sequence';

export type Scale = 
  | 'major' | 'minor' | 'harmonic_minor' | 'melodic_minor'
  | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian'
  | 'pentatonic_major' | 'pentatonic_minor'
  | 'blues' | 'chromatic' | 'whole_tone' | 'diminished';

export type RhythmPattern = 
  | '16th' | '8th' | 'triplet' 
  | 'dotted_8th' | '4th' | 'syncopated';

export type SortBy = 
  | 'popular'      // Most played
  | 'recent'       // Recently played
  | 'alphabetical' // A-Z
  | 'category'     // Group by category
  | 'genre'        // Group by genre
  | 'energy';      // By energy level

// ============================================================
// CORE PRESET TYPES
// ============================================================

/**
 * Base preset from JSON (152 presets)
 */
export interface BasePreset {
  id: string;                      // 'bass_sub'
  name: string;                    // '💎 SUB BASS'
  category: PresetCategory;        // 'bass'
  
  // Synthesis parameters
  osc1_level: number;
  osc2_level: number;
  osc3_level: number;
  osc1_detune: number;
  osc2_detune: number;
  osc3_detune: number;
  filter_cutoff: number;
  filter_resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  lfo_rate: number;
  lfo_depth: number;
  noise_level: number;
  chorus: number;
  stereo_width: number;
}

/**
 * Audio sample for a single note
 */
export interface PresetSample {
  note: string;                    // 'C2'
  midi: number;                    // 36
  frequency: number;               // 65.4 Hz
  filePath: any;                   // require() path to WAV file
  duration: number;                // 2.0 seconds
}

/**
 * Arpeggio pattern audio file
 */
export interface PresetPattern {
  type: PatternType;               // 'up_major'
  scale: Scale;                    // 'major'
  arpeggio: ArpeggioPattern;       // 'up'
  rhythm: RhythmPattern;           // '16th'
  bpm: number;                     // 128
  bars: number;                    // 2 or 4
  filePath: any;                   // require() path to WAV file
  duration: number;                // Total duration in seconds
  fileName: string;                // Original file name
}

/**
 * Enhanced preset with metadata and audio files
 */
export interface EnhancedPreset extends BasePreset {
  emoji: string;                   // '💎'
  description: string;             // 'Clean deep sub bass'
  
  // Audio samples
  samples: PresetSample[];         // Note samples (C2, E2, G2, etc.)
  patterns: PresetPattern[];       // 4 arpeggio patterns
  
  // Metadata
  tags: string[];                  // ['deep', 'sub', 'minimal', 'techno']
  genres: Genre[];                 // ['techno', 'house', 'minimal']
  moods: Mood[];                   // ['dark', 'heavy', 'powerful']
  energy: number;                  // 1-10 (8 = high energy)
  difficulty: number;              // 1-5 (2 = beginner friendly)
  
  // Usage statistics
  usage: PresetUsage;
  
  // Relationships
  related: string[];               // Similar preset IDs
  complements: string[];           // Presets that sound good together
}

/**
 * Usage statistics for a preset
 */
export interface PresetUsage {
  playCount: number;
  favoriteCount: number;
  lastPlayed: Date | null;
  popularityScore: number;
}

// ============================================================
// COLLECTIONS & FAVORITES
// ============================================================

/**
 * User collection of presets
 */
export interface Collection {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  presetIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User favorites data
 */
export interface FavoritesData {
  presetIds: Set<string>;
  updatedAt: Date;
}

// ============================================================
// SEARCH & FILTER
// ============================================================

/**
 * Search filters for preset library
 */
export interface SearchFilters {
  query?: string;
  categories?: PresetCategory[];
  genres?: Genre[];
  moods?: Mood[];
  energyMin?: number;
  energyMax?: number;
  sortBy?: SortBy;
  onlyFavorites?: boolean;
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  preset: EnhancedPreset;
  score: number;
  matchedFields: string[];
}

// ============================================================
// PATTERN PLAYER
// ============================================================

/**
 * Pattern layer in mixer (one of 4 slots)
 */
export interface PatternLayer {
  slot: number;                    // 0-3
  preset: EnhancedPreset;
  patternType: PatternType;
  sound: any;                      // expo-av Sound object
  volume: number;                  // 0-1
  isMuted: boolean;
  isPlaying: boolean;
}

/**
 * Pattern mixer state
 */
export interface MixerState {
  layers: Map<number, PatternLayer>;
  masterVolume: number;
  masterBPM: number;
  isPlaying: boolean;
  isSynced: boolean;
}

// ============================================================
// GENRE STUDIOS
// ============================================================

/**
 * Genre studio configuration
 */
export interface GenreStudio {
  id: string;
  name: string;
  emoji: string;
  genre: Genre;
  description: string;
  bpmRange: [number, number];
  presetIds: string[];
  patternCombos: PatternCombo[];
  features: string[];
}

/**
 * Pre-made pattern combination
 */
export interface PatternCombo {
  id: string;
  name: string;
  description: string;
  layers: {
    presetId: string;
    patternType: PatternType;
    volume: number;
  }[];
  bpm: number;
}

// ============================================================
// CATEGORY METADATA
// ============================================================

/**
 * Category information and statistics
 */
export interface CategoryInfo {
  category: PresetCategory;
  name: string;
  emoji: string;
  description: string;
  presetCount: number;
  patternCount: number;
  totalSize: number;
  characteristics: string[];
}

// ============================================================
// EXPORT & SHARE
// ============================================================

/**
 * Export configuration
 */
export interface ExportConfig {
  format: 'wav' | 'mp3' | 'midi';
  quality: 'low' | 'medium' | 'high';
  normalize: boolean;
  fadeOut: boolean;
}

/**
 * Shareable preset data
 */
export interface ShareablePreset {
  presetId: string;
  presetName: string;
  patterns: PatternType[];
  collections: string[];
  shareUrl: string;
}

// ============================================================
// CATEGORY CONSTANTS
// ============================================================

export const CATEGORY_INFO: Record<PresetCategory, CategoryInfo> = {
  bass: {
    category: 'bass',
    name: 'Bass',
    emoji: '💎',
    description: 'Sub frequencies, growls, wobbles',
    presetCount: 10,
    patternCount: 40,
    totalSize: 0,
    characteristics: ['deep', 'heavy', 'sub', 'growl'],
  },
  lead: {
    category: 'lead',
    name: 'Lead',
    emoji: '⚡',
    description: 'Melodies, supersaws, plucks',
    presetCount: 10,
    patternCount: 40,
    totalSize: 0,
    characteristics: ['bright', 'melodic', 'cutting', 'supersaw'],
  },
  pad: {
    category: 'pad',
    name: 'Pad',
    emoji: '🌊',
    description: 'Atmospheres, textures, ambience',
    presetCount: 9,
    patternCount: 36,
    totalSize: 0,
    characteristics: ['warm', 'atmospheric', 'evolving', 'textural'],
  },
  pluck: {
    category: 'pluck',
    name: 'Pluck',
    emoji: '🎯',
    description: 'Percussive, mallet, pizzicato',
    presetCount: 6,
    patternCount: 24,
    totalSize: 0,
    characteristics: ['percussive', 'short', 'plucked', 'rhythmic'],
  },
  brass: {
    category: 'brass',
    name: 'Brass',
    emoji: '🎺',
    description: 'Horns, trumpets, saxophones',
    presetCount: 6,
    patternCount: 24,
    totalSize: 0,
    characteristics: ['brass', 'horn', 'punchy', 'bold'],
  },
  bell: {
    category: 'bell',
    name: 'Bell',
    emoji: '🔔',
    description: 'Chimes, glass, gongs',
    presetCount: 5,
    patternCount: 20,
    totalSize: 0,
    characteristics: ['bell', 'chime', 'glass', 'resonant'],
  },
  vocal: {
    category: 'vocal',
    name: 'Vocal',
    emoji: '🎤',
    description: 'Vowel formants, choir',
    presetCount: 4,
    patternCount: 16,
    totalSize: 0,
    characteristics: ['vocal', 'formant', 'human', 'choir'],
  },
  fx: {
    category: 'fx',
    name: 'FX',
    emoji: '✨',
    description: 'Risers, impacts, sweeps',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['riser', 'impact', 'sweep', 'effect'],
  },
  techno: {
    category: 'techno',
    name: 'Techno',
    emoji: '🧪',
    description: '303, acid, minimal',
    presetCount: 6,
    patternCount: 24,
    totalSize: 0,
    characteristics: ['303', 'acid', 'minimal', 'industrial'],
  },
  trance: {
    category: 'trance',
    name: 'Trance',
    emoji: '🚪',
    description: 'Uplifting, gated, supersaws',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['uplifting', 'gated', 'supersaw', 'euphoric'],
  },
  dnb: {
    category: 'dnb',
    name: 'DnB',
    emoji: '🎵',
    description: 'Reese, neuro, jump-up',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['reese', 'neuro', 'fast', 'rolling'],
  },
  dubstep: {
    category: 'dubstep',
    name: 'Dubstep',
    emoji: '🌀',
    description: 'Wobbles, growls, screams',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['wobble', 'growl', 'heavy', 'aggressive'],
  },
  trap: {
    category: 'trap',
    name: 'Trap',
    emoji: '🔊',
    description: '808s, hi-hats, flutes',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['808', 'hi-hat', 'trap', 'rolling'],
  },
  hardstyle: {
    category: 'hardstyle',
    name: 'Hardstyle',
    emoji: '💥',
    description: 'Kicks, screeches, euphoric',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['kick', 'screech', 'euphoric', 'raw'],
  },
  futurebass: {
    category: 'futurebass',
    name: 'Future Bass',
    emoji: '💖',
    description: 'Kawaii, chords, vocal chops',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['kawaii', 'chords', 'vocal-chop', 'lush'],
  },
  lofi: {
    category: 'lofi',
    name: 'Lo-Fi',
    emoji: '💿',
    description: 'Vinyl, tape, dusty',
    presetCount: 8,
    patternCount: 32,
    totalSize: 0,
    characteristics: ['vinyl', 'tape', 'dusty', 'warm'],
  },
  ambient: {
    category: 'ambient',
    name: 'Ambient',
    emoji: '🌌',
    description: 'Drones, textures, space',
    presetCount: 6,
    patternCount: 24,
    totalSize: 0,
    characteristics: ['drone', 'texture', 'space', 'evolving'],
  },
  percussion: {
    category: 'percussion',
    name: 'Percussion',
    emoji: '🥁',
    description: 'Drums, cymbals, percussion',
    presetCount: 26,
    patternCount: 104,
    totalSize: 0,
    characteristics: ['drum', 'cymbal', 'percussion', 'rhythmic'],
  },
};

// ============================================================
// GENRE STUDIO CONFIGS
// ============================================================

export const GENRE_STUDIOS: GenreStudio[] = [
  {
    id: 'techno',
    name: 'Techno Studio',
    emoji: '🧪',
    genre: 'techno',
    description: '303 acid, minimal basslines, industrial sounds',
    bpmRange: [128, 135],
    presetIds: [], // Filled by library manager
    patternCombos: [],
    features: ['303-style sequences', 'Minimal grooves', 'Industrial textures'],
  },
  {
    id: 'trance',
    name: 'Trance Studio',
    emoji: '🚪',
    genre: 'trance',
    description: 'Uplifting progressions, gated synths, supersaw stacks',
    bpmRange: [138, 145],
    presetIds: [],
    patternCombos: [],
    features: ['Uplifting melodies', 'Gated patterns', 'Emotional progressions'],
  },
  {
    id: 'dnb',
    name: 'DnB Studio',
    emoji: '🎵',
    genre: 'dnb',
    description: 'Reese basslines, neurofunk wobbles, fast arpeggios',
    bpmRange: [170, 180],
    presetIds: [],
    patternCombos: [],
    features: ['Reese bass', 'Neuro wobbles', 'Fast patterns'],
  },
  {
    id: 'dubstep',
    name: 'Dubstep Studio',
    emoji: '🌀',
    genre: 'dubstep',
    description: 'Heavy wobbles, LFO modulation, growling bass',
    bpmRange: [140, 150],
    presetIds: [],
    patternCombos: [],
    features: ['Heavy wobbles', 'Growling bass', 'Drop patterns'],
  },
  {
    id: 'trap',
    name: 'Trap Studio',
    emoji: '🔊',
    genre: 'trap',
    description: '808 bass patterns, hi-hat rolls, vocal chops',
    bpmRange: [140, 150],
    presetIds: [],
    patternCombos: [],
    features: ['808 patterns', 'Hi-hat rolls', 'Vocal elements'],
  },
  {
    id: 'hardstyle',
    name: 'Hardstyle Studio',
    emoji: '💥',
    genre: 'hardstyle',
    description: 'Hard kicks, screeching leads, euphoric melodies',
    bpmRange: [150, 160],
    presetIds: [],
    patternCombos: [],
    features: ['Hard kicks', 'Screeching leads', 'Raw energy'],
  },
  {
    id: 'futurebass',
    name: 'Future Bass Studio',
    emoji: '💖',
    genre: 'futurebass',
    description: 'Lush chords, vocal processing, kawaii aesthetics',
    bpmRange: [120, 140],
    presetIds: [],
    patternCombos: [],
    features: ['Lush chords', 'Vocal chops', 'Detuned stacks'],
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Studio',
    emoji: '💿',
    genre: 'lofi',
    description: 'Vinyl textures, tape saturation, detuned keys',
    bpmRange: [60, 120],
    presetIds: [],
    patternCombos: [],
    features: ['Vinyl texture', 'Tape warmth', 'Dusty vibes'],
  },
  {
    id: 'ambient',
    name: 'Ambient Studio',
    emoji: '🌌',
    genre: 'ambient',
    description: 'Long evolving drones, atmospheric textures, spacey soundscapes',
    bpmRange: [60, 90],
    presetIds: [],
    patternCombos: [],
    features: ['Evolving drones', 'Atmospheric pads', 'Space textures'],
  },
];
