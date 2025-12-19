/**
 * HAOS.fm Mobile Audio Engine
 * Web Audio API wrapper for React Native
 * Supports oscillators, filters, envelopes, and effects
 */

import { Audio } from 'expo-av';

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.oscillators = [];
    this.isInitialized = false;
    this.currentNote = null;
    this.adsr = {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.7,
      release: 0.3,
    };
    this.filterFreq = 1000;
    this.filterQ = 1;
    this.filterType = 'lowpass';
  }

  async initialize() {
    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      
      // Set audio mode for music playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      // Create AudioContext (Web Audio API)
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3; // Master volume
        this.masterGain.connect(this.audioContext.destination);
        this.isInitialized = true;
        console.log('Audio engine initialized');
      }
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
    }
  }

  setADSR(attack, decay, sustain, release) {
    this.adsr = { attack, decay, sustain, release };
  }

  setFilter(type, frequency, q) {
    this.filterType = type;
    this.filterFreq = frequency;
    this.filterQ = q;
  }

  createSynthVoice(frequency, waveform = 'sawtooth') {
    if (!this.isInitialized || !this.audioContext) {
      console.warn('Audio engine not initialized');
      return null;
    }

    const now = this.audioContext.currentTime;
    const { attack, decay, sustain } = this.adsr;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;

    // Create filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = this.filterType;
    filter.frequency.value = this.filterFreq;
    filter.Q.value = this.filterQ;

    // Create envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;

    // ADSR envelope
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attack);
    envelope.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    // Connect audio graph
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain);

    return { oscillator, filter, envelope };
  }

  playNote(frequency, waveform = 'sawtooth') {
    if (!this.isInitialized) {
      this.initialize().then(() => this.playNote(frequency, waveform));
      return;
    }

    // Stop current note if playing
    if (this.currentNote) {
      this.stopNote();
    }

    const voice = this.createSynthVoice(frequency, waveform);
    if (!voice) return;

    voice.oscillator.start();
    this.currentNote = voice;
  }

  stopNote() {
    if (!this.currentNote) return;

    const { oscillator, envelope } = this.currentNote;
    const now = this.audioContext.currentTime;
    const { release } = this.adsr;

    // Release envelope
    envelope.gain.cancelScheduledValues(now);
    envelope.gain.setValueAtTime(envelope.gain.value, now);
    envelope.gain.linearRampToValueAtTime(0, now + release);

    // Stop oscillator after release
    oscillator.stop(now + release);
    this.currentNote = null;
  }

  playChord(frequencies, waveform = 'sawtooth') {
    frequencies.forEach(freq => {
      const voice = this.createSynthVoice(freq, waveform);
      if (voice) {
        voice.oscillator.start();
        this.oscillators.push(voice);
      }
    });
  }

  stopAll() {
    this.oscillators.forEach(({ oscillator, envelope }) => {
      const now = this.audioContext.currentTime;
      envelope.gain.linearRampToValueAtTime(0, now + 0.1);
      oscillator.stop(now + 0.1);
    });
    this.oscillators = [];
    
    if (this.currentNote) {
      this.stopNote();
    }
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  // Frequency helper methods
  noteToFrequency(note) {
    const notes = {
      'C': 261.63,
      'C#': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'B': 493.88,
    };
    return notes[note] || 440;
  }

  midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  destroy() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
