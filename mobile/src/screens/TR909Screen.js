/**
 * HAOS.fm TR-909 Drum Machine
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
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import tr909Bridge from '../drums/TR909Bridge';
import webAudioBridge from '../services/WebAudioBridge';

const DRUMS = [
  { id: 'kick', label: 'BASS DRUM', color: HAOS_COLORS.gold },
  { id: 'snare', label: 'SNARE', color: HAOS_COLORS.gold },
  { id: 'hihat', label: 'CLOSED HH', color: HAOS_COLORS.orange },
  { id: 'clap', label: 'HAND CLAP', color: HAOS_COLORS.silver },
  { id: 'rim', label: 'RIM SHOT', color: HAOS_COLORS.silver },
  { id: 'crash', label: 'CRASH', color: HAOS_COLORS.orange },
  { id: 'ride', label: 'RIDE', color: HAOS_COLORS.orange },
  { id: 'tom', label: 'TOM', color: HAOS_COLORS.gold },
];

const PRESETS = {
  'Techno': {
    bpm: 135,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      rim: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride: [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  'House': {
    bpm: 128,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      rim: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
      crash: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,1,0],
    },
  },
  'Trance': {
    bpm: 140,
    pattern: {
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      rim: [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1],
      crash: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      ride: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      tom: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
    },
  },
};

const TR909Screen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(135);
  const [pattern, setPattern] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
    rim: Array(16).fill(false),
    crash: Array(16).fill(false),
    ride: Array(16).fill(false),
    tom: Array(16).fill(false),
  });
  
  const [accent, setAccent] = useState(Array(16).fill(false));
  const [levels, setLevels] = useState({
    kick: 1.0,
    snare: 0.85,
    hihat: 0.65,
    clap: 0.75,
    rim: 0.6,
    crash: 0.7,
    ride: 0.65,
    tom: 0.8,
  });

  const intervalRef = useRef(null);
  const scheduleAheadTime = useRef(0.1);
  const nextNoteTime = useRef(0.0);
  const timerID = useRef(null);
  const lcdAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeDrums();
    startLcdAnimation();
    
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
      await tr909Bridge.init();
      console.log('✅ TR-909 initialized');
    } catch (error) {
      console.error('❌ TR-909 init failed:', error);
    }
  };

  const startLcdAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lcdAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(lcdAnim, {
          toValue: 0.7,
          duration: 800,
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

  const toggleAccent = (step) => {
    setAccent(prev => prev.map((active, i) => 
      i === step ? !active : active
    ));
  };

  const playDrum = (drum, velocity = 1.0, hasAccent = false) => {
    const finalVelocity = hasAccent ? velocity * 1.3 : velocity;
    if (tr909Bridge && tr909Bridge[`play${drum.charAt(0).toUpperCase() + drum.slice(1)}`]) {
      tr909Bridge[`play${drum.charAt(0).toUpperCase() + drum.slice(1)}`](finalVelocity);
      console.log(`🥁 Playing ${drum} @ ${Math.round(finalVelocity * 100)}%`);
    }
  };

  const playSequence = async () => {
    if (isPlaying) {
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

    setIsPlaying(true);
    nextNoteTime.current = Date.now() / 1000;
    scheduleNote();
  };

  const scheduleNote = () => {
    if (!isPlaying) return;

    const stepDuration = (60 / bpm) / 4;
    const currentTime = Date.now() / 1000;

    while (nextNoteTime.current < currentTime + scheduleAheadTime.current) {
      const step = currentStep;
      const hasAccent = accent[step];
      
      DRUMS.forEach(({ id }) => {
        if (pattern[id][step]) {
          playDrum(id, levels[id], hasAccent);
        }
      });
      
      setCurrentStep((prev) => (prev + 1) % 16);
      nextNoteTime.current += stepDuration;
    }

    timerID.current = setTimeout(scheduleNote, 25);
  };

  useEffect(() => {
    if (isPlaying) {
      const wasPlaying = isPlaying;
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerID.current) clearTimeout(timerID.current);
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
      rim: Array(16).fill(false),
      crash: Array(16).fill(false),
      ride: Array(16).fill(false),
      tom: Array(16).fill(false),
    });
    setAccent(Array(16).fill(false));
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
    const hasAccent = accent[step];
    
    return (
      <TouchableOpacity
        key={`${instrument}-${step}`}
        style={[
          styles.stepButton,
          isActive && styles.stepButtonActive,
          isCurrent && styles.stepButtonCurrent,
          isActive && isCurrent && styles.stepButtonPlaying,
          hasAccent && isActive && styles.stepButtonAccent,
        ]}
        onPress={() => toggleStep(instrument, step)}
      >
        {isActive && (
          <View
            style={[
              styles.velocityBar,
              {
                height: `${levels[instrument] * 100}%`,
                backgroundColor: hasAccent 
                  ? COLORS.warning 
                  : (isCurrent ? COLORS.accent : COLORS.success),
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={commonStyles.container}>
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

      {/* HAOS Header */}
      <StatusBar barStyle="light-content" />
      <HAOSHeader
        title="TR-909"
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 70, paddingBottom: insets.bottom + 120 },
        ]}
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
                      { opacity: lcdAnim },
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

        {/* Presets */}
        <SynthSection title="PATTERNS" icon="🎵" subtitle="Classic 909 grooves">
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
        <SynthSection title="SEQUENCER" icon="🎹" subtitle="16-step pattern editor with accent">
          {/* Step Numbers */}
          <View style={styles.stepNumbers}>
            <View style={styles.instrumentLabelSpace} />
            {Array(16).fill(0).map((_, i) => (
              <View key={i} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
            ))}
          </View>

          {/* Accent Row */}
          <View style={styles.instrumentRow}>
            <View style={styles.instrumentLabel}>
              <View style={styles.previewButton}>
                <Text style={styles.previewIcon}>⚡</Text>
              </View>
              <Text style={[styles.instrumentText, { color: COLORS.warning }]}>ACCENT</Text>
            </View>
            
            <View style={styles.stepsContainer}>
              {Array(16).fill(0).map((_, i) => (
                <TouchableOpacity
                  key={`accent-${i}`}
                  style={[
                    styles.stepButton,
                    accent[i] && styles.stepButtonAccent,
                    i === currentStep && isPlaying && styles.stepButtonCurrent,
                  ]}
                  onPress={() => toggleAccent(i)}
                >
                  {accent[i] && (
                    <View style={[styles.velocityBar, { backgroundColor: COLORS.warning, height: '100%' }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    paddingHorizontal: SPACING.lg,
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
    borderColor: HAOS_COLORS.gold,
  },
  bpmButtonText: {
    ...TYPOGRAPHY.h2,
    color: HAOS_COLORS.gold,
  },
  mainButton: {
    backgroundColor: HAOS_COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: HAOS_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
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
    backgroundColor: HAOS_COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold,
  },
  clearButtonText: {
    ...TYPOGRAPHY.h2,
    color: HAOS_COLORS.gold,
    marginBottom: SPACING.xs,
  },
  clearButtonLabel: {
    ...TYPOGRAPHY.label,
    color: HAOS_COLORS.silver,
  },
  presetsScroll: {
    paddingVertical: SPACING.sm,
  },
  presetButton: {
    backgroundColor: HAOS_COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold,
  },
  presetButtonText: {
    ...TYPOGRAPHY.body,
    color: HAOS_COLORS.gold,
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
    color: HAOS_COLORS.silver,
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
    backgroundColor: HAOS_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold,
  },
  previewIcon: {
    color: HAOS_COLORS.gold,
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
    backgroundColor: HAOS_COLORS.surface,
    marginHorizontal: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  stepButtonActive: {
    backgroundColor: HAOS_COLORS.surface,
    borderColor: HAOS_COLORS.orange,
  },
  stepButtonCurrent: {
    borderColor: HAOS_COLORS.gold,
    borderWidth: 2,
  },
  stepButtonPlaying: {
    borderColor: HAOS_COLORS.gold,
    backgroundColor: HAOS_COLORS.primaryDark,
  },
  stepButtonAccent: {
    borderColor: HAOS_COLORS.orange,
    borderWidth: 2,
  },
  velocityBar: {
    width: '100%',
    backgroundColor: HAOS_COLORS.orange,
    borderTopLeftRadius: RADIUS.sm,
    borderTopRightRadius: RADIUS.sm,
  },
});

export default TR909Screen;
