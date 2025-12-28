/**
 * ML-185 Style Step Sequencer
 * Inspired by Max for Live ML-185 Sequencer
 * Features: 16 steps, velocity per step, gate length, probability, swing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  cyan: '#00ffff',
  green: '#00ff94',
  blue: '#00D9FF',
  purple: '#9966ff',
  orange: '#ff8800',
  red: '#ff0044',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const ML185Sequencer = ({
  steps = 16,
  onStepTrigger,
  isPlaying = false,
  bpm = 120,
  color = HAOS_COLORS.cyan,
  title = 'ML-185 SEQUENCER',
}) => {
  // Step data: each step has velocity, gate, probability, and note
  // Initialize with a demo pattern (steps 0, 4, 8, 12 active)
  const [stepData, setStepData] = useState(
    Array(steps).fill(null).map((_, i) => ({
      active: i % 4 === 0, // Every 4th step active by default
      velocity: 100,
      gate: 50,
      probability: 100,
      note: 60 + (i % 4) * 2, // Vary notes slightly
    }))
  );

  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedStep, setSelectedStep] = useState(null);
  const [swing, setSwing] = useState(50);
  const [sequenceLength, setSequenceLength] = useState(16);
  const [editMode, setEditMode] = useState('velocity'); // 'velocity', 'gate', 'probability'

  const stepAnimations = useRef(
    Array(steps).fill(null).map(() => new Animated.Value(1))
  ).current;

  // Sequencer engine
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }

    const getStepDuration = (stepIndex) => {
      const baseDuration = (60 / bpm / 4) * 1000; // 16th notes in ms
      
      // Apply swing to odd steps
      if (stepIndex % 2 === 1) {
        const swingAmount = (swing - 50) / 50; // -1 to 1
        return baseDuration * (1 + swingAmount * 0.5);
      }
      return baseDuration;
    };

    let stepIndex = 0;
    let timeoutId;

    const playStep = () => {
      if (!isPlaying) return;

      const step = stepData[stepIndex];

      // Check if step should trigger (based on probability)
      const shouldTrigger = step.active && (Math.random() * 100 <= step.probability);

      console.log(`🎵 ML185 Step ${stepIndex}: active=${step.active}, shouldTrigger=${shouldTrigger}, note=${step.note}`);

      if (shouldTrigger && onStepTrigger) {
        // Calculate actual gate length in ms
        const gateDuration = (getStepDuration(stepIndex) * step.gate) / 100;
        
        console.log(`🎹 ML185 Triggering: MIDI ${step.note}, vel=${step.velocity / 100}, dur=${(gateDuration / 1000).toFixed(3)}s`);
        
        onStepTrigger({
          note: step.note,
          velocity: step.velocity / 100,
          duration: gateDuration / 1000, // Convert to seconds
          stepIndex,
        });

        // Haptic feedback on note trigger
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Animate step
      setCurrentStep(stepIndex);
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

      // Move to next step
      stepIndex = (stepIndex + 1) % sequenceLength;

      // Schedule next step
      const nextDuration = getStepDuration(stepIndex);
      timeoutId = setTimeout(playStep, nextDuration);
    };

    playStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying, bpm, stepData, swing, sequenceLength]);

  const toggleStep = (stepIndex) => {
    setStepData(prev => {
      const newData = [...prev];
      newData[stepIndex] = {
        ...newData[stepIndex],
        active: !newData[stepIndex].active,
      };
      return newData;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateStepParameter = (stepIndex, param, value) => {
    setStepData(prev => {
      const newData = [...prev];
      newData[stepIndex] = {
        ...newData[stepIndex],
        [param]: value,
      };
      return newData;
    });
  };

  const clearPattern = () => {
    setStepData(prev => prev.map(step => ({ ...step, active: false })));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const randomizePattern = () => {
    setStepData(prev =>
      prev.map(step => ({
        ...step,
        active: Math.random() > 0.4,
        velocity: 50 + Math.random() * 50,
        gate: 30 + Math.random() * 70,
        probability: 60 + Math.random() * 40,
      }))
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getStepHeight = (step) => {
    switch (editMode) {
      case 'velocity':
        return step.velocity;
      case 'gate':
        return step.gate;
      case 'probability':
        return step.probability;
      default:
        return 50;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[color + '30', color + '10']}
        style={styles.header}
      >
        <Text style={[styles.title, { color }]}>{title}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={clearPattern} style={styles.controlButton}>
            <Text style={[styles.controlButtonText, { color }]}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={randomizePattern} style={styles.controlButton}>
            <Text style={[styles.controlButtonText, { color }]}>Random</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Edit Mode Selector */}
      <View style={styles.editModeContainer}>
        {['velocity', 'gate', 'probability'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.editModeButton,
              editMode === mode && { ...styles.editModeButtonActive, backgroundColor: color },
            ]}
            onPress={() => {
              setEditMode(mode);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.editModeText,
                editMode === mode && styles.editModeTextActive,
              ]}
            >
              {mode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step Grid with Parameter Bars */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {stepData.slice(0, sequenceLength).map((step, index) => {
            const isActive = step.active;
            const isCurrent = currentStep === index && isPlaying;
            const height = getStepHeight(step);

            return (
              <View key={index} style={styles.stepColumn}>
                {/* Parameter bar */}
                <View style={styles.parameterBarContainer}>
                  <View
                    style={[
                      styles.parameterBar,
                      { 
                        height: `${height}%`,
                        backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                        opacity: isActive ? 0.8 : 0.3,
                      },
                    ]}
                  />
                </View>

                {/* Step button */}
                <TouchableOpacity
                  onPress={() => toggleStep(index)}
                  onLongPress={() => {
                    setSelectedStep(index);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.step,
                      isActive && { backgroundColor: color, ...styles.stepActive },
                      isCurrent && { ...styles.stepCurrent, borderColor: color },
                      {
                        transform: [{ scale: stepAnimations[index] }],
                      },
                    ]}
                  >
                    <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                      {index + 1}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                {/* Step number below */}
                <Text style={styles.stepLabel}>{index + 1}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Global Controls */}
      <View style={styles.globalControls}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>SWING</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={swing}
            onValueChange={setSwing}
            minimumTrackTintColor={color}
            maximumTrackTintColor={HAOS_COLORS.mediumGray}
            thumbTintColor={color}
          />
          <Text style={styles.controlValue}>{Math.round(swing)}%</Text>
        </View>

        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>LENGTH</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={16}
            step={1}
            value={sequenceLength}
            onValueChange={setSequenceLength}
            minimumTrackTintColor={color}
            maximumTrackTintColor={HAOS_COLORS.mediumGray}
            thumbTintColor={color}
          />
          <Text style={styles.controlValue}>{sequenceLength}</Text>
        </View>
      </View>

      {/* Step Editor (when step selected) */}
      {selectedStep !== null && (
        <View style={[styles.stepEditor, { borderColor: color }]}>
          <View style={styles.stepEditorHeader}>
            <Text style={[styles.stepEditorTitle, { color }]}>
              STEP {selectedStep + 1} EDITOR
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedStep(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepEditorContent}>
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>VELOCITY</Text>
              <Slider
                style={styles.paramSlider}
                minimumValue={0}
                maximumValue={127}
                value={stepData[selectedStep].velocity}
                onValueChange={value =>
                  updateStepParameter(selectedStep, 'velocity', value)
                }
                minimumTrackTintColor={color}
                maximumTrackTintColor={HAOS_COLORS.mediumGray}
                thumbTintColor={color}
              />
              <Text style={styles.paramValue}>
                {Math.round(stepData[selectedStep].velocity)}
              </Text>
            </View>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>GATE</Text>
              <Slider
                style={styles.paramSlider}
                minimumValue={10}
                maximumValue={200}
                value={stepData[selectedStep].gate}
                onValueChange={value =>
                  updateStepParameter(selectedStep, 'gate', value)
                }
                minimumTrackTintColor={color}
                maximumTrackTintColor={HAOS_COLORS.mediumGray}
                thumbTintColor={color}
              />
              <Text style={styles.paramValue}>
                {Math.round(stepData[selectedStep].gate)}%
              </Text>
            </View>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>PROBABILITY</Text>
              <Slider
                style={styles.paramSlider}
                minimumValue={0}
                maximumValue={100}
                value={stepData[selectedStep].probability}
                onValueChange={value =>
                  updateStepParameter(selectedStep, 'probability', value)
                }
                minimumTrackTintColor={color}
                maximumTrackTintColor={HAOS_COLORS.mediumGray}
                thumbTintColor={color}
              />
              <Text style={styles.paramValue}>
                {Math.round(stepData[selectedStep].probability)}%
              </Text>
            </View>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>NOTE</Text>
              <Slider
                style={styles.paramSlider}
                minimumValue={36}
                maximumValue={84}
                step={1}
                value={stepData[selectedStep].note}
                onValueChange={value =>
                  updateStepParameter(selectedStep, 'note', value)
                }
                minimumTrackTintColor={color}
                maximumTrackTintColor={HAOS_COLORS.mediumGray}
                thumbTintColor={color}
              />
              <Text style={styles.paramValue}>
                {stepData[selectedStep].note}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
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
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editModeContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  editModeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  editModeButtonActive: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  editModeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
  },
  editModeTextActive: {
    color: '#0a0a0a',
  },
  grid: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  stepColumn: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  parameterBarContainer: {
    width: 40,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 4,
    overflow: 'hidden',
  },
  parameterBar: {
    width: '100%',
    borderRadius: 4,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    borderWidth: 2,
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  stepCurrent: {
    borderWidth: 3,
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#0a0a0a',
  },
  stepLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
  },
  globalControls: {
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
    width: 50,
    textAlign: 'right',
  },
  stepEditor: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
  },
  stepEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepEditorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  stepEditorContent: {
    gap: 12,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
    width: 100,
  },
  paramSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  paramValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
});

export default ML185Sequencer;
