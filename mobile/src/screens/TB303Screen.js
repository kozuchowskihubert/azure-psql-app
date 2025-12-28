/**
 * HAOS.fm TB-303 - Acid Bass Machine
 * VCO + resonant filter + 16-step sequencer with accent/slide
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
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import TB303Bridge from '../synths/TB303Bridge';
import webAudioBridge from '../services/WebAudioBridge';

const tb303 = new TB303Bridge();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  lime: '#88ff00',
  yellow: '#ffff00',
  orange: '#ff8800',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const TB303Screen = ({ navigation, route }) => {
  // Oscillator
  const [waveform, setWaveform] = useState('saw');
  const [tuning, setTuning] = useState(50);
  
  // Filter
  const [cutoff, setCutoff] = useState(60);
  const [resonance, setResonance] = useState(50);
  const [envMod, setEnvMod] = useState(50);
  const [decay, setDecay] = useState(50);
  
  // Sequencer
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState('A');
  
  // Pattern (16 steps)
  const [pattern, setPattern] = useState({
    notes: Array(16).fill('C2'),
    accents: Array(16).fill(false),
    slides: Array(16).fill(false),
    active: Array(16).fill(false),
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepPulse = useRef(new Animated.Value(1)).current;
  
  // Visual enhancement animations
  const filterGlow = useRef(new Animated.Value(0)).current;
  const cutoffIndicator = useRef(new Animated.Value(0)).current;
  const resonanceGlow = useRef(new Animated.Value(0)).current;
  
  // Initialize TB-303 audio
  useEffect(() => {
    tb303.init().then(() => {
      console.log('✅ TB-303 initialized');
    });
  }, []);
  
  // Update TB-303 parameters when they change
  useEffect(() => {
    tb303.setWaveform(waveform);
  }, [waveform]);
  
  useEffect(() => {
    // Map 0-100 slider to Hz (20-8000)
    const cutoffHz = 20 + (cutoff / 100) * 7980;
    tb303.setCutoff(cutoffHz);
  }, [cutoff]);
  
  useEffect(() => {
    // Map 0-100 slider to Q (0-30)
    const resonanceQ = (resonance / 100) * 30;
    tb303.setResonance(resonanceQ);
  }, [resonance]);
  
  useEffect(() => {
    // Map 0-100 slider to Hz (0-5000)
    const envModHz = (envMod / 100) * 5000;
    tb303.setEnvMod(envModHz);
  }, [envMod]);
  
  useEffect(() => {
    // Map 0-100 slider to seconds (0-1)
    const decaySec = (decay / 100) * 1.0;
    tb303.setDecay(decaySec);
  }, [decay]);
  
  // Playback function
  const playNote = (note, accent = false, slide = false) => {
    tb303.playNote(note, {
      velocity: 1.0,
      accent,
      duration: slide ? 0.4 : 0.2
    });
  };
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Filter cutoff visualization - updates with cutoff value
  useEffect(() => {
    Animated.spring(cutoffIndicator, {
      toValue: cutoff / 100,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [cutoff]);
  
  // Filter glow animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(filterGlow, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(filterGlow, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Resonance glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(resonanceGlow, {
            toValue: resonance / 100,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(resonanceGlow, {
            toValue: resonance / 200,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      filterGlow.setValue(0);
      resonanceGlow.setValue(0);
    }
  }, [isPlaying, resonance]);
  
  // Sequencer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = (60 / tempo) * 250; // 16th notes
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Play note if step is active
        if (pattern.active[nextStep]) {
          playNote(
            pattern.notes[nextStep],
            pattern.accents[nextStep],
            pattern.slides[nextStep]
          );
        }
        
        return nextStep;
      });
      
      // Pulse animation
      Animated.sequence([
        Animated.timing(stepPulse, {
          toValue: 1.2,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stepPulse, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, tempo, pattern]);
  
  // Bass preset loading from BassSelectorScreen
  useEffect(() => {
    const preset = route?.params?.preset;
    const presetName = route?.params?.presetName;
    
    if (preset && presetName) {
      console.log(`🎸 Loading TB-303 preset from Bass Selector: ${presetName}`);
      
      setTimeout(() => {
        // Map bass parameters to TB-303 controls
        if (preset.slide !== undefined) {
          // slide (0-1s) → decay (0-100ms range)
          const decayValue = Math.min(100, preset.slide * 1000);
          setDecay(decayValue);
        }
        if (preset.vibrato !== undefined) {
          // vibrato (0-1) → envMod (0-100)
          setEnvMod(preset.vibrato * 100);
        }
        if (preset.subOsc !== undefined) {
          // subOsc (0-1) → cutoff (inverted: more sub = lower cutoff)
          setCutoff(100 - (preset.subOsc * 50));
        }
        if (preset.pitchBend !== undefined) {
          // pitchBend (±12) → resonance (centered at 50)
          setResonance(Math.max(0, Math.min(100, 50 + preset.pitchBend * 4)));
        }
        
        console.log(`✅ TB-303 preset "${presetName}" loaded`);
        console.log(`   Decay: ${Math.round(preset.slide * 1000)}ms, EnvMod: ${Math.round(preset.vibrato * 100)}, Cutoff: ${Math.round(100 - preset.subOsc * 50)}, Resonance: ${Math.round(50 + preset.pitchBend * 4)}`);
      }, 100);
    }
  }, [route?.params?.preset, route?.params?.presetName]);
  
  const toggleStep = (step) => {
    setPattern(prev => ({
      ...prev,
      active: prev.active.map((val, i) => i === step ? !val : val),
    }));
  };
  
  const toggleAccent = (step) => {
    setPattern(prev => ({
      ...prev,
      accents: prev.accents.map((val, i) => i === step ? !val : val),
    }));
  };
  
  const toggleSlide = (step) => {
    setPattern(prev => ({
      ...prev,
      slides: prev.slides.map((val, i) => i === step ? !val : val),
    }));
  };
  
  const loadPreset = (presetName) => {
    const presets = {
      acid: {
        waveform: 'saw',
        cutoff: 75,
        resonance: 80,
        envMod: 70,
        decay: 40,
        pattern: {
          notes: ['C2','D#2','G2','C3','G2','D#2','C2','C2','C2','D#2','G2','A#2','G2','D#2','C2','C2'],
          active: [true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,false],
          accents: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
          slides: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        }
      },
      squelch: {
        waveform: 'square',
        cutoff: 85,
        resonance: 90,
        envMod: 80,
        decay: 30,
        pattern: {
          notes: ['C2','C2','C3','C2','C2','C2','C3','C2','C2','C2','C3','C2','C2','C2','C3','C2'],
          active: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
          accents: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
          slides: [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
        }
      },
      bass: {
        waveform: 'saw',
        cutoff: 50,
        resonance: 40,
        envMod: 30,
        decay: 60,
        pattern: {
          notes: ['C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1','C1'],
          active: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
          accents: [true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false],
          slides: [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
        }
      },
    };
    
    if (presets[presetName]) {
      const p = presets[presetName];
      setWaveform(p.waveform);
      setCutoff(p.cutoff);
      setResonance(p.resonance);
      setEnvMod(p.envMod);
      setDecay(p.decay);
      setPattern(p.pattern);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Hidden WebView for audio-engine.html */}
      <WebView
        ref={(ref) => {
          if (ref && !webAudioBridge.isReady) {
            webAudioBridge.setWebViewRef(ref);
          }
        }}
        source={require('../../assets/audio-engine.html')}
        style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
        onMessage={(event) => webAudioBridge.onMessage(event)}
        onLoad={() => webAudioBridge.initAudio()}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🔊</Text>
          <Text style={styles.headerTitle}>TB-303</Text>
          <Text style={styles.headerSubtitle}>BASS LINE ACID MACHINE</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transport */}
        <View style={styles.transport}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.playText}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
          </TouchableOpacity>
          
          <View style={styles.tempoControl}>
            <Text style={styles.tempoLabel}>TEMPO</Text>
            <Slider
              style={styles.tempoSlider}
              minimumValue={60}
              maximumValue={180}
              value={tempo}
              onChange={setTempo}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.tempoValue}>{Math.round(tempo)}</Text>
          </View>
        </View>
        
        {/* VCO */}
        <LinearGradient
          colors={[HAOS_COLORS.green + '30', HAOS_COLORS.green + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>VCO</Text>
          
          {/* Waveform Visualization */}
          <View style={styles.waveformDisplay}>
            <View style={styles.waveformCanvas}>
              {waveform === 'saw' ? (
                // Sawtooth wave visualization
                <View style={styles.waveformPath}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                    <View key={i} style={styles.sawtoothSegment}>
                      <View style={[styles.sawtoothLine, { transform: [{ rotate: '45deg' }] }]} />
                    </View>
                  ))}
                </View>
              ) : (
                // Square wave visualization
                <View style={styles.waveformPath}>
                  {[0, 1, 2, 3].map(i => (
                    <View key={i} style={styles.squareSegment}>
                      <View style={styles.squareTop} />
                      <View style={styles.squareBottom} />
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Text style={styles.waveformLabel}>{waveform.toUpperCase()} WAVEFORM</Text>
          </View>
          
          <View style={styles.waveformSelector}>
            <TouchableOpacity
              style={[
                styles.waveButton,
                waveform === 'saw' && styles.waveButtonActive,
              ]}
              onPress={() => setWaveform('saw')}
            >
              <Text style={[
                styles.waveText,
                waveform === 'saw' && styles.waveTextActive,
              ]}>
                SAW
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.waveButton,
                waveform === 'square' && styles.waveButtonActive,
              ]}
              onPress={() => setWaveform('square')}
            >
              <Text style={[
                styles.waveText,
                waveform === 'square' && styles.waveTextActive,
              ]}>
                SQUARE
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>TUNING</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={tuning}
              onChange={setTuning}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.controlValue}>{Math.round(tuning)}</Text>
          </View>
        </LinearGradient>
        
        {/* Filter */}
        <LinearGradient
          colors={[HAOS_COLORS.lime + '30', HAOS_COLORS.lime + '10']}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FILTER</Text>
            {isPlaying && (
              <Animated.View style={[
                styles.filterStatusIndicator,
                { opacity: filterGlow }
              ]}>
                <Text style={styles.filterStatusText}>🔊 FILTERING</Text>
              </Animated.View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>18dB/oct resonant low-pass</Text>
          
          {/* Cutoff Frequency Visualizer */}
          <View style={styles.frequencyVisualizer}>
            <View style={styles.frequencyBar}>
              <Animated.View
                style={[
                  styles.frequencyFill,
                  {
                    width: cutoffIndicator.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: cutoffIndicator.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [
                        HAOS_COLORS.green,
                        HAOS_COLORS.lime,
                        HAOS_COLORS.yellow,
                        HAOS_COLORS.orange,
                      ],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.frequencyLabel}>
              {Math.round(20 + (cutoff / 100) * 19980)} Hz
            </Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>CUTOFF</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={cutoff}
              onChange={setCutoff}
              minimumTrackTintColor={HAOS_COLORS.lime}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.lime}
            />
            <Text style={styles.controlValue}>{Math.round(cutoff)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RESONANCE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={resonance}
              onChange={setResonance}
              minimumTrackTintColor={HAOS_COLORS.lime}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.lime}
            />
            <Text style={styles.controlValue}>{Math.round(resonance)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ENV MOD</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={envMod}
              onChange={setEnvMod}
              minimumTrackTintColor={HAOS_COLORS.lime}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.lime}
            />
            <Text style={styles.controlValue}>{Math.round(envMod)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DECAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={decay}
              onChange={setDecay}
              minimumTrackTintColor={HAOS_COLORS.lime}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.lime}
            />
            <Text style={styles.controlValue}>{Math.round(decay)}</Text>
          </View>
        </LinearGradient>
        
        {/* Pattern Selector */}
        <View style={styles.patternSelector}>
          <Text style={styles.patternTitle}>PATTERN</Text>
          <View style={styles.patternButtons}>
            {['A','B','C','D','E','F','G','H'].map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.patternButton,
                  selectedPattern === p && styles.patternButtonActive,
                ]}
                onPress={() => setSelectedPattern(p)}
              >
                <Text style={[
                  styles.patternText,
                  selectedPattern === p && styles.patternTextActive,
                ]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 16-Step Sequencer */}
        <View style={styles.sequencerSection}>
          <Text style={styles.sequencerTitle}>16-STEP SEQUENCER</Text>
          
          {/* Steps */}
          <View style={styles.stepsRow}>
            {pattern.active.map((active, i) => {
              const isCurrentStep = i === currentStep && isPlaying;
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.stepWrapper,
                    isCurrentStep && {
                      transform: [{ scale: stepPulse }],
                    },
                  ]}
                >
                  {/* Glow ring for active step */}
                  {isCurrentStep && active && (
                    <Animated.View
                      style={[
                        styles.stepGlowRing,
                        {
                          opacity: filterGlow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        },
                      ]}
                    />
                  )}
                  
                  <TouchableOpacity
                    style={[
                      styles.step,
                      active && styles.stepActive,
                      isCurrentStep && styles.stepPlaying,
                      active && isCurrentStep && styles.stepPlayingActive,
                    ]}
                    onPress={() => toggleStep(i)}
                  >
                    <Text style={[
                      styles.stepNumber,
                      active && styles.stepNumberActive,
                    ]}>
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Accent indicator */}
                  {active && (
                    <TouchableOpacity
                      style={[
                        styles.accentButton,
                        pattern.accents[i] && styles.accentButtonActive,
                        isCurrentStep && pattern.accents[i] && styles.accentPulse,
                      ]}
                      onPress={() => toggleAccent(i)}
                    >
                      <Text style={styles.accentText}>A</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Slide indicator */}
                  {active && (
                    <TouchableOpacity
                      style={[
                        styles.slideButton,
                        pattern.slides[i] && styles.slideButtonActive,
                        isCurrentStep && pattern.slides[i] && styles.slidePulse,
                      ]}
                      onPress={() => toggleSlide(i)}
                    >
                      <Text style={styles.slideText}>S</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              );
            })}
          </View>
          
          <View style={styles.sequencerLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: HAOS_COLORS.green }]} />
              <Text style={styles.legendText}>Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: HAOS_COLORS.orange }]} />
              <Text style={styles.legendText}>Accent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: HAOS_COLORS.yellow }]} />
              <Text style={styles.legendText}>Slide</Text>
            </View>
          </View>
        </View>
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>ACID PRESETS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.green }]}
              onPress={() => loadPreset('acid')}
            >
              <Text style={styles.presetIcon}>🎵</Text>
              <Text style={styles.presetText}>CLASSIC ACID</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.lime }]}
              onPress={() => loadPreset('squelch')}
            >
              <Text style={styles.presetIcon}>💥</Text>
              <Text style={styles.presetText}>SQUELCH</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.yellow }]}
              onPress={() => loadPreset('bass')}
            >
              <Text style={styles.presetIcon}>🔊</Text>
              <Text style={styles.presetText}>DEEP BASS</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: HAOS_COLORS.green,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  transport: {
    backgroundColor: HAOS_COLORS.darkGray,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.green,
    marginBottom: 15,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.green,
  },
  playIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  playText: {
    fontSize: 18,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tempoControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempoLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    width: 60,
  },
  tempoSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  tempoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
  },
  waveformDisplay: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
    alignItems: 'center',
  },
  waveformCanvas: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  waveformPath: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  sawtoothSegment: {
    flex: 1,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sawtoothLine: {
    width: 2,
    height: '100%',
    backgroundColor: HAOS_COLORS.green,
  },
  squareSegment: {
    flex: 1,
    height: '80%',
    flexDirection: 'row',
  },
  squareTop: {
    flex: 1,
    height: '50%',
    backgroundColor: HAOS_COLORS.green,
  },
  squareBottom: {
    flex: 1,
    height: '50%',
    backgroundColor: HAOS_COLORS.green,
    marginTop: '50%',
  },
  waveformLabel: {
    fontSize: 10,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 1,
  },
  waveformSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  waveButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  waveButtonActive: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
  },
  waveText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  waveTextActive: {
    color: '#000',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    width: 100,
    letterSpacing: 0.5,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  patternSelector: {
    backgroundColor: HAOS_COLORS.darkGray,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  patternTitle: {
    fontSize: 14,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  patternButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patternButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternButtonActive: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
  },
  patternText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  patternTextActive: {
    color: '#000',
  },
  sequencerSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,148,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
  },
  sequencerTitle: {
    fontSize: 18,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    width: '23%',
    marginBottom: 15,
    alignItems: 'center',
    position: 'relative',
  },
  stepGlowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: 50,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: HAOS_COLORS.yellow,
    shadowColor: HAOS_COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  step: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  stepActive: {
    backgroundColor: HAOS_COLORS.green,
    borderColor: HAOS_COLORS.green,
    shadowColor: HAOS_COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  stepPlaying: {
    borderColor: HAOS_COLORS.yellow,
    borderWidth: 3,
  },
  stepPlayingActive: {
    backgroundColor: HAOS_COLORS.yellow,
    shadowColor: HAOS_COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  stepNumber: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#000',
  },
  accentButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  accentButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    shadowColor: HAOS_COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  accentPulse: {
    shadowColor: HAOS_COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  accentText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  slideButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  slideButtonActive: {
    backgroundColor: HAOS_COLORS.yellow,
    shadowColor: HAOS_COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  slidePulse: {
    shadowColor: HAOS_COLORS.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  slideText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  sequencerLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  presetsSection: {
    padding: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterStatusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,148,0.2)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
  },
  filterStatusText: {
    fontSize: 10,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  frequencyVisualizer: {
    marginBottom: 15,
  },
  frequencyBar: {
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  frequencyFill: {
    height: '100%',
    borderRadius: 8,
  },
  frequencyLabel: {
    fontSize: 12,
    color: HAOS_COLORS.lime,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
});

export default TB303Screen;
