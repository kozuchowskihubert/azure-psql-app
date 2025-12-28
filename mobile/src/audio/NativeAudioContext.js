/**
 * Native Audio Context - DEPRECATED & STUBBED
 * This module is deprecated and replaced by WebAudioBridge.
 * All methods are stubs that do nothing.
 */

class NativeAudioContextManager {
  constructor() {
    this.isInitialized = false;
    console.log('⚠️  NativeAudioContext is deprecated. All instruments now use WebAudioBridge.');
  }

  async initialize() {
    this.isInitialized = true;
    return Promise.resolve();
  }

  async resume() {
    return Promise.resolve();
  }

  getContext() { return null; }
  getMasterGain() { return null; }
  
  // Stub methods for drums - do nothing
  playKick() {}
  playSnare() {}
  playHihat() {}
  playClap() {}
  playRimshot() {}
  playCowbell() {}
  playCymbal() {}
  playTom() {}
  
  // Stub methods for synths - do nothing
  playARP2600Note() {}
  playJuno106Note() {}
  playMinimoogNote() {}
  playTB303Note() {}
  playBassNote() {}
  playNote() {}
  
  // Stub setters - do nothing
  setTB303Params() {}
  noteToFrequency() { return 440; }
}

const nativeAudioContext = new NativeAudioContextManager();
export default nativeAudioContext;
