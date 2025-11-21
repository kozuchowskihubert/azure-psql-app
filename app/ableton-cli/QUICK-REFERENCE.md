# 🎹 TECHNO STUDIO - Quick Reference

## ⚡ Quick Commands

```bash
# Complete workflow (most common)
./techno_studio.py create --genre deep --bpm 124

# Just MIDI patterns
./techno_studio.py midi --genre deep --bpm 128 --bars 96

# Just Ableton template
./techno_studio.py template --tempo 130

# Automate VST loading (Ableton must be running)
./techno_studio.py automate

# List all generated files
./techno_studio.py list

# Help
./techno_studio.py --help
```

---

## 📁 Important Paths

```bash
# Main CLI tool
./techno_studio.py

# Generated MIDI files
output/MIDI-Files/Deep/*.mid

# Generated Ableton templates
output/Projects/*.als

# Source code (for customization)
src/generators/midi_generator.py
src/generators/template_generator.py
src/automation/vst_automation.py

# Documentation
README.md
START-HERE.md
docs/USAGE-GUIDE.md
```

---

## 🎛️ Command Options

### `create` - Full Workflow
```bash
./techno_studio.py create \
    --genre deep \          # Genre (default: deep)
    --bpm 124 \             # Tempo (default: 124)
    --bars 136 \            # Length in bars (default: 136)
    --autoload              # Auto-load VSTs (optional)
```

### `midi` - MIDI Generation
```bash
./techno_studio.py midi \
    --genre deep \          # Genre (default: deep)
    --bpm 128 \             # Tempo (default: 124)
    --bars 96               # Length in bars (default: 136)
```

### `template` - Template Generation
```bash
./techno_studio.py template \
    --name "My-Project" \   # Template name (default: Deep-Techno)
    --tempo 130             # Tempo (default: 124)
```

---

## 🎵 Generated Files

### MIDI Patterns (6 files)
1. `01-Deep-Kick.mid` - 4-on-the-floor kick
2. `02-Rolling-Sub.mid` - Hypnotic 16th-note sub
3. `03-Off-Beat-Hat.mid` - Classic off-beat hi-hat
4. `04-Ghost-Snares.mid` - Subtle syncopated snares
5. `05-Atmospheric-Pad.mid` - Evolving pad chord
6. `06-Rhythmic-Stabs.mid` - Hypnotic stab pattern

### Ableton Template
- 6 MIDI tracks (color-coded, annotated)
- 3 Return tracks (Reverb, Delay, Plate)
- Correct tempo
- Ready to use

---

## 🎯 Common Workflows

### Workflow 1: Quick Start
```bash
./techno_studio.py create --genre deep
open output/Projects/Deep-Techno-Template.als
# Drag MIDI files onto tracks in Ableton
```

### Workflow 2: Custom BPM
```bash
./techno_studio.py create --genre deep --bpm 130 --bars 64
```

### Workflow 3: Just MIDI
```bash
./techno_studio.py midi --genre deep --bpm 128
# Use with your existing Ableton template
```

### Workflow 4: Full Automation
```bash
./techno_studio.py create --genre deep --autoload
# Will prompt when Ableton is ready
```

---

## 🛠️ Customization Quick Ref

### Change MIDI Patterns
**File:** `src/generators/midi_generator.py`
**Edit:** Methods like `generate_deep_kick()`, `generate_rolling_sub()`, etc.

### Change Ableton Template
**File:** `src/generators/template_generator.py`
**Edit:** The `tracks` list in `generate_deep_techno_template()`

### Change VST Automation
**File:** `src/automation/vst_automation.py`
**Edit:** `PLUGINS` dictionary or `TIMING` settings

---

## ⚙️ Configuration Defaults

```python
# MIDI Generation
BPM: 124
Bars: 136
Genre: deep

# Template Generation
Tempo: 124
Time Signature: 4/4

# VST Automation
Timing (seconds):
- Window activation: 3.0
- Browser open: 2.5
- Search typing: 3.0
- Plugin load: 8.0 (Tekno) / 10.0 (Omnisphere)
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Command not found | `chmod +x techno_studio.py` |
| Module not found | `pip3 install midiutil pyautogui` |
| Ableton not found | Launch Ableton before running `automate` |
| VST timeout | Increase timing in `src/automation/vst_automation.py` |
| Permission denied | Grant Terminal accessibility permissions |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `START-HERE.md` | **Read first!** Quick overview |
| `README.md` | Complete reference |
| `docs/USAGE-GUIDE.md` | Detailed examples |
| `docs/ARCHITECTURE.md` | Code structure |
| `COMPLETE-SUMMARY.md` | What was done |

---

## 💡 Pro Tips

```bash
# Create alias
echo "alias techno='~/YT/Ableton-Automation/techno_studio.py'" >> ~/.zshrc

# Then use:
techno create --genre deep

# Batch generate
for bpm in 120 124 128 132; do
    techno midi --genre deep --bpm $bpm
done

# Quick test (4 bars)
techno midi --genre deep --bpm 124 --bars 4

# List everything
techno list
```

---

## 🎹 Track Mapping (Deep Techno)

| Track | Instrument | MIDI File |
|-------|------------|-----------|
| 1 | TEKNO | 01-Deep-Kick.mid |
| 2 | TEKNO | 02-Rolling-Sub.mid |
| 3 | Drum Rack | 03-Off-Beat-Hat.mid |
| 4 | Drum Rack | 04-Ghost-Snares.mid |
| 5 | OMNISPHERE | 05-Atmospheric-Pad.mid |
| 6 | OMNISPHERE | 06-Rhythmic-Stabs.mid |

**Returns:**
- A: Reverb (Hall)
- B: Delay (Echo 1/8)
- C: Plate Reverb

---

## ✅ Checklist

### First Time Setup
- [ ] Run `chmod +x techno_studio.py`
- [ ] Run `chmod +x cleanup.sh`
- [ ] Install: `pip3 install midiutil pyautogui`
- [ ] Run `./cleanup.sh` (optional, organizes old files)

### Every Time
- [ ] Run `./techno_studio.py create --genre deep --bpm <bpm>`
- [ ] Open generated `.als` file in Ableton
- [ ] Drag MIDI files onto tracks
- [ ] (Optional) Run `./techno_studio.py automate` for VST loading

---

## 🚀 Quick Start (Copy & Paste)

```bash
# One-time setup
chmod +x techno_studio.py cleanup.sh
pip3 install midiutil pyautogui
./cleanup.sh

# Generate project
./techno_studio.py create --genre deep --bpm 124

# Open in Ableton
open output/Projects/Deep-Techno-Template.als

# Done! Start producing 🎹
```

---

**Keep this file open as a quick reference while producing!**

**Happy producing! 🎧🔊**
