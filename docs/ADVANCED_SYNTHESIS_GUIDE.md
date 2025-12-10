# Advanced Synthesis Engine Guide 🎛️

## Overview

The Music Generator v2.0 introduces professional-grade synthesis engines with comprehensive parameter control, clean sound generation, and advanced modulation capabilities for both Trap Studio and Techno Creator.

---

## 🎹 Trap Studio - Enhanced Engine

### Accessing the Enhanced Engine

1. Open **Trap Studio** (`/trap-studio.html`)
2. In the instrument selector, click **⚙️ Enhanced** button
3. The Advanced Synthesis Controls panel will become active

### Synthesis Parameters

#### **Oscillator Section**

**Waveform Selection:**
- **Sine**: Pure, clean tone - perfect for sub-bass and smooth pads
- **Triangle**: Warm, mellow - great for leads and melodic lines
- **Sawtooth**: Bright, rich harmonics - ideal for basses and synth leads (default)
- **Square**: Hollow, electronic - classic for chip-tune and retro sounds

**Unison Voices: 1-7** (odd numbers only)
- Creates multiple detuned copies of the oscillator
- **1**: Mono (single voice)
- **3**: Slight stereo width (recommended for most sounds)
- **5**: Wide stereo image (great for pads)
- **7**: Maximum width (use sparingly, can sound washy)

**Detune: 0-50 cents**
- Spreads unison voices across the stereo field
- **0-5**: Subtle analog warmth
- **5-15**: Classic unison chorus effect
- **15-30**: Wide, shimmering pads
- **30-50**: Extreme detuning for special effects

**Harmonics: 0-5**
- Adds additional harmonic partials above the fundamental
- **0**: Pure oscillator sound
- **1-2**: Subtle harmonic richness
- **3**: Full-bodied sound (default)
- **4-5**: Bright, aggressive timbre

---

#### **Filter Section**

**Filter Type:**
- **Low-Pass**: Removes high frequencies (most common)
- **High-Pass**: Removes low frequencies (thin, airy sounds)
- **Band-Pass**: Only middle frequencies pass through
- **Notch**: Removes middle frequencies (hollow, phaser-like)
- **All-Pass**: Phase manipulation without frequency removal

**Cutoff: 100-8000 Hz**
- Determines where the filter starts affecting the sound
- **100-500**: Dark, bassy, muffled
- **500-2000**: Natural, warm (default range)
- **2000-4000**: Bright, present
- **4000-8000**: Thin, sizzling

**Resonance: 0.1-20**
- Emphasizes frequencies at the cutoff point
- **0.1-1**: Smooth, natural filtering
- **1-5**: Slight emphasis (good for movement)
- **5-10**: Strong resonance (classic analog)
- **10-20**: Self-oscillating filter (creates whistle tone)

**Filter Envelope: 0-100%**
- Controls how much the filter opens over time
- **0%**: Static filter (no movement)
- **25-50%**: Subtle filter sweep
- **50%**: Default, noticeable movement
- **75-100%**: Dramatic filter opening

---

#### **Envelope (ADSR) Section**

**Attack: 0.001-2s**
- Time for sound to reach full volume
- **0.001-0.01**: Instant (plucks, stabs)
- **0.01-0.1**: Fast (most synth sounds)
- **0.1-0.5**: Medium (pads, strings)
- **0.5-2**: Slow (atmospheric swells)

**Decay: 0.001-2s**
- Time to drop from peak to sustain level
- **0.001-0.1**: Short (punchy sounds)
- **0.1-0.5**: Medium (most sounds)
- **0.5-2**: Long (evolving timbres)

**Sustain: 0-100%**
- Level maintained while note is held
- **0-30%**: Dies away quickly
- **30-70%**: Balanced
- **70-100%**: Held notes sustain fully

**Release: 0.01-5s**
- Time for sound to fade after note release
- **0.01-0.1**: Abrupt cutoff
- **0.1-0.5**: Natural release
- **0.5-2**: Long tail (default)
- **2-5**: Very long decay (ambient)

---

#### **LFO (Low Frequency Oscillator)**

**Enable LFO Checkbox**
- Turns modulation on/off

**LFO Rate: 0.1-20 Hz**
- Speed of modulation
- **0.1-1**: Very slow (pads, atmospheres)
- **1-4**: Classic vibrato/tremolo speed
- **4-8**: Fast modulation (default 4)
- **8-20**: Extreme, almost audible rates

**LFO Depth: 0-100%**
- Amount of modulation applied
- **0-20%**: Subtle movement
- **20-40%**: Noticeable modulation (default 30%)
- **40-70%**: Strong effect
- **70-100%**: Extreme modulation

**LFO Target:**
- **Pitch (Vibrato)**: Oscillates note pitch up/down
- **Filter (Wah)**: Sweeps filter cutoff (default)
- **Volume (Tremolo)**: Pulsates volume

---

#### **Automation Section**

**Filter Sweep**
- Automatically closes filter over the note duration
- Great for evolving basses and leads

**Volume Fade**
- Gradually reduces volume during playback
- Creates fade-out effects

**Auto-Pan**
- Sweeps stereo position from left to right
- Adds movement and width

---

### Presets Using Enhanced Engine

Create custom presets by combining parameters:

**Dark Sub Bass:**
```
Waveform: Sine
Unison: 3
Detune: 5
Harmonics: 1
Filter: Low-Pass, 200 Hz, Q=0.5
Envelope: A=0.01, D=0.3, S=80%, R=0.5
```

**Hyperpop Lead:**
```
Waveform: Sawtooth
Unison: 5
Detune: 20
Harmonics: 4
Filter: Low-Pass, 4000 Hz, Q=8
LFO: Filter @ 6 Hz, 40% depth
Envelope: A=0.005, D=0.1, S=60%, R=0.3
```

**Ambient Pad:**
```
Waveform: Triangle
Unison: 7
Detune: 15
Harmonics: 2
Filter: Low-Pass, 1500 Hz, Q=1
LFO: Pitch @ 0.5 Hz, 20% depth
Envelope: A=0.8, D=0.5, S=90%, R=2.0
Auto-Pan: ON
```

---

## ⚡ Techno Creator - Enhanced Engine

### Accessing the Enhanced Engine

1. Open **Techno Creator** (`/techno-creator.html`)
2. Click **⚡ ENHANCED** in the synthesis engine selector
3. Advanced Synthesis Engine panel becomes active

### Additional Techno-Specific Features

#### **Pulse Width Modulation (PWM)**
- Only works with **Square** waveform
- Creates sweeping, evolving square wave timbres
- Classic analog synthesizer effect

#### **Industrial Effects**

The Techno Creator includes all Trap Studio parameters plus:

**Enhanced Distortion Integration:**
- Works alongside the existing distortion control
- Can be combined for extreme industrial sounds

**Automation Targets:**
- Filter Sweep: Slow filter closing over sequence
- Volume Fade: Gradual volume reduction
- Auto-Pan: Stereo movement
- **Pulse Width Mod**: Exclusive to techno (square waves only)

---

### Techno Sound Design Examples

**Acid Bass (303 Style):**
```
Waveform: Sawtooth
Unison: 1
Harmonics: 0
Filter Type: Low-Pass
Cutoff: 500 Hz
Resonance: 18 (high!)
Filter Env: 90%
LFO: Filter @ 8 Hz, 50%
Attack: 0.001, Decay: 0.15, Sustain: 30%, Release: 0.2
```

**Hard Techno Lead:**
```
Waveform: Square
Unison: 3
Detune: 15
Harmonics: 3
Filter: Band-Pass, 2000 Hz, Q=10
Distortion: 60%
LFO: Volume @ 16 Hz (tremolo), 40%
PWM: ON
```

**Detroit Chord Stab:**
```
Waveform: Sawtooth
Unison: 5
Detune: 8
Harmonics: 2
Filter: Low-Pass, 3000 Hz, Q=2
Attack: 0.005, Decay: 0.3, Sustain: 20%, Release: 0.5
Auto-Pan: ON
```

**Minimal Drone:**
```
Waveform: Triangle
Unison: 7
Detune: 25
Harmonics: 1
Filter: All-Pass, 1000 Hz
LFO: Pitch @ 0.2 Hz, 15%
Attack: 1.0, Decay: 0.5, Sustain: 100%, Release: 2.0
```

---

## 🔧 Clean Sound Engine Features

### Anti-Aliasing Technology

Both studios now include **band-limited oscillators** that prevent high-frequency artifacts:

- **Additive synthesis**: Builds waveforms from sine waves
- **Nyquist limiting**: Only includes harmonics below half the sample rate
- **Automatic calculation**: Adjusts harmonics based on note pitch

**Benefits:**
- ✅ Cleaner high notes
- ✅ No digital harshness
- ✅ Warmer, more analog sound
- ✅ Better for bright sounds (bells, leads)

### Cascaded Filters

**Multi-stage filtering** for steeper rolloffs:

- Default: 2-stage cascade
- **12 dB/octave per stage** = 24 dB/octave total
- Distributed resonance prevents instability
- Smoother frequency response

**Benefits:**
- ✅ Sharper filter cutoff
- ✅ More controlled resonance
- ✅ Better bass definition
- ✅ Clearer highs

### Soft Clipping

**Hyperbolic tangent saturation** instead of hard clipping:

- Smooth saturation curve
- **4x oversampling** to reduce aliasing
- Warmer, more musical distortion

**Benefits:**
- ✅ Analog-style warmth
- ✅ Controlled saturation
- ✅ No digital harshness
- ✅ Professional sound quality

### Improved Reverb

**Realistic impulse response** with early reflections:

- Natural room acoustics
- Early reflection modeling
- Frequency-dependent damping
- Stereo field simulation

**Benefits:**
- ✅ More realistic space
- ✅ Better depth perception
- ✅ Natural decay
- ✅ Professional studio quality

---

## 🎚️ Parameter Interaction Tips

### Layering Techniques

**For Fat Basses:**
1. Unison: 3-5 voices
2. Detune: 8-12 cents
3. Filter: Low-pass, moderate resonance
4. Add 1-2 harmonics for punch

**For Wide Pads:**
1. Unison: 5-7 voices
2. Detune: 15-25 cents
3. LFO: Slow pitch modulation
4. Long attack and release

**For Cutting Leads:**
1. Harmonics: 3-5
2. Filter: High cutoff with resonance
3. LFO: Fast filter modulation
4. Short attack, medium release

### Common Mistakes to Avoid

❌ **Too much detune** (>30 cents) - sounds out of tune
❌ **Extreme resonance without automation** - harsh, static
❌ **Too many unison voices** (>7) - CPU intensive, muddy
❌ **High harmonics with high filter cutoff** - too bright
❌ **Fast LFO on pitch** - sounds wobbly, not musical

### CPU Optimization

The enhanced engine uses more CPU. To optimize:

1. **Reduce unison voices** when not needed
2. **Lower harmonic count** for simple sounds
3. **Disable automation** when not in use
4. **Use simple waveforms** (sine/triangle) for pads

---

## 🎵 Workflow Integration

### Step-by-Step Sound Design

1. **Start Simple:**
   - Choose waveform
   - Set basic envelope
   - Test sound

2. **Add Depth:**
   - Increase unison (3-5)
   - Add slight detune (5-10)
   - Adjust filter cutoff

3. **Movement:**
   - Enable LFO
   - Choose modulation target
   - Adjust rate and depth

4. **Polish:**
   - Add harmonics if needed
   - Fine-tune envelope
   - Add effects (reverb/delay)

5. **Automate:**
   - Enable automation if desired
   - Test in context
   - Adjust to taste

### A/B Testing

Compare enhanced vs. classic engines:

1. Play sound with classic instrument (Piano, Brass, etc.)
2. Switch to Enhanced engine
3. Match the sound using parameters
4. Enhance with additional features

---

## 📊 Technical Specifications

### Synthesis Architecture

- **Oscillators**: Up to 49 per voice (7 unison × 7 partials)
- **Filter Types**: 5 (lowpass, highpass, bandpass, notch, allpass)
- **Modulation**: LFO + Envelope + Automation
- **Anti-aliasing**: Bandlimited additive synthesis
- **Oversampling**: 4x for distortion/saturation

### Parameter Ranges

| Parameter | Min | Max | Default | Unit |
|-----------|-----|-----|---------|------|
| Unison | 1 | 7 | 1 | voices |
| Detune | 0 | 50 | 5 | cents |
| Harmonics | 0 | 5 | 2 | count |
| Filter Cutoff | 100 | 8000 | 2000 | Hz |
| Resonance | 0.1 | 20 | 1 | Q |
| Attack | 0.001 | 2 | 0.01 | seconds |
| Decay | 0.001 | 2 | 0.3 | seconds |
| Sustain | 0 | 100 | 70 | % |
| Release | 0.01 | 5 | 0.5 | seconds |
| LFO Rate | 0.1 | 20 | 4 | Hz |
| LFO Depth | 0 | 100 | 30 | % |

---

## 🚀 Performance Notes

### Browser Requirements

- **Chrome/Edge**: Full support, recommended
- **Firefox**: Full support
- **Safari**: Full support (macOS/iOS)

### CPU Usage

Approximate CPU usage per voice:
- **Classic engines**: 1x (baseline)
- **Enhanced (minimal)**: 2-3x (1 unison, 0 harmonics)
- **Enhanced (moderate)**: 5-7x (3 unison, 2 harmonics)
- **Enhanced (maximum)**: 10-15x (7 unison, 5 harmonics)

**Recommendations:**
- Laptop: Use moderate settings
- Desktop: Can handle maximum settings
- Mobile: Use classic engines or minimal enhanced

---

## 🎓 Learning Path

### Beginner
1. Start with **pre-made presets**
2. Adjust **one parameter at a time**
3. Learn **waveform differences**
4. Understand **filter basics**

### Intermediate
1. Create **custom sounds** from scratch
2. Master **envelope shaping**
3. Explore **LFO modulation**
4. Combine **multiple parameters**

### Advanced
1. Design **complex patches**
2. Use **automation creatively**
3. Layer **multiple instances**
4. Optimize for **performance**

---

## 💡 Pro Tips

1. **Save Your Work**: Copy parameter values to text file
2. **Document Sounds**: Note what works for different genres
3. **Reference Tracks**: Try to recreate professional sounds
4. **Experiment**: Happy accidents lead to unique sounds
5. **Less is More**: Don't max out all parameters
6. **Context Matters**: Sound in solo vs. mix is different
7. **Use Your Ears**: Specs don't matter if it sounds good

---

## 🔗 Related Documentation

- [Trap Studio Guide](./MELODIC_SYNTHESIS_GUIDE.md)
- [Techno Creator Guide](./TECHNO_CREATOR_GUIDE.md)
- [Feature Implementation Summary](./FEATURE_IMPLEMENTATION_SUMMARY.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

**Version**: 2.0.0  
**Last Updated**: November 23, 2025  
**Compatibility**: Music Generator v2.0+
