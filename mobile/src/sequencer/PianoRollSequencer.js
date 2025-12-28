/**
 * Piano Roll Sequencer
 * Visual note editor with grid for melodic patterns
 * Similar to DAW piano rolls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  cyan: '#00ffff',
  green: '#00ff94',
  blue: '#00D9FF',
  purple: '#9966ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

// MIDI notes for 2 octaves (C3-C5)
const NOTES = [
  { midi: 72, name: 'C5', black: false },
  { midi: 71, name: 'B4', black: false },
  { midi: 70, name: 'A#4', black: true },
  { midi: 69, name: 'A4', black: false },
  { midi: 68, name: 'G#4', black: true },
  { midi: 67, name: 'G4', black: false },
  { midi: 66, name: 'F#4', black: true },
  { midi: 65, name: 'F4', black: false },
  { midi: 64, name: 'E4', black: false },
  { midi: 63, name: 'D#4', black: true },
  { midi: 62, name: 'D4', black: false },
  { midi: 61, name: 'C#4', black: true },
  { midi: 60, name: 'C4', black: false },
  { midi: 59, name: 'B3', black: false },
  { midi: 58, name: 'A#3', black: true },
  { midi: 57, name: 'A3', black: false },
  { midi: 56, name: 'G#3', black: true },
  { midi: 55, name: 'G3', black: false },
  { midi: 54, name: 'F#3', black: true },
  { midi: 53, name: 'F3', black: false },
  { midi: 52, name: 'E3', black: false },
  { midi: 51, name: 'D#3', black: true },
  { midi: 50, name: 'D3', black: false },
  { midi: 49, name: 'C#3', black: true },
  { midi: 48, name: 'C3', black: false },
];

const PianoRollSequencer = ({
  onStepTrigger,
  isPlaying = false,
  bpm = 120,
  color = HAOS_COLORS.purple,
  title = 'PIANO ROLL',
  steps = 16,
}) => {
  // Grid: 2D array [note][step] = velocity or null
  const [grid, setGrid] = useState(
    NOTES.map(() => Array(steps).fill(null))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedTool, setSelectedTool] = useState('draw'); // 'draw', 'erase'

  const stepAnimations = useRef(
    Array(steps).fill(null).map(() => new Animated.Value(1))
  ).current;

  // Sequencer engine
  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }

    const stepDuration = (60 / bpm / 4) * 1000; // 16th notes in ms
    let stepIndex = 0;

    const timer = setInterval(() => {
      // Get all notes active on this step
      const activeNotes = grid
        .map((noteRow, noteIndex) => ({
          midi: NOTES[noteIndex].midi,
          velocity: noteRow[stepIndex],
        }))
        .filter(note => note.velocity !== null);

      // Trigger all active notes
      if (activeNotes.length > 0 && onStepTrigger) {
        activeNotes.forEach(note => {
          onStepTrigger({
            note: note.midi,
            velocity: note.velocity,
            duration: 0.25,
            stepIndex,
          });
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setCurrentStep(stepIndex);

      // Animate step
      Animated.sequence([
        Animated.timing(stepAnimations[stepIndex], {
          toValue: 1.2,
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
  }, [isPlaying, bpm, grid, steps]);

  const toggleCell = (noteIndex, stepIndex) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      if (selectedTool === 'draw') {
        newGrid[noteIndex][stepIndex] = newGrid[noteIndex][stepIndex] === null ? 0.8 : null;
      } else {
        newGrid[noteIndex][stepIndex] = null;
      }
      return newGrid;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearPattern = () => {
    setGrid(NOTES.map(() => Array(steps).fill(null)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const randomizePattern = () => {
    setGrid(
      NOTES.map(() =>
        Array(steps)
          .fill(null)
          .map(() => (Math.random() > 0.7 ? 0.5 + Math.random() * 0.5 : null))
      )
    );
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
        <View style={styles.controls}>
          <TouchableOpacity onPress={clearPattern} style={styles.controlButton}>
            <Text style={[styles.controlButtonText, { color }]}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={randomizePattern} style={styles.controlButton}>
            <Text style={[styles.controlButtonText, { color }]}>Random</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tool Selector */}
      <View style={styles.toolBar}>
        <TouchableOpacity
          style={[
            styles.toolButton,
            selectedTool === 'draw' && { ...styles.toolButtonActive, backgroundColor: color },
          ]}
          onPress={() => {
            setSelectedTool('draw');
            Haptics.selectionAsync();
          }}
        >
          <Text
            style={[
              styles.toolText,
              selectedTool === 'draw' && styles.toolTextActive,
            ]}
          >
            ✏️ DRAW
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toolButton,
            selectedTool === 'erase' && { ...styles.toolButtonActive, backgroundColor: color },
          ]}
          onPress={() => {
            setSelectedTool('erase');
            Haptics.selectionAsync();
          }}
        >
          <Text
            style={[
              styles.toolText,
              selectedTool === 'erase' && styles.toolTextActive,
            ]}
          >
            🗑️ ERASE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Piano Roll Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Note labels (piano keys) */}
          <View style={styles.noteLabels}>
            {NOTES.map((note, index) => (
              <View
                key={note.midi}
                style={[
                  styles.noteLabel,
                  note.black && styles.noteLabelBlack,
                  note.name.includes('C') && styles.noteLabelC,
                ]}
              >
                <Text
                  style={[
                    styles.noteLabelText,
                    note.black && styles.noteLabelTextBlack,
                  ]}
                >
                  {note.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid cells */}
          <ScrollView style={styles.gridScroll}>
            <View style={styles.grid}>
              {NOTES.map((note, noteIndex) => (
                <View key={note.midi} style={styles.noteRow}>
                  {Array(steps)
                    .fill(null)
                    .map((_, stepIndex) => {
                      const hasNote = grid[noteIndex][stepIndex] !== null;
                      const isCurrent = currentStep === stepIndex && isPlaying;
                      const velocity = grid[noteIndex][stepIndex] || 0;

                      return (
                        <TouchableOpacity
                          key={stepIndex}
                          onPress={() => toggleCell(noteIndex, stepIndex)}
                          activeOpacity={0.7}
                        >
                          <Animated.View
                            style={[
                              styles.cell,
                              note.black && styles.cellBlack,
                              stepIndex % 4 === 0 && styles.cellBeat,
                              hasNote && {
                                backgroundColor: color,
                                opacity: velocity,
                              },
                              isCurrent && { borderColor: color, borderWidth: 2 },
                              {
                                transform: [{ scale: stepAnimations[stepIndex] }],
                              },
                            ]}
                          />
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Step numbers */}
      <View style={styles.stepNumbers}>
        <View style={styles.noteLabels} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.stepNumberRow}>
            {Array(steps)
              .fill(null)
              .map((_, i) => (
                <Text key={i} style={styles.stepNumberText}>
                  {i + 1}
                </Text>
              ))}
          </View>
        </ScrollView>
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
    borderColor: 'rgba(153, 102, 255, 0.2)',
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
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(153, 102, 255, 0.4)',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toolBar: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  toolButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: HAOS_COLORS.purple,
  },
  toolText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
  },
  toolTextActive: {
    color: '#0a0a0a',
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  noteLabels: {
    width: 50,
  },
  noteLabel: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteLabelBlack: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  noteLabelC: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 255, 148, 0.3)',
  },
  noteLabelText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
  },
  noteLabelTextBlack: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'column',
  },
  noteRow: {
    flexDirection: 'row',
    height: 20,
  },
  cell: {
    width: 30,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellBlack: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cellBeat: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepNumbers: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  stepNumberRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  stepNumberText: {
    width: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

export default PianoRollSequencer;
