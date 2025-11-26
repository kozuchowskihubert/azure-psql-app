# 🔥 T78 Style Techno - Quick Reference

**Added:** November 26, 2025  
**Commit:** `697f9d8`  
**Feature:** T78-style hard driving techno presets

---

## 🎯 Overview

T78-style techno is characterized by:
- **High BPM:** 145-150 BPM (relentless energy)
- **Driving Kick:** Four on the floor, hard-hitting
- **Rolling Hi-Hats:** Constant movement, metallic character
- **Industrial Percussion:** Dense, rhythmic layers
- **Minimal Melody:** Focus on rhythm and drive
- **Peak Time Energy:** Built for main room moments

---

## 🎛️ Three T78 Presets

### 1. **T78 Rolling** (148 BPM)
**Best For:** Building energy, groovy sections

**Pattern:**
```
Kick:      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]  // Four on floor
Hi-Hat:    [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1]  // Rolling (signature)
Clap:      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1]  // Syncopated
Perc:      [0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0]  // Industrial
Bass:      [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]  // Driving
Synth:     [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // Sparse stabs
FX:        [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]  // Rhythmic
```

**Drum Sounds:**
- Kick: `hard` (180Hz bright attack)
- Hat: `metallic` (ring modulation)
- Clap: `tight` (50ms snap)
- Perc: `rim` (2kHz metallic click)

**Character:** Groovy and rolling, trademark T78 hi-hat pattern creates constant movement.

---

### 2. **T78 Peak Time** (150 BPM)
**Best For:** Peak time moments, maximum energy

**Pattern:**
```
Kick:      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]  // Relentless
Hi-Hat:    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  // Constant energy
Clap:      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // Classic
Perc:      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]  // Dense layer
Bass:      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]  // Aggressive roll
Synth:     [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]  // Stabs
FX:        [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // Impact
```

**Drum Sounds:**
- Kick: `hard` (180Hz bright attack)
- Hat: `bright` (12kHz shimmer)
- Clap: `tight` (50ms snap)
- Perc: `cowbell` (800Hz + harmonics)

**Character:** Maximum energy, all 16 hi-hat steps create wall of sound. Aggressive rolling bass.

---

### 3. **T78 Hypnotic** (146 BPM)
**Best For:** Hypnotic loops, deeper grooves

**Pattern:**
```
Kick:      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]  // Steady
Hi-Hat:    [0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0]  // Hypnotic loop
Clap:      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // Minimal
Perc:      [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]  // Repeating
Chord:     [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // Sustained
Bass:      [1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0]  // Groovy
Synth:     [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]  // Loop
FX:        [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]  // Sparse
```

**Drum Sounds:**
- Kick: `deep` (100Hz → 30Hz sweep)
- Hat: `metallic` (ring modulation)
- Clap: `classic` (triple hit @ 1.5kHz)
- Perc: `tom` (800Hz → 400Hz)

**Character:** Hypnotic and looping, repeating motifs create trance-like state.

---

## 🎨 Visual Design

**T78 Preset Buttons:**
- **Red/Magenta Gradients:** Distinctive coloring (different from standard cyan)
- **Fire/Energy Icons:** 🔥 💥 🌀
- **BPM Display:** Shows precise BPM for each preset
- **Border Glow:** Red/magenta borders (#ff0040, #ff006e, #9d00ff)

**Button Styling:**
```css
background: linear-gradient(135deg, #ff0040, #ff4070);
border: 2px solid #ff0040;
```

---

## ⚙️ Automatic Settings

### **BPM Auto-Configuration:**
```javascript
t78_rolling: 148 BPM
t78_peak: 150 BPM
t78_hypnotic: 146 BPM
```

### **Drum Variation Auto-Selection:**
```javascript
t78_rolling: {
    kick: 'hard',      // Bright 180Hz attack
    hat: 'metallic',   // Ring modulation
    clap: 'tight',     // 50ms snap
    perc: 'rim'        // 2kHz metallic
}

t78_peak: {
    kick: 'hard',      // Maximum impact
    hat: 'bright',     // 12kHz shimmer
    clap: 'tight',     // Tight snap
    perc: 'cowbell'    // 800Hz bell tone
}

t78_hypnotic: {
    kick: 'deep',      // Sub bass punch
    hat: 'metallic',   // Industrial character
    clap: 'classic',   // Standard trap clap
    perc: 'tom'        // Tonal percussion
}
```

---

## 🎹 Generator Integration

**Subgenre Dropdown:**
```
T78 Style (Hard, Driving, 145-150 BPM) ← NEW
Hard Techno (Fast, Aggressive)
Acid Techno (303 Style)
Minimal Techno (Hypnotic)
Industrial Techno (Dark)
Detroit Techno (Classic)
Dub Techno (Deep)
```

---

## 🎵 Pattern Design Philosophy

### **T78 Signature Elements:**

**1. Rolling Hi-Hats**
- Not just 16th notes on offbeats
- Grouped patterns: `[0,1,1,1]` creates movement
- Metallic/bright character essential

**2. Driving Kick**
- Always four on floor: `[1,0,0,0]` repeating
- Hard variation for impact (180Hz start)
- No fancy patterns - pure drive

**3. Industrial Percussion**
- Dense layers (`[0,1,0,1]` or `[0,0,1,0,1,0,1,0]`)
- Rim shots and cowbells preferred
- High-frequency metallic sounds

**4. Syncopated Claps**
- Not just on 2 and 4
- Occasional extra hits: `[0,0,0,1]` adds interest
- Tight/snappy character

**5. Rolling Bass**
- More active than standard techno
- Patterns like `[1,0,1,0]` or `[1,0,0,1,0,0,1,0]`
- Drives the groove forward

**6. Minimal Melody**
- Sparse synth stabs
- No lush chords (except Hypnotic)
- Rhythm is the focus

---

## 🎚️ Production Tips

### **Mixing T78 Style:**

**Kick:**
- Heavy low-end (100-150Hz)
- Bright click (2-5kHz)
- Compress hard for consistency

**Hi-Hats:**
- High-pass at 8kHz minimum
- Add saturation for metallic edge
- Keep volume high (T78 signature)

**Bass:**
- Mono below 100Hz
- Distortion/saturation for presence
- Side-chain to kick

**Claps/Snares:**
- Layer with reverb for width
- Tight, punchy transients
- Compress for impact

**Percussion:**
- High-frequency focus
- Panning for width
- Metallic character

---

## 🔊 Sound Selection

### **Key T78 Characteristics:**

**Drums:**
- Industrial, metallic
- Hard-hitting, no softness
- Bright transients

**Bass:**
- Distorted, aggressive
- Rolling patterns
- Sub-heavy

**Synths:**
- Stabs and one-shots
- Minimal sustained sounds
- High energy when used

**FX:**
- Rhythmic, not atmospheric
- Impact sounds
- Sparse usage

---

## 📊 Comparison Chart

| Feature | T78 Style | Hard Techno | Minimal | Industrial |
|---------|-----------|-------------|---------|------------|
| **BPM** | 145-150 | 140-150 | 128-132 | 135-145 |
| **Hi-Hat Density** | High | Medium | Low | High |
| **Bass Activity** | Rolling | Moderate | Sparse | Heavy |
| **Melody** | Minimal | Some | Very minimal | Dark |
| **Energy** | Peak | High | Low | Aggressive |
| **Kick Pattern** | 4/4 Always | 4/4 Mostly | Varied | Complex |

---

## 🎯 When to Use Each Preset

### **T78 Rolling (148 BPM)**
- ✅ Building sections
- ✅ Groove-focused moments
- ✅ Transitioning to peak
- ✅ DJ tool / extended mix
- ❌ Ambient sections
- ❌ Breakdowns

### **T78 Peak Time (150 BPM)**
- ✅ Main drop / climax
- ✅ Peak time sets
- ✅ Maximum energy moments
- ✅ Festival main stages
- ❌ Opening sets
- ❌ Chill-out rooms

### **T78 Hypnotic (146 BPM)**
- ✅ After-hours vibes
- ✅ Hypnotic loops
- ✅ Underground clubs
- ✅ Extended sets
- ❌ Quick mixing
- ❌ Commercial sets

---

## 🚀 Workflow Example

**Creating a T78-Style Track:**

1. **Start with T78 Rolling**
   - Load preset
   - BPM automatically set to 148
   - Drums configured (hard kick, metallic hat)

2. **Customize the Pattern**
   - Add/remove hi-hat steps for variation
   - Adjust bass groove
   - Add synth stabs on key moments

3. **Save Pattern Snapshot**
   - Click "💾 Save Current Pattern"
   - Name it "T78 Intro"

4. **Build Energy**
   - Load T78 Peak Time
   - BPM jumps to 150
   - Maximum energy configuration

5. **Create Breakdown**
   - Load T78 Hypnotic
   - BPM drops to 146
   - Hypnotic loops engage

6. **Arrange Timeline**
   - Use DAW tab
   - Place patterns in sequence
   - Export final arrangement

---

## 🔧 Technical Implementation

### **Code Structure:**

**Preset Definition:**
```javascript
t78_rolling: {
    kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    hat: [0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
    clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    // ... etc
}
```

**BPM Configuration:**
```javascript
const bpmSettings = {
    t78_rolling: 148,
    t78_peak: 150,
    t78_hypnotic: 146
};
```

**Drum Variation Mapping:**
```javascript
const drumVariationSettings = {
    t78_rolling: {
        kick: 'hard',
        hat: 'metallic',
        clap: 'tight',
        perc: 'rim'
    }
};
```

---

## 📚 References

**T78 Production Style:**
- Four on floor kicks (never broken)
- Rolling hi-hat patterns (signature)
- Industrial percussion layers
- High BPM (145-155 range)
- Minimal melodic content
- Maximum driving energy

**Famous T78 Characteristics:**
- Relentless energy
- Hypnotic loops
- Industrial sounds
- Peak time focus
- Hard-hitting drums

---

## 🎉 Summary

**T78 Style presets provide:**
- ✅ 3 authentic T78-inspired patterns
- ✅ Automatic BPM configuration (146-150)
- ✅ Automatic drum sound selection
- ✅ Rolling hi-hat patterns
- ✅ Driving basslines
- ✅ Industrial percussion
- ✅ Peak time energy
- ✅ Hypnotic loop variations

**Perfect for creating:**
- Hard driving techno
- Peak time anthems
- Industrial grooves
- Hypnotic loops
- Main room techno
- Festival-ready tracks

---

**Load a T78 preset, hit play, and feel the energy! 🔥**
