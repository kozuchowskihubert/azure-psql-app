/**
 * Patch-Aware Sequencer Integration
 * Connects the sequencer to the Behringer 2600 patch matrix
 * Routes notes through configured patches for authentic analog sound
 */

class PatchAwareSequencer {
    constructor(audioEngine, sequencer) {
        this.audio = audioEngine;
        this.sequencer = sequencer;
        this.currentPatch = null;
        this.activeVoices = new Map();
        this.patchRouting = new Map();
        
        // CV/Gate tracking
        this.cvSignal = null;
        this.gateSignal = null;
        
        // Initialize patch-aware routing
        this.initializePatchRouting();
        this.connectSequencerToPatches();
        
        console.log('🎛️ Patch-Aware Sequencer initialized');
    }

    /**
     * Initialize patch routing configurations
     */
    initializePatchRouting() {
        // Map sequencer outputs to synthesizer inputs
        this.patchRouting.set('sequencer.CV', {
            type: 'cv',
            destinations: ['vco1.CV', 'vco2.CV', 'vco3.CV'],
            convert: (value) => this.cvToFrequency(value)
        });
        
        this.patchRouting.set('sequencer.GATE', {
            type: 'gate',
            destinations: ['env.GATE', 'vca.CV'],
            convert: (value) => value > 0 ? 1 : 0
        });
        
        this.patchRouting.set('sequencer.VELOCITY', {
            type: 'velocity',
            destinations: ['vca.CV', 'vcf.CUTOFF'],
            convert: (value) => value
        });
        
        this.patchRouting.set('sequencer.TRIG', {
            type: 'trigger',
            destinations: ['env.TRIG', 'snh.TRIG'],
            convert: (value) => value > 0 ? 1 : 0
        });
    }

    /**
     * Convert CV voltage to frequency (1V/octave standard)
     */
    cvToFrequency(cvVoltage) {
        // 0V = C4 (261.63 Hz)
        // 1V/octave standard
        const baseFreq = 261.63;
        return baseFreq * Math.pow(2, cvVoltage);
    }

    /**
     * Connect sequencer to patch matrix
     */
    connectSequencerToPatches() {
        if (!this.sequencer) {
            console.error('❌ No sequencer provided');
            return;
        }
        
        // Listen to sequencer step events
        this.sequencer.addEventListener((event, data) => {
            switch(event) {
                case 'step':
                    this.handleSequencerStep(data);
                    break;
                case 'start':
                    this.handleSequencerStart();
                    break;
                case 'stop':
                    this.handleSequencerStop();
                    break;
            }
        });
        
        console.log('🔗 Sequencer connected to patch matrix');
    }

    /**
     * Handle sequencer step event with patch routing
     */
    handleSequencerStep(stepData) {
        const { index, cv, gate, velocity, pitch } = stepData;
        
        // Get active patches
        const activePatches = this.getCurrentPatches();
        
        // Route CV signal through patches
        this.routeCVSignal(cv, pitch, activePatches);
        
        // Route Gate signal through patches
        this.routeGateSignal(gate, velocity, activePatches);
        
        // Update visual feedback
        this.updatePatchVisualization(index, pitch, gate);
    }

    /**
     * Get current active patches from studio
     */
    getCurrentPatches() {
        // Get patches from studio or audio engine
        if (window.studio && window.studio.patches) {
            return window.studio.patches;
        } else if (this.audio.patchMatrix) {
            return this.audio.patchMatrix;
        }
        return [];
    }

    /**
     * Route CV signal through patch matrix
     */
    routeCVSignal(cv, pitch, patches) {
        const frequency = this.cvToFrequency(cv);
        
        // Check if sequencer.CV is patched to VCO
        const cvPatches = patches.filter(p => 
            p.from && p.from.includes('sequencer.CV')
        );
        
        if (cvPatches.length > 0) {
            // Route through actual patches
            cvPatches.forEach(patch => {
                const destination = patch.to;
                
                if (destination.includes('vco1.CV')) {
                    this.setVCOFrequency('vco1', frequency);
                }
                if (destination.includes('vco2.CV')) {
                    this.setVCOFrequency('vco2', frequency);
                }
                if (destination.includes('vco3.CV')) {
                    this.setVCOFrequency('vco3', frequency);
                }
            });
        } else {
            // Default routing if no CV patches
            this.setVCOFrequency('vco1', frequency);
        }
        
        this.cvSignal = cv;
    }

    /**
     * Route Gate signal through patch matrix
     */
    routeGateSignal(gate, velocity, patches) {
        const normalizedVelocity = velocity;
        
        // Check if sequencer.GATE is patched to envelope
        const gatePatches = patches.filter(p => 
            p.from && p.from.includes('sequencer.GATE')
        );
        
        if (gate > 0) {
            // Gate ON - trigger envelope and VCA
            if (gatePatches.length > 0) {
                gatePatches.forEach(patch => {
                    const destination = patch.to;
                    
                    if (destination.includes('env.GATE')) {
                        this.triggerEnvelope(normalizedVelocity);
                    }
                    if (destination.includes('vca.CV')) {
                        this.openVCA(normalizedVelocity);
                    }
                });
            } else {
                // Default: trigger envelope
                this.triggerEnvelope(normalizedVelocity);
            }
            
            // Apply velocity to filter if patched
            this.applyVelocityModulation(normalizedVelocity, patches);
            
        } else {
            // Gate OFF - release envelope
            this.releaseEnvelope();
        }
        
        this.gateSignal = gate;
    }

    /**
     * Set VCO frequency with smooth transition
     */
    setVCOFrequency(vcoId, frequency) {
        if (!this.audio.isPlaying) {
            this.audio.start();
        }
        
        const now = this.audio.audioContext.currentTime;
        const glideTime = 0.01; // 10ms glide for smoothness
        
        if (vcoId === 'vco1' && this.audio.vco1.osc) {
            this.audio.vco1.osc.frequency.cancelScheduledValues(now);
            this.audio.vco1.osc.frequency.setValueAtTime(
                this.audio.vco1.osc.frequency.value, 
                now
            );
            this.audio.vco1.osc.frequency.linearRampToValueAtTime(
                frequency, 
                now + glideTime
            );
        }
        
        if (vcoId === 'vco2' && this.audio.vco2.osc) {
            this.audio.vco2.osc.frequency.cancelScheduledValues(now);
            this.audio.vco2.osc.frequency.setValueAtTime(
                this.audio.vco2.osc.frequency.value, 
                now
            );
            this.audio.vco2.osc.frequency.linearRampToValueAtTime(
                frequency * 1.005, // Slight detune
                now + glideTime
            );
        }
    }

    /**
     * Trigger envelope with ADSR
     */
    triggerEnvelope(velocity) {
        if (!this.audio.vca) return;
        
        const now = this.audio.audioContext.currentTime;
        const envelope = this.audio.envelope;
        
        // Cancel any scheduled values
        this.audio.vca.gain.cancelScheduledValues(now);
        this.audio.vca.gain.setValueAtTime(0, now);
        
        // Attack
        this.audio.vca.gain.linearRampToValueAtTime(
            velocity,
            now + envelope.attack
        );
        
        // Decay to Sustain
        this.audio.vca.gain.linearRampToValueAtTime(
            velocity * envelope.sustain,
            now + envelope.attack + envelope.decay
        );
    }

    /**
     * Release envelope
     */
    releaseEnvelope() {
        if (!this.audio.vca) return;
        
        const now = this.audio.audioContext.currentTime;
        const envelope = this.audio.envelope;
        
        // Release
        this.audio.vca.gain.cancelScheduledValues(now);
        this.audio.vca.gain.setValueAtTime(this.audio.vca.gain.value, now);
        this.audio.vca.gain.linearRampToValueAtTime(
            0,
            now + envelope.release
        );
    }

    /**
     * Open VCA directly (for patches without envelope)
     */
    openVCA(velocity) {
        if (!this.audio.vca) return;
        
        const now = this.audio.audioContext.currentTime;
        
        this.audio.vca.gain.cancelScheduledValues(now);
        this.audio.vca.gain.setValueAtTime(velocity, now);
    }

    /**
     * Apply velocity modulation to filter
     */
    applyVelocityModulation(velocity, patches) {
        if (!this.audio.vcf) return;
        
        // Check if velocity is patched to filter
        const velocityPatches = patches.filter(p => 
            p.from && p.from.includes('sequencer.VELOCITY') &&
            p.to && p.to.includes('vcf.CUTOFF')
        );
        
        if (velocityPatches.length > 0 || patches.length === 0) {
            const now = this.audio.audioContext.currentTime;
            const baseFreq = this.audio.filterFreq;
            const modAmount = velocity * 2000; // Up to 2kHz modulation
            
            this.audio.vcf.frequency.cancelScheduledValues(now);
            this.audio.vcf.frequency.setValueAtTime(
                baseFreq + modAmount,
                now
            );
        }
    }

    /**
     * Update visual patch feedback
     */
    updatePatchVisualization(stepIndex, pitch, gate) {
        // Emit event for UI updates
        const event = new CustomEvent('patchSequencerStep', {
            detail: {
                step: stepIndex,
                pitch: pitch,
                gate: gate,
                cv: this.cvSignal,
                frequency: this.cvToFrequency(this.cvSignal)
            }
        });
        window.dispatchEvent(event);
        
        // Update cable glow effect
        if (gate > 0) {
            this.highlightActiveCables();
        }
    }

    /**
     * Highlight active patch cables during playback
     */
    highlightActiveCables() {
        const patches = this.getCurrentPatches();
        
        patches.forEach(patch => {
            if (patch.from && patch.from.includes('sequencer')) {
                // Find cable element and add active class
                const cableEl = document.querySelector(
                    `[data-patch="${patch.from}-${patch.to}"]`
                );
                if (cableEl) {
                    cableEl.classList.add('active');
                    setTimeout(() => {
                        cableEl.classList.remove('active');
                    }, 100);
                }
            }
        });
    }

    /**
     * Handle sequencer start
     */
    handleSequencerStart() {
        if (!this.audio.isPlaying) {
            this.audio.start();
        }
        console.log('▶️ Patch-aware sequencer started');
    }

    /**
     * Handle sequencer stop
     */
    handleSequencerStop() {
        // Release all active notes
        this.releaseEnvelope();
        
        // Clear CV/Gate signals
        this.cvSignal = null;
        this.gateSignal = null;
        
        console.log('⏹️ Patch-aware sequencer stopped');
    }

    /**
     * Load a preset with sequencer pattern
     */
    loadPresetWithPattern(presetName) {
        const presets = {
            'acid-bass': {
                patches: [
                    { from: 'sequencer.CV', to: 'vco1.CV' },
                    { from: 'sequencer.GATE', to: 'env.GATE' },
                    { from: 'vco1.OUT', to: 'vcf.IN' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF' },
                    { from: 'vcf.OUT', to: 'vca.IN' },
                    { from: 'env.OUT', to: 'vca.CV' },
                ],
                pattern: 'bassline',
                synth: {
                    vco1: { freq: 55, waveform: 'sawtooth' },
                    vcf: { cutoff: 400, resonance: 12 },
                    envelope: { attack: 0.001, decay: 0.05, sustain: 0.3, release: 0.1 }
                }
            },
            'techno-lead': {
                patches: [
                    { from: 'sequencer.CV', to: 'vco1.CV' },
                    { from: 'sequencer.CV', to: 'vco2.CV' },
                    { from: 'sequencer.GATE', to: 'env.GATE' },
                    { from: 'sequencer.VELOCITY', to: 'vcf.CUTOFF' },
                    { from: 'vco1.OUT', to: 'vcf.IN' },
                    { from: 'vco2.OUT', to: 'vcf.IN' },
                    { from: 'vcf.OUT', to: 'vca.IN' },
                    { from: 'env.OUT', to: 'vca.CV' },
                ],
                pattern: 'arpeggio',
                synth: {
                    vco1: { freq: 220, waveform: 'sawtooth' },
                    vco2: { freq: 220, waveform: 'square' },
                    vcf: { cutoff: 2000, resonance: 6 },
                    envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 }
                }
            },
            'random-melody': {
                patches: [
                    { from: 'noise.WHITE', to: 'snh.IN' },
                    { from: 'sequencer.TRIG', to: 'snh.TRIG' },
                    { from: 'snh.OUT', to: 'vco1.CV' },
                    { from: 'sequencer.GATE', to: 'env.GATE' },
                    { from: 'vco1.OUT', to: 'vcf.IN' },
                    { from: 'vcf.OUT', to: 'vca.IN' },
                    { from: 'env.OUT', to: 'vca.CV' },
                ],
                pattern: 'rhythm',
                synth: {
                    vco1: { freq: 440, waveform: 'square' },
                    vcf: { cutoff: 1200, resonance: 5 },
                    envelope: { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.2 }
                }
            }
        };
        
        const preset = presets[presetName];
        if (!preset) {
            console.error(`Preset "${presetName}" not found`);
            return;
        }
        
        // Apply patches to studio
        if (window.studio) {
            window.studio.patches = preset.patches;
            window.studio.renderPatchCables();
        }
        
        // Apply synth settings
        if (preset.synth) {
            if (preset.synth.vco1) {
                this.audio.setVCO1Frequency(preset.synth.vco1.freq);
                this.audio.setVCO1Waveform(preset.synth.vco1.waveform);
            }
            if (preset.synth.vco2) {
                this.audio.setVCO2Frequency(preset.synth.vco2.freq);
                this.audio.setVCO2Waveform(preset.synth.vco2.waveform);
            }
            if (preset.synth.vcf) {
                this.audio.setFilterCutoff(preset.synth.vcf.cutoff);
                this.audio.setFilterResonance(preset.synth.vcf.resonance);
            }
            if (preset.synth.envelope) {
                this.audio.envelope = preset.synth.envelope;
            }
        }
        
        // Load sequencer pattern
        if (preset.pattern && this.sequencer) {
            this.sequencer.loadPattern(preset.pattern);
        }
        
        console.log(`🎛️ Loaded preset: ${presetName}`);
        
        // Emit event
        const event = new CustomEvent('patchPresetLoaded', {
            detail: { preset: presetName }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get current sequencer state for display
     */
    getSequencerState() {
        return {
            cv: this.cvSignal,
            gate: this.gateSignal,
            frequency: this.cvSignal ? this.cvToFrequency(this.cvSignal) : 0,
            isPlaying: this.sequencer ? this.sequencer.isPlaying : false,
            currentStep: this.sequencer ? this.sequencer.currentStep : 0
        };
    }
}

// Export for global use
window.PatchAwareSequencer = PatchAwareSequencer;
