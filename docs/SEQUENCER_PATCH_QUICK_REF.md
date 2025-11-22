# Sequencer-Patch Integration Quick Reference

## 🎛️ Quick Start

### 1. Open Demo
```
http://localhost:3000/synth-patch-sequencer.html
```

### 2. Load Preset
- **Acid Bass** - Classic 303-style sequenced bassline
- **Techno Lead** - Dual VCO arpeggio with velocity filter
- **Random Melody** - S&H random note generator

### 3. Play
- Click ▶ Play button
- Watch patches light up
- Adjust parameters in real-time

---

## 🔌 Patch Matrix Cheat Sheet

### Common Patch Connections

| From | To | Effect |
|------|-----|--------|
| `sequencer.CV` | `vco1.CV` | Control oscillator pitch |
| `sequencer.GATE` | `env.GATE` | Trigger envelope |
| `sequencer.VELOCITY` | `vcf.CUTOFF` | Velocity → filter brightness |
| `sequencer.TRIG` | `snh.TRIG` | Trigger sample & hold |
| `vco1.OUT` | `vcf.IN` | Oscillator → filter |
| `env.OUT` | `vca.CV` | Envelope → amplitude |
| `env.OUT` | `vcf.CUTOFF` | Envelope → filter sweep |
| `lfo.SIN` | `vco1.CV` | LFO → vibrato |

---

## 📊 Signal Types

### CV (Control Voltage)
- **Range**: 0V - 5V
- **Standard**: 1V/octave
- **Formula**: `freq = 261.63 * 2^(CV)`
- **Use**: Pitch control

### Gate
- **High**: 1 (note on)
- **Low**: 0 (note off)
- **Use**: Trigger envelopes, open VCA

### Velocity
- **Range**: 0.0 - 1.0
- **Use**: Note dynamics, filter mod

### Trigger
- **Type**: Momentary pulse
- **Use**: Clock S&H, advance sequencer

---

## 🎚️ Parameter Ranges

| Parameter | Min | Max | Sweet Spot |
|-----------|-----|-----|------------|
| **Filter Cutoff** | 100 Hz | 8000 Hz | 400-2000 Hz |
| **Resonance** | 0 | 20 | 5-12 |
| **Attack** | 0.001 s | 1 s | 0.01-0.1 s |
| **Decay** | 0.01 s | 1 s | 0.05-0.2 s |
| **Sustain** | 0 | 1 | 0.3-0.6 |
| **Release** | 0.01 s | 2 s | 0.1-0.5 s |
| **Tempo** | 60 BPM | 180 BPM | 120-130 BPM |

---

## 🎵 Preset Settings

### Acid Bass
```javascript
VCO1: 55 Hz sawtooth
Filter: 400 Hz, Q=12
Envelope: A=0.001, D=0.05, S=0.3, R=0.1
Tempo: 120 BPM
```

**Patches:**
```
sequencer.CV   → vco1.CV
sequencer.GATE → env.GATE
vco1.OUT       → vcf.IN
env.OUT        → vcf.CUTOFF
vcf.OUT        → vca.IN
env.OUT        → vca.CV
```

### Techno Lead
```javascript
VCO1: 220 Hz sawtooth
VCO2: 220 Hz square
Filter: 2000 Hz, Q=6
Envelope: A=0.01, D=0.2, S=0.6, R=0.3
Tempo: 130 BPM
```

**Patches:**
```
sequencer.CV       → vco1.CV, vco2.CV
sequencer.GATE     → env.GATE
sequencer.VELOCITY → vcf.CUTOFF
vco1.OUT, vco2.OUT → vcf.IN
vcf.OUT            → vca.IN
env.OUT            → vca.CV
```

### Random Melody
```javascript
VCO1: 440 Hz square
Filter: 1200 Hz, Q=5
Envelope: A=0.005, D=0.1, S=0.4, R=0.2
Tempo: 100 BPM
```

**Patches:**
```
noise.WHITE    → snh.IN
sequencer.TRIG → snh.TRIG
snh.OUT        → vco1.CV
sequencer.GATE → env.GATE
vco1.OUT       → vcf.IN
vcf.OUT        → vca.IN
env.OUT        → vca.CV
```

---

## 🔧 Common Tweaks

### Make it Punchier
- ↓ Attack (0.001s)
- ↓ Decay (0.05s)
- ↓ Release (0.1s)
- ↑ Filter cutoff (1000 Hz)

### Make it Warmer
- Change VCO to triangle/sine
- ↓ Filter cutoff (500 Hz)
- ↓ Resonance (2-4)
- ↑ Attack (0.05s)

### Add Movement
- Patch LFO → VCO.CV (vibrato)
- Patch LFO → VCF.CUTOFF (wah)
- ↑ Envelope modulation
- Use velocity → filter

### Make it Brighter
- ↑ Filter cutoff (2000-4000 Hz)
- Patch velocity → cutoff
- Use sawtooth waveform
- Add 2nd oscillator

---

## 🎹 Frequency Reference

| Note | Frequency | CV Voltage |
|------|-----------|------------|
| C3 | 130.81 Hz | -1.0 V |
| C4 | 261.63 Hz | 0.0 V |
| C5 | 523.25 Hz | 1.0 V |
| C6 | 1046.50 Hz | 2.0 V |
| C7 | 2093.00 Hz | 3.0 V |

---

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play/Stop sequencer |
| **1-3** | Load preset 1-3 |
| **↑/↓** | Adjust tempo |
| **[/]** | Adjust filter cutoff |
| **-/+** | Adjust resonance |

*(Not yet implemented - future feature)*

---

## 🐛 Quick Fixes

### No Sound?
1. Click anywhere to start audio context
2. Check volume slider (should be > 0)
3. Load a preset first
4. Press Play button

### Sounds Wrong?
1. Check patch routing
2. Verify VCO frequencies (50-8000 Hz)
3. Reset filter cutoff to 1000 Hz
4. Try a different preset

### Clicks/Pops?
1. ↑ Attack time (min 0.005s)
2. ↓ Resonance (below 15)
3. Check CPU usage
4. Reduce tempo

---

## 📱 Code Snippets

### Load Preset
```javascript
patchSequencer.loadPresetWithPattern('acid-bass');
```

### Start/Stop
```javascript
sequencer.start();
sequencer.stop();
```

### Change Tempo
```javascript
sequencer.setTempo(130); // BPM
```

### Adjust Filter
```javascript
audioEngine.setFilterCutoff(1200);    // Hz
audioEngine.setFilterResonance(8);    // Q
```

### Get Sequencer State
```javascript
const state = patchSequencer.getSequencerState();
// { cv, gate, frequency, isPlaying, currentStep }
```

### Listen to Events
```javascript
window.addEventListener('patchSequencerStep', (e) => {
    console.log('Step:', e.detail.step);
    console.log('Pitch:', e.detail.pitch);
    console.log('Frequency:', e.detail.frequency);
});
```

---

## 🎨 Visual Indicators

- **Blue glow** = Step currently playing
- **Purple glow** = Step has note programmed
- **Cable glow** = Patch actively routing signal
- **CV bar** = Control voltage level (0-5V)
- **Gate bar** = Gate on/off state

---

## 📚 Learn More

- **Full Guide**: `docs/SEQUENCER_PATCH_INTEGRATION.md`
- **Sound Quality**: `docs/SOUND_QUALITY_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md`

---

## 💡 Pro Tips

1. **Layer patches** - Combine multiple VCOs for thick sound
2. **Use velocity** - Route to filter for dynamic timbre
3. **Experiment with S&H** - Random patches create happy accidents
4. **Modulate everything** - LFO → any CV input
5. **Watch the meters** - CV/Gate displays show what's happening
6. **Start simple** - Load preset, tweak one thing at a time
7. **Save settings** - Note what works for your style

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready
