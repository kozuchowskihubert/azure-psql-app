# Mobile Quick Reference - Synth 2600 Studio

## 📱 Quick Access Guide

### For Mobile Users

#### First Time Setup
1. **Visit**: https://your-app.azurewebsites.net/synth-2600-studio.html
2. **Add to Home Screen** (Optional PWA):
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen
3. **Allow Audio**: Tap "Play" button to enable sound

#### Navigation Basics

**Top Menu Bar**
- 🎛️ Logo - Branding
- ☰ Menu - Opens navigation options

**Hamburger Menu (☰)**
- Synthesizer - Main synth interface
- Patterns - Pre-built patch patterns
- MIDI Generator - Create MIDI sequences
- CLI - Terminal interface
- Home - Return to main page

**Bottom Tabs** (Always visible on mobile)
- 🎨 **Canvas** - Patch matrix and module rack
- 🎛️ **Controls** - Oscillators, filters, envelopes
- ⭐ **Presets** - Preset library and randomize

#### Common Tasks

**Load a Preset**
1. Tap **Presets** tab (bottom)
2. Scroll and tap a preset
3. Return to **Controls** or **Canvas** tab

**Adjust Parameters**
1. Tap **Controls** tab
2. Drag sliders to adjust values
3. Values update in real-time

**Create Patch Cable**
1. Tap **Canvas** tab
2. Tap green output socket
3. Tap red input socket
4. Cable appears

**Randomize Patch**
1. Tap **Presets** tab
2. Tap **Randomize Patch** button
3. Check **Controls** for new settings

**Play Sound**
1. Configure patch
2. Tap **Play Synthesized Note** button
3. Adjust and replay as needed

### Device-Specific Tips

#### iPhone / iPad
- Portrait mode recommended for controls
- Landscape mode better for patch canvas
- Use two fingers to scroll sidebars
- Safari works best for Web Audio

#### Android
- Chrome recommended
- Enable JavaScript and Web Audio
- Performance best on Android 10+
- Samsung Internet also supported

### Touch Gestures

- **Tap** - Select / Activate
- **Drag** - Adjust sliders
- **Scroll** - Navigate lists
- **Pinch** - (Future: Zoom canvas)

### Troubleshooting

**No Sound**
- Tap "Play" button first (iOS requires gesture)
- Check device volume
- Ensure not in silent mode
- Try in Safari (iOS) or Chrome (Android)

**Layout Issues**
- Rotate device and back
- Refresh page
- Clear browser cache
- Update browser to latest version

**Touch Not Working**
- Tap larger socket areas
- Ensure touch targets are 44px+
- Check if browser zoom is at 100%
- Try in different browser

**Slow Performance**
- Close other browser tabs
- Restart browser
- Check device available memory
- Reduce active patches

---

## 🎹 For Desktop Users

Everything works as before! The mobile rebuild has **zero impact** on desktop experience.

### Desktop Layout
```
Presets Sidebar | Patch Canvas | Controls Sidebar
    (280px)     |    (fluid)   |     (320px)
```

### Desktop Navigation
- Top bar buttons always visible
- Click to switch panels
- All features accessible
- No hamburger menu shown

---

## 🎯 Quick Stats

**Responsive Breakpoints**: 5 levels
**Touch Targets**: 44px minimum
**Mobile Navigation**: Hamburger + Bottom tabs
**Load Time**: <3 seconds on 3G
**PWA**: Installable on home screen
**Offline**: Works with service worker

---

## 📖 Full Documentation

- **Mobile Design**: `docs/MOBILE_RESPONSIVE_GUIDE.md`
- **Testing Guide**: `docs/MOBILE_TESTING_GUIDE.md`
- **Build Summary**: `BUILD_SUMMARY.md`

---

**Version**: 2.0 Mobile  
**Updated**: 2025-11-22  
**Status**: ✅ Production Ready

🎵 Happy mobile music making! 📱🎹
