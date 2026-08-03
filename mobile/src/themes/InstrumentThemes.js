/**
 * HAOS.fm Instrument Theme System
 * Modern, cohesive themes for all instruments
 * Professional color palettes, gradients, and UI patterns
 */

export const INSTRUMENT_THEMES = {
  // 🎛️ ARP 2600 - Orange fire & analog warmth
  ARP2600: {
    name: 'ARP 2600',
    emoji: '🎛️',
    colors: {
      primary: '#FF6B35',      // Fire orange
      secondary: '#FF8C5A',    // Light orange
      accent: '#E55520',       // Dark orange
      glow: '#FF9D7F',         // Soft glow
      contrast: '#00D9FF',     // Cyan (for modulation)
      background: '#1a0a05',   // Dark warm
      panel: '#2a1a0f',        // Panel brown
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.6)',
    },
    gradients: {
      main: ['#FF6B35', '#E55520'],
      panel: ['#2a1a0f', '#1a0a05'],
      button: ['#FF8C5A', '#FF6B35'],
      glow: ['#FF9D7F', '#FF6B35', '#E55520'],
    },
    shadows: {
      knob: '0px 4px 12px rgba(255, 107, 53, 0.4)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 20px rgba(255, 107, 53, 0.6)',
    },
    animations: {
      pulse: { duration: 1500, scale: [1, 1.05, 1] },
      glow: { duration: 2000, opacity: [0.5, 1, 0.5] },
    }
  },

  // 🎹 Juno-106 - Silver/cyan elegance & chorus shimmer
  JUNO106: {
    name: 'Juno-106',
    emoji: '🎹',
    colors: {
      primary: '#00D9FF',      // Bright cyan
      secondary: '#00A8CC',    // Deep cyan
      accent: '#00FFDD',       // Aqua
      glow: '#7FEFFF',         // Light cyan glow
      contrast: '#FF00FF',     // Magenta (for chorus)
      background: '#0a0f1a',   // Dark cool
      panel: '#0f1a2a',        // Panel blue-gray
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      main: ['#00D9FF', '#00A8CC'],
      panel: ['#0f1a2a', '#0a0f1a'],
      button: ['#00FFDD', '#00D9FF'],
      glow: ['#7FEFFF', '#00D9FF', '#00A8CC'],
      chorus: ['#FF00FF', '#00D9FF'], // Chorus effect gradient
    },
    shadows: {
      knob: '0px 4px 12px rgba(0, 217, 255, 0.5)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 24px rgba(0, 217, 255, 0.7)',
    },
    animations: {
      pulse: { duration: 1800, scale: [1, 1.03, 1] },
      shimmer: { duration: 2500, opacity: [0.6, 1, 0.6] },
    }
  },

  // 🎵 Minimoog - Gold/brass power & warmth
  MINIMOOG: {
    name: 'Minimoog',
    emoji: '🎵',
    colors: {
      primary: '#D4AF37',      // Classic gold
      secondary: '#FFD700',    // Bright gold
      accent: '#B8960E',       // Dark gold
      glow: '#FFEB99',         // Warm gold glow
      contrast: '#FF6B35',     // Orange (for filter)
      background: '#1a1505',   // Dark warm
      panel: '#2a2010',        // Panel tan
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.6)',
    },
    gradients: {
      main: ['#FFD700', '#D4AF37'],
      panel: ['#2a2010', '#1a1505'],
      button: ['#FFEB99', '#FFD700'],
      glow: ['#FFEB99', '#FFD700', '#D4AF37'],
    },
    shadows: {
      knob: '0px 4px 12px rgba(212, 175, 55, 0.5)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 20px rgba(255, 215, 0, 0.6)',
    },
    animations: {
      pulse: { duration: 1400, scale: [1, 1.04, 1] },
      glow: { duration: 2000, opacity: [0.5, 1, 0.5] },
    }
  },

  // 💚 TB-303 - Acid green & neon energy
  TB303: {
    name: 'TB-303',
    emoji: '💚',
    colors: {
      primary: '#00FF41',      // Acid green
      secondary: '#00CC34',    // Deep green
      accent: '#39FF14',       // Neon green
      glow: '#7FFF7F',         // Soft green glow
      contrast: '#FF00FF',     // Magenta (for accent)
      background: '#050a05',   // Dark green-black
      panel: '#0a150a',        // Panel dark green
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      main: ['#39FF14', '#00FF41'],
      panel: ['#0a150a', '#050a05'],
      button: ['#7FFF7F', '#39FF14'],
      glow: ['#7FFF7F', '#39FF14', '#00FF41'],
      acid: ['#00FF41', '#FFFF00'], // Classic acid gradient
    },
    shadows: {
      knob: '0px 4px 12px rgba(0, 255, 65, 0.6)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 24px rgba(57, 255, 20, 0.8)',
    },
    animations: {
      pulse: { duration: 1200, scale: [1, 1.06, 1] },
      acid: { duration: 1000, opacity: [0.6, 1, 0.6] }, // Fast acid animation
    }
  },

  // 🎸 Bass (808 + Reese) - Deep purple/red power
  BASS: {
    name: 'Bass Synth',
    emoji: '🎸',
    colors: {
      primary: '#9B59B6',      // Deep purple
      secondary: '#8E44AD',    // Royal purple
      accent: '#C39BD3',       // Light purple
      glow: '#D7BDE2',         // Soft purple glow
      contrast: '#FF4757',     // Red (for sub)
      background: '#0a050f',   // Dark purple-black
      panel: '#15091f',        // Panel purple
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.6)',
    },
    gradients: {
      main: ['#9B59B6', '#8E44AD'],
      panel: ['#15091f', '#0a050f'],
      button: ['#C39BD3', '#9B59B6'],
      glow: ['#D7BDE2', '#9B59B6', '#8E44AD'],
      sub: ['#FF4757', '#9B59B6'], // Sub bass gradient
    },
    shadows: {
      knob: '0px 4px 16px rgba(155, 89, 182, 0.6)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.7)',
      glow: '0px 0px 28px rgba(155, 89, 182, 0.7)',
    },
    animations: {
      pulse: { duration: 2000, scale: [1, 1.02, 1] }, // Slow, heavy
      rumble: { duration: 800, opacity: [0.7, 1, 0.7] }, // Sub rumble
    }
  },

  // 🥁 Drums - Multi-color energy (each drum type)
  DRUMS: {
    name: 'Drum Machine',
    emoji: '🥁',
    colors: {
      kick: '#FF4757',         // Red
      snare: '#00D9FF',        // Cyan
      hihat: '#FFD700',        // Gold
      clap: '#FF6B35',         // Orange
      tom: '#9B59B6',          // Purple
      cymbal: '#00FF94',       // Green
      background: '#0a0a0a',   // Pure black
      panel: '#1a1a1a',        // Dark gray
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      kick: ['#FF4757', '#EE5A6F'],
      snare: ['#00D9FF', '#00A8CC'],
      hihat: ['#FFD700', '#FFC700'],
      clap: ['#FF8C5A', '#FF6B35'],
      tom: ['#9B59B6', '#8E44AD'],
      cymbal: ['#00FF94', '#00CC75'],
      panel: ['#1a1a1a', '#0a0a0a'],
    },
    shadows: {
      kick: '0px 4px 16px rgba(255, 71, 87, 0.6)',
      snare: '0px 4px 12px rgba(0, 217, 255, 0.5)',
      hihat: '0px 4px 12px rgba(255, 215, 0, 0.5)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
    },
    animations: {
      hit: { duration: 300, scale: [1, 1.2, 1] }, // Fast drum hit
      decay: { duration: 500, opacity: [1, 0.3] },
    }
  },

  // 🎹 Piano - Classic black/white elegance
  PIANO: {
    name: 'Piano',
    emoji: '🎹',
    colors: {
      primary: '#FFFFFF',      // White keys
      secondary: '#000000',    // Black keys
      accent: '#D4AF37',       // Gold accents
      glow: '#FFE5CC',         // Warm glow
      contrast: '#4A90E2',     // Blue (for sustain)
      background: '#000000',   // Pure black
      panel: '#1a1a1a',        // Dark panel
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      main: ['#FFFFFF', '#E8E8E8'],
      black: ['#000000', '#1a1a1a'],
      panel: ['#1a1a1a', '#000000'],
      button: ['#D4AF37', '#B8960E'],
      glow: ['#FFE5CC', '#D4AF37'],
    },
    shadows: {
      key: '0px 4px 8px rgba(0, 0, 0, 0.8)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 16px rgba(212, 175, 55, 0.4)',
    },
    animations: {
      press: { duration: 200, scale: [1, 0.95, 1] },
      sustain: { duration: 3000, opacity: [1, 0.3] },
    }
  },

  // 🎻 Strings/Orchestral - Warm red/brown elegance
  STRINGS: {
    name: 'Strings',
    emoji: '🎻',
    colors: {
      primary: '#C44569',      // Warm red
      secondary: '#A13854',    // Deep red
      accent: '#E57A8E',       // Rose
      glow: '#F5B7C8',         // Soft pink glow
      contrast: '#D4AF37',     // Gold
      background: '#0f0505',   // Dark warm
      panel: '#1f0a0a',        // Panel red-brown
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      main: ['#C44569', '#A13854'],
      panel: ['#1f0a0a', '#0f0505'],
      button: ['#E57A8E', '#C44569'],
      glow: ['#F5B7C8', '#C44569', '#A13854'],
    },
    shadows: {
      knob: '0px 4px 12px rgba(196, 69, 105, 0.5)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 20px rgba(196, 69, 105, 0.6)',
    },
    animations: {
      bow: { duration: 2500, opacity: [0.5, 1, 0.5] },
      vibrato: { duration: 800, scale: [1, 1.01, 1] },
    }
  },

  // 🌌 Global/Default - HAOS brand theme
  HAOS: {
    name: 'HAOS.fm',
    emoji: '🌌',
    colors: {
      primary: '#00D9FF',      // HAOS cyan
      secondary: '#9966ff',    // HAOS purple
      accent: '#ff00ff',       // HAOS pink
      glow: '#00ffff',         // Cyan glow
      contrast: '#FF6B35',     // Orange
      background: '#000000',   // Pure black
      panel: '#0a0a0a',        // Very dark
      text: '#FFFFFF',
      textDim: 'rgba(255, 255, 255, 0.7)',
    },
    gradients: {
      main: ['#00D9FF', '#9966ff'],
      secondary: ['#ff00ff', '#9966ff'],
      panel: ['#0a0a0a', '#000000'],
      button: ['#00ffff', '#00D9FF'],
      cosmic: ['#00D9FF', '#9966ff', '#ff00ff'], // 3-color cosmic
    },
    shadows: {
      knob: '0px 4px 12px rgba(0, 217, 255, 0.5)',
      panel: '0px 2px 8px rgba(0, 0, 0, 0.6)',
      glow: '0px 0px 24px rgba(0, 217, 255, 0.6)',
    },
    animations: {
      cosmic: { duration: 3000, opacity: [0.5, 1, 0.5] },
      pulse: { duration: 1500, scale: [1, 1.03, 1] },
    }
  },
};

/**
 * Get theme for specific instrument
 */
export const getInstrumentTheme = (instrumentId) => {
  const themeMap = {
    'arp2600': 'ARP2600',
    'arp-2600': 'ARP2600',
    'juno106': 'JUNO106',
    'juno-106': 'JUNO106',
    'minimoog': 'MINIMOOG',
    'tb303': 'TB303',
    'tb-303': 'TB303',
    'bass808': 'BASS',
    'bass-808': 'BASS',
    'bassreese': 'BASS',
    'reese': 'BASS',
    'kick': 'DRUMS',
    'snare': 'DRUMS',
    'hihat': 'DRUMS',
    'clap': 'DRUMS',
    'drums': 'DRUMS',
    'piano': 'PIANO',
    'grand': 'PIANO',
    'rhodes': 'PIANO',
    'upright': 'PIANO',
    'violin': 'STRINGS',
    'strings': 'STRINGS',
  };

  const themeName = themeMap[instrumentId?.toLowerCase()] || 'HAOS';
  return INSTRUMENT_THEMES[themeName];
};

/**
 * Create themed gradient style
 */
export const createGradientStyle = (theme, gradientName = 'main') => {
  return {
    colors: theme.gradients[gradientName] || theme.gradients.main,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };
};

/**
 * Create themed shadow style
 */
export const createShadowStyle = (theme, shadowName = 'knob') => {
  return {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  };
};

/**
 * Generate instrument card colors for Studio screen
 */
export const INSTRUMENT_CARD_COLORS = {
  arp2600: INSTRUMENT_THEMES.ARP2600.gradients.main,
  juno106: INSTRUMENT_THEMES.JUNO106.gradients.main,
  minimoog: INSTRUMENT_THEMES.MINIMOOG.gradients.main,
  tb303: INSTRUMENT_THEMES.TB303.gradients.main,
  kick: INSTRUMENT_THEMES.DRUMS.gradients.kick,
  snare: INSTRUMENT_THEMES.DRUMS.gradients.snare,
  hihat: INSTRUMENT_THEMES.DRUMS.gradients.hihat,
  clap: INSTRUMENT_THEMES.DRUMS.gradients.clap,
  bass808: INSTRUMENT_THEMES.BASS.gradients.main,
  bassReese: INSTRUMENT_THEMES.BASS.gradients.sub,
};

export default INSTRUMENT_THEMES;
