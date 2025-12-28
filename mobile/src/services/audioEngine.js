/**
 * HAOS.fm Mobile Audio Engine
 * Unified audio interface with WebAudioBridge + fallback to haptics
 * Uses WebAudioBridge for real synthesis, expo-haptics for tactile feedback
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import webAudioBridge from './WebAudioBridge';

class AudioEngine {
  constructor() {
    this.isInitialized = false;
    this.useWebAudio = true; // Prefer WebAudio over haptics
    this.masterVolume = 0.7;
    this.activeSounds = [];
    this.currentNote = null;
    
    this.adsr = {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.1,
    };
    this.filterFreq = 1000;
    this.filterQ = 5;
    this.filterType = 'lowpass';
    this.waveform = 'sawtooth';
    
    // Drum parameters (for WebAudio)
    this.kickParams = {
      pitch: 150,
      decay: 0.3,
    };
    
    this.snareParams = {
      tone: 0.2,
    };
    
    this.hihatParams = {
      decay: 0.05,
    };
    
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
    
    // Waveform data for visualization
    this.waveformData = [];
    this.audioLevel = -Infinity;
    
    console.log('🎵 AudioEngine initialized with WebAudioBridge support');
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

      // Initialize WebAudio if available
      if (webAudioBridge.isReady) {
        webAudioBridge.initAudio();
        console.log('✅ Audio engine initialized (WebAudio)');
      } else {
        console.log('⚠️ WebAudio not ready, will use haptics');
      }

      this.isInitialized = true;
      console.log('✅ Audio engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio engine:', error);
      this.isInitialized = true; // Continue anyway with haptics
    }
  }

  /**
   * Set WebView reference (called by app root)
   */
  setWebViewRef(ref) {
    webAudioBridge.setWebViewRef(ref);
    console.log('🌉 WebView reference set in AudioEngine');
  }

  /**
   * Register waveform callback
   */
  onWaveformData(callback) {
    webAudioBridge.on('waveform', (payload) => {
      this.waveformData = payload.data || [];
      if (callback) callback(payload.data);
    });
  }

  /**
   * Register audio level callback
   */
  onAudioLevel(callback) {
    webAudioBridge.on('audioLevel', (payload) => {
      this.audioLevel = payload.db;
      if (callback) callback(payload.db);
    });
  }

  /**
   * Get current waveform data
   */
  getWaveformData() {
    return this.waveformData;
  }

  /**
   * Get current audio level (dB)
   */
  getAudioLevel() {
    return this.audioLevel;
  }

  setOscillator(waveform) {
    this.waveform = waveform;
    // Update WebAudio waveform if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setWaveform(waveform);
    }
  }

  setADSR(attack, decay, sustain, release) {
    this.adsr = { attack, decay, sustain, release };
    // Update WebAudio ADSR if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setADSR(attack, decay, sustain, release);
    }
  }

  setFilter(type, frequency, q) {
    this.filterType = type;
    this.filterFreq = frequency;
    this.filterQ = q;
    // Update WebAudio filter if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setFilter(type, frequency, q);
    }
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    // Update WebAudio volume if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setMasterVolume(this.masterVolume);
    }
  }

  setMasterVolume(volume) {
    this.setVolume(volume);
  }

  /**
   * Set distortion amount (0-100)
   */
  setDistortion(amount) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setDistortion(amount);
    }
  }

  /**
   * Set reverb amount (0-100)
   */
  setReverb(amount) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setReverb(amount);
    }
  }

  /**
   * Set delay parameters
   */
  setDelay(time, feedback, mix) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setDelay(time, feedback, mix);
    }
  }

  /**
   * Set compression parameters
   */
  setCompression(threshold, ratio, attack, release) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setCompression(threshold, ratio, attack, release);
    }
  }

  /**
   * Set BPM for sequencer
   */
  setBPM(bpm) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.setBPM(bpm);
    }
  }

  /**
   * Start waveform visualization updates
   */
  startWaveformUpdates(interval = 50) {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.startWaveformUpdates(interval);
    }
  }

  /**
   * Stop waveform visualization updates
   */
  stopWaveformUpdates() {
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.stopWaveformUpdates();
    }
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
   * Play a note - uses WebAudio if available, falls back to haptic
   * @param {number} frequency - Note frequency in Hz
   * @param {string} waveform - Waveform type (sawtooth/square/sine/triangle)
   * @param {number} duration - Note duration in seconds (0 = until stopNote called)
   */
  async playNote(frequency, waveform = 'sawtooth', duration = 0) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const noteName = this.frequencyToNote(frequency);
    console.log(`🎹 Playing: ${noteName} (${Math.round(frequency)}Hz)`);
    
    if (this.useWebAudio && webAudioBridge.isReady) {
      // Use WebAudio for real synthesis
      if (duration > 0) {
        webAudioBridge.playSynthNote(frequency, duration);
      } else {
        // Start sustaining note
        webAudioBridge.playSynthNote(frequency, 10); // Long duration, will be stopped manually
      }
    } else {
      // Fallback to haptic feedback
      await this.triggerHaptic(frequency);
    }
    
    this.currentNote = { frequency, waveform, startTime: Date.now() };
  }

  async stopNote() {
    if (this.currentNote) {
      console.log(`🎹 Released note`);
      
      // Stop WebAudio note if available
      if (this.useWebAudio && webAudioBridge.isReady) {
        webAudioBridge.stopAllNotes();
      }
      
      this.currentNote = null;
    }
  }

  async playChord(frequencies, waveform = 'sawtooth') {
    for (const freq of frequencies) {
      await this.playNote(freq, waveform, 0.5); // 0.5s duration for chord notes
      // Small delay between chord notes
      await new Promise(r => setTimeout(r, 30));
    }
  }

  async stopAll() {
    await this.stopNote();
    
    // Stop all WebAudio if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.stopAllNotes();
    }
    
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
    if (this.useWebAudio && webAudioBridge.isReady) {
      // Use WebAudio for real synthesis
      webAudioBridge.playKick({
        ...this.kickParams,
        velocity
      });
    } else {
      // Fallback to haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  async playSnare(velocity = 1.0) {
    console.log('🥁 Snare');
    if (this.useWebAudio && webAudioBridge.isReady) {
      // Use WebAudio for real synthesis
      webAudioBridge.playSnare({
        ...this.snareParams,
        velocity
      });
    } else {
      // Fallback to haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  async playHiHat(velocity = 1.0) {
    console.log('🔔 HiHat');
    if (this.useWebAudio && webAudioBridge.isReady) {
      // Use WebAudio for real synthesis
      webAudioBridge.playHiHat({
        ...this.hihatParams,
        velocity
      });
    } else {
      // Fallback to haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  async playClap(velocity = 1.0) {
    console.log('👏 Clap');
    if (this.useWebAudio && webAudioBridge.isReady) {
      // Use WebAudio for real synthesis
      webAudioBridge.playClap({ velocity });
    } else {
      // Fallback to haptics
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  destroy() {
    this.stopAll();
    
    // Dispose WebAudio if available
    if (this.useWebAudio && webAudioBridge.isReady) {
      webAudioBridge.dispose();
    }
    
    this.isInitialized = false;
  }
}

// Singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
