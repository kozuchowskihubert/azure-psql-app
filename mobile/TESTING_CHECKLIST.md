# Mobile App Testing Checklist

## Prerequisites
- ✅ Backend API live at https://haos.fm
- ✅ 50 factory presets available
- ✅ App icons created (icon.png, adaptive-icon.png, splash.png)
- ✅ PresetService updated to use /api/studio/presets

## Setup

```bash
# Install dependencies
cd /Users/haos/azure-psql-app/mobile
npm install

# Start Expo dev server
npm start

# Scan QR code with Expo Go app
# iOS: Use Camera app
# Android: Use Expo Go app
```

## Testing Scenarios

### 1. App Startup ✅
- [ ] App loads without crashes
- [ ] Splash screen displays HAOS logo
- [ ] Dark theme applied correctly
- [ ] Bottom navigation visible

### 2. Authentication 🔐
- [ ] Login screen displays
- [ ] Google OAuth button present
- [ ] Email/password fields work
- [ ] Session persists after restart

### 3. Home Screen 🏠
- [ ] Dashboard loads
- [ ] Quick actions visible
- [ ] User info displays (if logged in)
- [ ] Navigation works

### 4. Preset Library 📚

#### Initial Load
- [ ] Presets screen opens
- [ ] Loading indicator shows
- [ ] 50 presets load from API
- [ ] Preset cards display correctly
- [ ] Images/icons render

#### Search & Filters
- [ ] Search bar works
- [ ] Search by name works
- [ ] Search by description works
- [ ] Search by tags works
- [ ] Category filters work:
  - [ ] All
  - [ ] Bass
  - [ ] Lead
  - [ ] Pad
  - [ ] FX
  - [ ] Drum
- [ ] Workspace filters work:
  - [ ] All
  - [ ] TECHNO (shows TB-303, TR-909, TR-808)
  - [ ] MODULAR (shows ARP-2600)
  - [ ] BUILDER (shows custom)
- [ ] Multiple filters combine correctly

#### Tabs
- [ ] "All Presets" tab shows all
- [ ] "Downloaded" tab shows count
- [ ] Switching tabs works
- [ ] Empty state shows when no downloads

#### Pull-to-Refresh
- [ ] Pull down to refresh works
- [ ] Loading indicator shows
- [ ] Presets update

#### Preset Cards
- [ ] Name displays
- [ ] Category badge shows
- [ ] Workspace type shows
- [ ] Author displays
- [ ] Description shows (2 lines max)
- [ ] Tags display (first 3)
- [ ] Featured badge shows (⭐)
- [ ] Download button visible
- [ ] Downloaded badge appears after download

#### Downloads
- [ ] Download button works
- [ ] Loading spinner shows during download
- [ ] Haptic feedback on tap
- [ ] Success message shows
- [ ] Preset saved to AsyncStorage
- [ ] Downloaded count updates
- [ ] "Downloaded" tab updates
- [ ] Download button changes to "Delete"
- [ ] Premium limit check works (5/day free)

#### Delete
- [ ] Delete button shows for downloaded presets
- [ ] Confirmation alert shows
- [ ] Delete removes from storage
- [ ] Downloaded count updates
- [ ] Tabs update correctly

#### Storage Management
- [ ] Storage info footer shows
- [ ] Download count accurate
- [ ] "Clear All" button works
- [ ] Confirmation alert shows
- [ ] All presets deleted
- [ ] Tabs reset correctly

### 5. Workspaces 🎹

#### TECHNO Workspace
- [ ] Opens from navigation
- [ ] Loads default state
- [ ] Knobs are touch-responsive
- [ ] PanResponder gestures work
- [ ] Haptic feedback on touch
- [ ] Waveform selector works
- [ ] Filter controls work
- [ ] ADSR envelope responsive
- [ ] Volume slider works
- [ ] Keyboard keys play notes
- [ ] Multi-touch works
- [ ] Audio engine starts
- [ ] Sound plays when keys pressed

#### Load Preset in TECHNO
- [ ] "Load Preset" button shows (downloaded presets)
- [ ] Tap opens workspace picker alert
- [ ] Select TECHNO workspace
- [ ] Navigate to TECHNO workspace
- [ ] Preset parameters apply:
  - [ ] Waveform loads
  - [ ] Filter settings load
  - [ ] ADSR values load
  - [ ] Volume loads
- [ ] Header shows "Preset: [name]"
- [ ] Sound matches preset

#### MODULAR Workspace
- [ ] Opens from navigation
- [ ] Placeholder screen shows
- [ ] "Coming Soon" message

#### BUILDER Workspace
- [ ] Opens from navigation
- [ ] Placeholder screen shows
- [ ] "Coming Soon" message

### 6. Account Screen 👤
- [ ] Profile info displays
- [ ] Email shows
- [ ] Subscription status shows
- [ ] Premium badge (if premium)
- [ ] Logout button works
- [ ] Settings sections visible

### 7. Premium Screen 💎
- [ ] Subscription plans display
- [ ] Free tier shows limits
- [ ] Premium tier shows benefits
- [ ] Pricing displays
- [ ] "Upgrade" buttons visible
- [ ] Premium features listed:
  - [ ] Unlimited preset downloads
  - [ ] Offline mode
  - [ ] No ads
  - [ ] Priority support

### 8. Offline Mode 📴

#### Prepare
- [ ] Download 5+ presets
- [ ] Verify downloaded count
- [ ] Enable Airplane Mode / Disable WiFi

#### Test Offline
- [ ] App still launches
- [ ] "Downloaded" tab works
- [ ] Downloaded presets display
- [ ] Can load downloaded presets
- [ ] Workspaces work offline
- [ ] Audio engine works offline
- [ ] "All Presets" tab shows cached data
- [ ] Download button disabled (no network)
- [ ] Error message shows for new downloads

#### Back Online
- [ ] Disable Airplane Mode
- [ ] Pull to refresh works
- [ ] Downloads work again
- [ ] Presets sync

### 9. Performance 🚀
- [ ] Scroll performance smooth (60fps)
- [ ] No lag on preset cards
- [ ] Search is instant
- [ ] Filters apply quickly
- [ ] Knobs respond immediately
- [ ] Audio latency low (<50ms)
- [ ] No memory leaks
- [ ] Battery usage reasonable

### 10. Error Handling 🚨

#### Network Errors
- [ ] Offline message shows
- [ ] Cached data loads
- [ ] Retry button works
- [ ] Error boundaries catch crashes

#### API Errors
- [ ] 404 handled gracefully
- [ ] 500 shows error message
- [ ] Timeout handled
- [ ] Fallback to cache works

#### Storage Errors
- [ ] Full storage handled
- [ ] Clear cache works
- [ ] Error messages helpful

### 11. UI/UX 🎨
- [ ] Dark theme consistent
- [ ] Colors: #00ff94 accent, #0a0a0a bg
- [ ] Fonts readable
- [ ] Touch targets large enough (44x44)
- [ ] Animations smooth
- [ ] Haptics appropriate
- [ ] Empty states clear
- [ ] Loading states visible
- [ ] Success/error feedback

### 12. Accessibility ♿
- [ ] Screen reader support
- [ ] Voice labels present
- [ ] Color contrast sufficient
- [ ] Text size adjustable
- [ ] Touch targets accessible

## API Endpoints Tested

```bash
# All endpoints used by mobile app

# 1. Get all presets
GET https://haos.fm/api/studio/presets
Response: { success: true, count: 50, presets: [...] }

# 2. Authentication
POST https://haos.fm/api/auth/login
POST https://haos.fm/api/auth/register
POST https://haos.fm/api/auth/google

# 3. User profile
GET https://haos.fm/api/user/profile
PUT https://haos.fm/api/user/profile

# 4. Subscription
GET https://haos.fm/api/subscription/status
POST https://haos.fm/api/subscription/upgrade
```

## Device Testing

### iOS
- [ ] iPhone 14 Pro (iOS 17+)
- [ ] iPhone SE (smaller screen)
- [ ] iPad (tablet layout)

### Android
- [ ] Pixel 7 (Android 14+)
- [ ] Samsung Galaxy (One UI)
- [ ] Small screen device

## Production Readiness

### Before App Store Submission
- [ ] All tests pass
- [ ] No crashes
- [ ] Error handling complete
- [ ] Performance acceptable
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] App icons correct
- [ ] Splash screen correct
- [ ] Bundle ID correct: fm.haos.mobile
- [ ] Version: 1.0.0

### Before Google Play Submission
- [ ] All tests pass
- [ ] Adaptive icon correct
- [ ] Package name: fm.haos.mobile
- [ ] Target SDK: 34 (Android 14)
- [ ] Permissions justified
- [ ] Privacy declarations complete

## Bug Tracking

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Example: Preset not loading | High | Fixed | Updated API endpoint |
|  |  |  |  |
|  |  |  |  |

## Performance Metrics

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| App launch time | <3s | - | - |
| Preset list load | <2s | - | - |
| Preset download | <1s | - | - |
| Workspace load | <1s | - | - |
| Audio latency | <50ms | - | - |
| Memory usage | <200MB | - | - |
| Battery drain | <5%/hr | - | - |

## Next Steps After Testing

1. ✅ Fix any bugs found
2. ✅ Implement MODULAR workspace
3. ✅ Implement BUILDER workspace
4. ✅ Add in-app purchases
5. ✅ Create screenshots for stores
6. ✅ Write app descriptions
7. ✅ Submit to App Store
8. ✅ Submit to Google Play

---

## Quick Commands

```bash
# Start testing
cd mobile && npm start

# Check logs
npx react-native log-ios  # iOS
npx react-native log-android  # Android

# Clear cache
rm -rf node_modules
npm install

# Reset Expo
expo start -c

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
```
