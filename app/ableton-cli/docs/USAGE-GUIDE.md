# 🎯 Techno Studio - Complete Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Workflows](#basic-workflows)
3. [Advanced Usage](#advanced-usage)
4. [Customization](#customization)
5. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Time Setup

1. **Clean up the project** (removes old messy files):
   ```bash
   ./cleanup.sh
   ```

2. **Verify installation**:
   ```bash
   ./techno_studio.py --version
   ```

3. **View help**:
   ```bash
   ./techno_studio.py --help
   ```

---

## Basic Workflows

### Workflow 1: Complete Project Creation

**The fastest way to get started:**

```bash
./techno_studio.py create --genre deep --bpm 124 --bars 136
```

**What happens:**
1. ✅ Generates 6 MIDI files → `output/MIDI-Files/Deep/`
2. ✅ Creates Ableton template → `output/Projects/Deep-Techno-Template.als`
3. ⏸️  Waits for you to open the template in Ableton
4. ⏸️  (Optional) Auto-loads VST plugins if you add `--autoload`

**Then:**
1. Open `output/Projects/Deep-Techno-Template.als` in Ableton
2. Drag MIDI files from `output/MIDI-Files/Deep/` onto tracks
3. Start producing!

### Workflow 2: MIDI Generation Only

**When you already have an Ableton template:**

```bash
./techno_studio.py midi --genre deep --bpm 128 --bars 64
```

**Use case:**
- You have a custom Ableton template
- You just want fresh MIDI patterns
- Testing different BPMs/lengths

### Workflow 3: Template Generation Only

**When you already have MIDI files:**

```bash
./techno_studio.py template --name "My-Techno-Project" --tempo 130
```

**Use case:**
- You have custom MIDI patterns
- You want a fresh Ableton project structure
- Creating multiple variations

### Workflow 4: VST Automation (Standalone)

**After manually opening Ableton:**

```bash
# 1. Open Ableton Live 12 Suite
# 2. Open any project with empty MIDI tracks
# 3. Run:
./techno_studio.py automate
```

**What it does:**
- Finds Ableton process
- Activates window
- Loads TEKNO on tracks 1-2
- Loads Omnisphere on tracks 5-6

---

## Advanced Usage

### Custom BPM and Length

```bash
# Fast techno (140 BPM, short loop)
./techno_studio.py create --genre deep --bpm 140 --bars 32

# Slow, deep techno (118 BPM, long track)
./techno_studio.py create --genre deep --bpm 118 --bars 256

# Standard club techno
./techno_studio.py create --genre deep --bpm 130 --bars 128
```

### Automated VST Loading

```bash
# Complete workflow with auto VST loading
./techno_studio.py create --genre deep --bpm 124 --autoload
```

**Requirements:**
- Ableton must open automatically when the .als file is created
- Terminal must have Accessibility permissions
- You'll see a prompt: "Press ENTER when Ableton is fully loaded..."

### List All Generated Files

```bash
./techno_studio.py list
```

**Output example:**
```
📂 Generated Files:
═══════════════════════════════════════════════════════════

🎵 MIDI Files:

  Deep:
    • 01-Deep-Kick.mid (245 bytes)
    • 02-Rolling-Sub.mid (1567 bytes)
    • 03-Off-Beat-Hat.mid (234 bytes)
    • 04-Ghost-Snares.mid (456 bytes)
    • 05-Atmospheric-Pad.mid (189 bytes)
    • 06-Rhythmic-Stabs.mid (678 bytes)

🎹 Ableton Projects:
  • Deep-Techno-Template.als (45,234 bytes)
```

---

## Customization

### Customize MIDI Patterns

**Edit:** `src/generators/midi_generator.py`

**Example - Change kick velocity:**
```python
def generate_deep_kick(self) -> None:
    midi = self._create_midi_file()
    for beat in range(0, self.duration_in_beats, 1):
        # Change 120 to 100 for softer kick
        midi.addNote(0, 0, 36, beat, 1, 100)  # ← Changed from 120
    self._save_midi(midi, "01-Deep-Kick.mid")
```

**Example - Add more hi-hat variation:**
```python
def generate_offbeat_hat(self) -> None:
    midi = self._create_midi_file()
    for beat in range(0, self.duration_in_beats, 1):
        # Main off-beat
        midi.addNote(0, 0, 46, beat + 0.5, 0.5, 90)
        # Add extra hit every 4 beats
        if beat % 4 == 3:
            midi.addNote(0, 0, 46, beat + 0.75, 0.25, 70)
    self._save_midi(midi, "03-Off-Beat-Hat.mid")
```

### Customize Ableton Template

**Edit:** `src/generators/template_generator.py`

**Example - Add more tracks:**
```python
def generate_deep_techno_template(self) -> Tuple[str, str]:
    tracks = [
        TrackConfig("01 - DEEP KICK", 1, "MIDI: 01-Deep-Kick.mid | Add TEKNO"),
        TrackConfig("02 - ROLLING SUB", 16, "MIDI: 02-Rolling-Sub.mid | Add TEKNO"),
        # ... existing tracks ...
        
        # NEW TRACKS:
        TrackConfig("07 - PERCUSSION", 5, "For percussion loops"),
        TrackConfig("08 - FX", 12, "For sound effects"),
    ]
    # ...
```

### Customize VST Automation

**Edit:** `src/automation/vst_automation.py`

**Example - Add new plugin:**
```python
PLUGINS = {
    "Tekno": PluginConfig("Tekno", "Tekno", 1, 8.0),
    "Omnisphere": PluginConfig("Omnisphere", "Omnisphere", 2, 10.0),
    # Add your plugin:
    "Serum": PluginConfig("Serum", "Serum", 1, 6.0),
}
```

**Example - Adjust timing (if automation is too fast/slow):**
```python
TIMING = {
    'window_activation': 5.0,    # Increased from 3.0
    'browser_open': 3.5,         # Increased from 2.5
    'search_typing': 4.0,        # Increased from 3.0
    # ...
}
```

**Example - Change track mapping:**
```python
class DeepTechnoSetup:
    TRACK_MAP = {
        1: "Tekno",       # Kick
        2: "Serum",       # Changed from Tekno
        3: None,
        4: None,
        5: "Omnisphere",
        6: "Omnisphere",
        7: "Tekno",       # New track
    }
```

---

## Tips & Tricks

### Tip 1: Create Shell Alias

Add to `~/.zshrc`:
```bash
alias techno='~/path/to/Ableton-Automation/techno_studio.py'
```

Then use:
```bash
techno create --genre deep
techno midi --bpm 130
```

### Tip 2: Batch Generate Multiple Variations

```bash
# Generate 3 different BPMs
./techno_studio.py midi --genre deep --bpm 120 --bars 64
./techno_studio.py midi --genre deep --bpm 128 --bars 64
./techno_studio.py midi --genre deep --bpm 135 --bars 64

# List all generated files
./techno_studio.py list
```

### Tip 3: Use Python Directly

```python
#!/usr/bin/env python3
import sys
sys.path.insert(0, 'src')

from generators.midi_generator import DeepTechnoMIDIGenerator

# Custom script
generator = DeepTechnoMIDIGenerator(bpm=128, bars=32)
generator.generate_deep_kick()
generator.generate_rolling_sub()
# Generate only what you need
```

### Tip 4: Debug VST Automation

If VST automation fails:

1. **Check Ableton is running:**
   ```bash
   pgrep -f "Ableton Live Suite"
   ```

2. **Check Accessibility permissions:**
   - System Settings → Privacy & Security → Accessibility
   - Enable Terminal

3. **Increase wait times:**
   - Edit `src/automation/vst_automation.py`
   - Increase all values in `TIMING` dictionary

4. **Test manually:**
   ```python
   from src.automation.vst_automation import AbletonAutomation
   
   auto = AbletonAutomation()
   auto.find_ableton_process()  # Should print process name
   auto.activate_window()        # Should activate Ableton
   ```

### Tip 5: Organize Output

```bash
# Rename output folder by date
mv output output-2025-11-21

# Create new output folder
mkdir output output/MIDI-Files output/Projects

# Generate fresh files
./techno_studio.py create --genre deep
```

### Tip 6: Quick Testing

```bash
# Test MIDI generation (fast)
./techno_studio.py midi --genre deep --bpm 124 --bars 4

# Test template generation (fast)
./techno_studio.py template --tempo 124

# Verify files
./techno_studio.py list
```

---

## Common Use Cases

### Use Case 1: Live Performance Sketches

```bash
# Generate short loops for live sets
./techno_studio.py midi --genre deep --bpm 128 --bars 8
```

### Use Case 2: Full Track Production

```bash
# Generate complete track structure
./techno_studio.py create --genre deep --bpm 124 --bars 256
```

### Use Case 3: Multiple Genre Variations

```bash
# When more genres are supported in the future:
./techno_studio.py midi --genre deep --bpm 124
./techno_studio.py midi --genre dark --bpm 130
./techno_studio.py midi --genre acid --bpm 135
```

### Use Case 4: Template Library

```bash
# Create template variations
./techno_studio.py template --name "Deep-124" --tempo 124
./techno_studio.py template --name "Deep-128" --tempo 128
./techno_studio.py template --name "Deep-130" --tempo 130
```

---

## Troubleshooting

### Issue: "Command not found"
```bash
# Make executable
chmod +x techno_studio.py

# Run with python3
python3 techno_studio.py create --genre deep
```

### Issue: "Module not found"
```bash
# Install dependencies
pip3 install midiutil pyautogui

# Verify installation
python3 -c "import midiutil; import pyautogui; print('OK')"
```

### Issue: VST automation doesn't work
```bash
# Check Ableton is running
pgrep -f "Ableton Live Suite"

# Grant accessibility permissions
# System Settings → Privacy & Security → Accessibility → Terminal

# Test manually
./techno_studio.py automate
```

---

## Next Steps

1. ✅ Run `./cleanup.sh` to organize the project
2. ✅ Try `./techno_studio.py create --genre deep`
3. ✅ Open the generated project in Ableton
4. ✅ Customize the MIDI patterns or template to your liking
5. ✅ Start producing!

**Happy producing! 🎹🔊**
