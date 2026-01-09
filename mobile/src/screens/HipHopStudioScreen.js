/**
 * HAOS.fm Hip-Hop Studio Screen (Minimal MVP)
 * Fast prototype with: TR-808 drums, bass presets, 16-step sequencer, mixer
 * Full version will add: lead/pad synths, effects, pattern chaining, save/load
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
} from 'react-native';

import hipHopWorkspace from '../engine/HipHopWorkspace';
import sequencerEngine from '../engine/SequencerEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STEP_SIZE = Math.floor((SCREEN_WIDTH - 40) / 16) - 2;

// HAOS Professional Theme
const COLORS = {
  background: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1a1a1a',
  primary: '#9b4dff',
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
};

// Track configuration
const TRACKS = [
  { id: 'kick', name: 'KICK', color: '#ff3366' },
  { id: 'snare', name: 'SNARE', color: '#ff9933' },
  { id: 'hihat', name: 'HIHAT', color: '#ffcc00' },
  { id: 'bass', name: 'BASS', color: '#00ccff' },
];

// Bass notes (C1-C3)
const BASS_NOTES = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
                    'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2'];

// Bass presets
const BASS_PRESETS = [
  { id: 'bass_808', name: '📻 808 BASS', emoji: '📻' },
  { id: 'bass_sub', name: '💎 SUB BASS', emoji: '💎' },
  { id: 'bass_reese', name: '🌊 REESE', emoji: '🌊' },
  { id: 'bass_acid', name: '🧪 ACID', emoji: '🧪' },
  { id: 'bass_wobble', name: '〰️ WOBBLE', emoji: '〰️' },
];

const HipHopStudioScreen = ({ navigation }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [currentBar, setCurrentBar] = useState(1);
  const [bpm, setBpm] = useState(90);
  const [pattern, setPattern] = useState({});
  const [selectedBassPreset, setSelectedBassPreset] = useState('bass_808');
  const [bassNotes, setBassNotes] = useState(new Array(16).fill(null));
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  
  // Mixer volumes
  const [volumes, setVolumes] = useState({
    kick: 1.0,
    snare: 0.85,
    hihat: 0.65,
    bass: 0.9,
    master: 0.85,
  });
  
  const initAttempted = useRef(false);

  /**
   * Initialize workspace
   */
  useEffect(() => {
    const initialize = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      
      try {
        console.log('🎤 Initializing Hip-Hop Studio...');
        const success = await hipHopWorkspace.init();
        
        if (success) {
          setIsInitialized(true);
          refreshPattern();
          setupCallbacks();
          console.log('✅ Hip-Hop Studio ready');
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
      hipHopWorkspace.cleanup();
    };
  }, []);

  /**
   * Setup callbacks
   */
  const setupCallbacks = () => {
    hipHopWorkspace.onStepChange = (step, bar) => {
      setCurrentStep(step);
      setCurrentBar(bar);
    };
    
    hipHopWorkspace.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };
  };

  /**
   * Refresh pattern from sequencer
   */
  const refreshPattern = () => {
    const currentPattern = sequencerEngine.getPattern('A');
    setPattern(currentPattern || {});
  };

  /**
   * Toggle step
   */
  const toggleStep = useCallback((track, step) => {
    sequencerEngine.toggleStep('A', track, step);
    refreshPattern();
  }, []);

  /**
   * Toggle bass note
   */
  const toggleBassNote = useCallback((step) => {
    const newNotes = [...bassNotes];
    if (newNotes[step]) {
      newNotes[step] = null;
      sequencerEngine.clearStep('A', 'bass', step);
    } else {
      newNotes[step] = 'C2';
      sequencerEngine.addStep('A', 'bass', step, { velocity: 1.0, note: 'C2' });
    }
    setBassNotes(newNotes);
    refreshPattern();
  }, [bassNotes]);

  /**
   * Change BPM
   */
  const changeBPM = useCallback((delta) => {
    const newBpm = Math.min(200, Math.max(60, bpm + delta));
    setBpm(newBpm);
    hipHopWorkspace.setBpm(newBpm);
  }, [bpm]);

  /**
   * Play/Stop
   */
  const togglePlayback = useCallback(() => {
    if (!isInitialized) return;
    
    if (isPlaying) {
      hipHopWorkspace.stop();
    } else {
      hipHopWorkspace.play();
    }
  }, [isPlaying, isInitialized]);

  /**
   * Change bass preset
   */
  const changeBassPreset = useCallback((presetId) => {
    setSelectedBassPreset(presetId);
    hipHopWorkspace.setBassPreset(presetId);
  }, []);

  /**
   * Change volume
   */
  const changeVolume = useCallback((track, delta) => {
    setVolumes(prev => {
      const newVolume = Math.min(1.0, Math.max(0.0, prev[track] + delta));
      const newVolumes = { ...prev, [track]: newVolume };
      hipHopWorkspace.setChannelVolume(track, newVolume);
      return newVolumes;
    });
  }, []);

  // Render loading state
  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {initError ? `❌ ${initError}` : '🎤 Initializing Hip-Hop Studio...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎤 HIP-HOP STUDIO</Text>
        <Text style={styles.headerSubtitle}>Pattern A • Bar {currentBar}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Transport */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSPORT</Text>
          <View style={styles.transportRow}>
            <TouchableOpacity 
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={togglePlayback}
            >
              <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            
            <View style={styles.bpmControl}>
              <TouchableOpacity style={styles.bpmButton} onPress={() => changeBPM(-1)}>
                <Text style={styles.bpmButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmValue}>{bpm}</Text>
                <Text style={styles.bpmLabel}>BPM</Text>
              </View>
              <TouchableOpacity style={styles.bpmButton} onPress={() => changeBPM(1)}>
                <Text style={styles.bpmButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sequencer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16-STEP SEQUENCER</Text>
          {TRACKS.map((track) => (
            <View key={track.id} style={styles.trackRow}>
              <Text style={[styles.trackLabel, { color: track.color }]}>{track.name}</Text>
              <View style={styles.stepsRow}>
                {Array.from({ length: 16 }).map((_, step) => {
                  const isActive = pattern[track.id]?.[step];
                  const isCurrent = step === currentStep;
                  
                  return (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.step,
                        isActive && styles.stepActive,
                        isCurrent && styles.stepCurrent,
                        isActive && isCurrent && styles.stepActiveCurrent,
                      ]}
                      onPress={() => toggleStep(track.id, step)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Bass Preset Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BASS SYNTH</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {BASS_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  selectedBassPreset === preset.id && styles.presetButtonActive
                ]}
                onPress={() => changeBassPreset(preset.id)}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mixer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MIXER</Text>
          <View style={styles.mixerRow}>
            {Object.entries(volumes).map(([track, volume]) => (
              <View key={track} style={styles.mixerChannel}>
                <Text style={styles.mixerLabel}>{track.toUpperCase()}</Text>
                <View style={styles.faderContainer}>
                  <TouchableOpacity 
                    style={styles.faderButton}
                    onPress={() => changeVolume(track, 0.1)}
                  >
                    <Text style={styles.faderButtonText}>+</Text>
                  </TouchableOpacity>
                  <View style={styles.fader}>
                    <View style={[styles.faderFill, { height: `${volume * 100}%` }]} />
                  </View>
                  <TouchableOpacity 
                    style={styles.faderButton}
                    onPress={() => changeVolume(track, -0.1)}
                  >
                    <Text style={styles.faderButtonText}>-</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.mixerValue}>{Math.round(volume * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  backButton: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  sectionTitle: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.accentOrange,
  },
  playButtonText: {
    fontSize: 24,
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  bpmDisplay: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bpmValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
  },
  bpmLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackLabel: {
    width: 60,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stepsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  step: {
    width: STEP_SIZE,
    height: 32,
    backgroundColor: COLORS.stepInactive,
    borderRadius: 4,
  },
  stepActive: {
    backgroundColor: COLORS.stepActive,
  },
  stepCurrent: {
    borderWidth: 2,
    borderColor: COLORS.stepCurrent,
  },
  stepActiveCurrent: {
    backgroundColor: COLORS.stepCurrent,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetButton: {
    padding: 12,
    marginRight: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
    minWidth: 100,
    alignItems: 'center',
  },
  presetButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  presetEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  presetName: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '600',
  },
  mixerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mixerChannel: {
    flex: 1,
    alignItems: 'center',
  },
  mixerLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  faderContainer: {
    alignItems: 'center',
    gap: 8,
  },
  faderButton: {
    width: 32,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faderButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  fader: {
    width: 40,
    height: 120,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  faderFill: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  mixerValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default HipHopStudioScreen;
