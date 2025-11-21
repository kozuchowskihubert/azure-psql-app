# Preset Patching Cheat Sheet

Quick reference for understanding preset patch cable mapping.

---

## 🎯 The 3-Second Summary

**Presets = Virtual Patch Cables**

```json
{
  "patch_cables": [/* ROUTING: where cables go */],
  "modules": {/* KNOBS: parameter values */},
  "modulators": {/* ENVELOPES/LFOs: modulation config */}
}
```

---

## 🔌 Cable Structure at a Glance

```json
{
  "source": {"module": "VCO1", "output": "SAW", "level": 1.0},
  "destination": {"module": "VCF", "output": "AUDIO_IN", "level": 1.0},
  "color": "red"
}
```

**Reads as:** "Connect VCO1's SAW output → VCF's AUDIO_IN input"

---

## 🎨 Color Code

| Color | Routing Type | Example |
|-------|-------------|---------|
| 🔴 Red | Audio signal | VCO → VCF → VCA |
| 🔵 Blue | Amplitude CV | ENV1 → VCA |
| 🟢 Green | Filter CV | ENV2 → VCF Cutoff |
| 🟡 Yellow | Pitch CV | LFO → VCO FM |
| 🟣 Purple | Special | Complex routing |

---

## 📊 Common Patterns

### Pattern A: Basic Synth (79 presets)
```
VCO1 ──[Red]──> VCF ──[Red]──> VCA ──> Output
        ENV2 ──[Green]──^      ^──[Blue]── ENV1
```

### Pattern B: Dual Oscillator (16 presets)
```
VCO1 ──┐
       ├──[Red]──> VCF ──[Red]──> VCA ──> Output
VCO2 ──┘
```

### Pattern C: Percussion (4 presets)
```
NOISE ──[Red]──> VCF ──[Red]──> VCA ──> Output
```

### Pattern D: Direct (1 preset)
```
VCO1 ──[Red]──> VCA ──> Output
```

---

## 🎛️ Module Parameters

```json
"VCF": {
  "parameters": {
    "cutoff": 0.2,     // 0-1 scale (20%)
    "resonance": 0.7,  // 0-1 scale (70%)
    "mode": "LP"       // LP/BP/HP
  }
}
```

**Translation:** Set VCF cutoff knob to 20%, resonance to 70%, mode to Low-Pass

---

## 📈 Envelope (ADSR)

```json
"ENV1": {
  "attack": 0.001,   // Seconds
  "decay": 0.15,     // Seconds
  "sustain": 0.6,    // Level (0-1)
  "release": 0.1     // Seconds
}
```

**What it does:**
```
Level
  ^
1 |    /\
  |   /  \___________
  |  /       (sustain)
0 | /                 \
  +---------------------> Time
  A  D     S        R
```

---

## 🌊 LFO

```json
"LFO1": {
  "rate": 0.5,         // Hz (2 sec cycle)
  "waveform": "sine",  // Shape
  "depth": 0.9         // Amount (0-1)
}
```

**Waveforms:** sine, square, triangle, sawtooth, ramp

---

## 🚀 Quick Commands

```bash
# Visualize preset routing
python3 visualize_patch.py "Acid Bass - 303 Style"

# Show all routing patterns
python3 visualize_patch.py --all

# Browse presets
python3 browse_presets.py -i

# Get preset via API
curl http://localhost:3000/api/music/presets/by-name/Acid%20Bass%20-%20303%20Style
```

---

## 🎹 Module Quick Reference

| Code | Full Name | Function |
|------|-----------|----------|
| VCO | Voltage Controlled Oscillator | Sound source |
| VCF | Voltage Controlled Filter | Tone shaping |
| VCA | Voltage Controlled Amplifier | Volume |
| ENV | Envelope Generator | Time-based modulation |
| LFO | Low Frequency Oscillator | Cyclic modulation |
| NOISE | Noise Generator | Random signal |

---

## 💡 Reading a Cable Entry

```json
{
  "source": {"module": "ENV2", "output": "OUT", "level": 0.9},
  "destination": {"module": "VCF", "output": "CUTOFF_CV", "level": 0.9},
  "color": "green"
}
```

**Plain English:**
"Take the output of Envelope 2, send 90% of it to the Filter's Cutoff CV input, using a green cable"

**Hardware:**
1. Find ENV2 OUTPUT jack
2. Find VCF CUTOFF CV jack
3. Connect with patch cable
4. Set ENV2 amount to 90%

---

## 📍 Field Name Note

⚠️ **Important:** The destination uses `"output"` as the field name, but it means **input jack**:

```json
"destination": {"module": "VCF", "output": "AUDIO_IN"}
                                  ^^^^^^^^ 
                                  This is an INPUT jack!
```

This is how the data is structured. When reading presets, remember:
- `destination.output` = the input jack on the destination module

---

## 🎯 Practical Example

**Preset:** Acid Bass - 303 Style

**JSON:**
```json
{
  "patch_cables": [
    {"source": {"module": "VCO1", "output": "SAW"}, 
     "destination": {"module": "VCF", "output": "AUDIO_IN"}, 
     "color": "red"}
  ],
  "modules": {
    "VCO1": {"parameters": {"frequency": 110.0}},
    "VCF": {"parameters": {"cutoff": 0.2, "resonance": 0.7}}
  },
  "modulators": {
    "ENV2": {"attack": 0.001, "decay": 0.25, "sustain": 0.3}
  }
}
```

**Physical Patching:**
1. Cable: VCO1 SAW OUT → VCF AUDIO IN (red)
2. Knobs: VCO1 freq = 110 Hz, VCF cutoff = 20%, resonance = 70%
3. Envelope: ENV2 attack = 1ms, decay = 250ms, sustain = 30%

**Sound:** Classic acid bassline with filter sweep! 🎵

---

## 📖 Full Documentation

- **[PRESET_PATCH_MAPPING.md](PRESET_PATCH_MAPPING.md)** - Complete technical guide
- **[WEB_ACCESS_GUIDE.md](WEB_ACCESS_GUIDE.md)** - API access
- **[PRESET_CATALOG_100.md](PRESET_CATALOG_100.md)** - All 100 presets

---

**Remember:** Presets are just instructions for patch cables and knobs! 🎛️
