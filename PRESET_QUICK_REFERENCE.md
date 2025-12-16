# Beat Maker Preset System - Quick Reference 🎵

## Dropdown Menu Locations

```
┌─────────────────────────────────────────────────────────────┐
│                    HAOS.fm BEAT MAKER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Kick        ████░░░░████░░░░████░░░░████                    │
│                                                               │
│  Snare       ░░░░████░░░░████░░░░████░░░░                    │
│                                                               │
│  Hi-Hat      ██░░██░░██░░██░░██░░██░░██░░                    │
│                                                               │
│  Bass        ████░░░░░░░░████░░░░████░░░░                    │
│                                                               │
│  Synth       ░░░░░░░░████░░░░░░░░████░░░░                    │
│                                                               │
│  Piano       ████░░░░████░░░░████░░░░████                    │
│  [Classic Grand ▼]      ← DROPDOWN MENU                      │
│                                                               │
│  Organ       ░░░░████░░░░████░░░░████░░░░                    │
│  [Full Hammond ▼]       ← DROPDOWN MENU                      │
│                                                               │
│  Strings     ████████░░░░████████░░░░░░░░                    │
│  [Lush Strings ▼]       ← DROPDOWN MENU                      │
│                                                               │
│  Violin      ░░░░░░░░████░░░░████░░░░████                    │
│  [Classical Violin ▼]   ← DROPDOWN MENU                      │
│                                                               │
│  Trumpet     ████░░░░░░░░████░░░░░░░░████                    │
│  [Bright Brass ▼]       ← DROPDOWN MENU                      │
│                                                               │
│  Guitar      ░░░░████████░░░░████████░░░░                    │
│  [Acoustic Guitar ▼]    ← DROPDOWN MENU                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Preset Menu Options

### 🎹 Piano Dropdown
```
┌─────────────────────┐
│ Classic Grand   ✓   │ ← Default
├─────────────────────┤
│ Bright Piano        │
├─────────────────────┤
│ Mellow Piano        │
├─────────────────────┤
│ Electric Piano      │
└─────────────────────┘
```
**Sound Characteristics:**
- Classic Grand: Balanced, concert hall
- Bright: Sharp attack, studio sound
- Mellow: Warm, soft sustain
- Electric: Tine sound, short decay

---

### 🎛️ Organ Dropdown
```
┌─────────────────────┐
│ Full Hammond    ✓   │ ← Default
├─────────────────────┤
│ Jazz Organ          │
├─────────────────────┤
│ Church Organ        │
├─────────────────────┤
│ Soft Organ          │
└─────────────────────┘
```
**Sound Characteristics:**
- Full Hammond: All drawbars, fast Leslie
- Jazz: Mellow drawbars, smooth rotation
- Church: Cathedral pipes, no Leslie
- Soft: Quiet mix, gentle modulation

---

### 🎻 Strings Dropdown
```
┌─────────────────────┐
│ Lush Strings    ✓   │ ← Default
├─────────────────────┤
│ Solo Cello          │
├─────────────────────┤
│ String Ensemble     │
├─────────────────────┤
│ Warm Pad            │
└─────────────────────┘
```
**Sound Characteristics:**
- Lush: Wide stereo, medium attack
- Solo Cello: Tight, focused, quick attack
- Ensemble: Very wide, slow attack
- Warm Pad: Soft, medium width, smooth

---

### 🎻 Violin Dropdown
```
┌─────────────────────┐
│ Classical Violin ✓  │ ← Default
├─────────────────────┤
│ Solo Violin         │
├─────────────────────┤
│ Fiddle              │
├─────────────────────┤
│ Dark Viola          │
└─────────────────────┘
```
**Sound Characteristics:**
- Classical: Moderate vibrato, balanced tone
- Solo: Expressive vibrato, bright
- Fiddle: Light vibrato, sharp and bright
- Dark Viola: Rich vibrato, low and warm

---

### 🎺 Trumpet Dropdown
```
┌─────────────────────┐
│ Bright Brass    ✓   │ ← Default
├─────────────────────┤
│ Muted Trumpet       │
├─────────────────────┤
│ Jazz Trumpet        │
├─────────────────────┤
│ Flugelhorn          │
└─────────────────────┘
```
**Sound Characteristics:**
- Bright Brass: Full harmonics, sharp attack
- Muted: Soft harmonics, subdued
- Jazz: Balanced harmonics, quick attack
- Flugelhorn: Warm harmonics, mellow tone

---

### 🎸 Guitar Dropdown
```
┌─────────────────────┐
│ Acoustic Guitar ✓   │ ← Default
├─────────────────────┤
│ Electric Clean      │
├─────────────────────┤
│ Nylon Guitar        │
├─────────────────────┤
│ Steel Guitar        │
└─────────────────────┘
```
**Sound Characteristics:**
- Acoustic: Balanced, medium sustain
- Electric Clean: Bright, long sustain
- Nylon: Soft, short sustain, warm
- Steel: Bright, very long sustain, sharp

---

## How Presets Affect Sound

### Frequency Modulation Parameters

| Instrument | Parameter 1       | Parameter 2       | Parameter 3      |
|-----------|-------------------|-------------------|------------------|
| Piano     | Brightness Filter | Decay Time        | Harmonic Strength|
| Organ     | Drawbar Mix (9)   | Leslie Rate       | -                |
| Strings   | Detune Amount     | Attack Time       | Filter Cutoff    |
| Violin    | Vibrato Rate      | Vibrato Depth     | Brightness       |
| Trumpet   | Harmonic Mix (5)  | Attack Time       | Brightness       |
| Guitar    | Filter Cutoff     | Pluck Sharpness   | Sustain Time     |

### Example: Piano "Classic Grand" → "Bright Piano"
```
Classic Grand:
  Brightness: 8000 Hz  ──→  12000 Hz  (50% increase)
  Decay: 1.5s         ──→  1.2s       (20% faster)
  Harmonics: 1.0x     ──→  1.3x       (30% stronger)

Result: Sharper attack, shorter sustain, more overtones
```

### Example: Organ "Full Hammond" → "Jazz Organ"
```
Full Hammond:
  Drawbars: [0.8, 1.0, 0.7, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02]
  Leslie: 6.5 Hz (fast)

Jazz Organ:
  Drawbars: [0.5, 0.8, 0.6, 0.4, 0.2, 0.1, 0, 0, 0]
  Leslie: 5.0 Hz (medium)

Result: Softer fundamentals, less upper harmonics, slower rotation
```

---

## Sound Preview Feature

**Interaction Flow:**
```
1. User clicks dropdown        → Menu opens
2. User hovers over "Bright"   → (optional: show description)
3. User selects "Bright"       → Menu closes
4. System plays A4 (440 Hz)    → Sound preview
5. Preset updates in memory    → Future notes use new preset
```

**Technical Implementation:**
```javascript
presetSelect.addEventListener('change', (e) => {
  currentPresets[track.type] = e.target.value;  // Update state
  const now = audioContext.currentTime;
  const freq = 440;  // A4 note
  track.synth(now, freq);  // Play preview
});
```

---

## Usage Tips

### 🎯 Quick Preset Comparison
1. Click Piano dropdown
2. Select "Classic Grand" → Note the sound
3. Select "Bright Piano" → Compare difference
4. Select "Mellow Piano" → Notice warmth
5. Select "Electric Piano" → Hear short decay

### 🎼 Building Arrangements
**Jazz Combo:**
- Piano: "Mellow Piano" (warm chords)
- Organ: "Jazz Organ" (smooth comping)
- Guitar: "Nylon Guitar" (soft strumming)
- Trumpet: "Muted Trumpet" (subdued lead)

**Classical Orchestra:**
- Piano: "Classic Grand" (solo passages)
- Strings: "String Ensemble" (wide section)
- Violin: "Classical Violin" (lead melody)
- Organ: "Church Organ" (low sustained chords)

**Electronic/Trap:**
- Piano: "Electric Piano" (staccato hits)
- Organ: "Full Hammond" (Leslie swirl)
- Strings: "Lush Strings" (ambient pads)
- Guitar: "Electric Clean" (rhythmic plucks)

### 🔊 Sound Design Workflow
1. **Start with defaults** → Test pattern
2. **Change 1 instrument** → Compare A/B
3. **Adjust preset** → Find sweet spot
4. **Layer instruments** → Build texture
5. **Iterate** → Refine arrangement

---

## Keyboard Shortcuts (Future Enhancement)

Potential shortcuts for power users:
```
Ctrl + 1-6   → Select instrument row
1-4          → Select preset 1-4 for current instrument
Space        → Play/Stop sequencer
P            → Preview current preset
R            → Reset to default presets
```

---

## Troubleshooting

### Dropdown Not Visible?
- Check if instrument is melodic (Piano, Organ, Strings, Violin, Trumpet, Guitar)
- Drum instruments (Kick, Snare, Hi-Hat, Bass, Synth) do NOT have dropdowns

### Sound Preview Not Playing?
- Check browser audio permissions
- Ensure audio context is running (click page first)
- Verify volume is not muted

### Preset Not Changing?
- Confirm dropdown selection changed
- Check console for JavaScript errors
- Verify `currentPresets` object updates

### Sound Quality Issues?
- Try different preset (some brighter/darker)
- Adjust master volume
- Check for audio clipping

---

## Technical Details

### CSS Styling (Inline)
```css
select {
  font-size: 10px;
  padding: 2px;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 3px;
  color: #64FFDA;
  cursor: pointer;
}
```

### DOM Structure
```html
<div class="instrument-row">
  <div style="display: flex; flex-direction: column; gap: 4px">
    <div class="instrument-label">Piano</div>
    <select>
      <option value="Classic Grand">Classic Grand</option>
      <option value="Bright Piano">Bright Piano</option>
      <option value="Mellow Piano">Mellow Piano</option>
      <option value="Electric Piano">Electric Piano</option>
    </select>
  </div>
  <div class="steps-container">
    <!-- 16 step buttons -->
  </div>
</div>
```

---

## Summary

✅ **24 Presets**: 6 instruments × 4 variations  
✅ **Dropdown UI**: Intuitive preset selection  
✅ **Sound Preview**: Instant audio feedback  
✅ **Real-time Update**: No page reload needed  
✅ **Professional Quality**: Studio-grade presets  

**Access**: Open `app/public/beat-maker.html` in browser  
**Location**: Dropdown appears below each melodic instrument name  
**Usage**: Click dropdown → Select preset → Hear preview → Create music!

---

**End of Quick Reference**
