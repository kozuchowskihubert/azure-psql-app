# Music Production Features - Testing Guide

## Quick Start Testing

### Option 1: Test on Live Application (Recommended)

Since your app is now running at **https://notesapp-dev-app.azurewebsites.net**, you can test the music features immediately:

1. **Navigate to Music Production Page**:
   ```
   https://notesapp-dev-app.azurewebsites.net/music-production.html
   ```

2. **Or from the main app**:
   - Go to https://notesapp-dev-app.azurewebsites.net
   - Click the **"Music"** button in the navigation (purple/pink gradient button)

**Note**: The live app connects to the server's local filesystem. If you don't see any projects, it means the server doesn't have access to Ableton recordings directory.

---

### Option 2: Test Locally (Full Features)

For full testing with your local Ableton Live recordings:

#### 1. Prerequisites

```bash
# Ensure you have Node.js 18+ installed
node --version

# Navigate to app directory
cd /Users/haos/Projects/azure-psql-app/app

# Install dependencies (if not already done)
npm install
```

#### 2. Configure Ableton Recordings Path

The app looks for Ableton recordings in the default location:
```
~/Music/Ableton/Live Recordings/
```

If your recordings are elsewhere, update the path in `app/routes/music-routes.js`:

```javascript
const ABLETON_RECORDINGS_DIR = path.join(
  process.env.HOME,
  'Music',
  'Ableton',
  'Live Recordings'
);
```

#### 3. Start the Development Server

```bash
# Set environment variables
export DATABASE_URL="postgresql://localhost:5432/notesdb"
export SESSION_SECRET="test-secret-key"
export NODE_ENV="development"

# Start the server
npm run dev
```

#### 4. Access Music Production Features

Open your browser to:
```
http://localhost:3000/music-production.html
```

---

## Testing Checklist

### ✅ Web Interface Tests

- [ ] **Page Loads Successfully**
  - Navigate to `/music-production.html`
  - Verify the page displays without errors
  - Check that the header shows "Music Production Preview"

- [ ] **Project List**
  - Verify projects are displayed in cards
  - Check that project dates are shown correctly
  - Confirm file counts are displayed (total files, audio files, project files)

- [ ] **Search Functionality**
  - Use the search bar to filter projects by name
  - Verify results update in real-time
  - Test with partial names and dates

- [ ] **Sort Options**
  - Click "Sort by Date" - verify newest projects appear first
  - Click "Sort by Name" - verify alphabetical ordering

- [ ] **Statistics Dashboard**
  - Check that total projects count is accurate
  - Verify total audio files count
  - Confirm total storage calculation in GB

- [ ] **Audio Preview**
  - Click on an audio file in a project
  - Verify the audio player appears
  - Test play/pause functionality
  - Check volume control works
  - Verify audio streaming without downloading entire file

- [ ] **Project Details**
  - Click "View Details" on a project card
  - Verify project metadata is displayed
  - Check file listings (all files, audio only, project files)

- [ ] **Open in Ableton** (macOS only)
  - Click "Open in Ableton Live" button
  - Verify Ableton Live launches with the correct project

---

### ✅ API Endpoint Tests

Test the API directly using curl or browser:

#### 1. List All Projects
```bash
curl http://localhost:3000/api/music/projects | jq
```

**Expected Response**:
```json
{
  "success": true,
  "count": 25,
  "projects": [...]
}
```

#### 2. Get Project Details
```bash
curl "http://localhost:3000/api/music/projects/YOUR_PROJECT_NAME" | jq
```

Replace `YOUR_PROJECT_NAME` with an actual project name (URL-encoded if it contains spaces).

#### 3. Get Statistics
```bash
curl http://localhost:3000/api/music/stats | jq
```

**Expected Response**:
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

#### 4. Stream Audio File
```bash
curl -I "http://localhost:3000/api/music/audio/PROJECT_NAME/audio_file.wav"
```

**Expected**: HTTP 200 with audio content-type headers

---

### ✅ CLI Automation Tests (Techno Studio)

The Techno Studio CLI is in `app/ableton-cli/`. Test the automation features:

#### 1. Check CLI Installation

```bash
cd /Users/haos/Projects/azure-psql-app/app/ableton-cli
chmod +x techno_studio.py
./techno_studio.py --help
```

**Expected Output**:
```
🎹 Techno Studio v2.0.0 - Ableton Live Automation Toolkit

Usage: techno_studio.py [OPTIONS] COMMAND [ARGS]...

Options:
  --version  Show version
  --help     Show this message and exit.

Commands:
  create    Create complete techno track (MIDI + template)
  midi      Generate MIDI patterns only
  template  Create Ableton Live template only
  automate  Automate VST loading (requires Ableton open)
  list      List available genres
```

#### 2. List Available Genres

```bash
./techno_studio.py list
```

**Expected**: Shows available techno genres (deep, minimal, industrial, etc.)

#### 3. Generate MIDI Patterns

```bash
./techno_studio.py midi --genre deep --bpm 128
```

**Expected**: Creates MIDI files in `output/midi/` directory

#### 4. Create Complete Track

```bash
./techno_studio.py create --genre deep --bpm 124 --bars 136
```

**Expected**: 
- MIDI files created in `output/midi/`
- Ableton template created in `output/templates/`

#### 5. Generate Template Only

```bash
./techno_studio.py template --tempo 130
```

**Expected**: Ableton Live Set (.als) file created

---

## Troubleshooting

### Issue: No Projects Found

**Solution**:
1. Verify Ableton recordings directory exists:
   ```bash
   ls -la ~/Music/Ableton/Live\ Recordings/
   ```

2. Check the path in `app/routes/music-routes.js` matches your setup

3. Ensure the directory has read permissions:
   ```bash
   chmod -R 755 ~/Music/Ableton/Live\ Recordings/
   ```

### Issue: Audio Files Won't Play

**Solution**:
1. Check browser console for errors (F12)
2. Verify audio file format is supported (WAV, MP3, AIFF, FLAC, M4A)
3. Check that the server has read access to audio files
4. Test direct API endpoint:
   ```bash
   curl -I http://localhost:3000/api/music/audio/PROJECT/file.wav
   ```

### Issue: "Open in Ableton" Not Working

**Solution**:
1. **macOS Only**: This feature uses AppleScript, only works on macOS
2. Ensure Ableton Live is installed in `/Applications/`
3. Check that you have permission to execute AppleScript:
   ```bash
   osascript -e 'tell application "System Events" to get name of processes'
   ```

### Issue: CLI Commands Fail

**Solution**:
1. Check Python dependencies:
   ```bash
   cd app/ableton-cli
   pip3 install -r requirements.txt
   ```

2. Verify Python version (3.8+):
   ```bash
   python3 --version
   ```

3. Make script executable:
   ```bash
   chmod +x techno_studio.py
   ```

---

## Advanced Testing

### Performance Testing

Test with large number of projects:

```bash
# Time the API response
time curl http://localhost:3000/api/music/projects

# Check memory usage while browsing
# Open Activity Monitor (macOS) or Task Manager (Windows)
# Monitor Node.js process while loading music page
```

### Security Testing

Verify path traversal protection:

```bash
# Should fail with 400 error
curl "http://localhost:3000/api/music/projects/../../../etc/passwd"

# Should fail with 400 error  
curl "http://localhost:3000/api/music/audio/../../etc/passwd/file.wav"
```

**Expected**: Both should return error responses, not file contents.

### Cross-Browser Testing

Test the music features in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Edge

Verify:
- Audio playback works
- UI renders correctly
- No console errors

---

## Integration with Main App

### Test Navigation Flow

1. Start from main page: `http://localhost:3000`
2. Click "Music" button in navigation
3. Verify redirect to `/music-production.html`
4. Test back navigation to main app
5. Verify session persistence across pages

### Test Feature Links

From the Features page (`/features.html`):
1. Scroll to "Music Production Preview" section
2. Click "Open Music Production" link
3. Verify navigation works correctly

---

## Demo Data Setup (Optional)

If you don't have Ableton recordings, create demo structure:

```bash
mkdir -p ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 1
mkdir -p ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 2

# Create dummy audio files
touch ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 1/demo.wav
touch ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 1/Project.als

touch ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 2/track.wav
touch ~/Music/Ableton/Live\ Recordings/Demo\ Project\ 2/Project.als
```

Then refresh the music production page to see the demo projects.

---

## Success Criteria

Your music production features are working correctly if:

✅ All projects from Ableton directory are listed  
✅ Search and sort functions work smoothly  
✅ Audio files can be previewed in browser  
✅ Statistics are calculated accurately  
✅ "Open in Ableton" launches projects (macOS)  
✅ API endpoints return valid JSON responses  
✅ CLI can generate MIDI patterns and templates  
✅ No console errors or failed requests  
✅ Navigation between pages works seamlessly  

---

## Next Steps

After testing, you can:

1. **Customize Paths**: Update recording directories in `music-routes.js`
2. **Add Metadata**: Extend project info (BPM, key, genre tags)
3. **Cloud Storage**: Integrate with Azure Blob Storage for recordings
4. **Collaboration**: Add project sharing features
5. **AI Features**: Integrate music analysis and tagging

For more details, see:
- [Music Production Documentation](MUSIC_PRODUCTION.md)
- [Architecture Guide](../technical/ARCHITECTURE.md)
- [API Documentation](../technical/API.md)
