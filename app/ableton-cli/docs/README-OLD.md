# 🎵 Dark Atmospheric Techno - Complete Automated Workflow

**Automated production system for creating 4:20 dark atmospheric techno tracks in Ableton Live 12**

---

## 🚀 Quick Start (One Command)

```bash
./automate_workflow.sh
```

This single command will:
- ✅ Generate all MIDI patterns (23 files total)
- ✅ Verify VST3 plugins (TEKNO, OMNISPHERE)
- ✅ Create arrangement and automation guides
- ✅ Open Ableton Live 12 with your template
- ✅ Open all folders and documentation

**That's it!** Everything is automated.

---

## 📁 Project Structure

```
Ableton-Automation/
├── automate_workflow.sh           ⭐ ONE-CLICK AUTOMATION
├── launch-complete-420.sh         Manual launcher for 4:20 track
├── launch-dark-techno.sh          Manual launcher for session view
│
├── MIDI-Files/
│   ├── *.mid                      9 original techno patterns
│   ├── Dark-Atmospheric/
│   │   └── *.mid                  7 dark patterns (4-bar loops)
│   └── Complete-Track-420/
│       ├── *.mid                  7 arranged patterns (138 bars)
│       ├── ARRANGEMENT-GUIDE-420.md
│       └── AUTOMATION-GUIDE-420.md
│
├── Techno-Template-Output/
│   └── Manual-set Project/
│       └── Manual-set.als         Your Ableton template
│
└── Documentation/
    ├── DARK-ATMOSPHERIC-COMPLETE.md
    ├── INSTRUMENT-CHOICES.md
    ├── PROJECT-PROGRESS.md
    └── VISUAL-WORKFLOW.md
```

---

## 🎹 Two Production Workflows

### Option A: Session View (Live Jamming)

Use **Dark-Atmospheric** MIDI files (7 patterns, 4-bar loops):

1. Run `./automate_workflow.sh`
2. Drag patterns from `MIDI-Files/Dark-Atmospheric/` into Ableton
3. Load instruments:
   - TEKNO: Kick, Sub, Industrial Perc, Drone
   - OMNISPHERE: Dark Pad, Atmospheric Texture, Reversed Atmos
4. Trigger clips live, create variations
5. Perfect for: Live sets, improvisation, experimentation

### Option B: Arrangement View (Complete 4:20 Track)

Use **Complete-Track-420** MIDI files (7 patterns, 138 bars):

1. Run `./automate_workflow.sh`
2. Drag all 7 patterns from `MIDI-Files/Complete-Track-420/` into Ableton
3. Load same instruments (TEKNO + OMNISPHERE)
4. Follow `ARRANGEMENT-GUIDE-420.md` for structure:
   - Intro (bars 1-16)
   - Build-ups, drops, breakdowns
   - Climax (bars 73-84)
   - Outro/fade (bars 109-138)
5. Follow `AUTOMATION-GUIDE-420.md` for automation:
   - Filter sweeps, volume automation
   - Reverb/delay sends
   - Parameter modulation
6. Result: Professional 4:20 track ready to export

---

## 🎛️ Instrument Setup

### TEKNO Tracks (Bass/Drums)
| Track | MIDI File | Preset Recommendation |
|-------|-----------|----------------------|
| 10 | Deep Kick | Factory → Kicks → "Deep Kick" |
| 11 | Sub Rumble | Factory → Bass → "Sub Bass" |
| 14 | Industrial Perc | Factory → Percussion → "Metallic" |
| 15 | Drone Bass | Factory → Drones → "Dark Drone" |

### OMNISPHERE Tracks (Atmospheres)
| Track | MIDI File | Preset Recommendation |
|-------|-----------|----------------------|
| 12 | Dark Pad | Pads → "Dark Matter Pad" |
| 13 | Atmospheric Texture | Textures → "Ethereal Texture" |
| 16 | Reversed Atmos | FX → "Reverse Atmosphere" |

**Don't have these VSTs?** See `INSTRUMENT-CHOICES.md` for alternatives (Serum, Massive X, Analog Lab, etc.)

---

## 🔧 Manual Scripts (If Needed)

If you want to run steps individually:

### Generate MIDI Files
```bash
python3 generate_midi_files.py           # 9 original patterns
python3 create_dark_atmospheric_techno.py # 7 dark patterns
python3 create_complete_track_420.py      # 7 arranged patterns (4:20)
```

### Launchers
```bash
./launch-dark-techno.sh      # Dark atmospheric (session view)
./launch-complete-420.sh     # Complete 4:20 track
```

### Verify Plugins
```bash
python3 MIDI-Files/Dark-Atmospheric/check_plugins.py
```

---

## 📊 Track Specifications (4:20 Version)

- **Duration**: 4 minutes 20 seconds (exactly)
- **Tempo**: 128 BPM
- **Total Bars**: 138
- **Key**: A Minor
- **Time Signature**: 4/4
- **Style**: Dark Atmospheric Techno (Ben Klock, Dax J, I Hate Models)

### Arrangement Structure
```
Bars 1-16:    Intro (atmospheric build)
Bars 17-24:   Build-up 1
Bars 25-40:   Drop 1 (full groove)
Bars 41-48:   Breakdown 1 (ethereal)
Bars 49-64:   Drop 2 (peak energy)
Bars 65-72:   Breakdown 2 (darkest moment)
Bars 73-84:   Climax (maximum intensity)
Bars 85-138:  Outro/Fade (gradual release)
```

---

## 🎯 Mixing Levels Reference

| Element | Level | Pan | Notes |
|---------|-------|-----|-------|
| Deep Kick | -6dB | Center | Loudest element |
| Sub Rumble | -12dB | Center | Always mono |
| Drone Bass | -14dB | Center | Foundation |
| Industrial Perc | -15dB | L/R | Stereo width |
| Dark Pad | -18dB | Wide | 60% reverb send |
| Reversed Atmos | -20dB | Wide | Build-up tool |
| Atmos Texture | -24dB | Wide | Subtlest layer |

---

## 🎓 Documentation

All guides are automatically opened when you run `./automate_workflow.sh`:

1. **ARRANGEMENT-GUIDE-420.md** - Complete track structure, bar-by-bar breakdown
2. **AUTOMATION-GUIDE-420.md** - Detailed automation instructions (filters, volumes, sends)
3. **INSTRUMENT-CHOICES.md** - VST3 recommendations and alternatives
4. **DARK-ATMOSPHERIC-COMPLETE.md** - Quick reference guide
5. **PROJECT-PROGRESS.md** - Progress tracker and next steps

---

## 🔥 Production Tips

### Frequency Balance
- **Sub (20-60 Hz)**: Sub Rumble, Drone Bass
- **Bass (60-250 Hz)**: Deep Kick, TEKNO bass layers
- **Mids (250-2000 Hz)**: Industrial Perc, filtered elements
- **Highs (2000+ Hz)**: Atmospheric Texture, Reversed Atmos

### Mixing Philosophy
- Keep kick & sub **LOUD and CLEAR**
- Layer atmospheres **SUBTLY**
- Use reverb **HEAVILY** on Omnisphere pads
- Automate filters for **MOVEMENT**

### Reference Tracks
- Ben Klock - "Subzero"
- Dax J - "Escape The System"
- I Hate Models - "Warehouse Memories"
- Rebekah - "Fear Paralysis"

---

## 🛠️ Requirements

- **macOS** (tested on macOS)
- **Ableton Live 12** (Suite recommended)
- **Python 3** with `midiutil` library
- **VST3 Plugins** (recommended):
  - TEKNO (Production Master)
  - Omnisphere (Spectrasonics)
  - Alternatives listed in `INSTRUMENT-CHOICES.md`

### Install Python Dependencies
```bash
pip3 install midiutil
```

---

## 🚨 Troubleshooting

### "Template not found" error
- Make sure `Manual-set.als` exists in `Techno-Template-Output/Manual-set Project/`
- You must create this template manually in Ableton first

### "Ableton not found" error
- Install Ableton Live 12 Suite
- Default location: `/Applications/Ableton Live 12 Suite.app`

### Plugins not detected
- Install TEKNO and/or Omnisphere
- Check paths:
  - `/Library/Audio/Plug-Ins/VST3/Tekno.vst3`
  - `/Library/Audio/Plug-Ins/VST3/Omnisphere.vst3`
- Use alternatives from `INSTRUMENT-CHOICES.md`

### MIDI files sound wrong
- Verify tempo is 128 BPM in Ableton
- Check key is set to A Minor
- Ensure time signature is 4/4

---

## 📈 Project Stats

- **Total MIDI Files**: 23 (9 original + 7 dark + 7 arranged)
- **Total Notes Generated**: ~3000+ across all patterns
- **Documentation Pages**: 7 comprehensive guides
- **Automation Points**: 50+ documented automation targets
- **Track Duration Options**: 4-bar loops OR 4:20 complete track

---

## 🎸 Let's Create!

Run the automated workflow and start producing:

```bash
./automate_workflow.sh
```

Within seconds, Ableton opens with everything ready. Just load your instruments and start creating!

**🔥 Let's make a BANGER! 🔥**

---

## 📝 License

Creative Commons - Free for music production and personal use.

## 🙏 Credits

- MIDI Pattern Generation: Python + midiutil
- VST3 Integration: TEKNO (Production Master), Omnisphere (Spectrasonics)
- Style Reference: Ben Klock, Dax J, I Hate Models, Rebekah
- DAW: Ableton Live 12 Suite

---

**Created**: November 2025  
**Version**: 1.0  
**Track Duration**: 4:20 (exactly)
