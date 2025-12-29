/**
 * Circuit Board Background Component
 * Based on haos-platform.html and techno-workspace.html
 * Animated circuit lines with HAOS orange glow
 * Date: December 28, 2025
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

// Local colors to avoid initialization timing issues
const COLORS = {
  bgDark: '#050508',
  circuitLine: 'rgba(255, 107, 53, 0.15)',
  orange: '#FF6B35',
  orangeGlow: 'rgba(255, 107, 53, 0.4)',
};

const { width, height } = Dimensions.get('window');

// Generate random circuit lines
const generateCircuitLines = (count = 30) => {
  const lines = [];
  for (let i = 0; i < count; i++) {
    // Random position
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    
    // Random direction (horizontal or vertical)
    const isHorizontal = Math.random() > 0.5;
    
    // Random length
    const length = 50 + Math.random() * 200;
    
    // Random opacity
    const opacity = 0.1 + Math.random() * 0.3;
    
    lines.push({
      id: i,
      startX,
      startY,
      isHorizontal,
      length,
      opacity,
      width: Math.random() > 0.8 ? 2 : 1, // Some lines thicker
    });
  }
  return lines;
};

// Circuit Node (connection points)
const CircuitNode = ({ x, y, size = 4, opacity = 0.3 }) => (
  <View
    style={[
      styles.node,
      {
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        opacity,
      },
    ]}
  />
);

// Circuit Line Component
const CircuitLine = ({ startX, startY, isHorizontal, length, opacity, width: lineWidth }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Random pulse animation
    const delay = Math.random() * 5000;
    const duration = 2000 + Math.random() * 3000;

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }, delay);
  }, []);

  const animatedOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [opacity, opacity * 1.5, opacity],
  });

  if (isHorizontal) {
    return (
      <Animated.View
        style={[
          styles.line,
          {
            left: startX,
            top: startY,
            width: length,
            height: lineWidth,
            opacity: animatedOpacity,
          },
        ]}
      />
    );
  } else {
    return (
      <Animated.View
        style={[
          styles.line,
          {
            left: startX,
            top: startY,
            width: lineWidth,
            height: length,
            opacity: animatedOpacity,
          },
        ]}
      />
    );
  }
};

const CircuitBoardBackground = ({ density = 'medium', animated = true }) => {
  const lineCount = density === 'high' ? 50 : density === 'low' ? 15 : 30;
  const nodeCount = Math.floor(lineCount / 3);
  
  const circuitLines = useRef(generateCircuitLines(lineCount)).current;
  const circuitNodes = useRef(
    Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 3 + Math.random() * 5,
      opacity: 0.2 + Math.random() * 0.4,
    }))
  ).current;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Background gradient overlay */}
      <View style={styles.gradientOverlay} />
      
      {/* Circuit nodes (connection points) */}
      {circuitNodes.map((node) => (
        <CircuitNode
          key={`node-${node.id}`}
          x={node.x}
          y={node.y}
          size={node.size}
          opacity={node.opacity}
        />
      ))}
      
      {/* Circuit lines */}
      {animated
        ? circuitLines.map((line) => (
            <CircuitLine
              key={`line-${line.id}`}
              startX={line.startX}
              startY={line.startY}
              isHorizontal={line.isHorizontal}
              length={line.length}
              opacity={line.opacity}
              width={line.width}
            />
          ))
        : circuitLines.map((line) => (
            <View
              key={`line-static-${line.id}`}
              style={[
                styles.line,
                {
                  left: line.startX,
                  top: line.startY,
                  width: line.isHorizontal ? line.length : line.width,
                  height: line.isHorizontal ? line.width : line.length,
                  opacity: line.opacity,
                },
              ]}
            />
          ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgDark,
    pointerEvents: 'none', // Allow touches to pass through to content below
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(5, 5, 8, 0.3)', // Subtle darkening
  },
  line: {
    position: 'absolute',
    backgroundColor: COLORS.circuitLine,
  },
  node: {
    position: 'absolute',
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orangeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default CircuitBoardBackground;
