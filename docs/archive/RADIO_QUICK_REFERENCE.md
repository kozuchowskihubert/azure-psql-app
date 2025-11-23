# 📻 Radio 24/7 - Quick Reference

**One-Page Guide** | [Full Documentation](./docs/RADIO_24_7_GUIDE.md) | [Implementation Details](./RADIO_IMPLEMENTATION_SUMMARY.md)

---

## 🚀 Quick Start

### Access Radio
1. Navigate to: `/radio.html`
2. Or click: **Music** → **📻 Radio 24/7**

### Setup in 30 Seconds
```
1. Choose channel: 🎵 Techno or 🎤 Rap
2. Drag audio files to upload area
3. Click ▶️ Play
4. Enjoy 24/7 streaming!
```

---

## 🎛️ Controls

| Control | Action |
|---------|--------|
| **▶️ Play/⏸️ Pause** | Toggle playback |
| **⏮️ Previous** | Jump to previous track |
| **⏭️ Next** | Skip to next track |
| **🔀 Shuffle** | Random track order |
| **🔁 Repeat** | Loop queue |
| **🔊 Volume** | Adjust 0-100% |
| **Progress Bar** | Click to seek |

---

## 📋 Queue Management

### Add Tracks
- **Drag & Drop**: Drag files to gray upload box
- **Browse**: Click upload box to select files

### Organize Queue
- **Reorder**: Drag tracks up/down
- **Remove**: Click 🗑️ button
- **Play Specific**: Click ▶️ on any track

---

## 🎵 Channels

### Techno Radio 🎵
- **Theme**: Green industrial
- **Genres**: Techno, house, trance, electronic
- **Visualizer**: Green gradient bars

### Rap Radio 🎤
- **Theme**: Pink/magenta urban
- **Genres**: Hip-hop, trap, rap, R&B
- **Visualizer**: Pink/purple gradient bars

**Note**: Each channel has independent queue

---

## 📊 Features

✅ File Upload (MP3, WAV, OGG, M4A)  
✅ Queue Management (drag-and-drop)  
✅ Playback Controls (play, skip, shuffle, repeat)  
✅ Real-time Visualizer (FFT, 60 FPS)  
✅ Volume Control (slider + percentage)  
✅ Progress Tracking (seek + time display)  
✅ Auto-advance (continuous playback)  
✅ Statistics (tracks, duration, listeners)  
✅ localStorage Persistence (metadata)  
✅ **Studio Integration** (Trap Studio → Rap Radio)  
✅ **Studio Integration** (Techno Creator → Techno Radio)  
✅ **One-Click Export** (create beats, send instantly)

---

## 🎵 Studio Integration

### Create & Send Beats Instantly!

**From Trap Studio:**
1. Create beat with chords + drums
2. Click **📻 Send to Radio**
3. Beat recorded (8 bars)
4. Auto-added to **Rap Radio**
5. Start playing! 🔥

**From Techno Creator:**
1. Create track with sequence + pattern
2. Click **📻 Send to Radio**
3. Track recorded (8 bars)
4. Auto-added to **Techno Radio**
5. Start playing! ⚡

**Benefits:**
- No file export needed
- No manual upload
- Instant playback
- Perfect for live sessions

[Full Integration Guide →](./docs/STUDIO_RADIO_INTEGRATION.md)

---

## 🔧 Troubleshooting

### "No track playing"
**Fix**: Upload audio files via drag-and-drop

### "Error playing track"
**Fix**: Use MP3 format for best compatibility

### Visualizer not working
**Fix**: Click play button (requires user interaction)

### Queue not persisting
**Fix**: Enable cookies/storage in browser settings

---

## 📱 Supported Formats

| Format | Support | Quality |
|--------|---------|---------|
| **MP3** | ✅ Best | Good |
| **WAV** | ✅ Great | Excellent |
| **OGG** | ✅ Good | Excellent |
| **M4A** | ✅ Partial | Excellent |

---

## 🌐 Browser Support

- ✅ Chrome 50+
- ✅ Firefox 50+
- ✅ Edge 79+
- ✅ Safari 14+
- ✅ Opera 37+

---

## 🎯 Use Cases

- **DJ Practice**: Build mixes, test transitions
- **Background Music**: 24/7 continuous playback
- **Music Discovery**: Organize new tracks by genre
- **Remote Sessions**: Share screen for live DJ sets

---

## 📚 Documentation

- **User Guide**: [RADIO_24_7_GUIDE.md](./docs/RADIO_24_7_GUIDE.md) (650 lines)
- **Implementation**: [RADIO_IMPLEMENTATION_SUMMARY.md](./RADIO_IMPLEMENTATION_SUMMARY.md) (750 lines)
- **Related Docs**:
  - [Trap Studio Guide](./docs/TRAP_STUDIO_GUIDE.md)
  - [Techno Creator Guide](./docs/TECHNO_CREATOR_GUIDE.md)
  - [Advanced Synthesis](./docs/ADVANCED_SYNTHESIS_GUIDE.md)

---

## 🔮 Future Features

**v1.1** (Next)
- [ ] Server-side file storage
- [ ] Persistent uploads
- [ ] Track metadata editor

**v1.2** (Soon)
- [ ] Crossfade between tracks
- [ ] EQ controls (bass, mid, treble)
- [ ] Volume normalization

**v2.0** (Future)
- [ ] Multi-user support
- [ ] Live chat
- [ ] Collaborative playlists

---

## 📊 Stats

- **Code**: 910 lines (radio.html)
- **Documentation**: 1,400+ lines
- **Total**: 2,300+ lines
- **Commits**: 2 (44397d8, 7b5933c)
- **Files**: 3 created, 1 modified

---

## 🎨 Technical Stack

**Frontend**
- HTML5 (structure)
- CSS3 (responsive design)
- JavaScript ES6+ (logic)

**APIs**
- Web Audio API (playback)
- File API (upload)
- Canvas API (visualizer)
- Drag & Drop API (queue)
- localStorage API (persistence)

**Architecture**
```
Audio File → Blob URL → Web Audio API
                ↓
          AnalyserNode (FFT)
                ↓
        Canvas Visualizer
```

---

## 🚀 Deployment

**Already Live!** 🎉
```bash
# Access at:
http://localhost:3000/radio.html

# Or deployed:
https://your-domain.com/radio.html
```

**No server changes needed** - static files automatically served

---

## 📞 Support

### Issues?
1. Check browser console (F12)
2. Read [troubleshooting guide](./docs/RADIO_24_7_GUIDE.md#troubleshooting)
3. Try different browser

### Feature Requests?
- Server storage
- Multi-user support
- Cloud sync
- Third-party streaming

---

## 🏆 Credits

**Part of Music Generator Suite**
- Trap Studio 🔥
- Techno Creator ⚡
- Radio 24/7 📻
- 2600 Synth Studio 🎛️

---

**Radio 24/7** - *Your Music, Your Way, 24/7* 📻

*Version 1.0.0 | January 2025*
