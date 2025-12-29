/**
 * HAOS.fm Python Audio Engine Client
 * Uses bundled WAV samples for instant offline playback
 * Falls back to Python backend for synth sounds
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

// Bundled drum samples (pre-generated WAV files)
const DRUM_SAMPLES = {
  // Kicks
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

class PythonAudioEngine {
  constructor() {
    // Backend URL - for synth sounds only (drums use local samples)
    this.backendUrl = 'http://192.168.1.6:8000';
    
    this.isInitialized = false;
    this.soundCache = new Map();
    this.loadedSamples = {}; // Pre-loaded Audio.Sound objects for instant playback
    this.currentSounds = [];
    this.maxCachedSounds = 20;
    
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
   * Preload bundled drum samples for instant playback (no network latency!)
   */
  async preloadDrumSamples() {
    const essentialSamples = [
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

    for (const sampleName of essentialSamples) {
      try {
        const sample = DRUM_SAMPLES[sampleName];
        if (sample) {
          const { sound } = await Audio.Sound.createAsync(sample, { shouldPlay: false });
          this.loadedSamples[sampleName] = sound;
          console.log(`  ✅ Loaded: ${sampleName}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Failed to load ${sampleName}:`, error.message);
      }
    }
    
    console.log(`🥁 Loaded ${Object.keys(this.loadedSamples).length} drum samples`);
  }

  /**
   * Play a bundled sample (instant, no network latency)
   */
  async playSample(sampleName) {
    try {
      // If sample is preloaded, replay it
      if (this.loadedSamples[sampleName]) {
        const sound = this.loadedSamples[sampleName];
        await sound.setPositionAsync(0);
        await sound.playAsync();
        return sound;
      }
      
      // Otherwise, load and play on demand
      const sample = DRUM_SAMPLES[sampleName];
      if (!sample) {
        console.warn(`⚠️ Unknown sample: ${sampleName}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return null;
      }
      
      const { sound } = await Audio.Sound.createAsync(sample, { shouldPlay: true });
      
      // Auto-unload after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      return sound;
    } catch (error) {
      console.warn(`⚠️ Playback error for ${sampleName}:`, error.message);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return null;
    }
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
    const params = {
      frequency,
      duration,
      velocity,
      detune,
      attack: this.arp2600Params.attack,
      decay: this.arp2600Params.decay,
      sustain: this.arp2600Params.sustain,
      release: this.arp2600Params.release,
      filter_cutoff: this.arp2600Params.filter_cutoff,
      filter_resonance: this.arp2600Params.filter_resonance,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play Juno-106 (uses ARP 2600 engine with different settings)
   */
  async playJuno106(frequency, duration = 0.5, velocity = 1.0, detune = 0.01) {
    console.log('🎹 Juno-106 - ' + frequency + ' Hz');
    
    const params = {
      frequency,
      duration,
      velocity,
      detune,
      attack: 0.02,
      decay: 0.2,
      sustain: 0.6,
      release: 0.3,
      filter_cutoff: 3000.0,
      filter_resonance: 0.8,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play Minimoog (uses ARP 2600 engine with different settings)
   */
  async playMinimoog(frequency, duration = 0.5, velocity = 1.0, detune = 0.03) {
    console.log('🎵 Minimoog - ' + frequency + ' Hz');
    
    const params = {
      frequency,
      duration,
      velocity,
      detune,
      attack: 0.005,
      decay: 0.15,
      sustain: 0.8,
      release: 0.1,
      filter_cutoff: 1500.0,
      filter_resonance: 1.5,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play TB-303 Bass (uses ARP 2600 engine with bass settings)
   */
  async playTB303(frequency, duration = 0.25, velocity = 1.0, accent = false, slide = false, envelope = null, waveform = 'sawtooth') {
    console.log('💚 TB-303 - ' + frequency + ' Hz');
    
    const params = {
      frequency,
      duration,
      velocity: accent ? velocity * 1.5 : velocity,
      detune: 0.0,
      attack: slide ? 0.05 : 0.005,
      decay: 0.05,
      sustain: 0.5,
      release: 0.05,
      filter_cutoff: accent ? 3000.0 : 1200.0,
      filter_resonance: 2.0,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Light
    );
  }

  /**
   * Play 808 Bass (uses synth engine with bass settings)
   */
  async playBass808(frequency, duration = 0.5, velocity = 1.0) {
    console.log('🎸 808 Bass - ' + frequency + ' Hz');
    
    const params = {
      frequency,
      duration,
      velocity,
      detune: 0.0,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.3,
      release: 0.1,
      filter_cutoff: 800.0,
      filter_resonance: 1.2,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Medium
    );
  }

  /**
   * Play Reese Bass (uses synth engine with heavy detune)
   */
  async playReeseBass(frequency, duration = 0.5, velocity = 1.0) {
    console.log('🔊 Reese Bass - ' + frequency + ' Hz');
    
    const params = {
      frequency,
      duration,
      velocity,
      detune: 0.08, // Heavy detune for Reese character
      attack: 0.02,
      decay: 0.2,
      sustain: 0.7,
      release: 0.2,
      filter_cutoff: 600.0,
      filter_resonance: 1.8,
    };
    
    return this.playFromBackend(
      '/api/audio/play-synth',
      params,
      Haptics.ImpactFeedbackStyle.Medium
    );
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
