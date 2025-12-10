#!/usr/bin/env python3
"""
Test script to verify preset variation system works correctly
"""

import json
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.presets.library import PresetLibrary

def test_variations():
    """Test that variations are properly saved and loaded"""
    
    print("🧪 Testing Preset Variation System\n")
    
    # Load the preset library
    lib_path = Path(__file__).parent / "output/presets/preset_library.json"
    library = PresetLibrary(str(lib_path))
    
    print(f"✅ Loaded {len(library.presets)} presets\n")
    
    # Test Acid Bass variations
    acid_bass = library.get_preset("Acid Bass - 303 Style")
    
    if not acid_bass:
        print("❌ Acid Bass preset not found!")
        return False
    
    print(f"📊 Preset: {acid_bass.name}")
    print(f"   Base patch cables: {len(acid_bass.patch_cables)}")
    print(f"   Variations: {len(acid_bass.variations)}\n")
    
    if len(acid_bass.variations) != 3:
        print(f"❌ Expected 3 variations, found {len(acid_bass.variations)}")
        return False
    
    # Test each variation
    variation_names = ["Aggressive", "Modulated", "Classic"]
    
    for var_name in variation_names:
        variation = acid_bass.get_variation(var_name)
        
        if not variation:
            print(f"❌ Variation '{var_name}' not found!")
            return False
        
        print(f"✅ Variation: {variation.name}")
        print(f"   Description: {variation.description}")
        print(f"   Patch cables: {len(variation.patch_cables)}")
        print(f"   Modules: {len(variation.modules)}")
        print(f"   Modulators: {len(variation.modulators)}\n")
    
    # Test active variation switching
    print("🔄 Testing variation switching...")
    
    # Get base patch
    base_cables, base_modules, base_modulators = acid_bass.get_active_patch()
    print(f"   Base patch: {len(base_cables)} cables")
    
    # Switch to Aggressive
    if not acid_bass.set_active_variation("Aggressive"):
        print("❌ Failed to set active variation!")
        return False
    
    agg_cables, agg_modules, agg_modulators = acid_bass.get_active_patch()
    print(f"   Aggressive patch: {len(agg_cables)} cables")
    
    # Verify they're different
    if len(base_cables) == len(agg_cables):
        # Check if cable details are actually different
        base_cable_str = str([(c.source.module, c.destination.module) for c in base_cables])
        agg_cable_str = str([(c.source.module, c.destination.module) for c in agg_cables])
        
        if base_cable_str != agg_cable_str:
            print("✅ Variations have different patch configurations\n")
        else:
            print("⚠️  Warning: Variations have same cable count and routing\n")
    else:
        print("✅ Variations have different cable counts\n")
    
    # Test Sub Bass variations
    sub_bass = library.get_preset("Sub Bass - Deep 808")
    
    if sub_bass:
        print(f"📊 Preset: {sub_bass.name}")
        print(f"   Variations: {len(sub_bass.variations)}")
        
        for variation in sub_bass.variations:
            print(f"   - {variation.name}: {variation.description[:50]}...")
        print()
    
    # Test JSON serialization
    print("💾 Testing JSON serialization...")
    
    with open(lib_path, 'r') as f:
        data = json.load(f)
    
    # Find Acid Bass in JSON
    acid_bass_json = None
    for preset in data['presets']:
        if preset['name'] == 'Acid Bass - 303 Style':
            acid_bass_json = preset
            break
    
    if not acid_bass_json:
        print("❌ Acid Bass not found in JSON!")
        return False
    
    if 'variations' not in acid_bass_json:
        print("❌ Variations not saved to JSON!")
        return False
    
    print(f"✅ Found {len(acid_bass_json['variations'])} variations in JSON")
    print(f"   Active variation: {acid_bass_json.get('active_variation', 'None')}\n")
    
    # Summary
    print("=" * 60)
    print("✨ All tests passed!")
    print("=" * 60)
    print("\n📈 Summary:")
    print(f"   Total presets: {len(library.presets)}")
    
    variation_count = sum(len(p.variations) for p in library.presets.values())
    print(f"   Total variations: {variation_count}")
    
    presets_with_variations = sum(1 for p in library.presets.values() if p.variations)
    print(f"   Presets with variations: {presets_with_variations}")
    
    return True


if __name__ == "__main__":
    try:
        success = test_variations()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
