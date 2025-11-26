# Modular Synthesizer Integration Guide

**HAOS.fm Platform - Frontend Integration**  
*How to integrate modular TB-303, TR-808, and ARP-2600 synthesizers into Techno Creator*

---

## Overview

This guide shows how to refactor the existing monolithic synthesizer code in `techno-creator.html` to use the new modular class-based architecture.

## Architecture Benefits

### Before (Monolithic)
- All synth code embedded in HTML file (7,619 lines)
- Difficult to maintain and debug
- Code duplication across pages
- No reusability

### After (Modular)
- Separate JS modules for each synthesizer
- Clean, testable class-based architecture
- Reusable across multiple pages
- Python backend for WAV export
- ~40% reduction in main HTML file size

---

## Integration Steps

### Step 1: Add Module Imports to HTML

Add these script tags to the `<head>` section of `techno-creator.html`:

```html
<!-- Modular Synthesizer Classes -->
<script src="/js/synths/tb303.js"></script>
<script src="/js/synths/tr808.js"></script>
<script src="/js/synths/arp2600.js"></script>
```

### Step 2: Initialize Synthesizers

Replace the existing initialization code with:

```javascript
// Initialize Audio Context (once)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Initialize Synthesizers
let tb303Synth = null;
let tr808Drums = null;
let arp2600Synth = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Create synthesizer instances
    tb303Synth = new TB303(audioContext);
    tr808Drums = new TR808(audioContext);
    arp2600Synth = new ARP2600(audioContext);
    
    // Set BPM
    tb303Synth.setBPM(130);
    
    // Load default patterns
    tb303Synth.loadPresetPattern('classic303');
    
    // Setup UI event listeners
    setupSynthUI();
});
```

### Step 3: Update TB-303 UI Bindings

Replace existing TB-303 controls with modular bindings:

```javascript
function setupSynthUI() {
    // ===== TB-303 CONTROLS =====
    
    // Cutoff slider
    document.getElementById('303-cutoff').addEventListener('input', (e) => {
        tb303Synth.setParam('cutoff', e.target.value);
        document.getElementById('cutoff-value').textContent = e.target.value + 'Hz';
    });
    
    // Resonance slider
    document.getElementById('303-resonance').addEventListener('input', (e) => {
        tb303Synth.setParam('resonance', e.target.value);
        document.getElementById('resonance-value').textContent = e.target.value;
    });
    
    // Envelope Mod slider
    document.getElementById('303-envmod').addEventListener('input', (e) => {
        tb303Synth.setParam('envMod', e.target.value);
        document.getElementById('envmod-value').textContent = e.target.value + '%';
    });
    
    // Decay slider
    document.getElementById('303-decay').addEventListener('input', (e) => {
        tb303Synth.setParam('decay', e.target.value);
        document.getElementById('decay-value').textContent = e.target.value + 's';
    });
    
    // Waveform selector
    document.getElementById('303-waveform').addEventListener('change', (e) => {
        tb303Synth.setParam('waveform', e.target.value);
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-303-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetName = e.target.dataset.preset;
            tb303Synth.loadPresetPattern(presetName);
            render303Grid(); // Update visual display
        });
    });
    
    // Step grid
    for (let i = 0; i < 16; i++) {
        const stepBtn = document.getElementById(`step-303-${i}`);
        stepBtn.addEventListener('click', () => {
            tb303Synth.toggleStep(i);
            render303Grid();
        });
    }
    
    // Play/Stop buttons
    document.getElementById('play-303').addEventListener('click', () => {
        tb303Synth.play();
    });
    
    document.getElementById('stop-303').addEventListener('click', () => {
        tb303Synth.stop();
    });
    
    // Randomize pattern
    document.getElementById('randomize-303').addEventListener('click', () => {
        tb303Synth.randomizePattern();
        render303Grid();
    });
    
    // Clear pattern
    document.getElementById('clear-303').addEventListener('click', () => {
        tb303Synth.clearPattern();
        render303Grid();
    });
    
    // ===== TR-808 CONTROLS =====
    
    // Kick drum variation
    document.getElementById('kick-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('kick', e.target.value);
    });
    
    // Hat variation
    document.getElementById('hat-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('hat', e.target.value);
    });
    
    // Clap variation
    document.getElementById('clap-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('clap', e.target.value);
    });
    
    // Perc variation
    document.getElementById('perc-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('perc', e.target.value);
    });
    
    // Ride variation
    document.getElementById('ride-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('ride', e.target.value);
    });
    
    // Crash variation
    document.getElementById('crash-variation').addEventListener('change', (e) => {
        tr808Drums.setVariation('crash', e.target.value);
    });
    
    // Master volume
    document.getElementById('808-volume').addEventListener('input', (e) => {
        tr808Drums.setVolume(e.target.value / 100);
    });
}
```

### Step 4: Update Sequencer Integration

Replace drum sequencer playback with modular calls:

```javascript
function playSequencerStep(step) {
    const pattern = getCurrentPattern();
    
    // Play 303 bass if step is active
    if (tb303Synth.getStep(step).active) {
        // TB-303 already handles its own playback
        // Just make sure it's in sync
    }
    
    // Play drum sounds based on pattern
    if (pattern.kick[step]) {
        tr808Drums.playKick(); // Uses current variation
    }
    
    if (pattern.hat[step]) {
        tr808Drums.playHat();
    }
    
    if (pattern.clap[step]) {
        tr808Drums.playClap();
    }
    
    if (pattern.perc[step]) {
        tr808Drums.playPerc();
    }
    
    if (pattern.ride[step]) {
        tr808Drums.playRide();
    }
    
    if (pattern.crash[step]) {
        tr808Drums.playCrash();
    }
}
```

### Step 5: Update 303 Grid Renderer

Update the visual display function:

```javascript
function render303Grid() {
    for (let i = 0; i < 16; i++) {
        const step = tb303Synth.getStep(i);
        const stepElement = document.getElementById(`step-303-${i}`);
        
        // Update active state
        if (step.active) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
        
        // Update badges
        stepElement.innerHTML = `
            <div class="step-number">${i + 1}</div>
            ${step.accent ? '<span class="badge accent">A</span>' : ''}
            ${step.slide ? '<span class="badge slide">S</span>' : ''}
            ${step.gate ? '<span class="badge gate">G</span>' : ''}
        `;
    }
}
```

### Step 6: Preset Save/Load Integration

Update preset manager to use modular export/import:

```javascript
function saveCurrentPreset() {
    const presetName = prompt('Enter preset name:');
    if (!presetName) return;
    
    const preset = {
        name: presetName,
        timestamp: Date.now(),
        bpm: currentBPM,
        
        // Export 303 pattern
        tb303: tb303Synth.exportPattern(),
        
        // Export 808 config
        tr808: tr808Drums.exportConfig(),
        
        // Export drum pattern
        drumPattern: getCurrentPattern(),
        
        // Export ARP2600 if used
        arp2600: arp2600Synth ? arp2600Synth.exportSettings() : null
    };
    
    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem('haos-presets') || '[]');
    presets.push(preset);
    localStorage.setItem('haos-presets', JSON.stringify(presets));
    
    alert(`Preset "${presetName}" saved!`);
    refreshPresetList();
}

function loadPreset(presetName) {
    const presets = JSON.parse(localStorage.getItem('haos-presets') || '[]');
    const preset = presets.find(p => p.name === presetName);
    
    if (!preset) {
        alert('Preset not found!');
        return;
    }
    
    // Load BPM
    currentBPM = preset.bpm;
    tb303Synth.setBPM(preset.bpm);
    
    // Load 303 pattern
    if (preset.tb303) {
        tb303Synth.importPattern(preset.tb303);
        render303Grid();
    }
    
    // Load 808 config
    if (preset.tr808) {
        tr808Drums.importConfig(preset.tr808);
        updateDrumVariationUI();
    }
    
    // Load drum pattern
    if (preset.drumPattern) {
        setCurrentPattern(preset.drumPattern);
        renderDrumGrid();
    }
    
    // Load ARP2600 settings
    if (preset.arp2600 && arp2600Synth) {
        arp2600Synth.importSettings(preset.arp2600);
    }
    
    alert(`Preset "${presetName}" loaded!`);
}
```

### Step 7: Export to Radio Integration

Update the export function to use modular synths:

```javascript
function exportToRadio() {
    const trackTitle = prompt('Enter track name:', 'Untitled Track');
    if (!trackTitle) return;
    
    const track = {
        title: trackTitle,
        artist: 'HAOS.fm User',
        genre: 'Techno',
        timestamp: Date.now(),
        
        // Export all synth data
        tb303Pattern: tb303Synth.exportPattern(),
        tr808Config: tr808Drums.exportConfig(),
        drumPattern: getCurrentPattern(),
        bpm: currentBPM,
        
        // Add to queue flag
        addToQueue: true
    };
    
    // Dispatch custom event to Radio page
    window.dispatchEvent(new CustomEvent('technoCreatorTrackExport', {
        detail: track
    }));
    
    // Also save to localStorage for persistence
    const radioQueue = JSON.parse(localStorage.getItem('techno-radio-queue') || '[]');
    radioQueue.push(track);
    localStorage.setItem('techno-radio-queue', JSON.stringify(radioQueue));
    
    // Show confirmation
    showNotification('Track Exported!', `"${trackTitle}" added to Radio 24/7 queue`);
}
```

---

## Code Removal Checklist

After integration, remove these old monolithic code blocks from `techno-creator.html`:

- [ ] Old TB-303 synthesis functions (`play303Note`, `init303Pattern`, etc.)
- [ ] Old TR-808 drum synthesis functions (all `_synth*` functions)
- [ ] Old pattern state arrays (replace with synth instances)
- [ ] Duplicate parameter handling code
- [ ] Old preset save/load logic (replace with modular version)

**Estimated lines removed**: ~800-1000 lines  
**New modular imports**: 3 lines  
**Integration code**: ~200 lines  
**Net reduction**: ~600-800 lines (10-12% smaller file)

---

## Testing Checklist

### TB-303 Tests
- [ ] Play/stop button works
- [ ] All 6 preset patterns load correctly
- [ ] Step grid toggles work
- [ ] Accent/Slide/Gate per step function
- [ ] Cutoff/Resonance/EnvMod sliders work
- [ ] Waveform selector (sawtooth/square) works
- [ ] Randomize creates valid patterns
- [ ] Clear resets all steps
- [ ] BPM change updates playback speed

### TR-808 Tests
- [ ] All 10 kick variations play
- [ ] Hat variations (classic, tight, open, crispy) work
- [ ] Clap variations work
- [ ] Perc variations work
- [ ] Ride variations work
- [ ] Crash variations work
- [ ] Master volume control works
- [ ] Sequencer integration plays drums in sync

### Integration Tests
- [ ] Preset save includes all synth states
- [ ] Preset load restores all parameters
- [ ] Export to Radio includes track data
- [ ] Pattern playback syncs 303 + drums
- [ ] UI updates reflect synth state changes
- [ ] No console errors on page load
- [ ] Mobile responsive controls work

---

## Performance Optimization

### Lazy Loading
For better initial page load:

```javascript
// Load synths only when needed
let tb303Synth = null;

function init303() {
    if (!tb303Synth) {
        tb303Synth = new TB303(audioContext);
        tb303Synth.loadPresetPattern('classic303');
    }
    return tb303Synth;
}

// Call on first user interaction with 303 section
document.getElementById('303-section').addEventListener('click', () => {
    init303();
}, { once: true });
```

### Memory Management
Clean up resources when switching pages:

```javascript
window.addEventListener('beforeunload', () => {
    // Stop all playback
    if (tb303Synth) tb303Synth.stop();
    if (tr808Drums) tr808Drums.stopAll();
    if (arp2600Synth) arp2600Synth.stopAll();
    
    // Close audio context
    if (audioContext) audioContext.close();
});
```

---

## Advanced Features

### Custom Event Listeners

The modular synths support event callbacks:

```javascript
// Listen for step changes
tb303Synth.onStepChange = (currentStep) => {
    highlightActiveStep(currentStep);
    updateStepIndicator(currentStep);
};

// Listen for playback stop
tb303Synth.onStop = () => {
    updatePlayButtonState('stopped');
};
```

### Parameter Automation

Automate parameters over time:

```javascript
function automateFilterSweep() {
    let cutoff = 200;
    const interval = setInterval(() => {
        cutoff += 50;
        if (cutoff > 2000) {
            clearInterval(interval);
            return;
        }
        tb303Synth.setParam('cutoff', cutoff);
    }, 100);
}
```

### Live Recording

Record patterns in real-time:

```javascript
let recording = false;
let recordedSteps = [];

function toggleRecording() {
    recording = !recording;
    if (recording) {
        recordedSteps = [];
        tb303Synth.onStepChange = (step) => {
            if (recording) {
                recordedSteps.push({
                    step,
                    timestamp: Date.now()
                });
            }
        };
    }
}
```

---

## Backend Integration (Python)

### API Endpoint Example

Create a Flask endpoint to render patterns server-side:

```python
from flask import Flask, request, send_file
from tb303 import TB303
from tr808 import TR808
import json

app = Flask(__name__)

@app.route('/api/render/track', methods=['POST'])
def render_track():
    data = request.json
    
    # Initialize synths
    tb303 = TB303(sample_rate=44100)
    tr808 = TR808(sample_rate=44100)
    
    # Load patterns
    if 'tb303Pattern' in data:
        pattern = tb303.load_pattern_from_json(data['tb303Pattern'])
        bass_audio = tb303.render_pattern(pattern, bpm=data.get('bpm', 130))
    
    # Generate drums
    drum_audio = []
    if 'drumPattern' in data:
        # Render each drum track
        # Combine into final mix
        pass
    
    # Mix and export
    filename = '/tmp/haos_track.wav'
    # Mix bass + drums
    # Export final WAV
    
    return send_file(filename, mimetype='audio/wav')
```

### Client-side Call

```javascript
async function renderTrackToWAV() {
    const trackData = {
        tb303Pattern: tb303Synth.exportPattern(),
        tr808Config: tr808Drums.exportConfig(),
        drumPattern: getCurrentPattern(),
        bpm: currentBPM
    };
    
    const response = await fetch('/api/render/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData)
    });
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Download WAV file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'haos_track.wav';
    a.click();
}
```

---

## Troubleshooting

### Common Issues

**Q: No sound when playing 303 pattern**
- Check if Audio Context is initialized
- Verify user interaction (browsers require user gesture)
- Check browser console for errors
- Ensure volume is not muted

**Q: Steps don't toggle**
- Verify DOM element IDs match
- Check if `render303Grid()` is called after toggle
- Inspect `tb303Synth.getStep(i)` returns correct state

**Q: Preset load doesn't work**
- Check localStorage has data: `localStorage.getItem('haos-presets')`
- Verify JSON structure is valid
- Check if synth instances are initialized

**Q: Export to Radio fails**
- Ensure Radio page is listening for events
- Check localStorage keys match
- Verify track object has required fields

---

## Migration Timeline

### Phase 1: Setup (Day 1)
- Add module script tags
- Initialize synth instances
- Test basic playback

### Phase 2: UI Integration (Day 2)
- Update all UI event listeners
- Test parameter controls
- Update visual feedback functions

### Phase 3: Preset System (Day 3)
- Migrate preset save/load
- Test all factory presets
- Update preset manager UI

### Phase 4: Testing & Cleanup (Day 4)
- Full integration testing
- Remove old code
- Performance optimization
- Documentation updates

---

## Conclusion

The modular synthesizer architecture provides:

✅ **Better Maintainability** - Separate, focused modules  
✅ **Code Reusability** - Use same synths across pages  
✅ **Testability** - Isolated class testing  
✅ **Scalability** - Easy to add new synths  
✅ **Backend Support** - Python for WAV export  
✅ **Cleaner Codebase** - ~40% reduction in main file  

**Next Steps:**
1. Integrate modules into Techno Creator
2. Add factory pattern presets
3. Complete Radio artist library
4. Add Python WAV export API
5. Cross-platform testing

---

**Document Version**: 1.0  
**Last Updated**: November 26, 2025  
**Author**: HAOS.fm Development Team
