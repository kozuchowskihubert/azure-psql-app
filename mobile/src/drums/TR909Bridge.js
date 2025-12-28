import webAudioBridge from '../services/WebAudioBridge';
import * as Haptics from 'expo-haptics';

class TR909Bridge {
  constructor() {
    this.isInitialized = false;
    
    // TR-909 has harder, more aggressive sound than 808
    this.params = {
      kickPitch: 80,      // Higher starting pitch (harder attack)
      kickDecay: 0.3,     // Shorter decay (punchier)
      snareTone: 180,     // Slightly lower tone
      snareNoise: 0.85,   // More noise (snappier)
      hihatDecay: 0.03,   // Even shorter (tighter)
    };
  }

  async init() {
    console.log('TR909Bridge: Initializing...');
    
    try {
      // Wait for WebAudioBridge to be ready
      if (!webAudioBridge.isReady) {
        console.log('TR909Bridge: Waiting for WebAudioBridge...');
        // WebView will be initialized by the screen component
      }
      this.isInitialized = true;
      console.log('TR909Bridge: Initialized successfully with WebAudioBridge');
      return true;
    } catch (error) {
      console.error('TR909Bridge: Initialization error:', error);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  updateAllParams() {
    console.log('TR909Bridge: updateAllParams', this.params);
    // Parameters are stored and will be used in play methods
  }

  playKick(velocity = 1.0) {
    console.log(`🥁 TR-909 Kick: velocity=${velocity} (harder attack, WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playKick({
        pitch: this.params.kickPitch,
        decay: this.params.kickDecay,
        velocity: velocity * 1.1, // Slightly louder for 909 punch
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  playSnare(velocity = 1.0) {
    console.log(`🥁 TR-909 Snare: velocity=${velocity} (snappier, WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playSnare({
        tone: this.params.snareTone,
        velocity: velocity * 1.15, // Louder, more aggressive
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  playHihat(velocity = 1.0, open = false) {
    console.log(`🥁 TR-909 Hi-hat: velocity=${velocity}, open=${open} (tighter, WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playHiHat({
        decay: open ? 0.2 : this.params.hihatDecay,
        velocity: velocity * 1.2, // Brighter, more present
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  playClap(velocity = 1.0) {
    console.log(`🥁 TR-909 Clap: velocity=${velocity} (WebAudio)`);
    if (webAudioBridge.isReady) {
      webAudioBridge.playClap();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Parameter setters for TR-909
  setKickPitch(pitch) {
    this.params.kickPitch = pitch;
    console.log('TR-909: setKickPitch', pitch);
    // TODO: Apply to native synthesis
  }

  setKickDecay(decay) {
    this.params.kickDecay = decay;
    console.log('TR-909: setKickDecay', decay);
    // TODO: Apply to native synthesis
  }

  setSnareTone(tone) {
    this.params.snareTone = tone;
    console.log('TR-909: setSnareTone', tone);
    // TODO: Apply to native synthesis
  }

  setSnareNoise(noise) {
    this.params.snareNoise = noise;
    console.log('TR-909: setSnareNoise', noise);
    // TODO: Apply to native synthesis
  }

  setHihatDecay(decay) {
    this.params.hihatDecay = decay;
    console.log('TR-909: setHihatDecay', decay);
    // TODO: Apply to native synthesis
  }

  stopAll() {
    console.log('TR-909: stopAll');
    // TODO: Implement stop all voices
  }
}

// Export a singleton instance
const tr909Bridge = new TR909Bridge();
export default tr909Bridge;
