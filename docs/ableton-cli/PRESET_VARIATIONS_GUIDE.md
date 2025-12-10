# Preset Variation & Comparison Guide

## Overview

This guide demonstrates how to explore preset variations and compare different parameter mappings for frequencies, oscillators, filters, and modulation.

---

## 🎛️ Tools Available

### 1. Preset Variation Explorer
Shows all possible variations of a single preset with alternative parameter mappings.

```bash
python3 show_preset_variations.py "Preset Name"
```

### 2. Preset Comparison Tool
Compare multiple presets side-by-side to see parameter differences.

```bash
python3 compare_presets.py "Preset 1" "Preset 2" "Preset 3"
```

### 3. Patch Cable Visualizer
Shows exact cable routing and signal flow.

```bash
python3 visualize_patch.py "Preset Name"
```

---

## 🔄 Frequency Variations

### Musical Intervals

Every preset can be transposed using standard musical intervals:

| Interval | Multiply By | Example (A2 = 110 Hz) |
|----------|-------------|----------------------|
| **Octave Down** | ÷ 2 | 55 Hz (A1) |
| **Perfect Fifth Down** | ÷ 1.5 | 73.3 Hz (D2) |
| **Perfect Fourth Up** | × 1.33 | 146.3 Hz (D3) |
| **Perfect Fifth Up** | × 1.5 | 165 Hz (E3) |
| **Octave Up** | × 2 | 220 Hz (A3) |
| **Two Octaves Up** | × 4 | 440 Hz (A4) |

### Frequency Ranges & Use Cases

| Range | Frequencies | Best For |
|-------|-------------|----------|
| **Sub-Bass** | 20-65 Hz | Felt more than heard, club systems |
| **Deep Bass** | 65-130 Hz | Foundation, low end power |
| **Mid Bass** | 130-260 Hz | Power, punch |
| **Low Melody** | 260-520 Hz | Warm leads, bass melody |
| **Main Melody** | 520-1040 Hz | Primary melodic content |
| **High Melody** | 1040+ Hz | Bright leads, high textures |

---

## 🌊 Waveform Variations

### Waveform Characteristics

| Waveform | Harmonics | Character | Best Use Case |
|----------|-----------|-----------|---------------|
| **Sawtooth** | Rich, all harmonics | Bright, aggressive | Classic analog leads, cutting bass |
| **Square** | Odd harmonics | Hollow, woody | Retro sounds, organ-like pads |
| **Triangle** | Few harmonics | Warm, mellow | Smooth bass, flute-like leads |
| **Sine** | None (fundamental) | Pure, clean | Sub-bass, ethereal pads |

### Example Waveform Swaps

**For Bass Presets:**
- Sawtooth → Square: More hollow, video game style
- Sawtooth → Triangle: Warmer, smoother
- Sawtooth → Sine: Pure sub-bass focus

**For Lead Presets:**
- Square → Sawtooth: More aggressive
- Triangle → Sawtooth: Brighter, more present
- Sine → Any: Add harmonics/character

---

## 🎚️ Filter Variations

### Filter Cutoff Settings

| Setting | Cutoff Value | Hz Range | Character |
|---------|--------------|----------|-----------|
| **Dark & Mellow** | 0.15 | ~3000 Hz | Warm, subdued |
| **Classic Analog** | 0.30 | ~6000 Hz | Vintage synth |
| **Acid Squelch** | 0.25 | ~5000 Hz | Resonant (res: 0.85) |
| **Open & Bright** | 0.70 | ~14000 Hz | Clear, present |
| **Thin & Nasal** | 0.50 | ~10000 Hz | Focused (res: 0.9) |
| **Wide Open** | 0.95 | ~19000 Hz | Full spectrum |

### Resonance Impact

| Resonance | Effect |
|-----------|--------|
| **0.0 - 0.2** | Natural, transparent |
| **0.3 - 0.5** | Slight emphasis, character |
| **0.6 - 0.8** | Strong resonance, "acid" quality |
| **0.9 - 1.0** | Self-oscillation, extreme |

---

## ⚡ Envelope Variations

### Envelope Shapes

| Shape | A | D | S | R | Character | Use Case |
|-------|---|---|---|---|-----------|----------|
| **Pluck** | 0.001 | 0.05 | 0.0 | 0.01 | Short, percussive | Plucked bass, stabs |
| **Piano** | 0.01 | 0.3 | 0.3 | 0.2 | Natural decay | Realistic piano-like |
| **Organ** | 0.0 | 0.0 | 1.0 | 0.01 | Instant on/off | Hammond organ |
| **Pad** | 0.5 | 0.3 | 0.8 | 1.0 | Slow swell | Atmospheric textures |
| **Brass** | 0.2 | 0.1 | 0.9 | 0.3 | Slow attack | Brass instruments |
| **Gate** | 0.001 | 0.1 | 0.0 | 0.01 | Staccato | Gated synth, rhythmic |

### ADSR Parameter Guide

**Attack (A):**
- 0.001s: Instant (percussive)
- 0.01-0.1s: Fast (pluck, stab)
- 0.2-0.5s: Medium (brass, strings)
- 0.5-2.0s: Slow (pads, swells)

**Decay (D):**
- 0.05-0.1s: Quick (pluck)
- 0.2-0.5s: Natural (piano)
- 0.5-1.0s: Long (sustained)

**Sustain (S):**
- 0.0: No sustain (pluck, stab)
- 0.3-0.6: Partial sustain
- 0.8-1.0: Full sustain (organ, pad)

**Release (R):**
- 0.01s: Instant cutoff
- 0.1-0.3s: Natural (most sounds)
- 0.5-2.0s: Long tail (pads, reverb-like)

---

## 💡 Creative Variations

### Bass → Lead Conversion

```
Changes:
• Frequency: ×4 (two octaves up)
• Resonance: Reduce to 0.3
• Envelope: Shorten (A=0.01, R=0.1)
• Cutoff: Increase to 0.7

Result: Aggressive lead sound
```

### Lead → Bass Conversion

```
Changes:
• Frequency: ÷4 (two octaves down)
• Sustain: Increase to 0.8
• Resonance: Increase to 0.6
• Waveform: Switch to sawtooth

Result: Powerful bass
```

### Any → Pad Conversion

```
Changes:
• Attack: 0.5s (slow swell)
• Sustain: 0.9 (high sustain)
• Release: 1.0-2.0s (long tail)
• Add LFO to filter (slow, subtle)

Result: Atmospheric pad
```

### Any → Percussive Hit

```
Changes:
• Envelope: Very short (A=0.001, D=0.05, S=0, R=0.01)
• Resonance: High (0.9) for click
• Filter envelope: Fast sweep

Result: Percussive hit for drums
```

---

## 📊 Example Workflows

### Workflow 1: Explore Single Preset

```bash
# Show all variations of Acid Bass
python3 show_preset_variations.py "Acid Bass - 303 Style"

# This shows:
# - 6 frequency variations (octaves, intervals)
# - 3 waveform alternatives
# - 6 filter settings
# - 6 envelope shapes
# - 3 creative remix ideas
```

### Workflow 2: Compare Similar Presets

```bash
# Compare three bass presets
python3 compare_presets.py \
  "Acid Bass - 303 Style" \
  "Sub Bass - Deep 808" \
  "Wobble Bass - LFO Modulated"

# Shows side-by-side:
# - Oscillator settings
# - Filter parameters
# - Envelope values
# - Key differences highlighted
```

### Workflow 3: Understand Routing

```bash
# Visualize patch cables
python3 visualize_patch.py "Acid Bass - 303 Style"

# Shows:
# - Audio signal path (VCO → VCF → VCA)
# - CV routing (ENV → VCA, ENV → VCF)
# - Module parameters
# - Signal flow diagram
```

---

## 🎯 Quick Reference Tables

### Common Frequency Mappings

| Musical Context | Frequency Range | Example Presets |
|----------------|-----------------|-----------------|
| **Sub-Bass** | 32-65 Hz (C1-C2) | "Sub Bass - Deep 808" |
| **Bass** | 65-130 Hz (C2-C3) | "Acid Bass", "Reese Bass" |
| **Mid Bass** | 130-260 Hz (C3-C4) | Higher bass presets |
| **Lead** | 260-520 Hz (C4-C5) | "Arpeggio Lead", "Saw Lead" |
| **High Lead** | 520-1040 Hz (C5-C6) | Bright leads |

### Filter Frequency Bands

| Band | Cutoff Hz | Musical Content |
|------|-----------|-----------------|
| **Sub** | 20-150 | Deep bass |
| **Bass** | 150-400 | Bass fundamentals |
| **Low-Mid** | 400-800 | Low melody, warmth |
| **Mid** | 800-2000 | Main melody, presence |
| **High-Mid** | 2000-5000 | Clarity, definition |
| **High** | 5000-12000 | Brightness, air |
| **Air** | 12000-20000 | Sparkle, space |

---

## 🔧 Parameter Modification Examples

### Make Bass More Aggressive

```
• Waveform: Change to sawtooth
• Resonance: Increase to 0.7-0.8
• Attack: Decrease to 0.001s
• Cutoff: Increase slightly (0.3-0.4)
```

### Make Lead More Mellow

```
• Waveform: Change to triangle
• Resonance: Decrease to 0.2-0.3
• Attack: Increase to 0.05-0.1s
• Filter: Lower cutoff to 0.4-0.5
```

### Add Movement to Static Sound

```
• Add LFO to filter cutoff
• Rate: 0.3-0.5 Hz (slow)
• Depth: 0.4-0.6 (moderate)
• Waveform: Sine or triangle (smooth)
```

### Make Sound More Percussive

```
• Attack: 0.001s (instant)
• Decay: 0.05-0.1s (quick)
• Sustain: 0.0 (none)
• Release: 0.01s (instant)
```

---

## 📖 See Also

- **[PRESET_PATCH_MAPPING.md](PRESET_PATCH_MAPPING.md)** - Complete patching guide
- **[PRESET_PATCHING_CHEATSHEET.md](PRESET_PATCHING_CHEATSHEET.md)** - Quick reference
- **[WEB_ACCESS_GUIDE.md](WEB_ACCESS_GUIDE.md)** - API access to presets
- **[PRESET_CATALOG_100.md](PRESET_CATALOG_100.md)** - Full preset list

---

## 🎹 Interactive Exploration

Try these commands to explore:

```bash
# Explore bass variations
python3 show_preset_variations.py "Acid Bass - 303 Style"
python3 show_preset_variations.py "Sub Bass - Deep 808"
python3 show_preset_variations.py "Wobble Bass - LFO Modulated"

# Compare across categories
python3 compare_presets.py "Sub Bass - Deep 808" "Dark Pad - Atmospheric" "Saw Lead - Classic"

# Visualize routing
python3 visualize_patch.py "Reese Bass - Thick & Wide"
```

---

**Remember:** Every parameter change creates a new sonic possibility! 🎵
