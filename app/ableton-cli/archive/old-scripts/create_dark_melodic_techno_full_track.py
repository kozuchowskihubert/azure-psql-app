#!/usr/bin/env python3
"""
Dark Melodic Techno - Complete Track Generator
Creates a full-length track with proper song structure and VST3 presets
"""

from midiutil import MIDIFile
import os

class DarkMelodicTechnoTrack:
    def __init__(self):
        self.tempo = 126  # Slightly slower for melodic techno
        self.key = "A Minor"
        self.bars_per_section = {
            'intro': 16,        # Bars 1-16: Atmospheric intro
            'build1': 8,        # Bars 17-24: First build-up
            'drop1': 16,        # Bars 25-40: Main drop (first chorus)
            'breakdown1': 8,    # Bars 41-48: First breakdown
            'build2': 8,        # Bars 49-56: Second build-up
            'drop2': 16,        # Bars 57-72: Second drop (main chorus)
            'breakdown2': 16,   # Bars 73-88: Extended breakdown (emotional peak)
            'build3': 8,        # Bars 89-96: Final build-up
            'drop3': 16,        # Bars 97-112: Final drop (climax)
            'outro': 24,        # Bars 113-136: Extended outro
        }
        
        # Calculate bar positions for each section
        self.sections = {}
        current_bar = 1
        for section, length in self.bars_per_section.items():
            self.sections[section] = {
                'start': current_bar,
                'end': current_bar + length - 1,
                'length': length
            }
            current_bar += length
        
        self.total_bars = current_bar - 1  # 136 bars total
        self.total_duration = (self.total_bars * 4 * 60) / self.tempo  # ~8.6 minutes
        
        # Output directory
        self.output_dir = "MIDI-Files/Dark-Melodic-Full-Track"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def bar_to_beat(self, bar):
        """Convert bar number to beat position (4 beats per bar)"""
        return (bar - 1) * 4
    
    def get_section_at_bar(self, bar):
        """Determine which section a bar belongs to"""
        for section, info in self.sections.items():
            if info['start'] <= bar <= info['end']:
                return section
        return 'outro'
    
    def create_kick_pattern(self):
        """01 - Deep Kick (TEKNO) - 4-on-floor with strategic breaks"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # No kick in intro (bars 1-8), some breakdowns
            if bar <= 8:
                continue
            if section == 'breakdown1' and bar >= 45:  # Remove last 4 bars
                continue
            if section == 'breakdown2' and 77 <= bar <= 84:  # Remove middle section
                continue
            
            # Velocity variations by section
            if section in ['build1', 'build2', 'build3']:
                velocity = min(127, 100 + ((bar - self.sections[section]['start']) * 3))
            elif section in ['drop1', 'drop2', 'drop3']:
                velocity = 127
            else:
                velocity = 110
            
            # 4-on-floor kick pattern
            for i in range(4):
                midi.addNote(0, 0, 36, beat + i, 0.25, velocity)
        
        filename = f"{self.output_dir}/01-Deep-Kick-TEKNO.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_sub_bass_pattern(self):
        """02 - Sub Rumble (TEKNO) - Deep sub bass foundation"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # A Minor scale bass notes
        bass_progression = [33, 31, 29, 28]  # A, G, F, E (low octave)
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Start from bar 9, remove in some breakdowns
            if bar < 9:
                continue
            if section == 'breakdown1':
                continue
            if section == 'breakdown2' and 77 <= bar <= 84:
                continue
            
            # Choose bass note (changes every 4 bars)
            note = bass_progression[(bar // 4) % len(bass_progression)]
            
            # Velocity by section
            if section in ['drop1', 'drop2', 'drop3']:
                velocity = 115
            elif section in ['build1', 'build2', 'build3']:
                velocity = 95
            else:
                velocity = 85
            
            # Sustained bass note throughout bar
            midi.addNote(0, 0, note, beat, 4, velocity)
        
        filename = f"{self.output_dir}/02-Sub-Rumble-TEKNO.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_melodic_lead_pattern(self):
        """03 - Melodic Lead (Omnisphere) - Emotional lead melody"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # A Minor melodic phrases (haunting, emotional)
        melody_phrases = {
            'phrase1': [69, 67, 65, 64, 62, 60, 62, 64],  # A-G-F-E-D-C-D-E
            'phrase2': [72, 71, 69, 67, 69, 71, 72, 74],  # C-B-A-G-A-B-C-D
            'phrase3': [76, 74, 72, 71, 69, 67, 65, 64],  # E-D-C-B-A-G-F-E (descending)
            'phrase4': [64, 65, 67, 69, 71, 72, 71, 69],  # E-F-G-A-B-C-B-A (ascending)
        }
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Lead active in drops and breakdowns
            if section not in ['drop1', 'drop2', 'drop3', 'breakdown2']:
                continue
            
            # Choose phrase based on section
            if section == 'drop1':
                phrase = melody_phrases['phrase1']
            elif section == 'drop2':
                phrase = melody_phrases['phrase2']
            elif section == 'breakdown2':
                phrase = melody_phrases['phrase3']
            else:  # drop3
                phrase = melody_phrases['phrase4']
            
            # Play melody (8 notes per 4 bars, half-note duration)
            note_idx = ((bar - self.sections[section]['start']) // 4) % len(phrase)
            if (bar - self.sections[section]['start']) % 4 == 0:  # Every 4 bars
                note = phrase[note_idx]
                velocity = 95 if section == 'breakdown2' else 105
                duration = 3.5  # Long, sustained notes
                midi.addNote(0, 0, note, beat, duration, velocity)
        
        filename = f"{self.output_dir}/03-Melodic-Lead-OMNISPHERE.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_dark_pad_pattern(self):
        """04 - Dark Pad (Omnisphere) - Atmospheric chord progression"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # A Minor chord progression (dark, emotional)
        chord_progression = [
            [57, 60, 64],  # Am (A-C-E)
            [55, 58, 62],  # Gm (G-Bb-D)
            [53, 57, 60],  # Fm (F-Ab-C)
            [52, 55, 59],  # Em (E-G-B)
        ]
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Active throughout most of the track
            if bar <= 4:  # Start after first 4 bars
                continue
            
            # Choose chord (changes every 4 bars)
            chord = chord_progression[(bar // 4) % len(chord_progression)]
            
            # Velocity by section
            if section in ['drop1', 'drop2', 'drop3']:
                velocity = 75  # Lower in drops (let lead shine)
            elif section in ['breakdown1', 'breakdown2']:
                velocity = 95  # Higher in breakdowns
            elif section in ['build1', 'build2', 'build3']:
                velocity = 85
            else:
                velocity = 70
            
            # Sustained chord throughout bar
            for note in chord:
                midi.addNote(0, 0, note, beat, 4, velocity)
        
        filename = f"{self.output_dir}/04-Dark-Pad-OMNISPHERE.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_arpeggio_pattern(self):
        """05 - Arpeggio Synth (Omnisphere) - Rhythmic arpeggiated sequence"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # A Minor arpeggio pattern (16th notes)
        arp_pattern = [57, 60, 64, 67, 69, 67, 64, 60]  # A-C-E-G-A-G-E-C
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Active in drops and builds
            if section not in ['drop1', 'drop2', 'drop3', 'build2', 'build3']:
                continue
            
            # Velocity variations
            if section in ['drop1', 'drop2', 'drop3']:
                base_velocity = 90
            else:
                base_velocity = 75
            
            # 16th note arpeggio pattern
            for i in range(16):
                note = arp_pattern[i % len(arp_pattern)]
                velocity = base_velocity + (10 if i % 4 == 0 else 0)  # Accent on beats
                position = beat + (i * 0.25)
                midi.addNote(0, 0, note, position, 0.2, velocity)
        
        filename = f"{self.output_dir}/05-Arpeggio-OMNISPHERE.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_percussion_pattern(self):
        """06 - Percussion (TEKNO) - Industrial/melodic percussion elements"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # Percussion patterns (hi-hats, claps, rimshots)
        perc_patterns = {
            'hihat_closed': [(0, 42, 80), (0.5, 42, 60), (1, 42, 80), (1.5, 42, 60),
                            (2, 42, 80), (2.5, 42, 60), (3, 42, 80), (3.5, 42, 60)],
            'hihat_open': [(1.5, 46, 70), (3.5, 46, 70)],
            'clap': [(1, 39, 100), (3, 39, 100)],
            'rimshot': [(0.75, 37, 85), (2.75, 37, 85)],
        }
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Skip intro
            if bar <= 8:
                continue
            
            # Hi-hats throughout
            if section not in ['breakdown1', 'breakdown2']:
                for offset, note, velocity in perc_patterns['hihat_closed']:
                    adj_velocity = velocity if section in ['drop1', 'drop2', 'drop3'] else velocity - 15
                    midi.addNote(0, 0, note, beat + offset, 0.1, adj_velocity)
            
            # Open hi-hats in drops
            if section in ['drop1', 'drop2', 'drop3']:
                for offset, note, velocity in perc_patterns['hihat_open']:
                    midi.addNote(0, 0, note, beat + offset, 0.4, velocity)
            
            # Claps in drops and builds
            if section in ['drop1', 'drop2', 'drop3', 'build2', 'build3']:
                for offset, note, velocity in perc_patterns['clap']:
                    midi.addNote(0, 0, note, beat + offset, 0.1, velocity)
            
            # Rimshots for variation in drops
            if section in ['drop2', 'drop3'] and bar % 4 == 0:
                for offset, note, velocity in perc_patterns['rimshot']:
                    midi.addNote(0, 0, note, beat + offset, 0.1, velocity)
        
        filename = f"{self.output_dir}/06-Percussion-TEKNO.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_atmospheric_texture(self):
        """07 - Atmospheric Texture (Omnisphere) - Ambient soundscape"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # High atmospheric notes (constant drone)
        atmos_notes = [81, 84, 88]  # A, C, E (high octave)
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Present throughout entire track
            velocity_map = {
                'intro': 60,
                'build1': 70,
                'drop1': 55,
                'breakdown1': 75,
                'build2': 75,
                'drop2': 60,
                'breakdown2': 85,  # Peak in emotional breakdown
                'build3': 80,
                'drop3': 65,
                'outro': 50,
            }
            
            velocity = velocity_map.get(section, 60)
            
            # Long sustained notes (every 8 bars change note)
            if (bar - 1) % 8 == 0:
                note = atmos_notes[((bar - 1) // 8) % len(atmos_notes)]
                midi.addNote(0, 0, note, beat, 32, velocity)  # 8-bar duration
        
        filename = f"{self.output_dir}/07-Atmospheric-Texture-OMNISPHERE.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_bass_pluck_pattern(self):
        """08 - Bass Pluck (TEKNO) - Rhythmic bass stabs"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # Rhythmic bass stabs pattern
        bass_rhythm = [
            (0, 45, 100, 0.3),
            (0.75, 45, 85, 0.2),
            (1.5, 43, 90, 0.25),
            (2.25, 45, 95, 0.3),
            (3, 43, 85, 0.25),
        ]
        
        for bar in range(1, self.total_bars + 1):
            section = self.get_section_at_bar(bar)
            beat = self.bar_to_beat(bar)
            
            # Active in drops and builds
            if section not in ['drop1', 'drop2', 'drop3', 'build2', 'build3']:
                continue
            
            # Play rhythmic pattern
            for offset, note, velocity, duration in bass_rhythm:
                adj_velocity = velocity if section in ['drop2', 'drop3'] else velocity - 10
                midi.addNote(0, 0, note, beat + offset, duration, adj_velocity)
        
        filename = f"{self.output_dir}/08-Bass-Pluck-TEKNO.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_fx_riser_pattern(self):
        """09 - FX Riser (Omnisphere) - Build-up effects and transitions"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.tempo)
        
        # Risers for build-ups
        for section_name in ['build1', 'build2', 'build3']:
            section = self.sections[section_name]
            start_bar = section['start']
            length = section['length']
            
            # Create rising pitch automation (simulate with notes)
            for bar_offset in range(length):
                bar = start_bar + bar_offset
                beat = self.bar_to_beat(bar)
                
                # Rising note pitch
                base_note = 60 + (bar_offset * 2)  # Rise in pitch
                velocity = 70 + (bar_offset * 7)  # Increase velocity
                
                midi.addNote(0, 0, base_note, beat, 4, min(127, velocity))
        
        # Impact hits at drop points
        for section_name in ['drop1', 'drop2', 'drop3']:
            section = self.sections[section_name]
            start_beat = self.bar_to_beat(section['start'])
            
            # Impact cymbal hit
            midi.addNote(0, 0, 49, start_beat, 2, 127)  # Crash cymbal
        
        filename = f"{self.output_dir}/09-FX-Riser-OMNISPHERE.mid"
        with open(filename, "wb") as f:
            midi.writeFile(f)
        return filename
    
    def create_structure_guide(self):
        """Create comprehensive arrangement guide"""
        guide = f"""# DARK MELODIC TECHNO - COMPLETE TRACK STRUCTURE
## Generated: {self.total_bars} bars | ~{int(self.total_duration // 60)}:{int(self.total_duration % 60):02d} duration | {self.tempo} BPM | {self.key}

═══════════════════════════════════════════════════════════════════════
                         COMPLETE TRACK BREAKDOWN
═══════════════════════════════════════════════════════════════════════

"""
        
        for section_name, bars_info in self.sections.items():
            guide += f"\n{'='*70}\n"
            guide += f"{section_name.upper().replace('_', ' ')}\n"
            guide += f"Bars {bars_info['start']}-{bars_info['end']} ({bars_info['length']} bars)\n"
            guide += f"{'='*70}\n\n"
            
            # Add description for each section
            descriptions = {
                'intro': """
🌌 ATMOSPHERIC INTRO
• Build tension slowly
• Introduce atmospheric textures first
• Add dark pad around bar 5
• Minimal percussion
• No kick yet - save for impact
• Filter automation: Slow low-pass opening (20Hz → 2kHz)
• Reverb: Maximum wetness (70-80%)
""",
                'build1': """
🔺 FIRST BUILD-UP
• Introduce kick at bar 17
• Add sub bass
• Gradually bring in percussion
• Increase filter cutoff
• Volume automation: Gradual crescendo
• Tension building towards first drop
""",
                'drop1': """
💥 FIRST DROP (Main Groove)
• Full kick + sub bass foundation
• Melodic lead enters
• Arpeggio synth active
• Dark pad supporting
• All percussion elements
• Energy: HIGH
• This is the first "chorus" moment
""",
                'breakdown1': """
🌊 FIRST BREAKDOWN
• Remove kick in last 4 bars (45-48)
• Reduce percussion
• Emphasize dark pads and atmospheres
• Brief moment of relief
• Prepare for build-up 2
""",
                'build2': """
🔺 SECOND BUILD-UP
• Reintroduce elements gradually
• Add arpeggio for movement
• FX risers and sweeps
• Build tension to main drop
• Filter sweeps accelerate
""",
                'drop2': """
💥 SECOND DROP (Main Chorus - Peak Energy)
• All elements at maximum
• Loudest section of track
• Melodic lead prominent (phrase 2)
• Full percussion arrangement
• Main club moment
• Energy: MAXIMUM
""",
                'breakdown2': """
🎭 EMOTIONAL BREAKDOWN (Extended)
• 16 bars - longest breakdown
• Remove kick bars 77-84
• Focus on melodic lead (phrase 3 - descending)
• Atmospheric textures peak
• Dark pads at highest volume
• This is the EMOTIONAL CLIMAX
• Space for the track to breathe
• Audience connection moment
""",
                'build3': """
🔺 FINAL BUILD-UP
• Most intense build
• All build elements active
• FX risers maximum
• Anticipation for final drop
• Crowd preparation for climax
""",
                'drop3': """
💥 FINAL DROP (Climax)
• Everything at full power
• Melodic lead phrase 4
• Full percussion + bass plucks
• Maximum energy release
• Last major peak before outro
• Make it count!
""",
                'outro': """
🌅 EXTENDED OUTRO (24 bars)
• Gradual wind-down
• Remove elements one by one
• Reverse order of intro
• Maintain atmosphere
• Slow filter close
• End on atmospheric textures only
• Fade to silence or ambient drone
"""
            }
            
            guide += descriptions.get(section_name, "")
        
        guide += f"""

{'='*70}
                          MIXING GUIDELINES
{'='*70}

LEVEL REFERENCE (dB relative to 0dB):
┌─────────────────────────┬──────────────┐
│ Element                 │ Level (dBFS) │
├─────────────────────────┼──────────────┤
│ Kick                    │ -6.0 dB      │
│ Sub Bass                │ -9.0 dB      │
│ Melodic Lead            │ -12.0 dB     │
│ Dark Pad                │ -18.0 dB     │
│ Arpeggio                │ -15.0 dB     │
│ Percussion              │ -14.0 dB     │
│ Atmospheric Texture     │ -20.0 dB     │
│ Bass Pluck              │ -13.0 dB     │
│ FX Risers               │ -16.0 dB     │
└─────────────────────────┴──────────────┘

FREQUENCY BALANCE:
• Sub (20-60Hz): Kick + Sub Bass (mono, centered)
• Bass (60-250Hz): Bass elements, pad low-end
• Low-Mids (250-500Hz): Warmth zone, careful not to mud
• Mids (500Hz-2kHz): Lead melody, pad body
• High-Mids (2-6kHz): Presence, percussion, lead clarity
• Highs (6-20kHz): Air, atmospheres, hi-hats

EFFECTS CHAIN:
• Reverb Send A: Hall (5.5s decay, 30% pre-delay)
• Reverb Send B: Plate (2.3s decay, shimmer)
• Delay Send: Ping-Pong (1/8 dotted, 35% feedback)

SIDECHAIN COMPRESSION:
• All melodic elements → Kick (ratio 4:1, fast attack)
• Sub Bass → Kick (ratio 6:1, instant attack)

═══════════════════════════════════════════════════════════════════════
                         TRACK STATISTICS
═══════════════════════════════════════════════════════════════════════

Total Bars:               {self.total_bars}
Total Duration:           ~{int(self.total_duration // 60)}:{int(self.total_duration % 60):02d}
Tempo:                    {self.tempo} BPM
Key:                      {self.key}
Total MIDI Files:         9
Estimated Note Count:     ~4500+ notes

GENRE REFERENCE TRACKS:
• Tale Of Us - "Monument"
• Stephan Bodzin - "Singularity"
• Agents Of Time - "Paradigm"
• Massano - "Nothing Around Us"
• Anyma - "Running"

═══════════════════════════════════════════════════════════════════════
"""
        
        filename = f"{self.output_dir}/ARRANGEMENT-GUIDE.md"
        with open(filename, 'w') as f:
            f.write(guide)
        return filename
    
    def create_preset_guide(self):
        """Create VST3 preset configuration guide"""
        guide = """# VST3 PRESET CONFIGURATION - DARK MELODIC TECHNO

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
"""
        
        filename = f"{self.output_dir}/PRESET-GUIDE.md"
        with open(filename, 'w') as f:
            f.write(guide)
        return filename
    
    def generate_all(self):
        """Generate complete dark melodic techno track"""
        print(f"\n{'='*70}")
        print("🎵 DARK MELODIC TECHNO - COMPLETE TRACK GENERATOR")
        print(f"{'='*70}")
        print(f"\nTempo: {self.tempo} BPM")
        print(f"Key: {self.key}")
        print(f"Total Bars: {self.total_bars}")
        print(f"Duration: ~{int(self.total_duration // 60)}:{int(self.total_duration % 60):02d}")
        print(f"\nTrack Structure:")
        for section, info in self.sections.items():
            print(f"  • {section.upper().replace('_', ' ')}: Bars {info['start']}-{info['end']} ({info['length']} bars)")
        
        print(f"\n{'='*70}")
        print("📝 Creating MIDI files with complete arrangement...")
        print(f"{'='*70}\n")
        
        files = []
        
        # Create all patterns
        files.append(self.create_kick_pattern())
        print(f"✅ Created: 01-Deep-Kick-TEKNO.mid")
        
        files.append(self.create_sub_bass_pattern())
        print(f"✅ Created: 02-Sub-Rumble-TEKNO.mid")
        
        files.append(self.create_melodic_lead_pattern())
        print(f"✅ Created: 03-Melodic-Lead-OMNISPHERE.mid")
        
        files.append(self.create_dark_pad_pattern())
        print(f"✅ Created: 04-Dark-Pad-OMNISPHERE.mid")
        
        files.append(self.create_arpeggio_pattern())
        print(f"✅ Created: 05-Arpeggio-OMNISPHERE.mid")
        
        files.append(self.create_percussion_pattern())
        print(f"✅ Created: 06-Percussion-TEKNO.mid")
        
        files.append(self.create_atmospheric_texture())
        print(f"✅ Created: 07-Atmospheric-Texture-OMNISPHERE.mid")
        
        files.append(self.create_bass_pluck_pattern())
        print(f"✅ Created: 08-Bass-Pluck-TEKNO.mid")
        
        files.append(self.create_fx_riser_pattern())
        print(f"✅ Created: 09-FX-Riser-OMNISPHERE.mid")
        
        # Create guides
        print(f"\n{'='*70}")
        print("📋 Creating documentation...")
        print(f"{'='*70}\n")
        
        structure_guide = self.create_structure_guide()
        print(f"✅ Created: ARRANGEMENT-GUIDE.md")
        
        preset_guide = self.create_preset_guide()
        print(f"✅ Created: PRESET-GUIDE.md")
        
        print(f"\n{'='*70}")
        print("✅ DARK MELODIC TECHNO TRACK GENERATION COMPLETE!")
        print(f"{'='*70}")
        print(f"\n📁 Output Directory: {self.output_dir}")
        print(f"\n📋 Files Created:")
        print(f"   • 9 MIDI files with complete {self.total_bars}-bar arrangement")
        print(f"   • ARRANGEMENT-GUIDE.md (complete structure breakdown)")
        print(f"   • PRESET-GUIDE.md (VST3 preset instructions)")
        print(f"\n🎹 Next Steps:")
        print(f"   1. Open Manual-set.als in Ableton")
        print(f"   2. Import MIDI files from {self.output_dir}")
        print(f"   3. Load TEKNO + Omnisphere presets (see PRESET-GUIDE.md)")
        print(f"   4. Follow automation instructions in guides")
        print(f"   5. Mix and master following level guidelines")
        print(f"\n🎧 Genre: Dark Melodic Techno")
        print(f"🎯 Style: Tale Of Us / Stephan Bodzin / Anyma")
        print(f"{'='*70}\n")


if __name__ == "__main__":
    generator = DarkMelodicTechnoTrack()
    generator.generate_all()
