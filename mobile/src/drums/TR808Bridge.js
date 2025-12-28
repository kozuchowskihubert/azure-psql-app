import webAudioBridge from '../services/WebAudioBridge';
import * as Haptics from 'expo-haptics';

class TR808Bridge {
  constructor() {
    this.isInitialized = false;
    this.kickParams = { pitch: 150, decay: 0.3 };
    this.snareParams = { tone: 0.2 };
    this.hihatParams = { decay: 0.05 };
  }

  async init() {
    console.log('TR808Bridge: Initializing...');
    
    try {
      // Wait for WebAudioBridge to be ready
      if (!webAudioBridge.isReady) {
        console.log('TR808Bridge: Waiting for WebAudioBridge...');
        // WebView will be initialized by the screen component
      }
      this.isInitialized = true;
      console.log('TR808Bridge: Initialized successfully with WebAudioBridge');
      return true;
    } catch (error) {
      console.error('TR808Bridge: Initialization error:', error);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  playKick(velocity = 1.0) {
    console.log(`🥁 TR-808 Kick: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playKick({
        ...this.kickParams,
        velocity,
      });
    } else {
      // Fallback to haptics
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  playSnare(velocity = 1.0) {
    console.log(`🥁 TR-808 Snare: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playSnare({
        ...this.snareParams,
        velocity,
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  playHihat(velocity = 1.0, open = false) {
    console.log(`🥁 TR-808 Hi-hat: velocity=${velocity}, open=${open} (WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playHiHat({
        ...this.hihatParams,
        decay: open ? 0.2 : this.hihatParams.decay,
        velocity,
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playClap(velocity = 1.0) {
    console.log(`🥁 TR-808 Clap: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playClap();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Parameter setters for TR-808 (TODO: implement native parameter control)
  setKickPitch(pitch) {
    console.log('TR-808: setKickPitch', pitch);
    // TODO: Store parameters for synthesis
  }

  setKickDecay(decay) {
    console.log('TR-808: setKickDecay', decay);
    // TODO: Store parameters for synthesis
  }

  setSnareTone(tone) {
    console.log('TR-808: setSnareTone', tone);
    // TODO: Store parameters for synthesis
  }

  setSnareNoise(noise) {
    console.log('TR-808: setSnareNoise', noise);
    // TODO: Store parameters for synthesis
  }

  setHihatDecay(decay) {
    console.log('TR-808: setHihatDecay', decay);
    // TODO: Store parameters for synthesis
  }

  stopAll() {
    console.log('TR-808: stopAll');
    // TODO: Implement stop all voices
  }
}

// Export a singleton instance
const tr808Bridge = new TR808Bridge();
export default tr808Bridge;
