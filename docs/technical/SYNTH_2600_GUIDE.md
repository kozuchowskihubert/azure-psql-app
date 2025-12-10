# Behringer 2600 Synthesizer Visualizer

## Overview
An interactive educational tool for learning and visualizing analog synthesis concepts using the legendary Behringer 2600 semi-modular synthesizer as a teaching platform.

## Features

### 🌊 Voltage Controlled Oscillators (VCO)
**What You Can Expect:**

#### VCO 1 & VCO 2 (Audio Rate)
- **Frequency Range:** 20 Hz - 20 kHz
- **Waveforms:** Sawtooth, Square/Pulse, Triangle, Sine
- **Fine Tune:** ±100 cents (1 semitone)
- **Pulse Width Modulation (PWM):** Variable duty cycle (1%-99%)
- **Sync:** Hard sync VCO 2 to VCO 1 for aggressive timbres

**Sound Characteristics:**
- **Sawtooth:** Bright, buzzy, rich in harmonics - perfect for leads, brass
- **Square:** Hollow, woodwind-like, clarinet tones
- **Pulse (50%):** Classic video game sounds, strong fundamental
- **Triangle:** Pure, flute-like, minimal harmonics
- **Sine:** Clean fundamental, sub-bass, no overtones

#### VCO 3 (LFO Mode)
- **Rate:** 0.1 Hz - 20 Hz (sub-audio modulation)
- **Depth:** Variable intensity (0-100%)
- **Applications:**
  - Vibrato (pitch modulation)
  - Tremolo (amplitude modulation)
  - Filter sweeps
  - PWM animation

### 🎚️ Voltage Controlled Filters (VCF)

#### Low Pass Filter (24dB/octave)
**The Heart of Analog Sound**

- **Type:** Moog ladder design (4-pole)
- **Cutoff Range:** 20 Hz - 20 kHz
- **Resonance:** 0-10 (self-oscillation at 10)
- **Envelope Modulation:** ±100%

**What to Expect:**
- **Low Cutoff (200-500 Hz):** Warm, mellow bass tones, removes brightness
- **Mid Cutoff (800-1200 Hz):** Sweet spot for analog warmth
- **High Cutoff (2000-5000 Hz):** Bright, open tones, screaming leads
- **High Resonance (7-10):** Emphasized peak, "wah" effect, self-oscillation becomes pure sine tone

**Sweet Spots:**
```
Fat Bass: Cutoff 400Hz, Resonance 7.5, Envelope +50%
Screaming Lead: Cutoff 2000Hz, Resonance 9.5, Envelope +80%
Lush Pad: Cutoff 1200Hz, Resonance 3.0, Envelope +30%
```

#### High Pass Filter (12dB/octave)
- **Cutoff Range:** 20 Hz - 5 kHz
- **Use:** Remove sub-bass rumble, create thin/bright sounds
- **Combined with LPF:** Band-pass effects

### 🎼 ARP Sequencer (16-Step)

**Pattern Programming:**
- **Steps:** 16 programmable steps
- **Modes:**
  - Forward: 1→16
  - Reverse: 16→1
  - Pendulum: 1→16→1
  - Random: Unpredictable patterns
- **Tempo:** 30-300 BPM
- **CV Per Step:** Voltage control for pitch, filter, or any parameter

**What to Expect:**
- **Berlin School Sequences:** Tangerine Dream, Klaus Schulze style
- **Kraftwerk Arpeggios:** Robotic, mechanical patterns
- **Evolving Textures:** Ambient soundscapes with slow tempo
- **Acid Basslines:** Classic TB-303 style sequences

**Example Patterns:**
```
Classic Trance: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
Acid Bass:      [1,1,0,0, 1,0,1,0, 0,1,1,0, 1,0,0,1]
Ambient Drone:  [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0]
```

### 🔌 Semi-Modular Patch Matrix

**86 Patch Points for Creative Routing**

#### Common Patch Cables:
1. **VCO 3 → VCF Cutoff:** Classic filter sweep
2. **VCO 1 → VCO 2 FM:** Frequency modulation, bell-like tones
3. **Envelope → VCA:** Volume shaping
4. **LFO → PWM:** Animated pulse width
5. **Ring Mod → VCF:** Metallic, dissonant timbres

**What to Expect:**
- **No Cables:** Works as pre-patched monosynth
- **With Cables:** Unlimited creative routing
- **Cross-Modulation:** FM, AM, ring modulation
- **Feedback Loops:** Create chaotic, organic textures

## Technical Specifications

### Oscillators
| Parameter | Specification |
|-----------|--------------|
| VCO Count | 3 (2 audio, 1 LFO) |
| Waveforms | Saw, Square, Triangle, Sine |
| Octave Range | 32', 16', 8', 4', 2' |
| Tracking | 1V/octave |
| Temperature Stability | ±5 cents over 1°C |

### Filter
| Parameter | Specification |
|-----------|--------------|
| Type | 24dB/octave Moog ladder |
| Cutoff Range | 20 Hz - 20 kHz |
| Resonance | 0-10 (self-oscillation) |
| Frequency Response | -24dB/octave slope |

### Envelopes
| Parameter | Specification |
|-----------|--------------|
| Count | 2x ADSR, 1x AR |
| Attack Time | 1ms - 10s |
| Decay Time | 1ms - 10s |
| Sustain Level | 0% - 100% |
| Release Time | 1ms - 10s |

### Sequencer
| Parameter | Specification |
|-----------|--------------|
| Steps | 16 |
| Modes | Forward, Reverse, Pendulum, Random |
| Tempo Range | 30-300 BPM |
| CV Output | 0-5V per step |

## Classic Patches

### 🎸 Fat Bass
```
VCO 1: Sawtooth, 110 Hz
VCO 2: Sawtooth, 109 Hz (slightly detuned)
LPF: Cutoff 400 Hz, Resonance 7.5
Envelope: Fast attack, medium decay, low sustain, short release
Patch: ENV → VCF Cutoff (+50%)
```

### 🎺 Screaming Lead
```
VCO 1: Sawtooth, 440 Hz
VCO 2: Off
LPF: Cutoff 2000 Hz, Resonance 9.5
Envelope: Instant attack, long release
Patch: ENV → VCF Cutoff (+80%)
LFO: Triangle → VCO 1 Pitch (vibrato)
```

### 🌌 Lush Pad
```
VCO 1: Sawtooth, 220 Hz
VCO 2: Sawtooth, 219 Hz (chorus effect)
LPF: Cutoff 1200 Hz, Resonance 3.0
Envelope: Slow attack (1s), long release (3s)
Patch: LFO → PWM (slow movement)
```

### 🎼 Berlin Sequence
```
VCO 1: Pulse, controlled by sequencer
VCO 2: Sawtooth, octave below
LPF: Cutoff 800 Hz, Resonance 6.0
Sequencer: 16-step pattern, 120 BPM
Patch: SEQ CV → VCO 1 Pitch
       SEQ CV → VCF Cutoff
```

### ⚡ Sci-Fi FX
```
VCO 1: Sine, high pitch
Ring Mod: VCO 1 × VCO 2
LPF: Resonance 10 (self-oscillation)
Patch: LFO → Ring Mod
       Sample & Hold → VCF Cutoff
```

## Interactive Features

### Waveform Display
- **Real-time visualization** of oscillator outputs
- **Animated graphics** showing wave shape changes
- **Color-coded** by oscillator (VCO1=Cyan, VCO2=Magenta, VCO3=Green)

### Interactive Knobs
- **Mouse drag** to adjust values
- **Real-time feedback** on parameter changes
- **Value display** shows Hz, cents, percentages
- **Visual indication** via rotating indicator line

### Patch Matrix
- **Click output** to select source signal
- **Click input** to create connection
- **Visual feedback** with glowing jacks
- **Multiple connections** supported

### Sequencer Control
- **Play/Stop** buttons
- **Step programming** by clicking steps
- **Randomize** for instant inspiration
- **Clear** to start fresh
- **Visual playback** with highlighted current step

## Learning Path

### Beginner
1. Start with single VCO, adjust pitch and waveform
2. Add filter, experiment with cutoff and resonance
3. Try preset patches to hear different sounds
4. Learn envelope shapes (ADSR)

### Intermediate
5. Detune two oscillators for thickness
6. Use LFO to modulate filter cutoff
7. Program simple sequencer patterns
8. Explore different waveform combinations

### Advanced
9. Patch cables for custom signal routing
10. FM synthesis with VCO cross-modulation
11. Complex sequencer patterns with modulation
12. Self-oscillating filter as sine wave source

## Sound Design Tips

### Warmth
- Use sawtooth waves with low-pass filtering
- Slight VCO detuning (±5 cents)
- Resonance around 4-6
- Slow envelope attack

### Brightness
- Square waves with minimal filtering
- High cutoff frequency (>3kHz)
- Minimal resonance
- Fast envelope attack

### Movement
- LFO modulation on multiple parameters
- PWM on pulse waves
- Filter envelope with high modulation depth
- Sequencer controlling pitch and filter

### Aggression
- VCO sync enabled
- High resonance (8-10)
- Ring modulation
- Fast, percussive envelopes

## Browser Compatibility
- Modern browsers with Canvas API support
- Chrome, Firefox, Safari, Edge
- Desktop and tablet recommended
- Touch-enabled for mobile devices

## Future Enhancements
- [ ] Audio engine integration (Web Audio API)
- [ ] MIDI controller support
- [ ] Patch save/load functionality
- [ ] Additional modulation sources
- [ ] Spring reverb simulation
- [ ] Tape delay effect

## Credits
Inspired by the legendary ARP 2600 (1971) and faithfully recreated by Behringer as an affordable homage to analog synthesis history.

## Navigation
- [Music Production Home](/music-production.html)
- [MIDI Generator](/midi-generator.html)
- [Main App](/index.html)
