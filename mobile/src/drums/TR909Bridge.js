import webAudioBridge from '../audio/WebAudioBridge';

export default class TR909Bridge {
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
    
    // Wait for WebAudio bridge to be ready
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkReady = setInterval(() => {
        attempts++;
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          
          // Set TR-909 specific parameters
          this.updateAllParams();
          
          console.log('TR909Bridge: Initialized successfully');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkReady);
          console.error('TR909Bridge: Initialization timeout');
          reject(new Error('TR909Bridge initialization timeout'));
        }
      }, 100);
    });
  }

  updateAllParams() {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: this.params
    });
  }

  playKick(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR909Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-909 Kick: velocity=${velocity} (harder attack)`);
    webAudioBridge.sendMessage({
      type: 'play_kick',
      velocity: velocity * 1.1 // Slightly louder for 909 punch
    });
  }

  playSnare(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR909Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-909 Snare: velocity=${velocity} (snappier)`);
    webAudioBridge.sendMessage({
      type: 'play_snare',
      velocity: velocity * 1.15 // Louder, more aggressive
    });
  }

  playHihat(velocity = 1.0, open = false) {
    if (!this.isInitialized) {
      console.warn('TR909Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-909 Hi-hat: velocity=${velocity}, open=${open} (tighter)`);
    webAudioBridge.sendMessage({
      type: 'play_hihat',
      velocity: velocity * 1.2, // Brighter, more present
      open: open
    });
  }

  playClap(velocity = 1.0) {
    if (!this.isInitialized) {
      console.warn('TR909Bridge: Not initialized');
      return;
    }
    
    console.log(`🥁 TR-909 Clap: velocity=${velocity}`);
    webAudioBridge.sendMessage({
      type: 'play_clap',
      velocity: velocity * 1.1
    });
  }

  // Parameter setters for TR-909
  setKickPitch(pitch) {
    this.params.kickPitch = pitch;
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { kickPitch: pitch }
    });
  }

  setKickDecay(decay) {
    this.params.kickDecay = decay;
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { kickDecay: decay }
    });
  }

  setSnareTone(tone) {
    this.params.snareTone = tone;
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { snareTone: tone }
    });
  }

  setSnareNoise(noise) {
    this.params.snareNoise = noise;
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { snareNoise: noise }
    });
  }

  setHihatDecay(decay) {
    this.params.hihatDecay = decay;
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: { hihatDecay: decay }
    });
  }

  stopAll() {
    webAudioBridge.stopAll();
  }
}
