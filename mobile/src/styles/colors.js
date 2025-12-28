/**
 * HAOS.fm Design System - Monotone Color Palette
 * Based on haos-platform.html and techno-workspace.html
 * Date: December 28, 2025
 */

// Main HAOS Colors - Monotone Orange + Gray
export const COLORS = {
  // Background
  bgDark: '#050508',              // Deep black background
  bgCard: 'rgba(15, 15, 20, 0.8)', // Glass panel background
  bgOverlay: 'rgba(5, 5, 8, 0.95)', // Modal overlay
  
  // HAOS Orange - Primary Accent
  orange: '#FF6B35',              // Main HAOS orange
  orangeLight: '#FF8C5A',         // Light orange (highlights)
  orangeDark: '#CC5529',          // Dark orange (shadows)
  orangeGlow: 'rgba(255, 107, 53, 0.4)', // Neon glow
  orangeTransparent: 'rgba(255, 107, 53, 0.2)', // Subtle backgrounds
  
  // Gray Scale - Secondary Elements
  gray: '#808080',                // Mid gray
  grayLight: '#A0A0A0',           // Light gray
  grayDark: '#404040',            // Dark gray
  grayVeryLight: '#C0C0C0',       // Very light gray
  grayVeryDark: '#202020',        // Very dark gray
  
  // Text
  textPrimary: '#F4E8D8',         // Warm white (main text)
  textSecondary: 'rgba(244, 232, 216, 0.6)', // Dimmed text
  textTertiary: 'rgba(244, 232, 216, 0.4)',  // Subtle text
  
  // Borders & Lines
  border: 'rgba(255, 107, 53, 0.2)', // Subtle orange borders
  borderGray: 'rgba(128, 128, 128, 0.3)', // Gray borders
  circuitLine: 'rgba(255, 107, 53, 0.15)', // Circuit board lines
  
  // Status Colors (Limited Use - Monotone Focus)
  green: '#39FF14',               // LIVE indicator, success
  greenGlow: 'rgba(57, 255, 20, 0.3)', // Green glow
  red: '#FF3333',                 // Record, error, delete
  redGlow: 'rgba(255, 51, 51, 0.3)', // Record glow
  yellow: '#FFD700',              // Warning
  
  // Category Colors (for tabs/sections)
  cyan: '#00D9FF',                // Info, SYNTHS category
  purple: '#8B5CF6',              // Special, SAMPLERS category
  gold: '#FFD700',                // Premium, ORCHESTRAL category
  
  // Transparent Overlays
  black50: 'rgba(0, 0, 0, 0.5)',
  black70: 'rgba(0, 0, 0, 0.7)',
  black90: 'rgba(0, 0, 0, 0.9)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white20: 'rgba(255, 255, 255, 0.2)',
  white30: 'rgba(255, 255, 255, 0.3)',
};

// Gradients
export const GRADIENTS = {
  // Persona Card Gradients
  musician: [COLORS.orange, COLORS.orangeLight],
  producer: [COLORS.orangeDark, COLORS.orange],
  adventurer: [COLORS.gray, COLORS.grayLight],
  
  // UI Element Gradients
  primaryButton: [COLORS.orange, COLORS.orangeDark],
  secondaryButton: [COLORS.gray, COLORS.grayDark],
  panel: ['rgba(15, 15, 20, 0.8)', 'rgba(10, 10, 15, 0.9)'],
  
  // Category Gradients
  synths: [COLORS.cyan, '#00A8CC'],
  drums: [COLORS.orange, COLORS.orangeDark],
  samplers: [COLORS.purple, '#6B46C1'],
  orchestral: [COLORS.gold, '#FFB700'],
};

// Shadow Styles
export const SHADOWS = {
  small: {
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.orangeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Border Styles
export const BORDERS = {
  thin: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  medium: {
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  thick: {
    borderWidth: 3,
    borderColor: COLORS.orange,
  },
  subtle: {
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
};

// Glass Morphism Style (for panels)
export const GLASS_PANEL = {
  backgroundColor: COLORS.bgCard,
  borderWidth: 1,
  borderColor: COLORS.border,
  backdropFilter: 'blur(10px)', // Note: May need native implementation
  ...SHADOWS.medium,
};

export default {
  COLORS,
  GRADIENTS,
  SHADOWS,
  BORDERS,
  GLASS_PANEL,
};
