/**
 * HAOS.fm Animated Knob Component
 * Professional rotary knob with HAOS design system
 * Features: Touch rotation, value display, color-coded ranges
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../styles/HAOSDesignSystem';

const { width } = Dimensions.get('window');

export default function AnimatedKnob({
  label = 'PARAM',
  value = 0.5,
  min = 0,
  max = 1,
  onChange,
  size = 80,
  color = COLORS.accentGreen,
  unit = '',
  decimals = 2,
  steps = null,
}) {
  const [currentValue, setCurrentValue] = useState(value);
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastY = useRef(0);
  
  // Convert value to rotation angle (-135 to 135 degrees)
  const valueToAngle = (val) => {
    const normalized = (val - min) / (max - min);
    return normalized * 270 - 135;
  };
  
  // Convert angle to value
  const angleToValue = (angle) => {
    const normalized = (angle + 135) / 270;
    let val = min + normalized * (max - min);
    
    // Apply steps if specified
    if (steps) {
      const stepSize = (max - min) / (steps - 1);
      val = Math.round(val / stepSize) * stepSize;
    }
    
    return Math.max(min, Math.min(max, val));
  };
  
  // Update rotation when value changes
  useEffect(() => {
    const angle = valueToAngle(currentValue);
    Animated.spring(rotation, {
      toValue: angle,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [currentValue]);
  
  // Pan responder for touch control
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        lastY.current = 0;
        // Scale up on touch
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Vertical drag changes value
        const sensitivity = 0.5;
        const delta = (lastY.current - gestureState.dy) * sensitivity;
        lastY.current = gestureState.dy;
        
        const currentAngle = valueToAngle(currentValue);
        const newAngle = Math.max(-135, Math.min(135, currentAngle + delta));
        const newValue = angleToValue(newAngle);
        
        setCurrentValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      },
      
      onPanResponderRelease: () => {
        // Scale back to normal
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;
  
  // Get color based on value range
  const getValueColor = () => {
    const normalized = (currentValue - min) / (max - min);
    if (normalized < 0.33) return COLORS.accentCyan;
    if (normalized < 0.66) return color;
    return COLORS.accentOrange;
  };
  
  const displayValue = currentValue.toFixed(decimals) + unit;
  const valueColor = getValueColor();
  
  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Knob */}
      <Animated.View
        style={[
          styles.knobContainer,
          {
            width: size,
            height: size,
            transform: [
              { scale },
              { rotate: rotation.interpolate({
                inputRange: [-135, 135],
                outputRange: ['-135deg', '135deg'],
              })}
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[COLORS.surfaceLight, COLORS.surface, COLORS.surfaceDark]}
          style={styles.knobGradient}
        >
          {/* Outer ring */}
          <View style={[styles.outerRing, { borderColor: valueColor }]} />
          
          {/* Inner circle */}
          <View style={styles.innerCircle}>
            <View style={[styles.indicator, { backgroundColor: valueColor }]} />
          </View>
          
          {/* Arc indicator */}
          <View style={styles.arcContainer}>
            <View
              style={[
                styles.arc,
                {
                  borderColor: valueColor,
                  transform: [{ rotate: '-135deg' }],
                },
              ]}
            />
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Value Display */}
      <View style={[styles.valueContainer, { borderColor: valueColor }]}>
        <Text style={[styles.value, { color: valueColor }]}>
          {displayValue}
        </Text>
      </View>
      
      {/* Min/Max Labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min.toFixed(decimals)}</Text>
        <Text style={styles.rangeLabel}>{max.toFixed(decimals)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  knobContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  knobGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  outerRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 1000,
    borderWidth: 2,
  },
  innerCircle: {
    width: '60%',
    height: '60%',
    borderRadius: 1000,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 5,
  },
  indicator: {
    width: 3,
    height: '40%',
    borderRadius: 2,
  },
  arcContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  arc: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  valueContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 9,
    color: COLORS.textTertiary,
    fontFamily: 'monospace',
  },
});
