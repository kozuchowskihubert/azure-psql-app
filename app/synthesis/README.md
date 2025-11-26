# Synthesizer Modules

Modular synthesizer implementations in JavaScript and Python for the HAOS.fm platform.

## Overview

This directory contains class-based synthesizer modules that can be used both in the frontend (JavaScript/Web Audio API) and backend (Python/NumPy/SciPy).

## JavaScript Modules

Located in `/app/public/js/synths/`:

### TB303.js
**TB-303 Acid Bass Synthesizer** (Emulates Roland TB-303 / Behringer TD-3)

```javascript
// Initialize
const synth = new TB303(audioContext);

// Set parameters
synth.setParam('cutoff', 800);
synth.setParam('resonance', 15);
synth.setParam('envMod', 70);

// Create pattern
synth.setStep(0, { active: true, note: 'C3', accent: true, slide: false, gate: false });

// Play
synth.play();

// Load preset
synth.loadPresetPattern('classic303');

// Export/Import
const pattern = synth.exportPattern();
synth.importPattern(pattern);
```

**Features:**
- 16-step acid sequencer
- Classic sawtooth/square oscillator
- Resonant lowpass filter with envelope modulation
- Accent, slide, and gate per step
- 6 factory presets (Classic 303, Squelchy, Driving, Minimal, Acid House, Psy)
- BPM control (60-200)
- Distortion and delay effects

### TR808.js
**TR-808 Drum Machine** (Emulates Roland TR-808)

```javascript
// Initialize
const drums = new TR808(audioContext);

// Set variations
drums.setVariation('kick', 'punchy');
drums.setVariation('hat', 'crispy');

// Play drums
drums.playKick('classic');
drums.playHat('tight');
drums.playClap('reverb');
drums.playPerc('conga');
drums.playRide('bell');
drums.playCrash('splash');

// Export/Import config
const config = drums.exportConfig();
drums.importConfig(config);
```

**Features:**
- 6 drum voices: Kick, Hat, Clap, Perc, Ride, Crash
- Multiple variations per voice:
  - **Kick**: Classic, Deep, Punchy, Sub, Acid, Minimal, Rumble, Tribal, Distorted, FM
  - **Hat**: Classic, Tight, Open, Crispy
  - **Clap**: Classic, Tight, Reverb, Snap
  - **Perc**: Conga, Tom, Cowbell, Wood
  - **Ride**: Classic, Bell, Ping
  - **Crash**: Classic, Splash, China
- Real-time synthesis with Web Audio API
- Master volume control

### ARP2600.js
**ARP 2600 Semi-Modular Synthesizer**

```javascript
// Initialize
const synth = new ARP2600(audioContext);

// Configure oscillators
synth.setVCO(1, 'waveform', 'sawtooth');
synth.setVCO(1, 'enabled', true);
synth.setVCO(2, 'waveform', 'square');
synth.setVCO(2, 'fine', 7);
synth.setVCO(2, 'enabled', true);

// Configure filter
synth.setVCF('cutoff', 2000);
synth.setVCF('resonance', 10);

// Configure envelope
synth.setEnvelope('attack', 0.05);
synth.setEnvelope('decay', 0.3);
synth.setEnvelope('sustain', 0.7);
synth.setEnvelope('release', 0.5);

// Play note
synth.playNote(440, 1.0, 1.0); // frequency, duration, velocity

// Load preset
synth.loadPreset('bass'); // bass, lead, pad, pluck, brass

// Virtual patching
synth.addPatch('lfo', 'vcf.cutoff', 0.5);
synth.clearPatches();

// Stop all voices
synth.stopAll();
```

**Features:**
- 3 VCOs (oscillators) with independent waveforms, octaves, fine tuning
- VCF (filter) with lowpass/highpass/bandpass modes
- VCA with ADSR envelope
- LFO with rate and amount controls
- Virtual patch bay for modular routing
- 5 factory presets
- Polyphonic voice management

## Python Modules

Located in `/app/synthesis/`:

### tb303.py
**TB-303 Backend Synthesis**

```python
from tb303 import TB303

# Initialize
synth = TB303(sample_rate=44100)

# Set parameters
synth.set_param('cutoff', 800)
synth.set_param('resonance', 15)

# Create pattern (16 steps)
pattern = [
    {'active': True, 'note': 'C3', 'accent': True, 'slide': False, 'gate': False},
    {'active': False, 'note': 'C3', 'accent': False, 'slide': False, 'gate': False},
    # ... 14 more steps
]

# Render to audio
audio = synth.render_pattern(pattern, bpm=130)

# Export to WAV
synth.export_wav(audio, 'output.wav')

# Load from JSON
pattern = synth.load_pattern_from_json('{"pattern": [...], "params": {...}}')
```

### tr808.py
**TR-808 Backend Synthesis**

```python
from tr808 import TR808

# Initialize
drums = TR808(sample_rate=44100)

# Generate drum sounds
kick = drums.generate_kick('classic')
hat = drums.generate_hat('tight')
clap = drums.generate_clap('reverb')
perc = drums.generate_perc('conga')
ride = drums.generate_ride('bell')
crash = drums.generate_crash('splash')

# Export to WAV
drums.export_wav(kick, 'kick.wav')
drums.export_wav(hat, 'hat.wav')
```

### arp2600.py
**ARP 2600 Backend Synthesis**

```python
from arp2600 import ARP2600

# Initialize
synth = ARP2600(sample_rate=44100)

# Load preset
synth.load_preset('bass')

# Synthesize note
audio = synth.synthesize_note(frequency=220, duration=2.0, velocity=1.0)

# Export to WAV
synth.export_wav(audio, 'bass_note.wav')
```

## Installation

### JavaScript
No installation needed - modules use native Web Audio API. Simply import in your HTML:

```html
<script src="/js/synths/tb303.js"></script>
<script src="/js/synths/tr808.js"></script>
<script src="/js/synths/arp2600.js"></script>
```

Or use ES6 modules:

```javascript
import { TB303 } from '/js/synths/tb303.js';
import { TR808 } from '/js/synths/tr808.js';
import { ARP2600 } from '/js/synths/arp2600.js';
```

### Python
Install dependencies:

```bash
cd app/synthesis
pip install -r requirements.txt
```

## Architecture

### JavaScript (Frontend)
- **Web Audio API**: Real-time audio synthesis in the browser
- **Class-based**: Reusable, modular design
- **Event-driven**: Callbacks for step changes, playback events
- **Standalone**: No external dependencies

### Python (Backend)
- **NumPy**: Fast array operations for audio generation
- **SciPy**: Signal processing (filters, waveforms)
- **Soundfile**: WAV export
- **Batch processing**: Generate audio files for download/export

## Integration

### Techno Creator
The frontend uses these modules for real-time synthesis:

```javascript
// Initialize synths
const tb303 = new TB303(audioContext);
const tr808 = new TR808(audioContext);

// Bind to UI controls
document.getElementById('cutoffSlider').addEventListener('input', (e) => {
    tb303.setParam('cutoff', e.target.value);
});

// Play pattern
tb303.play();
```

### API Endpoints (Future)
Backend modules can be exposed via Flask API for WAV export:

```python
from flask import Flask, jsonify, request, send_file
from tb303 import TB303

app = Flask(__name__)

@app.route('/api/render/tb303', methods=['POST'])
def render_tb303():
    data = request.json
    synth = TB303()
    
    # Load pattern
    pattern = synth.load_pattern_from_json(data)
    
    # Render
    audio = synth.render_pattern(pattern, bpm=data.get('bpm', 130))
    
    # Export
    filename = '/tmp/tb303_output.wav'
    synth.export_wav(audio, filename)
    
    return send_file(filename, mimetype='audio/wav')
```

## Testing

### JavaScript
Open browser console and test:

```javascript
const ctx = new AudioContext();
const synth = new TB303(ctx);
synth.loadPresetPattern('classic303');
synth.play();
```

### Python
Run standalone:

```bash
python tb303.py  # Generates tb303_pattern.wav
python tr808.py  # Generates 808_kick.wav, 808_hat.wav, 808_clap.wav
python arp2600.py  # Generates arp2600_bass.wav
```

## Performance

### JavaScript
- Real-time playback at 44.1kHz
- Low CPU usage (~5-10% per voice)
- Polyphonic support (ARP2600)
- Mobile-friendly

### Python
- Fast offline rendering (10x+ real-time)
- Batch processing support
- High-quality output (16-bit WAV)

## Future Enhancements

- [ ] MIDI support (Web MIDI API)
- [ ] Additional waveforms (FM, wavetable)
- [ ] Effects chain (reverb, chorus, phaser)
- [ ] Pattern quantization
- [ ] Swing/groove timing
- [ ] Multi-track rendering
- [ ] Real-time parameter automation
- [ ] Preset library expansion

## Credits

- **TB-303**: Based on Roland TB-303 / Behringer TD-3
- **TR-808**: Based on Roland TR-808
- **ARP 2600**: Based on ARP 2600 semi-modular synthesizer
- **Implementation**: HAOS.fm Development Team

## License

MIT License - See main project LICENSE file
