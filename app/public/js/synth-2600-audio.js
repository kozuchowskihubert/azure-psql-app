/**
 * Behringer 2600 Audio Engine
 * Maps virtual patch matrix to Web Audio API synthesis
 * Simulates analog oscillators, filters, envelopes, and VCAs
 */

class Synth2600AudioEngine {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.masterVolume = null;

        // Oscillators (VCO 1, 2, 3/LFO)
        this.vco1 = { osc: null, gain: null, freq: 440, waveform: 'sawtooth', detune: 0 };
        this.vco2 = { osc: null, gain: null, freq: 440, waveform: 'square', detune: 0 };
        this.vco3 = { osc: null, gain: null, freq: 2, waveform: 'sine', detune: 0 }; // LFO

        // Filters (VCF)
        this.vcf = null;
        this.filterFreq = 1000;
        this.filterQ = 10;
        this.filterType = 'lowpass';

        // Envelopes (ADSR)
        this.envelope = { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 };

        // VCA (Voltage Controlled Amplifier)
        this.vca = null;

        // Noise Generator
        this.noiseBuffer = null;
        this.noiseSource = null;
        this.noiseGain = null;

        // Sample & Hold
        this.sampleHold = { value: 0, interval: null };

        // Ring Modulator
        this.ringMod = null;

        // Patch Matrix (stores connections)
        this.patchMatrix = [];

        // Notes currently playing
        this.activeNotes = new Map();

        this.init();
    }

    init() {
        // Initialize Audio Context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create master volume
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.gain.value = 0.3;
        this.masterVolume.connect(this.audioContext.destination);

        // Create noise buffer
        this.createNoiseBuffer();

        console.log('🎛️ Behringer 2600 Audio Engine initialized');
    }

    /**
     * Create white noise buffer for noise generator
     */
    createNoiseBuffer() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = this.noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Start the synthesizer
     */
    start() {
        if (this.isPlaying) return;

        // Resume audio context (required by browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create VCO 1 (Primary oscillator)
        this.vco1.osc = this.audioContext.createOscillator();
        this.vco1.osc.type = this.vco1.waveform;
        this.vco1.osc.frequency.value = this.vco1.freq;
        this.vco1.osc.detune.value = this.vco1.detune;

        this.vco1.gain = this.audioContext.createGain();
        this.vco1.gain.gain.value = 0.3;

        // Create VCO 2 (Secondary oscillator)
        this.vco2.osc = this.audioContext.createOscillator();
        this.vco2.osc.type = this.vco2.waveform;
        this.vco2.osc.frequency.value = this.vco2.freq;
        this.vco2.osc.detune.value = this.vco2.detune;

        this.vco2.gain = this.audioContext.createGain();
        this.vco2.gain.gain.value = 0.3;

        // Create VCO 3 (LFO)
        this.vco3.osc = this.audioContext.createOscillator();
        this.vco3.osc.type = this.vco3.waveform;
        this.vco3.osc.frequency.value = this.vco3.freq;

        this.vco3.gain = this.audioContext.createGain();
        this.vco3.gain.gain.value = 50; // LFO modulation depth

        // Create Filter (VCF)
        this.vcf = this.audioContext.createBiquadFilter();
        this.vcf.type = this.filterType;
        this.vcf.frequency.value = this.filterFreq;
        this.vcf.Q.value = this.filterQ;

        // Create VCA (final gain stage)
        this.vca = this.audioContext.createGain();
        this.vca.gain.value = 0;

        // Create Noise Generator
        this.noiseGain = this.audioContext.createGain();
        this.noiseGain.gain.value = 0;

        // Apply patch matrix connections
        this.applyPatchMatrix();

        // Start oscillators
        this.vco1.osc.start();
        this.vco2.osc.start();
        this.vco3.osc.start();

        this.isPlaying = true;
        console.log('🎵 Synthesizer started');
    }

    /**
     * Stop the synthesizer
     */
    stop() {
        if (!this.isPlaying) return;

        if (this.vco1.osc) this.vco1.osc.stop();
        if (this.vco2.osc) this.vco2.osc.stop();
        if (this.vco3.osc) this.vco3.osc.stop();
        if (this.noiseSource) this.noiseSource.stop();

        this.isPlaying = false;
        console.log('🔇 Synthesizer stopped');
    }

    /**
     * Apply patch matrix connections
     */
    applyPatchMatrix() {
        // Default routing if no patches
        if (this.patchMatrix.length === 0) {
            // VCO1 → VCF → VCA → Output
            this.vco1.osc.connect(this.vco1.gain);
            this.vco1.gain.connect(this.vcf);

            // VCO2 → VCF
            this.vco2.osc.connect(this.vco2.gain);
            this.vco2.gain.connect(this.vcf);

            // VCF → VCA → Master
            this.vcf.connect(this.vca);
            this.vca.connect(this.masterVolume);

            // LFO → VCO1 Frequency (default vibrato)
            this.vco3.osc.connect(this.vco3.gain);
            this.vco3.gain.connect(this.vco1.osc.frequency);
        } else {
            // Apply custom patches
            this.patchMatrix.forEach(patch => {
                this.connectPatch(patch.from, patch.to);
            });
        }
    }

    /**
     * Connect a patch cable between two points
     */
    connectPatch(fromPoint, toPoint) {
        console.log(`🔌 Patching: ${fromPoint} → ${toPoint}`);

        // VCO routing
        if (fromPoint === 'vco1-out' && toPoint === 'vcf-in') {
            this.vco1.osc.connect(this.vco1.gain);
            this.vco1.gain.connect(this.vcf);
        }

        if (fromPoint === 'vco2-out' && toPoint === 'vcf-in') {
            this.vco2.osc.connect(this.vco2.gain);
            this.vco2.gain.connect(this.vcf);
        }

        // LFO modulation routing
        if (fromPoint === 'lfo-out' && toPoint === 'vco1-fm') {
            this.vco3.osc.connect(this.vco3.gain);
            this.vco3.gain.connect(this.vco1.osc.frequency);
        }

        if (fromPoint === 'lfo-out' && toPoint === 'vco2-fm') {
            this.vco3.osc.connect(this.vco3.gain);
            this.vco3.gain.connect(this.vco2.osc.frequency);
        }

        if (fromPoint === 'lfo-out' && toPoint === 'vcf-cutoff') {
            this.vco3.osc.connect(this.vco3.gain);
            this.vco3.gain.connect(this.vcf.frequency);
        }

        // Filter routing
        if (fromPoint === 'vcf-out' && toPoint === 'vca-in') {
            this.vcf.connect(this.vca);
        }

        // VCA to output
        if (fromPoint === 'vca-out' && toPoint === 'output') {
            this.vca.connect(this.masterVolume);
        }

        // Noise routing
        if (fromPoint === 'noise-out' && toPoint === 'vcf-in') {
            this.noiseSource = this.audioContext.createBufferSource();
            this.noiseSource.buffer = this.noiseBuffer;
            this.noiseSource.loop = true;
            this.noiseSource.connect(this.noiseGain);
            this.noiseGain.connect(this.vcf);
            if (this.isPlaying) this.noiseSource.start();
        }

        // Cross-modulation (VCO2 → VCO1)
        if (fromPoint === 'vco2-out' && toPoint === 'vco1-fm') {
            this.vco2.osc.connect(this.vco1.osc.frequency);
        }
    }

    /**
     * Add a patch cable
     */
    addPatch(from, to) {
        this.patchMatrix.push({ from, to });
        if (this.isPlaying) {
            this.connectPatch(from, to);
        }
        this.emitPatchUpdate();
    }

    /**
     * Remove a patch cable
     */
    removePatch(from, to) {
        this.patchMatrix = this.patchMatrix.filter(p => !(p.from === from && p.to === to));
        // Rebuild all connections
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
        this.emitPatchUpdate();
    }

    /**
     * Set oscillator parameters
     */
    setVCO1Frequency(freq) {
        this.vco1.freq = freq;
        if (this.vco1.osc) {
            this.vco1.osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        }
    }

    setVCO2Frequency(freq) {
        this.vco2.freq = freq;
        if (this.vco2.osc) {
            this.vco2.osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        }
    }

    setLFORate(rate) {
        this.vco3.freq = rate;
        if (this.vco3.osc) {
            this.vco3.osc.frequency.setValueAtTime(rate, this.audioContext.currentTime);
        }
    }

    setVCO1Waveform(waveform) {
        this.vco1.waveform = waveform;
        if (this.vco1.osc) {
            this.vco1.osc.type = waveform;
        }
    }

    setVCO2Waveform(waveform) {
        this.vco2.waveform = waveform;
        if (this.vco2.osc) {
            this.vco2.osc.type = waveform;
        }
    }

    /**
     * Set filter parameters
     */
    setFilterCutoff(freq) {
        this.filterFreq = freq;
        if (this.vcf) {
            this.vcf.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        }
    }

    setFilterResonance(q) {
        this.filterQ = q;
        if (this.vcf) {
            this.vcf.Q.setValueAtTime(q, this.audioContext.currentTime);
        }
    }

    setFilterType(type) {
        this.filterType = type;
        if (this.vcf) {
            this.vcf.type = type;
        }
    }

    /**
     * Play a note with ADSR envelope
     */
    playNote(frequency, velocity = 1.0) {
        if (!this.isPlaying) this.start();

        const now = this.audioContext.currentTime;
        const noteId = Date.now();

        // Set oscillator frequencies
        this.vco1.osc.frequency.setValueAtTime(frequency, now);
        this.vco2.osc.frequency.setValueAtTime(frequency * 1.01, now); // Slight detune

        // Apply ADSR envelope to VCA
        this.vca.gain.cancelScheduledValues(now);
        this.vca.gain.setValueAtTime(0, now);

        // Attack
        this.vca.gain.linearRampToValueAtTime(
            velocity,
            now + this.envelope.attack,
        );

        // Decay
        this.vca.gain.linearRampToValueAtTime(
            velocity * this.envelope.sustain,
            now + this.envelope.attack + this.envelope.decay,
        );

        this.activeNotes.set(noteId, { frequency, startTime: now });
        return noteId;
    }

    /**
     * Release a note
     */
    releaseNote(noteId) {
        if (!this.activeNotes.has(noteId)) return;

        const now = this.audioContext.currentTime;

        // Release
        this.vca.gain.cancelScheduledValues(now);
        this.vca.gain.setValueAtTime(this.vca.gain.value, now);
        this.vca.gain.linearRampToValueAtTime(0, now + this.envelope.release);

        setTimeout(() => {
            this.activeNotes.delete(noteId);
        }, this.envelope.release * 1000);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        if (this.masterVolume) {
            this.masterVolume.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }

    /**
     * Load a preset patch configuration
     */
    loadPreset(presetName) {
        const presets = {
            bass: {
                patches: [
                    { from: 'vco1-out', to: 'vcf-in' },
                    { from: 'vcf-out', to: 'vca-in' },
                    { from: 'vca-out', to: 'output' },
                    { from: 'lfo-out', to: 'vcf-cutoff' },
                ],
                vco1: { freq: 110, waveform: 'sawtooth' },
                vcf: { cutoff: 400, resonance: 8 },
                lfo: { rate: 0.5 },
            },
            lead: {
                patches: [
                    { from: 'vco1-out', to: 'vcf-in' },
                    { from: 'vco2-out', to: 'vcf-in' },
                    { from: 'vcf-out', to: 'vca-in' },
                    { from: 'vca-out', to: 'output' },
                    { from: 'lfo-out', to: 'vco1-fm' },
                ],
                vco1: { freq: 440, waveform: 'sawtooth' },
                vco2: { freq: 440, waveform: 'square' },
                vcf: { cutoff: 2000, resonance: 5 },
                lfo: { rate: 6 },
            },
            pad: {
                patches: [
                    { from: 'vco1-out', to: 'vcf-in' },
                    { from: 'vco2-out', to: 'vcf-in' },
                    { from: 'vcf-out', to: 'vca-in' },
                    { from: 'vca-out', to: 'output' },
                    { from: 'lfo-out', to: 'vco2-fm' },
                ],
                vco1: { freq: 220, waveform: 'sawtooth' },
                vco2: { freq: 220.5, waveform: 'triangle' },
                vcf: { cutoff: 1000, resonance: 2 },
                lfo: { rate: 0.3 },
                envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.5 },
            },
        };

        const preset = presets[presetName];
        if (!preset) {
            console.error(`Preset "${presetName}" not found`);
            return;
        }

        // Stop and reset
        if (this.isPlaying) this.stop();
        this.patchMatrix = preset.patches;

        // Apply parameters
        if (preset.vco1) {
            this.setVCO1Frequency(preset.vco1.freq);
            this.setVCO1Waveform(preset.vco1.waveform);
        }
        if (preset.vco2) {
            this.setVCO2Frequency(preset.vco2.freq);
            this.setVCO2Waveform(preset.vco2.waveform);
        }
        if (preset.vcf) {
            this.setFilterCutoff(preset.vcf.cutoff);
            this.setFilterResonance(preset.vcf.resonance);
        }
        if (preset.lfo) {
            this.setLFORate(preset.lfo.rate);
        }
        if (preset.envelope) {
            this.envelope = { ...this.envelope, ...preset.envelope };
        }

        this.start();
        console.log(`🎛️ Loaded preset: ${presetName}`);
        this.emitPatchUpdate();
    }

    /**
     * Emit patch update event
     */
    emitPatchUpdate() {
        const event = new CustomEvent('patchUpdate', {
            detail: { patches: this.patchMatrix },
        });
        window.dispatchEvent(event);
    }

    /**
     * Get current patch configuration
     */
    getPatchMatrix() {
        return this.patchMatrix;
    }
}

// Export as global
window.Synth2600 = Synth2600AudioEngine;
