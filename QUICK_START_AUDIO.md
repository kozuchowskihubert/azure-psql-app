# Quick Start Guide - HAOS.fm Audio System

## 🎯 What You Have Now

A complete, working techno sound design platform with:
- **TB-303** acid bass synthesizer
- **TR-909** drum machine  
- **TR-808** drum machine
- **16-step sequencer**
- **Factory presets** for all instruments
- **Pattern library** for techno and hip-hop

## 🚀 Quick Test (Right Now!)

The audio test page is already open in your browser at:
```
http://localhost:8080/audio-test.html
```

### Try These Tests:
1. **Click "Initialize Audio Engine"** - sets up Web Audio API
2. **Click "Play Single Note"** - hear the TB-303
3. **Click "Test Acid Squelch"** - classic acid bass
4. **Click "Kick"** under TR-909 - techno kick drum
5. **Click "808 Kick"** under TR-808 - boom!

## 🎛️ Using the Main Platform

Open the HAOS platform:
```
http://localhost:8080/haos-platform.html
```

### How It Works:
1. **Choose Your OS**: Click "Techno OS" or "Hip-Hop OS"
2. **Open a Studio**: Click "TB-303 Acid Lab" or "TR-909 Drums"
3. **Sounds Play Automatically**: Demo patterns play when panels open

## 🔧 For Development

### File Locations
All working audio files are in:
```
app/public/
├── modules/          # Core audio modules
├── js/synths/        # Synth classes
└── audio-test.html   # Test page
```

### Add to Your Own Page

```html
<!-- Load the modules -->
<script src="/modules/core-audio-engine.js"></script>
<script src="/js/synths/tb303.js"></script>
<script src="/js/synths/tr909.js"></script>
<script src="/js/factory-presets.js"></script>

<script>
// Initialize
const engine = new CoreAudioEngine();
await engine.init();

const bass = new TB303(engine.audioContext);
bass.connect(engine.masterGainNode);

// Play a note
bass.playNote({ note: 'C2', accent: true, duration: 0.5 });
</script>
```

## 🎵 Sound Examples

### Acid Bass Line
```javascript
tb303.setParam('cutoff', 800);
tb303.setParam('resonance', 25);
tb303.playNote({ note: 'C2', accent: true, slide: false });
tb303.playNote({ note: 'D#2', accent: false, slide: true });
```

### Techno Kick Pattern
```javascript
tr909.playKick();                    // Beat 1
setTimeout(() => tr909.playKick(), 500);  // Beat 2
setTimeout(() => tr909.playKick(), 1000); // Beat 3
setTimeout(() => tr909.playKick(), 1500); // Beat 4
```

### 808 Boom Bap
```javascript
tr808.playKick();                    // Kick
setTimeout(() => tr808.playSnare(), 500);  // Snare
setTimeout(() => tr808.playKick(), 750);   // Kick
setTimeout(() => tr808.playSnare(), 1500); // Snare
```

## 🎨 Presets Available

### TB-303
- **Acid Squelch** - Classic acid house
- **Deep Bass** - Rolling techno bass
- **Wobble** - Slow wobble bass
- **Screamer** - High-pitched lead

### TR-909
- **Four on the Floor** - 128 BPM techno
- **Hard Techno** - 145 BPM aggressive
- **Deep Groove** - 122 BPM house

### TR-808
- **Classic Trap** - 140 BPM trap
- **Boom Bap** - 92 BPM hip-hop
- **Lo-Fi Chill** - 85 BPM lo-fi

## 📝 Common Tasks

### Change TB-303 Sound
```javascript
tb303.setParam('cutoff', 1200);    // Brighter
tb303.setParam('resonance', 20);   // More squelch
tb303.setParam('envMod', 0.9);     // More envelope
```

### Adjust TR-909 Kick
```javascript
tr909.params.kick.pitch = 70;   // Higher pitch
tr909.params.kick.decay = 0.8;  // Longer decay
```

### Play a Pattern
```javascript
const pattern = [
    { note: 'C2', accent: true },
    { note: 'D#2', accent: false },
    { note: 'G2', accent: true },
    { note: 'C3', accent: true }
];

pattern.forEach((step, i) => {
    setTimeout(() => {
        tb303.playNote({ ...step, duration: 0.3 });
    }, i * 250);
});
```

## 🐛 Troubleshooting

### No Sound?
1. Check browser console for errors
2. Click "Initialize Audio Engine" button
3. Make sure volume is up
4. Try playing a basic test sound first

### Module Not Loaded?
Check the test page shows all green checkmarks:
```
✓ CoreAudioEngine
✓ TB303
✓ TR909
✓ TR808
```

### Audio Context Suspended?
Modern browsers require user interaction. Click any button first!

## 🎯 What's Next?

The system is **complete and working**. You can now:

1. **Use it as-is** in haos-platform.html
2. **Build custom UIs** for the synths
3. **Add more presets** to factory-presets.js
4. **Create more patterns** in pattern-library.js
5. **Add effects** (reverb, delay, etc.)

## 📊 Test Results

Open `http://localhost:8080/audio-test.html` to see:
- ✓ All 9 modules loaded successfully
- ✓ Audio engine initialized
- ✓ TB-303 playing notes
- ✓ TR-909 drum sounds working
- ✓ TR-808 drum sounds working
- ✓ Presets loading correctly
- ✓ Pattern library available

## 🎉 You're Ready!

Everything is built and tested. The techno sound design platform is live!

**Test Page:** http://localhost:8080/audio-test.html  
**Main Platform:** http://localhost:8080/haos-platform.html

Enjoy making techno! 🎛️🔊🎵
