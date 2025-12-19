# Backend API Testing Guide

## Current Status

The mobile app is configured to connect to: **https://haos.fm/api**

## Testing the Preset Endpoints

### 1. Check if Backend is Running Locally

```bash
# Check if server is running on port 3000
lsof -ti:3000

# If not running, start it:
cd /Users/haos/azure-psql-app/app
node server.js
```

### 2. Test Preset Endpoints Locally

```bash
# List all presets
curl http://localhost:3000/api/music/presets

# Search presets
curl "http://localhost:3000/api/music/presets?search=bass"

# Filter by category
curl "http://localhost:3000/api/music/presets?category=techno"

# Get specific preset
curl http://localhost:3000/api/music/presets/preset-name
```

### 3. Test Production Endpoints

```bash
# List presets from production
curl https://haos.fm/api/music/presets

# Search
curl "https://haos.fm/api/music/presets?search=bass"

# With authentication (if required)
curl -H "Authorization: Bearer YOUR_TOKEN" https://haos.fm/api/music/presets
```

## Mobile App API Configuration

The mobile app's `presetService.js` is configured to use:

```javascript
const API_BASE_URL = 'https://haos.fm/api';
```

### Endpoints Used by Mobile App:

1. **GET /api/music/presets**
   - Query params: `category`, `workspace`, `search`, `featured`
   - Returns list of presets

2. **GET /api/music/presets/:name**
   - Returns specific preset details

3. **POST /api/music/presets/init**
   - Initializes preset library (if needed)

4. **GET /api/music/presets/stats**
   - Returns preset statistics

## Expected Response Format

```json
{
  "success": true,
  "count": 150,
  "presets": [
    {
      "name": "dark-techno-bass",
      "category": "bass",
      "workspace": "TECHNO",
      "description": "Deep, dark bassline",
      "tags": ["dark", "techno", "bass"],
      "author": "HAOS.fm",
      "featured": true,
      "parameters": {
        "waveform": "sawtooth",
        "filter": {
          "type": "lowpass",
          "frequency": 500,
          "Q": 5
        },
        "adsr": {
          "attack": 0.01,
          "decay": 0.2,
          "sustain": 0.7,
          "release": 0.3
        },
        "volume": 0.8
      },
      "created_at": "2025-12-19T00:00:00Z"
    }
  ]
}
```

## Testing Mobile App Connection

### Option 1: Test with Expo

```bash
cd /Users/haos/azure-psql-app/mobile
npm start

# Then in Expo app:
# 1. Go to Presets screen
# 2. Check if presets load
# 3. Try search and filters
# 4. Try downloading a preset
```

### Option 2: Test with curl matching mobile app requests

```bash
# Simulate mobile app request
curl -X GET \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION" \
  https://haos.fm/api/music/presets?category=bass&workspace=TECHNO
```

## Troubleshooting

### Issue: "Preset library not initialized"

**Solution:**
```bash
# Initialize preset library
curl -X POST http://localhost:3000/api/music/presets/init
```

### Issue: "404 Not Found"

**Causes:**
1. Server not running
2. Wrong port (should be 3000 for local, 443 for production)
3. Wrong path (should be `/api/music/presets` not `/api/presets`)

**Solution:**
- Check server logs
- Verify route is mounted in `app/routes/index.js`
- Check `app/app.js` for API router configuration

### Issue: "Network Error" in mobile app

**Causes:**
1. Backend not deployed to https://haos.fm
2. CORS not configured
3. Mobile app can't reach backend

**Solution:**
1. Deploy backend to production
2. Check CORS settings in `app/app.js`
3. Test production URL with curl first

## Next Steps

1. ✅ Verify backend is deployed to https://haos.fm
2. ✅ Test production preset endpoints
3. ✅ Start Expo dev server
4. ✅ Test preset loading in mobile app
5. ✅ Test offline mode (download presets, turn off WiFi)
6. ✅ Test premium download limits

## Production Deployment Check

```bash
# Check if production backend is responding
curl -I https://haos.fm/api/health

# Check preset endpoint
curl https://haos.fm/api/music/presets | jq '.count'

# Check if authentication works
curl -H "Authorization: Bearer TOKEN" https://haos.fm/api/music/presets
```

## Mobile App Environment Variables

If you need to switch between local and production:

Create `mobile/.env`:
```env
# Local development
API_BASE_URL=http://localhost:3000/api

# Production
# API_BASE_URL=https://haos.fm/api
```

Then update `presetService.js`:
```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'https://haos.fm/api';
```
