/**
 * HAOS.fm Behringer TD-3 - Enhanced Acid Bass Synthesizer
 * Modern clone of Roland TB-303 with additional features
 * HAOS Themed Design
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
  StatusBar,
  Switch,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import HAOSHeader from '../components/HAOSHeader';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';
import TB303Bridge from '../synths/TB303Bridge';
import webAudioBridge from '../services/WebAudioBridge';

const td3 = new TB303Bridge();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// TD-3 specific features beyond TB-303
const WAVEFORMS = ['sawtooth', 'square', 'pulse'];
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = ['1', '2', '3', '4'];

// Acid presets
const PRESETS = {
  'Classic Acid': {
    waveform: 'sawtooth',
    cutoff: 65,
    resonance: 75,
    envMod: 80,
    decay: 40,
    accent: 30,
    tempo: 130,
  },
  'Squelchy': {
    waveform: 'square',
    cutoff: 45,
    resonance: 85,
    envMod: 90,
    decay: 25,
    accent: 50,
    tempo: 128,
  },
  'Deep Bass': {
    waveform: 'sawtooth',
    cutoff: 35,
    resonance: 40,
    envMod: 20,
    decay: 60,
    accent: 20,
    tempo: 120,
  },
  'Funky': {
    waveform: 'pulse',
    cutoff: 70,
    resonance: 60,
    envMod: 65,
    decay: 35,
    accent: 40,
    tempo: 110,
  },
  'Aggressive': {
    waveform: 'square',
    cutoff: 80,
    resonance: 95,
    envMod: 95,
    decay: 20,
    accent: 70,
    tempo: 140,
  },
};

const TD3Screen = ({ navigation }) => {
  // VCO
  const [waveform, setWaveform] = useState('sawtooth');
  const [tuning, setTuning] = useState(0);
  
  // VCF
  const [cutoff, setCutoff] = useState(60);
  const [resonance, setResonance] = useState(50);
  const [envMod, setEnvMod] = useState(50);
  const [decay, setDecay] = useState(50);
  const [accent, setAccent] = useState(30);
  
  // Sequencer
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState('A');
  
  // Pattern (16 steps)
  const [pattern, setPattern] = useState({
    notes: Array(16).fill('C2'),
    octaves: Array(16).fill(2),
    accents: Array(16).fill(false),
    slides: Array(16).fill(false),
    active: Array(16).fill(false),
  });
  
  // TD-3 specific enhancements
  const [distortion, setDistortion] = useState(0);
  const [filterType, setFilterType] = useState('lowpass'); // lowpass, highpass, bandpass
  const [vcaMod, setVcaMod] = useState(100); // VCA envelope amount
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  
  // Refs
  const scheduleAheadTime = useRef(0.1);
  const nextNoteTime = useRef(0.0);
  const timerID = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    td3.init().then(() => {
      console.log('✅ TD-3 initialized');
    });

    return () => {
      if (timerID.current) {
        clearTimeout(timerID.current);
      }
    };
  }, []);

  // Update parameters
  useEffect(() => {
    td3.setWaveform(waveform);
  }, [waveform]);

  useEffect(() => {
    const cutoffHz = 20 + (cutoff / 100) * 7980;
    td3.setCutoff(cutoffHz);
  }, [cutoff]);

  useEffect(() => {
    const resonanceQ = (resonance / 100) * 30;
    td3.setResonance(resonanceQ);
  }, [resonance]);

  useEffect(() => {
    const envModHz = (envMod / 100) * 5000;
    td3.setEnvMod(envModHz);
  }, [envMod]);

  useEffect(() => {
    const decayTime = (decay / 100) * 1.0;
    td3.setDecay(decayTime);
  }, [decay]);

  const toggleStep = (step) => {
    setPattern(prev => ({
      ...prev,
      active: prev.active.map((a, i) => i === step ? !a : a),
    }));
  };

  const toggleAccent = (step) => {
    setPattern(prev => ({
      ...prev,
      accents: prev.accents.map((a, i) => i === step ? !a : a),
    }));
  };

  const toggleSlide = (step) => {
    setPattern(prev => ({
      ...prev,
      slides: prev.slides.map((s, i) => i === step ? !s : s),
    }));
  };

  const setStepNote = (step, note, octave) => {
    setPattern(prev => ({
      ...prev,
      notes: prev.notes.map((n, i) => i === step ? `${note}${octave}` : n),
      octaves: prev.octaves.map((o, i) => i === step ? parseInt(octave) : o),
    }));
  };

  const playNote = (note, hasAccent = false, hasSlide = false) => {
    const velocity = hasAccent ? 1.0 : (accent / 100);
    td3.playNote(note, velocity, hasSlide ? 0.5 : 0.1);
    
    Haptics.impactAsync(
      hasAccent ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
  };

  const playSequence = () => {
    if (isPlaying) {
      if (timerID.current) {
        clearTimeout(timerID.current);
      }
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }

    setIsPlaying(true);
    nextNoteTime.current = Date.now() / 1000;
    scheduleNote();
  };

  const scheduleNote = () => {
    if (!isPlaying) return;

    const stepDuration = (60 / tempo) / 4;
    const currentTime = Date.now() / 1000;

    while (nextNoteTime.current < currentTime + scheduleAheadTime.current) {
      const step = currentStep;
      
      if (pattern.active[step]) {
        playNote(
          pattern.notes[step],
          pattern.accents[step],
          pattern.slides[step]
        );
      }
      
      setCurrentStep((prev) => (prev + 1) % 16);
      nextNoteTime.current += stepDuration;
    }

    timerID.current = setTimeout(scheduleNote, 25);
  };

  useEffect(() => {
    if (isPlaying) {
      const wasPlaying = isPlaying;
      setIsPlaying(false);
      if (timerID.current) clearTimeout(timerID.current);
      if (wasPlaying) {
        setTimeout(() => {
          setIsPlaying(true);
          nextNoteTime.current = Date.now() / 1000;
          scheduleNote();
        }, 10);
      }
    }
  }, [tempo]);

  const loadPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setWaveform(preset.waveform);
      setCutoff(preset.cutoff);
      setResonance(preset.resonance);
      setEnvMod(preset.envMod);
      setDecay(preset.decay);
      setAccent(preset.accent);
      setTempo(preset.tempo);
      console.log(`✅ Loaded ${presetName} preset`);
    }
  };

  const clearPattern = () => {
    setPattern({
      notes: Array(16).fill('C2'),
      octaves: Array(16).fill(2),
      accents: Array(16).fill(false),
      slides: Array(16).fill(false),
      active: Array(16).fill(false),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hidden WebView for Audio */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <WebView
          ref={(ref) => {
            if (ref && !webAudioBridge.isReady) {
              webAudioBridge.setWebViewRef(ref);
            }
          }}
          source={require('../../assets/audio-engine.html')}
          style={{ width: 1, height: 1, opacity: 0 }}
          onMessage={(event) => webAudioBridge.onMessage(event)}
          onLoad={() => webAudioBridge.initAudio()}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
        />
      </View>

      <HAOSHeader
        title="BEHRINGER TD-3"
        navigation={navigation}
        showBack={true}
        rightButtons={[
          {
            icon: '📋',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPresetModalVisible(true);
            },
          },
        ]}
      />

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ opacity: fadeAnim }}
      >
        {/* Transport */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRANSPORT</Text>
          </View>
          
          <View style={styles.transport}>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                playSequence();
              }}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <View style={styles.tempoContainer}>
              <Text style={styles.tempoLabel}>TEMPO</Text>
              <Text style={styles.tempoValue}>{tempo} BPM</Text>
              <Slider
                style={styles.tempoSlider}
                value={tempo}
                onValueChange={setTempo}
                minimumValue={60}
                maximumValue={200}
                step={1}
                minimumTrackTintColor={HAOS_COLORS.gold}
                maximumTrackTintColor={HAOS_COLORS.border}
                thumbTintColor={HAOS_COLORS.gold}
              />
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                clearPattern();
              }}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pattern Sequencer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>16-STEP PATTERN</Text>
            <Text style={styles.sectionSubtitle}>Tap: Active | Long: Accent | Swipe: Slide</Text>
          </View>

          <View style={styles.sequencer}>
            {Array.from({ length: 16 }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.step,
                  pattern.active[i] && styles.stepActive,
                  currentStep === i && isPlaying && styles.stepPlaying,
                  pattern.accents[i] && styles.stepAccent,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  toggleStep(i);
                }}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  toggleAccent(i);
                }}
              >
                <Text style={styles.stepNumber}>{i + 1}</Text>
                {pattern.slides[i] && (
                  <View style={styles.slideIndicator}>
                    <Text style={styles.slideText}>~</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* VCO - Oscillator */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>VCO - OSCILLATOR</Text>
          </View>

          <View style={styles.waveformSelector}>
            {WAVEFORMS.map(wave => (
              <TouchableOpacity
                key={wave}
                style={[styles.waveButton, waveform === wave && styles.waveButtonActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setWaveform(wave);
                }}
              >
                <Text style={[styles.waveButtonText, waveform === wave && styles.waveButtonTextActive]}>
                  {wave.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>TUNING: {tuning > 0 ? '+' : ''}{tuning}</Text>
            <Slider
              style={styles.slider}
              value={tuning}
              onValueChange={setTuning}
              minimumValue={-50}
              maximumValue={50}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.orange}
            />
          </View>
        </View>

        {/* VCF - Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>VCF - FILTER</Text>
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>CUTOFF: {cutoff}%</Text>
            <Slider
              style={styles.slider}
              value={cutoff}
              onValueChange={setCutoff}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.gold}
            />
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>RESONANCE: {resonance}%</Text>
            <Slider
              style={styles.slider}
              value={resonance}
              onValueChange={setResonance}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.gold}
            />
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>ENV MOD: {envMod}%</Text>
            <Slider
              style={styles.slider}
              value={envMod}
              onValueChange={setEnvMod}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.orange}
            />
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>DECAY: {decay}%</Text>
            <Slider
              style={styles.slider}
              value={decay}
              onValueChange={setDecay}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.orange}
            />
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>ACCENT: {accent}%</Text>
            <Slider
              style={styles.slider}
              value={accent}
              onValueChange={setAccent}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.silver}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.silver}
            />
          </View>
        </View>

        {/* TD-3 Enhanced Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TD-3 ENHANCEMENTS</Text>
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>DISTORTION: {distortion}%</Text>
            <Slider
              style={styles.slider}
              value={distortion}
              onValueChange={setDistortion}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.orange}
            />
          </View>

          <View style={styles.parameter}>
            <Text style={styles.paramLabel}>VCA MOD: {vcaMod}%</Text>
            <Slider
              style={styles.slider}
              value={vcaMod}
              onValueChange={setVcaMod}
              minimumValue={0}
              maximumValue={100}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.silver}
              maximumTrackTintColor={HAOS_COLORS.border}
              thumbTintColor={HAOS_COLORS.silver}
            />
          </View>
        </View>

        {/* Presets */}
        {presetModalVisible && (
          <View style={styles.presetsModal}>
            <View style={styles.presetsContent}>
              <Text style={styles.presetsTitle}>ACID PRESETS</Text>
              {Object.keys(PRESETS).map(name => (
                <TouchableOpacity
                  key={name}
                  style={styles.presetButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    loadPreset(name);
                    setPresetModalVisible(false);
                  }}
                >
                  <Text style={styles.presetButtonText}>{name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.presetButton, styles.closeButton]}
                onPress={() => setPresetModalVisible(false)}
              >
                <Text style={styles.presetButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: HAOS_COLORS.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: HAOS_COLORS.border,
  },
  sectionHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.border,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: HAOS_COLORS.textSecondary,
    marginTop: 4,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: HAOS_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HAOS_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
  },
  playButtonText: {
    fontSize: 28,
    color: '#000',
  },
  tempoContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  tempoLabel: {
    fontSize: 12,
    color: HAOS_COLORS.gold,
    fontWeight: '600',
  },
  tempoValue: {
    fontSize: 24,
    color: HAOS_COLORS.textPrimary,
    fontWeight: 'bold',
  },
  tempoSlider: {
    width: '100%',
    height: 40,
  },
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HAOS_COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 24,
    color: HAOS_COLORS.textPrimary,
  },
  sequencer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  step: {
    width: (SCREEN_WIDTH - 96) / 4,
    height: 60,
    borderRadius: 8,
    backgroundColor: HAOS_COLORS.background,
    borderWidth: 2,
    borderColor: HAOS_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepActive: {
    backgroundColor: HAOS_COLORS.gold + '33',
    borderColor: HAOS_COLORS.gold,
  },
  stepPlaying: {
    backgroundColor: HAOS_COLORS.orange,
    borderColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  stepAccent: {
    borderWidth: 3,
    borderColor: HAOS_COLORS.orange,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.textPrimary,
  },
  slideIndicator: {
    position: 'absolute',
    top: 2,
    right: 4,
  },
  slideText: {
    fontSize: 20,
    color: HAOS_COLORS.silver,
  },
  waveformSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  waveButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: HAOS_COLORS.background,
    borderWidth: 2,
    borderColor: HAOS_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    borderColor: HAOS_COLORS.orange,
  },
  waveButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: HAOS_COLORS.textSecondary,
  },
  waveButtonTextActive: {
    color: '#000',
  },
  parameter: {
    marginBottom: 16,
  },
  paramLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: HAOS_COLORS.textPrimary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  presetsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  presetsContent: {
    width: '100%',
    backgroundColor: HAOS_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
  },
  presetsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    textAlign: 'center',
    marginBottom: 24,
  },
  presetButton: {
    backgroundColor: HAOS_COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HAOS_COLORS.border,
  },
  closeButton: {
    backgroundColor: HAOS_COLORS.error,
    borderColor: HAOS_COLORS.error,
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default TD3Screen;
