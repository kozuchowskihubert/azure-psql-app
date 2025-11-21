#!/usr/bin/env python3
"""
Generate MIDI files for Ableton Live import
This creates standard MIDI files that can be dragged into any DAW
"""

from midiutil import MIDIFile
import os

class TechnoMIDIGenerator:
    def __init__(self):
        self.tempo = 128
        
    def create_kick_midi(self):
        """4-on-the-floor kick pattern"""
        midi = MIDIFile(1)
        track = 0
        channel = 9  # Drum channel
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Kick")
        
        # 16 beats, 4 bars
        for beat in range(16):
            time = beat
            midi.addNote(track, channel, 36, time, 0.25, 127)
        
        return midi
    
    def create_sub_bass_midi(self):
        """Sustained sub bass"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Sub Bass")
        
        # 4 whole notes
        for bar in range(4):
            time = bar * 4
            midi.addNote(track, channel, 33, time, 4.0, 110)  # A1
        
        return midi
    
    def create_clap_midi(self):
        """Clap on beats 2 and 4"""
        midi = MIDIFile(1)
        track = 0
        channel = 9
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Clap")
        
        for bar in range(4):
            # Beat 2
            midi.addNote(track, channel, 37, bar * 4 + 1, 0.25, 115)
            # Beat 4
            midi.addNote(track, channel, 37, bar * 4 + 3, 0.25, 115)
        
        return midi
    
    def create_hihat_closed_midi(self):
        """16th note hi-hat"""
        midi = MIDIFile(1)
        track = 0
        channel = 9
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Hi-Hat Closed")
        
        bars = 2
        for bar in range(bars):
            for sixteenth in range(16):
                time = bar * 4 + (sixteenth * 0.25)
                velocity = 80 + (sixteenth % 4) * 5
                midi.addNote(track, channel, 42, time, 0.2, velocity)
        
        return midi
    
    def create_hihat_open_midi(self):
        """Open hi-hat on off-beats"""
        midi = MIDIFile(1)
        track = 0
        channel = 9
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Hi-Hat Open")
        
        for bar in range(2):
            midi.addNote(track, channel, 46, bar * 4 + 1.5, 0.4, 100)
            midi.addNote(track, channel, 46, bar * 4 + 3.5, 0.4, 100)
        
        return midi
    
    def create_bass_synth_midi(self):
        """Syncopated bass synth"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Bass Synth")
        
        pattern = [
            (0.0, 33, 110), (0.5, 33, 105), (1.0, 40, 100),
            (2.0, 33, 110), (2.5, 33, 105), (3.0, 40, 100),
            (4.0, 33, 110), (4.5, 33, 105), (5.0, 40, 100),
            (6.0, 33, 110), (6.5, 33, 105), (7.0, 40, 100),
            (8.0, 33, 110), (8.5, 33, 105), (9.0, 38, 100),
            (10.0, 33, 110), (10.5, 33, 105), (11.0, 38, 100),
            (12.0, 33, 110), (12.5, 33, 105), (13.0, 40, 100),
            (14.0, 33, 110), (14.5, 36, 105), (15.0, 40, 100),
        ]
        
        for time, pitch, velocity in pattern:
            midi.addNote(track, channel, pitch, time, 0.4, velocity)
        
        return midi
    
    def create_acid_bass_midi(self):
        """Acid bass arpeggio"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Acid Bass")
        
        arpeggio = [33, 36, 40, 45, 36, 40, 45, 36]
        
        for bar in range(2):
            for i, pitch in enumerate(arpeggio):
                time = bar * 4 + (i * 0.5)
                velocity = 90 + (i % 2) * 20
                midi.addNote(track, channel, pitch, time, 0.45, velocity)
        
        return midi
    
    def create_lead_synth_midi(self):
        """Simple lead melody"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Lead Synth")
        
        notes = [
            (0.0, 57, 8.0, 105),   # A3
            (8.0, 60, 4.0, 105),   # C4
            (12.0, 64, 4.0, 105),  # E4
            (16.0, 64, 8.0, 105),  # E4
            (24.0, 60, 6.0, 105),  # C4
            (30.0, 57, 2.0, 105),  # A3
        ]
        
        for time, pitch, duration, velocity in notes:
            midi.addNote(track, channel, pitch, time, duration, velocity)
        
        return midi
    
    def create_stab_synth_midi(self):
        """Stab chords on off-beats"""
        midi = MIDIFile(1)
        track = 0
        channel = 0
        midi.addTempo(track, 0, self.tempo)
        midi.addTrackName(track, 0, "Stab Synth")
        
        for bar in range(4):
            for beat in [1.5, 3.5]:
                time = bar * 4 + beat
                # Am chord (A2, C3, E3)
                midi.addNote(track, channel, 45, time, 0.1, 120)
                midi.addNote(track, channel, 48, time, 0.1, 120)
                midi.addNote(track, channel, 52, time, 0.1, 120)
        
        return midi
    
    def generate_all_midi_files(self, output_dir):
        """Generate all MIDI files"""
        os.makedirs(output_dir, exist_ok=True)
        
        patterns = {
            "01-Kick.mid": self.create_kick_midi(),
            "02-Sub-Bass.mid": self.create_sub_bass_midi(),
            "03-Clap.mid": self.create_clap_midi(),
            "04-HiHat-Closed.mid": self.create_hihat_closed_midi(),
            "05-HiHat-Open.mid": self.create_hihat_open_midi(),
            "06-Bass-Synth.mid": self.create_bass_synth_midi(),
            "07-Acid-Bass.mid": self.create_acid_bass_midi(),
            "08-Lead-Synth.mid": self.create_lead_synth_midi(),
            "09-Stab-Synth.mid": self.create_stab_synth_midi(),
        }
        
        print("\n" + "="*60)
        print("🎹 GENERATING STANDARD MIDI FILES")
        print("="*60)
        
        for filename, midi_obj in patterns.items():
            filepath = os.path.join(output_dir, filename)
            with open(filepath, 'wb') as f:
                midi_obj.writeFile(f)
            print(f"✅ Created: {filename}")
        
        print("\n" + "="*60)
        print("✅ ALL MIDI FILES GENERATED!")
        print("="*60)
        print(f"\n📁 Location: {os.path.abspath(output_dir)}")
        print("\n💡 IMPORT INTO ABLETON LIVE:")
        print("   1. Open Ableton Live")
        print("   2. Drag these MIDI files into empty tracks")
        print("   3. Add instruments to each track")
        print("   4. Press Space to play!")
        print("\n")

if __name__ == "__main__":
    try:
        generator = TechnoMIDIGenerator()
        generator.generate_all_midi_files("MIDI-Files")
        print("🚀 Ready to import into Ableton Live!\n")
    except ImportError:
        print("\n⚠️  ERROR: midiutil library not installed")
        print("📦 Installing midiutil...")
        import subprocess
        subprocess.check_call(["pip3", "install", "midiutil"])
        print("✅ Installed! Running generator...")
        generator = TechnoMIDIGenerator()
        generator.generate_all_midi_files("MIDI-Files")
        print("🚀 Ready to import into Ableton Live!\n")
