/**
 * HAOS.fm Mobile Design System
 * Central styling constants for consistent UI/UX
 * Based on web DAW Studio interface
 */

// Color Palette
export const COLORS = {
  // Primary (Orange Theme from Web)
  primary: '#FF6B35',        // HAOS Groove Orange (main accent)
  primaryDark: '#cc5629',    // Darker orange for pressed states
  primaryLight: '#ff8555',   // Lighter orange for highlights
  
  // Background
  background: '#0a0a0a',     // Vinyl Black
  surface: '#1a1a1a',        // Dark gray surface
  surfaceLight: '#242424',   // Lighter surface
  surfaceDark: '#0f0f0f',    // Darker surface
  
  // Text
  textPrimary: '#ffffff',    // White text
  textSecondary: '#F4E8D8',  // Sepia Cream
  textTertiary: '#6B6B6B',   // Dust Gray
  textDisabled: '#4A3C2E',   // Tape Brown
  
  // Accents (HAOS Brand Colors)
  secondary: '#D4AF37',      // Turntable Gold
  accent: '#FF6B35',         // Groove Orange alias
  accentOrange: '#FF6B35',   // Groove Orange
  accentGreen: '#39FF14',    // Acid Green
  accentCyan: '#00D9FF',     // 909 Cyan
  accentPurple: '#6A0DAD',   // Warehouse Purple
  accentRed: '#8B2635',      // Oxide Red
  accentGold: '#D4AF37',     // Turntable Gold
  accentYellow: '#D4AF37',   // Gold alias for caution
  
  // UI Elements
  border: '#333333',         // Standard border
  borderLight: '#444444',    // Lighter border
  borderActive: '#00ff94',   // Active/focused border
  
  // States
  active: '#00ff94',
  inactive: '#666666',
  disabled: '#333333',
  hover: '#00cc76',
  pressed: '#00aa60',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Shadows
  shadowPrimary: '#00ff94',
  shadowDark: '#000000',
};

// Typography
export const TYPOGRAPHY = {
  // Font Families (HAOS Brand Fonts)
  fontFamily: {
    regular: 'System',           // Body text (Inter fallback)
    bold: 'System',              // Bold text
    mono: 'Courier',             // Monospace (Space Mono fallback)
    display: 'System',           // Display text (Bebas Neue fallback - use all caps)
    terminal: 'Courier',         // Terminal/retro text (VT323 fallback)
  },
  
  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    mega: 48,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
    wider: 2,
    widest: 4,
  },
};

// Spacing System (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  mega: 64,
};

// Border Radius
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  // Standard shadows
  small: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  
  // Glow effects
  glowPrimary: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  glowPrimaryStrong: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  glowPrimarySubtle: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
};

// Button Styles
export const BUTTONS = {
  // Primary Action Button (Cyan)
  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
    shadowColor: COLORS.shadowPrimary,
    shadowOpacity: 0.5,
  },
  primaryText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  
  // Secondary Button (Outlined)
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  secondaryText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  
  // Tertiary Button (Ghost)
  tertiary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tertiaryText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  
  // Icon Button
  icon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Small Button
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  
  // Toggle Button (Active/Inactive)
  toggle: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  toggleTextActive: {
    color: COLORS.background,
  },
  toggleTextInactive: {
    color: COLORS.textTertiary,
  },
};

// Card Styles
export const CARDS = {
  // Standard Card
  standard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  
  // Elevated Card
  elevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  
  // Interactive Card (clickable)
  interactive: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  interactiveActive: {
    borderColor: COLORS.primary,
    ...SHADOWS.glowPrimarySubtle,
  },
  
  // Instrument Card
  instrument: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.large,
  },
  instrumentActive: {
    borderColor: COLORS.primary,
    ...SHADOWS.glowPrimary,
  },
};

// Input Styles
export const INPUTS = {
  // Standard Text Input
  standard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  standardFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  
  // Label
  label: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.sm,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
};

// Slider Styles
export const SLIDERS = {
  track: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
  },
  trackActive: {
    backgroundColor: COLORS.primary,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    ...SHADOWS.glowPrimarySubtle,
  },
};

// Knob Styles (Rotary Controls)
export const KNOBS = {
  container: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  outerActive: {
    borderColor: COLORS.primary,
    ...SHADOWS.glowPrimarySubtle,
  },
  indicator: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  value: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
};

// Transport Controls
export const TRANSPORT = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
  },
  
  // Play/Stop Button
  playButton: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glowPrimary,
  },
  playButtonActive: {
    backgroundColor: COLORS.accentRed,
    ...SHADOWS.large,
  },
  
  // Secondary Transport Buttons
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
};

// Sequencer Grid
export const SEQUENCER = {
  step: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.glowPrimarySubtle,
  },
  stepPlaying: {
    borderWidth: 3,
    borderColor: COLORS.accentYellow,
  },
  stepAccent: {
    backgroundColor: COLORS.accentOrange,
    borderColor: COLORS.accentOrange,
  },
};

// Mixer Channel
export const MIXER = {
  channel: {
    width: 80,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  channelActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  
  fader: {
    width: 40,
    height: 200,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  meter: {
    width: 8,
    height: 200,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  meterFill: {
    backgroundColor: COLORS.primary,
  },
  meterPeak: {
    backgroundColor: COLORS.accentRed,
  },
};

// Preset Browser
export const PRESETS = {
  category: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
  },
  categoryActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  
  presetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOWS.glowPrimarySubtle,
  },
};

// Layout Constants
export const LAYOUT = {
  screenPadding: SPACING.xl,
  sectionSpacing: SPACING.xxl,
  cardGap: SPACING.base,
  
  // Common widths
  buttonMinWidth: 100,
  iconButtonSize: 48,
  knobSize: 60,
  
  // Header
  headerHeight: 60,
  
  // Bottom Tab Bar
  tabBarHeight: 60,
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Utility Functions
export const createButtonStyle = (type, state = 'default') => {
  const baseStyle = BUTTONS[type];
  const stateStyles = {
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  };
  
  return [baseStyle, stateStyles[state]].filter(Boolean);
};

export const createCardStyle = (type, active = false) => {
  const baseStyle = CARDS[type];
  const activeStyle = active ? CARDS[`${type}Active`] : null;
  
  return [baseStyle, activeStyle].filter(Boolean);
};

// Text Styles (TYPO alias for convenience)
export const TYPO = {
  // HAOS Display Text (use with uppercase)
  display: {
    fontFamily: TYPOGRAPHY.fontFamily.display,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.xxxl,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  displayLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.display,
    fontSize: TYPOGRAPHY.fontSize.mega,
    fontWeight: TYPOGRAPHY.fontWeight.heavy,
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.mega,
    letterSpacing: TYPOGRAPHY.letterSpacing.widest,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: TYPOGRAPHY.fontFamily.mono,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    color: COLORS.textSecondary,
  },
  h1: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.xxxl,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight * TYPOGRAPHY.fontSize.xxl,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.xl,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    color: COLORS.textPrimary,
  },
  h4: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.lg,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  small: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textSecondary,
  },
};

// Shadow alias for convenience (SHADOW = SHADOWS)
export const SHADOW = SHADOWS;

export default {
  COLORS,
  TYPOGRAPHY,
  TYPO,
  SPACING,
  RADIUS,
  SHADOWS,
  SHADOW,
  BUTTONS,
  CARDS,
  INPUTS,
  SLIDERS,
  KNOBS,
  TRANSPORT,
  SEQUENCER,
  MIXER,
  PRESETS,
  LAYOUT,
  ANIMATION,
  createButtonStyle,
  createCardStyle,
};
