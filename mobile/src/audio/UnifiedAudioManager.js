/**
 * HAOS.fm Unified Audio Manager
 * Central coordinator for all audio systems in the mobile app
 * Integrates: Native Audio, Drum Machines, Synthesizers, Sequencers, Effects
 */

import nativeAudioContext from '../audio/NativeAudioContext';
import tr808Bridge from '../drums/TR808Bridge';
import tr909Bridge from '../drums/TR909Bridge';
import arp2600Bridge from '../synths/ARP2600Bridge';
import juno106Bridge from '../synths/Juno106Bridge';
import minimoogBridge from '../synths/MinimoogBridge';
import tb303Bridge from '../synths/TB303Bridge';
import { WavetableEngine, BassArpEngine } from '../AudioEngine';

class UnifiedAudioManager {
  constructor() {
    // Core audio system
    this.nativeContext = nativeAudioContext;
    this.isInitialized = false;
    
    // Drum machines
    this.drumMachines = {
      tr808: tr808Bridge,
      tr909: tr909Bridge,
    };
    
    // Synthesizers
    this.synthesizers = {
      arp2600: arp2600Bridge,
      juno106: juno106Bridge,
      minimoog: minimoogBridge,
      tb303: tb303Bridge,
    };
    
    // Advanced engines
    this.engines = {
      wavetable: null,
      bassArp: null,
    };
    
    // Global parameters
    this.masterVolume = 0.8;
    this.globalTempo = 120;
    this.globalKey = 'C';
    this.globalScale = 'minor';
    
    // Active voices tracking
    this.activeVoices = new Map();
    this.maxVoices = 16;
    
    // Pattern sequencer state
    this.isPlaying = false;
    this.currentStep = 0;
    this.sequenceInterval = null;
    
    // Effects chain
    this.effects = {
      reverb: null,
      delay: null,
      distortion: null,
      filter: null,
      compressor: null,
    };
    
    // Performance monitoring
    this.stats = {
      voiceCount: 0,
      cpuLoad: 0,
      latency: 0,
    };
  }

  /**
   * Initialize the entire audio system
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔊 Audio manager already initialized');
      return;
    }

    try {
      console.log('🎵 Initializing Unified Audio Manager...');
      
      // 1. Initialize native audio context (foundation)
      await this.nativeContext.initialize();
      
      // 2. Initialize all drum machines
      await Promise.all([
        this.drumMachines.tr808.init(),
        this.drumMachines.tr909.init(),
      ]);
      console.log('✅ Drum machines initialized');
      
      // 3. Initialize all synthesizers
      await Promise.all([
        this.synthesizers.arp2600.init(),
        this.synthesizers.juno106.init(),
        this.synthesizers.minimoog.init(),
        this.synthesizers.tb303.init(),
      ]);
      console.log('✅ Synthesizers initialized');
      
      // 4. Initialize advanced engines
      this.engines.wavetable = new WavetableEngine();
      this.engines.bassArp = new BassArpEngine();
      await Promise.all([
        this.engines.wavetable.initialize(),
        this.engines.bassArp.initialize(),
      ]);
      console.log('✅ Advanced engines initialized');
      
      // 5. Setup effects chain
      await this.initializeEffects();
      console.log('✅ Effects chain initialized');
      
      this.isInitialized = true;
      
      console.log('🚀 Unified Audio Manager fully initialized');
      console.log('   Sample Rate:', this.nativeContext.getContext().sampleRate, 'Hz');
      console.log('   Max Voices:', this.maxVoices);
      console.log('   Drum Machines:', Object.keys(this.drumMachines).length);
      console.log('   Synthesizers:', Object.keys(this.synthesizers).length);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio manager:', error);
      throw error;
    }
  }

  /**
   * Initialize effects chain
   */
  async initializeEffects() {
    const context = this.nativeContext.getContext();
    const masterGain = this.nativeContext.getMasterGain();
    
    // Create reverb
    this.effects.reverb = {
      convolver: context.createConvolver(),
      wet: context.createGain(),
      dry: context.createGain(),
      enabled: false,
    };
    this.effects.reverb.wet.gain.value = 0.3;
    this.effects.reverb.dry.gain.value = 0.7;
    
    // Create delay
    this.effects.delay = {
      delay: context.createDelay(2.0),
      feedback: context.createGain(),
      wet: context.createGain(),
      enabled: false,
    };
    this.effects.delay.delay.delayTime.value = 0.375; // Dotted 8th at 120 BPM
    this.effects.delay.feedback.gain.value = 0.4;
    this.effects.delay.wet.gain.value = 0.3;
    
    // Create filter
    this.effects.filter = {
      filter: context.createBiquadFilter(),
      enabled: false,
    };
    this.effects.filter.filter.type = 'lowpass';
    this.effects.filter.filter.frequency.value = 2000;
    this.effects.filter.filter.Q.value = 1;
    
    // Create compressor
    this.effects.compressor = context.createDynamicsCompressor();
    this.effects.compressor.threshold.value = -24;
    this.effects.compressor.knee.value = 10;
    this.effects.compressor.ratio.value = 8;
    this.effects.compressor.attack.value = 0.003;
    this.effects.compressor.release.value = 0.25;
    
    // Connect compressor to master
    this.effects.compressor.connect(masterGain);
    
    console.log('Effects chain ready');
  }

  /**
   * Resume audio (required after user interaction on iOS)
   */
  async resume() {
    await this.nativeContext.resume();
  }

  /**
   * Play a drum sound
   */
  async playDrum(machine, drum, velocity = 1.0) {
    await this.resume();
    
    switch (machine) {
      case 'tr808':
        switch (drum) {
          case 'kick': this.drumMachines.tr808.playKick(velocity); break;
          case 'snare': this.drumMachines.tr808.playSnare(velocity); break;
          case 'hihat': this.drumMachines.tr808.playHihat(velocity, false); break;
          case 'openhat': this.drumMachines.tr808.playHihat(velocity, true); break;
          case 'clap': this.drumMachines.tr808.playClap(velocity); break;
        }
        break;
        
      case 'tr909':
        switch (drum) {
          case 'kick': this.drumMachines.tr909.playKick(velocity); break;
          case 'snare': this.drumMachines.tr909.playSnare(velocity); break;
          case 'hihat': this.drumMachines.tr909.playHihat(velocity, false); break;
          case 'openhat': this.drumMachines.tr909.playHihat(velocity, true); break;
          case 'clap': this.drumMachines.tr909.playClap(velocity); break;
        }
        break;
    }
    
    this.updateStats();
  }

  /**
   * Play a synth note
   */
  async playSynthNote(synth, note, velocity = 1.0, duration = 1.0) {
    await this.resume();
    
    const voiceId = `${synth}_${note}_${Date.now()}`;
    
    switch (synth) {
      case 'arp2600':
        this.synthesizers.arp2600.playNote(note, velocity, duration);
        break;
      case 'juno106':
        this.synthesizers.juno106.playNote(note, velocity, duration);
        break;
      case 'minimoog':
        this.synthesizers.minimoog.playNote(note, velocity, duration);
        break;
      case 'tb303':
        this.synthesizers.tb303.playNote(note, velocity, duration);
        break;
    }
    
    // Track active voice
    this.activeVoices.set(voiceId, {
      synth,
      note,
      startTime: Date.now(),
      duration: duration * 1000,
    });
    
    // Clean up voice after duration
    setTimeout(() => {
      this.activeVoices.delete(voiceId);
      this.updateStats();
    }, duration * 1000);
    
    // Voice limit management
    if (this.activeVoices.size > this.maxVoices) {
      const oldestVoice = Array.from(this.activeVoices.keys())[0];
      this.activeVoices.delete(oldestVoice);
      console.warn('⚠️ Voice limit reached, oldest voice removed');
    }
    
    this.updateStats();
  }

  /**
   * Set synth parameters
   */
  setSynthParameter(synth, param, value) {
    switch (synth) {
      case 'arp2600':
        if (param === 'cutoff') this.synthesizers.arp2600.setFilterCutoff(value);
        if (param === 'resonance') this.synthesizers.arp2600.setFilterResonance(value);
        if (param === 'osc1Level') this.synthesizers.arp2600.setOsc1Level(value);
        if (param === 'osc2Level') this.synthesizers.arp2600.setOsc2Level(value);
        break;
        
      case 'juno106':
        if (param === 'cutoff') this.synthesizers.juno106.setCutoff(value);
        if (param === 'resonance') this.synthesizers.juno106.setResonance(value);
        if (param === 'chorusDepth') this.synthesizers.juno106.setChorusDepth(value);
        break;
        
      case 'minimoog':
        if (param === 'cutoff') this.synthesizers.minimoog.setCutoff(value);
        if (param === 'resonance') this.synthesizers.minimoog.setResonance(value);
        if (param === 'osc1Level') this.synthesizers.minimoog.setOscLevels(value, undefined, undefined);
        break;
        
      case 'tb303':
        if (param === 'cutoff') this.synthesizers.tb303.setCutoff(value);
        if (param === 'resonance') this.synthesizers.tb303.setResonance(value);
        if (param === 'envMod') this.synthesizers.tb303.setEnvMod(value);
        break;
    }
  }

  /**
   * Set envelope for a synth
   */
  setSynthEnvelope(synth, attack, decay, sustain, release) {
    switch (synth) {
      case 'arp2600':
        this.synthesizers.arp2600.setEnvelope(attack, decay, sustain, release);
        break;
      case 'juno106':
        this.synthesizers.juno106.setEnvelope(attack, decay, sustain, release);
        break;
      case 'minimoog':
        this.synthesizers.minimoog.setEnvelope(attack, decay, sustain, release);
        break;
    }
  }

  /**
   * Set global tempo
   */
  setTempo(bpm) {
    this.globalTempo = Math.max(40, Math.min(300, bpm));
    
    // Update sequencer if playing
    if (this.isPlaying && this.sequenceInterval) {
      this.stopSequence();
      this.startSequence();
    }
    
    console.log('🎵 Tempo set to', this.globalTempo, 'BPM');
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.nativeContext.getMasterGain().gain.value = this.masterVolume;
    console.log('🔊 Master volume:', (this.masterVolume * 100).toFixed(0) + '%');
  }

  /**
   * Start pattern sequence
   */
  startSequence(pattern = null) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentStep = 0;
    
    const stepTime = (60 / this.globalTempo) * 250; // 16th notes in ms
    
    this.sequenceInterval = setInterval(() => {
      // Play pattern if provided
      if (pattern && pattern[this.currentStep]) {
        const stepData = pattern[this.currentStep];
        
        // Play drums
        if (stepData.drums) {
          Object.entries(stepData.drums).forEach(([drum, velocity]) => {
            if (velocity > 0) {
              this.playDrum(stepData.drumMachine || 'tr909', drum, velocity);
            }
          });
        }
        
        // Play notes
        if (stepData.notes) {
          stepData.notes.forEach(({ synth, note, velocity, duration }) => {
            this.playSynthNote(synth, note, velocity, duration);
          });
        }
      }
      
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepTime);
    
    console.log('▶️ Sequence started at', this.globalTempo, 'BPM');
  }

  /**
   * Stop pattern sequence
   */
  stopSequence() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    if (this.sequenceInterval) {
      clearInterval(this.sequenceInterval);
      this.sequenceInterval = null;
    }
    this.currentStep = 0;
    
    console.log('⏹️ Sequence stopped');
  }

  /**
   * Toggle effect
   */
  toggleEffect(effectName, enabled) {
    if (this.effects[effectName]) {
      this.effects[effectName].enabled = enabled;
      console.log(`🎛️ ${effectName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Set effect parameter
   */
  setEffectParameter(effect, param, value) {
    switch (effect) {
      case 'delay':
        if (param === 'time') this.effects.delay.delay.delayTime.value = value;
        if (param === 'feedback') this.effects.delay.feedback.gain.value = value;
        if (param === 'wet') this.effects.delay.wet.gain.value = value;
        break;
        
      case 'filter':
        if (param === 'frequency') this.effects.filter.filter.frequency.value = value;
        if (param === 'q') this.effects.filter.filter.Q.value = value;
        if (param === 'type') this.effects.filter.filter.type = value;
        break;
        
      case 'reverb':
        if (param === 'wet') this.effects.reverb.wet.gain.value = value;
        if (param === 'dry') this.effects.reverb.dry.gain.value = value;
        break;
    }
  }

  /**
   * Update performance stats
   */
  updateStats() {
    this.stats.voiceCount = this.activeVoices.size;
    
    // Estimate CPU load based on active voices
    this.stats.cpuLoad = (this.activeVoices.size / this.maxVoices) * 100;
    
    // Get latency from audio context
    const context = this.nativeContext.getContext();
    this.stats.latency = (context.baseLatency || 0) * 1000; // Convert to ms
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      ...this.stats,
      sampleRate: this.nativeContext.getContext().sampleRate,
      state: this.nativeContext.getContext().state,
      isInitialized: this.isInitialized,
      isPlaying: this.isPlaying,
      currentStep: this.currentStep,
      tempo: this.globalTempo,
      masterVolume: this.masterVolume,
    };
  }

  /**
   * Emergency stop all sounds
   */
  panicStop() {
    console.log('🛑 PANIC STOP - Clearing all voices');
    
    // Stop sequence
    this.stopSequence();
    
    // Clear active voices
    this.activeVoices.clear();
    
    // Stop all drum machines
    Object.values(this.drumMachines).forEach(machine => {
      if (machine.stopAll) machine.stopAll();
    });
    
    // Reset stats
    this.updateStats();
  }

  /**
   * Shutdown audio system
   */
  async shutdown() {
    console.log('🔌 Shutting down audio system...');
    
    this.panicStop();
    
    // Close audio context
    if (this.nativeContext.getContext()) {
      await this.nativeContext.getContext().close();
    }
    
    this.isInitialized = false;
    console.log('✅ Audio system shut down');
  }
}

// Singleton instance
const unifiedAudioManager = new UnifiedAudioManager();

export default unifiedAudioManager;
