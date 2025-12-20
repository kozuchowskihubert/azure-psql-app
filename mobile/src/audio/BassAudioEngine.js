/**
 * Bass Audio Engine - Matching web bass-engine.js
 * Professional bass synthesizer with dual oscillators, filter, ADSR, and effects
 */

import { NativeAudioContext } from '../audio/NativeAudioContext';

// Bass presets matching web version
const PRESETS = {
  sub: {
    name: 'Sub Bass',
    osc1Level: 0.9,
    osc2Level: 0.3,
    detune: 0,
    cutoff: 200,
    resonance: 2,
    envAmount: 0.3,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.9,
    release: 0.3,
    distortion: 10,
    chorus: 10,
    compression: 60,
  },
  reese: {
    name: 'Reese Bass',
    osc1Level: 0.8,
    osc2Level: 0.8,
    detune: 15,
    cutoff: 800,
    resonance: 8,
    envAmount: 0.6,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    distortion: 30,
    chorus: 40,
    compression: 70,
  },
  acid: {
    name: 'Acid Bass',
    osc1Level: 0.7,
    osc2Level: 0.5,
    detune: 7,
    cutoff: 1500,
    resonance: 15,
    envAmount: 0.9,
    attack: 0.001,
    decay: 0.2,
    sustain: 0.3,
    release: 0.2,
    distortion: 40,
    chorus: 20,
    compression: 50,
  },
  funk: {
    name: 'Funk Bass',
    osc1Level: 0.8,
    osc2Level: 0.4,
    detune: 5,
    cutoff: 2000,
    resonance: 5,
    envAmount: 0.5,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.6,
    release: 0.1,
    distortion: 20,
    chorus: 30,
    compression: 65,
  },
  growl: {
    name: 'Growl Bass',
    osc1Level: 0.9,
    osc2Level: 0.7,
    detune: 20,
    cutoff: 600,
    resonance: 12,
    envAmount: 0.8,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.5,
    release: 0.6,
    distortion: 60,
    chorus: 25,
    compression: 80,
  },
  '808': {
    name: '808 Bass',
    osc1Level: 1.0,
    osc2Level: 0.0,
    detune: 0,
    cutoff: 150,
    resonance: 1,
    envAmount: 0.2,
    attack: 0.001,
    decay: 0.5,
    sustain: 0.0,
    release: 0.5,
    distortion: 5,
    chorus: 0,
    compression: 90,
  },
  wobble: {
    name: 'Wobble Bass',
    osc1Level: 0.8,
    osc2Level: 0.6,
    detune: 10,
    cutoff: 1000,
    resonance: 18,
    envAmount: 0.7,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.8,
    release: 0.3,
    distortion: 50,
    chorus: 35,
    compression: 75,
  },
  dnb: {
    name: 'DnB Bass',
    osc1Level: 0.9,
    osc2Level: 0.8,
    detune: 25,
    cutoff: 1200,
    resonance: 10,
    envAmount: 0.6,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    distortion: 45,
    chorus: 30,
    compression: 85,
  },
};

export default class BassAudioEngine {
  constructor() {
    this.context = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.isRecording = false;
    this.currentPreset = 'sub';
    
    // Default parameters
    this.params = {
      osc1Level: 0.8,
      osc2Level: 0.6,
      detune: 5,
      cutoff: 1000,
      resonance: 5,
      envAmount: 0.5,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
      distortion: 20,
      chorus: 30,
      compression: 50,
    };

    // Active voices for polyphony
    this.voices = [];
    this.maxVoices = 8;

    // Recording buffer
    this.recordingBuffer = [];
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.context = NativeAudioContext;
      await this.context.initialize();
      this.isInitialized = true;
      
      // Load default preset
      this.loadPreset(this.currentPreset);
      
      console.log('Bass Audio Engine initialized');
    } catch (error) {
      console.error('Failed to initialize Bass Audio Engine:', error);
    }
  }

  loadPreset(presetId) {
    if (PRESETS[presetId]) {
      this.currentPreset = presetId;
      this.params = { ...PRESETS[presetId] };
      console.log(`Loaded preset: ${PRESETS[presetId].name}`);
    }
  }

  setParameter(param, value) {
    if (this.params.hasOwnProperty(param)) {
      this.params[param] = value;
      
      // Update active voices if needed
      this.voices.forEach(voice => {
        if (voice.params && voice.params[param] !== undefined) {
          voice.params[param] = value;
        }
      });
    }
  }

  play() {
    if (!this.isInitialized) {
      console.warn('Bass engine not initialized');
      return;
    }

    this.isPlaying = true;
    
    // Play a demo pattern
    this.playDemoPattern();
  }

  stop() {
    this.isPlaying = false;
    
    // Stop all active voices
    this.voices.forEach(voice => {
      if (voice.stopTime) {
        voice.stopTime();
      }
    });
    this.voices = [];
  }

  playDemoPattern() {
    if (!this.isPlaying) return;

    // Play bass notes in a pattern
    const notes = [40, 40, 43, 40, 38, 40, 43, 45]; // E1, E1, G1, E1, D1, E1, G1, A1
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isPlaying) return;

      const note = notes[noteIndex];
      this.playNote(note, 0.8, 0.5);

      noteIndex = (noteIndex + 1) % notes.length;
      
      // Schedule next note
      setTimeout(playNextNote, 500);
    };

    playNextNote();
  }

  playNote(midiNote, velocity = 0.8, duration = 1.0) {
    if (!this.isInitialized || !this.context) return;

    // Remove oldest voice if max voices reached
    if (this.voices.length >= this.maxVoices) {
      const oldVoice = this.voices.shift();
      if (oldVoice.stopTime) {
        oldVoice.stopTime();
      }
    }

    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Create voice with parameters
    const voice = {
      midiNote,
      frequency,
      velocity,
      params: { ...this.params },
      startTime: Date.now(),
    };

    // Play through native audio context
    try {
      // Use the bass synthesis method if available
      if (this.context.playBassNote) {
        this.context.playBassNote(frequency, velocity, duration, this.params);
      } else {
        // Fallback to basic note playback
        this.context.playNote(midiNote, velocity, duration);
      }

      this.voices.push(voice);

      // Record if recording
      if (this.isRecording) {
        this.recordingBuffer.push({
          midiNote,
          velocity,
          duration,
          time: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error playing bass note:', error);
    }
  }

  startRecording() {
    this.isRecording = true;
    this.recordingBuffer = [];
    console.log('Recording started');
  }

  stopRecording() {
    this.isRecording = false;
    console.log(`Recording stopped. Captured ${this.recordingBuffer.length} notes`);
  }

  exportWAV() {
    console.log('Exporting WAV...');
    // TODO: Implement WAV export
    // This would require capturing audio output and encoding to WAV format
    alert('WAV export coming soon!');
  }

  exportMIDI() {
    console.log('Exporting MIDI...');
    
    if (this.recordingBuffer.length === 0) {
      alert('No recording to export. Start recording first!');
      return;
    }

    // TODO: Implement MIDI file generation
    // This would create a standard MIDI file from the recording buffer
    alert(`MIDI export coming soon! ${this.recordingBuffer.length} notes recorded.`);
  }

  savePreset(customParams) {
    const presetName = prompt('Enter preset name:');
    if (!presetName) return;

    // Save to local storage
    try {
      const savedPresets = JSON.parse(localStorage.getItem('bassPresets') || '{}');
      savedPresets[presetName] = { ...customParams, name: presetName };
      localStorage.setItem('bassPresets', JSON.stringify(savedPresets));
      console.log(`Preset saved: ${presetName}`);
      alert(`Preset "${presetName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Failed to save preset');
    }
  }

  loadPresetFromFile() {
    // TODO: Implement preset loading from file picker
    console.log('Load preset from file');
    alert('Load preset feature coming soon!');
  }

  cleanup() {
    this.stop();
    this.voices = [];
    this.recordingBuffer = [];
    this.isInitialized = false;
    console.log('Bass Audio Engine cleaned up');
  }
}
