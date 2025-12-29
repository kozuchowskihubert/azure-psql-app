/**
 * HAOS.fm Juno-106 Synthesizer
 * Visual recreation of the legendary Roland Juno-106
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
import juno106Bridge from '../synths/Juno106Bridge';
import webAudioBridge from '../services/WebAudioBridge';
import Oscilloscope from '../components/Oscilloscope';
import UniversalSequencer from '../components/UniversalSequencer';
import PianoRollSequencer from '../sequencer/PianoRollSequencer';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  purple: '#9D4EDD',
  pink: '#FF006E',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
};

// Musical keyboard notes
const NOTES = [
  { note: 'C2', freq: 65.41, label: 'C', black: false },
  { note: 'C#2', freq: 69.30, label: 'C#', black: true },
  { note: 'D2', freq: 73.42, label: 'D', black: false },
  { note: 'D#2', freq: 77.78, label: 'D#', black: true },
  { note: 'E2', freq: 82.41, label: 'E', black: false },
  { note: 'F2', freq: 87.31, label: 'F', black: false },
  { note: 'F#2', freq: 92.50, label: 'F#', black: true },
  { note: 'G2', freq: 98.00, label: 'G', black: false },
  { note: 'G#2', freq: 103.83, label: 'G#', black: true },
  { note: 'A2', freq: 110.00, label: 'A', black: false },
  { note: 'A#2', freq: 116.54, label: 'A#', black: true },
  { note: 'B2', freq: 123.47, label: 'B', black: false },
  { note: 'C3', freq: 130.81, label: 'C', black: false },
];

const Juno106Screen = ({ navigation }) => {
  const [filterCutoff, setFilterCutoff] = useState(1200);
  const [filterResonance, setFilterResonance] = useState(2);
  const [chorusDepth, setChorusDepth] = useState(0.005);
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.8);
  const [release, setRelease] = useState(0.4);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [waveformData, setWaveformData] = useState([]);
  
  // Sequencer state
  const [sequencerPlaying, setSequencerPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Animation for chorus effect
  const chorusAnim = useRef(new Animated.Value(0)).current;
  
  // Generate waveform data with chorus effect
  const updateWaveform = () => {
    const points = 100;
    const data = Array.from({ length: points }, (_, i) => {
      // Sawtooth wave with chorus modulation
      const phase = i / points;
      const sawWave = 2 * phase - 1;
      const chorusMod = Math.sin(phase * Math.PI * 6) * chorusDepth * 100;
      return sawWave + chorusMod;
    });
    setWaveformData(data);
  };
  
  // Chorus animation loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(chorusAnim, {
          toValue: 1,
          duration: 2000 / (chorusDepth * 1000 + 1),
          useNativeDriver: true,
        }),
        Animated.timing(chorusAnim, {
          toValue: 0,
          duration: 2000 / (chorusDepth * 1000 + 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [chorusDepth]);

  useEffect(() => {
    initializeSynth();
    return () => {
      activeNotes.forEach(note => stopNote(note));
    };
  }, []);
  
  // Update waveform when parameters change
  useEffect(() => {
    updateWaveform();
  }, [filterCutoff, chorusDepth]);

  const initializeSynth = async () => {
    try {
      await juno106Bridge.init();
      console.log('✅ Juno-106 initialized');
    } catch (error) {
      console.error('❌ Juno-106 init failed:', error);
    }
  };

  const playNote = async (note, freq) => {
    await nativeAudioContext.resume();
    
    setActiveNotes(prev => new Set([...prev, note]));
    
    // Parameters are already stored in bridge, just play the note
    juno106Bridge.playNote(note, 1.0, 2.0);
    console.log(`🎹 Playing Juno-106: ${note} @ ${freq.toFixed(2)}Hz`);
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Sequencer note handler
  const handleSequencerNote = (midiNote) => {
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    juno106Bridge.playNote(midiNote, 1.0, 0.25);
    console.log(`🎵 Juno-106 Sequencer: MIDI ${midiNote} @ ${frequency.toFixed(2)}Hz`);
  };

  // Knob change handlers - update both state and bridge
  const handleChorusDepthChange = (value) => {
    const depth = value / 200; // Knob 0-1, chorus 0-0.005
    setChorusDepth(depth);
    juno106Bridge.setChorusDepth(depth);
  };

  const handleFilterCutoffChange = (value) => {
    const cutoff = value * 5000; // Knob 0-1, cutoff 0-5000 Hz
    setFilterCutoff(cutoff);
    juno106Bridge.setCutoff(cutoff);
  };

  const handleFilterResonanceChange = (value) => {
    const resonance = value * 10; // Knob 0-1, Q 0-10
    setFilterResonance(resonance);
    juno106Bridge.setResonance(resonance);
  };

  const handleAttackChange = (value) => {
    const attackTime = value * 2; // Knob 0-1, time 0-2s
    setAttack(attackTime);
    juno106Bridge.setAttack(attackTime);
  };

  const handleDecayChange = (value) => {
    const decayTime = value * 2; // Knob 0-1, time 0-2s
    setDecay(decayTime);
    juno106Bridge.setDecay(decayTime);
  };

  const handleSustainChange = (value) => {
    setSustain(value);
    juno106Bridge.setSustain(value);
  };

  const handleReleaseChange = (value) => {
    const releaseTime = value * 5; // Knob 0-1, time 0-5s
    setRelease(releaseTime);
    juno106Bridge.setRelease(releaseTime);
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
      {/* Hidden WebView for audio-engine.html - DISABLED FOR LAYOUT FIX
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
      */}

      {/* Header */}
      <LinearGradient
        colors={[HAOS_COLORS.dark, HAOS_COLORS.metal, HAOS_COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>JUNO-106</Text>
          <Text style={styles.subtitle}>POLYPHONIC SYNTHESIZER</Text>
        </View>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HIP-HOP</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Chorus Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌀 CHORUS</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={chorusDepth * 200}
                onChange={handleChorusDepthChange}
                label="DEPTH"
                color={HAOS_COLORS.purple}
                size={KNOB_SIZE}
              />
              <Text style={styles.knobValue}>{(chorusDepth * 1000).toFixed(1)}¢</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Triple oscillator chorus (3 detuned sawtooths) for warm, thick sound
          </Text>
          
          {/* Oscilloscope Waveform Display */}
          <View style={styles.oscilloscopeContainer}>
            <Text style={styles.oscilloscopeLabel}>WAVEFORM</Text>
            <Oscilloscope
              waveformData={waveformData}
              width={width - 80}
              height={100}
              color={HAOS_COLORS.purple}
              backgroundColor="rgba(0,0,0,0.7)"
              lineWidth={2}
              showGrid={true}
            />
          </View>
          
          {/* Chorus Depth Visualizer */}
          <View style={styles.chorusViz}>
            <Text style={styles.chorusVizLabel}>CHORUS DEPTH</Text>
            <View style={styles.chorusWaves}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.chorusWave,
                    {
                      opacity: chorusAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: i === 1 ? [1, 0.5, 1] : [0.4, 0.8, 0.4],
                      }),
                      transform: [{
                        translateX: chorusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10 * i, 10 * i],
                        }),
                      }],
                    },
                  ]}
                >
                  <View style={[styles.chorusCircle, { backgroundColor: HAOS_COLORS.purple }]} />
                </Animated.View>
              ))}
            </View>
            <Text style={styles.chorusVizValue}>{(chorusDepth * 1000).toFixed(2)} cents</Text>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ FILTER (VCF)</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={filterCutoff / 5000}
                onChange={handleFilterCutoffChange}
                label="CUTOFF"
                color={HAOS_COLORS.pink}
                size={KNOB_SIZE}
              />
              <Text style={styles.knobValue}>{filterCutoff.toFixed(0)} Hz</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={filterResonance / 10}
                onChange={handleFilterResonanceChange}
                label="RESONANCE"
                color={HAOS_COLORS.pink}
                size={KNOB_SIZE}
              />
              <Text style={styles.knobValue}>Q: {filterResonance.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Gentle resonant lowpass filter (Q=2) for smooth, warm tone
          </Text>
          
          {/* Filter Cutoff Visualizer */}
          <View style={styles.filterViz}>
            <Text style={styles.filterVizLabel}>FILTER CUTOFF</Text>
            <View style={styles.filterBar}>
              <View
                style={[
                  styles.filterLevel,
                  {
                    height: `${(filterCutoff / 5000) * 100}%`,
                    backgroundColor: HAOS_COLORS.pink,
                  },
                ]}
              />
            </View>
            <Text style={styles.filterVizValue}>{filterCutoff.toFixed(0)} Hz</Text>
          </View>
        </View>

        {/* Envelope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 ENVELOPE (VCA)</Text>
          <View style={styles.controlsRow}>
            <View style={styles.knobContainer}>
              <Knob
                value={attack / 2}
                onChange={handleAttackChange}
                label="ATTACK"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(attack * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={decay / 2}
                onChange={handleDecayChange}
                label="DECAY"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(decay * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={sustain}
                onChange={handleSustainChange}
                label="SUSTAIN"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(sustain * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.knobContainer}>
              <Knob
                value={release / 5}
                onChange={handleReleaseChange}
                label="RELEASE"
                color={HAOS_COLORS.cyan}
                size={60}
              />
              <Text style={styles.knobValue}>{(release * 1000).toFixed(0)}ms</Text>
            </View>
          </View>
        </View>

        {/* Piano Roll Sequencer */}
        <PianoRollSequencer
          isPlaying={sequencerPlaying}
          bpm={bpm}
          onStepTrigger={(data) => {
            juno106Bridge.playNote(data.note, data.velocity, data.duration);
          }}
          color={HAOS_COLORS.purple}
          title="JUNO-106 PIANO ROLL"
        />

        {/* Sequencer Controls */}
        <View style={styles.section}>
          <View style={styles.sequencerControls}>
            <TouchableOpacity
              onPress={() => setSequencerPlaying(!sequencerPlaying)}
              style={[styles.transportButton, sequencerPlaying && styles.transportButtonActive]}
            >
              <Text style={styles.transportButtonText}>
                {sequencerPlaying ? '⏸ STOP' : '▶ PLAY'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bpmControl}>
              <Text style={styles.bpmLabel}>BPM</Text>
              <View style={styles.bpmButtons}>
                <TouchableOpacity
                  onPress={() => setBpm(Math.max(60, bpm - 5))}
                  style={styles.bpmButton}
                >
                  <Text style={styles.bpmButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.bpmValue}>{bpm}</Text>
                <TouchableOpacity
                  onPress={() => setBpm(Math.min(200, bpm + 5))}
                  style={styles.bpmButton}
                >
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
            🎼 Warm analog sound • Perfect for pads & bass • Classic 80s hip-hop
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
    borderBottomColor: HAOS_COLORS.purple,
  },
  backButton: {
    color: HAOS_COLORS.purple,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    letterSpacing: 2,
    marginTop: 2,
  },
  badge: {
    backgroundColor: HAOS_COLORS.purple,
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
    color: HAOS_COLORS.purple,
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
    backgroundColor: 'rgba(157,78,221,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157,78,221,0.3)',
  },
  oscilloscopeLabel: {
    fontSize: 12,
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chorusViz: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(157,78,221,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157,78,221,0.3)',
  },
  chorusVizLabel: {
    fontSize: 12,
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  chorusWaves: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 200,
  },
  chorusWave: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chorusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: HAOS_COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  chorusVizValue: {
    fontSize: 14,
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    marginTop: 15,
    fontFamily: 'monospace',
  },
  filterViz: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,0,110,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,0,110,0.3)',
  },
  filterVizLabel: {
    fontSize: 12,
    color: HAOS_COLORS.pink,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  filterBar: {
    width: 60,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 2,
    borderColor: 'rgba(255,0,110,0.3)',
  },
  filterLevel: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: HAOS_COLORS.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  filterVizValue: {
    fontSize: 14,
    color: HAOS_COLORS.pink,
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
    backgroundColor: HAOS_COLORS.purple,
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
    backgroundColor: HAOS_COLORS.pink,
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

export default Juno106Screen;
