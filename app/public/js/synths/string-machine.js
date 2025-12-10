/**
 * String Machine Synthesizer Module
 * Emulates classic string synthesizers (Solina, ARP Omni, Roland RS-202)
 *
 * Features:
 * - Lush multi-oscillator ensemble effect
 * - Chorus/Ensemble modulation
 * - Violin, Viola, Cello, Brass sections
 * - Attack/Release controls
 * - Vibrato LFO
 * - Built-in reverb
 */

class StringMachine {
    constructor(audioContext) {
        this.audioContext = audioContext;

        // String sections
        this.sections = {
            violin: { enabled: true, detune: 5, gain: 0.25 },
            viola: { enabled: true, detune: -5, gain: 0.25 },
            cello: { enabled: true, detune: -12, gain: 0.3 },
            brass: { enabled: false, detune: 0, gain: 0.3 },
        };

        // Envelope
        this.envelope = {
            attack: 0.8,  // Slow attack for strings
            release: 1.2,  // Long release for sustain
        };

        // Chorus/Ensemble
        this.chorus = {
            enabled: true,
            depth: 0.5,
            rate: 0.3,
            mix: 0.6,
        };

        // Vibrato
        this.vibrato = {
            enabled: true,
            depth: 0.15,
            rate: 5.5,
        };

        // Filter
        this.filter = {
            cutoff: 2500,
            resonance: 2,
            type: 'lowpass',
        };

        // Reverb
        this.reverb = {
            enabled: true,
            decay: 2.5,
            mix: 0.35,
        };

        // Master
        this.master = {
            volume: 0.7,
            tone: 0.5,  // Brightness control
        };

        // Active voices
        this.activeVoices = [];
    }

    /**
     * Play a note with string synthesis
     */
    playNote(frequency, duration = 2.0, velocity = 0.8) {
        const now = this.audioContext.currentTime;
        const voice = {
            oscillators: [],
            gains: [],
            filters: [],
            lfos: [],
            cleanup: null,
        };

        // Create ensemble of oscillators per enabled section
        const enabledSections = Object.entries(this.sections)
            .filter(([name, section]) => section.enabled);

        enabledSections.forEach(([name, section]) => {
            // Create multiple detuned oscillators for chorus effect
            for (let i = 0; i < 3; i++) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                // Use sawtooth for strings (rich harmonics)
                osc.type = name === 'brass' ? 'sawtooth' : 'sawtooth';

                // Detune for section and ensemble effect
                const detuneAmount = section.detune + (i - 1) * 8;
                osc.frequency.value = frequency;
                osc.detune.value = detuneAmount;

                // Filter configuration
                filter.type = this.filter.type;
                filter.frequency.value = this.filter.cutoff;
                filter.Q.value = this.filter.resonance;

                // Gain per oscillator (divided by number of oscillators)
                const oscGain = (section.gain * velocity) / (enabledSections.length * 3);
                gain.gain.value = 0;

                // Envelope
                const attackTime = this.envelope.attack;
                const releaseTime = this.envelope.release;

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(oscGain, now + attackTime);
                gain.gain.setValueAtTime(oscGain, now + duration - releaseTime);
                gain.gain.linearRampToValueAtTime(0, now + duration);

                // Add vibrato if enabled
                if (this.vibrato.enabled) {
                    const lfo = this.audioContext.createOscillator();
                    const lfoGain = this.audioContext.createGain();

                    lfo.type = 'sine';
                    lfo.frequency.value = this.vibrato.rate;
                    lfoGain.gain.value = this.vibrato.depth * frequency;

                    lfo.connect(lfoGain);
                    lfoGain.connect(osc.frequency);
                    lfo.start(now);
                    lfo.stop(now + duration);

                    voice.lfos.push(lfo);
                }

                // Connect chain: OSC → Filter → Gain
                osc.connect(filter);
                filter.connect(gain);

                osc.start(now);
                osc.stop(now + duration);

                voice.oscillators.push(osc);
                voice.gains.push(gain);
                voice.filters.push(filter);
            }
        });

        // Create chorus effect
        let chorusOutput = null;
        if (this.chorus.enabled) {
            chorusOutput = this.createChorusEffect(now, duration);

            // Connect all gains to chorus
            voice.gains.forEach(gain => {
                gain.connect(chorusOutput.input);
            });
        }

        // Master output with reverb
        const masterGain = this.audioContext.createGain();
        masterGain.gain.value = this.master.volume;

        if (this.chorus.enabled) {
            chorusOutput.output.connect(masterGain);
        } else {
            voice.gains.forEach(gain => {
                gain.connect(masterGain);
            });
        }

        // Add reverb if enabled
        if (this.reverb.enabled) {
            const reverb = this.createReverbEffect();
            const reverbGain = this.audioContext.createGain();
            const dryGain = this.audioContext.createGain();

            reverbGain.gain.value = this.reverb.mix;
            dryGain.gain.value = 1 - this.reverb.mix;

            masterGain.connect(reverb);
            masterGain.connect(dryGain);
            reverb.connect(reverbGain);

            reverbGain.connect(this.audioContext.destination);
            dryGain.connect(this.audioContext.destination);
        } else {
            masterGain.connect(this.audioContext.destination);
        }

        // Cleanup function
        voice.cleanup = setTimeout(() => {
            this.activeVoices = this.activeVoices.filter(v => v !== voice);
        }, duration * 1000);

        this.activeVoices.push(voice);

        return voice;
    }

    /**
     * Create chorus effect
     */
    createChorusEffect(startTime, duration) {
        const delayTime = 0.02; // 20ms delay
        const delay = this.audioContext.createDelay(delayTime * 2);
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const output = this.audioContext.createGain();

        delay.delayTime.value = delayTime;
        lfo.frequency.value = this.chorus.rate;
        lfoGain.gain.value = delayTime * this.chorus.depth;
        wetGain.gain.value = this.chorus.mix;
        dryGain.gain.value = 1 - this.chorus.mix;

        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);

        lfo.start(startTime);
        lfo.stop(startTime + duration);

        return {
            input: delay,
            output,
            connect: (node) => {
                delay.connect(wetGain);
                delay.connect(dryGain);
                wetGain.connect(output);
                dryGain.connect(output);
                output.connect(node);
            },
        };
    }

    /**
     * Create reverb effect using convolver
     */
    createReverbEffect() {
        const convolver = this.audioContext.createConvolver();

        // Generate impulse response for reverb
        const length = this.audioContext.sampleRate * this.reverb.decay;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            left[i] = (Math.random() * 2 - 1) * Math.exp(-3 * n);
            right[i] = (Math.random() * 2 - 1) * Math.exp(-3 * n);
        }

        convolver.buffer = impulse;
        return convolver;
    }

    /**
     * Play a chord (multiple notes)
     */
    playChord(frequencies, duration = 2.0, velocity = 0.7) {
        const voices = [];
        frequencies.forEach(freq => {
            voices.push(this.playNote(freq, duration, velocity));
        });
        return voices;
    }

    /**
     * Stop all active voices
     */
    stopAll() {
        this.activeVoices.forEach(voice => {
            if (voice.cleanup) {
                clearTimeout(voice.cleanup);
            }
        });
        this.activeVoices = [];
    }

    /**
     * Set section enable/disable
     */
    setSection(section, enabled) {
        if (this.sections[section]) {
            this.sections[section].enabled = enabled;
        }
    }

    /**
     * Set envelope parameters
     */
    setEnvelope(attack, release) {
        this.envelope.attack = Math.max(0.01, attack);
        this.envelope.release = Math.max(0.01, release);
    }

    /**
     * Set chorus parameters
     */
    setChorus(enabled, depth, rate, mix) {
        this.chorus.enabled = enabled;
        if (depth !== undefined) this.chorus.depth = Math.max(0, Math.min(1, depth));
        if (rate !== undefined) this.chorus.rate = Math.max(0.1, Math.min(10, rate));
        if (mix !== undefined) this.chorus.mix = Math.max(0, Math.min(1, mix));
    }

    /**
     * Set vibrato parameters
     */
    setVibrato(enabled, depth, rate) {
        this.vibrato.enabled = enabled;
        if (depth !== undefined) this.vibrato.depth = Math.max(0, Math.min(1, depth));
        if (rate !== undefined) this.vibrato.rate = Math.max(1, Math.min(10, rate));
    }

    /**
     * Set filter parameters
     */
    setFilter(cutoff, resonance) {
        if (cutoff !== undefined) this.filter.cutoff = Math.max(100, Math.min(20000, cutoff));
        if (resonance !== undefined) this.filter.resonance = Math.max(0, Math.min(20, resonance));
    }

    /**
     * Set reverb parameters
     */
    setReverb(enabled, decay, mix) {
        this.reverb.enabled = enabled;
        if (decay !== undefined) this.reverb.decay = Math.max(0.1, Math.min(10, decay));
        if (mix !== undefined) this.reverb.mix = Math.max(0, Math.min(1, mix));
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.master.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get preset configurations
     */
    static getPresets() {
        return {
            lush_strings: {
                name: "Lush Strings",
                sections: {
                    violin: { enabled: true, detune: 5, gain: 0.25 },
                    viola: { enabled: true, detune: -5, gain: 0.25 },
                    cello: { enabled: true, detune: -12, gain: 0.3 },
                    brass: { enabled: false, detune: 0, gain: 0.3 },
                },
                envelope: { attack: 0.8, release: 1.2 },
                chorus: { enabled: true, depth: 0.5, rate: 0.3, mix: 0.6 },
                vibrato: { enabled: true, depth: 0.15, rate: 5.5 },
                filter: { cutoff: 2500, resonance: 2 },
                reverb: { enabled: true, decay: 2.5, mix: 0.35 },
            },

            techno_pad: {
                name: "Techno Pad",
                sections: {
                    violin: { enabled: true, detune: 8, gain: 0.3 },
                    viola: { enabled: true, detune: -8, gain: 0.3 },
                    cello: { enabled: false, detune: -12, gain: 0.3 },
                    brass: { enabled: false, detune: 0, gain: 0.3 },
                },
                envelope: { attack: 1.2, release: 0.8 },
                chorus: { enabled: true, depth: 0.7, rate: 0.5, mix: 0.7 },
                vibrato: { enabled: false, depth: 0.15, rate: 5.5 },
                filter: { cutoff: 3000, resonance: 4 },
                reverb: { enabled: true, decay: 3.0, mix: 0.5 },
            },

            dark_ambient: {
                name: "Dark Ambient",
                sections: {
                    violin: { enabled: false, detune: 5, gain: 0.25 },
                    viola: { enabled: true, detune: -10, gain: 0.35 },
                    cello: { enabled: true, detune: -18, gain: 0.4 },
                    brass: { enabled: false, detune: 0, gain: 0.3 },
                },
                envelope: { attack: 2.0, release: 2.5 },
                chorus: { enabled: true, depth: 0.3, rate: 0.2, mix: 0.4 },
                vibrato: { enabled: true, depth: 0.1, rate: 3.0 },
                filter: { cutoff: 1200, resonance: 1 },
                reverb: { enabled: true, decay: 4.0, mix: 0.6 },
            },

            brass_section: {
                name: "Brass Section",
                sections: {
                    violin: { enabled: false, detune: 5, gain: 0.25 },
                    viola: { enabled: false, detune: -5, gain: 0.25 },
                    cello: { enabled: false, detune: -12, gain: 0.3 },
                    brass: { enabled: true, detune: 0, gain: 0.5 },
                },
                envelope: { attack: 0.3, release: 0.6 },
                chorus: { enabled: true, depth: 0.4, rate: 0.4, mix: 0.5 },
                vibrato: { enabled: true, depth: 0.2, rate: 6.0 },
                filter: { cutoff: 3500, resonance: 3 },
                reverb: { enabled: true, decay: 1.8, mix: 0.25 },
            },

            ethereal_wash: {
                name: "Ethereal Wash",
                sections: {
                    violin: { enabled: true, detune: 12, gain: 0.2 },
                    viola: { enabled: true, detune: -12, gain: 0.2 },
                    cello: { enabled: true, detune: -24, gain: 0.25 },
                    brass: { enabled: false, detune: 0, gain: 0.3 },
                },
                envelope: { attack: 2.5, release: 3.0 },
                chorus: { enabled: true, depth: 0.8, rate: 0.15, mix: 0.8 },
                vibrato: { enabled: true, depth: 0.25, rate: 4.0 },
                filter: { cutoff: 2000, resonance: 1 },
                reverb: { enabled: true, decay: 5.0, mix: 0.7 },
            },
        };
    }

    /**
     * Load preset
     */
    loadPreset(presetName) {
        const presets = StringMachine.getPresets();
        const preset = presets[presetName];

        if (!preset) {
            console.warn(`Preset ${presetName} not found`);
            return false;
        }

        // Apply preset settings
        this.sections = JSON.parse(JSON.stringify(preset.sections));
        this.envelope = { ...preset.envelope };
        this.chorus = { ...preset.chorus };
        this.vibrato = { ...preset.vibrato };
        this.filter = { ...preset.filter };
        this.reverb = { ...preset.reverb };

        return true;
    }
}

// Also support CommonJS for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StringMachine;
}
