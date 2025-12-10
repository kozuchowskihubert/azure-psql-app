#!/bin/bash
# Music Production Environment Setup Script
# Run this script after VM initialization to configure DAW-like capabilities

set -e

echo "=========================================================="
echo "Music Production Environment Configuration"
echo "=========================================================="

# Create user audio group permissions
echo "Configuring audio permissions..."
sudo usermod -aG audio azureuser
sudo usermod -aG pulse azureuser
sudo usermod -aG pulse-access azureuser

# Configure JACK for low-latency audio
echo "Configuring JACK audio server..."
cat > ~/.jackdrc << 'EOF'
/usr/bin/jackd -dalsa -dhw:0 -r44100 -p1024 -n2
EOF

# Configure ALSA
echo "Configuring ALSA..."
cat > ~/.asoundrc << 'EOF'
pcm.!default {
    type plug
    slave.pcm "hw:0,0"
}

ctl.!default {
    type hw
    card 0
}
EOF

# Create audio processing workspace structure
echo "Creating audio workspace structure..."
mkdir -p ~/audio-workspace/{projects,samples,midi,exports,plugins,templates}
mkdir -p ~/audio-workspace/samples/{drums,synths,fx,vocals,loops}
mkdir -p ~/audio-workspace/midi/{patterns,melodies,chords,drums}
mkdir -p ~/audio-workspace/projects/{techno,house,ambient,experimental}

# Create sample project structure
echo "Creating sample DAW project template..."
cat > ~/audio-workspace/templates/project-template.md << 'EOF'
# Music Production Project Template

## Project Info
- **Name**: 
- **BPM**: 128
- **Key**: C Major
- **Time Signature**: 4/4
- **Sample Rate**: 44100 Hz

## Track List
1. Kick
2. Bass
3. Hats
4. Percussion
5. Lead Synth
6. Pad
7. FX

## MIDI Files
- Located in: `/midi/`

## Audio Samples
- Located in: `/samples/`

## Exports
- Located in: `/exports/`

## Notes
- 
EOF

# Create helper scripts
echo "Creating audio helper scripts..."

# Script to start audio environment
cat > ~/start-audio-env.sh << 'EOF'
#!/bin/bash
echo "Starting audio production environment..."

# Start JACK if not running
if ! pgrep -x "jackd" > /dev/null; then
    echo "Starting JACK audio server..."
    jackd -dalsa -dhw:0 -r44100 -p512 -n2 &
    sleep 2
fi

# Start FluidSynth
if ! pgrep -x "fluidsynth" > /dev/null; then
    echo "Starting FluidSynth..."
    fluidsynth -a alsa -m alsa_seq -g 0.5 /usr/share/soundfonts/*.sf2 &
fi

echo "Audio environment ready!"
echo "JACK: $(pgrep -x jackd > /dev/null && echo 'Running' || echo 'Not running')"
echo "FluidSynth: $(pgrep -x fluidsynth > /dev/null && echo 'Running' || echo 'Not running')"
EOF

chmod +x ~/start-audio-env.sh

# Script to stop audio environment
cat > ~/stop-audio-env.sh << 'EOF'
#!/bin/bash
echo "Stopping audio environment..."
pkill jackd
pkill fluidsynth
echo "Audio environment stopped."
EOF

chmod +x ~/stop-audio-env.sh

# Script to convert MIDI to audio
cat > ~/midi-to-wav.sh << 'EOF'
#!/bin/bash
if [ $# -eq 0 ]; then
    echo "Usage: $0 <input.mid> [output.wav]"
    exit 1
fi

INPUT="$1"
OUTPUT="${2:-${INPUT%.mid}.wav}"

echo "Converting $INPUT to $OUTPUT..."
fluidsynth -F "$OUTPUT" -r 44100 /usr/share/soundfonts/*.sf2 "$INPUT"
echo "Conversion complete: $OUTPUT"
EOF

chmod +x ~/midi-to-wav.sh

# Script to batch process audio files
cat > ~/batch-audio-process.sh << 'EOF'
#!/bin/bash
# Batch audio processing script

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input_dir> <output_dir> [format]"
    exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"
FORMAT="${3:-wav}"

mkdir -p "$OUTPUT_DIR"

for file in "$INPUT_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        name="${filename%.*}"
        echo "Processing: $filename"
        sox "$file" "$OUTPUT_DIR/${name}.${FORMAT}"
    fi
done

echo "Batch processing complete!"
EOF

chmod +x ~/batch-audio-process.sh

# Create Python music production utilities
echo "Creating Python music utilities..."
cat > ~/audio-workspace/plugins/midi_generator.py << 'EOF'
#!/usr/bin/env python3
"""
Advanced MIDI Pattern Generator for Music Production
Supports: Drums, Bass, Melody, Chords, Arpeggios
"""

from midiutil import MIDIFile
import random

class MusicGenerator:
    def __init__(self, bpm=128, bars=8):
        self.bpm = bpm
        self.bars = bars
        self.beats_per_bar = 4
        self.total_beats = bars * self.beats_per_bar
        
    def generate_kick_pattern(self, style='four-on-floor'):
        """Generate kick drum patterns"""
        midi = MIDIFile(1)
        track = 0
        channel = 9  # Drums
        time = 0
        midi.addTempo(track, time, self.bpm)
        
        kick_note = 36  # C1
        
        if style == 'four-on-floor':
            # Classic techno/house kick
            for beat in range(self.total_beats):
                midi.addNote(track, channel, kick_note, beat, 0.9, 100)
        
        elif style == 'offbeat':
            # Syncopated kick
            for bar in range(self.bars):
                base = bar * self.beats_per_bar
                midi.addNote(track, channel, kick_note, base, 0.9, 100)
                midi.addNote(track, channel, kick_note, base + 2.5, 0.4, 80)
        
        return midi
    
    def generate_bass_line(self, key='C', scale='minor'):
        """Generate bass line"""
        scales = {
            'minor': [0, 2, 3, 5, 7, 8, 10],
            'major': [0, 2, 4, 5, 7, 9, 11],
            'dorian': [0, 2, 3, 5, 7, 9, 10],
        }
        
        root = 48  # C3
        notes = [root + interval for interval in scales.get(scale, scales['minor'])]
        
        midi = MIDIFile(1)
        track = 0
        channel = 0
        time = 0
        midi.addTempo(track, time, self.bpm)
        
        for bar in range(self.bars):
            for beat in range(self.beats_per_bar):
                position = bar * self.beats_per_bar + beat
                note = random.choice(notes)
                velocity = random.randint(80, 110)
                duration = random.choice([0.25, 0.5, 0.75, 1.0])
                midi.addNote(track, channel, note, position, duration, velocity)
        
        return midi
    
    def generate_hihat_pattern(self, density='high'):
        """Generate hi-hat patterns"""
        midi = MIDIFile(1)
        track = 0
        channel = 9
        time = 0
        midi.addTempo(track, time, self.bpm)
        
        closed_hat = 42
        open_hat = 46
        
        divisions = 4 if density == 'low' else 8 if density == 'medium' else 16
        
        for i in range(self.total_beats * divisions):
            position = i / divisions
            
            # Closed hat on most beats
            if i % 2 == 0:
                velocity = 100 if i % 4 == 0 else 70
                midi.addNote(track, channel, closed_hat, position, 0.1, velocity)
            
            # Open hat occasionally
            if divisions == 16 and i % 16 == 14:
                midi.addNote(track, channel, open_hat, position, 0.3, 90)
        
        return midi
    
    def save(self, midi, filename):
        """Save MIDI file"""
        with open(filename, 'wb') as f:
            midi.writeFile(f)
        print(f"Saved: {filename}")

# Example usage
if __name__ == '__main__':
    gen = MusicGenerator(bpm=128, bars=16)
    
    kick = gen.generate_kick_pattern('four-on-floor')
    gen.save(kick, '/opt/audio-workspace/midi/kick_pattern.mid')
    
    bass = gen.generate_bass_line('C', 'minor')
    gen.save(bass, '/opt/audio-workspace/midi/bass_line.mid')
    
    hats = gen.generate_hihat_pattern('high')
    gen.save(hats, '/opt/audio-workspace/midi/hihat_pattern.mid')
    
    print("MIDI generation complete!")
EOF

chmod +x ~/audio-workspace/plugins/midi_generator.py

# Create audio analysis script
cat > ~/audio-workspace/plugins/audio_analyzer.py << 'EOF'
#!/usr/bin/env python3
"""
Audio Analysis Tool for Music Production
Analyzes tempo, key, beats, and spectral content
"""

import librosa
import numpy as np
import sys

def analyze_audio(file_path):
    """Comprehensive audio analysis"""
    print(f"Analyzing: {file_path}")
    print("=" * 60)
    
    # Load audio
    y, sr = librosa.load(file_path)
    
    # Tempo and beats
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    print(f"Tempo: {tempo:.2f} BPM")
    print(f"Beats detected: {len(beats)}")
    
    # Duration
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"Duration: {duration:.2f} seconds")
    
    # Key detection (chromagram)
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    key_index = np.argmax(np.sum(chroma, axis=1))
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    print(f"Detected Key: {keys[key_index]}")
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    print(f"Spectral Centroid (avg): {np.mean(spectral_centroids):.2f} Hz")
    
    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)
    print(f"Zero Crossing Rate (avg): {np.mean(zcr):.4f}")
    
    # RMS energy
    rms = librosa.feature.rms(y=y)[0]
    print(f"RMS Energy (avg): {np.mean(rms):.4f}")
    
    print("=" * 60)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: audio_analyzer.py <audio_file>")
        sys.exit(1)
    
    analyze_audio(sys.argv[1])
EOF

chmod +x ~/audio-workspace/plugins/audio_analyzer.py

# Create README for music production
cat > ~/audio-workspace/README.md << 'EOF'
# Music Production Workspace

This workspace is configured for DAW-like music production on Azure VM.

## Directory Structure

```
audio-workspace/
├── projects/       # Music production projects
├── samples/        # Audio samples and loops
├── midi/          # MIDI files and patterns
├── exports/       # Final rendered tracks
├── plugins/       # Custom scripts and utilities
└── templates/     # Project templates
```

## Quick Start

### 1. Start Audio Environment
```bash
~/start-audio-env.sh
```

### 2. Generate MIDI Patterns
```bash
cd ~/audio-workspace/plugins
python3 midi_generator.py
```

### 3. Convert MIDI to Audio
```bash
~/midi-to-wav.sh ~/audio-workspace/midi/kick_pattern.mid
```

### 4. Analyze Audio
```bash
python3 ~/audio-workspace/plugins/audio_analyzer.py ~/audio-workspace/exports/track.wav
```

## Available Tools

### Audio Processing
- **SoX**: `sox input.wav output.wav <effects>`
- **FFmpeg**: `ffmpeg -i input.wav output.mp3`
- **Normalize**: `sox input.wav output.wav gain -n`

### MIDI Tools
- **Play MIDI**: `fluidsynth /usr/share/soundfonts/*.sf2 file.mid`
- **MIDI to WAV**: `~/midi-to-wav.sh file.mid`
- **List MIDI devices**: `aplaymidi -l`

### Python Libraries
- **mido**: MIDI I/O and manipulation
- **librosa**: Audio analysis
- **pydub**: Audio file conversion
- **music21**: Music theory analysis

## Example Workflows

### Create a Techno Track
1. Generate kick: `python3 plugins/midi_generator.py`
2. Add bass line and hats
3. Convert to audio: `~/midi-to-wav.sh midi/kick_pattern.mid`
4. Mix with SoX or export for further processing

### Audio Analysis Pipeline
1. Analyze tempo: `python3 plugins/audio_analyzer.py track.wav`
2. Detect key and beats
3. Extract features for ML processing

## Tips
- Keep sample rate at 44100 Hz for compatibility
- Use JACK for low-latency real-time processing
- Export to WAV for highest quality, MP3 for distribution
- Organize projects by genre for easier management
EOF

echo "=========================================================="
echo "Music Production Environment Setup Complete!"
echo "=========================================================="
echo ""
echo "Quick Start:"
echo "  1. Start audio: ~/start-audio-env.sh"
echo "  2. Generate MIDI: python3 ~/audio-workspace/plugins/midi_generator.py"
echo "  3. Convert to audio: ~/midi-to-wav.sh <file.mid>"
echo ""
echo "See ~/audio-workspace/README.md for full documentation"
echo ""
