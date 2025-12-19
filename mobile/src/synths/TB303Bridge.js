/**
 * HAOS.fm TB-303 Bass Synthesizer (WebView Bridge)
 * Uses Web Audio API running in hidden WebView
 * Full analog-style synthesis with filter modulation
 */

import webAudioBridge from '../audio/WebAudioBridge';

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
   * Initialize (wait for bridge to be ready)
   */
  async init() {
    return new Promise((resolve) => {
      // Check if already ready
      if (webAudioBridge.isReady) {
        this.isInitialized = true;
        console.log('TB-303 Bridge: Ready immediately');
        resolve(true);
        return;
      }

      // Wait for ready message
      const checkReady = setInterval(() => {
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          console.log('TB-303 Bridge: Ready');
          this.updateBridgeParams();
          resolve(true);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isInitialized) {
          console.error('TB-303 Bridge: Timeout waiting for ready');
          resolve(false);
        }
      }, 5000);
    });
  }

  /**
   * Play a note
   */
  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.warn('TB-303 Bridge: Not initialized');
      return;
    }

    const {
      velocity = 1.0,
      accent = false,
      duration = 0.2,
    } = options;

    webAudioBridge.playNote(note, { velocity, accent, duration });
  }

  /**
   * Update parameters in bridge
   */
  updateBridgeParams() {
    webAudioBridge.updateParams({
      cutoff: this.cutoff,
      resonance: this.resonance,
      envMod: this.envMod,
      decay: this.decay,
      accent: this.accent,
      waveform: this.waveform,
    });
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
    webAudioBridge.stopAll();
  }

  /**
   * Cleanup
   */
  async cleanup() {
    this.isInitialized = false;
  }
}

export default TB303Bridge;
