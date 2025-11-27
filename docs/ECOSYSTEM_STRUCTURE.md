# HAOS.FM - Complete Ecosystem Structure

## 📁 Project Root Structure

```
azure-psql-app/
├── app/
│   ├── public/           # Frontend assets (HTML, JS, CSS)
│   ├── controllers/      # Backend API controllers
│   ├── models/           # Database models
│   ├── routes/           # Express routes
│   ├── config/           # App configuration
│   ├── auth/             # Authentication logic
│   ├── synthesis/        # Server-side synthesis (if any)
│   ├── utils/            # Utility functions
│   ├── test/             # Test files
│   ├── package.json      # Node.js dependencies
│   ├── server.js         # Express server entry point
│   └── app.js            # App initialization
│
├── infra/                # Terraform infrastructure
├── scripts/              # Deployment & utility scripts
├── docs/                 # Documentation
├── deployment/           # Deployment configs
├── config/               # Global configs
└── Dockerfile.*          # Docker configurations

```

## 🎵 Frontend Application Structure (`app/public/`)

### 📄 **Main Pages (Entry Points)**

```
index.html                    # Landing page / Hub
├── Feature showcase
├── Quick start guides
└── Navigation to all studios

```

### 🎛️ **Production Studios** (Full DAW-like environments)

```
music-creator.html           # Main production interface
├── Multi-track DAW
├── Full mixer
├── Plugin routing
└── Project management

techno-creator.html          # Techno-focused studio
├── TB-303 integration
├── TR-909 drums
├── Pattern sequencer
└── Techno-specific presets

trap-studio.html             # Trap/Hip-hop studio
├── 808 bass synthesis
├── Trap drum patterns
├── Sample management
└── Beat programming

music-production.html        # General production
├── Multi-genre support
├── Full effects chain
└── MIDI/Audio export

collab-studio.html           # Collaboration features
├── Real-time collaboration
├── Session sharing
└── Project versioning

```

### 🎹 **Synthesis Platforms** (Focused synth interfaces)

```
haos-platform.html           # Main synthesis platform ⭐
├── TB-303 acid bass
├── TR-909 drum machine
├── 16-step sequencer
├── Effects chain
├── Preset browser
├── MIDI export
├── Audio recording
└── Real-time visualization

synth-2600-studio.html       # ARP 2600 emulator
├── Modular patching
├── VCO/VCF/VCA modules
├── Ring modulator
└── Sample & hold

synth-2600.html              # Simplified 2600
synth-patch-sequencer.html   # Patch + sequencer combo
synth-enhanced-demo.html     # Enhanced synth demo
synth-test.html              # Synth testing page

```

### 🔧 **Specialized Workspaces**

```
techno-workspace.html        # Modular techno workspace ⭐
├── TB-303 module
├── TR-909 drums
├── 16-step sequencer
├── Patch bay routing
├── Effects chain
├── Preset morphing
├── Live parameters
├── Macro controls
├── Keyboard shortcuts
├── Auto-save system
└── Pattern generation

techno-intuitive.html        # Simplified techno UI
studio.html                  # Generic studio template
modular-demo.html            # Modular synthesis demo

```

### 🎚️ **Utility Pages**

```
preset-browser.html          # Preset library browser
preset-library.html          # Preset management
midi-generator.html          # MIDI pattern generator
audio-recorder.html          # Standalone audio recorder
audio-test.html              # Audio system testing
radio.html                   # 24/7 radio stream
neural-patch-designer.html   # AI-powered patch design
cli-terminal.html            # Web-based CLI
demo-showcase.html           # Feature demonstrations

```

### 📋 **Admin & System Pages**

```
login.html                   # User authentication
sso.html                     # Single sign-on
meetings.html                # Meeting scheduler
calendar.html                # Event calendar
excel.html                   # Spreadsheet view
code-stats.html              # Code statistics
features.html                # Feature flags UI
features-list.html           # Feature list
test-feature-flags.html      # Feature testing
offline.html                 # PWA offline page
icon-generator.html          # Icon generation tool

```

## 📦 **JavaScript Modules** (`app/public/js/`)

### 🎼 **Core Audio Engines**

```
haos-audio-engine.js         # Main audio engine ⭐
├── TB-303 synthesis
├── TR-909 drums
├── Sequencer engine
├── Pattern management
└── No external dependencies

haos-master-system.js        # Orchestration layer
├── Engine management
├── AI integration
├── State management
├── Event bus
└── Export system

synthesis-engine.js          # Generic synthesis
synth-engine.js              # Synth framework
daw-engine.js                # DAW functionality
haos-daw.js                  # HAOS DAW integration

```

### 🎹 **Synthesizer Implementations** (`js/synths/`)

```
tb303.js                     # TB-303 acid bass
tr909.js                     # TR-909 drums
tr808.js                     # TR-808 drums
arp2600.js                   # ARP 2600 synth
string-machine.js            # String synthesizer

```

### 🎛️ **Synth Platforms**

```
synth-2600.js                # ARP 2600 main
synth-2600-audio.js          # 2600 audio engine
synth-2600-enhanced.js       # Enhanced features
synth-2600-studio.js         # Studio integration
synth-manager.js             # Synth management
synth-modules.js             # Modular components

```

### 🤖 **AI & Intelligence**

```
ai-patch-designer.js         # AI patch generation
track-integrator.js          # AI track composition

```

### 🔧 **Production Tools**

```
live-params.js               # Real-time parameters ⭐
preset-morph.js              # Preset morphing ⭐
cable-router.js              # Modular routing ⭐
macro-system.js              # Macro controls ⭐
patch-sequencer.js           # Patch automation
preset-mapper.js             # Preset mapping
preset-ui-enhancer.js        # UI enhancements
factory-presets.js           # Built-in presets

```

### 🎵 **Audio Processing**

```
audio-recorder.js            # Recording functionality
music-production.js          # Production utilities
radio-station.js             # Radio streaming

```

### 🖥️ **UI & System**

```
theme-manager.js             # Theme switching
feature-flags.js             # Feature toggles
web-cli.js                   # Command-line interface

```

## 📦 **Legacy Modules** (`app/public/modules/`)

```
core-audio-engine.js         # Legacy core engine
bass-303.js                  # Old TB-303 implementation
bass-808.js                  # Old TR-808 implementation
drums.js                     # Drum synthesis
effects.js                   # Effects chain
sequencer.js                 # Pattern sequencer
pattern-library.js           # Pattern storage
module-integration.js        # Module connections
ui-components.js             # Reusable UI

```

## 🎨 **Stylesheets** (`app/public/css/`)

```
haos-brand.css              # Brand colors & typography
responsive.css              # Mobile responsiveness

```

## 🔌 **Service Workers & PWA**

```
service-worker.js           # Main service worker
synth-sw.js                 # Synth-specific SW
pwa-installer.js            # PWA installation

```

## 🎯 **Key Integration Points**

### **haos-platform.html** (Primary Platform)
- Uses: `haos-audio-engine.js`
- Features: TB-303, TR-909, Sequencer, Presets, Export
- Target audience: Electronic music producers

### **techno-workspace.html** (Advanced Workspace)
- Uses: `haos-audio-engine.js`, `live-params.js`, `preset-morph.js`, `cable-router.js`, `macro-system.js`
- Features: Modular routing, preset morphing, pattern generation, auto-save
- Target audience: Techno producers & sound designers

### **music-creator.html** (Full DAW)
- Uses: `haos-master-system.js`, `daw-engine.js`, `track-integrator.js`
- Features: Multi-track, full mixer, AI composition
- Target audience: General music production

## 📊 **File Statistics**

### **Total Files by Type**
- HTML pages: ~40 files
- JavaScript modules: ~50 files
- Synthesizers: 5 dedicated synth engines
- Audio engines: 3 core engines
- CSS files: 2 stylesheets
- Service workers: 3 files

### **Key File Sizes**
- `haos-platform.html`: 4,703 lines
- `techno-workspace.html`: ~3,100 lines
- `haos-audio-engine.js`: ~1,400 lines
- `haos-master-system.js`: ~773 lines

## 🔄 **Data Flow**

```
User Interface (HTML)
    ↓
JavaScript Controllers
    ↓
Audio Engine (haos-audio-engine.js)
    ↓
Web Audio API
    ↓
Sound Output

```

### **State Management Flow**

```
User Action
    ↓
Event Handlers
    ↓
State Update (live-params.js)
    ↓
Auto-save (localStorage)
    ↓
UI Update

```

### **Pattern Flow**

```
Sequencer UI
    ↓
Pattern Generation (randomize, shift, fill)
    ↓
Pattern Storage (auto-save every 10s)
    ↓
Playback Engine
    ↓
Audio Synthesis

```

## 🎯 **Recommended Entry Points**

### **For Users:**
1. `index.html` - Start here, explore ecosystem
2. `haos-platform.html` - Quick music creation
3. `techno-workspace.html` - Advanced production
4. `music-creator.html` - Full DAW experience

### **For Developers:**
1. `haos-audio-engine.js` - Core synthesis engine
2. `live-params.js` - Parameter system
3. `preset-morph.js` - Preset morphing
4. `haos-master-system.js` - System architecture

## 🚀 **Deployment Structure**

```
Production (Azure)
    ├── Static Files (CDN)
    ├── API Server (Express)
    ├── PostgreSQL Database
    └── Redis Cache

Development
    ├── Local Server (PORT 8080)
    └── Hot Reload

```

## 📝 **Notes**

- **haos-audio-engine.js** is the main standalone engine (no dependencies)
- **haos-master-system.js** provides AI and orchestration
- **techno-workspace.html** showcases the most advanced features
- All synthesis is client-side using Web Audio API
- localStorage used for auto-save and state persistence
- No samples required - all synthesis is procedural

---

**Last Updated**: November 27, 2025
**Version**: 3.0.0
**Status**: Active Development
