/**
 * HAOS.fm CR-78 - Vintage Rhythm Machine
 * 34 preset patterns, accent control, metal mode
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
  green: '#00ff94',
  lime: '#88ff00',
  cyan: '#00ffff',
  blue: '#00D9FF',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const PRESET_PATTERNS = [
  { id: 1, name: 'WALTZ', beats: 3 },
  { id: 2, name: 'FOXTROT', beats: 4 },
  { id: 3, name: 'TANGO', beats: 4 },
  { id: 4, name: 'SAMBA', beats: 4 },
  { id: 5, name: 'BOSSA NOVA', beats: 4 },
  { id: 6, name: 'MAMBO', beats: 4 },
  { id: 7, name: 'CHA CHA', beats: 4 },
  { id: 8, name: 'BOOGIE', beats: 4 },
  { id: 9, name: 'SWING', beats: 4 },
  { id: 10, name: 'SLOW ROCK', beats: 4 },
  { id: 11, name: 'ROCK 1', beats: 4 },
  { id: 12, name: 'ROCK 2', beats: 4 },
  { id: 13, name: 'ROCK 3', beats: 4 },
  { id: 14, name: 'DISCO 1', beats: 4 },
  { id: 15, name: 'DISCO 2', beats: 4 },
  { id: 16, name: 'DISCO 3', beats: 4 },
];

const DRUM_INSTRUMENTS = [
  { id: 'kick', name: 'BASS DRUM', color: '#ff0066' },
  { id: 'snare', name: 'SNARE', color: '#ffcc00' },
  { id: 'rimshot', name: 'RIM SHOT', color: '#ff9900' },
  { id: 'hihat', name: 'HI-HAT', color: '#00ffff' },
  { id: 'cymbal', name: 'CYMBAL', color: '#0099ff' },
  { id: 'tambourine', name: 'TAMBOURINE', color: '#88ff00' },
  { id: 'cowbell', name: 'COWBELL', color: '#ff8800' },
  { id: 'claves', name: 'CLAVES', color: '#9966ff' },
  { id: 'guiro', name: 'GUIRO', color: '#ff66ff' },
];

const CR78Screen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [selectedPattern, setSelectedPattern] = useState(1);
  const [metalMode, setMetalMode] = useState(false);
  const [accentLevel, setAccentLevel] = useState(70);
  
  // Individual instrument volumes
  const [volumes, setVolumes] = useState(
    DRUM_INSTRUMENTS.reduce((acc, inst) => ({
      ...acc,
      [inst.id]: 80
    }), {})
  );
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const patternPulse = useRef(new Animated.Value(1)).current;
  const instrumentGlows = useRef(
    DRUM_INSTRUMENTS.reduce((acc, inst) => ({
      ...acc,
      [inst.id]: new Animated.Value(0)
    }), {})
  ).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Pattern pulse animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = (60 / tempo) * 1000;
    const timer = setInterval(() => {
      // Pattern pulse animation
      Animated.sequence([
        Animated.timing(patternPulse, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(patternPulse, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Trigger random instrument glows (simulating rhythm pattern)
      const activeInstruments = DRUM_INSTRUMENTS.slice(0, Math.floor(Math.random() * 4) + 2);
      activeInstruments.forEach(inst => {
        Animated.sequence([
          Animated.timing(instrumentGlows[inst.id], {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(instrumentGlows[inst.id], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [isPlaying, tempo]);
  
  const updateVolume = (instrumentId, value) => {
    setVolumes(prev => ({
      ...prev,
      [instrumentId]: value
    }));
  };
  
  const currentPattern = PRESET_PATTERNS.find(p => p.id === selectedPattern);
  
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
          <Text style={styles.headerIcon}>🎼</Text>
          <Text style={styles.headerTitle}>CR-78</Text>
          <Text style={styles.headerSubtitle}>COMPURHYTHM • 34 PRESET PATTERNS</Text>
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
              onValueChange={setTempo}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <View style={styles.tempoValueContainer}>
              {isPlaying && (
                <Animated.View
                  style={[
                    styles.tempoPulse,
                    {
                      transform: [{ scale: patternPulse }],
                    },
                  ]}
                />
              )}
              <Text style={styles.controlValue}>{Math.round(tempo)}</Text>
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ACCENT</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={accentLevel}
              onValueChange={setAccentLevel}
              minimumTrackTintColor={HAOS_COLORS.lime}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.lime}
            />
            <Text style={styles.controlValue}>{Math.round(accentLevel)}%</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.metalButton, metalMode && styles.metalButtonActive]}
            onPress={() => setMetalMode(!metalMode)}
          >
            <Text style={[
              styles.metalText,
              metalMode && styles.metalTextActive,
            ]}>
              {metalMode ? '✓ METAL MODE' : 'METAL MODE'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Pattern Selector */}
        <View style={styles.patternSection}>
          <Text style={styles.sectionTitle}>PRESET PATTERNS</Text>
          <Animated.View 
            style={[
              styles.currentPattern,
              isPlaying && { transform: [{ scale: patternPulse }] }
            ]}
          >
            <Text style={styles.patternNumber}>{selectedPattern}</Text>
            <Text style={styles.patternName}>{currentPattern?.name}</Text>
            <Text style={styles.patternBeats}>{currentPattern?.beats}/4</Text>
          </Animated.View>
          
          <View style={styles.patternGrid}>
            {PRESET_PATTERNS.map(pattern => (
              <TouchableOpacity
                key={pattern.id}
                style={[
                  styles.patternButton,
                  selectedPattern === pattern.id && styles.patternButtonActive,
                ]}
                onPress={() => setSelectedPattern(pattern.id)}
              >
                <Text style={[
                  styles.patternButtonNumber,
                  selectedPattern === pattern.id && styles.patternButtonNumberActive,
                ]}>
                  {pattern.id}
                </Text>
                <Text style={[
                  styles.patternButtonName,
                  selectedPattern === pattern.id && styles.patternButtonNameActive,
                ]}>
                  {pattern.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Instrument Volumes */}
        <View style={styles.instrumentsSection}>
          <Text style={styles.sectionTitle}>INSTRUMENT LEVELS</Text>
          {DRUM_INSTRUMENTS.map(inst => (
            <View key={inst.id} style={styles.instrumentControl}>
              {/* Instrument Glow Ring */}
              <Animated.View
                style={[
                  styles.instrumentGlow,
                  {
                    borderColor: inst.color,
                    shadowColor: inst.color,
                    opacity: instrumentGlows[inst.id],
                    transform: [{
                      scale: instrumentGlows[inst.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                      }),
                    }],
                  },
                ]}
              />
              
              {/* Volume Bar Indicator */}
              <View style={[
                styles.volumeBar,
                {
                  backgroundColor: inst.color,
                  height: `${volumes[inst.id]}%`
                }
              ]} />
              
              <LinearGradient
                colors={[inst.color + '30', inst.color + '10']}
                style={styles.instrumentCard}
              >
                <Text style={[styles.instrumentName, { color: inst.color }]}>
                  {inst.name}
                </Text>
                <View style={styles.volumeControl}>
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={100}
                    value={volumes[inst.id]}
                    onValueChange={(val) => updateVolume(inst.id, val)}
                    minimumTrackTintColor={inst.color}
                    maximumTrackTintColor={HAOS_COLORS.mediumGray}
                    thumbTintColor={inst.color}
                  />
                  <Text style={styles.volumeValue}>{Math.round(volumes[inst.id])}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
        
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>CR-78 FEATURES</Text>
          <Text style={styles.infoText}>
            • 34 preset rhythm patterns{'\n'}
            • Waltz, Foxtrot, Tango, Samba, Bossa Nova{'\n'}
            • Rock, Disco, Boogie variations{'\n'}
            • Metal mode for sharper sounds{'\n'}
            • Individual instrument volume control{'\n'}
            • Accent control for dynamics{'\n'}
            • Classic analog drum sounds
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
  metalButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.lime,
    alignItems: 'center',
  },
  metalButtonActive: {
    backgroundColor: HAOS_COLORS.lime,
  },
  metalText: {
    fontSize: 14,
    color: HAOS_COLORS.lime,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  metalTextActive: {
    color: '#000',
  },
  patternSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 20,
  },
  currentPattern: {
    padding: 30,
    borderRadius: 16,
    backgroundColor: HAOS_COLORS.green,
    alignItems: 'center',
    marginBottom: 20,
  },
  patternNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  patternName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 5,
  },
  patternBeats: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: '600',
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patternButton: {
    width: '48%',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  patternButtonActive: {
    backgroundColor: 'rgba(0,255,148,0.2)',
    borderColor: HAOS_COLORS.green,
    borderWidth: 2,
  },
  patternButtonNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  patternButtonNumberActive: {
    color: HAOS_COLORS.green,
  },
  patternButtonName: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  patternButtonNameActive: {
    color: '#fff',
  },
  instrumentsSection: {
    padding: 20,
  },
  instrumentControl: {
    position: 'relative',
    marginBottom: 10,
  },
  instrumentGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 15,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  volumeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1,
  },
  tempoPulse: {
    position: 'absolute',
    top: -2,
    right: -12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFA500', // Amber for CR-78
  },
  tempoValueContainer: {
    position: 'relative',
    minWidth: 50,
    alignItems: 'center',
  },
  instrumentCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instrumentName: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    marginRight: 10,
  },
  volumeValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,148,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
  },
  infoTitle: {
    fontSize: 18,
    color: HAOS_COLORS.green,
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

export default CR78Screen;
