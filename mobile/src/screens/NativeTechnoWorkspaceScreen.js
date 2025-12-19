/**
 * HAOS.fm Native Techno Workspace Screen
 * Full native implementation of the Techno production environment
 * Features: 16-step sequencer, TR-808/909, TB-303, transport controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';

import technoWorkspace from '../engine/TechnoWorkspace';
import sequencerEngine from '../engine/SequencerEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STEP_SIZE = Math.floor((SCREEN_WIDTH - 40) / 16) - 2;

// Theme colors matching HAOS Professional Theme
const COLORS = {
  background: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1a1a1a',
  primary: '#9b4dff',
  primaryDark: '#7a3dcc',
  accent: '#00ffcc',
  accentOrange: '#ff6600',
  text: '#ffffff',
  textDim: '#888888',
  red: '#ff3366',
  green: '#00ff88',
  yellow: '#ffcc00',
  stepActive: '#9b4dff',
  stepInactive: '#2a2a2a',
  stepCurrent: '#ff6600',
  border: '#333333',
};

// Track configuration
const TRACKS = [
  { id: 'kick', name: 'KICK', color: '#ff3366' },
  { id: 'snare', name: 'SNARE', color: '#ff9933' },
  { id: 'hihat', name: 'HIHAT', color: '#ffcc00' },
  { id: 'clap', name: 'CLAP', color: '#00ff88' },
  { id: 'bass', name: 'BASS', color: '#00ccff' },
];

const NativeTechnoWorkspaceScreen = ({ navigation }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentBar, setCurrentBar] = useState(1);
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [currentBank, setCurrentBank] = useState('A');
  const [drumMachine, setDrumMachine] = useState('808');
  const [bassSynth, setBassSynth] = useState('tb303'); // tb303, arp2600, td3
  const [pattern, setPattern] = useState({});
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  
  // Bass synth state
  const [bassNotes, setBassNotes] = useState(new Array(16).fill(null));
  const [selectedBassOctave, setSelectedBassOctave] = useState(2);
  
  // Refs
  const initAttempted = useRef(false);

  /**
   * Initialize workspace
   */
  useEffect(() => {
    const initialize = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      
      try {
        console.log('🎛️ Initializing Techno Workspace...');
        const success = await technoWorkspace.init();
        
        if (success) {
          setIsInitialized(true);
          refreshPattern();
          setupCallbacks();
          console.log('✅ Techno Workspace ready');
        } else {
          setInitError('Failed to initialize audio');
        }
      } catch (error) {
        console.error('Init error:', error);
        setInitError(error.message);
      }
    };
    
    initialize();
    
    return () => {
      technoWorkspace.stop();
    };
  }, []);

  /**
   * Setup workspace callbacks
   */
  const setupCallbacks = () => {
    technoWorkspace.onStepChange = (step, bar) => {
      setCurrentStep(step);
      setCurrentBar(bar);
    };
    
    technoWorkspace.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
      if (!playing) {
        setCurrentStep(-1);
      }
    };
  };

  /**
   * Refresh pattern from engine
   */
  const refreshPattern = useCallback(() => {
    const newPattern = {};
    TRACKS.forEach(track => {
      newPattern[track.id] = [];
      for (let i = 0; i < 16; i++) {
        const step = technoWorkspace.getStep(track.id, i);
        newPattern[track.id][i] = step?.active || false;
      }
    });
    setPattern(newPattern);
    setCurrentBank(sequencerEngine.currentBank);
  }, []);

  /**
   * Toggle a step
   */
  const handleToggleStep = useCallback((track, step) => {
    if (!isInitialized) return;
    
    // For bass track, assign a note (default C2)
    const note = track === 'bass' ? 'C2' : null;
    
    const isNowActive = technoWorkspace.toggleStep(track, step, note);
    
    // Preview the sound
    if (isNowActive) {
      if (track === 'bass') {
        technoWorkspace.previewBass(note);
      } else {
        technoWorkspace.previewDrum(track);
      }
    }
    
    // Update local state
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((active, i) => 
        i === step ? isNowActive : active
      ),
    }));
  }, [isInitialized]);

  /**
   * Play/Stop toggle
   */
  const handlePlayStop = useCallback(() => {
    if (isPlaying) {
      technoWorkspace.stop();
    } else {
      technoWorkspace.play();
    }
  }, [isPlaying]);

  /**
   * Change BPM
   */
  const handleBpmChange = useCallback((delta) => {
    const newBpm = Math.max(60, Math.min(200, bpm + delta));
    setBpm(newBpm);
    technoWorkspace.setBPM(newBpm);
  }, [bpm]);

  /**
   * Change swing
   */
  const handleSwingChange = useCallback((delta) => {
    const newSwing = Math.max(0, Math.min(100, swing + delta));
    setSwing(newSwing);
    technoWorkspace.setSwing(newSwing);
  }, [swing]);

  /**
   * Switch drum machine
   */
  const handleDrumMachineSwitch = useCallback(() => {
    const newDrumMachine = drumMachine === '808' ? '909' : '808';
    setDrumMachine(newDrumMachine);
    technoWorkspace.setDrumMachine(newDrumMachine);
  }, [drumMachine]);

  /**
   * Switch bass synthesizer
   */
  const handleBassSynthSwitch = useCallback(() => {
    const synthOrder = ['tb303', 'arp2600', 'td3'];
    const currentIndex = synthOrder.indexOf(bassSynth);
    const newSynth = synthOrder[(currentIndex + 1) % synthOrder.length];
    setBassSynth(newSynth);
    technoWorkspace.setBassSynth(newSynth);
  }, [bassSynth]);

  /**
   * Switch bank
   */
  const handleBankSwitch = useCallback((bank) => {
    technoWorkspace.switchBank(bank);
    setCurrentBank(bank);
    refreshPattern();
  }, [refreshPattern]);

  /**
   * Load preset
   */
  const handleLoadPreset = useCallback((presetName) => {
    technoWorkspace.loadPreset(presetName);
    setSelectedPreset(presetName);
    refreshPattern();
  }, [refreshPattern]);

  /**
   * Clear pattern
   */
  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear Pattern',
      `Clear bank ${currentBank}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            sequencerEngine.clearBank(currentBank);
            refreshPattern();
          }
        }
      ]
    );
  }, [currentBank, refreshPattern]);

  // Loading/Error states
  if (initError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Audio Error</Text>
          <Text style={styles.errorDetail}>{initError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              initAttempted.current = false;
              setInitError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>🎛️</Text>
          <Text style={styles.loadingText}>Initializing Audio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HAOS STUDIO</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.drumMachineButton}
            onPress={handleDrumMachineSwitch}
          >
            <Text style={styles.drumMachineText}>TR-{drumMachine}</Text>
            <Text style={styles.drumMachineSubtext}>
              {drumMachine === '808' ? 'warm' : 'hard'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bassSynthButton}
            onPress={handleBassSynthSwitch}
          >
            <Text style={styles.bassSynthText}>
              {bassSynth === 'tb303' ? '303' : bassSynth === 'arp2600' ? 'ARP' : 'TD3'}
            </Text>
            <Text style={styles.bassSynthSubtext}>
              {bassSynth === 'tb303' ? 'classic' : bassSynth === 'arp2600' ? 'modular' : 'aggressive'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Transport Controls */}
        <View style={styles.transportSection}>
          <TouchableOpacity 
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlayStop}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '■' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {/* BPM Control */}
          <View style={styles.paramControl}>
            <TouchableOpacity 
              style={styles.paramButton}
              onPress={() => handleBpmChange(-5)}
            >
              <Text style={styles.paramButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.paramValue}>
              <Text style={styles.paramLabel}>BPM</Text>
              <Text style={styles.paramNumber}>{bpm}</Text>
            </View>
            <TouchableOpacity 
              style={styles.paramButton}
              onPress={() => handleBpmChange(5)}
            >
              <Text style={styles.paramButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {/* Swing Control */}
          <View style={styles.paramControl}>
            <TouchableOpacity 
              style={styles.paramButton}
              onPress={() => handleSwingChange(-10)}
            >
              <Text style={styles.paramButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.paramValue}>
              <Text style={styles.paramLabel}>SWING</Text>
              <Text style={styles.paramNumber}>{swing}%</Text>
            </View>
            <TouchableOpacity 
              style={styles.paramButton}
              onPress={() => handleSwingChange(10)}
            >
              <Text style={styles.paramButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bank Selector */}
        <View style={styles.bankSection}>
          {['A', 'B', 'C', 'D'].map(bank => (
            <TouchableOpacity
              key={bank}
              style={[
                styles.bankButton,
                currentBank === bank && styles.bankButtonActive
              ]}
              onPress={() => handleBankSwitch(bank)}
            >
              <Text style={[
                styles.bankButtonText,
                currentBank === bank && styles.bankButtonTextActive
              ]}>
                {bank}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>CLR</Text>
          </TouchableOpacity>
        </View>

        {/* Step Sequencer Grid */}
        <View style={styles.sequencerSection}>
          {/* Step numbers */}
          <View style={styles.stepNumbers}>
            <View style={styles.trackLabel} />
            {[...Array(16)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.stepNumber,
                  currentStep === i && styles.stepNumberCurrent
                ]}
              >
                <Text style={[
                  styles.stepNumberText,
                  currentStep === i && styles.stepNumberTextCurrent
                ]}>
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>

          {/* Track rows */}
          {TRACKS.map(track => (
            <View key={track.id} style={styles.trackRow}>
              <TouchableOpacity 
                style={styles.trackLabel}
                onPress={() => technoWorkspace.previewDrum(track.id)}
              >
                <Text style={[styles.trackLabelText, { color: track.color }]}>
                  {track.name}
                </Text>
              </TouchableOpacity>
              
              {[...Array(16)].map((_, step) => {
                const isActive = pattern[track.id]?.[step] || false;
                const isCurrent = currentStep === step;
                
                return (
                  <TouchableOpacity
                    key={step}
                    style={[
                      styles.step,
                      isActive && [styles.stepActive, { backgroundColor: track.color }],
                      isCurrent && styles.stepCurrent,
                      step % 4 === 0 && styles.stepBeat,
                    ]}
                    onPress={() => handleToggleStep(track.id, step)}
                    activeOpacity={0.7}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Preset Section */}
        <View style={styles.presetSection}>
          <Text style={styles.sectionTitle}>PRESETS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.presetScroll}
          >
            {technoWorkspace.getPresets().map(preset => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  selectedPreset === preset && styles.presetButtonActive
                ]}
                onPress={() => handleLoadPreset(preset)}
              >
                <Text style={[
                  styles.presetButtonText,
                  selectedPreset === preset && styles.presetButtonTextActive
                ]}>
                  {preset.toUpperCase().replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, isPlaying && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isPlaying ? 'PLAYING' : 'STOPPED'}
            </Text>
          </View>
          <Text style={styles.statusText}>
            BAR: {currentBar}
          </Text>
          <Text style={styles.statusText}>
            STEP: {currentStep >= 0 ? currentStep + 1 : '-'}/16
          </Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 24,
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  drumMachineButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accentOrange,
  },
  drumMachineText: {
    color: COLORS.accentOrange,
    fontSize: 12,
    fontWeight: 'bold',
  },
  drumMachineSubtext: {
    color: COLORS.accentOrange,
    fontSize: 8,
    opacity: 0.7,
    marginTop: 2,
  },
  bassSynthButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  bassSynthText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bassSynthSubtext: {
    color: COLORS.accent,
    fontSize: 8,
    opacity: 0.7,
    marginTop: 2,
  },
  
  content: {
    flex: 1,
  },
  
  // Transport
  transportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.red,
  },
  playButtonText: {
    color: COLORS.background,
    fontSize: 28,
    fontWeight: 'bold',
  },
  paramControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paramButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  paramValue: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 60,
  },
  paramLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
  },
  paramNumber: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Banks
  bankSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  bankButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bankButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bankButtonText: {
    color: COLORS.textDim,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bankButtonTextActive: {
    color: COLORS.text,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  clearButtonText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Sequencer
  sequencerSection: {
    padding: 8,
  },
  stepNumbers: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  trackLabel: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    width: STEP_SIZE,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  stepNumberCurrent: {
    backgroundColor: COLORS.stepCurrent,
    borderRadius: 2,
  },
  stepNumberText: {
    color: COLORS.textDim,
    fontSize: 8,
  },
  stepNumberTextCurrent: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  trackRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  trackLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  step: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    backgroundColor: COLORS.stepInactive,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  stepActive: {
    backgroundColor: COLORS.stepActive,
  },
  stepCurrent: {
    borderWidth: 2,
    borderColor: COLORS.stepCurrent,
  },
  stepBeat: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  
  // Presets
  presetSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 2,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  presetScroll: {
    paddingHorizontal: 12,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetButtonText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  presetButtonTextActive: {
    color: COLORS.text,
  },
  
  // Status
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDim,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: COLORS.green,
  },
  statusText: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 1,
  },
  
  // Loading/Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetail: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NativeTechnoWorkspaceScreen;
