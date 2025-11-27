# HAOS.FM Platform Restructure - Master Design Document

## 🎯 Vision

**From**: 40+ fragmented HTML pages with overlapping functionality  
**To**: Single integrated platform with modular architecture

## 📊 Current State Analysis

### Problems with Current Structure

1. **Page Fragmentation** (40+ HTML files)
   - `haos-platform.html` (4,703 lines) - bloated
   - `techno-workspace.html` (3,100 lines) - duplicate features
   - `techno-creator.html` - overlaps with techno-workspace
   - `music-creator.html` - separate DAW
   - `trap-studio.html` - separate studio
   - Multiple synth pages (2600, enhanced, demo, test)

2. **Feature Duplication**
   - TB-303 implemented in 4+ places
   - TR-909 in 3+ places
   - Sequencer in 5+ places
   - Preset browser duplicated
   - Effects chains duplicated

3. **Navigation Complexity**
   - Users don't know which page to use
   - No clear workflow
   - Settings don't persist across pages
   - Can't combine features from different pages

4. **Maintenance Burden**
   - Fix bug once, need to fix in 5+ places
   - Updates require changing multiple files
   - Inconsistent UI/UX across pages

## 🏗️ New Architecture

### Single Unified Platform: `haos-studio.html`

One page. One platform. Everything integrated.

```
┌─────────────────────────────────────────────────────────────┐
│  HAOS.FM Studio                                    [⚙️][👤] │
├─────────────────────────────────────────────────────────────┤
│  [Synths] [Drums] [Sequencer] [Effects] [Mixer] [Projects] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │              │  │              │  │                 │   │
│  │   ACTIVE     │  │   PATTERN    │  │    TRANSPORT    │   │
│  │   MODULES    │  │   EDITOR     │  │    CONTROLS     │   │
│  │              │  │              │  │                 │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │              MAIN WORKSPACE AREA                       │  │
│  │           (Context-sensitive content)                  │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  [Master VU] [CPU] [BPM: 120] [█ Rec] [▶ Play] [■ Stop]    │
└─────────────────────────────────────────────────────────────┘
```

### Tab-Based Navigation

**Top-Level Tabs:**
1. **Synths** - All synthesizers in one place
2. **Drums** - All drum machines unified
3. **Sequencer** - Pattern programming
4. **Effects** - All effects/processing
5. **Mixer** - Multi-track mixing
6. **Projects** - Save/load/export

### Module System Architecture

#### Core Modules (Always Available)
```javascript
// Core engine - single source of truth
haos-unified-engine.js
├── Audio Context Manager
├── Module Registry
├── Routing System
└── State Manager

// Individual modules register with core
modules/
├── synths/
│   ├── tb303-module.js
│   ├── tr909-module.js
│   ├── tr808-module.js
│   ├── arp2600-module.js
│   └── string-machine-module.js
│
├── effects/
│   ├── reverb-module.js
│   ├── delay-module.js
│   ├── distortion-module.js
│   └── filter-module.js
│
├── sequencers/
│   ├── step-sequencer-module.js
│   ├── piano-roll-module.js
│   └── drum-pattern-module.js
│
└── tools/
    ├── mixer-module.js
    ├── recorder-module.js
    ├── preset-manager-module.js
    └── midi-export-module.js
```

## 🎨 UI/UX Design Principles

### 1. Context-Sensitive Workspace
- Main area changes based on active tab
- Side panels provide quick access to tools
- No popups or modal hell
- Everything is dockable/resizable

### 2. Consistent Theming
```css
/* Single theme system */
:root {
  --haos-bg-primary: #0a0a0a;
  --haos-bg-secondary: #151515;
  --haos-accent: #00ff88;
  --haos-accent-warm: #ff6b35;
  --haos-text: #ffffff;
  --haos-text-dim: #888888;
}
```

### 3. Smart Defaults
- Auto-routing: Connect modules intelligently
- Template presets: Quick start options
- One-click workflows: "New Techno Track", "New Trap Beat"

## 📁 New File Structure

### Simplified to 10 Core Files

```
app/public/
├── index.html                    # Landing/marketing page
├── haos-studio.html             # ⭐ THE PLATFORM (replaces 40+ pages)
│
├── js/
│   ├── haos-unified-engine.js   # Core platform engine
│   ├── module-loader.js         # Dynamic module loading
│   ├── state-manager.js         # Global state management
│   ├── routing-engine.js        # Audio routing
│   │
│   ├── modules/                 # Modular plugins
│   │   ├── synths/
│   │   │   ├── tb303.js
│   │   │   ├── tr909.js
│   │   │   ├── tr808.js
│   │   │   ├── arp2600.js
│   │   │   └── string-machine.js
│   │   │
│   │   ├── effects/
│   │   │   ├── reverb.js
│   │   │   ├── delay.js
│   │   │   ├── distortion.js
│   │   │   └── filter.js
│   │   │
│   │   ├── sequencers/
│   │   │   ├── step-sequencer.js
│   │   │   ├── piano-roll.js
│   │   │   └── drum-pattern.js
│   │   │
│   │   └── tools/
│   │       ├── mixer.js
│   │       ├── recorder.js
│   │       ├── preset-manager.js
│   │       ├── midi-export.js
│   │       └── spectrum-analyzer.js
│   │
│   └── ui/
│       ├── workspace.js         # Main workspace controller
│       ├── tab-manager.js       # Tab switching
│       └── panel-system.js      # Dockable panels
│
└── css/
    ├── haos-studio.css          # Main platform styles
    └── modules.css              # Module-specific styles
```

### Migration Strategy

#### Phase 1: Core Platform (Week 1)
- [ ] Create `haos-studio.html` skeleton
- [ ] Build `haos-unified-engine.js`
- [ ] Implement tab navigation
- [ ] Basic workspace layout
- [ ] State management system

#### Phase 2: Port Synths (Week 2)
- [ ] Extract TB-303 from best implementation
- [ ] Extract TR-909 from techno-workspace
- [ ] Convert to module format
- [ ] Add to unified platform
- [ ] Test integration

#### Phase 3: Sequencer Integration (Week 2)
- [ ] Port step sequencer from techno-workspace
- [ ] Add pattern library
- [ ] Implement auto-save
- [ ] Keyboard shortcuts

#### Phase 4: Effects & Mixer (Week 3)
- [ ] Port effects chain
- [ ] Build mixer interface
- [ ] Implement routing
- [ ] Master output section

#### Phase 5: Tools & Export (Week 3)
- [ ] Preset manager
- [ ] MIDI export
- [ ] Audio recorder
- [ ] Project save/load

#### Phase 6: Cleanup & Launch (Week 4)
- [ ] Deprecate old pages
- [ ] Update index.html
- [ ] Migration guide
- [ ] User testing
- [ ] Production deployment

## 🔧 Technical Implementation

### Module API Standard

Every module follows this pattern:

```javascript
// modules/synths/tb303.js
class TB303Module {
  constructor(audioContext, moduleRegistry) {
    this.id = 'tb303';
    this.name = 'TB-303 Bass';
    this.type = 'synth';
    this.audioContext = audioContext;
    
    // Audio chain
    this.output = audioContext.createGain();
    
    // Module metadata
    this.metadata = {
      category: 'synth',
      tags: ['bass', 'acid', 'techno'],
      inputs: 1,
      outputs: 1,
      presets: ['Acid Lead', 'Deep Bass', 'Squelchy']
    };
  }
  
  // Standard interface
  init() { /* Setup */ }
  play(note, velocity) { /* Trigger sound */ }
  stop() { /* Release */ }
  setParam(param, value) { /* Set parameter */ }
  getUI() { /* Return UI component */ }
  serialize() { /* Export state */ }
  deserialize(data) { /* Import state */ }
  
  // Audio routing
  connect(destination) { this.output.connect(destination); }
  disconnect() { this.output.disconnect(); }
}

// Register with platform
HAOS.modules.register(TB303Module);
```

### Unified State Management

```javascript
// state-manager.js
class StateManager {
  constructor() {
    this.state = {
      activeModules: [],
      routingMatrix: {},
      projectSettings: {},
      transport: { bpm: 120, playing: false }
    };
    
    this.listeners = [];
  }
  
  // Observable pattern
  subscribe(callback) {
    this.listeners.push(callback);
  }
  
  update(path, value) {
    // Update state
    // Notify listeners
    // Auto-save to localStorage
  }
  
  // Project management
  saveProject() { /* Save to localStorage/server */ }
  loadProject(id) { /* Load from storage */ }
  exportProject() { /* Export as JSON */ }
}
```

### Smart Routing Engine

```javascript
// routing-engine.js
class RoutingEngine {
  constructor(audioContext) {
    this.context = audioContext;
    this.connections = new Map();
    this.masterOut = audioContext.destination;
  }
  
  // Auto-routing intelligence
  connect(sourceModule, destModule) {
    // Validate connection
    // Create audio path
    // Update routing matrix
    // Notify UI
  }
  
  // Template routing
  loadTemplate(name) {
    // 'techno-chain': TB-303 -> Distortion -> Delay -> Master
    // 'trap-drums': TR-808 -> Compressor -> Master
    // 'experimental': Complex routing
  }
}
```

## 🎛️ Feature Consolidation Matrix

### What Gets Merged

| Old Pages | Features to Extract | New Location |
|-----------|-------------------|--------------|
| haos-platform.html | TB-303, TR-909, Sequencer | Synths tab |
| techno-workspace.html | Live params, Macro system, Auto-save | Core engine |
| techno-creator.html | Techno presets, Pattern templates | Preset library |
| music-creator.html | Multi-track, DAW features | Sequencer tab |
| trap-studio.html | Trap drums, 808 bass | Drums tab |
| synth-2600-studio.html | ARP 2600 synth | Synths tab |
| All preset pages | Preset browser | Projects tab |
| All effect pages | Effects chain | Effects tab |

### What Gets Deprecated

**Remove entirely** (functionality merged):
- `techno-intuitive.html` → merged into main
- `synth-test.html` → testing mode in main
- `synth-enhanced-demo.html` → demo templates
- `studio.html` → generic, replaced by unified
- `demo-showcase.html` → built-in tutorials

**Keep as standalone** (special purpose):
- `login.html` - Authentication
- `radio.html` - 24/7 stream (separate feature)
- `offline.html` - PWA offline page
- Admin pages (meetings, calendar, etc.)

## 🚀 Launch Strategy

### User Migration Path

1. **Soft Launch** (Week 1-2)
   - New platform at `/studio` route
   - Old pages still work
   - Banner: "Try the new unified studio!"

2. **Beta Period** (Week 3-4)
   - Collect feedback
   - Fix critical bugs
   - Add missing features

3. **Full Migration** (Week 5)
   - `/studio` becomes default
   - Old pages show deprecation notice
   - Offer import tool for old projects

4. **Cleanup** (Week 6+)
   - Archive old pages
   - Update all links
   - SEO redirects

## 📈 Success Metrics

### Goals

- **Load Time**: < 2 seconds for full platform
- **Page Count**: 40+ pages → 1 main platform + 5 utility pages
- **Code Reduction**: ~20,000 lines → ~8,000 lines
- **User Confusion**: Eliminate "which page do I use?" questions
- **Feature Parity**: All current features available in new platform
- **New Capabilities**: Things that weren't possible before
  - Cross-module routing
  - Unified presets across all synths
  - Multi-track recording
  - Complete project export

## 🎯 Quick Wins (First 48 Hours)

### Immediate Actions

1. **Create haos-studio.html skeleton** (4 hours)
   - Basic HTML structure
   - Tab navigation
   - Workspace layout
   - Import haos-audio-engine.js

2. **Port TB-303 + TR-909** (4 hours)
   - Extract from techno-workspace.html
   - Convert to module format
   - Add to Synths tab

3. **Port Sequencer** (4 hours)
   - Extract from techno-workspace.html
   - Add to Sequencer tab
   - Connect to synths

4. **Basic Routing** (2 hours)
   - Connect modules to master
   - Simple gain controls
   - VU meters

**Result**: Working prototype in 14 hours with core music-making capability!

## 📝 File Size Targets

### Before
```
haos-platform.html         4,703 lines
techno-workspace.html      3,100 lines
techno-creator.html        2,500 lines
music-creator.html         2,800 lines
trap-studio.html           2,200 lines
+ 35 other pages          ~15,000 lines
================================
TOTAL:                    ~30,300 lines
```

### After
```
haos-studio.html           1,500 lines (smart templating)
haos-unified-engine.js     2,000 lines (core)
modules/ (all)             4,000 lines (modular)
ui/ components               500 lines
================================
TOTAL:                     ~8,000 lines
```

**Reduction: 73% less code, 100% more features**

## 🔐 Backward Compatibility

### Import Old Projects

```javascript
// project-migrator.js
class ProjectMigrator {
  migrate(oldProjectData, sourcePage) {
    switch(sourcePage) {
      case 'haos-platform':
        return this.migrateHaosPlatform(oldProjectData);
      case 'techno-workspace':
        return this.migrateTechnoWorkspace(oldProjectData);
      // etc...
    }
  }
  
  // Converts old formats to new unified format
  migrateHaosPlatform(data) {
    return {
      version: '1.0',
      modules: [
        { type: 'tb303', params: data.tb303Params },
        { type: 'tr909', params: data.tr909Params }
      ],
      patterns: data.patterns,
      routing: this.inferRouting(data)
    };
  }
}
```

## 🎨 Visual Design Language

### Unified Orange Theme 🔥

```css
/* Dark theme - primary */
--haos-bg-dark: #0a0a0a;
--haos-bg-panel: #151515;
--haos-bg-elevated: #1f1f1f;

/* Orange theme - HAOS brand colors */
--haos-orange-primary: #ff6b35;    /* Main brand orange */
--haos-orange-bright: #ff8c42;     /* Bright orange (hover) */
--haos-orange-dark: #e55a2b;       /* Dark orange (active) */
--haos-orange-glow: #ff6b3580;     /* Semi-transparent glow */

/* Supporting accents (orange variations) */
--haos-accent-warm: #ff9e6d;       /* Warm light orange */
--haos-accent-deep: #d14d28;       /* Deep burnt orange */
--haos-accent-neon: #ffaa00;       /* Neon orange-yellow */
--haos-accent-fire: #ff4500;       /* Fire orange-red */

/* Semantic (using orange theme) */
--haos-success: #ff9e6d;           /* Light orange for success */
--haos-warning: #ffaa00;           /* Neon orange for warning */
--haos-error: #ff4500;             /* Fire orange for errors */
--haos-info: #ff6b35;              /* Brand orange for info */

/* Text */
--haos-text-primary: #ffffff;
--haos-text-secondary: #cccccc;
--haos-text-dim: #888888;
```

### Component Library

- Knobs: Circular, 3D gradient, touch-friendly
- Sliders: Horizontal/vertical, with value display
- Buttons: Consistent states (normal, hover, active, disabled)
- LED indicators: Pulsing animations for recording/playing
- VU meters: Color-graded (green → yellow → red)
- Waveform displays: Real-time visualization

## 🧪 Testing Strategy

### Unit Tests
- Each module tested independently
- Audio routing verified
- State management validated

### Integration Tests
- Module combinations
- Routing scenarios
- Project save/load

### User Testing
- Beta testers from community
- A/B testing old vs new
- Performance monitoring

## 📚 Documentation Plan

### User Docs
- Quick start guide
- Video tutorials
- Feature walkthroughs
- Migration guide

### Developer Docs
- Module API reference
- Contributing guide
- Architecture overview
- Code examples

---

## 🎯 Next Actions

1. **Review & Approve** this design document
2. **Create** `haos-studio.html` skeleton
3. **Build** core unified engine
4. **Port** first modules (TB-303, TR-909)
5. **Test** basic workflow
6. **Iterate** based on feedback

---

**Status**: Design Phase  
**Target Launch**: 4 weeks from approval  
**Last Updated**: November 27, 2025  
**Version**: 1.0.0
