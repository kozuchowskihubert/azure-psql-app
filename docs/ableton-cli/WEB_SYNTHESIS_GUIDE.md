# Web Audio Synthesis Guide

## Overview

The web-based synthesis engine implements a complete subtractive synthesizer using the Web Audio API. This guide explains how the synthesis works and how to use it effectively.

## Architecture

### Signal Flow

```
VCO1 (Oscillator 1) ──┐
                      ├─→ VCF (Filter) ─→ VCA (Envelope) ─→ Analyzers ─→ Output
VCO2 (Oscillator 2) ──┘         ↑
                                │
                        LFO (Modulation)
```

### Components

#### 1. VCO (Voltage Controlled Oscillators)
- **VCO1**: Primary sound source
- **VCO2**: Secondary sound source (can be detuned for richness)
- **Waveforms**: Sawtooth, Square, Triangle, Sine
- **Frequency Range**: 20 Hz - 2000 Hz

#### 2. VCF (Voltage Controlled Filter)
- **Type**: Biquad filter (lowpass, bandpass, highpass)
- **Cutoff Range**: 20 Hz - 20,000 Hz
- **Resonance**: 0.0 - 1.0 (Q factor up to 30)
- **Modulation**: LFO can modulate cutoff for movement

#### 3. VCA (Voltage Controlled Amplifier)
- **ADSR Envelope**:
  - **Attack**: 0.001s - 2s (fade in time)
  - **Decay**: 0.001s - 2s (time to reach sustain)
  - **Sustain**: 0.0 - 1.0 (hold level)
  - **Release**: 0.01s - 5s (fade out time)

#### 4. LFO (Low Frequency Oscillator)
- **Frequency**: 0.1 Hz - 20 Hz
- **Waveforms**: Sine, Triangle, Square, Sawtooth
- **Depth**: Controls modulation amount
- **Target**: Filter cutoff (creates wobble/movement)

#### 5. Visualization
- **Waveform View**: Oscilloscope showing time-domain signal
- **Spectrum View**: Frequency analyzer showing harmonic content
- **Canvas**: 280x120 pixels, cyan border, black background

## Usage

### Playing Notes

1. **Select Frequency**: Use the "Note" slider (110-880 Hz)
   - 110 Hz = A2 (low)
   - 220 Hz = A3
   - 440 Hz = A4 (middle A)
   - 880 Hz = A5 (high)

2. **Set Duration**: Adjust "Duration" slider (0.1-5 seconds)

3. **Click "Play Synthesized Note"**: Hear the result with ADSR envelope

4. **Click "Stop"**: Release envelope and stop immediately

### Shaping Sound

#### VCO1 Controls
- **Frequency Slider**: Adjust pitch in real-time
- **Waveform Buttons**: Switch between Saw/Square/Triangle/Sine
  - **Sawtooth**: Bright, rich harmonics (best for bass/leads)
  - **Square**: Hollow, nasal tone (good for reeds/bass)
  - **Triangle**: Warmer than square, fewer harmonics
  - **Sine**: Pure tone, no harmonics (smooth, mellow)

#### VCF (Filter) Controls
- **Cutoff Slider**: Adjust brightness
  - **Low (20-200 Hz)**: Dark, muffled, sub-bass
  - **Mid (200-2000 Hz)**: Warm, balanced
  - **High (2000-20000 Hz)**: Bright, open, full spectrum

- **Resonance Slider**: Add emphasis at cutoff frequency
  - **0.0**: Smooth, no emphasis
  - **0.3-0.5**: Slight boost, character
  - **0.7-0.9**: Strong emphasis, "screaming" sound
  - **1.0**: Self-oscillation (filter can sing on its own)

### Loading Presets

1. **Browse Preset Library**: Left sidebar shows 100 presets by category
   - Bass, Lead, Pad, FX, Percussion, etc.

2. **Click a Preset**: Automatically loads parameters into synthesis engine
   - VCO frequencies updated
   - Filter cutoff/resonance loaded
   - Envelope settings applied
   - LFO configured (if preset uses it)

3. **UI Updates**: Sliders automatically adjust to match preset values

4. **Try Variations**: After loading, adjust sliders to explore sound design

## Sound Design Tips

### Creating Bass Sounds
```
VCO1: Sawtooth or Square, 55-110 Hz
VCF: Cutoff 200-500 Hz, Resonance 0.5-0.8
ENV: Quick attack (0.001s), short decay (0.05s), low sustain (0.3), short release (0.1s)
```

### Creating Lead Sounds
```
VCO1: Sawtooth, 440-880 Hz
VCF: Cutoff 1000-3000 Hz, Resonance 0.3-0.6
ENV: Medium attack (0.01s), medium decay (0.1s), high sustain (0.8), medium release (0.3s)
LFO: Optional vibrato (sine wave, 5 Hz, low depth)
```

### Creating Pad Sounds
```
VCO1: Triangle or Sine, 220-440 Hz
VCO2: Slightly detuned (+2 Hz) for richness
VCF: Cutoff 800-1500 Hz, Low resonance (0.1-0.3)
ENV: Slow attack (0.5-2s), long decay (0.5s), high sustain (0.9), long release (2-5s)
```

### Creating FX/Wobble Bass
```
VCO1: Sawtooth, 55-110 Hz
VCF: Cutoff 500 Hz, High resonance (0.8-1.0)
LFO: Modulate filter (sine or triangle, 0.5-4 Hz, high depth)
ENV: Short attack, medium sustain
```

## Visualization Modes

### Waveform View
- **Purpose**: See the actual audio waveform (time domain)
- **What to Look For**:
  - **Sine**: Smooth, rounded waves
  - **Sawtooth**: Sharp, ramp-shaped waves
  - **Square**: Rectangular pulses
  - **Complex**: Multiple oscillators create interference patterns
- **Use**: Visual feedback while adjusting oscillators

### Spectrum View
- **Purpose**: See frequency content (frequency domain)
- **What to Look For**:
  - **Low Frequencies**: Left side (bass energy)
  - **High Frequencies**: Right side (brightness)
  - **Harmonic Peaks**: Individual partials/overtones
  - **Filter Effect**: Cutoff creates slope in spectrum
- **Use**: Understand harmonic richness and filter behavior

## Real-Time Parameter Updates

All parameters can be adjusted **while a note is playing**:

1. **Start Playing**: Click "Play Synthesized Note"
2. **Adjust Sliders**: Move VCO1 frequency, filter cutoff, resonance
3. **Hear Changes**: Parameters update in real-time (no latency)
4. **Visualize**: Waveform/spectrum updates immediately

This is perfect for:
- Finding the "sweet spot" for filter cutoff
- Adjusting resonance to taste
- Exploring detuning effects
- Understanding parameter relationships

## Technical Implementation

### Web Audio API Nodes

```javascript
// Audio graph structure
const audioContext = new AudioContext();

// Oscillators (VCO1, VCO2)
const vco1 = audioContext.createOscillator();
vco1.type = 'sawtooth';
vco1.frequency.value = 440;

const vco2 = audioContext.createOscillator();
vco2.type = 'sawtooth';
vco2.detune.value = 2; // Slight detune for richness

// Filter (VCF)
const filter = audioContext.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000;
filter.Q.value = 1.0; // Resonance

// LFO (modulation)
const lfo = audioContext.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 5;

const lfoGain = audioContext.createGain();
lfoGain.gain.value = 500; // Modulation depth

// Connect LFO to filter cutoff
lfo.connect(lfoGain);
lfoGain.connect(filter.frequency);

// Signal chain
vco1.connect(filter);
vco2.connect(filter);
filter.connect(audioContext.destination);
```

### ADSR Envelope Implementation

```javascript
function applyEnvelope(gainNode, attack, decay, sustain, release, duration) {
    const now = audioContext.currentTime;
    const attackTime = now + attack;
    const decayTime = attackTime + decay;
    const releaseTime = now + duration;
    
    // Start at 0
    gainNode.gain.setValueAtTime(0, now);
    
    // Attack: rise to 1.0
    gainNode.gain.linearRampToValueAtTime(1.0, attackTime);
    
    // Decay: fall to sustain level
    gainNode.gain.linearRampToValueAtTime(sustain, decayTime);
    
    // Sustain: hold at sustain level
    gainNode.gain.setValueAtTime(sustain, releaseTime);
    
    // Release: fade to 0
    gainNode.gain.linearRampToValueAtTime(0, releaseTime + release);
}
```

### Analyzers for Visualization

```javascript
// Waveform analyzer (time domain)
const waveformAnalyzer = audioContext.createAnalyser();
waveformAnalyzer.fftSize = 2048;
const waveformData = new Uint8Array(waveformAnalyzer.frequencyBinCount);

// Spectrum analyzer (frequency domain)
const spectrumAnalyzer = audioContext.createAnalyser();
spectrumAnalyzer.fftSize = 256;
const spectrumData = new Uint8Array(spectrumAnalyzer.frequencyBinCount);

// Connect to signal chain
filter.connect(waveformAnalyzer);
filter.connect(spectrumAnalyzer);

// Animation loop
function animate() {
    waveformAnalyzer.getByteTimeDomainData(waveformData);
    spectrumAnalyzer.getByteFrequencyData(spectrumData);
    
    // Draw to canvas
    drawWaveform(waveformData);
    drawSpectrum(spectrumData);
    
    requestAnimationFrame(animate);
}
```

## Integration with Preset System

When you load a preset from the library:

1. **API Call**: `/api/music/synth2600/preset/:name`
2. **Response**: Full preset JSON with modules and parameters
3. **Synthesis Engine**: Loads parameters:
   ```javascript
   synthEngine.loadPreset({
       name: "Acid Bass - 303 Style",
       modules: {
           VCO1: { frequency: 110, waveform: "sawtooth" },
           VCO2: { frequency: 110, waveform: "sawtooth", detune: 2 },
           VCF: { cutoff: 0.2, resonance: 0.7, mode: "lowpass" },
           ENV1: { attack: 0.001, decay: 0.05, sustain: 0.3, release: 0.1 }
       },
       modulators: {
           LFO: null // No LFO for this preset
       }
   });
   ```
4. **UI Update**: Sliders automatically adjust to match preset
5. **Ready to Play**: Click "Play Synthesized Note" to hear it

## Performance Notes

- **Audio Context**: Single shared context for all synthesis
- **Voice Management**: Creates voice on playNote(), cleans up after release
- **CPU Usage**: Very efficient (Web Audio runs in separate thread)
- **Latency**: Near-zero (sample-accurate scheduling)
- **Browser Compatibility**: Works in Chrome, Firefox, Safari, Edge (all modern browsers)

## Keyboard Shortcuts (Future Enhancement)

```
Q W E R T Y U I O P [ ]  = Piano keys (C4-C5)
Z X C V B N M , . /      = Lower octave (C3-C4)
```

## MIDI Input (Future Enhancement)

Connect USB MIDI keyboard:
1. Browser requests MIDI access
2. MIDI messages → Note On/Off events
3. Velocity → Envelope intensity
4. Pitch bend → Frequency modulation
5. Mod wheel → Filter cutoff or LFO depth

## Export Features (Future Enhancement)

- **Audio Recording**: Capture synthesis to WAV file
- **MIDI Export**: Already implemented (generates MIDI file)
- **Preset Save**: Save custom patches to library

## Troubleshooting

### No Sound
1. **Check volume**: System volume, browser tab volume
2. **Audio context**: May require user interaction to start (click play)
3. **Browser console**: Check for Web Audio API errors

### Distortion/Clipping
1. **Reduce resonance**: High resonance can cause clipping
2. **Lower volume**: Master gain too high
3. **Check oscillator mix**: Both VCO1+VCO2 might be too loud

### Performance Issues
1. **Close other tabs**: Free up CPU
2. **Reduce visualizer refresh**: Lower animation frame rate
3. **Stop unused voices**: Click "Stop" when not playing

## Next Steps

1. **Experiment**: Try loading different presets and tweaking parameters
2. **Design Sounds**: Use the guide above to create bass/lead/pad sounds
3. **Compare Presets**: Use `compare_presets.py` CLI tool to analyze differences
4. **Explore Variations**: Use `show_preset_variations.py` to see parameter alternatives
5. **Visualize Patches**: Use `visualize_patch.py` to see cable routing

## Resources

- **Web Audio API Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Synthesis Tutorial**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth
- **ARP 2600 Manual**: Classic synth reference for parameter understanding
- **Preset Library**: `app/ableton-cli/preset_library.json` (100 presets)

---

**Created**: 2024
**Author**: Azure PostgreSQL Music Production App Team
**Status**: Production-ready
