#!/usr/bin/env python3
"""
Test script to verify MIDI preview logic works correctly.
This simulates what the Node.js endpoint will do.
"""

import mido
import json
import os

def get_note_name(note_number):
    """Convert MIDI note number to note name with octave."""
    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (note_number // 12) - 1
    note = note_names[note_number % 12]
    return f"{note}{octave}"

def preview_midi(filepath):
    """Parse MIDI file and extract note data for piano roll preview."""
    try:
        midi_file = mido.MidiFile(filepath)
        
        # Extract basic info
        bpm = 120  # Default
        ticks_per_beat = midi_file.ticks_per_beat
        
        # Try to find tempo
        for track in midi_file.tracks:
            for msg in track:
                if msg.type == 'set_tempo':
                    bpm = round(60000000 / msg.tempo)
                    break
        
        # Extract notes
        notes = []
        for track_idx, track in enumerate(midi_file.tracks):
            current_time = 0
            active_notes = {}  # Track note_on events waiting for note_off
            
            for msg in track:
                current_time += msg.time
                
                if msg.type == 'note_on' and msg.velocity > 0:
                    # Note started
                    active_notes[msg.note] = {
                        'note': msg.note,
                        'note_name': get_note_name(msg.note),
                        'velocity': msg.velocity,
                        'start_tick': current_time,
                        'track': track_idx
                    }
                
                elif (msg.type == 'note_off') or (msg.type == 'note_on' and msg.velocity == 0):
                    # Note ended
                    if msg.note in active_notes:
                        note_data = active_notes.pop(msg.note)
                        note_data['duration_ticks'] = current_time - note_data['start_tick']
                        
                        # Calculate seconds (simplified - assumes constant tempo)
                        seconds_per_tick = (60.0 / bpm) / ticks_per_beat
                        note_data['start_time_seconds'] = note_data['start_tick'] * seconds_per_tick
                        note_data['duration_seconds'] = note_data['duration_ticks'] * seconds_per_tick
                        
                        notes.append(note_data)
                        
                        # Limit to first 100 notes for preview
                        if len(notes) >= 100:
                            break
        
        result = {
            'success': True,
            'filename': os.path.basename(filepath),
            'tracks': len(midi_file.tracks),
            'bpm': bpm,
            'ticks_per_beat': ticks_per_beat,
            'total_notes': len(notes),
            'notes': notes[:100]  # Limit to 100 notes
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    # Test with a sample MIDI file
    test_file = 'app/ableton-cli/output/MIDI-Files-OLD/01-Kick.mid'
    
    if os.path.exists(test_file):
        print(f"Testing MIDI preview with: {test_file}\n")
        result = preview_midi(test_file)
        
        if result['success']:
            print(f"✓ Successfully parsed MIDI file!")
            print(f"  - Filename: {result['filename']}")
            print(f"  - BPM: {result['bpm']}")
            print(f"  - Tracks: {result['tracks']}")
            print(f"  - Total notes: {result['total_notes']}")
            print(f"  - Ticks per beat: {result['ticks_per_beat']}")
            print(f"\nFirst 5 notes:")
            for i, note in enumerate(result['notes'][:5], 1):
                print(f"  {i}. {note['note_name']:4s} (MIDI {note['note']:3d}) "
                      f"vel={note['velocity']:3d} "
                      f"start={note['start_time_seconds']:.3f}s "
                      f"dur={note['duration_seconds']:.3f}s "
                      f"track={note['track']}")
            
            # Print full JSON for verification
            print(f"\nFull JSON output (truncated):")
            print(json.dumps(result, indent=2)[:500] + "...")
        else:
            print(f"✗ Error: {result['error']}")
    else:
        print(f"✗ Test file not found: {test_file}")
        print("\nTrying to find MIDI files in output directory...")
        output_dir = 'app/ableton-cli/output/MIDI-Files-OLD'
        if os.path.exists(output_dir):
            midi_files = [f for f in os.listdir(output_dir) if f.endswith('.mid')]
            if midi_files:
                print(f"Found {len(midi_files)} MIDI files:")
                for f in midi_files[:5]:
                    print(f"  - {f}")
                print(f"\nTesting with first file: {midi_files[0]}")
                result = preview_midi(os.path.join(output_dir, midi_files[0]))
                print(json.dumps(result, indent=2))
