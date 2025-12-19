/**
 * HAOS.fm Behringer TD-3 Bass Synthesizer (Native)
 * More aggressive 303 clone with enhanced modulation
 * Sample-based synthesis using expo-av
 */

import { Audio } from 'expo-av';

class TD3 {
  constructor() {
    this.sounds = new Map();
    this.isLoaded = false;
    
    // TD-3 parameters (more aggressive than TB-303)
    this.cutoff = 0.6;
    this.resonance = 0.8; // Higher default resonance
    this.envMod = 0.9; // More envelope modulation
    this.decay = 0.25; // Snappier decay
    this.accent = 0.7; // Stronger accent
    this.waveform = 'saw';
    this.distortion = 0.2; // TD-3 has slight overdrive
    
    // Note frequency map
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
    
    this.baseFrequency = 65.41;
  }
  
  /**
   * Load bass samples
   */
  async init() {
    try {
      console.log('TD-3: Loading bass samples...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Load samples (same as TB-303 but processed differently)
      const sawSound = new Audio.Sound();
      await sawSound.loadAsync(require('../../assets/audio/bass_saw.mp3'));
      this.sounds.set('saw', sawSound);
      
      const squareSound = new Audio.Sound();
      await squareSound.loadAsync(require('../../assets/audio/bass_square.mp3'));
      this.sounds.set('square', squareSound);
      
      this.isLoaded = true;
      console.log('TD-3: Samples loaded successfully');
    } catch (error) {
      console.error('TD-3: Failed to load samples:', error);
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
   * Play a note with aggressive modulation
   */
  async playNote(note, options = {}) {
    if (!this.isLoaded) {
      console.warn('TD-3: Not initialized');
      return;
    }
    
    const {
      velocity = 1.0,
      accent = false,
      slide = false,
      duration = 0.15,
    } = options;
    
    try {
      const sound = this.sounds.get(this.waveform);
      if (!sound) return;
      
      const pitchRate = this.calculatePitchRate(note);
      
      // TD-3 has more aggressive envelope modulation
      const envModAmount = this.envMod * (accent ? this.accent * 1.3 : 0.4);
      const pitchEnvelope = pitchRate * (1 + envModAmount);
      
      // Clone sound
      const noteSound = new Audio.Sound();
      await noteSound.loadAsync(this.sounds.get(this.waveform)._uri || require('../../assets/audio/bass_saw.mp3'));
      
      // TD-3 volume is punchier
      const volume = velocity * (accent ? 1.3 : 0.95) * (1 + this.distortion * 0.2);
      await noteSound.setVolumeAsync(Math.min(volume, 1.0));
      
      // Start with aggressive pitch envelope
      await noteSound.setRateAsync(pitchEnvelope, Audio.PitchCorrectionQuality.High);
      await noteSound.playAsync();
      
      // Snap back faster than TB-303
      if (!slide) {
        setTimeout(async () => {
          try {
            await noteSound.setRateAsync(pitchRate * (1 + this.resonance * 0.1), Audio.PitchCorrectionQuality.High);
          } catch (e) {}
        }, this.decay * 80); // Faster than TB-303
      }
      
      // Secondary envelope for TD-3 character
      setTimeout(async () => {
        try {
          await noteSound.setRateAsync(pitchRate, Audio.PitchCorrectionQuality.High);
        } catch (e) {}
      }, this.decay * 150);
      
      // Stop
      setTimeout(async () => {
        try {
          await noteSound.stopAsync();
          await noteSound.unloadAsync();
        } catch (e) {}
      }, duration * 1000);
      
    } catch (error) {
      console.error('TD-3: Error playing note:', error);
    }
  }
  
  /**
   * Set waveform
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
   * Set distortion amount (0-1)
   */
  setDistortion(value) {
    this.distortion = Math.max(0, Math.min(1, value));
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
      } catch (e) {}
    }
    this.sounds.clear();
    this.isLoaded = false;
  }
}

export default TD3;
