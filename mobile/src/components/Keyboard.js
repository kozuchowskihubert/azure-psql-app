/**
 * Touch-Optimized Keyboard Component
 * Piano keys with multi-touch support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Keyboard = ({ onNotePress, onNoteRelease, octave = 4 }) => {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const notes = [
    { note: 'C', freq: 261.63, black: false },
    { note: 'C#', freq: 277.18, black: true },
    { note: 'D', freq: 293.66, black: false },
    { note: 'D#', freq: 311.13, black: true },
    { note: 'E', freq: 329.63, black: false },
    { note: 'F', freq: 349.23, black: false },
    { note: 'F#', freq: 369.99, black: true },
    { note: 'G', freq: 392.00, black: false },
    { note: 'G#', freq: 415.30, black: true },
    { note: 'A', freq: 440.00, black: false },
    { note: 'A#', freq: 466.16, black: true },
    { note: 'B', freq: 493.88, black: false },
  ];

  const handlePressIn = (note, freq) => {
    const adjustedFreq = freq * Math.pow(2, octave - 4);
    setPressedKeys(prev => new Set(prev).add(note));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (onNotePress) {
      onNotePress(adjustedFreq, note);
    }
  };

  const handlePressOut = (note) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    
    if (onNoteRelease) {
      onNoteRelease(note);
    }
  };

  const whiteKeys = notes.filter(n => !n.black);
  const blackKeys = notes.filter(n => n.black);
  const keyWidth = (SCREEN_WIDTH - 48) / whiteKeys.length;

  return (
    <View style={styles.container}>
      <View style={styles.keyboard}>
        {/* White keys */}
        <View style={styles.whiteKeysRow}>
          {whiteKeys.map((note, index) => (
            <TouchableOpacity
              key={note.note}
              style={[
                styles.whiteKey,
                { width: keyWidth },
                pressedKeys.has(note.note) && styles.keyPressed,
              ]}
              onPressIn={() => handlePressIn(note.note, note.freq)}
              onPressOut={() => handlePressOut(note.note)}
              activeOpacity={0.8}
            >
              <Text style={styles.whiteKeyLabel}>{note.note}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Black keys */}
        <View style={styles.blackKeysRow}>
          {blackKeys.map((note) => {
            // Calculate position for black key
            const whiteKeyIndex = notes.findIndex(n => n.note === note.note);
            const leftOffset = (whiteKeyIndex - 0.3) * keyWidth;

            return (
              <TouchableOpacity
                key={note.note}
                style={[
                  styles.blackKey,
                  { left: leftOffset, width: keyWidth * 0.6 },
                  pressedKeys.has(note.note) && styles.blackKeyPressed,
                ]}
                onPressIn={() => handlePressIn(note.note, note.freq)}
                onPressOut={() => handlePressOut(note.note)}
                activeOpacity={0.8}
              >
                <Text style={styles.blackKeyLabel}>{note.note}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Octave selector */}
      <View style={styles.octaveSelector}>
        <Text style={styles.octaveLabel}>Octave: {octave}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  keyboard: {
    height: 150,
    position: 'relative',
  },
  whiteKeysRow: {
    flexDirection: 'row',
    height: '100%',
    gap: 2,
  },
  whiteKey: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  whiteKeyLabel: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  keyPressed: {
    backgroundColor: '#00ff94',
  },
  blackKeysRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  blackKey: {
    position: 'absolute',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    zIndex: 10,
  },
  blackKeyLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  blackKeyPressed: {
    backgroundColor: '#00aa6a',
  },
  octaveSelector: {
    marginTop: 12,
    alignItems: 'center',
  },
  octaveLabel: {
    color: '#999',
    fontSize: 14,
  },
});

export default Keyboard;
