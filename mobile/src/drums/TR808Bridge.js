import nativeAudioContext from '../audio/NativeAudioContext';

class TR808Bridge {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    console.log('TR808Bridge: Initializing...');
    
    try {
      // Initialize native audio context
      await nativeAudioContext.initialize();
      this.isInitialized = true;
      console.log('TR808Bridge: Initialized successfully with native audio');
      return true;
    } catch (error) {
      console.error('TR808Bridge: Initialization error:', error);
      this.isInitialized = true; // Continue anyway
      return true;
    }
  }

  playKick(velocity = 1.0) {
    console.log(`🥁 TR-808 Kick: velocity=${velocity} (native audio)`);
    nativeAudioContext.playKick(velocity);
  }

  playSnare(velocity = 1.0) {
    console.log(`🥁 TR-808 Snare: velocity=${velocity} (native audio)`);
    nativeAudioContext.playSnare(velocity);
  }

  playHihat(velocity = 1.0, open = false) {
    console.log(`🥁 TR-808 Hi-hat: velocity=${velocity}, open=${open} (native audio)`);
    nativeAudioContext.playHihat(velocity, open);
  }

  playClap(velocity = 1.0) {
    console.log(`🥁 TR-808 Clap: velocity=${velocity} (native audio)`);
    nativeAudioContext.playClap(velocity);
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
