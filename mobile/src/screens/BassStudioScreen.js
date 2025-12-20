/**
 * HAOS.fm Bass Studio
 * Specialized studio for bass synthesis with QUAKE-inspired controls
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
import { bassArpEngine, presetManager, modulationMatrix } from '../AudioEngine';
import { AnimatedKnob, WaveformVisualizer } from '../UI/Components';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const BassStudioScreen = ({ navigation }) => {
  // State management
  const [selectedPreset, setSelectedPreset] = useState('subQuake');
  const [activeNotes, setActiveNotes] = useState([]);
  const [showSubOscillator, setShowSubOscillator] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showEffects, setShowEffects] = useState(true);
  
  // Bass parameters
  const [params, setParams] = useState({
    // Oscillators
    osc1Level: 0.8,
    osc1Detune: 0,
    osc1Unison: 4,
    osc2Level: 0.6,
    osc2Detune: 12,
    osc2Unison: 2,
    
    // Sub Oscillator
    subLevel: 0.7,
    subOctave: -2,
    
    // Filters
    filter1Cutoff: 800,
    filter1Resonance: 0.3,
    filter1Type: 'lowpass',
    filter2Cutoff: 1200,
    filter2Resonance: 0.2,
    filter2Type: 'bandpass',
    
    // Effects
    distortion: 0.4,
    bassBoost: 0.6,
    stereoWidth: 0.5,
    
    // Envelope
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
  });
  
  const [lfoParams, setLfoParams] = useState({
    rate: 4,
    depth: 0.5,
    waveform: 'sine',
    destination: 'filter1Cutoff',
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    initializeStudio();
  }, []);
  
  const initializeStudio = async () => {
    await bassArpEngine.initialize();
    loadPreset('subQuake');
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const loadPreset = (presetName) => {
    bassArpEngine.loadBassPreset(presetName);
    setSelectedPreset(presetName);
    
    // Update UI parameters from engine
    const engineParams = bassArpEngine.params;
    setParams(prev => ({
      ...prev,
      ...engineParams,
    }));
  };
  
  const updateParameter = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    bassArpEngine.setParameter(param, value);
  };
  
  const updateLFO = (param, value) => {
    setLfoParams(prev => ({ ...prev, [param]: value }));
    const newLFO = { ...lfoParams, [param]: value };
    bassArpEngine.setLFO(newLFO);
  };
  
  const playNote = (note) => {
    const voiceId = bassArpEngine.playNote(note, 127);
    setActiveNotes(prev => [...prev, { note, voiceId }]);
  };
  
  const stopNote = (note) => {
    const noteData = activeNotes.find(n => n.note === note);
    if (noteData) {
      bassArpEngine.stopNote(noteData.voiceId);
      setActiveNotes(prev => prev.filter(n => n.note !== note));
    }
  };
  
  const bassPresets = [
    { name: 'subQuake', label: 'SUB QUAKE', color: HAOS_COLORS.green },
    { name: 'acidBass', label: 'ACID BASS', color: HAOS_COLORS.orange },
    { name: 'wobbleBass', label: 'WOBBLE', color: HAOS_COLORS.cyan },
    { name: 'reeseBass', label: 'REESE', color: HAOS_COLORS.purple },
    { name: 'bass808', label: '808 BASS', color: '#FFD700' },
    { name: 'fmBass', label: 'FM BASS', color: '#FF1493' },
  ];
  
  const bassNotes = [
    'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2',
  ];
  
  const lfoWaveforms = ['sine', 'triangle', 'square', 'sawtooth', 'random'];
  const lfoDestinations = [
    { value: 'filter1Cutoff', label: 'Filter 1' },
    { value: 'filter2Cutoff', label: 'Filter 2' },
    { value: 'osc1Level', label: 'Osc 1 Level' },
    { value: 'osc2Level', label: 'Osc 2 Level' },
    { value: 'subLevel', label: 'Sub Level' },
    { value: 'distortion', label: 'Distortion' },
  ];
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#000814', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>BASS STUDIO</Text>
          <Text style={styles.subtitle}>QUAKE ENGINE</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Preset Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ BASS PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bassPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  style={[
                    styles.presetButton,
                    selectedPreset === preset.name && styles.presetButtonActive,
                  ]}
                  onPress={() => loadPreset(preset.name)}
                >
                  <LinearGradient
                    colors={
                      selectedPreset === preset.name
                        ? [preset.color, preset.color + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.presetGradient}
                  >
                    <Text
                      style={[
                        styles.presetLabel,
                        selectedPreset === preset.name && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Waveform Visualizer */}
          <View style={styles.section}>
            <WaveformVisualizer
              waveform="sine"
              frequency={params.filter1Cutoff / 20}
              amplitude={params.osc1Level}
              width={width - 40}
              height={100}
              color={HAOS_COLORS.green}
              showGrid={true}
              animated={true}
            />
          </View>
          
          {/* Oscillator Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎚️ OSCILLATORS</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="OSC 1"
                value={params.osc1Level}
                min={0}
                max={1}
                onChange={(val) => updateParameter('osc1Level', val)}
                color={HAOS_COLORS.green}
              />
              <AnimatedKnob
                label="DETUNE"
                value={params.osc1Detune}
                min={-50}
                max={50}
                onChange={(val) => updateParameter('osc1Detune', val)}
                color={HAOS_COLORS.cyan}
                unit=" ct"
              />
              <AnimatedKnob
                label="UNISON"
                value={params.osc1Unison}
                min={1}
                max={8}
                onChange={(val) => updateParameter('osc1Unison', Math.round(val))}
                color={HAOS_COLORS.orange}
                decimals={0}
              />
            </View>
            
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="OSC 2"
                value={params.osc2Level}
                min={0}
                max={1}
                onChange={(val) => updateParameter('osc2Level', val)}
                color={HAOS_COLORS.green}
              />
              <AnimatedKnob
                label="DETUNE"
                value={params.osc2Detune}
                min={-50}
                max={50}
                onChange={(val) => updateParameter('osc2Detune', val)}
                color={HAOS_COLORS.cyan}
                unit=" ct"
              />
              <AnimatedKnob
                label="UNISON"
                value={params.osc2Unison}
                min={1}
                max={8}
                onChange={(val) => updateParameter('osc2Unison', Math.round(val))}
                color={HAOS_COLORS.orange}
                decimals={0}
              />
            </View>
          </View>
          
          {/* Sub Oscillator Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowSubOscillator(!showSubOscillator)}
          >
            <Text style={styles.sectionTitle}>
              🔊 SUB OSCILLATOR {showSubOscillator ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showSubOscillator && (
            <View style={styles.section}>
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
                <AnimatedKnob
                  label="OCTAVE"
                  value={params.subOctave}
                  min={-3}
                  max={0}
                  onChange={(val) => updateParameter('subOctave', Math.round(val))}
                  color={HAOS_COLORS.purple}
                  size={100}
                  decimals={0}
                />
              </View>
            </View>
          )}
          
          {/* Filter Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.sectionTitle}>
              🎛️ DUAL FILTERS {showFilters ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showFilters && (
            <View style={styles.section}>
              <Text style={styles.filterLabel}>FILTER 1 (Lowpass)</Text>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="CUTOFF"
                  value={params.filter1Cutoff}
                  min={50}
                  max={20000}
                  onChange={(val) => updateParameter('filter1Cutoff', val)}
                  color={HAOS_COLORS.cyan}
                  unit=" Hz"
                  decimals={0}
                />
                <AnimatedKnob
                  label="RESONANCE"
                  value={params.filter1Resonance}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('filter1Resonance', val)}
                  color={HAOS_COLORS.orange}
                />
              </View>
              
              <Text style={styles.filterLabel}>FILTER 2 (Bandpass)</Text>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="CUTOFF"
                  value={params.filter2Cutoff}
                  min={50}
                  max={20000}
                  onChange={(val) => updateParameter('filter2Cutoff', val)}
                  color={HAOS_COLORS.cyan}
                  unit=" Hz"
                  decimals={0}
                />
                <AnimatedKnob
                  label="RESONANCE"
                  value={params.filter2Resonance}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('filter2Resonance', val)}
                  color={HAOS_COLORS.orange}
                />
              </View>
            </View>
          )}
          
          {/* Effects Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowEffects(!showEffects)}
          >
            <Text style={styles.sectionTitle}>
              ✨ BASS EFFECTS {showEffects ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {showEffects && (
            <View style={styles.section}>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="DISTORTION"
                  value={params.distortion}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('distortion', val)}
                  color={HAOS_COLORS.orange}
                />
                <AnimatedKnob
                  label="BASS BOOST"
                  value={params.bassBoost}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('bassBoost', val)}
                  color={HAOS_COLORS.green}
                />
                <AnimatedKnob
                  label="WIDTH"
                  value={params.stereoWidth}
                  min={0}
                  max={1}
                  onChange={(val) => updateParameter('stereoWidth', val)}
                  color={HAOS_COLORS.cyan}
                />
              </View>
            </View>
          )}
          
          {/* LFO Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>〰️ LFO MODULATION</Text>
            
            <View style={styles.lfoControls}>
              <View style={styles.knobRow}>
                <AnimatedKnob
                  label="RATE"
                  value={lfoParams.rate}
                  min={0.1}
                  max={20}
                  onChange={(val) => updateLFO('rate', val)}
                  color={HAOS_COLORS.purple}
                  unit=" Hz"
                />
                <AnimatedKnob
                  label="DEPTH"
                  value={lfoParams.depth}
                  min={0}
                  max={1}
                  onChange={(val) => updateLFO('depth', val)}
                  color={HAOS_COLORS.orange}
                />
              </View>
              
              {/* LFO Waveform Selector */}
              <Text style={styles.lfoLabel}>WAVEFORM</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {lfoWaveforms.map((waveform) => (
                  <TouchableOpacity
                    key={waveform}
                    style={[
                      styles.lfoButton,
                      lfoParams.waveform === waveform && styles.lfoButtonActive,
                    ]}
                    onPress={() => updateLFO('waveform', waveform)}
                  >
                    <Text
                      style={[
                        styles.lfoButtonText,
                        lfoParams.waveform === waveform && styles.lfoButtonTextActive,
                      ]}
                    >
                      {waveform.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* LFO Destination Selector */}
              <Text style={styles.lfoLabel}>DESTINATION</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {lfoDestinations.map((dest) => (
                  <TouchableOpacity
                    key={dest.value}
                    style={[
                      styles.lfoButton,
                      lfoParams.destination === dest.value && styles.lfoButtonActive,
                    ]}
                    onPress={() => updateLFO('destination', dest.value)}
                  >
                    <Text
                      style={[
                        styles.lfoButtonText,
                        lfoParams.destination === dest.value && styles.lfoButtonTextActive,
                      ]}
                    >
                      {dest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          {/* Envelope Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 ENVELOPE</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="ATTACK"
                value={params.attack}
                min={0.001}
                max={2}
                onChange={(val) => updateParameter('attack', val)}
                color={HAOS_COLORS.cyan}
                unit=" s"
              />
              <AnimatedKnob
                label="DECAY"
                value={params.decay}
                min={0.01}
                max={2}
                onChange={(val) => updateParameter('decay', val)}
                color={HAOS_COLORS.green}
                unit=" s"
              />
              <AnimatedKnob
                label="SUSTAIN"
                value={params.sustain}
                min={0}
                max={1}
                onChange={(val) => updateParameter('sustain', val)}
                color={HAOS_COLORS.orange}
              />
              <AnimatedKnob
                label="RELEASE"
                value={params.release}
                min={0.01}
                max={5}
                onChange={(val) => updateParameter('release', val)}
                color={HAOS_COLORS.purple}
                unit=" s"
              />
            </View>
          </View>
          
          {/* Bass Keyboard */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎹 BASS KEYBOARD</Text>
            <View style={styles.keyboard}>
              {bassNotes.map((note) => {
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
    color: HAOS_COLORS.green,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.green,
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
    color: HAOS_COLORS.green,
    marginBottom: 15,
    letterSpacing: 1,
  },
  presetButton: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  presetButtonActive: {
    elevation: 5,
    shadowColor: HAOS_COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  presetGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  presetLabel: {
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    fontSize: 14,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterLabel: {
    color: HAOS_COLORS.cyan,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  lfoControls: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: HAOS_COLORS.purple + '40',
  },
  lfoLabel: {
    color: HAOS_COLORS.purple,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  lfoButton: {
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: HAOS_COLORS.purple + '40',
  },
  lfoButtonActive: {
    backgroundColor: HAOS_COLORS.purple,
    borderColor: HAOS_COLORS.purple,
  },
  lfoButtonText: {
    color: HAOS_COLORS.purple,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lfoButtonTextActive: {
    color: HAOS_COLORS.dark,
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  key: {
    margin: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  whiteKey: {
    backgroundColor: HAOS_COLORS.mediumGray,
    width: width / 7 - 10,
    height: 60,
    borderWidth: 1,
    borderColor: HAOS_COLORS.green + '40',
  },
  blackKey: {
    backgroundColor: HAOS_COLORS.dark,
    width: width / 10 - 10,
    height: 45,
    borderWidth: 1,
    borderColor: HAOS_COLORS.orange + '40',
  },
  keyActive: {
    backgroundColor: HAOS_COLORS.green,
    transform: [{ scale: 0.95 }],
  },
  keyLabel: {
    color: HAOS_COLORS.green,
    fontSize: 11,
    fontWeight: 'bold',
  },
  blackKeyLabel: {
    color: HAOS_COLORS.orange,
  },
});

export default BassStudioScreen;
