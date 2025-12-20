import nativeAudioContext from '../audio/NativeAudioContext';

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
      // Initialize native audio context
      await nativeAudioContext.initialize();
      this.isInitialized = true;
      console.log('TR909Bridge: Initialized successfully with native audio');
      return true;
    } catch (error) {
      console.error('TR909Bridge: Initialization error:', error);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  updateAllParams() {
    console.log('TR909Bridge: updateAllParams', this.params);
    // TODO: Store parameters for native synthesis
  }

  playKick(velocity = 1.0) {
    console.log(`🥁 TR-909 Kick: velocity=${velocity} (harder attack, native audio)`);
    nativeAudioContext.playKick(velocity * 1.1); // Slightly louder for 909 punch
  }

  playSnare(velocity = 1.0) {
    console.log(`🥁 TR-909 Snare: velocity=${velocity} (snappier, native audio)`);
    nativeAudioContext.playSnare(velocity * 1.15); // Louder, more aggressive
  }

  playHihat(velocity = 1.0, open = false) {
    console.log(`🥁 TR-909 Hi-hat: velocity=${velocity}, open=${open} (tighter, native audio)`);
    nativeAudioContext.playHihat(velocity * 1.2, open); // Brighter, more present
  }

  playClap(velocity = 1.0) {
    console.log(`🥁 TR-909 Clap: velocity=${velocity} (native audio)`);
    nativeAudioContext.playClap(velocity);
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
