# Melodic Synthesis Engine - Technical Guide

## Overview

The Trap Studio features a professional-grade melodic synthesis engine with 6 distinct instrument types, each with authentic synthesis architecture designed for hip-hop and trap music production.

## Architecture Overview

All instruments use Web Audio API's advanced synthesis capabilities:
- **Multiple Oscillators**: Layered waveforms for rich timbre
- **Filters**: Frequency shaping and resonance control
- **Envelope Generators**: ADSR (Attack, Decay, Sustain, Release) shaping
- **Modulation**: LFOs and envelope modulation for movement
- **Effects**: Distortion, detuning, and spatial processing

---

## 1. 🎹 Piano Synthesis

### Signal Chain
```
VCO1 (Sine, fundamental)
VCO2 (Sine, 2nd harmonic)      →  Lowpass Filter  →  Master VCA  →  Output
VCO3 (Triangle, 3rd harmonic)
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| VCO1 Frequency | Fundamental | f₀ |
| VCO2 Frequency | 2nd Harmonic | 2 × f₀ |
| VCO3 Frequency | 3rd Harmonic | 3 × f₀ |
| Filter Type | Lowpass | 2-pole |
| Filter Cutoff | Initial → Final | 3000 Hz → 800 Hz |
| Filter Q | Resonance | 1.0 |
| VCA Attack | Fast | 10 ms |
| VCA Decay | Medium | 1.2 s |
| Harmonic Levels | 1st:2nd:3rd | 0.8 : 0.3 : 0.15 |

### Characteristics
- **Timbre**: Warm, rich harmonics mimicking acoustic piano
- **Envelope**: Sharp attack with medium decay (piano-like)
- **Filter Modulation**: Brightness decreases over time
- **Velocity Scaling**: Lower notes slightly louder (realistic)

### Use Cases
- Melodic progressions
- Chord stabs
- Main harmonic content
- Classical trap melodies

---

## 2. 🔔 Bells Synthesis

### Signal Chain
```
Multiple Sine Oscillators (Inharmonic Ratios)
├─ Partial 1 (1.0 × f₀)
├─ Partial 2 (2.76 × f₀)     →  Individual VCAs  →  Mixer  →  Output
├─ Partial 3 (5.4 × f₀)
└─ Partial 4 (8.93 × f₀)
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| Partial Ratios | Inharmonic | [1, 2.76, 5.4, 8.93] |
| Oscillator Type | Pure Sine | All partials |
| Amplitude Decay | Per Partial | 1/(n+1) |
| Attack Time | Very Fast | 5 ms |
| Decay Time | Long | 1.5 s |
| Sustain Level | None | 0 |

### Characteristics
- **Timbre**: Bright, metallic, shimmering
- **Inharmonic Content**: Bell-like spectral structure
- **Long Decay**: Sustains and rings out naturally
- **Amplitude Scaling**: Higher partials decrease progressively

### Use Cases
- Counter-melodies
- Accent notes
- Atmospheric layers
- High-frequency ear candy

---

## 3. 🌊 Pad Synthesis

### Signal Chain
```
VCO1 (Sawtooth, fundamental)
VCO2 (Sawtooth, +1% detune)    →  Lowpass Filter  →  VCA  →  Output
VCO3 (Triangle, -1% detune)           ↑
                                      LFO (Vibrato)
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| VCO1 | Sawtooth | f₀ |
| VCO2 | Sawtooth | 1.01 × f₀ |
| VCO3 | Triangle | 0.99 × f₀ |
| Detune Amount | Slight | ±1% |
| Filter Type | Lowpass | 2-pole |
| Filter Cutoff | Modulated | 1200 → 1800 → 1000 Hz |
| Filter Q | Gentle | 0.7 |
| LFO Rate | Slow | 4 Hz |
| LFO Depth | Subtle | 3 Hz |
| Attack | Slow | 400 ms |
| Decay | Long | 2.0 s |

### Characteristics
- **Timbre**: Warm, evolving, atmospheric
- **Detuning**: Creates stereo width and richness
- **Filter Sweep**: Adds movement and interest
- **LFO Vibrato**: Subtle organic modulation
- **Long Envelope**: Slow build and fade

### Use Cases
- Background harmony
- Ambient textures
- Emotional build-ups
- Sustained chords

---

## 4. 🎸 Pluck Synthesis

### Signal Chain
```
VCO (Sawtooth)  →  Lowpass Filter (swept)  →  VCA (fast decay)  →  Output
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| Oscillator | Sawtooth | f₀ |
| Filter Type | Lowpass | 2-pole |
| Filter Cutoff | Initial → Final | 5000 Hz → 500 Hz |
| Filter Q | High | 3.0 |
| Attack | Instant | 2 ms |
| Decay | Fast | 0.5 s |
| Sustain | None | 0 |

### Characteristics
- **Timbre**: Bright, percussive, guitar/harp-like
- **Sharp Attack**: Instant onset
- **Fast Decay**: Quick fade
- **Filter Sweep**: Dramatic frequency drop
- **High Q**: Resonant pluck character

### Use Cases
- Melodic rhythms
- Arpeggiators
- Percussive melodies
- Staccato patterns

---

## 5. 🎺 Brass Synthesis

### Signal Chain
```
VCO1 (Sawtooth)
VCO2 (Sawtooth, +0.5% detune)  →  Lowpass Filter  →  Distortion  →  VCA  →  Output
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| VCO1 | Sawtooth | f₀ |
| VCO2 | Sawtooth | 1.005 × f₀ |
| Filter Type | Lowpass | 2-pole |
| Filter Cutoff | Modulated | 800 → 2000 → 1200 Hz |
| Filter Q | High | 4.0 |
| Distortion | Light | 30 |
| Attack | Medium | 80 ms |
| Decay | Sustained | 1.4 s |

### Characteristics
- **Timbre**: Bold, punchy, aggressive
- **Detuning**: Slight beating for thickness
- **High Q Filter**: Formant-like resonance
- **Distortion**: Edge and grit
- **Filter Envelope**: Opens dramatically

### Use Cases
- Lead hooks
- Power chords
- Aggressive melodies
- Bold harmonic statements

---

## 6. ⚡ Lead Synthesis

### Signal Chain
```
VCO (Square)  →  PWM (LFO)  →  Lowpass Filter  →  VCA  →  Output
```

### Parameters
| Component | Setting | Value |
|-----------|---------|-------|
| Oscillator | Square Wave | f₀ |
| PWM LFO Rate | Medium | 6 Hz |
| PWM Depth | Subtle | 20 cents |
| Filter Type | Lowpass | 2-pole |
| Filter Cutoff | Modulated | 4000 → 6000 → 2000 Hz |
| Filter Q | High | 2.0 |
| Attack | Fast | 20 ms |
| Decay | Medium | 1.3 s |

### Characteristics
- **Timbre**: Bright, cutting, synthetic
- **PWM**: Pulse width modulation for movement
- **Aggressive Filter**: Wide sweep range
- **Quick Response**: Fast attack
- **High Presence**: Cuts through mix

### Use Cases
- Main melodies
- Solos
- Top-line hooks
- Cutting leads

---

## Chord Playback System

### Features
1. **Instrument Selection**: 6 distinct synthesis engines
2. **Automatic Playback**: Sequential chord progression
3. **Timing**: 1.5 seconds per chord
4. **Voicing**: Root, 3rd, 5th in octave 4
5. **Visual Feedback**: Selected instrument highlighted in gold

### Workflow
```
1. Select Key (C, Db, D, etc.)
2. Select Mode (Major/Minor)
3. Select Progression Type (Dark Trap, Melodic Trap, etc.)
4. Click "Generate Progression"
5. Choose Instrument (Piano, Bells, Pad, etc.)
6. Click "Play Progression"
```

### Randomization
The `🎲 Randomize` button:
- Selects random key (12 options)
- Selects random mode (major/minor)
- Selects random progression type (6 types)
- Automatically generates new progression
- Provides visual animation feedback

---

## Technical Implementation

### MIDI to Frequency Conversion
```javascript
frequency = 440 × 2^((MIDI - 69) / 12)
```

### Chord Structure
- **Root Position**: Root, 3rd, 5th
- **Octave**: 4 (Middle C = C4)
- **Voicing**: Close position

### Envelope Shapes

#### Piano Envelope
```
Gain
 │    /\
 │   /  \___
 │  /       \___
 └──────────────→ Time
    10ms  1.2s
```

#### Pad Envelope
```
Gain
 │       /────\
 │      /      \
 │     /        \___
 └──────────────────→ Time
    400ms      2.0s
```

#### Pluck Envelope
```
Gain
 │  |\
 │  | \
 │  |  \___
 └──────────→ Time
   2ms  0.5s
```

---

## Frequency Ranges

| Instrument | Low Freq | High Freq | Sweet Spot |
|------------|----------|-----------|------------|
| Piano | 50 Hz | 4000 Hz | 200-1000 Hz |
| Bells | 200 Hz | 8000 Hz | 1000-5000 Hz |
| Pad | 30 Hz | 2000 Hz | 100-800 Hz |
| Pluck | 100 Hz | 5000 Hz | 400-2000 Hz |
| Brass | 80 Hz | 3000 Hz | 300-1500 Hz |
| Lead | 200 Hz | 6000 Hz | 800-3000 Hz |

---

## Mix Guidelines

### Level Balancing
```
Piano:  -6 dB (main harmonic content)
Bells:  -12 dB (accent layer)
Pad:    -9 dB (background)
Pluck:  -3 dB (rhythmic lead)
Brass:  -4 dB (aggressive lead)
Lead:   0 dB (main melody)
```

### EQ Suggestions
- **Piano**: Boost 200-400 Hz (body), cut 800-1200 Hz (mud)
- **Bells**: High-pass 500 Hz, boost 3-5 kHz (shimmer)
- **Pad**: High-pass 100 Hz, cut 2-4 kHz (space)
- **Pluck**: Boost 2-4 kHz (presence), cut <150 Hz
- **Brass**: Boost 1-2 kHz (cut), slight high-pass
- **Lead**: Boost 3-5 kHz (presence), aggressive high-pass

### Layering Strategies
1. **Thick Chords**: Pad + Piano
2. **Bright Melody**: Lead + Bells
3. **Percussive Rhythm**: Pluck + Bells
4. **Aggressive Hook**: Brass + Lead
5. **Emotional Build**: Pad + Piano + Bells

---

## Advanced Variations (Future Enhancements)

### Chord Voicing Options
- **Close Voicing**: Root, 3rd, 5th (current)
- **Wide Voicing**: Root, 3rd (+1 octave), 5th (+1 octave)
- **Drop-2**: Root, 5th, 3rd (+1 octave)
- **Drop-3**: Root, 3rd (+1 octave), 5th

### Arpeggiator Patterns
- **Up**: Play notes ascending
- **Down**: Play notes descending
- **Up-Down**: Ascend then descend
- **Random**: Randomize note order
- **As Played**: Chord order (current)

### Rhythm Patterns
- **Whole Notes**: Sustain full duration (current)
- **Quarter Notes**: Staccato hits
- **Syncopated**: Off-beat emphasis
- **Triplets**: 3 hits per chord
- **Dotted**: Swing feel

### Humanization
- **Velocity Variation**: ±10% random per note
- **Timing Jitter**: ±20ms random offset
- **Octave Randomization**: Occasional octave jumps
- **Note Probability**: Some notes skip randomly

### Effects Processing
- **Reverb**: Hall, plate, room
- **Delay**: Stereo ping-pong
- **Chorus**: Stereo widening
- **Compression**: Glue and punch

---

## Performance Tips

### CPU Optimization
- Each instrument creates 3-12 audio nodes
- Total nodes per chord: 9-72 (3 notes × 3-24 nodes)
- Full progression: 36-288 nodes (4 chords)
- Nodes auto-garbage collected after playback

### Memory Management
- All oscillators stopped after duration
- No audio node accumulation
- Clean teardown prevents memory leaks

### Latency Considerations
- Schedule with `startTime + 0.1` for buffer
- Use AudioContext.currentTime for sync
- No perceptible delay on modern browsers

---

## Browser Compatibility

| Browser | Version | Web Audio API | Performance |
|---------|---------|---------------|-------------|
| Chrome | 90+ | ✅ Full | Excellent |
| Firefox | 88+ | ✅ Full | Excellent |
| Safari | 14+ | ✅ Full | Good |
| Edge | 90+ | ✅ Full | Excellent |

---

## Code Examples

### Playing Piano Chord
```javascript
const ctx = audioContext;
const frequencies = [261.63, 329.63, 392.00]; // C-E-G (C major)
const startTime = ctx.currentTime + 0.1;
playPianoChord(ctx, frequencies, startTime);
```

### Setting Instrument
```javascript
setChordInstrument('bells'); // Changes to bells synthesis
```

### Randomizing Progression
```javascript
randomizeChordProgression(); // Random key, mode, and progression type
```

### Manual Chord Playback
```javascript
const chord = {
    name: 'Cm',
    notes: [60, 63, 67] // C4, Eb4, G4
};
playChord(ctx, chord.notes, ctx.currentTime, 'pad');
```

---

## Synthesis Philosophy

The melodic synthesis engine prioritizes:

1. **Authenticity**: Real synthesis techniques, not samples
2. **Variety**: 6 distinct timbres for creative flexibility
3. **Performance**: Optimized for real-time playback
4. **Musicality**: Envelopes and filters shaped for musical expression
5. **Integration**: Seamless with chord theory engine

Each instrument is crafted to serve specific roles in trap/hip-hop production while maintaining professional sound quality through proper synthesis architecture.

---

## Related Documentation
- [Trap Studio Synthesis Guide](./TRAP_STUDIO_SYNTHESIS.md) - Drum synthesis
- [Trap Studio Guide](./TRAP_STUDIO_GUIDE.md) - User guide
- [Sound Quality Guide](./SOUND_QUALITY_GUIDE.md) - Audio optimization

---

**Version**: 1.0  
**Last Updated**: 2024  
**Engine**: Web Audio API Professional Synthesis
