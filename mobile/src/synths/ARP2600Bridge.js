import webAudioBridge from '../services/WebAudioBridge';
import * as Haptics from 'expo-haptics';

class ARP2600Bridge {
  constructor() {
    this.isInitialized = false;
    
    // ARP 2600 enhanced parameters with waveform-specific routing
    this.params = {
      osc1Level: 0.5,           // Oscillator 1 level (0-1)
      osc2Level: 0.3,           // Oscillator 2 level (0-1)
      osc3Level: 0.0,           // Oscillator 3 level (0-1) - off by default
      detune: 0.005,            // Oscillator 2 detune (0-1, 0.005 = 0.5%)
      osc3Detune: -12,          // Oscillator 3 pitch in semitones (-24 to +24)
      filterCutoff: 2000,        // Filter cutoff Hz (0-10000)
      filterResonance: 18,      // Filter Q (0-30)
      envelope: {
        attack: 0.05,           // Attack time in seconds
        decay: 0.1,             // Decay time in seconds
        sustain: 0.7,           // Sustain level (0-1)
        release: 0.3,           // Release time in seconds
      },
      // Enhanced Patch Bay Routing (Waveform-Specific)
      routing: {
        // VCO1 Waveform Routing
        'vco1-saw': { to: [], level: 0.5 },          // VCO1 Sawtooth
        'vco1-pulse': { to: [], level: 0.4 },        // VCO1 Pulse
        // VCO2 Waveform Routing
        'vco2-saw': { to: [], level: 0.3 },          // VCO2 Sawtooth
        'vco2-tri': { to: [], level: 0.3 },          // VCO2 Triangle
        // VCO3 (LFO as audio) - can be low frequency or audio rate
        'vco3-sine': { to: [], level: 0.2 },         // VCO3 Sine
        'vco3-tri': { to: [], level: 0.2 },          // VCO3 Triangle
        'vco3-saw': { to: [], level: 0.2 },          // VCO3 Saw
        // Modulation Sources
        adsr: { to: ['vca'], level: 1.0 },           // ADSR default to VCA
        lfo: { to: [], level: 0.5 },                 // LFO modulation
        // Noise Sources
        'noise-white': { to: [], level: 0.3 },       // White noise
        'noise-pink': { to: [], level: 0.3 },        // Pink noise
        // Legacy routing flags (for compatibility)
        vco1ToFilter: true,
        vco2ToFilter: true,
        vco3ToFilter: false,
        noiseToFilter: false,
        lfoToFM1: false,
        lfoToFM2: false,
        adsrToVCA: true,
        ringModActive: false,
      },
      // Modulation amounts
      modulation: {
        lfoRate: 5.0,           // LFO rate in Hz (0.1-20)
        lfoDepth: 0.5,          // LFO modulation depth (0-1)
        noiseLevel: 0.3,        // Noise generator level (0-1)
      }
    };
  }

  async init() {
    console.log('ARP2600Bridge: Initializing modular synth...');
    
    try {
      // WebAudioBridge will be initialized by the screen's WebView
      this.isInitialized = true;
      console.log('ARP2600Bridge: Initialized - dual oscillator modular synth ready (WebAudio)');
      return true;
    } catch (error) {
      console.error('ARP2600Bridge: Initialization failed:', error);
      throw error;
    }
  }

  updateBridgeParams() {
    // Log parameters for debugging
    console.log('ARP2600 params:', JSON.stringify(this.params, null, 2));
  }

  noteToFrequency(note) {
    // If note is already a number (MIDI note), convert directly to frequency
    if (typeof note === 'number') {
      return 440 * Math.pow(2, (note - 69) / 12);
    }
    
    // If note is a string, parse it
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    
    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return 440; // Default to A4
    
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const semitone = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + semitone;
    
    // A4 (440 Hz) is MIDI note 69
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  playNote(note, options = {}) {
    if (!this.isInitialized) {
      console.warn('ARP2600Bridge: Not initialized');
      return;
    }

    const {
      velocity = 1.0,
      accent = false,
      duration = 0.3,
    } = options;

    const frequency = this.noteToFrequency(note);
    
    // Ensure envelope values are valid numbers
    const envelope = {
      attack: Number(this.params.envelope.attack) || 0.05,
      decay: Number(this.params.envelope.decay) || 0.1,
      sustain: Number(this.params.envelope.sustain) || 0.7,
      release: Number(this.params.envelope.release) || 0.3,
    };
    
    console.log(`🎹 ARP 2600: ${note} (${frequency.toFixed(2)}Hz) velocity=${velocity}, accent=${accent}`, 
      `envelope: A=${envelope.attack}s D=${envelope.decay}s S=${envelope.sustain} R=${envelope.release}s`);

    // Play using WebAudioBridge with ALL current parameters INCLUDING LFO
    if (webAudioBridge.isReady) {
      webAudioBridge.playARP2600(
        frequency,
        duration,
        velocity,
        this.params.detune,
        {
          osc1Level: this.params.osc1Level,
          osc2Level: this.params.osc2Level,
          osc3Level: this.params.osc3Level,
          osc3Detune: this.params.osc3Detune,
          filterCutoff: this.params.filterCutoff,
          filterResonance: this.params.filterResonance,
          attack: envelope.attack,
          decay: envelope.decay,
          sustain: envelope.sustain,
          release: envelope.release,
          // ✨ NEW: LFO modulation parameters
          lfoRate: this.params.modulation.lfoRate,
          lfoDepth: this.params.modulation.lfoDepth,
          lfoToPitch: this.params.routing.lfo.to.includes('fm1') || this.params.routing.lfo.to.includes('fm2'),
          lfoToFilter: this.params.routing.lfo.to.includes('vcf-cv'),
          lfoToAmp: this.params.routing.lfo.to.includes('vca-cv'),
        }
      );
    } else {
      console.warn('⚠️ WebAudioBridge not ready, using haptics fallback');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Oscillator level controls
  setOsc1Level(level) {
    this.params.osc1Level = Math.max(0, Math.min(level, 1.0));
    console.log('ARP2600: Osc1 Level =', this.params.osc1Level);
  }

  setOsc2Level(level) {
    this.params.osc2Level = Math.max(0, Math.min(level, 1.0));
    console.log('ARP2600: Osc2 Level =', this.params.osc2Level);
  }

  setOsc3Level(level) {
    this.params.osc3Level = Math.max(0, Math.min(level, 1.0));
    console.log('ARP2600: Osc3 Level =', this.params.osc3Level);
  }

  setDetune(detune) {
    this.params.detune = Math.max(0, Math.min(detune, 0.02)); // 0-2% detune
    console.log('ARP2600: Detune =', (this.params.detune * 100).toFixed(2) + '%');
  }

  setOsc3Detune(semitones) {
    this.params.osc3Detune = Math.max(-24, Math.min(semitones, 24)); // -24 to +24 semitones
    console.log('ARP2600: VCO3 Pitch =', this.params.osc3Detune.toFixed(1), 'semitones');
  }

  // Filter controls
  setFilterCutoff(cutoff) {
    this.params.filterCutoff = Math.max(100, Math.min(cutoff, 10000));
    console.log('ARP2600: Filter Cutoff =', this.params.filterCutoff, 'Hz');
  }

  setFilterResonance(res) {
    this.params.filterResonance = Math.max(0, Math.min(res, 30));
    console.log('ARP2600: Filter Resonance =', this.params.filterResonance);
  }

  // ADSR envelope controls
  setAttack(attack) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    console.log('ARP2600: Attack =', (this.params.envelope.attack * 1000).toFixed(0), 'ms');
  }

  setDecay(decay) {
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    console.log('ARP2600: Decay =', (this.params.envelope.decay * 1000).toFixed(0), 'ms');
  }

  setSustain(sustain) {
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    console.log('ARP2600: Sustain =', this.params.envelope.sustain.toFixed(2));
  }

  setRelease(release) {
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('ARP2600: Release =', (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Unified envelope control
  setEnvelope(attack, decay, sustain, release) {
    this.params.envelope.attack = Math.max(0.001, Math.min(attack, 2.0));
    this.params.envelope.decay = Math.max(0.01, Math.min(decay, 2.0));
    this.params.envelope.sustain = Math.max(0, Math.min(sustain, 1.0));
    this.params.envelope.release = Math.max(0.01, Math.min(release, 5.0));
    console.log('ARP2600: Envelope ADSR =', 
                (this.params.envelope.attack * 1000).toFixed(0), 'ms /',
                (this.params.envelope.decay * 1000).toFixed(0), 'ms /',
                this.params.envelope.sustain.toFixed(2), '/',
                (this.params.envelope.release * 1000).toFixed(0), 'ms');
  }

  // Convenience methods for StudioScreen
  setCutoff(value) {
    this.setFilterCutoff(value);
  }

  setResonance(value) {
    this.setFilterResonance(value);
  }
  
  // Enhanced Patch Bay Routing with Waveform-Specific Logic
  updatePatchRouting(patches) {
    // Reset all waveform-specific routing
    this.params.routing['vco1-saw'].to = [];
    this.params.routing['vco1-pulse'].to = [];
    this.params.routing['vco2-saw'].to = [];
    this.params.routing['vco2-tri'].to = [];
    this.params.routing['vco3-sine'].to = [];
    this.params.routing.adsr.to = [];
    this.params.routing.lfo.to = [];
    this.params.routing['noise-white'].to = [];
    this.params.routing['noise-pink'].to = [];
    
    // Reset legacy flags
    this.params.routing.vco1ToFilter = false;
    this.params.routing.vco2ToFilter = false;
    this.params.routing.vco3ToFilter = false;
    this.params.routing.noiseToFilter = false;
    this.params.routing.lfoToFM1 = false;
    this.params.routing.lfoToFM2 = false;
    this.params.routing.adsrToVCA = false;
    this.params.routing.ringModActive = false;
    
    // Apply patches with waveform-specific routing
    patches.forEach(patch => {
      const routeKey = `${patch.from}-${patch.to}`;
      const source = this.params.routing[patch.from];
      
      if (source) {
        // Add destination to source's routing array
        if (!source.to.includes(patch.to)) {
          source.to.push(patch.to);
        }
      }
      
      // Also set legacy flags for backward compatibility
      switch (routeKey) {
        case 'vco1-saw-vcf':
        case 'vco1-pulse-vcf':
          this.params.routing.vco1ToFilter = true;
          console.log('📐 ARP2600: VCO1', patch.from.includes('saw') ? 'SAW' : 'PULSE', '→ Filter');
          break;
        case 'vco2-saw-vcf':
        case 'vco2-tri-vcf':
          this.params.routing.vco2ToFilter = true;
          console.log('📐 ARP2600: VCO2', patch.from.includes('saw') ? 'SAW' : 'TRI', '→ Filter');
          break;
        case 'vco3-sine-vcf':
          this.params.routing.vco3ToFilter = true;
          console.log('〰️ ARP2600: VCO3 SINE → Filter');
          break;
        case 'noise-white-vcf':
          this.params.routing.noiseToFilter = true;
          console.log('❄️ ARP2600: WHITE NOISE → Filter');
          break;
        case 'noise-pink-vcf':
          this.params.routing.noiseToFilter = true;
          console.log('🌸 ARP2600: PINK NOISE → Filter');
          break;
        case 'lfo-fm1':
          this.params.routing.lfoToFM1 = true;
          this.params.routing.lfo.to.push('fm1');
          console.log('🌀 ARP2600: LFO → VCO1 FM');
          break;
        case 'lfo-fm2':
          this.params.routing.lfoToFM2 = true;
          this.params.routing.lfo.to.push('fm2');
          console.log('🌀 ARP2600: LFO → VCO2 FM');
          break;
        case 'lfo-vcf-cv':
          this.params.routing.lfo.to.push('vcf-cv');
          console.log('🌀 ARP2600: LFO → VCF CV (filter sweep)');
          break;
        case 'lfo-vca-cv':
          this.params.routing.lfo.to.push('vca-cv');
          console.log('🌀 ARP2600: LFO → VCA CV (tremolo)');
          break;
        case 'adsr-vca':
          this.params.routing.adsrToVCA = true;
          console.log('📈 ARP2600: ADSR → VCA');
          break;
        case 'adsr-vcf-cv':
          console.log('📈 ARP2600: ADSR → VCF CV (envelope filter)');
          break;
        case 'vco1-saw-ringMod':
        case 'vco1-pulse-ringMod':
        case 'vco2-saw-ringMod':
        case 'vco2-tri-ringMod':
          this.params.routing.ringModActive = true;
          console.log('💍 ARP2600: Ring Modulation active');
          break;
      }
    });
    
    console.log('🔌 ARP2600: Enhanced routing updated');
    console.log('   VCO1-SAW →', this.params.routing['vco1-saw'].to.join(', ') || 'none');
    console.log('   VCO1-PULSE →', this.params.routing['vco1-pulse'].to.join(', ') || 'none');
    console.log('   VCO2-SAW →', this.params.routing['vco2-saw'].to.join(', ') || 'none');
    console.log('   VCO2-TRI →', this.params.routing['vco2-tri'].to.join(', ') || 'none');
    console.log('   VCO3-SINE →', this.params.routing['vco3-sine'].to.join(', ') || 'none');
    console.log('   LFO →', this.params.routing.lfo.to.join(', ') || 'none');
    console.log('   ADSR →', this.params.routing.adsr.to.join(', ') || 'none');
  }
  
  setLFORate(rate) {
    this.params.modulation.lfoRate = Math.max(0.1, Math.min(rate, 20));
    console.log('ARP2600: LFO Rate =', this.params.modulation.lfoRate.toFixed(1), 'Hz');
  }
  
  setLFODepth(depth) {
    this.params.modulation.lfoDepth = Math.max(0, Math.min(depth, 1));
    console.log('ARP2600: LFO Depth =', (this.params.modulation.lfoDepth * 100).toFixed(0), '%');
  }
  
  setNoiseLevel(level) {
    this.params.modulation.noiseLevel = Math.max(0, Math.min(level, 1));
    console.log('ARP2600: Noise Level =', (this.params.modulation.noiseLevel * 100).toFixed(0), '%');
  }

  // Preset management
  getParams() {
    return { ...this.params, envelope: { ...this.params.envelope } };
  }

  setParams(params) {
    if (params.osc1Level !== undefined) this.params.osc1Level = params.osc1Level;
    if (params.osc2Level !== undefined) this.params.osc2Level = params.osc2Level;
    if (params.detune !== undefined) this.params.detune = params.detune;
    if (params.filterCutoff !== undefined) this.params.filterCutoff = params.filterCutoff;
    if (params.filterResonance !== undefined) this.params.filterResonance = params.filterResonance;
    if (params.envelope) {
      this.params.envelope = { ...this.params.envelope, ...params.envelope };
    }
    console.log('ARP2600: Parameters loaded from preset');
  }

  stopAll() {
    // No-op for native audio (notes automatically stop)
  }
}

// Export singleton instance
const arp2600Bridge = new ARP2600Bridge();
export default arp2600Bridge;
