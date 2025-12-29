/**
 * Interactive Slider Component for ARP 2600
 * Supports pan gestures, haptic feedback, and smooth value updates
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 64; // Padding consideration

const InteractiveSlider = ({
  value,
  onChange,
  min = 0,
  max = 1,
  label,
  unit = '',
  color = '#FF6B35',
  formatValue = null,
  vertical = false,
  logarithmic = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const lastHapticValue = useRef(value);

  // Convert value to position (0-1 normalized)
  const valueToPosition = (val) => {
    if (logarithmic) {
      const logMin = Math.log(min);
      const logMax = Math.log(max);
      const logVal = Math.log(val);
      return (logVal - logMin) / (logMax - logMin);
    }
    return (val - min) / (max - min);
  };

  // Convert position to value
  const positionToValue = (pos) => {
    const clampedPos = Math.max(0, Math.min(1, pos));
    if (logarithmic) {
      const logMin = Math.log(min);
      const logMax = Math.log(max);
      const logVal = logMin + clampedPos * (logMax - logMin);
      return Math.exp(logVal);
    }
    return min + clampedPos * (max - min);
  };

  // Haptic feedback at intervals
  const triggerHapticIfNeeded = (newValue) => {
    const step = (max - min) / 20; // 20 haptic points
    const lastStep = Math.floor(lastHapticValue.current / step);
    const currentStep = Math.floor(newValue / step);
    
    if (lastStep !== currentStep) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = newValue;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const sliderWidth = SLIDER_WIDTH - 40; // Minus padding
        let position;
        
        if (vertical) {
          position = 1 - (gestureState.moveY - gestureState.y0) / sliderWidth;
        } else {
          position = gestureState.dx / sliderWidth + valueToPosition(value);
        }
        
        const newValue = positionToValue(position);
        triggerHapticIfNeeded(newValue);
        onChange(newValue);
      },
      
      onPanResponderRelease: () => {
        setIsDragging(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const position = valueToPosition(value);
  const displayValue = formatValue 
    ? formatValue(value) 
    : unit 
      ? `${value.toFixed(unit === 'Hz' ? 0 : 2)} ${unit}`
      : value.toFixed(2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.label, { color: isDragging ? color : '#C0C0C0' }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color }]}>
          {displayValue}
        </Text>
      </View>

      {/* Slider Track */}
      <View style={styles.trackContainer} {...panResponder.panHandlers}>
        <View style={[styles.track, { backgroundColor: color + '20' }]}>
          {/* Fill */}
          <View
            style={[
              styles.fill,
              {
                width: `${position * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
          
          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              {
                left: `${position * 100}%`,
                backgroundColor: color,
                transform: [{ scale: isDragging ? 1.3 : 1 }],
                shadowColor: color,
              },
            ]}
          >
            <View style={styles.thumbInner} />
          </View>
        </View>

        {/* Tick marks */}
        <View style={styles.ticks}>
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <View
              key={tick}
              style={[
                styles.tick,
                { left: `${tick * 100}%`, backgroundColor: color + '40' },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Menlo',
    letterSpacing: 0.5,
  },
  trackContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    overflow: 'visible',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -14,
    marginTop: -11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  ticks: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    flexDirection: 'row',
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 10,
    marginLeft: -1,
    marginTop: -2,
  },
});

export default InteractiveSlider;
