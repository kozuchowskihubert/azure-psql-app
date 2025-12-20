/**
 * HAOS.fm Waveform Visualizer
 * Real-time oscilloscope-style waveform display
 * Features: Multiple waveforms, color-coded, animated
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../styles/HAOSDesignSystem';

const { width } = Dimensions.get('window');

export default function WaveformVisualizer({
  waveform = 'sine',
  frequency = 440,
  amplitude = 0.8,
  width: customWidth = width - 40,
  height = 120,
  color = COLORS.accentGreen,
  showGrid = true,
  animated = true,
}) {
  const [waveData, setWaveData] = useState([]);
  const animatedPhase = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState(0);
  
  // Generate waveform data
  useEffect(() => {
    generateWaveform();
    
    if (animated) {
      // Animate phase for moving waveform
      Animated.loop(
        Animated.timing(animatedPhase, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
      
      // Listen to animation value
      const listenerId = animatedPhase.addListener(({ value }) => {
        setPhase(value * Math.PI * 2);
      });
      
      return () => {
        animatedPhase.removeListener(listenerId);
      };
    }
  }, [waveform, frequency, amplitude, animated]);
  
  // Generate waveform points
  const generateWaveform = () => {
    const points = 200;
    const data = [];
    const cycles = 2; // Show 2 complete cycles
    
    for (let i = 0; i < points; i++) {
      const x = i / (points - 1);
      const t = x * Math.PI * 2 * cycles + phase;
      let y = 0;
      
      switch (waveform) {
        case 'sine':
          y = Math.sin(t);
          break;
        case 'square':
          y = Math.sin(t) >= 0 ? 1 : -1;
          break;
        case 'sawtooth':
          y = 2 * ((t / (Math.PI * 2)) % 1) - 1;
          break;
        case 'triangle':
          const sawValue = 2 * ((t / (Math.PI * 2)) % 1) - 1;
          y = 2 * Math.abs(sawValue) - 1;
          break;
        case 'noise':
          y = Math.random() * 2 - 1;
          break;
        default:
          y = Math.sin(t);
      }
      
      data.push({
        x: x * customWidth,
        y: height / 2 - (y * amplitude * (height / 2 - 10)),
      });
    }
    
    setWaveData(data);
  };
  
  // Re-generate on phase change
  useEffect(() => {
    if (animated) {
      generateWaveform();
    }
  }, [phase]);
  
  // Convert points to SVG path
  const getPath = () => {
    if (waveData.length === 0) return '';
    
    let path = `M ${waveData[0].x} ${waveData[0].y}`;
    
    for (let i = 1; i < waveData.length; i++) {
      path += ` L ${waveData[i].x} ${waveData[i].y}`;
    }
    
    return path;
  };
  
  return (
    <View style={[styles.container, { width: customWidth, height }]}>
      <Svg width={customWidth} height={height}>
        <Defs>
          <SvgGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </SvgGradient>
        </Defs>
        
        {/* Grid */}
        {showGrid && (
          <>
            {/* Horizontal grid lines */}
            <Line
              x1="0"
              y1={height / 2}
              x2={customWidth}
              y2={height / 2}
              stroke={COLORS.border}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <Line
              x1="0"
              y1={height / 4}
              x2={customWidth}
              y2={height / 4}
              stroke={COLORS.border}
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <Line
              x1="0"
              y1={(height / 4) * 3}
              x2={customWidth}
              y2={(height / 4) * 3}
              stroke={COLORS.border}
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            
            {/* Vertical grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <Line
                key={i}
                x1={(customWidth / 4) * i}
                y1="0"
                x2={(customWidth / 4) * i}
                y2={height}
                stroke={COLORS.border}
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            ))}
          </>
        )}
        
        {/* Waveform path */}
        <Path
          d={getPath()}
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
});
