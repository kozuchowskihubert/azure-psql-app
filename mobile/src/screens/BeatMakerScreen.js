/**
 * HAOS.fm Beat Maker - Complete Production Studio
 * Drums, Bass, Synths, Piano, Violin, Vocals with Autotune
 * Matching beat-maker.html functionality
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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  cyan: '#00ffff',
  orange: '#ff8800',
  purple: '#8B5CF6',
  pink: '#ff00ff',
  yellow: '#FFD700',
  blue: '#00D9FF',
  red: '#ff0044',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const BeatMakerScreen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState('drums');
  
  // Instrument states
  const [instruments, setInstruments] = useState({
    drums: { enabled: true, volume: 0.8, muted: false },
    bass: { enabled: true, volume: 0.7, muted: false },
    synth: { enabled: true, volume: 0.6, muted: false },
    piano: { enabled: false, volume: 0.5, muted: false },
    violin: { enabled: false, volume: 0.4, muted: false },
    vocals: { enabled: false, volume: 0.6, muted: false, autotune: false },
  });
  
  // Pattern data (16 steps)
  const [pattern, setPattern] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
    bass: Array(16).fill(false),
    synth: Array(16).fill(false),
    piano: Array(16).fill(false),
    violin: Array(16).fill(false),
    vocals: Array(16).fill(false),
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepAnimRef = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Sequencer loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = (60 / bpm) * 250; // 16th notes
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 16);
      
      // Animate step indicator
      Animated.sequence([
        Animated.timing(stepAnimRef, {
          toValue: 1.2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnimRef, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, bpm]);
  
  const toggleStep = (track, step) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((val, i) => i === step ? !val : val),
    }));
  };
  
  const toggleInstrument = (instrument) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: { ...prev[instrument], enabled: !prev[instrument].enabled },
    }));
  };
  
  const setInstrumentVolume = (instrument, volume) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: { ...prev[instrument], volume },
    }));
  };
  
  const toggleMute = (instrument) => {
    setInstruments(prev => ({
      ...prev,
      [instrument]: { ...prev[instrument], muted: !prev[instrument].muted },
    }));
  };
  
  const toggleAutotune = () => {
    setInstruments(prev => ({
      ...prev,
      vocals: { ...prev.vocals, autotune: !prev.vocals.autotune },
    }));
  };
  
  const clearPattern = () => {
    const emptyPattern = {};
    Object.keys(pattern).forEach(track => {
      emptyPattern[track] = Array(16).fill(false);
    });
    setPattern(emptyPattern);
  };
  
  // Preset patterns
  const presets = {
    techno: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      bass: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
      synth: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      piano: Array(16).fill(false),
      violin: Array(16).fill(false),
      vocals: Array(16).fill(false),
    },
    house: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      bass: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      synth: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      piano: Array(16).fill(false),
      violin: Array(16).fill(false),
      vocals: Array(16).fill(false),
    },
    trap: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true],
      clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      bass: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      synth: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      piano: Array(16).fill(false),
      violin: Array(16).fill(false),
      vocals: Array(16).fill(false),
    },
    dnb: {
      kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      clap: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      bass: [true, false, true, false, false, false, true, false, true, false, true, false, false, false, true, false],
      synth: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      piano: Array(16).fill(false),
      violin: Array(16).fill(false),
      vocals: Array(16).fill(false),
    },
  };
  
  const loadPreset = (presetName) => {
    const preset = presets[presetName];
    if (preset) {
      setPattern(preset);
      console.log(`✅ Loaded ${presetName.toUpperCase()} preset pattern`);
    }
  };

  const instrumentConfigs = [
    { id: 'drums', name: 'DRUMS', icon: '🥁', color: HAOS_COLORS.orange, tracks: ['kick', 'snare', 'hihat', 'clap'] },
    { id: 'bass', name: 'BASS', icon: '🎸', color: HAOS_COLORS.green, tracks: ['bass'] },
    { id: 'synth', name: 'SYNTH', icon: '🎹', color: HAOS_COLORS.cyan, tracks: ['synth'] },
    { id: 'piano', name: 'PIANO', icon: '🎹', color: HAOS_COLORS.purple, tracks: ['piano'] },
    { id: 'violin', name: 'VIOLIN', icon: '🎻', color: HAOS_COLORS.pink, tracks: ['violin'] },
    { id: 'vocals', name: 'VOCALS', icon: '🎤', color: HAOS_COLORS.yellow, tracks: ['vocals'] },
  ];
  
  const selectedConfig = instrumentConfigs.find(c => c.id === selectedInstrument);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🎛️</Text>
          <Text style={styles.headerTitle}>BEAT MAKER</Text>
          <Text style={styles.headerSubtitle}>Complete Production Studio</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transport Controls */}
        <View style={styles.transportSection}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          
          <View style={styles.bpmContainer}>
            <Text style={styles.bpmLabel}>BPM</Text>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <Slider
              style={styles.bpmSlider}
              minimumValue={60}
              maximumValue={200}
              value={bpm}
              onValueChange={setBpm}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
          </View>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearPattern}>
            <Text style={styles.clearButtonText}>CLEAR</Text>
          </TouchableOpacity>
        </View>
        
        {/* Instrument Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.instrumentTabs}
        >
          {instrumentConfigs.map(inst => (
            <TouchableOpacity
              key={inst.id}
              style={[
                styles.instrumentTab,
                selectedInstrument === inst.id && styles.instrumentTabActive,
                { borderColor: inst.color },
              ]}
              onPress={() => setSelectedInstrument(inst.id)}
            >
              <Text style={styles.instrumentTabIcon}>{inst.icon}</Text>
              <Text style={[
                styles.instrumentTabText,
                selectedInstrument === inst.id && { color: inst.color }
              ]}>
                {inst.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Instrument Controls */}
        {selectedConfig && (
          <LinearGradient
            colors={[selectedConfig.color + '20', selectedConfig.color + '10']}
            style={styles.instrumentControls}
          >
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Enable</Text>
              <Switch
                value={instruments[selectedInstrument].enabled}
                onValueChange={() => toggleInstrument(selectedInstrument)}
                trackColor={{ false: HAOS_COLORS.mediumGray, true: selectedConfig.color }}
                thumbColor={instruments[selectedInstrument].enabled ? '#fff' : '#ccc'}
              />
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Volume</Text>
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={instruments[selectedInstrument].volume}
                onValueChange={(val) => setInstrumentVolume(selectedInstrument, val)}
                minimumTrackTintColor={selectedConfig.color}
                maximumTrackTintColor={HAOS_COLORS.mediumGray}
                thumbTintColor={selectedConfig.color}
              />
              <Text style={styles.volumeValue}>
                {Math.round(instruments[selectedInstrument].volume * 100)}%
              </Text>
            </View>
            
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Mute</Text>
              <Switch
                value={instruments[selectedInstrument].muted}
                onValueChange={() => toggleMute(selectedInstrument)}
                trackColor={{ false: HAOS_COLORS.mediumGray, true: HAOS_COLORS.red }}
                thumbColor={instruments[selectedInstrument].muted ? '#fff' : '#ccc'}
              />
            </View>
            
            {/* Autotune for vocals */}
            {selectedInstrument === 'vocals' && (
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Autotune</Text>
                <Switch
                  value={instruments.vocals.autotune}
                  onValueChange={toggleAutotune}
                  trackColor={{ false: HAOS_COLORS.mediumGray, true: HAOS_COLORS.purple }}
                  thumbColor={instruments.vocals.autotune ? '#fff' : '#ccc'}
                />
              </View>
            )}
          </LinearGradient>
        )}
        
        {/* Step Sequencer */}
        <View style={styles.sequencerSection}>
          <Text style={styles.sequencerTitle}>16-STEP SEQUENCER</Text>
          
          {selectedConfig && selectedConfig.tracks.map(track => (
            <View key={track} style={styles.trackRow}>
              <Text style={[styles.trackLabel, { color: selectedConfig.color }]}>
                {track.toUpperCase()}
              </Text>
              <View style={styles.stepsContainer}>
                {pattern[track].map((active, step) => (
                  <Animated.View
                    key={step}
                    style={[
                      currentStep === step && { transform: [{ scale: stepAnimRef }] }
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.step,
                        active && { backgroundColor: selectedConfig.color },
                        currentStep === step && styles.stepCurrent,
                        step % 4 === 0 && styles.stepBeat,
                      ]}
                      onPress={() => toggleStep(track, step)}
                    >
                      {active && <Text style={styles.stepDot}>●</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        {/* Preset Patterns */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>PRESET PATTERNS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.orange }]}
              onPress={() => loadPreset('techno')}
            >
              <Text style={styles.presetIcon}>🔥</Text>
              <Text style={styles.presetText}>TECHNO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.cyan }]}
              onPress={() => loadPreset('house')}
            >
              <Text style={styles.presetIcon}>🌊</Text>
              <Text style={styles.presetText}>HOUSE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.purple }]}
              onPress={() => loadPreset('trap')}
            >
              <Text style={styles.presetIcon}>💜</Text>
              <Text style={styles.presetText}>TRAP</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.green }]}
              onPress={() => loadPreset('dnb')}
            >
              <Text style={styles.presetIcon}>🎵</Text>
              <Text style={styles.presetText}>DnB</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.green,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: HAOS_COLORS.green,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  transportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HAOS_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HAOS_COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
  },
  playButtonText: {
    fontSize: 28,
    color: '#000',
  },
  bpmContainer: {
    flex: 1,
    marginHorizontal: 15,
  },
  bpmLabel: {
    fontSize: 12,
    color: HAOS_COLORS.green,
    fontWeight: '600',
    marginBottom: 4,
  },
  bpmValue: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bpmSlider: {
    width: '100%',
    height: 40,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: HAOS_COLORS.red,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  instrumentTabs: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  instrumentTab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  instrumentTabActive: {
    backgroundColor: 'rgba(0,255,148,0.1)',
  },
  instrumentTabIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  instrumentTabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  instrumentControls: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  volumeSlider: {
    flex: 2,
    marginHorizontal: 15,
  },
  volumeValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  sequencerSection: {
    padding: 20,
  },
  sequencerTitle: {
    fontSize: 18,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 60,
    letterSpacing: 0.5,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: HAOS_COLORS.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepCurrent: {
    borderColor: HAOS_COLORS.yellow,
    borderWidth: 2,
  },
  stepBeat: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepDot: {
    fontSize: 8,
    color: '#000',
  },
  presetsSection: {
    padding: 20,
    marginBottom: 40,
  },
  presetsTitle: {
    fontSize: 18,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: (SCREEN_WIDTH - 60) / 2,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    marginBottom: 15,
  },
  presetIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  presetText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default BeatMakerScreen;
