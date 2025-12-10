/**
 * Enhanced Behringer 2600 Audio Engine with Sequencer Integration
 * Improved sound quality with polyphony, better envelopes, and sequencer sync
 */

class Synth2600Enhanced extends Synth2600AudioEngine {
    constructor() {
        super();

        // Enhanced features
        this.voicePool = [];
        this.maxVoices = 8; // Polyphony
        this.sequencer = null;
        this.sequencerActive = false;

        // Enhanced audio processing
        this.compressor = null;
        this.chorus = null;
        this.delay = null;

        // Sequencer integration
        this.lastSequencerNoteId = null;
        this.sequencerGateLength = 0.8; // 80% of step duration

        // Enhanced modulation
        this.modulationMatrix = new Map();

        this.initEnhancedAudio();
    }

    initEnhancedAudio() {
        // Create compressor for better dynamics
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        // Create chorus for richer sound
        this.chorus = this.createChorus();

        // Create delay for depth
        this.delay = this.createDelay();

        // Initialize voice pool
        for (let i = 0; i < this.maxVoices; i++) {
            this.voicePool.push(this.createVoice(i));
        }

        console.log('🎛️ Enhanced Behringer 2600 initialized with', this.maxVoices, 'voices');
    }

    createVoice(voiceIndex) {
        return {
            id: voiceIndex,
            active: false,
            noteId: null,
            frequency: 0,

            // Oscillators
            vco1: null,
            vco2: null,
            vco3: null, // LFO per voice

            // Gains
            vco1Gain: null,
            vco2Gain: null,

            // Filter per voice for better separation
            filter: null,

            // VCA (envelope)
            vca: null,

            // Modulation
            lfoGain: null,
        };
    }

    /**
     * Enhanced start with better audio routing
     */
    start() {
        if (this.isPlaying) return;

        // Resume audio context
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Connect enhanced audio chain
        this.compressor.connect(this.chorus.input);
        this.chorus.output.connect(this.delay.input);
        this.delay.output.connect(this.masterVolume);

        this.isPlaying = true;
        console.log('🎵 Enhanced Synthesizer started');
    }

    /**
     * Create chorus effect for richer sound
     */
    createChorus() {
        const chorus = {
            input: this.audioContext.createGain(),
            output: this.audioContext.createGain(),
            lfo: this.audioContext.createOscillator(),
            depth: this.audioContext.createGain(),
            delay: this.audioContext.createDelay(),
        };

        chorus.lfo.frequency.value = 1.5; // Chorus rate
        chorus.depth.gain.value = 0.002; // Subtle depth
        chorus.delay.delayTime.value = 0.02; // 20ms base delay

        // Routing
        chorus.input.connect(chorus.delay);
        chorus.lfo.connect(chorus.depth);
        chorus.depth.connect(chorus.delay.delayTime);
        chorus.delay.connect(chorus.output);
        chorus.input.connect(chorus.output); // Dry signal

        chorus.lfo.start();

        return chorus;
    }

    /**
     * Create delay effect
     */
    createDelay() {
        const delay = {
            input: this.audioContext.createGain(),
            output: this.audioContext.createGain(),
            delay: this.audioContext.createDelay(1.0),
            feedback: this.audioContext.createGain(),
            wet: this.audioContext.createGain(),
        };

        delay.delay.delayTime.value = 0.375; // Dotted 8th at 120 BPM
        delay.feedback.gain.value = 0.3;
        delay.wet.gain.value = 0.3;

        // Routing
        delay.input.connect(delay.delay);
        delay.delay.connect(delay.feedback);
        delay.feedback.connect(delay.delay);
        delay.delay.connect(delay.wet);
        delay.wet.connect(delay.output);
        delay.input.connect(delay.output); // Dry signal

        return delay;
    }

    /**
     * Get available voice from pool
     */
    getAvailableVoice() {
        // First try to find inactive voice
        let voice = this.voicePool.find(v => !v.active);

        // If all voices active, steal oldest
        if (!voice) {
            voice = this.voicePool.reduce((oldest, v) => {
                return (!oldest || v.startTime < oldest.startTime) ? v : oldest;
            });

            // Stop stolen voice
            if (voice.active) {
                this.stopVoice(voice, 0.01); // Quick release
            }
        }

        return voice;
    }

    /**
     * Enhanced note playing with per-voice synthesis
     */
    playNoteEnhanced(frequency, velocity = 1.0, duration = null) {
        if (!this.isPlaying) this.start();

        const voice = this.getAvailableVoice();
        const now = this.audioContext.currentTime;
        const noteId = Date.now() + Math.random();

        // Create oscillators for this voice
        voice.vco1 = this.audioContext.createOscillator();
        voice.vco1.type = this.vco1.waveform;
        voice.vco1.frequency.value = frequency;
        voice.vco1.detune.value = this.vco1.detune;

        voice.vco2 = this.audioContext.createOscillator();
        voice.vco2.type = this.vco2.waveform;
        voice.vco2.frequency.value = frequency * 1.005; // Slight detune for thickness
        voice.vco2.detune.value = this.vco2.detune + 5; // Extra detune

        // LFO for this voice
        voice.vco3 = this.audioContext.createOscillator();
        voice.vco3.type = this.vco3.waveform;
        voice.vco3.frequency.value = this.vco3.freq;

        // Gains
        voice.vco1Gain = this.audioContext.createGain();
        voice.vco1Gain.gain.value = 0.35 * velocity;

        voice.vco2Gain = this.audioContext.createGain();
        voice.vco2Gain.gain.value = 0.35 * velocity;

        voice.lfoGain = this.audioContext.createGain();
        voice.lfoGain.gain.value = 100 * velocity; // LFO modulation depth

        // Filter for this voice
        voice.filter = this.audioContext.createBiquadFilter();
        voice.filter.type = this.filterType;

        // Velocity-sensitive filter
        const velocityFilterMod = velocity * 2000; // More velocity = brighter
        voice.filter.frequency.value = Math.min(this.filterFreq + velocityFilterMod, 20000);
        voice.filter.Q.value = this.filterQ;

        // VCA (amplitude envelope)
        voice.vca = this.audioContext.createGain();
        voice.vca.gain.value = 0;

        // Audio routing
        voice.vco1.connect(voice.vco1Gain);
        voice.vco2.connect(voice.vco2Gain);
        voice.vco1Gain.connect(voice.filter);
        voice.vco2Gain.connect(voice.filter);

        // LFO modulates filter cutoff
        voice.vco3.connect(voice.lfoGain);
        voice.lfoGain.connect(voice.filter.frequency);

        voice.filter.connect(voice.vca);
        voice.vca.connect(this.compressor);

        // Apply ADSR envelope
        const { attack } = this.envelope;
        const { decay } = this.envelope;
        const sustain = this.envelope.sustain * velocity;
        const { release } = this.envelope;

        voice.vca.gain.setValueAtTime(0, now);
        voice.vca.gain.linearRampToValueAtTime(velocity, now + attack);
        voice.vca.gain.linearRampToValueAtTime(sustain, now + attack + decay);

        // Start oscillators
        voice.vco1.start(now);
        voice.vco2.start(now);
        voice.vco3.start(now);

        // Mark voice as active
        voice.active = true;
        voice.noteId = noteId;
        voice.frequency = frequency;
        voice.startTime = now;

        // Auto-release if duration specified (for sequencer)
        if (duration) {
            setTimeout(() => {
                this.releaseNoteEnhanced(noteId);
            }, duration * 1000);
        }

        this.activeNotes.set(noteId, { voice, frequency, startTime: now });
        return noteId;
    }

    /**
     * Enhanced note release
     */
    releaseNoteEnhanced(noteId) {
        const note = this.activeNotes.get(noteId);
        if (!note) return;

        const { voice } = note;
        const now = this.audioContext.currentTime;
        const { release } = this.envelope;

        // Apply release envelope
        voice.vca.gain.cancelScheduledValues(now);
        voice.vca.gain.setValueAtTime(voice.vca.gain.value, now);
        voice.vca.gain.linearRampToValueAtTime(0, now + release);

        // Stop and cleanup after release
        setTimeout(() => {
            this.stopVoice(voice);
            this.activeNotes.delete(noteId);
        }, release * 1000 + 100);
    }

    /**
     * Stop a voice and cleanup
     */
    stopVoice(voice, releaseTime = null) {
        if (!voice) return;

        const now = this.audioContext.currentTime;
        const release = releaseTime !== null ? releaseTime : this.envelope.release;

        try {
            if (voice.vca) {
                voice.vca.gain.cancelScheduledValues(now);
                voice.vca.gain.setValueAtTime(voice.vca.gain.value, now);
                voice.vca.gain.linearRampToValueAtTime(0, now + release);
            }

            setTimeout(() => {
                if (voice.vco1) voice.vco1.stop();
                if (voice.vco2) voice.vco2.stop();
                if (voice.vco3) voice.vco3.stop();

                voice.active = false;
                voice.noteId = null;
            }, release * 1000 + 50);
        } catch (e) {
            // Voice already stopped
            voice.active = false;
            voice.noteId = null;
        }
    }

    /**
     * Connect sequencer to synthesizer
     */
    connectSequencer(sequencer) {
        this.sequencer = sequencer;

        // Listen to sequencer events
        sequencer.addEventListener((event, data) => {
            if (event === 'step') {
                this.handleSequencerStep(data);
            } else if (event === 'start') {
                this.sequencerActive = true;
                console.log('🎵 Sequencer started');
            } else if (event === 'stop') {
                this.sequencerActive = false;
                // Release any active sequencer notes
                if (this.lastSequencerNoteId) {
                    this.releaseNoteEnhanced(this.lastSequencerNoteId);
                }
                console.log('⏹️ Sequencer stopped');
            }
        });

        console.log('🔗 Sequencer connected to synthesizer');
    }

    /**
     * Handle sequencer step events
     */
    handleSequencerStep(stepData) {
        const { pitch, velocity, gate } = stepData;

        // Release previous note if still playing
        if (this.lastSequencerNoteId) {
            this.releaseNoteEnhanced(this.lastSequencerNoteId);
        }

        if (gate) {
            // Convert MIDI note to frequency
            const frequency = 440 * 2 ** ((pitch - 69) / 12);
            const velocityNormalized = velocity;

            // Calculate step duration based on BPM
            const stepDuration = (60 / this.sequencer.bpm) * this.sequencerGateLength;

            // Play note with automatic release
            this.lastSequencerNoteId = this.playNoteEnhanced(
                frequency,
                velocityNormalized,
                stepDuration,
            );
        }
    }

    /**
     * Set sequencer gate length (0.0 - 1.0)
     */
    setSequencerGateLength(length) {
        this.sequencerGateLength = Math.max(0.1, Math.min(1.0, length));
    }

    /**
     * Enhanced preset loading with sequencer patterns
     */
    loadEnhancedPreset(presetName) {
        const presets = {
            'acid-bass': {
                synth: {
                    vco1: { freq: 55, waveform: 'sawtooth', detune: 0 },
                    vco2: { freq: 55, waveform: 'square', detune: -10 },
                    vcf: { cutoff: 400, resonance: 12, type: 'lowpass' },
                    lfo: { rate: 0.5 },
                    envelope: { attack: 0.001, decay: 0.05, sustain: 0.3, release: 0.1 },
                },
                sequencer: 'bassline',
                fx: { delay: 0.2, chorus: 0.3 },
            },
            'techno-lead': {
                synth: {
                    vco1: { freq: 220, waveform: 'sawtooth', detune: 5 },
                    vco2: { freq: 220, waveform: 'square', detune: -5 },
                    vcf: { cutoff: 2000, resonance: 6, type: 'lowpass' },
                    lfo: { rate: 6 },
                    envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 },
                },
                sequencer: 'arpeggio',
                fx: { delay: 0.4, chorus: 0.5 },
            },
            'ambient-pad': {
                synth: {
                    vco1: { freq: 110, waveform: 'sine', detune: 0 },
                    vco2: { freq: 110, waveform: 'triangle', detune: 5 },
                    vcf: { cutoff: 1500, resonance: 2, type: 'lowpass' },
                    lfo: { rate: 0.2 },
                    envelope: { attack: 1.0, decay: 0.8, sustain: 0.7, release: 2.0 },
                },
                sequencer: 'arpeggio',
                fx: { delay: 0.6, chorus: 0.7 },
            },
            percussion: {
                synth: {
                    vco1: { freq: 80, waveform: 'square', detune: 0 },
                    vco2: { freq: 160, waveform: 'sawtooth', detune: 0 },
                    vcf: { cutoff: 800, resonance: 8, type: 'bandpass' },
                    lfo: { rate: 0.1 },
                    envelope: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.05 },
                },
                sequencer: 'rhythm',
                fx: { delay: 0.3, chorus: 0.1 },
            },
        };

        const preset = presets[presetName];
        if (!preset) {
            console.error(`Enhanced preset "${presetName}" not found`);
            return;
        }

        // Apply synth parameters
        if (preset.synth.vco1) {
            this.vco1.freq = preset.synth.vco1.freq;
            this.vco1.waveform = preset.synth.vco1.waveform;
            this.vco1.detune = preset.synth.vco1.detune || 0;
        }

        if (preset.synth.vco2) {
            this.vco2.freq = preset.synth.vco2.freq;
            this.vco2.waveform = preset.synth.vco2.waveform;
            this.vco2.detune = preset.synth.vco2.detune || 0;
        }

        if (preset.synth.vcf) {
            this.filterFreq = preset.synth.vcf.cutoff;
            this.filterQ = preset.synth.vcf.resonance;
            this.filterType = preset.synth.vcf.type;
        }

        if (preset.synth.lfo) {
            this.vco3.freq = preset.synth.lfo.rate;
        }

        if (preset.synth.envelope) {
            this.envelope = { ...this.envelope, ...preset.synth.envelope };
        }

        // Apply FX settings
        if (preset.fx) {
            if (preset.fx.delay !== undefined) {
                this.delay.wet.gain.value = preset.fx.delay;
            }
            if (preset.fx.chorus !== undefined) {
                this.chorus.depth.gain.value = 0.002 + (preset.fx.chorus * 0.003);
            }
        }

        // Load sequencer pattern
        if (this.sequencer && preset.sequencer) {
            this.sequencer.loadPattern(preset.sequencer);
        }

        if (!this.isPlaying) this.start();

        console.log(`🎛️ Loaded enhanced preset: ${presetName}`);

        // Emit event
        const event = new CustomEvent('enhancedPresetLoaded', {
            detail: { preset: presetName, config: preset },
        });
        window.dispatchEvent(event);
    }

    /**
     * Set delay time synced to BPM
     */
    setDelayTimeSynced(division = 0.375) {
        if (this.sequencer) {
            const beatDuration = 60 / this.sequencer.bpm;
            const delayTime = beatDuration * division;
            this.delay.delay.delayTime.setValueAtTime(
                delayTime,
                this.audioContext.currentTime,
            );
        }
    }

    /**
     * Set delay feedback (0.0 - 1.0)
     */
    setDelayFeedback(feedback) {
        this.delay.feedback.gain.value = Math.max(0, Math.min(0.95, feedback));
    }

    /**
     * Set delay mix (0.0 - 1.0)
     */
    setDelayMix(mix) {
        this.delay.wet.gain.value = Math.max(0, Math.min(1.0, mix));
    }

    /**
     * Set chorus depth (0.0 - 1.0)
     */
    setChorusDepth(depth) {
        this.chorus.depth.gain.value = 0.001 + (depth * 0.004);
    }

    /**
     * Set chorus rate (0.1 - 10 Hz)
     */
    setChorusRate(rate) {
        this.chorus.lfo.frequency.value = Math.max(0.1, Math.min(10, rate));
    }

    /**
     * Get voice statistics
     */
    getVoiceStats() {
        const activeVoices = this.voicePool.filter(v => v.active).length;
        return {
            total: this.maxVoices,
            active: activeVoices,
            available: this.maxVoices - activeVoices,
        };
    }

    /**
     * Panic - stop all voices immediately
     */
    panic() {
        this.voicePool.forEach(voice => {
            if (voice.active) {
                this.stopVoice(voice, 0.01);
            }
        });

        this.activeNotes.clear();
        this.lastSequencerNoteId = null;

        console.log('🚨 Panic! All voices stopped');
    }
}

// Export
window.Synth2600Enhanced = Synth2600Enhanced;
