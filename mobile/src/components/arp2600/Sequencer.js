/**
 * 16-Step Sequencer for ARP 2600
 * 3 lanes: Pitch, Gate, Modulation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import InteractiveSlider from './InteractiveSlider';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
  active: '#00ff94',
  gate: '#FFD700',
  mod: '#A855F7',
  background: '#1a1a1a',
  panel: '#2a2a2a',
  text: '#FFFFFF',
  textMuted: '#808080',
};

const STEP_WIDTH = (width - 48) / 8; // 8 steps visible at once

// Note names for pitch lane
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const Sequencer = ({ onStepChange, onPlayNote }) => {
  const [tempo, setTempo] = useState(120); // BPM
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      pitch: 60, // MIDI note (C4)
      gate: true,
      modulation: 0.5,
    }))
  );
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      // Fixed timing: 16th notes = quarter note / 4
      // Quarter note duration = 60000ms / tempo
      const stepDuration = (60000 / tempo) / 4; // 16th notes in milliseconds
      
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % 16;
          
          // Trigger note if gate is on
          const step = steps[nextStep];
          if (step.gate && onPlayNote) {
            onPlayNote(step.pitch, step.modulation);
          }
          
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return nextStep;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, tempo, steps]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const resetSequencer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
    
    if (onStepChange) {
      onStepChange(newSteps);
    }
  };

  const toggleGate = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateStep(index, 'gate', !steps[index].gate);
  };

  const midiToNoteName = (midi) => {
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTES[midi % 12];
    return `${note}${octave}`;
  };

  const renderStep = (index) => {
    const step = steps[index];
    const isActive = currentStep === index && isPlaying;
    
    return (
      <View
        key={index}
        style={[
          styles.stepContainer,
          { width: STEP_WIDTH },
          isActive && styles.stepActive,
        ]}
      >
        {/* Step Number */}
        <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
          {index + 1}
        </Text>
        
        {/* Pitch Knob */}
        <TouchableOpacity
          style={[styles.pitchKnob, { borderColor: isActive ? '#00ff94' : '#FF6B35' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Cycle through octaves (C2 to C6)
            const newPitch = ((step.pitch + 12) % 60) + 24;
            updateStep(index, 'pitch', newPitch);
          }}
        >
          <Text style={styles.pitchText}>{midiToNoteName(step.pitch)}</Text>
        </TouchableOpacity>
        
        {/* Gate Toggle */}
        <TouchableOpacity
          style={[
            styles.gateButton,
            step.gate && { backgroundColor: '#FFD700' },
          ]}
          onPress={() => toggleGate(index)}
        >
          <Text style={styles.gateText}>{step.gate ? '●' : '○'}</Text>
        </TouchableOpacity>
        
        {/* Modulation Bar */}
        <View style={styles.modBar}>
          <View
            style={[
              styles.modFill,
              {
                height: `${step.modulation * 100}%`,
                backgroundColor: '#A855F7',
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={togglePlay}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetSequencer}>
            <Text style={styles.resetButtonText}>⏹</Text>
          </TouchableOpacity>
          
          <Text style={styles.stepIndicator}>
            Step: {currentStep + 1}/16
          </Text>
        </View>
        
        <View style={styles.tempoContainer}>
          <Text style={styles.tempoLabel}>TEMPO</Text>
          <Text style={styles.tempoValue}>{tempo} BPM</Text>
        </View>
      </View>

      {/* Tempo Slider */}
      <View style={styles.tempoSlider}>
        <InteractiveSlider
          value={tempo}
          onChange={(val) => setTempo(Math.round(val))}
          min={40}
          max={240}
          label="BPM"
          unit=""
          color={'#FF6B35'}
          formatValue={(val) => `${Math.round(val)} BPM`}
        />
      </View>

      {/* Steps Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stepsScroll}
        contentContainerStyle={styles.stepsContent}
      >
        {steps.map((_, index) => renderStep(index))}
      </ScrollView>

      {/* Lane Labels */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
          <Text style={styles.legendText}>Pitch (tap to cycle octave)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
          <Text style={styles.legendText}>Gate (tap to toggle on/off)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
          <Text style={styles.legendText}>Modulation Amount (0-100%)</Text>
        </View>
      </View>

      {/* Pattern Presets */}
      <View style={styles.presets}>
        <Text style={styles.presetsTitle}>QUICK PATTERNS</Text>
        <View style={styles.presetButtons}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Arpeggio pattern
              const arpSteps = steps.map((s, i) => ({
                pitch: 60 + (i % 4) * 3,
                gate: true,
                modulation: 0.5,
              }));
              setSteps(arpSteps);
            }}
          >
            <Text style={styles.presetButtonText}>Arpeggio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Bass pattern
              const bassSteps = steps.map((s, i) => ({
                pitch: i % 4 === 0 ? 48 : 48,
                gate: i % 4 === 0 || i % 4 === 2,
                modulation: i % 4 === 0 ? 0.8 : 0.3,
              }));
              setSteps(bassSteps);
            }}
          >
            <Text style={styles.presetButtonText}>Bass</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Random pattern
              const randomSteps = steps.map(() => ({
                pitch: Math.floor(Math.random() * 24) + 48,
                gate: Math.random() > 0.3,
                modulation: Math.random(),
              }));
              setSteps(randomSteps);
            }}
          >
            <Text style={styles.presetButtonText}>Random</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Clear pattern
              const clearSteps = steps.map(() => ({
                pitch: 60,
                gate: false,
                modulation: 0.5,
              }));
              setSteps(clearSteps);
            }}
          >
            <Text style={styles.presetButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#00ff94',
  },
  playButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Menlo',
  },
  tempoContainer: {
    alignItems: 'flex-end',
  },
  tempoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  tempoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Menlo',
  },
  tempoSlider: {
    marginBottom: 24,
  },
  stepsScroll: {
    marginBottom: 24,
  },
  stepsContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  stepContainer: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepActive: {
    borderColor: '#00ff94',
    backgroundColor: '#00ff94' + '20',
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  stepNumberActive: {
    color: '#00ff94',
  },
  pitchKnob: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
  },
  pitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  gateText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modBar: {
    width: 24,
    height: 60,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  modFill: {
    width: '100%',
    borderRadius: 12,
  },
  legend: {
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  presets: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Sequencer;
