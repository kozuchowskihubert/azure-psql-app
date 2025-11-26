/**
 * HAOS.fm Synth Manager
 * Central management for all modular synthesizers
 * 
 * Integrates:
 * - TB-303 Acid Bass
 * - TR-808 Drum Machine
 * - ARP-2600 Modular Synth
 * - String Machine (Ensemble Strings)
 */

import TB303 from './synths/tb303.js';
import TR808 from './synths/tr808.js';
import ARP2600 from './synths/arp2600.js';
import StringMachine from './synths/string-machine.js';

class SynthManager {
    constructor() {
        this.audioContext = null;
        this.synths = {};
        this.initialized = false;
    }

    /**
     * Initialize audio context and all synthesizers
     */
    async init() {
        if (this.initialized) {
            console.log('✅ Synth Manager already initialized');
            return;
        }

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Initialize all synths
            this.synths.tb303 = new TB303(this.audioContext);
            this.synths.tr808 = new TR808(this.audioContext);
            this.synths.arp2600 = new ARP2600(this.audioContext);
            this.synths.stringMachine = new StringMachine(this.audioContext);
            
            this.initialized = true;
            console.log('✅ Synth Manager initialized with:', Object.keys(this.synths));
            
            // Add to window for global access
            window.synthManager = this;
            
            return this;
        } catch (error) {
            console.error('❌ Failed to initialize Synth Manager:', error);
            throw error;
        }
    }

    /**
     * Resume audio context (required for autoplay policy)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🔊 Audio context resumed');
        }
    }

    /**
     * Get TB-303 instance
     */
    getTB303() {
        return this.synths.tb303;
    }

    /**
     * Get TR-808 instance
     */
    getTR808() {
        return this.synths.tr808;
    }

    /**
     * Get ARP-2600 instance
     */
    getARP2600() {
        return this.synths.arp2600;
    }
    
    /**
     * Get String Machine instance
     */
    getStringMachine() {
        return this.synths.stringMachine;
    }
    
    /**
     * Play string chord (convenience method)
     */
    playStringChord(notes, duration = 2.0, velocity = 0.7) {
        const stringMachine = this.getStringMachine();
        return stringMachine.playChord(notes, duration, velocity);
    }
    
    /**
     * Modulate ARP-2600 with String Machine output
     */
    modulateARP2600WithStrings(enabled = true, amount = 0.5) {
        const arp = this.getARP2600();
        const strings = this.getStringMachine();
        
        if (enabled) {
            // Create a gain node from string machine that can modulate the ARP
            const modSource = this.audioContext.createGain();
            modSource.gain.value = amount;
            
            arp.setExternalModulation(true, modSource, amount, 'filter');
            console.log('✅ ARP-2600 modulated by String Machine');
        } else {
            arp.setExternalModulation(false);
            console.log('❌ ARP-2600 modulation disabled');
        }
    }

    /**
     * Play a TB-303 pattern
     */
    playTB303Pattern(pattern, bpm = 130) {
        const synth = this.getTB303();
        if (pattern) {
            synth.setPattern(pattern);
        }
        synth.setBPM(bpm);
        synth.play();
        console.log('🎵 TB-303 pattern playing');
    }

    /**
     * Play a TR-808 drum pattern
     */
    playTR808Pattern(pattern, bpm = 130) {
        const synth = this.getTR808();
        if (pattern) {
            synth.setPattern(pattern);
        }
        synth.setBPM(bpm);
        synth.play();
        console.log('🥁 TR-808 pattern playing');
    }

    /**
     * Play ARP-2600 patch
     */
    playARP2600Patch(patch) {
        const synth = this.getARP2600();
        if (patch) {
            synth.loadPatch(patch);
        }
        console.log('🎛️ ARP-2600 patch loaded');
    }

    /**
     * Stop all synths
     */
    stopAll() {
        Object.values(this.synths).forEach(synth => {
            if (synth.stop) {
                synth.stop();
            }
        });
        console.log('⏹️ All synths stopped');
    }

    /**
     * Get preset patterns for TB-303
     */
    getTB303Presets() {
        return {
            'acid-303-classic': {
                name: 'Classic Acid',
                pattern: Array(16).fill(null).map((_, i) => ({
                    active: [0, 3, 7, 10, 14].includes(i),
                    note: ['C3', 'D#3', 'G3', 'A#3', 'C4'][i % 5],
                    accent: [0, 14].includes(i),
                    slide: [3, 10].includes(i),
                    gate: false
                })),
                params: { cutoff: 800, resonance: 80, envMod: 70, decay: 0.3 }
            },
            'minimal-303': {
                name: 'Minimal Techno',
                pattern: Array(16).fill(null).map((_, i) => ({
                    active: [0, 8].includes(i),
                    note: 'C3',
                    accent: i === 0,
                    slide: false,
                    gate: true
                })),
                params: { cutoff: 600, resonance: 60, envMod: 50, decay: 0.5 }
            },
            'squelch-303': {
                name: 'Squelchy Bass',
                pattern: Array(16).fill(null).map((_, i) => ({
                    active: i % 2 === 0,
                    note: ['C3', 'C3', 'D#3', 'D#3', 'F3', 'F3', 'G3', 'G3'][i % 8],
                    accent: i % 4 === 0,
                    slide: i % 4 === 2,
                    gate: false
                })),
                params: { cutoff: 1200, resonance: 90, envMod: 80, decay: 0.2 }
            }
        };
    }

    /**
     * Get preset patterns for TR-808
     */
    getTR808Presets() {
        return {
            'four-on-floor': {
                name: 'Four on the Floor',
                pattern: {
                    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
                    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                    hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
                    openhat: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0]
                }
            },
            'hard-techno': {
                name: 'Hard Techno',
                pattern: {
                    kick: [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0],
                    snare: [0,0,0,0, 1,0,0,0, 0,0,0,1, 1,0,0,0],
                    hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
                    clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1]
                }
            },
            'trap-808': {
                name: 'Trap Pattern',
                pattern: {
                    kick: [1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0],
                    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                    hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
                    rim: [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1]
                }
            }
        };
    }

    /**
     * Get preset patches for ARP-2600
     */
    getARP2600Presets() {
        return {
            'techno-lead': {
                name: 'Techno Lead',
                patch: {
                    vco1: { waveform: 'sawtooth', octave: 0, fine: 0 },
                    vco2: { waveform: 'square', octave: -1, fine: 5 },
                    vco3: { waveform: 'noise', level: 10 },
                    vcf: { cutoff: 1200, resonance: 70, envAmount: 60 },
                    vca: { level: 80 },
                    adsr: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 }
                }
            },
            'bass-drone': {
                name: 'Bass Drone',
                patch: {
                    vco1: { waveform: 'square', octave: -2, fine: 0 },
                    vco2: { waveform: 'sawtooth', octave: -2, fine: -7 },
                    vco3: { waveform: 'sub', level: 80 },
                    vcf: { cutoff: 400, resonance: 80, envAmount: 40 },
                    vca: { level: 90 },
                    adsr: { attack: 0.1, decay: 0.5, sustain: 0.8, release: 1.0 }
                }
            },
            'space-pad': {
                name: 'Space Pad',
                patch: {
                    vco1: { waveform: 'sawtooth', octave: 0, fine: 0 },
                    vco2: { waveform: 'sawtooth', octave: 0, fine: 7 },
                    vco3: { waveform: 'triangle', level: 30 },
                    vcf: { cutoff: 2000, resonance: 40, envAmount: 50 },
                    vca: { level: 70 },
                    adsr: { attack: 0.5, decay: 0.5, sustain: 0.7, release: 2.0 }
                }
            }
        };
    }
    
    /**
     * Get presets for String Machine
     */
    getStringMachinePresets() {
        return StringMachine.getPresets();
    }

    /**
     * Load and apply a TB-303 preset
     */
    loadTB303Preset(presetName) {
        const presets = this.getTB303Presets();
        const preset = presets[presetName];
        
        if (!preset) {
            console.error('TB-303 preset not found:', presetName);
            return false;
        }
        
        const synth = this.getTB303();
        synth.setPattern(preset.pattern);
        synth.setParams(preset.params);
        
        console.log('✅ Loaded TB-303 preset:', preset.name);
        return true;
    }

    /**
     * Load and apply a TR-808 preset
     */
    loadTR808Preset(presetName) {
        const presets = this.getTR808Presets();
        const preset = presets[presetName];
        
        if (!preset) {
            console.error('TR-808 preset not found:', presetName);
            return false;
        }
        
        const synth = this.getTR808();
        synth.setPattern(preset.pattern);
        
        console.log('✅ Loaded TR-808 preset:', preset.name);
        return true;
    }

    /**
     * Load and apply an ARP-2600 preset
     */
    loadARP2600Preset(presetName) {
        const presets = this.getARP2600Presets();
        const preset = presets[presetName];
        
        if (!preset) {
            console.error('ARP-2600 preset not found:', presetName);
            return false;
        }
        
        const synth = this.getARP2600();
        synth.loadPatch(preset.patch);
        
        console.log('✅ Loaded ARP-2600 preset:', preset.name);
        return true;
    }
    
    /**
     * Load and apply a String Machine preset
     */
    loadStringMachinePreset(presetName) {
        const synth = this.getStringMachine();
        const success = synth.loadPreset(presetName);
        
        if (success) {
            console.log('✅ Loaded String Machine preset:', presetName);
        } else {
            console.error('String Machine preset not found:', presetName);
        }
        
        return success;
    }
}

// Create and export singleton instance
const synthManager = new SynthManager();

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        synthManager.init().catch(console.error);
    });
} else {
    synthManager.init().catch(console.error);
}

// Export
export default synthManager;

// Make available globally
window.SynthManager = SynthManager;
window.synthManager = synthManager;
