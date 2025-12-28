/**
 * HAOS.fm TB-303 Bass Synthesizer (Native Audio)
 * Uses react-native-audio-api for native Web Audio
 * Full analog-style synthesis with filter modulation
 */

import webAudioBridge from '../services/WebAudioBridge';
import * as Haptics from 'expo-haptics';

class TB303Bridge {
  constructor() {
    this.isInitialized = false;
    
    // TB-303 parameters
    this.cutoff = 500;
    this.resonance = 10;
    this.envMod = 3000;
    this.decay = 0.3;
    this.accent = 1.5;
    this.waveform = 'sawtooth';
  }

  // Convert note name to frequency
  noteToFrequency(note) {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return 440;
    
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const semitone = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + semitone;
    
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Initialize native audio
   */
  async init() {
    this.isInitialized = true;
    console.log('TB-303 Bridge: Initialized with web audio bridge');
    return true;
  }

  /**
   * Play a note
   */
  playNote(note, options = {}) {
    const {
      velocity = 1.0,
      accent = false,
      duration = 0.2,
      slideFrom = null,
    } = options;

    const frequency = this.noteToFrequency(note);
    const slideFromFreq = slideFrom ? this.noteToFrequency(slideFrom) : null;

    console.log(`🎹 TB-303: ${note} (${frequency.toFixed(1)}Hz) velocity=${velocity} accent=${accent}`);

    // Play using WebAudioBridge with TB-303 parameters
    if (webAudioBridge.isReady) {
      webAudioBridge.playTB303(
        frequency,
        duration,
        velocity,
        this.cutoff,
        this.resonance,
        this.envMod,
        accent,
        slideFromFreq,
        this.waveform
      );
    } else {
      // Haptic fallback if audio not ready
      Haptics.impactAsync(accent ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
      console.log('⚠️  TB-303: Audio bridge not ready, haptic feedback only');
    }
  }

  /**
   * Update parameters
   */
  updateBridgeParams() {
    console.log('TB-303: updateBridgeParams', {
      cutoff: this.cutoff,
      resonance: this.resonance,
      envMod: this.envMod,
      decay: this.decay,
      accent: this.accent,
      waveform: this.waveform,
    });
    // Parameters are passed per-note to WebAudioBridge
    // No global parameter setting needed
  }

  /**
   * Set waveform
   */
  setWaveform(waveform) {
    if (waveform === 'sawtooth' || waveform === 'square') {
      this.waveform = waveform;
      this.updateBridgeParams();
    }
  }

  /**
   * Set cutoff (20-8000 Hz)
   */
  setCutoff(value) {
    this.cutoff = Math.max(20, Math.min(8000, value));
    this.updateBridgeParams();
  }

  /**
   * Set resonance (0-30)
   */
  setResonance(value) {
    this.resonance = Math.max(0, Math.min(30, value));
    this.updateBridgeParams();
  }

  /**
   * Set envelope modulation (0-5000 Hz)
   */
  setEnvMod(value) {
    this.envMod = Math.max(0, Math.min(5000, value));
    this.updateBridgeParams();
  }

  /**
   * Set decay (0-1 seconds)
   */
  setDecay(value) {
    this.decay = Math.max(0.05, Math.min(1, value));
    this.updateBridgeParams();
  }

  /**
   * Set accent (1-3)
   */
  setAccent(value) {
    this.accent = Math.max(1, Math.min(3, value));
    this.updateBridgeParams();
  }

  /**
   * Stop all
   */
  async stopAll() {
    console.log('TB-303: stopAll');
    // TODO: Implement stop all voices
  }

  /**
   * Cleanup
   */
  async cleanup() {
    this.isInitialized = false;
  }
}

export default TB303Bridge;
