/**
 * HAOS.fm ARP 2600 Semi-Modular Synthesizer (Native)
 * Rich, warm analog sound with flexible modulation
 * Sample-based synthesis using expo-av
 */

import { Audio } from 'expo-av';

class ARP2600 {
  constructor() {
    this.sounds = new Map();
    this.isLoaded = false;
    
    // ARP 2600 parameters
    this.osc1Level = 0.6;
    this.osc2Level = 0.4;
    this.osc2Detune = 0.02; // Slight detune for thickness
    this.filterCutoff = 0.7;
    this.filterResonance = 0.3;
    this.filterEnvAmount = 0.5;
    this.attack = 0.01;
    this.decay = 0.3;
    this.sustain = 0.7;
    this.release = 0.2;
    this.waveform = 'saw'; // 'saw' or 'pulse'
    
    // Note frequency map
    this.noteFrequencies = {
      'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89,
      'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00,
      'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
      'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
      'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
      'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    };
    
    // Base frequency (A2 = 110Hz)
    this.baseFrequency = 110.0;
    
    // Active notes
    this.activeNotes = new Map();
  }
  
  /**
   * Load ARP samples
   */
  async init() {
    try {
      console.log('ARP 2600: Loading samples...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Load sawtooth and pulse samples
      const sawSound = new Audio.Sound();
      await sawSound.loadAsync(require('../../assets/audio/arp_saw.mp3'));
      this.sounds.set('saw', sawSound);
      
      const pulseSound = new Audio.Sound();
      await pulseSound.loadAsync(require('../../assets/audio/arp_pulse.mp3'));
      this.sounds.set('pulse', pulseSound);
      
      this.isLoaded = true;
      console.log('ARP 2600: Samples loaded successfully');
    } catch (error) {
      console.error('ARP 2600: Failed to load samples:', error);
    }
  }
  
  /**
   * Calculate pitch rate for a given note
   */
  calculatePitchRate(note) {
    const targetFreq = this.noteFrequencies[note] || this.baseFrequency;
    return targetFreq / this.baseFrequency;
  }
  
  /**
   * Play a note
   */
  async playNote(note, options = {}) {
    if (!this.isLoaded) {
      console.warn('ARP 2600: Not initialized');
      return;
    }
    
    const {
      velocity = 1.0,
      duration = 0.5,
      gate = true,
    } = options;
    
    try {
      const pitchRate = this.calculatePitchRate(note);
      
      // OSC 1 (main)
      const osc1 = new Audio.Sound();
      await osc1.loadAsync(this.sounds.get(this.waveform)._uri || require('../../assets/audio/arp_saw.mp3'));
      
      // OSC 2 (detuned for thickness)
      const osc2 = new Audio.Sound();
      await osc2.loadAsync(this.sounds.get(this.waveform)._uri || require('../../assets/audio/arp_saw.mp3'));
      
      // Volume envelope
      const envVolume = velocity * this.sustain;
      await osc1.setVolumeAsync(envVolume * this.osc1Level);
      await osc2.setVolumeAsync(envVolume * this.osc2Level);
      
      // Pitch with filter envelope simulation
      const filterEnv = 1 + (this.filterEnvAmount * this.filterCutoff);
      await osc1.setRateAsync(pitchRate * filterEnv, Audio.PitchCorrectionQuality.High);
      await osc2.setRateAsync(pitchRate * filterEnv * (1 + this.osc2Detune), Audio.PitchCorrectionQuality.High);
      
      // Play both oscillators
      await osc1.playAsync();
      await osc2.playAsync();
      
      // Store active notes
      const noteId = `${note}-${Date.now()}`;
      this.activeNotes.set(noteId, { osc1, osc2 });
      
      // Attack phase (fade in)
      setTimeout(async () => {
        try {
          await osc1.setVolumeAsync(velocity * this.osc1Level);
          await osc2.setVolumeAsync(velocity * this.osc2Level);
        } catch (e) {}
      }, this.attack * 100);
      
      // Decay to sustain
      setTimeout(async () => {
        try {
          await osc1.setRateAsync(pitchRate, Audio.PitchCorrectionQuality.High);
          await osc2.setRateAsync(pitchRate * (1 + this.osc2Detune), Audio.PitchCorrectionQuality.High);
          await osc1.setVolumeAsync(envVolume * this.osc1Level);
          await osc2.setVolumeAsync(envVolume * this.osc2Level);
        } catch (e) {}
      }, (this.attack + this.decay) * 100);
      
      // Release
      if (gate) {
        setTimeout(async () => {
          try {
            // Fade out
            await osc1.setVolumeAsync(0);
            await osc2.setVolumeAsync(0);
            
            // Stop and unload
            setTimeout(async () => {
              try {
                await osc1.stopAsync();
                await osc2.stopAsync();
                await osc1.unloadAsync();
                await osc2.unloadAsync();
                this.activeNotes.delete(noteId);
              } catch (e) {}
            }, this.release * 100);
          } catch (e) {}
        }, duration * 1000);
      }
      
    } catch (error) {
      console.error('ARP 2600: Error playing note:', error);
    }
  }
  
  /**
   * Set waveform
   */
  setWaveform(waveform) {
    if (waveform === 'saw' || waveform === 'pulse') {
      this.waveform = waveform;
    }
  }
  
  /**
   * Set oscillator levels
   */
  setOscLevels(osc1, osc2) {
    this.osc1Level = Math.max(0, Math.min(1, osc1));
    this.osc2Level = Math.max(0, Math.min(1, osc2));
  }
  
  /**
   * Set OSC2 detune
   */
  setDetune(value) {
    this.osc2Detune = Math.max(0, Math.min(0.1, value));
  }
  
  /**
   * Set filter parameters
   */
  setFilter(cutoff, resonance, envAmount) {
    this.filterCutoff = Math.max(0, Math.min(1, cutoff));
    this.filterResonance = Math.max(0, Math.min(1, resonance));
    this.filterEnvAmount = Math.max(0, Math.min(1, envAmount));
  }
  
  /**
   * Set envelope (ADSR)
   */
  setEnvelope(attack, decay, sustain, release) {
    this.attack = Math.max(0, Math.min(1, attack));
    this.decay = Math.max(0, Math.min(1, decay));
    this.sustain = Math.max(0, Math.min(1, sustain));
    this.release = Math.max(0, Math.min(1, release));
  }
  
  /**
   * Stop all notes
   */
  async stopAll() {
    for (const [noteId, { osc1, osc2 }] of this.activeNotes) {
      try {
        await osc1.stopAsync();
        await osc2.stopAsync();
        await osc1.unloadAsync();
        await osc2.unloadAsync();
      } catch (e) {}
    }
    this.activeNotes.clear();
  }
  
  /**
   * Cleanup
   */
  async cleanup() {
    await this.stopAll();
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (e) {}
    }
    this.sounds.clear();
    this.isLoaded = false;
  }
}

export default ARP2600;
