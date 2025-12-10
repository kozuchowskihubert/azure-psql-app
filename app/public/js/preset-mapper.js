/**
 * Preset Mapper
 * Maps and manages presets for all synthesizers
 */

class PresetMapper {
    constructor() {
        this.presets = {
            // TB-303 Presets (17 total)
            tb303: [
                // Classic (3)
                { name: 'Acid Squelch', category: 'Classic', cutoff: 800, resonance: 25, envMod: 0.8, decay: 0.3 },
                { name: '303 Classic', category: 'Classic', cutoff: 700, resonance: 22, envMod: 0.65, decay: 0.35 },
                { name: 'Resonant Bass', category: 'Classic', cutoff: 650, resonance: 30, envMod: 0.75, decay: 0.4 },
                // Bass (8)
                { name: 'Deep Bass', category: 'Bass', cutoff: 600, resonance: 15, envMod: 0.5, decay: 0.6 },
                { name: 'Sub Bass', category: 'Bass', cutoff: 200, resonance: 8, envMod: 0.2, decay: 0.7 },
                { name: 'Minimal Sub', category: 'Bass', cutoff: 180, resonance: 5, envMod: 0.15, decay: 0.8 },
                { name: 'Dark Rolling Bass', category: 'Bass', cutoff: 500, resonance: 18, envMod: 0.6, decay: 0.5 },
                { name: 'Pluck Bass', category: 'Bass', cutoff: 800, resonance: 12, envMod: 0.7, decay: 0.18 },
                { name: 'Stab Bass', category: 'Bass', cutoff: 900, resonance: 20, envMod: 0.8, decay: 0.15 },
                { name: 'Rumble Bass', category: 'Bass', cutoff: 250, resonance: 10, envMod: 0.3, decay: 0.9 },
                { name: 'Drone Bass', category: 'Bass', cutoff: 300, resonance: 6, envMod: 0.1, decay: 1.0 },
                // Lead (3)
                { name: 'Screamer', category: 'Lead', cutoff: 2000, resonance: 28, envMod: 0.7, decay: 0.2 },
                { name: 'Bright Lead', category: 'Lead', cutoff: 1500, resonance: 24, envMod: 0.75, decay: 0.25 },
                { name: 'Squelchy Lead', category: 'Lead', cutoff: 1200, resonance: 32, envMod: 0.85, decay: 0.22 },
                // FX (3)
                { name: 'Wobble', category: 'FX', cutoff: 400, resonance: 20, envMod: 0.9, decay: 0.8 },
                { name: 'Metallic', category: 'FX', cutoff: 1800, resonance: 35, envMod: 0.65, decay: 0.12 },
                { name: 'Industrial', category: 'FX', cutoff: 1600, resonance: 38, envMod: 0.9, decay: 0.1 }
            ],
            // TR-909 Presets (9 total)
            tr909: [
                // Techno (5)
                { name: 'Four on the Floor', category: 'Techno', bpm: 128 },
                { name: 'Hard Techno', category: 'Techno', bpm: 145 },
                { name: 'Minimal Techno', category: 'Techno', bpm: 132 },
                { name: 'Industrial Techno', category: 'Techno', bpm: 140 },
                { name: 'Melodic Techno', category: 'Techno', bpm: 124 },
                // House (1)
                { name: 'Deep Groove', category: 'House', bpm: 122 },
                // Classic (1)
                { name: '909 Classic Kit', category: 'Classic', bpm: 120 },
                // Kick (2)
                { name: 'Deep Techno Kick', category: 'Kick', bpm: 128 },
                { name: 'Sub Kick', category: 'Kick', bpm: 128 }
            ],
            // TR-808 Presets (10 total)
            tr808: [
                // Hip-Hop (5)
                { name: 'Classic Trap', category: 'Hip-Hop', bpm: 140 },
                { name: 'Boom Bap', category: 'Hip-Hop', bpm: 92 },
                { name: 'Hard Trap', category: 'Hip-Hop', bpm: 145 },
                { name: 'Old School', category: 'Hip-Hop', bpm: 96 },
                { name: 'Drill', category: 'Hip-Hop', bpm: 138 },
                // Lo-Fi (3)
                { name: 'Lo-Fi Chill', category: 'Lo-Fi', bpm: 85 },
                { name: 'Lo-Fi Boom Bap', category: 'Lo-Fi', bpm: 88 },
                { name: 'Jazz Hop', category: 'Lo-Fi', bpm: 90 },
                // Electronic (1)
                { name: 'Footwork', category: 'Electronic', bpm: 160 },
                // Bass (1)
                { name: '808 Sub Bass', category: 'Bass', bpm: 128 }
            ]
        };
    }
    
    getPreset(synth, name) {
        if (!this.presets[synth]) return null;
        return this.presets[synth].find(p => p.name === name) || this.presets[synth][0];
    }
    
    getAllPresets(synth) {
        return this.presets[synth] || [];
    }
}

// Make available globally
window.PresetMapper = PresetMapper;
