/**
 * HAOS.fm Factory Presets
 * 
 * This file contains a collection of default patches for various instruments.
 * These presets are loaded by the Preset Browser and can be used as starting points.
 */

const FACTORY_PRESETS = {
    "arp2600": [
        {
            "name": "Classic Lead",
            "data": {
                "vco1": { "waveform": "sawtooth", "enabled": true },
                "vco2": { "waveform": "square", "enabled": true, "fine": 10 },
                "vcf": { "cutoff": 3500, "resonance": 8, "envAmount": 60 },
                "envelope": { "attack": 0.02, "decay": 0.4, "sustain": 0.6, "release": 0.5 },
                "modMatrix": { "lfoToPitch": 5 }
            }
        },
        {
            "name": "Lush Pad",
            "data": {
                "vco1": { "waveform": "sine", "enabled": true },
                "vco2": { "waveform": "triangle", "enabled": true, "octave": -1 },
                "vco3": { "waveform": "sawtooth", "enabled": true, "fine": -12 },
                "vcf": { "cutoff": 2500, "resonance": 12 },
                "envelope": { "attack": 1.5, "decay": 2.0, "sustain": 0.8, "release": 3.0 },
                "lfo": { "rate": 0.3, "amount": 15 }
            }
        },
        {
            "name": "Aggressive Bass",
            "data": {
                "vco1": { "waveform": "square", "enabled": true },
                "vco2": { "waveform": "sawtooth", "enabled": true, "detune": -20 },
                "vcf": { "cutoff": 800, "resonance": 15, "envAmount": 75 },
                "envelope": { "attack": 0.01, "decay": 0.2, "sustain": 0.1, "release": 0.2 }
            }
        }
    ],
    "tb303": [
        {
            "name": "Acid Squelch",
            "data": {
                "params": { "cutoff": 1200, "resonance": 18, "envMod": 80, "decay": 0.4, "distortion": 40 },
                "pattern": [
                    { "active": true, "note": "C3", "accent": true }, { "active": false },
                    { "active": true, "note": "G3", "slide": true }, { "active": true, "note": "C3" },
                    { "active": true, "note": "A#2" }, { "active": false },
                    { "active": true, "note": "C3" }, { "active": false }
                ]
            }
        },
        {
            "name": "Subtle Groove",
            "data": {
                "params": { "cutoff": 600, "resonance": 10, "envMod": 50, "decay": 0.6 },
                "pattern": [
                    { "active": true, "note": "C2" }, { "active": false }, { "active": false }, { "active": true, "note": "D2" },
                    { "active": true, "note": "C2" }, { "active": false }, { "active": false }, { "active": true, "note": "F2" }
                ]
            }
        }
    ],
    "tr808": [
        {
            "name": "Classic Trap",
            "data": {
                "pattern": [
                    { "kick": true }, { "hat": true }, { "hat": true }, { "snare": true },
                    { "kick": true }, { "hat": true }, { "hat": true }, { "snare": true }
                ],
                "bpm": 140
            }
        }
    ],
    "tr909": [
        {
            "name": "Four on the Floor",
            "data": {
                "pattern": [
                    { "kick": true }, { "hatClosed": true }, { "kick": true }, { "hatClosed": true, "snare": true },
                    { "kick": true }, { "hatClosed": true }, { "kick": true }, { "hatClosed": true, "snare": true }
                ],
                "bpm": 128,
                "params": { "kick": { "punch": 0.9 } }
            }
        }
    ]
};

// Make it available if running in Node.js for the backend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FACTORY_PRESETS;
}
