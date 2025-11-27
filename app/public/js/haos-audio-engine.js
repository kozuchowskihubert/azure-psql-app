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
        
        this.initialized = true;
        
        console.log('✅ HAOS Audio Engine initialized');
        console.log(`   Sample Rate: ${this.audioContext.sampleRate} Hz`);
        console.log(`   State: ${this.audioContext.state}`);
        
        return true;
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
            waveform: 'sawtooth'
        };
    }
    
    setParam(param, value) {
        this.params[param] = parseFloat(value);
        console.log(`TB-303 ${param}:`, this.params[param]);
    }
    
    playNote(note) {
        const now = this.context.currentTime;
        const freq = typeof note === 'string' ? this.noteToFreq(note.note || note) : note;
        const accent = note.accent || false;
        const slide = note.slide || false;
        
        // Oscillator
        const osc = this.context.createOscillator();
        osc.type = this.params.waveform;
        osc.frequency.value = freq;
        
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
        
        // Amplitude envelope
        const env = this.context.createGain();
        const attackTime = 0.005;
        const baseLevel = 0.6;
        const accentAmount = accent ? (this.params.accentLevel / 100) * 0.4 : 0;
        const peakLevel = baseLevel + accentAmount;
        
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(peakLevel, now + attackTime);
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.decay + 0.1);
        
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
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
            'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
            'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
            'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00
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
            hihatDecay: 0.05
        };
    }
    
    playKick() {
        const now = this.context.currentTime;
        
        // Oscillator for body
        const osc = this.context.createOscillator();
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        // Click oscillator
        const clickOsc = this.context.createOscillator();
        clickOsc.frequency.value = 1000;
        
        // Envelopes
        const env = this.context.createGain();
        env.gain.setValueAtTime(1, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.kickDecay);
        
        const clickEnv = this.context.createGain();
        clickEnv.gain.setValueAtTime(0.5, now);
        clickEnv.gain.exponentialRampToValueAtTime(0.01, now + 0.01);
        
        // Connect
        osc.connect(env);
        clickOsc.connect(clickEnv);
        env.connect(this.output);
        clickEnv.connect(this.output);
        
        // Play
        osc.start(now);
        clickOsc.start(now);
        osc.stop(now + this.params.kickDecay + 0.1);
        clickOsc.stop(now + 0.02);
    }
    
    playSnare() {
        const now = this.context.currentTime;
        
        // Noise for snare body
        const noise = this.context.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        
        // Tone oscillators
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        osc1.frequency.value = this.params.snareTone;
        osc2.frequency.value = this.params.snareTone * 1.6;
        
        // Filter for noise
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        // Envelope
        const env = this.context.createGain();
        env.gain.setValueAtTime(0.8, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + this.params.snareDecay);
        
        const toneEnv = this.context.createGain();
        toneEnv.gain.setValueAtTime(0.3, now);
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
    
    playHatClosed() {
        this.playHiHat(this.params.hihatDecay);
    }
    
    playHatOpen() {
        this.playHiHat(this.params.hihatDecay * 8);
    }
    
    playHiHat(decay) {
        const now = this.context.currentTime;
        
        // Multiple oscillators for metallic sound
        const frequencies = [296, 371, 438, 589, 774];
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
        
        // Envelope
        const env = this.context.createGain();
        env.gain.setValueAtTime(0.3, now);
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
    
    playRimshot() {
        const now = this.context.currentTime;
        
        const osc = this.context.createOscillator();
        osc.frequency.value = 400;
        
        const env = this.context.createGain();
        env.gain.setValueAtTime(0.5, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.connect(env);
        env.connect(this.output);
        
        osc.start(now);
        osc.stop(now + 0.06);
    }
    
    playClap() {
        // Clap is multiple short bursts of noise
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const now = this.context.currentTime;
                const noise = this.context.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                
                const filter = this.context.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1500;
                
                const env = this.context.createGain();
                env.gain.setValueAtTime(0.6, now);
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
        
        // Pattern storage
        this.pattern = {
            kick: Array(16).fill(false),
            snare: Array(16).fill(false),
            hihat: Array(16).fill(false),
            clap: Array(16).fill(false)
        };
    }
    
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        
        const stepTime = (60 / this.bpm) * 250; // 16th notes in ms
        
        this.intervalId = setInterval(() => {
            this.playStep(this.currentStep);
            this.currentStep = (this.currentStep + 1) % 16;
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
        if (this.pattern.kick[step]) this.drums.playKick();
        if (this.pattern.snare[step]) this.drums.playSnare();
        if (this.pattern.hihat[step]) this.drums.playHatClosed();
        if (this.pattern.clap[step]) this.drums.playClap();
    }
    
    toggleStep(track, step) {
        this.pattern[track][step] = !this.pattern[track][step];
        return this.pattern[track][step];
    }
    
    loadPattern(patternData) {
        Object.assign(this.pattern, patternData);
    }
    
    setBPM(bpm) {
        this.bpm = parseInt(bpm);
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }
}

// Export as global for easy access
window.HAOSAudioEngine = HAOSAudioEngine;
