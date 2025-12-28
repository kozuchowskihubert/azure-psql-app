/**
 * HAOS.fm Typography System
 * Based on techno-workspace.html font usage
 * Date: December 28, 2025
 */

import { Platform } from 'react-native';

// Font Families
export const FONTS = {
  // Primary Font - Bold Display
  heading: Platform.select({
    ios: 'Bebas Neue',
    android: 'BebasNeue-Regular',
    default: 'sans-serif',
  }),
  
  // Secondary Font - Monospace for technical elements
  mono: Platform.select({
    ios: 'JetBrains Mono',
    android: 'JetBrainsMono-Regular',
    default: 'monospace',
  }),
  
  // Body Font - System default
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
};

// Font Sizes
export const FONT_SIZES = {
  // Headings
  xxxl: 48,  // Logo, hero titles
  xxl: 36,   // Screen titles
  xl: 28,    // Section headings
  lg: 20,    // Card titles
  md: 16,    // Body text
  sm: 14,    // Secondary text
  xs: 12,    // Labels
  xxs: 10,   // Tiny text, badges
};

// Line Heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
  loose: 2.0,
};

// Letter Spacing
export const LETTER_SPACING = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 1.5,
};

// Font Weights
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Typography Styles
export const TYPOGRAPHY = {
  // Display - Large titles (HAOS.fm logo, welcome screen)
  display: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: FONT_SIZES.xxxl * LINE_HEIGHTS.tight,
  },
  
  // H1 - Screen titles
  h1: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: FONT_SIZES.xxl * LINE_HEIGHTS.tight,
  },
  
  // H2 - Section headings
  h2: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
  },
  
  // H3 - Card titles
  h3: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  },
  
  // Body - Regular text
  body: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.relaxed,
  },
  
  // Body Bold - Emphasized text
  bodyBold: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.relaxed,
  },
  
  // Caption - Secondary text
  caption: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
  },
  
  // Label - Form labels, badges
  label: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: LETTER_SPACING.wider,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
    textTransform: 'uppercase',
  },
  
  // Tiny - Very small text
  tiny: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: FONT_SIZES.xxs * LINE_HEIGHTS.normal,
  },
  
  // Monospace - Technical elements (BPM, bar counter, timecode)
  mono: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: LETTER_SPACING.normal,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
  },
  
  // Monospace Large - Big technical displays
  monoLarge: {
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.tight,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
  },
  
  // Button Text
  button: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.wider,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
    textTransform: 'uppercase',
  },
  
  // Tab Label
  tabLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: LETTER_SPACING.wide,
    lineHeight: FONT_SIZES.xxs * LINE_HEIGHTS.tight,
    textTransform: 'uppercase',
  },
};

// Text Alignment Helpers
export const TEXT_ALIGN = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
};

export default {
  FONTS,
  FONT_SIZES,
  LINE_HEIGHTS,
  LETTER_SPACING,
  FONT_WEIGHTS,
  TYPOGRAPHY,
  TEXT_ALIGN,
};
