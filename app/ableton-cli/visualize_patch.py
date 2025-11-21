#!/usr/bin/env python3
"""
Visualize preset patch cables and routing
Shows exactly how the synthesizer is patched
"""

import json
import sys
from pathlib import Path

def visualize_preset(preset_name):
    """Visualize a preset's patch routing"""
    
    # Load preset library
    lib_path = Path(__file__).parent / "output/presets/preset_library.json"
    with open(lib_path) as f:
        data = json.load(f)
    
    # Find preset
    preset = None
    for p in data['presets']:
        if p['name'] == preset_name:
            preset = p
            break
    
    if not preset:
        print(f"❌ Preset '{preset_name}' not found!")
        return
    
    print("=" * 80)
    print(f"🎹 PRESET: {preset['name']}")
    print("=" * 80)
    print(f"\n📝 Description: {preset['description']}")
    print(f"📂 Category: {preset['category']}")
    print(f"🏷️  Tags: {', '.join(sorted(preset.get('tags', [])))}")
    if preset.get('bpm'):
        print(f"🎵 BPM: {preset['bpm']}")
    
    # Patch Cables - This is the key part!
    print("\n" + "=" * 80)
    print("📍 PATCH CABLE ROUTING (How the synthesizer is wired)")
    print("=" * 80)
    
    cables = preset.get('patch_cables', [])
    
    # Group cables by type
    audio_cables = []
    cv_cables = []
    
    for cable in cables:
        color = cable.get('color', 'white')
        if color == 'red':
            audio_cables.append(cable)
        else:
            cv_cables.append(cable)
    
    # Show audio signal path
    if audio_cables:
        print("\n🔴 AUDIO SIGNAL PATH:")
        print("-" * 80)
        for i, cable in enumerate(audio_cables, 1):
            src = cable['source']
            dst = cable['destination']
            level = src.get('level', 1.0)
            
            print(f"\n{i}. [{src['module']}] {src['output']} output")
            print(f"   ↓ (level: {level:.2f})")
            print(f"   → [{dst['module']}] {dst['output']} input")
            
            if cable.get('notes'):
                print(f"   💡 {cable['notes']}")
    
    # Show control voltage paths
    if cv_cables:
        print("\n⚡ CONTROL VOLTAGE (CV) PATHS:")
        print("-" * 80)
        
        color_names = {
            'blue': 'Amplitude Control',
            'green': 'Filter Control', 
            'yellow': 'Pitch/Frequency Control',
            'purple': 'Special Routing'
        }
        
        for i, cable in enumerate(cv_cables, 1):
            src = cable['source']
            dst = cable['destination']
            level = src.get('level', 1.0)
            color = cable.get('color', 'white')
            
            print(f"\n{i}. {color.upper()} cable - {color_names.get(color, 'Control')}")
            print(f"   [{src['module']}] {src['output']} output")
            print(f"   ↓ (amount: {level:.2f})")
            print(f"   → [{dst['module']}] {dst['output']} input")
            
            if cable.get('notes'):
                print(f"   💡 {cable['notes']}")
    
    # Module Settings
    print("\n" + "=" * 80)
    print("⚙️  MODULE PARAMETER SETTINGS")
    print("=" * 80)
    
    modules = preset.get('modules', {})
    for module_name, module_data in modules.items():
        print(f"\n📦 {module_name}:")
        params = module_data.get('parameters', {})
        for param, value in params.items():
            if isinstance(value, float):
                print(f"   {param:20} = {value:8.3f}")
            else:
                print(f"   {param:20} = {value}")
    
    # Modulators
    print("\n" + "=" * 80)
    print("🎚️  MODULATOR SETTINGS (Envelopes & LFOs)")
    print("=" * 80)
    
    modulators = preset.get('modulators', {})
    for mod_name, mod_data in modulators.items():
        mod_type = mod_data.get('module_type', 'Unknown')
        
        print(f"\n🎛️  {mod_name} ({mod_type}):")
        
        if mod_type == 'ENV':
            print(f"   Attack:  {mod_data.get('attack', 0):8.3f} s  (How fast note starts)")
            print(f"   Decay:   {mod_data.get('decay', 0):8.3f} s  (Fall time after attack)")
            print(f"   Sustain: {mod_data.get('sustain', 0):8.3f}    (Held level while key pressed)")
            print(f"   Release: {mod_data.get('release', 0):8.3f} s  (Fade out after key released)")
        
        elif mod_type == 'LFO':
            rate = mod_data.get('rate', 0.5)
            waveform = mod_data.get('waveform', 'sine')
            depth = mod_data.get('depth', 0.5)
            
            print(f"   Rate:     {rate:8.3f} Hz  (Speed of oscillation)")
            print(f"   Waveform: {waveform:>8}     (Shape of modulation)")
            print(f"   Depth:    {depth:8.3f}    (Amount of modulation)")
    
    # Signal flow diagram
    print("\n" + "=" * 80)
    print("🔄 SIGNAL FLOW DIAGRAM (Simplified)")
    print("=" * 80)
    
    print("\n")
    print("  ┌─────────┐")
    print("  │  VCO1   │  Oscillator (generates sound)")
    print("  │  (Tone) │")
    print("  └────┬────┘")
    print("       │ Audio (red cable)")
    print("       ↓")
    print("  ┌────────────┐")
    print("  │    VCF     │  Filter (shapes tone)")
    print("  │  (Filter)  │  ← ENV2 controls cutoff (green cable)")
    print("  └─────┬──────┘")
    print("        │ Audio (red cable)")
    print("        ↓")
    print("  ┌──────────┐")
    print("  │   VCA    │  Amplifier (controls volume)")
    print("  │ (Volume) │  ← ENV1 controls amplitude (blue cable)")
    print("  └─────┬────┘")
    print("        │")
    print("        ↓")
    print("    🔊 OUTPUT")
    print("\n")
    
    # Explain what this preset does
    print("=" * 80)
    print("💭 WHAT THIS PRESET DOES:")
    print("=" * 80)
    print(f"\n{preset['description']}\n")
    
    # Analyze the routing
    has_filter = any('VCF' in cable['destination']['module'] for cable in cables)
    has_lfo = any(mod['module_type'] == 'LFO' for mod in modulators.values())
    has_fm = any('FM' in cable['destination']['output'] for cable in cables)
    
    print("Synthesis techniques used:")
    if has_filter:
        print("  ✅ Subtractive synthesis (VCO → VCF → VCA)")
    if has_lfo:
        print("  ✅ LFO modulation (periodic modulation)")
    if has_fm:
        print("  ✅ Frequency modulation (FM synthesis)")
    
    resonance = 0
    if 'VCF' in modules:
        resonance = modules['VCF']['parameters'].get('resonance', 0)
    
    if resonance > 0.6:
        print(f"  ✅ High filter resonance ({resonance:.2f}) for character")
    
    print("\n")


def show_all_presets_routing():
    """Show routing summary for all presets"""
    lib_path = Path(__file__).parent / "output/presets/preset_library.json"
    with open(lib_path) as f:
        data = json.load(f)
    
    print("=" * 80)
    print("📊 PRESET ROUTING SUMMARY (All 100 Presets)")
    print("=" * 80)
    
    # Analyze routing patterns
    routing_patterns = {}
    
    for preset in data['presets']:
        cables = preset.get('patch_cables', [])
        
        # Create routing signature
        path = []
        for cable in cables:
            if cable.get('color') == 'red':  # Audio path
                src = cable['source']['module']
                dst = cable['destination']['module']
                path.append(f"{src}→{dst}")
        
        pattern = " → ".join(path) if path else "Direct"
        
        if pattern not in routing_patterns:
            routing_patterns[pattern] = []
        routing_patterns[pattern].append(preset['name'])
    
    print(f"\nFound {len(routing_patterns)} unique routing patterns:\n")
    
    for i, (pattern, presets) in enumerate(sorted(routing_patterns.items()), 1):
        print(f"{i}. {pattern}")
        print(f"   Used by {len(presets)} presets")
        print(f"   Examples: {', '.join(presets[:3])}")
        if len(presets) > 3:
            print(f"            ... and {len(presets)-3} more")
        print()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Visualize preset patch routing')
    parser.add_argument('preset_name', nargs='?', help='Name of preset to visualize')
    parser.add_argument('--all', action='store_true', help='Show routing summary for all presets')
    
    args = parser.parse_args()
    
    if args.all:
        show_all_presets_routing()
    elif args.preset_name:
        visualize_preset(args.preset_name)
    else:
        # Default: show an example
        print("Examples:")
        print("  python3 visualize_patch.py 'Acid Bass - 303 Style'")
        print("  python3 visualize_patch.py 'Wobble Bass - LFO Modulated'")
        print("  python3 visualize_patch.py --all")
        print("\nShowing example preset:\n")
        visualize_preset("Acid Bass - 303 Style")
