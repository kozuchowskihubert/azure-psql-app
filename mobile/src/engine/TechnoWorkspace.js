/**
 * HAOS.fm Techno Workspace Controller
 * Simplified version using expo-av for audio
 * Connects: Sequencer → Drum Machines + Synthesizers → Audio Output
 */

import { Audio } from 'expo-av';
import sequencerEngine from './SequencerEngine';
import tr808Bridge from '../drums/TR808Bridge';
import tr909Bridge from '../drums/TR909Bridge';
import TB303Bridge from '../synths/TB303Bridge';  // Class export
import TD3Bridge from '../synths/TD3Bridge';      // Class export
import arp2600Bridge from '../synths/ARP2600Bridge';
import juno106Bridge from '../synths/Juno106Bridge';
import minimoogBridge from '../synths/MinimoogBridge';

class TechnoWorkspace {
  constructor() {
    this.isInitialized = false;
    
    // Drum machine selection
    this.activeDrumMachine = '808'; // '808' or '909'
    
    // Bass synth selection
    this.activeBassSwitch = 'tb303'; // 'tb303', 'arp2600', 'td3'
    
    // Synth selection  
    this.activeSynthSwitch = 'arp2600'; // 'arp2600', 'juno106', 'minimoog', etc.
    
    // Use singleton instances for drums
    this.tr808 = tr808Bridge;
    this.tr909 = tr909Bridge;
    
    // Create instances for TB303 and TD3 (class exports)
    this.tb303 = new TB303Bridge();
    this.td3 = new TD3Bridge();
    
    // Use singleton instances for other synths
    this.arp2600 = arp2600Bridge;
    this.juno106 = juno106Bridge;
    this.minimoog = minimoogBridge;
    
    // Track volumes
    this.volumes = {
      kick: 1.0,
      snare: 1.0,
      hihat: 0.7,
      clap: 0.8,
      bass: 0.9,
      synth: 0.8,
    };
    
    // Master volume
    this.masterVolume = 0.8;
    
    // Event handlers for UI updates
    this.onStepChange = null;
    this.onBeatChange = null;
    this.onBarChange = null;
    this.onPlayStateChange = null;
  }

  /**
   * Initialize the workspace
   */
  async init() {
    if (this.isInitialized) return true;
    
    try {
      // Set audio mode for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Initialize drum machines (using singleton instances)
      console.log('🥁 Initializing TR-808 drum machine...');
      if (!this.tr808.isInitialized) {
        await this.tr808.init();
      }
      console.log('✅ TR-808 Bridge initialized (classic 808 sound)');
      
      console.log('🥁 Initializing TR-909 drum machine...');
      if (!this.tr909.isInitialized) {
        await this.tr909.init();
      }
      console.log('✅ TR-909 Bridge initialized (harder techno sound)');
      
      // Initialize synthesizers (using singleton instances)
      console.log('🎹 Initializing TB-303 bass...');
      if (!this.tb303.isInitialized) {
        await this.tb303.init();
      }
      console.log('✅ TB-303 Bridge initialized (classic acid bass)');
      
      console.log('🎹 Initializing TD-3 bass...');
      if (!this.td3.isInitialized) {
        await this.td3.init();
      }
      console.log('✅ TD-3 Bridge initialized (aggressive acid bass)');
      
      console.log('🎹 Initializing ARP 2600 modular synth...');
      if (!this.arp2600.isInitialized) {
        await this.arp2600.init();
      }
      console.log('✅ ARP 2600 Bridge initialized (dual-oscillator modular synth)');
      
      console.log('🎹 Initializing Juno-106 synth...');
      if (!this.juno106.isInitialized) {
        await this.juno106.init();
      }
      console.log('✅ Juno-106 Bridge initialized (warm chorus ensemble)');
      
      console.log('🎹 Initializing Minimoog synth...');
      if (!this.minimoog.isInitialized) {
        await this.minimoog.init();
      }
      console.log('✅ Minimoog Bridge initialized (fat analog bass/lead)');
      
      // Setup sequencer callbacks
      this.setupSequencerCallbacks();
      
      this.isInitialized = true;
      console.log('🎛️ Techno Workspace initialized with synths');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize Techno Workspace:', error);
      return false;
    }
  }

  /**
   * Setup sequencer callbacks
   */
  setupSequencerCallbacks() {
    // Step callback - triggers sounds
    sequencerEngine.onStep = (step, activeSteps, bar) => {
      this.triggerStep(step, activeSteps);
      
      if (this.onStepChange) {
        this.onStepChange(step, bar);
      }
    };
    
    // Beat callback
    sequencerEngine.onBeat = (beat) => {
      if (this.onBeatChange) {
        this.onBeatChange(beat);
      }
    };
    
    // Bar callback
    sequencerEngine.onBar = (bar) => {
      if (this.onBarChange) {
        this.onBarChange(bar);
      }
    };
    
    // Stop callback
    sequencerEngine.onStop = () => {
      if (this.onPlayStateChange) {
        this.onPlayStateChange(false);
      }
    };
  }

  /**
   * Trigger sounds for a step
   */
  triggerStep(step, activeSteps) {
    const drumMachine = this.activeDrumMachine === '909' ? this.tr909 : this.tr808;
    const bassSynth = this.getActiveBassSynth();
    
    if (!drumMachine) {
      console.error('❌ Drum machine not initialized!');
      return;
    }
    
    activeSteps.forEach(({ track, velocity, accent, note }) => {
      const vol = velocity * (this.volumes[track] || 1.0);
      
      switch (track) {
        case 'kick':
          console.log(`🥁 Kick (synthesized): velocity=${vol.toFixed(2)}`);
          if (drumMachine.playKick) {
            drumMachine.playKick(vol);
          } else {
            console.error('❌ playKick method not found on drum machine');
          }
          break;
        case 'snare':
          console.log(`🥁 Snare (synthesized): velocity=${vol.toFixed(2)}`);
          if (drumMachine.playSnare) {
            drumMachine.playSnare(vol);
          }
          break;
        case 'hihat':
          console.log(`🥁 Hi-hat (synthesized): velocity=${vol.toFixed(2)}`);
          if (drumMachine.playHihat) {
            drumMachine.playHihat(vol, false);
          }
          break;
        case 'clap':
          console.log(`🥁 Clap (synthesized): velocity=${vol.toFixed(2)}`);
          if (drumMachine.playClap) {
            drumMachine.playClap(vol);
          }
          break;
        case 'bass':
          // Play bass with selected synthesizer
          if (bassSynth && note) {
            console.log(`🎹 Bass: ${note} via ${this.activeBassSwitch}, velocity=${vol.toFixed(2)}`);
            if (bassSynth.playNote) {
              bassSynth.playNote(note, {
                velocity: vol,
                accent: accent || false,
                duration: 0.2,
              });
            }
          } else {
            console.log('🎹 Bass: No note or synth, skipping');
          }
          break;
        case 'synth':
          // Play synth with selected synthesizer (ARP2600, Juno, etc.)
          const synth = this.getActiveSynth();
          if (synth && note) {
            console.log(`🎹 Synth: ${note} via ${this.activeSynthSwitch}, velocity=${vol.toFixed(2)}`);
            if (synth.playNote) {
              synth.playNote(note, {
                velocity: vol,
                accent: accent || false,
                duration: 0.3,
              });
            }
          } else {
            console.log('🎹 Synth: No note or synth, skipping');
          }
          break;
      }
    });
  }
  
  /**
   * Get active bass synthesizer
   */
  getActiveBassSynth() {
    switch (this.activeBassSwitch) {
      case 'tb303':
        return this.tb303;
      case 'arp2600':
        return this.arp2600;
      case 'td3':
        return this.td3;
      default:
        return this.tb303;
    }
  }
  
  /**
   * Get active synth
   */
  getActiveSynth() {
    switch (this.activeSynthSwitch) {
      case 'arp2600':
        return this.arp2600;
      case 'juno106':
        return this.juno106;
      case 'minimoog':
        return this.minimoog;
      case 'tb303':
        return this.tb303;
      default:
        return this.arp2600;
    }
  }
  
  /**
   * Switch bass synthesizer
   */
  setBassSynth(synth) {
    if (['tb303', 'arp2600', 'td3'].includes(synth)) {
      this.activeBassSwitch = synth;
      const synthNames = {
        'tb303': 'TB-303 (classic acid)',
        'arp2600': 'ARP 2600 (modular)',
        'td3': 'TD-3 (aggressive acid)'
      };
      console.log(`🎹 Bass switched to: ${synthNames[synth]}`);
    }
  }

  /**
   * Switch synth
   */
  setSynth(synth) {
    if (['arp2600', 'juno106', 'minimoog', 'tb303'].includes(synth)) {
      this.activeSynthSwitch = synth;
      const synthNames = {
        'arp2600': 'ARP 2600 (modular)',
        'juno106': 'Juno-106 (warm)',
        'minimoog': 'Minimoog (fat)',
        'tb303': 'TB-303 (acid)'
      };
      console.log(`🎹 Synth switched to: ${synthNames[synth]}`);
    }
  }

  /**
   * Switch drum machine
   */
  setDrumMachine(machine) {
    if (['808', '909'].includes(machine)) {
      this.activeDrumMachine = machine;
      const machineNames = {
        '808': 'TR-808 (classic warm)',
        '909': 'TR-909 (harder techno)'
      };
      console.log(`🥁 Drums switched to: ${machineNames[machine]}`);
    }
  }

  /**
   * Start playback
   */
  play() {
    if (!this.isInitialized) {
      this.init().then(() => {
        sequencerEngine.start();
        if (this.onPlayStateChange) {
          this.onPlayStateChange(true);
        }
      });
    } else {
      sequencerEngine.start();
      if (this.onPlayStateChange) {
        this.onPlayStateChange(true);
      }
    }
  }

  /**
   * Stop playback
   */
  stop() {
    sequencerEngine.stop();
  }

  /**
   * Set BPM
   */
  setBPM(bpm) {
    sequencerEngine.setBPM(bpm);
  }

  /**
   * Get current BPM
   */
  getBPM() {
    return sequencerEngine.bpm;
  }

  /**
   * Set swing
   */
  setSwing(amount) {
    sequencerEngine.setSwing(amount);
  }

  /**
   * Toggle step in pattern
   */
  toggleStep(track, step, note = null) {
    return sequencerEngine.toggleStep(track, step, 100, note);
  }

  /**
   * Get step state
   */
  getStep(track, step) {
    return sequencerEngine.getStep(track, step);
  }

  /**
   * Set note for a specific step (for bass and synth tracks)
   */
  setStepNote(track, step, note) {
    if (track === 'bass' || track === 'synth') {
      const stepState = sequencerEngine.getStep(track, step);
      if (stepState && stepState.active) {
        // Update the note for this step
        sequencerEngine.toggleStep(track, step, stepState.velocity || 100, note);
        console.log(`🎵 Updated ${track} step ${step} to note ${note}`);
      }
    }
  }

  /**
   * Switch drum machine
   */
  setDrumMachine(type) {
    if (type === '808' || type === '909') {
      this.activeDrumMachine = type;
      console.log(`🥁 Switched to TR-${type}`);
    }
  }

  /**
   * Get current drum machine
   */
  getDrumMachine() {
    return this.activeDrumMachine;
  }

  /**
   * Set track volume
   */
  setTrackVolume(track, volume) {
    this.volumes[track] = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    tr808.setVolume(volume);
    tr909.setVolume(volume);
  }

  /**
   * Switch pattern bank
   */
  switchBank(bank) {
    sequencerEngine.switchBank(bank);
  }

  /**
   * Get current bank
   */
  getCurrentBank() {
    return sequencerEngine.currentBank;
  }

  /**
   * Load a preset
   */
  loadPreset(presetName) {
    return sequencerEngine.loadPreset(presetName);
  }

  /**
   * Get available presets
   */
  getPresets() {
    return sequencerEngine.getPresetList();
  }

  /**
   * Get TR-808 instance
   */
  getTR808() {
    return tr808;
  }

  /**
   * Get TR-909 instance
   */
  getTR909() {
    return tr909;
  }

  /**
   * Get sequencer state
   */
  getState() {
    return {
      ...sequencerEngine.getState(),
      activeDrumMachine: this.activeDrumMachine,
      masterVolume: this.masterVolume,
      volumes: { ...this.volumes },
    };
  }

  /**
   * Switch bass synth
   */
  setBassSwitch(bassType) {
    if (['tb303', 'td3', 'arp2600'].includes(bassType)) {
      this.activeBassSwitch = bassType;
      console.log(`🎹 Switched to ${bassType.toUpperCase()} bass`);
    }
  }

  /**
   * Get active bass synth
   */
  getBassSwitch() {
    return this.activeBassSwitch;
  }

  /**
   * Load pattern into sequencer
   */
  loadPattern(pattern) {
    if (!pattern || !sequencerEngine) {
      console.error('❌ Cannot load pattern: pattern or sequencer is missing');
      return false;
    }
    
    try {
      // Clear existing pattern
      console.log('🗑️ Clearing existing pattern...');
      sequencerEngine.clearAllSteps();
      
      // Default bass note
      const defaultBassNote = 'C2';
      let totalSteps = 0;
      
      // Load each track
      Object.keys(pattern).forEach(track => {
        const steps = pattern[track];
        let trackSteps = 0;
        
        steps.forEach((active, index) => {
          if (active) {
            // For bass track, add a bass note
            if (track === 'bass') {
              sequencerEngine.toggleStep(track, index, 100, defaultBassNote);
            }
            // For synth track, add a higher note
            else if (track === 'synth') {
              const synthNote = 'C4'; // Higher octave for synth
              sequencerEngine.toggleStep(track, index, 100, synthNote);
            } 
            // For drums, no note needed
            else {
              sequencerEngine.toggleStep(track, index, 100);
            }
            trackSteps++;
            totalSteps++;
          }
        });
        
        if (trackSteps > 0) {
          console.log(`  ✓ ${track}: ${trackSteps} steps`);
        }
      });
      
      console.log(`✅ Pattern loaded with ${totalSteps} total steps`);
      return true;
    } catch (error) {
      console.error('Failed to load pattern:', error);
      return false;
    }
  }

  /**
   * Set multiple track volumes
   */
  setVolumes(volumes) {
    if (!volumes) return;
    
    Object.keys(volumes).forEach(track => {
      if (this.volumes.hasOwnProperty(track)) {
        this.volumes[track] = Math.max(0, Math.min(1, volumes[track]));
      }
    });
    
    console.log('✅ Volumes updated');
  }

  /**
   * Preview a drum sound
   */
  previewDrum(drum) {
    const drumMachine = this.activeDrumMachine === '909' ? tr909 : tr808;
    const vol = 0.8;
    
    switch (drum) {
      case 'kick':
        drumMachine.playKick(vol);
        break;
      case 'snare':
        drumMachine.playSnare(vol);
        break;
      case 'hihat':
        drumMachine.playHihat(vol, false);
        break;
      case 'clap':
        drumMachine.playClap(vol);
        break;
    }
  }

  /**
   * Preview a bass note
   */
  previewBass(note = 'C2') {
    const bassSynth = this.getActiveBassSynth();
    if (bassSynth) {
      bassSynth.playNote(note, {
        velocity: 0.8,
        accent: false,
        duration: 0.3,
      });
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    this.isInitialized = false;
  }
}

// Singleton
const technoWorkspace = new TechnoWorkspace();

export default technoWorkspace;
export { TechnoWorkspace };
