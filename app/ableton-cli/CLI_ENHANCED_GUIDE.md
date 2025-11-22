# Behringer 2600 CLI - Enhanced Version 2.0

## 🚀 What's New

The enhanced CLI includes major improvements across all features:

### ✨ New Features

1. **Rich Terminal Output**
   - Beautiful tables and panels
   - Color-coded messages
   - Progress bars for long operations
   - Interactive prompts

2. **Enhanced Preset Management**
   - Search presets by name, category, or tags
   - Preset library statistics
   - Category filtering
   - Auto-save detection

3. **Improved Command System**
   - Better error messages
   - Command history with arrow keys
   - Auto-completion hints
   - Unsaved changes warning

4. **Advanced Export/Import**
   - JSON preset export/import
   - Enhanced MIDI generation
   - Batch operations support
   - Metadata preservation

5. **Statistics & Analysis**
   - Patch complexity metrics
   - Module usage statistics
   - Color distribution analysis
   - Envelope character description

## 📦 Installation

```bash
cd app/ableton-cli

# Install dependencies
pip install -r requirements.txt

# Or install individually
pip install midiutil mido rich
```

## 🎹 Quick Start

### Interactive Mode (Recommended)

```bash
# Start interactive CLI
python3 synth2600_cli_enhanced.py

# Or explicitly
python3 synth2600_cli_enhanced.py --interactive
```

### Command-Line Mode

```bash
# Show version
python3 synth2600_cli_enhanced.py --version

# Show help
python3 synth2600_cli_enhanced.py --help
```

## 📚 Commands Reference

### General Commands

| Command | Description | Example |
|---------|-------------|---------|
| `help` | Show all available commands | `help` |
| `info` | Display current synth state | `info` |
| `list` | List all patch cables | `list` |
| `stats` | Show patching statistics | `stats` |
| `history` | Show command history | `history` |
| `exit` | Exit the CLI (with save prompt) | `exit` |

### Patching Commands

| Command | Description | Example |
|---------|-------------|---------|
| `patch <src> <dst> [color]` | Add a patch cable | `patch VCO1/SAW VCF/IN red` |
| `remove <src> <dst>` | Remove a patch cable | `remove VCO1/SAW VCF/IN` |
| `clear` | Clear all patches | `clear` |

**Patch Format:** `MODULE/OUTPUT` (e.g., `VCO1/SAW`, `VCF/LP`, `ENV1/OUT`)

**Available Colors:** red, blue, green, yellow, orange, purple, white, black

### Module Parameter Commands

#### VCO (Voltage Controlled Oscillator)

```bash
# Set VCO1 frequency and waveform
vco1 440 sawtooth
vco1 220 square

# Set VCO2
vco2 880 triangle
vco2 110 sine
```

**Available Waveforms:** sawtooth, square, triangle, sine

#### VCF (Voltage Controlled Filter)

```bash
# Set filter cutoff and resonance
filter 1000 0.7
filter 500 0.3

# With filter type
filter 2000 0.5 lowpass
filter 800 0.8 bandpass
```

**Filter Types:** lowpass, highpass, bandpass

#### Envelope

```bash
# Set ADSR envelope: attack decay sustain release
envelope 0.01 0.2 0.7 0.3
envelope 0.5 1.0 0.9 2.0   # Pad
envelope 0.001 0.05 0.0 0.01  # Pluck
```

**Envelope Descriptions:**
- **Plucky/Percussive:** Fast attack (<0.01s), short release (<0.1s)
- **Pad/Slow:** Slow attack (>0.5s)
- **Decaying:** Low sustain (<0.3)
- **Sustained:** High sustain (>0.7)

#### LFO (Low Frequency Oscillator)

```bash
# Set LFO rate
lfo 5
lfo 0.5   # Slow modulation

# With waveform
lfo 10 triangle
```

### Preset Commands

#### Load Preset

```bash
# Load by exact name
preset load Bass - Deep 808

# Load by search (loads first match)
preset load acid
```

#### Save Preset

```bash
# Basic save
preset save MyPatch

# With category
preset save MyPatch bass

# With category and description
preset save MyPatch bass Deep sub bass with long decay
```

**Categories:** bass, lead, pad, effects, percussion, sequence, modulation, user

#### List Presets

```bash
# List all presets
preset list

# List by category
preset list bass
preset list pad
```

#### Search Presets

```bash
# Search by name
preset search acid

# Search by tag
preset search deep

# Search by category
preset search bass
```

#### Preset Statistics

```bash
# Show library statistics
preset stats
```

Shows:
- Total number of presets
- Breakdown by category
- Library version

### Export/Import Commands

#### Export MIDI

```bash
# Export 4 bars (default)
export midi mysequence.mid

# Export custom number of bars
export midi mysequence.mid 8
export midi mysequence.mid 16
```

Output location: `output/midi/`

#### Export Preset

```bash
# Export current state as JSON
export preset mypatch.json
```

Output location: `output/presets/`

#### Import Preset

```bash
# Import from JSON file
import mypreset.json
import output/presets/custom.json
```

## 🎨 Enhanced Features

### 1. Color-Coded Output

All messages are color-coded for clarity:
- 🟢 **Green:** Success messages
- 🔴 **Red:** Error messages
- 🟡 **Yellow:** Warnings and info
- 🔵 **Cyan:** Module names and headers
- 🟣 **Magenta:** Destinations and special highlights

### 2. Interactive Tables

Commands like `list`, `info`, and `preset list` display beautiful tables with:
- Aligned columns
- Color-coded data
- Clear headers
- Row numbering

### 3. Statistics & Metrics

#### Patch Statistics

Shows:
- Total number of cables
- Number of modules used
- Complexity rating (Simple/Medium/Complex)
- Cable color distribution

#### Envelope Character

Auto-describes envelope settings:
- Plucky/Percussive
- Pad/Slow
- Decaying
- Sustained

### 4. Unsaved Changes Detection

The CLI tracks modifications and:
- Shows [modified] indicator in prompt
- Warns before exiting with unsaved changes
- Clears indicator after saving

### 5. Smart Search

Preset search matches:
- Preset names (partial match)
- Categories
- Tags
- Case-insensitive

## 🔍 Usage Examples

### Example 1: Classic Bass Patch

```bash
# Start CLI
python3 synth2600_cli_enhanced.py

# Create classic bass routing
patch VCO1/SAW VCF/IN red
patch VCF/LP VCA/IN red
patch ENV1/OUT VCA/CV blue
patch ENV2/OUT VCF/CV green

# Set parameters
vco1 55 sawtooth
filter 300 0.3
envelope 0.001 0.8 0.0 0.1

# Save preset
preset save DeepBass bass Sub bass with filter sweep

# Export MIDI
export midi deepbass.mid 4
```

### Example 2: Load and Modify Preset

```bash
# Load existing preset
preset load Acid Bass

# View current state
info
list

# Modify filter
filter 1500 0.8

# Save as new variant
preset save AcidBassHot bass Acid bass with higher cutoff
```

### Example 3: Browse and Search

```bash
# List all bass presets
preset list bass

# Search for pad sounds
preset search pad

# View library statistics
preset stats

# Load interesting preset
preset load Atmospheric Pad
```

### Example 4: Complex Modular Patch

```bash
# FM synthesis patch
patch VCO1/SINE VCO2/FM blue
patch VCO2/SAW VCF/IN red
patch VCF/LP VCA/IN red
patch ENV1/OUT VCA/CV green
patch ENV2/OUT VCO1/FM yellow
patch LFO/TRI VCF/CV purple

# Set FM parameters
vco1 110 sine
vco2 220 sawtooth
lfo 0.5 triangle
filter 800 0.6

# View complexity
stats

# Export
preset save FMBass bass FM modulated bass
```

## 📊 Output Examples

### Info Display

```
🎛️  Current Synth State
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Module   ┃ Parameters                     ┃
┡━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ Preset   │ Deep Bass [modified]           │
│ VCO1     │ 55Hz, sawtooth                 │
│ VCO2     │ 110Hz, square                  │
│ VCF      │ Cutoff: 300Hz, Res: 0.30, LP   │
│ ENV1     │ A:0.001s D:0.8s S:0.0 R:0.1s   │
│ Patches  │ 4 cables connected             │
└──────────┴────────────────────────────────┘
```

### Patch List

```
🔌 Patch Cables
┏━━━┳━━━━━━━━━━━━┳━━━┳━━━━━━━━━━━━━┳━━━━━━━┓
┃ # ┃ Source     ┃ → ┃ Destination ┃ Color ┃
┡━━━╇━━━━━━━━━━━━╇━━━╇━━━━━━━━━━━━━╇━━━━━━━┩
│ 1 │ VCO1/SAW   │ → │ VCF/IN      │ red   │
│ 2 │ VCF/LP     │ → │ VCA/IN      │ red   │
│ 3 │ ENV1/OUT   │ → │ VCA/CV      │ blue  │
│ 4 │ ENV2/OUT   │ → │ VCF/CV      │ green │
└───┴────────────┴───┴─────────────┴───────┘
```

### Preset Statistics

```
╔════════════════════════════════════════╗
║   📊 Preset Library Statistics         ║
╚════════════════════════════════════════╝

Total Presets: 200
Version: 2.0

Categories:
  • bass: 40 presets
  • effects: 30 presets
  • lead: 30 presets
  • modulation: 20 presets
  • pad: 30 presets
  • percussion: 30 presets
  • sequence: 20 presets
```

## 🛠️ Troubleshooting

### Rich Library Not Available

If `rich` is not installed, the CLI falls back to basic ANSI colors:

```bash
# Install rich for enhanced experience
pip install rich
```

### Command Not Found

Make sure the script is executable:

```bash
chmod +x synth2600_cli_enhanced.py
```

### Import Errors

Install all dependencies:

```bash
pip install -r requirements.txt
```

### Preset Not Loading

Check the file path and format:

```bash
# List available presets
preset list

# Search for preset
preset search <name>
```

## 🎯 Best Practices

1. **Save Often:** Use `preset save` regularly to avoid losing work
2. **Use Descriptive Names:** Name presets with category and character
3. **Add Tags:** Include relevant tags when saving
4. **Color Code Patches:** Use different colors for signal types:
   - Red: Audio signals
   - Blue: Control voltages
   - Green: Envelopes
   - Yellow: Modulation
4. **Check Stats:** Use `stats` to understand patch complexity
5. **Export MIDI:** Test sounds by exporting to MIDI
6. **Search First:** Use `preset search` before creating new presets

## 📈 Comparison: Old vs Enhanced CLI

| Feature | Old CLI | Enhanced CLI |
|---------|---------|--------------|
| Output | Plain text | Rich tables & panels |
| Preset Search | ❌ No | ✅ Yes |
| Statistics | ❌ Basic | ✅ Advanced |
| Error Messages | ❌ Generic | ✅ Detailed |
| Unsaved Warning | ❌ No | ✅ Yes |
| History | ✅ Basic | ✅ Enhanced |
| Import/Export | ✅ Limited | ✅ Full JSON support |
| Auto-complete | ❌ No | ✅ Hints |
| Color Coding | ✅ Basic | ✅ Rich |
| Documentation | ✅ Basic | ✅ Comprehensive |

## 🚀 Future Enhancements

Planned features for v3.0:
- Auto-completion for commands
- Undo/redo functionality
- Patch visualization (ASCII art)
- Batch preset operations
- Cloud sync for presets
- Plugin for DAWs
- Web UI interface
- Collaborative patching

## 📝 License

Part of the azure-psql-app project.
