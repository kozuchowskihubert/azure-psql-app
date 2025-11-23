# 🎛️ haos.fm Modular Synthesis System

**Version:** 2.6.0  
**Architecture:** ES6 Modules + Web Audio API  
**Framework:** Modular Device Groups (Like Hardware Patch Bay)

## 📦 Available Modules

### Core System

#### `core-audio-engine.js` (449 lines)
Centralized Web Audio API management and routing system.

**Features:**
- AudioContext initialization with autoplay policy handling
- Module registration and connection matrix
- Master gain and analyzer nodes
- Audio node factories (gain, filter, oscillator, delay, etc.)
- Noise generation (white, pink, brown)
- Distortion curve utilities
- Parameter scheduling (exponential/linear ramps)
- Lifecycle management (init, suspend, resume, dispose)

**Usage:**
```javascript
const engine = new CoreAudioEngine({ autoInit: false });
await engine.init();

// Register modules
engine.registerModule('bass', bassModule);

// Route audio
engine.connect(bassModule.output, engine.getMasterOutput());

// Get status
console.log(engine.getStatus());
```

---

### Rhythm & Drums Modules

#### `drums.js` (700+ lines)
Professional drum synthesizer supporting both trap and techno styles.

**5 Drum Voices:**
- **Kick** - Dual oscillator (body + punch) with pitch envelope
- **Snare** - Triangle tone + white noise blend
- **Hi-Hat** - 4 inharmonic square waves + filtered noise
- **Clap** - Layered noise bursts
- **Perc** - Tuned percussion

**Parameters:**
- **Kick**: `pitch` (30-150 Hz), `decay` (0.05-1.0s), `punch` (0-1), `gain` (0-1)
- **Snare**: `pitch` (100-400 Hz), `decay` (0.05-0.5s), `snap` (0-1), `gain` (0-1)
- **Hi-Hat**: `decay` (0.02-0.5s), `tone` (5000-15000 Hz), `gain` (0-1)
- **Clap**: `decay` (0.05-0.3s), `tone` (1000-3000 Hz), `gain` (0-1)
- **Perc**: `pitch` (400-2000 Hz), `decay` (0.02-0.3s), `gain` (0-1)

**Presets:**
- `trap` - 808-style drums
- `techno` - 909-style four-on-the-floor
- `808` - Classic Roland TR-808
- `909` - Classic Roland TR-909
- `minimal` - Stripped-down techno
- `hard` - Hard techno/industrial

**Usage:**
```javascript
const drums = new Drums(audioEngine);
drums.output.connect(audioEngine.getMasterOutput());

// Load preset
drums.loadPreset('trap');

// Trigger individual drums
drums.triggerKick(1.0);
drums.triggerSnare(0.8);
drums.triggerHiHat(0.6, null, false); // Closed hi-hat
drums.triggerHiHat(0.7, null, true);  // Open hi-hat
drums.triggerClap(0.9);
drums.triggerPerc(0.5);

// Trigger pattern
const pattern = {
    kick:   [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    snare:  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat:  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
};
drums.triggerPattern(pattern, 120); // 120 BPM
```

---

#### `sequencer.js` (550+ lines)
Professional 16-step grid sequencer with pattern management.

**Features:**
- 16-step grid sequencer
- Multiple instrument tracks
- BPM synchronization (40-300 BPM)
- Swing/shuffle (0-100%)
- Pattern storage and presets
- Pattern chaining
- Transport controls

**Parameters:**
- `bpm` - Tempo (40-300 BPM)
- `swing` - Swing amount (0-1)
- `steps` - Number of steps (default 16)
- `loop` - Loop pattern (boolean)

**Presets:**
- `trapBasic` - Basic trap beat
- `trapRolling` - Rolling hi-hats
- `technoBasic` - Four-on-the-floor
- `technoMinimal` - Minimal techno
- `technoHard` - Hard techno

**Usage:**
```javascript
const sequencer = new Sequencer(audioEngine, { 
    bpm: 128,
    swing: 0.3 
});

// Register modules
sequencer.registerModule('Kick', (velocity, time) => {
    drums.triggerKick(velocity, time);
});
sequencer.registerModule('Snare', (velocity, time) => {
    drums.triggerSnare(velocity, time);
});

// Load pattern preset
sequencer.loadPreset('trapBasic');

// Or set custom pattern (as velocities 0-1)
sequencer.setPattern('Kick', 
    [1, 0, 0, 0, 0, 0, 0.7, 0, 1, 0, 0, 0, 0, 0, 0.6, 0], 
    true // asVelocities
);

// Add step callback for visualization
sequencer.onStepCallback = (step, time) => {
    console.log(`Step ${step}`);
    highlightStep(step); // Your UI update function
};

// Transport controls
sequencer.start();
sequencer.pause();
sequencer.resume();
sequencer.stop();

// Get status
console.log(sequencer.getStatus());
```

---

### Bass Synthesis Modules

#### `bass-808.js` (500+ lines)
Authentic 808 sub-bass synthesizer with analog modeling.

**Signal Flow:**  
VCO (Dual Sine) → VCF (24dB/oct) → Distortion → VCA → Output

**Parameters:**
- `frequency` - Note frequency (30-150 Hz)
- `decay` - Amplitude decay time (0.1-2.0s)
- `cutoff` - Filter cutoff (100-2000 Hz)
- `resonance` - Filter resonance (0-1)
- `distortion` - Harmonic saturation (0-1)
- `glide` - Pitch glide time (0-0.5s)
- `envelopeAmount` - Filter envelope depth (0-1)
- `detune` - Oscillator detune (0.95-1.05)
- `gain` - Output gain (0-1)

**Presets:**
- `classic` - Vintage 808 bass
- `deep` - Deep sub bass
- `punchy` - Kick-style bass
- `rolling` - Rolling bassline
- `distorted` - Modern distorted
- `melodic` - Melodic bass with glide

**Usage:**
```javascript
const bass808 = new Bass808(audioEngine);
bass808.output.connect(audioEngine.getMasterOutput());

// Load preset
bass808.loadPreset('classic');

// Trigger note
bass808.trigger(55, 1.0); // A1, full velocity

// Manual parameters
bass808.setParameters({
    frequency: 60,
    decay: 0.7,
    cutoff: 300,
    resonance: 0.6
});
```

**Note Frequencies:**
```javascript
Bass808.getNoteFrequency('A'); // 55 Hz
Bass808.getNoteFrequency('C#'); // 34.6 Hz
Bass808.getNoteFrequency('G'); // 49 Hz
```

---

#### `bass-303.js` (470+ lines)
TB-303 acid bass synthesizer with ladder filter emulation.

**Signal Flow:**  
VCO (Saw/Square) → Ladder Filter (4-stage) → Distortion → VCA → Output

**Parameters:**
- `waveform` - 'sawtooth' or 'square'
- `cutoff` - Ladder filter cutoff (200-4000 Hz)
- `resonance` - Self-oscillating resonance (0-1)
- `envMod` - Filter envelope modulation (0-1)
- `decay` - Filter decay time (0.05-2.0s)
- `accent` - Accent amount (0-1)
- `glide` - Portamento/slide time (0-0.5s)
- `distortion` - Wave shaping (0-100)
- `gain` - Output gain (0-1)

**Presets:**
- `classic` - Classic acid bass
- `aggressive` - Hard square wave acid
- `deep` - Deep minimal bass
- `squelchy` - High resonance squelch
- `hard` - Hard techno style
- `detroit` - Detroit techno bass
- `liquid` - Liquid acid with glide

**Usage:**
```javascript
const bass303 = new Bass303(audioEngine);
bass303.output.connect(audioEngine.getMasterOutput());

// Load preset
bass303.loadPreset('squelchy');

// Trigger with accent
bass303.trigger(130.81, 0.9, false); // C3, accent, no slide

// Slide between notes
bass303.trigger(165.41, 0.8, true); // E3, slide from previous

// Manual parameters
bass303.setParameters({
    waveform: 'sawtooth',
    cutoff: 1200,
    resonance: 0.85,
    envMod: 0.7,
    glide: 0.12
});
```

**Note Frequencies:**
```javascript
Bass303.getNoteFrequency('C3'); // 130.81 Hz
Bass303.getNoteFrequency('F#3'); // 185.00 Hz
Bass303.getNoteFrequency('A#3'); // 233.08 Hz
```

---

## 🔌 Module Architecture

### Connection Patterns

**1. Direct Connection**
```javascript
module.output.connect(audioEngine.getMasterOutput());
```

**2. Serial Chain (Effects)**
```javascript
bass808.output.connect(delay.input);
delay.output.connect(reverb.input);
reverb.output.connect(audioEngine.getMasterOutput());
```

**3. Parallel Routing (Mixer)**
```javascript
bass808.output.connect(mixer.input1);
bass303.output.connect(mixer.input2);
mixer.output.connect(audioEngine.getMasterOutput());
```

**4. Module Registration**
```javascript
audioEngine.registerModule('808bass', bass808);
audioEngine.registerModule('303bass', bass303);

// Retrieve later
const bass = audioEngine.getModule('808bass');
```

---

## 🎨 Integration Examples

### Example 1: Basic Trigger
```javascript
// Initialize
const engine = new CoreAudioEngine();
await engine.init();

const bass = new Bass808(engine);
bass.output.connect(engine.getMasterOutput());

// Play note
bass.trigger(55, 1.0); // A1
```

### Example 2: Pattern Playback
```javascript
const pattern = [
    { note: 55, time: 0.0, velocity: 1.0 },
    { note: 65, time: 0.5, velocity: 0.8 },
    { note: 49, time: 1.0, velocity: 1.0 },
    { note: 55, time: 1.5, velocity: 0.9 }
];

const ctx = engine.getContext();
const now = ctx.currentTime;

pattern.forEach(step => {
    bass808.trigger(step.note, step.velocity, now + step.time);
});
```

### Example 3: Acid Bassline with Slide
```javascript
// Animate filter cutoff
function animateFilter() {
    const time = Date.now() / 1000;
    const cutoff = 300 + Math.sin(time) * 200;
    bass808.setCutoff(cutoff);
    requestAnimationFrame(animateFilter);
}
animateFilter();
```

---

## 🧪 Testing & Demos

### Live Demo
Open `modular-demo.html` in a browser:
```bash
open app/public/modular-demo.html
```

Features:
- ✅ Real-time parameter controls
- ✅ Preset loading
- ✅ 808 and 303 side-by-side
- ✅ Live trigger buttons
- ✅ Visual feedback

### Module Testing
```javascript
// Test 808 bass
const bass808 = new Bass808(engine);
bass808.loadPreset('classic');
bass808.trigger(55, 1.0);

// Test parameter changes
bass808.setCutoff(400);
bass808.setResonance(0.8);
bass808.setDistortion(0.5);

// Cleanup
bass808.dispose();
```

---

## 📁 File Structure

```
app/public/modules/
├── core-audio-engine.js    # Audio engine (449 lines)
├── bass-808.js             # 808 bass module (500+ lines)
├── bass-303.js             # TB-303 module (470+ lines)
└── README.md               # This file

app/public/
└── modular-demo.html       # Live demo interface
```

---

## 🚀 Roadmap

### ✅ Completed (v2.6.0)
- [x] Core Audio Engine
- [x] 808 Bass Synthesis Module
- [x] TB-303 Acid Bass Module
- [x] Live demo interface
- [x] Preset systems

### 🔄 In Progress
- [ ] Drum Synthesis Module (kick, snare, hi-hat)
- [ ] Sequencer Engine (16-step patterns)
- [ ] Effects Rack (delay, reverb, chorus, EQ)

### 📋 Planned
- [ ] UI Component Library (knobs, sliders, grids)
- [ ] Pattern Library (preset patterns)
- [ ] Module Integration System (patch bay)
- [ ] MIDI support
- [ ] Sample playback engine
- [ ] Chord generator module
- [ ] Arpeggiator module

---

## 💡 Best Practices

### 1. Always Initialize Engine First
```javascript
const engine = new CoreAudioEngine({ autoInit: false });
await engine.init(); // Wait for AudioContext
```

### 2. Connect Modules to Master
```javascript
module.output.connect(engine.getMasterOutput());
```

### 3. Dispose Modules When Done
```javascript
bass808.dispose();
bass303.dispose();
engine.dispose();
```

### 4. Use Presets for Quick Setup
```javascript
bass808.loadPreset('deep');
bass303.loadPreset('squelchy');
```

### 5. Schedule Notes Precisely
```javascript
const ctx = engine.getContext();
const now = ctx.currentTime;
bass.trigger(freq, velocity, now + 0.5); // 500ms from now
```

---

## 🐛 Troubleshooting

**Issue:** No sound output  
**Solution:** Ensure `engine.init()` is called and AudioContext is running

**Issue:** Autoplay blocked  
**Solution:** Call `engine.resume()` after user interaction

**Issue:** Distortion/clipping  
**Solution:** Reduce module gain or master volume:
```javascript
engine.setMasterVolume(0.7);
bass808.setGain(0.6);
```

**Issue:** Filter not responding  
**Solution:** Ensure note is not playing when changing static parameters

---

## 📚 References

- [Web Audio API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [TB-303 Service Manual](https://www.firstpr.com.au/rwi/dfish/303-slide.html)
- [808 Bass Synthesis Theory](https://www.soundonsound.com/techniques/synthesizing-bass-drums)

---

## 📄 License

haos.fm © 2024 - Modular Synthesis System  
Built with Web Audio API and modern JavaScript

---

**🎵 Happy Patching! 🎵**
