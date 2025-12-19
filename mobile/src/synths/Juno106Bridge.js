/**
 * HAOS.fm Juno-106 Synthesizer Bridge
 * Warm chorus ensemble sound
 */

import webAudioBridge from '../audio/WebAudioBridge';

class Juno106Bridge {
  constructor() {
    this.isInitialized = false;
    
    // Juno-106 parameters
    this.cutoff = 1200;
    this.resonance = 2;
    this.attack = 0.03;
    this.decay = 0.4;
    this.sustain = 0.6;
    this.release = 0.3;
    this.chorusDepth = 0.005; // Detune amount for chorus
  }

  async init() {
    return new Promise((resolve) => {
      console.log('Juno106Bridge: Initializing warm chorus synth...');
      
      // Check if already ready
      if (webAudioBridge.isReady) {
        this.isInitialized = true;
        
        // Send initial parameters
        webAudioBridge.sendMessage({
          type: 'update_params',
          params: {
            juno106_cutoff: this.cutoff,
            juno106_resonance: this.resonance,
          }
        });
        
        console.log('Juno106Bridge: Initialized - warm chorus ensemble ready');
        resolve(true);
        return;
      }

      // Wait for ready message
      const checkReady = setInterval(() => {
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          
          // Send initial parameters
          webAudioBridge.sendMessage({
            type: 'update_params',
            params: {
              juno106_cutoff: this.cutoff,
              juno106_resonance: this.resonance,
            }
          });
          
          console.log('Juno106Bridge: Initialized - warm chorus ensemble ready');
          resolve(true);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!this.isInitialized) {
          console.error('Juno106Bridge: Initialization timeout');
          resolve(false);
        }
      }, 5000);
    });
  }

  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.error('Juno106Bridge: Not initialized');
      return;
    }

    const velocity = options.velocity !== undefined ? options.velocity : 1.0;
    const accent = options.accent || false;
    const duration = options.duration || 0.3;

    console.log(`🎹 Juno-106: ${note} vel=${velocity.toFixed(2)} accent=${accent}`);

    webAudioBridge.sendMessage({
      type: 'play_juno106',
      note: note,
      velocity: velocity,
      accent: accent,
      duration: duration
    });
  }

  setCutoff(value) {
    this.cutoff = value;
    if (this.isInitialized) {
      webAudioBridge.sendMessage({
        type: 'update_params',
        params: { juno106_cutoff: value }
      });
    }
  }

  setResonance(value) {
    this.resonance = value;
    if (this.isInitialized) {
      webAudioBridge.sendMessage({
        type: 'update_params',
        params: { juno106_resonance: value }
      });
    }
  }

  setChorusDepth(value) {
    this.chorusDepth = value;
    if (this.isInitialized) {
      webAudioBridge.sendMessage({
        type: 'update_params',
        params: { juno106_chorus_depth: value }
      });
    }
  }

  setEnvelope(attack, decay, sustain, release) {
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
    if (this.isInitialized) {
      webAudioBridge.sendMessage({
        type: 'update_params',
        params: {
          juno106_attack: attack,
          juno106_decay: decay,
          juno106_sustain: sustain,
          juno106_release: release
        }
      });
    }
  }
}

export default Juno106Bridge;
