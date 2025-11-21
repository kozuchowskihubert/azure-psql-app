# 🎹 Techno Studio - Ableton Live Automation Toolkit

**Professional automation toolkit for creating complete techno tracks in Ableton Live 12**

Version: 2.0.0 | Platform: macOS | License: MIT

---

## 🌟 Features

- ✅ **MIDI Pattern Generation** - Create professional techno MIDI patterns instantly
- ✅ **Template Creation** - Generate complete Ableton Live project templates
- ✅ **VST Automation** - Automatically load VST3 instruments (TEKNO, Omnisphere)
- ✅ **Complete Workflow** - One command to generate everything
- ✅ **CLI Interface** - Easy-to-use command-line tool
- ✅ **Modular Architecture** - Clean, maintainable, extensible code

---

## 📁 Project Structure

```
Ableton-Automation/
├── techno_studio.py          # Main CLI tool
├── src/                       # Source code
│   ├── generators/            # MIDI and template generators
│   │   ├── midi_generator.py
│   │   └── template_generator.py
│   └── automation/            # VST automation
│       └── vst_automation.py
├── output/                    # Generated files
│   ├── MIDI-Files/           # MIDI patterns by genre
│   └── Projects/             # Ableton templates
├── docs/                      # Documentation
└── archive/                   # Old/deprecated files
```

---

## 🚀 Quick Start

### Installation

1. **Clone or download this repository**

2. **Install Python dependencies**
   ```bash
   pip3 install midiutil pyautogui
   ```

3. **Make the CLI executable**
   ```bash
   chmod +x techno_studio.py
   ```

### Basic Usage

**Create a complete project (MIDI + Template):**
```bash
./techno_studio.py create --genre deep --bpm 124 --bars 136
```

**Generate MIDI patterns only:**
```bash
./techno_studio.py midi --genre deep --bpm 128
```

**Generate Ableton template only:**
```bash
./techno_studio.py template --tempo 130
```

**Automate VST loading (Ableton must be open):**
```bash
./techno_studio.py automate
```

**List all generated files:**
```bash
./techno_studio.py list
```

---

## 📖 Detailed Commands

### `create` - Full Workflow

Creates MIDI patterns AND Ableton template in one command.

```bash
./techno_studio.py create [OPTIONS]
```

**Options:**
- `--genre` - Techno subgenre (default: `deep`)
- `--bpm` - Tempo in BPM (default: `124`)
- `--bars` - Track length in bars (default: `136`)
- `--autoload` - Auto-load VSTs after creation (requires Ableton open)

**Example:**
```bash
./techno_studio.py create --genre deep --bpm 130 --bars 64 --autoload
```

### `midi` - Generate MIDI Only

Creates MIDI pattern files for your chosen genre.

```bash
./techno_studio.py midi [OPTIONS]
```

**Options:**
- `--genre` - Techno subgenre (default: `deep`)
- `--bpm` - Tempo in BPM (default: `124`)
- `--bars` - Track length in bars (default: `136`)

**Example:**
```bash
./techno_studio.py midi --genre deep --bpm 128 --bars 96
```

**Generates:**
- `01-Deep-Kick.mid` - 4-on-the-floor kick
- `02-Rolling-Sub.mid` - Hypnotic 16th-note sub-bass
- `03-Off-Beat-Hat.mid` - Classic off-beat hi-hat
- `04-Ghost-Snares.mid` - Subtle syncopated snares
- `05-Atmospheric-Pad.mid` - Evolving pad chord
- `06-Rhythmic-Stabs.mid` - Hypnotic stab pattern

### `template` - Generate Template Only

Creates an Ableton Live project template.

```bash
./techno_studio.py template [OPTIONS]
```

**Options:**
- `--name` - Template name (default: `Deep-Techno`)
- `--tempo` - Tempo in BPM (default: `124`)

**Example:**
```bash
./techno_studio.py template --name "My-Dark-Techno" --tempo 132
```

### `automate` - VST Automation

Automatically loads VST3 instruments onto tracks.

```bash
./techno_studio.py automate
```

**Requirements:**
- Ableton Live 12 Suite must be running
- macOS Accessibility permissions enabled for Terminal

**What it does:**
1. Finds running Ableton process
2. Activates Ableton window
3. Navigates to each track
4. Loads TEKNO or Omnisphere VST3 plugins

### `list` - List Outputs

Shows all generated MIDI files and templates.

```bash
./techno_studio.py list
```

---

## 🎛️ Track Configuration

### Deep Techno Genre

| Track # | Name | Instrument | MIDI File |
|---------|------|------------|-----------|
| 1 | Deep Kick | **TEKNO** | 01-Deep-Kick.mid |
| 2 | Rolling Sub | **TEKNO** | 02-Rolling-Sub.mid |
| 3 | Off-Beat Hat | Drum Rack | 03-Off-Beat-Hat.mid |
| 4 | Ghost Snares | Drum Rack | 04-Ghost-Snares.mid |
| 5 | Atmospheric Pad | **OMNISPHERE** | 05-Atmospheric-Pad.mid |
| 6 | Rhythmic Stabs | **OMNISPHERE** | 06-Rhythmic-Stabs.mid |

**Return Tracks:**
- A - REVERB (Hall, 5.5s)
- B - DELAY (Echo 1/8, 35%)
- C - PLATE (Plate Reverb)

---

## ⚙️ Configuration

### Customize MIDI Generation

Edit `src/generators/midi_generator.py`:

```python
class DeepTechnoMIDIGenerator:
    def __init__(self, bpm=124, bars=136, output_dir="..."):
        # Adjust default parameters
        self.bpm = bpm
        self.bars = bars
```

### Customize Template

Edit `src/generators/template_generator.py`:

```python
tracks = [
    TrackConfig("01 - DEEP KICK", 1, "MIDI: 01-Deep-Kick.mid | Add TEKNO"),
    # Add or modify tracks
]
```

### Customize VST Automation

Edit `src/automation/vst_automation.py`:

```python
PLUGINS = {
    "Tekno": PluginConfig("Tekno", "Tekno", 1, 8.0),
    # Add your plugins
}

TIMING = {
    'window_activation': 3.0,  # Adjust timing
    # ...
}
```

---

## 🔧 Advanced Usage

### Create Alias (Optional)

Add to your `~/.zshrc`:

```bash
alias techno='~/path/to/Ableton-Automation/techno_studio.py'
```

Then use:
```bash
techno create --genre deep
techno midi --bpm 130
techno automate
```

### Python API Usage

You can also import and use the modules directly:

```python
from src.generators.midi_generator import DeepTechnoMIDIGenerator
from src.generators.template_generator import AbletonTemplateGenerator

# Generate MIDI
generator = DeepTechnoMIDIGenerator(bpm=128, bars=64)
generator.generate_all()

# Generate template
template = AbletonTemplateGenerator(tempo=128)
template.generate()
```

---

## 🐛 Troubleshooting

### "Ableton Live Suite process not found"
- **Solution**: Launch Ableton Live 12 Suite before running `automate` command

### "Failed to activate Ableton window"
- **Solution**: Grant Terminal accessibility permissions in System Settings > Privacy & Security > Accessibility

### VST automation times out
- **Solution**: Increase timing values in `src/automation/vst_automation.py`

### Plugins not loading correctly
- **Solution**: 
  - Verify TEKNO and Omnisphere are installed
  - Check plugin names match exactly (case-sensitive)
  - Ensure plugins are in standard VST3 locations

### MIDI files empty or incorrect
- **Solution**: Check console output for errors, verify `midiutil` is installed

---

## 📋 Requirements

- **macOS** (tested on macOS Monterey+)
- **Python 3.7+**
- **Ableton Live 12 Suite**
- **VST3 Plugins:**
  - TEKNO
  - Omnisphere
- **Python Packages:**
  - `midiutil`
  - `pyautogui`

---

## 🎯 Workflow Examples

### Example 1: Quick Deep Techno Track

```bash
# Generate everything
./techno_studio.py create --genre deep --bpm 124

# Open the generated project in Ableton
open output/Projects/Deep-Techno-Template.als

# Wait for Ableton to load, then:
./techno_studio.py automate

# Done! Drag MIDI files onto tracks and start producing
```

### Example 2: Custom BPM and Length

```bash
# Create 140 BPM, 64-bar track
./techno_studio.py create --genre deep --bpm 140 --bars 64
```

### Example 3: MIDI Only Workflow

```bash
# Generate MIDI with custom settings
./techno_studio.py midi --genre deep --bpm 128 --bars 96

# Use existing Ableton project, drag MIDI files manually
```

---

## 📚 Documentation

- **[Deep Techno Guide](docs/DEEP-TECHNO-README.md)** - Genre-specific documentation
- **[API Reference](docs/)** - Code documentation
- **[Change Log](CHANGELOG.md)** - Version history

---

## 🗂️ File Organization

### Clean Structure

All generated files are organized in the `output/` directory:

```
output/
├── MIDI-Files/
│   └── Deep/
│       ├── 01-Deep-Kick.mid
│       ├── 02-Rolling-Sub.mid
│       └── ...
└── Projects/
    ├── Deep-Techno-Template.als
    └── Deep-Techno-Template.xml
```

### Archive

Old/deprecated files have been moved to `archive/` to keep the project root clean.

---

## 🔄 Version History

### v2.0.0 (Current)
- ✅ Complete restructure with modular architecture
- ✅ New CLI tool (`techno_studio.py`)
- ✅ Clean folder organization
- ✅ Improved code quality (OOP, type hints, docstrings)
- ✅ Comprehensive documentation

### v1.x (Archive)
- Legacy scripts (see `archive/` folder)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - Feel free to use and modify for your own productions!

---

## 🎧 Credits

Made with ❤️ for techno producers who like to automate their workflow.

**Built with:**
- Python 3
- midiutil
- pyautogui
- Ableton Live 12 Suite

---

## 💡 Tips

1. **Start Simple**: Use default settings first, then customize
2. **Experiment**: Try different BPM and bar lengths
3. **Customize**: Edit the MIDI patterns in Ableton after generation
4. **Backup**: Keep your custom modifications separate from generated files
5. **Accessibility**: Grant Terminal full disk access for best results

---

## 🆘 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the documentation in `docs/`
- Review the troubleshooting section above

---

**Happy Producing! 🎹🔊**
