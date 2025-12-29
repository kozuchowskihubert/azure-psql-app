/**
 * HAOS.fm TR-808 Drum Machine
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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

// HAOS Components & Theme
import HAOSHeader from '../components/HAOSHeader';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';

// Design System & Components (Legacy)
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, commonStyles } from '../styles/SynthDesignSystem';
import SynthSection from '../components/SynthSection';
import SynthSlider from '../components/SynthSlider';
import ParameterGroup from '../components/ParameterGroup';

// Services & Bridges
import tr808Bridge from '../drums/TR808Bridge';
import webAudioBridge from '../services/WebAudioBridge';

const { width } = Dimensions.get('window');

const DRUMS = [
  { id: 'kick', label: 'BASS DRUM', color: HAOS_COLORS.gold },
  { id: 'snare', label: 'SNARE', color: HAOS_COLORS.gold },
  { id: 'hihat', label: 'CLOSED HH', color: HAOS_COLORS.orange },
  { id: 'clap', label: 'HAND CLAP', color: HAOS_COLORS.silver },
  { id: 'rimshot', label: 'RIM SHOT', color: HAOS_COLORS.silver },
  { id: 'cowbell', label: 'COWBELL', color: HAOS_COLORS.orange },
  { id: 'cymbal', label: 'CYMBAL', color: HAOS_COLORS.orange },
  { id: 'tom', label: 'LOW TOM', color: HAOS_COLORS.gold },
];

const PRESETS = {
  'Basic': {
    bpm: 120,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      rimshot: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cymbal: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  'Hip Hop': {
    bpm: 90,
    pattern: {
      kick: [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      rimshot: [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
      cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cymbal: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,1,0,0, 0,0,0,0],
    },
  },
  'Electro': {
    bpm: 110,
    pattern: {
      kick: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      rimshot: [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0],
      cowbell: [0,1,0,0, 0,1,0,0, 0,1,0,0, 0,1,0,0],
      cymbal: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,1,0],
    },
  },
  'House': {
    bpm: 128,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      rimshot: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cymbal: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  'Techno': {
    bpm: 135,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1],
      hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      rimshot: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cymbal: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    },
  },
  'Breaks': {
    bpm: 160,
    pattern: {
      kick: [1,0,0,0, 0,0,1,0, 0,1,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,1, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0],
      clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      rimshot: [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
      cowbell: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      cymbal: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    },
  },
};

const TR808Screen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [pattern, setPattern] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
    rimshot: Array(16).fill(false),
    cowbell: Array(16).fill(false),
    cymbal: Array(16).fill(false),
    tom: Array(16).fill(false),
  });
  
  const [levels, setLevels] = useState({
    kick: 1.0,
    snare: 0.9,
    hihat: 0.7,
    clap: 0.8,
    rimshot: 0.6,
    cowbell: 0.5,
    cymbal: 0.6,
    tom: 0.7,
  });

  // Sound parameters
  const [kickPitch, setKickPitch] = useState(150);
  const [kickDecay, setKickDecay] = useState(0.3);
  const [snareTone, setSnareTone] = useState(0.2);
  const [hihatDecay, setHihatDecay] = useState(0.05);

  const intervalRef = useRef(null);
  const scheduleAheadTime = useRef(0.1); // How far ahead to schedule audio (100ms)
  const nextNoteTime = useRef(0.0); // When the next note is due
  const timerID = useRef(null);
  const ledAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeDrums();
    startLedAnimation();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerID.current) {
        clearTimeout(timerID.current);
      }
    };
  }, []);

  const initializeDrums = async () => {
    try {
      await tr808Bridge.init();
      console.log('✅ TR-808 initialized');
    } catch (error) {
      console.error('❌ TR-808 init failed:', error);
    }
  };

  const startLedAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ledAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ledAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const toggleStep = (instrument, step) => {
    setPattern(prev => ({
      ...prev,
      [instrument]: prev[instrument].map((active, i) => 
        i === step ? !active : active
      ),
    }));
  };

  const playDrum = (drum, velocity = 1.0) => {
    if (tr808Bridge && tr808Bridge[`play${drum.charAt(0).toUpperCase() + drum.slice(1)}`]) {
      tr808Bridge[`play${drum.charAt(0).toUpperCase() + drum.slice(1)}`](velocity);
      console.log(`🥁 Playing ${drum} @ ${Math.round(velocity * 100)}%`);
    }
  };

  const playSequence = async () => {
    if (isPlaying) {
      // Stop playback
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerID.current) {
        clearTimeout(timerID.current);
      }
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }

    // Start playback with accurate scheduling
    setIsPlaying(true);
    nextNoteTime.current = Date.now() / 1000; // Convert to seconds
    scheduleNote();
  };

  const scheduleNote = () => {
    if (!isPlaying) return;

    const stepDuration = (60 / bpm) / 4; // Duration of 16th note in seconds
    const currentTime = Date.now() / 1000;

    // Schedule notes that need to play in the next 100ms
    while (nextNoteTime.current < currentTime + scheduleAheadTime.current) {
      const step = currentStep;
      
      // Schedule audio playback
      DRUMS.forEach(({ id }) => {
        if (pattern[id][step]) {
          playDrum(id, levels[id]);
        }
      });
      
      // Update visual step indicator
      setCurrentStep((prev) => (prev + 1) % 16);
      
      // Calculate next note time
      nextNoteTime.current += stepDuration;
    }

    // Schedule next scheduling call (every 25ms for smooth updates)
    timerID.current = setTimeout(scheduleNote, 25);
  };

  // Update playSequence to use new scheduler when BPM changes
  useEffect(() => {
    if (isPlaying) {
      // Restart with new BPM
      const wasPlaying = isPlaying;
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerID.current) {
        clearTimeout(timerID.current);
      }
      if (wasPlaying) {
        setTimeout(() => {
          setIsPlaying(true);
          nextNoteTime.current = Date.now() / 1000;
          scheduleNote();
        }, 10);
      }
    }
  }, [bpm]);

  const loadPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    if (preset.bpm) {
      setBpm(preset.bpm);
    }
    
    const patternData = preset.pattern || preset;
    const newPattern = {};
    Object.keys(patternData).forEach(instrument => {
      if (Array.isArray(patternData[instrument])) {
        newPattern[instrument] = patternData[instrument].map(v => v === 1);
      }
    });
    setPattern(newPattern);
    console.log(`🥁 Loaded preset: ${presetName}`);
  };

  const clearPattern = () => {
    setPattern({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
      rimshot: Array(16).fill(false),
      cowbell: Array(16).fill(false),
      cymbal: Array(16).fill(false),
      tom: Array(16).fill(false),
    });
  };

  const updateLevel = (drum, value) => {
    setLevels(prev => ({
      ...prev,
      [drum]: value,
    }));
  };

  const renderStepButton = (instrument, step) => {
    const isActive = pattern[instrument][step];
    const isCurrent = step === currentStep && isPlaying;
    
    return (
      <TouchableOpacity
        key={`${instrument}-${step}`}
        style={[
          styles.stepButton,
          isActive && styles.stepButtonActive,
          isCurrent && styles.stepButtonCurrent,
          isActive && isCurrent && styles.stepButtonPlaying,
        ]}
        onPress={() => toggleStep(instrument, step)}
      >
        {isActive && (
          <View
            style={[
              styles.velocityBar,
              {
                height: `${levels[instrument] * 100}%`,
                backgroundColor: isCurrent ? COLORS.primary : COLORS.accent,
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hidden WebView */}
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
        title="TR-808"
        navigation={navigation}
        showBack={true}
        rightButtons={[
          {
            icon: '🥁',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
          },
        ]}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transport Controls */}
        <SynthSection title="TRANSPORT" icon="⏯️" subtitle="Tempo control & sequencer transport">
          <View style={styles.transportRow}>
            {/* BPM Display */}
            <View style={styles.bpmContainer}>
              <Text style={styles.bpmLabel}>TEMPO</Text>
              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmText}>{bpm}</Text>
                {isPlaying && (
                  <Animated.View
                    style={[
                      styles.tempoPulse,
                      { opacity: ledAnim },
                    ]}
                  />
                )}
              </View>
              <View style={styles.bpmButtons}>
                <TouchableOpacity
                  style={styles.bpmButton}
                  onPress={() => setBpm(Math.max(40, bpm - 5))}
                >
                  <Text style={styles.bpmButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bpmButton}
                  onPress={() => setBpm(Math.min(240, bpm + 5))}
                >
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Play/Stop Button */}
            <TouchableOpacity
              style={[styles.mainButton, isPlaying && styles.mainButtonActive]}
              onPress={playSequence}
            >
              <Text style={styles.mainButtonText}>
                {isPlaying ? '■' : '▶'}
              </Text>
              <Text style={styles.mainButtonLabel}>
                {isPlaying ? 'STOP' : 'START'}
              </Text>
            </TouchableOpacity>

            {/* Clear Button */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearPattern}
            >
              <Text style={styles.clearButtonText}>✕</Text>
              <Text style={styles.clearButtonLabel}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </SynthSection>

        {/* Sound Parameters */}
        <SynthSection title="SOUND PARAMETERS" icon="🎛️" subtitle="Tune each drum voice">
          <View style={styles.parameterGrid}>
            {/* Kick Parameters */}
            <View style={styles.parameterSection}>
              <Text style={styles.parameterTitle}>KICK DRUM</Text>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Pitch: {kickPitch}Hz</Text>
                <Slider
                  style={styles.parameterSlider}
                  minimumValue={50}
                  maximumValue={300}
                  value={kickPitch}
                  onValueChange={(val) => {
                    setKickPitch(Math.round(val));
                    tr808Bridge.setKickPitch(Math.round(val));
                  }}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.inactive}
                  thumbTintColor={COLORS.accent}
                />
              </View>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Decay: {kickDecay.toFixed(2)}s</Text>
                <Slider
                  style={styles.parameterSlider}
                  minimumValue={0.1}
                  maximumValue={1.0}
                  value={kickDecay}
                  onValueChange={(val) => {
                    setKickDecay(val);
                    tr808Bridge.setKickDecay(val);
                  }}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.inactive}
                  thumbTintColor={COLORS.accent}
                />
              </View>
            </View>

            {/* Snare Parameters */}
            <View style={styles.parameterSection}>
              <Text style={styles.parameterTitle}>SNARE DRUM</Text>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Tone: {(snareTone * 100).toFixed(0)}%</Text>
                <Slider
                  style={styles.parameterSlider}
                  minimumValue={0}
                  maximumValue={1}
                  value={snareTone}
                  onValueChange={(val) => {
                    setSnareTone(val);
                    tr808Bridge.setSnareTone(val);
                  }}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.inactive}
                  thumbTintColor={COLORS.accent}
                />
              </View>
            </View>

            {/* Hi-hat Parameters */}
            <View style={styles.parameterSection}>
              <Text style={styles.parameterTitle}>HI-HAT</Text>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Decay: {(hihatDecay * 1000).toFixed(0)}ms</Text>
                <Slider
                  style={styles.parameterSlider}
                  minimumValue={0.02}
                  maximumValue={0.2}
                  value={hihatDecay}
                  onValueChange={(val) => {
                    setHihatDecay(val);
                    tr808Bridge.setHihatDecay(val);
                  }}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.inactive}
                  thumbTintColor={COLORS.accent}
                />
              </View>
            </View>
          </View>
        </SynthSection>

        {/* Presets */}
        <SynthSection title="PATTERNS" icon="🎵" subtitle="Classic 808 grooves">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {Object.keys(PRESETS).map((presetName) => (
              <TouchableOpacity
                key={presetName}
                style={styles.presetButton}
                onPress={() => loadPreset(presetName)}
              >
                <Text style={styles.presetButtonText}>{presetName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SynthSection>

        {/* Sequencer Grid */}
        <SynthSection title="SEQUENCER" icon="🎹" subtitle="16-step pattern editor">
          {/* Step Numbers */}
          <View style={styles.stepNumbers}>
            <View style={styles.instrumentLabelSpace} />
            {Array(16).fill(0).map((_, i) => (
              <View key={i} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
            ))}
          </View>

          {/* Instrument Rows */}
          {DRUMS.map(({ id, label, color }) => (
            <View key={id} style={styles.instrumentRow}>
              {/* Label & Preview */}
              <View style={styles.instrumentLabel}>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => playDrum(id, levels[id])}
                >
                  <Text style={styles.previewIcon}>▶</Text>
                </TouchableOpacity>
                <Text style={[styles.instrumentText, { color }]}>{label}</Text>
              </View>
              
              {/* Steps */}
              <View style={styles.stepsContainer}>
                {Array(16).fill(0).map((_, i) => renderStepButton(id, i))}
              </View>
            </View>
          ))}
        </SynthSection>

        {/* Mixer Levels */}
        <SynthSection title="MIXER" icon="🎚️" subtitle="Individual voice levels">
          <ParameterGroup>
            {DRUMS.map(({ id, label, color }) => (
              <SynthSlider
                key={id}
                label={label}
                value={levels[id]}
                onValueChange={(value) => updateLevel(id, value)}
                unit="%"
                color={color}
              />
            ))}
          </ParameterGroup>
        </SynthSection>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    top: -1000,
    left: -1000,
    pointerEvents: 'none',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  bpmContainer: {
    alignItems: 'center',
  },
  bpmLabel: {
    ...TYPOGRAPHY.label,
    color: HAOS_COLORS.gold,
    marginBottom: SPACING.xs,
  },
  bpmDisplay: {
    backgroundColor: HAOS_COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
    marginBottom: SPACING.sm,
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  bpmText: {
    ...TYPOGRAPHY.h1,
    color: HAOS_COLORS.gold,
    fontFamily: 'monospace',
  },
  tempoPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bpmButton: {
    backgroundColor: HAOS_COLORS.surface,
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bpmButtonText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonActive: {
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
  },
  mainButtonText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mainButtonLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  clearButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  clearButtonLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  presetsScroll: {
    paddingVertical: SPACING.sm,
  },
  presetButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  stepNumbers: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  instrumentLabelSpace: {
    width: 100,
  },
  stepNumber: {
    width: 18,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  stepNumberText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  instrumentLabel: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  previewButton: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewIcon: {
    color: COLORS.primary,
    fontSize: 10,
  },
  instrumentText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  stepsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  stepButton: {
    width: 18,
    height: 28,
    backgroundColor: COLORS.surface,
    marginHorizontal: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  stepButtonActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.accent,
  },
  stepButtonCurrent: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  stepButtonPlaying: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  velocityBar: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderTopLeftRadius: RADIUS.sm,
    borderTopRightRadius: RADIUS.sm,
  },
  // Parameter controls
  parameterGrid: {
    gap: SPACING.lg,
  },
  parameterSection: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  parameterTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  parameterRow: {
    marginBottom: SPACING.sm,
  },
  parameterLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  parameterSlider: {
    width: '100%',
    height: 40,
  },
});

export default TR808Screen;
