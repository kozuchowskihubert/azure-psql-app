/**
 * Drum Synthesis Module
 * 
 * Professional drum synthesizer supporting both trap and techno styles.
 * Includes kick, snare, hi-hat, clap, and percussion synthesis.
 * 
 * Features:
 * - Multiple drum voices (kick, snare, hi-hat, clap, perc)
 * - Style presets (trap, techno, 808, 909, acoustic)
 * - Per-voice parameter control
 * - Pattern-based triggering
 * - Velocity sensitivity
 * - Pitch and tone control
 * 
 * @module Drums
 * @version 2.6.0
 */

class Drums {
    constructor(audioEngine, options = {}) {
        if (!audioEngine || !audioEngine.audioContext) {
            throw new Error('Drums requires CoreAudioEngine instance');
        }

        this.engine = audioEngine;
        this.ctx = audioEngine.audioContext;

        // Default parameters for each drum voice
        this.params = {
            kick: {
                pitch: options.kickPitch || 50,
                decay: options.kickDecay || 0.3,
                punch: options.kickPunch || 0.8,
                gain: options.kickGain || 1.0,
                ...options.kick
            },
            snare: {
                pitch: options.snarePitch || 200,
                decay: options.snareDecay || 0.12,
                snap: options.snareSnap || 0.7,
                gain: options.snareGain || 0.6,
                ...options.snare
            },
            hihat: {
                decay: options.hihatDecay || 0.05,
                tone: options.hihatTone || 7000,
                gain: options.hihatGain || 0.4,
                ...options.hihat
            },
            clap: {
                decay: options.clapDecay || 0.1,
                tone: options.clapTone || 1500,
                gain: options.clapGain || 0.5,
                ...options.clap
            },
            perc: {
                pitch: options.percPitch || 800,
                decay: options.percDecay || 0.08,
                gain: options.percGain || 0.4,
                ...options.perc
            },
            ride: {
                decay: options.rideDecay || 1.5,
                tone: options.rideTone || 4000,
                gain: options.rideGain || 0.35,
                bell: options.rideBell || 0.3,
                ...options.ride
            },
            crash: {
                decay: options.crashDecay || 2.5,
                tone: options.crashTone || 6000,
                gain: options.crashGain || 0.45,
                splash: options.crashSplash || 0.5,
                ...options.crash
            }
        };

        // Audio nodes (created dynamically per trigger)
        this.output = this.engine.createGain(1.0);

        // Sound variations for each drum type
        this.variations = {
            kick: 'classic',
            snare: 'classic',
            hihat: 'classic',
            clap: 'classic',
            perc: 'tom',
            ride: 'classic',
            crash: 'classic'
        };

        // Variation definitions
        this.variationLibrary = {
            kick: {
                classic: { pitch: 150, endPitch: 40, duration: 0.3, clickGain: 0.5, bodyGain: 1.0 },
                deep: { pitch: 100, endPitch: 30, duration: 0.5, clickGain: 0.3, bodyGain: 1.2 },
                hard: { pitch: 180, endPitch: 50, duration: 0.25, clickGain: 0.8, bodyGain: 1.0 },
                industrial: { pitch: 150, endPitch: 40, duration: 0.3, clickGain: 1.0, bodyGain: 0.8, noise: true }
            },
            snare: {
                classic: { pitch: 200, snap: 0.7, tone: 3000, decay: 0.12 },
                tight: { pitch: 250, snap: 1.0, tone: 3500, decay: 0.08 },
                bright: { pitch: 220, snap: 0.8, tone: 4000, decay: 0.1 }
            },
            hihat: {
                classic: { tone: 8000, decay: 0.05, resonance: 1 },
                bright: { tone: 12000, decay: 0.04, resonance: 1.5 },
                metallic: { tone: 9000, decay: 0.06, resonance: 2 },
                open: { tone: 7000, decay: 0.2, resonance: 0.8 }
            },
            clap: {
                classic: { tone: 1500, decay: 0.1, layers: 3 },
                tight: { tone: 2000, decay: 0.05, layers: 2 },
                reverb: { tone: 1200, decay: 0.25, layers: 4 }
            },
            perc: {
                tom: { pitch: 800, endPitch: 400, decay: 0.08 },
                rim: { pitch: 2000, endPitch: 2000, decay: 0.02 },
                conga: { pitch: 350, endPitch: 300, decay: 0.12 },
                cowbell: { pitch: 800, endPitch: 800, decay: 0.15 }
            },
            ride: {
                classic: { tone: 4000, decay: 1.5, bell: 0.3 },
                bright: { tone: 5000, decay: 1.3, bell: 0.4 },
                dark: { tone: 3200, decay: 1.8, bell: 0.2 }
            },
            crash: {
                classic: { tone: 6000, decay: 2.5, splash: 0.5 },
                splash: { tone: 7000, decay: 1.8, splash: 0.8 },
                dark: { tone: 5000, decay: 3.0, splash: 0.3 }
            }
        };
    }

    /**
     * Set drum variation
     * @param {string} drumType - Drum type (kick, snare, hihat, clap, perc, ride, crash)
     * @param {string} variation - Variation name
     */
    setVariation(drumType, variation) {
        if (this.variationLibrary[drumType] && this.variationLibrary[drumType][variation]) {
            this.variations[drumType] = variation;
            console.log(`🥁 ${drumType} variation set to: ${variation}`);
            return true;
        }
        console.warn(`Variation ${variation} not found for ${drumType}`);
        return false;
    }

    /**
     * Get current variation for a drum type
     * @param {string} drumType - Drum type
     * @returns {object} Variation parameters
     */
    getVariationParams(drumType) {
        const variation = this.variations[drumType] || 'classic';
        return this.variationLibrary[drumType][variation];
    }

    /**
     * Trigger kick drum
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerKick(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.kick;

        // === Dual Oscillator Architecture ===
        // Body oscillator (low sine for sub-bass)
        const bodyOsc = this.engine.createOscillator('sine', params.pitch);
        
        // Punch oscillator (higher frequency for attack)
        const punchOsc = this.engine.createOscillator('sine', params.pitch * 2.5);

        // === Filter for tone shaping ===
        const filter = this.engine.createFilter('lowpass', 200, 1);

        // === Gain envelopes ===
        const bodyGain = this.engine.createGain(0);
        const punchGain = this.engine.createGain(0);
        const masterGain = this.engine.createGain(0);

        // === Signal routing ===
        bodyOsc.connect(bodyGain);
        punchOsc.connect(punchGain);
        bodyGain.connect(filter);
        punchGain.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.output);

        // === Pitch envelope (body) ===
        bodyOsc.frequency.setValueAtTime(params.pitch * 2, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(params.pitch, now + 0.05);
        bodyOsc.frequency.exponentialRampToValueAtTime(params.pitch * 0.8, now + 0.1);

        // === Pitch envelope (punch) ===
        punchOsc.frequency.setValueAtTime(params.pitch * 5, now);
        punchOsc.frequency.exponentialRampToValueAtTime(params.pitch * 1.5, now + 0.02);

        // === Body amplitude envelope ===
        const bodyVelocity = 0.8 * velocity;
        bodyGain.gain.setValueAtTime(bodyVelocity, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Punch amplitude envelope ===
        const punchVelocity = params.punch * velocity;
        punchGain.gain.setValueAtTime(punchVelocity, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        // === Master gain ===
        const masterVelocity = params.gain * velocity;
        masterGain.gain.setValueAtTime(masterVelocity, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Filter envelope ===
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        // === Start/stop oscillators ===
        bodyOsc.start(now);
        punchOsc.start(now);
        
        const stopTime = now + params.decay + 0.1;
        bodyOsc.stop(stopTime);
        punchOsc.stop(stopTime);

        // Cleanup
        bodyOsc.onended = () => {
            bodyOsc.disconnect();
            punchOsc.disconnect();
            bodyGain.disconnect();
            punchGain.disconnect();
            masterGain.disconnect();
            filter.disconnect();
        };
    }

    /**
     * Trigger snare drum
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerSnare(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.snare;

        // === Tonal component (triangle wave) ===
        const toneOsc = this.engine.createOscillator('triangle', params.pitch);

        // === Noise component (white noise for crack) ===
        const noiseBuffer = this.engine.createNoiseBuffer(0.1, 'white');
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // === Filters ===
        const toneFilter = this.engine.createFilter('highpass', 200, 1);
        const noiseFilter = this.engine.createFilter('bandpass', 3000, 2);

        // === Gains ===
        const toneGain = this.engine.createGain(0);
        const noiseGain = this.engine.createGain(0);
        const masterGain = this.engine.createGain(0);

        // === Signal routing ===
        toneOsc.connect(toneFilter);
        toneFilter.connect(toneGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        toneGain.connect(masterGain);
        noiseGain.connect(masterGain);
        masterGain.connect(this.output);

        // === Tone pitch envelope ===
        toneOsc.frequency.setValueAtTime(params.pitch, now);
        toneOsc.frequency.exponentialRampToValueAtTime(params.pitch * 0.5, now + 0.05);

        // === Tone amplitude envelope ===
        const toneVelocity = 0.3 * velocity;
        toneGain.gain.setValueAtTime(toneVelocity, now);
        toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        // === Noise amplitude envelope (shorter for snap) ===
        const noiseVelocity = params.snap * velocity;
        noiseGain.gain.setValueAtTime(noiseVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        // === Master gain ===
        const masterVelocity = params.gain * velocity;
        masterGain.gain.setValueAtTime(masterVelocity, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Start/stop ===
        toneOsc.start(now);
        noise.start(now);
        
        const stopTime = now + params.decay + 0.05;
        toneOsc.stop(stopTime);
        noise.stop(stopTime);

        // Cleanup
        toneOsc.onended = () => {
            toneOsc.disconnect();
            noise.disconnect();
            toneFilter.disconnect();
            noiseFilter.disconnect();
            toneGain.disconnect();
            noiseGain.disconnect();
            masterGain.disconnect();
        };
    }

    /**
     * Trigger hi-hat
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     * @param {boolean} open - Open hi-hat (longer decay)
     */
    triggerHiHat(velocity = 1.0, startTime = null, open = false) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.hihat;
        const decay = open ? params.decay * 4 : params.decay;

        // === Multiple square waves for metallic sound ===
        const frequencies = [317, 421, 543, 789]; // Inharmonic ratios
        const oscillators = frequencies.map(freq => {
            const osc = this.engine.createOscillator('square', freq);
            return osc;
        });

        // === Noise for shimmer ===
        const noiseBuffer = this.engine.createNoiseBuffer(decay + 0.02, 'white');
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // === Filters ===
        const oscFilter = this.engine.createFilter('highpass', params.tone, 1);
        const noiseFilter = this.engine.createFilter('bandpass', 10000, 0.5);

        // === Gains ===
        const oscGain = this.engine.createGain(0);
        const noiseGain = this.engine.createGain(0);
        const masterGain = this.engine.createGain(0);

        // === Signal routing ===
        oscillators.forEach(osc => osc.connect(oscGain));
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        oscGain.connect(oscFilter);
        oscFilter.connect(masterGain);
        noiseGain.connect(masterGain);
        masterGain.connect(this.output);

        // === Oscillator envelope ===
        const oscVelocity = 0.1 * velocity;
        oscGain.gain.setValueAtTime(oscVelocity, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + decay * 0.6);

        // === Noise envelope ===
        const noiseVelocity = 0.25 * velocity;
        noiseGain.gain.setValueAtTime(noiseVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + decay * 0.8);

        // === Master gain ===
        const masterVelocity = params.gain * velocity;
        masterGain.gain.setValueAtTime(masterVelocity, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

        // === Start/stop ===
        oscillators.forEach(osc => osc.start(now));
        noise.start(now);
        
        const stopTime = now + decay + 0.02;
        oscillators.forEach(osc => osc.stop(stopTime));
        noise.stop(stopTime);

        // Cleanup
        oscillators[0].onended = () => {
            oscillators.forEach(osc => osc.disconnect());
            noise.disconnect();
            oscFilter.disconnect();
            noiseFilter.disconnect();
            oscGain.disconnect();
            noiseGain.disconnect();
            masterGain.disconnect();
        };
    }

    /**
     * Trigger clap (layered noise bursts)
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerClap(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.clap;

        // Layered claps for realistic sound
        const offsets = [0, 0.015, 0.03];

        offsets.forEach(offset => {
            const noiseBuffer = this.engine.createNoiseBuffer(params.decay, 'white');
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = this.engine.createFilter('bandpass', params.tone, 1);
            const gain = this.engine.createGain(0);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.output);

            const layerVelocity = params.gain * velocity * 0.5;
            gain.gain.setValueAtTime(layerVelocity, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + params.decay);

            noise.start(now + offset);
            noise.stop(now + offset + params.decay + 0.01);

            noise.onended = () => {
                noise.disconnect();
                filter.disconnect();
                gain.disconnect();
            };
        });
    }

    /**
     * Trigger percussion (tuned percussion)
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerPerc(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.perc;

        const osc = this.engine.createOscillator('sine', params.pitch);
        const gain = this.engine.createGain(0);

        osc.connect(gain);
        gain.connect(this.output);

        // Pitch envelope
        osc.frequency.setValueAtTime(params.pitch, now);
        osc.frequency.exponentialRampToValueAtTime(params.pitch * 0.5, now + 0.05);

        // Amplitude envelope
        const percVelocity = params.gain * velocity;
        gain.gain.setValueAtTime(percVelocity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        osc.start(now);
        osc.stop(now + params.decay + 0.01);

        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }

    /**
     * Trigger ride cymbal (metallic sustain with bell component)
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerRide(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.ride;

        // === Multiple square waves for metallic character ===
        const frequencies = [
            params.tone * 0.8,
            params.tone * 1.0,
            params.tone * 1.25,
            params.tone * 1.5,
            params.tone * 1.8
        ];
        const oscillators = frequencies.map(freq => {
            const osc = this.engine.createOscillator('square', freq);
            return osc;
        });

        // === Bell component (sine wave for ride bell) ===
        const bellOsc = this.engine.createOscillator('sine', params.tone * 2);

        // === Noise for shimmer ===
        const noiseBuffer = this.engine.createNoiseBuffer(params.decay + 0.05, 'white');
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // === Filters ===
        const oscFilter = this.engine.createFilter('bandpass', params.tone, 1.5);
        const bellFilter = this.engine.createFilter('bandpass', params.tone * 2, 2);
        const noiseFilter = this.engine.createFilter('bandpass', params.tone * 1.5, 0.8);

        // === Gains ===
        const oscGain = this.engine.createGain(0);
        const bellGain = this.engine.createGain(0);
        const noiseGain = this.engine.createGain(0);
        const masterGain = this.engine.createGain(0);

        // === Signal routing ===
        oscillators.forEach(osc => osc.connect(oscGain));
        bellOsc.connect(bellFilter);
        bellFilter.connect(bellGain);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        oscGain.connect(oscFilter);
        oscFilter.connect(masterGain);
        bellGain.connect(masterGain);
        noiseGain.connect(masterGain);
        masterGain.connect(this.output);

        // === Oscillator envelope (long sustain) ===
        const oscVelocity = 0.08 * velocity;
        oscGain.gain.setValueAtTime(oscVelocity, now);
        oscGain.gain.exponentialRampToValueAtTime(oscVelocity * 0.5, now + params.decay * 0.3);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Bell envelope (quick attack with moderate sustain) ===
        const bellVelocity = params.bell * velocity;
        bellGain.gain.setValueAtTime(bellVelocity, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay * 0.4);

        // === Noise envelope (shimmering tail) ===
        const noiseVelocity = 0.15 * velocity;
        noiseGain.gain.setValueAtTime(noiseVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Master gain ===
        const masterVelocity = params.gain * velocity;
        masterGain.gain.setValueAtTime(masterVelocity, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Start/stop ===
        oscillators.forEach(osc => osc.start(now));
        bellOsc.start(now);
        noise.start(now);
        
        const stopTime = now + params.decay + 0.05;
        oscillators.forEach(osc => osc.stop(stopTime));
        bellOsc.stop(stopTime);
        noise.stop(stopTime);

        // Cleanup
        oscillators[0].onended = () => {
            oscillators.forEach(osc => osc.disconnect());
            bellOsc.disconnect();
            noise.disconnect();
            oscFilter.disconnect();
            bellFilter.disconnect();
            noiseFilter.disconnect();
            oscGain.disconnect();
            bellGain.disconnect();
            noiseGain.disconnect();
            masterGain.disconnect();
        };
    }

    /**
     * Trigger crash cymbal (bright explosive wash)
     * @param {number} velocity - Note velocity 0-1
     * @param {number} startTime - When to start (AudioContext time)
     */
    triggerCrash(velocity = 1.0, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const params = this.params.crash;

        // === Multiple square waves for complex metallic character ===
        const frequencies = [
            params.tone * 0.5,
            params.tone * 0.7,
            params.tone * 1.0,
            params.tone * 1.4,
            params.tone * 1.7,
            params.tone * 2.1
        ];
        const oscillators = frequencies.map(freq => {
            const osc = this.engine.createOscillator('square', freq);
            return osc;
        });

        // === Noise for crash wash ===
        const noiseBuffer = this.engine.createNoiseBuffer(params.decay + 0.1, 'white');
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        // === Splash component (higher frequency burst) ===
        const splashNoiseBuffer = this.engine.createNoiseBuffer(0.3, 'white');
        const splashNoise = this.ctx.createBufferSource();
        splashNoise.buffer = splashNoiseBuffer;

        // === Filters ===
        const oscFilter = this.engine.createFilter('highpass', params.tone * 0.5, 1);
        const noiseFilter = this.engine.createFilter('bandpass', params.tone, 0.5);
        const splashFilter = this.engine.createFilter('highpass', params.tone * 2, 2);

        // === Gains ===
        const oscGain = this.engine.createGain(0);
        const noiseGain = this.engine.createGain(0);
        const splashGain = this.engine.createGain(0);
        const masterGain = this.engine.createGain(0);

        // === Signal routing ===
        oscillators.forEach(osc => osc.connect(oscGain));
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        splashNoise.connect(splashFilter);
        splashFilter.connect(splashGain);
        oscGain.connect(oscFilter);
        oscFilter.connect(masterGain);
        noiseGain.connect(masterGain);
        splashGain.connect(masterGain);
        masterGain.connect(this.output);

        // === Oscillator envelope (explosive attack, long decay) ===
        const oscVelocity = 0.12 * velocity;
        oscGain.gain.setValueAtTime(oscVelocity, now);
        oscGain.gain.exponentialRampToValueAtTime(oscVelocity * 0.6, now + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Noise envelope (long wash) ===
        const noiseVelocity = 0.35 * velocity;
        noiseGain.gain.setValueAtTime(noiseVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(noiseVelocity * 0.4, now + params.decay * 0.3);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Splash envelope (bright initial burst) ===
        const splashVelocity = params.splash * velocity;
        splashGain.gain.setValueAtTime(splashVelocity, now);
        splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        // === Master gain ===
        const masterVelocity = params.gain * velocity;
        masterGain.gain.setValueAtTime(masterVelocity, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + params.decay);

        // === Start/stop ===
        oscillators.forEach(osc => osc.start(now));
        noise.start(now);
        splashNoise.start(now);
        
        const stopTime = now + params.decay + 0.1;
        oscillators.forEach(osc => osc.stop(stopTime));
        noise.stop(stopTime);
        splashNoise.stop(now + 0.3);

        // Cleanup
        oscillators[0].onended = () => {
            oscillators.forEach(osc => osc.disconnect());
            noise.disconnect();
            splashNoise.disconnect();
            oscFilter.disconnect();
            noiseFilter.disconnect();
            splashFilter.disconnect();
            oscGain.disconnect();
            noiseGain.disconnect();
            splashGain.disconnect();
            masterGain.disconnect();
        };
    }

    /**
     * Trigger pattern (16-step grid)
     * @param {object} pattern - Pattern object with kick, snare, hihat, clap arrays
     * @param {number} bpm - Tempo in beats per minute
     * @param {number} startTime - When to start pattern
     */
    triggerPattern(pattern, bpm = 120, startTime = null) {
        const now = startTime || this.ctx.currentTime;
        const stepTime = (60 / bpm) / 4; // 16th note duration

        // Trigger kick
        if (pattern.kick) {
            pattern.kick.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerKick(velocity, now + (step * stepTime));
                }
            });
        }

        // Trigger snare
        if (pattern.snare) {
            pattern.snare.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerSnare(velocity, now + (step * stepTime));
                }
            });
        }

        // Trigger hi-hat
        if (pattern.hihat) {
            pattern.hihat.forEach((velocity, step) => {
                if (velocity > 0) {
                    const open = pattern.hihatOpen && pattern.hihatOpen[step];
                    this.triggerHiHat(velocity, now + (step * stepTime), open);
                }
            });
        }

        // Trigger clap
        if (pattern.clap) {
            pattern.clap.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerClap(velocity, now + (step * stepTime));
                }
            });
        }

        // Trigger perc
        if (pattern.perc) {
            pattern.perc.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerPerc(velocity, now + (step * stepTime));
                }
            });
        }

        // Trigger ride
        if (pattern.ride) {
            pattern.ride.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerRide(velocity, now + (step * stepTime));
                }
            });
        }

        // Trigger crash
        if (pattern.crash) {
            pattern.crash.forEach((velocity, step) => {
                if (velocity > 0) {
                    this.triggerCrash(velocity, now + (step * stepTime));
                }
            });
        }
    }

    /**
     * Parameter setters
     */
    setKickPitch(value) {
        this.params.kick.pitch = Math.max(30, Math.min(150, value));
    }

    setKickDecay(value) {
        this.params.kick.decay = Math.max(0.05, Math.min(1.0, value));
    }

    setKickPunch(value) {
        this.params.kick.punch = Math.max(0, Math.min(1, value));
    }

    setSnarePitch(value) {
        this.params.snare.pitch = Math.max(100, Math.min(400, value));
    }

    setSnareSnap(value) {
        this.params.snare.snap = Math.max(0, Math.min(1, value));
    }

    setHiHatDecay(value) {
        this.params.hihat.decay = Math.max(0.02, Math.min(0.5, value));
    }

    setHiHatTone(value) {
        this.params.hihat.tone = Math.max(5000, Math.min(15000, value));
    }

    setMasterGain(value) {
        this.output.gain.setValueAtTime(Math.max(0, Math.min(1, value)), this.ctx.currentTime);
    }

    /**
     * Load preset
     */
    loadPreset(presetName) {
        const presets = {
            // Trap 808 style
            trap: {
                kick: { pitch: 55, decay: 0.4, punch: 0.9, gain: 1.0 },
                snare: { pitch: 200, decay: 0.12, snap: 0.8, gain: 0.7 },
                hihat: { decay: 0.04, tone: 8000, gain: 0.35 },
                clap: { decay: 0.1, tone: 1500, gain: 0.6 },
                perc: { pitch: 800, decay: 0.08, gain: 0.4 },
                ride: { decay: 1.8, tone: 4200, bell: 0.25, gain: 0.3 },
                crash: { decay: 2.2, tone: 6500, splash: 0.6, gain: 0.4 }
            },
            // Techno 909 style
            techno: {
                kick: { pitch: 50, decay: 0.3, punch: 0.7, gain: 1.0 },
                snare: { pitch: 180, decay: 0.1, snap: 0.6, gain: 0.6 },
                hihat: { decay: 0.05, tone: 9000, gain: 0.4 },
                clap: { decay: 0.12, tone: 1800, gain: 0.5 },
                perc: { pitch: 900, decay: 0.06, gain: 0.35 },
                ride: { decay: 1.5, tone: 4000, bell: 0.3, gain: 0.35 },
                crash: { decay: 2.5, tone: 6000, splash: 0.5, gain: 0.45 }
            },
            // Classic 808
            '808': {
                kick: { pitch: 60, decay: 0.5, punch: 1.0, gain: 1.0 },
                snare: { pitch: 220, decay: 0.15, snap: 0.9, gain: 0.6 },
                hihat: { decay: 0.03, tone: 7000, gain: 0.3 },
                clap: { decay: 0.08, tone: 1200, gain: 0.5 },
                perc: { pitch: 850, decay: 0.1, gain: 0.4 },
                ride: { decay: 1.6, tone: 3800, bell: 0.2, gain: 0.3 },
                crash: { decay: 2.0, tone: 5500, splash: 0.4, gain: 0.4 }
            },
            // 909 style
            '909': {
                kick: { pitch: 45, decay: 0.25, punch: 0.6, gain: 1.0 },
                snare: { pitch: 150, decay: 0.08, snap: 0.5, gain: 0.65 },
                hihat: { decay: 0.06, tone: 10000, gain: 0.45 },
                clap: { decay: 0.15, tone: 2000, gain: 0.55 },
                perc: { pitch: 1000, decay: 0.05, gain: 0.3 },
                ride: { decay: 1.7, tone: 4500, bell: 0.35, gain: 0.4 },
                crash: { decay: 2.8, tone: 6800, splash: 0.5, gain: 0.5 }
            },
            // Minimal
            minimal: {
                kick: { pitch: 40, decay: 0.2, punch: 0.5, gain: 0.9 },
                snare: { pitch: 160, decay: 0.06, snap: 0.4, gain: 0.5 },
                hihat: { decay: 0.08, tone: 11000, gain: 0.35 },
                clap: { decay: 0.1, tone: 1600, gain: 0.45 },
                perc: { pitch: 750, decay: 0.04, gain: 0.3 },
                ride: { decay: 1.3, tone: 3500, bell: 0.15, gain: 0.25 },
                crash: { decay: 1.8, tone: 5000, splash: 0.3, gain: 0.35 }
            },
            // Hard
            hard: {
                kick: { pitch: 70, decay: 0.35, punch: 1.0, gain: 1.0 },
                snare: { pitch: 250, decay: 0.14, snap: 1.0, gain: 0.8 },
                hihat: { decay: 0.035, tone: 8500, gain: 0.5 },
                clap: { decay: 0.12, tone: 1400, gain: 0.7 },
                perc: { pitch: 950, decay: 0.09, gain: 0.5 },
                ride: { decay: 1.4, tone: 4200, bell: 0.4, gain: 0.35 },
                crash: { decay: 2.3, tone: 6200, splash: 0.6, gain: 0.45 }
            }
        };

        const preset = presets[presetName];
        if (preset) {
            this.params = { ...preset };
            console.log(`🥁 Drum Preset loaded: ${presetName}`);
            return preset;
        } else {
            console.warn(`Preset '${presetName}' not found`);
            return null;
        }
    }

    /**
     * Get drum pattern presets
     */
    static get PATTERNS() {
        return {
            // Basic trap beat
            trapBasic: {
                kick:   [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat:  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                clap:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
            },
            // Four-on-the-floor techno
            technoBasic: {
                kick:   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat:  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                clap:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            // Rolling hi-hats
            trapRolling: {
                kick:   [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.6, 0],
                snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat:  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.6],
                clap:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
            }
        };
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        if (this.output) {
            this.output.disconnect();
        }
        this.output = null;
        console.log('🔴 Drums disposed');
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Drums;
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.Drums = Drums;
}
