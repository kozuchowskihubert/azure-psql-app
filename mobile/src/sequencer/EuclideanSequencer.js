/**
 * Euclidean Rhythm Sequencer
 * Generates rhythmic patterns using the Euclidean algorithm
 * Popular in electronic music for creating polyrhythms
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

const HAOS_COLORS = {
  green: '#00ff94',
  cyan: '#00ffff',
  orange: '#ff8800',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

// Euclidean algorithm to distribute hits evenly across steps
const generateEuclideanPattern = (steps, pulses, rotation = 0) => {
  if (pulses > steps || pulses === 0) {
    return Array(steps).fill(false);
  }

  const pattern = Array(steps).fill(false);
  const slope = pulses / steps;
  let previous = -1;

  for (let i = 0; i < steps; i++) {
    const current = Math.floor(i * slope);
    if (current !== previous) {
      pattern[i] = true;
      previous = current;
    }
  }

  // Apply rotation
  if (rotation !== 0) {
    const rotated = [...pattern];
    for (let i = 0; i < steps; i++) {
      rotated[(i + rotation) % steps] = pattern[i];
    }
    return rotated;
  }

  return pattern;
};

const EuclideanSequencer = ({
  onStepTrigger,
  isPlaying = false,
  bpm = 120,
  color = HAOS_COLORS.green,
  title = 'EUCLIDEAN SEQUENCER',
  maxSteps = 16,
}) => {
  const [steps, setSteps] = useState(16);
  const [pulses, setPulses] = useState(8); // Start with 8 pulses for demo
  const [rotation, setRotation] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [pattern, setPattern] = useState([]);

  const stepAnimations = useRef(
    Array(maxSteps).fill(null).map(() => new Animated.Value(1))
  ).current;

  // Generate pattern when parameters change
  useEffect(() => {
    const newPattern = generateEuclideanPattern(steps, pulses, rotation);
    setPattern(newPattern);
    console.log(`🔄 Euclidean pattern generated: ${pulses} pulses in ${steps} steps`, newPattern);
  }, [steps, pulses, rotation]);

  // Sequencer engine
  useEffect(() => {
    if (!isPlaying || pattern.length === 0) {
      setCurrentStep(-1);
      return;
    }

    const stepDuration = (60 / bpm / 4) * 1000; // 16th notes in ms
    let stepIndex = 0;

    const timer = setInterval(() => {
      const isHit = pattern[stepIndex];
      console.log(`🎵 Euclidean Step ${stepIndex}: ${isHit ? 'HIT' : 'rest'}`);
      
      if (isHit && onStepTrigger) {
        console.log(`🎹 Euclidean Triggering: MIDI 60, vel=0.8, dur=0.2s`);
        onStepTrigger({
          note: 60,
          velocity: 0.8,
          duration: 0.2,
          stepIndex,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setCurrentStep(stepIndex);

      // Animate step
      Animated.sequence([
        Animated.timing(stepAnimations[stepIndex], {
          toValue: 1.3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnimations[stepIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      stepIndex = (stepIndex + 1) % steps;
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isPlaying, bpm, pattern, steps]);

  const randomizePattern = () => {
    setPulses(Math.floor(Math.random() * steps) + 1);
    setRotation(Math.floor(Math.random() * steps));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[color + '30', color + '10']}
        style={styles.header}
      >
        <Text style={[styles.title, { color }]}>{title}</Text>
        <TouchableOpacity onPress={randomizePattern} style={styles.controlButton}>
          <Text style={[styles.controlButtonText, { color }]}>Random</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Pattern Display */}
      <View style={styles.patternContainer}>
        <View style={styles.circleContainer}>
          {pattern.map((active, index) => {
            const angle = (index / steps) * 2 * Math.PI - Math.PI / 2;
            const radius = 80;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isCurrent = currentStep === index && isPlaying;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.circleStep,
                  {
                    left: 120 + x - 12,
                    top: 120 + y - 12,
                    backgroundColor: active
                      ? isCurrent
                        ? color
                        : color + '80'
                      : 'rgba(255,255,255,0.1)',
                    transform: [{ scale: stepAnimations[index] }],
                  },
                  isCurrent && { borderColor: color, borderWidth: 3 },
                ]}
              >
                <Text style={[styles.stepNumber, active && { color: '#0a0a0a' }]}>
                  {index + 1}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Center info */}
        <View style={styles.centerInfo}>
          <Text style={[styles.centerText, { color }]}>
            {pulses}/{steps}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>STEPS</Text>
          <Slider
            style={styles.slider}
            minimumValue={4}
            maximumValue={maxSteps}
            step={1}
            value={steps}
            onValueChange={setSteps}
            minimumTrackTintColor={color}
            maximumTrackTintColor={HAOS_COLORS.mediumGray}
            thumbTintColor={color}
          />
          <Text style={styles.controlValue}>{steps}</Text>
        </View>

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>PULSES</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={steps}
            step={1}
            value={pulses}
            onValueChange={setPulses}
            minimumTrackTintColor={color}
            maximumTrackTintColor={HAOS_COLORS.mediumGray}
            thumbTintColor={color}
          />
          <Text style={styles.controlValue}>{pulses}</Text>
        </View>

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>ROTATION</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={steps - 1}
            step={1}
            value={rotation}
            onValueChange={setRotation}
            minimumTrackTintColor={color}
            maximumTrackTintColor={HAOS_COLORS.mediumGray}
            thumbTintColor={color}
          />
          <Text style={styles.controlValue}>{rotation}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
    backgroundColor: HAOS_COLORS.darkGray,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.4)',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patternContainer: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  circleContainer: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  circleStep: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepNumber: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 'bold',
  },
  centerInfo: {
    position: 'absolute',
  },
  centerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  controls: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    width: 80,
    letterSpacing: 0.5,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
});

export default EuclideanSequencer;
