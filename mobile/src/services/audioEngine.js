/**
 * HAOS.fm Mobile Audio Engine
 * Native audio with haptic feedback for React Native iOS/Android
 * Uses expo-av and expo-haptics for real device compatibility
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioEngine {
  constructor() {
    this.isInitialized = false;
    this.masterVolume = 0.7;
    this.activeSounds = [];
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
    this.waveform = 'sawtooth';
    
    // Note frequencies
    this.noteFrequencies = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
      'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      
      // Set audio mode for music playback - CRITICAL for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // Play even in silent mode!
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      this.isInitialized = true;
      console.log('✅ Audio engine initialized (haptic mode)');
    } catch (error) {
      console.error('❌ Failed to initialize audio engine:', error);
      this.isInitialized = true; // Continue anyway with haptics
    }
  }

  setOscillator(waveform) {
    this.waveform = waveform;
  }

  setADSR(attack, decay, sustain, release) {
    this.adsr = { attack, decay, sustain, release };
  }

  setFilter(type, frequency, q) {
    this.filterType = type;
    this.filterFreq = frequency;
    this.filterQ = q;
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setMasterVolume(volume) {
    this.setVolume(volume);
  }

  /**
   * Trigger haptic feedback based on note frequency
   */
  async triggerHaptic(frequency) {
    try {
      // Different haptic intensity based on frequency
      if (frequency < 200) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (frequency < 400) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // Haptics not available
    }
  }

  /**
   * Find note name from frequency
   */
  frequencyToNote(freq) {
    let closestNote = 'A4';
    let minDiff = Infinity;
    
    for (const [note, noteFreq] of Object.entries(this.noteFrequencies)) {
      const diff = Math.abs(freq - noteFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = note;
      }
    }
    return closestNote;
  }

  /**
   * Play a note - triggers haptic feedback on real device
   * Full audio will work when audio samples are added
   */
  async playNote(frequency, waveform = 'sawtooth') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const noteName = this.frequencyToNote(frequency);
    console.log(`🎹 Playing: ${noteName} (${Math.round(frequency)}Hz)`);
    
    // Trigger haptic feedback for tactile response
    await this.triggerHaptic(frequency);
    
    this.currentNote = { frequency, waveform, startTime: Date.now() };
  }

  async stopNote() {
    if (this.currentNote) {
      console.log(`🎹 Released note`);
      this.currentNote = null;
    }
  }

  async playChord(frequencies, waveform = 'sawtooth') {
    for (const freq of frequencies) {
      await this.playNote(freq, waveform);
      // Small delay between chord notes
      await new Promise(r => setTimeout(r, 30));
    }
  }

  async stopAll() {
    await this.stopNote();
    console.log('🔇 All sounds stopped');
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

  // Drum methods for sequencer
  async playKick(velocity = 1.0) {
    console.log('🥁 Kick');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  async playSnare(velocity = 1.0) {
    console.log('🥁 Snare');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async playHiHat(velocity = 1.0) {
    console.log('🔔 HiHat');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async playClap(velocity = 1.0) {
    console.log('👏 Clap');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  destroy() {
    this.stopAll();
    this.isInitialized = false;
  }
}

// Singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
