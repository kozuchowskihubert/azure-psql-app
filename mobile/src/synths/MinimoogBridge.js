/**
 * HAOS.fm Minimoog Synthesizer Bridge
 * Fat analog bass/lead sound
 */

import webAudioBridge from '../services/WebAudioBridge';
import * as Haptics from 'expo-haptics';

class MinimoogBridge {
  constructor() {
    this.isInitialized = false;
    
    // Minimoog parameters stored as object
    this.params = {
      osc1Level: 0.4,
      osc2Level: 0.3,
      osc3Level: 0.5,
      filterCutoff: 800,
      filterResonance: 8,
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.7,
        release: 0.1
      }
    };
  }

  // Convert note name to frequency (handles both string notes like "C3" and MIDI numbers)
  noteToFrequency(note) {
    // If note is already a number (MIDI note), convert directly to frequency
    if (typeof note === 'number') {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
    
    // If note is a string, parse it
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return 440; // Default to A4
    
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const semitone = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + semitone;
    
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  async init() {
    console.log('MinimoogBridge: Initializing fat analog synth...');
    this.isInitialized = true;
    console.log('✅ Minimoog synth initialized (web audio bridge)');
    return true;
  }

  playNote(note, options = {}) {
    const velocity = options.velocity !== undefined ? options.velocity : 1.0;
    const duration = options.duration || 0.5;
    const frequency = this.noteToFrequency(note);

    console.log(`🎹 Minimoog: ${note} (${frequency.toFixed(1)}Hz) vel=${velocity.toFixed(2)}`);

    // Play using WebAudioBridge with Minimoog parameters
    if (webAudioBridge.isReady) {
      webAudioBridge.playMinimoog(
        frequency,
        duration,
        velocity,
        this.params.filterCutoff,
        this.params.filterResonance
      );
    } else {
      // Haptic fallback if audio not ready
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('⚠️  Minimoog: Audio bridge not ready, haptic feedback only');
    }
  }

  // Oscillator level setters
  setOsc1Level(value) {
    if (!this.isInitialized) return;
    this.params.osc1Level = Math.max(0, Math.min(1, value));
    console.log('🎛️  Minimoog OSC1 Level:', this.params.osc1Level.toFixed(2));
  }

  setOsc2Level(value) {
    if (!this.isInitialized) return;
    this.params.osc2Level = Math.max(0, Math.min(1, value));
    console.log('🎛️  Minimoog OSC2 Level:', this.params.osc2Level.toFixed(2));
  }

  setOsc3Level(value) {
    if (!this.isInitialized) return;
    this.params.osc3Level = Math.max(0, Math.min(1, value));
    console.log('🎛️  Minimoog OSC3 Level:', this.params.osc3Level.toFixed(2));
  }

  // Filter setters
  setCutoff(value) {
    if (!this.isInitialized) return;
    this.params.filterCutoff = Math.max(20, Math.min(10000, value));
    console.log('🎛️  Minimoog Filter Cutoff:', this.params.filterCutoff.toFixed(0), 'Hz');
  }

  setResonance(value) {
    if (!this.isInitialized) return;
    this.params.filterResonance = Math.max(0, Math.min(20, value));
    console.log('🎛️  Minimoog Filter Resonance (Q):', this.params.filterResonance.toFixed(1));
  }

  // ADSR envelope setters
  setAttack(value) {
    if (!this.isInitialized) return;
    this.params.envelope.attack = Math.max(0.001, Math.min(2, value));
    console.log('🎛️  Minimoog Attack:', (this.params.envelope.attack * 1000).toFixed(0), 'ms');
  }

  setDecay(value) {
    if (!this.isInitialized) return;
    this.params.envelope.decay = Math.max(0.01, Math.min(2, value));
    console.log('🎛️  Minimoog Decay:', (this.params.envelope.decay * 1000).toFixed(0), 'ms');
  }

  setSustain(value) {
    if (!this.isInitialized) return;
    this.params.envelope.sustain = Math.max(0, Math.min(1, value));
    console.log('🎛️  Minimoog Sustain:', (this.params.envelope.sustain * 100).toFixed(0), '%');
  }

  setRelease(value) {
    if (!this.isInitialized) return;
    this.params.envelope.release = Math.max(0.01, Math.min(5, value));
    console.log('🎛️  Minimoog Release:', (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Legacy method for backward compatibility
  setOscMix(osc1, osc2, osc3) {
    this.setOsc1Level(osc1);
    this.setOsc2Level(osc2);
    this.setOsc3Level(osc3);
  }

  // Legacy method for backward compatibility
  setEnvelope(attack, decay, sustain, release) {
    this.setAttack(attack);
    this.setDecay(decay);
    this.setSustain(sustain);
    this.setRelease(release);
  }

  // Preset system support
  getParams() {
    return {
      ...this.params,
      envelope: { ...this.params.envelope }
    };
  }

  setParams(params) {
    if (params.osc1Level !== undefined) this.params.osc1Level = params.osc1Level;
    if (params.osc2Level !== undefined) this.params.osc2Level = params.osc2Level;
    if (params.osc3Level !== undefined) this.params.osc3Level = params.osc3Level;
    if (params.filterCutoff !== undefined) this.params.filterCutoff = params.filterCutoff;
    if (params.filterResonance !== undefined) this.params.filterResonance = params.filterResonance;
    if (params.envelope) {
      if (params.envelope.attack !== undefined) this.params.envelope.attack = params.envelope.attack;
      if (params.envelope.decay !== undefined) this.params.envelope.decay = params.envelope.decay;
      if (params.envelope.sustain !== undefined) this.params.envelope.sustain = params.envelope.sustain;
      if (params.envelope.release !== undefined) this.params.envelope.release = params.envelope.release;
    }
    console.log('🎹 Minimoog preset loaded');
  }
}

// Singleton export
const minimoogBridge = new MinimoogBridge();
export default minimoogBridge;
