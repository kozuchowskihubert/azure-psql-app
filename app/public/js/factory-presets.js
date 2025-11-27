/**
 * Factory Presets for HAOS Synthesizers
 * Comprehensive preset library for TB-303, TR-909, and TR-808
 * Based on TEKNO, OMNISPHERE, and professional synthesis patches
 */

const FACTORY_PRESETS = {
    tb303: [
        // CLASSIC ACID
        {
            name: 'Acid Squelch',
            category: 'Classic',
            description: 'Classic acid house squelch with high resonance',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 800,
                    resonance: 25,
                    envMod: 0.8,
                    decay: 0.3,
                    slideTime: 0.1
                },
                pattern: [
                    { note: 'C2', active: true, accent: false, slide: false },
                    { note: 'D#2', active: true, accent: true, slide: true },
                    { note: 'F2', active: false },
                    { note: 'G2', active: true, accent: false, slide: false },
                    { note: 'C3', active: true, accent: true, slide: true },
                    { note: 'G2', active: true, accent: false, slide: false },
                    { note: 'F2', active: false },
                    { note: 'D#2', active: true, accent: false, slide: false }
                ]
            }
        },
        {
            name: '303 Classic',
            category: 'Classic',
            description: 'Original TB-303 sound',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 500,
                    resonance: 22,
                    envMod: 0.7,
                    decay: 0.35,
                    slideTime: 0.08
                }
            }
        },
        {
            name: 'Resonant Bass',
            category: 'Classic',
            description: 'High resonance acid bass',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 700,
                    resonance: 28,
                    envMod: 0.85,
                    decay: 0.28,
                    slideTime: 0.12
                }
            }
        },
        
        // BASS PRESETS
        {
            name: 'Deep Bass',
            category: 'Bass',
            description: 'Deep rolling bassline for techno',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 600,
                    resonance: 15,
                    envMod: 0.5,
                    decay: 0.6,
                    slideTime: 0.15
                },
                pattern: [
                    { note: 'C1', active: true, accent: true, slide: false },
                    { note: 'C1', active: false },
                    { note: 'D#1', active: true, accent: false, slide: true },
                    { note: 'C1', active: true, accent: false, slide: false }
                ]
            }
        },
        {
            name: 'Sub Bass',
            category: 'Bass',
            description: 'Deep sub bass for TEKNO',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 120,
                    resonance: 10,
                    envMod: 0.3,
                    decay: 0.8,
                    slideTime: 0.025
                }
            }
        },
        {
            name: 'Minimal Sub',
            category: 'Bass',
            description: 'Minimal techno bass',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 400,
                    resonance: 12,
                    envMod: 0.4,
                    decay: 0.5,
                    slideTime: 0.1
                }
            }
        },
        {
            name: 'Dark Rolling Bass',
            category: 'Bass',
            description: 'Rolling dark techno bassline',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 350,
                    resonance: 18,
                    envMod: 0.6,
                    decay: 0.7,
                    slideTime: 0.18
                }
            }
        },
        {
            name: 'Pluck Bass',
            category: 'Bass',
            description: 'Plucked bass stabs',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 800,
                    resonance: 14,
                    envMod: 0.6,
                    decay: 0.18,
                    slideTime: 0.005
                }
            }
        },
        {
            name: 'Stab Bass',
            category: 'Bass',
            description: 'Sharp melodic bass stabs',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 1000,
                    resonance: 16,
                    envMod: 0.65,
                    decay: 0.2,
                    slideTime: 0.005
                }
            }
        },
        {
            name: 'Rumble Bass',
            category: 'Bass',
            description: 'Sub rumble for TEKNO tracks',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 100,
                    resonance: 8,
                    envMod: 0.25,
                    decay: 0.9,
                    slideTime: 0.05
                }
            }
        },
        {
            name: 'Drone Bass',
            category: 'Bass',
            description: 'Dark droning bass',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 80,
                    resonance: 6,
                    envMod: 0.2,
                    decay: 1.2,
                    slideTime: 0.1
                }
            }
        },
        
        // LEAD PRESETS
        {
            name: 'Screamer',
            category: 'Lead',
            description: 'High-pitched screaming lead',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 2000,
                    resonance: 28,
                    envMod: 0.7,
                    decay: 0.2,
                    slideTime: 0.08
                }
            }
        },
        {
            name: 'Bright Lead',
            category: 'Lead',
            description: 'Bright cutting lead',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 3000,
                    resonance: 20,
                    envMod: 0.65,
                    decay: 0.25,
                    slideTime: 0.06
                }
            }
        },
        {
            name: 'Squelchy Lead',
            category: 'Lead',
            description: 'Squelchy acid lead line',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 1500,
                    resonance: 26,
                    envMod: 0.75,
                    decay: 0.3,
                    slideTime: 0.1
                }
            }
        },
        
        // FX & SPECIAL
        {
            name: 'Wobble',
            category: 'FX',
            description: 'Slow wobble bass',
            data: {
                params: {
                    waveform: 'sawtooth',
                    cutoff: 400,
                    resonance: 20,
                    envMod: 0.9,
                    decay: 0.8,
                    slideTime: 0.05
                }
            }
        },
        {
            name: 'Metallic',
            category: 'FX',
            description: 'Metallic industrial sound',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 2500,
                    resonance: 24,
                    envMod: 0.8,
                    decay: 0.15,
                    slideTime: 0.02
                }
            }
        },
        {
            name: 'Industrial',
            category: 'FX',
            description: 'Industrial techno texture',
            data: {
                params: {
                    waveform: 'square',
                    cutoff: 1800,
                    resonance: 22,
                    envMod: 0.7,
                    decay: 0.4,
                    slideTime: 0.03
                }
            }
        }
    ],
    
    tr909: [
        // TECHNO PATTERNS
        {
            name: 'Four on the Floor',
            category: 'Techno',
            description: 'Classic techno 4/4 kick pattern',
            bpm: 128,
            data: {
                params: {
                    kick: { pitch: 60, decay: 0.5, tone: 0.6, level: 1.0 },
                    snare: { tune: 200, tone: 0.5, snappy: 0.7, decay: 0.2, level: 0.8 },
                    hatClosed: { tune: 0.5, decay: 0.05, level: 0.6 },
                    hatOpen: { tune: 0.5, decay: 0.25, level: 0.7 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                    hatClosed: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                    hatOpen: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
                }
            }
        },
        {
            name: 'Hard Techno',
            category: 'Techno',
            description: 'Aggressive hard techno pattern',
            bpm: 145,
            data: {
                params: {
                    kick: { pitch: 55, decay: 0.4, tone: 0.4, level: 1.0 },
                    snare: { tune: 220, tone: 0.6, snappy: 0.8, decay: 0.15, level: 0.9 },
                    hatClosed: { tune: 0.6, decay: 0.04, level: 0.7 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                    hatClosed: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                }
            }
        },
        {
            name: 'Deep Groove',
            category: 'House',
            description: 'Deep house groove',
            bpm: 122,
            data: {
                params: {
                    kick: { pitch: 58, decay: 0.6, tone: 0.5, level: 0.95 },
                    snare: { tune: 180, tone: 0.4, snappy: 0.6, decay: 0.25, level: 0.75 },
                    hatClosed: { tune: 0.4, decay: 0.06, level: 0.55 }
                }
            }
        },
        {
            name: 'Minimal Techno',
            category: 'Techno',
            description: 'Sparse minimal pattern',
            bpm: 124,
            data: {
                params: {
                    kick: { pitch: 62, decay: 0.45, tone: 0.5, level: 0.95 },
                    snare: { tune: 190, tone: 0.45, snappy: 0.65, decay: 0.22, level: 0.7 },
                    hatClosed: { tune: 0.45, decay: 0.05, level: 0.5 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                    hatClosed: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
                }
            }
        },
        {
            name: 'Industrial Techno',
            category: 'Techno',
            description: 'Industrial techno drums',
            bpm: 138,
            data: {
                params: {
                    kick: { pitch: 52, decay: 0.35, tone: 0.3, level: 1.0 },
                    snare: { tune: 240, tone: 0.7, snappy: 0.9, decay: 0.12, level: 0.95 },
                    hatClosed: { tune: 0.65, decay: 0.035, level: 0.75 }
                }
            }
        },
        {
            name: 'Melodic Techno',
            category: 'Techno',
            description: 'Melodic techno pattern',
            bpm: 126,
            data: {
                params: {
                    kick: { pitch: 59, decay: 0.55, tone: 0.55, level: 0.93 },
                    snare: { tune: 185, tone: 0.48, snappy: 0.68, decay: 0.23, level: 0.78 },
                    hatClosed: { tune: 0.48, decay: 0.055, level: 0.58 }
                }
            }
        },
        {
            name: '909 Classic Kit',
            category: 'Classic',
            description: 'Original 909 sound',
            bpm: 120,
            data: {
                params: {
                    kick: { pitch: 60, decay: 0.5, tone: 0.6, level: 0.9 },
                    snare: { tune: 200, tone: 0.5, snappy: 0.7, decay: 0.2, level: 0.8 },
                    hatClosed: { tune: 0.5, decay: 0.05, level: 0.6 },
                    hatOpen: { tune: 0.5, decay: 0.3, level: 0.7 }
                }
            }
        },
        {
            name: 'Deep Techno Kick',
            category: 'Kick',
            description: 'Deep sub kick with punch',
            bpm: 128,
            data: {
                params: {
                    kick: { pitch: 54, decay: 0.6, tone: 0.45, level: 1.0 }
                }
            }
        },
        {
            name: 'Sub Kick',
            category: 'Kick',
            description: 'Extra deep sub kick',
            bpm: 128,
            data: {
                params: {
                    kick: { pitch: 48, decay: 0.7, tone: 0.35, level: 0.95 }
                }
            }
        }
    ],
    
    tr808: [
        // HIP-HOP PATTERNS
        {
            name: 'Classic Trap',
            category: 'Hip-Hop',
            description: 'Modern trap pattern',
            bpm: 140,
            data: {
                params: {
                    kick: { pitch: 50, decay: 0.5, level: 1.0 },
                    snare: { tune: 200, level: 0.8 },
                    clap: { level: 0.7 },
                    hat: { decay: 0.05, level: 0.6 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                    hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1]
                }
            }
        },
        {
            name: 'Boom Bap',
            category: 'Hip-Hop',
            description: 'Classic 90s boom bap',
            bpm: 92,
            data: {
                params: {
                    kick: { pitch: 45, decay: 0.6, level: 1.0 },
                    snare: { tune: 180, level: 0.85 },
                    clap: { level: 0.75 },
                    hat: { decay: 0.04, level: 0.5 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
                }
            }
        },
        {
            name: 'Lo-Fi Chill',
            category: 'Lo-Fi',
            description: 'Chill lo-fi beat',
            bpm: 85,
            data: {
                params: {
                    kick: { pitch: 48, decay: 0.5, level: 0.8 },
                    snare: { tune: 160, level: 0.6 },
                    hat: { decay: 0.06, level: 0.4 }
                }
            }
        },
        {
            name: 'Hard Trap',
            category: 'Hip-Hop',
            description: 'Aggressive trap drums',
            bpm: 145,
            data: {
                params: {
                    kick: { pitch: 48, decay: 0.45, level: 1.0 },
                    snare: { tune: 210, level: 0.9 },
                    clap: { level: 0.8 },
                    hat: { decay: 0.045, level: 0.7 }
                },
                pattern: {
                    kick: [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
                    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                }
            }
        },
        {
            name: 'Old School',
            category: 'Hip-Hop',
            description: '80s hip-hop drums',
            bpm: 96,
            data: {
                params: {
                    kick: { pitch: 46, decay: 0.55, level: 0.95 },
                    snare: { tune: 175, level: 0.8 },
                    clap: { level: 0.72 },
                    hat: { decay: 0.042, level: 0.48 }
                }
            }
        },
        {
            name: 'Drill',
            category: 'Hip-Hop',
            description: 'UK drill pattern',
            bpm: 138,
            data: {
                params: {
                    kick: { pitch: 49, decay: 0.48, level: 0.98 },
                    snare: { tune: 195, level: 0.85 },
                    hat: { decay: 0.048, level: 0.65 }
                },
                pattern: {
                    kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                    hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0]
                }
            }
        },
        {
            name: 'Lo-Fi Boom Bap',
            category: 'Lo-Fi',
            description: 'Relaxed lo-fi boom bap',
            bpm: 88,
            data: {
                params: {
                    kick: { pitch: 47, decay: 0.52, level: 0.75 },
                    snare: { tune: 165, level: 0.65 },
                    hat: { decay: 0.055, level: 0.42 }
                }
            }
        },
        {
            name: 'Jazz Hop',
            category: 'Lo-Fi',
            description: 'Jazz-influenced hip-hop',
            bpm: 90,
            data: {
                params: {
                    kick: { pitch: 46, decay: 0.58, level: 0.78 },
                    snare: { tune: 170, level: 0.68 },
                    hat: { decay: 0.06, level: 0.45 }
                },
                pattern: {
                    kick: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
                    snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
                }
            }
        },
        {
            name: 'Footwork',
            category: 'Electronic',
            description: 'Juke/footwork pattern',
            bpm: 160,
            data: {
                params: {
                    kick: { pitch: 51, decay: 0.4, level: 0.95 },
                    snare: { tune: 205, level: 0.82 },
                    hat: { decay: 0.04, level: 0.68 }
                },
                pattern: {
                    kick: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0],
                    snare: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
                    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                }
            }
        },
        {
            name: '808 Sub Bass',
            category: 'Bass',
            description: 'Classic 808 sub kick',
            bpm: 128,
            data: {
                params: {
                    kick: { pitch: 44, decay: 0.7, level: 1.0 }
                }
            }
        }
    ]
};

// Make available globally
window.FACTORY_PRESETS = FACTORY_PRESETS;
