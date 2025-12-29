/**
 * SafeColors.js - Plain color constants with NO DEPENDENCIES
 * Use this file for module-level StyleSheet definitions to avoid
 * circular dependency and module initialization issues.
 * 
 * NO IMPORTS - NO EXPORTS THAT REFERENCE OTHER EXPORTS
 */

// HAOS Brand Colors
export const PRIMARY = '#FF6B35';
export const PRIMARY_DARK = '#E65A2B';
export const PRIMARY_LIGHT = '#FF8C5A';

// Backgrounds
export const BG_DARK = '#000000';
export const BG_CARD = 'rgba(15, 15, 15, 0.95)';
export const BG_GLASS = 'rgba(255, 255, 255, 0.03)';
export const BACKGROUND = '#0a0a0a';
export const SURFACE = '#1a1a1a';

// Text
export const TEXT_PRIMARY = '#FFFFFF';
export const TEXT_SECONDARY = 'rgba(255, 255, 255, 0.7)';
export const TEXT_DIM = 'rgba(255, 255, 255, 0.4)';

// Brand Accents
export const GOLD = '#D4AF37';
export const GOLD_LIGHT = '#FFD700';
export const SILVER = '#C0C0C0';
export const ORANGE = '#FF6B35';
export const CYAN = '#00D9FF';
export const GREEN = '#39FF14';
export const PURPLE = '#6A0DAD';

// Borders
export const BORDER = 'rgba(212, 175, 55, 0.3)';
export const BORDER_LIGHT = 'rgba(212, 175, 55, 0.1)';

// Status
export const SUCCESS = '#39FF14';
export const WARNING = '#FFD700';
export const ERROR = '#FF4500';

// Layout
export const SPACING_XS = 4;
export const SPACING_SM = 8;
export const SPACING_MD = 16;
export const SPACING_LG = 24;
export const SPACING_XL = 32;

export const FLOATING_BUTTON_SIZE = 48;

// Shadows (as object)
export const SHADOW_LARGE = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 16,
  elevation: 8,
};

console.log('✅ SafeColors loaded (no dependencies)');
