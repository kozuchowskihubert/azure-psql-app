
# DARK ATMOSPHERIC TECHNO SETUP GUIDE
=====================================

## 🎹 INSTRUMENT ASSIGNMENTS

### TEKNO VST3 (Deep, Industrial, Bass Elements)
-------------------------------------------------
Track 10: **Deep Kick - TEKNO**
- MIDI File: `10-Deep-Kick-TEKNO.mid`
- Preset: "Deep Techno Kick" or "Sub Kick"
- Settings:
  - Tune: -5 to -10 semitones for extra depth
  - Decay: 400-600ms
  - Punch: High
  - Sub level: 80-100%
  
Track 11: **Sub Rumble - TEKNO**
- MIDI File: `11-Sub-Rumble-TEKNO.mid`
- Preset: "Sub Bass" or "Rumble Bass"
- Settings:
  - Filter: Low-pass 100Hz
  - Sub oscillator: Max
  - Envelope: Long sustain (800ms+)
  - Add slight distortion for grit

Track 14: **Industrial Perc - TEKNO**
- MIDI File: `14-Industrial-Perc-TEKNO.mid`
- Preset: "Metallic" or "Industrial"
- Settings:
  - Filter: Band-pass 1-5kHz
  - Resonance: 40-60%
  - Add reverb for space

Track 15: **Drone Bass - TEKNO**
- MIDI File: `15-Drone-Bass-TEKNO.mid`
- Preset: "Dark Drone" or "Deep Sub"
- Settings:
  - Very slow attack (50-100ms)
  - Long sustain
  - Filter: Low-pass 80-120Hz
  - Add chorus for width

### OMNISPHERE (Atmospheric, Pads, Textures)
--------------------------------------------
Track 12: **Dark Pad - OMNISPHERE**
- MIDI File: `12-Dark-Pad-OMNISPHERE.mid`
- Preset Path: Pads → Dark/Cinematic
- Recommendations:
  - "Dark Matter Pad"
  - "Abyss Pad"
  - "Minimal Dark Pad"
- Settings:
  - Attack: 500-800ms (slow fade in)
  - Release: 1000ms+
  - Filter: Gentle low-pass sweep
  - Add reverb send (50-70%)

Track 13: **Atmospheric Texture - OMNISPHERE**
- MIDI File: `13-Atmospheric-Texture-OMNISPHERE.mid`
- Preset Path: Textures → Atmospheric/Cinematic
- Recommendations:
  - "Ethereal Texture"
  - "Dark Atmosphere"
  - "Ambient Wash"
- Settings:
  - Very soft velocity (30-50)
  - Long attack (1000ms+)
  - Heavy reverb (Freeze mode)
  - Optional: Reverse envelope

Track 16: **Reversed Atmosphere - OMNISPHERE**
- MIDI File: `16-Reversed-Atmos-OMNISPHERE.mid`
- Preset Path: FX → Reverse/Build
- Recommendations:
  - "Reverse Atmosphere"
  - "Build Sweep"
  - Use Omnisphere's reverse function
- Settings:
  - Enable reverse playback in Omnisphere
  - Add delay (1/4 note)
  - Automate filter open during build

## 🎚️ MIXING GUIDELINES

### Frequency Balance (Dark Techno Mix)
- **Sub (20-60Hz):** TEKNO Sub Rumble + Drone Bass
- **Bass (60-250Hz):** TEKNO Deep Kick
- **Mids (250Hz-2kHz):** Dark Pad (thin layer)
- **High-Mid (2-8kHz):** Industrial Perc + Texture (subtle)
- **Air (8kHz+):** Atmospheric Texture (very subtle)

### Track Levels (Relative to Kick at -6dB)
```
Deep Kick (TEKNO):        -6dB  ████████████████
Sub Rumble (TEKNO):       -12dB ████████
Dark Pad (OMNISPHERE):    -18dB █████
Atmospheric Texture:      -24dB ███
Industrial Perc:          -15dB ██████
Drone Bass:               -14dB ███████
Reversed Atmos:           -20dB ████
```

## 🎛️ EFFECTS CHAIN RECOMMENDATIONS

### Master FX Chain
1. **EQ Eight**
   - HPF @ 25Hz (remove rumble)
   - Boost @ 80Hz (+1dB, Q=0.7) - add weight
   - Cut @ 250Hz (-2dB, Q=1.5) - reduce mud
   - Boost @ 8kHz (+0.5dB, shelf) - subtle air

2. **Glue Compressor**
   - Ratio: 2:1
   - Attack: 10ms
   - Release: Auto
   - Makeup: +2dB

3. **Saturator** (optional)
   - Drive: 3-6dB
   - Curve: Warm
   - Dry/Wet: 15-25%

4. **Limiter**
   - Ceiling: -0.3dB
   - Release: 100ms

### Send FX
**Send A - Dark Hall Reverb**
- Device: Reverb
- Type: Hall
- Decay: 6-8s (long!)
- Pre-Delay: 25ms
- Diffusion: 85%
- Damping: 30% (dark)
- Dry/Wet: 100% (send)

**Send B - Tape Delay**
- Device: Echo
- Time: 1/4 dotted
- Feedback: 35%
- Add Filter Delay (low-pass @ 3kHz)
- Dry/Wet: 100%

**Send C - Shimmer Reverb**
- Device: Reverb
- Type: Plate
- Decay: 10s+
- High shelf boost (+6dB @ 4kHz)
- Use on Atmospheric Texture only

## 🎵 ARRANGEMENT TIPS

### Build Structure (8-minute dark techno track)
```
[0:00-1:00]  Intro: Drone Bass + Sub Rumble only
[1:00-2:00]  Add Deep Kick + Industrial Perc (sparse)
[2:00-3:00]  Introduce Dark Pad (subtle)
[3:00-4:00]  Full groove: All elements except Reversed Atmos
[4:00-5:00]  Breakdown: Remove kick, feature Atmospheric Texture
[5:00-5:30]  Build: Add Reversed Atmosphere (crescendo)
[5:30-7:00]  Drop: Full intensity with all layers
[7:00-8:00]  Outro: Gradually remove elements, end on drone
```

### Automation Ideas
- **Dark Pad:** Automate filter cutoff (200Hz → 800Hz over 32 bars)
- **Sub Rumble:** Slight pitch bend automation (-100 → 0 cents)
- **Atmospheric Texture:** Volume automation (swells)
- **Industrial Perc:** Reverb send automation (builds)
- **TEKNO Filter:** Resonance automation (tension)

## 🎨 SOUND DESIGN TIPS

### TEKNO Customization
1. **Layer Sub Frequencies:** Combine Drone Bass + Sub Rumble for massive low end
2. **Modulation:** Use slow LFO on filter cutoff (0.125Hz)
3. **Distortion:** Add subtle overdrive on bass elements
4. **Sidechain:** Sidechain all bass to the kick (light)

### OMNISPHERE Customization
1. **Layering:** Stack 2-3 pad presets with different octaves
2. **Modulation Matrix:** Assign LFO to:
   - Filter cutoff (slow)
   - Pan (very slow)
   - Pitch (±2 cents for drift)
3. **Reverse Trick:** Render audio, reverse in Ableton, add back
4. **Granular:** Use Omnisphere's granular engine for textures

## 📋 QUICK START WORKFLOW

1. **Open Template:**
   ```bash
   open -a "Ableton Live 12 Suite" "Techno-Template-Output/Manual-set Project/Manual-set.als"
   ```

2. **Drag MIDI Files:**
   - Import all 7 new MIDI files from `MIDI-Files/Dark-Atmospheric/`
   - Drag to corresponding tracks (10-16)

3. **Add TEKNO to Tracks:**
   - 10: Deep Kick
   - 11: Sub Rumble
   - 14: Industrial Perc
   - 15: Drone Bass

4. **Add OMNISPHERE to Tracks:**
   - 12: Dark Pad
   - 13: Atmospheric Texture
   - 16: Reversed Atmosphere

5. **Load Presets:**
   - Use preset browser in each plugin
   - Follow recommendations above

6. **Set Levels:**
   - Start with all faders at -∞
   - Bring in kick first at -6dB
   - Add other elements gradually

7. **Add FX:**
   - Create return tracks with reverb/delay
   - Add master chain effects
   - Automate for dynamics

8. **Save Template:**
   - File → Save Live Set As → "Dark-Atmospheric-Techno-Template.als"
   - File → Save Live Set as Template

## 🎧 REFERENCE TRACKS

Listen to these for inspiration:
- **Dax J** - "Escape The System" (industrial, dark)
- **Amelie Lens** - "In My Mind" (atmospheric techno)
- **SNTS** - "Black Neon" (minimal, dark)
- **Blawan** - "What You Do With What You Have" (raw, industrial)
- **DVS1** - "Klockworks 13" (deep, atmospheric)

## ⚙️ TEKNO & OMNISPHERE INSTALLATION CHECK

Run this to verify your plugins are installed:
