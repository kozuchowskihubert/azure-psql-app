/**
 * HAOS Instrument Theme Extensions
 * Colors and styles for specific instrument types
 */

// Instrument-specific color schemes
export const INSTRUMENT_COLORS = {
  // Bass instruments - GREEN
  bass: {
    primary: '#39FF14',      // Neon green
    secondary: '#00ff94',    // Light green
    accent: '#00D9FF',       // Cyan accent
    gradient: ['#39FF14', '#00ff94'],
    highlight: '#7FFF00',    // Chartreuse highlight
  },
  
  // String instruments - BLACK
  strings: {
    primary: '#000000',      // Black
    secondary: '#1a1a1a',    // Dark gray
    accent: '#333333',       // Medium gray accent
    gradient: ['#000000', '#1a1a1a'],
    highlight: '#404040',    // Light gray highlight
  },
  
  // Violin - RED
  violin: {
    primary: '#FF3333',      // Red
    secondary: '#FF6666',    // Light red
    accent: '#FF0000',       // Bright red accent
    gradient: ['#FF3333', '#FF6666'],
    highlight: '#FF9999',    // Pink highlight
  },
  
  // Brass instruments
  brass: {
    primary: '#FFD700',      // Bright gold
    secondary: '#FFA500',    // Orange
    accent: '#FF6B35',       // Orange accent
    gradient: ['#FFD700', '#FFA500'],
    highlight: '#FFED4E',    // Light gold highlight
  },
  
  // Synth instruments
  synth: {
    primary: '#00D9FF',      // Cyan
    secondary: '#00ffff',    // Bright cyan
    accent: '#9966ff',       // Purple accent
    gradient: ['#00D9FF', '#00ffff'],
    highlight: '#4DFFF9',    // Light cyan highlight
  },
  
  // Drums/Percussion - ORANGE
  drums: {
    primary: '#FF6B35',      // Orange
    secondary: '#FF8C5A',    // Light orange
    accent: '#FFD700',       // Gold accent
    gradient: ['#FF6B35', '#FF8C5A'],
    highlight: '#FFA500',    // Bright orange highlight
  },
  
  // Orchestral
  orchestral: {
    primary: '#C0C0C0',      // Silver
    secondary: '#E0E0E0',    // Light silver
    accent: '#D4AF37',       // Gold accent
    gradient: ['#C0C0C0', '#E0E0E0'],
    highlight: '#F0F0F0',    // Very light silver highlight
  },
  
  // Keys/Piano
  keys: {
    primary: '#9966ff',      // Purple
    secondary: '#B088FF',    // Light purple
    accent: '#00D9FF',       // Cyan accent
    gradient: ['#9966ff', '#B088FF'],
    highlight: '#C8A8FF',    // Light purple highlight
  },
  
  // Modular/Experimental
  modular: {
    primary: '#FF00FF',      // Magenta
    secondary: '#FF4500',    // Red-orange
    accent: '#00ffff',       // Cyan accent
    gradient: ['#FF00FF', '#FF4500'],
    highlight: '#FF66FF',    // Light magenta highlight
  },
};

// Preset button styles
export const PRESET_STYLES = {
  // Bass presets
  sub: {
    emoji: '🔊',
    color: '#FF6B35',  // bass.primary
    gradient: ['#FF6B35', '#FF4500'],
  },
  reese: {
    emoji: '〰️',
    color: '#FF4500',  // bass.secondary
    gradient: ['#FF4500', '#DC143C'],
  },
  wobble: {
    emoji: '🌊',
    color: '#00D9FF',
    gradient: ['#00D9FF', '#00ffff'],
  },
  neurofunk: {
    emoji: '⚡',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
  },
  '808': {
    emoji: '🥁',
    color: '#00ff94',
    gradient: ['#00ff94', '#39FF14'],
  },
  growl: {
    emoji: '🦁',
    color: '#FF00FF',
    gradient: ['#FF00FF', '#FF4500'],
  },
  
  // Synth presets
  pad: {
    emoji: '☁️',
    color: '#9966ff',
    gradient: ['#9966ff', '#B088FF'],
  },
  lead: {
    emoji: '⚡',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
  },
  pluck: {
    emoji: '✨',
    color: '#00D9FF',
    gradient: ['#00D9FF', '#00ffff'],
  },
  brass_section: {
    emoji: '🎺',
    color: '#FFD700',
    gradient: ['#FFD700', '#FF6B35'],
  },
  
  // String presets
  violin: {
    emoji: '🎻',
    color: '#D4AF37',  // strings.primary
    gradient: ['#D4AF37', '#FFD700'],  // strings.gradient
  },
  viola: {
    emoji: '🎻',
    color: '#FFD700',  // strings.secondary
    gradient: ['#FFD700', '#D4AF37'],
  },
  cello: {
    emoji: '🎻',
    color: '#C0C0C0',  // strings.accent
    gradient: ['#C0C0C0', '#A0A0A0'],
  },
};

// Control panel color coding by type
export const CONTROL_TYPES = {
  oscillator: {
    label: 'OSCILLATOR',
    color: '#D4AF37',  // gold
    emoji: '〰️',
  },
  filter: {
    label: 'FILTER',
    color: '#FF6B35',  // orange
    emoji: '🔊',
  },
  envelope: {
    label: 'ENVELOPE',
    color: '#00D9FF',
    emoji: '📊',
  },
  effects: {
    label: 'EFFECTS',
    color: '#00ff94',
    emoji: '✨',
  },
  lfo: {
    label: 'LFO',
    color: '#9966ff',
    emoji: '🌊',
  },
  modulation: {
    label: 'MODULATION',
    color: '#FF00FF',
    emoji: '🔄',
  },
};

// Keyboard color schemes
export const KEYBOARD_COLORS = {
  white: {
    default: 'rgba(15, 15, 15, 0.95)',  // bgCard
    pressed: '#D4AF37',  // gold
    border: 'rgba(255, 255, 255, 0.1)',  // border
  },
  black: {
    default: 'rgba(0, 0, 0, 0.8)',
    pressed: '#FF6B35',  // orange
    border: 'rgba(255, 255, 255, 0.2)',  // borderStrong
  },
};

// Visualization color schemes
export const VISUALIZER_COLORS = {
  waveform: {
    stroke: '#D4AF37',  // gold
    fill: 'rgba(212, 175, 55, 0.2)',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  spectrum: {
    bars: '#FF6B35',  // orange
    peak: '#FFD700',  // goldLight
    background: 'rgba(0, 0, 0, 0.5)',
  },
  oscilloscope: {
    line: '#D4AF37',  // gold
    grid: 'rgba(212, 175, 55, 0.1)',
    background: 'rgba(0, 0, 0, 0.5)',
  },
};

// Button states
export const BUTTON_STATES = {
  default: {
    background: 'rgba(15, 15, 15, 0.95)',  // bgCard
    border: 'rgba(255, 255, 255, 0.1)',  // border
    text: 'rgba(244, 232, 216, 0.9)',  // textSecondary
  },
  active: {
    background: '#D4AF37',  // gold
    border: '#FFD700',  // goldLight
    text: '#000000',  // black
  },
  disabled: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    text: 'rgba(244, 232, 216, 0.4)',  // textDim
  },
};

export default {
  INSTRUMENT_COLORS,
  PRESET_STYLES,
  CONTROL_TYPES,
  KEYBOARD_COLORS,
  VISUALIZER_COLORS,
  BUTTON_STATES,
};
