/**
 * Touch-Optimized Knob Component
 * Supports gestures, haptic feedback, and smooth value changes
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const Knob = ({
  label = 'Knob',
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  size = 80,
  color = '#00ff94',
  onChange,
  unit = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const rotation = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        // Light haptic feedback on touch
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Calculate angle from center
        const angle = Math.atan2(dy, dx);
        const deltaAngle = angle - lastAngle.current;
        
        // Sensitivity adjustment
        const sensitivity = 0.5;
        const delta = -dy * sensitivity;
        
        // Calculate new value
        const range = max - min;
        const newValue = Math.max(min, Math.min(max, displayValue + (delta / 100) * range));
        const snappedValue = Math.round(newValue / step) * step;
        
        if (snappedValue !== displayValue) {
          setDisplayValue(snappedValue);
          
          // Haptic feedback on value change
          if (Math.abs(snappedValue - displayValue) >= step) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          
          // Callback
          if (onChange) {
            onChange(snappedValue);
          }
          
          // Update rotation animation
          const normalizedValue = (snappedValue - min) / (max - min);
          const rotationDegrees = -135 + (normalizedValue * 270); // -135° to +135°
          
          if (rotation && typeof rotation.setValue === 'function') {
            Animated.spring(rotation, {
              toValue: rotationDegrees,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }).start();
          }
        }
        
        lastAngle.current = angle;
      },

      onPanResponderRelease: () => {
        // Medium haptic feedback on release
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    })
  ).current;

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-135, 135],
    outputRange: ['-135deg', '135deg'],
  });

  const normalizedValue = (displayValue - min) / (max - min);

  return (
    <View style={styles.container}>
      <View
        style={[styles.knobContainer, { width: size, height: size }]}
        {...panResponder.panHandlers}
      >
        {/* Knob track (background) */}
        <View
          style={[
            styles.knobTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: '#333',
            },
          ]}
        />
        
        {/* Knob indicator */}
        <Animated.View
          style={[
            styles.knob,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          {/* Indicator line */}
          <View
            style={[
              styles.indicator,
              {
                backgroundColor: color,
                width: size * 0.08,
                height: size * 0.35,
                borderRadius: size * 0.04,
              },
            ]}
          />
        </Animated.View>

        {/* Value arc (progress indicator) */}
        <View
          style={[
            styles.valueArc,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
              borderColor: color,
              borderWidth: 3,
              opacity: 0.3 + normalizedValue * 0.7,
            },
          ]}
          pointerEvents="none"
        />
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Value display */}
      <Text style={[styles.value, { color }]}>
        {displayValue.toFixed(step < 1 ? 1 : 0)}{unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  knobContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  knobTrack: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: '#1a1a1a',
  },
  knob: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  indicator: {
    marginTop: 8,
  },
  valueArc: {
    position: 'absolute',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  label: {
    color: '#999',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default Knob;
