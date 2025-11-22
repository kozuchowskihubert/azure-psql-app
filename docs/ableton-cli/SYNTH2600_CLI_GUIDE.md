# Behringer 2600 CLI Tool - User Guide

## Overview

The `synth2600_cli.py` is a comprehensive command-line interface for the Behringer 2600 synthesizer, featuring:
- **Interactive REPL Mode** - Real-time command shell with history and tab completion
- **17 Creative Presets** - Pre-configured patches for various sound design scenarios
- **Full Parameter Mapping** - Control all oscillators, filters, and envelopes
- **MIDI Export** - Generate MIDI files from patches
- **Web API Integration** - Accessible via REST endpoints

## Installation

```bash
# Install dependencies
pip install mido midiutil

# Make executable
chmod +x synth2600_cli.py
```

## Interactive Mode (RECOMMENDED)

### Starting Interactive Shell

```bash
# Run without arguments or with -i flag
python3 synth2600_cli.py
# or
python3 synth2600_cli.py -i
# or
python3 synth2600_cli.py --interactive
```

### Interactive Shell Features

- **Command History** - Use arrow keys to navigate previous commands
- **Current Preset Display** - Shows loaded preset in prompt: `2600 [evolving_drone]>`
- **Command Aliases** - Short commands (e.g., `ls`, `p`, `q`)
- **Real-time Feedback** - Immediate visual confirmation of changes
- **Help System** - Type `help` for command reference

### Interactive Commands

```bash
# Basic usage
2600> help                          # Show all commands
2600> presets                       # List available presets
2600> preset evolving_drone         # Load a preset
2600> info                          # Show current configuration
2600> patch                         # Display patch matrix

# Oscillator control
2600> vco1 440 sawtooth            # Set VCO1 to 440Hz sawtooth
2600> vco2 220 square              # Set VCO2 to 220Hz square
2600> lfo 0.5                      # Set LFO to 0.5Hz

# Filter and envelope
2600> filter 1200 0.8              # Cutoff 1200Hz, resonance 0.8
2600> envelope 0.01 0.1 0.7 0.3    # ADSR envelope

# Patch cables
2600> add VCO1/OUT VCF/IN 0.9      # Add patch cable
2600> remove VCO1/OUT VCF/IN       # Remove patch cable

# Sequencer
2600> seq random 16                # Random 16-step pattern
2600> seq notes C4 E4 G4 C5        # Custom note pattern
2600> seq tempo 120                # Set tempo to 120 BPM

# Export
2600> export midi my_patch.mid 8   # Export 8 bars to MIDI
2600> export preset my_patch.json  # Save current preset

# Navigation
2600> history                      # Show command history
2600> exit                         # Quit (or 'quit', 'q')
```

### Interactive Example Session

```bash
$ python3 synth2600_cli.py

╔═══════════════════════════════════════════════════════════════╗
║   Interactive Command-Line Interface                          ║
╚═══════════════════════════════════════════════════════════════╝

2600> presets
Available Presets:
  Soundscape Generators:
    • evolving_drone
    • generative_sequencer
  ...

2600> preset evolving_drone
✓ Loaded preset: evolving_drone

╔═══════════════════════════════════════════════════════╗
║        BEHRINGER 2600 PATCH MATRIX                   ║
╚═══════════════════════════════════════════════════════╝
  [RED] VCO1/OUT → MIXER/IN1 (Level: 0.70)
  ...

2600 [evolving_drone]> vco1 880 square
✓ VCO1: 880.0Hz, square

2600 [evolving_drone]> filter 2400 0.9
✓ Filter: 2400.0Hz, Q=0.9

2600 [evolving_drone]> export midi my_evolving.mid 16
✓ Exported MIDI to: my_evolving.mid

2600 [evolving_drone]> exit
👋 Goodbye! Keep patching!
```

## Command-Line Mode

For scripting and automation, use traditional command-line arguments:

## Quick Start

```bash
# List all available presets
python3 synth2600_cli.py preset --list

# Load a preset
python3 synth2600_cli.py preset --load evolving_drone

# Export to MIDI
python3 synth2600_cli.py export --midi output.mid --bars 8
```

## Commands Reference

### Preset Management

#### List All Presets
```bash
python3 synth2600_cli.py preset --list
```

Displays all 17 creative presets organized by category:
- **Soundscape Generators**: evolving_drone, generative_sequencer, dual_texture_morph
- **Rhythmic Experiments**: polyrhythmic_chaos, gate_controlled_stutter
- **Modulation Madness**: triple_lfo, frequency_cascade
- **Cinematic FX**: scifi_spaceship, thunder_lightning, analog_glitch
- **Psychedelic**: self_playing, karplus_strong, ring_mod_sim
- **Performance**: expressive_lead, touch_sensitive_bass
- **Musical Techniques**: auto_harmonizing, barber_pole_phaser

#### Load a Preset
```bash
python3 synth2600_cli.py preset --load <preset_name>
```

Example:
```bash
python3 synth2600_cli.py preset --load scifi_spaceship
```

Displays:
- Preset description
- Complete patch matrix with color-coded cables
- All patch connections with signal levels

### Patch Matrix Operations

#### Show Current Patch Matrix
```bash
python3 synth2600_cli.py patch --show
```

#### Add a Patch Cable
```bash
python3 synth2600_cli.py patch --add <source> <destination> --level <0.0-1.0> --color <color>
```

Example:
```bash
python3 synth2600_cli.py patch --add "VCO1/OUT" "VCF/IN" --level 0.8 --color red
```

Available colors: red, blue, green, yellow, white, orange, purple

#### Remove a Patch Cable
```bash
python3 synth2600_cli.py patch --remove <source> <destination>
```

### Sequencer Programming

#### Program Random Pattern
```bash
python3 synth2600_cli.py sequencer --program random --steps 16
```

#### Program Custom Pattern
```bash
python3 synth2600_cli.py sequencer --program "C4 E4 G4 C5 - - E4 G4" --steps 8
```

Use `-` for rests.

### Parameter Control

#### Set Module Parameters
```bash
python3 synth2600_cli.py params --set "<module>.<parameter>=<value>"
```

Examples:
```bash
# Set VCO1 frequency to 440 Hz
python3 synth2600_cli.py params --set "vco1.frequency=440"

# Set VCO2 waveform to square
python3 synth2600_cli.py params --set "vco2.waveform=square"

# Set VCF cutoff to 2000 Hz
python3 synth2600_cli.py params --set "vcf.cutoff=2000"

# Set envelope attack to 0.05 seconds
python3 synth2600_cli.py params --set "envelope.attack=0.05"
```

Available modules and parameters:

**VCO1, VCO2, VCO3:**
- `frequency`: 20-20000 Hz
- `waveform`: sawtooth, square, triangle, sine
- `pulse_width`: 0.0-1.0 (PWM)
- `fine_tune`: -100 to +100 cents
- `sync`: true/false

**VCF (Filter):**
- `cutoff`: 20-20000 Hz
- `resonance`: 0.0-1.0
- `filter_type`: lowpass, highpass, bandpass
- `keyboard_tracking`: 0.0-1.0

**Envelope:**
- `attack`: 0.001-10.0 seconds
- `decay`: 0.001-10.0 seconds
- `sustain`: 0.0-1.0
- `release`: 0.001-10.0 seconds

### MIDI Export

#### Export Current Configuration
```bash
python3 synth2600_cli.py export --midi <filename> --bars <number>
```

Example:
```bash
python3 synth2600_cli.py export --midi my_patch.mid --bars 16
```

#### Export Preset as JSON
```bash
python3 synth2600_cli.py export --preset my_preset.json
```

### Import Presets

```bash
python3 synth2600_cli.py import <preset_file.json>
```

## Web Interface API

The CLI is fully integrated with the web interface via REST API:

### Available Endpoints

#### GET `/api/music/synth2600/presets`
List all available presets organized by category.

Response:
```json
{
  "success": true,
  "categories": {
    "soundscape": ["evolving_drone", "generative_sequencer", "dual_texture_morph"],
    "rhythmic": ["polyrhythmic_chaos", "gate_controlled_stutter"],
    ...
  }
}
```

#### GET `/api/music/synth2600/preset/:name`
Load a specific preset and get patch matrix.

Response:
```json
{
  "success": true,
  "preset": "evolving_drone",
  "patchConnections": [
    {
      "color": "RED",
      "source": "VCO1/OUT",
      "destination": "MIXER/IN1",
      "level": 0.70
    },
    ...
  ],
  "rawOutput": "CLI output text..."
}
```

#### POST `/api/music/synth2600/export`
Export current configuration to MIDI file.

Request:
```json
{
  "filename": "output.mid",
  "bars": 8
}
```

Response:
```json
{
  "success": true,
  "filename": "output.mid",
  "midiData": "base64_encoded_midi_data",
  "rawOutput": "CLI output..."
}
```

#### POST `/api/music/synth2600/patch`
Manage patch cables.

Request:
```json
{
  "action": "add",
  "source": "VCO1/OUT",
  "destination": "VCF/IN",
  "level": 0.8,
  "color": "red"
}
```

#### POST `/api/music/synth2600/sequencer`
Program the sequencer.

Request:
```json
{
  "pattern": "random",
  "steps": 16
}
```

#### POST `/api/music/synth2600/params`
Set synthesizer parameters.

Request:
```json
{
  "module": "vco1",
  "parameter": "frequency",
  "value": 440
}
```

## Preset Descriptions

### Soundscape Generators

**evolving_drone**
- Slowly morphing atmospheric drone with multiple LFO layers
- VCO3 modulates VCO1 FM and VCO2 PWM for evolving textures
- LFO2 sweeps VCF cutoff for movement

**generative_sequencer**
- Self-evolving patterns with random CV and sample & hold
- Sequencer drives multiple destinations with independent modulation
- Gate patterns create rhythmic variation

**dual_texture_morph**
- VCO1 (saw) and VCO2 (pulse) with crossfading
- Multiple envelope destinations create complex timbral shifts
- LFO modulation adds organic movement

### Rhythmic Experiments

**polyrhythmic_chaos**
- Multiple clock divisions creating polyrhythmic patterns
- Gate logic and delays for complex rhythmic interactions
- Random triggers add unpredictability

**gate_controlled_stutter**
- Envelope retriggering with gate delays
- Stutter effects through rapid gate patterns
- VCA modulation for rhythmic amplitude changes

### Modulation Madness

**triple_lfo**
- Three LFOs modulating different parameters simultaneously
- VCO3 → VCO1 FM, VCO2 PWM, VCF cutoff
- Creates complex, evolving modulation landscapes

**frequency_cascade**
- VCO1 sync'd to VCO2 with exponential FM
- Cascading frequency relationships
- Harmonic overtones and sub-harmonics

### Cinematic FX

**scifi_spaceship**
- Ring modulation with noise for metallic textures
- Filter sweeps for movement
- Tremolo and vibrato for expression

**thunder_lightning**
- Noise bursts through low-pass filter
- Envelope-controlled dynamics
- Random triggers for lightning strikes

**analog_glitch**
- Sample & hold creating glitchy patterns
- Random triggers and gate logic
- Unpredictable rhythmic elements

### Psychedelic

**self_playing**
- Sequencer running multiple destinations simultaneously
- Self-generating patterns with cross-modulation
- Organic, evolving soundscapes

**karplus_strong**
- Noise through comb filter for plucked string simulation
- Envelope-controlled decay
- Natural harmonic resonance

**ring_mod_sim**
- VCO1 × VCO2 amplitude modulation
- Metallic, bell-like tones
- Complex harmonic relationships

### Performance

**expressive_lead**
- Aftertouch controls vibrato depth and rate
- Responsive filter tracking
- Performance-ready modulation routing

**touch_sensitive_bass**
- Velocity controls VCF cutoff and VCA level
- Tight, punchy bass response
- Dynamic expression control

### Musical Techniques

**auto_harmonizing**
- Dual oscillators with interval tracking
- Automatic harmony generation
- Musical chord voicings

**barber_pole_phaser**
- Multi-stage all-pass filtering
- LFO sweep creates infinite rising effect
- Psychedelic phase shifting

## Tips & Tricks

1. **Start with presets**: Load a preset as a starting point and modify from there
2. **Color-code cables**: Use different colors to organize your patch visually
3. **Export frequently**: Save MIDI files of interesting patches
4. **Combine presets**: Load a preset, modify it, then export as new preset
5. **Use the web interface**: Visual feedback makes patching easier
6. **Experiment**: The 2600 rewards experimentation - try unusual patch routings

## Troubleshooting

**CLI not found:**
```bash
# Make sure you're in the correct directory
cd app/ableton-cli
python3 synth2600_cli.py --help
```

**Missing dependencies:**
```bash
pip install --upgrade mido midiutil
```

**MIDI export fails:**
- Check that output directory exists: `mkdir -p output`
- Verify file permissions
- Ensure filename ends with `.mid`

**Web API not working:**
- Ensure Node.js server is running
- Check that music-routes.js is properly loaded
- Verify Python3 is available on the server

## Examples

### Create a Deep Techno Bass
```bash
# Load the touch-sensitive bass preset
python3 synth2600_cli.py preset --load touch_sensitive_bass

# Adjust filter for darker tone
python3 synth2600_cli.py params --set "vcf.cutoff=400"
python3 synth2600_cli.py params --set "vcf.resonance=0.8"

# Export 32 bars
python3 synth2600_cli.py export --midi techno_bass.mid --bars 32
```

### Create Evolving Ambient Texture
```bash
# Load evolving drone
python3 synth2600_cli.py preset --load evolving_drone

# Slow down LFO for slower evolution
python3 synth2600_cli.py params --set "vco3.frequency=0.05"

# Add more resonance
python3 synth2600_cli.py params --set "vcf.resonance=0.9"

# Export long ambient piece
python3 synth2600_cli.py export --midi ambient.mid --bars 64
```

### Create Rhythmic Sequence
```bash
# Load polyrhythmic chaos
python3 synth2600_cli.py preset --load polyrhythmic_chaos

# Program custom 16-step sequence
python3 synth2600_cli.py sequencer --program "C3 - E3 - G3 - C4 - E4 - G4 - C5 - E5 -" --steps 16

# Export
python3 synth2600_cli.py export --midi rhythm.mid --bars 16
```

## Advanced Usage

### Chaining Commands
```bash
# Load preset, modify, and export in one go
python3 synth2600_cli.py preset --load scifi_spaceship && \
python3 synth2600_cli.py params --set "vcf.cutoff=2000" && \
python3 synth2600_cli.py export --midi scifi_modified.mid --bars 8
```

### Batch Processing
```bash
# Export all presets
for preset in evolving_drone generative_sequencer scifi_spaceship; do
  python3 synth2600_cli.py preset --load $preset
  python3 synth2600_cli.py export --midi "output/${preset}.mid" --bars 8
done
```

---

## 🎤 Hip-Hop / Trap Production Toolkit

### Overview

Complete production workflow for creating modern Hip-Hop and Trap beats using the Behringer 2600 synthesis engine combined with step sequencer and sampling capabilities.

---

# 🔥 HIP-HOP & TRAP PRODUCTION METHODOLOGY 🔥

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║     ████████╗██████╗  █████╗ ██████╗     ██████╗ ███████╗ █████╗   ║
║     ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔════╝██╔══██╗  ║
║        ██║   ██████╔╝███████║██████╔╝    ██████╔╝█████╗  ███████║  ║
║        ██║   ██╔══██╗██╔══██║██╔═══╝     ██╔══██╗██╔══╝  ██╔══██║  ║
║        ██║   ██║  ██║██║  ██║██║         ██████╔╝███████╗██║  ██║  ║
║        ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝         ╚═════╝ ╚══════╝╚═╝  ╚═╝  ║
║                                                                      ║
║            🎵 PROFESSIONAL BEAT PRODUCTION WORKFLOW 🎵              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 📋 Table of Contents

1. [🎯 Production Philosophy](#production-philosophy)
2. [🏗️ Beat Architecture](#beat-architecture)
3. [🥁 Drum Programming](#drum-programming)
4. [🎹 Melodic Design](#melodic-design)
5. [🎚️ Mix Engineering](#mix-engineering)
6. [🔄 Workflow Automation](#workflow-automation)
7. [🎭 Genre Variations](#genre-variations)

---

## 🎯 Production Philosophy

### The Modern Trap/Hip-Hop Sound Pyramid

```
                    🎤 VOCALS
                   /          \
                  /   SPACE    \
                 /              \
                /   🎹 MELODY    \
               /    (Bells/Leads) \
              /                    \
             /   🥁 DRUMS & PERCS   \
            /   (Hats, Snares, Kicks)\
           /                          \
          /   🔊 808 SUB-BASS (30-80Hz)\
         /________________________________\
```

### Core Principles

1. **🎯 Sub-Bass First** - 808s are the foundation, everything builds on top
2. **⚡ Space & Dynamics** - Silence is as important as sound
3. **🔄 Repetition & Variation** - Loops with evolving elements
4. **🎭 Texture Layering** - Multiple sounds creating one cohesive element
5. **🌊 Frequency Separation** - Each element occupies its own sonic space

---

## 🏗️ Beat Architecture

### 📐 16-Bar Structure Template

```
┌─────────────────────────────────────────────────────────────────────┐
│ INTRO (0-4 bars)      │ Minimal - Build tension                    │
│ ═════════════════════ │ • 808 + Hi-hats only                       │
│ 🎵▁▁▁▁                │ • Filter sweeps building                   │
├─────────────────────────────────────────────────────────────────────┤
│ VERSE (4-12 bars)     │ Full beat - Groove established             │
│ ═════════════════════ │ • All drums active                         │
│ 🎵████▁▁▁▁            │ • 808 pattern locked in                    │
│                       │ • Counter melodies introduced              │
├─────────────────────────────────────────────────────────────────────┤
│ BREAK (12-14 bars)    │ Drop elements - Create dynamics            │
│ ═════════════════════ │ • Remove kick/snare                        │
│ 🎵████▁▁              │ • 808 + melody only                        │
│                       │ • Riser/FX for transition                  │
├─────────────────────────────────────────────────────────────────────┤
│ HOOK (14-16 bars)     │ Maximum energy - All elements              │
│ ═════════════════════ │ • Full drum pattern                        │
│ 🎵████████            │ • Layered melodies                         │
│                       │ • 808 rolls and variations                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 🎼 Harmonic Framework

**Popular Trap Chord Progressions:**

```
Dark Trap:        i - VI - III - VII  (Am - F - C - G)
Melodic Trap:     i - iv - VII - VI   (Am - Dm - G - F)
Drill:            i - III - VII - VI  (Am - C - G - F)
Cloud Rap:        vi - IV - I - V     (Am - F - C - G)

BPM Ranges:
┌──────────────────┬──────────────┐
│ Boom-Bap         │  85-95 BPM   │
│ Modern Trap      │ 135-145 BPM  │
│ Drill            │ 140-150 BPM  │
│ Cloud/Lo-Fi      │  65-85 BPM   │
│ Phonk            │ 120-140 BPM  │
└──────────────────┴──────────────┘
```

---

## 🥁 Drum Programming

### Step 1️⃣: The 808 Foundation

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 MISSION: Create earth-shaking sub-bass foundation           │
└─────────────────────────────────────────────────────────────────┘

# Initialize 808 session
python3 synth2600_cli.py << EOF
preset 808_sub_bass
params set "vco1.frequency=55.0"        # Deep sub (A1)
params set "env.decay=0.8"               # Long tail
params set "vcf.cutoff=180"              # Tight low-pass
params set "vcf.resonance=0.4"           # Slight boost
EOF
```

**🎵 808 Pattern Philosophy:**

```
Beat:  1  e  &  a  2  e  &  a  3  e  &  a  4  e  &  a
       ▓▓▓░░░░░░░░░░░░▓▓░░░░░░░░░░░░░░▓▓▓░░░░░░▓░░░░
       ↑                ↑              ↑        ↑
     Strong         Ghost         Strong    Roll

▓ = Full velocity (120)
░ = Ghost note (60-80)
```

**Interactive 808 Builder:**

```bash
2600> sequencer create trap_808_builder

# Main 808 hits on 1 and 3
2600> sequencer add-note A1 0.0 velocity=127 duration=0.5    # Bar 1, beat 1
2600> sequencer add-note A1 2.0 velocity=127 duration=0.5    # Bar 1, beat 3

# Ghost notes for groove
2600> sequencer add-note A1 1.5 velocity=70 duration=0.25    # Syncopation
2600> sequencer add-note G1 3.5 velocity=80 duration=0.25    # Leading note

# Export the foundation
2600> export midi 01_808_foundation.mid --bars 4
```

### Step 2️⃣: Kick Drum Layer

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 🥁 Add punch and transient attack to complement 808            │
└─────────────────────────────────────────────────────────────────┘

# Tight, punchy kick (50-120 Hz range)
python3 synth2600_cli.py preset --load hard_kick
python3 synth2600_cli.py params set "env.attack=0.001"
python3 synth2600_cli.py params set "env.decay=0.1"              # Short!
python3 synth2600_cli.py params set "vcf.cutoff=120"

# Program kick pattern
python3 synth2600_cli.py sequencer --pattern four_on_floor --bpm 140
python3 synth2600_cli.py export --midi 02_kick_punch.mid
```

**🔊 Kick + 808 Relationship:**

```
Frequency Spectrum View:
         
15kHz ┤                                    (Hi-hats)
      │                                 
 5kHz ┤                          (Snare transient)
      │                               
 1kHz ┤                     
      │                  
 500Hz┤              
      │           (Kick beater attack)
 120Hz┤         ████                    
      │       ██    ██                  
  60Hz┤     ██        ██  (Kick body)    
      │   ██            ██              
  30Hz┤ ██                ████████████  ← 808 Sub-bass dominates here
      └────────────────────────────────
       Time →
       
💡 Key: Kick handles 60-150Hz (attack), 808 owns 30-80Hz (sub)
```

### Step 3️⃣: Snare/Clap Programming

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 👏 The backbone - Snare on 2 and 4 (classic backbeat)          │
└─────────────────────────────────────────────────────────────────┘

# Layered snare approach
python3 synth2600_cli.py preset --load trap_snare

# Pattern: Snare on beats 2 and 4
python3 synth2600_cli.py sequencer create backbeat \
  --steps "4,12" \
  --velocity 110 \
  --bpm 140

# Add ghost notes for variation (bars 3-4)
python3 synth2600_cli.py sequencer add-ghost-notes \
  --positions "6,10,14" \
  --velocity 65

python3 synth2600_cli.py export --midi 03_snare_clap.mid
```

**🎭 Snare Variation Techniques:**

```
Bar 1-2 (Standard):     ....X.......X...  (Beats 2 & 4)
Bar 3 (Add ghosts):     ..x.X...x...X.x.  (x = ghost note)
Bar 4 (Roll buildup):   ....X.......XXXx  (Roll into next section)

Velocity Layers:
  X = 110-127  (Main snare)
  x = 60-80    (Ghost notes)
```

### Step 4️⃣: Hi-Hat Mastery

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 🎩 The signature trap element - Rapid hi-hat rolls              │
└─────────────────────────────────────────────────────────────────┘

# Create hi-hat preset with metallic character
python3 synth2600_cli.py << EOF
preset trap_hihat_roll
params set "vco1.frequency=10000"        # High pitch
params set "vcf.type=bandpass"           # Focused frequency
params set "vcf.cutoff=12000"            # Bright
params set "vcf.resonance=0.75"          # Metallic ring
params set "env.decay=0.04"              # Very short
EOF
```

**🔥 Trap Hi-Hat Pattern Generator:**

```bash
#!/bin/bash
# trap_hihat_generator.sh

echo "🎩 Generating Trap Hi-Hat Patterns..."

# Basic 8th note pattern (foundation)
python3 synth2600_cli.py sequencer create hh_base \
  --subdivision 8 \
  --velocity 80 \
  --bpm 140

# Add 16th note embellishments (bars 2,4)
python3 synth2600_cli.py sequencer overlay hh_16ths \
  --subdivision 16 \
  --bars "2,4" \
  --velocity 90

# Signature 32nd note rolls (end of bars)
python3 synth2600_cli.py sequencer overlay hh_rolls \
  --subdivision 32 \
  --positions "15.75,31.75,47.75,63.75" \
  --length 0.25 \
  --velocity-ramp "80-120"  # Crescendo

python3 synth2600_cli.py export --midi 04_hihat_pattern.mid --bars 4
```

**📊 Hi-Hat Rhythm Breakdown:**

```
┌─────────────── BAR 1 ───────────────┬─── BAR 2 (with rolls) ───┐
│                                     │                           │
│ 1   e   &   a   2   e   &   a      │ 1   e   &   a   2   e & a │
│ x   .   x   .   x   .   x   .      │ x   x   x   x   x   xxxxx │
│ ↑       ↑       ↑       ↑          │ ↑   ↑   ↑   ↑   ↑   ↑↑↑↑↑ │
│ 8th     8th     8th     8th        │ 16s 16s 16s 16s 16s  32nds│
│                                     │                    (ROLL!) │
└─────────────────────────────────────┴───────────────────────────┘

Velocity Dynamics:
  x = 80-90   (Main hits)
  X = 100-110 (Accented)
  ↑ = 110-127 (Roll crescendo)
```

---

## 🎹 Melodic Design

### 🔔 Trap Bells & Plucks

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 🎵 Creating the signature trap melodic sound                   │
└─────────────────────────────────────────────────────────────────┘

# Bell-like pluck configuration
python3 synth2600_cli.py << EOF
preset trap_bells
params set "vco1.waveform=sine"          # Pure tone
params set "vco2.frequency=1320"         # Harmonic (3x)
params set "env.attack=0.001"            # Instant
params set "env.decay=0.3"               # Bell ring
params set "vcf.cutoff=5000"             # Bright but controlled
params set "lfo.rate=6.0"                # Vibrato
params set "lfo.depth=12"                # Subtle pitch mod
EOF
```

**🎼 Melody Construction System:**

```
Scale: A Minor Pentatonic (Safe for trap)
Notes: A, C, D, E, G

Melodic Pattern Template:
┌──────────────────────────────────────────────────┐
│ Bar 1: Root + 5th        A───E───A───            │
│ Bar 2: Add tension       A───E───G───D───        │
│ Bar 3: Resolution        A───C───D───E───        │
│ Bar 4: Variation/Hook    E───G───A───A─(roll)    │
└──────────────────────────────────────────────────┘
```

**Interactive Melody Builder:**

```bash
# Create melodic sequence interactively
python3 synth2600_cli.py << EOF
preset trap_bells
sequencer create trap_melody_v1

# Bar 1: Establish root
sequencer add-note A4 0.0 velocity=100 duration=0.5
sequencer add-note E4 0.5 velocity=95 duration=0.5
sequencer add-note A4 1.0 velocity=100 duration=0.5

# Bar 2: Build tension
sequencer add-note A4 2.0 velocity=100 duration=0.25
sequencer add-note E4 2.25 velocity=95 duration=0.25
sequencer add-note G4 2.5 velocity=105 duration=0.5
sequencer add-note D4 3.0 velocity=90 duration=1.0

# Bar 3: Resolve
sequencer add-note A4 4.0 velocity=100 duration=0.5
sequencer add-note C5 4.5 velocity=105 duration=0.5
sequencer add-note D5 5.0 velocity=100 duration=0.5
sequencer add-note E5 5.5 velocity=110 duration=0.5

# Bar 4: Variation with octave
sequencer add-note E5 6.0 velocity=110 duration=0.25
sequencer add-note G5 6.5 velocity=115 duration=0.25
sequencer add-note A5 7.0 velocity=120 duration=1.0  # Hold

export midi 05_trap_melody.mid --bars 4
EOF
```

### 🌑 Dark Atmospheric Pads

```bash
┌─────────────────────────────────────────────────────────────────┐
│ 🌌 Creating depth and atmosphere underneath the mix            │
└─────────────────────────────────────────────────────────────────┘

# Deep, evolving pad sound
python3 synth2600_cli.py << EOF
preset dark_trap_pad
params set "vco1.frequency=110"          # A2
params set "vco2.frequency=220"          # A3 (octave up)
params set "vco2.detune=4"               # Slight detune for width
params set "vcf.cutoff=600"              # Dark, muffled
params set "vcf.resonance=0.6"           # Some character
params set "env.attack=0.8"              # Slow fade-in
params set "env.release=1.5"             # Long tail
params set "lfo.rate=0.15"               # Slow movement
params set "lfo.depth=300"               # Modulate filter
EOF
```

**🎭 Pad Chord Voicings:**

```
Dark Trap Chord: Am7 (Root position)
┌────────────────────┐
│ E  (880 Hz)   ←VCO3│  Top note (7th)
│ C  (523 Hz)   ←VCO2│  Minor 3rd  
│ A  (220 Hz)   ←VCO1│  Root (octave doubled)
│ A  (110 Hz)   ←VCO1│  Root (bass)
└────────────────────┘

Playing technique: Hold for 2-4 bars, slow filter sweep
```

---

## 🎚️ Mix Engineering

### 📊 Frequency Chart (The Trap Mix Template)

```
┌─────────────────────── FREQUENCY SPECTRUM ────────────────────────┐
│                                                                    │
│ 20kHz ┤ ░░░░░░░░░░░░░░░░░ (Air/Shimmer)                          │
│       │                                                            │
│ 15kHz ┤ ████████ Hi-Hats (Brightness + Energy)                   │
│       │ ▓▓▓▓▓▓▓▓                                                  │
│ 10kHz ┤ ▓▓▓▓▓▓▓▓ Hi-Hat body                                     │
│       │                                                            │
│  5kHz ┤ ░░░░░░ Snare (Crack/Snap)                                │
│       │ ████ Melody (Presence/Clarity)                            │
│  2kHz ┤ ████ Bells/Leads                                         │
│       │                                                            │
│  1kHz ┤ ▓▓░░ Snare (Body)                                        │
│       │                                                            │
│ 500Hz ┤ ▓▓▓▓ Pads (Warmth)                                       │
│       │                                                            │
│ 200Hz ┤ ████ Kick (Punch) / Pad (Low-mids)                       │
│       │ ░░░░                                                       │
│ 100Hz ┤ ████████ Kick (Body/Thump)                               │
│       │ ████████                                                   │
│  60Hz ┤ ████████████ Kick (Sub presence)                         │
│       │ ████████████████                                          │
│  30Hz ┤ ████████████████████████ 808 (SUB-BASS FOUNDATION)       │
│       │ ████████████████████████                                  │
│  20Hz └────────────────────────────────────────────────────────   │
│                                                                    │
│ 💡 KEY RULE: Nothing fights the 808 below 80 Hz!                 │
└────────────────────────────────────────────────────────────────────┘
```

### 🎛️ Mixing Checklist

```bash
# Step 1: High-pass everything except 808 and kick
┌─────────────────────────────────────────────────────────────┐
│ ✓ Hi-hats:       HPF @ 8 kHz                                │
│ ✓ Snare:         HPF @ 150 Hz                               │
│ ✓ Melody/Bells:  HPF @ 200 Hz                               │
│ ✓ Pads:          HPF @ 100 Hz                               │
│ ✗ 808:           NO HPF! (Keep sub intact)                  │
│ ✗ Kick:          HPF @ 30-40 Hz only (rumble removal)       │
└─────────────────────────────────────────────────────────────┘

# Step 2: Create space with strategic EQ boosts
# Export with mixing notes embedded
python3 synth2600_cli.py export --midi track_808.mid \
  --notes "MIX: Boost +3dB @ 60Hz, Cut -2dB @ 200Hz"

python3 synth2600_cli.py export --midi track_hihat.mid \
  --notes "MIX: Boost +2dB @ 12kHz (air), HPF @ 8kHz"
```

### 🔊 Gain Staging Guide

```
Target Levels (RMS):
┌──────────────────┬────────────┬─────────────────┐
│ Element          │ Peak (dBFS)│ RMS (dBFS)      │
├──────────────────┼────────────┼─────────────────┤
│ 808 Sub-Bass     │ -6 to -4   │ -12 to -10      │
│ Kick             │ -8 to -6   │ -14 to -12      │
│ Snare/Clap       │ -10 to -8  │ -16 to -14      │
│ Hi-Hats          │ -15 to -12 │ -22 to -18      │
│ Melody           │ -12 to -10 │ -18 to -16      │
│ Pads             │ -18 to -15 │ -26 to -22      │
├──────────────────┼────────────┼─────────────────┤
│ MASTER BUS       │ -6 to -3   │ -14 to -12      │
└──────────────────┴────────────┴─────────────────┘

💡 Leave 6dB headroom for mastering!
```

---

## 🔄 Workflow Automation

### 🤖 Complete Beat Generator Script

```bash
#!/bin/bash
# ultimate_trap_beat_maker.sh

set -e  # Exit on error

# ═══════════════════════════════════════════════════════════
#  🎵 ULTIMATE TRAP BEAT GENERATOR 🎵
# ═══════════════════════════════════════════════════════════

# Configuration
BPM=140
BARS=16
KEY="Am"
OUTPUT_DIR="trap_beat_$(date +%Y%m%d_%H%M%S)"

echo "🎛️  Initializing Trap Beat Production..."
echo "📊 BPM: $BPM | Bars: $BARS | Key: $KEY"
echo ""

mkdir -p "$OUTPUT_DIR"/{bass,drums,melody,fx}

# ┌─────────────────────────────────────────────────────┐
# │ PHASE 1: LOW END (Foundation)                       │
# └─────────────────────────────────────────────────────┘

echo "🔊 [1/7] Generating 808 Sub-Bass..."
python3 synth2600_cli.py << EOF
preset 808_sub_bass
params set "vco1.frequency=55.0"
params set "env.decay=0.9"
params set "vcf.cutoff=180"
sequencer create 808_pattern
sequencer add-note A1 0.0 velocity=127 duration=0.5
sequencer add-note A1 2.0 velocity=127 duration=0.5
sequencer add-note G1 3.5 velocity=100 duration=0.3
export midi "$OUTPUT_DIR/bass/01_808_foundation.mid" --bars $BARS
EOF

echo "✅ 808 bass exported"

# ┌─────────────────────────────────────────────────────┐
# │ PHASE 2: DRUMS (Rhythm Section)                     │
# └─────────────────────────────────────────────────────┘

echo "🥁 [2/7] Programming Kick..."
python3 synth2600_cli.py preset --load hard_kick
python3 synth2600_cli.py sequencer --pattern four_on_floor --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi "$OUTPUT_DIR/drums/02_kick.mid"

echo "👏 [3/7] Adding Snare/Clap..."
python3 synth2600_cli.py preset --load trap_snare
python3 synth2600_cli.py sequencer --pattern backbeat --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi "$OUTPUT_DIR/drums/03_snare.mid"

echo "🎩 [4/7] Creating Hi-Hat Patterns..."
python3 synth2600_cli.py preset --load trap_hihat_roll
python3 synth2600_cli.py sequencer --subdivision 16 --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi "$OUTPUT_DIR/drums/04_hihats.mid"

# ┌─────────────────────────────────────────────────────┐
# │ PHASE 3: MELODIC ELEMENTS                           │
# └─────────────────────────────────────────────────────┘

echo "🔔 [5/7] Building Trap Bells Melody..."
python3 synth2600_cli.py << EOF
preset trap_bells
sequencer create melody_pattern
sequencer add-note A4 0.0 velocity=100 duration=0.5
sequencer add-note E4 0.5 velocity=95 duration=0.5
sequencer add-note G4 1.5 velocity=105 duration=0.5
sequencer add-note A4 2.5 velocity=110 duration=1.0
export midi "$OUTPUT_DIR/melody/05_trap_bells.mid" --bars $BARS
EOF

echo "🌌 [6/7] Adding Dark Atmospheric Pad..."
python3 synth2600_cli.py preset --load dark_trap_pad
python3 synth2600_cli.py sequencer --pattern pad_chords --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi "$OUTPUT_DIR/melody/06_dark_pad.mid"

# ┌─────────────────────────────────────────────────────┐
# │ PHASE 4: FX & TRANSITIONS                           │
# └─────────────────────────────────────────────────────┘

echo "🌊 [7/7] Creating Riser for Build-up..."
python3 synth2600_cli.py preset --load white_noise_sweep
python3 synth2600_cli.py params set "lfo.rate=0.1" "vcf.cutoff_mod_depth=10000"
python3 synth2600_cli.py export --midi "$OUTPUT_DIR/fx/07_riser.mid" --bars 4

# ┌─────────────────────────────────────────────────────┐
# │ COMPLETION & SUMMARY                                │
# └─────────────────────────────────────────────────────┘

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✨ BEAT PRODUCTION COMPLETE! ✨                 ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "📁 Output Directory: $OUTPUT_DIR"
echo ""
echo "📊 Track Summary:"
echo "  🔊 Bass:    01_808_foundation.mid"
echo "  🥁 Drums:   02_kick.mid, 03_snare.mid, 04_hihats.mid"
echo "  🎵 Melody:  05_trap_bells.mid, 06_dark_pad.mid"
echo "  🌊 FX:      07_riser.mid"
echo ""
echo "🎚️  Next Steps:"
echo "  1. Import MIDI files into your DAW (Ableton/FL Studio/Logic)"
echo "  2. Load your favorite 808/Drum samples"
echo "  3. Apply mixing template (see Mix Engineering section)"
echo "  4. Add vocals and final arrangement"
echo ""
echo "🔥 Happy Producing! 🔥"
```

### ⚡ Quick Start One-Liner

```bash
# Generate complete trap beat in one command
curl -sSL https://raw.githubusercontent.com/your-repo/trap_beat_maker.sh | bash
```

---

## 🎭 Genre Variations

### 🔫 Drill Production

```
Characteristics:
  • BPM: 140-150
  • Dark, aggressive sound
  • Sliding 808s
  • Minimalist melodies
  
┌────────────────────────────────────────┐
│ Drill Preset Pack:                    │
├────────────────────────────────────────┤
│ • drill_sliding_808                    │
│ • drill_dark_piano                     │
│ • drill_hihats (rapid rolls)           │
│ • drill_snare (tight, punchy)          │
└────────────────────────────────────────┘
```

```bash
# Drill 808 with pitch slide
python3 synth2600_cli.py << EOF
preset drill_sliding_808
params set "portamento=0.15"              # Enable slide
params set "vco1.frequency=45"            # Even deeper
params set "vcf.cutoff=150"               # Very tight
sequencer create drill_808
sequencer add-note F1 0.0 velocity=127 duration=0.3
sequencer add-note E1 0.5 velocity=120 duration=0.3  # Slide down
sequencer add-note G1 1.5 velocity=125 duration=0.5
export midi drill_808_pattern.mid
EOF
```

### 🌨️ Cloud Rap / Lo-Fi

```
Characteristics:
  • BPM: 65-85 (slower, dreamy)
  • Warm, nostalgic sound
  • Jazz-influenced chords
  • Vinyl crackle texture
  
┌────────────────────────────────────────┐
│ Lo-Fi Preset Pack:                     │
├────────────────────────────────────────┤
│ • lofi_rhodes                          │
│ • lofi_warm_bass                       │
│ • lofi_vinyl_texture                   │
│ • lofi_soft_drums                      │
└────────────────────────────────────────┘
```

```bash
# Lo-Fi Rhodes sound
python3 synth2600_cli.py << EOF
preset lofi_rhodes
params set "vco1.waveform=sine"
params set "vco2.waveform=triangle"
params set "vcf.cutoff=2000"              # Warm, not bright
params set "env.attack=0.05"              # Soft attack
params set "lfo.rate=0.5"                 # Slow wobble
export midi lofi_keys.mid --bpm 75
EOF
```

### 💀 Phonk

```
Characteristics:
  • BPM: 120-140
  • Memphis rap sampling style
  • Cowbell patterns
  • Heavy distortion
  
┌────────────────────────────────────────┐
│ Phonk Preset Pack:                     │
├────────────────────────────────────────┤
│ • phonk_cowbell                        │
│ • phonk_distorted_808                  │
│ • phonk_vocal_chop                     │
└────────────────────────────────────────┘
```

---

## 🎓 Pro Tips & Techniques

### 💎 Secret Sauce

```
┌───────────────────────────────────────────────────────────────┐
│ 1. 🎯 MONO SUB-BASS                                          │
│    Keep 808s mono below 150Hz for maximum punch              │
│    Command: Sum to mono with HPF @ 150Hz on stereo image     │
│                                                               │
│ 2. ⚡ SIDECHAIN COMPRESSION                                  │
│    Duck other elements when kick/808 hits                    │
│    Export sidechain trigger:                                 │
│    python3 synth2600_cli.py export --midi sidechain_trig.mid │
│                                                               │
│ 3. 🌊 LAYERING IS KEY                                        │
│    Snare = 3 layers (body + crack + air)                     │
│    Hi-hats = 2 layers (closed + open for variation)          │
│                                                               │
│ 4. 🎭 AUTOMATION                                             │
│    Automate filter cutoff on pads (bars 13-16)               │
│    Automate hi-hat velocity (build energy)                   │
│                                                               │
│ 5. 🔥 SATURATION                                             │
│    Add subtle saturation to 808s (harmonics)                 │
│    Heavy saturation on snares (grit)                         │
└───────────────────────────────────────────────────────────────┘
```

### 🎯 Common Mistakes to Avoid

```
❌ AVOID:
  • 808 + Kick fighting in same frequency
  • Over-compressed mix (no dynamics)
  • Too many melodic elements (cluttered)
  • Hi-hats too loud (ear fatigue)
  • No reference track

✅ DO:
  • Leave headroom (-6dB peaks)
  • Use reference tracks
  • A/B test on multiple systems
  • Take breaks (ear fatigue)
  • Save multiple versions
```

---

## 📚 Resources & Further Learning

```
🎓 Recommended Tutorials:
  • Internet Money - Trap Production Masterclass
  • Kyle Beats - Melody Making
  • Simon Servida - 808 Mixing

🎹 Essential Plugins (if using DAW):
  • Serum / Vital (Synths)
  • FabFilter Pro-Q3 (EQ)
  • iZotope Ozone (Mastering)
  • Valhalla Room (Reverb)

🎵 Sample Packs:
  • Drumvault - Trap Drums
  • Cymatics - 808 Essentials
  • WavSupply - Melody Loops
```

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎤 "The beat is the canvas, the rapper is the paint"      ║
║                                    - Metro Boomin            ║
║                                                              ║
║   Now go create something legendary! 🔥                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

### 🥁 Trap Drum Kit Setup

#### 808 Bass Pattern (Sub-Bass Foundation)

```bash
# Interactive mode - Create rolling 808 sub-bass
2600> preset 808_sub_bass
2600> sequencer pattern trap_808

# OR Command-line mode
python3 synth2600_cli.py preset --load 808_sub_bass
python3 synth2600_cli.py sequencer --pattern trap_808 --bpm 140 --bars 16
python3 synth2600_cli.py export --midi trap_808_bass.mid
```

**808 Preset Configuration:**
```python
'808_sub_bass': {
    'description': 'Classic 808 sub-bass with pitch slide',
    'vco1': {
        'frequency': 55.0,      # A1 - Deep sub frequency
        'waveform': 'sine',     # Pure sine for sub
        'range': '16"',         # Sub-audio range
    },
    'vco2': {
        'frequency': 55.0,
        'waveform': 'triangle', # Slight harmonic content
        'detune': -2,           # Slight detune for thickness
    },
    'vcf': {
        'cutoff': 200,          # Very low cutoff
        'resonance': 0.3,       # Moderate resonance
        'type': 'lowpass',
    },
    'env': {
        'attack': 0.001,        # Instant attack
        'decay': 0.8,           # Long decay for tail
        'sustain': 0.0,         # No sustain
        'release': 0.4,         # Medium release
    },
    'lfo': {
        'rate': 0.0,            # No LFO modulation
        'depth': 0,
    },
    'patches': [
        'VCO1/OUT -> VCF/IN',
        'VCO2/OUT -> VCF/IN',
        'VCF/OUT -> VCA/IN',
        'ENV/OUT -> VCA/CV',
        'ENV/OUT -> VCF/CUTOFF',  # Envelope modulates filter
    ],
    'notes': [
        {'time': 0, 'pitch': 33, 'velocity': 120, 'duration': 0.5},   # A1
        {'time': 0.5, 'pitch': 33, 'velocity': 110, 'duration': 0.25}, # A1
        {'time': 1.5, 'pitch': 36, 'velocity': 115, 'duration': 0.5},  # C2
        {'time': 2.5, 'pitch': 31, 'velocity': 118, 'duration': 0.75}, # G1
    ]
}
```

#### Trap Hi-Hat Patterns (Rapid Rolls)

```bash
# Triple hi-hat roll pattern
2600> preset trap_hihat_roll
2600> sequencer pattern hihat_triplets --bpm 140

# Command-line
python3 synth2600_cli.py preset --load trap_hihat_roll
python3 synth2600_cli.py sequencer --pattern hihat_triplets --subdivision 32
```

**Hi-Hat Preset:**
```python
'trap_hihat_roll': {
    'description': 'Trap-style metallic hi-hat rolls',
    'vco1': {
        'frequency': 8000,      # High frequency metallic
        'waveform': 'square',   # Harsh waveform
    },
    'vco2': {
        'frequency': 12000,     # Even higher for shimmer
        'waveform': 'sawtooth',
    },
    'vcf': {
        'cutoff': 12000,        # Bright, open sound
        'resonance': 0.7,       # High resonance for metallic
        'type': 'bandpass',     # Narrow band for definition
    },
    'env': {
        'attack': 0.001,
        'decay': 0.05,          # Very short decay
        'sustain': 0.0,
        'release': 0.02,        # Quick release
    },
    'notes': [
        # 32nd note hi-hat rolls (classic trap pattern)
        {'time': 0.0, 'pitch': 42, 'velocity': 80, 'duration': 0.05},
        {'time': 0.125, 'pitch': 42, 'velocity': 85, 'duration': 0.05},
        {'time': 0.25, 'pitch': 42, 'velocity': 90, 'duration': 0.05},
        {'time': 0.375, 'pitch': 42, 'velocity': 95, 'duration': 0.05},
        {'time': 0.5, 'pitch': 42, 'velocity': 100, 'duration': 0.05},
        {'time': 0.625, 'pitch': 42, 'velocity': 105, 'duration': 0.05},
        {'time': 0.75, 'pitch': 42, 'velocity': 110, 'duration': 0.05},
        {'time': 0.875, 'pitch': 42, 'velocity': 115, 'duration': 0.05},
    ]
}
```

### 🎹 Melodic Elements

#### Synth Lead (Trap Bells / Plucks)

```bash
# Bell-like pluck sound for melodies
2600> preset trap_bells
2600> params set "env.attack=0.001" "env.decay=0.3" "vcf.cutoff=5000"
2600> export midi trap_melody.mid --bars 8
```

**Trap Bells Preset:**
```python
'trap_bells': {
    'description': 'Bell-like pluck for trap melodies',
    'vco1': {
        'frequency': 440,
        'waveform': 'sine',     # Pure tone
    },
    'vco2': {
        'frequency': 1320,      # 3x harmonic (perfect fifth + octave)
        'waveform': 'triangle',
    },
    'vcf': {
        'cutoff': 5000,
        'resonance': 0.4,
        'type': 'lowpass',
    },
    'env': {
        'attack': 0.001,
        'decay': 0.3,           # Medium decay for bell-like ring
        'sustain': 0.2,
        'release': 0.5,
    },
    'lfo': {
        'rate': 6.0,            # Vibrato
        'depth': 10,
    },
    'patches': [
        'VCO1/OUT -> VCF/IN',
        'VCO2/OUT -> VCF/IN',
        'VCF/OUT -> VCA/IN',
        'ENV/OUT -> VCA/CV',
        'LFO/OUT -> VCO1/PITCH',  # Subtle vibrato
    ]
}
```

#### Pad / Atmospheric Layer

```bash
# Dark atmospheric pad
2600> preset dark_trap_pad
2600> params set "lfo.rate=0.2" "vcf.cutoff=800"
2600> sequencer pattern pad_chords --bpm 70
```

**Dark Pad Preset:**
```python
'dark_trap_pad': {
    'description': 'Dark, menacing pad for trap atmospheres',
    'vco1': {
        'frequency': 110,       # A2
        'waveform': 'sawtooth',
    },
    'vco2': {
        'frequency': 220,       # A3 - one octave up
        'waveform': 'sawtooth',
        'detune': 3,            # Slight detune for width
    },
    'vcf': {
        'cutoff': 800,          # Dark, muffled
        'resonance': 0.5,
        'type': 'lowpass',
    },
    'env': {
        'attack': 0.5,          # Slow attack for pad
        'decay': 0.3,
        'sustain': 0.7,
        'release': 1.0,         # Long release for ambience
    },
    'lfo': {
        'rate': 0.2,            # Slow modulation
        'depth': 200,
    },
    'patches': [
        'VCO1/OUT -> VCF/IN',
        'VCO2/OUT -> VCF/IN',
        'VCF/OUT -> VCA/IN',
        'ENV/OUT -> VCA/CV',
        'LFO/OUT -> VCF/CUTOFF',  # Slow filter sweep
    ]
}
```

### 🎼 Full Track Workflow

#### Step 1: Create Beat Foundation

```bash
#!/bin/bash
# trap_beat_builder.sh

BPM=140
BARS=16

echo "🎵 Building Trap Beat..."

# 808 Bass line
python3 synth2600_cli.py preset --load 808_sub_bass
python3 synth2600_cli.py sequencer --pattern trap_808 --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi output/01_808_bass.mid

# Kick drum
python3 synth2600_cli.py preset --load hard_kick
python3 synth2600_cli.py sequencer --pattern four_floor --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi output/02_kick.mid

# Snare (on 2 and 4)
python3 synth2600_cli.py preset --load trap_snare
python3 synth2600_cli.py sequencer --pattern backbeat --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi output/03_snare.mid

# Hi-hat rolls
python3 synth2600_cli.py preset --load trap_hihat_roll
python3 synth2600_cli.py sequencer --pattern hihat_triplets --bpm $BPM --bars $BARS
python3 synth2600_cli.py export --midi output/04_hihats.mid

echo "✅ Drum tracks exported to output/"
```

#### Step 2: Add Melodic Elements

```bash
# Trap bells melody
python3 synth2600_cli.py preset --load trap_bells
python3 synth2600_cli.py sequencer --custom-notes "36,38,40,43,45" --bpm $BPM
python3 synth2600_cli.py export --midi output/05_melody.mid

# Dark pad layer
python3 synth2600_cli.py preset --load dark_trap_pad
python3 synth2600_cli.py sequencer --pattern pad_chords --bpm $BPM
python3 synth2600_cli.py export --midi output/06_pad.mid
```

#### Step 3: Add Effects and Variations

```bash
# Riser for build-up
python3 synth2600_cli.py preset --load white_noise_sweep
python3 synth2600_cli.py params set "vcf.cutoff_mod_depth=8000" "lfo.rate=0.1"
python3 synth2600_cli.py export --midi output/07_riser.mid --bars 4

# Stutter synth for transitions
python3 synth2600_cli.py preset --load stutter_synth
python3 synth2600_cli.py export --midi output/08_stutter_fx.mid --bars 2
```

### 📊 Trap Production Patterns

#### Classic Trap Drum Pattern (16 bars)

```
Kick:   |X...|....|X...|....|X...|....|X...|....|
Snare:  |....|X...|....|X...|....|X...|....|X...|
HH:     |xxxx|xxxx|xxxx|xxxx|XXXX|XXXX|xxxx|xxxx|
808:    |X..X|..X.|X...|..X.|X..X|..X.|X...|..X.|

X = accent, x = ghost note, . = rest
```

**Sequencer Command:**
```bash
2600> sequencer create trap_pattern \
  --kick "0,4,8,12" \
  --snare "4,12" \
  --hihat "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15" \
  --808 "0,3,6,11" \
  --bpm 140
```

#### Modern Trap Variations

**Half-Time Feel:**
```bash
# Snare on beat 3 only, kick on 1
python3 synth2600_cli.py sequencer --pattern halftime_trap --bpm 75
```

**Double-Time Hi-Hats:**
```bash
# 32nd note rolls at specific intervals
python3 synth2600_cli.py sequencer --subdivision 32 --hihat-rolls "7,15,23,31"
```

**Rolling 808s:**
```bash
# Pitch-sliding 808 pattern
python3 synth2600_cli.py preset --load 808_sub_bass
python3 synth2600_cli.py params set "portamento=0.1"  # Enable pitch glide
python3 synth2600_cli.py sequencer --notes "A1,A1,G1,C2" --glide enabled
```

### 🎛️ Sound Design Tips

#### Punchy 808 Bass
```bash
# Add distortion and compression characteristics
2600> preset 808_sub_bass
2600> params set "vcf.resonance=0.6"      # More resonance
2600> params set "env.decay=1.2"          # Longer tail
2600> params set "vco1.frequency=50"      # Deeper sub
```

#### Metallic Hi-Hats
```bash
# Increase high-frequency content
2600> preset trap_hihat_roll
2600> params set "vcf.cutoff=15000"       # Wide open
2600> params set "vcf.resonance=0.8"      # High Q
2600> params set "vcf.type=bandpass"      # Focused frequency
```

#### Atmospheric Texture
```bash
# Create evolving pad sounds
2600> preset dark_trap_pad
2600> params set "lfo.rate=0.15"          # Slow movement
2600> params set "lfo.depth=500"          # Deep modulation
2600> params set "env.attack=1.0"         # Slow fade-in
```

### 🎚️ Mixing Guidelines

#### Frequency Ranges (Hz)

```
808 Bass:        20-80 Hz     (Sub-bass foundation)
Kick:            50-120 Hz    (Punch and body)
Snare:           200-400 Hz   (Body), 2-5 kHz (Crack)
Hi-Hats:         8-15 kHz     (Brightness and air)
Melody/Bells:    1-5 kHz      (Clarity and presence)
Pad:             200-800 Hz   (Warmth and atmosphere)
```

**EQ Settings:**
```bash
# Export with frequency separation notes
python3 synth2600_cli.py export --midi track.mid \
  --notes "EQ: HPF@100Hz, Boost@60Hz(+3dB)"
```

#### Velocity Layering

```bash
# Create velocity layers for dynamics
2600> sequencer velocities low=60 med=90 high=120
2600> sequencer pattern hihat_dynamics \
  --velocities "60,90,60,120,60,90,60,120"
```

### 📦 Complete Hip-Hop Starter Pack

**Quick Start Script:**
```bash
#!/bin/bash
# hiphop_starter_kit.sh

mkdir -p hiphop_project/{drums,melody,bass,fx}

# Drums
python3 synth2600_cli.py preset --load 808_sub_bass && \
  python3 synth2600_cli.py export --midi hiphop_project/bass/808_bass.mid

python3 synth2600_cli.py preset --load trap_hihat_roll && \
  python3 synth2600_cli.py export --midi hiphop_project/drums/hihats.mid

# Melody
python3 synth2600_cli.py preset --load trap_bells && \
  python3 synth2600_cli.py export --midi hiphop_project/melody/bells.mid

# Atmosphere
python3 synth2600_cli.py preset --load dark_trap_pad && \
  python3 synth2600_cli.py export --midi hiphop_project/melody/pad.mid

echo "✅ Hip-Hop starter kit created in hiphop_project/"
echo "📁 Import MIDI files into your DAW and add your vocals!"
```

### 🎤 Vocal Processing Integration

**Sidechain Pattern for Ducking:**
```bash
# Create sidechain trigger pattern
python3 synth2600_cli.py sequencer --pattern sidechain_trigger \
  --notes "C3" \
  --steps "0,4,8,12" \
  --bpm 140

# Export for DAW sidechain compression
python3 synth2600_cli.py export --midi sidechain_kick.mid
```

### 🔥 Genre-Specific Presets

```python
# Add to CREATIVE_PATCHES dictionary

# Drill-style rolling hi-hats
'drill_hihats': {
    'vco1': {'frequency': 10000, 'waveform': 'square'},
    'vcf': {'cutoff': 14000, 'resonance': 0.75, 'type': 'highpass'},
    'env': {'attack': 0.001, 'decay': 0.03, 'sustain': 0.0, 'release': 0.01},
}

# Boom-bap kick
'boombap_kick': {
    'vco1': {'frequency': 60, 'waveform': 'sine'},
    'vcf': {'cutoff': 150, 'resonance': 0.4},
    'env': {'attack': 0.001, 'decay': 0.15, 'sustain': 0.0, 'release': 0.1},
}

# Trap flute lead
'trap_flute': {
    'vco1': {'frequency': 880, 'waveform': 'sine'},
    'vco2': {'frequency': 1320, 'waveform': 'triangle'},
    'vcf': {'cutoff': 3000, 'resonance': 0.3},
    'lfo': {'rate': 5.0, 'depth': 15},  # Vibrato
}
```

### 🎼 BPM Guidelines

```
Boom-Bap Hip-Hop:     85-95 BPM
Modern Trap:          130-150 BPM (half-time feel)
Drill:                140-150 BPM
Cloud Rap:            60-80 BPM
Phonk:                120-140 BPM
```

**Set BPM:**
```bash
2600> sequencer bpm 140
2600> sequencer swing 0.15  # Add groove
```

---

## Contributing

To add new presets, edit the `CREATIVE_PATCHES` dictionary in `synth2600_cli.py`:

```python
CREATIVE_PATCHES = {
    'my_preset': {
        'description': 'My amazing preset description',
        'vco1': {'frequency': 220, 'waveform': 'sawtooth'},
        'vco2': {'frequency': 220, 'waveform': 'square'},
        'vcf': {'cutoff': 1000, 'resonance': 0.5},
        'patches': [
            'VCO1/OUT -> VCF/IN',
            'VCF/OUT -> VCA/IN'
        ]
    }
}
```

## License

Part of the Azure PostgreSQL App music production suite.

---

**Happy Patching! 🎛️🎹🎵**
