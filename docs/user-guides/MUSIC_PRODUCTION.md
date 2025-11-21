# Music Production Preview - Documentation

## Overview

The Music Production Preview feature integrates your local Ableton Live recordings directory with a beautiful web interface, allowing you to browse, preview, and manage your music projects directly from the productivity suite.

**Path**: `/music-production.html`  
**API**: `/api/music/*`

## Features

### 🎵 Project Browsing
- Lists all Ableton Live Recording projects
- Shows project creation and modification dates
- Displays project statistics (files, audio files, Ableton projects)
- Search and filter functionality
- Sort by date or name

### 🎧 Audio Preview
- In-browser audio playback for all audio files
- Supports: WAV, MP3, AIFF, FLAC, M4A
- Streaming audio directly from local filesystem
- Visual player interface

### 📊 Statistics Dashboard
- Total number of projects
- Total audio files count
- Total Ableton project files
- Total storage usage in GB

### 🚀 Quick Actions
- Open projects directly in Ableton Live (macOS)
- View all project files and folders
- Browse project contents

## API Endpoints

### GET /api/music/projects
List all Ableton projects

**Response**:
```json
{
  "success": true,
  "count": 25,
  "projects": [
    {
      "name": "2025-11-21 034406 Temp Project",
      "path": "/Users/haos/Music/Ableton/Live Recordings/...",
      "created": "2025-11-21T03:44:06.000Z",
      "modified": "2025-11-21T03:45:12.000Z",
      "hasProjectInfo": true
    }
  ]
}
```

### GET /api/music/projects/:projectName
Get detailed information about a specific project

**Response**:
```json
{
  "success": true,
  "project": {
    "name": "2025-11-21 034406 Temp Project",
    "path": "/Users/haos/Music/Ableton/...",
    "created": "2025-11-21T03:44:06.000Z",
    "modified": "2025-11-21T03:45:12.000Z",
    "files": 12,
    "audioFiles": 5,
    "projectFiles": 1
  },
  "contents": {
    "all": [...],
    "audio": [...],
    "projectFiles": [...]
  }
}
```

### GET /api/music/audio/:projectName/:fileName
Stream an audio file

**Response**: Audio file stream with appropriate content-type

### GET /api/music/stats
Get overall music production statistics

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalProjects": 25,
    "totalAudioFiles": 145,
    "totalProjectFiles": 28,
    "totalSizeGB": "12.45"
  }
}
```

### POST /api/music/open/:projectName
Open project in Ableton Live (macOS only)

**Response**:
```json
{
  "success": true,
  "message": "Opening project.als in Ableton Live",
  "file": "project.als"
}
```

## Configuration

### Local Path
The feature automatically scans:
```
/Users/haos/Music/Ableton/Live Recordings/
```

### Supported File Types

**Audio Files**:
- .wav (WAV)
- .mp3 (MP3)
- .aif, .aiff (AIFF)
- .flac (FLAC)
- .m4a (M4A)

**Project Files**:
- .als (Ableton Live Set)

## Security

- Path traversal protection
- Files must be within Ableton directory
- Real path verification
- No unauthorized file access

## User Interface

### Main View
- **Statistics Cards**: Show total projects, audio files, and storage
- **Search Bar**: Filter projects by name
- **Sort Options**: Newest, oldest, or alphabetical
- **Project Grid**: Visual cards for each project

### Project Detail Modal
- Project information (created, modified, file counts)
- **Audio Files Section**: List with play buttons
- **Project Files Section**: .als files with "Open in Ableton" button
- **All Files Section**: Complete file listing (expandable)

### Features
- Real-time audio streaming
- Responsive design
- Beautiful gradient UI
- Smooth animations
- Keyboard shortcuts (ESC to close modal)

## Integration

### Navigation
Added to main navigation bar:
```html
<a href="/music-production.html">
  <i class="fas fa-music"></i>
  Music
</a>
```

### Features Page
Added feature card showing:
- Live status
- Key capabilities
- Link to open the feature

## Development

### Backend Route
File: `app/routes/music-routes.js`

Key dependencies:
- `express` - HTTP routing
- `fs/promises` - File system operations
- `child_process` - Execute Ableton launch

### Frontend
Files:
- `app/public/music-production.html` - UI
- `app/public/js/music-production.js` - JavaScript logic

## Use Cases

1. **Quick Project Review**
   - Browse recent recordings
   - Preview audio exports
   - Check project status

2. **Project Management**
   - Find specific projects quickly
   - Check file counts and sizes
   - Organize workflow

3. **Audio Preview**
   - Listen to renders without opening DAW
   - Compare different versions
   - Share audio files

4. **Rapid Access**
   - One-click open in Ableton
   - Faster than Finder navigation
   - Integrated with productivity suite

## Future Enhancements

- [ ] Waveform visualization
- [ ] Project tags and notes
- [ ] Audio file comparison
- [ ] Export to cloud storage
- [ ] Collaboration features
- [ ] Version history
- [ ] BPM and key detection
- [ ] Sample library integration

## Troubleshooting

### Projects not showing?
- Verify Ableton path exists
- Check folder permissions
- Ensure projects have correct structure

### Audio not playing?
- Check browser audio permissions
- Verify file format support
- Check file path security

### Can't open in Ableton?
- macOS only feature
- Verify Ableton is installed
- Check .als file exists in project

## Performance

- Lazy loading of project contents
- Streaming audio (no full file load)
- Efficient file system scanning
- Cached statistics

---

**Version**: 1.0  
**Added**: November 2025  
**Status**: ✅ Production Ready
