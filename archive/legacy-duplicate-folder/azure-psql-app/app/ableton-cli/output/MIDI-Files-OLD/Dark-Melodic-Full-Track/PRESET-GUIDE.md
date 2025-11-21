# VST3 PRESET CONFIGURATION - DARK MELODIC TECHNO

## 🎹 INSTRUMENT LOADING GUIDE

═══════════════════════════════════════════════════════════════════════
                              TEKNO PRESETS
═══════════════════════════════════════════════════════════════════════

### Track 01: Deep Kick - TEKNO
**Preset:** "Deep Techno Kick" or "Sub Kick"
**Settings:**
- Tune: -3 semitones (deeper)
- Attack: 1ms
- Decay: 450ms
- Sub Amount: 85%
- Punch: 75%
- Saturation: 30%

**Alternative Presets:**
- "909 Deep Kick"
- "Melodic Techno Kick"
- Custom: Layer two kicks (60Hz + 80Hz)

---

### Track 02: Sub Rumble - TEKNO
**Preset:** "Sub Bass Growl" or "Tekno Rumble"
**Settings:**
- Oscillator: Sine wave + square (5% blend)
- Filter: Low-pass 120Hz
- Envelope: Long sustain (800ms)
- Glide: 25ms (for smooth transitions)
- Saturation: 45%

**Alternative Presets:**
- "808 Sub Bass"
- "Techno Sub"

---

### Track 06: Percussion - TEKNO
**Preset:** "Industrial Percussion Kit"
**Settings:**
- Hi-Hat: Bright metallic (6kHz emphasis)
- Clap: Layered reverb tail
- Rimshot: Tight, snappy

**Alternative Presets:**
- "909 Classic Kit"
- "Melodic Perc Kit"

---

### Track 08: Bass Pluck - TEKNO
**Preset:** "Pluck Bass" or "Stab Bass"
**Settings:**
- Attack: 5ms (sharp)
- Decay: 180ms
- Filter Cutoff: 800Hz
- Resonance: 35%
- Envelope Depth: 60%

**Alternative Presets:**
- "Synth Pluck"
- "Melodic Bass Stab"

═══════════════════════════════════════════════════════════════════════
                           OMNISPHERE PRESETS
═══════════════════════════════════════════════════════════════════════

### Track 03: Melodic Lead - OMNISPHERE
**Preset Path:** Synth → Lead → "Melodic Techno Lead"
**Recommended Presets:**
- "Analog Lead Warm"
- "Psychoacoustic Lead"
- "Evolving Lead Pad"
- "Techno Lead Sine"

**Settings:**
- Filter: Low-pass 2.5kHz (open slowly in drops)
- Reverb: 40% (built-in)
- Delay: 1/8 dotted, 25% mix
- Unison: 3 voices, 15% detune
- Portamento: 50ms (for legato feel)

**Layer Suggestion:** Add subtle sub-oscillator for warmth

---

### Track 04: Dark Pad - OMNISPHERE
**Preset Path:** Pads → Dark → "Dark Atmosphere"
**Recommended Presets:**
- "Deep Dark Pad"
- "Techno Pad Evolve"
- "Analog Strings Dark"
- "Morphing Pad"

**Settings:**
- Attack: 500ms (slow fade-in)
- Release: 2s (long tail)
- Filter: Low-pass 1.8kHz
- Modulation: Slow LFO on filter (0.2Hz)
- Reverb: 65% (lush)
- Chorus: Subtle (15%)

---

### Track 05: Arpeggio - OMNISPHERE
**Preset Path:** Synth → Arpeggiator → "Techno Sequence"
**Recommended Presets:**
- "Analog Arp 16th"
- "Plucked Arpeggio"
- "Crystal Sequence"

**Settings:**
- Arpeggiator: 16th notes, Up pattern
- Gate: 60% (staccato)
- Filter: Band-pass 1.2kHz
- Resonance: 45%
- Swing: 10% (subtle groove)

**Note:** If preset has built-in arp, disable MIDI arp pattern

---

### Track 07: Atmospheric Texture - OMNISPHERE
**Preset Path:** Textures → Atmospheric → "Ethereal Space"
**Recommended Presets:**
- "Infinite Atmosphere"
- "Dark Ambient Wash"
- "Celestial Pad"
- "Drone Texture"

**Settings:**
- Very long attack (1s+)
- Infinite release
- Heavy reverb (80%)
- Shimmer effect
- High-pass filter: 300Hz (leave space for bass)

---

### Track 09: FX Riser - OMNISPHERE
**Preset Path:** FX → Risers → "Build Sweep"
**Recommended Presets:**
- "Riser White Noise"
- "Impact Riser"
- "Tension Builder"

**Settings:**
- Filter automation: 50Hz → 18kHz (automated in arrangement)
- Pitch rise: +12 semitones over 8 bars
- Reverb: 50%
- Distortion: 25% (for grit)

**Usage:** Automate filter + pitch for builds, impact sample for drops

═══════════════════════════════════════════════════════════════════════
                          AUTOMATION TARGETS
═══════════════════════════════════════════════════════════════════════

## 🎚️ CRITICAL AUTOMATIONS

### INTRO (Bars 1-16):
- All elements: Filter sweep 20Hz → 2kHz (very slow)
- Reverb sends: 80% → 50%
- Dark Pad volume: 0 → -18dB (fade in bars 1-8)

### BUILD-UPS (Bars 17-24, 49-56, 89-96):
- FX Riser: Filter sweep + pitch rise
- All elements: Volume +2dB gradual increase
- Reverb: 50% → 30% (tighten for drop)
- Hi-pass filter on pads: 100Hz → 300Hz

### DROPS (Bars 25-40, 57-72, 97-112):
- Filter: Fully open (4kHz+)
- Sidechain compression: Active on all melodic elements
- Reverb: 30% (tight, controlled)

### BREAKDOWNS (Bars 41-48, 73-88):
- Remove sidechain compression
- Increase reverb: 30% → 60%
- Melodic Lead volume: +3dB (feature it)
- Low-pass filter all elements: 6kHz (warmth)

### OUTRO (Bars 113-136):
- Reverse intro automation
- Volume fade all elements
- Filter close: 4kHz → 300Hz
- Reverb increase: 30% → 90%
- Master fade: Last 8 bars

═══════════════════════════════════════════════════════════════════════
                           QUICK START
═══════════════════════════════════════════════════════════════════════

1. Open Manual-set.als in Ableton Live 12
2. Load MIDI files from Dark-Melodic-Full-Track folder
3. Drag VST3 plugins onto tracks:
   - Tracks 01, 02, 06, 08: TEKNO
   - Tracks 03, 04, 05, 07, 09: Omnisphere
4. Load presets as described above
5. Follow ARRANGEMENT-GUIDE.md for mixing/automation
6. Reference mixing levels table
7. Apply sidechain compression
8. Automate filters and effects per section
9. Final mixdown and master

═══════════════════════════════════════════════════════════════════════
