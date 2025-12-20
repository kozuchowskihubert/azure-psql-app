import nativeAudioContext from '../audio/NativeAudioContext';

class ARP2600Bridge {
  constructor() {
    this.isInitialized = false;
    
    // ARP 2600 parameters - matches NativeAudioContext parameter structure
    this.params = {
      osc1Level: 0.5,           // Oscillator 1 level (0-1)
      osc2Level: 0.3,           // Oscillator 2 level (0-1)
      detune: 0.005,            // Oscillator 2 detune (0-1, 0.005 = 0.5%)
      filterCutoff: 2000,       // Filter cutoff Hz (0-10000)
      filterResonance: 18,      // Filter Q (0-30)
      envelope: {
        attack: 0.05,           // Attack time in seconds
        decay: 0.1,             // Decay time in seconds
        sustain: 0.7,           // Sustain level (0-1)
        release: 0.3,           // Release time in seconds
      }
    };
  }

  async init() {
    console.log('ARP2600Bridge: Initializing modular synth...');
    
    try {
      await nativeAudioContext.initialize();
      this.isInitialized = true;
      console.log('ARP2600Bridge: Initialized - dual oscillator modular synth ready (native audio)');
      return true;
    } catch (error) {
      console.error('ARP2600Bridge: Initialization failed:', error);
      throw error;
    }
  }

  updateBridgeParams() {
    // Log parameters for debugging
    console.log('ARP2600 params:', JSON.stringify(this.params, null, 2));
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

    // Play using native audio with stored parameters
    nativeAudioContext.playARP2600Note(note, velocity, duration, this.params);
  }

  // Oscillator level controls
  setOsc1Level(level) {
    this.params.osc1Level = Math.max(0, Math.min(level, 1.0));
    console.log('ARP2600: Osc1 Level =', this.params.osc1Level);
  }

  setOsc2Level(level) {
    this.params.osc2Level = Math.max(0, Math.min(level, 1.0));
    console.log('ARP2600: Osc2 Level =', this.params.osc2Level);
  }

  setDetune(detune) {
    this.params.detune = Math.max(0, Math.min(detune, 0.02)); // 0-2% detune
    console.log('ARP2600: Detune =', (this.params.detune * 100).toFixed(2) + '%');
  }

  // Filter controls
  setFilterCutoff(cutoff) {
    this.params.filterCutoff = Math.max(100, Math.min(cutoff, 10000));
    console.log('ARP2600: Filter Cutoff =', this.params.filterCutoff, 'Hz');
  }

  setFilterResonance(res) {
    this.params.filterResonance = Math.max(0, Math.min(res, 30));
    console.log('ARP2600: Filter Resonance =', this.params.filterResonance);
  }

  // ADSR envelope controls
  setAttack(attack) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    console.log('ARP2600: Attack =', (this.params.envelope.attack * 1000).toFixed(0), 'ms');
  }

  setDecay(decay) {
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    console.log('ARP2600: Decay =', (this.params.envelope.decay * 1000).toFixed(0), 'ms');
  }

  setSustain(sustain) {
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    console.log('ARP2600: Sustain =', this.params.envelope.sustain.toFixed(2));
  }

  setRelease(release) {
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('ARP2600: Release =', (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Unified envelope control
  setEnvelope(attack, decay, sustain, release) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('ARP2600: Envelope ADSR =', 
                (this.params.envelope.attack * 1000).toFixed(0), 'ms /',
                (this.params.envelope.decay * 1000).toFixed(0), 'ms /',
                this.params.envelope.sustain.toFixed(2), '/',
                (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Convenience methods for StudioScreen
  setCutoff(value) {
    this.setFilterCutoff(value);
  }

  setResonance(value) {
    this.setFilterResonance(value);
  }

  // Preset management
  getParams() {
    return { ...this.params, envelope: { ...this.params.envelope } };
  }

  setParams(params) {
    if (params.osc1Level !== undefined) this.params.osc1Level = params.osc1Level;
    if (params.osc2Level !== undefined) this.params.osc2Level = params.osc2Level;
    if (params.detune !== undefined) this.params.detune = params.detune;
    if (params.filterCutoff !== undefined) this.params.filterCutoff = params.filterCutoff;
    if (params.filterResonance !== undefined) this.params.filterResonance = params.filterResonance;
    if (params.envelope) {
      this.params.envelope = { ...this.params.envelope, ...params.envelope };
    }
    console.log('ARP2600: Parameters loaded from preset');
  }

  stopAll() {
    // No-op for native audio (notes automatically stop)
  }
}

// Export singleton instance
const arp2600Bridge = new ARP2600Bridge();
export default arp2600Bridge;
