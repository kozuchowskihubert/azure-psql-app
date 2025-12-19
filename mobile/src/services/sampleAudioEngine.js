/**
 * HAOS.fm Audio Engine with Real Sound
 * Uses bundled audio samples for authentic synth and drum sounds
 * Compatible with React Native and Expo
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Audio sample mappings
const AUDIO_SAMPLES = {
  // Synth notes (we'll use a key-based approach)
  synth: {
    C4: require('../../assets/audio/synth_c4.mp3'),
    D4: require('../../assets/audio/synth_d4.mp3'),
    E4: require('../../assets/audio/synth_e4.mp3'),
    F4: require('../../assets/audio/synth_f4.mp3'),
    G4: require('../../assets/audio/synth_g4.mp3'),
    A4: require('../../assets/audio/synth_a4.mp3'),
    B4: require('../../assets/audio/synth_b4.mp3'),
  },
  // Drum samples
  drums: {
    kick: require('../../assets/audio/kick.mp3'),
    snare: require('../../assets/audio/snare.mp3'),
    hihat: require('../../assets/audio/hihat.mp3'),
    clap: require('../../assets/audio/clap.mp3'),
    tom: require('../../assets/audio/tom.mp3'),
    crash: require('../../assets/audio/crash.mp3'),
  },
  // Bass samples
  bass: {
    C2: require('../../assets/audio/bass_c2.mp3'),
    D2: require('../../assets/audio/bass_d2.mp3'),
    E2: require('../../assets/audio/bass_e2.mp3'),
  }
};

class SampleAudioEngine {
  constructor() {
    this.sounds = {};
    this.loadedSamples = {};
    this.isInitialized = false;
    this.masterVolume = 0.7;
    this.activeSounds = [];
    
    // Synth params
    this.waveform = 'sawtooth';
    this.adsr = { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 };
    this.filterFreq = 1000;
    this.filterQ = 1;
    this.filterType = 'lowpass';
    
    // Note frequencies for pitch shifting
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
      // Request permissions
      await Audio.requestPermissionsAsync();
      
      // Configure audio for music
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      this.isInitialized = true;
      console.log('✅ Sample Audio Engine initialized');
      
    } catch (error) {
      console.error('❌ Audio init failed:', error);
    }
  }

  /**
   * Preload a sample for faster playback
   */
  async preloadSample(category, name) {
    try {
      const sampleKey = `${category}_${name}`;
      if (this.loadedSamples[sampleKey]) return;
      
      const sampleSource = AUDIO_SAMPLES[category]?.[name];
      if (!sampleSource) return;
      
      const { sound } = await Audio.Sound.createAsync(sampleSource);
      this.loadedSamples[sampleKey] = sound;
      
    } catch (error) {
      // Sample not found, that's OK
    }
  }

  /**
   * Play a loaded sample
   */
  async playSample(category, name, options = {}) {
    if (!this.isInitialized) await this.initialize();
    
    const { volume = this.masterVolume, rate = 1.0 } = options;
    const sampleKey = `${category}_${name}`;
    
    try {
      const sampleSource = AUDIO_SAMPLES[category]?.[name];
      
      if (sampleSource) {
        // Create and play sound
        const { sound } = await Audio.Sound.createAsync(
          sampleSource,
          { 
            volume: volume,
            rate: rate,
            shouldCorrectPitch: true,
            shouldPlay: true 
          }
        );
        
        this.activeSounds.push(sound);
        
        // Cleanup when done
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            this.activeSounds = this.activeSounds.filter(s => s !== sound);
          }
        });
        
        return sound;
      } else {
        // No sample - use haptic feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        console.log(`🎵 [Haptic] ${category}/${name}`);
      }
      
    } catch (error) {
      // Fallback to haptic
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // ===== SYNTH METHODS =====
  
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
   * Play a note by frequency
   */
  async playNote(frequency, waveform = null) {
    // Find closest note name
    const noteName = this.frequencyToNote(frequency);
    
    // Try to play synth sample, falling back to haptic
    await this.playSample('synth', noteName, { 
      volume: this.masterVolume,
      rate: this.calculatePitchRate(frequency, noteName)
    });
    
    console.log(`🎹 Note: ${noteName} (${Math.round(frequency)}Hz)`);
  }

  /**
   * Find closest note name for frequency
   */
  frequencyToNote(freq) {
    let closestNote = 'C4';
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
   * Calculate playback rate for pitch shifting
   */
  calculatePitchRate(targetFreq, baseNote) {
    const baseFreq = this.noteFrequencies[baseNote] || 440;
    return targetFreq / baseFreq;
  }

  async stopNote() {
    // Stop most recent synth sounds
    const recentSounds = this.activeSounds.slice(-3);
    for (const sound of recentSounds) {
      try {
        await sound.stopAsync();
      } catch (e) {}
    }
  }

  // ===== DRUM METHODS =====
  
  async playKick(velocity = 1.0) {
    await this.playSample('drums', 'kick', { volume: velocity * this.masterVolume });
    console.log('🥁 Kick');
  }

  async playSnare(velocity = 1.0) {
    await this.playSample('drums', 'snare', { volume: velocity * this.masterVolume });
    console.log('🥁 Snare');
  }

  async playHiHat(velocity = 1.0) {
    await this.playSample('drums', 'hihat', { volume: velocity * this.masterVolume });
    console.log('🥁 HiHat');
  }

  async playClap(velocity = 1.0) {
    await this.playSample('drums', 'clap', { volume: velocity * this.masterVolume });
    console.log('👏 Clap');
  }

  async playTom(velocity = 1.0) {
    await this.playSample('drums', 'tom', { volume: velocity * this.masterVolume });
  }

  async playCrash(velocity = 1.0) {
    await this.playSample('drums', 'crash', { volume: velocity * this.masterVolume });
  }

  // ===== BASS METHODS =====
  
  async playBass(note = 'C2', velocity = 1.0) {
    await this.playSample('bass', note, { volume: velocity * this.masterVolume });
    console.log(`🎸 Bass: ${note}`);
  }

  // ===== UTILITY METHODS =====
  
  async playChord(frequencies, waveform = 'sawtooth') {
    for (const freq of frequencies) {
      await this.playNote(freq, waveform);
    }
  }

  async stopAll() {
    for (const sound of this.activeSounds) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {}
    }
    this.activeSounds = [];
  }

  noteToFrequency(note, octave = 4) {
    const key = `${note}${octave}`;
    return this.noteFrequencies[key] || 440;
  }

  midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  async destroy() {
    await this.stopAll();
    
    // Unload preloaded samples
    for (const sound of Object.values(this.loadedSamples)) {
      try {
        await sound.unloadAsync();
      } catch (e) {}
    }
    this.loadedSamples = {};
    this.isInitialized = false;
  }
}

// Singleton
const sampleAudioEngine = new SampleAudioEngine();

export default sampleAudioEngine;
