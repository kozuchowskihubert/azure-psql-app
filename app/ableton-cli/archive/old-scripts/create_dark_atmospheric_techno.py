#!/usr/bin/env python3
"""
Dark Atmospheric Techno Template Creator
-----------------------------------------
This script enhances your manual template by:
1. Analyzing the existing template structure
2. Generating additional dark/atmospheric MIDI patterns
3. Creating a guide for adding TEKNO (kick/bass) and OMNISPHERE (atmospheres)

Usage:
    python3 create_dark_atmospheric_techno.py
"""

import gzip
import os
from pathlib import Path
from midiutil import MIDIFile

class DarkAtmosphericTechnoGenerator:
    def __init__(self):
        self.tempo = 128
        self.output_dir = Path('MIDI-Files/Dark-Atmospheric')
        self.output_dir.mkdir(exist_ok=True)
        
    def create_deep_kick_midi(self):
        """Deep, rumbling kick pattern with subtle variations"""
        midi = MIDIFile(1)
        track = 0
        channel = 9  # Drums
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Deep Kick - TEKNO")
        
        # 4 bars with slight velocity variation for organic feel
        for bar in range(4):
            for beat in [0, 1, 2, 3]:
                note_time = bar * 4 + beat
                # Alternate velocity for groove
                velocity = 127 if beat % 2 == 0 else 120
                midi.addNote(track, channel, 36, note_time, 0.3, velocity)
        
        output_path = self.output_dir / '10-Deep-Kick-TEKNO.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_sub_rumble_midi(self):
        """Ultra-low sub bass rumble for dark atmosphere"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Sub Rumble - TEKNO")
        
        # Long sustained sub notes with slow progression
        notes = [33, 33, 31, 31, 33, 33, 29, 29]  # A, G, F pattern (dark)
        
        for i, note in enumerate(notes):
            note_time = i * 2  # Every 2 beats
            midi.addNote(track, channel, note, note_time, 1.8, 100)
        
        output_path = self.output_dir / '11-Sub-Rumble-TEKNO.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_dark_pad_midi(self):
        """Dark atmospheric pad using minor chords"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Dark Pad - OMNISPHERE")
        
        # Am chord progression: Am - Dm - Em - F
        progressions = [
            [(57, 60, 64), (57, 60, 64)],  # Am (A C E)
            [(62, 65, 69), (62, 65, 69)],  # Dm (D F A)
            [(64, 67, 71), (64, 67, 71)],  # Em (E G B)
            [(65, 69, 72), (65, 69, 72)],  # F (F A C)
        ]
        
        for bar, chord_pair in enumerate(progressions):
            for half_bar, chord in enumerate(chord_pair):
                note_time = bar * 4 + half_bar * 2
                for note in chord:
                    midi.addNote(track, channel, note, note_time, 1.9, 60)
        
        output_path = self.output_dir / '12-Dark-Pad-OMNISPHERE.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_atmospheric_texture_midi(self):
        """High atmospheric texture with slow evolving notes"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Atmospheric Texture - OMNISPHERE")
        
        # High register ethereal notes
        notes = [
            (81, 84, 88),  # High Am triad
            (79, 84, 88),  # Suspended variation
            (76, 81, 84),  # Lower voicing
            (77, 81, 84),  # F major high
        ]
        
        for i, chord in enumerate(notes):
            note_time = i * 4
            for note in chord:
                # Very soft, long notes
                midi.addNote(track, channel, note, note_time, 3.8, 45)
        
        output_path = self.output_dir / '13-Atmospheric-Texture-OMNISPHERE.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_industrial_perc_midi(self):
        """Industrial metallic percussion for dark vibe"""
        midi = MIDIFile(1)
        track = 0
        channel = 9
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Industrial Perc - TEKNO")
        
        # Scattered metallic hits
        hits = [
            (0.5, 51, 85),    # Ride cymbal
            (2.75, 49, 75),   # Crash
            (5, 51, 90),      # Ride
            (6.5, 52, 70),    # Chinese cymbal
            (10.25, 51, 85),  # Ride
            (13, 49, 80),     # Crash
            (14.5, 52, 75),   # Chinese
        ]
        
        for time_pos, note, velocity in hits:
            midi.addNote(track, channel, note, time_pos, 0.15, velocity)
        
        output_path = self.output_dir / '14-Industrial-Perc-TEKNO.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_drone_bass_midi(self):
        """Deep drone bass for tension"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Drone Bass - TEKNO")
        
        # Single low A note held for entire sequence
        midi.addNote(track, channel, 28, 0, 15.9, 95)  # A0 - very low
        
        output_path = self.output_dir / '15-Drone-Bass-TEKNO.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_reversed_atmosphere_midi(self):
        """Reversed atmosphere effect simulation with crescendo"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.tempo)
        midi.addTrackName(track, time, "Reversed Atmosphere - OMNISPHERE")
        
        # Build up with increasing velocity (simulates reverse)
        chord = [69, 72, 76, 81]  # A major 7th spread
        
        for i in range(8):
            note_time = i * 2
            velocity = 20 + (i * 12)  # Crescendo effect
            for note in chord:
                midi.addNote(track, channel, note, note_time, 1.8, velocity)
        
        output_path = self.output_dir / '16-Reversed-Atmos-OMNISPHERE.mid'
        with open(output_path, 'wb') as f:
            midi.writeFile(f)
        print(f"✅ Created: {output_path}")
        
    def create_setup_guide(self):
        """Create a comprehensive setup guide"""
        guide = """
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
"""
        
        guide_path = self.output_dir / 'SETUP-GUIDE.md'
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide)
        print(f"✅ Created: {guide_path}")
        
    def create_plugin_checker_script(self):
        """Create script to check if TEKNO and OMNISPHERE are installed"""
        script = """#!/usr/bin/env python3
import os
import subprocess

def check_vst3_plugins():
    vst3_paths = [
        "/Library/Audio/Plug-Ins/VST3",
        os.path.expanduser("~/Library/Audio/Plug-Ins/VST3")
    ]
    
    plugins_found = {
        'TEKNO': False,
        'Omnisphere': False
    }
    
    print("🔍 Scanning for VST3 plugins...\\n")
    
    for path in vst3_paths:
        if os.path.exists(path):
            files = os.listdir(path)
            for file in files:
                if 'tekno' in file.lower() or 'tekno' in file.lower():
                    plugins_found['TEKNO'] = True
                    print(f"✅ Found TEKNO: {path}/{file}")
                if 'omnisphere' in file.lower():
                    plugins_found['Omnisphere'] = True
                    print(f"✅ Found Omnisphere: {path}/{file}")
    
    print("\\n" + "="*50)
    print("RESULTS:")
    print("="*50)
    
    if plugins_found['TEKNO']:
        print("✅ TEKNO is installed")
    else:
        print("❌ TEKNO not found - install from developer website")
        
    if plugins_found['Omnisphere']:
        print("✅ OMNISPHERE is installed")
    else:
        print("❌ OMNISPHERE not found - install from Spectrasonics")
    
    if all(plugins_found.values()):
        print("\\n🎉 All plugins ready! You can proceed with the template setup.")
    else:
        print("\\n⚠️  Some plugins missing. Install them before continuing.")

if __name__ == "__main__":
    check_vst3_plugins()
"""
        
        script_path = self.output_dir / 'check_plugins.py'
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script)
        os.chmod(script_path, 0o755)
        print(f"✅ Created: {script_path}")
        
    def generate_all(self):
        """Generate all MIDI files and guides"""
        print("\n" + "="*60)
        print("🎹 DARK ATMOSPHERIC TECHNO GENERATOR")
        print("="*60 + "\n")
        
        print("📁 Creating output directory...")
        print(f"   → {self.output_dir}\n")
        
        print("🎵 Generating MIDI patterns...")
        self.create_deep_kick_midi()
        self.create_sub_rumble_midi()
        self.create_dark_pad_midi()
        self.create_atmospheric_texture_midi()
        self.create_industrial_perc_midi()
        self.create_drone_bass_midi()
        self.create_reversed_atmosphere_midi()
        
        print("\n📖 Creating guides...")
        self.create_setup_guide()
        self.create_plugin_checker_script()
        
        print("\n" + "="*60)
        print("✅ GENERATION COMPLETE!")
        print("="*60)
        
        print(f"""
📂 Files created in: {self.output_dir}

🎵 MIDI Files (7):
   • 10-Deep-Kick-TEKNO.mid
   • 11-Sub-Rumble-TEKNO.mid
   • 12-Dark-Pad-OMNISPHERE.mid
   • 13-Atmospheric-Texture-OMNISPHERE.mid
   • 14-Industrial-Perc-TEKNO.mid
   • 15-Drone-Bass-TEKNO.mid
   • 16-Reversed-Atmos-OMNISPHERE.mid

📖 Guides:
   • SETUP-GUIDE.md (comprehensive instructions)
   • check_plugins.py (verify VST3 installation)

🚀 NEXT STEPS:
   1. Check plugins: python3 {self.output_dir}/check_plugins.py
   2. Open template: {os.path.join('Techno-Template-Output', 'Manual-set Project', 'Manual-set.als')}
   3. Follow: {self.output_dir}/SETUP-GUIDE.md
   4. Add TEKNO and OMNISPHERE as described
   5. Start making dark atmospheric techno! 🎧
""")


if __name__ == "__main__":
    generator = DarkAtmosphericTechnoGenerator()
    generator.generate_all()
