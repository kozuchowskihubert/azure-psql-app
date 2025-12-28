# 🎵 HAOS.fm Mobile - Audio Integration Plan
## Phase 4: Real Audio Implementation
**Date**: December 28, 2025

---

## 📋 Overview

**Current Status**: Audio Engine exists with haptic feedback only  
**Goal**: Implement real synthesis, effects, and routing  
**Approach**: Use native audio APIs + WebView bridge for Web Audio API

---

## 🎯 Phase 4 Objectives

### 1. **Enhance AudioEngine** ✅ In Progress
- ✅ Analyzed Web Audio architecture from HTML files
- ⏳ Add real oscillator synthesis
- ⏳ Add filter/distortion/reverb effects
- ⏳ Add waveform analyser
- ⏳ Add multi-track routing

### 2. **Port Synthesizers**
- ARP 2600 (semi-modular)
- Juno-106 (polyphonic analog)
- Minimoog (monophonic bass)
- TB-303 (acid bass)

### 3. **Port Drum Machines**
- TR-808 (classic)
- TR-909 (techno)
- Sample-based playback

### 4. **Effects Chain**
- Reverb 🌊
- Delay 🔁
- Compression 📦
- EQ 🎚️
- Distortion ⚡
- Chorus, Flanger, Phaser, Limiter

### 5. **Mixer Integration**
- Connect StudioScreenNew to real audio
- Volume/Pan/Mute/Solo routing
- Master bus processing
- Real-time waveform visualization

---

## 🔍 Analysis: Existing Web Audio Architecture

### From `techno-workspace.html`:

#### Audio Context Setup:
```javascript
audioContext = new (window.AudioContext || window.webkitAudioContext)();
masterGain = audioContext.createGain();
masterGain.gain.value = 0.7;
```

#### Effects Chain:
```javascript
// Filter
filterNode = audioContext.createBiquadFilter();
filterNode.type = 'lowpass';
filterNode.frequency.value = 1000;
filterNode.Q.value = 5;

// Distortion
distortionNode = audioContext.createWaveShaper();
distortionNode.curve = makeDistortionCurve(0);

// Reverb
reverbNode = audioContext.createConvolver();
createReverbImpulse(); // Impulse response

// Routing: filter → distortion → (dry + reverb) → master
filterNode.connect(distortionNode);
distortionNode.connect(dryGain);
distortionNode.connect(reverbNode);
reverbNode.connect(wetGain);
dryGain.connect(masterGain);
wetGain.connect(masterGain);
```

#### Analyser for Visualization:
```javascript
analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 2048;
analyserNode.smoothingTimeConstant = 0.8;
masterGain.connect(analyserNode);
analyserNode.connect(audioContext.destination);
```

#### Kick Drum Synthesis:
```javascript
function playKick() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
  
  gain.gain.setValueAtTime(1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  osc.connect(gain);
  gain.connect(filterNode);
  
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.3);
}
```

#### Snare Drum (Noise-based):
```javascript
function playSnare() {
  const noise = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;
  
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.5, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  noise.connect(gain);
  gain.connect(filterNode);
  noise.start(audioContext.currentTime);
}
```

#### Bass Synthesis:
```javascript
function playBass(frequency = 130.81, duration = 0.2) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.value = frequency;
  
  // ADSR envelope
  const attack = synthParams.attack;
  const release = synthParams.release;
  
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + attack);
  gain.gain.setValueAtTime(1, audioContext.currentTime + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(filterNode);
  
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + duration);
}
```

---

## 🏗️ React Native Implementation Strategy

### Option 1: WebView Bridge (Recommended)
- **Pros**: Full Web Audio API compatibility, easy port
- **Cons**: Slight latency, memory overhead
- **Approach**: Embed Web Audio engine in hidden WebView, communicate via postMessage

### Option 2: Native Audio (expo-av)
- **Pros**: Low latency, native performance
- **Cons**: Limited synthesis capabilities, requires audio samples
- **Approach**: Use expo-av Sound API with pre-rendered samples

### Option 3: react-native-audio-toolkit
- **Pros**: More features than expo-av
- **Cons**: Extra dependency, configuration complexity
- **Approach**: Similar to expo-av but with more control

### Option 4: Hybrid Approach (CHOSEN)
- **WebView** for synthesis and effects processing
- **expo-av** for playback and recording
- **Haptics** for tactile feedback
- **Best of both worlds**: Full Web Audio + Native performance

---

## 📦 Implementation Plan

### Step 1: Create WebView Audio Bridge

**File**: `/mobile/src/services/WebAudioBridge.js`

```javascript
import { WebView } from 'react-native-webview';
import React, { useRef } from 'react';

class WebAudioBridge {
  constructor(webViewRef) {
    this.webViewRef = webViewRef;
    this.messageHandlers = new Map();
  }
  
  // Send command to WebView
  sendCommand(command, params) {
    const message = JSON.stringify({ command, params });
    this.webViewRef.current?.injectJavaScript(`
      window.processCommand(${message});
    `);
  }
  
  // Play sounds
  playKick() {
    this.sendCommand('playKick', {});
  }
  
  playSnare() {
    this.sendCommand('playSnare', {});
  }
  
  playBass(frequency, duration) {
    this.sendCommand('playBass', { frequency, duration });
  }
  
  // Effects
  setFilter(type, frequency, Q) {
    this.sendCommand('setFilter', { type, frequency, Q });
  }
  
  setReverb(amount) {
    this.sendCommand('setReverb', { amount });
  }
  
  // Get waveform data
  getWaveformData(callback) {
    this.messageHandlers.set('waveform', callback);
    this.sendCommand('getWaveform', {});
  }
  
  // Handle messages from WebView
  onMessage(event) {
    const data = JSON.parse(event.nativeEvent.data);
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data.payload);
    }
  }
}
```

### Step 2: Create WebView Audio HTML

**File**: `/mobile/assets/audio-engine.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HAOS Audio Engine</title>
</head>
<body>
  <script>
    let audioContext;
    let masterGain;
    let filterNode;
    let analyserNode;
    
    // Initialize audio context
    function initAudio() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.7;
        
        filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 1000;
        filterNode.Q.value = 5;
        
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        
        filterNode.connect(masterGain);
        masterGain.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
      }
    }
    
    // Drum synthesis functions
    function playKick() {
      initAudio();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      gain.gain.setValueAtTime(1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(filterNode);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'soundPlayed',
        payload: { sound: 'kick' }
      }));
    }
    
    // Command processor
    window.processCommand = function(message) {
      const { command, params } = message;
      
      switch (command) {
        case 'playKick':
          playKick();
          break;
        case 'playSnare':
          playSnare();
          break;
        case 'playBass':
          playBass(params.frequency, params.duration);
          break;
        case 'setFilter':
          if (filterNode) {
            filterNode.type = params.type;
            filterNode.frequency.value = params.frequency;
            filterNode.Q.value = params.Q;
          }
          break;
        case 'getWaveform':
          const waveform = getWaveformData();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'waveform',
            payload: waveform
          }));
          break;
      }
    };
    
    // Get waveform data for visualization
    function getWaveformData() {
      if (!analyserNode) return [];
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);
      
      return Array.from(dataArray);
    }
  </script>
</body>
</html>
```

### Step 3: Update AudioEngine.js

**Enhance**: `/mobile/src/services/AudioEngine.js`

```javascript
import WebAudioBridge from './WebAudioBridge';

class AudioEngine {
  constructor() {
    this.bridge = null; // Will be set by component
    // ... existing code ...
  }
  
  setBridge(webViewRef) {
    this.bridge = new WebAudioBridge(webViewRef);
  }
  
  async playKick() {
    if (this.bridge) {
      this.bridge.playKick();
    } else {
      // Fallback to haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }
  
  // ... add more methods ...
}
```

### Step 4: Add Hidden WebView to App

**File**: `/mobile/App.js` (or wrapper component)

```javascript
import { WebView } from 'react-native-webview';
import audioEngine from './src/services/AudioEngine';

function App() {
  const webViewRef = useRef(null);
  
  useEffect(() => {
    // Connect audio engine to WebView
    audioEngine.setBridge(webViewRef);
  }, []);
  
  return (
    <>
      {/* Hidden WebView for audio processing */}
      <WebView
        ref={webViewRef}
        source={require('./assets/audio-engine.html')}
        style={{ height: 0, width: 0 }}
        onMessage={(event) => audioEngine.bridge?.onMessage(event)}
      />
      
      {/* Rest of app */}
      <NavigationContainer>
        {/* ... */}
      </NavigationContainer>
    </>
  );
}
```

---

## 🎹 Synthesizer Port Plan

### ARP 2600 Architecture:
```
Oscillators (3):
├─ VCO1: Saw/Square/Sine (20Hz-20kHz)
├─ VCO2: Saw/Square/Sine (20Hz-20kHz)
└─ VCO3: Noise/Sample&Hold

Filter:
└─ 24dB/oct Lowpass (20Hz-20kHz, Resonance 0-10)

Envelopes (2):
├─ ADSR1 (VCF)
└─ ADSR2 (VCA)

LFOs (2):
├─ LFO1 (Triangle/Square, 0.1Hz-100Hz)
└─ LFO2 (Triangle/Square, 0.1Hz-100Hz)

Effects:
└─ Spring Reverb
```

### Juno-106 Architecture:
```
Oscillators:
├─ DCO: Saw/Square/PWM (Polyphonic 6-voice)
└─ Sub Oscillator: -1 octave

Filter:
└─ 24dB/oct Resonant Lowpass

Envelope:
└─ ADSR (shared VCF/VCA)

LFO:
└─ Triangle (0.1Hz-20Hz)

Chorus:
└─ Analog BBD Chorus (I/II)
```

### Minimoog Architecture:
```
Oscillators (3):
├─ OSC1: Saw/Triangle/Square
├─ OSC2: Saw/Triangle/Square (detune)
└─ OSC3: Saw/Triangle/Square (detune)

Mixer:
└─ OSC1/OSC2/OSC3/Noise levels

Filter:
└─ Moog Ladder Filter (24dB/oct)

Envelopes:
├─ Filter Contour (ADSD)
└─ Loudness Contour (ADSD)
```

---

## 🥁 Drum Machine Port Plan

### TR-808 Sounds:
```
Kick: Sine wave + pitch envelope (150Hz → 50Hz)
Snare: Noise + tone oscillator + resonant filter
Hi-Hat (Closed): Metallic noise + short decay
Hi-Hat (Open): Metallic noise + long decay
Tom: Tuned sine oscillator + decay
Clap: Multiple noise bursts
Cymbal: Noise + band-pass filter
Cowbell: Square wave harmonics
```

### TR-909 Sounds:
```
Kick: Sample + pitch envelope
Snare: Sample + noise layer
Hi-Hat: Sample-based metallic
Toms: Sample-based tuned
Crash: Sample-based cymbal
Ride: Sample-based
```

---

## ✨ Effects Implementation

### Reverb (Convolver-based):
```javascript
// Create impulse response
function createReverbImpulse(duration = 2, decay = 2) {
  const rate = audioContext.sampleRate;
  const length = rate * duration;
  const impulse = audioContext.createBuffer(2, length, rate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  
  reverbNode.buffer = impulse;
}
```

### Delay (Feedback loop):
```javascript
const delayNode = audioContext.createDelay(2.0);
const feedbackGain = audioContext.createGain();
delayNode.delayTime.value = 0.5; // 500ms
feedbackGain.gain.value = 0.4; // 40% feedback

// Routing
input.connect(delayNode);
delayNode.connect(feedbackGain);
feedbackGain.connect(delayNode); // Feedback loop
delayNode.connect(output);
```

### Compression:
```javascript
const compressor = audioContext.createDynamicsCompressor();
compressor.threshold.value = -24; // dB
compressor.knee.value = 30;
compressor.ratio.value = 12;
compressor.attack.value = 0.003; // seconds
compressor.release.value = 0.25; // seconds
```

### EQ (3-band):
```javascript
const lowShelf = audioContext.createBiquadFilter();
lowShelf.type = 'lowshelf';
lowShelf.frequency.value = 320;
lowShelf.gain.value = 0;

const mid = audioContext.createBiquadFilter();
mid.type = 'peaking';
mid.frequency.value = 1000;
mid.Q.value = 0.5;
mid.gain.value = 0;

const highShelf = audioContext.createBiquadFilter();
highShelf.type = 'highshelf';
highShelf.frequency.value = 3200;
highShelf.gain.value = 0;
```

---

## 📈 Waveform Visualization

### Get Time-Domain Data:
```javascript
const bufferLength = analyserNode.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyserNode.getByteTimeDomainData(dataArray);

// Convert to normalized values (-1 to 1)
const normalized = Array.from(dataArray).map(val => (val - 128) / 128);
```

### Calculate dB Level:
```javascript
let sum = 0;
for (let i = 0; i < bufferLength; i++) {
  const normalized = (dataArray[i] - 128) / 128;
  sum += normalized * normalized;
}
const rms = Math.sqrt(sum / bufferLength);
const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
```

---

## 🎚️ Mixer Integration

### Track Routing Architecture:
```
Input Sources:
├─ Synth 1 (ARP 2600)
├─ Synth 2 (Juno-106)
├─ Drums (TR-808/909)
└─ Vocals (Microphone)
    ↓
Track Processing:
├─ Volume (GainNode)
├─ Pan (StereoPannerNode)
├─ Mute/Solo (GainNode on/off)
└─ Effects Insert (Send/Return)
    ↓
Master Bus:
├─ Master Volume
├─ Master Effects (Limiter, EQ)
└─ Analyser (Visualization)
    ↓
Output:
└─ Device Speakers/Headphones
```

### Connect StudioScreenNew Controls:
```javascript
// Volume fader
tracks[trackId].gainNode.gain.value = volume;

// Pan control
tracks[trackId].panNode.pan.value = panValue; // -1 (L) to 1 (R)

// Mute
tracks[trackId].gainNode.gain.value = muted ? 0 : volume;

// Solo
tracks.forEach(track => {
  if (track.id === soloTrackId) {
    track.gainNode.gain.value = track.volume;
  } else {
    track.gainNode.gain.value = 0;
  }
});

// Effects
if (track.effects.reverb) {
  track.source.connect(reverbNode);
} else {
  track.source.connect(dryNode);
}
```

---

## 📝 Implementation Checklist

### Phase 4.1: WebView Bridge (Week 1)
- [ ] Create WebAudioBridge.js service
- [ ] Create audio-engine.html with Web Audio
- [ ] Add hidden WebView to App.js
- [ ] Test basic sound playback (kick/snare/hihat)
- [ ] Test bidirectional messaging

### Phase 4.2: Drum Synthesis (Week 1-2)
- [ ] Port TR-808 kick synthesis
- [ ] Port TR-808 snare synthesis
- [ ] Port TR-808 hi-hat synthesis
- [ ] Add drum parameter controls
- [ ] Test drum sequencer integration

### Phase 4.3: Bass Synthesis (Week 2)
- [ ] Port TB-303 oscillator
- [ ] Port TB-303 filter (24dB ladder)
- [ ] Port TB-303 envelope
- [ ] Add preset system for bass sounds
- [ ] Test MIDI note input

### Phase 4.4: Effects Chain (Week 2-3)
- [ ] Implement reverb (convolver)
- [ ] Implement delay (feedback)
- [ ] Implement compression (dynamics compressor)
- [ ] Implement EQ (3-band)
- [ ] Implement distortion (waveshaper)
- [ ] Test effects in StudioScreenNew

### Phase 4.5: Full Synthesizers (Week 3-4)
- [ ] Port ARP 2600 (3 VCOs + filter)
- [ ] Port Juno-106 (DCO + chorus)
- [ ] Port Minimoog (3 OSCs + Moog filter)
- [ ] Add polyphony support
- [ ] Test with InstrumentsScreen

### Phase 4.6: Mixer Integration (Week 4)
- [ ] Connect StudioScreenNew volume faders
- [ ] Connect pan controls
- [ ] Implement mute/solo routing
- [ ] Add real-time waveform display
- [ ] Add dB meters with actual audio levels
- [ ] Test multi-track mixing

### Phase 4.7: Recording (Week 5)
- [ ] Request microphone permissions
- [ ] Implement MediaRecorder
- [ ] Add real-time waveform during recording
- [ ] Save recordings to AsyncStorage
- [ ] Load recordings into tracks

### Phase 4.8: Presets (Week 5)
- [ ] Connect SoundsScreen presets to synths
- [ ] Implement preset loading
- [ ] Implement preset saving
- [ ] Add cloud sync for premium users

---

## 🚧 Current Limitations & Solutions

### Limitation 1: React Native doesn't have Web Audio API
**Solution**: Use WebView bridge with hidden WebView running Web Audio

### Limitation 2: WebView has latency
**Solution**: Pre-load audio context, use small buffer sizes, optimize messaging

### Limitation 3: iOS may suspend WebView
**Solution**: Keep WebView active with periodic heartbeat messages

### Limitation 4: Audio samples take storage
**Solution**: Use synthesis where possible, compress samples, cloud delivery

### Limitation 5: Complex routing is CPU-intensive
**Solution**: Optimize audio graph, limit simultaneous voices, use native bridge

---

## 📊 Performance Targets

### Latency:
- **Target**: <10ms input-to-output latency
- **Acceptable**: <50ms for music production
- **Current**: ~100ms with WebView (needs optimization)

### CPU Usage:
- **Target**: <30% CPU on iPhone 12
- **Acceptable**: <50% CPU
- **Monitor**: Use React Native Performance Monitor

### Memory:
- **Target**: <100MB for audio engine
- **Acceptable**: <200MB including samples
- **Monitor**: Xcode Memory Profiler

---

## 🎯 Success Criteria

### Phase 4 Complete When:
- ✅ All drum sounds play with synthesis (not samples)
- ✅ Bass synthesizer plays notes from MIDI keyboard
- ✅ Effects chain processes audio in real-time
- ✅ StudioScreenNew mixer controls actual audio
- ✅ Waveform visualization shows real audio data
- ✅ dB meters display actual levels
- ✅ Vocal recording saves to tracks
- ✅ Presets load and modify synth parameters
- ✅ Multi-track mixing works smoothly
- ✅ Latency is acceptable for live performance

---

## 📚 References

### Web Audio API:
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Web Audio Examples: https://webaudioapi.com/samples

### React Native Audio:
- expo-av: https://docs.expo.dev/versions/latest/sdk/audio/
- react-native-webview: https://github.com/react-native-webview/react-native-webview

### Synthesis Resources:
- TR-808 synthesis: https://www.attackmagazine.com/technique/synth-secrets/tr-808/
- TB-303 synthesis: https://www.firstpr.com.au/rwi/dfish/303-unique.html
- Moog filter: https://www.musicdsp.org/en/latest/Filters/24-moog-ladder-filter.html

---

**Status**: Phase 4 - Audio Integration Planning Complete  
**Next Step**: Create WebAudioBridge.js and audio-engine.html  
**Timeline**: 5 weeks (Jan 2026 - Feb 2026)  
**Priority**: HIGH - Core functionality for music app

---

*Generated: December 28, 2025*
*Team: HAOS.fm Mobile Development*
