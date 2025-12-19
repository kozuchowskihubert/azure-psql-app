import webAudioBridge from '../audio/WebAudioBridge';

export default class TD3Bridge {
  constructor() {
    this.isInitialized = false;
    
    // TD-3 has more aggressive, modern acid sound
    this.params = {
      cutoff: 300,        // Lower starting point (darker)
      resonance: 18,      // Higher resonance (more screaming)
      envMod: 4500,       // More envelope modulation (wider sweep)
      decay: 0.25,        // Slightly faster decay (punchier)
      accent: 2.0,        // Stronger accent (more dynamic)
      waveform: 'sawtooth'
    };
  }

  async init() {
    console.log('TD3Bridge: Initializing...');
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkReady = setInterval(() => {
        attempts++;
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          
          // Set TD-3 specific parameters
          this.updateBridgeParams();
          
          console.log('TD3Bridge: Initialized with aggressive acid sound');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkReady);
          console.error('TD3Bridge: Initialization timeout');
          reject(new Error('TD3Bridge initialization timeout'));
        }
      }, 100);
    });
  }

  updateBridgeParams() {
    webAudioBridge.sendMessage({
      type: 'update_params',
      params: this.params
    });
  }

  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.warn('TD3Bridge: Not initialized');
      return;
    }

    const {
      velocity = 1.0,
      accent = false,
      duration = 0.2,
    } = options;

    console.log(`🎹 TD-3: ${note} (aggressive acid) velocity=${velocity}, accent=${accent}`);

    webAudioBridge.sendMessage({
      type: 'play_note',
      note,
      velocity,
      accent,
      duration,
    });
  }

  // Parameter setters with TD-3 specific ranges
  setCutoff(cutoff) {
    this.params.cutoff = Math.max(100, Math.min(cutoff, 8000));
    this.updateBridgeParams();
  }

  setResonance(resonance) {
    this.params.resonance = Math.max(0, Math.min(resonance, 30)); // Higher max for screaming sound
    this.updateBridgeParams();
  }

  setEnvMod(envMod) {
    this.params.envMod = Math.max(0, Math.min(envMod, 6000)); // Wider range
    this.updateBridgeParams();
  }

  setDecay(decay) {
    this.params.decay = Math.max(0.05, Math.min(decay, 1.0));
    this.updateBridgeParams();
  }

  setAccent(accent) {
    this.params.accent = Math.max(1.0, Math.min(accent, 3.0));
    this.updateBridgeParams();
  }

  setWaveform(waveform) {
    if (['sawtooth', 'square'].includes(waveform)) {
      this.params.waveform = waveform;
      this.updateBridgeParams();
    }
  }

  stopAll() {
    webAudioBridge.stopAll();
  }
}
