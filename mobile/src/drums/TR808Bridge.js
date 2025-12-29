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
      webAudioBridge.playClap({ velocity });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  playRimshot(velocity = 1.0) {
    console.log(`🥁 TR-808 Rimshot: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      // Rimshot uses a pitched noise with fast decay
      webAudioBridge.playSnare({
        tone: 0.8,
        pitch: 800,
        decay: 0.08,
        velocity,
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playCowbell(velocity = 1.0) {
    console.log(`🥁 TR-808 Cowbell: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      // Cowbell uses oscillators in the classic 540Hz/800Hz band
      webAudioBridge.sendCommand('playCowbell', { velocity });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playCymbal(velocity = 1.0) {
    console.log(`🥁 TR-808 Cymbal: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      // Cymbal uses bandpass-filtered noise
      webAudioBridge.sendCommand('playCymbal', { velocity });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playTom(velocity = 1.0) {
    console.log(`🥁 TR-808 Tom: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      // Tom uses pitched oscillator with decay
      webAudioBridge.sendCommand('playTom', { velocity, pitch: 120, decay: 0.4 });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Parameter setters for TR-808
  setKickPitch(pitch) {
    console.log('TR-808: setKickPitch', pitch);
    this.kickParams.pitch = pitch;
  }

  setKickDecay(decay) {
    console.log('TR-808: setKickDecay', decay);
    this.kickParams.decay = decay;
  }

  setSnareTone(tone) {
    console.log('TR-808: setSnareTone', tone);
    this.snareParams.tone = tone;
  }

  setSnareNoise(noise) {
    console.log('TR-808: setSnareNoise', noise);
    this.snareParams.noise = noise;
  }

  setHihatDecay(decay) {
    console.log('TR-808: setHihatDecay', decay);
    this.hihatParams.decay = decay;
  }

  stopAll() {
    console.log('TR-808: stopAll');
    // TODO: Implement stop all voices
  }
}

// Export a singleton instance
const tr808Bridge = new TR808Bridge();
export default tr808Bridge;
