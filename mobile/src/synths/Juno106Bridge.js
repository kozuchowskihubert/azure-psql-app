/**
 * HAOS.fm Juno-106 Synthesizer Bridge
 * Warm chorus ensemble sound
 */

import nativeAudioContext from '../audio/NativeAudioContext';

class Juno106Bridge {
  constructor() {
    this.isInitialized = false;
    
    // Juno-106 parameters - matches NativeAudioContext parameter structure
    this.params = {
      chorusDepth: 0.007,       // Chorus detune depth (0-1 cents), 0.007 = 0.7%
      filterCutoff: 1500,       // Filter cutoff Hz (0-5000)
      filterResonance: 2,       // Filter Q (0-10)
      envelope: {
        attack: 0.01,           // Attack time in seconds
        decay: 0.1,             // Decay time in seconds
        sustain: 0.8,           // Sustain level (0-1)
        release: 0.3,           // Release time in seconds
      }
    };
  }

  async init() {
    console.log('Juno106Bridge: Initializing warm chorus synth...');
    
    try {
      await nativeAudioContext.initialize();
      this.isInitialized = true;
      console.log('Juno106Bridge: Initialized - warm chorus ensemble ready (native audio)');
      return true;
    } catch (error) {
      console.error('Juno106Bridge: Initialization failed:', error);
      return false;
    }
  }

  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.error('Juno106Bridge: Not initialized');
      return;
    }

    const velocity = options.velocity !== undefined ? options.velocity : 1.0;
    const accent = options.accent || false;
    const duration = options.duration || 0.4;

    console.log(`🎹 Juno-106: ${note} vel=${velocity.toFixed(2)} accent=${accent}`);

    // Play using native audio with stored parameters
    nativeAudioContext.playJuno106Note(note, velocity, duration, this.params);
  }

  setCutoff(value) {
    this.params.filterCutoff = Math.max(100, Math.min(value, 5000));
    console.log('Juno106: Filter Cutoff =', this.params.filterCutoff, 'Hz');
  }

  setResonance(value) {
    this.params.filterResonance = Math.max(0, Math.min(value, 10));
    console.log('Juno106: Filter Resonance =', this.params.filterResonance);
  }

  setChorusDepth(value) {
    this.params.chorusDepth = Math.max(0, Math.min(value, 0.01)); // 0-1% detune
    console.log('Juno106: Chorus Depth =', (this.params.chorusDepth * 100).toFixed(2) + '%');
  }

  setAttack(attack) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    console.log('Juno106: Attack =', (this.params.envelope.attack * 1000).toFixed(0), 'ms');
  }

  setDecay(decay) {
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    console.log('Juno106: Decay =', (this.params.envelope.decay * 1000).toFixed(0), 'ms');
  }

  setSustain(sustain) {
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    console.log('Juno106: Sustain =', this.params.envelope.sustain.toFixed(2));
  }

  setRelease(release) {
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('Juno106: Release =', (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  setEnvelope(attack, decay, sustain, release) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('Juno106: Envelope ADSR =',
                (this.params.envelope.attack * 1000).toFixed(0), 'ms /',
                (this.params.envelope.decay * 1000).toFixed(0), 'ms /',
                this.params.envelope.sustain.toFixed(2), '/',
                (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Preset management
  getParams() {
    return { ...this.params, envelope: { ...this.params.envelope } };
  }

  setParams(params) {
    if (params.chorusDepth !== undefined) this.params.chorusDepth = params.chorusDepth;
    if (params.filterCutoff !== undefined) this.params.filterCutoff = params.filterCutoff;
    if (params.filterResonance !== undefined) this.params.filterResonance = params.filterResonance;
    if (params.envelope) {
      this.params.envelope = { ...this.params.envelope, ...params.envelope };
    }
    console.log('Juno106: Parameters loaded from preset');
  }

  stopAll() {
    // No-op for native audio (notes automatically stop)
  }
}

// Export singleton instance
const juno106Bridge = new Juno106Bridge();
export default juno106Bridge;

