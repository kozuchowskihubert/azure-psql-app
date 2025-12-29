/**
 * HAOS Design System - Shared Styles
 * Consistent theming across all screens
 */

import { StyleSheet } from 'react-native';

export const HAOS_COLORS = {
  // Backgrounds
  bgDark: '#000000',
  bgCard: 'rgba(15, 15, 15, 0.95)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  
  // Brand Colors
  gold: '#D4AF37',
  goldLight: '#FFD700',
  goldDark: '#B8941F',
  silver: '#C0C0C0',
  silverLight: '#E0E0E0',
  silverDark: '#A0A0A0',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  orangeDark: '#FF4500',
  
  // Functional Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  
  // Borders & Accents
  border: 'rgba(212, 175, 55, 0.3)',
  borderLight: 'rgba(212, 175, 55, 0.1)',
  borderStrong: 'rgba(212, 175, 55, 0.6)',
  
  // Status Colors
  success: '#39FF14',
  warning: '#FFD700',
  error: '#FF4500',
  info: '#00D9FF',
};

export const HAOS_GRADIENTS = {
  gold: ['#D4AF37', '#FFD700'],  // gold to goldLight
  silver: ['#C0C0C0', '#A0A0A0'],  // silver to silverDark
  orange: ['#FF6B35', '#FF8C5A'],  // orange to orangeLight
  goldToOrange: ['#D4AF37', '#FF6B35'],  // gold to orange
  silverToGold: ['#C0C0C0', '#D4AF37'],  // silver to gold
  darkToBlack: ['#000000', 'rgba(0, 0, 0, 0.8)'],  // bgDark to black
};

export const HAOS_STYLES = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: '#000000', // HAOS_COLORS.bgDark
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Cards
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // HAOS_COLORS.bgCard
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // HAOS_COLORS.border
  },
  cardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // HAOS_COLORS.bgGlass
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)', // HAOS_COLORS.borderLight
  },
  
  // Panels
  panel: {
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // HAOS_COLORS.bgCard
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // HAOS_COLORS.border
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)', // HAOS_COLORS.borderLight
  },
  panelIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37', // HAOS_COLORS.gold
    letterSpacing: 1.5,
  },
  
  // Typography
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37', // HAOS_COLORS.gold
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // HAOS_COLORS.textPrimary
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // HAOS_COLORS.textPrimary
    letterSpacing: 1,
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)', // HAOS_COLORS.textSecondary
    lineHeight: 20,
  },
  textDim: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)', // HAOS_COLORS.textDim
    lineHeight: 18,
  },
  
  // Buttons
  button: {
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // HAOS_COLORS.bgCard
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // HAOS_COLORS.border
  },
  buttonPrimary: {
    backgroundColor: '#D4AF37', // HAOS_COLORS.gold
    borderColor: '#FFD700', // HAOS_COLORS.goldLight
  },
  buttonSecondary: {
    backgroundColor: '#C0C0C0', // HAOS_COLORS.silver
    borderColor: '#E0E0E0', // HAOS_COLORS.silverLight
  },
  buttonAccent: {
    backgroundColor: '#FF6B35', // HAOS_COLORS.orange
    borderColor: '#FF8C5A', // HAOS_COLORS.orangeLight
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // HAOS_COLORS.textPrimary
  },
  buttonTextPrimary: {
    color: '#000000', // HAOS_COLORS.black
  },
  
  // Pills
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // HAOS_COLORS.bgCard
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // HAOS_COLORS.border
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: {
    backgroundColor: '#D4AF37', // HAOS_COLORS.gold
    borderColor: '#FFD700', // HAOS_COLORS.goldLight
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)', // HAOS_COLORS.textSecondary
  },
  pillTextActive: {
    color: '#000000', // HAOS_COLORS.black
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem2: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  gridItem3: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '32%',
  },
  
  // Spacing
  spacer8: { height: 8 },
  spacer16: { height: 16 },
  spacer24: { height: 24 },
  spacer32: { height: 32 },
  
  // Flex helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


