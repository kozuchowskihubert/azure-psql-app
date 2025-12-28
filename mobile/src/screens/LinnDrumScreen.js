/**
 * HAOS.fm LinnDrum - Classic Digital Drum Machine
 * 15 sampled sounds, individual tuning & volume, swing
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
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  purple: '#9966ff',
  pink: '#ff00ff',
  blue: '#00D9FF',
  cyan: '#00ffff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const DRUM_SOUNDS = [
  { id: 'kick1', name: 'KICK 1', color: '#ff0066' },
  { id: 'kick2', name: 'KICK 2', color: '#ff3366' },
  { id: 'snare1', name: 'SNARE 1', color: '#ffcc00' },
  { id: 'snare2', name: 'SNARE 2', color: '#ff9900' },
  { id: 'snare3', name: 'SNARE 3', color: '#ff6600' },
  { id: 'clap', name: 'CLAP', color: '#00ff94' },
  { id: 'hihat', name: 'HI-HAT', color: '#00ffff' },
  { id: 'hihatOpen', name: 'HH OPEN', color: '#0099ff' },
  { id: 'tom1', name: 'TOM 1', color: '#9966ff' },
  { id: 'tom2', name: 'TOM 2', color: '#cc66ff' },
  { id: 'tom3', name: 'TOM 3', color: '#ff66ff' },
  { id: 'ride', name: 'RIDE', color: '#66ffff' },
  { id: 'crash', name: 'CRASH', color: '#ffff00' },
  { id: 'shaker', name: 'SHAKER', color: '#88ff00' },
  { id: 'cowbell', name: 'COWBELL', color: '#ff8800' },
];

const LinnDrumScreen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [swing, setSwing] = useState(50);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSound, setSelectedSound] = useState('kick1');
  
  // Sound parameters (volume 0-100, tuning -12 to +12)
  const [soundParams, setSoundParams] = useState(
    DRUM_SOUNDS.reduce((acc, sound) => ({
      ...acc,
      [sound.id]: { volume: 80, tuning: 0 }
    }), {})
  );
  
  // 16-step pattern
  const [pattern, setPattern] = useState(
    DRUM_SOUNDS.reduce((acc, sound) => ({
      ...acc,
      [sound.id]: Array(16).fill(false)
    }), {})
  );
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepPulse = useRef(new Animated.Value(1)).current;
  const stepGlowAnims = useRef(
    Array(16).fill(0).map(() => new Animated.Value(0))
  ).current;
  
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
    const swingAmount = (swing - 50) / 100;
    const baseInterval = (60 / tempo) * 250;
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Trigger glow animation for the next step
        Animated.sequence([
          Animated.timing(stepGlowAnims[nextStep], {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(stepGlowAnims[nextStep], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        
        return nextStep;
      });
      
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
    }, baseInterval);
    
    return () => clearInterval(timer);
  }, [isPlaying, tempo, swing]);
  
  const toggleStep = (soundId, step) => {
    setPattern(prev => ({
      ...prev,
      [soundId]: prev[soundId].map((val, i) => i === step ? !val : val)
    }));
  };
  
  const updateSoundParam = (soundId, param, value) => {
    setSoundParams(prev => ({
      ...prev,
      [soundId]: { ...prev[soundId], [param]: value }
    }));
  };
  
  const clearPattern = () => {
    setPattern(
      DRUM_SOUNDS.reduce((acc, sound) => ({
        ...acc,
        [sound.id]: Array(16).fill(false)
      }), {})
    );
  };
  
  const loadPreset = (presetName) => {
    const presets = {
      disco: {
        kick1: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
        snare1: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        hihat: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
        clap: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
      },
      funk: {
        kick1: [true,false,false,false,false,false,true,false,true,false,false,false,false,false,true,false],
        snare2: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        hihat: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
        clap: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
      },
    };
    
    if (presets[presetName]) {
      setPattern(prev => ({
        ...prev,
        ...presets[presetName]
      }));
    }
  };
  
  const currentSound = DRUM_SOUNDS.find(s => s.id === selectedSound);
  const currentParams = soundParams[selectedSound];
  
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
          <Text style={styles.headerIcon}>🥁</Text>
          <Text style={styles.headerTitle}>LINNDRUM</Text>
          <Text style={styles.headerSubtitle}>DIGITAL DRUM MACHINE • 15 SOUNDS</Text>
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
            <Text style={[styles.playText, isPlaying && { color: '#000' }]}>
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>TEMPO</Text>
            <Slider
              style={styles.slider}
              minimumValue={60}
              maximumValue={200}
              value={tempo}
              onChange={setTempo}
              minimumTrackTintColor={HAOS_COLORS.purple}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.purple}
            />
            <View style={styles.tempoValueContainer}>
              <Text style={styles.controlValue}>{Math.round(tempo)}</Text>
              {isPlaying && (
                <Animated.View
                  style={[
                    styles.tempoPulse,
                    {
                      opacity: stepPulse,
                      transform: [{
                        scale: stepPulse.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [0.8, 1.2],
                        }),
                      }],
                    },
                  ]}
                />
              )}
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SWING</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={swing}
              onChange={setSwing}
              minimumTrackTintColor={HAOS_COLORS.purple}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.purple}
            />
            <Text style={styles.controlValue}>{Math.round(swing)}%</Text>
          </View>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearPattern}
          >
            <Text style={styles.clearText}>CLEAR PATTERN</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sound Selector */}
        <View style={styles.soundSelector}>
          <Text style={styles.sectionTitle}>SELECT SOUND</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.soundButtons}
          >
            {DRUM_SOUNDS.map(sound => (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundButton,
                  selectedSound === sound.id && styles.soundButtonActive,
                  { borderColor: sound.color }
                ]}
                onPress={() => setSelectedSound(sound.id)}
              >
                <Text style={[
                  styles.soundButtonText,
                  selectedSound === sound.id && { color: sound.color }
                ]}>
                  {sound.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Sound Parameters */}
        <LinearGradient
          colors={[currentSound.color + '30', currentSound.color + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{currentSound.name}</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VOLUME</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={currentParams.volume}
              onChange={(val) => updateSoundParam(selectedSound, 'volume', val)}
              minimumTrackTintColor={currentSound.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentSound.color}
            />
            <Text style={styles.controlValue}>{Math.round(currentParams.volume)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>TUNING</Text>
            <Slider
              style={styles.slider}
              minimumValue={-12}
              maximumValue={12}
              step={1}
              value={currentParams.tuning}
              onChange={(val) => updateSoundParam(selectedSound, 'tuning', val)}
              minimumTrackTintColor={currentSound.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentSound.color}
            />
            <Text style={styles.controlValue}>
              {currentParams.tuning > 0 ? '+' : ''}{currentParams.tuning}
            </Text>
          </View>
        </LinearGradient>
        
        {/* 16-Step Sequencer */}
        <View style={styles.sequencerSection}>
          <Text style={styles.sequencerTitle}>PATTERN - {currentSound.name}</Text>
          
          <View style={styles.stepsRow}>
            {pattern[selectedSound].map((active, i) => {
              const isCurrent = i === currentStep && isPlaying;
              const glowOpacity = stepGlowAnims[i];
              
              return (
                <View key={i} style={styles.stepWrapper}>
                  {/* Glow ring animation */}
                  {isCurrent && active && (
                    <Animated.View
                      style={[
                        styles.stepGlowRing,
                        {
                          opacity: glowOpacity,
                          transform: [{
                            scale: glowOpacity.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.3],
                            }),
                          }],
                        },
                      ]}
                    />
                  )}
                  
                  {/* Velocity bar based on volume */}
                  {active && (
                    <View
                      style={[
                        styles.velocityBar,
                        {
                          height: `${currentParams.volume}%`,
                          backgroundColor: isCurrent ? HAOS_COLORS.lime : HAOS_COLORS.green,
                        },
                      ]}
                    />
                  )}
                  
                  <Animated.View
                    style={[
                      isCurrent && {
                        transform: [{ scale: stepPulse }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.step,
                        active && [styles.stepActive, { backgroundColor: currentSound.color }],
                        isCurrent && isPlaying && styles.stepPlaying,
                      ]}
                      onPress={() => toggleStep(selectedSound, i)}
                    >
                      <Text style={[
                        styles.stepNumber,
                        active && styles.stepNumberActive,
                      ]}>
                        {i + 1}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>LINNDRUM PRESETS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.purple }]}
              onPress={() => loadPreset('disco')}
            >
              <Text style={styles.presetIcon}>🕺</Text>
              <Text style={styles.presetText}>DISCO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.pink }]}
              onPress={() => loadPreset('funk')}
            >
              <Text style={styles.presetIcon}>🎸</Text>
              <Text style={styles.presetText}>FUNK</Text>
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
    borderBottomColor: HAOS_COLORS.purple,
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
    borderColor: HAOS_COLORS.purple,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.purple,
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
    color: HAOS_COLORS.purple,
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
    borderColor: HAOS_COLORS.purple,
    marginBottom: 15,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.purple,
  },
  playIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  playText: {
    fontSize: 18,
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  clearButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderWidth: 1,
    borderColor: '#ff0066',
    alignItems: 'center',
    marginTop: 10,
  },
  clearText: {
    fontSize: 14,
    color: '#ff0066',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  soundSelector: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  soundButtons: {
    marginTop: 15,
  },
  soundButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
  },
  soundButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  soundButtonText: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    marginBottom: 15,
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
    width: 80,
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
  sequencerSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(153,102,255,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.purple,
  },
  sequencerTitle: {
    fontSize: 18,
    color: HAOS_COLORS.purple,
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
    marginBottom: 10,
    position: 'relative',
  },
  stepGlowRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#88ff00', // Lime color for LinnDrum
    shadowColor: '#88ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  velocityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00ff94',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  tempoPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00', // LCD green
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  tempoValueContainer: {
    position: 'relative',
    minWidth: 50,
    alignItems: 'center',
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
  },
  stepActive: {
    borderColor: HAOS_COLORS.purple,
  },
  stepPlaying: {
    borderColor: '#ffff00',
    borderWidth: 3,
  },
  stepNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#000',
  },
  presetsSection: {
    padding: 20,
  },
  presetsTitle: {
    fontSize: 18,
    color: HAOS_COLORS.purple,
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

export default LinnDrumScreen;
