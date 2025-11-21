# Behringer 2600 Semi-Modular Patch Matrix - Complete Signal Flow Diagram

## Full Patch Matrix Routing Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BEHRINGER 2600 PATCH MATRIX                              │
│                    86 Normaled Patch Points                                 │
└─────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                          VOLTAGE SOURCES (8 Outputs)                       ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   VCO 1 OUT     │────▶│   VCO 2 OUT     │────▶│   VCO 3/LFO OUT │
│  (Oscillator 1) │     │  (Oscillator 2) │     │  (Osc 3 or LFO) │
│   Sawtooth      │     │   Sawtooth      │     │   Triangle      │
│   Square        │     │   Square        │     │   Square        │
│   Triangle      │     │   Triangle      │     │   Sine          │
│   Sine          │     │   Sine          │     │   0.1Hz-50Hz    │
│   20Hz-20kHz    │     │   20Hz-20kHz    │     │   or Audio      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ENVELOPE OUT   │────▶│   KEYBOARD CV   │────▶│   GATE OUT      │
│   (ADSR/AR)     │     │  (1V/Octave)    │     │  (Trigger/Gate) │
│   0-5V          │     │   0-10V         │     │   0/+5V         │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼

┌─────────────────┐     ┌─────────────────┐
│  SAMPLE/HOLD    │────▶│   NOISE OUT     │
│  (S&H Output)   │     │  (White/Pink)   │
│  Stepped CV     │     │  Full Spectrum  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         ▼                       ▼

╔═══════════════════════════════════════════════════════════════════════════╗
║                      VOLTAGE DESTINATIONS (6 Inputs)                       ║
╚═══════════════════════════════════════════════════════════════════════════╝

         ┌──────────────────────────────────────────────────┐
         │                                                  │
         │         ┌────────────────────────┐               │
         └────────▶│   VCO 1 FREQUENCY CV   │◀──────────────┤
                   │  (1V/Oct or FM input)  │               │
                   └────────────────────────┘               │
                                                            │
         ┌──────────────────────────────────────────────────┤
         │         ┌────────────────────────┐               │
         └────────▶│   VCO 2 FREQUENCY CV   │◀──────────────┤
                   │  (1V/Oct or FM input)  │               │
                   └────────────────────────┘               │
                                                            │
         ┌──────────────────────────────────────────────────┤
         │         ┌────────────────────────┐               │
         └────────▶│   VCO 3/LFO FREQ CV    │◀──────────────┤
                   │  (Modulation control)  │               │
                   └────────────────────────┘               │
                                                            │
         ┌──────────────────────────────────────────────────┤
         │         ┌────────────────────────┐               │
         └────────▶│   FILTER CUTOFF CV     │◀──────────────┤
                   │  (24dB/oct Low-pass)   │               │
                   └────────────────────────┘               │
                                                            │
         ┌──────────────────────────────────────────────────┤
         │         ┌────────────────────────┐               │
         └────────▶│   FILTER RESONANCE CV  │◀──────────────┤
                   │  (Q / Emphasis)        │               │
                   └────────────────────────┘               │
                                                            │
         ┌──────────────────────────────────────────────────┘
         │         ┌────────────────────────┐
         └────────▶│   VCA LEVEL CV         │
                   │  (Amplitude control)   │
                   └────────────────────────┘
```

## Classic Patch Routing Examples

### 1. **CLASSIC BASS PATCH**
```
VCO 1 (Sawtooth)  ──┬──▶ Filter Cutoff CV
                    └──▶ VCA Level

Envelope (Fast)    ──┬──▶ Filter Cutoff CV (High Amount)
                     └──▶ VCA Level

Filter:  Cutoff: 40%, Resonance: 60%
Result:  Punchy, resonant bass
```

### 2. **SCREAMING LEAD**
```
VCO 1 (Sawtooth)   ────▶ VCA Level

VCO 2 (Square)     ────▶ VCO 1 Frequency CV (FM)

VCO 3/LFO (Slow)   ────▶ VCO 2 Frequency CV (Vibrato)

Envelope           ────▶ Filter Cutoff CV

Filter:  Cutoff: 30%, Resonance: 80% (Self-oscillation)
Result:  Screaming, modulated lead
```

### 3. **AMBIENT PAD**
```
VCO 1 (Sawtooth)   ──┬──▶ Filter Cutoff CV
VCO 2 (Square)     ──┤
VCO 3 (Triangle)   ──┴──▶ VCA Level

LFO (Sine, 0.3Hz)  ────▶ Filter Cutoff CV (Slow sweep)

Envelope (Slow)    ──┬──▶ Filter Cutoff CV
                     └──▶ VCA Level

Filter:  Cutoff: 50%, Resonance: 20%
Result:  Evolving, atmospheric pad
```

### 4. **SEQUENCED BASSLINE**
```
ARP Sequencer      ────▶ VCO 1 Frequency CV (Melody)

VCO 1 (Square)     ────▶ Filter Cutoff CV

VCO 3/LFO (Fast)   ────▶ Filter Cutoff CV (Wobble)

Gate               ────▶ Envelope Trigger

Envelope (Short)   ──┬──▶ Filter Cutoff CV
                     └──▶ VCA Level

Result:  Dubstep-style wobble bass
```

### 5. **FM BELLS**
```
VCO 2 (Sine)       ────▶ VCO 1 Frequency CV (High amount)

VCO 1 (Triangle)   ────▶ VCA Level

Envelope (Fast)    ──┬──▶ VCO 2 Frequency CV (FM depth)
                     └──▶ VCA Level

Filter:  Cutoff: 70%, Resonance: 10%
Result:  Bell-like, metallic tones
```

### 6. **RANDOM BLIPS**
```
Noise              ────▶ Sample & Hold Input

Sample & Hold      ────▶ VCO 1 Frequency CV (Random pitch)

VCO 1 (Square)     ────▶ VCA Level

LFO (Fast)         ────▶ S&H Clock (Random trigger)

Gate               ────▶ Envelope Trigger

Envelope (Short)   ────▶ VCA Level

Result:  R2D2-style random beeps
```

### 7. **FILTER SWEEP**
```
VCO 1 (Sawtooth)   ────▶ VCA Level

LFO (Triangle)     ────▶ Filter Cutoff CV (Auto-sweep)

Envelope           ────▶ Filter Resonance CV (Dynamic Q)

Filter:  Cutoff: 30%, Resonance: 70%
Result:  Classic filter sweep
```

### 8. **SELF-PATCHED CHAOS**
```
VCO 1              ────▶ VCO 2 Frequency CV
VCO 2              ────▶ VCO 3 Frequency CV
VCO 3              ────▶ VCO 1 Frequency CV (Feedback loop!)

Filter Output      ────▶ VCA Level

Result:  Chaotic, evolving textures
```

## Signal Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNAL PATH                                │
└─────────────────────────────────────────────────────────────────┘

  Keyboard ──┬──▶ Gate ────▶ Envelope Generator ──┬──▶ Filter CV
             │                                     └──▶ VCA CV
             └──▶ CV ──────▶ VCO 1 Frequency
                             VCO 2 Frequency
                             VCO 3 Frequency

  VCO 1 ──┐
  VCO 2 ──┼──▶ MIXER ──▶ FILTER ──┬──▶ VCA ──▶ OUTPUT
  VCO 3 ──┘                        │
  NOISE ──────────────────────────┘

  LFO ────┬──▶ VCO 1 Pitch (Vibrato)
          ├──▶ VCO 2 Pitch
          ├──▶ Filter Cutoff (Auto-wah)
          ├──▶ VCA Level (Tremolo)
          └──▶ Any CV Input

  S&H ────┬──▶ VCO Frequency (Random pitch)
          ├──▶ Filter Cutoff (Random sweep)
          └──▶ Any CV Input
```

## Patch Points Reference

### **8 VOLTAGE SOURCES (Outputs)**

| Source | Range | Description | Typical Use |
|--------|-------|-------------|-------------|
| **VCO 1 OUT** | -5V to +5V | Audio oscillator | Main voice, bass, lead |
| **VCO 2 OUT** | -5V to +5V | Audio oscillator | Harmony, FM modulator |
| **VCO 3/LFO OUT** | -5V to +5V | Osc/LFO switchable | Sub-bass or modulation |
| **ENVELOPE OUT** | 0V to +5V | ADSR/AR envelope | Filter/VCA modulation |
| **KEYBOARD CV** | 0V to +10V | 1V/octave pitch CV | Melodic control |
| **GATE OUT** | 0V / +5V | Trigger/gate signal | Envelope trigger |
| **S&H OUT** | 0V to +5V | Stepped random CV | Random modulation |
| **NOISE OUT** | -5V to +5V | White/pink noise | Percussion, texture |

### **6 VOLTAGE DESTINATIONS (Inputs)**

| Destination | Response | Description | Effect |
|-------------|----------|-------------|--------|
| **VCO 1 FREQ CV** | 1V/Oct | Pitch control | Melody, FM, vibrato |
| **VCO 2 FREQ CV** | 1V/Oct | Pitch control | Harmony, FM carrier |
| **VCO 3/LFO FREQ CV** | Linear | Speed control | LFO rate modulation |
| **FILTER CUTOFF CV** | Exponential | Frequency control | Brightness, wah |
| **FILTER RESONANCE CV** | Linear | Q control | Emphasis, self-osc |
| **VCA LEVEL CV** | Linear | Amplitude control | Tremolo, volume |

## Voltage Control Ranges

```
┌────────────────────────────────────────────────────────────┐
│  CV VOLTAGE RANGES                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  +10V ────────────────────── Max Keyboard CV              │
│                                                            │
│   +5V ────────────────────── Gate High, Max Envelope      │
│                                                            │
│    0V ────────────────────── Gate Low, Reference          │
│                                                            │
│   -5V ────────────────────── Audio/LFO Minimum            │
│                                                            │
└────────────────────────────────────────────────────────────┘

Pitch CV:        1V/Octave standard (C1=0V, C2=1V, etc.)
Modulation CV:   0-5V typical range
Audio Rate:      -5V to +5V bipolar
Gate/Trigger:    0V (off) to +5V (on)
```

## Patch Cable Color Coding (Traditional)

```
🔴 RED    - Audio Signals (VCO outputs, filter out)
🔵 BLUE   - Pitch CV (1V/octave, keyboard CV)
🟡 YELLOW - Gate/Trigger signals
🟢 GREEN  - Envelope outputs
🟣 PURPLE - LFO/Modulation sources
⚫ BLACK  - Ground/Return paths
```

## Advanced Patching Techniques

### **Cross-Modulation Matrix**

```
         VCO1   VCO2   VCO3   FILT   VCA
        ┌─────┬─────┬─────┬─────┬─────┐
VCO1    │  -  │ FM  │ Sync│ Aud │ Aud │
        ├─────┼─────┼─────┼─────┼─────┤
VCO2    │ FM  │  -  │ FM  │ Aud │ Aud │
        ├─────┼─────┼─────┼─────┼─────┤
VCO3    │ Vib │ Vib │  -  │ Mod │ Trem│
        ├─────┼─────┼─────┼─────┼─────┤
ENV     │ FM  │ FM  │ Rate│ Cut │ Lvl │
        ├─────┼─────┼─────┼─────┼─────┤
S&H     │Pitch│Pitch│Pitch│ Cut │ Lvl │
        └─────┴─────┴─────┴─────┴─────┘

Legend:
FM   = Frequency Modulation
Vib  = Vibrato
Sync = Hard Sync
Aud  = Audio Input
Mod  = Modulation
Trem = Tremolo
Cut  = Cutoff Modulation
Lvl  = Level Control
Rate = LFO Rate
```

## Normaled Connections (Default Internal Routing)

When **NO** cables are patched, the 2600 has these internal connections:

```
VCO 1 + VCO 2 + VCO 3 ──▶ Filter Input (Mixed)

Filter Output ──▶ VCA Audio Input

Keyboard CV ──▶ VCO 1, VCO 2, VCO 3 Frequency

Gate ──▶ Envelope Trigger

Envelope ──▶ Filter Cutoff CV
Envelope ──▶ VCA Level CV
```

**Inserting a cable breaks the normal!**

## Feedback Patching (Creative Chaos)

```
┌──────────────────────────────────────────┐
│  FEEDBACK LOOPS                          │
├──────────────────────────────────────────┤
│                                          │
│  VCA Out ──▶ Filter In ──▶ VCA In ⟲     │
│  (Audio feedback - controllable howl)    │
│                                          │
│  VCO1 ──▶ VCO2 ──▶ VCO1 ⟲               │
│  (Cross FM - complex harmonics)          │
│                                          │
│  Filt Out ──▶ Filt CV In ⟲              │
│  (Filter tracking - resonance boost)     │
│                                          │
│  Env Out ──▶ Env Rate CV ⟲              │
│  (Self-looping envelope)                 │
│                                          │
└──────────────────────────────────────────┘
```

## Quick Patch Templates

### **INSTANT PATCHES**

1. **Wobble Bass**: VCO3(LFO) → Filter Cutoff
2. **Vibrato**: VCO3(LFO) → VCO1 Freq
3. **Auto-Wah**: Envelope → Filter Cutoff
4. **FM Growl**: VCO2 → VCO1 Freq
5. **Tremolo**: VCO3(LFO) → VCA Level
6. **Random Notes**: S&H → VCO1 Freq
7. **Filter Sweep**: VCO3(LFO) → Filter Cutoff + Resonance

---

## Creative & Experimental Patching Ideas

### 🎨 **SOUNDSCAPE GENERATORS**

#### **1. Evolving Drone**
```
VCO 1 (Sawtooth, very low) ────▶ Filter Audio In
VCO 2 (Triangle, +5 semitones) ─┘

VCO 3/LFO (0.05Hz Sine) ────▶ VCO 1 Freq (slow drift)
                            └─▶ VCO 2 Freq (opposite polarity)

S&H (clocked by LFO) ───────▶ Filter Resonance CV (random Q)

Envelope (ADSR: slow) ──────▶ VCA Level

Result: Slow-moving, ever-changing drone perfect for ambient music
```

#### **2. Generative Sequencer**
```
Noise ──────────────────────▶ S&H Input
VCO 3/LFO (Square, 2Hz) ────▶ S&H Clock (rhythmic trigger)

S&H Out ────────────────────▶ VCO 1 Freq (random melody)
                           └─▶ Filter Cutoff CV (timbral variation)

VCO 1 (Pulse) ──────────────▶ VCA Audio In

Gate ───────────────────────▶ Envelope Trigger
Envelope (Short, percussive) ▶ VCA Level

Result: Self-generating random melodies that never repeat!
```

#### **3. Dual Texture Morph**
```
VCO 1 (Sawtooth) ──┬────────▶ Filter In
VCO 2 (Noise mod) ─┘

VCO 3/LFO (Triangle, 0.1Hz) ─┬──▶ VCO 1 Freq (slow sweep)
                              ├──▶ Filter Cutoff (brightness)
                              └──▶ Filter Resonance (character)

Envelope (Long release) ─────▶ VCA Level

Result: Morphing texture that evolves from dark to bright
```

### ⚡ **RHYTHMIC EXPERIMENTS**

#### **4. Polyrhythmic Chaos**
```
VCO 3/LFO (Square, 3.5Hz) ──▶ S&H Clock 1
                            └─▶ VCO 1 Freq CV (FM)

VCO 2 (Square, 4Hz) ────────▶ Filter Cutoff CV (different rhythm)

S&H (random stepped) ───────▶ VCO 1 Freq (melody)

Envelope (Snappy) ──────────▶ VCA Level

Result: Two independent rhythms creating complex patterns
```

#### **5. Gate-Controlled Stutter**
```
Gate Out ───────────────────▶ S&H Clock
                           └─▶ Envelope Trigger

VCO 1 + VCO 2 (Unison) ─────▶ Filter In

S&H (holding VCO 3/LFO) ────▶ Filter Cutoff (stepped filter)

Envelope (Variable decay) ──▶ VCA Level

Result: Rhythmic stuttering with changing timbre per note
```

### 🌀 **MODULATION MADNESS**

#### **6. Triple LFO Modulation**
```
VCO 3/LFO (Sine, 0.5Hz) ────▶ VCO 1 Freq (vibrato)

VCO 2 (Triangle, 1.2Hz) ────▶ Filter Cutoff (wah)
                            └─▶ VCO 1 PWM (pulse width)

Envelope ───────────────────▶ VCO 2 Freq (modulate the modulator!)

Result: Multi-layered modulation with constantly shifting character
```

#### **7. Frequency Cascade**
```
VCO 1 ──────────────────────▶ VCO 2 Freq CV (FM)
VCO 2 ──────────────────────▶ VCO 3 Freq CV (FM chain)
VCO 3 ──────────────────────▶ VCO 1 Freq CV (FM feedback loop!)

VCO 2 Audio ────────────────▶ Filter In

LFO ─────────────────────────▶ All VCO FM amounts (global chaos control)

Result: Complex, evolving FM tones with harmonic instability
```

### � **CINEMATIC & FX PATCHES**

#### **8. Sci-Fi Spaceship**
```
VCO 1 (Sawtooth, low) ──┬───▶ Filter In (rumble)
Noise (filtered) ───────┘

VCO 3/LFO (Random S&H) ─────▶ VCO 1 Freq (glitches)
                            └─▶ Filter Resonance (metallic pings)

VCO 2 (Sine, very low) ─────▶ Filter Cutoff (slow sweep)

Envelope (Long attack) ─────▶ VCA Level

Result: Spaceship engine hum with random glitches
```

#### **9. Thunder & Lightning**
```
Noise ──────────────────────▶ Filter In (broadband)

VCO 3/LFO (Random, slow) ───▶ Filter Cutoff (rumble)
                            └─▶ Filter Resonance (crack!)

S&H (fast clock) ───────────▶ VCA Level (lightning strikes)

Envelope (Instant attack, 
         long decay) ───────▶ VCA Level (thunder tail)

Result: Realistic storm effects
```

#### **10. Analog Glitch**
```
VCO 1 (Square, high) ───────▶ S&H Input
VCO 3/LFO (Fast, irregular) ▶ S&H Clock

S&H Out ────────────────────▶ VCO 2 Freq (digital artifacts)
                           └─▶ Filter Cutoff

VCO 2 (Pulse, thin) ────────▶ Filter In (digital character)

Gate (Irregular) ───────────▶ Envelope Trigger
Envelope (Very short) ──────▶ VCA Level

Result: Glitchy, digital-sounding effects from pure analog!
```

### 🔮 **PSYCHEDELIC & EXPERIMENTAL**

#### **11. Self-Playing Synthesizer**
```
Noise ──────────────────────▶ S&H Input (random source)

VCO 3/LFO (0.2Hz) ──────────▶ S&H Clock (slow changes)
                           └─▶ Filter Resonance (self-oscillation)

S&H Out 1 ──────────────────▶ VCO 1 Freq (melody)
S&H Out 2 ──────────────────▶ Envelope Rate (rhythm changes)
S&H Out 3 ──────────────────▶ Filter Cutoff (timbre)

Filter Out (self-oscillating) ▶ VCA In

Result: Completely generative, never-repeating sound sculpture
```

#### **12. Karplus-Strong Pluck Simulation**
```
Noise (short burst) ────────▶ Filter In

Gate ───────────────────────▶ Envelope Trigger
Envelope (Instant, fast) ───▶ Noise Gate (ping!)

Filter (High resonance, 
        tracking keyboard) ─▶ Audio Out (pitched resonance)

VCO 1 (very subtle) ────────▶ Filter Cutoff (harmonic support)

Result: Plucked string simulation (works best with high Q!)
```

#### **13. Ring Mod Simulation**
```
VCO 1 (Carrier, 440Hz) ─────▶ VCA Audio In

VCO 2 (Modulator, 50Hz) ────▶ VCA Level CV (bipolar!)

Filter (Resonant) ──────────▶ Tone shaping

Result: Ring modulator-style metallic/bell tones
Note: Use inverted CV for true bipolar effect
```

### 🎪 **PERFORMANCE PATCHES**

#### **14. Expressive Lead with Dynamic Vibrato**
```
VCO 1 + VCO 2 (Unison) ─────▶ Filter In

VCO 3/LFO (Sine, 5Hz) ──────▶ VCO 1 Freq (vibrato)

Envelope ───────────────────▶ LFO Amount (vibrato depth grows!)
                           └─▶ Filter Cutoff
                           └─▶ VCA Level

Result: Vibrato that increases with note sustain (like a real instrument)
```

#### **15. Touch-Sensitive Bass**
```
VCO 1 (Sawtooth) ───────────▶ Filter In

Keyboard CV (velocity) ─────▶ Filter Cutoff (harder = brighter)
                           └─▶ Envelope Amount (harder = snappier)

Envelope (Fast) ────────────▶ Filter Cutoff + VCA Level

Result: Dynamic bass that responds to playing intensity
```

### 🎼 **MUSICAL TECHNIQUES**

#### **16. Auto-Harmonizing Patch**
```
Keyboard CV ────────────────▶ VCO 1 Freq (melody)
                           └─▶ VCO 2 Freq (via voltage processor)
                           └─▶ VCO 3 Freq (5th or octave offset)

VCO 1 + VCO 2 + VCO 3 ──────▶ Filter In

Envelope ───────────────────▶ Filter Cutoff + VCA Level

Result: Instant three-note harmony chords!
```

#### **17. Barber-Pole Phaser**
```
VCO 1 (Sawtooth) ───────────▶ Direct to VCA

VCO 1 (copy) ───────────────▶ Through Filter ──▶ VCA (mixed)

VCO 3/LFO (Triangle) ───────▶ Filter Cutoff (slow sweep)

Filter (High Resonance) ────▶ Narrow notch filter

Result: Shepard tone-style infinite rising/falling effect
```

---

## 🧪 **Patching Tips for Exploration**

### **Start Points for Discovery:**

1. **Random Modulation**: Patch noise → S&H → anything
2. **Feedback Loops**: VCO → Filter → VCO (controlled chaos)
3. **Cross-Modulation**: Everything modulates everything
4. **Extreme Settings**: Max resonance, minimum attack, zero release
5. **Audio Rate Modulation**: Use VCO 3 in audio range for FM

### **Safe Experimentation Rules:**

✅ **DO:**
- Start with low modulation amounts and increase gradually
- Use envelope to control feedback loops
- Mix dry/wet signals for subtlety
- Save interesting patches immediately

⚠️ **AVOID:**
- Full volume into full resonance into feedback (protect your ears!)
- Multiple feedback loops without VCA control
- Sudden extreme parameter changes during live performance

---

**�🎛️ Remember**: The Behringer 2600 is semi-modular, so you can use it with NO cables (normaled routing) or create complex patches using all 86 patch points!

**🎹 Pro Tip**: Start simple, patch one cable at a time, and listen to how each connection affects the sound. The 2600 rewards experimentation!

**🔬 Advanced Tip**: The most interesting sounds often come from "wrong" patches - try connecting outputs to outputs (carefully!) or inputs to inputs for unexpected results!
