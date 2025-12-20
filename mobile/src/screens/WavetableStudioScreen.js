/**
 * HAOS.fm Wavetable Studio
 * Advanced wavetable synthesis with SERUM2-inspired controls
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { wavetableEngine, modulationMatrix } from '../AudioEngine';
import { AnimatedKnob, WaveformVisualizer } from '../UI/Components';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  gold: '#FFD700',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const WavetableStudioScreen = ({ navigation }) => {
  // State management
  const [selectedWavetable, setSelectedWavetable] = useState('analog');
  const [wavetablePosition, setWavetablePosition] = useState(0);
  const [activeNotes, setActiveNotes] = useState([]);
  
  // Oscillator parameters
  const [params, setParams] = useState({
    // Oscillator A
    oscALevel: 0.8,
    oscAPitch: 0,
    oscAPhase: 0,
    oscAUnison: 4,
    oscADetune: 10,
    
    // Oscillator B
    oscBLevel: 0.6,
    oscBPitch: 0,
    oscBPhase: 0,
    oscBUnison: 2,
    oscBDetune: 15,
    
    // Sub Oscillator
    subLevel: 0.5,
    subWaveform: 'sine',
    
    // FM Synthesis
    fmAmount: 0,
    fmRatio: 1,
    
    // Noise
    noiseLevel: 0,
    noiseColor: 'white',
    
    // Filter
    filterCutoff: 5000,
    filterResonance: 0.3,
    filterDrive: 0,
    
    // Effects
    unison: 4,
    stereoWidth: 0.7,
  });
  
  const [showOscB, setShowOscB] = useState(true);
  const [showFM, setShowFM] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    initializeStudio();
  }, []);
  
  const initializeStudio = async () => {
    await wavetableEngine.initialize();
    wavetableEngine.setWavetable('analog');
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const selectWavetable = (name) => {
    setSelectedWavetable(name);
    wavetableEngine.setWavetable(name);
    
    // Animate wavetable morph
    Animated.sequence([
      Animated.timing(morphAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(morphAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const updateParameter = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    wavetableEngine.setParameter(param, value);
  };
  
  const playNote = (note) => {
    const voiceId = wavetableEngine.playNote(note, 100, 2000);
    setActiveNotes(prev => [...prev, { note, voiceId }]);
  };
  
  const stopNote = (note) => {
    const noteData = activeNotes.find(n => n.note === note);
    if (noteData) {
      wavetableEngine.stopNote(noteData.voiceId);
      setActiveNotes(prev => prev.filter(n => n.note !== note));
    }
  };
  
  const wavetables = [
    { name: 'analog', label: 'ANALOG', color: HAOS_COLORS.green, waveform: 'sawtooth' },
    { name: 'digital', label: 'DIGITAL', color: HAOS_COLORS.cyan, waveform: 'square' },
    { name: 'vocal', label: 'VOCAL', color: HAOS_COLORS.orange, waveform: 'sine' },
    { name: 'harmonic', label: 'HARMONIC', color: HAOS_COLORS.purple, waveform: 'triangle' },
    { name: 'bell', label: 'BELL', color: HAOS_COLORS.gold, waveform: 'sine' },
    { name: 'pad', label: 'PAD', color: '#FF1493', waveform: 'sine' },
  ];
  
  const notes = [
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  ];
  
  const currentWavetable = wavetables.find(w => w.name === selectedWavetable);
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#1a0033', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>WAVETABLE STUDIO</Text>
          <Text style={styles.subtitle}>SERUM2 ENGINE</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Wavetable Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌊 WAVETABLE BANKS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wavetables.map((wavetable) => (
                <TouchableOpacity
                  key={wavetable.name}
                  style={[
                    styles.wavetableButton,
                    selectedWavetable === wavetable.name && styles.wavetableButtonActive,
                  ]}
                  onPress={() => selectWavetable(wavetable.name)}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: selectedWavetable === wavetable.name
                            ? morphAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.1],
                              })
                            : 1,
                        },
                      ],
                    }}
                  >
                    <LinearGradient
                      colors={
                        selectedWavetable === wavetable.name
                          ? [wavetable.color, wavetable.color + '80']
                          : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                      }
                      style={styles.wavetableGradient}
                    >
                      <Text
                        style={[
                          styles.wavetableLabel,
                          selectedWavetable === wavetable.name && { color: HAOS_COLORS.dark },
                        ]}
                      >
                        {wavetable.label}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Wavetable Visualizer */}
          <View style={styles.section}>
            <View style={styles.visualizerContainer}>
              <WaveformVisualizer
                waveform={currentWavetable?.waveform || 'sine'}
                frequency={10}
                amplitude={params.oscALevel}
                width={width - 40}
                height={120}
                color={currentWavetable?.color || HAOS_COLORS.green}
                showGrid={true}
                animated={true}
              />
              <View style={styles.wavetableInfo}>
                <Text style={[styles.wavetableInfoText, { color: currentWavetable?.color }]}>
                  {currentWavetable?.label} WAVETABLE
                </Text>
                <Text style={styles.wavetablePosition}>
                  Position: {Math.round(wavetablePosition * 100)}%
                </Text>
              </View>
            </View>
          </View>
          
          {/* Oscillator A */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎚️ OSCILLATOR A</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="LEVEL"
                value={params.oscALevel}
                min={0}
                max={1}
                onChange={(val) => updateParameter('oscALevel', val)}
                color={HAOS_COLORS.green}
                size={90}
              />
              <AnimatedKnob
                label="PITCH"
                value={params.oscAPitch}
                min={-24}
                max={24}
                onChange={(val) => updateParameter('oscAPitch', val)}
                color={HAOS_COLORS.cyan}
                size={90}
                unit=" st"
                decimals={0}
              />
              <AnimatedKnob
                label="PHASE"
                value={params.oscAPhase}
                min={0}
                max={360}
                onChange={(val) => updateParameter('oscAPhase', val)}
                color={HAOS_COLORS.orange}
                size={90}
                unit="°"
                decimals={0}
              />
            </View>
            
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="UNISON"
                value={params.oscAUnison}
                min={1}
                max={8}
                onChange={(val) => updateParameter('oscAUnison', Math.round(val))}
                color={HAOS_COLORS.purple}
                decimals={0}
              />
              <AnimatedKnob
                label="DETUNE"
                value={params.oscADetune}
                min={0}
                max={50}
                onChange={(val) => updateParameter('oscADetune', val)}
                color={HAOS_COLORS.gold}
                unit=" ct"
              />
            </View>
          </View>
          
          {/* Oscillator B Toggle */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowOscB(!showOscB)}
          >
            <Text style={styles.sectionTitle}>
              🎛️ OSCILLATOR B {showOscB ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showOscB && (
            <View style={styles.section}>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="LEVEL"
                  value={params.oscBLevel}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('oscBLevel', val)}
                  color={HAOS_COLORS.green}
                  size={90}
                />
                <AnimatedKnob
                  label="PITCH"
                  value={params.oscBPitch}
                  min={-24}
                  max={24}
                  onChange={(val) => updateParameter('oscBPitch', val)}
                  color={HAOS_COLORS.cyan}
                  size={90}
                  unit=" st"
                  decimals={0}
                />
                <AnimatedKnob
                  label="PHASE"
                  value={params.oscBPhase}
                  min={0}
                  max={360}
                  onChange={(val) => updateParameter('oscBPhase', val)}
                  color={HAOS_COLORS.orange}
                  size={90}
                  unit="°"
                  decimals={0}
                />
              </View>
              
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="UNISON"
                  value={params.oscBUnison}
                  min={1}
                  max={8}
                  onChange={(val) => updateParameter('oscBUnison', Math.round(val))}
                  color={HAOS_COLORS.purple}
                  decimals={0}
                />
                <AnimatedKnob
                  label="DETUNE"
                  value={params.oscBDetune}
                  min={0}
                  max={50}
                  onChange={(val) => updateParameter('oscBDetune', val)}
                  color={HAOS_COLORS.gold}
                  unit=" ct"
                />
              </View>
            </View>
          )}
          
          {/* Sub Oscillator */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 SUB OSCILLATOR</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="SUB LEVEL"
                value={params.subLevel}
                min={0}
                max={1}
                onChange={(val) => updateParameter('subLevel', val)}
                color={HAOS_COLORS.green}
                size={100}
              />
            </View>
          </View>
          
          {/* FM Synthesis Toggle */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowFM(!showFM)}
          >
            <Text style={styles.sectionTitle}>
              📡 FM SYNTHESIS {showFM ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showFM && (
            <View style={styles.section}>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="FM AMOUNT"
                  value={params.fmAmount}
                  min={0}
                  max={100}
                  onChange={(val) => updateParameter('fmAmount', val)}
                  color={HAOS_COLORS.orange}
                  size={100}
                />
                <AnimatedKnob
                  label="FM RATIO"
                  value={params.fmRatio}
                  min={0.25}
                  max={8}
                  onChange={(val) => updateParameter('fmRatio', val)}
                  color={HAOS_COLORS.purple}
                  size={100}
                />
              </View>
            </View>
          )}
          
          {/* Noise Generator */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📻 NOISE GENERATOR</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="NOISE LEVEL"
                value={params.noiseLevel}
                min={0}
                max={1}
                onChange={(val) => updateParameter('noiseLevel', val)}
                color={HAOS_COLORS.cyan}
                size={100}
              />
            </View>
          </View>
          
          {/* Filter Toggle */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Text style={styles.sectionTitle}>
              🎛️ FILTER {showFilter ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showFilter && (
            <View style={styles.section}>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="CUTOFF"
                  value={params.filterCutoff}
                  min={20}
                  max={20000}
                  onChange={(val) => updateParameter('filterCutoff', val)}
                  color={HAOS_COLORS.cyan}
                  unit=" Hz"
                  decimals={0}
                />
                <AnimatedKnob
                  label="RESONANCE"
                  value={params.filterResonance}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('filterResonance', val)}
                  color={HAOS_COLORS.orange}
                />
                <AnimatedKnob
                  label="DRIVE"
                  value={params.filterDrive}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('filterDrive', val)}
                  color={HAOS_COLORS.purple}
                />
              </View>
            </View>
          )}
          
          {/* Global Effects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ GLOBAL EFFECTS</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="UNISON"
                value={params.unison}
                min={1}
                max={8}
                onChange={(val) => updateParameter('unison', Math.round(val))}
                color={HAOS_COLORS.purple}
                decimals={0}
              />
              <AnimatedKnob
                label="STEREO WIDTH"
                value={params.stereoWidth}
                min={0}
                max={1}
                onChange={(val) => updateParameter('stereoWidth', val)}
                color={HAOS_COLORS.cyan}
              />
            </View>
          </View>
          
          {/* Keyboard */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎹 KEYBOARD</Text>
            <View style={styles.keyboard}>
              {notes.slice(0, 12).map((note) => {
                const isBlackKey = note.includes('#');
                const isActive = activeNotes.some(n => n.note === note);
                
                return (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.key,
                      isBlackKey ? styles.blackKey : styles.whiteKey,
                      isActive && styles.keyActive,
                    ]}
                    onPressIn={() => playNote(note)}
                    onPressOut={() => stopNote(note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        isBlackKey && styles.blackKeyLabel,
                      ]}
                    >
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={[styles.keyboard, { marginTop: 10 }]}>
              {notes.slice(12, 24).map((note) => {
                const isBlackKey = note.includes('#');
                const isActive = activeNotes.some(n => n.note === note);
                
                return (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.key,
                      isBlackKey ? styles.blackKey : styles.whiteKey,
                      isActive && styles.keyActive,
                    ]}
                    onPressIn={() => playNote(note)}
                    onPressOut={() => stopNote(note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        isBlackKey && styles.blackKeyLabel,
                      ]}
                    >
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: HAOS_COLORS.purple,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    marginBottom: 15,
    letterSpacing: 1,
  },
  wavetableButton: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  wavetableButtonActive: {
    elevation: 5,
    shadowColor: HAOS_COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  wavetableGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  wavetableLabel: {
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    fontSize: 14,
  },
  visualizerContainer: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: HAOS_COLORS.purple + '40',
  },
  wavetableInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  wavetableInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  wavetablePosition: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  keyboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  key: {
    margin: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  whiteKey: {
    backgroundColor: HAOS_COLORS.mediumGray,
    width: width / 13 - 6,
    height: 55,
    borderWidth: 1,
    borderColor: HAOS_COLORS.purple + '40',
  },
  blackKey: {
    backgroundColor: HAOS_COLORS.dark,
    width: width / 18 - 6,
    height: 40,
    borderWidth: 1,
    borderColor: HAOS_COLORS.orange + '40',
  },
  keyActive: {
    backgroundColor: HAOS_COLORS.purple,
    transform: [{ scale: 0.95 }],
  },
  keyLabel: {
    color: HAOS_COLORS.purple,
    fontSize: 10,
    fontWeight: 'bold',
  },
  blackKeyLabel: {
    color: HAOS_COLORS.orange,
  },
});

export default WavetableStudioScreen;
