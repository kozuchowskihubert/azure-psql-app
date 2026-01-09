/**
 * RetroPanel - Vintage Synthesizer Panel Component
 * Features: Metallic textures, screws, labels, retro aesthetics
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RetroPanel = ({
  children,
  title,
  theme,
  width = '100%',
  showScrews = true,
  style,
}) => {
  // Render corner screw decorations
  const renderScrew = (position) => {
    const positionStyles = {
      topLeft: { top: 8, left: 8 },
      topRight: { top: 8, right: 8 },
      bottomLeft: { bottom: 8, left: 8 },
      bottomRight: { bottom: 8, right: 8 },
    };

    return (
      <View style={[styles.screw, positionStyles[position]]}>
        <View style={styles.screwHead}>
          <View style={[styles.screwSlot, {
            backgroundColor: theme?.colors?.background || '#0a0a0a',
          }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { width }, style]}>
      {/* Panel background with gradient */}
      <LinearGradient
        colors={theme?.gradients?.panel || ['#2a2a2a', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.panelGradient}
      >
        {/* Top metallic edge */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topEdge}
        />

        {/* Title bar */}
        {title && (
          <View style={[styles.titleBar, {
            borderBottomColor: theme?.colors?.primary || '#00D9FF',
          }]}>
            <Text style={[styles.title, {
              color: theme?.colors?.primary || '#00D9FF',
            }]}>
              {title}
            </Text>
            
            {/* Decorative line */}
            <View style={[styles.titleLine, {
              backgroundColor: theme?.colors?.primary || '#00D9FF',
            }]} />
          </View>
        )}

        {/* Content area */}
        <View style={styles.content}>
          {children}
        </View>

        {/* Corner screws */}
        {showScrews && (
          <>
            {renderScrew('topLeft')}
            {renderScrew('topRight')}
            {renderScrew('bottomLeft')}
            {renderScrew('bottomRight')}
          </>
        )}

        {/* Bottom metallic edge (shadow) */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomEdge}
        />
      </LinearGradient>
    </View>
  );
};

/**
 * SectionDivider - Horizontal divider with label
 */
export const SectionDivider = ({ label, theme }) => {
  return (
    <View style={styles.dividerContainer}>
      <View style={[styles.dividerLine, {
        backgroundColor: theme?.colors?.primary || '#00D9FF',
      }]} />
      {label && (
        <Text style={[styles.dividerLabel, {
          color: theme?.colors?.primary || '#00D9FF',
        }]}>
          {label}
        </Text>
      )}
      <View style={[styles.dividerLine, {
        backgroundColor: theme?.colors?.primary || '#00D9FF',
      }]} />
    </View>
  );
};

/**
 * ParameterLabel - Styled label for knobs and sliders
 */
export const ParameterLabel = ({ text, theme, style }) => {
  return (
    <View style={[styles.paramLabelContainer, style]}>
      <Text style={[styles.paramLabel, {
        color: theme?.colors?.text || '#FFFFFF',
      }]}>
        {text}
      </Text>
      
      {/* Decorative dots */}
      <View style={styles.labelDots}>
        <View style={[styles.labelDot, {
          backgroundColor: theme?.colors?.primary || '#00D9FF',
        }]} />
        <View style={[styles.labelDot, {
          backgroundColor: theme?.colors?.accent || '#FF6B35',
        }]} />
      </View>
    </View>
  );
};

/**
 * LightIndicator - LED status indicator
 */
export const LightIndicator = ({ active = false, color, label, theme }) => {
  const indicatorColor = color || (active 
    ? (theme?.colors?.primary || '#00D9FF')
    : 'rgba(255, 255, 255, 0.2)');

  return (
    <View style={styles.lightContainer}>
      <View style={[styles.lightOuter, {
        borderColor: indicatorColor,
      }]}>
        <View style={[styles.lightInner, {
          backgroundColor: indicatorColor,
          opacity: active ? 1 : 0.3,
          shadowColor: indicatorColor,
          shadowOpacity: active ? 0.8 : 0,
          shadowRadius: active ? 8 : 0,
          elevation: active ? 8 : 0,
        }]} />
      </View>
      {label && (
        <Text style={[styles.lightLabel, {
          color: theme?.colors?.textDim || 'rgba(255, 255, 255, 0.6)',
        }]}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  panelGradient: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    position: 'relative',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  titleBar: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    opacity: 0.3,
  },
  content: {
    width: '100%',
  },
  // Screws
  screw: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  screwHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  screwSlot: {
    width: 10,
    height: 1.5,
    borderRadius: 1,
  },
  // Section Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginHorizontal: 12,
  },
  // Parameter Label
  paramLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paramLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelDots: {
    flexDirection: 'row',
    marginLeft: 6,
    gap: 3,
  },
  labelDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // Light Indicator
  lightContainer: {
    alignItems: 'center',
    gap: 4,
  },
  lightOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  lightInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  lightLabel: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default RetroPanel;
