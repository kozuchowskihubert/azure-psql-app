# ⚡ Techno Creator - Synthesis Modules

**Professional Synthesis Architecture for Techno, Acid, Industrial & Electronic Music**

---

## 📋 Module Overview

This document organizes Techno Creator's synthesis capabilities into **modular device groups** that interconnect like a professional studio setup.

```
┌─────────────────────────────────────────────────────────────┐
│                  TECHNO CREATOR CORE                        │
├─────────────────────────────────────────────────────────────┤
│  [Acid Bass] → [Drum Synths] → [Lead/Pad] → [FX]          │
│       ↓             ↓              ↓           ↓            │
│  [TB-303 Emu] ← [Sequencer] → [Arpeggiator] → [Filter]    │
│       ↓             ↓              ↓           ↓            │
│  [Master FX] ← [Automation] → [Pattern Grid] → [Export]   │
└─────────────────────────────────────────────────────────────┘
```

### Device Groups

| Module | Components | Purpose | Link |
|--------|------------|---------|------|
| **[Acid Bass](#1-acid-bass-tb-303-emulation)** | TB-303 emulation, resonance | Signature acid sound | Authentic synthesis |
| **[Drum Synthesizers](#2-drum-synthesizer-modules)** | Kick, Snare, Hi-Hat, Clap | Four-on-floor rhythm | Percussion engines |
| **[Lead Synthesizers](#3-lead-synthesizers)** | Saw Lead, Square Lead, PWM | Melodic elements | Lead sounds |
| **[Pad Synthesizers](#4-pad-synthesizers)** | Ambient Pad, Supersaw Pad | Atmospheric layers | Texture/atmosphere |
| **[Effects Devices](#5-effects-processing)** | Reverb, Delay, Phaser, Flanger | Sound shaping | Modulation FX |
| **[Sequencer Core](#6-sequencer-patterns)** | 16-step grid, 16 patterns | Beat programming | Pattern system |
| **[Modulation](#7-modulation-sources)** | LFO, Envelope, Automation | Movement/dynamics | Modulation routing |

---

## 1. Acid Bass (TB-303 Emulation)

### 1.1 TB-303 Synthesis Architecture

**Signal Flow**: `VCO → VCF → VCA → Output` (Classic analog path)

```
┌──────────────────────────────────────────────────────────┐
│                TB-303 ACID BASS MODULE                   │
├──────────────────────────────────────────────────────────┤
│  VCO (Voltage Controlled Oscillator)                     │
│  ├─ Waveform: Sawtooth (bright, harmonics)              │
│  ├─ Frequency: 40-400 Hz (bass range)                   │
│  ├─ Pulse Width: Variable (for square wave)             │
│  └─ Glide: Portamento 0-500ms (legato slides)           │
│                                                          │
│  VCF (Voltage Controlled Filter) ⭐ KEY COMPONENT        │
│  ├─ Type: 24dB/octave Low-Pass (4-pole ladder)          │
│  ├─ Cutoff: 50-8000 Hz (tone control)                   │
│  ├─ Resonance: 0-100% (self-oscillation at 100%)        │
│  ├─ Envelope Amount: -100 to +100% (filter sweep)       │
│  └─ Keyboard Tracking: Follows note pitch               │
│                                                          │
│  Filter Envelope (Dedicated to VCF)                      │
│  ├─ Attack: 0-50ms                                       │
│  ├─ Decay: 50-2000ms (controls sweep speed)             │
│  └─ Modulation Depth: Controls filter movement          │
│                                                          │
│  VCA (Voltage Controlled Amplifier)                      │
│  ├─ Envelope: AD (Attack-Decay, no sustain)             │
│  ├─ Attack: 0-20ms                                       │
│  ├─ Decay: 100-2000ms                                   │
│  └─ Accent: +6dB boost on accented notes                │
│                                                          │
│  Accent System (TB-303 Signature)                        │
│  ├─ Accent Level: Boosts VCA and filter envelope        │
│  ├─ Per-Step: Individual step accent control            │
│  └─ Effect: Louder + brighter on accented notes         │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Acid Bass Sweet Spots

| Parameter | Squelchy Acid | Deep Acid | Screaming Acid | Minimal Bass |
|-----------|---------------|-----------|----------------|--------------|
| **Cutoff** | 800-1500 Hz | 300-600 Hz | 2000-4000 Hz | 200-400 Hz |
| **Resonance** | 70-85% | 50-70% | 85-100% | 30-50% |
| **Envelope Amount** | +60 to +80% | +40 to +60% | +80 to +100% | +20 to +40% |
| **Decay** | 400-800ms | 800-1500ms | 200-400ms | 600-1000ms |
| **Accent** | 50-70% | 30-50% | 70-100% | 20-40% |
| **Glide** | 100-200ms | 50-100ms | 200-350ms | 0-50ms |
| **Genre** | Classic acid techno | Deep techno | Hard acid | Minimal techno |

### 1.3 TB-303 Pattern Techniques

#### Classic Acid Pattern
```
Steps: [0, 3, 7, 10, 12, 15]  // Syncopated 16th notes
Notes: [C2, E2, G2, C3, G2, E2]  // Octave jumps
Accent: [0, 7, 12]  // Accent on key notes
Glide: [3→7, 10→12]  // Slides between certain notes
Result: Classic squelchy acid bassline
```

#### Minimal Acid Pattern
```
Steps: [0, 4, 8, 12]  // Four-on-floor aligned
Notes: [F2, F2, F2, F2]  // Single note
Accent: [0]  // Only first beat accented
Glide: None
Cutoff Automation: Slowly open filter over 8 bars
Result: Hypnotic minimal acid
```

#### Hard Acid Pattern
```
Steps: [0, 1, 2, 4, 6, 8, 9, 10, 12, 14]  // Dense 16ths
Notes: Random between C2-C4  // Wide range
Accent: Every other step (50% pattern)
Glide: Random slides
Resonance: 90-100% (self-oscillation)
Result: Chaotic, screaming acid
```

---

## 2. Drum Synthesizer Modules

### 2.1 Techno Kick Drum Synth

**Architecture**: Dual-oscillator with aggressive pitch envelope

```
┌──────────────────────────────────────────────────────────┐
│                 TECHNO KICK MODULE                       │
├──────────────────────────────────────────────────────────┤
│  Body Oscillator (Sub Layer)                             │
│  ├─ Waveform: Sine (pure fundamental)                   │
│  ├─ Start Pitch: 150 Hz                                  │
│  ├─ Pitch Envelope: 150→50→45 Hz                        │
│  ├─ Envelope Time: 100-200ms                            │
│  └─ Mix: 70% of total                                    │
│                                                          │
│  Click Oscillator (Attack Layer)                         │
│  ├─ Waveform: Triangle/Noise burst                      │
│  ├─ Start Pitch: 300 Hz                                  │
│  ├─ Pitch Envelope: 300→80 Hz (fast)                    │
│  ├─ Envelope Time: 20-40ms                              │
│  └─ Mix: 30% of total                                    │
│                                                          │
│  Filter Section                                          │
│  ├─ Type: Low-Pass 12dB                                 │
│  ├─ Cutoff: 200 Hz → 50 Hz                              │
│  └─ Envelope: Follows pitch envelope                    │
│                                                          │
│  Saturation (Optional)                                   │
│  ├─ Drive: 10-30% (add harmonics)                       │
│  └─ Purpose: Audibility on small speakers               │
│                                                          │
│  Techno Kick Variations                                  │
│  ├─ Deep Kick: Long decay (200ms), low pitch (45 Hz)    │
│  ├─ Hard Kick: Short decay (80ms), bright attack        │
│  ├─ Industrial Kick: Heavy distortion (40%+)            │
│  └─ Minimal Kick: Clean, precise, no saturation         │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Techno Clap/Snare Synth

```
┌──────────────────────────────────────────────────────────┐
│                TECHNO CLAP/SNARE MODULE                  │
├──────────────────────────────────────────────────────────┤
│  Clap Synthesis (Filtered Noise Bursts)                 │
│  ├─ Noise Source: White noise                           │
│  ├─ Filter: Band-Pass 1500-3000 Hz                      │
│  ├─ Multi-Burst: 3-4 bursts with delay                  │
│  ├─ Delay Times: [0ms, 25ms, 50ms, 75ms]               │
│  └─ Decay: Exponential, 150ms total                     │
│                                                          │
│  Snare Synthesis (Tone + Noise)                          │
│  ├─ Tone: Triangle 180-220 Hz (body)                    │
│  ├─ Noise: Band-Pass 2000-5000 Hz (snap)                │
│  ├─ Mix: 40% tone / 60% noise                           │
│  └─ Decay: 120ms                                         │
│                                                          │
│  Industrial Variations                                   │
│  ├─ Heavy Clap: More bursts, longer decay               │
│  ├─ Metallic Snare: High Q band-pass                    │
│  └─ Distorted: Add saturation 30-60%                    │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Hi-Hat Synthesizer

```
┌──────────────────────────────────────────────────────────┐
│                  TECHNO HI-HAT MODULE                    │
├──────────────────────────────────────────────────────────┤
│  Metallic Oscillators (6x Square Waves)                 │
│  ├─ Frequencies: [317, 421, 543, 687, 843, 1012] Hz     │
│  ├─ Inharmonic ratios (not octaves)                     │
│  └─ Equal mix, very short envelope                      │
│                                                          │
│  Noise Component                                         │
│  ├─ Type: White noise                                    │
│  ├─ Filter: High-Pass 8kHz                              │
│  ├─ Mix: 60% of total sound                             │
│  └─ Shimmer/brightness control                          │
│                                                          │
│  Closed Hi-Hat                                           │
│  ├─ Decay: 30-50ms (very short)                         │
│  └─ Filter Cutoff: 10-12kHz                             │
│                                                          │
│  Open Hi-Hat                                             │
│  ├─ Decay: 200-400ms (long sustain)                     │
│  └─ Filter Cutoff: 12-15kHz (brighter)                  │
│                                                          │
│  Industrial Hi-Hat                                       │
│  ├─ Add Distortion: 20-40%                              │
│  ├─ Band-Pass: 6-10kHz (harsh, cutting)                 │
│  └─ Shorter decay: 20-30ms (tight)                      │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Lead Synthesizers

### 3.1 Sawtooth Lead Module

```
┌──────────────────────────────────────────────────────────┐
│                 SAWTOOTH LEAD SYNTH                      │
├──────────────────────────────────────────────────────────┤
│  Oscillators (Unison Stack)                              │
│  ├─ Waveform: Sawtooth (bright, full harmonics)         │
│  ├─ Voices: 7 unison (thick sound)                      │
│  ├─ Detune: ±10 cents (chorus effect)                   │
│  └─ Octave Spread: ±1 octave (huge sound)               │
│                                                          │
│  Filter (VCF)                                            │
│  ├─ Type: Low-Pass 24dB                                 │
│  ├─ Cutoff: 1200-3000 Hz                                │
│  ├─ Resonance: 20-40% (character)                       │
│  ├─ Envelope: +2000 Hz sweep                            │
│  └─ Keyboard Tracking: 50% (brighter in high notes)     │
│                                                          │
│  Amplifier ADSR                                          │
│  ├─ Attack: 5-20ms (soft or punchy)                     │
│  ├─ Decay: 300ms                                         │
│  ├─ Sustain: 0.7                                         │
│  └─ Release: 200ms                                       │
│                                                          │
│  Effects Chain                                           │
│  ├─ Chorus: Stereo widening                             │
│  ├─ Delay: 1/8 note (optional)                          │
│  └─ Reverb: Small room (10-15%)                         │
│                                                          │
│  Use Cases                                               │
│  ├─ Techno leads: Cutting, bright melodies              │
│  ├─ Trance leads: Long sustained notes                  │
│  └─ Industrial: Add distortion 30%+                     │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Square Wave Lead Module

```
┌──────────────────────────────────────────────────────────┐
│                 SQUARE LEAD SYNTH                        │
├──────────────────────────────────────────────────────────┤
│  Oscillator                                              │
│  ├─ Waveform: Square (hollow, odd harmonics)            │
│  ├─ Pulse Width Modulation: 30-70% duty cycle           │
│  ├─ PWM LFO: 0.5 Hz (slow movement)                     │
│  └─ Unison: 3 voices, slight detune                     │
│                                                          │
│  Filter                                                  │
│  ├─ Type: Low-Pass 12dB (gentler slope)                 │
│  ├─ Cutoff: 1500-2500 Hz                                │
│  ├─ Resonance: 30-50%                                    │
│  └─ Envelope: Moderate sweep +1000 Hz                   │
│                                                          │
│  Character                                               │
│  ├─ Sound: Hollow, vocal-like                           │
│  ├─ Movement: PWM creates animation                     │
│  └─ Genre: Minimal techno, tech house                   │
└──────────────────────────────────────────────────────────┘
```

### 3.3 PWM Lead (Pulse Width Modulation)

```
┌──────────────────────────────────────────────────────────┐
│              PWM LEAD SYNTH                              │
├──────────────────────────────────────────────────────────┤
│  Oscillator                                              │
│  ├─ Waveform: Pulse (variable width)                    │
│  ├─ Pulse Width: Modulated by LFO                       │
│  ├─ LFO Rate: 0.2-2 Hz (slow to medium)                 │
│  ├─ LFO Depth: 20-80% (subtle to extreme)               │
│  └─ Result: Constantly changing timbre                  │
│                                                          │
│  Filter                                                  │
│  ├─ Type: Band-Pass (focused tone)                      │
│  ├─ Cutoff: 1000-2000 Hz                                │
│  ├─ Resonance: 40-60% (emphasis)                        │
│  └─ Envelope: Optional modulation                       │
│                                                          │
│  Use Cases                                               │
│  ├─ Animated leads with movement                        │
│  ├─ Evolving textures                                   │
│  └─ Psychedelic techno sounds                           │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Pad Synthesizers

### 4.1 Ambient Pad Module

```
┌──────────────────────────────────────────────────────────┐
│                  AMBIENT PAD SYNTH                       │
├──────────────────────────────────────────────────────────┤
│  Oscillators (Supersaw Stack)                            │
│  ├─ Waveform: Sawtooth                                   │
│  ├─ Voices: 7-9 unison (lush thickness)                 │
│  ├─ Detune: ±15 cents (wide chorus)                     │
│  ├─ Octave Spread: -1, 0, +1 octaves                    │
│  └─ Mix: Balanced across octaves                        │
│                                                          │
│  Filter                                                  │
│  ├─ Type: Low-Pass 12dB (smooth)                        │
│  ├─ Cutoff: 600-1200 Hz (dark, warm)                    │
│  ├─ Resonance: 10-20% (minimal)                         │
│  └─ Envelope: Slow open (2-4 seconds)                   │
│                                                          │
│  Amplifier Envelope                                      │
│  ├─ Attack: 500ms-2s (slow fade-in)                     │
│  ├─ Decay: 1s                                            │
│  ├─ Sustain: 0.8 (nearly full)                          │
│  └─ Release: 2-4s (long tail)                           │
│                                                          │
│  Effects (Critical for Pad Sound)                        │
│  ├─ Chorus: Wide stereo (30% mix)                       │
│  ├─ Reverb: Large hall (40-50% mix)                     │
│  ├─ Delay: Subtle (10% mix, 1/4 note)                   │
│  └─ EQ: High-pass @ 200 Hz (space for bass)             │
│                                                          │
│  Use Cases                                               │
│  ├─ Background atmospheres                              │
│  ├─ Breakdown sections                                   │
│  ├─ Ambient techno layers                               │
│  └─ Cinematic moments                                    │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Supersaw Pad Module

```
┌──────────────────────────────────────────────────────────┐
│                 SUPERSAW PAD SYNTH                       │
├──────────────────────────────────────────────────────────┤
│  Oscillators (Dense Unison)                              │
│  ├─ Voices: 9-12 sawtooth oscillators                   │
│  ├─ Detune: Algorithmic spread (Roland JP-8000 style)   │
│  ├─ Stereo Spread: Wide panning                         │
│  └─ Result: Massive, wall-of-sound texture              │
│                                                          │
│  Filter                                                  │
│  ├─ Type: Low-Pass 24dB (smooth rolloff)                │
│  ├─ Cutoff: 800-1500 Hz                                 │
│  ├─ Envelope: Gentle opening                            │
│  └─ LFO: Optional slow movement (0.1 Hz)                │
│                                                          │
│  Character                                               │
│  ├─ Sound: Lush, thick, evolving                        │
│  ├─ Genre: Trance, progressive techno                   │
│  └─ CPU: High (many oscillators)                        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Effects Processing

### 5.1 Phaser Module (Modulation Effect)

```
┌──────────────────────────────────────────────────────────┐
│                    PHASER EFFECT                         │
├──────────────────────────────────────────────────────────┤
│  All-Pass Filter Chain                                   │
│  ├─ Stages: 4-12 all-pass filters                       │
│  ├─ Cutoff: Modulated by LFO                            │
│  ├─ Spacing: Logarithmic frequency distribution         │
│  └─ Feedback: 0-80% (intensity)                         │
│                                                          │
│  LFO (Low Frequency Oscillator)                          │
│  ├─ Waveform: Sine (smooth movement)                    │
│  ├─ Rate: 0.1-5 Hz                                       │
│  ├─ Depth: 200-2000 Hz sweep range                      │
│  └─ Phase: Can invert for stereo width                  │
│                                                          │
│  Parameters                                              │
│  ├─ Rate: Speed of phaser sweep                         │
│  ├─ Depth: Amount of frequency modulation               │
│  ├─ Feedback: Resonance/intensity                       │
│  ├─ Stages: Number of notches (4, 6, 8, 12)            │
│  └─ Dry/Wet: 0-100% mix                                 │
│                                                          │
│  Use Cases                                               │
│  ├─ Acid bass animation (slow sweep 0.2 Hz)             │
│  ├─ Hi-hat swirl (medium 1-2 Hz)                        │
│  ├─ Pad movement (very slow 0.1 Hz)                     │
│  └─ Psychedelic techno effects                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Flanger Module

```
┌──────────────────────────────────────────────────────────┐
│                   FLANGER EFFECT                         │
├──────────────────────────────────────────────────────────┤
│  Delay Line Modulation                                   │
│  ├─ Base Delay: 1-10ms (very short)                     │
│  ├─ Modulation: LFO varies delay time                   │
│  ├─ LFO Rate: 0.1-10 Hz                                  │
│  └─ Depth: ±5ms variation                               │
│                                                          │
│  Feedback Loop                                           │
│  ├─ Feedback: -95 to +95%                               │
│  ├─ Negative Feedback: Hollow sound                     │
│  ├─ Positive Feedback: Metallic, resonant               │
│  └─ High Feedback: Jet-plane swoosh                     │
│                                                          │
│  Character                                               │
│  ├─ Sound: Jet/whoosh sweeps                            │
│  ├─ Difference from Phaser: Uses delay, not filters     │
│  └─ Use: More dramatic than phaser                      │
│                                                          │
│  Techno Applications                                     │
│  ├─ Kick drum (subtle, 10% mix)                         │
│  ├─ Hi-hat rolls (dramatic sweeps)                      │
│  ├─ Risers/transitions                                   │
│  └─ Industrial/experimental sounds                      │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Advanced Reverb (Convolution)

```
┌──────────────────────────────────────────────────────────┐
│              CONVOLUTION REVERB                          │
├──────────────────────────────────────────────────────────┤
│  Impulse Response                                        │
│  ├─ Length: 2-4 seconds                                  │
│  ├─ Early Reflections: First 50ms                       │
│  ├─ Late Reverb: Exponential decay                      │
│  └─ Stereo: L/R decorrelation                           │
│                                                          │
│  Room Types                                              │
│  ├─ Small Room: 0.5-1s decay (tight)                    │
│  ├─ Large Hall: 2-4s decay (spacious)                   │
│  ├─ Plate: Bright, dense reflections                    │
│  └─ Spring: Vintage, metallic character                 │
│                                                          │
│  Damping Control                                         │
│  ├─ High Frequency Rolloff: 0-100%                      │
│  ├─ Simulates: Air absorption in space                  │
│  └─ Effect: Darker reverb over time                     │
│                                                          │
│  Techno Mixing Tips                                      │
│  ├─ Kick/Bass: 0-5% reverb (stay tight)                │
│  ├─ Claps/Snares: 15-25% reverb (space)                │
│  ├─ Hi-Hats: 10-15% reverb (subtle)                     │
│  ├─ Leads: 20-30% reverb (presence)                     │
│  └─ Pads: 40-60% reverb (atmosphere)                    │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Sequencer Patterns

### 6.1 Drum Pattern Library (16 Patterns)

#### Four-on-Floor Patterns

**Pattern 1: Classic 4/4**
```
Kick:   ●○○○●○○○●○○○●○○○  [0,4,8,12]
Clap:   ○○○○●○○○○○○○●○○○  [4,12]
Hi-Hat: ●○●○●○●○●○●○●○●○  [0,2,4,6,8,10,12,14]
Use: Standard techno beat, 125-130 BPM
```

**Pattern 2: Minimal 4/4**
```
Kick:   ●○○○●○○○●○○○●○○○  [0,4,8,12]
Clap:   ○○○○●○○○○○○○●○○○  [4,12]
Hi-Hat: ○○●○○○●○○○●○○○●○  [2,6,10,14]
Use: Minimal techno, space for acid bass
```

**Pattern 3: Hard Techno**
```
Kick:   ●●○○●●○○●●○○●●○○  [0,1,4,5,8,9,12,13]
Clap:   ○○○○●○○○○○○○●○●○  [4,12,14]
Hi-Hat: ●●●●●●●●●●●●●●●●  [all steps]
Use: Hard techno, 140-150 BPM
```

#### Industrial Patterns

**Pattern 4: Industrial 4/4**
```
Kick:   ●○○●●○○○●○○●●○○○  [0,3,4,8,11,12]
Clap:   ○○○○●○●○○○○○●○●○  [4,6,12,14]
Hi-Hat: ●○●●●○●●●○●●●○●●  [0,2,3,4,6,7,8,10,11,12,14,15]
Use: Industrial techno, aggressive
```

**Pattern 5: Broken Beat**
```
Kick:   ●○○●○○●○○●○○○●○○  [0,3,6,9,13]
Clap:   ○○○○●○○●○○○○●○○●  [4,7,12,15]
Hi-Hat: ●○●○●●●○●○●●●○●○  [0,2,4,5,6,8,10,11,12,14]
Use: Experimental, broken techno
```

### 6.2 Acid Bass Patterns (Sequencer + 303)

**Acid Pattern A: Classic Squelch**
```
Steps:    [0,  2,  4,  6,  8,  10, 12, 14]
Notes:    [C2, E2, G2, C3, G2, E2, C2, G2]
Accent:   [●,  ○,  ●,  ○,  ●,  ○,  ●,  ○ ]
Glide:    [○,  ●,  ○,  ●,  ○,  ●,  ○,  ● ]
Cutoff:   1200 Hz, Resonance: 75%
Envelope: +70%, Decay: 600ms
```

**Acid Pattern B: Minimal Pulse**
```
Steps:    [0,  4,  8,  12]
Notes:    [F2, F2, F2, F2]  // Single note
Accent:   [●,  ○,  ○,  ○ ]
Glide:    [○,  ○,  ○,  ○ ]
Cutoff:   400 Hz (closed), automate to 2000 Hz over 16 bars
Resonance: 60%
```

**Acid Pattern C: Chaotic Acid**
```
Steps:    [0,  1,  3,  4,  6,  8,  9,  11, 12, 14]
Notes:    Random (C2-C4)
Accent:   Random 50%
Glide:    Random slides
Cutoff:   1800 Hz, Resonance: 90%
Envelope: +85%, fast decay 300ms
```

---

## 7. Modulation Sources

### 7.1 LFO (Low Frequency Oscillator) Module

```
┌──────────────────────────────────────────────────────────┐
│                    LFO MODULE                            │
├──────────────────────────────────────────────────────────┤
│  Waveforms                                               │
│  ├─ Sine: Smooth, natural modulation                    │
│  ├─ Triangle: Linear up/down sweep                      │
│  ├─ Sawtooth: Ramp up or down                           │
│  ├─ Square: Stepped on/off                              │
│  └─ Random (S&H): Stepped random values                 │
│                                                          │
│  Rate Control                                            │
│  ├─ Range: 0.01 Hz - 20 Hz                              │
│  ├─ Sync: BPM-synced (1/16, 1/8, 1/4, 1/2, 1 bar)      │
│  └─ Free: Non-synced continuous                         │
│                                                          │
│  Modulation Destinations                                 │
│  ├─ Filter Cutoff: Wah-wah effects                      │
│  ├─ Pitch: Vibrato                                       │
│  ├─ Amplitude: Tremolo                                   │
│  ├─ Pulse Width: PWM synthesis                          │
│  ├─ Pan: Auto-pan stereo movement                       │
│  └─ Effects Parameters: Animated FX                     │
│                                                          │
│  Techno LFO Applications                                 │
│  ├─ Acid Filter: 0.25 Hz sine (slow sweep)              │
│  ├─ Pad Movement: 0.1 Hz triangle (very slow)           │
│  ├─ Hi-Hat Pan: 2 Hz square (rhythmic)                  │
│  ├─ Lead Vibrato: 5 Hz sine (subtle pitch)              │
│  └─ PWM Lead: 0.5 Hz triangle (timbre change)           │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Envelope Generators

**ADSR Envelope**
```
┌──────────────────────────────────────────────────────────┐
│                  ADSR ENVELOPE                           │
├──────────────────────────────────────────────────────────┤
│  Stages                                                  │
│  ├─ Attack: 0ms - 5s (fade-in time)                     │
│  ├─ Decay: 0ms - 5s (fall to sustain)                   │
│  ├─ Sustain: 0-100% (held level)                        │
│  └─ Release: 0ms - 10s (fade-out after note off)        │
│                                                          │
│  Common Presets                                          │
│  ├─ Pluck: A=1ms, D=200ms, S=0, R=50ms                  │
│  ├─ Pad: A=500ms, D=1s, S=80%, R=2s                     │
│  ├─ Lead: A=10ms, D=300ms, S=70%, R=200ms               │
│  └─ Bass: A=5ms, D=600ms, S=50%, R=100ms                │
│                                                          │
│  Modulation Targets                                      │
│  ├─ Amplitude (VCA): Volume shape                       │
│  ├─ Filter (VCF): Brightness over time                  │
│  ├─ Pitch: Envelope-controlled pitch bend               │
│  └─ Pulse Width: Envelope PWM                           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Genre-Specific Modules

### 8.1 Classic Acid Techno (125-135 BPM)

```
┌──────────────────────────────────────────────────────────┐
│              ACID TECHNO MODULE                          │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Four-on-floor [0,4,8,12]                     │
│  ├─ Acid Bass: TB-303 pattern (squelchy)                │
│  ├─ Hi-Hat: 16th notes, open on off-beats               │
│  └─ Clap: Backbeat [4,12]                               │
│                                                          │
│  TB-303 Settings                                         │
│  ├─ Cutoff: 1200-1800 Hz                                │
│  ├─ Resonance: 70-85%                                    │
│  ├─ Envelope: +70%, Decay 600ms                         │
│  ├─ Accent: 50-70%                                       │
│  └─ Pattern: Syncopated 16ths with slides               │
│                                                          │
│  Arrangement                                             │
│  ├─ Intro: Drums only (16 bars)                         │
│  ├─ Build: Add closed 303 (16 bars)                     │
│  ├─ Drop: Open 303 filter (32+ bars)                    │
│  └─ Breakdown: Filter automation, drums drop out        │
│                                                          │
│  Mix Tips                                                │
│  ├─ 303: Centered, -3dB, reverb 10%                     │
│  ├─ Kick: -6dB, tight/punchy                            │
│  ├─ Hi-Hats: -10dB, stereo width                        │
│  └─ Master: Light compression, no limiting              │
└──────────────────────────────────────────────────────────┘
```

### 8.2 Hard Techno (140-150 BPM)

```
┌──────────────────────────────────────────────────────────┐
│               HARD TECHNO MODULE                         │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Hard, fast [0,1,4,5,8,9,12,13] (double)      │
│  ├─ Bass: Distorted, aggressive                         │
│  ├─ Hi-Hat: Full 16ths, industrial tone                 │
│  └─ Clap: Layered, reverb tail                          │
│                                                          │
│  Sound Design                                            │
│  ├─ Kick: Short decay, high distortion 40%+             │
│  ├─ Bass: Scream-303 or distorted saw                   │
│  ├─ Overall: Dark, aggressive, industrial               │
│  └─ Effects: Heavy reverb on percussion                 │
│                                                          │
│  Characteristics                                         │
│  ├─ Fast tempo (140-150 BPM)                             │
│  ├─ Aggressive, relentless energy                       │
│  ├─ Industrial/dark aesthetic                           │
│  └─ Minimal melody, rhythm-focused                      │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Minimal Techno (125-130 BPM)

```
┌──────────────────────────────────────────────────────────┐
│              MINIMAL TECHNO MODULE                       │
├──────────────────────────────────────────────────────────┤
│  Core Philosophy                                         │
│  ├─ Less is more: Minimal elements                      │
│  ├─ Groove-focused: Micro-variations                    │
│  ├─ Space: Silence as important as sound                │
│  └─ Hypnotic: Repetitive, evolving patterns             │
│                                                          │
│  Core Elements                                           │
│  ├─ Kick: Clean, precise [0,4,8,12]                     │
│  ├─ Bass: Single-note pulse or minimal 303              │
│  ├─ Hi-Hat: Sparse [2,10] or minimal pattern            │
│  └─ Clap: Optional, subtle                              │
│                                                          │
│  Evolution Techniques                                    │
│  ├─ Filter Automation: Slow 303 opening (32 bars)       │
│  ├─ Element Addition: Add/remove hi-hat every 8 bars    │
│  ├─ Reverb Swells: Increase reverb on breakdown         │
│  └─ Delay Throws: Occasional delayed hits               │
│                                                          │
│  Mix Balance                                             │
│  ├─ Kick: Dominant -3dB, dry                            │
│  ├─ Bass: -5dB, minimal processing                      │
│  ├─ Percussion: -8 to -12dB, textural                   │
│  └─ Space: Leave room for evolution                     │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Industrial Techno (130-140 BPM)

```
┌──────────────────────────────────────────────────────────┐
│             INDUSTRIAL TECHNO MODULE                     │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Distorted, metallic                           │
│  ├─ Bass: Harsh, overdriven                             │
│  ├─ Percussion: Metallic, industrial samples            │
│  └─ Noise: White noise bursts, risers                   │
│                                                          │
│  Sound Design                                            │
│  ├─ Heavy Distortion: 40-80% on most elements           │
│  ├─ Bit Crushing: Lo-fi degradation                     │
│  ├─ Metallic Filters: Band-pass resonance               │
│  └─ Feedback: Controlled feedback loops                 │
│                                                          │
│  Pattern Style                                           │
│  ├─ Broken beats: Non-standard patterns                 │
│  ├─ Polyrhythms: Overlapping rhythms                    │
│  ├─ Noise layers: Texture and atmosphere                │
│  └─ Dynamic range: Loud/quiet contrasts                 │
│                                                          │
│  Aesthetic                                               │
│  ├─ Dark, mechanical, dystopian                         │
│  ├─ Factory/machinery sounds                            │
│  ├─ Aggressive, uncompromising                          │
│  └─ Experimental, boundary-pushing                      │
└──────────────────────────────────────────────────────────┘
```

### 8.5 Detroit Techno (120-130 BPM)

```
┌──────────────────────────────────────────────────────────┐
│              DETROIT TECHNO MODULE                       │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Deep, warm, TR-909 style                      │
│  ├─ Bass: Melodic, musical (not just rhythm)            │
│  ├─ Strings/Pads: Warm, emotional layers                │
│  └─ Hi-Hat: Shuffled, swung feel                        │
│                                                          │
│  Characteristics                                         │
│  ├─ Soulful, emotional                                   │
│  ├─ Melodic elements (chords, strings)                  │
│  ├─ Swung/shuffled groove                               │
│  ├─ Warm analog sound                                    │
│  └─ Futuristic yet human                                │
│                                                          │
│  Synthesis                                               │
│  ├─ Warm filters (low resonance)                        │
│  ├─ Lush pads (supersaw with chorus)                    │
│  ├─ Melodic bass lines                                   │
│  └─ String machines (saw + PWM)                         │
│                                                          │
│  Mix Approach                                            │
│  ├─ Warmer than European techno                         │
│  ├─ More dynamic range                                   │
│  ├─ Space for emotional elements                        │
│  └─ Less aggressive compression                         │
└──────────────────────────────────────────────────────────┘
```

### 8.6 Progressive Techno (126-132 BPM)

```
┌──────────────────────────────────────────────────────────┐
│           PROGRESSIVE TECHNO MODULE                      │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Deep, rolling                                  │
│  ├─ Bass: Evolving, progressive                         │
│  ├─ Pads: Atmospheric, cinematic                        │
│  └─ Leads: Melodic, emotional                           │
│                                                          │
│  Structure Approach                                      │
│  ├─ Long builds: 32-64 bar progressions                 │
│  ├─ Element layering: Gradual addition                  │
│  ├─ Filter automation: Slow, deliberate                 │
│  └─ Breakdowns: Extended, atmospheric                   │
│                                                          │
│  Sound Design                                            │
│  ├─ Clean, polished production                          │
│  ├─ Wide stereo field                                    │
│  ├─ Reverb-heavy atmosphere                             │
│  └─ Evolving textures (LFOs, automation)                │
│                                                          │
│  Characteristics                                         │
│  ├─ Journey-focused (not loop-based)                    │
│  ├─ Emotional, uplifting or dark                        │
│  ├─ Detailed sound design                               │
│  └─ Epic, cinematic moments                             │
└──────────────────────────────────────────────────────────┘
```

### 8.7 Dub Techno (120-126 BPM)

```
┌──────────────────────────────────────────────────────────┐
│               DUB TECHNO MODULE                          │
├──────────────────────────────────────────────────────────┤
│  Core Elements                                           │
│  ├─ Kick: Deep, muffled [0,4,8,12]                      │
│  ├─ Bass: Sub-focused, minimal                          │
│  ├─ Chords: Dubbed-out stabs with delay                 │
│  └─ Percussion: Sparse, textural                        │
│                                                          │
│  Dub Processing (Critical)                               │
│  ├─ Delay: Heavy (40-60% mix), dubbed feedback          │
│  ├─ Reverb: Large spaces (30-50% mix)                   │
│  ├─ Filters: Gradual sweeps, automation                 │
│  └─ Echo Throws: Manual delay sends                     │
│                                                          │
│  Chord Technique                                         │
│  ├─ Play sparse chord stabs                             │
│  ├─ Send through heavy delay (1/4 or 1/8)               │
│  ├─ High feedback (60-80%)                               │
│  └─ Result: Washing, atmospheric chords                 │
│                                                          │
│  Characteristics                                         │
│  ├─ Deep, atmospheric, spacious                         │
│  ├─ Heavy use of delay and reverb                       │
│  ├─ Minimal rhythmic elements                           │
│  ├─ Hypnotic, meditative quality                        │
│  └─ Warm, analog-inspired sound                         │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Advanced Synthesis Techniques

### 9.1 Ladder Filter Emulation (TB-303 Style)

**Moog-style 24dB/octave Low-Pass Filter**

```javascript
// Four cascaded one-pole filters (transistor ladder)
// Self-oscillation at high resonance
// Non-linear behavior (distortion at high resonance)

function ladderFilter(input, cutoff, resonance) {
    // Stage 1-4: Four low-pass filters in series
    // Each stage: y[n] = y[n-1] + (input - y[n-1]) * cutoff
    // Feedback: Output fed back to input with resonance amount
    // Result: Classic analog filter sound with self-oscillation
}
```

**Sweet Spots**:
- Classic Acid: Cutoff 1200 Hz, Res 75%
- Deep Bass: Cutoff 400 Hz, Res 50%
- Screaming: Cutoff 2500 Hz, Res 95%

### 9.2 Unison Detune Algorithms

**Creating Thick Supersaw Sounds**

```javascript
// JP-8000 Style Detune Spread
voices = 7;
detune = 15 cents;

for (i = 0; i < voices; i++) {
    // Logarithmic detune spread
    voiceDetune = (i - voices/2) * (detune / voices) * logarithmicCurve;
    // Pan spread for stereo width
    pan = (i - voices/2) / voices;
}
```

**Applications**:
- Supersaw Pads: 7-9 voices, ±15 cents
- Leads: 3-5 voices, ±10 cents
- Bass: 2-3 voices, ±5 cents (subtle)

### 9.3 Pulse Width Modulation Synthesis

**Creating Animated Square-ish Timbres**

```javascript
// Variable duty cycle square wave
function PWM(frequency, pulseWidth, time) {
    // pulseWidth: 0-100% (50% = square, others = pulse)
    // Modulate pulseWidth with LFO for animation
    // Result: Constantly changing harmonic content
}

// LFO Modulation
pulseWidth = 50 + (30 * Math.sin(time * LFO_rate));
// Range: 20-80% pulse width
```

**Use Cases**:
- Animated leads (slow LFO 0.5 Hz)
- Evolving pads (very slow 0.1 Hz)
- Rhythmic texture (fast LFO 2 Hz synced to beat)

---

## 10. Module Interaction Flow

```
User Pattern Selection
    ↓
┌──────────────────────────────────────────────────────────┐
│              16-STEP SEQUENCER                           │
│  (Drum Patterns + 303 Patterns)                          │
└──────────────────────────────────────────────────────────┘
    ↓
┌────────────┬─────────────┬──────────────┬───────────────┐
│  TB-303    │  Kick Synth │  Clap/Snare  │  Hi-Hat Synth │
│  Acid Bass │  (Dual OSC) │  (Tone+Noise)│  (Multi-OSC)  │
└────────────┴─────────────┴──────────────┴───────────────┘
    ↓            ↓               ↓                ↓
┌──────────────────────────────────────────────────────────┐
│              MODULATION MATRIX                           │
│  LFO → Filter, Pitch, Pan, PWM                           │
│  Envelopes → VCF, VCA                                    │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│              EFFECTS CHAIN                               │
│  Phaser → Flanger → Delay → Reverb                      │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│              MASTER OUTPUT                               │
│  (Optional Master Compression)                           │
└──────────────────────────────────────────────────────────┘
    ↓
Audio Output / Export
```

---

## 11. Quick Reference Links

### Internal Documentation
- **[Techno Creator Quick Reference](./TECHNO_CREATOR_QUICK_REFERENCE.md)** - Quick patterns
- **[Music Theory Audit](./MUSIC_THEORY_AUDIT_REPORT.md)** - Validation report
- **[Main Guides](./README.md)** - Documentation index

### Module Categories
- **[Acid Bass](#1-acid-bass-tb-303-emulation)** - TB-303 emulation
- **[Drum Synths](#2-drum-synthesizer-modules)** - Techno percussion
- **[Lead Synths](#3-lead-synthesizers)** - Melodic leads
- **[Pad Synths](#4-pad-synthesizers)** - Atmospheric layers
- **[Effects](#5-effects-processing)** - Phaser, flanger, reverb
- **[Patterns](#6-sequencer-patterns)** - 16 drum patterns + acid
- **[Modulation](#7-modulation-sources)** - LFO and envelopes
- **[Genre Modules](#8-genre-specific-modules)** - 7 techno styles
- **[Advanced](#9-advanced-synthesis-techniques)** - Pro techniques

---

**Last Updated**: November 2025  
**Version**: 2.6  
**Module Count**: 18+ synthesis modules + 7 genre templates  
**Status**: Production Ready ✅  
**TB-303 Emulation**: Authentic ✅
