# 📻 HAOS.fm Radio 24/7 - Complete Implementation Guide

## Overview

HAOS.fm Radio is a comprehensive multi-channel streaming platform with 6 dedicated electronic music channels, real-time chat, playlist management, and advanced audio visualization. The platform provides a modern, interactive radio experience for electronic music enthusiasts.

## Features

### 🎵 6 Music Channels

1. **⚡ TECHNO** (125-145 BPM)
   - Industrial, Acid, Hard Techno
   - Color: Acid Green (#39FF14)
   - High-energy underground sounds

2. **🏠 HOUSE** (120-128 BPM)
   - Deep House, Tech House, Progressive
   - Color: Gold (#FFD700)
   - Groovy, soulful rhythms

3. **🌊 TRANCE** (130-140 BPM)
   - Progressive, Uplifting, Psy-Trance
   - Color: Cyan (#00D9FF)
   - Euphoric melodies and builds

4. **🔥 TRAP** (130-160 BPM)
   - Trap, Hip-Hop, Bass Music
   - Color: Orange (#FF6B35)
   - Heavy 808s and trap snares

5. **🌌 AMBIENT** (60-90 BPM)
   - Chillout, Downtempo, Atmospheric
   - Color: Purple (#9370DB)
   - Relaxing soundscapes

6. **⚡ DnB** (160-180 BPM)
   - Drum & Bass, Jungle, Liquid
   - Color: Magenta (#FF1493)
   - Fast-paced breakbeats

### 🎚️ Player Controls

- **Playback**: Play, Pause, Stop
- **Navigation**: Previous Track, Next Track
- **Seek**: Click progress bar to jump to position
- **Volume**: 0-100% control with visual slider
- **Auto-play**: Automatic next track when song ends

### 📊 Audio Visualization

Three visualization modes:
1. **Bars** - Classic frequency bars (64 bars)
2. **Waveform** - Audio waveform display
3. **Circular** - Rotating circular spectrum analyzer

Real-time FFT analysis with 50ms refresh rate.

### 📤 Track Upload

- **Drag & Drop**: Drop audio files directly onto upload area
- **File Browser**: Click to select files
- **Supported Formats**: MP3, WAV, OGG
- **Channel Selection**: Upload to specific channel
- **Auto-metadata**: Extracts track info from filename

### 🎼 Playlist Management

**Features**:
- View current channel playlist
- Add tracks to queue
- Remove tracks from playlist
- Shuffle playlist
- Clear all tracks
- Export playlist to JSON
- Import playlist from JSON

**Visual Indicators**:
- Currently playing track highlighted
- Track metadata (artist, BPM, genre)
- Hover effects for better UX

### 🎵 Queue System

- **Priority Playback**: Queue tracks play before playlist
- **Visual Queue**: See upcoming tracks
- **Drag & Reorder**: Change queue order (future)
- **Remove Items**: Click X to remove from queue
- **Auto-update**: Queue refreshes on changes

### 💬 Live Chat

- **Real-time Messages**: Instant chat updates
- **Message History**: Last 100 messages stored
- **User Identification**: Random guest usernames
- **System Messages**: Upload/channel change notifications
- **Auto-scroll**: Always see latest messages

### 📈 Statistics Dashboard

Real-time statistics:
- **Listeners**: Live listener count (simulated)
- **Tracks**: Total tracks across all channels
- **Channels**: Number of available channels (6)

### 🎨 UI/UX Features

**Visual Design**:
- Gradient animations and glowing effects
- Channel-specific color themes
- Responsive grid layout
- Large album art display
- Modern card-based design
- Smooth transitions and hover effects

**Responsive Design**:
- Mobile-optimized layout
- Touch-friendly controls
- Adaptive channel grid (2 columns on mobile)
- Smaller album art on mobile devices

## Technical Architecture

### RadioStation Class

Location: `/app/public/js/radio-station.js`

**Core Components**:

```javascript
class RadioStation {
  constructor(audioContext)
  
  // Audio Graph
  - audioElement (HTML5 Audio)
  - sourceNode (MediaElementSource)
  - gainNode (Volume control)
  - analyserNode (FFT analysis, size 2048)
  
  // State Management
  - currentChannelId
  - isPlaying
  - queue[]
  - history[]
  - chatMessages[]
  - listeners
  - statistics
}
```

**Key Methods**:

#### Channel Management
```javascript
switchChannel(channelId)  // Switch between channels
getAllChannels()          // Get all channel info
```

#### Playback Control
```javascript
play()         // Start playback
pause()        // Pause playback
stop()         // Stop and reset
playNext()     // Play next track (queue → playlist)
playPrevious() // Go back in history
seek(seconds)  // Jump to position
```

#### Queue Management
```javascript
addToQueue(track)         // Add to queue
removeFromQueue(index)    // Remove from queue
addToHistory(track)       // Track history
```

#### Audio Control
```javascript
setVolume(volume)         // 0-1 range
getVisualizerData()       // FFT frequencies + waveform
```

#### Track Management
```javascript
getCurrentTrack()                          // Get playing track
addTrackToChannel(channelId, track)       // Add to playlist
removeTrackFromChannel(channelId, trackId) // Remove from playlist
updateProgress()                           // Real-time progress
```

#### Chat System
```javascript
addChatMessage(username, message)  // Add message
getChatMessages(limit)             // Get recent messages
```

#### Statistics
```javascript
updateListeners(count)  // Update listener count
getStatistics()         // Get all stats
```

### Event System

The RadioStation broadcasts CustomEvents for UI updates:

```javascript
// Playback Events
'radio:channelChanged'   // Channel switched
'radio:trackStarted'     // New track started
'radio:trackPaused'      // Playback paused
'radio:trackStopped'     // Playback stopped
'radio:progressUpdated'  // Progress updated (current time, duration, percentage)

// Management Events
'radio:queueUpdated'     // Queue changed
'radio:playlistUpdated'  // Playlist changed
'radio:volumeChanged'    // Volume changed

// Communication Events
'radio:chatMessage'      // New chat message
'radio:listenersUpdated' // Listener count changed

// Error Events
'radio:playbackError'    // Playback error occurred
```

### Audio Graph Flow

```
User Upload File
    ↓
URL.createObjectURL(file)
    ↓
HTML5 Audio Element
    ↓
MediaElementSourceNode
    ↓
GainNode (Volume Control)
    ↓
AnalyserNode (FFT Analysis) → getVisualizerData()
    ↓
AudioContext.destination (Speakers)
```

## File Structure

```
app/public/
├── radio.html                    # Main radio interface
├── js/
│   └── radio-station.js         # RadioStation class
└── css/
    └── haos-brand.css           # Brand styling
```

## Usage Guide

### Basic Usage

1. **Open Radio**: Navigate to `/radio.html`
2. **Select Channel**: Click on any channel card
3. **Play Music**: Click the play button
4. **Enjoy**: Music starts playing automatically

### Uploading Tracks

1. **Select Channel**: Choose upload channel from dropdown
2. **Upload File**: 
   - Drag & drop audio file onto upload area, OR
   - Click upload area to browse files
3. **Confirmation**: See chat message confirming upload
4. **Play**: Track added to selected channel playlist

### Managing Playlists

**Shuffle Playlist**:
- Click "Shuffle" button to randomize track order

**Clear Playlist**:
- Click "Clear" → Confirm to remove all tracks

**Export Playlist**:
- Click "Export" → Downloads JSON file with track metadata

**Import Playlist**:
- Click "Import" → Select JSON file → Tracks added to current channel

### Using Queue

1. **Add to Queue**: Click + button on any playlist track
2. **View Queue**: See tracks in "Up Next" section
3. **Remove**: Click X to remove track from queue
4. **Auto-play**: Queue tracks play before playlist tracks

### Chat

1. **Type Message**: Enter text in chat input
2. **Send**: Press Enter or click Send button
3. **View History**: Scroll to see previous messages
4. **System Messages**: See notifications for uploads/changes

### Visualizer

1. **Select Mode**: Click Bars, Waveform, or Circular button
2. **Watch**: Real-time audio visualization updates
3. **Modes**:
   - **Bars**: Frequency spectrum (64 bars)
   - **Waveform**: Audio waveform amplitude
   - **Circular**: Rotating spectrum display

## Code Examples

### Initialize Radio

```javascript
import RadioStation from '/js/radio-station.js';

// Create audio context
const audioContext = new AudioContext();

// Initialize radio
const radio = new RadioStation(audioContext);
```

### Switch Channel and Play

```javascript
// Switch to techno channel
const result = radio.switchChannel('techno');

if (result.success) {
  console.log(`Switched to ${result.channel.name}`);
  
  // Start playing
  radio.play();
}
```

### Add Track to Channel

```javascript
const track = {
  id: Date.now(),
  title: 'Acid Anthem',
  artist: 'DJ HAOS',
  genre: 'Acid Techno',
  bpm: 140,
  duration: 360,
  url: 'path/to/track.mp3'
};

radio.addTrackToChannel('techno', track);
```

### Listen to Events

```javascript
// Track started
window.addEventListener('radio:trackStarted', (e) => {
  const track = e.detail.track;
  console.log(`Now playing: ${track.title} by ${track.artist}`);
});

// Progress update
window.addEventListener('radio:progressUpdated', (e) => {
  const { currentTime, duration, percentage } = e.detail;
  console.log(`Progress: ${percentage.toFixed(2)}%`);
});

// Chat message
window.addEventListener('radio:chatMessage', (e) => {
  const { username, message } = e.detail;
  console.log(`${username}: ${message}`);
});
```

### Get Visualizer Data

```javascript
// Get FFT data for visualization
const data = radio.getVisualizerData();

// Frequencies (0-255)
data.frequencies.forEach((value, i) => {
  console.log(`Frequency bin ${i}: ${value}`);
});

// Waveform (-128 to 128)
data.waveform.forEach((value, i) => {
  console.log(`Waveform sample ${i}: ${value}`);
});
```

### Manage Queue

```javascript
// Add track to queue
const track = radio.channels.techno.playlist[0];
radio.addToQueue(track);

// Play next (plays queue track first)
radio.playNext();

// Remove from queue
radio.removeFromQueue(0);
```

### Chat Functions

```javascript
// Add message
radio.addChatMessage('DJ HAOS', 'Welcome to the techno channel! 🎵');

// Get messages (last 50)
const messages = radio.getChatMessages(50);
messages.forEach(msg => {
  console.log(`[${msg.timestamp}] ${msg.username}: ${msg.message}`);
});
```

## Configuration

### Channel Configuration

Edit in `/app/public/js/radio-station.js`:

```javascript
this.channels = {
  techno: {
    name: '⚡ TECHNO',
    description: 'Industrial • Acid • Hard Techno',
    bpm: [125, 145],
    color: '#39FF14',
    icon: '⚡',
    playlist: []
  },
  // Add more channels...
};
```

### Visualizer Settings

```javascript
// FFT size (higher = more detail, more CPU)
this.analyserNode.fftSize = 2048;

// Smoothing (0-1, higher = smoother)
this.analyserNode.smoothingTimeConstant = 0.8;
```

### Chat Settings

```javascript
// Maximum chat messages
this.maxChatMessages = 100;

// History size
this.maxHistory = 50;
```

## Performance Optimization

### Audio Graph

- Uses Web Audio API for efficient processing
- Single audio element shared across tracks
- Reuses audio nodes (no memory leaks)

### Visualizer

- 50ms update interval (20 FPS)
- Efficient FFT bin sampling (every 4th bin)
- Optimized DOM updates

### Event Handling

- CustomEvents for loose coupling
- No memory leaks from event listeners
- Efficient event delegation

## Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- Web Audio API
- ES6 Modules
- CustomEvents
- File API
- Drag & Drop API

## Future Enhancements

### Planned Features

1. **DJ Mode**
   - Crossfade between tracks
   - BPM sync
   - Beatmatching
   - Multiple deck support

2. **Social Features**
   - User accounts
   - Favorite tracks
   - Share playlists
   - Friend activity

3. **Advanced Playlist**
   - Smart recommendations
   - Genre/BPM filters
   - Auto-DJ mode
   - Scheduled playlists

4. **Streaming**
   - Live DJ sets
   - Radio shows
   - Recording/downloads
   - Podcasts

5. **Integration**
   - Link to Techno Creator/Trap Studio
   - Export DAW creations to radio
   - Import radio tracks to DAW
   - Ableton Live integration

6. **Analytics**
   - Play count tracking
   - Popular tracks
   - Listening habits
   - Channel statistics

## Troubleshooting

### No Audio Playing

1. Check browser audio permissions
2. Verify AudioContext is running (click play to resume)
3. Check volume level (not muted)
4. Verify track URL is valid

### Upload Not Working

1. Check file format (MP3, WAV, OGG)
2. Verify channel is selected
3. Check file size (<50MB recommended)
4. Try drag & drop instead of file browser

### Visualizer Not Updating

1. Verify track is playing
2. Check browser performance (close other tabs)
3. Try different visualizer mode
4. Refresh page

### Chat Messages Not Appearing

1. Check event listeners are set up
2. Verify message text is not empty
3. Check console for errors
4. Refresh page

## Credits

**Developed for**: HAOS.fm Platform  
**Version**: 2.0  
**Technology**: Web Audio API, ES6, HTML5  
**Design**: Modern electronic music aesthetic  

---

**Navigation**:
- [Main Documentation](../README.md)
- [Techno Creator Guide](./TECHNO_CREATOR_GUIDE.md)
- [Trap Studio Guide](./TRAP_STUDIO_GUIDE.md)
- [String Machine Summary](../MODULAR_SYNTH_SUMMARY.md)

**Last Updated**: November 27, 2025
