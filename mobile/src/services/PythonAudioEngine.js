/**
 * HAOS.fm Professional Audio Engine
 * ===================================
 * Uses bundled WAV samples for instant offline playback
 * 50+ professional samples: drums, bass, synths, FX
 * Falls back to Python backend for real-time synthesis
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

// ============================================
// BUNDLED SAMPLES LIBRARY
// ============================================

// KICKS - 12 variations with different envelopes, drives, reverbs
const KICK_SAMPLES = {
  // Classic 808 variations
  '808_soft': require('../../assets/sounds/drums/kicks/kick_808_soft.wav'),
  '808_hard': require('../../assets/sounds/drums/kicks/kick_808_hard.wav'),
  '808_long': require('../../assets/sounds/drums/kicks/kick_808_long.wav'),
  '808_short': require('../../assets/sounds/drums/kicks/kick_808_short.wav'),
  // 909 variations
  '909_punchy': require('../../assets/sounds/drums/kicks/kick_909_punchy.wav'),
  '909_tight': require('../../assets/sounds/drums/kicks/kick_909_tight.wav'),
  // Sub bass kicks
  'sub_deep': require('../../assets/sounds/drums/kicks/kick_sub_deep.wav'),
  'sub_rumble': require('../../assets/sounds/drums/kicks/kick_sub_rumble.wav'),
  // Distorted/driven kicks
  'distorted_heavy': require('../../assets/sounds/drums/kicks/kick_distorted_heavy.wav'),
  'distorted_gritty': require('../../assets/sounds/drums/kicks/kick_distorted_gritty.wav'),
  // Reverb kicks
  'reverb_hall': require('../../assets/sounds/drums/kicks/kick_reverb_hall.wav'),
  'reverb_room': require('../../assets/sounds/drums/kicks/kick_reverb_room.wav'),
};

// SNARES - 8 variations
const SNARE_SAMPLES = {
  '808_tight': require('../../assets/sounds/drums/snares/snare_808_tight.wav'),
  '808_fat': require('../../assets/sounds/drums/snares/snare_808_fat.wav'),
  '808_bright': require('../../assets/sounds/drums/snares/snare_808_bright.wav'),
  '909_punchy': require('../../assets/sounds/drums/snares/snare_909_punchy.wav'),
  '909_long': require('../../assets/sounds/drums/snares/snare_909_long.wav'),
  'clap_layer': require('../../assets/sounds/drums/snares/snare_clap_layer.wav'),
  'clap_tight': require('../../assets/sounds/drums/snares/snare_clap_tight.wav'),
  'rimshot': require('../../assets/sounds/drums/snares/snare_rimshot.wav'),
};

// HI-HATS - White noise based, 8 variations
const HIHAT_SAMPLES = {
  'closed_tight': require('../../assets/sounds/drums/hihats/hihat_closed_tight.wav'),
  'closed_medium': require('../../assets/sounds/drums/hihats/hihat_closed_medium.wav'),
  'closed_soft': require('../../assets/sounds/drums/hihats/hihat_closed_soft.wav'),
  'open_short': require('../../assets/sounds/drums/hihats/hihat_open_short.wav'),
  'open_long': require('../../assets/sounds/drums/hihats/hihat_open_long.wav'),
  'pedal': require('../../assets/sounds/drums/hihats/hihat_pedal.wav'),
  'sizzle': require('../../assets/sounds/drums/hihats/hihat_sizzle.wav'),
  'sizzle_long': require('../../assets/sounds/drums/hihats/hihat_sizzle_long.wav'),
};

// BASS - 10 variations including arpeggios
const BASS_SAMPLES = {
  'sub_C1': require('../../assets/sounds/bass/bass_sub_C1.wav'),
  'sub_E1': require('../../assets/sounds/bass/bass_sub_E1.wav'),
  'sub_G1': require('../../assets/sounds/bass/bass_sub_G1.wav'),
  'growl_low': require('../../assets/sounds/bass/bass_growl_low.wav'),
  'growl_mid': require('../../assets/sounds/bass/bass_growl_mid.wav'),
  'acid_C2': require('../../assets/sounds/bass/bass_acid_C2.wav'),
  'acid_E2': require('../../assets/sounds/bass/bass_acid_E2.wav'),
  'acid_G2': require('../../assets/sounds/bass/bass_acid_G2.wav'),
  'arpeggio_120bpm': require('../../assets/sounds/bass/bass_arpeggio_120bpm.wav'),
  'arpeggio_140bpm': require('../../assets/sounds/bass/bass_arpeggio_140bpm.wav'),
};

// SYNTHS - 8 variations
const SYNTH_SAMPLES = {
  'pad_A3': require('../../assets/sounds/synths/synth_pad_A3.wav'),
  'pad_C4': require('../../assets/sounds/synths/synth_pad_C4.wav'),
  'pad_E4': require('../../assets/sounds/synths/synth_pad_E4.wav'),
  'lead_A4': require('../../assets/sounds/synths/synth_lead_A4.wav'),
  'lead_C5': require('../../assets/sounds/synths/synth_lead_C5.wav'),
  'stab_Am': require('../../assets/sounds/synths/synth_stab_Am.wav'),
  'stab_C': require('../../assets/sounds/synths/synth_stab_C.wav'),
  'stab_F': require('../../assets/sounds/synths/synth_stab_F.wav'),
};

// FX - 4 variations
const FX_SAMPLES = {
  'riser_4bar': require('../../assets/sounds/fx/fx_riser_4bar.wav'),
  'riser_8bar': require('../../assets/sounds/fx/fx_riser_8bar.wav'),
  'impact_short': require('../../assets/sounds/fx/fx_impact_short.wav'),
  'impact_long': require('../../assets/sounds/fx/fx_impact_long.wav'),
};

// Legacy drum samples (backward compatibility)
const DRUM_SAMPLES = {
  // Kicks (map to new samples)
  kick_808: require('../../assets/sounds/drums/kick_808.wav'),
  kick_808_punchy: require('../../assets/sounds/drums/kick_808_punchy.wav'),
  kick_909: require('../../assets/sounds/drums/kick_909.wav'),
  kick_deep: require('../../assets/sounds/drums/kick_deep.wav'),
  // Snares
  snare_808: require('../../assets/sounds/drums/snare_808.wav'),
  snare_909: require('../../assets/sounds/drums/snare_909.wav'),
  snare_clicky: require('../../assets/sounds/drums/snare_clicky.wav'),
  // Hi-Hats
  hihat_closed: require('../../assets/sounds/drums/hihat_closed.wav'),
  hihat_open: require('../../assets/sounds/drums/hihat_open.wav'),
  hihat_pedal: require('../../assets/sounds/drums/hihat_pedal.wav'),
  // Cymbals
  ride: require('../../assets/sounds/drums/ride.wav'),
  crash: require('../../assets/sounds/drums/crash.wav'),
  // Claps & Snaps
  clap: require('../../assets/sounds/drums/clap.wav'),
  snap: require('../../assets/sounds/drums/snap.wav'),
  // Toms
  tom_low: require('../../assets/sounds/drums/tom_low.wav'),
  tom_mid: require('../../assets/sounds/drums/tom_mid.wav'),
  tom_high: require('../../assets/sounds/drums/tom_high.wav'),
  // Percussion
  rimshot: require('../../assets/sounds/drums/rimshot.wav'),
  cowbell: require('../../assets/sounds/drums/cowbell.wav'),
  clave: require('../../assets/sounds/drums/clave.wav'),
  shaker: require('../../assets/sounds/drums/shaker.wav'),
};

// Combined sample library for easy access
const ALL_SAMPLES = {
  kicks: KICK_SAMPLES,
  snares: SNARE_SAMPLES,
  hihats: HIHAT_SAMPLES,
  bass: BASS_SAMPLES,
  synths: SYNTH_SAMPLES,
  fx: FX_SAMPLES,
  drums: DRUM_SAMPLES, // Legacy
};

class PythonAudioEngine {
  constructor() {
    // Backend URL - for synth sounds only (drums use local samples)
    this.backendUrl = 'http://192.168.1.6:8000';
    
    this.isInitialized = false;
    this.soundCache = new Map();
    this.loadedSamples = {}; // Pre-loaded Audio.Sound objects for instant playback
    this.soundPool = {}; // Pool of sound instances for polyphonic playback
    this.poolIndexes = {}; // Round-robin indexes for each pool
    this.currentSounds = [];
    this.maxCachedSounds = 50; // Increased for larger library
    this.maxSoundPoolSize = 4; // Maximum concurrent instances per sound (reduced for stability)
    
    // Sample categories for easy access
    this.sampleLibrary = ALL_SAMPLES;
    
    // Audio engine parameters
    this.kickParams = {
      decay: 0.3,
      pitch: 150,
      velocity: 1.0
    };
    
    this.snareParams = {
      velocity: 1.0
    };
    
    this.hihatParams = {
      velocity: 1.0,
      open: false
    };
    
    this.clapParams = {
      velocity: 1.0
    };
    
    this.arp2600Params = {
      frequency: 440.0,
      duration: 0.5,
      velocity: 1.0,
      detune: 0.02,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      filter_cutoff: 2000.0,
      filter_resonance: 1.0
    };
  }

  /**
   * Initialize audio engine
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🥁 Initializing HAOS Audio Engine (Local Samples)...');
      
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      
      // Set audio mode - enable mixing for multiple simultaneous sounds
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
        interruptionModeIOS: 0, // MixWithOthers = 0 (allows multiple sounds)
      });
      
      // Preload essential drum sounds for instant playback
      console.log('📦 Loading bundled drum samples...');
      await this.preloadDrumSamples();
      
      // Test backend connection (for synth sounds only)
      const health = await this.testConnection();
      if (!health) {
        console.warn('⚠️ Backend not available. Synths disabled, drums still work!');
      } else {
        console.log('🔗 Backend available for synth sounds:', this.backendUrl);
      }
      
      console.log('✅ HAOS Audio Engine initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Audio Engine:', error);
      this.isInitialized = true; // Continue anyway with fallback
    }
  }

  /**
   * Preload bundled samples for instant playback (no network latency!)
   */
  async preloadDrumSamples() {
    console.log('📦 Loading essential samples...');
    
    // Essential drums
    const drumSamples = [
      'kick_808',
      'kick_808_punchy',
      'snare_808',
      'snare_909',
      'hihat_closed',
      'hihat_open',
      'clap',
      'rimshot',
      'cowbell',
    ];

    // Essential synths
    const synthSamples = [
      { name: 'lead_A4', category: SYNTH_SAMPLES },
      { name: 'lead_C5', category: SYNTH_SAMPLES },
      { name: 'pad_C4', category: SYNTH_SAMPLES },
      { name: 'pad_A3', category: SYNTH_SAMPLES },
    ];

    // Essential bass
    const bassSamples = [
      { name: 'sub_C1', category: BASS_SAMPLES },
      { name: 'acid_C2', category: BASS_SAMPLES },
      { name: 'growl_low', category: BASS_SAMPLES },
    ];

    // Load drums
    for (const sampleName of drumSamples) {
      try {
        const sample = DRUM_SAMPLES[sampleName];
        if (sample) {
          const { sound } = await Audio.Sound.createAsync(sample, { shouldPlay: false });
          this.loadedSamples[sampleName] = sound;
          console.log(`  ✅ Drum: ${sampleName}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Failed to load ${sampleName}:`, error.message);
      }
    }

    // Load synths
    for (const { name, category } of synthSamples) {
      try {
        const sample = category[name];
        if (sample) {
          const { sound } = await Audio.Sound.createAsync(sample, { shouldPlay: false });
          this.loadedSamples[name] = sound;
          console.log(`  ✅ Synth: ${name}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Failed to load ${name}:`, error.message);
      }
    }

    // Load bass
    for (const { name, category } of bassSamples) {
      try {
        const sample = category[name];
        if (sample) {
          const { sound } = await Audio.Sound.createAsync(sample, { shouldPlay: false });
          this.loadedSamples[name] = sound;
          console.log(`  ✅ Bass: ${name}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Failed to load ${name}:`, error.message);
      }
    }
    
    console.log(`🎵 Loaded ${Object.keys(this.loadedSamples).length} samples total`);
  }

  /**
   * Play a bundled sample with polyphonic support using round-robin pool
   * @param {string} sampleName - Name of the sample
   * @param {object} category - Sample category object (KICK_SAMPLES, SNARE_SAMPLES, etc.)
   */
  async playSample(sampleName, category = DRUM_SAMPLES) {
    try {
      // Try to find sample in provided category first
      let sample = category[sampleName];
      
      // Fallback to DRUM_SAMPLES for backward compatibility
      if (!sample) {
        sample = DRUM_SAMPLES[sampleName];
      }
      
      if (!sample) {
        console.warn(`⚠️ Unknown sample: ${sampleName}`);
        return null;
      }
      
      // Initialize sound pool for this sample if it doesn't exist
      if (!this.soundPool[sampleName]) {
        this.soundPool[sampleName] = [];
        this.poolIndexes[sampleName] = 0;
      }
      
      // If pool is empty or not full yet, create a new sound
      if (this.soundPool[sampleName].length < this.maxSoundPoolSize) {
        const { sound: newSound } = await Audio.Sound.createAsync(sample);
        this.soundPool[sampleName].push(newSound);
      }
      
      // Use round-robin to pick next sound (simple and fast)
      const currentIndex = this.poolIndexes[sampleName];
      const sound = this.soundPool[sampleName][currentIndex];
      
      // Move to next index for next call
      this.poolIndexes[sampleName] = (currentIndex + 1) % this.soundPool[sampleName].length;
      
      // Play the sound (will stop and restart if already playing)
      try {
        await sound.stopAsync();
        await sound.playAsync();
      } catch (e) {
        // If stop fails, just try to play
        await sound.playAsync();
      }
      
      return sound;
    } catch (error) {
      console.error(`❌ Playback error for ${sampleName}:`, error);
      return null;
    }
  }

  // ============================================
  // EXTENDED SAMPLE PLAYBACK METHODS
  // ============================================

  /**
   * Play kick with variant selection
   * @param {string} variant - '808_soft', '808_hard', '909_punchy', 'sub_deep', 'reverb_hall', etc.
   */
  async playKickVariant(variant = '808_soft') {
    return this.playSample(variant, KICK_SAMPLES);
  }

  /**
   * Play snare with variant selection
   * @param {string} variant - '808_tight', '909_punchy', 'clap_layer', 'rimshot', etc.
   */
  async playSnareVariant(variant = '808_tight') {
    return this.playSample(variant, SNARE_SAMPLES);
  }

  /**
   * Play hi-hat with variant selection
   * @param {string} variant - 'closed_tight', 'open_long', 'sizzle', etc.
   */
  async playHiHatVariant(variant = 'closed_tight') {
    return this.playSample(variant, HIHAT_SAMPLES);
  }

  /**
   * Play bass sample
   * @param {string} variant - 'sub_C1', 'growl_low', 'acid_C2', 'arpeggio_120bpm', etc.
   */
  async playBass(variant = 'sub_C1') {
    return this.playSample(variant, BASS_SAMPLES);
  }

  /**
   * Play synth sample
   * @param {string} variant - 'pad_A3', 'lead_A4', 'stab_Am', etc.
   */
  async playSynth(variant = 'pad_A3') {
    return this.playSample(variant, SYNTH_SAMPLES);
  }

  /**
   * Play FX sample
   * @param {string} variant - 'riser_4bar', 'impact_short', etc.
   */
  async playFX(variant = 'riser_4bar') {
    return this.playSample(variant, FX_SAMPLES);
  }

  /**
   * Get available samples for a category
   * @param {string} category - 'kicks', 'snares', 'hihats', 'bass', 'synths', 'fx'
   */
  getSampleList(category) {
    const categories = {
      kicks: Object.keys(KICK_SAMPLES),
      snares: Object.keys(SNARE_SAMPLES),
      hihats: Object.keys(HIHAT_SAMPLES),
      bass: Object.keys(BASS_SAMPLES),
      synths: Object.keys(SYNTH_SAMPLES),
      fx: Object.keys(FX_SAMPLES),
      drums: Object.keys(DRUM_SAMPLES),
    };
    return categories[category] || [];
  }

  /**
   * Test connection to Python backend
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.backendUrl}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connected:', data.service, data.version);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('⚠️ Backend connection failed:', error.message);
      return false;
    }
  }

  /**
   * Generic method to play audio from backend
   */
  async playFromBackend(endpoint, params = {}, fallbackHaptic = Haptics.ImpactFeedbackStyle.Medium) {
    try {
      // Fetch audio from backend
      const response = await fetch(`${this.backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.audio) {
        throw new Error('Invalid response from backend');
      }
      
      // Decode base64 audio
      const audioBase64 = data.audio;
      
      // Use data URI instead of file system (better iOS compatibility)
      const dataUri = `data:audio/wav;base64,${audioBase64}`;
      
      // Load and play audio with mixing enabled
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { 
          shouldPlay: true,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: false,
        },
        this.onPlaybackStatusUpdate.bind(this, dataUri)
      );
      
      // Track sound for cleanup
      this.currentSounds.push({ sound, fileUri: dataUri });
      
      // Cleanup old sounds
      if (this.currentSounds.length > this.maxCachedSounds) {
        const oldSound = this.currentSounds.shift();
        await this.cleanupSound(oldSound);
      }
      
      return sound;
    } catch (error) {
      console.warn('⚠️ Playback error:', error.message);
      // Fallback to haptic feedback
      await Haptics.impactAsync(fallbackHaptic);
      return null;
    }
  }

  /**
   * Playback status callback
   */
  async onPlaybackStatusUpdate(fileUri, status) {
    if (status.didJustFinish) {
      // Find and cleanup this sound
      const index = this.currentSounds.findIndex(s => s.fileUri === fileUri);
      if (index !== -1) {
        const soundObj = this.currentSounds.splice(index, 1)[0];
        await this.cleanupSound(soundObj);
      }
    }
  }

  /**
   * Cleanup sound and file
   */
  async cleanupSound({ sound, fileUri }) {
    try {
      await sound.unloadAsync();
      
      // Only try to delete if it's a file:// URI (not data URI)
      if (fileUri && fileUri.startsWith('file://')) {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * MIDI note to frequency conversion
   */
  midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Play TR-808 Kick Drum (instant local sample)
   * @param {number} velocity - 0.0 to 1.0
   * @param {string} variant - 'kick_808', 'kick_808_punchy', 'kick_909', 'kick_deep'
   */
  async playKick(velocity = 1.0, variant = 'kick_808') {
    return this.playSample(variant);
  }

  /**
   * Play TR-808 Snare Drum (instant local sample)
   * @param {number} velocity - 0.0 to 1.0
   * @param {string} variant - 'snare_808', 'snare_909', 'snare_clicky'
   */
  async playSnare(velocity = 1.0, variant = 'snare_808') {
    return this.playSample(variant);
  }

  /**
   * Play Hi-Hat (instant local sample)
   * @param {number} velocity - 0.0 to 1.0
   * @param {boolean} open - true for open hi-hat, false for closed
   */
  async playHiHat(velocity = 1.0, open = false) {
    const sampleName = open ? 'hihat_open' : 'hihat_closed';
    return this.playSample(sampleName);
  }

  /**
   * Play Clap (instant local sample)
   * @param {number} velocity - 0.0 to 1.0
   */
  async playClap(velocity = 1.0) {
    return this.playSample('clap');
  }

  /**
   * Play Rimshot (instant local sample)
   */
  async playRimshot(velocity = 1.0) {
    return this.playSample('rimshot');
  }

  /**
   * Play Cowbell (instant local sample)
   */
  async playCowbell(velocity = 1.0) {
    return this.playSample('cowbell');
  }

  /**
   * Play Tom (instant local sample)
   * @param {string} variant - 'tom_low', 'tom_mid', 'tom_high'
   */
  async playTom(variant = 'tom_mid') {
    return this.playSample(variant);
  }

  /**
   * Play Cymbal (instant local sample)
   * @param {string} variant - 'ride', 'crash'
   */
  async playCymbal(variant = 'ride') {
    return this.playSample(variant);
  }

  /**
   * Play ARP 2600 Synth
   */
  async playARP2600(frequency, duration = 0.5, velocity = 1.0, detune = 0.02) {
    // Use local synth lead sample for instant playback
    return this.playSample('lead_A4', SYNTH_SAMPLES);
  }

  /**
   * Play Juno-106 (uses local synth pad sample)
   */
  async playJuno106(frequency, duration = 0.5, velocity = 1.0, detune = 0.01) {
    // Use local synth pad sample for warm analog sound
    return this.playSample('pad_C4', SYNTH_SAMPLES);
  }

  /**
   * Play Minimoog (uses local synth lead sample)
   */
  async playMinimoog(frequency, duration = 0.5, velocity = 1.0, detune = 0.03) {
    // Use local synth lead sample for fat analog lead
    return this.playSample('lead_C5', SYNTH_SAMPLES);
  }

  /**
   * Play TB-303 Bass (uses local acid bass sample)
   */
  async playTB303(frequency, duration = 0.25, velocity = 1.0, accent = false, slide = false, envelope = null, waveform = 'sawtooth') {
    return this.playSample('acid_C2', BASS_SAMPLES);
  }

  /**
   * Play 808 Bass (uses local sub bass sample)
   */
  async playBass808(frequency, duration = 0.5, velocity = 1.0) {
    return this.playSample('sub_C1', BASS_SAMPLES);
  }

  /**
   * Play Reese Bass (uses local growl bass sample)
   */
  async playReeseBass(frequency, duration = 0.5, velocity = 1.0) {
    return this.playSample('growl_low', BASS_SAMPLES);
  }

  /**
   * Play Piano Chord
   */
  async playPianoChord(rootFreq, chordType = 'major', duration = 1.0, velocity = 0.8) {
    return this.playFromBackend(
      '/api/audio/play-chord',
      {
        root_frequency: rootFreq,
        chord_type: chordType,
        instrument: 'piano',
        duration: duration,
        velocity: velocity
      },
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Play Organ Chord
   */
  async playOrganChord(rootFreq, chordType = 'major', duration = 1.0, velocity = 0.8) {
    return this.playFromBackend(
      '/api/audio/play-chord',
      {
        root_frequency: rootFreq,
        chord_type: chordType,
        instrument: 'organ',
        duration: duration,
        velocity: velocity
      },
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Play Synth Chord
   */
  async playSynthChord(rootFreq, chordType = 'major', duration = 1.0, velocity = 0.8) {
    return this.playFromBackend(
      '/api/audio/play-chord',
      {
        root_frequency: rootFreq,
        chord_type: chordType,
        instrument: 'synth',
        duration: duration,
        velocity: velocity
      },
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play brass instruments - Trumpet
   * @param {number} frequency - Frequency in Hz (e.g., 440 for A4)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   */
  async playTrumpet(frequency = 440, duration = 0.5, velocity = 0.8) {
    return this.playFromBackend(
      '/api/audio/play-brass',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'trumpet'
      },
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Play brass instruments - French Horn
   * @param {number} frequency - Frequency in Hz (e.g., 440 for A4)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   */
  async playHorn(frequency = 440, duration = 0.5, velocity = 0.7) {
    return this.playFromBackend(
      '/api/audio/play-brass',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'horn'
      },
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Play brass instruments - Trombone
   * @param {number} frequency - Frequency in Hz (e.g., 220 for A3)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   */
  async playTrombone(frequency = 220, duration = 0.7, velocity = 0.8) {
    return this.playFromBackend(
      '/api/audio/play-brass',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'trombone'
      },
      Haptics.ImpactFeedbackStyle.Heavy
    );
  }

  /**
   * Play string instruments - Violin
   * @param {number} frequency - Frequency in Hz (e.g., 440 for A4)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   * @param {number} vibratoRate - Vibrato rate in Hz (default 5.0)
   * @param {number} vibratoDepth - Vibrato depth 0.0-1.0 (default 0.01)
   */
  async playViolin(frequency = 440, duration = 1.0, velocity = 0.7, vibratoRate = 5.0, vibratoDepth = 0.01) {
    return this.playFromBackend(
      '/api/audio/play-strings',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'violin',
        vibrato_rate: vibratoRate,
        vibrato_depth: vibratoDepth
      },
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play string instruments - Viola
   * @param {number} frequency - Frequency in Hz (e.g., 330 for E4)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   * @param {number} vibratoRate - Vibrato rate in Hz (default 5.0)
   * @param {number} vibratoDepth - Vibrato depth 0.0-1.0 (default 0.01)
   */
  async playViola(frequency = 330, duration = 1.0, velocity = 0.7, vibratoRate = 5.0, vibratoDepth = 0.01) {
    return this.playFromBackend(
      '/api/audio/play-strings',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'viola',
        vibrato_rate: vibratoRate,
        vibrato_depth: vibratoDepth
      },
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play string instruments - Cello
   * @param {number} frequency - Frequency in Hz (e.g., 220 for A3)
   * @param {number} duration - Duration in seconds
   * @param {number} velocity - Velocity (0.0-1.0)
   * @param {number} vibratoRate - Vibrato rate in Hz (default 5.0)
   * @param {number} vibratoDepth - Vibrato depth 0.0-1.0 (default 0.008)
   */
  async playCello(frequency = 220, duration = 1.2, velocity = 0.75, vibratoRate = 5.0, vibratoDepth = 0.008) {
    return this.playFromBackend(
      '/api/audio/play-strings',
      {
        frequency: frequency,
        duration: duration,
        velocity: velocity,
        instrument: 'cello',
        vibrato_rate: vibratoRate,
        vibrato_depth: vibratoDepth
      },
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Cleanup all sounds and temp files
   */
  async cleanup() {
    console.log('🧹 Cleaning up audio engine...');
    
    // Stop and unload all sounds
    for (const soundObj of this.currentSounds) {
      await this.cleanupSound(soundObj);
    }
    this.currentSounds = [];
    
    // Clean up sound pool
    for (const sampleName in this.soundPool) {
      for (const sound of this.soundPool[sampleName]) {
        try {
          await sound.unloadAsync();
        } catch (e) {
          console.warn('Failed to unload sound:', e.message);
        }
      }
    }
    this.soundPool = {};
    
    // Clear cache
    this.soundCache.clear();
    
    console.log('✅ Audio engine cleaned up');
  }

  /**
   * Update backend URL (for development)
   */
  setBackendUrl(url) {
    this.backendUrl = url;
    console.log('🔗 Backend URL updated:', this.backendUrl);
  }

  /**
   * Update kick parameters
   */
  setKickParams(params) {
    this.kickParams = { ...this.kickParams, ...params };
  }

  /**
   * Update ARP 2600 parameters
   */
  setARP2600Params(params) {
    this.arp2600Params = { ...this.arp2600Params, ...params };
  }
}

// Create singleton instance
const pythonAudioEngine = new PythonAudioEngine();

export default pythonAudioEngine;
