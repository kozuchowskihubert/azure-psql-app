/**
 * Bass 2D Visualizer - Matching web bass-studio.html
 * Using SVG for Expo Go compatibility (works without native build)
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Line, Rect, Circle, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  green: '#39FF14',
  greenLight: '#4AFF14',
  bgDark: 'rgba(5, 5, 8, 0.9)',
};

const Bass2DVisualizer = forwardRef(({ isPlaying, audioEngine }, ref) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const bassFrequenciesRef = useRef(new Array(128).fill(0));
  const stringVibrationsRef = useRef([0, 0, 0, 0]);
  const particlesRef = useRef([]);
  const wavePointsRef = useRef([]);
  const frameCount = useRef(0);

  // Initialize particles and wave points
  useEffect(() => {
    // 100 particles
    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * 250,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
    }));

    // 200 wave points
    wavePointsRef.current = Array.from({ length: 200 }, (_, i) => ({
      x: i * (SCREEN_WIDTH / 200),
      y: 125,
      amplitude: 0,
      frequency: Math.random() * 0.02 + 0.01,
    }));
  }, []);

  // Animation loop at ~30fps for better SVG performance
  useEffect(() => {
    const animate = () => {
      Animated.timing(animatedValue, {
        toValue: frameCount.current++,
        duration: 33,
        useNativeDriver: false,
      }).start();

      // Decay frequencies
      bassFrequenciesRef.current = bassFrequenciesRef.current.map((val) => val * 0.92);
      
      // Decay string vibrations
      stringVibrationsRef.current = stringVibrationsRef.current.map((val) => val * 0.95);

      // Update wave points
      wavePointsRef.current.forEach((point, i) => {
        point.y = 125 +
          Math.sin(frameCount.current * 0.1 + i * point.frequency) * 15 +
          Math.sin(frameCount.current * 0.05 + i * 0.02) * point.amplitude;
        point.amplitude *= 0.96;
      });

      // Update particles
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > SCREEN_WIDTH) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 250) particle.vy *= -1;
      });
    };

    const interval = setInterval(animate, 33);
    return () => clearInterval(interval);
  }, []);

  // Auto-trigger bass notes for demo
  useEffect(() => {
    const triggerInterval = setInterval(() => {
      triggerBassNote(40 + Math.random() * 80, 0.5 + Math.random() * 0.5);
    }, 1500);

    return () => clearInterval(triggerInterval);
  }, []);

  // Trigger bass note visualization
  const triggerBassNote = (frequency = 60, intensity = 0.8) => {
    const index = Math.floor((frequency / 20000) * bassFrequenciesRef.current.length);
    if (index >= 0 && index < bassFrequenciesRef.current.length) {
      bassFrequenciesRef.current[index] = intensity;
    }

    // Trigger string vibration
    const stringIndex = Math.floor(Math.random() * 4);
    stringVibrationsRef.current[stringIndex] = 1.0;

    // Add energy to wave
    wavePointsRef.current.forEach((point, i) => {
      point.amplitude = Math.sin(i * 0.1) * 40 * intensity;
    });
  };

  // Expose trigger method
  useImperativeHandle(ref, () => ({
    triggerBassNote,
  }));

  // Listen for playback
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        triggerBassNote(60, 0.7);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Create waveform path
  const createWaveformPath = () => {
    let path = '';
    wavePointsRef.current.forEach((point, i) => {
      if (i === 0) {
        path = `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });
    return path;
  };

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={250} style={styles.svg}>
        {/* Background */}
        <Rect x={0} y={0} width={SCREEN_WIDTH} height={250} fill={COLORS.bgDark} />

        {/* Grid lines */}
        {Array.from({ length: 10 }, (_, i) => {
          const y = (250 / 10) * i;
          return (
            <Line
              key={`grid-${i}`}
              x1={0}
              y1={y}
              x2={SCREEN_WIDTH}
              y2={y}
              stroke="rgba(57, 255, 20, 0.05)"
              strokeWidth={1}
            />
          );
        })}

        {/* Bass strings (4 horizontal lines with wave effect) */}
        {[0.3, 0.45, 0.55, 0.7].map((yFactor, index) => {
          const y = 250 * yFactor;
          const vibration = stringVibrationsRef.current[index];
          let stringPath = '';
          
          for (let x = 0; x <= SCREEN_WIDTH; x += 5) {
            const vib = Math.sin(x * 0.05 + frameCount.current * 0.2) * vibration * 10;
            if (x === 0) {
              stringPath = `M ${x} ${y + vib}`;
            } else {
              stringPath += ` L ${x} ${y + vib}`;
            }
          }
          
          return (
            <Path
              key={`string-${index}`}
              d={stringPath}
              stroke={`rgba(57, 255, 20, ${0.6 + vibration * 0.4})`}
              strokeWidth={2 + vibration * 2}
              fill="none"
            />
          );
        })}

        {/* Frequency spectrum bars (128 bars) */}
        {bassFrequenciesRef.current.map((value, i) => {
          if (value < 0.01) return null;
          
          const x = i * (SCREEN_WIDTH / bassFrequenciesRef.current.length);
          const barHeight = value * 250 * 0.4;
          const barWidth = (SCREEN_WIDTH / bassFrequenciesRef.current.length) - 1;

          return (
            <Rect
              key={`freq-${i}`}
              x={x}
              y={250 - barHeight}
              width={barWidth}
              height={barHeight}
              fill={value > 0.5 ? COLORS.greenLight : COLORS.green}
              opacity={0.8}
            />
          );
        })}

        {/* Waveform */}
        <Path
          d={createWaveformPath()}
          stroke="rgba(57, 255, 20, 0.4)"
          strokeWidth={2}
          fill="none"
        />

        {/* Particles (show 50 for performance) */}
        {particlesRef.current.slice(0, 50).map((particle, i) => (
          <Circle
            key={`particle-${i}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={COLORS.green}
            opacity={0.4}
          />
        ))}

        {/* Particle connections (show sample) */}
        {particlesRef.current.slice(0, 30).map((particle, i) => {
          const next = particlesRef.current[i + 1];
          if (!next) return null;
          
          const dx = particle.x - next.x;
          const dy = particle.y - next.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) {
            const alpha = 0.1 * (1 - distance / 80);
            return (
              <Line
                key={`connection-${i}`}
                x1={particle.x}
                y1={particle.y}
                x2={next.x}
                y2={next.y}
                stroke={`rgba(57, 255, 20, ${alpha})`}
                strokeWidth={1}
              />
            );
          }
          return null;
        })}

        {/* Center frequency circles (5 rings) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const avgFreq = bassFrequenciesRef.current
            .slice(i * 25, (i + 1) * 25)
            .reduce((a, b) => a + b, 0) / 25;
          const radius = 30 + i * 25 + avgFreq * 50;

          return (
            <Circle
              key={`circle-${i}`}
              cx={SCREEN_WIDTH / 2}
              cy={125}
              r={radius}
              stroke={COLORS.green}
              strokeWidth={2}
              fill="none"
              opacity={0.1 + avgFreq * 0.3}
            />
          );
        })}

        {/* Center bass pulse */}
        {(() => {
          const centerPulse = bassFrequenciesRef.current
            .slice(0, 20)
            .reduce((a, b) => a + b, 0) / 20;
          
          if (centerPulse > 0.3) {
            const pulseSize = 20 + centerPulse * 40;
            return (
              <Circle
                cx={SCREEN_WIDTH / 2}
                cy={125}
                r={pulseSize}
                fill={COLORS.green}
                opacity={centerPulse * 0.8}
              />
            );
          }
          return null;
        })()}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bgDark,
  },
  svg: {
    flex: 1,
  },
});

Bass2DVisualizer.displayName = 'Bass2DVisualizer';

export default Bass2DVisualizer;
