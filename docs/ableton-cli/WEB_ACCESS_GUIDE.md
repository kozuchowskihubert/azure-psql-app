# Web Access Guide - Behringer 2600 Preset Library

## 🌐 Accessing Presets via Web

### Quick Start

1. **Start the Server**
```bash
cd /Users/haos/Projects/azure-psql-app
npm start
# Or
node app/server.js
```

2. **Open Preset Browser**
```
http://localhost:3000/preset-browser.html
```

3. **Or Access API Directly**
```bash
curl http://localhost:3000/api/music/presets
```

## 🔗 Web Endpoints

### 1. **Preset Browser UI** (Interactive)
```
http://localhost:3000/preset-browser.html
```

**Features:**
- ✅ Browse all 100 presets
- ✅ Filter by category (bass, lead, pad, percussion, effects, sequence, modulation)
- ✅ Search by name or tags
- ✅ View detailed preset information
- ✅ See patch cables and routing
- ✅ Virtual keyboard for testing
- ✅ Real-time statistics

**How to Use:**
1. Open the URL in your browser
2. Use category dropdown to filter
3. Use search box to find specific presets
4. Click preset cards to see details
5. Click "ℹ Details" to see full patch information

### 2. **REST API Endpoints**

#### Get All Presets
```bash
curl http://localhost:3000/api/music/presets
```

**Response:**
```json
{
  "success": true,
  "presets": [...100 presets...],
  "total": 100
}
```

#### Filter by Category
```bash
# Bass presets only
curl http://localhost:3000/api/music/presets?category=bass

# Lead presets only
curl http://localhost:3000/api/music/presets?category=lead
```

**Available Categories:**
- `bass` (20 presets)
- `lead` (15 presets)
- `pad` (15 presets)
- `percussion` (15 presets)
- `effects` (15 presets)
- `sequence` (10 presets)
- `modulation` (10 presets)

#### Filter by Tag
```bash
# All acid presets
curl http://localhost:3000/api/music/presets?tag=acid

# All resonant presets
curl http://localhost:3000/api/music/presets?tag=resonant

# All FM presets
curl http://localhost:3000/api/music/presets?tag=fm
```

#### Search Presets
```bash
# Search by name
curl http://localhost:3000/api/music/presets?search=wobble

# Search returns partial matches
curl http://localhost:3000/api/music/presets?search=bass
```

#### Get Specific Preset
```bash
# Get by exact name (URL encoded)
curl http://localhost:3000/api/music/presets/Acid%20Bass%20-%20303%20Style

# Get Sub Bass
curl http://localhost:3000/api/music/presets/Sub%20Bass%20-%20Deep%20808
```

**Response:**
```json
{
  "success": true,
  "preset": {
    "name": "Acid Bass - 303 Style",
    "category": "bass",
    "description": "Classic acid bass with resonant filter sweep",
    "tags": ["bass", "acid", "303", "squelch", "resonant"],
    "patch_cables": [...],
    "modules": {...},
    "modulators": {...},
    "bpm": 128,
    "author": "Behringer 2600 Collection"
  }
}
```

#### Initialize/Regenerate Presets
```bash
curl -X POST http://localhost:3000/api/music/presets/init
```

This will regenerate all 100 presets from source.

#### Get Library Statistics
```bash
curl http://localhost:3000/api/music/presets/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_presets": 100,
    "categories": {
      "bass": 20,
      "lead": 15,
      "pad": 15,
      "percussion": 15,
      "effects": 15,
      "sequence": 10,
      "modulation": 10
    },
    "tags": [...160 tags...]
  }
}
```

## 🤖 Automation Examples

### Bash Script - Download All Presets
```bash
#!/bin/bash
# download_presets.sh

# Download all presets
curl -s http://localhost:3000/api/music/presets | jq '.' > all_presets.json

# Download by category
for category in bass lead pad percussion effects sequence modulation; do
  curl -s "http://localhost:3000/api/music/presets?category=$category" | \
    jq ".presets" > "${category}_presets.json"
  echo "Downloaded $category presets"
done

echo "✅ All presets downloaded!"
```

### Python Script - Fetch and Process Presets
```python
#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:3000/api/music/presets"

# Get all presets
response = requests.get(BASE_URL)
data = response.json()

print(f"Total presets: {len(data['presets'])}")

# Get bass presets only
bass_response = requests.get(f"{BASE_URL}?category=bass")
bass_presets = bass_response.json()['presets']

print(f"Bass presets: {len(bass_presets)}")

# Save to file
with open('bass_presets.json', 'w') as f:
    json.dump(bass_presets, f, indent=2)

print("✅ Saved bass presets!")
```

### JavaScript/Node.js - Fetch Presets
```javascript
// fetch_presets.js
const https = require('http');
const fs = require('fs');

async function fetchPresets() {
  const response = await fetch('http://localhost:3000/api/music/presets');
  const data = await response.json();
  
  // Save to file
  fs.writeFileSync('presets.json', JSON.stringify(data, null, 2));
  
  console.log(`✅ Downloaded ${data.presets.length} presets`);
}

fetchPresets();
```

### cURL - Advanced Filtering
```bash
# Get all acid bass presets
curl -s "http://localhost:3000/api/music/presets?category=bass&tag=acid" | jq '.'

# Get all resonant presets across all categories
curl -s "http://localhost:3000/api/music/presets?tag=resonant" | jq '.presets[].name'

# Search for wobble sounds
curl -s "http://localhost:3000/api/music/presets?search=wobble" | jq '.presets[].name'

# Get preset count by category
curl -s "http://localhost:3000/api/music/presets/stats" | jq '.stats.categories'
```

## 📱 Frontend Integration

### HTML/JavaScript Example
```html
<!DOCTYPE html>
<html>
<head>
  <title>Preset Loader</title>
</head>
<body>
  <h1>Load Presets</h1>
  <button onclick="loadPresets()">Load All Presets</button>
  <div id="presets"></div>

  <script>
    async function loadPresets() {
      const response = await fetch('/api/music/presets');
      const data = await response.json();
      
      const presetsDiv = document.getElementById('presets');
      presetsDiv.innerHTML = '';
      
      data.presets.forEach(preset => {
        const div = document.createElement('div');
        div.innerHTML = `
          <h3>${preset.name}</h3>
          <p>Category: ${preset.category}</p>
          <p>Tags: ${preset.tags.join(', ')}</p>
        `;
        presetsDiv.appendChild(div);
      });
      
      console.log(`Loaded ${data.presets.length} presets`);
    }
  </script>
</body>
</html>
```

### React Component Example
```jsx
import React, { useEffect, useState } from 'react';

function PresetList() {
  const [presets, setPresets] = useState([]);
  
  useEffect(() => {
    fetch('/api/music/presets')
      .then(res => res.json())
      .then(data => setPresets(data.presets));
  }, []);
  
  return (
    <div>
      <h1>Presets ({presets.length})</h1>
      {presets.map(preset => (
        <div key={preset.name}>
          <h3>{preset.name}</h3>
          <p>{preset.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Automated Sync Script

### Auto-Sync Presets to Git
```bash
#!/bin/bash
# auto_sync_presets.sh

cd /Users/haos/Projects/azure-psql-app

# Regenerate presets
echo "🔄 Regenerating presets..."
curl -X POST http://localhost:3000/api/music/presets/init

# Wait for generation
sleep 2

# Check if presets changed
if git diff --quiet app/ableton-cli/output/presets/preset_library.json; then
  echo "✅ No changes to presets"
else
  echo "📝 Presets updated, committing..."
  git add app/ableton-cli/output/presets/preset_library.json
  git commit -m "chore: Update preset library from web"
  git push origin feat/tracks
  echo "✅ Pushed to GitHub!"
fi
```

## 🚀 Quick Commands

### Start Server
```bash
cd /Users/haos/Projects/azure-psql-app
npm start
```

### Access Web UI
```bash
# macOS - open in browser
open http://localhost:3000/preset-browser.html

# Or use curl
curl http://localhost:3000/api/music/presets | jq '.presets | length'
```

### Download All Presets as JSON
```bash
curl -s http://localhost:3000/api/music/presets > presets_backup.json
```

### Get Specific Category
```bash
# Bass presets
curl -s http://localhost:3000/api/music/presets?category=bass | jq '.presets[].name'

# Lead presets
curl -s http://localhost:3000/api/music/presets?category=lead | jq '.presets[].name'
```

## 🌍 Remote Access

### Access from Another Computer
If you want to access from another device on your network:

1. **Find your IP address:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. **Access from another device:**
```
http://YOUR_IP:3000/preset-browser.html
```

### Deploy to Production
To make it accessible from anywhere:

1. **Deploy to Heroku, Vercel, or Azure**
2. **Update base URL in scripts**
3. **Access via public URL**

## 📊 Monitoring & Analytics

### Check Server Status
```bash
curl -s http://localhost:3000/api/health
```

### Monitor Preset Access
Add logging to `app/routes/music-routes.js`:
```javascript
router.get('/presets', async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /presets - Filters:`, req.query);
  // ... rest of code
});
```

## 🔒 Security Notes

### For Production:
- Add authentication to API endpoints
- Implement rate limiting
- Use HTTPS
- Validate input parameters
- Add CORS headers appropriately

### Example CORS Setup:
```javascript
// In app/server.js
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## 📚 Additional Resources

- **API Documentation**: `/docs/ableton-cli/PRESET_CATALOG_100.md`
- **Preset Browser Source**: `/app/public/preset-browser.html`
- **API Routes**: `/app/routes/music-routes.js`
- **Preset Library**: `/app/ableton-cli/output/presets/preset_library.json`

## 🆘 Troubleshooting

### Server Not Starting
```bash
# Check if port is already in use
lsof -ti:3000

# Kill existing process
kill -9 $(lsof -ti:3000)

# Start server
npm start
```

### Presets Not Loading
```bash
# Regenerate presets
cd app/ableton-cli
python3 -m src.presets.preset_catalog_100

# Or via API
curl -X POST http://localhost:3000/api/music/presets/init
```

### CORS Errors
Add to `app/server.js`:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
```

---

**Last Updated**: November 21, 2025  
**Preset Count**: 100  
**Categories**: 7  
**Tags**: 160+
