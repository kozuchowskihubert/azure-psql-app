# Quick Start - Web Access to 100 Presets

## 🚀 Start the Server

```bash
cd /Users/haos/Projects/azure-psql-app
npm start
```

The server will start on `http://localhost:3000`

## 🌐 Access Methods

### 1. **Web Browser** (Best for browsing)

Open in your browser:
```
http://localhost:3000/preset-browser.html
```

**You can:**
- ✅ Browse all 100 presets visually
- ✅ Filter by category (dropdown)
- ✅ Search by name/tags
- ✅ Click preset cards to see details
- ✅ View patch cables and routing
- ✅ Use virtual keyboard

### 2. **REST API** (Best for automation)

#### Get all presets:
```bash
curl http://localhost:3000/api/music/presets
```

#### Get bass presets only:
```bash
curl http://localhost:3000/api/music/presets?category=bass
```

#### Search for "acid" presets:
```bash
curl http://localhost:3000/api/music/presets?search=acid
```

#### Get specific preset:
```bash
curl http://localhost:3000/api/music/presets/Acid%20Bass%20-%20303%20Style
```

### 3. **Automation Scripts** (Best for batch operations)

#### Download all presets to files:
```bash
cd /Users/haos/Projects/azure-psql-app
./scripts/download-presets.sh
```

This creates files in `preset_exports/`:
- `all_presets.json` - All 100 presets
- `bass_presets.json` - 20 bass presets
- `lead_presets.json` - 15 lead presets
- etc.

#### Auto-sync to GitHub:
```bash
./scripts/auto-sync-presets.sh
```

This will:
1. Regenerate presets via API
2. Check for changes
3. Commit and push to GitHub if changed

## 📊 Quick Examples

### List all preset names:
```bash
curl -s http://localhost:3000/api/music/presets | jq '.presets[].name'
```

### Count presets by category:
```bash
curl -s http://localhost:3000/api/music/presets/stats | jq '.stats.categories'
```

### Get all acid presets:
```bash
curl -s http://localhost:3000/api/music/presets?tag=acid | jq '.presets[] | {name, category}'
```

### Save all bass presets to file:
```bash
curl -s http://localhost:3000/api/music/presets?category=bass > bass_presets.json
```

## 🎯 Common Tasks

### Task: Browse presets visually
**Solution**: Open `http://localhost:3000/preset-browser.html`

### Task: Download all presets
**Solution**: Run `./scripts/download-presets.sh`

### Task: Get presets in your code
**Solution**: 
```javascript
const response = await fetch('http://localhost:3000/api/music/presets');
const data = await response.json();
console.log(`Found ${data.presets.length} presets`);
```

### Task: Auto-commit preset changes
**Solution**: Run `./scripts/auto-sync-presets.sh`

## 📁 File Locations

- **Web UI**: `app/public/preset-browser.html`
- **API Routes**: `app/routes/music-routes.js`
- **Preset Data**: `app/ableton-cli/output/presets/preset_library.json`
- **Generator**: `app/ableton-cli/src/presets/preset_catalog_100.py`

## 🔧 Troubleshooting

### Server won't start?
```bash
# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9

# Start server
npm start
```

### Presets not loading?
```bash
# Regenerate presets
curl -X POST http://localhost:3000/api/music/presets/init

# Or manually
cd app/ableton-cli
python3 -m src.presets.preset_catalog_100
```

### Can't access from browser?
Make sure server is running and try:
```bash
# Check server status
curl http://localhost:3000/api/health

# If not running, start it
npm start
```

## 📚 Full Documentation

- **Web Access Guide**: `docs/ableton-cli/WEB_ACCESS_GUIDE.md`
- **Preset Catalog**: `docs/ableton-cli/PRESET_CATALOG_100.md`
- **API Documentation**: See `app/routes/music-routes.js`

---

**Quick Commands Cheat Sheet:**

```bash
# Start server
npm start

# Open browser
open http://localhost:3000/preset-browser.html

# Download all presets
./scripts/download-presets.sh

# Sync to GitHub
./scripts/auto-sync-presets.sh

# Get preset count
curl -s http://localhost:3000/api/music/presets | jq '.total'
```
