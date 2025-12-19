/**
 * HAOS.fm TB-303 Bass Synthesizer (Native)
 * Iconic acid bass sound with pitch modulation and resonance
 * Sample-based synthesis using expo-av
 */

import { Audio } from 'expo-av';

class TB303 {
  constructor() {
    this.sounds = new Map();
    this.isLoaded = false;
    
    // TB-303 parameters
    this.cutoff = 0.5; // 0-1 (simulated with pitch)
    this.resonance = 0.7; // 0-1 (simulated with accent)
    this.envMod = 0.8; // Envelope modulation amount
    this.decay = 0.3; // Envelope decay time
    this.accent = 0.5; // Accent intensity
    this.waveform = 'saw'; // 'saw' or 'square'
    
    // Note frequency map (MIDI note to frequency in Hz)
    this.noteFrequencies = {
      'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89,
      'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00,
      'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
      'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
      'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
      'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    };
    
    // Base frequency for pitch shifting (C2)
    this.baseFrequency = 65.41;
  }
  
  /**
   * Load bass samples
   */
  async init() {
    try {
      console.log('TB-303: Loading bass samples...');
      
      // Configure audio mode for Bluetooth support
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Load sawtooth and square bass samples
      const sawSound = new Audio.Sound();
      await sawSound.loadAsync(require('../../assets/audio/bass_saw.mp3'));
      this.sounds.set('saw', sawSound);
      
      const squareSound = new Audio.Sound();
      await squareSound.loadAsync(require('../../assets/audio/bass_square.mp3'));
      this.sounds.set('square', squareSound);
      
      this.isLoaded = true;
      console.log('TB-303: Samples loaded successfully');
    } catch (error) {
      console.error('TB-303: Failed to load samples:', error);
    }
  }
  
  /**
   * Calculate pitch rate for a given note
   */
  calculatePitchRate(note) {
    const targetFreq = this.noteFrequencies[note] || this.baseFrequency;
    return targetFreq / this.baseFrequency;
  }
  
  /**
   * Play a note with modulation
   */
  async playNote(note, options = {}) {
    if (!this.isLoaded) {
      console.warn('TB-303: Not initialized');
      return;
    }
    
    const {
      velocity = 1.0,
      accent = false,
      slide = false,
      duration = 0.15,
    } = options;
    
    console.log(`TB-303: Playing ${note} (velocity: ${velocity}, accent: ${accent})`);
    
    try {
      // Get the sound for current waveform
      const sound = this.sounds.get(this.waveform);
      if (!sound) {
        console.warn('TB-303: No sound loaded for waveform:', this.waveform);
        return;
      }
      
      // Calculate pitch rate
      const pitchRate = this.calculatePitchRate(note);
      
      // Apply envelope modulation to pitch (303 signature sound)
      const envModAmount = this.envMod * (accent ? this.accent : 0.3);
      const pitchEnvelope = pitchRate * (1 + envModAmount);
      
      // Use the main sound and replay it
      const volume = velocity * (accent ? 1.2 : 0.9);
      await sound.setVolumeAsync(Math.min(volume, 1.0));
      
      // Start with pitch envelope
      await sound.setRateAsync(pitchEnvelope, Audio.PitchCorrectionQuality.High);
      
      // Rewind and play
      await sound.setPositionAsync(0);
      await sound.playAsync();
      
      // Decay to normal pitch (303 envelope)
      if (!slide) {
        setTimeout(async () => {
          try {
            await sound.setRateAsync(pitchRate, Audio.PitchCorrectionQuality.High);
          } catch (e) {
            // Sound may have finished
          }
        }, this.decay * 100);
      }
      
      // Stop after duration
      setTimeout(async () => {
        try {
          await sound.stopAsync();
        } catch (e) {
          // Already stopped
        }
      }, duration * 1000);
      
    } catch (error) {
      console.error('TB-303: Error playing note:', error);
    }
  }
  
  /**
   * Set waveform (saw or square)
   */
  setWaveform(waveform) {
    if (waveform === 'saw' || waveform === 'square') {
      this.waveform = waveform;
    }
  }
  
  /**
   * Set cutoff frequency (0-1)
   */
  setCutoff(value) {
    this.cutoff = Math.max(0, Math.min(1, value));
  }
  
  /**
   * Set resonance (0-1)
   */
  setResonance(value) {
    this.resonance = Math.max(0, Math.min(1, value));
  }
  
  /**
   * Set envelope modulation amount (0-1)
   */
  setEnvMod(value) {
    this.envMod = Math.max(0, Math.min(1, value));
  }
  
  /**
   * Set decay time (0-1)
   */
  setDecay(value) {
    this.decay = Math.max(0, Math.min(1, value));
  }
  
  /**
   * Set accent intensity (0-1)
   */
  setAccent(value) {
    this.accent = Math.max(0, Math.min(1, value));
  }
  
  /**
   * Stop all sounds
   */
  async stopAll() {
    // Individual notes stop themselves
  }
  
  /**
   * Cleanup
   */
  async cleanup() {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (e) {
        // Already unloaded
      }
    }
    this.sounds.clear();
    this.isLoaded = false;
  }
}

export default TB303;
