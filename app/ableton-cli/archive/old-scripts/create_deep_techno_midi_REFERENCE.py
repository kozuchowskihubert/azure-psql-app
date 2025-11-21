
#!/usr/bin/env python3
"""
Deep Techno MIDI Generator
Creates hypnotic, rolling techno patterns for a complete track
"""

import os
from typing import List, Tuple
from midiutil import MIDIFile


class DeepTechnoMIDIGenerator:
    """Generate MIDI patterns for deep, rolling techno tracks"""
    
    def __init__(self, bpm: int = 124, bars: int = 136, output_dir: str = "MIDI-Files/Deep-Techno"):
        self.bpm = bpm
        self.bars = bars
        self.beats_per_bar = 4
        self.duration_in_beats = bars * self.beats_per_bar
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _create_midi_file(self) -> MIDIFile:
        """Create a new MIDI file with tempo set"""
        midi = MIDIFile(1)
        midi.addTempo(0, 0, self.bpm)
        return midi
    
    def _save_midi(self, midi: MIDIFile, filename: str) -> None:
        """Save MIDI file to disk"""
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "wb") as f:
            midi.writeFile(f)
        print(f"  ✓ Created: {filename}")

    
    def generate_deep_kick(self) -> None:
        """Generate 4-on-the-floor kick pattern"""
        midi = self._create_midi_file()
        for beat in range(0, self.duration_in_beats, 1):
            midi.addNote(0, 0, 36, beat, 1, 120)  # C1, strong velocity
        self._save_midi(midi, "01-Deep-Kick.mid")

    def generate_rolling_sub(self) -> None:
        """Generate hypnotic 16th-note sub-bass"""
        midi = self._create_midi_file()
        for bar in range(self.bars):
            bar_start = bar * 4
            for step in range(16):  # 16th notes
                time = bar_start + step * 0.25
                midi.addNote(0, 0, 33, time, 0.25, 100)  # F#1
        self._save_midi(midi, "02-Rolling-Sub.mid")

    def generate_offbeat_hat(self) -> None:
        """Generate classic off-beat open hi-hat"""
        midi = self._create_midi_file()
        for beat in range(0, self.duration_in_beats, 1):
            midi.addNote(0, 0, 46, beat + 0.5, 0.5, 90)  # Open hat on '+'
        self._save_midi(midi, "03-Off-Beat-Hat.mid")

    def generate_ghost_snares(self) -> None:
        """Generate subtle, syncopated snare pattern"""
        midi = self._create_midi_file()
        for bar in range(self.bars):
            bar_start = bar * 4
            midi.addNote(0, 0, 38, bar_start + 1.75, 0.1, 80)  # Syncopated
            midi.addNote(0, 0, 38, bar_start + 3.5, 0.1, 70)   # Quieter echo
        self._save_midi(midi, "04-Ghost-Snares.mid")

    def generate_atmospheric_pad(self) -> None:
        """Generate long, evolving F# minor pad chord"""
        midi = self._create_midi_file()
        # F#2, A2, C#3 - sustained throughout
        midi.addNote(0, 0, 42, 0, self.duration_in_beats, 60)
        midi.addNote(0, 0, 45, 0, self.duration_in_beats, 60)
        midi.addNote(0, 0, 49, 0, self.duration_in_beats, 60)
        self._save_midi(midi, "05-Atmospheric-Pad.mid")

    def generate_rhythmic_stabs(self) -> None:
        """Generate simple, hypnotic stab pattern"""
        midi = self._create_midi_file()
        for bar in range(self.bars):
            bar_start = bar * 4
            midi.addNote(0, 0, 57, bar_start + 0.75, 0.2, 95)  # A3
            midi.addNote(0, 0, 57, bar_start + 1.5, 0.2, 95)
            midi.addNote(0, 0, 57, bar_start + 3.0, 0.2, 95)
        self._save_midi(midi, "06-Rhythmic-Stabs.mid")
    
    def generate_all(self) -> None:
        """Generate all MIDI patterns"""
        print(f"\n🎹 Generating Deep Techno MIDI ({self.bpm} BPM, {self.bars} bars)...")
        
        self.generate_deep_kick()
        self.generate_rolling_sub()
        self.generate_offbeat_hat()
        self.generate_ghost_snares()
        self.generate_atmospheric_pad()
        self.generate_rhythmic_stabs()
        
        print(f"\n✅ Successfully generated 6 Deep Techno MIDI files in '{self.output_dir}'\n")


def main():
    """Main entry point"""
    generator = DeepTechnoMIDIGenerator(bpm=124, bars=136)
    generator.generate_all()


if __name__ == "__main__":
    main()
