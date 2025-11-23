# 🔥 Trap & Hip-Hop Production Studio 🔥

## Overview

A professional web-based production studio for creating trap and hip-hop beats with interactive tools for chord progressions, beat sequencing, and 808 bass design.

## 🚀 Quick Start

### Access the Studio

```bash
# If running locally
npm start

# Then navigate to:
http://localhost:3000/trap-studio.html
```

Or access directly from the `app/public/` directory.

## 🎹 Features

### 1. **Chord Progression Generator**

Generate professional trap and hip-hop chord progressions in any key with multiple preset patterns:

- **Dark Trap** (i-VI-III-VII) - Classic dark, menacing sound
- **Melodic Trap** (i-iv-VII-VI) - Emotional, melodic progressions
- **Drill** (i-III-VII-VI) - UK/NY Drill style
- **Cloud Rap** (vi-IV-I-V) - Dreamy, atmospheric
- **Boom-Bap** (i-VII-VI-V) - 90s hip-hop classic
- **Emotional** (i-v-VI-III) - Sad, introspective vibes

**Features:**
- 12 key options (C to B)
- Major and Minor modes
- Real-time chord display with note names
- MIDI note numbers for DAW integration
- Roman numeral analysis

### 2. **Trap Beat Sequencer**

16-step pattern sequencer with 4 instrument tracks:

**Instruments:**
- 🔊 **808 Bass** - Sub-bass foundation
- 🥁 **Kick** - Punch and impact
- 👏 **Snare** - Backbeat and rhythm
- 🎩 **Hi-Hat** - Energy and movement

**Controls:**
- BPM range: 60-200
- Real-time playback
- Visual step highlighting
- Pattern save/load

**Preset Patterns:**
- **Classic Trap** (140 BPM)
- **Drill** (145 BPM)
- **Boom-Bap** (90 BPM)
- **Phonk** (130 BPM)

### 3. **808 Bass Designer**

Advanced 808 sub-bass synthesis tool with visual waveform display:

**Parameters:**
- **Frequency**: 30-100 Hz (fundamental pitch)
- **Decay**: 0.1-2.0s (tail length)
- **Filter Cutoff**: 80-500 Hz (brightness)
- **Resonance**: 0-1 (filter emphasis)
- **Distortion**: 0-100% (harmonic saturation)
- **Pitch Glide**: 0-200ms (portamento)

**Features:**
- Real-time waveform visualization
- Live preview playback
- Randomize function for inspiration
- Export settings as Synth2600 CLI commands
- Download settings as text file

### 4. **Quick Reference Guide**

Built-in reference materials:

**BPM Ranges by Genre:**
- Boom-Bap: 85-95 BPM
- Modern Trap: 130-150 BPM
- Drill: 140-150 BPM
- Cloud Rap: 60-80 BPM
- Phonk: 120-140 BPM
- Wave: 110-130 BPM

**Popular Trap Scales:**
- A Minor Pentatonic
- E Minor Pentatonic
- F# Minor Pentatonic
- C Minor Pentatonic

**Frequency Chart:**
- Sub-Bass (808): 20-80 Hz
- Kick Punch: 50-120 Hz
- Snare Body: 200-400 Hz
- Snare Crack: 2-5 kHz
- Hi-Hats: 8-15 kHz
- Melody/Bells: 1-5 kHz
- Pads: 200-800 Hz

## 🎨 Design Features

### Dark Trap Theme
- High-contrast dark mode optimized for studio environments
- Gradient accents in trap pink, cyan, and gold
- Animated background with pulsing effects
- Glowing elements for visual feedback

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive grid layouts
- Works on phones, tablets, and desktops

### Accessibility
- Clear visual feedback
- Hover tooltips
- Color-coded instrument tracks
- High-contrast text

## 🔧 Technical Implementation

### Web Audio API
- Real-time synthesis using Web Audio API
- Oscillators for kick, snare, hi-hat, and 808 simulation
- Envelope generators for realistic decay
- Filter processing for tonal shaping

### Canvas Visualization
- Real-time waveform rendering
- Visual representation of 808 parameters
- Animated decay visualization

### Interactive Grid
- Click/touch to toggle steps
- Visual step highlighting during playback
- Color-coded active steps

## 📊 Workflow Examples

### Example 1: Create a Dark Trap Beat

```
1. Set BPM to 140
2. Generate chord progression:
   - Key: A Minor
   - Type: Dark Trap
3. Load "Classic Trap" beat pattern
4. Design 808:
   - Frequency: 55 Hz
   - Decay: 0.8s
   - Cutoff: 180 Hz
5. Export all settings
```

### Example 2: Drill Pattern

```
1. Set BPM to 145
2. Load "Drill" preset pattern
3. Add rolling hi-hats (steps 1-16 all active)
4. Generate chord progression:
   - Key: F# Minor
   - Type: Drill
5. Design aggressive 808 with shorter decay
```

### Example 3: Boom-Bap Beat

```
1. Set BPM to 90
2. Load "Boom-Bap" preset
3. Sparse hi-hat pattern (2, 6, 10, 14)
4. Generate progression:
   - Key: C Minor
   - Type: Boom-Bap
5. Use warmer 808 (higher cutoff ~300 Hz)
```

## 🎯 Integration with Synth2600 CLI

All generated settings can be exported as CLI commands:

### Chord Progression Export
```bash
# Example output includes:
- Chord names and notes
- MIDI note numbers
- Roman numeral analysis
- Scale degrees
```

### 808 Settings Export
```bash
python3 synth2600_cli.py preset --load 808_custom
python3 synth2600_cli.py params set "vco1.frequency=55"
python3 synth2600_cli.py params set "env.decay=0.8"
python3 synth2600_cli.py params set "vcf.cutoff=180"
python3 synth2600_cli.py params set "vcf.resonance=0.4"
```

### Beat Pattern Export
```bash
# Pattern data can be used with sequencer
python3 synth2600_cli.py sequencer --pattern custom
python3 synth2600_cli.py export --midi trap_beat.mid
```

## 🎓 Production Tips

### Chord Progressions
1. **Start Simple**: Use 4-chord progressions
2. **Key Selection**: Minor keys for dark trap, Major for melodic
3. **Emotional Impact**: Cloud Rap progressions for sad vibes
4. **Variation**: Change last chord for different sections

### Beat Programming
1. **808 Placement**: Usually on beats 1 and 3
2. **Snare**: Classic backbeat on 2 and 4
3. **Hi-Hats**: 8th notes for groove, 16ths for energy
4. **Syncopation**: Add ghost notes for human feel

### 808 Design
1. **Sub Range**: Keep 30-60 Hz for deep bass
2. **Decay Time**: 0.5-1.0s for typical trap
3. **Filter**: Lower cutoff = darker, tighter sound
4. **Distortion**: Add 10-30% for harmonics and presence

### Mixing
1. **Sub-Bass**: Keep mono below 150 Hz
2. **EQ**: High-pass everything except 808 and kick
3. **Sidechain**: Duck other elements when 808/kick hits
4. **Headroom**: Leave -6dB for mastering

## 🌐 Browser Compatibility

**Supported Browsers:**
- ✅ Chrome/Edge (Chromium) 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 13+)
- ✅ Chrome Mobile (Android 8+)

**Required Features:**
- Web Audio API
- Canvas 2D
- ES6 JavaScript
- CSS Grid

## 📱 Mobile Usage

### Recommended Settings
- Use landscape mode for better grid visibility
- Increase touch target sizes if needed
- Enable "Reduce Motion" in OS for better performance

### Touch Gestures
- **Tap**: Toggle beat steps
- **Tap & Hold**: (Future: adjust velocity)
- **Swipe**: (Future: pattern navigation)

## 🔮 Future Enhancements

### Planned Features
- [ ] Audio sample upload
- [ ] Pattern save/load to localStorage
- [ ] MIDI export (.mid file download)
- [ ] Velocity per step
- [ ] More instruments (claps, percs, FX)
- [ ] Undo/Redo functionality
- [ ] Project save/load
- [ ] Share patterns via URL
- [ ] Collaboration mode
- [ ] VST integration
- [ ] Sample library
- [ ] Recording to WAV/MP3

### Advanced Tools
- [ ] Sidechain visualizer
- [ ] Spectrum analyzer
- [ ] Multi-track mixing
- [ ] Effects (reverb, delay, compression)
- [ ] Automation lanes
- [ ] MIDI keyboard input

## 🐛 Known Limitations

1. **Audio Playback**: Simplified synthesis (not full quality)
2. **Mobile Safari**: May require user gesture to start audio
3. **Pattern Length**: Fixed at 16 steps
4. **Instruments**: Limited to 4 tracks
5. **No Persistence**: Patterns not saved between sessions (yet)

## 📚 Related Documentation

- [SYNTH2600_CLI_GUIDE.md](./ableton-cli/SYNTH2600_CLI_GUIDE.md) - Full CLI documentation
- [Hip-Hop/Trap Production Methodology](./ableton-cli/SYNTH2600_CLI_GUIDE.md#-hip-hop--trap-production-methodology-) - Complete production guide
- [PWA Guide](../QUICKSTART_WEB.md) - Web app installation

## 🤝 Contributing

Want to add features or improve the studio?

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Same license as the main project.

---

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔥 "The beat is the canvas, the rapper is the paint" 🔥   ║
║                                    - Metro Boomin            ║
║                                                              ║
║   Now go create something legendary! 🎵                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```
