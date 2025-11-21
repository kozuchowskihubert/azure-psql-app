# Preset Patch Cable Mapping Guide

## Understanding How Presets Map to Physical Patch Cables

This guide explains **exactly** how the JSON preset data translates to actual synthesizer patch cable routing on the Behringer 2600.

---

## 📊 Data Structure Overview

Each preset contains three key sections:

```json
{
  "name": "Acid Bass - 303 Style",
  "patch_cables": [ /* Physical cable routing */ ],
  "modules": { /* Knob/parameter settings */ },
  "modulators": { /* Envelope & LFO configuration */ }
}
```

---

## 🔌 Patch Cables: The Physical Routing

### Cable Structure

```json
{
  "source": {
    "module": "VCO1",      // Source module
    "output": "SAW",        // Output jack name
    "level": 1.0           // Signal strength (0.0-1.0)
  },
  "destination": {
    "module": "VCF",        // Destination module
    "output": "AUDIO_IN",   // Input jack name (field called "output")
    "level": 1.0           // Amount at destination
  },
  "color": "red",          // Cable color (for visualization)
  "notes": ""              // Optional patch notes
}
```

### ⚠️ Important Note
The destination uses the field name `"output"` but it represents the **input jack** on the destination module. This is the actual data structure.

### Cable Color Coding

| Color | Purpose | Examples |
|-------|---------|----------|
| **🔴 Red** | Audio signal path | VCO → VCF → VCA |
| **🔵 Blue** | Amplitude control | ENV → VCA CV |
| **🟢 Green** | Filter control | ENV → VCF Cutoff CV |
| **🟡 Yellow** | Pitch/frequency | LFO → VCO FM |
| **🟣 Purple** | Special routing | Complex modulation |

---

## 🎛️ Example 1: Acid Bass Patch

### JSON Data
```json
{
  "name": "Acid Bass - 303 Style",
  "patch_cables": [
    {
      "source": {"module": "VCO1", "output": "SAW", "level": 1.0},
      "destination": {"module": "VCF", "output": "AUDIO_IN", "level": 1.0},
      "color": "red"
    },
    {
      "source": {"module": "VCF", "output": "LP", "level": 1.0},
      "destination": {"module": "VCA", "output": "AUDIO_IN", "level": 1.0},
      "color": "red"
    },
    {
      "source": {"module": "ENV1", "output": "OUT", "level": 1.0},
      "destination": {"module": "VCA", "output": "CV", "level": 1.0},
      "color": "blue"
    },
    {
      "source": {"module": "ENV2", "output": "OUT", "level": 0.9},
      "destination": {"module": "VCF", "output": "CUTOFF_CV", "level": 0.9},
      "color": "green"
    }
  ]
}
```

### Physical Patching Translation

On the **Behringer 2600 hardware**, you would:

1. **🔴 Red Cable #1** (Audio)
   - Plug into: `VCO1 SAW OUTPUT` jack
   - Connect to: `VCF AUDIO IN` jack
   - Level: 100%

2. **🔴 Red Cable #2** (Audio)
   - Plug into: `VCF LP OUTPUT` jack
   - Connect to: `VCA AUDIO IN` jack
   - Level: 100%

3. **🔵 Blue Cable** (Amplitude Control)
   - Plug into: `ENV1 OUTPUT` jack
   - Connect to: `VCA CV INPUT` jack
   - Amount: 100%

4. **🟢 Green Cable** (Filter Control)
   - Plug into: `ENV2 OUTPUT` jack
   - Connect to: `VCF CUTOFF CV` jack
   - Amount: 90%

### Signal Flow Diagram

```
VCO1 (Oscillator)
  │ SAW output
  │ (Red cable #1)
  ↓
VCF (Filter) ←──────── ENV2 (Green cable)
  │ LP output           Controls filter cutoff
  │ (Red cable #2)
  ↓
VCA (Amplifier) ←────── ENV1 (Blue cable)
  │                     Controls volume
  ↓
OUTPUT 🔊
```

---

## 🎚️ Module Settings

The `modules` section defines **knob positions** and **parameter values**:

```json
{
  "VCO1": {
    "parameters": {
      "frequency": 110.0,    // 110 Hz (A2 note)
      "waveform": "sawtooth" // Sawtooth wave selected
    }
  },
  "VCF": {
    "parameters": {
      "cutoff": 0.2,         // 20% (closed filter)
      "resonance": 0.7,      // 70% (high resonance for "acid" sound)
      "mode": "LP"           // Low-pass mode
    }
  }
}
```

### Hardware Mapping

| JSON Parameter | Hardware Control | Value |
|----------------|------------------|-------|
| `VCO1.frequency: 110.0` | VCO1 Frequency knob | Set to 110 Hz |
| `VCO1.waveform: "sawtooth"` | VCO1 Waveform selector | SAW position |
| `VCF.cutoff: 0.2` | VCF Cutoff knob | 20% clockwise |
| `VCF.resonance: 0.7` | VCF Resonance knob | 70% clockwise |
| `VCF.mode: "LP"` | VCF Mode switch | LP (Low-Pass) |

---

## 📈 Modulator Configuration

The `modulators` section configures **envelopes** (ENV) and **LFOs**:

### Envelope Example (ENV1)

```json
{
  "ENV1": {
    "module_type": "ENV",
    "attack": 0.001,   // 1ms - instant attack
    "decay": 0.15,     // 150ms - quick decay
    "sustain": 0.6,    // 60% - moderate sustain level
    "release": 0.1     // 100ms - quick release
  }
}
```

**Hardware Controls:**
- ENV1 Attack knob → 1ms (fully counter-clockwise)
- ENV1 Decay knob → 150ms
- ENV1 Sustain knob → 60%
- ENV1 Release knob → 100ms

**What it does:**
- Note starts instantly (1ms attack)
- Drops to 60% level in 150ms (decay)
- Stays at 60% while key held (sustain)
- Fades to zero in 100ms when key released (release)

### LFO Example (LFO1)

```json
{
  "LFO1": {
    "module_type": "LFO",
    "rate": 0.5,         // 0.5 Hz (2 seconds per cycle)
    "waveform": "square", // Square wave
    "depth": 0.9         // 90% modulation depth
  }
}
```

**Hardware Controls:**
- LFO1 Rate knob → 0.5 Hz
- LFO1 Waveform selector → Square
- LFO1 Depth knob → 90%

---

## 🎼 Common Routing Patterns

### Pattern 1: Basic Subtractive Synthesis (79 presets)
**VCO → VCF → VCA**

```
Audio Path:  VCO1.output → VCF.input → VCA.input → Output
Control:     ENV1 → VCA (volume envelope)
             ENV2 → VCF (filter envelope)
```

**Used in:** Most bass, lead, and pad sounds

### Pattern 2: Dual Oscillator (16 presets)
**VCO1 + VCO2 → VCF → VCA**

```
Audio:  VCO1.output → VCF.input
        VCO2.output → VCF.input (mixed)
        VCF.output → VCA.input → Output
```

**Used in:** Thick bass (Reese), rich pads, detuned leads

### Pattern 3: Noise-Based Percussion (4 presets)
**NOISE → VCF → VCA**

```
Audio:  NOISE.output → VCF.input → VCA.input → Output
Control: ENV (short decay) → VCA
         ENV (filter sweep) → VCF
```

**Used in:** Hi-hats, cymbals, percussion

### Pattern 4: Direct/Minimal (1 preset)
**VCO → VCA** (no filter)

```
Audio:  VCO1.output → VCA.input → Output
```

**Used in:** Pure sine bass (no filtering needed)

---

## 🔧 Using Presets on Hardware

### Method 1: Manual Patching

1. **Load the preset JSON**
   ```bash
   python3 visualize_patch.py "Acid Bass - 303 Style"
   ```

2. **Follow the cable routing** shown in the output

3. **Set module parameters** according to the `modules` section

4. **Configure modulators** (ENV/LFO) as specified

### Method 2: API Access

```javascript
// Fetch preset from server
fetch('/api/music/presets/by-name/Acid%20Bass%20-%20303%20Style')
  .then(r => r.json())
  .then(preset => {
    // Access routing
    console.log(preset.patch_cables);
    
    // Access module settings
    console.log(preset.modules);
    
    // Access modulator config
    console.log(preset.modulators);
  });
```

### Method 3: CLI Browser

```bash
# Show detailed preset view
python3 browse_presets.py --show "Acid Bass - 303 Style"

# Export to JSON
python3 browse_presets.py --export bass > my_bass_patches.json
```

---

## 📐 Technical Details

### Level/Amount Parameters

All `level` values are normalized **0.0 to 1.0**:

| Value | Percentage | Meaning |
|-------|-----------|----------|
| 0.0 | 0% | No signal |
| 0.5 | 50% | Half strength |
| 1.0 | 100% | Full strength |

### Module Names

Standard module identifiers:

| JSON ID | Hardware Module | Function |
|---------|----------------|----------|
| `VCO1` | Voltage Controlled Oscillator 1 | Primary tone generator |
| `VCO2` | Voltage Controlled Oscillator 2 | Secondary oscillator |
| `VCF` | Voltage Controlled Filter | Tone shaping |
| `VCA` | Voltage Controlled Amplifier | Volume control |
| `NOISE` | Noise Generator | White/pink noise source |
| `ENV1` | Envelope Generator 1 | Primary envelope |
| `ENV2` | Envelope Generator 2 | Secondary envelope |
| `LFO1` | Low Frequency Oscillator 1 | Modulation source |

### Jack Names

Common input/output jacks:

| JSON Name | Physical Jack | Type |
|-----------|---------------|------|
| `SAW` | Sawtooth output | Audio |
| `SQR` | Square output | Audio |
| `TRI` | Triangle output | Audio |
| `AUDIO_IN` | Audio input | Audio |
| `LP` | Low-pass output | Audio |
| `BP` | Band-pass output | Audio |
| `HP` | High-pass output | Audio |
| `CV` | Control voltage input | CV |
| `CUTOFF_CV` | Filter cutoff CV | CV |
| `FM` | Frequency modulation | CV |
| `OUT` | Envelope/LFO output | CV |

---

## 🎯 Quick Reference

### Reading a Preset

```python
import json

# Load preset
with open('preset_library.json') as f:
    data = json.load(f)
    preset = data['presets'][0]  # First preset

# Get audio path
audio_cables = [c for c in preset['patch_cables'] if c['color'] == 'red']

# Get CV routing
cv_cables = [c for c in preset['patch_cables'] if c['color'] != 'red']

# Get VCF settings
vcf = preset['modules'].get('VCF', {})
cutoff = vcf['parameters'].get('cutoff', 0.5)
resonance = vcf['parameters'].get('resonance', 0.0)

# Get envelope
env1 = preset['modulators'].get('ENV1', {})
attack = env1.get('attack', 0.001)
release = env1.get('release', 0.1)
```

---

## 📚 Related Documentation

- **[WEB_ACCESS_GUIDE.md](WEB_ACCESS_GUIDE.md)** - API and web browser access
- **[PRESET_CATALOG_100.md](PRESET_CATALOG_100.md)** - Full preset catalog
- **[HOW-TO-USE.md](HOW-TO-USE.md)** - Using the Ableton CLI tools

---

## 🎹 Example Presets by Complexity

### Simple (Direct routing)
- **Sine Bass - Pure Sub**: VCO → VCA (no filter)

### Medium (Standard synthesis)
- **Acid Bass - 303 Style**: VCO → VCF → VCA + ENV modulation
- **Classic Lead - Bright**: VCO → VCF → VCA + filter envelope

### Complex (Multiple modulators)
- **Wobble Bass**: VCO → VCF → VCA + LFO → VCF + ENV
- **Reese Bass**: VCO1 + VCO2 → VCF → VCA + dual envelopes

---

## 🔍 Analysis Tools

### Visualize Any Preset
```bash
python3 visualize_patch.py "Preset Name"
```

### Show All Routing Patterns
```bash
python3 visualize_patch.py --all
```

### Browse Interactively
```bash
python3 browse_presets.py -i
```

---

## Summary

The preset JSON structure maps **directly** to hardware patching:

1. **`patch_cables`** → Physical cable connections (with color coding)
2. **`modules`** → Knob positions and switch settings
3. **`modulators`** → Envelope/LFO configuration

This allows presets to be:
- ✅ **Recreated** on physical hardware exactly
- ✅ **Understood** at a technical level
- ✅ **Modified** by editing JSON parameters
- ✅ **Analyzed** programmatically
- ✅ **Exported** to different formats

The system provides complete **patch recall** for the Behringer 2600 synthesizer! 🎹
