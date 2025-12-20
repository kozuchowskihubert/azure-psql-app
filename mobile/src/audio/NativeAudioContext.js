/**
 * Native Audio Context using react-native-audio-api
 * This provides real Web Audio API that works on iOS/Android
 */

import { AudioContext } from 'react-native-audio-api';

class NativeAudioContextManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('🔊 Native audio already initialized');
      return;
    }

    try {
      console.log('🎵 Initializing native audio context...');
      
      // Create native audio context
      this.audioContext = new AudioContext();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.audioContext.destination);
      
      this.isInitialized = true;
      
      console.log('✅ Native audio context initialized at', this.audioContext.sampleRate, 'Hz');
      console.log('✅ Audio state:', this.audioContext.state);
      
    } catch (error) {
      console.error('❌ Failed to initialize native audio:', error);
      throw error;
    }
  }

  getContext() {
    if (!this.isInitialized) {
      throw new Error('Audio context not initialized. Call initialize() first.');
    }
    return this.audioContext;
  }

  getMasterGain() {
    if (!this.isInitialized) {
      throw new Error('Audio context not initialized. Call initialize() first.');
    }
    return this.masterGain;
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.log('🔊 Resuming audio context...');
      await this.audioContext.resume();
      console.log('✅ Audio context resumed, state:', this.audioContext.state);
    }
  }

  /**
   * Play a 808-style kick drum
   */
  playKick(velocity = 1.0) {
    if (!this.isInitialized) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Two-stage pitch envelope for kick
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      
      const gainNode = this.audioContext.createGain();
      
      // Pitch envelope: 150Hz -> 40Hz
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      
      // Amplitude envelope
      gainNode.gain.setValueAtTime(velocity * 0.8, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + 0.4);
      
      console.log('🥁 Native kick played, velocity:', velocity);
    } catch (error) {
      console.error('Kick play error:', error);
    }
  }

  /**
   * Play a 909-style snare drum
   */
  playSnare(velocity = 0.8) {
    if (!this.isInitialized) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Tonal component (two oscillators)
      const osc1 = this.audioContext.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.value = 180;
      
      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 330;
      
      // Noise component
      const bufferSize = this.audioContext.sampleRate * 0.2;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      
      // High-pass filter for noise
      const noiseFilter = this.audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      
      // Mix gains
      const toneGain = this.audioContext.createGain();
      const noiseGain = this.audioContext.createGain();
      const mainGain = this.audioContext.createGain();
      
      toneGain.gain.setValueAtTime(0.3 * velocity, now);
      toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      noiseGain.gain.setValueAtTime(0.7 * velocity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      mainGain.gain.value = 0.6;
      
      // Connect
      osc1.connect(toneGain);
      osc2.connect(toneGain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      
      toneGain.connect(mainGain);
      noiseGain.connect(mainGain);
      mainGain.connect(this.masterGain);
      
      // Play
      osc1.start(now);
      osc2.start(now);
      noise.start(now);
      
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);
      noise.stop(now + 0.2);
      
      console.log('🥁 Native snare played, velocity:', velocity);
    } catch (error) {
      console.error('Snare play error:', error);
    }
  }

  /**
   * Play a hi-hat
   */
  playHihat(velocity = 0.6, open = false) {
    if (!this.isInitialized) return;

    try {
      const now = this.audioContext.currentTime;
      const duration = open ? 0.3 : 0.05;
      
      // Create noise
      const bufferSize = this.audioContext.sampleRate * duration;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      
      // Band-pass filter for metallic sound
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 10000;
      filter.Q.value = 1.0;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(velocity * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      noise.start(now);
      noise.stop(now + duration);
      
      console.log('🥁 Native hihat played, velocity:', velocity, 'open:', open);
    } catch (error) {
      console.error('Hihat play error:', error);
    }
  }

  /**
   * Play a clap
   */
  playClap(velocity = 0.7) {
    if (!this.isInitialized) return;

    try {
      const now = this.audioContext.currentTime;
      
      // Multiple short bursts of noise
      for (let i = 0; i < 3; i++) {
        const startTime = now + (i * 0.03);
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let j = 0; j < bufferSize; j++) {
          output[j] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.0;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(velocity * 0.4, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        noise.start(startTime);
        noise.stop(startTime + 0.05);
      }
      
      console.log('👏 Native clap played, velocity:', velocity);
    } catch (error) {
      console.error('Clap play error:', error);
    }
  }

  /**
   * Play a TB-303 style bass note
   */
  playTB303Note(note, velocity = 1.0, duration = 0.2) {
    if (!this.isInitialized) return;

    try {
      const frequency = this.noteToFrequency(note);
      const now = this.audioContext.currentTime;
      
      // Sawtooth oscillator (classic 303 wave)
      const osc = this.audioContext.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = frequency;
      
      // Classic 303 filter: resonant low-pass
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 15; // High resonance
      
      // Filter envelope
      filter.frequency.setValueAtTime(frequency * 0.5, now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 4, now + 0.01);
      filter.frequency.exponentialRampToValueAtTime(frequency * 0.8, now + 0.3);
      
      // VCA
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(velocity * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      console.log('🎹 Native TB-303 played:', note, '@', frequency.toFixed(2), 'Hz');
    } catch (error) {
      console.error('TB-303 play error:', error);
    }
  }

  /**
   * Play ARP 2600 modular synth (dual oscillator with resonant filter)
   * @param {string} note - Note to play (e.g., 'C4')
   * @param {number} velocity - Note velocity (0-1)
   * @param {number} duration - Note duration in seconds
   * @param {object} params - Synthesis parameters
   * @param {number} params.osc1Level - Oscillator 1 level (0-1), default 0.5
   * @param {number} params.osc2Level - Oscillator 2 level (0-1), default 0.3
   * @param {number} params.detune - Oscillator 2 detune (0-1), default 0.005 (0.5%)
   * @param {number} params.filterCutoff - Filter cutoff frequency (0-10000 Hz), default 2000
   * @param {number} params.filterResonance - Filter resonance Q (0-30), default 18
   * @param {object} params.envelope - ADSR envelope {attack, decay, sustain, release}
   */
  playARP2600Note(note, velocity = 1.0, duration = 0.3, params = {}) {
    if (!this.isInitialized) return;

    try {
      // Extract parameters with defaults
      const {
        osc1Level = 0.5,
        osc2Level = 0.3,
        detune = 0.005,
        filterCutoff = 2000,
        filterResonance = 18,
        envelope = { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.3 }
      } = params;

      const frequency = this.noteToFrequency(note);
      const now = this.audioContext.currentTime;
      
      // OSC 1: Sawtooth (main)
      const osc1 = this.audioContext.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = frequency;
      
      // OSC 2: Square (detuned for thickness - now parameter-driven)
      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = frequency * (1 + detune);
      
      // Mix oscillators - now parameter-driven
      const osc1Gain = this.audioContext.createGain();
      osc1Gain.gain.value = osc1Level * velocity;
      const osc2Gain = this.audioContext.createGain();
      osc2Gain.gain.value = osc2Level * velocity;
      
      // ARP 2600 signature filter - now parameter-driven
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = filterResonance;
      
      // Filter envelope (use cutoff parameter as base)
      const filterStart = Math.max(100, filterCutoff * 0.5);
      const filterPeak = Math.min(20000, filterCutoff * 3);
      const filterEnd = filterCutoff;
      
      filter.frequency.setValueAtTime(filterStart, now);
      filter.frequency.exponentialRampToValueAtTime(filterPeak, now + envelope.attack);
      filter.frequency.exponentialRampToValueAtTime(filterEnd, now + envelope.attack + envelope.decay);
      
      // VCA with ADSR envelope - now parameter-driven
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0, now);
      // Attack
      gainNode.gain.linearRampToValueAtTime(velocity, now + envelope.attack);
      // Decay
      gainNode.gain.linearRampToValueAtTime(velocity * envelope.sustain, now + envelope.attack + envelope.decay);
      // Sustain (held at sustain level)
      gainNode.gain.setValueAtTime(velocity * envelope.sustain, now + duration);
      // Release
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + envelope.release);
      
      // Connect
      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);
      osc1Gain.connect(filter);
      osc2Gain.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + envelope.release);
      osc2.stop(now + duration + envelope.release);
      
      console.log('🎛️ ARP 2600 played:', note, '@', frequency.toFixed(2), 'Hz', 
                  '| Cutoff:', filterCutoff, 'Hz | Res:', filterResonance, 
                  '| Osc1:', osc1Level, '| Osc2:', osc2Level, '| Detune:', (detune*100).toFixed(2) + '%');
    } catch (error) {
      console.error('ARP 2600 play error:', error);
    }
  }

  /**
   * Play Juno-106 warm chorus ensemble synth
   * @param {string} note - Note to play (e.g., 'C3')
   * @param {number} velocity - Note velocity (0-1)
   * @param {number} duration - Note duration in seconds
   * @param {object} params - Synthesis parameters
   * @param {number} params.chorusDepth - Chorus detune depth (0-1 cents), default 0.007 (0.7%)
   * @param {number} params.filterCutoff - Filter cutoff frequency (0-5000 Hz), default 1500
   * @param {number} params.filterResonance - Filter resonance Q (0-10), default 2
   * @param {object} params.envelope - ADSR envelope {attack, decay, sustain, release}
   */
  playJuno106Note(note, velocity = 1.0, duration = 0.4, params = {}) {
    if (!this.isInitialized) return;

    try {
      // Extract parameters with defaults
      const {
        chorusDepth = 0.007,
        filterCutoff = 1500,
        filterResonance = 2,
        envelope = { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.3 }
      } = params;

      const frequency = this.noteToFrequency(note);
      const now = this.audioContext.currentTime;
      
      // Juno uses sawtooth with chorus for warmth
      // Three detuned oscillators for chorus effect - now parameter-driven
      const oscs = [];
      const detunes = [0, chorusDepth, -chorusDepth * 0.7]; // Center, +depth, -depth (slightly asymmetric)
      
      for (let i = 0; i < 3; i++) {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = frequency * (1 + detunes[i]);
        oscs.push(osc);
      }
      
      // Juno filter: smooth low-pass - now parameter-driven
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = filterResonance;
      
      // Gentle filter envelope (warm, not aggressive)
      const filterStart = Math.max(100, filterCutoff * 0.8);
      const filterPeak = Math.min(20000, filterCutoff * 2);
      const filterEnd = filterCutoff;
      
      filter.frequency.setValueAtTime(filterStart, now);
      filter.frequency.exponentialRampToValueAtTime(filterPeak, now + envelope.attack);
      filter.frequency.exponentialRampToValueAtTime(filterEnd, now + envelope.attack + envelope.decay);
      
      // VCA with ADSR envelope - now parameter-driven
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0, now);
      // Attack
      gainNode.gain.linearRampToValueAtTime(velocity * 0.3, now + envelope.attack);
      // Decay
      gainNode.gain.linearRampToValueAtTime(velocity * 0.3 * envelope.sustain, now + envelope.attack + envelope.decay);
      // Sustain
      gainNode.gain.setValueAtTime(velocity * 0.3 * envelope.sustain, now + duration);
      // Release
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration + envelope.release);
      
      // Mix oscillators
      const mixer = this.audioContext.createGain();
      mixer.gain.value = 0.33; // Equal mix
      
      // Connect
      oscs.forEach(osc => {
        osc.connect(mixer);
      });
      mixer.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Start/stop
      oscs.forEach(osc => {
        osc.start(now);
        osc.stop(now + duration + envelope.release);
      });
      
      console.log('🌊 Juno-106 played:', note, '@', frequency.toFixed(2), 'Hz',
                  '| Cutoff:', filterCutoff, 'Hz | Res:', filterResonance,
                  '| Chorus:', (chorusDepth * 100).toFixed(2) + '%');
    } catch (error) {
      console.error('Juno-106 play error:', error);
    }
  }

  /**
   * Play Minimoog fat bass/lead
   */
  playMinimoogNote(note, velocity = 1.0, duration = 0.5, params = {}) {
    if (!this.isInitialized) return;

    try {
      const frequency = this.noteToFrequency(note);
      const now = this.audioContext.currentTime;
      
      // Extract parameters with defaults
      const osc1Level = params.osc1Level !== undefined ? params.osc1Level : 0.4;
      const osc2Level = params.osc2Level !== undefined ? params.osc2Level : 0.3;
      const osc3Level = params.osc3Level !== undefined ? params.osc3Level : 0.5;
      const filterCutoff = params.filterCutoff !== undefined ? params.filterCutoff : 800;
      const filterResonance = params.filterResonance !== undefined ? params.filterResonance : 8;
      const envelope = params.envelope || { attack: 0.005, decay: 0.2, sustain: 0.7, release: 0.1 };
      
      // Minimoog: 3 oscillators for FAT sound
      // OSC 1: Sawtooth (main)
      const osc1 = this.audioContext.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = frequency;
      
      // OSC 2: Square (1 octave down for bass)
      const osc2 = this.audioContext.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = frequency * 0.5;
      
      // OSC 3: Triangle (2 octaves down for sub)
      const osc3 = this.audioContext.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.value = frequency * 0.25;
      
      // Mix levels (parameter-controlled)
      const osc1Gain = this.audioContext.createGain();
      osc1Gain.gain.value = osc1Level * velocity;
      const osc2Gain = this.audioContext.createGain();
      osc2Gain.gain.value = osc2Level * velocity;
      const osc3Gain = this.audioContext.createGain();
      osc3Gain.gain.value = osc3Level * velocity;
      
      // Moog ladder filter (simulated with lowpass + resonance)
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = filterResonance; // Parameter-controlled Q
      
      // Filter envelope (classic Moog sweep from parameter-based cutoff)
      const baseCutoff = Math.max(20, Math.min(10000, filterCutoff));
      filter.frequency.setValueAtTime(baseCutoff, now);
      filter.frequency.exponentialRampToValueAtTime(baseCutoff * 5, now + envelope.attack);
      filter.frequency.exponentialRampToValueAtTime(baseCutoff * (1 + envelope.sustain * 2), now + envelope.attack + envelope.decay);
      
      // VCA with ADSR envelope
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0, now);
      // Attack
      gainNode.gain.linearRampToValueAtTime(velocity * 0.6, now + envelope.attack);
      // Decay
      gainNode.gain.linearRampToValueAtTime(velocity * 0.6 * envelope.sustain, now + envelope.attack + envelope.decay);
      // Sustain (hold at sustain level)
      gainNode.gain.setValueAtTime(velocity * 0.6 * envelope.sustain, now + duration - envelope.release);
      // Release
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      // Connect
      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);
      osc3.connect(osc3Gain);
      osc1Gain.connect(filter);
      osc2Gain.connect(filter);
      osc3Gain.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
      
      console.log('🎹 Native Minimoog played:', note, '@', frequency.toFixed(2), 'Hz',
        `OSC[${osc1Level.toFixed(2)},${osc2Level.toFixed(2)},${osc3Level.toFixed(2)}]`,
        `Filter[${baseCutoff}Hz,Q${filterResonance}]`,
        `Env[${envelope.attack.toFixed(3)}/${envelope.decay.toFixed(3)}/${envelope.sustain.toFixed(2)}/${envelope.release.toFixed(3)}]`);
    } catch (error) {
      console.error('Minimoog play error:', error);
    }
  }

  /**
   * Convert note name to frequency
   */
  noteToFrequency(note) {
    const notes = {
      'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
      'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1, 'Ab': -1,
      'A': 0, 'A#': 1, 'Bb': 1, 'B': 2
    };

    const match = note.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return 440;

    const noteName = match[1];
    const octave = parseInt(match[2]);
    
    const semitones = notes[noteName] + (octave - 4) * 12;
    return 440 * Math.pow(2, semitones / 12);
  }
}

// Singleton instance
const nativeAudioContext = new NativeAudioContextManager();

export default nativeAudioContext;
