import webAudioBridge from '../audio/WebAudioBridge';

export default class ARP2600Bridge {
  constructor() {
    this.isInitialized = false;
    
    // ARP 2600 parameters - full modular synthesizer
    this.params = {
      osc1: 'sawtooth',
      osc2: 'square',
      osc2Detune: 0.02,     // Slight detune for thickness
      filterCutoff: 2000,
      filterRes: 5,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.2,
    };
  }

  async init() {
    console.log('ARP2600Bridge: Initializing modular synth...');
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkReady = setInterval(() => {
        attempts++;
        if (webAudioBridge.isReady) {
          clearInterval(checkReady);
          this.isInitialized = true;
          
          // Set ARP 2600 specific parameters
          this.updateBridgeParams();
          
          console.log('ARP2600Bridge: Initialized - dual oscillator modular synth ready');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkReady);
          console.error('ARP2600Bridge: Initialization timeout');
          reject(new Error('ARP2600Bridge initialization timeout'));
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
      console.warn('ARP2600Bridge: Not initialized');
      return;
    }

    const {
      velocity = 1.0,
      accent = false,
      duration = 0.3,
    } = options;

    console.log(`🎹 ARP 2600: ${note} (modular synth) velocity=${velocity}, accent=${accent}`);

    webAudioBridge.sendMessage({
      type: 'play_arp2600',
      note,
      velocity,
      accent,
      duration,
    });
  }

  // Oscillator controls
  setOsc1Type(type) {
    if (['sawtooth', 'square', 'triangle', 'sine'].includes(type)) {
      this.params.osc1 = type;
      this.updateBridgeParams();
    }
  }

  setOsc2Type(type) {
    if (['sawtooth', 'square', 'triangle', 'sine'].includes(type)) {
      this.params.osc2 = type;
      this.updateBridgeParams();
    }
  }

  setOsc2Detune(detune) {
    this.params.osc2Detune = Math.max(-0.1, Math.min(detune, 0.1));
    this.updateBridgeParams();
  }

  // Filter controls
  setFilterCutoff(cutoff) {
    this.params.filterCutoff = Math.max(100, Math.min(cutoff, 8000));
    this.updateBridgeParams();
  }

  setFilterResonance(res) {
    this.params.filterRes = Math.max(0, Math.min(res, 20));
    this.updateBridgeParams();
  }

  // ADSR envelope controls
  setAttack(attack) {
    this.params.attack = Math.max(0.001, Math.min(attack, 2.0));
    this.updateBridgeParams();
  }

  setDecay(decay) {
    this.params.decay = Math.max(0.01, Math.min(decay, 2.0));
    this.updateBridgeParams();
  }

  setSustain(sustain) {
    this.params.sustain = Math.max(0, Math.min(sustain, 1.0));
    this.updateBridgeParams();
  }

  setRelease(release) {
    this.params.release = Math.max(0.01, Math.min(release, 3.0));
    this.updateBridgeParams();
  }

  // Unified envelope control
  setEnvelope(attack, decay, sustain, release) {
    this.params.attack = Math.max(0.001, Math.min(attack, 2.0));
    this.params.decay = Math.max(0.01, Math.min(decay, 2.0));
    this.params.sustain = Math.max(0, Math.min(sustain, 1.0));
    this.params.release = Math.max(0.01, Math.min(release, 3.0));
    this.updateBridgeParams();
  }

  // Convenience methods for StudioScreen
  setCutoff(value) {
    this.setFilterCutoff(value);
  }

  setResonance(value) {
    this.setFilterResonance(value);
  }

  stopAll() {
    webAudioBridge.stopAll();
  }
}
