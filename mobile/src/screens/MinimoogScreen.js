/**
 * HAOS.fm Minimoog Synthesizer
 * Visual recreation of the legendary Minimoog Model D
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import minimoogBridge from '../synths/MinimoogBridge';
import nativeAudioContext from '../audio/NativeAudioContext';
import Knob from '../components/Knob';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  blue: '#0066FF',
  red: '#FF0033',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
  wood: '#8B4513',
};

// Musical keyboard notes (lower range for bass)
const NOTES = [
  { note: 'C1', freq: 32.70, label: 'C', black: false },
  { note: 'C#1', freq: 34.65, label: 'C#', black: true },
  { note: 'D1', freq: 36.71, label: 'D', black: false },
  { note: 'D#1', freq: 38.89, label: 'D#', black: true },
  { note: 'E1', freq: 41.20, label: 'E', black: false },
  { note: 'F1', freq: 43.65, label: 'F', black: false },
  { note: 'F#1', freq: 46.25, label: 'F#', black: true },
  { note: 'G1', freq: 49.00, label: 'G', black: false },
  { note: 'G#1', freq: 51.91, label: 'G#', black: true },
  { note: 'A1', freq: 55.00, label: 'A', black: false },
  { note: 'A#1', freq: 58.27, label: 'A#', black: true },
  { note: 'B1', freq: 61.74, label: 'B', black: false },
  { note: 'C2', freq: 65.41, label: 'C', black: false },
];

const MinimoogScreen = ({ navigation }) => {
  const [osc1Level, setOsc1Level] = useState(0.4);
  const [osc2Level, setOsc2Level] = useState(0.3);
  const [osc3Level, setOsc3Level] = useState(0.5);
  const [filterCutoff, setFilterCutoff] = useState(800);
  const [filterResonance, setFilterResonance] = useState(8);
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.5);
  const [activeNotes, setActiveNotes] = useState(new Set());

  useEffect(() => {
    initializeSynth();
    return () => {
      activeNotes.forEach(note => stopNote(note));
    };
  }, []);

  const initializeSynth = async () => {
    try {
      await minimoogBridge.init();
      console.log('✅ Minimoog initialized');
    } catch (error) {
      console.error('❌ Minimoog init failed:', error);
    }
  };

  const playNote = async (note, freq) => {
    await nativeAudioContext.resume();
    
    setActiveNotes(prev => new Set([...prev, note]));
    
    // Parameters already stored in bridge - just play
    minimoogBridge.playNote(note, { velocity: 1.0, duration: 3.0 });
    console.log(`🎹 Playing Minimoog: ${note} @ ${freq.toFixed(2)}Hz`);
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Parameter change handlers (update state + bridge)
  const handleOsc1LevelChange = (value) => {
    setOsc1Level(value);
    minimoogBridge.setOsc1Level(value);
  };

  const handleOsc2LevelChange = (value) => {
    setOsc2Level(value);
    minimoogBridge.setOsc2Level(value);
  };

  const handleOsc3LevelChange = (value) => {
    setOsc3Level(value);
    minimoogBridge.setOsc3Level(value);
  };

  const handleFilterCutoffChange = (value) => {
    const cutoff = value * 5000;
    setFilterCutoff(cutoff);
    minimoogBridge.setCutoff(cutoff);
  };

  const handleFilterResonanceChange = (value) => {
    const resonance = value * 20;
    setFilterResonance(resonance);
    minimoogBridge.setResonance(resonance);
  };

  const handleAttackChange = (value) => {
    const attack = value * 2; // 0-2 seconds
    setAttack(attack);
    minimoogBridge.setAttack(attack);
  };

  const handleDecayChange = (value) => {
    const decay = value * 2; // 0-2 seconds
    setDecay(decay);
    minimoogBridge.setDecay(decay);
  };

  const handleSustainChange = (value) => {
    setSustain(value);
    minimoogBridge.setSustain(value);
  };

  const handleReleaseChange = (value) => {
    const release = value * 5; // 0-5 seconds
    setRelease(release);
    minimoogBridge.setRelease(release);
  };

  const renderKey = (noteData, index) => {
    const isActive = activeNotes.has(noteData.note);
    
    if (noteData.black) {
      return (
        <TouchableOpacity
          key={noteData.note}
          style={[styles.blackKey, isActive && styles.blackKeyActive]}
          onPressIn={() => playNote(noteData.note, noteData.freq)}
          onPressOut={() => stopNote(noteData.note)}
        >
          <Text style={styles.blackKeyLabel}>{noteData.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={noteData.note}
        style={[styles.whiteKey, isActive && styles.whiteKeyActive]}
        onPressIn={() => playNote(noteData.note, noteData.freq)}
        onPressOut={() => stopNote(noteData.note)}
      >
        <Text style={styles.whiteKeyLabel}>{noteData.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[HAOS_COLORS.wood, HAOS_COLORS.metal, HAOS_COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MINIMOOG</Text>
          <Text style={styles.subtitle}>MODEL D</Text>
        </View>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HOUSE</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Oscillator Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌊 OSCILLATOR BANK</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={osc1Level}
                onValueChange={handleOsc1LevelChange}
                label="OSC 1"
                color={HAOS_COLORS.blue}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc1Level * 100).toFixed(0)}%</Text>
              <Text style={styles.oscLabel}>Sawtooth</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc2Level}
                onValueChange={handleOsc2LevelChange}
                label="OSC 2"
                color={HAOS_COLORS.blue}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc2Level * 100).toFixed(0)}%</Text>
              <Text style={styles.oscLabel}>Square -1oct</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc3Level}
                onValueChange={handleOsc3LevelChange}
                label="OSC 3"
                color={HAOS_COLORS.blue}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc3Level * 100).toFixed(0)}%</Text>
              <Text style={styles.oscLabel}>Triangle -2oct</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Triple oscillator fat sound: Saw + Square (-1 octave) + Sub bass (-2 octaves)
          </Text>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ MOOG FILTER</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={filterCutoff / 5000}
                onValueChange={handleFilterCutoffChange}
                label="CUTOFF"
                color={HAOS_COLORS.red}
                size={85}
              />
              <Text style={styles.knobValue}>{filterCutoff.toFixed(0)} Hz</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={filterResonance / 20}
                onValueChange={handleFilterResonanceChange}
                label="RESONANCE"
                color={HAOS_COLORS.red}
                size={85}
              />
              <Text style={styles.knobValue}>Q: {filterResonance.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Legendary 24dB/octave ladder filter with Moog character (Q=8)
          </Text>
        </View>

        {/* Envelope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 CONTOUR (ADSR)</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={attack / 2}
                onValueChange={handleAttackChange}
                label="ATTACK"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(attack * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={decay / 2}
                onValueChange={handleDecayChange}
                label="DECAY"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(decay * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={sustain}
                onValueChange={handleSustainChange}
                label="SUSTAIN"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(sustain * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={release / 5}
                onValueChange={handleReleaseChange}
                label="RELEASE"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(release * 1000).toFixed(0)}ms</Text>
            </View>
          </View>
        </View>

        {/* Keyboard */}
        <View style={styles.keyboardSection}>
          <Text style={styles.sectionTitle}>🎹 KEYBOARD</Text>
          <View style={styles.keyboard}>
            {NOTES.filter(n => !n.black).map((note, i) => renderKey(note, i))}
            <View style={styles.blackKeysContainer}>
              {NOTES.filter(n => n.black).map((note, i) => renderKey(note, i))}
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎛️ Fat analog bass • Iconic Moog ladder filter • Perfect for house & techno
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.blue,
  },
  backButton: {
    color: HAOS_COLORS.blue,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.blue,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    letterSpacing: 3,
    marginTop: 2,
  },
  badge: {
    backgroundColor: HAOS_COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.blue,
    marginBottom: 16,
    letterSpacing: 1,
  },
  sectionInfo: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    marginTop: 12,
    fontStyle: 'italic',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  knobContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  knobValue: {
    fontSize: 12,
    color: HAOS_COLORS.cyan,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  oscLabel: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    marginTop: 4,
  },
  keyboardSection: {
    padding: 20,
  },
  keyboard: {
    height: 120,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  whiteKey: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  whiteKeyActive: {
    backgroundColor: HAOS_COLORS.blue,
  },
  whiteKeyLabel: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  blackKeysContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: '6%',
  },
  blackKey: {
    width: 40,
    height: 70,
    backgroundColor: '#000',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    marginHorizontal: 20,
  },
  blackKeyActive: {
    backgroundColor: HAOS_COLORS.red,
  },
  blackKeyLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    textAlign: 'center',
  },
});

export default MinimoogScreen;
