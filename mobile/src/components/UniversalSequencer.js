/**
 * Universal Sequencer Component
 * 16-step pattern sequencer with custom note selection
 * Based on ARP 2600 Studio design, usable across all synths
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// MIDI notes for 2 octaves (C2-C4)
const NOTES = [
  { midi: 36, name: 'C2' }, { midi: 37, name: 'C#2' },
  { midi: 38, name: 'D2' }, { midi: 39, name: 'D#2' },
  { midi: 40, name: 'E2' }, { midi: 41, name: 'F2' },
  { midi: 42, name: 'F#2' }, { midi: 43, name: 'G2' },
  { midi: 44, name: 'G#2' }, { midi: 45, name: 'A2' },
  { midi: 46, name: 'A#2' }, { midi: 47, name: 'B2' },
  { midi: 48, name: 'C3' }, { midi: 49, name: 'C#3' },
  { midi: 50, name: 'D3' }, { midi: 51, name: 'D#3' },
  { midi: 52, name: 'E3' }, { midi: 53, name: 'F3' },
  { midi: 54, name: 'F#3' }, { midi: 55, name: 'G3' },
  { midi: 56, name: 'G#3' }, { midi: 57, name: 'A3' },
  { midi: 58, name: 'A#3' }, { midi: 59, name: 'B3' },
  { midi: 60, name: 'C4' },
];

const UniversalSequencer = ({
  isPlaying = false,
  bpm = 120,
  onPlayNote,
  onStop,
  color = '#00ff94',
  title = 'SEQUENCER',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pattern, setPattern] = useState(Array(16).fill(null));
  const [selectedStep, setSelectedStep] = useState(null);
  const [showNotePicker, setShowNotePicker] = useState(false);
  const stepAnimations = useRef(Array(16).fill(null).map(() => new Animated.Value(1))).current;
  const playheadAnim = useRef(new Animated.Value(0)).current;

  // Sequencer engine
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(0);
      return;
    }

    const stepDuration = (60 / bpm / 4) * 1000; // 16th notes in ms
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Play note if step is active
        if (pattern[nextStep] !== null && onPlayNote) {
          onPlayNote(pattern[nextStep]);
          
          // Haptic feedback on note trigger
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        // Animate current step
        Animated.sequence([
          Animated.timing(stepAnimations[nextStep], {
            toValue: 1.3,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(stepAnimations[nextStep], {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        
        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isPlaying, bpm, pattern]);

  // Playhead animation
  useEffect(() => {
    if (isPlaying) {
      Animated.timing(playheadAnim, {
        toValue: currentStep / 15,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, isPlaying]);

  const toggleStep = (stepIndex) => {
    if (pattern[stepIndex] === null) {
      // Step is empty, show note picker
      setSelectedStep(stepIndex);
      setShowNotePicker(true);
    } else {
      // Step has a note, remove it
      const newPattern = [...pattern];
      newPattern[stepIndex] = null;
      setPattern(newPattern);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const selectNote = (midiNote) => {
    if (selectedStep !== null) {
      const newPattern = [...pattern];
      newPattern[selectedStep] = midiNote;
      setPattern(newPattern);
      setShowNotePicker(false);
      setSelectedStep(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const clearPattern = () => {
    setPattern(Array(16).fill(null));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const randomizePattern = () => {
    const newPattern = Array(16).fill(null).map(() => {
      // 60% chance of a note
      if (Math.random() > 0.4) {
        // Random note from available notes
        return NOTES[Math.floor(Math.random() * NOTES.length)].midi;
      }
      return null;
    });
    setPattern(newPattern);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 255, 148, 0.1)', 'rgba(0, 255, 148, 0.02)']}
        style={styles.header}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.controls}>
          <TouchableOpacity onPress={clearPattern} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={randomizePattern} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>Random</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Sequencer Grid */}
      <View style={styles.grid}>
        {/* Playhead */}
        {isPlaying && (
          <Animated.View
            style={[
              styles.playhead,
              {
                transform: [{
                  translateX: playheadAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH - 48],
                  })
                }]
              }
            ]}
          />
        )}

        {/* Steps */}
        {pattern.map((note, index) => {
          const isActive = note !== null;
          const isCurrent = currentStep === index && isPlaying;
          const noteName = isActive ? NOTES.find(n => n.midi === note)?.name : '';
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => toggleStep(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.step,
                  isActive && { backgroundColor: color, ...styles.stepActive },
                  isCurrent && { ...styles.stepCurrent, borderColor: color },
                  {
                    transform: [{ scale: stepAnimations[index] }],
                  }
                ]}
              >
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
                {isActive && (
                  <Text style={styles.noteName}>{noteName}</Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Note Picker Modal */}
      <Modal
        visible={showNotePicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowNotePicker(false);
          setSelectedStep(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a']}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Select Note for Step {(selectedStep || 0) + 1}</Text>
            
            <ScrollView style={styles.noteList} showsVerticalScrollIndicator={false}>
              {NOTES.map((note) => (
                <TouchableOpacity
                  key={note.midi}
                  onPress={() => selectNote(note.midi)}
                  style={[styles.noteButton, { borderColor: color }]}
                >
                  <Text style={[styles.noteButtonText, { color }]}>{note.name}</Text>
                  <Text style={styles.midiNumber}>MIDI {note.midi}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                setShowNotePicker(false);
                setSelectedStep(null);
              }}
              style={[styles.closeButton, { backgroundColor: color }]}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
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
    color: '#00ff94',
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
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.4)',
  },
  controlButtonText: {
    color: '#00ff94',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    left: 24,
    bottom: 0,
    width: 2,
    backgroundColor: '#00ff94',
    opacity: 0.6,
    shadowColor: '#00ff94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  step: {
    width: (SCREEN_WIDTH - 64) / 4,
    height: 70,
    margin: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepActive: {
    borderWidth: 2,
    shadowColor: '#00ff94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  stepCurrent: {
    borderWidth: 3,
    shadowColor: '#00ff94',
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
  noteName: {
    fontSize: 16,
    color: '#0a0a0a',
    fontWeight: 'bold',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 148, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 20,
    textAlign: 'center',
  },
  noteList: {
    maxHeight: 400,
  },
  noteButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    borderWidth: 1,
  },
  noteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  midiNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  closeButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
});

export default UniversalSequencer;
