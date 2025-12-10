#!/usr/bin/env python3
"""
Advanced Preset Variation Generator with Batch Processing
Creates multiple variation sets for presets with export capabilities
"""

import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Any, Tuple
import random


class AdvancedPresetVariationGenerator:
    """Generate comprehensive preset variations with batch processing"""
    
    # Extended musical scales and modes
    SCALES = {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
        'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
        'dorian': [0, 2, 3, 5, 7, 9, 10],
        'phrygian': [0, 1, 3, 5, 7, 8, 10],
        'lydian': [0, 2, 4, 6, 7, 9, 11],
        'mixolydian': [0, 2, 4, 5, 7, 9, 10],
        'pentatonic_major': [0, 2, 4, 7, 9],
        'pentatonic_minor': [0, 3, 5, 7, 10],
        'blues': [0, 3, 5, 6, 7, 10],
        'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
    
    # Extended waveform morphing paths
    WAVEFORM_MORPH_PATHS = {
        'bright_to_dark': ['sawtooth', 'square', 'triangle', 'sine'],
        'aggressive_to_smooth': ['sawtooth', 'triangle', 'sine'],
        'hollow_to_full': ['square', 'sawtooth', 'triangle'],
        'pure_to_complex': ['sine', 'triangle', 'square', 'sawtooth']
    }
    
    # Filter resonance characteristics
    RESONANCE_PROFILES = {
        'subtle': (0.0, 0.2),
        'character': (0.2, 0.4),
        'pronounced': (0.4, 0.6),
        'aggressive': (0.6, 0.8),
        'extreme': (0.8, 1.0)
    }
    
    # Envelope character profiles
    ENVELOPE_PROFILES = {
        'pluck': {'attack': 0.001, 'decay': 0.05, 'sustain': 0.0, 'release': 0.01},
        'piano': {'attack': 0.001, 'decay': 0.2, 'sustain': 0.3, 'release': 0.5},
        'organ': {'attack': 0.001, 'decay': 0.001, 'sustain': 1.0, 'release': 0.1},
        'pad': {'attack': 0.5, 'decay': 0.3, 'sustain': 0.9, 'release': 2.0},
        'brass': {'attack': 0.1, 'decay': 0.2, 'sustain': 0.7, 'release': 0.3},
        'strings': {'attack': 0.3, 'decay': 0.2, 'sustain': 0.8, 'release': 1.5},
        'percussive': {'attack': 0.001, 'decay': 0.1, 'sustain': 0.1, 'release': 0.05},
        'gate': {'attack': 0.001, 'decay': 0.001, 'sustain': 1.0, 'release': 0.001},
        'reverse': {'attack': 1.0, 'decay': 0.5, 'sustain': 0.5, 'release': 0.1}
    }
    
    # LFO modulation patterns
    LFO_PATTERNS = {
        'slow_sweep': {'rate': 0.2, 'depth': 0.3, 'waveform': 'sine'},
        'wobble': {'rate': 2.0, 'depth': 0.7, 'waveform': 'sine'},
        'fast_wobble': {'rate': 8.0, 'depth': 0.9, 'waveform': 'sine'},
        'vibrato': {'rate': 5.0, 'depth': 0.2, 'waveform': 'sine'},
        'trill': {'rate': 10.0, 'depth': 0.5, 'waveform': 'square'},
        'chaos': {'rate': 15.0, 'depth': 1.0, 'waveform': 'random'}
    }
    
    def __init__(self, preset_library_path: str):
        with open(preset_library_path) as f:
            data = json.load(f)
        self.presets = data['presets']
        self.variations_generated = []
    
    def generate_frequency_variations(self, preset: Dict, base_freq: float = 440.0) -> List[Dict]:
        """Generate variations across different frequencies and octaves"""
        variations = []
        
        # Octave variations
        octaves = [-2, -1, 0, 1, 2, 3]
        for octave in octaves:
            freq = base_freq * (2 ** octave)
            var = {
                'type': 'frequency',
                'name': f"{preset['name']} - {octave:+d} octaves",
                'frequency': freq,
                'description': f"Base frequency shifted by {octave} octave(s) to {freq:.2f} Hz",
                'octave_shift': octave
            }
            variations.append(var)
        
        # Musical interval variations
        intervals = {
            'unison': 1.0,
            'minor_second': 1.059,
            'major_second': 1.122,
            'minor_third': 1.189,
            'major_third': 1.260,
            'perfect_fourth': 1.335,
            'tritone': 1.414,
            'perfect_fifth': 1.498,
            'minor_sixth': 1.587,
            'major_sixth': 1.682,
            'minor_seventh': 1.782,
            'major_seventh': 1.888,
            'octave': 2.0
        }
        
        for interval_name, ratio in intervals.items():
            freq = base_freq * ratio
            var = {
                'type': 'interval',
                'name': f"{preset['name']} - {interval_name.replace('_', ' ').title()}",
                'frequency': freq,
                'ratio': ratio,
                'description': f"Transposed to {interval_name.replace('_', ' ')} ({freq:.2f} Hz)"
            }
            variations.append(var)
        
        return variations
    
    def generate_harmonic_variations(self, preset: Dict) -> List[Dict]:
        """Generate variations exploring harmonic series"""
        variations = []
        base_freq = self._get_base_frequency(preset)
        
        # Harmonic series (1st to 16th harmonic)
        for harmonic in range(1, 17):
            freq = base_freq * harmonic
            var = {
                'type': 'harmonic',
                'name': f"{preset['name']} - Harmonic {harmonic}",
                'frequency': freq,
                'harmonic_number': harmonic,
                'description': f"{harmonic}th harmonic of base frequency ({freq:.2f} Hz)"
            }
            variations.append(var)
        
        # Sub-harmonic series
        for sub in [2, 3, 4, 5, 8]:
            freq = base_freq / sub
            var = {
                'type': 'subharmonic',
                'name': f"{preset['name']} - Sub-harmonic 1/{sub}",
                'frequency': freq,
                'divisor': sub,
                'description': f"1/{sub} sub-harmonic ({freq:.2f} Hz)"
            }
            variations.append(var)
        
        return variations
    
    def generate_scale_variations(self, preset: Dict, scale: str = 'major', root: float = 440.0) -> List[Dict]:
        """Generate variations following a musical scale"""
        variations = []
        
        if scale not in self.SCALES:
            print(f"⚠️  Unknown scale '{scale}', using major")
            scale = 'major'
        
        scale_intervals = self.SCALES[scale]
        
        for degree, semitones in enumerate(scale_intervals):
            freq = root * (2 ** (semitones / 12))
            var = {
                'type': 'scale',
                'name': f"{preset['name']} - {scale.replace('_', ' ').title()} Degree {degree + 1}",
                'frequency': freq,
                'scale': scale,
                'degree': degree + 1,
                'semitones': semitones,
                'description': f"Scale degree {degree + 1} in {scale} ({freq:.2f} Hz)"
            }
            variations.append(var)
        
        return variations
    
    def generate_waveform_morphing(self, preset: Dict, morph_path: str = 'bright_to_dark') -> List[Dict]:
        """Generate variations morphing through waveforms"""
        variations = []
        
        if morph_path not in self.WAVEFORM_MORPH_PATHS:
            morph_path = 'bright_to_dark'
        
        waveforms = self.WAVEFORM_MORPH_PATHS[morph_path]
        
        for idx, waveform in enumerate(waveforms):
            var = {
                'type': 'waveform_morph',
                'name': f"{preset['name']} - {waveform.title()} ({morph_path.replace('_', ' ').title()} #{idx + 1})",
                'waveform': waveform,
                'morph_path': morph_path,
                'step': idx + 1,
                'description': f"Morphing step {idx + 1}: {waveform} waveform"
            }
            variations.append(var)
        
        return variations
    
    def generate_filter_sweep_variations(self, preset: Dict, steps: int = 10) -> List[Dict]:
        """Generate filter cutoff sweep variations"""
        variations = []
        
        for i in range(steps):
            cutoff = 20 + (20000 - 20) * (i / (steps - 1))
            var = {
                'type': 'filter_sweep',
                'name': f"{preset['name']} - Filter Sweep Step {i + 1}/{steps}",
                'cutoff': cutoff,
                'step': i + 1,
                'total_steps': steps,
                'description': f"Filter cutoff at {cutoff:.0f} Hz ({(i/(steps-1)*100):.0f}% open)"
            }
            variations.append(var)
        
        return variations
    
    def generate_resonance_variations(self, preset: Dict) -> List[Dict]:
        """Generate variations with different resonance profiles"""
        variations = []
        
        for profile_name, (res_min, res_max) in self.RESONANCE_PROFILES.items():
            # Generate 3 steps within each profile
            for step in range(3):
                resonance = res_min + (res_max - res_min) * (step / 2)
                var = {
                    'type': 'resonance',
                    'name': f"{preset['name']} - {profile_name.title()} Resonance {step + 1}/3",
                    'resonance': resonance,
                    'profile': profile_name,
                    'description': f"{profile_name.title()} resonance: {resonance:.2f}"
                }
                variations.append(var)
        
        return variations
    
    def generate_envelope_variations(self, preset: Dict) -> List[Dict]:
        """Generate variations with different envelope profiles"""
        variations = []
        
        for profile_name, envelope in self.ENVELOPE_PROFILES.items():
            var = {
                'type': 'envelope',
                'name': f"{preset['name']} - {profile_name.title()} Envelope",
                'envelope': envelope,
                'profile': profile_name,
                'description': f"{profile_name.title()}: A={envelope['attack']}s D={envelope['decay']}s S={envelope['sustain']} R={envelope['release']}s"
            }
            variations.append(var)
        
        return variations
    
    def generate_lfo_variations(self, preset: Dict) -> List[Dict]:
        """Generate variations with different LFO patterns"""
        variations = []
        
        for pattern_name, lfo_params in self.LFO_PATTERNS.items():
            var = {
                'type': 'lfo',
                'name': f"{preset['name']} - {pattern_name.replace('_', ' ').title()} LFO",
                'lfo': lfo_params,
                'pattern': pattern_name,
                'description': f"{pattern_name.replace('_', ' ').title()}: Rate={lfo_params['rate']}Hz Depth={lfo_params['depth']} Wave={lfo_params['waveform']}"
            }
            variations.append(var)
        
        return variations
    
    def generate_detuned_variations(self, preset: Dict, steps: int = 7) -> List[Dict]:
        """Generate detuned variations for thickness/chorus"""
        variations = []
        
        # Detune range: -50 to +50 cents
        for i in range(steps):
            detune = -50 + (100 * (i / (steps - 1)))
            var = {
                'type': 'detune',
                'name': f"{preset['name']} - Detune {detune:+.1f} cents",
                'detune': detune,
                'description': f"VCO2 detuned by {detune:+.1f} cents {'(thickening)' if abs(detune) < 20 else '(chorus/dissonance)'}"
            }
            variations.append(var)
        
        return variations
    
    def generate_random_variations(self, preset: Dict, count: int = 10, seed: int = None) -> List[Dict]:
        """Generate random variations for experimentation"""
        if seed:
            random.seed(seed)
        
        variations = []
        
        for i in range(count):
            var = {
                'type': 'random',
                'name': f"{preset['name']} - Random Variation {i + 1}",
                'frequency': random.uniform(55, 880),
                'cutoff': random.uniform(100, 10000),
                'resonance': random.uniform(0, 1),
                'attack': random.uniform(0.001, 2),
                'decay': random.uniform(0.001, 2),
                'sustain': random.uniform(0, 1),
                'release': random.uniform(0.01, 5),
                'lfo_rate': random.uniform(0.1, 20),
                'lfo_depth': random.uniform(0, 1),
                'detune': random.uniform(-50, 50),
                'seed': seed,
                'description': f"Random variation {i + 1} (seed: {seed if seed else 'none'})"
            }
            variations.append(var)
        
        return variations
    
    def _get_base_frequency(self, preset: Dict) -> float:
        """Extract base frequency from preset"""
        modules = preset.get('modules', {})
        vco1 = modules.get('VCO1', {})
        params = vco1.get('parameters', {})
        return params.get('frequency', 440.0)
    
    def export_variations(self, variations: List[Dict], output_file: str):
        """Export variations to JSON file"""
        data = {
            'total_variations': len(variations),
            'variations': variations
        }
        
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Exported {len(variations)} variations to {output_file}")
    
    def print_variation_summary(self, variations: List[Dict]):
        """Print summary of generated variations"""
        print(f"\n{'=' * 100}")
        print(f"📊 VARIATION SUMMARY: {len(variations)} variations generated")
        print(f"{'=' * 100}\n")
        
        # Group by type
        by_type = {}
        for var in variations:
            var_type = var.get('type', 'unknown')
            if var_type not in by_type:
                by_type[var_type] = []
            by_type[var_type].append(var)
        
        for var_type, vars_list in sorted(by_type.items()):
            print(f"  {var_type.replace('_', ' ').title()}: {len(vars_list)} variations")
        
        print(f"\n{'=' * 100}\n")
    
    def batch_generate_all_variations(self, preset_name: str, output_dir: str = None) -> Dict[str, List[Dict]]:
        """Generate all types of variations for a preset"""
        preset = next((p for p in self.presets if p['name'] == preset_name), None)
        if not preset:
            print(f"❌ Preset '{preset_name}' not found!")
            return {}
        
        print(f"\n{'=' * 100}")
        print(f"🎹 GENERATING ALL VARIATIONS: {preset_name}")
        print(f"{'=' * 100}\n")
        
        all_variations = {}
        
        # Generate each type
        print("⏳ Generating frequency variations...")
        all_variations['frequency'] = self.generate_frequency_variations(preset)
        
        print("⏳ Generating harmonic variations...")
        all_variations['harmonic'] = self.generate_harmonic_variations(preset)
        
        print("⏳ Generating scale variations (Major)...")
        all_variations['scale_major'] = self.generate_scale_variations(preset, 'major')
        
        print("⏳ Generating scale variations (Minor)...")
        all_variations['scale_minor'] = self.generate_scale_variations(preset, 'minor')
        
        print("⏳ Generating scale variations (Pentatonic)...")
        all_variations['scale_pentatonic'] = self.generate_scale_variations(preset, 'pentatonic_minor')
        
        print("⏳ Generating waveform morphing...")
        all_variations['waveform'] = self.generate_waveform_morphing(preset)
        
        print("⏳ Generating filter sweep...")
        all_variations['filter'] = self.generate_filter_sweep_variations(preset, 20)
        
        print("⏳ Generating resonance variations...")
        all_variations['resonance'] = self.generate_resonance_variations(preset)
        
        print("⏳ Generating envelope variations...")
        all_variations['envelope'] = self.generate_envelope_variations(preset)
        
        print("⏳ Generating LFO variations...")
        all_variations['lfo'] = self.generate_lfo_variations(preset)
        
        print("⏳ Generating detune variations...")
        all_variations['detune'] = self.generate_detuned_variations(preset, 11)
        
        print("⏳ Generating random variations...")
        all_variations['random'] = self.generate_random_variations(preset, 20, seed=42)
        
        # Flatten all variations
        flat_variations = []
        for var_list in all_variations.values():
            flat_variations.extend(var_list)
        
        self.print_variation_summary(flat_variations)
        
        # Export if output directory specified
        if output_dir:
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            output_file = Path(output_dir) / f"{preset_name.replace(' ', '_').replace('-', '_').lower()}_variations.json"
            self.export_variations(flat_variations, str(output_file))
        
        return all_variations


def main():
    parser = argparse.ArgumentParser(description='Advanced Preset Variation Generator')
    parser.add_argument('preset_name', help='Name of the preset to generate variations for')
    parser.add_argument('--library', default='output/presets/preset_library.json', help='Path to preset library JSON')
    parser.add_argument('--output', '-o', help='Output directory for exported variations')
    parser.add_argument('--type', '-t', choices=['all', 'frequency', 'harmonic', 'scale', 'waveform', 'filter', 'envelope', 'lfo', 'detune', 'random'],
                        default='all', help='Type of variations to generate')
    parser.add_argument('--scale', default='major', help='Scale to use for scale variations')
    parser.add_argument('--count', type=int, default=10, help='Number of random variations to generate')
    parser.add_argument('--seed', type=int, help='Random seed for reproducible random variations')
    
    args = parser.parse_args()
    
    # Find preset library
    script_dir = Path(__file__).parent
    library_path = script_dir / args.library
    
    if not library_path.exists():
        print(f"❌ Preset library not found: {library_path}")
        sys.exit(1)
    
    generator = AdvancedPresetVariationGenerator(str(library_path))
    
    if args.type == 'all':
        generator.batch_generate_all_variations(args.preset_name, args.output)
    else:
        preset = next((p for p in generator.presets if p['name'] == args.preset_name), None)
        if not preset:
            print(f"❌ Preset '{args.preset_name}' not found!")
            sys.exit(1)
        
        variations = []
        if args.type == 'frequency':
            variations = generator.generate_frequency_variations(preset)
        elif args.type == 'harmonic':
            variations = generator.generate_harmonic_variations(preset)
        elif args.type == 'scale':
            variations = generator.generate_scale_variations(preset, args.scale)
        elif args.type == 'waveform':
            variations = generator.generate_waveform_morphing(preset)
        elif args.type == 'filter':
            variations = generator.generate_filter_sweep_variations(preset)
        elif args.type == 'envelope':
            variations = generator.generate_envelope_variations(preset)
        elif args.type == 'lfo':
            variations = generator.generate_lfo_variations(preset)
        elif args.type == 'detune':
            variations = generator.generate_detuned_variations(preset)
        elif args.type == 'random':
            variations = generator.generate_random_variations(preset, args.count, args.seed)
        
        generator.print_variation_summary(variations)
        
        if args.output:
            Path(args.output).mkdir(parents=True, exist_ok=True)
            output_file = Path(args.output) / f"{args.preset_name.replace(' ', '_')}_{args.type}_variations.json"
            generator.export_variations(variations, str(output_file))


if __name__ == '__main__':
    main()
