/**
 * HAOS.fm Oberheim DMX - Hip-Hop Legend
 * 24 sampled sounds, 8-bit character, swing control
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
  red: '#ff0066',
  orange: '#ff8800',
  yellow: '#ffff00',
  pink: '#ff00ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const DMX_SOUNDS = [
  { id: 'kick', name: 'KICK', color: '#ff0066', icon: '💥' },
  { id: 'snare', name: 'SNARE', color: '#ffcc00', icon: '🔥' },
  { id: 'snare2', name: 'SNARE 2', color: '#ff9900', icon: '⚡' },
  { id: 'rimshot', name: 'RIMSHOT', color: '#ff6600', icon: '🎯' },
  { id: 'clap', name: 'CLAP', color: '#00ff94', icon: '👏' },
  { id: 'hihat', name: 'HI-HAT', color: '#00ffff', icon: '✨' },
  { id: 'hihatOpen', name: 'HH OPEN', color: '#0099ff', icon: '💫' },
  { id: 'tomHi', name: 'TOM HI', color: '#9966ff', icon: '🎵' },
  { id: 'tomMid', name: 'TOM MID', color: '#cc66ff', icon: '🎶' },
  { id: 'tomLow', name: 'TOM LOW', color: '#ff66ff', icon: '🎼' },
  { id: 'crash', name: 'CRASH', color: '#ffff00', icon: '💥' },
  { id: 'ride', name: 'RIDE', color: '#88ff00', icon: '🌟' },
  { id: 'cowbell', name: 'COWBELL', color: '#ff8800', icon: '🔔' },
  { id: 'shaker', name: 'SHAKER', color: '#66ffff', icon: '🎲' },
  { id: 'tamb', name: 'TAMBOURINE', color: '#ff99cc', icon: '🎪' },
  { id: 'conga', name: 'CONGA', color: '#cc9966', icon: '🥁' },
];

const DMXScreen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(90); // Hip-hop tempo
  const [swing, setSwing] = useState(60); // Classic DMX swing
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSound, setSelectedSound] = useState('kick');
  
  // Sound parameters
  const [soundParams, setSoundParams] = useState(
    DMX_SOUNDS.reduce((acc, sound) => ({
      ...acc,
      [sound.id]: { volume: 85, tune: 0 }
    }), {})
  );
  
  // 16-step pattern
  const [pattern, setPattern] = useState(
    DMX_SOUNDS.reduce((acc, sound) => ({
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
    const interval = (60 / tempo) * 250;
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Trigger step glow animation
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
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, tempo]);
  
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
  
  const loadPreset = (presetName) => {
    const presets = {
      hiphop: {
        kick: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
        snare: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        hihat: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false],
        clap: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
      },
      boom: {
        kick: [true,false,false,false,false,false,true,false,true,false,false,false,false,false,true,false],
        snare2: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        hihat: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        crash: [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
      },
      trap: {
        kick: [true,false,false,true,false,false,true,false,true,false,false,true,false,false,true,false],
        snare: [false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false],
        hihat: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
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
  
  const currentSound = DMX_SOUNDS.find(s => s.id === selectedSound);
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
          <Text style={styles.headerIcon}>🎤</Text>
          <Text style={styles.headerTitle}>DMX</Text>
          <Text style={styles.headerSubtitle}>OBERHEIM • HIP-HOP LEGEND</Text>
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
              maximumValue={160}
              value={tempo}
              onChange={setTempo}
              minimumTrackTintColor={HAOS_COLORS.red}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.red}
            />
            <View style={styles.tempoValueContainer}>
              {isPlaying && (
                <Animated.View
                  style={[
                    styles.tempoPulse,
                    {
                      transform: [{ scale: stepPulse }],
                    },
                  ]}
                />
              )}
              <Text style={styles.controlValue}>{Math.round(tempo)}</Text>
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SWING</Text>
            <Slider
              style={styles.slider}
              minimumValue={50}
              maximumValue={75}
              value={swing}
              onChange={setSwing}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.orange}
            />
            <Text style={styles.controlValue}>{Math.round(swing)}%</Text>
          </View>
        </View>
        
        {/* Sound Selector */}
        <View style={styles.soundSelector}>
          <Text style={styles.sectionTitle}>DMX SOUNDS</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.soundButtons}
          >
            {DMX_SOUNDS.map(sound => (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundButton,
                  selectedSound === sound.id && styles.soundButtonActive,
                  { borderColor: sound.color }
                ]}
                onPress={() => setSelectedSound(sound.id)}
              >
                <Text style={styles.soundIcon}>{sound.icon}</Text>
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
          <View style={styles.soundHeader}>
            <Text style={styles.soundHeaderIcon}>{currentSound.icon}</Text>
            <Text style={styles.sectionTitle}>{currentSound.name}</Text>
          </View>
          
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
            <Text style={styles.controlLabel}>TUNE</Text>
            <Slider
              style={styles.slider}
              minimumValue={-24}
              maximumValue={24}
              step={1}
              value={currentParams.tune}
              onChange={(val) => updateSoundParam(selectedSound, 'tune', val)}
              minimumTrackTintColor={currentSound.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentSound.color}
            />
            <Text style={styles.controlValue}>
              {currentParams.tune > 0 ? '+' : ''}{currentParams.tune}
            </Text>
          </View>
        </LinearGradient>
        
        {/* 16-Step Sequencer */}
        <View style={styles.sequencerSection}>
          <Text style={styles.sequencerTitle}>
            {currentSound.icon} {currentSound.name} PATTERN
          </Text>
          
          <View style={styles.stepsRow}>
            {pattern[selectedSound].map((active, i) => (
              <View
                key={i}
                style={styles.stepWrapper}
              >
                {/* Step Glow Ring */}
                <Animated.View
                  style={[
                    styles.stepGlowRing,
                    {
                      opacity: stepGlowAnims[i],
                      transform: [{
                        scale: stepGlowAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      }],
                    },
                  ]}
                />
                
                {/* Velocity Bar */}
                <View style={[
                  styles.velocityBar,
                  { height: `${soundParams[selectedSound].volume}%` }
                ]} />
                
                <Animated.View
                  style={[
                    { width: '100%', height: '100%' },
                    i === currentStep && isPlaying && {
                      transform: [{ scale: stepPulse }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.step,
                      active && [styles.stepActive, { backgroundColor: currentSound.color }],
                      i === currentStep && isPlaying && styles.stepPlaying,
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
            ))}
          </View>
        </View>
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>DMX PRESETS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.red }]}
              onPress={() => loadPreset('hiphop')}
            >
              <Text style={styles.presetIcon}>🎤</Text>
              <Text style={styles.presetText}>HIP-HOP</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.orange }]}
              onPress={() => loadPreset('boom')}
            >
              <Text style={styles.presetIcon}>💥</Text>
              <Text style={styles.presetText}>BOOM BAP</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.yellow }]}
              onPress={() => loadPreset('trap')}
            >
              <Text style={styles.presetIcon}>⚡</Text>
              <Text style={styles.presetText}>TRAP</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎤 DMX LEGACY</Text>
          <Text style={styles.infoText}>
            Used on countless hip-hop classics:{'\n'}
            • Run-DMC - "It's Like That"{'\n'}
            • Afrika Bambaataa - "Planet Rock"{'\n'}
            • New Order - "Blue Monday"{'\n'}
            • 8-bit sampled sounds{'\n'}
            • Punchy, tight character{'\n'}
            • Defined 80s hip-hop sound
          </Text>
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
    borderBottomColor: HAOS_COLORS.red,
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
    borderColor: HAOS_COLORS.red,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.red,
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
    color: HAOS_COLORS.red,
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
    borderColor: HAOS_COLORS.red,
    marginBottom: 15,
  },
  playButtonActive: {
    backgroundColor: HAOS_COLORS.red,
  },
  playIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  playText: {
    fontSize: 18,
    color: HAOS_COLORS.red,
    fontWeight: 'bold',
    letterSpacing: 1,
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
  soundSelector: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 15,
  },
  soundButtons: {
    marginTop: 5,
  },
  soundButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    alignItems: 'center',
  },
  soundButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  soundIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  soundButtonText: {
    fontSize: 10,
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
  soundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  soundHeaderIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  sequencerSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,102,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.red,
  },
  sequencerTitle: {
    fontSize: 18,
    color: HAOS_COLORS.red,
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
    position: 'relative',
    width: '23%',
    marginBottom: 10,
  },
  stepGlowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0066FF', // DMX Blue
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  velocityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00D9FF', // DMX Cyan
    opacity: 0.4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    zIndex: 1,
  },
  tempoPulse: {
    position: 'absolute',
    top: -2,
    right: -12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D9FF', // DMX Cyan pulse
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
    borderColor: HAOS_COLORS.red,
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
    color: HAOS_COLORS.red,
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
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,102,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.red,
  },
  infoTitle: {
    fontSize: 18,
    color: HAOS_COLORS.red,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
});

export default DMXScreen;
