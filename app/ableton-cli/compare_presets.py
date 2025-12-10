#!/usr/bin/env python3
"""
Compare multiple presets side-by-side showing parameter differences
"""

import json
import sys
from pathlib import Path
from typing import List, Dict


def compare_presets(preset_names: List[str], library_path: str):
    """Compare multiple presets side-by-side"""
    
    with open(library_path) as f:
        data = json.load(f)
    
    presets = []
    for name in preset_names:
        preset = next((p for p in data['presets'] if p['name'] == name), None)
        if preset:
            presets.append(preset)
        else:
            print(f"⚠️  Preset '{name}' not found!")
    
    if len(presets) < 2:
        print("❌ Need at least 2 presets to compare")
        return
    
    print("=" * 120)
    print(f"🔍 PRESET COMPARISON: {len(presets)} presets")
    print("=" * 120)
    
    # Header
    print(f"\n{'Parameter':<30}", end='')
    for preset in presets:
        print(f"{preset['name'][:25]:^25}", end='')
    print()
    print("-" * 120)
    
    # Basic info
    print(f"\n{'BASIC INFO':<30}")
    print(f"{'Category':<30}", end='')
    for preset in presets:
        print(f"{preset['category']:^25}", end='')
    print()
    
    print(f"{'Tags':<30}", end='')
    for preset in presets:
        tags = ', '.join(preset.get('tags', [])[:3])
        print(f"{tags[:23]:^25}", end='')
    print()
    
    # VCO1 comparison
    print(f"\n{'VCO1 (OSCILLATOR 1)':<30}")
    print(f"{'Frequency (Hz)':<30}", end='')
    for preset in presets:
        freq = preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('frequency', 'N/A')
        print(f"{str(freq):^25}", end='')
    print()
    
    print(f"{'Waveform':<30}", end='')
    for preset in presets:
        wave = preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('waveform', 'N/A')
        print(f"{str(wave):^25}", end='')
    print()
    
    # VCO2 comparison (if present)
    has_vco2 = any('VCO2' in p.get('modules', {}) for p in presets)
    if has_vco2:
        print(f"\n{'VCO2 (OSCILLATOR 2)':<30}")
        print(f"{'Frequency (Hz)':<30}", end='')
        for preset in presets:
            freq = preset.get('modules', {}).get('VCO2', {}).get('parameters', {}).get('frequency', '-')
            print(f"{str(freq):^25}", end='')
        print()
        
        print(f"{'Waveform':<30}", end='')
        for preset in presets:
            wave = preset.get('modules', {}).get('VCO2', {}).get('parameters', {}).get('waveform', '-')
            print(f"{str(wave):^25}", end='')
        print()
    
    # Filter comparison
    print(f"\n{'VCF (FILTER)':<30}")
    print(f"{'Cutoff (0-1)':<30}", end='')
    for preset in presets:
        cutoff = preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('cutoff', 'N/A')
        if isinstance(cutoff, float):
            print(f"{cutoff:^25.2f}", end='')
        else:
            print(f"{str(cutoff):^25}", end='')
    print()
    
    print(f"{'Resonance (0-1)':<30}", end='')
    for preset in presets:
        res = preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('resonance', 'N/A')
        if isinstance(res, float):
            print(f"{res:^25.2f}", end='')
        else:
            print(f"{str(res):^25}", end='')
    print()
    
    print(f"{'Mode':<30}", end='')
    for preset in presets:
        mode = preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('mode', 'N/A')
        print(f"{str(mode):^25}", end='')
    print()
    
    # Envelope comparison
    print(f"\n{'ENV1 (AMPLITUDE ENVELOPE)':<30}")
    for param in ['attack', 'decay', 'sustain', 'release']:
        print(f"{param.capitalize() + ' (s)':<30}", end='')
        for preset in presets:
            val = preset.get('modulators', {}).get('ENV1', {}).get(param, 'N/A')
            if isinstance(val, (int, float)):
                print(f"{val:^25.3f}", end='')
            else:
                print(f"{str(val):^25}", end='')
        print()
    
    # LFO comparison (if present)
    has_lfo = any('LFO1' in p.get('modulators', {}) for p in presets)
    if has_lfo:
        print(f"\n{'LFO1 (MODULATOR)':<30}")
        print(f"{'Rate (Hz)':<30}", end='')
        for preset in presets:
            rate = preset.get('modulators', {}).get('LFO1', {}).get('rate', '-')
            if isinstance(rate, (int, float)):
                print(f"{rate:^25.2f}", end='')
            else:
                print(f"{str(rate):^25}", end='')
        print()
        
        print(f"{'Waveform':<30}", end='')
        for preset in presets:
            wave = preset.get('modulators', {}).get('LFO1', {}).get('waveform', '-')
            print(f"{str(wave):^25}", end='')
        print()
        
        print(f"{'Depth':<30}", end='')
        for preset in presets:
            depth = preset.get('modulators', {}).get('LFO1', {}).get('depth', '-')
            if isinstance(depth, (int, float)):
                print(f"{depth:^25.2f}", end='')
            else:
                print(f"{str(depth):^25}", end='')
        print()
    
    # Patch cables comparison
    print(f"\n{'ROUTING (Cable Count)':<30}")
    print(f"{'Total Cables':<30}", end='')
    for preset in presets:
        count = len(preset.get('patch_cables', []))
        print(f"{count:^25}", end='')
    print()
    
    print(f"{'Audio Cables (Red)':<30}", end='')
    for preset in presets:
        count = len([c for c in preset.get('patch_cables', []) if c.get('color') == 'red'])
        print(f"{count:^25}", end='')
    print()
    
    print(f"{'CV Cables':<30}", end='')
    for preset in presets:
        count = len([c for c in preset.get('patch_cables', []) if c.get('color') != 'red'])
        print(f"{count:^25}", end='')
    print()
    
    # Key differences summary
    print("\n" + "=" * 120)
    print("🎯 KEY DIFFERENCES")
    print("=" * 120)
    
    base_preset = presets[0]
    for i, preset in enumerate(presets[1:], 1):
        print(f"\n{preset['name']} vs {base_preset['name']}:")
        
        diffs = []
        
        # Check frequency difference
        base_freq = base_preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('frequency', 0)
        freq = preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('frequency', 0)
        if base_freq and freq and abs(base_freq - freq) > 1:
            ratio = freq / base_freq
            if ratio > 1.9 and ratio < 2.1:
                diffs.append(f"  • Frequency: 1 octave higher ({freq:.1f} Hz vs {base_freq:.1f} Hz)")
            elif ratio > 0.45 and ratio < 0.55:
                diffs.append(f"  • Frequency: 1 octave lower ({freq:.1f} Hz vs {base_freq:.1f} Hz)")
            else:
                diffs.append(f"  • Frequency: {freq:.1f} Hz vs {base_freq:.1f} Hz ({ratio:.2f}x)")
        
        # Check waveform difference
        base_wave = base_preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('waveform')
        wave = preset.get('modules', {}).get('VCO1', {}).get('parameters', {}).get('waveform')
        if wave and base_wave and wave != base_wave:
            diffs.append(f"  • Waveform: {wave} vs {base_wave}")
        
        # Check filter cutoff difference
        base_cutoff = base_preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('cutoff', 0)
        cutoff = preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('cutoff', 0)
        if base_cutoff and cutoff and abs(base_cutoff - cutoff) > 0.1:
            diff_pct = ((cutoff - base_cutoff) / base_cutoff) * 100
            diffs.append(f"  • Filter Cutoff: {cutoff:.2f} vs {base_cutoff:.2f} ({diff_pct:+.0f}%)")
        
        # Check resonance difference
        base_res = base_preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('resonance', 0)
        res = preset.get('modules', {}).get('VCF', {}).get('parameters', {}).get('resonance', 0)
        if abs(res - base_res) > 0.1:
            diffs.append(f"  • Resonance: {res:.2f} vs {base_res:.2f}")
        
        # Check envelope attack difference
        base_attack = base_preset.get('modulators', {}).get('ENV1', {}).get('attack', 0)
        attack = preset.get('modulators', {}).get('ENV1', {}).get('attack', 0)
        if abs(attack - base_attack) > 0.05:
            diffs.append(f"  • Attack: {attack:.3f}s vs {base_attack:.3f}s")
        
        # Check if LFO present
        has_base_lfo = 'LFO1' in base_preset.get('modulators', {})
        has_lfo_here = 'LFO1' in preset.get('modulators', {})
        if has_lfo_here and not has_base_lfo:
            diffs.append(f"  • Has LFO modulation (base doesn't)")
        elif not has_lfo_here and has_base_lfo:
            diffs.append(f"  • No LFO modulation (base has it)")
        
        if diffs:
            for diff in diffs:
                print(diff)
        else:
            print("  • Very similar configuration")
    
    print("\n")


def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print("Usage: python3 compare_presets.py <preset1> <preset2> [preset3] ...")
        print("\nExample:")
        print("  python3 compare_presets.py 'Acid Bass - 303 Style' 'Sub Bass - Deep 808' 'Wobble Bass - LFO Modulated'")
        return 1
    
    preset_names = sys.argv[1:]
    lib_path = Path(__file__).parent / 'output/presets/preset_library.json'
    
    if not lib_path.exists():
        print(f"❌ Preset library not found: {lib_path}")
        return 1
    
    compare_presets(preset_names, str(lib_path))
    return 0


if __name__ == '__main__':
    sys.exit(main())
