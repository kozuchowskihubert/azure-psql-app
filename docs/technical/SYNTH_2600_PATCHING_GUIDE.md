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

**🎛️ Remember**: The Behringer 2600 is semi-modular, so you can use it with NO cables (normaled routing) or create complex patches using all 86 patch points!

**🎹 Pro Tip**: Start simple, patch one cable at a time, and listen to how each connection affects the sound. The 2600 rewards experimentation!
