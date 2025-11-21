# 🧪 PWA Testing Checklist

## 🖥️ Local Server Running

✅ **Server started successfully!**
- URL: http://localhost:3000
- Icon Generator: http://localhost:3000/icon-generator.html

## 📋 Testing Checklist

### 1. Icon Generation (IMMEDIATE)

**Current Status**: Icon generator is open in your browser

**Steps**:
- [ ] 1. Go to http://localhost:3000/icon-generator.html
- [ ] 2. Wait for icons to auto-generate (takes ~2 seconds)
- [ ] 3. Click individual "💾 Download" buttons for each size
- [ ] 4. Save all 8 icons to `/app/public/icons/` directory:
  - icon-72x72.png
  - icon-96x96.png
  - icon-128x128.png
  - icon-144x144.png
  - icon-152x152.png
  - icon-192x192.png
  - icon-384x384.png
  - icon-512x512.png

**Alternative**: Use "Download All Icons" button (may trigger popup blocker)

---

### 2. Service Worker Registration

**Test in Chrome DevTools**:
- [ ] 1. Open http://localhost:3000 in **Chrome**
- [ ] 2. Press `F12` to open DevTools
- [ ] 3. Go to **Application** tab
- [ ] 4. Click **Service Workers** in sidebar
- [ ] 5. Verify service worker shows as **"activated and running"**
- [ ] 6. Check "Update on reload" for development

**Expected Result**:
```
service-worker.js
Status: activated and is running
Scope: http://localhost:3000/
```

**Console Output**:
```javascript
✅ Service Worker registered: http://localhost:3000/
📱 PWA installer loaded successfully
[ServiceWorker] Installing version notes-app-v2.1.0
[ServiceWorker] Pre-caching app shell
[ServiceWorker] Activating version notes-app-v2.1.0
```

---

### 3. Cache Storage

**Check cached files**:
- [ ] 1. DevTools → Application → Cache Storage
- [ ] 2. Expand **"notes-app-v2.1.0"**
- [ ] 3. Verify these files are cached:
  - ✅ http://localhost:3000/
  - ✅ http://localhost:3000/index.html
  - ✅ http://localhost:3000/excel.html
  - ✅ http://localhost:3000/calendar.html
  - ✅ http://localhost:3000/sso.html
  - ✅ http://localhost:3000/features.html
  - ✅ http://localhost:3000/manifest.json
  - ✅ https://cdn.tailwindcss.com
  - ✅ Font Awesome CSS

**Clear cache** (if needed):
```javascript
// Run in DevTools Console:
caches.keys().then(keys => 
  Promise.all(keys.map(key => caches.delete(key)))
).then(() => console.log('✅ Cache cleared'));
```

---

### 4. Offline Functionality

**Test offline mode**:
- [ ] 1. Open http://localhost:3000
- [ ] 2. DevTools → Network tab
- [ ] 3. Check **"Offline"** checkbox (throttling dropdown)
- [ ] 4. Refresh page (`Cmd+R` or `Ctrl+R`)
- [ ] 5. Verify app still loads and works
- [ ] 6. Navigate to Excel, Calendar, Features pages
- [ ] 7. All pages should work offline

**Expected**:
- ✅ Pages load from cache
- ✅ No network errors
- ✅ Offline toast notification appears
- ✅ "📡 Offline mode - Changes saved locally"

**Test offline page**:
- [ ] 1. While offline, go to http://localhost:3000/new-page-that-doesnt-exist
- [ ] 2. Should show `/offline.html` fallback
- [ ] 3. Click links to cached pages
- [ ] 4. Turn network back online
- [ ] 5. Page should auto-refresh

---

### 5. Manifest Validation

**Check manifest**:
- [ ] 1. DevTools → Application → Manifest
- [ ] 2. Verify all fields populated:
  - **Name**: Notes App - Cloud Workspace
  - **Short Name**: Notes App
  - **Theme Color**: #667eea
  - **Background Color**: #667eea
  - **Display**: standalone
  - **Start URL**: /
  - **Scope**: /

**Check icons**:
- [ ] 3. Scroll to **Icons** section
- [ ] 4. All 8 icon sizes should be listed
- [ ] 5. Click each icon to preview
- [ ] 6. If icons show ❌, generate them first (step 1)

**Check shortcuts**:
- [ ] 7. Scroll to **Shortcuts** section
- [ ] 8. Verify 3 shortcuts:
  - 📝 New Note
  - 📊 Excel Workspace
  - 📅 Calendar

---

### 6. Install Prompt (Desktop - Chrome)

**Test on Chrome**:
- [ ] 1. Open http://localhost:3000 in Chrome (not DevTools browser)
- [ ] 2. Look for **⊕ Install** icon in address bar
- [ ] 3. Click the install icon
- [ ] 4. Click **"Install"** in dialog
- [ ] 5. App opens in standalone window (no browser chrome)
- [ ] 6. App icon appears in Applications folder/Start menu

**Or use install banner**:
- [ ] 1. Wait for install banner at bottom of page
- [ ] 2. Click **"Install"** button
- [ ] 3. Verify app installs

**Dismiss banner**:
- [ ] 1. Click **X** to dismiss
- [ ] 2. Banner hides
- [ ] 3. Won't show again for 7 days (localStorage check)

**Check if PWA installed**:
```javascript
// Run in DevTools Console:
window.matchMedia('(display-mode: standalone)').matches
// Should return true if running as PWA
```

---

### 7. iOS Testing (if you have iPhone/iPad)

**Requirements**:
- Must use **Safari** (not Chrome!)
- Need to access over network (not localhost)

**Option A: Using ngrok** (recommended):
```bash
# In a new terminal:
npx ngrok http 3000

# Copy the https://xxx.ngrok.io URL
# Open that URL in Safari on iPhone
```

**Option B: Using local IP**:
```bash
# Find your local IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from iPhone Safari:
# http://192.168.x.x:3000
```

**Install on iOS**:
- [ ] 1. Open ngrok URL in Safari on iPhone
- [ ] 2. Tap **Share** button (square with arrow)
- [ ] 3. Scroll down, tap **"Add to Home Screen"**
- [ ] 4. Tap **"Add"** (top right)
- [ ] 5. App icon appears on home screen
- [ ] 6. Tap icon to open in standalone mode

**Or use install instructions**:
- [ ] 1. Visit the site in iOS Safari
- [ ] 2. iOS install modal should auto-appear
- [ ] 3. Follow the 3-step instructions

---

### 8. Android Testing (if you have Android device)

**Requirements**:
- Must use **Chrome** browser
- Can use localhost if USB debugging

**Using Chrome Remote Debugging**:
```bash
# 1. Enable USB debugging on Android
# 2. Connect phone to computer
# 3. Chrome → chrome://inspect
# 4. Open http://localhost:3000 on phone
```

**Or use ngrok** (like iOS above)

**Install on Android**:
- [ ] 1. Open URL in Chrome on Android
- [ ] 2. Install banner appears automatically
- [ ] 3. Tap **"Install"** or **"Add to Home Screen"**
- [ ] 4. App installs to home screen
- [ ] 5. Long-press icon to see shortcuts:
  - 📝 New Note
  - 📊 Excel Workspace
  - 📅 Calendar

---

### 9. Update Notification

**Test update flow**:
- [ ] 1. With app running, edit `service-worker.js`
- [ ] 2. Change version: `CACHE_NAME = 'notes-app-v2.2.0'`
- [ ] 3. Save file
- [ ] 4. Reload page in browser
- [ ] 5. Update notification appears (top-right)
- [ ] 6. Click **"Update Now"**
- [ ] 7. Page reloads with new version

**Verify update**:
```javascript
// DevTools Console:
caches.keys()
// Should show 'notes-app-v2.2.0'
```

---

### 10. Online/Offline Detection

**Test connection status**:
- [ ] 1. Start with app running online
- [ ] 2. DevTools → Network → Check "Offline"
- [ ] 3. Toast appears: "📡 You are offline. Changes will sync when online."
- [ ] 4. Uncheck "Offline"
- [ ] 5. Toast appears: "✅ Back online! Syncing data..."

---

### 11. Share Target (Android only)

**Test file sharing**:
- [ ] 1. Install PWA on Android
- [ ] 2. Download a .xlsx or .csv file
- [ ] 3. Open Files app → Share button
- [ ] 4. "Notes App" appears in share menu
- [ ] 5. Share file to Notes App
- [ ] 6. App opens with file imported

---

### 12. Navigation & Pages

**Test all pages work**:
- [ ] 1. Home page loads: http://localhost:3000/
- [ ] 2. Excel workspace: http://localhost:3000/excel.html
- [ ] 3. Calendar: http://localhost:3000/calendar.html
- [ ] 4. SSO: http://localhost:3000/sso.html
- [ ] 5. Features: http://localhost:3000/features.html

**Test while offline**:
- [ ] 6. Go offline (DevTools → Network → Offline)
- [ ] 7. Navigate to each page
- [ ] 8. All pages load from cache
- [ ] 9. No errors in console

---

### 13. Performance Check

**Run Lighthouse PWA Audit**:
- [ ] 1. Open http://localhost:3000 in Chrome
- [ ] 2. DevTools → Lighthouse tab
- [ ] 3. Select **"Progressive Web App"**
- [ ] 4. Click **"Analyze page load"**
- [ ] 5. Should get 90+ score

**Expected checks**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Themed omnibox
- ✅ Has a valid apple-touch-icon
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color

---

## 🐛 Troubleshooting

### Service Worker not registering
```javascript
// Check errors in console
// Common fixes:
// 1. Must use http://localhost (not file://)
// 2. Clear browser cache (Cmd+Shift+Delete)
// 3. Unregister old service worker:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
// 4. Hard reload (Cmd+Shift+R)
```

### Icons not showing
```bash
# Make sure icons are generated and saved to:
ls -la /Users/haos/Projects/azure-psql-app/app/public/icons/

# Should show:
# icon-72x72.png
# icon-96x96.png
# ... (all 8 sizes)
```

### Manifest errors
```javascript
// Check manifest in DevTools:
fetch('/manifest.json').then(r => r.json()).then(console.log)

// Validate at:
// https://manifest-validator.appspot.com
```

### Can't install on iOS
- ❗ Must use Safari (not Chrome)
- ❗ Must use HTTPS or ngrok (not http://localhost)
- ❗ All icons must exist
- ❗ Manifest must be valid

### Install prompt not showing (Chrome)
- Must visit site at least twice
- At least 5 minutes apart
- User can't have dismissed it recently
- Or just use install icon in address bar

---

## ✅ Success Criteria

Your PWA is working correctly if:

- ✅ Service worker registers and activates
- ✅ All pages cached and work offline
- ✅ Install prompt appears (or manual install works)
- ✅ App opens in standalone mode (no browser UI)
- ✅ Icons display correctly
- ✅ Lighthouse PWA score > 90
- ✅ Update notifications work
- ✅ Offline toast appears when disconnected
- ✅ All pages accessible and functional

---

## 🎯 Quick Test (5 minutes)

**Essential tests to verify PWA is working**:

1. ✅ Open http://localhost:3000
2. ✅ F12 → Application → Service Workers → Verify "activated"
3. ✅ Application → Cache Storage → Verify files cached
4. ✅ Network → Check "Offline" → Refresh → Page still loads
5. ✅ Application → Manifest → Verify name, icons, theme
6. ✅ Look for install icon in address bar → Click → Install
7. ✅ Open installed app → Verify standalone mode
8. ✅ Close app → Icon in Applications/Start Menu

**If all 8 steps pass → PWA is working! 🎉**

---

## 📊 Test Results Log

Fill this out as you test:

```
Date: _________________
Tester: _______________

[ ] 1. Icons generated (8 files)
[ ] 2. Service worker registered
[ ] 3. Cache populated
[ ] 4. Offline mode works
[ ] 5. Manifest valid
[ ] 6. Install prompt works
[ ] 7. Standalone mode works
[ ] 8. All pages load offline
[ ] 9. Update notification works
[ ] 10. Lighthouse score: _____/100

Issues found:
_______________________________
_______________________________
_______________________________

Overall Status: ⭕ Pass / ❌ Fail
```

---

**Current Status**: 
- ✅ Server running at http://localhost:3000
- ✅ Icon generator open in browser
- ⏳ Waiting for icon generation
- ⏳ Ready for testing

**Next Step**: Generate the 8 PNG icons using the icon generator!
