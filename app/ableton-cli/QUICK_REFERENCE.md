# Behringer 2600 CLI Pro - Quick Reference Card

## 🚀 Quick Start

```bash
# Install & Run
pip install -r requirements_pro.txt
python synth2600_cli_pro.py

# Or use Enhanced CLI  
python synth2600_cli_enhanced.py
```

---

## 📋 Essential Commands

### Patch Management
```bash
patch <src_mod>/<out> <dst_mod>/<in> [color] [notes]
remove <index|id>
clear
list
viz matrix          # NEW: Visual patch matrix
```

### Modules
```bash
vco1 <freq> [waveform]
vco2 <freq> [waveform]
filter <cutoff> [resonance] [type]
envelope <A> <D> <S> <R>
viz envelope        # NEW: Show ADSR curve
viz filter          # NEW: Show frequency response
```

### Sequencer
```bash
seq edit <step> <pitch> <velocity>
seq play
seq stop
seq pattern <name>
viz sequencer       # NEW: Visual step grid
```

### Presets
```bash
preset load <name>
preset save <name> [category] [description]
preset list [category]
preset search <query>
preset stats
```

---

## ⭐ Pro CLI Exclusive

### Session Management
```bash
session save <name>      # Save current work
session load <name>      # Load saved session
session list             # Show all sessions
session recover          # Recover after crash
session auto [on|off]    # Toggle auto-save (every 5 min)
```

### Undo/Redo
```bash
undo [n]                 # Undo last n actions
redo [n]                 # Redo last n actions
history states           # Show state history
```

### Favorites
```bash
fav add <preset>         # Add to favorites
fav remove <preset>      # Remove from favorites
fav list                 # Show favorites
fav load <name>          # Quick load
```

### Configuration
```bash
config set auto_save true
config set save_interval 300
config set show_hints true
config list              # Show all settings
```

### History
```bash
history                  # Show recent commands
history search <query>   # Search history
history clear            # Clear history
```

### Batch Operations
```bash
batch record start       # Start recording
batch record stop <file> # Save batch
batch replay <file>      # Replay commands
```

### Visualizations
```bash
viz matrix               # Patch connection matrix
viz sequencer            # 16-step grid
viz envelope [eg1|eg2]   # ADSR curve
viz filter               # Frequency response
viz all                  # Show everything
```

---

## ⌨️ Keyboard Shortcuts

```
↑/↓       Navigate command history
Tab       Auto-complete
Ctrl+C    Cancel input
Ctrl+D    Exit CLI
Ctrl+R    Reverse search
Ctrl+L    Clear screen
Ctrl+U    Clear line
```

---

## 🎨 Configuration Options

```json
{
  "theme": "dark",
  "auto_save": true,
  "save_interval": 300,
  "show_hints": true,
  "compact_mode": false,
  "history_size": 1000,
  "auto_backup": true
}
```

---

## 📊 Visualization Examples

### Patch Matrix
```
╔══════════════════════════════════╗
║       PATCH MATRIX               ║
╠══════════════════════════════════╣
║     VCO1 VCO2 VCF  VCA  EG1     ║
║  ---------------------------     ║
║  VCO1  ·    ·   [R]  ·    ·     ║
║  VCO2  ·    ·   [B]  ·    ·     ║
║  VCF   ·    ·    ·  [R]   ·     ║
║  EG1   ·    ·   [G] [G]   ·     ║
╚══════════════════════════════════╝
```

### Sequencer Grid
```
╔════════════════════════════════════╗
║      16-STEP SEQUENCER             ║
╠════════════════════════════════════╣
║ Step: █ 1  2  3  4  5  6  7  8 ...║
║ Note:  C3 D3 E3 F3 G3 A3 B3 C4 ...║
║ Vel:   ███ ███ ██ ███ ██ ███ ... ║
║ Gate:  ▓▓▓ ▓▓▓ ··· ▓▓▓ ▓▓▓ ▓▓▓ ...║
╚════════════════════════════════════╝
```

---

## 💡 Quick Workflows

### Create Bass Patch
```bash
batch replay bass_template.batch
filter 800 0.7
viz matrix
preset save "My Bass" bass
fav add "My Bass"
```

### Sequence Export
```bash
fav load "Acid Lead"
seq pattern bassline
seq edit 1 60 100
viz sequencer
export midi track.mid 8
session save acid_project
```

### Sound Design
```bash
preset load "Init"
patch VCO1/saw VCF/in
filter 1000 0.5
viz envelope
# Try settings...
undo  # If not good
filter 1200 0.7
preset save "New Sound"
```

---

## 🚨 Error Recovery

```bash
# Auto-recovery on startup
synth2600> session recover
✓ Recovered session from crash

# Manual undo
synth2600> undo 3
✓ Undone 3 actions

# Check state history
synth2600> history states
```

---

## 📁 File Locations

```
~/.synth2600/
├── config.json          # User config
├── .history             # Command history
├── last_session.json    # Auto-save
├── favorites.json       # Favorites
└── sessions/            # Saved sessions
```

---

## 🎯 Pro vs Enhanced

| Feature | Enhanced | Pro |
|---------|----------|-----|
| Patch Management | ✅ | ✅ |
| Rich Output | ✅ | ✅ |
| MIDI Export | ✅ | ✅ Enhanced |
| **History** | ❌ | ✅ 1000 entries |
| **Undo/Redo** | ❌ | ✅ 50 levels |
| **Sessions** | ❌ | ✅ Full |
| **Visualizations** | ❌ | ✅ 4 types |
| **Favorites** | ❌ | ✅ Yes |
| **Batch** | ❌ | ✅ Yes |
| **Config** | ❌ | ✅ Full |

---

## 🎓 Tips

1. **Enable auto-save**: `config set auto_save true`
2. **Use visualizations**: Understand patches faster
3. **Create batches**: Automate repetitive tasks
4. **Add favorites**: Quick access to go-to sounds
5. **Search history**: Find that perfect command
6. **Undo fearlessly**: Experiment without worry

---

## 📚 Help Commands

```bash
help                     # General help
help <command>           # Command-specific help
viz --help               # Visualization help
session --help           # Session management help
```

---

## 🔗 Documentation

- **Full Guide**: `CLI_PRO_README.md`
- **Comparison**: `CLI_COMPARISON.md`  
- **Improvements**: `CLI_IMPROVEMENTS.md`
- **Enhanced Guide**: `CLI_ENHANCED_GUIDE.md`

---

## 🎹 Example Session

```bash
$ python synth2600_cli_pro.py

╔══════════════════════════════════════════════════╗
║  Behringer 2600 CLI - Professional v3.0         ║
╚══════════════════════════════════════════════════╝

💡 Tip: Type 'help' for commands

synth2600> config set auto_save true
✓ Auto-save enabled (every 5 minutes)

synth2600> fav load "Deep Bass"
✓ Loaded favorite: Deep Bass

synth2600> viz matrix
╔══════════════════════════════════╗
║       PATCH MATRIX               ║
[... visualization ...]
╚══════════════════════════════════╝

synth2600> filter 900 0.8
✓ Filter updated

synth2600> viz filter
[... frequency response graph ...]

synth2600> preset save "Deep Bass Bright"
✓ Saved preset

synth2600> session save today_session
✓ Session saved

synth2600> exit
👋 Goodbye! Session auto-saved.
```

---

**Print this card and keep it handy! 🎵**
