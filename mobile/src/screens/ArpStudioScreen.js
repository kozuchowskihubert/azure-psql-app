/**
 * HAOS.fm Arp Studio
 * Specialized studio for arpeggiator patterns and sequencing
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
import { bassArpEngine, presetManager } from '../AudioEngine';
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

const ArpStudioScreen = ({ navigation }) => {
  // State management
  const [selectedPreset, setSelectedPreset] = useState('pluckArp');
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  
  // Arpeggiator settings
  const [arpSettings, setArpSettings] = useState({
    enabled: false,
    pattern: 'up',
    rate: '1/16',
    gate: 0.8,
    octaves: 1,
    swing: 0,
  });
  
  // Sequencer
  const [sequence, setSequence] = useState([
    { note: 'C3', active: true, velocity: 100 },
    { note: 'E3', active: true, velocity: 80 },
    { note: 'G3', active: true, velocity: 90 },
    { note: 'C4', active: true, velocity: 100 },
    { note: 'E4', active: false, velocity: 70 },
    { note: 'G4', active: false, velocity: 80 },
    { note: 'C5', active: false, velocity: 90 },
    { note: 'E5', active: false, velocity: 100 },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  
  // Parameters
  const [params, setParams] = useState({
    osc1Level: 0.8,
    osc2Level: 0.6,
    filterCutoff: 2000,
    filterResonance: 0.4,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.3,
    release: 0.3,
    pluckAmount: 0.7,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepAnimations = useRef(
    Array(8).fill(0).map(() => new Animated.Value(1))
  ).current;
  
  useEffect(() => {
    initializeStudio();
  }, []);
  
  useEffect(() => {
    let interval;
    if (isPlaying) {
      const stepDuration = (60000 / tempo) / 4; // 16th notes
      interval = setInterval(() => {
        playArpStep();
      }, stepDuration);
    }
    return () => clearInterval(interval);
  }, [isPlaying, tempo, currentStep, sequence, arpSettings]);
  
  const initializeStudio = async () => {
    await bassArpEngine.initialize();
    loadPreset('pluckArp');
    
    if (fadeAnim) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const loadPreset = (presetName) => {
    bassArpEngine.loadArpPreset(presetName);
    setSelectedPreset(presetName);
    
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
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentStep(0);
    }
  };
  
  const playArpStep = () => {
    const activeNotes = sequence.filter(s => s.active);
    if (activeNotes.length === 0) return;
    
    let noteIndex = currentStep % activeNotes.length;
    
    // Apply arp pattern
    if (arpSettings.pattern === 'down') {
      noteIndex = activeNotes.length - 1 - noteIndex;
    } else if (arpSettings.pattern === 'updown') {
      const cycle = (activeNotes.length - 1) * 2;
      const pos = currentStep % cycle;
      noteIndex = pos < activeNotes.length ? pos : cycle - pos;
    } else if (arpSettings.pattern === 'random') {
      noteIndex = Math.floor(Math.random() * activeNotes.length);
    }
    
    const note = activeNotes[noteIndex];
    
    // Animate step
    const stepAnim = stepAnimations[currentStep % 8];
    if (stepAnim && typeof stepAnim.setValue === 'function') {
      Animated.sequence([
        Animated.timing(stepAnim, {
          toValue: 1.2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    // Play note
    bassArpEngine.playNote(note.note, note.velocity, 200);
    
    setCurrentStep(prev => prev + 1);
  };
  
  const toggleStep = (index) => {
    const newSequence = [...sequence];
    newSequence[index].active = !newSequence[index].active;
    setSequence(newSequence);
  };
  
  const updateStepVelocity = (index, velocity) => {
    const newSequence = [...sequence];
    newSequence[index].velocity = velocity;
    setSequence(newSequence);
  };
  
  const updateArpSetting = (key, value) => {
    setArpSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const arpPresets = [
    { name: 'pluckArp', label: 'PLUCK', color: HAOS_COLORS.cyan },
    { name: 'supersawArp', label: 'SUPERSAW', color: HAOS_COLORS.orange },
    { name: 'sequenceArp', label: 'SEQUENCE', color: HAOS_COLORS.green },
    { name: 'bellArp', label: 'BELL', color: HAOS_COLORS.purple },
    { name: 'leadArp', label: 'LEAD', color: '#FFD700' },
  ];
  
  const arpPatterns = [
    { value: 'up', label: 'UP ▲' },
    { value: 'down', label: 'DOWN ▼' },
    { value: 'updown', label: 'UP/DN ▲▼' },
    { value: 'random', label: 'RANDOM ?' },
  ];
  
  const arpRates = [
    { value: '1/4', label: '1/4' },
    { value: '1/8', label: '1/8' },
    { value: '1/16', label: '1/16' },
    { value: '1/32', label: '1/32' },
  ];
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#001833', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ARP STUDIO</Text>
          <Text style={styles.subtitle}>SEQUENCER ENGINE</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Preset Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 ARP PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {arpPresets.map((preset) => (
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
          
          {/* Transport Controls */}
          <View style={styles.section}>
            <View style={styles.transportRow}>
              <TouchableOpacity
                style={[styles.playButton, isPlaying && styles.playButtonActive]}
                onPress={togglePlay}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.tempoControl}>
                <Text style={styles.tempoLabel}>TEMPO</Text>
                <Text style={styles.tempoValue}>{Math.round(tempo)} BPM</Text>
                <AnimatedKnob
                  label=""
                  value={tempo}
                  min={60}
                  max={200}
                  onChange={setTempo}
                  color={HAOS_COLORS.green}
                  size={70}
                  decimals={0}
                />
              </View>
            </View>
          </View>
          
          {/* Arpeggiator Settings */}
          <View style={styles.section}>
            <View style={styles.arpHeader}>
              <Text style={styles.sectionTitle}>🎹 ARPEGGIATOR</Text>
              <Switch
                value={arpSettings.enabled}
                onChange={(val) => updateArpSetting('enabled', val)}
                trackColor={{ false: HAOS_COLORS.mediumGray, true: HAOS_COLORS.green }}
                thumbColor={arpSettings.enabled ? HAOS_COLORS.green : '#f4f3f4'}
              />
            </View>
            
            {arpSettings.enabled && (
              <View style={styles.arpControls}>
                {/* Pattern Selection */}
                <Text style={styles.controlLabel}>PATTERN</Text>
                <View style={styles.buttonRow}>
                  {arpPatterns.map((pattern) => (
                    <TouchableOpacity
                      key={pattern.value}
                      style={[
                        styles.patternButton,
                        arpSettings.pattern === pattern.value && styles.patternButtonActive,
                      ]}
                      onPress={() => updateArpSetting('pattern', pattern.value)}
                    >
                      <Text
                        style={[
                          styles.patternButtonText,
                          arpSettings.pattern === pattern.value && styles.patternButtonTextActive,
                        ]}
                      >
                        {pattern.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Rate Selection */}
                <Text style={styles.controlLabel}>RATE</Text>
                <View style={styles.buttonRow}>
                  {arpRates.map((rate) => (
                    <TouchableOpacity
                      key={rate.value}
                      style={[
                        styles.rateButton,
                        arpSettings.rate === rate.value && styles.rateButtonActive,
                      ]}
                      onPress={() => updateArpSetting('rate', rate.value)}
                    >
                      <Text
                        style={[
                          styles.rateButtonText,
                          arpSettings.rate === rate.value && styles.rateButtonTextActive,
                        ]}
                      >
                        {rate.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {/* Gate & Octaves */}
                <View style={styles.knobRow}>
                  <AnimatedKnob
                    label="GATE"
                    value={arpSettings.gate}
                    min={0.1}
                    max={1}
                    onChange={(val) => updateArpSetting('gate', val)}
                    color={HAOS_COLORS.cyan}
                  />
                  <AnimatedKnob
                    label="OCTAVES"
                    value={arpSettings.octaves}
                    min={1}
                    max={4}
                    onChange={(val) => updateArpSetting('octaves', Math.round(val))}
                    color={HAOS_COLORS.purple}
                    decimals={0}
                  />
                  <AnimatedKnob
                    label="SWING"
                    value={arpSettings.swing}
                    min={0}
                    max={0.75}
                    onChange={(val) => updateArpSetting('swing', val)}
                    color={HAOS_COLORS.orange}
                  />
                </View>
              </View>
            )}
          </View>
          
          {/* Step Sequencer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 STEP SEQUENCER</Text>
            <View style={styles.sequencer}>
              {sequence.map((step, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.stepContainer,
                    { transform: [{ scale: stepAnimations[index] }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.step,
                      step.active && styles.stepActive,
                      index === currentStep % 8 && isPlaying && styles.stepCurrent,
                    ]}
                    onPress={() => toggleStep(index)}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <Text style={styles.stepNote}>{step.note}</Text>
                    <View style={styles.velocityBar}>
                      <View
                        style={[
                          styles.velocityFill,
                          { width: `${step.velocity}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
          
          {/* Sound Parameters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎚️ SOUND</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="OSC MIX"
                value={params.osc1Level}
                min={0}
                max={1}
                onChange={(val) => updateParameter('osc1Level', val)}
                color={HAOS_COLORS.green}
              />
              <AnimatedKnob
                label="FILTER"
                value={params.filterCutoff}
                min={200}
                max={10000}
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
            </View>
            
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="ATTACK"
                value={params.attack}
                min={0.001}
                max={1}
                onChange={(val) => updateParameter('attack', val)}
                color={HAOS_COLORS.cyan}
                unit=" s"
              />
              <AnimatedKnob
                label="DECAY"
                value={params.decay}
                min={0.01}
                max={1}
                onChange={(val) => updateParameter('decay', val)}
                color={HAOS_COLORS.green}
                unit=" s"
              />
              <AnimatedKnob
                label="RELEASE"
                value={params.release}
                min={0.01}
                max={2}
                onChange={(val) => updateParameter('release', val)}
                color={HAOS_COLORS.purple}
                unit=" s"
              />
              <AnimatedKnob
                label="PLUCK"
                value={params.pluckAmount}
                min={0}
                max={1}
                onChange={(val) => updateParameter('pluckAmount', val)}
                color={HAOS_COLORS.orange}
              />
            </View>
          </View>
          
          {/* Waveform Visualizer */}
          <View style={styles.section}>
            <WaveformVisualizer
              waveform="sawtooth"
              frequency={5}
              amplitude={0.8}
              width={width - 40}
              height={80}
              color={HAOS_COLORS.cyan}
              showGrid={true}
              animated={isPlaying}
            />
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
    color: HAOS_COLORS.cyan,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
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
    shadowColor: HAOS_COLORS.cyan,
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
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    fontSize: 14,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.green,
    flex: 1,
    marginRight: 15,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
  },
  playButtonText: {
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  tempoControl: {
    alignItems: 'center',
  },
  tempoLabel: {
    color: HAOS_COLORS.green,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tempoValue: {
    color: HAOS_COLORS.green,
    fontSize: 20,
    fontWeight: 'bold',
  },
  arpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arpControls: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan + '40',
    marginTop: 10,
  },
  controlLabel: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  patternButton: {
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan + '40',
  },
  patternButtonActive: {
    backgroundColor: HAOS_COLORS.cyan,
    borderColor: HAOS_COLORS.cyan,
  },
  patternButtonText: {
    color: HAOS_COLORS.cyan,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  patternButtonTextActive: {
    color: HAOS_COLORS.dark,
  },
  rateButton: {
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: HAOS_COLORS.green + '40',
  },
  rateButtonActive: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
  },
  rateButtonText: {
    color: HAOS_COLORS.green,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rateButtonTextActive: {
    color: HAOS_COLORS.dark,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  sequencer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stepContainer: {
    width: '23%',
    marginBottom: 10,
  },
  step: {
    backgroundColor: HAOS_COLORS.mediumGray,
    borderRadius: 8,
    padding: 10,
    borderWidth: 2,
    borderColor: HAOS_COLORS.darkGray,
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderColor: HAOS_COLORS.cyan,
  },
  stepCurrent: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
  },
  stepNumber: {
    color: HAOS_COLORS.cyan,
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepNote: {
    color: HAOS_COLORS.green,
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  velocityBar: {
    width: '100%',
    height: 4,
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  velocityFill: {
    height: '100%',
    backgroundColor: HAOS_COLORS.orange,
  },
});

export default ArpStudioScreen;
