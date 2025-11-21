# 🎹 Deep Techno Ableton Automation

**Automated workflow for creating complete Deep Techno tracks in Ableton Live 12**

This system generates MIDI patterns, creates Ableton project templates, and automates VST3 plugin loading using clean, modular Python and Bash scripts.

---

## 🚀 Quick Start

```bash
# Make the script executable
chmod +x launch_deep_techno.sh

# Run the complete workflow
./launch_deep_techno.sh
```

That's it! The script will:
1. ✅ Generate 6 MIDI pattern files
2. ✅ Create a fresh Ableton Live project
3. ✅ Launch Ableton automatically
4. ✅ Load VST3 instruments (TEKNO & Omnisphere)

---

## 📁 Project Structure

### Core Scripts

- **`launch_deep_techno.sh`** - Master orchestration script
- **`create_deep_techno_midi.py`** - MIDI pattern generator (class-based)
- **`generate_deep_techno_template.py`** - Ableton template generator (class-based)
- **`automate_vst_loading.py`** - VST3 automation (class-based with GUI automation)

### Generated Output

- **`MIDI-Files/Deep-Techno/`** - 6 MIDI files:
  - `01-Deep-Kick.mid` - 4-on-the-floor kick pattern
  - `02-Rolling-Sub.mid` - Hypnotic 16th-note sub-bass
  - `03-Off-Beat-Hat.mid` - Classic off-beat open hi-hat
  - `04-Ghost-Snares.mid` - Subtle syncopated snares
  - `05-Atmospheric-Pad.mid` - Long evolving F# minor pad
  - `06-Rhythmic-Stabs.mid` - Simple hypnotic stab pattern

- **`Techno-Template-Output/`** - Ableton Live files:
  - `Deep-Techno-Template.als` - Compressed Ableton project
  - `Deep-Techno-Template.xml` - Uncompressed (for debugging)

---

## 🎛️ Track Configuration

| Track | Name | Instrument | MIDI File |
|-------|------|------------|-----------|
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

## 🔧 Technical Details

### Python Scripts

All scripts are refactored with **object-oriented design**:

#### `DeepTechnoMIDIGenerator` Class
```python
generator = DeepTechnoMIDIGenerator(bpm=124, bars=136)
generator.generate_all()
```

**Features:**
- Individual methods for each MIDI pattern
- Configurable BPM and bar count
- Clean separation of concerns
- Type hints and docstrings

#### `AbletonTemplateGenerator` Class
```python
generator = AbletonTemplateGenerator(tempo=124)
generator.generate()
```

**Features:**
- Generates valid Ableton Live 12 XML
- Creates both compressed (.als) and uncompressed (.xml) files
- Modular track and return track creation
- Configurable track colors and annotations

#### `AbletonAutomation` Class
```python
automation = AbletonAutomation()
automation.find_ableton_process()
automation.activate_window()
automation.load_plugin("Tekno")
```

**Features:**
- Process detection via AppleScript
- Window activation and focus management
- Plugin configuration with dataclasses
- Configurable timing constants
- Error handling and timeouts

### Shell Script

`launch_deep_techno.sh` orchestrates the entire workflow with:
- Process monitoring (waits for Ableton to launch)
- Timeout handling (120 second max)
- 25-second grace period for UI initialization
- Clean, formatted output with progress indicators

---

## ⚙️ Configuration

### Customize MIDI Generation

Edit `create_deep_techno_midi.py`:

```python
generator = DeepTechnoMIDIGenerator(
    bpm=128,          # Change tempo
    bars=64,          # Change track length
    output_dir="..."  # Change output directory
)
```

### Customize Template

Edit `generate_deep_techno_template.py`:

```python
generator = AbletonTemplateGenerator(
    tempo=130,        # Change project tempo
    output_dir="..."  # Change output directory
)
```

### Customize Automation Timing

Edit `automate_vst_loading.py`:

```python
class AbletonAutomation:
    TIMING = {
        'window_activation': 3.0,  # Increase if Ableton is slow
        'browser_open': 2.5,
        'search_typing': 3.0,
        # ... etc
    }
```

### Customize Track Mapping

Edit `automate_vst_loading.py`:

```python
class DeepTechnoSetup:
    TRACK_MAP = {
        1: "Tekno",       # Change instrument assignments
        2: "Tekno",
        # ... etc
    }
```

---

## 🐛 Troubleshooting

### Ableton doesn't launch
- Check that Ableton Live 12 Suite is installed
- Ensure the `.als` file path is correct

### VST automation fails
- Verify TEKNO and Omnisphere are installed
- Check macOS Accessibility permissions for Terminal
- Increase timing values in `AbletonAutomation.TIMING`

### Process timeout
- Close Ableton before running the script
- Increase `MAX_WAIT` in `launch_deep_techno.sh`

### Plugins not found
- Ensure VST3 plugins are in standard locations
- Check plugin names match exactly (case-sensitive)

---

## 🎯 Requirements

- **Ableton Live 12 Suite** (macOS)
- **Python 3.7+**
- **Python packages:**
  - `midiutil`
  - `pyautogui`
- **VST3 Plugins:**
  - TEKNO
  - Omnisphere

### Install Python Dependencies

```bash
pip3 install midiutil pyautogui
```

---

## 🎨 Code Architecture

### Design Principles

1. **Object-Oriented**: All generators use classes
2. **Type Hints**: Full type annotations
3. **Dataclasses**: Configuration objects
4. **Separation of Concerns**: Each script has one clear responsibility
5. **Error Handling**: Graceful failures with informative messages
6. **Configurability**: Easy to customize without editing core logic

### Class Hierarchy

```
DeepTechnoMIDIGenerator
├── generate_deep_kick()
├── generate_rolling_sub()
├── generate_offbeat_hat()
├── generate_ghost_snares()
├── generate_atmospheric_pad()
└── generate_rhythmic_stabs()

AbletonTemplateGenerator
├── generate_deep_techno_template()
└── save_template()

AbletonAutomation
├── find_ableton_process()
├── activate_window()
├── setup_view()
├── navigate_to_track()
└── load_plugin()

DeepTechnoSetup
└── run()
```

---

## 📝 License

MIT License - Feel free to use and modify for your own productions!

---

## 🎧 Happy Producing!

Made with ❤️ for techno producers who like to automate their workflow.
