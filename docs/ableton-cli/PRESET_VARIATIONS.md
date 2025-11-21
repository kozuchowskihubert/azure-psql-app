# Preset Variations System

## Overview

The Preset Variations system allows each preset to have multiple alternative patch configurations, enabling users to compare different approaches to patching the Behringer 2600 synthesizer for similar sounds.

## Architecture

### Data Model

#### PresetVariation Class
Located in `app/ableton-cli/src/presets/library.py`

```python
@dataclass
class PresetVariation:
    name: str                                      # Variation name (e.g., "Aggressive", "Classic")
    description: str = ""                          # What makes this variation unique
    patch_cables: List[PatchCable] = []           # Alternative cable routing
    modules: Dict[str, SynthModule] = {}          # Alternative module settings
    modulators: Dict[str, ModulatorSettings] = {} # Alternative modulator settings
    notes: str = ""                                # Additional notes
```

#### Extended Preset Class
The `Preset` class has been extended with:

```python
variations: List[PresetVariation] = []  # List of variations
active_variation: Optional[str] = None  # Currently active variation name

# Methods:
def add_variation(variation: PresetVariation)
def get_variation(name: str) -> Optional[PresetVariation]
def set_active_variation(name: str) -> bool
def get_active_patch() -> Tuple[List[PatchCable], Dict[str, SynthModule], Dict[str, ModulatorSettings]]
```

### Serialization

Variations are automatically serialized/deserialized in JSON:

```json
{
  "name": "Acid Bass - 303 Style",
  "variations": [
    {
      "name": "Aggressive",
      "description": "Shorter envelope decay with extreme resonance",
      "patch_cables": [...],
      "modules": {...},
      "modulators": {...}
    }
  ],
  "active_variation": null
}
```

## Factory Preset Variations

### Sub Bass - Deep 808

1. **Punchy** - Shorter envelope for punchy kick-style sub bass
   - Decay: 0.4s (vs 0.8s base)
   - Quick filter snap (0.1s decay)
   - Perfect for tight kick drums

2. **Deep** - Extended decay for deep sub rumble
   - Lower frequency: 50Hz (vs 55Hz base)
   - Very long decay: 1.5s
   - Perfect for long sub bass tails

### Acid Bass - 303 Style

1. **Aggressive** - Extreme resonance for acid stabs
   - Resonance: 0.85 (vs 0.7 base)
   - Shorter decay: 0.08s
   - Maximum envelope modulation
   - Perfect for aggressive sequences

2. **Modulated** - LFO wobble on filter
   - Adds LFO → Filter Cutoff patch
   - Slow triangle LFO (0.25 Hz)
   - Creates wobbling acid effect
   - Evolving sound texture

3. **Classic** - Minimal clean acid
   - Medium resonance: 0.6
   - No extreme settings
   - Traditional 303-style sound
   - Clean, reliable bass

## REST API Endpoints

### Get All Variations
```
GET /api/music/presets/:presetName/variations
```

Response:
```json
{
  "success": true,
  "preset_name": "Acid Bass - 303 Style",
  "active_variation": null,
  "variations": [...],
  "variation_count": 3
}
```

### Get Specific Variation
```
GET /api/music/presets/:presetName/variations/:variationName
```

Response:
```json
{
  "success": true,
  "preset_name": "Acid Bass - 303 Style",
  "variation": {
    "name": "Aggressive",
    "description": "...",
    "patch_cables": [...],
    "modules": {...},
    "modulators": {...}
  }
}
```

## Web UI

### Preset Browser Integration

The preset browser (`preset-browser.html`) now includes:

#### Variation Selector
- Displays variation buttons in preset details modal
- "Base Patch" button shows original configuration
- Named variation buttons for alternatives
- Active variation highlighted with gradient background

#### Dynamic Patch Display
- Cable list updates when switching variations
- Module settings reflect active variation
- Modulator settings update accordingly
- Cable count updates dynamically

#### CSS Styling
```css
.variation-selector     /* Button container */
.variation-btn          /* Individual variation buttons */
.variation-btn.active   /* Active variation highlight */
.variation-info         /* Variation description box */
```

### User Experience

1. **Browse Presets** - Normal preset browsing
2. **View Details** - Click "ℹ Details" button
3. **See Variations** - Variation buttons appear (if available)
4. **Switch Variations** - Click variation button
5. **Compare Patches** - Cable list updates instantly
6. **Return to Base** - Click "Base Patch" button

## Usage Examples

### Python - Adding Variations

```python
from src.presets.library import Preset, PresetVariation, PatchCable, PatchPoint

# Create preset
preset = Preset(name="My Bass", category=PresetCategory.BASS)

# Add base patch
preset.add_cable(
    PatchPoint("VCO1", "SAW", 1.0),
    PatchPoint("VCF", "AUDIO_IN", 1.0)
)

# Create variation
aggressive_var = PresetVariation(
    name="Aggressive",
    description="High resonance, short decay"
)
aggressive_var.patch_cables = [
    PatchCable(PatchPoint("VCO1", "SAW", 1.0), PatchPoint("VCF", "AUDIO_IN", 1.0)),
    PatchCable(PatchPoint("ENV2", "OUT", 1.0), PatchPoint("VCF", "CUTOFF_CV", 1.0))
]
aggressive_var.modules = {
    "VCF": SynthModule("VCF", {"cutoff": 0.15, "resonance": 0.85})
}

# Add to preset
preset.add_variation(aggressive_var)

# Set active variation
preset.set_active_variation("Aggressive")

# Get active patch configuration
cables, modules, modulators = preset.get_active_patch()
```

### JavaScript - Fetching Variations

```javascript
// Get all variations
const response = await fetch('/api/music/presets/Acid Bass - 303 Style/variations');
const data = await response.json();
console.log(`Found ${data.variation_count} variations`);

// Get specific variation
const varResponse = await fetch(
  '/api/music/presets/Acid Bass - 303 Style/variations/Aggressive'
);
const varData = await varResponse.json();
console.log(varData.variation.description);
```

## Benefits

### For Sound Designers
- **Multiple Approaches** - Show different ways to achieve similar sounds
- **Learning Tool** - Compare techniques side-by-side
- **Experimentation** - Easy A/B testing of patch ideas
- **Documentation** - Preserve alternative configurations

### For Users
- **Choice** - Pick the variation that fits their track
- **Learning** - Understand patching alternatives
- **Quick Access** - Switch instantly without manual repatching
- **Comparison** - See patch differences clearly

### For Development
- **Extensible** - Easy to add more variations
- **Organized** - All variations linked to parent preset
- **Serializable** - Full JSON persistence
- **API Ready** - REST endpoints for all operations

## File Changes

### Modified Files
1. `app/ableton-cli/src/presets/library.py`
   - Added `PresetVariation` dataclass
   - Extended `Preset` class with variation support
   - Added variation methods
   - Updated serialization

2. `app/ableton-cli/src/presets/factory_presets.py`
   - Added variations to Sub Bass preset (2 variations)
   - Added variations to Acid Bass preset (3 variations)
   - Updated import to include `PresetVariation`
   - Set `overwrite=True` for all presets

3. `app/routes/music-routes.js`
   - Added `GET /api/music/presets/:presetName/variations`
   - Added `GET /api/music/presets/:presetName/variations/:variationName`
   - Existing endpoints automatically return variations

4. `app/public/preset-browser.html`
   - Added variation selector UI
   - Added `selectVariation()` function
   - Dynamic patch display updates
   - CSS styling for variation buttons

## Testing

### Verify Variations Saved
```bash
cd app/ableton-cli
python3 -c "
import json
data = json.load(open('output/presets/preset_library.json'))
preset = [p for p in data['presets'] if p['name']=='Acid Bass - 303 Style'][0]
print(f'Variations: {len(preset.get(\"variations\", []))}')
for v in preset.get('variations', []):
    print(f'  - {v[\"name\"]}: {v[\"description\"][:50]}...')
"
```

### Test API Endpoints
```bash
# Initialize presets
curl -X POST http://localhost:3000/api/music/presets/init

# Get variations
curl http://localhost:3000/api/music/presets/Acid%20Bass%20-%20303%20Style/variations

# Get specific variation
curl http://localhost:3000/api/music/presets/Acid%20Bass%20-%20303%20Style/variations/Aggressive
```

### Test Web UI
1. Open http://localhost:3000/preset-browser.html
2. Click on "Acid Bass - 303 Style"
3. Click "ℹ Details" button
4. Verify variation buttons appear
5. Click each variation button
6. Verify cable list updates

## Future Enhancements

### Planned Features
- [ ] Visual patch diagram showing cable routing
- [ ] Side-by-side variation comparison
- [ ] Variation search/filter
- [ ] User-created variations
- [ ] Variation ratings/favorites
- [ ] Audio preview for each variation
- [ ] MIDI export per variation
- [ ] Variation diff view (show only changes)

### Additional Variations to Create
- [ ] Reese Bass variations (3)
- [ ] Arpeggio Lead variations (2-3)
- [ ] Dark Pad variations (2)
- [ ] Percussion variations (1-2 each)
- [ ] Effects variations (2-3)
- [ ] Modulation variations (2)

## Conclusion

The Preset Variations system provides a powerful way to explore multiple approaches to synthesizer patching. It preserves the learning value of showing alternative techniques while giving users quick access to different sonic flavors of the same basic preset concept.
