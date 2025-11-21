# Behringer 2600 CLI Tool - User Guide

## Overview

The `synth2600_cli.py` is a comprehensive command-line interface for the Behringer 2600 synthesizer, featuring 17 creative presets, full parameter mapping, MIDI export, and real-time control.

## Installation

```bash
# Install dependencies
pip install mido midiutil

# Make executable
chmod +x synth2600_cli.py
```

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
