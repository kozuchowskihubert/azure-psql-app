# 📻 Radio 24/7 - User Guide

**Continuous Music Streaming Platform**  
*Techno & Rap Channels with Queue Management*

---

## 🎯 Overview

Radio 24/7 is a browser-based music streaming platform that provides continuous playback of your own music collection. Similar to Discord music bots, it features dual channels (Techno & Rap), queue management, and 24/7 operation.

### Key Features

- **🎵 Dual Channels**: Separate Techno and Rap radio stations
- **📤 File Upload**: Drag-and-drop audio files (MP3, WAV, OGG, M4A)
- **📋 Queue Management**: Add, remove, reorder tracks
- **🎛️ Full Playback Controls**: Play, pause, skip, shuffle, repeat
- **📊 Real-time Visualizer**: FFT-based audio visualization
- **🔊 Volume Control**: Adjustable volume with mute
- **⏱️ Progress Tracking**: Visual progress bar with seeking
- **💾 Persistence**: Queue saved to localStorage

---

## 🚀 Quick Start

### Accessing Radio 24/7

1. Navigate to the main app homepage
2. Click **Music** in the navigation bar
3. Select **📻 Radio 24/7** from the dropdown

**Direct URL**: `http://localhost:3000/radio.html` (or your deployed URL)

### First-Time Setup

1. **Select a Channel**
   - Click **🎵 TECHNO RADIO** or **🎤 RAP RADIO**

2. **Upload Tracks**
   - Drag and drop audio files onto the upload area
   - Or click the upload area to browse files
   - Supported formats: MP3, WAV, OGG, M4A

3. **Start Playing**
   - Click **▶️ Play** to start streaming
   - Tracks will play continuously with auto-advance

---

## 🎧 Player Controls

### Main Controls

| Button | Function | Description |
|--------|----------|-------------|
| **⏮️ Previous** | Previous track | Jump to previous track in queue |
| **▶️ Play / ⏸️ Pause** | Toggle playback | Start or pause current track |
| **⏭️ Next** | Next track | Skip to next track |
| **🔀 Shuffle** | Shuffle mode | Play tracks in random order |
| **🔁 Repeat** | Repeat mode | Loop queue when finished |

### Volume Control

- **Slider**: Adjust volume from 0% to 100%
- **Icons**: Click 🔈 (mute) or 🔊 (max) for quick adjustments
- **Current Level**: Displayed as percentage

### Progress Bar

- **Visual Indicator**: Shows current playback position
- **Time Display**: `Current Time / Total Duration`
- **Seeking**: Click anywhere on the bar to jump to that position

---

## 📋 Queue Management

### Adding Tracks

**Method 1: Drag & Drop**
```
1. Drag audio files from your file manager
2. Drop them onto the upload area
3. Tracks are automatically added to current channel's queue
```

**Method 2: File Browser**
```
1. Click the upload area
2. Select one or multiple files
3. Click "Open"
```

### Organizing Queue

**Reorder Tracks**
- Drag any track to a new position
- Drop to reorder
- Current playing track adjusts automatically

**Remove Tracks**
- Click 🗑️ button on any track
- Track is immediately removed
- If playing, auto-advances to next track

**Play Specific Track**
- Click ▶️ button on any track
- Playback jumps to that track
- Queue order preserved

### Queue Display

Each track shows:
- **Position Number**: 1, 2, 3...
- **Track Title**: Filename without extension
- **Artist**: Auto-assigned (Techno Artist / Rap Artist)
- **Duration**: Track length in MM:SS format
- **Status**: Currently playing tracks highlighted

---

## 🎵 Channel Management

### Techno Radio 🎵

**Theme**: Industrial green with terminal aesthetics  
**Target**: Electronic, techno, house, trance  
**Auto-Artist**: "Techno Artist"  
**Visualization**: Green gradient bars

### Rap Radio 🎤

**Theme**: Urban pink/magenta gradient  
**Target**: Hip-hop, trap, rap, R&B  
**Auto-Artist**: "Rap Artist"  
**Visualization**: Pink/purple gradient bars

### Switching Channels

1. Click channel button (top of page)
2. Playback stops on previous channel
3. New channel's queue loads
4. Auto-play starts if queue has tracks

**Note**: Each channel maintains separate queue

---

## 📊 Statistics Bar

Real-time stats displayed at top:

| Stat | Description |
|------|-------------|
| **Total Tracks** | Combined tracks across both channels |
| **In Queue** | Tracks in current channel |
| **Total Duration** | Combined length of current queue |
| **Listeners** | Currently 1 (you) - expandable in future |

---

## 🎨 Audio Visualizer

### Features

- **Real-time FFT Analysis**: 256-bin frequency analysis
- **Responsive Bars**: Visual representation of audio spectrum
- **Channel-Themed Colors**:
  - Techno: Green gradient
  - Rap: Pink/purple gradient
- **Smooth Animation**: 60 FPS canvas rendering

### How It Works

The visualizer uses the Web Audio API's `AnalyserNode` to perform Fast Fourier Transform (FFT) on the audio signal, converting it to frequency domain data displayed as animated bars.

---

## 💾 Data Persistence

### What's Saved

**localStorage** (Browser Storage):
- Queue metadata (track titles, artists, durations)
- Separated by channel (technoQueue, rapQueue)
- Persists across page refreshes

### What's NOT Saved

**Object URLs** (Security Limitation):
- Actual audio file data cannot be stored in localStorage
- Files must be re-uploaded after browser restart
- Future enhancement: Server-side storage

### Clearing Data

```javascript
// Open browser console (F12) and run:
localStorage.removeItem('technoQueue');
localStorage.removeItem('rapQueue');
```

---

## 🔧 Technical Details

### Browser Compatibility

**Minimum Requirements**:
- Chrome 50+ / Edge 79+
- Firefox 50+
- Safari 14+ (iOS 14+)
- Opera 37+

**Required APIs**:
- Web Audio API
- File API
- localStorage
- Canvas 2D Context

### Audio Format Support

| Format | Support | Quality | Notes |
|--------|---------|---------|-------|
| **MP3** | ✅ Universal | Good | Best compatibility |
| **WAV** | ✅ High | Excellent | Large file size |
| **OGG** | ✅ Modern | Excellent | Chrome, Firefox, Edge |
| **M4A/AAC** | ✅ Partial | Excellent | Not all browsers |
| **FLAC** | ⚠️ Limited | Lossless | Chrome, Edge only |

### Performance

**Optimal Queue Size**: 50-100 tracks  
**Max Recommended**: 200 tracks (memory constraints)  
**Visualizer**: ~60 FPS on modern hardware  
**Latency**: < 50ms for control actions

---

## 🎮 Keyboard Shortcuts

*(Future Enhancement)*

Planned shortcuts:
- `Space`: Play/Pause
- `→`: Next track
- `←`: Previous track
- `↑/↓`: Volume up/down
- `S`: Toggle shuffle
- `R`: Toggle repeat

---

## 🚨 Troubleshooting

### "No track playing"

**Cause**: Empty queue or no files uploaded  
**Solution**: Upload audio files via drag-and-drop

### "Error playing track"

**Causes**:
- Unsupported format
- Corrupted file
- Browser codec issue

**Solutions**:
1. Try different audio format (prefer MP3)
2. Re-encode file with standard codec
3. Try different browser

### Visualizer not working

**Causes**:
- AudioContext not initialized
- Autoplay policy blocking

**Solutions**:
1. Click play button (user interaction required)
2. Check browser console for errors
3. Allow audio autoplay in browser settings

### Queue not persisting

**Cause**: localStorage disabled or full  
**Solutions**:
1. Check browser privacy settings
2. Clear localStorage to free space
3. Enable cookies/storage for site

### Drag-and-drop not working

**Causes**:
- Files dropped outside upload area
- Browser drag-and-drop disabled

**Solutions**:
1. Drop directly on gray dashed box
2. Use file browser instead
3. Try different browser

---

## 🔐 Privacy & Security

### Data Storage

- **Local Only**: All files processed in browser
- **No Server Upload**: Files stored as blob URLs
- **No Tracking**: No analytics or cookies
- **Private Playback**: Your music stays on your device

### Permissions

**Required**:
- None (fully client-side)

**Optional**:
- Storage: For queue persistence
- Media autoplay: For continuous playback

---

## 🚀 Advanced Features

### Custom Playlists (Manual)

Create themed queues:

1. **Create Playlist**:
   - Switch to channel (e.g., Techno)
   - Upload all tracks for that theme
   - Reorder as desired

2. **Export Queue** (Advanced):
   ```javascript
   // Browser console
   const queue = JSON.parse(localStorage.getItem('technoQueue'));
   console.log(queue);
   // Save output for later reference
   ```

### Crossfade (Future)

Planned feature:
- Smooth transitions between tracks
- Configurable crossfade duration (1-10 seconds)
- Volume automation

### EQ Controls (Future)

Planned feature:
- Bass: -12dB to +12dB
- Mid: -12dB to +12dB  
- Treble: -12dB to +12dB
- Presets: Flat, Bass Boost, Vocal, etc.

---

## 🎯 Use Cases

### DJ Practice

- Build mixes with multiple tracks
- Practice transitions
- Test track ordering

### Background Music

- Create themed playlists
- Enable repeat for 24/7 playback
- Set volume and forget

### Music Discovery

- Organize new tracks by genre
- A/B test different versions
- Build setlists for events

### Remote Radio

- Upload tracks once
- Share browser tab via screen share
- Live DJ sessions with friends

---

## 📱 Mobile Support

### Touch Controls

- **Tap**: All button interactions
- **Swipe**: Scroll queue list
- **Long Press**: Future context menu

### Responsive Design

- **Portrait**: Stacked layout
- **Landscape**: Side-by-side panels
- **Small Screens**: Simplified controls

### Performance

- Optimized for mobile browsers
- Reduced visualizer complexity on low-end devices
- Touch-friendly button sizes (48px minimum)

---

## 🔗 Integration

### Adding Tracks from Other Pages

Future API endpoint:
```javascript
// From Trap Studio or Techno Creator
window.postMessage({
  type: 'ADD_TO_RADIO',
  channel: 'techno',
  track: {
    title: 'My Track',
    artist: 'Me',
    url: blob_url
  }
}, '*');
```

### Embedding

```html
<!-- Embed radio in another page -->
<iframe 
  src="/radio.html" 
  width="100%" 
  height="800px"
  allow="autoplay; microphone">
</iframe>
```

---

## 🆘 Support

### Getting Help

1. **Check Console**: Press F12, look for errors
2. **Clear Cache**: Ctrl+Shift+R to hard refresh
3. **Try Incognito**: Rule out extension conflicts
4. **Check Format**: Ensure file is valid audio

### Feature Requests

Want a new feature? Suggestions:
- Discord-style voice chat
- Server-side storage
- Collaborative playlists
- Cloud sync

### Known Limitations

- **No persistence**: Files cleared on browser restart
- **Local only**: No streaming from URLs
- **Single user**: No multi-listener support (yet)
- **No lyrics**: No synchronized lyrics display

---

## 📊 Comparison

### vs. Discord Music Bots

| Feature | Radio 24/7 | Discord Bots |
|---------|------------|--------------|
| **Platform** | Web browser | Discord app |
| **Files** | Local upload | YouTube/Spotify |
| **Cost** | Free (no API keys) | Free with limits |
| **Privacy** | 100% local | Streams from services |
| **Persistence** | Limited (localStorage) | None (stops on disconnect) |
| **Multi-user** | No (planned) | Yes |
| **Quality** | Original files | Compressed streams |

### vs. Spotify/Apple Music

| Feature | Radio 24/7 | Streaming Services |
|---------|------------|---------------------|
| **Library** | Your files | Millions of tracks |
| **Cost** | Free | $10-15/month |
| **Offline** | Yes (browser cache) | Requires app |
| **Ownership** | You own files | Rental library |
| **Customization** | Full control | Limited playlists |
| **Quality** | Depends on files | 256-320 kbps |

---

## 🎨 Customization

### Changing Theme Colors

Edit `radio.html` CSS variables:

```css
:root {
    --accent-techno: #00ff00; /* Change techno color */
    --accent-rap: #ff00ff;    /* Change rap color */
    --bg-primary: #0a0a0a;    /* Background */
    /* ... more variables ... */
}
```

### Adding Third Channel

Extend the code:

```javascript
// In radio.html
let houseQueue = [];

function switchChannel(channel) {
    if (channel === 'house') {
        // Add house radio logic
    }
    // ... rest of code
}
```

---

## 📈 Performance Tips

### Optimize for Large Queues

1. **Limit Queue Size**: Keep under 100 tracks
2. **Use MP3**: Smaller than WAV/FLAC
3. **Lower Bitrate**: 192-256 kbps sufficient
4. **Close Other Tabs**: Free up memory
5. **Disable Visualizer**: Comment out draw loop if laggy

### Reduce Memory Usage

```javascript
// Remove tracks when done
queue.forEach(track => {
    if (track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
    }
});
```

---

## 🔮 Future Roadmap

### Planned Features

**v1.1 (Next)**
- [ ] Server-side file storage (Express routes)
- [ ] Persistent uploads (survive browser restart)
- [ ] Track metadata editor (edit titles, artists)

**v1.2 (Soon)**
- [ ] Crossfade between tracks
- [ ] EQ controls (bass, mid, treble)
- [ ] Volume normalization

**v1.3 (Later)**
- [ ] Keyboard shortcuts
- [ ] Playlist import/export
- [ ] Waveform display (replace visualizer)

**v2.0 (Future)**
- [ ] Multi-user support (Socket.IO)
- [ ] Chat integration
- [ ] Voting system for next track
- [ ] Cloud sync (Azure Blob Storage)

---

## 🎓 Tutorial: Building Your First Radio Station

### Step-by-Step Guide

**1. Organize Your Music**
```
Create folders on your computer:
/Music
  /Techno
    - track1.mp3
    - track2.mp3
  /Rap
    - song1.mp3
    - song2.mp3
```

**2. Open Radio 24/7**
- Navigate to `/radio.html`
- Choose Techno channel

**3. Upload Techno Tracks**
- Drag `/Music/Techno` folder to upload area
- All files added to queue

**4. Customize Queue**
- Drag tracks to reorder
- Remove duplicates or unwanted tracks
- Click play on your favorite track

**5. Switch to Rap**
- Click **🎤 RAP RADIO** button
- Upload `/Music/Rap` folder
- Build second playlist

**6. Configure Playback**
- Enable **Shuffle** for variety
- Enable **Repeat** for 24/7 playback
- Adjust volume to 70%

**7. Let It Play!**
- Minimize browser (keeps playing)
- Radio continues automatically
- Switch channels anytime

---

## 🧪 Testing Checklist

Before reporting issues:

- [ ] Tested in Chrome/Edge
- [ ] Tested in Firefox
- [ ] Tried incognito mode
- [ ] Checked browser console
- [ ] Tested different audio formats
- [ ] Verified localStorage enabled
- [ ] Tested with small queue (5 tracks)
- [ ] Tested with large queue (50+ tracks)
- [ ] Checked on mobile device
- [ ] Tested all playback controls

---

## 📚 Resources

### Related Documentation

- [Trap Studio Guide](./TRAP_STUDIO_GUIDE.md)
- [Techno Creator Guide](./TECHNO_CREATOR_GUIDE.md)
- [Advanced Synthesis Guide](./ADVANCED_SYNTHESIS_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)

### External Links

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [File API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [localStorage Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 📝 License

Part of the Music Generator Suite  
See main project README for license information

---

**Radio 24/7** - *Your Music, Your Way, 24/7* 📻🎵

*Created by the Music Generator Team*  
*Version 1.0.0 - January 2025*
