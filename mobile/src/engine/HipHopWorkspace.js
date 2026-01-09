/**
 * HAOS.fm Hip-Hop Studio Workspace
 * Complete production environment with 152 presets, TR-808/909, bass synths, mixer, effects
 * Based on TechnoWorkspace but extended for full Hip-Hop production capabilities
 */

import { Audio } from 'expo-av';
import { PRESET_AUDIO_ASSETS } from '../data/presetAssets';
import sequencerEngine from './SequencerEngine';

// Note to frequency mapping (Hz)
const NOTE_FREQUENCIES = {
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
};

class HipHopWorkspace {
  constructor() {
    this.isInitialized = false;
    
    // Audio instances
    this.sounds = new Map(); // Cache loaded sounds
    
    // Drum machine samples (TR-808 style)
    this.drumKit = {
      kick: null,
      snare: null,
      hihat_closed: null,
      hihat_open: null,
      clap: null,
      tom_low: null,
      tom_mid: null,
      tom_high: null,
      cymbal_crash: null,
      cymbal_ride: null,
    };
    
    // Bass synth presets (10 presets from bass_presets.json)
    this.bassPresets = {
      'bass_sub': null,
      'bass_reese': null,
      'bass_acid': null,
      'bass_growl': null,
      'bass_fm': null,
      'bass_wobble': null,
      'bass_deep_sub': null,
      'bass_808': null,
      'bass_distorted': null,
      'bass_squelch': null,
    };
    
    // Current selections
    this.currentBassPreset = 'bass_808'; // Default for hip-hop
    this.currentDrumKit = '808'; // TR-808
    
    // Mixer settings
    this.mixer = {
      kick: { volume: 1.0, pan: 0, mute: false, solo: false },
      snare: { volume: 0.85, pan: 0, mute: false, solo: false },
      hihat: { volume: 0.65, pan: 0.2, mute: false, solo: false },
      clap: { volume: 0.75, pan: 0, mute: false, solo: false },
      bass: { volume: 0.9, pan: 0, mute: false, solo: false },
      lead: { volume: 0.7, pan: 0, mute: false, solo: false },
      pad: { volume: 0.5, pan: 0, mute: false, solo: false },
      fx: { volume: 0.6, pan: 0, mute: false, solo: false },
      master: { volume: 0.85, pan: 0 },
    };
    
    // Effects settings
    this.effects = {
      reverb: { enabled: false, mix: 0.3, decay: 2.0, size: 0.5 },
      delay: { enabled: false, mix: 0.25, time: 0.5, feedback: 0.4 },
      eq: { low: 0, mid: 0, high: 0 }, // -12 to +12 dB
      compressor: { enabled: true, threshold: -12, ratio: 4, attack: 0.003, release: 0.1 },
    };
    
    // Sequencer settings
    this.bpm = 90; // Standard hip-hop tempo
    this.swing = 0; // 0-100%
    this.currentPattern = 'A';
    
    // Callbacks
    this.onStepChange = null;
    this.onBeatChange = null;
    this.onBarChange = null;
    this.onPlayStateChange = null;
  }

  /**
   * Initialize Hip-Hop Workspace
   */
  async init() {
    if (this.isInitialized) return true;
    
    try {
      console.log('🎤 Initializing Hip-Hop Studio...');
      
      // Set audio mode for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Load drum kit samples
      await this.loadDrumKit();
      
      // Load bass presets (all 10)
      await this.loadBassPresets();
      
      // Setup sequencer callbacks
      this.setupSequencerCallbacks();
      
      // Set initial BPM
      sequencerEngine.setBpm(this.bpm);
      
      this.isInitialized = true;
      console.log('✅ Hip-Hop Studio initialized');
      console.log(`   - Drum kit: ${Object.keys(this.drumKit).length} samples loaded`);
      console.log(`   - Bass presets: ${Object.keys(this.bassPresets).length} presets`);
      console.log(`   - BPM: ${this.bpm}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize Hip-Hop Studio:', error);
      return false;
    }
  }

  /**
   * Load TR-808 drum kit samples
   */
  async loadDrumKit() {
    console.log('🥁 Loading TR-808 drum kit...');
    
    const drumSamples = {
      kick: 'percussion/kick_808_01.wav',
      snare: 'percussion/snare_808_01.wav',
      hihat_closed: 'percussion/hihat_closed_01.wav',
      hihat_open: 'percussion/hihat_open_01.wav',
      clap: 'percussion/clap_808_01.wav',
      tom_low: 'percussion/tom_low_01.wav',
      tom_mid: 'percussion/tom_mid_01.wav',
      tom_high: 'percussion/tom_high_01.wav',
      cymbal_crash: 'percussion/crash_01.wav',
      cymbal_ride: 'percussion/ride_01.wav',
    };
    
    for (const [name, path] of Object.entries(drumSamples)) {
      try {
        const asset = PRESET_AUDIO_ASSETS[path];
        if (asset) {
          const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: false,
            volume: 1.0,
          });
          this.drumKit[name] = sound;
          console.log(`  ✓ Loaded ${name}`);
        } else {
          console.warn(`  ⚠️  Sample not found: ${path}`);
        }
      } catch (error) {
        console.error(`  ❌ Error loading ${name}:`, error.message);
      }
    }
  }

  /**
   * Load all bass presets (10 presets × 3 notes)
   */
  async loadBassPresets() {
    console.log('🎹 Loading bass presets...');
    
    const presetIds = [
      'bass_sub', 'bass_reese', 'bass_acid', 'bass_growl', 'bass_fm',
      'bass_wobble', 'bass_deep_sub', 'bass_808', 'bass_distorted', 'bass_squelch'
    ];
    
    for (const presetId of presetIds) {
      try {
        // Load C2 note (main bass note)
        const path = `bass/${presetId}_C2.wav`;
        const asset = PRESET_AUDIO_ASSETS[path];
        
        if (asset) {
          const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: false,
            volume: 1.0,
          });
          this.bassPresets[presetId] = sound;
          console.log(`  ✓ Loaded ${presetId}`);
        } else {
          console.warn(`  ⚠️  Preset not found: ${path}`);
        }
      } catch (error) {
        console.error(`  ❌ Error loading ${presetId}:`, error.message);
      }
    }
  }

  /**
   * Setup sequencer callbacks
   */
  setupSequencerCallbacks() {
    sequencerEngine.onStep = (step, activeSteps, bar) => {
      this.triggerStep(step, activeSteps);
      
      if (this.onStepChange) {
        this.onStepChange(step, bar);
      }
    };
    
    sequencerEngine.onBeat = (beat) => {
      if (this.onBeatChange) {
        this.onBeatChange(beat);
      }
    };
    
    sequencerEngine.onBar = (bar) => {
      if (this.onBarChange) {
        this.onBarChange(bar);
      }
    };
    
    sequencerEngine.onStop = () => {
      if (this.onPlayStateChange) {
        this.onPlayStateChange(false);
      }
    };
  }

  /**
   * Trigger sounds for a step
   */
  async triggerStep(step, activeSteps) {
    for (const { track, velocity, accent, note } of activeSteps) {
      const channelSettings = this.mixer[track] || { volume: 1.0, pan: 0, mute: false, solo: false };
      
      // Check mute/solo
      if (channelSettings.mute) continue;
      
      // Calculate final volume
      const channelVol = channelSettings.volume * (accent ? 1.2 : 1.0);
      const finalVol = channelVol * this.mixer.master.volume * velocity;
      
      try {
        switch (track) {
          case 'kick':
            await this.playDrum('kick', finalVol);
            break;
          case 'snare':
            await this.playDrum('snare', finalVol);
            break;
          case 'hihat':
            await this.playDrum('hihat_closed', finalVol);
            break;
          case 'hihat_open':
            await this.playDrum('hihat_open', finalVol);
            break;
          case 'clap':
            await this.playDrum('clap', finalVol);
            break;
          case 'tom_low':
          case 'tom_mid':
          case 'tom_high':
            await this.playDrum(track, finalVol);
            break;
          case 'bass':
            if (note) {
              await this.playBass(note, finalVol);
            }
            break;
          case 'lead':
          case 'pad':
          case 'synth':
            if (note) {
              await this.playSynth(track, note, finalVol);
            }
            break;
        }
      } catch (error) {
        console.error(`Error triggering ${track}:`, error.message);
      }
    }
  }

  /**
   * Play drum sound
   */
  async playDrum(drumName, volume = 1.0) {
    const sound = this.drumKit[drumName];
    if (!sound) {
      console.warn(`Drum sound not loaded: ${drumName}`);
      return;
    }
    
    try {
      // Stop previous playback
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Set volume
      await sound.setVolumeAsync(Math.min(1.0, Math.max(0.0, volume)));
      
      // Play
      await sound.playAsync();
    } catch (error) {
      console.error(`Error playing drum ${drumName}:`, error.message);
    }
  }

  /**
   * Play bass note
   */
  async playBass(note, volume = 1.0) {
    const sound = this.bassPresets[this.currentBassPreset];
    if (!sound) {
      console.warn(`Bass preset not loaded: ${this.currentBassPreset}`);
      return;
    }
    
    try {
      // Stop previous playback
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Set volume
      await sound.setVolumeAsync(Math.min(1.0, Math.max(0.0, volume)));
      
      // Calculate pitch shift based on note
      // Base note is C2 (65.41 Hz)
      const baseFreq = NOTE_FREQUENCIES['C2'];
      const targetFreq = NOTE_FREQUENCIES[note];
      
      if (targetFreq && baseFreq) {
        const pitchRatio = targetFreq / baseFreq;
        await sound.setRateAsync(pitchRatio, true, Audio.PitchCorrectionQuality.High);
      }
      
      // Play
      await sound.playAsync();
    } catch (error) {
      console.error(`Error playing bass ${note}:`, error.message);
    }
  }

  /**
   * Play synth note (lead, pad, etc.)
   */
  async playSynth(track, note, volume = 1.0) {
    // TODO: Load and play lead/pad samples
    console.log(`🎹 Synth ${track}: ${note} @ ${volume.toFixed(2)}`);
  }

  /**
   * Change bass preset
   */
  setBassPreset(presetId) {
    if (this.bassPresets[presetId]) {
      this.currentBassPreset = presetId;
      console.log(`🎹 Bass preset changed to: ${presetId}`);
    } else {
      console.warn(`Bass preset not found: ${presetId}`);
    }
  }

  /**
   * Set mixer channel volume
   */
  setChannelVolume(channel, volume) {
    if (this.mixer[channel]) {
      this.mixer[channel].volume = Math.min(1.0, Math.max(0.0, volume));
    }
  }

  /**
   * Toggle channel mute
   */
  toggleMute(channel) {
    if (this.mixer[channel]) {
      this.mixer[channel].mute = !this.mixer[channel].mute;
      return this.mixer[channel].mute;
    }
    return false;
  }

  /**
   * Toggle channel solo
   */
  toggleSolo(channel) {
    if (this.mixer[channel]) {
      this.mixer[channel].solo = !this.mixer[channel].solo;
      return this.mixer[channel].solo;
    }
    return false;
  }

  /**
   * Set BPM
   */
  setBpm(bpm) {
    this.bpm = Math.min(200, Math.max(60, bpm));
    sequencerEngine.setBpm(this.bpm);
  }

  /**
   * Start playback
   */
  play() {
    if (!this.isInitialized) {
      console.error('❌ Workspace not initialized');
      return false;
    }
    
    sequencerEngine.start();
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(true);
    }
    
    return true;
  }

  /**
   * Stop playback
   */
  stop() {
    sequencerEngine.stop();
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  /**
   * Pause playback
   */
  pause() {
    sequencerEngine.pause();
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: sequencerEngine.isPlaying,
      currentStep: sequencerEngine.currentStep,
      currentBar: sequencerEngine.currentBar,
      bpm: this.bpm,
      swing: this.swing,
      pattern: this.currentPattern,
      bassPreset: this.currentBassPreset,
      drumKit: this.currentDrumKit,
      mixer: { ...this.mixer },
      effects: { ...this.effects },
    };
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log('🧹 Cleaning up Hip-Hop Studio...');
    
    // Stop playback
    this.stop();
    
    // Unload all sounds
    for (const sound of Object.values(this.drumKit)) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading drum sound:', error);
        }
      }
    }
    
    for (const sound of Object.values(this.bassPresets)) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading bass preset:', error);
        }
      }
    }
    
    this.sounds.clear();
    this.isInitialized = false;
    
    console.log('✅ Hip-Hop Studio cleaned up');
  }
}

// Export singleton instance
const hipHopWorkspace = new HipHopWorkspace();
export default hipHopWorkspace;
