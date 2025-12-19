import webAudioBridge from '../audio/WebAudioBridge';

export default class TR808Bridge {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    console.log('TR808Bridge: Initializing...');
    
    // Wait for WebAudio bridge to be ready
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkReady = setInterval(() => {
        attempts++;
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          console.log('TR808Bridge: Initialized successfully');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkReady);
          console.error('TR808Bridge: Initialization timeout');
          reject(new Error('TR808Bridge initialization timeout'));
        }
      }, 100);
    });
  }

  playKick(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR808Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-808 Kick: velocity=${velocity}`);
    webAudioBridge.sendMessage({
      type: 'play_kick',
      velocity: velocity
    });
  }

  playSnare(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR808Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-808 Snare: velocity=${velocity}`);
    webAudioBridge.sendMessage({
      type: 'play_snare',
      velocity: velocity
    });
  }

  playHihat(velocity = 1.0, open = false) {
    if (!this.isInitialized) {
      console.warn('TR808Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-808 Hi-hat: velocity=${velocity}, open=${open}`);
    webAudioBridge.sendMessage({
      type: 'play_hihat',
      velocity: velocity,
      open: open
    });
  }

  playClap(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR808Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-808 Clap: velocity=${velocity}`);
    webAudioBridge.sendMessage({
      type: 'play_clap',
      velocity: velocity
    });
  }

  // Parameter setters for TR-808
  setKickPitch(pitch) {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { kickPitch: pitch }
    });
  }

  setKickDecay(decay) {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { kickDecay: decay }
    });
  }

  setSnareTone(tone) {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { snareTone: tone }
    });
  }

  setSnareNoise(noise) {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { snareNoise: noise }
    });
  }

  setHihatDecay(decay) {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { hihatDecay: decay }
    });
  }

  stopAll() {
    webAudioBridge.stopAll();
  }
}
