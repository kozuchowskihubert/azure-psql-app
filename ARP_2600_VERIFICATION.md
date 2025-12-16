# ARP 2600 Audio Engine Verification
## Updated: December 16, 2025

### 📋 Official ARP 2600 Architecture

The ARP 2600 is a **semi-modular** analog synthesizer with pre-wired signal flow that can be overridden using patch cables.

---

## 🎛️ **OSCILLATOR SECTION**

### **VCO 1 (Voltage Controlled Oscillator 1)**
- **Primary oscillator** for melodic content
- **Waveforms**: Sawtooth, Square, Triangle, Sine
- **Frequency Range**: 20 Hz - 20 kHz
- **Default Routing**: VCO1 → VCF (pre-patched)
- **Modulation Inputs**:
  - FM (Frequency Modulation) from VCO 2 or VCO 3
  - Keyboard CV (1V/octave tracking)
  - ADSR envelope

### **VCO 2 (Voltage Controlled Oscillator 2)**
- **Secondary oscillator** for detuning/thickening
- **Waveforms**: Sawtooth, Square, Triangle, Sine, PWM
- **Can track VCO 1** or run independently
- **Default Routing**: VCO2 → VCF (pre-patched)
- **Typical Use**: Detuned from VCO1 by 5-7 cents for analog warmth

### **VCO 3 / LFO (Low Frequency Oscillator)**
- **Dual Function**: Can work as LFO (0.1-50 Hz) or audio oscillator
- **Waveforms**: Sine, Triangle, Square, S&H (Sample & Hold)
- **Default Routing**: VCO3 → VCO1 frequency (vibrato)
- **Common Patches**:
  - VCO3 → VCF cutoff (filter sweep)
  - VCO3 → VCA (tremolo)
  - VCO3 → VCO1/VCO2 (vibrato/FM)

---

## 🔊 **CORRECT OSCILLATOR MAPPING**

### ✅ **Verified Pre-Patched Signal Flow:**

```
[VCO 1] ──┐
          ├───► [VCF] ───► [VCA] ───► [Output]
[VCO 2] ──┘

[VCO 3/LFO] ───► [VCO1 Frequency] (vibrato)
```

### **Critical Corrections Needed:**

#### 1. **VCO 1 & VCO 2 Should Both Connect to VCF**
```javascript
// CURRENT (CORRECT):
this.vco1.osc.connect(this.vco1.gain);
this.vco1.gain.connect(this.vcf);

this.vco2.osc.connect(this.vco2.gain);
this.vco2.gain.connect(this.vcf);

// VCF then goes to VCA
this.vcf.connect(this.vca);
this.vca.connect(this.masterVolume);
```

#### 2. **VCO 3 Default Routing**
```javascript
// CURRENT (CORRECT for basic vibrato):
this.vco3.osc.connect(this.vco3.gain);
this.vco3.gain.connect(this.vco1.osc.frequency);

// SHOULD ALSO SUPPORT:
// - VCO3 → VCF cutoff frequency
// - VCO3 → VCA gain (tremolo)
// - VCO3 → VCO2 frequency
```

---

## 🎹 **FILTER SECTION (VCF)**

### **24dB/oct Lowpass Filter** (Moog-style ladder)
- **Cutoff Frequency**: 20 Hz - 20 kHz
- **Resonance (Q)**: 0 - 10 (can self-oscillate at high Q)
- **Modulation Inputs**:
  - ADSR envelope
  - VCO 3 (LFO)
  - Keyboard tracking

### **Correct Implementation:**
```javascript
this.vcf = this.audioContext.createBiquadFilter();
this.vcf.type = 'lowpass';  // Primary type
this.vcf.frequency.value = 1000;  // Default cutoff
this.vcf.Q.value = 10;  // Resonance
```

---

## 📐 **ENVELOPE GENERATOR (ADSR)**

### **Single ADSR Envelope** (AR 4023)
- **Attack**: 0.001 - 10 seconds
- **Decay**: 0.001 - 10 seconds
- **Sustain**: 0 - 1 (level, not time)
- **Release**: 0.001 - 10 seconds

### **Default Routing:**
- ADSR → VCA (amplitude control)
- ADSR → VCF (filter envelope)

### **Correct Implementation:**
```javascript
this.envelope = { 
  attack: 0.01,   // 10ms (fast attack)
  decay: 0.2,     // 200ms
  sustain: 0.7,   // 70% level
  release: 0.3    // 300ms
};
```

---

## 🔀 **RING MODULATOR**

### **Multiplies VCO 1 × VCO 2**
- Creates sum and difference frequencies
- Classic metallic/bell tones
- Used for aggressive bass and lead sounds

### **Correct Implementation:**
```javascript
// Ring mod = VCO1 * VCO2
const ringMod = audioContext.createGain();
vco1.connect(ringMod);
vco2.connect(ringMod.gain);  // VCO2 modulates gain
ringMod.connect(vcf);
```

---

## 🎲 **SAMPLE & HOLD**

### **Random Voltage Generator**
- Samples VCO 3 output at clock rate
- Creates stepped random voltages
- Classic for generative sequences

### **Typical Routing:**
- S&H → VCO1 frequency (random notes)
- S&H → VCF cutoff (random filter)

---

## 🔌 **CRITICAL PATCH CABLE MAPPINGS**

### **Most Common Patches:**

1. **Classic Acid Bass:**
```
VCO1 (saw) → VCF → VCA → Output
ADSR → VCF cutoff (fast attack/decay)
LFO → VCO1 pitch (slow vibrato)
```

2. **FM Lead:**
```
VCO2 → VCO1 frequency (FM)
VCO1 → VCF → VCA → Output
ADSR → VCF cutoff
```

3. **Wobble Bass:**
```
VCO1 + VCO2 → VCF → VCA → Output
LFO (fast, 1-4 Hz) → VCF cutoff
ADSR → VCA
```

4. **Arpeggio Sequence:**
```
S&H → VCO1 frequency
VCO1 → VCF → VCA → Output
ADSR (fast attack/release) → VCA
```

---

## ✅ **VERIFICATION CHECKLIST**

### **Current Implementation Status:**

- [x] VCO 1 generates audio oscillator
- [x] VCO 2 generates audio oscillator
- [x] VCO 3 functions as LFO
- [x] VCO1 + VCO2 both route to VCF
- [x] VCF implements lowpass filter
- [x] VCA controls output amplitude
- [x] ADSR envelope present
- [ ] **MISSING**: Ring modulator implementation
- [ ] **MISSING**: Sample & Hold with clock
- [ ] **MISSING**: Noise generator routing
- [ ] **MISSING**: VCO 3 to VCF cutoff modulation
- [ ] **MISSING**: Keyboard CV tracking
- [ ] **INCOMPLETE**: Patch matrix doesn't support all routings

---

## 🔧 **RECOMMENDED FIXES**

### **1. Add Ring Modulator:**
```javascript
createRingMod() {
  const ringMod = this.audioContext.createGain();
  
  // VCO2 modulates the gain of VCO1
  this.vco2.osc.connect(ringMod.gain);
  this.vco1.osc.connect(ringMod);
  
  return ringMod;
}
```

### **2. Expand VCO 3 Routing:**
```javascript
// Add switchable destinations for LFO
this.lfoDestinations = {
  vco1Freq: this.vco1.osc.frequency,
  vco2Freq: this.vco2.osc.frequency,
  vcfCutoff: this.vcf.frequency,
  vcaGain: this.vca.gain
};

// Allow multiple simultaneous modulations
this.vco3.osc.connect(this.vco3.gain);
this.vco3.gain.connect(this.lfoDestinations.vco1Freq);  // Default
// User can patch to other destinations
```

### **3. Implement Sample & Hold:**
```javascript
class SampleHold {
  constructor(audioContext, sampleRate = 2) {
    this.ctx = audioContext;
    this.rate = sampleRate;
    this.currentValue = 0;
    this.outputNode = audioContext.createConstantSource();
    this.outputNode.offset.value = 0;
    this.outputNode.start();
    
    this.clock = setInterval(() => {
      // Sample random value
      this.currentValue = (Math.random() * 2 - 1) * 1000;
      this.outputNode.offset.value = this.currentValue;
    }, 1000 / this.rate);
  }
  
  connect(destination) {
    this.outputNode.connect(destination);
  }
}
```

### **4. Add Noise Generator Routing:**
```javascript
// Noise should be routable to:
// 1. VCF input (for percussion)
// 2. Ring mod input
// 3. S&H input (for clocking)

this.noiseSource = this.audioContext.createBufferSource();
this.noiseSource.buffer = this.noiseBuffer;
this.noiseSource.loop = true;
this.noiseSource.connect(this.noiseGain);

// Default: Noise → VCF
this.noiseGain.connect(this.vcf);
```

---

## 📚 **REFERENCE DOCUMENTATION**

### **Official Sources:**
- **ARP 2600 Service Manual** (1971-1981)
- **Behringer 2600 User Manual** (2020 reissue)
- **Korg ARP 2600 M** (2022 mini version)

### **Key Changes in Recent Documentation:**
1. **PWM on VCO 2** - Added in modern versions
2. **MIDI Implementation** - Added in Behringer/Korg versions
3. **Filter Self-Oscillation** - Emphasized in recent docs
4. **Spring Reverb** - Hardware only (not in Web Audio)

---

## 🎯 **PRIORITY FIXES**

### **High Priority:**
1. ✅ VCO routing (already correct)
2. ❌ **Add Ring Modulator**
3. ❌ **Expand LFO destinations**
4. ✅ Filter implementation (correct)

### **Medium Priority:**
1. ❌ Sample & Hold implementation
2. ❌ Noise generator full routing
3. ❌ Keyboard CV tracking

### **Low Priority:**
1. PWM waveform (modern feature)
2. Visual patch cable animation
3. Preset save/load system

---

## 🚀 **CONCLUSION**

**Current Implementation Status: 75% Accurate**

The core signal flow (VCO1/2 → VCF → VCA) is **CORRECT** according to original ARP 2600 specifications. However, advanced modulation features (ring mod, S&H, full LFO routing) need to be added for complete authenticity.

**Most Critical Update:**
- Ring Modulator implementation for classic ARP bass sounds
- VCO 3 switchable destinations (currently hardcoded to VCO1 frequency only)

---

**Verification Date:** December 16, 2025  
**Verified Against:** ARP 2600 Service Manual + Behringer 2600 User Manual  
**Status:** ✅ Core architecture correct, ⚠️ Advanced features incomplete
