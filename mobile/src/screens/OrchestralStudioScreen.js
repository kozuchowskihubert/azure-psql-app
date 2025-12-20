/**
 * HAOS.fm Orchestral Studio
 * Virtual instrument studio with articulation controls
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
import { virtualInstruments } from '../AudioEngine';
import { AnimatedKnob } from '../UI/Components';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  gold: '#FFD700',
  pink: '#FF1493',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const OrchestralStudioScreen = ({ navigation }) => {
  // State management
  const [selectedInstrument, setSelectedInstrument] = useState('violin');
  const [selectedArticulation, setSelectedArticulation] = useState('sustain');
  const [selectedCategory, setSelectedCategory] = useState('orchestral');
  const [activeNotes, setActiveNotes] = useState([]);
  
  // Parameters
  const [params, setParams] = useState({
    volume: 0.8,
    expression: 0.7,
    vibrato: 0.3,
    attack: 0.01,
    release: 0.5,
    brightness: 0.6,
    roomSize: 0.4,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    initializeStudio();
  }, []);
  
  const initializeStudio = async () => {
    await virtualInstruments.initialize();
    virtualInstruments.setInstrument('violin');
    virtualInstruments.setArticulation('sustain');
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const selectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    virtualInstruments.setInstrument(instrument);
    
    // Get first articulation for this instrument
    const info = virtualInstruments.getInstrumentInfo();
    if (info && info.articulations && info.articulations.length > 0) {
      const firstArticulation = info.articulations[0];
      setSelectedArticulation(firstArticulation);
      virtualInstruments.setArticulation(firstArticulation);
    }
  };
  
  const selectArticulation = (articulation) => {
    setSelectedArticulation(articulation);
    virtualInstruments.setArticulation(articulation);
  };
  
  const selectCategory = (category) => {
    setSelectedCategory(category);
    const instruments = virtualInstruments.getInstrumentsByType(category);
    if (instruments && instruments.length > 0) {
      selectInstrument(instruments[0]);
    }
  };
  
  const updateParameter = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    virtualInstruments.setParameter(param, value);
  };
  
  const playNote = (note) => {
    const velocity = Math.round(params.expression * 127);
    const noteId = virtualInstruments.playNote(note, velocity);
    setActiveNotes(prev => [...prev, { note, noteId }]);
  };
  
  const stopNote = (note) => {
    const noteData = activeNotes.find(n => n.note === note);
    if (noteData) {
      virtualInstruments.stopNote(noteData.noteId);
      setActiveNotes(prev => prev.filter(n => n.note !== note));
    }
  };
  
  const categories = [
    { id: 'orchestral', label: 'ORCHESTRAL', icon: '🎻', color: HAOS_COLORS.purple },
    { id: 'band', label: 'BAND', icon: '🎸', color: HAOS_COLORS.orange },
    { id: 'brass', label: 'BRASS', icon: '🎺', color: HAOS_COLORS.gold },
    { id: 'keyboard', label: 'KEYBOARD', icon: '🎹', color: HAOS_COLORS.cyan },
  ];
  
  const instrumentsByCategory = {
    orchestral: [
      { id: 'strings', label: 'STRINGS', icon: '🎻', range: 'G2-E6' },
      { id: 'violin', label: 'VIOLIN', icon: '🎻', range: 'G3-A7' },
      { id: 'cello', label: 'CELLO', icon: '🎻', range: 'C2-A5' },
    ],
    band: [
      { id: 'bassGuitar', label: 'BASS', icon: '🎸', range: 'E1-C4' },
      { id: 'electricGuitar', label: 'E.GUITAR', icon: '⚡', range: 'E2-E6' },
      { id: 'acousticGuitar', label: 'A.GUITAR', icon: '🎸', range: 'E2-B5' },
    ],
    brass: [
      { id: 'trumpet', label: 'TRUMPET', icon: '🎺', range: 'E3-C6' },
      { id: 'saxophone', label: 'SAXOPHONE', icon: '🎷', range: 'Bb2-F#6' },
    ],
    keyboard: [
      { id: 'piano', label: 'PIANO', icon: '🎹', range: 'A0-C8' },
      { id: 'electricPiano', label: 'E.PIANO', icon: '⚡', range: 'A0-C8' },
    ],
  };
  
  const notes = [
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  ];
  
  // Get current instrument info
  const currentInstrumentInfo = virtualInstruments.getInstrumentInfo();
  const availableArticulations = currentInstrumentInfo?.articulations || ['sustain'];
  const currentInstruments = instrumentsByCategory[selectedCategory] || [];
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#1a0044', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ORCHESTRAL STUDIO</Text>
          <Text style={styles.subtitle}>VIRTUAL INSTRUMENTS</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎼 INSTRUMENT CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => selectCategory(category.id)}
                >
                  <LinearGradient
                    colors={
                      selectedCategory === category.id
                        ? [category.color, category.color + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.id && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Instrument Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 SELECT INSTRUMENT</Text>
            <View style={styles.instrumentGrid}>
              {currentInstruments.map((instrument) => (
                <TouchableOpacity
                  key={instrument.id}
                  style={[
                    styles.instrumentCard,
                    selectedInstrument === instrument.id && styles.instrumentCardActive,
                  ]}
                  onPress={() => selectInstrument(instrument.id)}
                >
                  <LinearGradient
                    colors={
                      selectedInstrument === instrument.id
                        ? [HAOS_COLORS.purple, HAOS_COLORS.purple + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.instrumentGradient}
                  >
                    <Text style={styles.instrumentIcon}>{instrument.icon}</Text>
                    <Text
                      style={[
                        styles.instrumentLabel,
                        selectedInstrument === instrument.id && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {instrument.label}
                    </Text>
                    <Text
                      style={[
                        styles.instrumentRange,
                        selectedInstrument === instrument.id && { color: 'rgba(0,0,0,0.7)' },
                      ]}
                    >
                      {instrument.range}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Articulation Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 ARTICULATION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableArticulations.map((articulation) => (
                <TouchableOpacity
                  key={articulation}
                  style={[
                    styles.articulationButton,
                    selectedArticulation === articulation && styles.articulationButtonActive,
                  ]}
                  onPress={() => selectArticulation(articulation)}
                >
                  <Text
                    style={[
                      styles.articulationLabel,
                      selectedArticulation === articulation && styles.articulationLabelActive,
                    ]}
                  >
                    {articulation.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Instrument Info */}
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <LinearGradient
                colors={[HAOS_COLORS.darkGray, HAOS_COLORS.mediumGray]}
                style={styles.infoGradient}
              >
                <Text style={styles.infoTitle}>
                  {currentInstrumentInfo?.name?.toUpperCase() || 'INSTRUMENT'}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoValue}>
                    {currentInstrumentInfo?.type?.toUpperCase() || '-'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Range:</Text>
                  <Text style={styles.infoValue}>
                    {currentInstrumentInfo?.range?.low || 'C2'} - {currentInstrumentInfo?.range?.high || 'C6'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Articulations:</Text>
                  <Text style={styles.infoValue}>
                    {availableArticulations.length}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current:</Text>
                  <Text style={[styles.infoValue, { color: HAOS_COLORS.green }]}>
                    {selectedArticulation.toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
          
          {/* Expression Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎚️ EXPRESSION</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="VOLUME"
                value={params.volume}
                min={0}
                max={1}
                onChange={(val) => updateParameter('volume', val)}
                color={HAOS_COLORS.green}
                size={90}
              />
              <AnimatedKnob
                label="EXPRESSION"
                value={params.expression}
                min={0}
                max={1}
                onChange={(val) => updateParameter('expression', val)}
                color={HAOS_COLORS.cyan}
                size={90}
              />
              <AnimatedKnob
                label="VIBRATO"
                value={params.vibrato}
                min={0}
                max={1}
                onChange={(val) => updateParameter('vibrato', val)}
                color={HAOS_COLORS.purple}
                size={90}
              />
            </View>
          </View>
          
          {/* Envelope Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 ENVELOPE</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="ATTACK"
                value={params.attack}
                min={0.001}
                max={2}
                onChange={(val) => updateParameter('attack', val)}
                color={HAOS_COLORS.cyan}
                unit=" s"
              />
              <AnimatedKnob
                label="RELEASE"
                value={params.release}
                min={0.01}
                max={5}
                onChange={(val) => updateParameter('release', val)}
                color={HAOS_COLORS.orange}
                unit=" s"
              />
            </View>
          </View>
          
          {/* Timbre Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 TIMBRE</Text>
            <View style={styles.knobRow}>
              <AnimatedKnob
                label="BRIGHTNESS"
                value={params.brightness}
                min={0}
                max={1}
                onChange={(val) => updateParameter('brightness', val)}
                color={HAOS_COLORS.gold}
              />
              <AnimatedKnob
                label="ROOM SIZE"
                value={params.roomSize}
                min={0}
                max={1}
                onChange={(val) => updateParameter('roomSize', val)}
                color={HAOS_COLORS.purple}
              />
            </View>
          </View>
          
          {/* Keyboard */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎹 KEYBOARD</Text>
            
            {/* Octave 3 */}
            <View style={styles.keyboard}>
              {notes.slice(0, 12).map((note) => {
                const isBlackKey = note.includes('#');
                const isActive = activeNotes.some(n => n.note === note);
                
                return (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.key,
                      isBlackKey ? styles.blackKey : styles.whiteKey,
                      isActive && styles.keyActive,
                    ]}
                    onPressIn={() => playNote(note)}
                    onPressOut={() => stopNote(note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        isBlackKey && styles.blackKeyLabel,
                      ]}
                    >
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Octave 4 */}
            <View style={[styles.keyboard, { marginTop: 10 }]}>
              {notes.slice(12, 24).map((note) => {
                const isBlackKey = note.includes('#');
                const isActive = activeNotes.some(n => n.note === note);
                
                return (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.key,
                      isBlackKey ? styles.blackKey : styles.whiteKey,
                      isActive && styles.keyActive,
                    ]}
                    onPressIn={() => playNote(note)}
                    onPressOut={() => stopNote(note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        isBlackKey && styles.blackKeyLabel,
                      ]}
                    >
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Octave 5 */}
            <View style={[styles.keyboard, { marginTop: 10 }]}>
              {notes.slice(24, 36).map((note) => {
                const isBlackKey = note.includes('#');
                const isActive = activeNotes.some(n => n.note === note);
                
                return (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.key,
                      isBlackKey ? styles.blackKey : styles.whiteKey,
                      isActive && styles.keyActive,
                    ]}
                    onPressIn={() => playNote(note)}
                    onPressOut={() => stopNote(note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        isBlackKey && styles.blackKeyLabel,
                      ]}
                    >
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: HAOS_COLORS.purple,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: HAOS_COLORS.gold,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    marginBottom: 15,
    letterSpacing: 1,
  },
  categoryButton: {
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryButtonActive: {
    elevation: 5,
    shadowColor: HAOS_COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  categoryGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryLabel: {
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    fontSize: 14,
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  instrumentCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instrumentCardActive: {
    elevation: 5,
    shadowColor: HAOS_COLORS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  instrumentGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  instrumentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  instrumentLabel: {
    color: HAOS_COLORS.purple,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  instrumentRange: {
    color: HAOS_COLORS.cyan,
    fontSize: 10,
    marginTop: 4,
  },
  articulationButton: {
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: HAOS_COLORS.purple + '40',
  },
  articulationButtonActive: {
    backgroundColor: HAOS_COLORS.purple,
    borderColor: HAOS_COLORS.purple,
  },
  articulationLabel: {
    color: HAOS_COLORS.purple,
    fontSize: 13,
    fontWeight: 'bold',
  },
  articulationLabelActive: {
    color: HAOS_COLORS.dark,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.purple + '40',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.purple,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: HAOS_COLORS.cyan,
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoValue: {
    color: HAOS_COLORS.green,
    fontSize: 14,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  keyboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  key: {
    margin: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  whiteKey: {
    backgroundColor: HAOS_COLORS.mediumGray,
    width: width / 13 - 6,
    height: 55,
    borderWidth: 1,
    borderColor: HAOS_COLORS.purple + '40',
  },
  blackKey: {
    backgroundColor: HAOS_COLORS.dark,
    width: width / 18 - 6,
    height: 40,
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold + '40',
  },
  keyActive: {
    backgroundColor: HAOS_COLORS.purple,
    transform: [{ scale: 0.95 }],
  },
  keyLabel: {
    color: HAOS_COLORS.purple,
    fontSize: 10,
    fontWeight: 'bold',
  },
  blackKeyLabel: {
    color: HAOS_COLORS.gold,
  },
});

export default OrchestralStudioScreen;
