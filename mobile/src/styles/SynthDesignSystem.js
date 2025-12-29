/**
 * HAOS.fm Synth Design System
 * Unified design language for all synthesizer interfaces
 */

import { StyleSheet, Dimensions } from 'react-native';

console.log('🎛️ SynthDesignSystem loading...');

const { width, height } = Dimensions.get('window');

// HAOS.fm Brand Colors (monochromatic with accent)
export const COLORS = {
  // Primary Brand
  primary: '#FF6B35',        // HAOS Orange
  primaryDark: '#E65A2B',    // Darker orange for active states
  primaryLight: '#FF8C5A',   // Lighter orange for highlights
  
  // Neutral Grays (main palette)
  background: '#0a0a0a',     // Deep black background
  surface: '#1a1a1a',        // Card/panel surface
  surfaceLight: '#2a2a2a',   // Lighter surface for contrast
  border: '#333333',         // Subtle borders
  
  // Text
  textPrimary: '#FFFFFF',    // White text
  textSecondary: '#C0C0C0',  // Silver text
  textMuted: '#808080',      // Muted gray text
  
  // Accent Colors (minimal use)
  accent: '#00D9FF',         // Cyan for special elements
  success: '#00ff94',        // Green for indicators
  warning: '#FFD700',        // Gold for warnings
  error: '#FF4444',          // Red for errors
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
};

// Typography Scale
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#FF6B35',  // COLORS.primary
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#FFFFFF',  // COLORS.textPrimary
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#FFFFFF',  // COLORS.textPrimary
  },
  
  // Body text
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: '#C0C0C0',  // COLORS.textSecondary
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    color: '#808080',  // COLORS.textMuted
  },
  
  // Labels
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#C0C0C0',  // COLORS.textSecondary
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#808080',  // COLORS.textMuted
    textTransform: 'uppercase',
  },
  
  // Values
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',  // COLORS.primary
  },
  valueSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',  // COLORS.primary
  },
};

// Spacing System (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#FF6B35',  // COLORS.primary
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Layout Dimensions
export const LAYOUT = {
  screenWidth: width,
  screenHeight: height,
  maxContentWidth: 600,
  headerHeight: 60,
  floatingButtonSize: 48,
  sliderHeight: 40,
  controlHeight: 60,
};

// Common Styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',  // COLORS.background
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',  // COLORS.border
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.md,
  },
  
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    color: '#808080',  // COLORS.textMuted
  },
  
  card: {
    backgroundColor: '#1a1a1a',  // COLORS.surface
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  floatingButton: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 1000,
    width: LAYOUT.floatingButtonSize,
    height: LAYOUT.floatingButtonSize,
    borderRadius: LAYOUT.floatingButtonSize / 2,
    backgroundColor: '#FF6B35',  // COLORS.primary
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  
  floatingButtonText: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',  // COLORS.textPrimary
    lineHeight: 28,
  },
});

console.log('✅ SynthDesignSystem commonStyles created successfully');

// Animation Durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Haptic Feedback Styles
export const HAPTICS = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  selection: 'selection',
};

/*
 * Default export temporarily disabled due to module initialization issue
 * All exports are available as named imports
 *
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  LAYOUT,
  ANIMATIONS,
  HAPTICS,
  commonStyles,
};
*/

console.log('🎉 SynthDesignSystem module loading complete!');