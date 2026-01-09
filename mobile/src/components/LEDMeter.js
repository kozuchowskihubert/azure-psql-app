/**
 * LEDMeter - Professional VU Meter Display
 * Features: Peak hold, color zones, retro LED segments, smooth animations
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const LEDMeter = ({
  value = 0,               // 0-1 range
  segments = 20,           // Number of LED segments
  width = 200,
  height = 12,
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  showPeak = true,         // Show peak hold indicator
  peakHoldTime = 1500,     // Peak hold duration (ms)
  colorZones = true,       // Use color zones (green/yellow/red)
  theme,                   // Theme from InstrumentThemes.js
  style,
}) => {
  const peakValue = useRef(0);
  const peakTimer = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedPeak = useRef(new Animated.Value(0)).current;

  // Update animated value smoothly
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    // Update peak hold
    if (value > peakValue.current) {
      peakValue.current = value;
      
      Animated.spring(animatedPeak, {
        toValue: value,
        useNativeDriver: false,
        tension: 80,
        friction: 10,
      }).start();

      // Reset peak hold timer
      if (peakTimer.current) {
        clearTimeout(peakTimer.current);
      }
      
      peakTimer.current = setTimeout(() => {
        Animated.timing(animatedPeak, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }).start(() => {
          peakValue.current = 0;
        });
      }, peakHoldTime);
    }
  }, [value]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (peakTimer.current) {
        clearTimeout(peakTimer.current);
      }
    };
  }, []);

  // Get LED color based on position and theme
  const getLEDColor = (segmentIndex, totalSegments) => {
    if (!colorZones) {
      return theme?.colors?.primary || '#00D9FF';
    }

    const position = segmentIndex / totalSegments;
    
    // Color zones: Green (0-60%) → Yellow (60-85%) → Red (85-100%)
    if (position < 0.6) {
      return theme?.colors?.contrast || '#00FF41'; // Green zone
    } else if (position < 0.85) {
      return '#FFD700'; // Yellow zone
    } else {
      return '#FF4757'; // Red zone
    }
  };

  // Render LED segments
  const renderSegments = () => {
    const segments_arr = [];
    const activeCount = Math.floor(value * segments);
    const peakPosition = Math.floor(peakValue.current * segments);
    
    for (let i = 0; i < segments; i++) {
      const isActive = i < activeCount;
      const isPeak = showPeak && i === peakPosition - 1 && peakPosition > activeCount;
      
      const ledColor = getLEDColor(i, segments);
      const segmentStyle = orientation === 'horizontal'
        ? {
            width: (width - (segments * 2)) / segments,
            height: height,
            marginHorizontal: 1,
          }
        : {
            width: width,
            height: (height - (segments * 2)) / segments,
            marginVertical: 1,
          };

      segments_arr.push(
        <View
          key={i}
          style={[
            styles.segment,
            segmentStyle,
            {
              backgroundColor: isActive || isPeak 
                ? ledColor 
                : 'rgba(255, 255, 255, 0.1)',
              opacity: isActive ? 1 : (isPeak ? 0.8 : 0.3),
              shadowColor: isActive || isPeak ? ledColor : 'transparent',
              shadowOpacity: isActive || isPeak ? 0.8 : 0,
              shadowRadius: 4,
              elevation: isActive || isPeak ? 4 : 0,
            },
          ]}
        />
      );
    }
    
    return segments_arr;
  };

  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' 
          ? { width, height, flexDirection: 'row' }
          : { width, height, flexDirection: 'column-reverse' },
        {
          backgroundColor: theme?.colors?.background || 'rgba(10, 10, 10, 0.8)',
          borderColor: theme?.colors?.primary || '#00D9FF',
        },
        style,
      ]}
    >
      {renderSegments()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  segment: {
    borderRadius: 2,
  },
});

export default LEDMeter;
