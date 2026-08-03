/**
 * AnimatedKnob - Professional Rotary Knob Control
 * Features: LED ring, haptic feedback, smooth animations, retro design
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, G } from 'react-native-svg';

const AnimatedKnob = ({
  value = 0,              // 0-1 range
  onValueChange,
  size = 80,
  label = '',
  min = 0,
  max = 100,
  unit = '',
  theme,                  // Theme from InstrumentThemes.js
  showLEDRing = true,
  sensitivity = 2,        // Rotation sensitivity
  hapticFeedback = true,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  
  const lastAngle = useRef(0);
  const isDragging = useRef(false);

  // Safe theme access with defaults
  const safeTheme = {
    colors: theme?.colors || {
      primary: '#00D9FF',
      accent: '#FF6B35',
      glow: 'rgba(0, 217, 255, 0.3)',
      text: '#FFFFFF',
      background: '#0a0a0a',
    },
    gradients: theme?.gradients || {
      button: ['#FF8C5A', '#FF6B35'],
    },
    animations: theme?.animations || {
      glow: { duration: 2000 },
    },
  };

  // Convert value (0-1) to rotation angle (-135° to +135° = 270° range)
  const valueToAngle = (val) => {
    return -135 + (val * 270);
  };

  // Convert angle to value (0-1)
  const angleToValue = (angle) => {
    // Normalize angle to -135 to +135
    let normalized = ((angle + 135) % 360) - 135;
    if (normalized < -135) normalized = -135;
    if (normalized > 135) normalized = 135;
    
    return (normalized + 135) / 270;
  };

  // Update rotation when value changes externally
  useEffect(() => {
    const angle = valueToAngle(value);
    Animated.spring(rotation, {
      toValue: angle,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [value]);

  // Glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: safeTheme.animations.glow.duration,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: safeTheme.animations.glow.duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        isDragging.current = true;
        lastAngle.current = valueToAngle(value);
        
        // Scale down animation
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }).start();

        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        // Calculate rotation based on vertical drag
        const deltaAngle = -gestureState.dy * sensitivity;
        let newAngle = lastAngle.current + deltaAngle;
        
        // Clamp angle to -135° to +135°
        newAngle = Math.max(-135, Math.min(135, newAngle));
        
        // Update rotation
        rotation.setValue(newAngle);
        
        // Calculate new value and trigger callback
        const newValue = angleToValue(newAngle);
        
        // Haptic feedback every 10% change
        if (hapticFeedback && Math.abs(newValue - value) > 0.1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        if (onValueChange) {
          onValueChange(newValue);
        }
      },

      onPanResponderRelease: () => {
        isDragging.current = false;
        
        // Scale back up
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }).start();

        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
    })
  ).current;

  // Calculate display value
  const displayValue = Math.round(min + (value * (max - min)));

  // LED ring segments (24 LEDs)
  const renderLEDRing = () => {
    if (!showLEDRing) return null;

    const ledCount = 24;
    const leds = [];
    const activeCount = Math.floor(value * ledCount);
    
    for (let i = 0; i < ledCount; i++) {
      const angle = -135 + (i * (270 / (ledCount - 1)));
      const radian = (angle * Math.PI) / 180;
      const radius = size / 2 - 8;
      const x = (size / 2) + (radius * Math.cos(radian));
      const y = (size / 2) + (radius * Math.sin(radian));
      
      const isActive = i <= activeCount;
      const ledColor = isActive 
        ? safeTheme.colors.primary
        : 'rgba(255, 255, 255, 0.2)';
      
      leds.push(
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={2}
          fill={ledColor}
          opacity={isActive ? 1 : 0.3}
        />
      );
    }
    
    return leds;
  };

  // Knob pointer indicator
  const renderPointer = () => {
    const pointerLength = size * 0.3;
    const pointerWidth = 3;
    
    return (
      <Path
        d={`M ${size / 2} ${size / 2 - 5} L ${size / 2} ${size / 2 - pointerLength}`}
        stroke={safeTheme.colors.accent}
        strokeWidth={pointerWidth}
        strokeLinecap="round"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, { color: safeTheme.colors.text }]}>
          {label}
        </Text>
      )}

      {/* Knob Container */}
      <View style={styles.knobContainer} {...panResponder.panHandlers}>
        {/* Outer glow */}
        <Animated.View
          style={[
            styles.glow,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              opacity: glowOpacity,
              backgroundColor: safeTheme.colors.glow,
            },
          ]}
        />

        {/* LED Ring (SVG) */}
        {showLEDRing && (
          <Svg
            width={size}
            height={size}
            style={StyleSheet.absoluteFillObject}
          >
            <G>{renderLEDRing()}</G>
          </Svg>
        )}

        {/* Knob body */}
        <Animated.View
          style={[
            styles.knob,
            {
              width: size - 16,
              height: size - 16,
              borderRadius: (size - 16) / 2,
              transform: [{ scale }, { rotate: rotation.interpolate({
                inputRange: [-135, 135],
                outputRange: ['-135deg', '135deg'],
              }) }],
            },
          ]}
        >
          <LinearGradient
            colors={safeTheme.gradients.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.knobGradient, {
              shadowColor: safeTheme.colors.primary,
            }]}
          >
            {/* Center dot */}
            <View style={[styles.centerDot, {
              backgroundColor: safeTheme.colors.background,
            }]} />
            
            {/* Pointer line */}
            <Svg width={size - 16} height={size - 16} style={StyleSheet.absoluteFillObject}>
              {renderPointer()}
            </Svg>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Value display */}
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: safeTheme.colors.primary }]}>
          {displayValue}
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  knobContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    zIndex: 0,
  },
  knob: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  knobGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  valueContainer: {
    marginTop: 8,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  unit: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginLeft: 2,
  },
});

export default AnimatedKnob;
