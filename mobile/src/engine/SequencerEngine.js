/**
 * HAOS.fm Sequencer Engine
 * Accurate timing engine for step sequencer
 * Supports BPM, swing, pattern banks, and pattern chaining
 * Uses JavaScript timing (no Web Audio dependency)
 */

class SequencerEngine {
  constructor() {
    // Track definitions - MUST be defined first before createEmptyPattern()
    this.tracks = ['kick', 'snare', 'hihat', 'clap', 'bass', 'synth'];
    
    // Timing
    this.bpm = 120;
    this.swing = 0; // 0-100
    this.isPlaying = false;
    this.currentStep = 0;
    this.currentBar = 1;
    this.stepsPerBar = 16;
    
    // Pattern banks
    this.currentBank = 'A';
    this.banks = {
      A: this.createEmptyPattern(),
      B: this.createEmptyPattern(),
      C: this.createEmptyPattern(),
      D: this.createEmptyPattern(),
    };
    
    // Pattern chaining
    this.chain = []; // e.g., ['A', 'A', 'B', 'B']
    this.chainPosition = 0;
    this.chainMode = false;
    
    // Timing internals
    this.startTime = 0;
    this.nextStepTime = 0;
    this.schedulerTimer = null;
    this.scheduleAheadTime = 0.1; // seconds
    this.lookahead = 25; // ms
    
    // Callbacks
    this.onStep = null; // Called when a step is triggered
    this.onBeat = null; // Called on quarter notes
    this.onBar = null;  // Called at start of each bar
    this.onStop = null; // Called when stopped
  }

  /**
   * Create empty pattern
   */
  createEmptyPattern() {
    const pattern = {};
    this.tracks.forEach(track => {
      pattern[track] = new Array(16).fill(null).map(() => ({
        active: false,
        velocity: 100,
        accent: false,
        note: null, // For melodic tracks
      }));
    });
    return pattern;
  }

  /**
   * Get current pattern
   */
  get pattern() {
    return this.banks[this.currentBank];
  }

  /**
   * Calculate step duration in seconds
   */
  getStepDuration() {
    // 16th notes: 4 steps per beat
    const beatDuration = 60 / this.bpm;
    return beatDuration / 4;
  }

  /**
   * Calculate swing delay for even steps
   */
  getSwingDelay(step) {
    // Swing affects even 16th notes (steps 1, 3, 5, 7, etc. in 0-indexed)
    if (this.swing === 0 || step % 2 === 0) {
      return 0;
    }
    
    const stepDuration = this.getStepDuration();
    const maxSwingDelay = stepDuration * 0.5; // Max 50% of step
    return (this.swing / 100) * maxSwingDelay;
  }

  /**
   * Start playback
   */
  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentStep = 0;
    this.currentBar = 1;
    this.chainPosition = 0;
    
    this.startTime = Date.now();
    this.nextStepTime = this.startTime;
    
    // Start scheduler loop
    this.scheduler();
    
    console.log(`▶️ Sequencer started at ${this.bpm} BPM`);
  }

  /**
   * Stop playback
   */
  stop() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    
    if (this.onStop) {
      this.onStop();
    }
    
    console.log('⏹️ Sequencer stopped');
  }

  /**
   * Pause playback (keeps position)
   */
  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    
    console.log('⏸️ Sequencer paused');
  }

  /**
   * Main scheduler loop
   */
  scheduler() {
    const now = Date.now();
    
    // Schedule steps ahead
    while (this.nextStepTime < now + (this.scheduleAheadTime * 1000)) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
    
    // Continue loop
    if (this.isPlaying) {
      this.schedulerTimer = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  /**
   * Schedule a single step
   */
  scheduleStep(step, time) {
    const swingDelay = this.getSwingDelay(step) * 1000; // Convert to ms
    const actualTime = time + swingDelay;
    
    // Get active steps for this position
    const activeSteps = [];
    const pattern = this.pattern;
    
    this.tracks.forEach(track => {
      // Check if track exists in pattern
      if (!pattern[track]) return;
      
      const stepData = pattern[track][step];
      if (stepData && stepData.active) {
        activeSteps.push({
          track,
          velocity: stepData.velocity / 100,
          accent: stepData.accent,
          note: stepData.note,
        });
      }
    });
    
    // Trigger callback
    if (this.onStep) {
      const now = Date.now();
      const delay = Math.max(0, actualTime - now);
      
      setTimeout(() => {
        this.onStep(step, activeSteps, this.currentBar);
      }, delay);
    }
    
    // Beat callback (every 4 steps)
    if (step % 4 === 0 && this.onBeat) {
      const now2 = Date.now();
      const delay = Math.max(0, actualTime - now2);
      setTimeout(() => {
        this.onBeat(Math.floor(step / 4) + 1);
      }, delay);
    }
    
    // Bar callback
    if (step === 0 && this.onBar) {
      const now2 = Date.now();
      const delay = Math.max(0, actualTime - now2);
      setTimeout(() => {
        this.onBar(this.currentBar);
      }, delay);
    }
  }

  /**
   * Advance to next step
   */
  advanceStep() {
    const stepDuration = this.getStepDuration() * 1000; // Convert to ms
    this.nextStepTime += stepDuration;
    
    this.currentStep++;
    
    if (this.currentStep >= this.stepsPerBar) {
      this.currentStep = 0;
      this.currentBar++;
      
      // Handle pattern chaining
      if (this.chainMode && this.chain.length > 0) {
        this.chainPosition = (this.chainPosition + 1) % this.chain.length;
        this.currentBank = this.chain[this.chainPosition];
      }
    }
  }

  /**
   * Set BPM
   */
  setBPM(bpm) {
    this.bpm = Math.max(30, Math.min(300, bpm));
    console.log(`🎵 BPM: ${this.bpm}`);
  }

  /**
   * Set swing amount (0-100)
   */
  setSwing(amount) {
    this.swing = Math.max(0, Math.min(100, amount));
  }

  /**
   * Switch to a different pattern bank
   */
  switchBank(bank) {
    if (['A', 'B', 'C', 'D'].includes(bank)) {
      this.currentBank = bank;
      console.log(`📁 Switched to bank ${bank}`);
    }
  }

  /**
   * Copy pattern from one bank to another
   */
  copyBank(from, to) {
    if (this.banks[from] && this.banks[to]) {
      this.banks[to] = JSON.parse(JSON.stringify(this.banks[from]));
      console.log(`📋 Copied bank ${from} to ${to}`);
    }
  }

  /**
   * Clear a bank
   */
  clearBank(bank) {
    if (this.banks[bank]) {
      this.banks[bank] = this.createEmptyPattern();
      console.log(`🗑️ Cleared bank ${bank}`);
    }
  }

  /**
   * Clear all steps in current pattern
   */
  clearAllSteps() {
    const pattern = this.pattern;
    this.tracks.forEach(track => {
      if (pattern[track]) {
        pattern[track].forEach(step => {
          step.active = false;
          step.velocity = 100;
          step.accent = false;
        });
      }
    });
    console.log('🗑️ Cleared all steps in current pattern');
  }

  /**
   * Toggle a step
   */
  toggleStep(track, step, velocity = 100, note = null) {
    const pattern = this.pattern;
    if (pattern[track] && pattern[track][step]) {
      const stepData = pattern[track][step];
      stepData.active = !stepData.active;
      stepData.velocity = velocity;
      if (note !== null) {
        stepData.note = note;
      }
      return stepData.active;
    }
    return false;
  }

  /**
   * Set step state
   */
  setStep(track, step, active, velocity = 100, accent = false, note = null) {
    const pattern = this.pattern;
    if (pattern[track] && pattern[track][step]) {
      pattern[track][step] = { active, velocity, accent, note };
    }
  }

  /**
   * Get step state
   */
  getStep(track, step) {
    const pattern = this.pattern;
    return pattern[track]?.[step] || null;
  }

  /**
   * Set pattern chain
   */
  setChain(chain) {
    this.chain = chain.filter(b => ['A', 'B', 'C', 'D'].includes(b));
    this.chainMode = this.chain.length > 0;
    this.chainPosition = 0;
    console.log(`🔗 Chain: ${this.chain.join(' → ')}`);
  }

  /**
   * Clear chain
   */
  clearChain() {
    this.chain = [];
    this.chainMode = false;
    this.chainPosition = 0;
  }

  /**
   * Load a preset pattern
   */
  loadPreset(preset) {
    const presets = {
      'four-on-floor': {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      },
      'detroit': {
        kick: [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
        hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      },
      'acid': {
        kick: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        clap: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      },
      'industrial': {
        kick: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
        snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        clap: [0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1],
      },
      'minimal': {
        kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
        clap: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      'berlin': {
        kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        snare: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
        hihat: [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
        clap: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
      },
    };
    
    const presetData = presets[preset];
    if (!presetData) return false;
    
    const pattern = this.pattern;
    
    Object.keys(presetData).forEach(track => {
      presetData[track].forEach((active, step) => {
        if (pattern[track] && pattern[track][step]) {
          pattern[track][step].active = active === 1;
          pattern[track][step].velocity = 100;
        }
      });
    });
    
    console.log(`🎵 Loaded preset: ${preset}`);
    return true;
  }

  /**
   * Get list of available presets
   */
  getPresetList() {
    return ['four-on-floor', 'detroit', 'acid', 'industrial', 'minimal', 'berlin'];
  }

  /**
   * Export pattern as JSON
   */
  exportPattern() {
    return JSON.stringify(this.banks);
  }

  /**
   * Import pattern from JSON
   */
  importPattern(json) {
    try {
      const data = JSON.parse(json);
      this.banks = data;
      console.log('📥 Pattern imported');
      return true;
    } catch (e) {
      console.error('Failed to import pattern:', e);
      return false;
    }
  }

  /**
   * Get sequencer state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      bpm: this.bpm,
      swing: this.swing,
      currentStep: this.currentStep,
      currentBar: this.currentBar,
      currentBank: this.currentBank,
      chainMode: this.chainMode,
      chain: this.chain,
    };
  }
}

// Singleton
const sequencerEngine = new SequencerEngine();

export default sequencerEngine;
export { SequencerEngine };
