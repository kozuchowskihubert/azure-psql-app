# HAOS.fm Mobile - Audio Engine & Components

## 🎵 Audio System Architecture

### Components Created

1. **audioEngine.js** - Web Audio API wrapper
2. **Knob.js** - Touch-optimized rotary control
3. **ADSREnvelope.js** - Attack, Decay, Sustain, Release controls
4. **Keyboard.js** - Multi-touch piano keyboard

## 🎛️ Audio Engine API

### Initialize
```javascript
import audioEngine from '../services/audioEngine';

// Initialize audio context
await audioEngine.initialize();
```

### Play Notes
```javascript
// Play single note
audioEngine.playNote(440, 'sawtooth'); // A4, sawtooth wave

// Stop note
audioEngine.stopNote();

// Play chord
audioEngine.playChord([261.63, 329.63, 392.00], 'sine'); // C-E-G
```

### Configure ADSR
```javascript
audioEngine.setADSR(
  0.1,  // attack (seconds)
  0.2,  // decay (seconds)
  0.7,  // sustain (0-1)
  0.3   // release (seconds)
);
```

### Configure Filter
```javascript
audioEngine.setFilter(
  'lowpass',  // type: lowpass, highpass, bandpass, notch
  1000,       // frequency (Hz)
  1           // Q (resonance)
);
```

### Master Volume
```javascript
audioEngine.setMasterVolume(0.5); // 0-1
```

### Utility Methods
```javascript
// Convert note name to frequency
const freq = audioEngine.noteToFrequency('A'); // 440 Hz

// Convert MIDI note to frequency
const freq = audioEngine.midiToFrequency(69); // A4 = 440 Hz
```

### Cleanup
```javascript
// Stop all sounds and close audio context
audioEngine.destroy();
```

## 🎚️ Knob Component

### Basic Usage
```jsx
import Knob from '../components/Knob';

<Knob
  label="Cutoff"
  value={1000}
  min={20}
  max={20000}
  step={10}
  size={80}
  color="#00ff94"
  unit=" Hz"
  onChange={(value) => console.log('New value:', value)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | 'Knob' | Display label |
| value | number | 0 | Current value |
| min | number | 0 | Minimum value |
| max | number | 100 | Maximum value |
| step | number | 1 | Value increment |
| size | number | 80 | Knob diameter (px) |
| color | string | '#00ff94' | Primary color |
| unit | string | '' | Unit suffix (e.g., 'Hz', '%') |
| onChange | function | - | Value change callback |

### Features
- ✅ Touch-optimized gestures
- ✅ Haptic feedback
- ✅ Smooth animations
- ✅ Visual value indicator
- ✅ Step snapping

## 🎹 Keyboard Component

### Basic Usage
```jsx
import Keyboard from '../components/Keyboard';

<Keyboard
  onNotePress={(frequency, note) => {
    console.log(`Playing ${note} at ${frequency}Hz`);
    audioEngine.playNote(frequency);
  }}
  onNoteRelease={(note) => {
    console.log(`Stopped ${note}`);
    audioEngine.stopNote();
  }}
  octave={4}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onNotePress | function | - | Called when key pressed |
| onNoteRelease | function | - | Called when key released |
| octave | number | 4 | Current octave (0-8) |

### Features
- ✅ Multi-touch support
- ✅ White and black keys
- ✅ Visual key press feedback
- ✅ Haptic feedback
- ✅ Octave selector
- ✅ Responsive layout

## 📊 ADSR Envelope Component

### Basic Usage
```jsx
import ADSREnvelope from '../components/ADSREnvelope';

const [adsr, setAdsr] = useState({
  attack: 0.1,
  decay: 0.2,
  sustain: 0.7,
  release: 0.3,
});

<ADSREnvelope
  values={adsr}
  onChange={(newValues) => {
    setAdsr(newValues);
    audioEngine.setADSR(
      newValues.attack,
      newValues.decay,
      newValues.sustain,
      newValues.release
    );
  }}
/>
```

### ADSR Parameters

| Parameter | Range | Unit | Description |
|-----------|-------|------|-------------|
| Attack | 0.01-2 | seconds | Time to reach peak volume |
| Decay | 0.01-2 | seconds | Time to reach sustain level |
| Sustain | 0-1 | level | Held note volume (0-100%) |
| Release | 0.01-3 | seconds | Time to fade to silence |

## 🎛️ Complete Workspace Example

```jsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import audioEngine from '../services/audioEngine';
import Knob from '../components/Knob';
import ADSREnvelope from '../components/ADSREnvelope';
import Keyboard from '../components/Keyboard';

export default function SynthWorkspace() {
  const [waveform, setWaveform] = useState('sawtooth');
  const [filter, setFilter] = useState({
    type: 'lowpass',
    frequency: 1000,
    q: 1,
  });
  const [adsr, setAdsr] = useState({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
  });

  useEffect(() => {
    audioEngine.initialize();
    return () => audioEngine.destroy();
  }, []);

  useEffect(() => {
    audioEngine.setADSR(adsr.attack, adsr.decay, adsr.sustain, adsr.release);
  }, [adsr]);

  useEffect(() => {
    audioEngine.setFilter(filter.type, filter.frequency, filter.q);
  }, [filter]);

  return (
    <ScrollView>
      {/* Filter Knobs */}
      <View style={{ flexDirection: 'row' }}>
        <Knob
          label="Cutoff"
          value={filter.frequency}
          min={20}
          max={20000}
          step={10}
          onChange={(val) => setFilter({ ...filter, frequency: val })}
        />
        <Knob
          label="Resonance"
          value={filter.q}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(val) => setFilter({ ...filter, q: val })}
        />
      </View>

      {/* ADSR */}
      <ADSREnvelope values={adsr} onChange={setAdsr} />

      {/* Keyboard */}
      <Keyboard
        onNotePress={(freq) => audioEngine.playNote(freq, waveform)}
        onNoteRelease={() => audioEngine.stopNote()}
        octave={4}
      />
    </ScrollView>
  );
}
```

## 🎨 Styling & Theming

All components use HAOS.fm brand colors:

```javascript
const colors = {
  primary: '#00ff94',      // HAOS Green
  background: '#0a0a0a',   // Dark
  card: '#1a1a1a',         // Dark Gray
  border: '#333333',       // Border
  text: '#ffffff',         // White
  muted: '#666666',        // Gray
};
```

## 📱 Performance Optimization

### Best Practices
1. **Initialize once**: Call `audioEngine.initialize()` in useEffect
2. **Cleanup**: Always call `audioEngine.destroy()` on unmount
3. **Throttle updates**: Debounce knob onChange callbacks for smooth performance
4. **Stop all notes**: Call `audioEngine.stopAll()` when switching screens

### Example with Cleanup
```jsx
useEffect(() => {
  audioEngine.initialize();
  
  return () => {
    audioEngine.stopAll();
    audioEngine.destroy();
  };
}, []);
```

## 🐛 Troubleshooting

### Audio Not Playing
1. Check if audio engine initialized: `audioEngine.isInitialized`
2. Verify iOS audio mode set correctly
3. Test with headphones connected
4. Check device volume and silent mode

### Knobs Not Responding
1. Ensure PanResponder is not conflicting with ScrollView
2. Check if parent has `pointerEvents="box-none"`
3. Verify gesture handler installation

### Haptics Not Working
1. Check device supports haptics (iPhone 7+)
2. Verify haptic settings enabled in iOS Settings
3. Test on real device (not simulator)

## 🚀 Next Steps

### To Implement
- [ ] Oscillator mixing (multiple waveforms)
- [ ] LFO (Low Frequency Oscillator) modulation
- [ ] Effects (reverb, delay, distortion)
- [ ] Preset saving/loading
- [ ] MIDI support
- [ ] Audio recording/export
- [ ] Visualizers (waveform, spectrum)
- [ ] Arpeggiator
- [ ] Sequencer

### Performance Improvements
- [ ] Web Workers for audio processing
- [ ] Voice pooling (polyphony)
- [ ] Audio buffer caching
- [ ] Optimized filter calculations

## 📚 Resources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

---

**Status**: ✅ Audio engine and components complete  
**Next**: Build complete workspace screens
