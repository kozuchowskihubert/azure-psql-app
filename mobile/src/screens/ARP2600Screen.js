/**
 * HAOS.fm ARP 2600 Synthesizer
 * Visual recreation of the legendary ARP 2600 modular synth
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
import arp2600Bridge from '../synths/ARP2600Bridge';
import nativeAudioContext from '../audio/NativeAudioContext';
import Knob from '../components/Knob';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  orange: '#FF6B35',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
};

// Musical keyboard notes
const NOTES = [
  { note: 'C3', freq: 130.81, label: 'C', black: false },
  { note: 'C#3', freq: 138.59, label: 'C#', black: true },
  { note: 'D3', freq: 146.83, label: 'D', black: false },
  { note: 'D#3', freq: 155.56, label: 'D#', black: true },
  { note: 'E3', freq: 164.81, label: 'E', black: false },
  { note: 'F3', freq: 174.61, label: 'F', black: false },
  { note: 'F#3', freq: 185.00, label: 'F#', black: true },
  { note: 'G3', freq: 196.00, label: 'G', black: false },
  { note: 'G#3', freq: 207.65, label: 'G#', black: true },
  { note: 'A3', freq: 220.00, label: 'A', black: false },
  { note: 'A#3', freq: 233.08, label: 'A#', black: true },
  { note: 'B3', freq: 246.94, label: 'B', black: false },
  { note: 'C4', freq: 261.63, label: 'C', black: false },
];

const ARP2600Screen = ({ navigation }) => {
  const [osc1Level, setOsc1Level] = useState(0.5);
  const [osc2Level, setOsc2Level] = useState(0.5);
  const [osc2Detune, setOsc2Detune] = useState(0.005);
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [filterResonance, setFilterResonance] = useState(18);
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);
  const [activeNotes, setActiveNotes] = useState(new Set());

  useEffect(() => {
    initializeSynth();
    return () => {
      // Stop all notes on unmount
      activeNotes.forEach(note => stopNote(note));
    };
  }, []);

  const initializeSynth = async () => {
    try {
      await arp2600Bridge.init();
      console.log('✅ ARP 2600 initialized');
    } catch (error) {
      console.error('❌ ARP 2600 init failed:', error);
    }
  };

  const playNote = async (note, freq) => {
    await nativeAudioContext.resume();
    
    setActiveNotes(prev => new Set([...prev, note]));
    
    // Parameters are already stored in bridge, just play the note
    arp2600Bridge.playNote(note, 1.0, 2.0);
    console.log(`🎹 Playing ARP 2600: ${note} @ ${freq.toFixed(2)}Hz`);
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Knob change handlers - update both state and bridge
  const handleOsc1LevelChange = (value) => {
    setOsc1Level(value);
    arp2600Bridge.setOsc1Level(value);
  };

  const handleOsc2LevelChange = (value) => {
    setOsc2Level(value);
    arp2600Bridge.setOsc2Level(value);
  };

  const handleDetuneChange = (value) => {
    const detuneValue = value / 200; // Knob 0-1, detune 0-0.005
    setOsc2Detune(detuneValue);
    arp2600Bridge.setDetune(detuneValue);
  };

  const handleFilterCutoffChange = (value) => {
    const cutoff = value * 10000; // Knob 0-1, cutoff 0-10000 Hz
    setFilterCutoff(cutoff);
    arp2600Bridge.setFilterCutoff(cutoff);
  };

  const handleFilterResonanceChange = (value) => {
    const resonance = value * 30; // Knob 0-1, Q 0-30
    setFilterResonance(resonance);
    arp2600Bridge.setFilterResonance(resonance);
  };

  const handleAttackChange = (value) => {
    const attackTime = value * 2; // Knob 0-1, time 0-2s
    setAttack(attackTime);
    arp2600Bridge.setAttack(attackTime);
  };

  const handleDecayChange = (value) => {
    const decayTime = value * 2; // Knob 0-1, time 0-2s
    setDecay(decayTime);
    arp2600Bridge.setDecay(decayTime);
  };

  const handleSustainChange = (value) => {
    setSustain(value);
    arp2600Bridge.setSustain(value);
  };

  const handleReleaseChange = (value) => {
    const releaseTime = value * 5; // Knob 0-1, time 0-5s
    setRelease(releaseTime);
    arp2600Bridge.setRelease(releaseTime);
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
        colors={[HAOS_COLORS.dark, HAOS_COLORS.metal, HAOS_COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ARP 2600</Text>
          <Text style={styles.subtitle}>MODULAR SYNTHESIZER</Text>
        </View>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TECHNO</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.content}>
        {/* Oscillator Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌊 OSCILLATORS</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={osc1Level}
                onValueChange={handleOsc1LevelChange}
                label="OSC 1"
                color={HAOS_COLORS.orange}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc1Level * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc2Level}
                onValueChange={handleOsc2LevelChange}
                label="OSC 2"
                color={HAOS_COLORS.orange}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc2Level * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc2Detune * 200}
                onValueChange={handleDetuneChange}
                label="DETUNE"
                color={HAOS_COLORS.cyan}
                size={70}
              />
              <Text style={styles.knobValue}>{(osc2Detune * 100).toFixed(1)}%</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Dual oscillator: Sawtooth + Square wave with detune
          </Text>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ FILTER</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={filterCutoff / 10000}
                onValueChange={handleFilterCutoffChange}
                label="CUTOFF"
                color={HAOS_COLORS.green}
                size={80}
              />
              <Text style={styles.knobValue}>{filterCutoff.toFixed(0)} Hz</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={filterResonance / 30}
                onValueChange={handleFilterResonanceChange}
                label="RESONANCE"
                color={HAOS_COLORS.green}
                size={80}
              />
              <Text style={styles.knobValue}>Q: {filterResonance.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Ultra-resonant lowpass filter (Q=18 for screaming leads)
          </Text>
        </View>

        {/* Envelope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 ENVELOPE</Text>
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
            🎸 Classic modular synth • Aggressive resonant filter • Perfect for techno leads
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
    borderBottomColor: HAOS_COLORS.orange,
  },
  backButton: {
    color: HAOS_COLORS.orange,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    letterSpacing: 2,
    marginTop: 2,
  },
  badge: {
    backgroundColor: HAOS_COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
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
    color: HAOS_COLORS.orange,
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
    backgroundColor: HAOS_COLORS.orange,
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
    backgroundColor: HAOS_COLORS.cyan,
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

export default ARP2600Screen;
