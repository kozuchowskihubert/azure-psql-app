/**
 * TR808BridgeTone - Roland TR-808 using Tone.js
 * Much simpler than WebView approach
 */

import expoAudioBridge from '../services/ExpoAudioBridge';

class TR808BridgeTone {
  constructor() {
    this.isReady = false;
    console.log('🥁 TR808BridgeTone initializing...');
    this.init();
  }

  async init() {
    try {
      // Initialize audio if not already done
      if (!expoAudioBridge.isReady) {
        await expoAudioBridge.initAudio();
      }
      
      this.isReady = true;
      console.log('✅ TR-808 ready (Tone.js)');
    } catch (error) {
      console.error('❌ TR-808 init failed:', error);
    }
  }

  // TR-808 Drum sounds
  playKick() {
    expoAudioBridge.playKick();
  }

  playSnare() {
    expoAudioBridge.playSnare();
  }

  playClosedHat() {
    expoAudioBridge.playHihat(false);
  }

  playOpenHat() {
    expoAudioBridge.playHihat(true);
  }

  playCymbal() {
    expoAudioBridge.playCymbal();
  }

  playClap() {
    expoAudioBridge.playClap();
  }

  playLowTom() {
    expoAudioBridge.playTom(3);
  }

  playMidTom() {
    expoAudioBridge.playTom(2);
  }

  playHighTom() {
    expoAudioBridge.playTom(1);
  }

  playCowbell() {
    expoAudioBridge.playHihat(true); // Placeholder
  }

  // Cleanup
  destroy() {
    this.isReady = false;
  }
}

export default TR808BridgeTone;
