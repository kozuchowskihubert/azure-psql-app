/**
 * HAOS.fm Modulation Lab
 * Visual modulation routing matrix with 4 LFOs
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { modulationMatrix } from '../AudioEngine';
import { AnimatedKnob } from '../UI/Components';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  gold: '#FFD700',
  pink: '#FF1493',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const ModulationLabScreen = ({ navigation }) => {
  // State management
  const [selectedLFO, setSelectedLFO] = useState(0);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [modulations, setModulations] = useState([]);
  const [lfoStates, setLfoStates] = useState([
    { rate: 1.0, depth: 0.5, waveform: 'sine', phase: 0 },
    { rate: 2.0, depth: 0.5, waveform: 'triangle', phase: 0 },
    { rate: 0.5, depth: 0.5, waveform: 'square', phase: 0 },
    { rate: 4.0, depth: 0.5, waveform: 'saw', phase: 0 },
  ]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    initializeLab();
    startPulseAnimation();
  }, []);
  
  const initializeLab = () => {
    modulationMatrix.initialize();
    
    // Load existing modulations
    const activeModulations = modulationMatrix.getAllModulations();
    setModulations(activeModulations);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const updateLFO = (lfoIndex, param, value) => {
    setLfoStates(prev => {
      const newStates = [...prev];
      newStates[lfoIndex] = { ...newStates[lfoIndex], [param]: value };
      return newStates;
    });
    
    modulationMatrix.setLFOParameter(lfoIndex, param, value);
  };
  
  const addModulation = () => {
    if (!selectedSource || !selectedDestination) return;
    
    const modId = modulationMatrix.addModulation(
      selectedSource,
      selectedDestination,
      0.5 // Default amount
    );
    
    const newMod = {
      id: modId,
      source: selectedSource,
      destination: selectedDestination,
      amount: 0.5,
      enabled: true,
    };
    
    setModulations(prev => [...prev, newMod]);
    setSelectedSource(null);
    setSelectedDestination(null);
  };
  
  const removeModulation = (modId) => {
    modulationMatrix.removeModulation(modId);
    setModulations(prev => prev.filter(m => m.id !== modId));
  };
  
  const updateModulationAmount = (modId, amount) => {
    modulationMatrix.setModulationAmount(modId, amount);
    setModulations(prev =>
      prev.map(m => (m.id === modId ? { ...m, amount } : m))
    );
  };
  
  const toggleModulation = (modId) => {
    const mod = modulations.find(m => m.id === modId);
    if (!mod) return;
    
    const newEnabled = !mod.enabled;
    modulationMatrix.setModulationEnabled(modId, newEnabled);
    setModulations(prev =>
      prev.map(m => (m.id === modId ? { ...m, enabled: newEnabled } : m))
    );
  };
  
  const sources = [
    { id: 'lfo1', label: 'LFO 1', color: HAOS_COLORS.cyan },
    { id: 'lfo2', label: 'LFO 2', color: HAOS_COLORS.green },
    { id: 'lfo3', label: 'LFO 3', color: HAOS_COLORS.orange },
    { id: 'lfo4', label: 'LFO 4', color: HAOS_COLORS.purple },
    { id: 'envelope', label: 'ENVELOPE', color: HAOS_COLORS.gold },
    { id: 'velocity', label: 'VELOCITY', color: HAOS_COLORS.pink },
    { id: 'aftertouch', label: 'AFTERTOUCH', color: HAOS_COLORS.cyan },
    { id: 'modWheel', label: 'MOD WHEEL', color: HAOS_COLORS.green },
    { id: 'pitchBend', label: 'PITCH BEND', color: HAOS_COLORS.orange },
    { id: 'random', label: 'RANDOM', color: HAOS_COLORS.purple },
  ];
  
  const destinations = [
    { id: 'pitch', label: 'PITCH', icon: '🎵' },
    { id: 'volume', label: 'VOLUME', icon: '🔊' },
    { id: 'filterCutoff', label: 'FILTER CUTOFF', icon: '🔉' },
    { id: 'filterResonance', label: 'FILTER RES', icon: '🌊' },
    { id: 'pan', label: 'PAN', icon: '↔️' },
    { id: 'detune', label: 'DETUNE', icon: '🎚️' },
    { id: 'fmAmount', label: 'FM AMOUNT', icon: '🌀' },
    { id: 'phase', label: 'PHASE', icon: '〰️' },
    { id: 'noise', label: 'NOISE', icon: '📻' },
    { id: 'distortion', label: 'DISTORTION', icon: '⚡' },
    { id: 'delay', label: 'DELAY', icon: '🔄' },
    { id: 'reverb', label: 'REVERB', icon: '🏛️' },
    { id: 'chorus', label: 'CHORUS', icon: '🌈' },
    { id: 'phaser', label: 'PHASER', icon: '🌊' },
    { id: 'attack', label: 'ATTACK', icon: '📈' },
    { id: 'release', label: 'RELEASE', icon: '📉' },
  ];
  
  const waveforms = ['sine', 'triangle', 'square', 'saw', 'random'];
  
  const currentLFO = lfoStates[selectedLFO];
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#221100', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>MODULATION LAB</Text>
          <Text style={styles.subtitle}>VISUAL ROUTING MATRIX</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* LFO Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌊 LFO EDITOR</Text>
            <View style={styles.lfoSelector}>
              {lfoStates.map((lfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.lfoTab,
                    selectedLFO === index && styles.lfoTabActive,
                  ]}
                  onPress={() => setSelectedLFO(index)}
                >
                  <LinearGradient
                    colors={
                      selectedLFO === index
                        ? [HAOS_COLORS.gold, HAOS_COLORS.gold + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.lfoTabGradient}
                  >
                    <Text
                      style={[
                        styles.lfoTabLabel,
                        selectedLFO === index && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      LFO {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.lfoTabWaveform,
                        selectedLFO === index && { color: 'rgba(0,0,0,0.7)' },
                      ]}
                    >
                      {lfo.waveform.toUpperCase()}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* LFO Waveform Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>〰️ WAVEFORM</Text>
            <View style={styles.waveformSelector}>
              {waveforms.map((waveform) => (
                <TouchableOpacity
                  key={waveform}
                  style={[
                    styles.waveformButton,
                    currentLFO.waveform === waveform && styles.waveformButtonActive,
                  ]}
                  onPress={() => updateLFO(selectedLFO, 'waveform', waveform)}
                >
                  <Text
                    style={[
                      styles.waveformLabel,
                      currentLFO.waveform === waveform && styles.waveformLabelActive,
                    ]}
                  >
                    {waveform.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* LFO Parameters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎚️ LFO {selectedLFO + 1} PARAMETERS</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="RATE"
                value={currentLFO.rate}
                min={0.1}
                max={20}
                onChange={(val) => updateLFO(selectedLFO, 'rate', val)}
                color={HAOS_COLORS.gold}
                unit=" Hz"
              />
              <AnimatedKnob
                label="DEPTH"
                value={currentLFO.depth}
                min={0}
                max={1}
                onChange={(val) => updateLFO(selectedLFO, 'depth', val)}
                color={HAOS_COLORS.cyan}
              />
              <AnimatedKnob
                label="PHASE"
                value={currentLFO.phase}
                min={0}
                max={360}
                onChange={(val) => updateLFO(selectedLFO, 'phase', val)}
                color={HAOS_COLORS.purple}
                unit="°"
              />
            </View>
          </View>
          
          {/* Waveform Visualizer */}
          <View style={styles.section}>
            <View style={styles.waveformDisplay}>
              <LinearGradient
                colors={[HAOS_COLORS.darkGray, HAOS_COLORS.mediumGray]}
                style={styles.waveformGradient}
              >
                <Animated.View
                  style={[
                    styles.waveformPulse,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Text style={styles.waveformVisualIcon}>
                    {currentLFO.waveform === 'sine' && '〰️'}
                    {currentLFO.waveform === 'triangle' && '📐'}
                    {currentLFO.waveform === 'square' && '▭'}
                    {currentLFO.waveform === 'saw' && '📈'}
                    {currentLFO.waveform === 'random' && '🎲'}
                  </Text>
                </Animated.View>
                <Text style={styles.waveformVisualLabel}>
                  {currentLFO.waveform.toUpperCase()}
                </Text>
                <Text style={styles.waveformVisualRate}>
                  {currentLFO.rate.toFixed(2)} Hz
                </Text>
              </LinearGradient>
            </View>
          </View>
          
          {/* Modulation Routing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 CREATE ROUTING</Text>
            
            {/* Source Selector */}
            <Text style={styles.subsectionTitle}>SOURCE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceScroll}>
              {sources.map((source) => (
                <TouchableOpacity
                  key={source.id}
                  style={[
                    styles.sourceButton,
                    selectedSource === source.id && styles.sourceButtonActive,
                  ]}
                  onPress={() => setSelectedSource(source.id)}
                >
                  <LinearGradient
                    colors={
                      selectedSource === source.id
                        ? [source.color, source.color + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.sourceGradient}
                  >
                    <Text
                      style={[
                        styles.sourceLabel,
                        selectedSource === source.id && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {source.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Destination Selector */}
            <Text style={[styles.subsectionTitle, { marginTop: 20 }]}>DESTINATION</Text>
            <View style={styles.destinationGrid}>
              {destinations.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[
                    styles.destinationButton,
                    selectedDestination === dest.id && styles.destinationButtonActive,
                  ]}
                  onPress={() => setSelectedDestination(dest.id)}
                >
                  <LinearGradient
                    colors={
                      selectedDestination === dest.id
                        ? [HAOS_COLORS.gold, HAOS_COLORS.gold + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.destinationGradient}
                  >
                    <Text style={styles.destinationIcon}>{dest.icon}</Text>
                    <Text
                      style={[
                        styles.destinationLabel,
                        selectedDestination === dest.id && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {dest.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                (!selectedSource || !selectedDestination) && styles.addButtonDisabled,
              ]}
              onPress={addModulation}
              disabled={!selectedSource || !selectedDestination}
            >
              <LinearGradient
                colors={
                  selectedSource && selectedDestination
                    ? [HAOS_COLORS.green, HAOS_COLORS.green + '80']
                    : [HAOS_COLORS.darkGray, HAOS_COLORS.darkGray]
                }
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>
                  ➕ ADD MODULATION ROUTING
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Active Modulations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ ACTIVE ROUTINGS ({modulations.length})</Text>
            {modulations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No active modulations</Text>
                <Text style={styles.emptyStateSubtext}>Select source & destination to create routing</Text>
              </View>
            ) : (
              modulations.map((mod) => {
                const source = sources.find(s => s.id === mod.source);
                const dest = destinations.find(d => d.id === mod.destination);
                
                return (
                  <View key={mod.id} style={styles.modulationCard}>
                    <LinearGradient
                      colors={[HAOS_COLORS.darkGray, HAOS_COLORS.mediumGray]}
                      style={styles.modulationGradient}
                    >
                      <View style={styles.modulationHeader}>
                        <View style={styles.modulationLabels}>
                          <Text style={[styles.modulationSource, { color: source?.color || HAOS_COLORS.cyan }]}>
                            {source?.label || mod.source}
                          </Text>
                          <Text style={styles.modulationArrow}>→</Text>
                          <Text style={styles.modulationDestination}>
                            {dest?.icon} {dest?.label || mod.destination}
                          </Text>
                        </View>
                        <View style={styles.modulationControls}>
                          <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => toggleModulation(mod.id)}
                          >
                            <Text style={styles.toggleButtonText}>
                              {mod.enabled ? '✓' : '○'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => removeModulation(mod.id)}
                          >
                            <Text style={styles.deleteButtonText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.modulationSlider}>
                        <Text style={styles.modulationAmountLabel}>AMOUNT</Text>
                        <View style={styles.sliderContainer}>
                          <Text style={styles.sliderValue}>
                            {(mod.amount * 100).toFixed(0)}%
                          </Text>
                          {/* Simplified slider visual */}
                          <View style={styles.sliderTrack}>
                            <View
                              style={[
                                styles.sliderFill,
                                {
                                  width: `${mod.amount * 100}%`,
                                  backgroundColor: mod.enabled ? HAOS_COLORS.gold : HAOS_COLORS.darkGray,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })
            )}
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
    color: HAOS_COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
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
    color: HAOS_COLORS.gold,
    marginBottom: 15,
    letterSpacing: 1,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
    marginBottom: 10,
    letterSpacing: 1,
  },
  lfoSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lfoTab: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  lfoTabActive: {
    elevation: 5,
    shadowColor: HAOS_COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  lfoTabGradient: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  lfoTabLabel: {
    color: HAOS_COLORS.gold,
    fontWeight: 'bold',
    fontSize: 13,
  },
  lfoTabWaveform: {
    color: HAOS_COLORS.cyan,
    fontSize: 10,
    marginTop: 4,
  },
  waveformSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waveformButton: {
    flex: 1,
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold + '40',
  },
  waveformButtonActive: {
    backgroundColor: HAOS_COLORS.gold,
    borderColor: HAOS_COLORS.gold,
  },
  waveformLabel: {
    color: HAOS_COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  waveformLabelActive: {
    color: HAOS_COLORS.dark,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  waveformDisplay: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  waveformGradient: {
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold + '40',
  },
  waveformPulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformVisualIcon: {
    fontSize: 60,
  },
  waveformVisualLabel: {
    color: HAOS_COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  waveformVisualRate: {
    color: HAOS_COLORS.cyan,
    fontSize: 14,
    marginTop: 5,
  },
  sourceScroll: {
    marginBottom: 15,
  },
  sourceButton: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sourceButtonActive: {
    elevation: 3,
  },
  sourceGradient: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  sourceLabel: {
    color: HAOS_COLORS.gold,
    fontWeight: 'bold',
    fontSize: 12,
  },
  destinationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  destinationButton: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  destinationButtonActive: {
    elevation: 3,
  },
  destinationGradient: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  destinationIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  destinationLabel: {
    color: HAOS_COLORS.gold,
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: HAOS_COLORS.dark,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    color: HAOS_COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
    marginTop: 8,
  },
  modulationCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modulationGradient: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold + '40',
  },
  modulationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modulationLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modulationSource: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  modulationArrow: {
    color: HAOS_COLORS.cyan,
    marginHorizontal: 8,
    fontSize: 16,
  },
  modulationDestination: {
    color: HAOS_COLORS.gold,
    fontSize: 13,
  },
  modulationControls: {
    flexDirection: 'row',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HAOS_COLORS.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  toggleButtonText: {
    color: HAOS_COLORS.green,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HAOS_COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: HAOS_COLORS.dark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modulationSlider: {
    marginTop: 8,
  },
  modulationAmountLabel: {
    color: HAOS_COLORS.cyan,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderValue: {
    color: HAOS_COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
    width: 50,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ModulationLabScreen;
