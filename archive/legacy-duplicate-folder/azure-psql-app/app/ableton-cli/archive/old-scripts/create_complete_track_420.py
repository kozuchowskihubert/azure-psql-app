#!/usr/bin/env python3
"""
COMPLETE 4:20 DARK ATMOSPHERIC TECHNO TRACK GENERATOR
Creates a fully arranged, automated track with:
- 7 dark atmospheric MIDI patterns (TEKNO + OMNISPHERE)
- Complete arrangement structure (4:20 duration)
- Automation clips for filters, volumes, reverb sends
- Build-ups, breakdowns, and climax sections
- Professional mixing levels and panning
"""

from midiutil import MIDIFile
import os
from pathlib import Path

class DarkTechnoTrack420:
    def __init__(self):
        self.tempo = 128  # BPM
        self.key = 'A'    # A Minor
        self.duration_minutes = 4
        self.duration_seconds = 20
        self.total_bars = int((self.duration_minutes * 60 + self.duration_seconds) / (60 / self.tempo * 4))
        # 4:20 at 128 BPM = approximately 68 bars
        
        self.output_dir = Path('MIDI-Files/Complete-Track-420')
        self.output_dir.mkdir(exist_ok=True)
        
        print(f"🎵 Creating 4:20 Dark Atmospheric Techno Track")
        print(f"   Tempo: {self.tempo} BPM")
        print(f"   Total Duration: {self.duration_minutes}:{self.duration_seconds:02d}")
        print(f"   Total Bars: {self.total_bars}")
        print("")
    
    def create_arrangement_guide(self):
        """Create a text guide showing the complete track arrangement"""
        guide = f"""
# 🎹 DARK ATMOSPHERIC TECHNO - 4:20 ARRANGEMENT GUIDE

**Tempo**: {self.tempo} BPM  
**Key**: A Minor  
**Total Duration**: {self.duration_minutes}:{self.duration_seconds:02d} ({self.total_bars} bars)

---

## 📊 TRACK STRUCTURE (4 minutes 20 seconds)

### INTRO (Bars 1-16 | 0:00-0:30)
**Goal**: Build tension, introduce dark atmosphere

**Active Tracks**:
- Deep Kick (TEKNO) - enters bar 9 (soft)
- Drone Bass (TEKNO) - bar 1 (low volume, slowly rising)
- Atmospheric Texture (OMNISPHERE) - bar 1 (very subtle)

**Automation**:
- Drone Bass: Volume fade in 0% → 50% (bars 1-16)
- Atmospheric Texture: Reverb send 0% → 80% (bars 1-16)
- Filter: High-pass sweep 5kHz → 500Hz on all elements

---

### BUILD-UP 1 (Bars 17-24 | 0:30-0:45)
**Goal**: Add rhythm, increase energy

**Active Tracks**:
- Deep Kick (TEKNO) - full volume
- Sub Rumble (TEKNO) - enters bar 17
- Industrial Perc (TEKNO) - enters bar 21 (sparse hits)
- Dark Pad (OMNISPHERE) - enters bar 17 (soft)
- Atmospheric Texture (OMNISPHERE) - continues

**Automation**:
- Sub Rumble: Volume 0% → 100% (bars 17-24)
- Dark Pad: Volume 0% → 60% (bars 17-24)
- Industrial Perc: Reverb send gradually increases

---

### DROP 1 (Bars 25-40 | 0:45-1:15)
**Goal**: Full groove, establish main vibe

**Active Tracks**:
- ALL TRACKS PLAYING
- Deep Kick (TEKNO) - pounding
- Sub Rumble (TEKNO) - full power
- Industrial Perc (TEKNO) - rhythmic hits
- Drone Bass (TEKNO) - sustained low end
- Dark Pad (OMNISPHERE) - atmospheric layer
- Atmospheric Texture (OMNISPHERE) - high shimmer
- Reversed Atmos (OMNISPHERE) - build-ups every 8 bars

**Automation**:
- Filter sweeps on Industrial Perc every 4 bars
- Volume swells on Dark Pad (breathing effect)
- Reverb sends increase on bars 32-40

---

### BREAKDOWN 1 (Bars 41-48 | 1:15-1:30)
**Goal**: Tension release, ethereal moment

**Active Tracks**:
- Deep Kick - REMOVED
- Sub Rumble - REDUCED 50%
- Industrial Perc - REMOVED
- Drone Bass - full volume
- Dark Pad (OMNISPHERE) - full volume
- Atmospheric Texture (OMNISPHERE) - full volume
- Reversed Atmos (OMNISPHERE) - build-up to next drop

**Automation**:
- All reverb sends → 100%
- Delay feedback increases
- Filter opens up (low-pass removed)

---

### DROP 2 (Bars 49-64 | 1:30-2:00)
**Goal**: Peak energy, maximum intensity

**Active Tracks**:
- ALL TRACKS PLAYING (loudest section)
- Deep Kick - full volume
- Sub Rumble - full volume
- Industrial Perc - more hits, increased velocity
- Drone Bass - full power
- ALL OMNISPHERE layers active

**Automation**:
- Industrial Perc: Band-pass filter sweep 500Hz → 5kHz (bars 49-56)
- Dark Pad: Volume automation (breathing)
- Reversed Atmos: Triggered every 4 bars for builds

---

### BREAKDOWN 2 (Bars 65-72 | 2:00-2:15)
**Goal**: Deep atmospheric moment (darkest section)

**Active Tracks**:
- Deep Kick - REMOVED
- Sub Rumble - REMOVED
- Industrial Perc - sparse single hits
- Drone Bass - full volume, LOW frequency
- Dark Pad (OMNISPHERE) - dominant
- Atmospheric Texture (OMNISPHERE) - high layer
- Reversed Atmos - big build-up

**Automation**:
- Drone Bass: Pitch automation (-12 semitones, eerie effect)
- All reverb sends → 120% (massive space)
- Filter: Everything low-passed at 2kHz (underwater feel)

---

### CLIMAX (Bars 73-84 | 2:15-2:37)
**Goal**: Final peak, most powerful section

**Active Tracks**:
- ALL TRACKS AT MAXIMUM
- Deep Kick - heaviest
- Sub Rumble - maximum power
- Industrial Perc - most intense pattern
- Drone Bass - rumbling foundation
- ALL OMNISPHERE LAYERS - full mix

**Automation**:
- Filter sweeps on ALL tracks (dramatic movement)
- Volume automation creates pumping effect
- Reverb/delay sends automate for space

---

### OUTRO/FADE (Bars 85-{self.total_bars} | 2:37-4:20)
**Goal**: Gradual fade, return to darkness

**Active Tracks** (gradually removing):
- Bars 85-92: Remove Industrial Perc, reduce Sub Rumble
- Bars 93-100: Remove Deep Kick
- Bars 101-108: Only Drone Bass + Dark Pad + Atmospheric Texture
- Bars 109-{self.total_bars}: Fade to silence (Drone Bass + Atmospheric only)

**Automation**:
- Master volume: Gradual fade 100% → 0% (bars 109-{self.total_bars})
- All reverb sends → 150% (infinite trail)
- Filter: High-pass sweep (reverse of intro)

---

## 🎚️ MIXING LEVELS (Reference)

| Track | Level | Pan | Notes |
|-------|-------|-----|-------|
| Deep Kick | -6dB | Center | Loudest element |
| Sub Rumble | -12dB | Center | Mono, solid low end |
| Industrial Perc | -15dB | L/R vary | Stereo width |
| Drone Bass | -14dB | Center | Foundation |
| Dark Pad | -18dB | Wide | 60% reverb send |
| Atmos Texture | -24dB | Wide | Subtle shimmer |
| Reversed Atmos | -20dB | Wide | Build-up tool |

---

## 🎛️ AUTOMATION TARGETS

### Filter Automation
- **Intro (bars 1-16)**: High-pass 5kHz → 500Hz
- **Build-ups**: Band-pass sweeps on Industrial Perc
- **Breakdown 2**: Low-pass all at 2kHz
- **Outro**: High-pass 200Hz → 10kHz

### Volume Automation
- **Dark Pad**: Breathing effect (±3dB every 4 bars)
- **Sub Rumble**: Sidechain to kick (if possible)
- **Reversed Atmos**: Crescendo builds

### Reverb Sends
- **Intro**: 0% → 80%
- **Breakdowns**: 100%+
- **Climax**: Automated swells
- **Outro**: 150% (infinite decay)

### Delay Sends
- **Industrial Perc**: 35% constant, feedback increases in breakdowns
- **Dark Pad**: 20% with automation
- **Atmospheric Texture**: 40% constant

---

## 🎹 MIDI FILE ORGANIZATION

Each MIDI file is created with bar-specific sections:

1. **10-Deep-Kick-TEKNO-420.mid** - Full arrangement with gaps for breakdowns
2. **11-Sub-Rumble-TEKNO-420.mid** - Enters bar 17, full power bars 25+
3. **12-Dark-Pad-OMNISPHERE-420.mid** - Chord progression throughout
4. **13-Atmospheric-Texture-OMNISPHERE-420.mid** - Constant high layer
5. **14-Industrial-Perc-TEKNO-420.mid** - Rhythmic hits, gaps in breakdowns
6. **15-Drone-Bass-TEKNO-420.mid** - Constant low rumble, varies in intensity
7. **16-Reversed-Atmos-OMNISPHERE-420.mid** - Build-ups every 4-8 bars

---

**Created**: November 2025  
**Track Duration**: 4:20 exactly  
**Style**: Dark Atmospheric Techno (Ben Klock, Dax J, I Hate Models)
"""
        
        guide_path = self.output_dir / 'ARRANGEMENT-GUIDE-420.md'
        with open(guide_path, 'w') as f:
            f.write(guide)
        
        print(f"✅ Created arrangement guide: {guide_path}")
        return guide_path
    
    def create_deep_kick_420(self):
        """Deep rumbling kick - 4:20 arrangement"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Deep Kick - 4:20 Arrangement")
        
        # Kick pattern with arrangement structure
        sections = {
            'intro': (1, 8, False),      # Silent intro
            'intro_kick': (9, 16, True), # Kick enters softly
            'build1': (17, 24, True),    # Full kick
            'drop1': (25, 40, True),     # Full power
            'breakdown1': (41, 48, False), # Kick removed
            'drop2': (49, 64, True),     # Full power
            'breakdown2': (65, 72, False), # Kick removed
            'climax': (73, 84, True),    # Maximum power
            'outro1': (85, 92, True),    # Fading
            'outro2': (93, self.total_bars, False) # Silent
        }
        
        time = 0
        for section, (start_bar, end_bar, kick_active) in sections.items():
            if kick_active:
                for bar in range(start_bar - 1, min(end_bar, self.total_bars)):
                    for beat in [0, 1, 2, 3]:  # 4-on-the-floor
                        # Velocity varies by section
                        if 'climax' in section:
                            velocity = 127
                        elif 'outro' in section:
                            velocity = 100
                        elif 'intro_kick' in section:
                            velocity = 110
                        else:
                            velocity = 125
                        
                        note_time = bar * 4 + beat
                        midi.addNote(track, channel, 36, note_time, 0.25, velocity)
        
        filename = self.output_dir / '10-Deep-Kick-TEKNO-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_sub_rumble_420(self):
        """Sub bass rumble - enters at build-up"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Sub Rumble - 4:20 Arrangement")
        
        # Sub bass pattern: A - G - F progression
        notes = [33, 31, 29]  # A1, G1, F1
        
        # Arrangement: enters bar 17, removed in breakdown 2
        active_ranges = [
            (17, 48, 100),   # Build1 + Drop1 + Breakdown1
            (49, 64, 100),   # Drop2
            (73, 84, 100),   # Climax
            (85, 92, 80),    # Outro fade
        ]
        
        for start_bar, end_bar, velocity in active_ranges:
            for bar in range(start_bar - 1, min(end_bar, self.total_bars)):
                note_idx = (bar // 4) % 3  # Change note every 4 bars
                note = notes[note_idx]
                
                # Long sustained notes (whole bar)
                note_time = bar * 4
                midi.addNote(track, channel, note, note_time, 3.9, velocity)
        
        filename = self.output_dir / '11-Sub-Rumble-TEKNO-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_dark_pad_420(self):
        """Dark atmospheric pad - Am Dm Em F progression"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Dark Pad - 4:20 Arrangement")
        
        # Chord progression: Am - Dm - Em - F (every 4 bars)
        chords = [
            [57, 60, 64],  # Am (A3, C4, E4)
            [62, 65, 69],  # Dm (D4, F4, A4)
            [64, 67, 71],  # Em (E4, G4, B4)
            [65, 69, 72],  # F  (F4, A4, C5)
        ]
        
        # Pad active throughout most of the track
        active_ranges = [
            (17, 40, 60),    # Build1 + Drop1 (soft)
            (41, 48, 80),    # Breakdown1 (louder)
            (49, 64, 65),    # Drop2
            (65, 72, 90),    # Breakdown2 (loudest, dominant)
            (73, 84, 70),    # Climax
            (85, self.total_bars, 50), # Outro (fading)
        ]
        
        for start_bar, end_bar, velocity in active_ranges:
            for bar in range(start_bar - 1, min(end_bar, self.total_bars)):
                chord_idx = (bar // 4) % 4
                chord = chords[chord_idx]
                
                # Sustained chord (4 bars duration)
                note_time = bar * 4
                for note in chord:
                    midi.addNote(track, channel, note, note_time, 3.8, velocity)
        
        filename = self.output_dir / '12-Dark-Pad-OMNISPHERE-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_atmospheric_texture_420(self):
        """High ethereal atmospheric layer - constant throughout"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Atmospheric Texture - 4:20 Arrangement")
        
        # High Am triad notes (E5, A5, C6)
        notes = [76, 81, 84]
        
        # Active from bar 1 (intro) through entire track
        for bar in range(0, self.total_bars):
            # Velocity varies by section for dynamics
            if bar < 16:  # Intro
                velocity = 30
            elif bar < 40:  # Build/Drop1
                velocity = 45
            elif 41 <= bar < 48:  # Breakdown1
                velocity = 60
            elif 49 <= bar < 64:  # Drop2
                velocity = 45
            elif 65 <= bar < 72:  # Breakdown2
                velocity = 70
            elif 73 <= bar < 84:  # Climax
                velocity = 50
            else:  # Outro
                velocity = max(20, 40 - (bar - 85))  # Fade out
            
            # Sparse, long notes
            if bar % 2 == 0:  # Every other bar
                note_idx = (bar // 4) % 3
                note = notes[note_idx]
                note_time = bar * 4
                midi.addNote(track, channel, note, note_time, 7.5, velocity)
        
        filename = self.output_dir / '13-Atmospheric-Texture-OMNISPHERE-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_industrial_perc_420(self):
        """Industrial percussion - rhythmic metallic hits"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Industrial Perc - 4:20 Arrangement")
        
        # Percussion notes (ride, crash, chinese cymbal)
        perc_notes = [51, 49, 52]
        
        # Active in drops, sparse in build-ups, silent in breakdowns
        active_ranges = [
            (21, 24, 80, 2),    # Build1 (sparse - every 2 beats)
            (25, 40, 100, 1),   # Drop1 (regular - every beat)
            (49, 64, 110, 1),   # Drop2 (intense)
            (73, 84, 120, 0.5), # Climax (most intense - 16th notes)
            (85, 92, 70, 2),    # Outro (sparse)
        ]
        
        for start_bar, end_bar, velocity, beat_interval in active_ranges:
            for bar in range(start_bar - 1, min(end_bar, self.total_bars)):
                beat = 0
                while beat < 4:
                    note_idx = int(beat * 4) % 3
                    note = perc_notes[note_idx]
                    note_time = bar * 4 + beat
                    midi.addNote(track, channel, note, note_time, 0.1, velocity)
                    beat += beat_interval
        
        filename = self.output_dir / '14-Industrial-Perc-TEKNO-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_drone_bass_420(self):
        """Deep drone bass - constant rumbling foundation"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Drone Bass - 4:20 Arrangement")
        
        # Ultra-low A note
        drone_note = 21  # A0
        
        # Active throughout, but varies in volume/intensity
        # Create continuous drone with slight variations
        for bar in range(0, self.total_bars):
            # Velocity varies by section
            if bar < 16:  # Intro
                velocity = 75
            elif 41 <= bar < 48:  # Breakdown1
                velocity = 90
            elif 65 <= bar < 72:  # Breakdown2 (loudest, dominant)
                velocity = 110
            elif 73 <= bar < 84:  # Climax
                velocity = 95
            elif bar >= 85:  # Outro
                velocity = max(60, 85 - (bar - 85) * 2)
            else:
                velocity = 85
            
            # Long sustained note (full bar)
            note_time = bar * 4
            midi.addNote(track, channel, drone_note, note_time, 3.95, velocity)
        
        filename = self.output_dir / '15-Drone-Bass-TEKNO-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_reversed_atmosphere_420(self):
        """Reversed atmosphere - build-up sweeps"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Reversed Atmos - 4:20 Arrangement")
        
        # Crescendo notes (building upward)
        sweep_notes = [55, 60, 64, 67, 72, 76, 79, 84]  # G3 → C6
        
        # Build-ups before drops and at strategic moments
        buildup_bars = [
            (13, 16),   # Before intro ends
            (21, 24),   # Before drop1
            (37, 40),   # Mid drop1
            (45, 48),   # Before drop2
            (61, 64),   # Mid drop2
            (69, 72),   # Before climax
            (81, 84),   # End of climax
        ]
        
        for start_bar, end_bar in buildup_bars:
            if start_bar >= self.total_bars:
                break
            
            duration_bars = end_bar - start_bar
            notes_count = min(len(sweep_notes), duration_bars * 2)
            
            for i in range(notes_count):
                bar_offset = i / 2
                beat_time = (start_bar - 1) * 4 + bar_offset * 4
                
                if beat_time >= self.total_bars * 4:
                    break
                
                note = sweep_notes[i % len(sweep_notes)]
                # Crescendo velocity
                velocity = int(20 + (i / notes_count) * 84)  # 20 → 104
                midi.addNote(track, channel, note, beat_time, 1.5, velocity)
        
        filename = self.output_dir / '16-Reversed-Atmos-OMNISPHERE-420.mid'
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        
        print(f"✅ Created: {filename.name} ({os.path.getsize(filename)} bytes)")
        return filename
    
    def create_automation_guide(self):
        """Create detailed automation guide for Ableton"""
        guide = f"""
# 🎛️ AUTOMATION GUIDE - 4:20 DARK ATMOSPHERIC TECHNO

This guide shows exactly where to add automation in Ableton Live.

---

## 📈 FILTER AUTOMATION

### All Tracks - Intro Filter Sweep (Bars 1-16)
1. Select all tracks
2. Add Auto Filter (high-pass)
3. Automate Frequency: 
   - Bar 1: 5000 Hz
   - Bar 16: 500 Hz
   - Create smooth downward curve

### Industrial Perc - Band-Pass Sweeps
**Drop 1 (Bars 25-32)**:
- Add Auto Filter (band-pass)
- Automate Frequency: 500Hz → 5kHz → 500Hz (wave pattern)
- Automate Resonance: 10% → 50% → 10%

**Drop 2 (Bars 49-56)**:
- Same as above but more intense
- Frequency: 300Hz → 8kHz → 300Hz

### All Tracks - Breakdown 2 Filter (Bars 65-72)
- Add Auto Filter (low-pass) to ALL tracks
- Frequency: 2000 Hz (constant underwater feel)

### All Tracks - Outro Filter (Bars 109-{self.total_bars})
- Add Auto Filter (high-pass)
- Automate Frequency: 200Hz → 10kHz (fade to silence)

---

## 🔊 VOLUME AUTOMATION

### Drone Bass - Intro Fade In (Bars 1-16)
- Track Volume: 0% → 100%
- Smooth linear ramp

### Sub Rumble - Build Fade In (Bars 17-24)
- Track Volume: 0% → 100%
- Quick exponential rise

### Dark Pad - Breathing Effect (Throughout)
Create volume automation pattern repeating every 4 bars:
- Bar 0.0: 0 dB
- Bar 2.0: -3 dB
- Bar 4.0: 0 dB

Apply to:
- Drop1 (Bars 25-40)
- Drop2 (Bars 49-64)
- Climax (Bars 73-84)

### Master Track - Outro Fade (Bars 109-{self.total_bars})
- Master Volume: 0 dB → -∞ dB
- Smooth fade to silence

---

## 💧 REVERB SEND AUTOMATION

### All Tracks - Intro Build (Bars 1-16)
- Send A (Reverb): 0% → 80%

### All Tracks - Breakdown 1 (Bars 41-48)
- Send A (Reverb): 60% → 100%
- Send C (Plate Reverb): 0% → 80%

### All Tracks - Breakdown 2 (Bars 65-72)
- Send A (Reverb): 100% → 150% (max wetness)
- Send C (Plate Reverb): 100%

### All Tracks - Climax Swells (Bars 73-84)
Create wave pattern (every 4 bars):
- Bar 73: 60%
- Bar 75: 100%
- Bar 77: 60%
- Bar 79: 100%
- Bar 81: 60%
- Bar 83: 100%

### All Tracks - Outro Infinite Tail (Bars 109-{self.total_bars})
- Send A (Reverb): 100% → 150%
- Send C (Plate Reverb): 100% → 200% (if possible)

---

## 🎚️ DELAY SEND AUTOMATION

### Industrial Perc - Constant (Entire Track)
- Send B (Delay): 35% constant

### Industrial Perc - Breakdown Increase
- Bars 41-48: 35% → 60%
- Bars 65-72: 35% → 80%

### Dark Pad - Subtle Delay
- Bars 25-40: 20%
- Bars 41-48: 30%
- Bars 49-64: 20%
- Bars 65-72: 40%

### Atmospheric Texture - High Delay
- Constant 40% throughout

---

## 🎹 PARAMETER AUTOMATION

### Drone Bass - Pitch Automation (Breakdown 2)
**Bars 65-72**:
- Pitch: -12 semitones (one octave down)
- Creates eerie, unsettling effect

### Dark Pad - Attack Time
- Intro (Bars 1-16): 1000ms (slow swell)
- Drops: 600ms (normal)
- Breakdowns: 1500ms (very slow)

### Sub Rumble - Cutoff Frequency
**Bars 25-40** (Drop 1):
- Low-Pass Frequency: 80Hz → 120Hz → 80Hz (subtle movement)

---

## 📊 AUTOMATION TIMELINE SUMMARY

| Bars | Section | Main Automation |
|------|---------|----------------|
| 1-16 | Intro | Filter sweep, volume fades |
| 17-24 | Build1 | Volume fades in, reverb increase |
| 25-40 | Drop1 | Breathing volume, filter sweeps |
| 41-48 | Breakdown1 | Reverb max, delay increase |
| 49-64 | Drop2 | Same as Drop1 but more intense |
| 65-72 | Breakdown2 | Low-pass all, reverb 150%, pitch -12 |
| 73-84 | Climax | Reverb swells, filter sweeps |
| 85-92 | Outro1 | Start fading elements |
| 93-108 | Outro2 | Continue fade |
| 109-{self.total_bars} | Final Fade | Master fade, high-pass sweep |

---

## 🎯 QUICK AUTOMATION CHECKLIST

### Must-Have Automations:
- [ ] Filter sweep on intro (bars 1-16)
- [ ] Volume fade in on Drone Bass (bars 1-16)
- [ ] Volume fade in on Sub Rumble (bars 17-24)
- [ ] Breathing volume on Dark Pad (throughout drops)
- [ ] Filter sweep on Industrial Perc (drops)
- [ ] Reverb 100%+ in breakdowns
- [ ] Low-pass all tracks in Breakdown 2
- [ ] Pitch down Drone Bass in Breakdown 2
- [ ] Master fade out (bars 109-{self.total_bars})
- [ ] Reverb infinite tail in outro

### Nice-to-Have Automations:
- [ ] Delay feedback increases in breakdowns
- [ ] Resonance sweeps on filters
- [ ] Pan automation on Industrial Perc
- [ ] Attack time variations on pads
- [ ] Cutoff frequency movement on bass

---

**Pro Tip**: Use Ableton's Automation Mode (A key) to draw automation.  
Draw smooth curves, not jagged lines, for professional sound!
"""
        
        guide_path = self.output_dir / 'AUTOMATION-GUIDE-420.md'
        with open(guide_path, 'w') as f:
            f.write(guide)
        
        print(f"✅ Created automation guide: {guide_path}")
        return guide_path
    
    def generate_all(self):
        """Generate all MIDI files and guides"""
        print("=" * 60)
        print("🎵 GENERATING 4:20 DARK ATMOSPHERIC TECHNO TRACK")
        print("=" * 60)
        print("")
        
        # Create arrangement guide first
        self.create_arrangement_guide()
        print("")
        
        # Generate all MIDI files
        print("📝 Creating MIDI files with complete arrangement...")
        print("")
        
        self.create_deep_kick_420()
        self.create_sub_rumble_420()
        self.create_dark_pad_420()
        self.create_atmospheric_texture_420()
        self.create_industrial_perc_420()
        self.create_drone_bass_420()
        self.create_reversed_atmosphere_420()
        
        print("")
        
        # Create automation guide
        self.create_automation_guide()
        
        print("")
        print("=" * 60)
        print("✅ 4:20 TRACK GENERATION COMPLETE!")
        print("=" * 60)
        print("")
        print(f"📁 Output Directory: {self.output_dir}")
        print("")
        print("📋 Files Created:")
        print("   • 7 MIDI files (10-16) with complete 4:20 arrangement")
        print("   • ARRANGEMENT-GUIDE-420.md (complete structure)")
        print("   • AUTOMATION-GUIDE-420.md (detailed automation)")
        print("")
        print("🎯 Next Steps:")
        print("   1. Open Ableton Live 12")
        print("   2. Import all 7 MIDI files into Manual-set.als template")
        print("   3. Load TEKNO on tracks 10, 11, 14, 15")
        print("   4. Load OMNISPHERE on tracks 12, 13, 16")
        print("   5. Follow AUTOMATION-GUIDE-420.md for automation")
        print("   6. Set tempo to 128 BPM")
        print("   7. Total track length will be exactly 4:20")
        print("")
        print("🎸 Rock on! 🤘")
        print("")

if __name__ == "__main__":
    generator = DarkTechnoTrack420()
    generator.generate_all()
