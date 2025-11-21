#!/usr/bin/env python3
"""
Visualize MIDI patterns in the generated Ableton template
"""

import gzip
import xml.etree.ElementTree as ET

def analyze_als_file(filepath):
    """Analyze and display contents of .als file"""
    
    print("\n" + "="*70)
    print("🎹 ABLETON LIVE SET ANALYZER")
    print("="*70)
    print(f"\n📁 Analyzing: {filepath}\n")
    
    # Read and decompress .als file
    with gzip.open(filepath, 'rb') as f:
        xml_content = f.read()
    
    # Parse XML
    root = ET.fromstring(xml_content)
    
    # Get project info
    liveset = root.find('.//LiveSet')
    tempo = liveset.find('.//Tempo/Manual').get('Value')
    time_sig_num = liveset.find('.//TimeSignature/TimeSignatureNumerator').get('Value')
    time_sig_den = liveset.find('.//TimeSignature/TimeSignatureDenominator').get('Value')
    
    print(f"⚙️  PROJECT SETTINGS:")
    print(f"   Tempo: {tempo} BPM")
    print(f"   Time Signature: {time_sig_num}/{time_sig_den}")
    
    # Get tracks
    tracks = root.findall('.//MidiTrack')
    
    print(f"\n🎼 TRACKS: {len(tracks)} total")
    print("="*70)
    
    for i, track in enumerate(tracks, 1):
        track_name = track.find('.//Name').get('Value')
        color = track.find('.//Color').get('Value')
        
        # Find MIDI clip
        midi_clip = track.find('.//MidiClip')
        if midi_clip:
            loop_start = midi_clip.find('.//LoopStart').get('Value')
            loop_end = midi_clip.find('.//LoopEnd').get('Value')
            
            # Count notes
            notes = midi_clip.findall('.//KeyTrack')
            note_count = len(notes)
            
            # Get note range
            if notes:
                pitches = [int(n.find('.//MidiKey/Value').get('Value')) for n in notes]
                velocities = [int(n.find('.//Velocity').get('Value')) for n in notes]
                
                min_pitch = min(pitches)
                max_pitch = max(pitches)
                min_vel = min(velocities)
                max_vel = max(velocities)
                
                # MIDI to note name
                note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                min_note = f"{note_names[min_pitch % 12]}{min_pitch // 12 - 1}"
                max_note = f"{note_names[max_pitch % 12]}{max_pitch // 12 - 1}"
                
                print(f"\n{i}. {track_name} (Color: {color})")
                print(f"   └─ Loop: {loop_start} - {loop_end} beats")
                print(f"   └─ MIDI Notes: {note_count}")
                print(f"   └─ Pitch Range: {min_note} - {max_note} (MIDI {min_pitch}-{max_pitch})")
                print(f"   └─ Velocity Range: {min_vel} - {max_vel}")
                
                # Show first few notes
                if note_count > 0:
                    print(f"   └─ Pattern Preview:")
                    for j, note in enumerate(notes[:5]):
                        time = note.find('.//Time').get('Value')
                        duration = note.find('.//Duration').get('Value')
                        pitch = int(note.find('.//MidiKey/Value').get('Value'))
                        velocity = note.find('.//Velocity').get('Value')
                        note_name = f"{note_names[pitch % 12]}{pitch // 12 - 1}"
                        
                        print(f"      • Note {j+1}: {note_name} @ {time}s, dur={duration}, vel={velocity}")
                    
                    if note_count > 5:
                        print(f"      ... and {note_count - 5} more notes")
    
    print("\n" + "="*70)
    print("✅ ANALYSIS COMPLETE!")
    print("="*70)
    print("\n💡 TIP: Open this .als file in Ableton Live to hear your patterns!")
    print("💡 Add instruments to each track and start producing! 🚀\n")


if __name__ == "__main__":
    als_file = "Techno-Template-Output/Techno-Banger-Template.als"
    analyze_als_file(als_file)
