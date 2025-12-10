/**
 * HAOS.fm Standalone Web Audio Synthesis Engine
 *
 * Self-contained synthesis system for HAOS Platform
 * No external dependencies required
 *
 * Features:
 * - TB-303 style acid bass synthesis
 * - TR-909 drum machine synthesis
 * - 16-step sequencer
 * - Preset system
 */

class HAOSAudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;

        // Synthesis modules
        this.tb303 = null;
        this.tr909 = null;
        this.sequencer = null;

        // Preset libraries
        this.factoryPresets = [];
        this.arp2600Presets = [];
        this.presetsLoaded = false;
    }

    async init() {
        if (this.initialized) return;

        console.log('🎛️ Initializing HAOS Audio Engine...');

        // Create Audio Context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.audioContext.destination);

        // Initialize modules
        this.tb303 = new HAOSTB303(this.audioContext, this.masterGain);
        this.tr909 = new HAOSTR909(this.audioContext, this.masterGain);
        this.sequencer = new HAOSSequencer(this.audioContext, this.tr909);

        // Load presets asynchronously (don't block initialization)
        this.loadPresets().catch(err => console.warn('⚠️  Preset loading failed:', err));

        this.initialized = true;

        console.log('✅ HAOS Audio Engine initialized');
        console.log(`   Sample Rate: ${this.audioContext.sampleRate} Hz`);
        console.log(`   State: ${this.audioContext.state}`);

        return true;
    }

    /**
     * Load factory presets (TB-303, TR-909, TR-808) and ARP 2600 presets
     */
    async loadPresets() {
        try {
            // Load factory presets (TB-303, drums, etc.)
            const factoryResponse = await fetch('/data/factory-presets.json');
            if (factoryResponse.ok) {
                this.factoryPresets = await factoryResponse.json();
                console.log(`✅ Loaded ${this.factoryPresets.length} factory presets`);
            }
        } catch (err) {
            console.warn('⚠️  Could not load factory presets:', err.message);
        }

        // Try to load ARP 2600 presets if available
        try {
            const arp2600Response = await fetch('/data/preset_library.json');
            if (arp2600Response.ok) {
                this.arp2600Presets = await fetch('/data/preset_library.json');
                console.log(`✅ Loaded ${this.arp2600Presets.length} ARP 2600 presets`);
            }
        } catch (err) {
            console.log('ℹ️  ARP 2600 presets not available');
        }

        this.presetsLoaded = true;
    }

    /**
     * Get all available presets
     */
    getPresets(type = null) {
        const allPresets = [...this.factoryPresets, ...this.arp2600Presets];

        if (!type) return allPresets;

        return allPresets.filter(p => p.type === type);
    }

    /**
     * Get presets by category
     */
    getPresetsByCategory(category) {
        return [...this.factoryPresets, ...this.arp2600Presets]
            .filter(p => p.category === category);
    }

    /**
     * Apply a preset to the TB-303 synth
     */
    applyTB303Preset(presetId) {
        const preset = this.factoryPresets.find(p => p.id === presetId);

        if (!preset) {
            console.warn('❌ Preset not found:', presetId);
            return false;
        }

        if (preset.type !== 'tb303') {
            console.warn('❌ Not a TB-303 preset:', presetId);
            return false;
        }

        // Apply parameters to TB-303
        if (preset.parameters) {
            Object.keys(preset.parameters).forEach(param => {
                if (this.tb303.params.hasOwnProperty(param)) {
                    this.tb303.params[param] = preset.parameters[param];
                }
            });

            console.log(`✅ Applied TB-303 preset: ${preset.name}`);
            return true;
        }

        return false;
    }

    /**
     * Search presets by name or tags
     */
    searchPresets(query) {
        const lowerQuery = query.toLowerCase();
        return [...this.factoryPresets, ...this.arp2600Presets].filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery)),
        );
    }

    // Resume audio context (required for browser autoplay policies)
    async resume() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

/**
 * TB-303 Bass Synthesizer
 * Classic acid bassline synthesis with filter, resonance, and envelope
 */
class HAOSTB303 {
    constructor(audioContext, output) {
        this.context = audioContext;
        this.output = output;

        // Synthesis parameters
        this.params = {
            cutoff: 1200,
            resonance: 15,
            envMod: 70,
            decay: 0.3,
            distortion: 20,
            accentLevel: 50,
            waveform: 'sawtooth',
            // Advanced modulation
            lfoRate: 4,
            lfoDepth: 0,
            lfoTarget: 'filter', // 'filter', 'pitch', 'amp'
            lfoWaveform: 'sine',
            portamento: 0.05,
            slide: false,
        };

        // LFO
        this.lfo = null;
        this.lfoGain = null;
        this.initLFO();
    }

    initLFO() {
        this.lfo = this.context.createOscillator();
        this.lfo.type = this.params.lfoWaveform;
        this.lfo.frequency.value = this.params.lfoRate;

        this.lfoGain = this.context.createGain();
        this.lfoGain.gain.value = this.params.lfoDepth;

        this.lfo.connect(this.lfoGain);
        this.lfo.start();
    }

    setParam(param, value) {
        this.params[param] = parseFloat(value);
        console.log(`TB-303 ${param}:`, this.params[param]);
    }

    /**
     * Apply a preset to the TB-303
     * @param {Object} preset - Preset object with parameters
     */
    applyPreset(preset) {
        if (!preset || !preset.parameters) {
            console.warn('❌ Invalid preset format');
            return false;
        }

        // Apply each parameter from the preset
        Object.keys(preset.parameters).forEach(param => {
            if (this.params.hasOwnProperty(param)) {
                this.params[param] = preset.parameters[param];
            }
        });

        // Update LFO if waveform changed
        if (preset.parameters.lfoWaveform && this.lfo) {
            this.lfo.type = preset.parameters.lfoWaveform;
        }

        // Update LFO rate if changed
        if (preset.parameters.lfoRate && this.lfo) {
            this.lfo.frequency.value = preset.parameters.lfoRate;
        }

        console.log(`✅ Applied TB-303 preset: ${preset.name || 'Unknown'}`);
        return true;
    }

    playNote(note) {
        const now = this.context.currentTime;

        // Handle different input formats
        let freq; let accent; let
slide;
        if (typeof note === 'object') {
            // Object format: { note: 'C2', accent: true, slide: false }
            freq = this.noteToFreq(note.note);
            accent = note.accent || false;
            slide = note.slide || false;
        } else if (typeof note === 'string') {
            // String format: 'C2'
            freq = this.noteToFreq(note);
            accent = false;
            slide = false;
        } else {
            // Number format: frequency in Hz
            freq = note;
            accent = false;
            slide = false;
        }

        // Oscillator
        const osc = this.context.createOscillator();
        osc.type = this.params.waveform;
        osc.frequency.value = freq;

        // Apply LFO to pitch if target is 'pitch'
        if (this.params.lfoTarget === 'pitch' && this.params.lfoDepth > 0) {
            this.lfoGain.gain.value = freq * (this.params.lfoDepth / 100) * 0.1; // 10% max deviation
            this.lfoGain.connect(osc.frequency);
        }

        // Filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = this.params.resonance;

        // Envelope for filter
        const envAmount = this.params.envMod / 100;
        const cutoffBase = this.params.cutoff;
        const cutoffPeak = cutoffBase * (1 + envAmount * 3);

        filter.frequency.setValueAtTime(cutoffPeak, now);
        filter.frequency.exponentialRampToValueAtTime(cutoffBase, now + this.params.decay);

        // Apply LFO to filter if target is 'filter'
        if (this.params.lfoTarget === 'filter' && this.params.lfoDepth > 0) {
            this.lfoGain.gain.value = cutoffBase * (this.params.lfoDepth / 100) * 0.5; // 50% max deviation
            this.lfoGain.connect(filter.frequency);
        }

        // Amplitude envelope
        const env = this.context.createGain();
        const attackTime = 0.005;
        const baseLevel = 0.6;
        const accentAmount = accent ? (this.params.accentLevel / 100) * 0.4 : 0;
        const peakLevel = baseLevel + accentAmount;

        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(peakLevel, now + attackTime);
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.decay + 0.1);

        // Apply LFO to amplitude if target is 'amp'
        if (this.params.lfoTarget === 'amp' && this.params.lfoDepth > 0) {
            const lfoAmpGain = this.context.createGain();
            lfoAmpGain.gain.value = peakLevel * (this.params.lfoDepth / 100) * 0.3; // 30% max tremolo
            this.lfoGain.connect(lfoAmpGain.gain);
        }

        // Distortion (waveshaper)
        const distortion = this.context.createWaveShaper();
        const distAmount = this.params.distortion / 100;
        distortion.curve = this.makeDistortionCurve(distAmount * 100);

        // Connect chain
        osc.connect(filter);
        filter.connect(distortion);
        distortion.connect(env);
        env.connect(this.output);

        // Play
        osc.start(now);
        osc.stop(now + this.params.decay + 0.15);

        return osc;
    }

    makeDistortionCurve(amount) {
        const samples = 256;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }

        return curve;
    }

    noteToFreq(note) {
        const noteMap = {
            C2: 65.41,
'C#2': 69.30,
D2: 73.42,
'D#2': 77.78,
            E2: 82.41,
F2: 87.31,
'F#2': 92.50,
G2: 98.00,
            'G#2': 103.83,
A2: 110.00,
'A#2': 116.54,
B2: 123.47,
            C3: 130.81,
'C#3': 138.59,
D3: 146.83,
'D#3': 155.56,
            E3: 164.81,
F3: 174.61,
'F#3': 185.00,
G3: 196.00,
        };
        return noteMap[note] || 110;
    }
}

/**
 * TR-909 Drum Machine
 * Synthesized drum sounds using oscillators and noise
 */
class HAOSTR909 {
    constructor(audioContext, output) {
        this.context = audioContext;
        this.output = output;

        // Drum parameters
        this.params = {
            kickPitch: 60,
            kickDecay: 0.5,
            snareTone: 200,
            snareDecay: 0.2,
            hihatDecay: 0.05,
        };
    }

    playKick(velocity = 1.0, tune = 0) {
        const now = this.context.currentTime;

        // Sub-bass oscillator for deep punch
        const subOsc = this.context.createOscillator();
        const pitchMult = 2 ** (tune / 12); // Semitone tuning
        subOsc.frequency.setValueAtTime(50 * pitchMult, now);
        subOsc.frequency.exponentialRampToValueAtTime(30 * pitchMult, now + 0.15);

        // Main body oscillator with faster attack
        const osc = this.context.createOscillator();
        osc.frequency.setValueAtTime(180 * pitchMult, now);
        osc.frequency.exponentialRampToValueAtTime(45 * pitchMult, now + 0.08);

        // Enhanced click/punch oscillator
        const clickOsc = this.context.createOscillator();
        clickOsc.frequency.value = 1200 * pitchMult;

        // Sharp noise burst for attack
        const noise = this.context.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        // Saturation/distortion for punch
        const saturator = this.context.createWaveShaper();
        saturator.curve = this.createSaturationCurve(1.5); // Moderate saturation
        saturator.oversample = '2x';

        // Sub-bass envelope - longer sustain for deep punch
        const subEnv = this.context.createGain();
        subEnv.gain.setValueAtTime(1.2 * velocity, now);
        subEnv.gain.exponentialRampToValueAtTime(0.01, now + this.params.kickDecay * 1.2);

        // Main body envelope - aggressive attack
        const env = this.context.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(1.1 * velocity, now + 0.005); // Fast attack
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.kickDecay);

        // Enhanced click envelope
        const clickEnv = this.context.createGain();
        clickEnv.gain.setValueAtTime(0.8 * velocity, now);
        clickEnv.gain.exponentialRampToValueAtTime(0.01, now + 0.008);

        // Noise envelope for attack punch
        const noiseEnv = this.context.createGain();
        noiseEnv.gain.setValueAtTime(0.3 * velocity, now);
        noiseEnv.gain.exponentialRampToValueAtTime(0.01, now + 0.015);

        // High-pass filter for noise (crisp attack)
        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 800;

        // Connect signal chain
        subOsc.connect(subEnv);
        osc.connect(env);
        clickOsc.connect(clickEnv);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnv);

        // Route through saturation for punch
        subEnv.connect(saturator);
        env.connect(saturator);
        clickEnv.connect(this.output); // Click bypasses saturation
        noiseEnv.connect(this.output); // Noise bypasses saturation
        saturator.connect(this.output);

        // Play all components
        subOsc.start(now);
        osc.start(now);
        clickOsc.start(now);
        noise.start(now);

        subOsc.stop(now + this.params.kickDecay * 1.2 + 0.1);
        osc.stop(now + this.params.kickDecay + 0.1);
        clickOsc.stop(now + 0.02);
        noise.stop(now + 0.02);
    }

    playSnare(velocity = 1.0, tune = 0) {
        const now = this.context.currentTime;

        // Noise for snare body
        const noise = this.context.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        // Tone oscillators with tuning
        const pitchMult = 2 ** (tune / 12);
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        osc1.frequency.value = this.params.snareTone * pitchMult;
        osc2.frequency.value = this.params.snareTone * 1.6 * pitchMult;

        // Filter for noise
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;

        // Envelope with velocity
        const env = this.context.createGain();
        env.gain.setValueAtTime(0.8 * velocity, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.snareDecay);

        const toneEnv = this.context.createGain();
        toneEnv.gain.setValueAtTime(0.3 * velocity, now);
        toneEnv.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        // Connect
        noise.connect(filter);
        filter.connect(env);
        osc1.connect(toneEnv);
        osc2.connect(toneEnv);
        env.connect(this.output);
        toneEnv.connect(this.output);

        // Play
        noise.start(now);
        osc1.start(now);
        osc2.start(now);
        noise.stop(now + this.params.snareDecay);
        osc1.stop(now + 0.1);
        osc2.stop(now + 0.1);
    }

    playHatClosed(velocity = 1.0, tune = 0) {
        this.playHiHat(this.params.hihatDecay, velocity, tune);
    }

    playHatOpen(velocity = 1.0, tune = 0) {
        this.playHiHat(this.params.hihatDecay * 8, velocity, tune);
    }

    playHiHat(decay, velocity = 1.0, tune = 0) {
        const now = this.context.currentTime;

        // Multiple oscillators for metallic sound with tuning
        const pitchMult = 2 ** (tune / 12);
        const frequencies = [296, 371, 438, 589, 774].map(f => f * pitchMult);
        const oscs = frequencies.map(freq => {
            const osc = this.context.createOscillator();
            osc.frequency.value = freq;
            osc.type = 'square';
            return osc;
        });

        // Filter
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        // Envelope with velocity
        const env = this.context.createGain();
        env.gain.setValueAtTime(0.3 * velocity, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + decay);

        // Connect
        oscs.forEach(osc => osc.connect(filter));
        filter.connect(env);
        env.connect(this.output);

        // Play
        oscs.forEach(osc => {
            osc.start(now);
            osc.stop(now + decay + 0.01);
        });
    }

    playRimshot(velocity = 1.0, tune = 0) {
        const now = this.context.currentTime;

        const osc = this.context.createOscillator();
        const pitchMult = 2 ** (tune / 12);
        osc.frequency.value = 400 * pitchMult;

        const env = this.context.createGain();
        env.gain.setValueAtTime(0.5 * velocity, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(env);
        env.connect(this.output);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playClap(velocity = 1.0, tune = 0) {
        // Clap is multiple short bursts of noise
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const now = this.context.currentTime;
                const noise = this.context.createBufferSource();
                noise.buffer = this.createNoiseBuffer();

                const filter = this.context.createBiquadFilter();
                filter.type = 'bandpass';
                const pitchMult = 2 ** (tune / 12);
                filter.frequency.value = 1500 * pitchMult;

                const env = this.context.createGain();
                env.gain.setValueAtTime(0.6 * velocity, now);
                env.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

                noise.connect(filter);
                filter.connect(env);
                env.connect(this.output);

                noise.start(now);
                noise.stop(now + 0.04);
            }, i * 30);
        }
    }

    playTom(type = 'mid') {
        const now = this.context.currentTime;
        const pitchMap = { low: 80, mid: 120, high: 180 };

        const osc = this.context.createOscillator();
        osc.frequency.setValueAtTime(pitchMap[type], now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        const env = this.context.createGain();
        env.gain.setValueAtTime(0.8, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(env);
        env.connect(this.output);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playRide() {
        this.playHiHat(0.4);
    }

    playCrash() {
        const now = this.context.currentTime;

        const noise = this.context.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;

        const env = this.context.createGain();
        env.gain.setValueAtTime(0.8, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

        noise.connect(filter);
        filter.connect(env);
        env.connect(this.output);

        noise.start(now);
        noise.stop(now + 1.6);
    }

    createNoiseBuffer() {
        const bufferSize = this.context.sampleRate * 0.5;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    createSaturationCurve(amount = 1.0) {
        const samples = 1024;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < samples; i++) {
            const x = (i * 2 / samples) - 1;
            // Soft clipping with adjustable amount
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }

        return curve;
    }
}

/**
 * 16-Step Sequencer
 */
class HAOSSequencer {
    constructor(audioContext, drumMachine) {
        this.context = audioContext;
        this.drums = drumMachine;

        this.bpm = 135;
        this.isPlaying = false;
        this.currentStep = 0;
        this.intervalId = null;

        // Advanced sequencer features
        this.swing = 0; // 0-100 swing amount
        this.currentBank = 'A'; // A, B, C, D
        this.patternChain = []; // Array of pattern bank letters to chain
        this.chainPosition = 0;

        // Pattern banks (4 patterns: A, B, C, D)
        this.banks = {
            A: this.createEmptyPattern(),
            B: this.createEmptyPattern(),
            C: this.createEmptyPattern(),
            D: this.createEmptyPattern(),
        };

        // Legacy alias for current pattern
        Object.defineProperty(this, 'pattern', {
            get: () => this.banks[this.currentBank],
        });
    }

    createEmptyPattern() {
        return {
            kick: Array(16).fill(false).map(() => ({ active: false, velocity: 100, tune: 0 })),
            snare: Array(16).fill(false).map(() => ({ active: false, velocity: 100, tune: 0 })),
            hihat: Array(16).fill(false).map(() => ({ active: false, velocity: 100, tune: 0 })),
            clap: Array(16).fill(false).map(() => ({ active: false, velocity: 100, tune: 0 })),
        };
    }

    // Pattern bank management
    switchBank(bank) {
        if (['A', 'B', 'C', 'D'].includes(bank)) {
            this.currentBank = bank;
            console.log(`📁 Switched to pattern bank ${bank}`);
            return true;
        }
        return false;
    }

    copyBank(from, to) {
        if (['A', 'B', 'C', 'D'].includes(from) && ['A', 'B', 'C', 'D'].includes(to)) {
            this.banks[to] = JSON.parse(JSON.stringify(this.banks[from]));
            console.log(`📋 Copied pattern ${from} to ${to}`);
            return true;
        }
        return false;
    }

    // Pattern chaining
    setChain(chain) {
        // chain is array like ['A', 'B', 'A', 'C']
        if (Array.isArray(chain) && chain.every(b => ['A', 'B', 'C', 'D'].includes(b))) {
            this.patternChain = chain;
            this.chainPosition = 0;
            console.log(`⛓️ Pattern chain set: ${chain.join(' → ')}`);
            return true;
        }
        return false;
    }

    clearChain() {
        this.patternChain = [];
        this.chainPosition = 0;
    }

    advanceChain() {
        if (this.patternChain.length > 0) {
            this.chainPosition = (this.chainPosition + 1) % this.patternChain.length;
            this.currentBank = this.patternChain[this.chainPosition];
            console.log(`⛓️ Chain advanced to ${this.currentBank} (${this.chainPosition + 1}/${this.patternChain.length})`);
        }
    }

    // Swing/shuffle timing
    setSwing(amount) {
        this.swing = Math.max(0, Math.min(100, amount));
        console.log(`🎵 Swing set to ${this.swing}%`);
    }

    getSwingDelay(step) {
        // Apply swing to off-beats (odd steps)
        if (step % 2 === 1) {
            return (this.swing / 100) * ((60 / this.bpm) * 250 * 0.3); // Up to 30% delay
        }
        return 0;
    }

    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;

        const stepTime = (60 / this.bpm) * 250; // 16th notes in ms

        this.intervalId = setInterval(() => {
            // Apply swing delay
            const swingDelay = this.getSwingDelay(this.currentStep);

            setTimeout(() => {
                this.playStep(this.currentStep);
            }, swingDelay);

            this.currentStep++;

            // Handle pattern chaining
            if (this.currentStep >= 16) {
                this.currentStep = 0;
                if (this.patternChain.length > 0) {
                    this.advanceChain();
                }
            }
        }, stepTime);

        console.log(`▶️ Sequencer started at ${this.bpm} BPM`);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isPlaying = false;
        this.currentStep = 0;
        console.log('⏹️ Sequencer stopped');
    }

    playStep(step) {
        const pattern = this.banks[this.currentBank];

        // Play with velocity and tuning
        if (pattern.kick[step] && (pattern.kick[step].active || pattern.kick[step] === true)) {
            const vel = pattern.kick[step].velocity || 100;
            const tune = pattern.kick[step].tune || 0;
            this.drums.playKick(vel / 100, tune);
        }
        if (pattern.snare[step] && (pattern.snare[step].active || pattern.snare[step] === true)) {
            const vel = pattern.snare[step].velocity || 100;
            const tune = pattern.snare[step].tune || 0;
            this.drums.playSnare(vel / 100, tune);
        }
        if (pattern.hihat[step] && (pattern.hihat[step].active || pattern.hihat[step] === true)) {
            const vel = pattern.hihat[step].velocity || 100;
            const tune = pattern.hihat[step].tune || 0;
            this.drums.playHatClosed(vel / 100, tune);
        }
        if (pattern.clap[step] && (pattern.clap[step].active || pattern.clap[step] === true)) {
            const vel = pattern.clap[step].velocity || 100;
            const tune = pattern.clap[step].tune || 0;
            this.drums.playClap(vel / 100, tune);
        }
    }

    toggleStep(track, step, velocity = 100, tune = 0) {
        const pattern = this.banks[this.currentBank];

        // Support both old boolean format and new object format
        if (typeof pattern[track][step] === 'boolean') {
            pattern[track][step] = !pattern[track][step];
        } else if (pattern[track][step].active !== undefined) {
            pattern[track][step].active = !pattern[track][step].active;
        } else {
            // Convert old format to new
            pattern[track][step] = { active: true, velocity, tune };
        }

        return pattern[track][step];
    }

    setStepVelocity(track, step, velocity) {
        const pattern = this.banks[this.currentBank];
        if (pattern[track][step]) {
            if (typeof pattern[track][step] === 'object') {
                pattern[track][step].velocity = velocity;
            }
        }
    }

    setStepTune(track, step, tune) {
        const pattern = this.banks[this.currentBank];
        if (pattern[track][step]) {
            if (typeof pattern[track][step] === 'object') {
                pattern[track][step].tune = tune;
            }
        }
    }

    loadPattern(patternData) {
        Object.assign(this.banks[this.currentBank], patternData);
    }

    setBPM(bpm) {
        this.bpm = parseInt(bpm);
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }

    clearPattern() {
        this.pattern.kick.fill(false);
        this.pattern.snare.fill(false);
        this.pattern.hihat.fill(false);
        this.pattern.clap.fill(false);
    }

    randomizePattern() {
        // Kick on 1, 5, 9, 13 + random
        this.pattern.kick = Array(16).fill(false).map((_, i) =>
            i % 4 === 0 || Math.random() > 0.7,
        );

        // Snare on 4, 12 + random
        this.pattern.snare = Array(16).fill(false).map((_, i) =>
            (i === 4 || i === 12) || Math.random() > 0.8,
        );

        // Hi-hats every other step + random
        this.pattern.hihat = Array(16).fill(false).map((_, i) =>
            i % 2 === 0 || Math.random() > 0.6,
        );

        // Clap sparse
        this.pattern.clap = Array(16).fill(false).map(() => Math.random() > 0.9);
    }

    getPattern() {
        return JSON.parse(JSON.stringify(this.pattern));
    }
}

/**
 * Pattern Management System
 * Handles save/load/share functionality
 */
class HAOSPatternManager {
    constructor() {
        this.storageKey = 'haos_patterns';
    }

    savePattern(name, pattern, tb303Params = {}) {
        const patterns = this.loadAllPatterns();
        patterns[name] = {
            pattern,
            tb303: tb303Params,
            timestamp: Date.now(),
            version: '1.0',
        };
        localStorage.setItem(this.storageKey, JSON.stringify(patterns));
        console.log(`💾 Pattern "${name}" saved`);
    }

    loadPattern(name) {
        const patterns = this.loadAllPatterns();
        return patterns[name] || null;
    }

    loadAllPatterns() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    deletePattern(name) {
        const patterns = this.loadAllPatterns();
        delete patterns[name];
        localStorage.setItem(this.storageKey, JSON.stringify(patterns));
    }

    exportPattern(pattern, tb303Params) {
        return {
            pattern,
            tb303: tb303Params,
            app: 'HAOS.fm',
            version: '1.0',
            timestamp: Date.now(),
        };
    }

    importPattern(data) {
        if (!data.pattern || !data.version) {
            throw new Error('Invalid pattern data');
        }
        return data;
    }

    patternToURL(pattern, tb303Params) {
        const data = this.exportPattern(pattern, tb303Params);
        const encoded = btoa(JSON.stringify(data));
        return `${window.location.origin}${window.location.pathname}?pattern=${encoded}`;
    }

    patternFromURL() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('pattern');
        if (encoded) {
            try {
                const data = JSON.parse(atob(encoded));
                return this.importPattern(data);
            } catch (e) {
                console.error('Failed to load pattern from URL:', e);
            }
        }
        return null;
    }

    // ===== MIDI EXPORT =====

    /**
     * Export pattern as MIDI file
     * @param {Object} pattern - Sequencer pattern {kick: [], snare: [], hihat: [], clap: []}
     * @param {Object} tb303Params - TB-303 parameters for bassline
     * @param {number} bpm - Tempo in beats per minute
     * @returns {Blob} - MIDI file blob
     */
    exportMIDI(pattern, tb303Params = {}, bpm = 120) {
        // MIDI file structure: Header + Track chunks
        const tracks = [];

        // Track 1: Tempo and metadata
        const tempoTrack = this.createTempoTrack(bpm);
        tracks.push(tempoTrack);

        // Track 2: TB-303 Bassline (MIDI channel 1)
        const bassTrack = this.createTB303MIDITrack(tb303Params, bpm);
        tracks.push(bassTrack);

        // Track 3: TR-909 Drums (MIDI channel 10 - standard drum channel)
        const drumTrack = this.createDrumMIDITrack(pattern, bpm);
        tracks.push(drumTrack);

        // Assemble MIDI file
        const midiFile = this.assembleMIDIFile(tracks);

        return new Blob([midiFile], { type: 'audio/midi' });
    }

    createTempoTrack(bpm) {
        const events = [];

        // Tempo meta event (FF 51 03 tttttt)
        const microsecondsPerBeat = Math.floor(60000000 / bpm);
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x51, // Set Tempo
            data: [
                (microsecondsPerBeat >> 16) & 0xFF,
                (microsecondsPerBeat >> 8) & 0xFF,
                microsecondsPerBeat & 0xFF,
            ],
        });

        // Track name
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x03,
            data: this.stringToBytes('HAOS.fm Pattern'),
        });

        // End of track
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x2F,
            data: [],
        });

        return this.encodeTrack(events);
    }

    createTB303MIDITrack(tb303Params, bpm) {
        const events = [];

        // Track name
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x03,
            data: this.stringToBytes('TB-303 Bass'),
        });

        // Program change to synth bass
        events.push({
            deltaTime: 0,
            type: 'program',
            channel: 0,
            program: 38, // Synth Bass 1
        });

        // Generate simple bassline pattern (can be enhanced with actual notes)
        const bassPattern = this.generateTB303Pattern(tb303Params);
        const ticksPerStep = this.calculateTicksPerStep(bpm);

        bassPattern.forEach((note, step) => {
            if (note.active) {
                // Note On
                events.push({
                    deltaTime: step === 0 ? 0 : ticksPerStep,
                    type: 'noteOn',
                    channel: 0,
                    note: note.pitch,
                    velocity: note.velocity || 100,
                });

                // Note Off
                events.push({
                    deltaTime: ticksPerStep - 1,
                    type: 'noteOff',
                    channel: 0,
                    note: note.pitch,
                    velocity: 0,
                });
            }
        });

        // End of track
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x2F,
            data: [],
        });

        return this.encodeTrack(events);
    }

    createDrumMIDITrack(pattern, bpm) {
        const events = [];

        // Track name
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x03,
            data: this.stringToBytes('TR-909 Drums'),
        });

        // GM Drum map (MIDI channel 10)
        const drumMap = {
            kick: 36,   // Bass Drum 1
            snare: 38,  // Acoustic Snare
            hihat: 42,  // Closed Hi-Hat
            clap: 39,    // Hand Clap
        };

        const ticksPerStep = this.calculateTicksPerStep(bpm);
        const currentTick = 0;

        // Process 16 steps
        for (let step = 0; step < 16; step++) {
            let hasEventsAtStep = false;

            // Check each drum track
            Object.keys(drumMap).forEach(drum => {
                if (pattern[drum] && pattern[drum][step]) {
                    // Note On
                    events.push({
                        deltaTime: hasEventsAtStep ? 0 : (step === 0 ? 0 : ticksPerStep),
                        type: 'noteOn',
                        channel: 9, // Channel 10 (0-indexed = 9)
                        note: drumMap[drum],
                        velocity: 100,
                    });

                    // Note Off (short duration for drums)
                    events.push({
                        deltaTime: 10,
                        type: 'noteOff',
                        channel: 9,
                        note: drumMap[drum],
                        velocity: 0,
                    });

                    hasEventsAtStep = true;
                }
            });
        }

        // End of track
        events.push({
            deltaTime: 0,
            type: 'meta',
            metaType: 0x2F,
            data: [],
        });

        return this.encodeTrack(events);
    }

    generateTB303Pattern(tb303Params) {
        // Simple 16-step bassline (can be enhanced with actual melody)
        const baseNote = 36; // C2
        const pattern = [];

        for (let i = 0; i < 16; i++) {
            pattern.push({
                active: i % 4 === 0, // Play on beats 1, 5, 9, 13
                pitch: baseNote,
                velocity: 100,
            });
        }

        return pattern;
    }

    calculateTicksPerStep(bpm) {
        // Standard MIDI: 480 ticks per quarter note
        // 16 steps = 1 bar (4 beats)
        // Each step = 1/16 note = 1/4 beat
        return 120; // 480 / 4 = 120 ticks per 16th note
    }

    encodeTrack(events) {
        const trackData = [];

        events.forEach(event => {
            // Delta time (variable length)
            trackData.push(...this.encodeVariableLength(event.deltaTime));

            // Event data
            if (event.type === 'meta') {
                trackData.push(0xFF, event.metaType, event.data.length, ...event.data);
            } else if (event.type === 'noteOn') {
                trackData.push(0x90 | event.channel, event.note, event.velocity);
            } else if (event.type === 'noteOff') {
                trackData.push(0x80 | event.channel, event.note, event.velocity);
            } else if (event.type === 'program') {
                trackData.push(0xC0 | event.channel, event.program);
            }
        });

        return new Uint8Array(trackData);
    }

    assembleMIDIFile(tracks) {
        const chunks = [];

        // MIDI Header Chunk
        const header = new Uint8Array([
            0x4D, 0x54, 0x68, 0x64, // 'MThd'
            0x00, 0x00, 0x00, 0x06, // Chunk length = 6
            0x00, 0x01,             // Format 1 (multiple tracks)
            0x00, tracks.length,    // Number of tracks
            0x01, 0xE0,              // Ticks per quarter note = 480
        ]);
        chunks.push(header);

        // Track Chunks
        tracks.forEach(trackData => {
            const trackHeader = new Uint8Array([
                0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
                (trackData.length >> 24) & 0xFF,
                (trackData.length >> 16) & 0xFF,
                (trackData.length >> 8) & 0xFF,
                trackData.length & 0xFF,
            ]);
            chunks.push(trackHeader);
            chunks.push(trackData);
        });

        // Concatenate all chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const midiFile = new Uint8Array(totalLength);
        let offset = 0;

        chunks.forEach(chunk => {
            midiFile.set(chunk, offset);
            offset += chunk.length;
        });

        return midiFile;
    }

    encodeVariableLength(value) {
        const bytes = [];
        bytes.push(value & 0x7F);

        value >>= 7;
        while (value > 0) {
            bytes.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }

        return bytes;
    }

    stringToBytes(str) {
        return Array.from(str).map(c => c.charCodeAt(0));
    }

    /**
     * Download MIDI file
     * @param {Object} pattern - Sequencer pattern
     * @param {Object} tb303Params - TB-303 parameters
     * @param {number} bpm - Tempo
     * @param {string} filename - Output filename
     */
    downloadMIDI(pattern, tb303Params, bpm, filename = 'haos-pattern.mid') {
        const midiBlob = this.exportMIDI(pattern, tb303Params, bpm);
        const url = URL.createObjectURL(midiBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`🎹 MIDI file exported: ${filename}`);
    }

    // ===== AUDIO RECORDING =====

    /**
     * Start recording audio output
     * @returns {Promise} - Resolves when recording starts
     */
    startRecording() {
        if (this.recording) {
            console.warn('⚠️ Recording already in progress');
            return Promise.reject(new Error('Recording already in progress'));
        }

        // Create media stream destination
        this.recordingDestination = this.context.createMediaStreamDestination();

        // Connect master output to recording destination
        this.masterGain.connect(this.recordingDestination);

        // Setup MediaRecorder
        const options = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000,
        };

        // Fallback for Safari
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'audio/mp4';
        }

        try {
            this.mediaRecorder = new MediaRecorder(this.recordingDestination.stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: this.mediaRecorder.mimeType,
                });
                this.recordedBlob = blob;
                console.log(`🎙️ Recording stopped. Size: ${(blob.size / 1024).toFixed(2)} KB`);
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.recording = true;
            this.recordingStartTime = Date.now();

            console.log(`🎙️ Recording started (${options.mimeType})`);
            return Promise.resolve();

        } catch (error) {
            console.error('❌ Recording failed:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Stop recording and return the audio blob
     * @returns {Promise<Blob>} - Recorded audio blob
     */
    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.recording || !this.mediaRecorder) {
                reject(new Error('No recording in progress'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: this.mediaRecorder.mimeType,
                });

                this.recordedBlob = blob;
                this.recording = false;

                // Disconnect recording destination
                if (this.recordingDestination) {
                    this.masterGain.disconnect(this.recordingDestination);
                }

                const duration = (Date.now() - this.recordingStartTime) / 1000;
                console.log(`🎙️ Recording stopped. Duration: ${duration.toFixed(2)}s, Size: ${(blob.size / 1024).toFixed(2)} KB`);

                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Download recorded audio
     * @param {string} filename - Output filename
     * @param {string} format - 'webm' or 'wav' (webm by default)
     */
    async downloadRecording(filename = 'haos-recording.webm', format = 'webm') {
        if (!this.recordedBlob) {
            console.error('❌ No recording available');
            return;
        }

        const blob = this.recordedBlob;

        // If WAV conversion requested (future enhancement)
        if (format === 'wav') {
            console.log('⚠️ WAV conversion not yet implemented, downloading as WebM');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`💾 Audio downloaded: ${filename}`);
    }

    /**
     * Get recording status
     * @returns {Object} - {recording: boolean, duration: number, size: number}
     */
    getRecordingStatus() {
        return {
            recording: this.recording || false,
            duration: this.recording ? (Date.now() - this.recordingStartTime) / 1000 : 0,
            size: this.recordedChunks ? this.recordedChunks.reduce((sum, chunk) => sum + chunk.size, 0) : 0,
            hasRecording: !!this.recordedBlob,
        };
    }

    /**
     * Clear recorded audio
     */
    clearRecording() {
        this.recordedBlob = null;
        this.recordedChunks = [];
        console.log('🗑️ Recording cleared');
    }
}

/**
 * TB-303 Preset Bank
 * Classic acid bass presets
 */
class HAOSTB303Presets {
    constructor() {
        this.presets = {
            'Classic Acid': {
                cutoff: 800,
                resonance: 18,
                envMod: 70,
                decay: 0.3,
                waveform: 'sawtooth',
                distortion: 20,
                accentLevel: 50,
            },
            'Deep Bass': {
                cutoff: 400,
                resonance: 8,
                envMod: 40,
                decay: 0.6,
                waveform: 'sawtooth',
                distortion: 10,
                accentLevel: 30,
            },
            Squelchy: {
                cutoff: 1200,
                resonance: 25,
                envMod: 90,
                decay: 0.2,
                waveform: 'sawtooth',
                distortion: 35,
                accentLevel: 70,
            },
            'Hard Attack': {
                cutoff: 1500,
                resonance: 20,
                envMod: 60,
                decay: 0.15,
                waveform: 'square',
                distortion: 45,
                accentLevel: 80,
            },
            Minimal: {
                cutoff: 600,
                resonance: 5,
                envMod: 30,
                decay: 0.4,
                waveform: 'sawtooth',
                distortion: 5,
                accentLevel: 20,
            },
            Detroit: {
                cutoff: 900,
                resonance: 15,
                envMod: 75,
                decay: 0.35,
                waveform: 'sawtooth',
                distortion: 25,
                accentLevel: 60,
            },
            Aggressive: {
                cutoff: 2000,
                resonance: 22,
                envMod: 85,
                decay: 0.18,
                waveform: 'square',
                distortion: 60,
                accentLevel: 90,
            },
            'Warm Sub': {
                cutoff: 350,
                resonance: 3,
                envMod: 20,
                decay: 0.8,
                waveform: 'sawtooth',
                distortion: 0,
                accentLevel: 15,
            },
            'Techno Stab': {
                cutoff: 1800,
                resonance: 28,
                envMod: 95,
                decay: 0.12,
                waveform: 'square',
                distortion: 50,
                accentLevel: 100,
            },
            Bubbles: {
                cutoff: 1400,
                resonance: 30,
                envMod: 100,
                decay: 0.25,
                waveform: 'sawtooth',
                distortion: 15,
                accentLevel: 40,
            },
        };
    }

    getPreset(name) {
        return this.presets[name] ? { ...this.presets[name] } : null;
    }

    getAllPresets() {
        return Object.keys(this.presets);
    }

    applyPreset(tb303Instance, presetName) {
        const preset = this.getPreset(presetName);
        if (preset && tb303Instance) {
            Object.assign(tb303Instance.params, preset);
            console.log(`🎛️ Applied preset: ${presetName}`);
            return preset;
        }
        return null;
    }
}

// Export all classes as globals for easy access
window.HAOSAudioEngine = HAOSAudioEngine;
window.HAOSPatternManager = HAOSPatternManager;
window.HAOSTB303Presets = HAOSTB303Presets;
