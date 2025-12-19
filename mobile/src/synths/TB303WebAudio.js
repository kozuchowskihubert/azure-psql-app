/**
 * HAOS.fm TB-303 Bass Synthesizer (Web Audio API)
 * Real analog-style synthesis with filter modulation
 * Uses react-native-audio-api for true synthesis
 */

import { AudioContext, OscillatorNode, GainNode, BiquadFilterNode } from 'react-native-audio-api';

class TB303WebAudio {
  constructor() {
    this.context = null;
    this.isInitialized = false;
    
    // TB-303 parameters
    this.cutoff = 500; // Hz
    this.resonance = 10; // Q factor
    this.envMod = 3000; // Filter envelope amount in Hz
    this.decay = 0.3; // Envelope decay time
    this.accent = 1.5; // Accent multiplier
    this.waveform = 'sawtooth'; // 'sawtooth' or 'square'
    
    // Active voices
    this.activeVoices = [];
  }

  /**
   * Initialize Web Audio context
   */
  async init() {
    try {
      console.log('TB-303 WebAudio: Initializing...');
      
      this.context = new AudioContext();
      this.isInitialized = true;
      
      console.log('TB-303 WebAudio: Initialized successfully');
      console.log('Sample rate:', this.context.sampleRate);
      return true;
    } catch (error) {
      console.error('TB-303 WebAudio: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Play a note with 303-style filter modulation
   */
  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.warn('TB-303 WebAudio: Not initialized');
      return;
    }

    const {
      velocity = 1.0,
      accent = false,
      slide = false,
      duration = 0.2,
    } = options;

    try {
      const frequency = this.noteToFrequency(note);
      const now = this.context.currentTime;
      
      console.log(`TB-303 WebAudio: Playing ${note} (${frequency}Hz)`);

      // Create oscillator
      const osc = new OscillatorNode(this.context, {
        type: this.waveform,
        frequency: frequency,
      });

      // Create filter (the heart of the 303 sound)
      const filter = new BiquadFilterNode(this.context, {
        type: 'lowpass',
        frequency: this.cutoff,
        Q: this.resonance,
      });

      // Create VCA (volume envelope)
      const vca = new GainNode(this.context, {
        gain: 0,
      });

      // Connect: OSC -> FILTER -> VCA -> OUTPUT
      osc.connect(filter);
      filter.connect(vca);
      vca.connect(this.context.destination);

      // Calculate envelope parameters
      const accentMult = accent ? this.accent : 1.0;
      const peakVolume = velocity * accentMult;
      const filterPeak = this.cutoff + (this.envMod * accentMult);

      // Volume envelope (fast attack, exponential decay)
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(peakVolume * 0.8, now + 0.001); // 1ms attack
      vca.gain.exponentialRampToValueAtTime(peakVolume * 0.3, now + this.decay);
      vca.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Filter envelope (the iconic 303 sweep!)
      filter.frequency.setValueAtTime(filterPeak, now);
      filter.frequency.exponentialRampToValueAtTime(this.cutoff, now + this.decay);

      // Start oscillator
      osc.start(now);
      osc.stop(now + duration + 0.1);

      // Store voice for cleanup
      const voice = { osc, filter, vca, stopTime: now + duration + 0.1 };
      this.activeVoices.push(voice);

      // Cleanup after note ends
      setTimeout(() => {
        try {
          osc.disconnect();
          filter.disconnect();
          vca.disconnect();
          this.activeVoices = this.activeVoices.filter(v => v !== voice);
        } catch (e) {
          // Already disconnected
        }
      }, (duration + 0.2) * 1000);

    } catch (error) {
      console.error('TB-303 WebAudio: Error playing note:', error);
    }
  }

  /**
   * Set waveform
   */
  setWaveform(waveform) {
    if (waveform === 'sawtooth' || waveform === 'square') {
      this.waveform = waveform;
    }
  }

  /**
   * Set filter cutoff (20-8000 Hz)
   */
  setCutoff(value) {
    this.cutoff = Math.max(20, Math.min(8000, value));
  }

  /**
   * Set resonance (0-30)
   */
  setResonance(value) {
    this.resonance = Math.max(0, Math.min(30, value));
  }

  /**
   * Set envelope modulation amount (0-5000 Hz)
   */
  setEnvMod(value) {
    this.envMod = Math.max(0, Math.min(5000, value));
  }

  /**
   * Set decay time (0-1 seconds)
   */
  setDecay(value) {
    this.decay = Math.max(0.05, Math.min(1, value));
  }

  /**
   * Set accent intensity (1-3)
   */
  setAccent(value) {
    this.accent = Math.max(1, Math.min(3, value));
  }

  /**
   * Stop all active notes
   */
  async stopAll() {
    const now = this.context?.currentTime || 0;
    
    for (const voice of this.activeVoices) {
      try {
        voice.vca.gain.cancelScheduledValues(now);
        voice.vca.gain.setValueAtTime(voice.vca.gain.value, now);
        voice.vca.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        voice.osc.stop(now + 0.1);
      } catch (e) {
        // Already stopped
      }
    }
    
    this.activeVoices = [];
  }

  /**
   * Convert note name to frequency
   */
  noteToFrequency(note) {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 440;
    
    const noteName = match[1];
    const octave = parseInt(match[2]);
    
    const noteNum = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + noteNum;
    
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await this.stopAll();
    
    if (this.context) {
      try {
        await this.context.close();
      } catch (e) {
        // Already closed
      }
      this.context = null;
    }
    
    this.isInitialized = false;
  }
}

export default TB303WebAudio;
