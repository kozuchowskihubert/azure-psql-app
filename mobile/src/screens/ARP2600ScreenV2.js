/**
 * HAOS.fm ARP 2600 V2 - Modern Vintage Fusion
 * Complete redesign with modular patch bay and professional layout
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Audio Bridge
import arp2600Bridge from '../synths/ARP2600Bridge';
import webAudioBridge from '../services/WebAudioBridge';

const { width, height } = Dimensions.get('window');

// Modern Vintage Color Palette
const COLORS = {
  // ARP 2600 Original Colors
  orange: '#FF6B35',      // Primary ARP orange
  orangeGlow: '#FF8C5A',  // Lighter orange
  orangeDark: '#E65A2B',  // Darker orange
  
  // Vintage Panel Colors
  black: '#0a0a0a',       // Deep black background
  panel: '#1a1a1a',       // Dark panel
  metal: '#2a2a2a',       // Metallic surface
  silver: '#c0c0c0',      // Silver accents
  
  // Modern Accents
  cyan: '#00D9FF',        // Modern cyan
  green: '#00ff94',       // Success green
  yellow: '#FFD700',      // Warning yellow
  red: '#FF4444',         // Error red
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#C0C0C0',
  textMuted: '#808080',
  
  // Patch Bay Colors (Classic ARP)
  patchVCO1: '#FF6B35',   // VCO 1 - Orange
  patchVCO2: '#00D9FF',   // VCO 2 - Cyan
  patchVCO3: '#FFD700',   // VCO 3 - Yellow
  patchVCF: '#00ff94',    // VCF - Green
  patchVCA: '#FF8C5A',    // VCA - Light Orange
  patchEnv: '#C0C0C0',    // Envelope - Silver
};

// Typography System
const FONTS = {
  display: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  label: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  value: {
    fontFamily: 'Menlo',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};

// Musical Notes (3 octaves)
const NOTES = [
  { note: 'C2', freq: 65.41, label: 'C', black: false },
  { note: 'C#2', freq: 69.30, label: 'C#', black: true },
  { note: 'D2', freq: 73.42, label: 'D', black: false },
  { note: 'D#2', freq: 77.78, label: 'D#', black: true },
  { note: 'E2', freq: 82.41, label: 'E', black: false },
  { note: 'F2', freq: 87.31, label: 'F', black: false },
  { note: 'F#2', freq: 92.50, label: 'F#', black: true },
  { note: 'G2', freq: 98.00, label: 'G', black: false },
  { note: 'G#2', freq: 103.83, label: 'G#', black: true },
  { note: 'A2', freq: 110.00, label: 'A', black: false },
  { note: 'A#2', freq: 116.54, label: 'A#', black: true },
  { note: 'B2', freq: 123.47, label: 'B', black: false },
  { note: 'C3', freq: 130.81, label: 'C', black: false },
  { note: 'C#3', freq: 138.59, label: 'C#', black: true },
  { note: 'D3', freq: 146.83, label: 'D', black: false },
  { note: 'D#3', freq: 155.56, label: 'D#', black: true },
  { note: 'E3', freq: 164.81, label: 'E', black: false },
  { note: 'F3', freq: 174.61, label: 'F', black: false },
  { note: 'F#3', freq: 185.00, label: 'F#', black: true },
  { note: 'G3', freq: 196.00, label: 'G', black: false },
  { note: 'G#3', freq: 207.65, label: 'G#', black: true },
  { note: 'A3', freq: 220.00, label: 'A', black: false },
  { note: 'A#3', freq: 233.08, label: 'A#', black: true },
  { note: 'B3', freq: 246.94, label: 'B', black: false },
  { note: 'C4', freq: 261.63, label: 'C', black: false },
];

const ARP2600ScreenV2 = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // VCO Parameters
  const [vco1Level, setVco1Level] = useState(0.6);
  const [vco2Level, setVco2Level] = useState(0.4);
  const [vco3Level, setVco3Level] = useState(0.2);
  const [vco2Detune, setVco2Detune] = useState(0.005);
  const [vco3Detune, setVco3Detune] = useState(-12); // -1 octave
  
  // VCF Parameters
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [filterResonance, setFilterResonance] = useState(18);
  const [filterEnvAmount, setFilterEnvAmount] = useState(0.5);
  
  // ADSR Envelope
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);
  
  // Modulation
  const [lfoRate, setLfoRate] = useState(5.0);
  const [lfoDepth, setLfoDepth] = useState(0.3);
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  
  // Patch Bay
  const [patchMode, setPatchMode] = useState(false);
  const [patches, setPatches] = useState([
    { id: '1', from: 'vco1', to: 'vcf', color: COLORS.patchVCO1 },
    { id: '2', from: 'vco2', to: 'vcf', color: COLORS.patchVCO2 },
    { id: '3', from: 'env', to: 'vca', color: COLORS.patchEnv },
  ]);
  
  // Active Notes
  const [activeNotes, setActiveNotes] = useState(new Set());
  
  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    arp2600Bridge.init();
    console.log('✅ ARP 2600 V2 initialized');
    
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Update parameters
  useEffect(() => { arp2600Bridge.setOsc1Level(vco1Level); }, [vco1Level]);
  useEffect(() => { arp2600Bridge.setOsc2Level(vco2Level); }, [vco2Level]);
  useEffect(() => { arp2600Bridge.setOsc3Level(vco3Level); }, [vco3Level]);
  useEffect(() => { arp2600Bridge.setFilterCutoff(filterCutoff); }, [filterCutoff]);
  useEffect(() => { arp2600Bridge.setFilterResonance(filterResonance); }, [filterResonance]);
  useEffect(() => {
    arp2600Bridge.setEnvelope({ attack, decay, sustain, release });
  }, [attack, decay, sustain, release]);

  const playNote = (note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    arp2600Bridge.playNote(note, { velocity: 1.0, duration: 2.0 });
    setActiveNotes(new Set(activeNotes).add(note));
    
    // Filter animation
    Animated.sequence([
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: attack * 1000,
        useNativeDriver: true,
      }),
      Animated.timing(filterAnim, {
        toValue: sustain,
        duration: decay * 1000,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: release * 1000,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  const renderKnob = (value, onChange, label, formatValue, color = null) => {
    const actualColor = color || '#FF6B35';
    const rotation = (value * 270) - 135; // -135° to +135°
    
    return (
      <View style={styles.knobContainer}>
        <Text style={styles.knobLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.knob, { borderColor: actualColor }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <View style={[styles.knobBody, { backgroundColor: actualColor + '20' }]}>
            <Animated.View
              style={[
                styles.knobIndicator,
                {
                  backgroundColor: actualColor,
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
            />
          </View>
        </TouchableOpacity>
        <Text style={[styles.knobValue, { color: actualColor }]}>
          {formatValue ? formatValue(value) : Math.round(value * 100)}
        </Text>
      </View>
    );
  };

  const renderSlider = (value, onChange, label, min, max, formatValue, color = null) => {
    const actualColor = color || '#FF6B35';
    return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color: actualColor }]}>
          {formatValue ? formatValue(value) : value.toFixed(2)}
        </Text>
      </View>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: actualColor }]} />
        <TouchableOpacity
          style={[styles.sliderThumb, { left: `${((value - min) / (max - min)) * 100}%`, backgroundColor: actualColor }]}
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        />
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden WebView */}
      <WebView
        ref={(ref) => {
          if (ref && !webAudioBridge.isReady) {
            webAudioBridge.setWebViewRef(ref);
          }
        }}
        source={require('../../assets/audio-engine.html')}
        style={styles.hiddenWebView}
        onMessage={(event) => webAudioBridge.onMessage(event)}
        onLoad={() => webAudioBridge.initAudio()}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.panel, COLORS.black]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.goBack();
          }}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Animated.Text
            style={[
              styles.headerTitle,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ]}
          >
            ARP 2600
          </Animated.Text>
          <Text style={styles.headerSubtitle}>MODULAR SYNTHESIZER</Text>
        </View>

        <TouchableOpacity
          style={[styles.patchButton, patchMode && styles.patchButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setPatchMode(!patchMode);
          }}
        >
          <Text style={styles.patchButtonText}>🔌</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* VCO Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.sectionTitle}>VOLTAGE CONTROLLED OSCILLATORS</Text>
          </View>
          
          <View style={styles.modulePanel}>
            {/* VCO 1 */}
            <View style={styles.vcoModule}>
              <Text style={[styles.moduleTitle, { color: COLORS.patchVCO1 }]}>VCO 1</Text>
              {renderSlider(
                vco1Level,
                setVco1Level,
                'LEVEL',
                0,
                1,
                (v) => `${Math.round(v * 100)}%`,
                COLORS.patchVCO1
              )}
            </View>

            {/* VCO 2 */}
            <View style={styles.vcoModule}>
              <Text style={[styles.moduleTitle, { color: COLORS.patchVCO2 }]}>VCO 2</Text>
              {renderSlider(
                vco2Level,
                setVco2Level,
                'LEVEL',
                0,
                1,
                (v) => `${Math.round(v * 100)}%`,
                COLORS.patchVCO2
              )}
              {renderSlider(
                vco2Detune,
                setVco2Detune,
                'DETUNE',
                -0.05,
                0.05,
                (v) => `${(v * 100).toFixed(1)} ct`,
                COLORS.patchVCO2
              )}
            </View>

            {/* VCO 3 */}
            <View style={styles.vcoModule}>
              <Text style={[styles.moduleTitle, { color: COLORS.patchVCO3 }]}>VCO 3 (LFO)</Text>
              {renderSlider(
                vco3Level,
                setVco3Level,
                'LEVEL',
                0,
                1,
                (v) => `${Math.round(v * 100)}%`,
                COLORS.patchVCO3
              )}
              {renderSlider(
                (vco3Detune + 24) / 48,
                (v) => setVco3Detune(v * 48 - 24),
                'PITCH',
                0,
                1,
                (v) => {
                  const semitones = v * 48 - 24;
                  return `${semitones > 0 ? '+' : ''}${semitones.toFixed(0)} ST`;
                },
                COLORS.patchVCO3
              )}
            </View>
          </View>
        </View>

        {/* VCF Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: COLORS.patchVCF }]} />
            <Text style={styles.sectionTitle}>VOLTAGE CONTROLLED FILTER</Text>
          </View>
          
          <View style={styles.modulePanel}>
            <View style={styles.filterVisual}>
              <Animated.View
                style={[
                  styles.filterWave,
                  {
                    height: filterAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 80],
                    }),
                    backgroundColor: COLORS.patchVCF,
                  },
                ]}
              />
            </View>

            {renderSlider(
              filterCutoff / 10000,
              (v) => setFilterCutoff(v * 10000),
              'CUTOFF FREQUENCY',
              0,
              1,
              (v) => `${Math.round(v * 10000)} Hz`,
              COLORS.patchVCF
            )}
            
            {renderSlider(
              filterResonance / 30,
              (v) => setFilterResonance(v * 30),
              'RESONANCE',
              0,
              1,
              (v) => `Q: ${(v * 30).toFixed(1)}`,
              COLORS.patchVCF
            )}
            
            {renderSlider(
              filterEnvAmount,
              setFilterEnvAmount,
              'ENVELOPE AMOUNT',
              0,
              1,
              (v) => `${Math.round(v * 100)}%`,
              COLORS.patchVCF
            )}
          </View>
        </View>

        {/* ADSR Envelope */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: COLORS.patchEnv }]} />
            <Text style={styles.sectionTitle}>ENVELOPE GENERATOR</Text>
          </View>
          
          <View style={styles.modulePanel}>
            <View style={styles.adsrRow}>
              {renderKnob(attack / 2, setAttack, 'ATTACK', (v) => `${(v * 2000).toFixed(0)}ms`, COLORS.patchEnv)}
              {renderKnob(decay / 2, setDecay, 'DECAY', (v) => `${(v * 2000).toFixed(0)}ms`, COLORS.patchEnv)}
              {renderKnob(sustain, setSustain, 'SUSTAIN', (v) => `${(v * 100).toFixed(0)}%`, COLORS.patchEnv)}
              {renderKnob(release / 5, setRelease, 'RELEASE', (v) => `${(v * 5000).toFixed(0)}ms`, COLORS.patchEnv)}
            </View>
          </View>
        </View>

        {/* Modulation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: COLORS.cyan }]} />
            <Text style={styles.sectionTitle}>MODULATION</Text>
          </View>
          
          <View style={styles.modulePanel}>
            {renderSlider(
              lfoRate / 20,
              (v) => setLfoRate(v * 20),
              'LFO RATE',
              0,
              1,
              (v) => `${(v * 20).toFixed(1)} Hz`,
              COLORS.cyan
            )}
            
            {renderSlider(
              lfoDepth,
              setLfoDepth,
              'LFO DEPTH',
              0,
              1,
              (v) => `${Math.round(v * 100)}%`,
              COLORS.cyan
            )}
            
            {renderSlider(
              noiseLevel,
              setNoiseLevel,
              'NOISE LEVEL',
              0,
              1,
              (v) => `${Math.round(v * 100)}%`,
              COLORS.cyan
            )}
          </View>
        </View>

        {/* Keyboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.sectionTitle}>KEYBOARD</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keyboard}>
            {NOTES.map((noteData) => {
              const isActive = activeNotes.has(noteData.note);
              return noteData.black ? (
                <TouchableOpacity
                  key={noteData.note}
                  style={[styles.keyBlack, isActive && styles.keyActive]}
                  onPress={() => playNote(noteData.note)}
                >
                  <Text style={styles.keyBlackLabel}>{noteData.label}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={noteData.note}
                  style={[styles.keyWhite, isActive && styles.keyActiveWhite]}
                  onPress={() => playNote(noteData.note)}
                >
                  <Text style={styles.keyWhiteLabel}>{noteData.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Patch Bay (if active) */}
        {patchMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndicator, { backgroundColor: COLORS.yellow }]} />
              <Text style={styles.sectionTitle}>PATCH BAY</Text>
            </View>
            
            <View style={styles.patchBay}>
              <Text style={styles.patchInfo}>🔌 Classic semi-modular patching</Text>
              <Text style={styles.patchInfo}>Tap to create custom signal routing</Text>
              
              <View style={styles.patchGrid}>
                {patches.map((patch) => (
                  <View key={patch.id} style={styles.patchCable}>
                    <View style={[styles.patchDot, { backgroundColor: patch.color }]} />
                    <View style={[styles.patchLine, { backgroundColor: patch.color }]} />
                    <View style={[styles.patchDot, { backgroundColor: patch.color }]} />
                    <Text style={styles.patchLabel}>
                      {patch.from.toUpperCase()} → {patch.to.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    top: -1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.display,
    color: '#FF6B35',
    textShadowColor: '#FF6B35',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  headerSubtitle: {
    ...FONTS.label,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  patchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.metal,
  },
  patchButtonActive: {
    backgroundColor: COLORS.yellow + '20',
    borderColor: COLORS.yellow,
  },
  patchButtonText: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    ...FONTS.title,
    color: '#FFFFFF',
  },
  modulePanel: {
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.metal,
  },
  vcoModule: {
    marginBottom: 20,
  },
  moduleTitle: {
    ...FONTS.label,
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sliderValue: {
    ...FONTS.value,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: COLORS.metal,
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  filterVisual: {
    height: 100,
    backgroundColor: COLORS.black,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  filterWave: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  adsrRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  knobContainer: {
    alignItems: 'center',
  },
  knobLabel: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  knob: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    padding: 4,
    marginBottom: 8,
  },
  knobBody: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    position: 'absolute',
    top: 4,
  },
  knobValue: {
    ...FONTS.value,
  },
  keyboard: {
    marginTop: 16,
  },
  keyWhite: {
    width: 50,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.metal,
    borderRadius: 4,
    marginRight: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  keyBlack: {
    width: 35,
    height: 90,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.metal,
    borderRadius: 4,
    position: 'absolute',
    marginLeft: 35,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  keyActive: {
    backgroundColor: '#FF6B35',
  },
  keyActiveWhite: {
    backgroundColor: '#FF8C5A',
  },
  keyWhiteLabel: {
    ...FONTS.label,
    color: COLORS.black,
    fontSize: 10,
  },
  keyBlackLabel: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
  },
  patchBay: {
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  patchInfo: {
    ...FONTS.label,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  patchGrid: {
    marginTop: 16,
  },
  patchCable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patchDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  patchLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 8,
  },
  patchLabel: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -50 }],
    bottom: -16,
  },
});

export default ARP2600ScreenV2;
