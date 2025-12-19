/**
 * HAOS.fm Minimoog Synthesizer Bridge
 * Fat analog bass/lead sound
 */

import webAudioBridge from '../audio/WebAudioBridge';

class MinimoogBridge {
  constructor() {
    this.isInitialized = false;
    
    // Minimoog parameters
    this.cutoff = 800;
    this.resonance = 8;
    this.attack = 0.005;
    this.decay = 0.2;
    this.sustain = 0.7;
    this.release = 0.1;
    this.osc1Level = 0.5;
    this.osc2Level = 0.4;
    this.osc3Level = 0.3;
  }

  async init() {
    console.log('MinimoogBridge: Initializing fat analog synth...');
    
    return new Promise((resolve) => {
      // Check if webAudioBridge is already ready
      if (webAudioBridge.isReady) {
        this.isInitialized = true;
        console.log('✅ Minimoog synth initialized');
        resolve(true);
        return;
      }

      // Wait for webAudioBridge to be ready
      const checkReady = setInterval(() => {
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          console.log('✅ Minimoog synth initialized');
          resolve(true);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isInitialized) {
          console.error('❌ Minimoog initialization timeout');
          resolve(false);
        }
      }, 5000);
    });
  }

  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.warn('MinimoogBridge: Not ready');
      return;
    }

    const velocity = options.velocity !== undefined ? options.velocity : 1.0;
    const accent = options.accent || false;
    const duration = options.duration || 0.3;

    console.log(`🎹 Minimoog: ${note} vel=${velocity.toFixed(2)} accent=${accent}`);

    webAudioBridge.sendMessage({
      type: 'play_minimoog',
      note: note,
      velocity: velocity,
      accent: accent,
      duration: duration,
      cutoff: this.cutoff,
      resonance: this.resonance,
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
      osc1Level: this.osc1Level,
      osc2Level: this.osc2Level,
      osc3Level: this.osc3Level
    });
  }

  setCutoff(value) {
    if (!this.isInitialized) return;
    this.cutoff = Math.max(20, Math.min(10000, value));
  }

  setResonance(value) {
    if (!this.isInitialized) return;
    this.resonance = Math.max(0, Math.min(20, value));
  }

  setOscMix(osc1, osc2, osc3) {
    if (!this.isInitialized) return;
    this.osc1Level = Math.max(0, Math.min(1, osc1));
    this.osc2Level = Math.max(0, Math.min(1, osc2));
    this.osc3Level = Math.max(0, Math.min(1, osc3));
  }

  setEnvelope(attack, decay, sustain, release) {
    if (!this.isInitialized) return;
    this.attack = Math.max(0.001, Math.min(2, attack));
    this.decay = Math.max(0.01, Math.min(2, decay));
    this.sustain = Math.max(0, Math.min(1, sustain));
    this.release = Math.max(0.01, Math.min(5, release));
  }
}

export default MinimoogBridge;
