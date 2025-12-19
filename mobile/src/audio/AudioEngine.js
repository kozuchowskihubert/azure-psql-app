/**
 * HAOS.fm Audio Engine
 * Uses expo-av for sound playback with preloaded drum samples
 * Works reliably on iOS and Android
 */

import { Audio } from 'expo-av';

// Base URL for drum samples from HAOS web
const SAMPLE_BASE_URL = 'https://haos.fm/audio/drums';

// Sample URLs (from free sources that work)
const DRUM_SAMPLES = {
  // TR-808 samples
  '808_kick': 'https://freesound.org/data/previews/171/171104_2394245-lq.mp3',
  '808_snare': 'https://freesound.org/data/previews/270/270156_1125482-lq.mp3', 
  '808_hihat': 'https://freesound.org/data/previews/250/250547_1676145-lq.mp3',
  '808_clap': 'https://freesound.org/data/previews/131/131139_2398403-lq.mp3',
  
  // TR-909 samples  
  '909_kick': 'https://freesound.org/data/previews/170/170141_3127663-lq.mp3',
  '909_snare': 'https://freesound.org/data/previews/171/171103_2394245-lq.mp3',
  '909_hihat': 'https://freesound.org/data/previews/250/250546_1676145-lq.mp3',
  '909_clap': 'https://freesound.org/data/previews/131/131138_2398403-lq.mp3',
};

class AudioEngine {
  constructor() {
    this.isReady = false;
    this.samples = new Map();
    this.masterVolume = 0.8;
    this.activeSounds = new Set();
  }

  /**
   * Initialize the audio system
   */
  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Preload some samples
      await this.preloadSamples(['808_kick', '808_snare', '808_hihat', '808_clap']);
      
      this.isReady = true;
      console.log('🔊 HAOS Audio Engine initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Preload samples
   */
  async preloadSamples(sampleNames) {
    for (const name of sampleNames) {
      const url = DRUM_SAMPLES[name];
      if (url) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false }
          );
          this.samples.set(name, sound);
          console.log(`✓ Loaded sample: ${name}`);
        } catch (e) {
          console.warn(`Failed to load sample ${name}:`, e.message);
        }
      }
    }
  }

  /**
   * Play a preloaded sample
   */
  async playSample(name, options = {}) {
    const { volume = 1.0, rate = 1.0 } = options;
    
    try {
      // If sample is preloaded, use it
      if (this.samples.has(name)) {
        const sound = this.samples.get(name);
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(volume * this.masterVolume);
        await sound.setRateAsync(rate, true);
        await sound.playAsync();
        return;
      }
      
      // Otherwise create new sound from URL
      const url = DRUM_SAMPLES[name];
      if (url) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          {
            volume: volume * this.masterVolume,
            rate,
            shouldPlay: true,
          }
        );
        
        // Cache for future use
        this.samples.set(name, sound);
      }
    } catch (error) {
      console.error(`Failed to play sample ${name}:`, error);
    }
  }

  /**
   * Play sound from a URL
   */
  async playFromUrl(url, options = {}) {
    try {
      const { volume = 1.0, rate = 1.0, loop = false } = options;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          volume: volume * this.masterVolume,
          rate,
          shouldPlay: true,
          isLooping: loop,
        }
      );
      
      this.activeSounds.add(sound);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish && !loop) {
          sound.unloadAsync();
          this.activeSounds.delete(sound);
        }
      });
      
      return sound;
    } catch (error) {
      console.error('Failed to play sound:', error);
      return null;
    }
  }

  /**
   * Generate and play a simple tone using Audio
   * Note: This is a basic implementation using expo-av
   */
  async playTone(frequency, duration = 0.1, options = {}) {
    // expo-av doesn't support oscillators directly
    // For now, we'll use samples for all sounds
    // A more advanced implementation would use react-native-oboe or similar
    console.log(`Tone request: ${frequency}Hz for ${duration}s`);
  }

  /**
   * Stop all active sounds
   */
  async stopAll() {
    for (const sound of this.activeSounds) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    this.activeSounds.clear();
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get ready status
   */
  getIsReady() {
    return this.isReady;
  }

  /**
   * Cleanup
   */
  async destroy() {
    await this.stopAll();
    for (const sound of this.samples.values()) {
      try {
        await sound.unloadAsync();
      } catch (e) {}
    }
    this.samples.clear();
    this.isReady = false;
  }
}

// Singleton
const audioEngine = new AudioEngine();

export default audioEngine;
export { AudioEngine, DRUM_SAMPLES };
