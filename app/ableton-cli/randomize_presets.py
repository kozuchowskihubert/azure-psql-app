#!/usr/bin/env python3
"""
Randomized Preset Generator for Behringer 2600
Creates experimental presets with creative patch cable routings
"""

import json
import random
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class RandomPatchGenerator:
    """Generate creative and experimental patch cable routings"""
    
    # Available modules and their outputs
    MODULES = {
        'VCO1': ['SINE', 'TRIANGLE', 'SAW', 'SQUARE', 'PULSE'],
        'VCO2': ['SINE', 'TRIANGLE', 'SAW', 'SQUARE', 'PULSE'],
        'VCO3': ['SINE', 'TRIANGLE', 'SAW', 'SQUARE'],
        'VCF': ['LP', 'BP', 'HP', 'AUDIO_IN', 'CUTOFF_CV'],
        'VCA': ['AUDIO_IN', 'CV'],
        'ENV1': ['OUT'],
        'ENV2': ['OUT'],
        'LFO1': ['SINE', 'TRIANGLE', 'SAW', 'SQUARE'],
        'LFO2': ['SINE', 'TRIANGLE', 'SAW', 'SQUARE'],
        'NOISE': ['WHITE', 'PINK'],
        'RINGMOD': ['OUT'],
        'SAMPLE_HOLD': ['OUT']
    }
    
    # Patch cable colors
    COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'white', 'black']
    
    # Common routing patterns for different sound types
    ROUTING_PATTERNS = {
        'classic': [
            ('VCO1', 'SAW', 'VCF', 'AUDIO_IN'),
            ('VCF', 'LP', 'VCA', 'AUDIO_IN'),
            ('ENV1', 'OUT', 'VCA', 'CV'),
            ('ENV2', 'OUT', 'VCF', 'CUTOFF_CV')
        ],
        'dual_osc': [
            ('VCO1', 'SAW', 'VCF', 'AUDIO_IN'),
            ('VCO2', 'SQUARE', 'VCF', 'AUDIO_IN'),
            ('VCF', 'LP', 'VCA', 'AUDIO_IN'),
            ('ENV1', 'OUT', 'VCA', 'CV')
        ],
        'fm_style': [
            ('VCO1', 'SINE', 'VCO2', 'FM_IN'),
            ('VCO2', 'SAW', 'VCF', 'AUDIO_IN'),
            ('VCF', 'LP', 'VCA', 'AUDIO_IN'),
            ('ENV1', 'OUT', 'VCA', 'CV')
        ],
        'ring_mod': [
            ('VCO1', 'SINE', 'RINGMOD', 'X'),
            ('VCO2', 'SAW', 'RINGMOD', 'Y'),
            ('RINGMOD', 'OUT', 'VCF', 'AUDIO_IN'),
            ('VCF', 'LP', 'VCA', 'AUDIO_IN')
        ],
        'experimental': [
            ('LFO1', 'TRIANGLE', 'VCO1', 'FM_IN'),
            ('VCO1', 'SQUARE', 'SAMPLE_HOLD', 'IN'),
            ('SAMPLE_HOLD', 'OUT', 'VCF', 'CUTOFF_CV'),
            ('NOISE', 'WHITE', 'VCF', 'AUDIO_IN')
        ]
    }
    
    def generate_random_patch(self, complexity: str = 'medium') -> List[Dict]:
        """
        Generate random patch cable configuration
        
        Args:
            complexity: 'simple' (3-5 cables), 'medium' (5-8 cables), 'complex' (8-15 cables)
        """
        num_cables = {
            'simple': random.randint(3, 5),
            'medium': random.randint(5, 8),
            'complex': random.randint(8, 15)
        }.get(complexity, 5)
        
        patch_cables = []
        used_destinations = set()
        
        for _ in range(num_cables):
            # Select random source module and output
            source_module = random.choice(list(self.MODULES.keys()))
            source_output = random.choice(self.MODULES[source_module])
            
            # Select random destination (avoid duplicates for realism)
            dest_module = random.choice([m for m in self.MODULES.keys() if m != source_module])
            dest_input = random.choice(['AUDIO_IN', 'CV', 'FM_IN', 'CUTOFF_CV'])
            
            # Skip if this destination is already used (unless complex)
            dest_key = f"{dest_module}:{dest_input}"
            if complexity != 'complex' and dest_key in used_destinations:
                continue
            used_destinations.add(dest_key)
            
            cable = {
                'source': {
                    'module': source_module,
                    'output': source_output,
                    'level': round(random.uniform(0.3, 1.0), 2)
                },
                'destination': {
                    'module': dest_module,
                    'output': dest_input,
                    'level': round(random.uniform(0.3, 1.0), 2)
                },
                'color': random.choice(self.COLORS),
                'notes': ''
            }
            patch_cables.append(cable)
        
        return patch_cables
    
    def generate_pattern_based_patch(self, pattern_type: str) -> List[Dict]:
        """Generate patch based on a predefined routing pattern"""
        pattern = self.ROUTING_PATTERNS.get(pattern_type, self.ROUTING_PATTERNS['classic'])
        
        patch_cables = []
        for source_mod, source_out, dest_mod, dest_in in pattern:
            cable = {
                'source': {
                    'module': source_mod,
                    'output': source_out,
                    'level': round(random.uniform(0.7, 1.0), 2)
                },
                'destination': {
                    'module': dest_mod,
                    'output': dest_in,
                    'level': round(random.uniform(0.7, 1.0), 2)
                },
                'color': random.choice(self.COLORS),
                'notes': ''
            }
            patch_cables.append(cable)
        
        return patch_cables


class ExpandedPresetLibrary:
    """Generate expanded preset library with randomized patches"""
    
    def __init__(self):
        self.patch_gen = RandomPatchGenerator()
        self.presets = []
    
    def _random_vcf_params(self) -> Dict:
        """Generate random filter parameters"""
        return {
            'cutoff': round(random.uniform(0.1, 0.9), 2),
            'resonance': round(random.uniform(0.0, 0.8), 2),
            'mode': random.choice(['LP', 'BP', 'HP'])
        }
    
    def _random_env_params(self, profile: str = None) -> Dict:
        """Generate random envelope parameters"""
        profiles = {
            'pluck': (0.001, 0.05, 0.0, 0.01, 0.001, 0.1, 0.0, 0.05),
            'pad': (0.3, 1.0, 0.7, 1.0, 0.5, 2.0, 0.8, 0.9),
            'bass': (0.001, 0.1, 0.3, 1.0, 0.1, 0.5, 0.0, 0.5),
            'lead': (0.01, 0.1, 0.5, 1.0, 0.1, 0.5, 0.3, 0.8),
        }
        
        if profile and profile in profiles:
            a_min, a_max, d_min, d_max, s_min, s_max, r_min, r_max = profiles[profile]
        else:
            a_min, a_max = 0.001, 1.0
            d_min, d_max = 0.01, 2.0
            s_min, s_max = 0.0, 1.0
            r_min, r_max = 0.01, 3.0
        
        return {
            'module_type': 'ENV',
            'rate': 0.5,
            'depth': 0.5,
            'attack': round(random.uniform(a_min, a_max), 3),
            'decay': round(random.uniform(d_min, d_max), 3),
            'sustain': round(random.uniform(s_min, s_max), 2),
            'release': round(random.uniform(r_min, r_max), 3)
        }
    
    def generate_preset(self, name: str, category: str, description: str, 
                       tags: List[str], pattern_type: str = None, 
                       complexity: str = 'medium') -> Dict:
        """Generate a single preset with randomized parameters"""
        
        # Generate patch cables
        if pattern_type:
            patch_cables = self.patch_gen.generate_pattern_based_patch(pattern_type)
        else:
            patch_cables = self.patch_gen.generate_random_patch(complexity)
        
        # Determine envelope profile from category
        env_profile = {
            'bass': 'bass',
            'lead': 'lead',
            'pad': 'pad',
            'percussion': 'pluck'
        }.get(category, None)
        
        preset = {
            'name': name,
            'category': category,
            'description': description,
            'tags': tags,
            'patch_cables': patch_cables,
            'modules': {
                'VCO1': {
                    'module_name': 'VCO1',
                    'parameters': {
                        'frequency': round(random.uniform(55.0, 880.0), 1),
                        'waveform': random.choice(['sine', 'triangle', 'saw', 'square'])
                    }
                },
                'VCF': {
                    'module_name': 'VCF',
                    'parameters': self._random_vcf_params()
                }
            },
            'modulators': {
                'ENV1': self._random_env_params(env_profile),
                'ENV2': self._random_env_params()
            },
            'variations': [],
            'active_variation': None,
            'author': 'Randomized Preset Generator',
            'created_at': datetime.now().isoformat(),
            'modified_at': datetime.now().isoformat(),
            'version': '1.0',
            'notes': '',
            'bpm': 128,
            'key': None
        }
        
        return preset
    
    def generate_library(self, num_presets: int = 100) -> Dict:
        """Generate complete preset library"""
        
        # Define preset categories and their characteristics
        preset_specs = [
            # Bass presets (40 total)
            *[('bass', 'classic', 'simple') for _ in range(10)],
            *[('bass', 'dual_osc', 'medium') for _ in range(10)],
            *[('bass', 'fm_style', 'medium') for _ in range(10)],
            *[('bass', None, 'complex') for _ in range(10)],
            
            # Lead presets (30 total)
            *[('lead', 'classic', 'simple') for _ in range(10)],
            *[('lead', 'dual_osc', 'medium') for _ in range(10)],
            *[('lead', None, 'complex') for _ in range(10)],
            
            # Pad presets (30 total)
            *[('pad', 'dual_osc', 'medium') for _ in range(15)],
            *[('pad', None, 'complex') for _ in range(15)],
            
            # Effects (30 total)
            *[('effects', 'ring_mod', 'medium') for _ in range(10)],
            *[('effects', 'experimental', 'complex') for _ in range(20)],
            
            # Percussion (30 total)
            *[('percussion', 'classic', 'simple') for _ in range(15)],
            *[('percussion', None, 'medium') for _ in range(15)],
            
            # Sequences (20 total)
            *[('sequence', 'experimental', 'complex') for _ in range(20)],
            
            # Modulation (20 total)
            *[('modulation', None, 'complex') for _ in range(20)]
        ]
        
        presets = []
        for i, (category, pattern, complexity) in enumerate(preset_specs[:num_presets]):
            name = f"{category.capitalize()} - Random {i+1:03d}"
            description = f"Randomly generated {category} preset with {complexity} patch routing"
            tags = [category, 'random', complexity, pattern or 'experimental']
            
            preset = self.generate_preset(name, category, description, tags, pattern, complexity)
            presets.append(preset)
        
        return {
            'version': '2.0',
            'updated_at': datetime.now().isoformat(),
            'preset_count': len(presets),
            'presets': presets
        }


def main():
    """Generate expanded preset library with randomized patches"""
    output_dir = Path(__file__).parent / 'output' / 'presets'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate 200 presets
    print("🎛️  Generating expanded preset library with randomized patches...")
    generator = ExpandedPresetLibrary()
    library = generator.generate_library(num_presets=200)
    
    # Save to file
    output_file = output_dir / 'preset_library_expanded.json'
    with open(output_file, 'w') as f:
        json.dump(library, f, indent=2)
    
    print(f"✅ Generated {library['preset_count']} presets")
    print(f"📁 Saved to: {output_file}")
    
    # Print statistics
    categories = {}
    for preset in library['presets']:
        cat = preset['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n📊 Preset Distribution:")
    for cat, count in sorted(categories.items()):
        print(f"   {cat:12s}: {count:3d} presets")
    
    print(f"\n🎹 Total: {library['preset_count']} presets with creative patch routing!")


if __name__ == '__main__':
    main()
