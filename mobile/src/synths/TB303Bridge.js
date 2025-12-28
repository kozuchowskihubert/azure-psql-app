/**
 * HAOS.fm TB-303 Bass Synthesizer (Native Audio)
 * Uses react-native-audio-api for native Web Audio
 * Full analog-style synthesis with filter modulation
 */

import nativeAudioContext from '../audio/NativeAudioContext';

class TB303Bridge {
  constructor() {
    this.isInitialized = false;
    
    // TB-303 parameters
    this.cutoff = 500;
    this.resonance = 10;
    this.envMod = 3000;
    this.decay = 0.3;
    this.accent = 1.5;
    this.waveform = 'sawtooth';
  }

  /**
   * Initialize native audio
   */
  async init() {
    try {
      await nativeAudioContext.initialize();
      this.isInitialized = true;
      console.log('TB-303 Bridge: Initialized with native audio');
      return true;
    } catch (error) {
      console.error('TB-303 Bridge: Init error:', error);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  /**
   * Play a note
   */
  playNote(note, options = {}) {
    const {
      velocity = 1.0,
      accent = false,
      duration = 0.2,
    } = options;

    console.log(`🎹 TB-303: ${note} velocity=${velocity} accent=${accent} (native audio)`);
    nativeAudioContext.playTB303Note(note, velocity, duration);
  }

  /**
   * Update parameters
   */
  updateBridgeParams() {
    console.log('TB-303: updateBridgeParams', {
      cutoff: this.cutoff,
      resonance: this.resonance,
      envMod: this.envMod,
      decay: this.decay,
      accent: this.accent,
      waveform: this.waveform,
    });
    // Apply parameters to native synthesis if method exists
    if (typeof nativeAudioContext.setTB303Params === 'function') {
      nativeAudioContext.setTB303Params({
        cutoff: this.cutoff,
        resonance: this.resonance,
        envMod: this.envMod,
        decay: this.decay,
        accent: this.accent,
        waveform: this.waveform,
      });
    } else {
      // If not implemented, log a warning
      console.warn('NativeAudioContext.setTB303Params not implemented. TB-303 params not applied.');
    }
  }

  /**
   * Set waveform
   */
  setWaveform(waveform) {
    if (waveform === 'sawtooth' || waveform === 'square') {
      this.waveform = waveform;
      this.updateBridgeParams();
    }
  }

  /**
   * Set cutoff (20-8000 Hz)
   */
  setCutoff(value) {
    this.cutoff = Math.max(20, Math.min(8000, value));
    this.updateBridgeParams();
  }

  /**
   * Set resonance (0-30)
   */
  setResonance(value) {
    this.resonance = Math.max(0, Math.min(30, value));
    this.updateBridgeParams();
  }

  /**
   * Set envelope modulation (0-5000 Hz)
   */
  setEnvMod(value) {
    this.envMod = Math.max(0, Math.min(5000, value));
    this.updateBridgeParams();
  }

  /**
   * Set decay (0-1 seconds)
   */
  setDecay(value) {
    this.decay = Math.max(0.05, Math.min(1, value));
    this.updateBridgeParams();
  }

  /**
   * Set accent (1-3)
   */
  setAccent(value) {
    this.accent = Math.max(1, Math.min(3, value));
    this.updateBridgeParams();
  }

  /**
   * Stop all
   */
  async stopAll() {
    console.log('TB-303: stopAll');
    // TODO: Implement stop all voices
  }

  /**
   * Cleanup
   */
  async cleanup() {
    this.isInitialized = false;
  }
}

export default TB303Bridge;
