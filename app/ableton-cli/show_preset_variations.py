#!/usr/bin/env python3
"""
Show preset variations with alternative mappings for frequencies, oscillators, etc.
Demonstrates how presets can be modified for different musical contexts.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any


class PresetVariationExplorer:
    """Explore and display preset variations with different parameter mappings"""
    
    # Musical frequency mappings
    NOTE_FREQUENCIES = {
        'Sub Bass': {'C1': 32.7, 'E1': 41.2, 'G1': 49.0, 'C2': 65.4},
        'Bass': {'C2': 65.4, 'E2': 82.4, 'G2': 98.0, 'C3': 130.8},
        'Mid Bass': {'C3': 130.8, 'E3': 164.8, 'G3': 196.0, 'C4': 261.6},
        'Lead': {'C4': 261.6, 'E4': 329.6, 'G4': 392.0, 'C5': 523.3},
        'High': {'C5': 523.3, 'E5': 659.3, 'G5': 784.0, 'C6': 1046.5}
    }
    
    # Waveform characteristics
    WAVEFORMS = {
        'sawtooth': {'brightness': 'bright', 'harmonics': 'rich', 'character': 'aggressive'},
        'square': {'brightness': 'hollow', 'harmonics': 'odd', 'character': 'hollow'},
        'triangle': {'brightness': 'warm', 'harmonics': 'few', 'character': 'mellow'},
        'sine': {'brightness': 'pure', 'harmonics': 'none', 'character': 'fundamental'}
    }
    
    # Filter cutoff ranges (in Hz)
    FILTER_RANGES = {
        'Sub': (20, 150),
        'Bass': (150, 400),
        'Low-Mid': (400, 800),
        'Mid': (800, 2000),
        'High-Mid': (2000, 5000),
        'High': (5000, 12000),
        'Air': (12000, 20000)
    }
    
    def __init__(self, preset_library_path: str):
        with open(preset_library_path) as f:
            data = json.load(f)
        self.presets = data['presets']
    
    def show_preset_with_variations(self, preset_name: str):
        """Show a preset with all its possible variations"""
        
        preset = next((p for p in self.presets if p['name'] == preset_name), None)
        if not preset:
            print(f"❌ Preset '{preset_name}' not found!")
            return
        
        print("=" * 100)
        print(f"🎹 PRESET VARIATIONS: {preset['name']}")
        print("=" * 100)
        
        print(f"\n📝 Base Description: {preset['description']}")
        print(f"📂 Category: {preset['category']}")
        
        # Show base configuration
        print("\n" + "=" * 100)
        print("🎛️  BASE CONFIGURATION")
        print("=" * 100)
        
        self._show_oscillator_config(preset.get('modules', {}))
        self._show_filter_config(preset.get('modules', {}))
        self._show_modulation_config(preset.get('modulators', {}))
        
        # Generate and show variations
        print("\n" + "=" * 100)
        print("🔄 FREQUENCY VARIATIONS (Alternative Tunings)")
        print("=" * 100)
        self._show_frequency_variations(preset)
        
        print("\n" + "=" * 100)
        print("🎚️  WAVEFORM VARIATIONS (Alternative Timbres)")
        print("=" * 100)
        self._show_waveform_variations(preset)
        
        print("\n" + "=" * 100)
        print("🎛️  FILTER VARIATIONS (Alternative Tone Shaping)")
        print("=" * 100)
        self._show_filter_variations(preset)
        
        print("\n" + "=" * 100)
        print("⚡ MODULATION VARIATIONS (Alternative Envelopes)")
        print("=" * 100)
        self._show_envelope_variations(preset)
        
        print("\n" + "=" * 100)
        print("💡 CREATIVE VARIATIONS (Remix Ideas)")
        print("=" * 100)
        self._show_creative_variations(preset)
    
    def _show_oscillator_config(self, modules: Dict):
        """Display oscillator configuration"""
        for module_name in ['VCO1', 'VCO2', 'VCO3']:
            if module_name in modules:
                params = modules[module_name].get('parameters', {})
                freq = params.get('frequency', 440)
                wave = params.get('waveform', 'sawtooth')
                
                print(f"\n🌊 {module_name}:")
                print(f"   Frequency: {freq:.1f} Hz")
                print(f"   Waveform:  {wave}")
                
                # Show musical note equivalent
                note = self._freq_to_note(freq)
                print(f"   Note:      {note}")
    
    def _show_filter_config(self, modules: Dict):
        """Display filter configuration"""
        if 'VCF' in modules:
            params = modules['VCF'].get('parameters', {})
            cutoff = params.get('cutoff', 0.5)
            resonance = params.get('resonance', 0.0)
            mode = params.get('mode', 'LP')
            
            # Convert normalized cutoff to Hz (assuming 20-20kHz range)
            cutoff_hz = 20 + (cutoff * 19980)
            
            print(f"\n🔊 VCF (Filter):")
            print(f"   Cutoff:    {cutoff:.2f} ({cutoff_hz:.0f} Hz)")
            print(f"   Resonance: {resonance:.2f}")
            print(f"   Mode:      {mode}")
            
            # Show frequency range
            freq_range = self._get_frequency_range(cutoff_hz)
            print(f"   Range:     {freq_range}")
    
    def _show_modulation_config(self, modulators: Dict):
        """Display modulation configuration"""
        for mod_name, mod_data in modulators.items():
            mod_type = mod_data.get('module_type', 'Unknown')
            
            print(f"\n⚙️  {mod_name} ({mod_type}):")
            
            if mod_type == 'ENV':
                print(f"   ADSR: A={mod_data.get('attack', 0):.3f}s "
                      f"D={mod_data.get('decay', 0):.3f}s "
                      f"S={mod_data.get('sustain', 0):.2f} "
                      f"R={mod_data.get('release', 0):.3f}s")
            elif mod_type == 'LFO':
                print(f"   Rate:  {mod_data.get('rate', 0):.2f} Hz")
                print(f"   Wave:  {mod_data.get('waveform', 'sine')}")
                print(f"   Depth: {mod_data.get('depth', 0):.2f}")
    
    def _show_frequency_variations(self, preset: Dict):
        """Show variations with different frequency mappings"""
        modules = preset.get('modules', {})
        
        if 'VCO1' not in modules:
            print("\n   No oscillator to vary")
            return
        
        base_freq = modules['VCO1']['parameters'].get('frequency', 440)
        
        print(f"\n   Base Frequency: {base_freq:.1f} Hz ({self._freq_to_note(base_freq)})")
        print("\n   Alternative Tunings:")
        
        variations = [
            ("One Octave Down", base_freq / 2),
            ("Perfect Fifth Down", base_freq / 1.5),
            ("Perfect Fourth Up", base_freq * 1.33),
            ("Perfect Fifth Up", base_freq * 1.5),
            ("One Octave Up", base_freq * 2),
            ("Two Octaves Up", base_freq * 4),
        ]
        
        for i, (name, freq) in enumerate(variations, 1):
            note = self._freq_to_note(freq)
            print(f"\n   {i}. {name}")
            print(f"      Frequency: {freq:.1f} Hz")
            print(f"      Note: {note}")
            print(f"      Use case: {self._get_frequency_use_case(freq, preset['category'])}")
    
    def _show_waveform_variations(self, preset: Dict):
        """Show variations with different waveforms"""
        modules = preset.get('modules', {})
        
        if 'VCO1' not in modules:
            print("\n   No oscillator to vary")
            return
        
        base_wave = modules['VCO1']['parameters'].get('waveform', 'sawtooth')
        
        print(f"\n   Base Waveform: {base_wave}")
        print("\n   Alternative Waveforms:")
        
        for i, (wave, props) in enumerate(self.WAVEFORMS.items(), 1):
            if wave == base_wave:
                continue
            
            print(f"\n   {i}. {wave.upper()}")
            print(f"      Brightness: {props['brightness']}")
            print(f"      Harmonics:  {props['harmonics']}")
            print(f"      Character:  {props['character']}")
            print(f"      Best for:   {self._get_waveform_use_case(wave, preset['category'])}")
    
    def _show_filter_variations(self, preset: Dict):
        """Show variations with different filter settings"""
        modules = preset.get('modules', {})
        
        if 'VCF' not in modules:
            print("\n   No filter to vary")
            return
        
        base_cutoff = modules['VCF']['parameters'].get('cutoff', 0.5)
        base_res = modules['VCF']['parameters'].get('resonance', 0.0)
        
        print(f"\n   Base Filter: Cutoff={base_cutoff:.2f}, Resonance={base_res:.2f}")
        print("\n   Alternative Filter Settings:")
        
        variations = [
            ("Dark & Mellow", 0.15, 0.2, "Warm, subdued tone"),
            ("Classic Analog", 0.3, 0.6, "Vintage synth character"),
            ("Acid Squelch", 0.25, 0.85, "Resonant, piercing"),
            ("Open & Bright", 0.7, 0.3, "Clear, present"),
            ("Thin & Nasal", 0.5, 0.9, "Focused, narrow"),
            ("Wide Open", 0.95, 0.1, "Full spectrum, natural"),
        ]
        
        for i, (name, cutoff, res, desc) in enumerate(variations, 1):
            cutoff_hz = 20 + (cutoff * 19980)
            print(f"\n   {i}. {name}")
            print(f"      Cutoff:    {cutoff:.2f} ({cutoff_hz:.0f} Hz)")
            print(f"      Resonance: {res:.2f}")
            print(f"      Character: {desc}")
    
    def _show_envelope_variations(self, preset: Dict):
        """Show variations with different envelope shapes"""
        modulators = preset.get('modulators', {})
        
        if 'ENV1' not in modulators:
            print("\n   No envelope to vary")
            return
        
        base_env = modulators['ENV1']
        
        print(f"\n   Base Envelope: "
              f"A={base_env.get('attack', 0):.3f}s "
              f"D={base_env.get('decay', 0):.3f}s "
              f"S={base_env.get('sustain', 0):.2f} "
              f"R={base_env.get('release', 0):.3f}s")
        
        print("\n   Alternative Envelope Shapes:")
        
        variations = [
            ("Pluck (Short & Percussive)", 0.001, 0.05, 0.0, 0.01, "Plucked string"),
            ("Piano (Natural Decay)", 0.01, 0.3, 0.3, 0.2, "Piano-like"),
            ("Organ (Instant On/Off)", 0.0, 0.0, 1.0, 0.01, "Hammond organ"),
            ("Pad (Slow Swell)", 0.5, 0.3, 0.8, 1.0, "Atmospheric pad"),
            ("Brass (Slow Attack)", 0.2, 0.1, 0.9, 0.3, "Brass instrument"),
            ("Gate (Staccato)", 0.001, 0.1, 0.0, 0.01, "Gated synth"),
        ]
        
        for i, (name, a, d, s, r, desc) in enumerate(variations, 1):
            print(f"\n   {i}. {name}")
            print(f"      ADSR: A={a:.3f}s D={d:.3f}s S={s:.2f} R={r:.3f}s")
            print(f"      Character: {desc}")
    
    def _show_creative_variations(self, preset: Dict):
        """Show creative remixing ideas"""
        category = preset['category']
        
        print("\n   Creative Remixing Ideas:")
        
        ideas = self._get_creative_ideas(category, preset['name'])
        
        for i, (title, changes, result) in enumerate(ideas, 1):
            print(f"\n   {i}. {title}")
            for change in changes:
                print(f"      • {change}")
            print(f"      → Result: {result}")
    
    def _get_creative_ideas(self, category: str, preset_name: str) -> List[tuple]:
        """Get creative variation ideas based on category"""
        
        if category == 'bass':
            return [
                ("Lead Conversion", 
                 ["Raise frequency by 2 octaves (x4)",
                  "Reduce resonance to 0.3",
                  "Shorten envelope (A=0.01, R=0.1)"],
                 "Transforms into aggressive lead sound"),
                
                ("Sub-Bass Focus",
                 ["Lower frequency to C1 (32.7 Hz)",
                  "Switch to sine wave",
                  "Remove filter resonance"],
                 "Pure sub-bass for club systems"),
                
                ("Percussive Hit",
                 ["Very short envelope (A=0.001, D=0.05, S=0, R=0.01)",
                  "High filter resonance (0.9)",
                  "Fast filter envelope"],
                 "Percussive bass hit for drums"),
            ]
        
        elif category == 'lead':
            return [
                ("Bass Variation",
                 ["Lower frequency by 2 octaves (/4)",
                  "Increase sustain to 0.8",
                  "Add more filter resonance"],
                 "Transforms into powerful bass"),
                
                ("Pluck Sound",
                 ["Very short decay (0.05s)",
                  "Zero sustain",
                  "Higher cutoff (0.7)"],
                 "Plucked string-like lead"),
                
                ("Pad Texture",
                 ["Slow attack (0.5s)",
                  "High sustain (0.9)",
                  "Long release (2.0s)"],
                 "Atmospheric pad from lead"),
            ]
        
        elif category == 'pad':
            return [
                ("Bright Strings",
                 ["Faster attack (0.2s)",
                  "Higher cutoff (0.8)",
                  "Medium resonance (0.4)"],
                 "String section sound"),
                
                ("Dark Ambient",
                 ["Very slow attack (2.0s)",
                  "Low cutoff (0.15)",
                  "No resonance"],
                 "Dark, evolving texture"),
                
                ("Choir",
                 ["Add subtle LFO to filter (0.3 Hz)",
                  "Medium attack (0.3s)",
                  "Band-pass filter mode"],
                 "Vocal-like choir pad"),
            ]
        
        else:
            return [
                ("Octave Shift",
                 ["Try different octaves",
                  "Adjust filter accordingly"],
                 "Different tonal range"),
                
                ("Envelope Reshape",
                 ["Modify ADSR for different articulation"],
                 "Changed playing style"),
                
                ("Filter Sweep",
                 ["Adjust cutoff and resonance",
                  "Different tonal character"],
                 "Altered timbre"),
            ]
    
    def _freq_to_note(self, freq: float) -> str:
        """Convert frequency to nearest musical note"""
        if freq < 20:
            return "Sub-audible"
        
        # A4 = 440 Hz reference
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        # Calculate semitones from A4
        semitones = 12 * (log2(freq / 440.0))
        note_num = round(semitones) + 9  # A is 9th note (0-indexed)
        
        octave = 4 + (note_num // 12)
        note_idx = note_num % 12
        
        return f"{note_names[note_idx]}{octave}"
    
    def _get_frequency_range(self, cutoff_hz: float) -> str:
        """Get frequency range description"""
        for range_name, (low, high) in self.FILTER_RANGES.items():
            if low <= cutoff_hz < high:
                return range_name
        return "Full Range" if cutoff_hz > 12000 else "Unknown"
    
    def _get_frequency_use_case(self, freq: float, category: str) -> str:
        """Get use case description for frequency"""
        if freq < 65:
            return "Sub-bass, felt more than heard"
        elif freq < 130:
            return "Deep bass, foundation"
        elif freq < 260:
            return "Mid bass, power"
        elif freq < 520:
            return "Low melody, warm leads"
        elif freq < 1040:
            return "Main melody range"
        else:
            return "High leads, bright textures"
    
    def _get_waveform_use_case(self, wave: str, category: str) -> str:
        """Get use case for waveform"""
        cases = {
            'sawtooth': {
                'bass': "Bright, cutting bass",
                'lead': "Classic analog lead",
                'pad': "Rich, full pad",
            },
            'square': {
                'bass': "Hollow, woody bass",
                'lead': "Retro video game lead",
                'pad': "Organ-like pad",
            },
            'triangle': {
                'bass': "Warm, smooth bass",
                'lead': "Mellow, flute-like lead",
                'pad': "Soft, gentle pad",
            },
            'sine': {
                'bass': "Pure sub-bass",
                'lead': "Clean, fundamental lead",
                'pad': "Ethereal, pure pad",
            },
        }
        
        return cases.get(wave, {}).get(category, "Versatile")


def log2(x):
    """Calculate log base 2"""
    import math
    return math.log(x) / math.log(2)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Show preset variations with alternative parameter mappings'
    )
    parser.add_argument('preset_name', help='Name of preset to explore')
    parser.add_argument(
        '--library',
        default=None,
        help='Path to preset library (default: auto-detect)'
    )
    
    args = parser.parse_args()
    
    # Find preset library
    if args.library:
        lib_path = args.library
    else:
        lib_path = Path(__file__).parent / 'output/presets/preset_library.json'
    
    if not Path(lib_path).exists():
        print(f"❌ Preset library not found: {lib_path}")
        return 1
    
    # Create explorer and show variations
    explorer = PresetVariationExplorer(str(lib_path))
    explorer.show_preset_with_variations(args.preset_name)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
