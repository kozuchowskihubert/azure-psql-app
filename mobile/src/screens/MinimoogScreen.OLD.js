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
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import minimoogBridge from '../synths/MinimoogBridge';
import webAudioBridge from '../services/WebAudioBridge';
import Oscilloscope from '../components/Oscilloscope';
import UniversalSequencer from '../components/UniversalSequencer';
import EuclideanSequencer from '../sequencer/EuclideanSequencer';

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
  const [waveformData, setWaveformData] = useState([]);
  
  // Sequencer state
  const [sequencerPlaying, setSequencerPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Filter ladder animation (4 poles)
  const filterPoleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Generate waveform data from 3 oscillators
  const updateWaveform = () => {
    const points = 100;
    const data = Array.from({ length: points }, (_, i) => {
      const phase = i / points;
      // OSC1: Sawtooth
      const osc1 = (2 * phase - 1) * osc1Level;
      // OSC2: Triangle
      const osc2 = (Math.abs((phase * 4) % 2 - 1) * 2 - 1) * osc2Level;
      // OSC3: Square
      const osc3 = (Math.sin(phase * Math.PI * 8) > 0 ? 1 : -1) * osc3Level;
      return osc1 + osc2 + osc3;
    });
    setWaveformData(data);
  };
  
  // Animate filter ladder based on cutoff
  useEffect(() => {
    const cutoffRatio = filterCutoff / 5000;
    filterPoleAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: cutoffRatio * (4 - index) / 4,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [filterCutoff]);

  useEffect(() => {
    initializeSynth();
    return () => {
      activeNotes.forEach(note => stopNote(note));
    };
  }, []);
  
  // Update waveform when oscillator levels change
  useEffect(() => {
    updateWaveform();
  }, [osc1Level, osc2Level, osc3Level]);

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
  
  // Sequencer note playback handler
  const handleSequencerNote = (midiNote) => {
    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const noteName = `MIDI${midiNote}`;
    
    // Play the note through minimoog
    minimoogBridge.playNote(midiNote, { velocity: 0.8, duration: 0.25 });
    console.log(`🎹 Sequencer → Minimoog: ${noteName} (${frequency.toFixed(2)}Hz)`);
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
      {/* Hidden WebView for audio-engine.html */}
      <WebView
        ref={(ref) => {
          if (ref && !webAudioBridge.isReady) {
            webAudioBridge.setWebViewRef(ref);
          }
        }}
        source={require('../../assets/audio-engine.html')}
        style={{ width: 1, height: 1, opacity: 0, position: 'absolute', top: -1000, left: -1000, pointerEvents: 'none' }}
        onMessage={(event) => webAudioBridge.onMessage(event)}
        onLoad={() => webAudioBridge.initAudio()}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />

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
                min={0}
                max={1}
                step={0.01}
                unit="%"
                onChange={(val) => {
                  setOsc1Level(val);
                  minimoogBridge.setOsc1Level(val);
                }}
                label="OSC 1"
                color={HAOS_COLORS.blue}
                size={KNOB_SIZE}
              />
              <Text style={styles.oscLabel}>Sawtooth</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc2Level}
                min={0}
                max={1}
                step={0.01}
                unit="%"
                onChange={(val) => {
                  setOsc2Level(val);
                  minimoogBridge.setOsc2Level(val);
                }}
                label="OSC 2"
                color={HAOS_COLORS.blue}
                size={KNOB_SIZE}
              />
              <Text style={styles.oscLabel}>Square -1oct</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={osc3Level}
                min={0}
                max={1}
                step={0.01}
                unit="%"
                onChange={(val) => {
                  setOsc3Level(val);
                  minimoogBridge.setOsc3Level(val);
                }}
                label="OSC 3"
                color={HAOS_COLORS.blue}
                size={KNOB_SIZE}
              />
              <Text style={styles.oscLabel}>Triangle -2oct</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Triple oscillator fat sound: Saw + Square (-1 octave) + Sub bass (-2 octaves)
          </Text>
          
          {/* Oscilloscope Waveform Display */}
          <View style={styles.oscilloscopeContainer}>
            <Text style={styles.oscilloscopeLabel}>WAVEFORM OUTPUT</Text>
            <Oscilloscope
              waveformData={waveformData}
              width={width - 80}
              height={100}
              color={HAOS_COLORS.blue}
              backgroundColor="rgba(0,0,0,0.7)"
              lineWidth={2}
              showGrid={true}
            />
          </View>
          
          {/* Oscillator Mix Meters */}
          <View style={styles.oscMixContainer}>
            <Text style={styles.oscMixLabel}>OSCILLATOR MIX</Text>
            <View style={styles.mixMeters}>
              {[
                { label: 'OSC 1', level: osc1Level, color: HAOS_COLORS.blue },
                { label: 'OSC 2', level: osc2Level, color: HAOS_COLORS.cyan },
                { label: 'OSC 3', level: osc3Level, color: HAOS_COLORS.green },
              ].map((osc, i) => (
                <View key={i} style={styles.meterColumn}>
                  <Text style={styles.meterLabel}>{osc.label}</Text>
                  <View style={styles.meterBar}>
                    <View
                      style={[
                        styles.meterLevel,
                        {
                          height: `${osc.level * 100}%`,
                          backgroundColor: osc.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.meterValue}>{(osc.level * 100).toFixed(0)}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ MOOG FILTER</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={filterCutoff}
                min={20}
                max={5000}
                step={10}
                unit=" Hz"
                onChange={(val) => {
                  setFilterCutoff(val);
                  minimoogBridge.setFilterCutoff(val);
                }}
                label="CUTOFF"
                color={HAOS_COLORS.red}
                size={85}
              />
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={filterResonance}
                min={0}
                max={20}
                step={0.1}
                unit=""
                onChange={(val) => {
                  setFilterResonance(val);
                  minimoogBridge.setFilterResonance(val);
                }}
                label="RESONANCE"
                color={HAOS_COLORS.red}
                size={85}
              />
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Legendary 24dB/octave ladder filter with Moog character (Q=8)
          </Text>
          
          {/* Filter Ladder Visualization */}
          <View style={styles.filterLadderContainer}>
            <Text style={styles.filterLadderLabel}>4-POLE LADDER FILTER</Text>
            <View style={styles.filterLadder}>
              {filterPoleAnims.map((anim, index) => (
                <View key={index} style={styles.filterPole}>
                  <Text style={styles.poleLabel}>POLE {index + 1}</Text>
                  <Animated.View
                    style={[
                      styles.poleLevel,
                      {
                        backgroundColor: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255,0,51,0.2)', HAOS_COLORS.red],
                        }),
                        opacity: anim,
                      },
                    ]}
                  />
                  <Text style={styles.poleDb}>-6dB</Text>
                </View>
              ))}
            </View>
            <Text style={styles.filterLadderValue}>
              Cutoff: {filterCutoff.toFixed(0)} Hz | -24dB/oct slope
            </Text>
          </View>
        </View>

        {/* Envelope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 CONTOUR (ADSR)</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={attack}
                min={0.001}
                max={2}
                step={0.001}
                unit=" s"
                onChange={(val) => {
                  setAttack(val);
                  minimoogBridge.setAttack(val);
                }}
                label="ATTACK"
                color={HAOS_COLORS.cyan}
                size={60}
              />
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={decay}
                min={0.001}
                max={2}
                step={0.001}
                unit=" s"
                onChange={(val) => {
                  setDecay(val);
                  minimoogBridge.setDecay(val);
                }}
                label="DECAY"
                color={HAOS_COLORS.cyan}
                size={60}
              />
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={sustain}
                min={0}
                max={1}
                step={0.01}
                unit="%"
                onChange={(val) => {
                  setSustain(val);
                  minimoogBridge.setSustain(val);
                }}
                label="SUSTAIN"
                color={HAOS_COLORS.cyan}
                size={60}
              />
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={release}
                min={0.001}
                max={5}
                step={0.001}
                unit=" s"
                onChange={(val) => {
                  setRelease(val);
                  minimoogBridge.setRelease(val);
                }}
                label="RELEASE"
                color={HAOS_COLORS.cyan}
                size={60}
              />
            </View>
          </View>
        </View>

        {/* Euclidean Rhythm Sequencer */}
        <EuclideanSequencer
          isPlaying={sequencerPlaying}
          bpm={bpm}
          onStepTrigger={(data) => {
            minimoogBridge.playNote(data.note, data.velocity, data.duration);
          }}
          color={HAOS_COLORS.green}
          title="EUCLIDEAN RHYTHM SEQUENCER"
        />
        
        {/* Sequencer Controls */}
        <View style={styles.section}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={() => setSequencerPlaying(!sequencerPlaying)}
              style={[styles.transportButton, sequencerPlaying && styles.transportButtonActive]}
            >
              <Text style={styles.transportButtonText}>
                {sequencerPlaying ? '⏸ STOP' : '▶ PLAY'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bpmControl}>
              <Text style={styles.label}>BPM: {bpm}</Text>
              <View style={styles.bpmButtons}>
                <TouchableOpacity onPress={() => setBpm(Math.max(60, bpm - 5))} style={styles.bpmButton}>
                  <Text style={styles.bpmButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBpm(Math.min(200, bpm + 5))} style={styles.bpmButton}>
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
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
    paddingTop: 50,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: HAOS_COLORS.blue,
    letterSpacing: 2,
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
  oscilloscopeContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,102,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.3)',
  },
  oscilloscopeLabel: {
    fontSize: 12,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  oscMixContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,102,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.3)',
  },
  oscMixLabel: {
    fontSize: 12,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  mixMeters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  meterColumn: {
    alignItems: 'center',
    flex: 1,
  },
  meterLabel: {
    fontSize: 11,
    color: HAOS_COLORS.silver,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  meterBar: {
    width: 50,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  meterLevel: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  meterValue: {
    fontSize: 12,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  filterLadderContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,0,51,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,0,51,0.3)',
  },
  filterLadderLabel: {
    fontSize: 12,
    color: HAOS_COLORS.red,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  filterLadder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  filterPole: {
    alignItems: 'center',
    flex: 1,
  },
  poleLabel: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  poleLevel: {
    width: 60,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,0,51,0.5)',
    shadowColor: HAOS_COLORS.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  poleDb: {
    fontSize: 10,
    color: HAOS_COLORS.red,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  filterLadderValue: {
    fontSize: 12,
    color: HAOS_COLORS.red,
    fontWeight: 'bold',
    marginTop: 15,
    fontFamily: 'monospace',
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
  transportButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    marginRight: 12,
  },
  transportButtonActive: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  transportButtonText: {
    color: HAOS_COLORS.cyan,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpmControl: {
    alignItems: 'center',
  },
  label: {
    color: HAOS_COLORS.silver,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bpmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    color: HAOS_COLORS.cyan,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MinimoogScreen;
