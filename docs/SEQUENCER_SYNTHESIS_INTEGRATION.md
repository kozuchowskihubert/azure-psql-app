# 🎛️ Sequencer-Synthesis Engine Integration

## Overview

Successfully connected the step sequencer and virtual keyboard to the synthesis engine in the Behringer 2600 Studio app. Notes now play through the customizable synthesis engine with velocity control and real-time parameter adjustments.

---

## 🎯 What Was Implemented

### 1. Sequencer → Synthesis Engine Connection

**When the sequencer plays a step:**
1. Converts MIDI pitch to frequency (440Hz * 2^((pitch-69)/12))
2. Plays note through polyphonic synthesis engine
3. Applies velocity from step data
4. Uses current synthesis parameters (VCO, VCF, envelope, etc.)
5. Auto-calculates note duration based on tempo

**Code Location**: `synth-2600-studio.html` lines 2512-2544

```javascript
function setupSequencerEvents() {
    sequencer.addEventListener(({event, data}) => {
        if (event === 'step' && data.gate > 0) {
            // Convert MIDI to frequency
            const frequency = 440 * Math.pow(2, (data.pitch - 69) / 12);
            
            // Calculate duration from tempo
            const noteDuration = (60 / sequencer.tempo) * 0.8;
            
            // Play through synthesis engine with velocity
            synthEngine.playPolyNote(frequency, data.velocity, noteDuration);
        }
    });
}
```

---

### 2. Keyboard → Synthesis Engine Connection

**When keyboard plays a note:**
1. Uses note frequency from virtual keyboard
2. Applies velocity (default 0.8 or customizable)
3. Plays through synthesis engine with current parameters
4. Supports polyphonic playback (up to 4 voices)

**Code Location**: `synth-2600-studio.html` lines 2546-2577

```javascript
function setupKeyboardEvents() {
    keyboard.addEventListener(({event, data}) => {
        if (event === 'noteOn') {
            // Play note with frequency and velocity
            synthEngine.playPolyNote(data.frequency, data.velocity, 2.0);
        }
    });
}
```

---

### 3. Velocity-Sensitive Synthesis

**Updated `synthesis-engine.js`:**
- `playPolyNote(frequency, velocity, duration)` - Now accepts velocity parameter
- `createPolyVoice(frequency, velocity)` - Creates voice with velocity-scaled gain

**Velocity Scaling:**
```javascript
const peakGain = velocity * 0.5;  // 0.0-1.0 velocity → 0.0-0.5 gain
```

**Features:**
- Softer notes at low velocity (e.g., 0.3 → quiet)
- Louder notes at high velocity (e.g., 1.0 → full)
- ADSR envelope scaled by velocity
- Works with all synthesis parameters

---

## 🎚️ How to Use

### Via Sequencer

1. **Open the Studio**
   ```
   https://notesapp-dev-music-app.azurewebsites.net/synth-2600-studio.html
   ```

2. **Configure Synthesis Parameters**
   - Adjust VCO waveforms (sawtooth, square, triangle, sine)
   - Set filter cutoff and resonance
   - Configure ADSR envelope (attack, decay, sustain, release)
   - Adjust LFO for modulation

3. **Program the Sequencer**
   - Click on sequencer steps to edit
   - Set pitch (MIDI note number)
   - Set velocity (0.0-1.0)
   - Enable gate (on/off)
   - Set step to active

4. **Play**
   - Press Play button
   - Sequencer plays notes through synthesis engine
   - Each step uses current synthesis parameters
   - Velocity controls note dynamics

### Via Virtual Keyboard

1. **Click on Piano Keys**
   - Notes play through synthesis engine
   - Uses current VCO/VCF/envelope settings
   
2. **Use Computer Keyboard**
   - Keys map to notes (A-K for white keys, W-O for black keys)
   - Change octaves with arrow keys
   - Space bar for panic/all notes off

3. **Real-Time Parameter Control**
   - Adjust synthesis parameters while playing
   - Changes apply immediately to new notes
   - Create dynamic, evolving sounds

---

## 🎵 Signal Flow

```
SEQUENCER / KEYBOARD
    ↓
Pitch → Frequency Conversion
    ↓
SYNTHESIS ENGINE
    ├─ VCO1 (Oscillator 1) ─┐
    ├─ VCO2 (Oscillator 2) ─┤
    ↓                        ↓
    LFO Modulation      MIXER
    ↓                        ↓
FILTER (VCF)
    ├─ Cutoff (adjustable)
    ├─ Resonance (adjustable)
    └─ LFO modulation
    ↓
AMPLIFIER (VCA)
    ├─ ADSR Envelope
    └─ Velocity scaling
    ↓
MASTER GAIN → OUTPUT
    ↓
Audio Visualizer
```

---

## 🎹 Synthesis Parameters That Affect Notes

### VCO (Oscillators)
- **Waveform**: Sawtooth, Square, Triangle, Sine
- **Detune**: VCO2 detuning for thickness
- **Mix**: VCO1/VCO2 balance

### VCF (Filter)
- **Cutoff**: Frequency cutoff (100Hz - 8000Hz)
- **Resonance**: Peak at cutoff frequency
- **Mode**: Lowpass, Highpass, Bandpass

### Envelope (ADSR)
- **Attack**: Note fade-in time (0.001s - 1s)
- **Decay**: Decay to sustain time (0.01s - 1s)
- **Sustain**: Hold level (0.0 - 1.0)
- **Release**: Note fade-out time (0.01s - 2s)

### LFO (Modulation)
- **Frequency**: Modulation speed (0.1Hz - 20Hz)
- **Waveform**: Sine, Triangle, Sawtooth, Square
- **Depth**: Modulation amount

### Master
- **Volume**: Overall output level

---

## 💡 Creative Usage Examples

### 1. Classic Acid Bassline

**Setup:**
```
VCO1: Sawtooth, 55Hz base
VCF: Cutoff 400Hz, Resonance 0.8 (high)
Envelope: A=0.001, D=0.05, S=0.3, R=0.1 (fast)
Sequencer: Program 16 steps with varying pitches and velocities
```

**Result**: 303-style acid bass with squelchy filter

---

### 2. Ambient Pad

**Setup:**
```
VCO1: Sine wave
VCO2: Triangle wave (detuned +5 cents)
VCF: Cutoff 1200Hz, Resonance 0.2 (low)
Envelope: A=0.5, D=1.0, S=0.7, R=2.0 (slow)
LFO: 0.3Hz sine wave with medium depth
Keyboard: Play sustained chords
```

**Result**: Warm, evolving ambient pad

---

### 3. Percussive Sequence

**Setup:**
```
VCO1: Square wave
VCF: Cutoff 2000Hz, Resonance 0.5
Envelope: A=0.001, D=0.02, S=0.0, R=0.05 (very fast)
Sequencer: Program rhythmic pattern with high velocities
```

**Result**: Percussive, plucky sequence

---

### 4. Evolving Lead

**Setup:**
```
VCO1: Sawtooth
VCO2: Square (detuned +7 cents)
VCF: Cutoff 3000Hz, Resonance 0.4
Envelope: A=0.01, D=0.2, S=0.6, R=0.3
LFO: 5Hz triangle → VCF cutoff
Keyboard: Play melody
```

**Result**: Bright, moving lead sound

---

## 🔧 Technical Details

### Polyphonic Playback
- **Max Voices**: 4 simultaneous notes
- **Voice Stealing**: Oldest note removed when exceeding max
- **Voice Retriggering**: Same frequency retriggers envelope

### Frequency Conversion
```javascript
// MIDI to Frequency (A4 = 440Hz)
frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

// Examples:
// MIDI 60 (C4)  → 261.63 Hz
// MIDI 69 (A4)  → 440.00 Hz
// MIDI 72 (C5)  → 523.25 Hz
```

### Note Duration
```javascript
// Sequencer: 80% of step duration
noteDuration = (60 / tempo) * 0.8;

// At 120 BPM:
// Step duration = 0.5s
// Note duration = 0.4s (allows for gap between notes)
```

### Velocity Scaling
```javascript
// Velocity range: 0.0 (silent) to 1.0 (full)
// Gain scaling: velocity * 0.5 (reduced for polyphony)

// Examples:
// Velocity 0.3 → Gain 0.15 (quiet)
// Velocity 0.8 → Gain 0.40 (medium)
// Velocity 1.0 → Gain 0.50 (full)
```

---

## 🎯 Testing the Integration

### Test 1: Sequencer Playback

1. Open synth-2600-studio.html
2. Configure synthesis parameters
3. Click on a sequencer step
4. Set pitch = 60 (C4), velocity = 0.8, gate = ON
5. Press Play on sequencer
6. **Expected**: Hear note at C4 frequency with synthesis parameters applied

### Test 2: Velocity Response

1. Create two steps:
   - Step 1: pitch = 60, velocity = 0.3
   - Step 2: pitch = 60, velocity = 1.0
2. Press Play
3. **Expected**: Step 2 should be significantly louder than Step 1

### Test 3: Parameter Changes

1. Start sequencer playing
2. Adjust filter cutoff slider
3. **Expected**: Sound brightness changes in real-time

### Test 4: Keyboard Integration

1. Click on piano keyboard
2. **Expected**: Note plays through synthesis engine
3. Try different synthesis parameters
4. **Expected**: Sound character changes

---

## 📊 Browser Console Output

When integration is working, you'll see:

```
✅ Synthesis engine ready
✅ Sequencer and Keyboard initialized
🎹 Playing: 60 (261.63 Hz) @ vel=0.80, dur=0.40s
Step 0: CV=0.00V, Gate=1, Vel=0.80
🎹 Keyboard: C4 (261.63 Hz), CV=0.00V, Vel=0.80
```

---

## 🐛 Troubleshooting

### No Sound When Sequencer Plays

**Check:**
1. Synthesis engine initialized (check console)
2. Master volume slider is up
3. Filter cutoff not too low (try 1000Hz)
4. Envelope attack not too long (try 0.01s)
5. Browser audio context started (click anywhere first)

### Keyboard Works But Sequencer Doesn't

**Check:**
1. Sequencer steps have gate=ON
2. Step velocity > 0
3. Tempo is reasonable (60-180 BPM)
4. Audio context not suspended (check browser)

### Sound Too Quiet

**Increase:**
- Master volume
- Velocity values in sequencer steps
- Envelope sustain level

### Sound Distorted

**Decrease:**
- Master volume
- Filter resonance (below 0.8)
- Number of simultaneous notes

---

## 🚀 Next Steps

### Immediate Use
1. ✅ Open Azure app: https://notesapp-dev-music-app.azurewebsites.net/synth-2600-studio.html
2. ✅ Configure synthesis parameters
3. ✅ Program sequencer or play keyboard
4. ✅ Hear notes through synthesis engine!

### Future Enhancements
- [ ] Patch matrix routing for sequencer
- [ ] MIDI input support
- [ ] Pattern presets for sequencer
- [ ] More synthesis parameters
- [ ] Effects chain (reverb, delay)

---

## 📝 Files Modified

```
✅ synth-2600-studio.html
   - setupSequencerEvents() - Added synthesis playback
   - setupKeyboardEvents() - Added synthesis playback
   
✅ synthesis-engine.js
   - playPolyNote() - Added velocity parameter
   - createPolyVoice() - Added velocity scaling
```

---

## ✨ Summary

**Before**: Sequencer and keyboard only logged events, no sound

**After**: 
- ✅ Sequencer plays notes through synthesis engine
- ✅ Keyboard plays notes through synthesis engine
- ✅ Velocity controls note dynamics
- ✅ Real-time synthesis parameter control
- ✅ Polyphonic playback (4 voices)
- ✅ Full ADSR envelope control
- ✅ Filter, oscillator, LFO customization

**Result**: Complete integration between sequencer/keyboard and synthesis engine with full customization!

---

**Status**: ✅ COMPLETE  
**Ready to deploy**: YES  
**Testing needed**: Test on Azure app

**Live URL**: https://notesapp-dev-music-app.azurewebsites.net/synth-2600-studio.html
