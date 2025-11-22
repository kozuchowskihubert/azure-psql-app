# 🧪 Sequencer-Patch Integration - Testing Guide

## ✅ Server Status

```
Server: Running on port 3000 ✓
URL: http://localhost:3000/synth-patch-sequencer.html
Status: Page loaded successfully ✓
```

---

## 🎯 Testing Checklist

### Phase 1: Visual Interface ✓

**Check these elements are visible:**

- [ ] Header: "🎛️ Behringer 2600 Patch Sequencer"
- [ ] Three preset buttons (Acid Bass, Techno Lead, Random Melody)
- [ ] Play/Stop transport controls
- [ ] 16-step sequencer grid
- [ ] CV/Gate/Frequency meters
- [ ] Patch matrix panel
- [ ] Parameter sliders (Filter, Envelope, Tempo, Volume)

---

### Phase 2: Load Presets

#### Test 1: Acid Bass Preset

**Steps:**
1. Click the **"Acid Bass"** button
2. Check that the button highlights (becomes active)
3. Verify patch cables appear in the matrix below:
   ```
   sequencer.CV → vco1.CV
   sequencer.GATE → env.GATE
   vco1.OUT → vcf.IN
   env.OUT → vcf.CUTOFF
   vcf.OUT → vca.IN
   env.OUT → vca.CV
   ```

**Expected:**
- ✅ Button should glow blue/green
- ✅ 6 patch cables should appear
- ✅ Console should show: `🎛️ Loaded preset: acid-bass`

---

#### Test 2: Techno Lead Preset

**Steps:**
1. Click the **"Techno Lead"** button
2. Verify different patches appear
3. Should see 8 patch cables (dual VCO routing)

**Expected:**
- ✅ Different patch configuration
- ✅ Includes velocity → filter routing
- ✅ Console: `🎛️ Loaded preset: techno-lead`

---

#### Test 3: Random Melody Preset

**Steps:**
1. Click the **"Random Melody"** button
2. Verify S&H patches appear
3. Should see noise → S&H routing

**Expected:**
- ✅ Unique patch configuration
- ✅ Noise and S&H modules in routing
- ✅ Console: `🎛️ Loaded preset: random-melody`

---

### Phase 3: Sequencer Playback

#### Test 4: Start/Stop Sequencer

**Steps:**
1. Load "Acid Bass" preset
2. Click **▶ Play** button
3. **IMPORTANT**: Click anywhere on page first (browser requires user gesture for audio)
4. Observe for 4-8 seconds
5. Click **⏹ Stop** button

**Expected Results:**

**Visual:**
- ✅ Step indicators light up in sequence (1-16)
- ✅ Blue glow moves across step grid
- ✅ CV meter shows changing voltage
- ✅ Gate meter pulses on/off
- ✅ Frequency display updates with Hz values
- ✅ Patch cables glow when signal flows

**Audio:**
- ✅ Hear bass notes playing in sequence
- ✅ Classic 303-style "squelch" filter sound
- ✅ Notes are punchy and rhythmic
- ✅ No clicks, pops, or distortion

**Console:**
- ✅ `▶️ Patch-aware sequencer started`
- ✅ No errors

---

#### Test 5: CV Signal Routing

**While "Acid Bass" is playing, observe:**

**CV Meter:**
- Should show varying voltage (e.g., 1.5V, 2.0V, 2.5V)
- Bar should animate
- Values should change with each step

**Frequency Display:**
- Should show Hz values (e.g., 261 Hz, 523 Hz, 1046 Hz)
- Should match CV voltage (1V/octave)
- Should update smoothly

**Expected:**
- ✅ CV values between 0-5V
- ✅ Frequencies correspond to notes
- ✅ Real-time updates

---

#### Test 6: Gate Triggering

**Watch the Gate meter while playing:**

**Observations:**
- Gate should pulse 1/0/1/0
- Bar should fill/empty
- Should sync with audio notes

**Expected:**
- ✅ Gate HIGH (1) when note plays
- ✅ Gate LOW (0) when silent
- ✅ Visual sync with audio

---

### Phase 4: Parameter Adjustments

#### Test 7: Filter Cutoff

**Steps:**
1. Start "Acid Bass" playing
2. Move **Filter Cutoff** slider left (low) → right (high)
3. Listen to tone change

**Expected:**
- ✅ Low values (100-500 Hz): Dark, muffled bass
- ✅ Medium (500-2000 Hz): Balanced tone
- ✅ High (2000+ Hz): Bright, cutting sound
- ✅ Real-time response, no lag

---

#### Test 8: Resonance

**Steps:**
1. Keep "Acid Bass" playing
2. Move **Resonance** slider from 0 → 20

**Expected:**
- ✅ Low (0-5): Smooth filtering
- ✅ Medium (5-10): Classic resonance
- ✅ High (10-20): Extreme "squelch" and whistling
- ✅ Might self-oscillate at very high values

---

#### Test 9: Envelope Shaping

**Steps:**
1. Play "Acid Bass"
2. Adjust **Attack** slider:
   - Very fast (0.001s) = instant notes
   - Slow (0.5s) = fading in notes
3. Adjust **Release** slider:
   - Fast (0.01s) = short, clipped notes
   - Slow (1s) = long, sustained notes

**Expected:**
- ✅ Attack controls note start time
- ✅ Release controls note tail length
- ✅ Immediate audible effect

---

#### Test 10: Tempo Control

**Steps:**
1. Play any preset
2. Move **Tempo** slider:
   - Low (60 BPM) = slow, spacious
   - Medium (120 BPM) = standard
   - High (180 BPM) = fast, frantic

**Expected:**
- ✅ Sequence speeds up/slows down
- ✅ Step grid matches tempo
- ✅ No audio glitches during change

---

#### Test 11: Master Volume

**Steps:**
1. Play any preset
2. Move **Volume** slider:
   - 0 = silence
   - 0.5 = medium
   - 1.0 = maximum

**Expected:**
- ✅ Smooth volume changes
- ✅ No distortion at max
- ✅ Complete silence at 0

---

### Phase 5: Different Presets Sound Test

#### Test 12: Acid Bass Sound

**Load "Acid Bass" and play:**

**Characteristics to verify:**
- ✅ Deep, punchy bass (around 55 Hz fundamental)
- ✅ Sawtooth waveform character
- ✅ Filter "squelch" on each note
- ✅ Fast attack, short decay
- ✅ Classic 303 vibe

---

#### Test 13: Techno Lead Sound

**Load "Techno Lead" and play:**

**Characteristics to verify:**
- ✅ Brighter, higher pitched (220 Hz range)
- ✅ Rich harmonic content (dual VCO)
- ✅ Arpeggio-style pattern
- ✅ Velocity affects brightness
- ✅ More sustained notes

---

#### Test 14: Random Melody Sound

**Load "Random Melody" and play:**

**Characteristics to verify:**
- ✅ Unpredictable note sequence (S&H randomness)
- ✅ Square wave character
- ✅ Percussive, rhythmic feel
- ✅ Never exactly repeats
- ✅ Generative quality

---

### Phase 6: Edge Cases & Stability

#### Test 15: Rapid Preset Switching

**Steps:**
1. Start playing "Acid Bass"
2. Quickly click "Techno Lead"
3. Quickly click "Random Melody"
4. Click back to "Acid Bass"

**Expected:**
- ✅ Patches update smoothly
- ✅ No audio glitches
- ✅ No crashes
- ✅ Correct sound for each preset

---

#### Test 16: Start/Stop Cycling

**Steps:**
1. Load any preset
2. Click Play → Stop → Play → Stop (repeat 5 times)

**Expected:**
- ✅ Clean start/stop every time
- ✅ No stuck notes
- ✅ No accumulating errors
- ✅ Consistent behavior

---

#### Test 17: Extreme Parameter Values

**Steps:**
1. Play "Acid Bass"
2. Set parameters to extremes:
   - Cutoff: 100 Hz
   - Resonance: 20
   - Attack: 1s
   - Release: 2s
   - Tempo: 60 BPM

**Expected:**
- ✅ Still produces sound
- ✅ No crashes
- ✅ Extreme but usable tones
- ✅ High resonance might self-oscillate (OK)

---

#### Test 18: Browser Console Check

**Open browser DevTools (F12) → Console tab**

**Check for:**
- ✅ `🎛️ Patch-Aware Sequencer initialized`
- ✅ `🔗 Sequencer connected to patch matrix`
- ✅ `🎛️ Loaded preset: [name]`
- ✅ `▶️ Patch-aware sequencer started`
- ✅ `⏹️ Patch-aware sequencer stopped`

**Should NOT see:**
- ❌ Red error messages
- ❌ "undefined is not a function"
- ❌ Failed to load resources
- ❌ Audio context errors

---

### Phase 7: Visual Feedback

#### Test 19: Step Indicators

**While playing, verify:**
- ✅ Current step has blue glow
- ✅ Steps with notes have purple background
- ✅ Only one step is "active" at a time
- ✅ Progress moves left to right (1→16)
- ✅ Loops back to step 1 after 16

---

#### Test 20: Patch Cable Glow

**While playing, watch patch matrix:**
- ✅ Cables briefly glow when signal flows
- ✅ Glow syncs with audio
- ✅ Sequencer patches glow most prominently
- ✅ Smooth animation

---

#### Test 21: Meter Animations

**Observe all meters:**

**CV Bar:**
- ✅ Animates smoothly
- ✅ Width represents voltage (0-5V)
- ✅ Gradient color (blue to green)

**Gate Bar:**
- ✅ Fills on gate HIGH
- ✅ Empties on gate LOW
- ✅ Binary on/off behavior

**Frequency Display:**
- ✅ Large, readable numbers
- ✅ Updates match audio pitch
- ✅ Shows Hz values

---

### Phase 8: Cross-Browser Testing (Optional)

If possible, test in multiple browsers:

- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**All should work identically with Web Audio API support.**

---

## 🐛 Known Issues to Verify

### Should NOT Happen:
- ❌ Clicks/pops when notes start
- ❌ Stuck notes that don't stop
- ❌ Silence when should be playing
- ❌ Distortion at normal volumes
- ❌ Console errors
- ❌ Frozen UI
- ❌ Wrong frequencies for CV values

### Acceptable Behavior:
- ✅ High resonance might self-oscillate (extreme settings)
- ✅ Very fast attack/release might click slightly (< 5ms)
- ✅ CSS warning about `-webkit-appearance` (doesn't affect function)

---

## 📊 Performance Metrics

**While playing, check Activity Monitor / Task Manager:**

**Acceptable:**
- ✅ CPU: 5-15% (browser tab)
- ✅ Memory: 50-100 MB
- ✅ No memory leaks over time
- ✅ Smooth 60fps animation

**If issues:**
- ❌ CPU > 30% = investigate
- ❌ Memory growing = memory leak
- ❌ Stuttering = performance problem

---

## ✅ Success Criteria

### Minimum Working Test:
1. ✅ Load "Acid Bass" preset
2. ✅ Click Play
3. ✅ Hear bass notes playing
4. ✅ See steps lighting up
5. ✅ No errors in console

### Full Integration Test:
1. ✅ All 3 presets load
2. ✅ All 3 presets play correctly
3. ✅ CV/Gate routing works
4. ✅ Visual feedback accurate
5. ✅ Parameters adjust sound
6. ✅ Start/stop reliable
7. ✅ No crashes or errors
8. ✅ Professional sound quality

---

## 🎯 Quick Test Script

**5-Minute Smoke Test:**

```
1. Open http://localhost:3000/synth-patch-sequencer.html
2. Click "Acid Bass" → ▶ Play
   → Should hear bass, see steps lighting
3. Adjust Filter Cutoff slider
   → Sound should brighten/darken
4. Click ⏹ Stop
   → Sound stops, steps reset
5. Click "Techno Lead" → ▶ Play
   → Different sound, higher pitched
6. Click "Random Melody" → ▶ Play
   → Random notes, never repeats
7. Check console (F12)
   → No red errors

If all pass → Integration works! ✅
```

---

## 📸 Expected Screenshots

**Main Interface:**
- Header with title
- 3 preset buttons in grid
- Play/Stop buttons
- 16-step grid (1-16)
- Meters showing CV/Gate/Freq
- Patch matrix with cables
- 6 parameter sliders

**While Playing:**
- One step glowing blue
- CV bar animated
- Gate bar pulsing
- Frequency showing Hz
- Cables briefly glowing
- No errors visible

---

## 🎵 Audio Quality Test

**Listen for these qualities:**

**Acid Bass:**
- Deep, powerful low end
- Clear filter modulation
- Punchy attack
- Classic 303 character

**Techno Lead:**
- Rich harmonics
- Bright, cutting
- Arpeggio pattern
- Velocity dynamics

**Random Melody:**
- Percussive quality
- Unpredictable notes
- Clean square wave
- Generative feel

**All Sounds:**
- ✅ No clicks/pops
- ✅ No distortion
- ✅ Clean envelopes
- ✅ Stable tuning

---

## 📝 Test Results Template

```
Date: _______________
Browser: _______________
OS: _______________

Visual Interface:        [ ] Pass  [ ] Fail
Preset Loading:          [ ] Pass  [ ] Fail
Sequencer Playback:      [ ] Pass  [ ] Fail
CV/Gate Routing:         [ ] Pass  [ ] Fail
Parameter Controls:      [ ] Pass  [ ] Fail
Sound Quality:           [ ] Pass  [ ] Fail
Visual Feedback:         [ ] Pass  [ ] Fail
Stability:               [ ] Pass  [ ] Fail

Overall: [ ] PASS  [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Ready to test!** 🧪🎛️

Open: http://localhost:3000/synth-patch-sequencer.html
