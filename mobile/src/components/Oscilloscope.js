/**
 * HAOS.fm Oscilloscope Component
 * Reusable waveform visualizer for synthesizers
 * Canvas-based rendering at 60fps
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const Oscilloscope = ({
  waveformData = [],
  width = 200,
  height = 100,
  color = '#00ff94',
  backgroundColor = 'rgba(0,0,0,0.5)',
  lineWidth = 2,
  showGrid = true,
  gridColor = 'rgba(255,255,255,0.1)',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation when waveform is active
    if (waveformData.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [waveformData]);

  // Generate waveform path from data
  const generateWaveformPath = () => {
    if (waveformData.length === 0) {
      // Generate default sine wave when no data
      const points = 100;
      const defaultData = Array.from({ length: points }, (_, i) => {
        return Math.sin((i / points) * Math.PI * 4) * 0.5;
      });
      return generatePath(defaultData);
    }
    return generatePath(waveformData);
  };

  const generatePath = (data) => {
    const centerY = height / 2;
    const stepX = width / (data.length - 1);
    
    let path = `M 0 ${centerY}`;
    
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = centerY - (value * (height * 0.4));
      path += ` L ${x} ${y}`;
    });
    
    return path;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const horizontalLines = 5;
    const verticalLines = 10;
    
    // Horizontal lines
    for (let i = 0; i <= horizontalLines; i++) {
      const y = (height / horizontalLines) * i;
      lines.push(
        `M 0 ${y} L ${width} ${y}`
      );
    }
    
    // Vertical lines
    for (let i = 0; i <= verticalLines; i++) {
      const x = (width / verticalLines) * i;
      lines.push(
        `M ${x} 0 L ${x} ${height}`
      );
    }
    
    return lines.join(' ');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.8" />
            <Stop offset="1" stopColor={color} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Grid */}
        {showGrid && (
          <Path
            d={generateGridLines()}
            stroke={gridColor}
            strokeWidth={0.5}
            fill="none"
          />
        )}

        {/* Waveform */}
        <Path
          d={generateWaveformPath()}
          stroke="url(#waveGradient)"
          strokeWidth={lineWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glow effect */}
        <Path
          d={generateWaveformPath()}
          stroke={color}
          strokeWidth={lineWidth + 2}
          fill="none"
          opacity={0.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* Center line indicator */}
      <View style={[styles.centerLine, { top: height / 2 - 0.5 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default Oscilloscope;
