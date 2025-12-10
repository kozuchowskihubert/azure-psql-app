# 🎹 HOW TO USE - Techno Studio Toolkit

**Complete guide to using your organized Ableton automation toolkit.**

---

## 🚀 QUICK START (Copy & Paste)

```bash
# Step 1: Generate everything
./techno_studio.py create --genre deep --bpm 124

# Step 2: Open in Ableton
open output/Projects/Deep-Techno-Template.als

# Step 3: Start producing! 🎧
```

That's it! You're ready to make music.

---

## 📋 AVAILABLE COMMANDS

### **1. Create Complete Project** ⭐ (Most Common)

```bash
./techno_studio.py create --genre deep --bpm 124 --bars 136
```

**What it does:**
- ✅ Generates 6 MIDI pattern files
- ✅ Creates Ableton Live template (.als)
- ✅ Organizes everything in `output/`

**Generated files:**
```
output/
├── MIDI-Files/Deep/
│   ├── 01-Deep-Kick.mid
│   ├── 02-Rolling-Sub.mid
│   ├── 03-Off-Beat-Hat.mid
│   ├── 04-Ghost-Snares.mid
│   ├── 05-Atmospheric-Pad.mid
│   └── 06-Rhythmic-Stabs.mid
└── Projects/
    └── Deep-Techno-Template.als
```

**Options:**
- `--genre deep` - Genre (currently only 'deep' available)
- `--bpm 124` - Tempo (default: 124, try 120-140)
- `--bars 136` - Length (default: 136 bars = ~5 min at 124 BPM)

**Examples:**
```bash
# Fast techno at 132 BPM
./techno_studio.py create --genre deep --bpm 132

# Slower, atmospheric at 120 BPM
./techno_studio.py create --genre deep --bpm 120

# Short loop (32 bars)
./techno_studio.py create --genre deep --bpm 124 --bars 32

# Long track (200 bars = ~8 minutes)
./techno_studio.py create --genre deep --bpm 128 --bars 200
```

---

### **2. Generate MIDI Only**

```bash
./techno_studio.py midi --genre deep --bpm 128 --bars 64
```

**When to use:**
- You already have a template
- You just need new MIDI patterns
- You want to test different BPMs quickly

**Output:**
```
output/MIDI-Files/Deep/
├── 01-Deep-Kick.mid
├── 02-Rolling-Sub.mid
├── 03-Off-Beat-Hat.mid
├── 04-Ghost-Snares.mid
├── 05-Atmospheric-Pad.mid
└── 06-Rhythmic-Stabs.mid
```

**Batch generation example:**
```bash
# Generate patterns at different tempos
for bpm in 120 124 128 132 140; do
    ./techno_studio.py midi --genre deep --bpm $bpm --bars 64
done
```

---

### **3. Generate Template Only**

```bash
./techno_studio.py template --tempo 130
```

**When to use:**
- You already have MIDI files
- You want a fresh template
- You're testing template configurations

**Output:**
```
output/Projects/Deep-Techno-Template.als
```

**What's in the template:**
- 6 MIDI tracks (color-coded, named, annotated)
- 3 Return tracks (Reverb, Delay, Plate)
- Correct tempo
- Ready to drag MIDI files onto

---

### **4. Automate VST Loading** 🤖

```bash
./techno_studio.py automate
```

**Requirements:**
- ✅ Ableton Live 12 must be running
- ✅ Template must be open
- ✅ VST3 plugins must be installed

**What it does:**
- Automatically loads VST plugins onto tracks
- Uses GUI automation (pyautogui)
- Configurable timing and plugin mapping

**⚠️ Important:**
- Don't touch keyboard/mouse during automation
- Configure plugins in `src/automation/vst_automation.py`
- Currently configured for: Tekno, Omnisphere

**Full workflow with autoload:**
```bash
# Generate, open, and autoload in one go
./techno_studio.py create --genre deep --bpm 124 --autoload
```

---

### **5. List Generated Files**

```bash
./techno_studio.py list
```

**What it shows:**
- All MIDI files in `output/MIDI-Files/`
- All projects in `output/Projects/`
- File counts and organization

**Example output:**
```
╔════════════════════════════════════════════════════════════╗
║                    🎹 TECHNO STUDIO v2.0.0                  ║
║              Ableton Live Automation Toolkit               ║
╚════════════════════════════════════════════════════════════╝

📂 Generated Files:
═══════════════════════════════════════════════════════════

🎵 MIDI Files:
📁 Deep/ (6 files)
  ├── 01-Deep-Kick.mid
  ├── 02-Rolling-Sub.mid
  ├── 03-Off-Beat-Hat.mid
  ├── 04-Ghost-Snares.mid
  ├── 05-Atmospheric-Pad.mid
  └── 06-Rhythmic-Stabs.mid

🎹 Ableton Projects:
  • Deep-Techno-Template.als
```

---

## 🎯 COMMON WORKFLOWS

### **Workflow 1: Complete Track from Scratch**

```bash
# 1. Generate everything
./techno_studio.py create --genre deep --bpm 124

# 2. Open in Ableton
open output/Projects/Deep-Techno-Template.als

# 3. In Ableton:
#    - Drag MIDI files onto tracks
#    - Add your VST plugins
#    - Arrange and produce!
```

---

### **Workflow 2: Quick Pattern Testing**

```bash
# Generate short loops at different tempos
./techno_studio.py midi --genre deep --bpm 120 --bars 16
./techno_studio.py midi --genre deep --bpm 124 --bars 16
./techno_studio.py midi --genre deep --bpm 128 --bars 16

# Open template and test each tempo's patterns
open output/Projects/Deep-Techno-Template.als
```

---

### **Workflow 3: Automated Setup** 🤖

```bash
# 1. Generate with autoload flag
./techno_studio.py create --genre deep --bpm 124 --autoload

# 2. Ableton will open automatically
# 3. VST plugins will load automatically
# 4. Just start producing!
```

---

### **Workflow 4: Custom BPM Projects**

```bash
# Slow, deep techno
./techno_studio.py create --genre deep --bpm 118 --bars 200

# Standard techno
./techno_studio.py create --genre deep --bpm 124 --bars 136

# Fast, driving techno
./techno_studio.py create --genre deep --bpm 135 --bars 120

# Peak-time banger
./techno_studio.py create --genre deep --bpm 140 --bars 100
```

---

## 📂 OUTPUT STRUCTURE

After running commands, your files are organized like this:

```
output/
├── MIDI-Files/
│   └── Deep/                    # Genre-specific folder
│       ├── 01-Deep-Kick.mid
│       ├── 02-Rolling-Sub.mid
│       ├── 03-Off-Beat-Hat.mid
│       ├── 04-Ghost-Snares.mid
│       ├── 05-Atmospheric-Pad.mid
│       └── 06-Rhythmic-Stabs.mid
│
└── Projects/
    ├── Deep-Techno-Template.als  # Ableton project
    └── Deep-Techno-Template.xml  # Debug/uncompressed version
```

---

## 🎵 WHAT EACH MIDI FILE CONTAINS

### **01-Deep-Kick.mid**
- 4-on-the-floor kick drum pattern
- C1 (MIDI note 36)
- Perfect for: Kick drums, bass drums

### **02-Rolling-Sub.mid**
- Hypnotic 16th-note sub-bass pattern
- F# (MIDI note 42)
- Perfect for: Sub-bass, low-end rumble

### **03-Off-Beat-Hat.mid**
- Classic off-beat hi-hat pattern
- Perfect for: Hi-hats, shakers, percussion

### **04-Ghost-Snares.mid**
- Subtle syncopated snare pattern
- Perfect for: Snares, claps, rim shots

### **05-Atmospheric-Pad.mid**
- Evolving F# minor pad progression
- Perfect for: Pads, strings, atmospheres

### **06-Rhythmic-Stabs.mid**
- Hypnotic stab chord pattern
- F# minor chord (F#, A, C#)
- Perfect for: Stabs, chords, leads

---

## 🛠️ CUSTOMIZATION

### **Customize MIDI Patterns**

Edit: `src/generators/midi_generator.py`

```python
# Example: Change kick velocity
def generate_deep_kick(self):
    midi.addNote(0, 0, 36, beat, 1, 127)  # ← Change 127 to 110 for softer kick
```

### **Customize Ableton Template**

Edit: `src/generators/template_generator.py`

```python
# Example: Add more tracks
tracks = [
    TrackConfig("01 - DEEP KICK", 1, "MIDI: 01-Deep-Kick.mid"),
    TrackConfig("02 - ROLLING SUB", 16, "MIDI: 02-Rolling-Sub.mid"),
    TrackConfig("10 - YOUR NEW TRACK", 5, "Your notes here"),  # ← Add this
]
```

### **Customize VST Automation**

Edit: `src/automation/vst_automation.py`

```python
# Example: Add your plugins
PLUGINS = {
    "Tekno": PluginConfig("Tekno", "Tekno", 1, 8.0),
    "YourPlugin": PluginConfig("Your Plugin Name", "Your Plugin", 2, 5.0),
}
```

---

## 💡 PRO TIPS

### **Tip 1: Create a Shell Alias**

Add to your `~/.zshrc`:
```bash
alias techno='~/YT/Ableton-Automation/techno_studio.py'
```

Then use from anywhere:
```bash
techno create --genre deep --bpm 128
techno midi --bpm 132
techno list
```

### **Tip 2: Batch Generate Multiple Versions**

```bash
# Generate patterns at all common techno tempos
for bpm in 120 124 128 132 136 140; do
    ./techno_studio.py create --genre deep --bpm $bpm --bars 96
done
```

### **Tip 3: Quick Testing with Short Loops**

```bash
# Generate 4-bar loops for quick testing
./techno_studio.py midi --genre deep --bpm 124 --bars 4
```

### **Tip 4: Use as a Python Library**

```python
from src.generators.midi_generator import DeepTechnoMIDIGenerator

# Generate custom patterns
generator = DeepTechnoMIDIGenerator(bpm=130, bars=64)
generator.generate_all()
```

### **Tip 5: Organize by Project**

```bash
# Generate files for specific track
./techno_studio.py create --genre deep --bpm 126 --bars 160

# Rename/move to project folder
mv output/MIDI-Files/Deep/ output/MIDI-Files/MyTrackName/
mv output/Projects/Deep-Techno-Template.als output/Projects/MyTrackName.als
```

---

## ❓ COMMON QUESTIONS

### **Q: Can I change the MIDI patterns?**
**A:** Yes! Edit `src/generators/midi_generator.py` to customize patterns.

### **Q: Can I add more tracks to the template?**
**A:** Yes! Edit `src/generators/template_generator.py` to add tracks.

### **Q: Do I need to install anything?**
**A:** Yes! Run: `pip install midiutil pyautogui` (only needed once)

### **Q: Can I use this with Ableton 11?**
**A:** Possibly, but it's designed for Ableton Live 12. Test and adjust if needed.

### **Q: The autoload doesn't work. Why?**
**A:** Make sure:
- Ableton Live 12 is running
- Template is open
- VST plugins are installed
- You don't touch keyboard/mouse during automation

### **Q: Can I delete the old files in archive/?**
**A:** Yes! They're safely archived if you need them, but can be deleted.

---

## 📚 DOCUMENTATION

| File | Purpose |
|------|---------|
| **HOW-TO-USE.md** | This file - complete usage guide |
| `START-HERE.md` | Quick start (5 minutes) |
| `QUICK-REFERENCE.md` | Command cheat sheet |
| `README.md` | Complete project documentation |
| `docs/USAGE-GUIDE.md` | Advanced usage examples |
| `docs/ARCHITECTURE.md` | Code structure & development |

---

## 🎊 YOU'RE READY!

Now you know how to:
- ✅ Generate complete techno projects
- ✅ Create MIDI patterns at any tempo
- ✅ Generate Ableton templates
- ✅ Automate VST loading
- ✅ Customize everything
- ✅ Use pro workflows

---

## 🚀 START NOW

```bash
# Copy this command and run it:
./techno_studio.py create --genre deep --bpm 124

# Then open in Ableton:
open output/Projects/Deep-Techno-Template.als

# Start making music! 🎹🔊
```

**Happy producing! 🎧**
