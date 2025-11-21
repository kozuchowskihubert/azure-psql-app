/**
 * Web Audio Synthesizer Engine
 * JavaScript implementation of Behringer 2600 for browser playback
 */

class Synth2600 {
  constructor(audioContext) {
    this.ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
    
    // Active voices
    this.voices = new Map();
    this.currentPreset = null;
  }
  
  /**
   * Load a preset configuration
   */
  loadPreset(preset) {
    this.currentPreset = preset;
    console.log('Loaded preset:', preset.name);
  }
  
  /**
   * Play a note with the current preset
   */
  playNote(note, duration = 1.0, velocity = 100) {
    if (!this.currentPreset) {
      console.warn('No preset loaded');
      return;
    }
    
    const now = this.ctx.currentTime;
    const frequency = this.midiToFrequency(note);
    const vel = velocity / 127;
    
    // Create voice
    const voice = this.createVoice(frequency, vel, duration);
    this.voices.set(note, voice);
    
    // Schedule note off
    setTimeout(() => {
      this.stopNote(note);
    }, duration * 1000);
  }
  
  /**
   * Create a synthesizer voice based on current preset
   */
  createVoice(frequency, velocity, duration) {
    const now = this.ctx.currentTime;
    const preset = this.currentPreset;
    
    // Create oscillators based on preset patch
    const oscillators = [];
    const gains = [];
    
    // Analyze preset to determine which oscillators to use
    const usedOscillators = this.getUsedOscillators(preset);
    
    usedOscillators.forEach(oscConfig => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      // Set waveform
      osc.type = this.getWaveformType(oscConfig.waveform);
      
      // Set frequency (with detuning if specified)
      const baseFreq = oscConfig.frequency || frequency;
      const fineTune = oscConfig.fine_tune || 0;
      osc.frequency.value = baseFreq * Math.pow(2, fineTune / 1200);
      
      // Connect oscillator
      osc.connect(oscGain);
      oscillators.push(osc);
      gains.push(oscGain);
    });
    
    // Create filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = this.getFilterType(preset);
    
    // Get filter settings from preset
    const filterSettings = this.getFilterSettings(preset);
    filter.frequency.value = filterSettings.cutoff * 10000 + 20;
    filter.Q.value = filterSettings.resonance * 20;
    
    // Create VCA
    const vca = this.ctx.createGain();
    vca.gain.value = 0;
    
    // Connect signal path
    gains.forEach(g => g.connect(filter));
    filter.connect(vca);
    vca.connect(this.masterGain);
    
    // Apply envelopes
    const env = this.getEnvelopeSettings(preset, 'ENV1');
    this.applyEnvelope(vca.gain, env, velocity, now, duration);
    
    // Filter envelope
    const filterEnv = this.getEnvelopeSettings(preset, 'ENV2');
    if (filterEnv) {
      const envAmount = this.getFilterEnvelopeAmount(preset);
      this.applyFilterEnvelope(filter.frequency, filterEnv, envAmount, now, duration);
    }
    
    // Apply LFO modulation if present
    this.applyLFOModulation(preset, oscillators, filter, now);
    
    // Start oscillators
    oscillators.forEach(osc => osc.start(now));
    
    // Stop oscillators after release
    const totalDuration = duration + (env.release || 0.5);
    oscillators.forEach(osc => osc.stop(now + totalDuration));
    
    return {
      oscillators,
      gains,
      filter,
      vca,
      startTime: now
    };
  }
  
  /**
   * Apply ADSR envelope to a parameter
   */
  applyEnvelope(param, env, velocity, startTime, noteDuration) {
    const attack = env.attack || 0.01;
    const decay = env.decay || 0.1;
    const sustain = env.sustain || 0.7;
    const release = env.release || 0.3;
    
    const peakLevel = velocity;
    const sustainLevel = peakLevel * sustain;
    
    // Attack
    param.setValueAtTime(0, startTime);
    param.linearRampToValueAtTime(peakLevel, startTime + attack);
    
    // Decay
    param.linearRampToValueAtTime(sustainLevel, startTime + attack + decay);
    
    // Sustain (hold at sustain level)
    param.setValueAtTime(sustainLevel, startTime + noteDuration);
    
    // Release
    param.linearRampToValueAtTime(0, startTime + noteDuration + release);
  }
  
  /**
   * Apply filter envelope
   */
  applyFilterEnvelope(param, env, amount, startTime, noteDuration) {
    const attack = env.attack || 0.01;
    const decay = env.decay || 0.2;
    const sustain = env.sustain || 0.3;
    const release = env.release || 0.2;
    
    const baseValue = param.value;
    const peakValue = baseValue + (amount * 5000);
    const sustainValue = baseValue + (amount * sustain * 5000);
    
    param.setValueAtTime(baseValue, startTime);
    param.linearRampToValueAtTime(peakValue, startTime + attack);
    param.linearRampToValueAtTime(sustainValue, startTime + attack + decay);
    param.setValueAtTime(sustainValue, startTime + noteDuration);
    param.linearRampToValueAtTime(baseValue, startTime + noteDuration + release);
  }
  
  /**
   * Apply LFO modulation
   */
  applyLFOModulation(preset, oscillators, filter, startTime) {
    // Check if preset uses LFO
    const lfoSettings = this.getLFOSettings(preset);
    if (!lfoSettings) return;
    
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    
    lfo.type = lfoSettings.waveform || 'sine';
    lfo.frequency.value = lfoSettings.rate * 10; // 0-10 Hz
    lfoGain.gain.value = lfoSettings.depth * 50; // Modulation depth
    
    lfo.connect(lfoGain);
    
    // Connect to filter cutoff or oscillator FM based on patch
    const lfoTarget = this.getLFOTarget(preset);
    if (lfoTarget === 'filter') {
      lfoGain.connect(filter.frequency);
    } else if (lfoTarget === 'pitch') {
      oscillators.forEach(osc => lfoGain.connect(osc.frequency));
    }
    
    lfo.start(startTime);
    lfo.stop(startTime + 10); // Run for 10 seconds
  }
  
  /**
   * Stop a note
   */
  stopNote(note) {
    const voice = this.voices.get(note);
    if (voice) {
      // Note off is handled by envelope release
      this.voices.delete(note);
    }
  }
  
  /**
   * Helper: Get used oscillators from preset
   */
  getUsedOscillators(preset) {
    const oscillators = [];
    
    // Check which VCOs are patched
    preset.patch_cables.forEach(cable => {
      const source = cable.source.module;
      if (source.startsWith('VCO')) {
        const module = preset.modules[source];
        if (module) {
          oscillators.push({
            name: source,
            waveform: module.parameters.waveform || 'sawtooth',
            frequency: module.parameters.frequency,
            fine_tune: module.parameters.fine_tune
          });
        }
      }
    });
    
    // If no oscillators found in modules, use default
    if (oscillators.length === 0) {
      oscillators.push({
        name: 'VCO1',
        waveform: 'sawtooth',
        frequency: 440,
        fine_tune: 0
      });
    }
    
    return oscillators;
  }
  
  /**
   * Helper: Get filter type from preset
   */
  getFilterType(preset) {
    // Check VCF module for filter mode
    const vcfModule = preset.modules.VCF;
    if (vcfModule && vcfModule.parameters.mode) {
      const mode = vcfModule.parameters.mode;
      if (mode === 'HP') return 'highpass';
      if (mode === 'BP') return 'bandpass';
      if (mode === 'LP') return 'lowpass';
    }
    return 'lowpass'; // Default
  }
  
  /**
   * Helper: Get filter settings
   */
  getFilterSettings(preset) {
    const vcfModule = preset.modules.VCF;
    if (vcfModule) {
      return {
        cutoff: vcfModule.parameters.cutoff || 0.5,
        resonance: vcfModule.parameters.resonance || 0.1
      };
    }
    return { cutoff: 0.5, resonance: 0.1 };
  }
  
  /**
   * Helper: Get envelope settings
   */
  getEnvelopeSettings(preset, envName) {
    const envData = preset.modulators[envName];
    if (envData) {
      return {
        attack: envData.attack || 0.01,
        decay: envData.decay || 0.1,
        sustain: envData.sustain || 0.7,
        release: envData.release || 0.3
      };
    }
    return {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3
    };
  }
  
  /**
   * Helper: Get filter envelope amount
   */
  getFilterEnvelopeAmount(preset) {
    // Look for ENV2 -> VCF.CUTOFF_CV connection
    const cable = preset.patch_cables.find(c => 
      c.source.module === 'ENV2' && 
      c.destination.module === 'VCF' &&
      c.destination.input === 'CUTOFF_CV'
    );
    return cable ? cable.source.level : 0.5;
  }
  
  /**
   * Helper: Get LFO settings
   */
  getLFOSettings(preset) {
    return preset.modulators.LFO;
  }
  
  /**
   * Helper: Get LFO target
   */
  getLFOTarget(preset) {
    // Check where LFO is patched
    const lfoConnection = preset.patch_cables.find(c => c.source.module === 'LFO');
    if (lfoConnection) {
      if (lfoConnection.destination.module === 'VCF') return 'filter';
      if (lfoConnection.destination.module.startsWith('VCO')) return 'pitch';
    }
    return 'filter'; // Default
  }
  
  /**
   * Helper: Get waveform type for Web Audio API
   */
  getWaveformType(waveform) {
    const map = {
      'sawtooth': 'sawtooth',
      'saw': 'sawtooth',
      'square': 'square',
      'triangle': 'triangle',
      'sine': 'sine'
    };
    return map[waveform] || 'sawtooth';
  }
  
  /**
   * Helper: Convert MIDI note to frequency
   */
  midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  
  /**
   * Play a sequence of notes
   */
  playSequence(notes, interval = 0.5) {
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playNote(note.midi, note.duration || 0.3, note.velocity || 100);
      }, index * interval * 1000);
    });
  }
  
  /**
   * Stop all voices
   */
  stopAll() {
    this.voices.forEach((voice, note) => {
      this.stopNote(note);
    });
    this.voices.clear();
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.Synth2600 = Synth2600;
}
