/**
 * String Instruments Test Screen
 * Tests the new String Synthesis backend (Violin, Viola, Cello)
 * Location: mobile/src/screens/StringInstrumentsTestScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import PythonAudioEngine from '../services/PythonAudioEngine';

const HAOS_COLORS = {
  gold: '#D4AF37',
  orange: '#FF6B35',
  silver: '#C0C0C0',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const NOTES = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
};

const StringInstrumentsTestScreen = ({ navigation }) => {
  const [audioEngine] = useState(() => new PythonAudioEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Controls
  const [velocity, setVelocity] = useState(0.7);
  const [duration, setDuration] = useState(1.0);
  const [vibratoRate, setVibratoRate] = useState(5.0);
  const [vibratoDepth, setVibratoDepth] = useState(0.01);
  
  useEffect(() => {
    audioEngine.initialize().then(() => {
      setIsInitialized(true);
    }).catch(error => {
      Alert.alert('Error', 'Failed to initialize audio engine: ' + error.message);
    });
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);

  const playNote = async (instrument, frequency, noteName) => {
    if (!isInitialized) {
      Alert.alert('Audio Engine', 'Please wait, initializing...');
      return;
    }

    try {
      switch (instrument) {
        case 'violin':
          await audioEngine.playViolin(frequency, duration, velocity, vibratoRate, vibratoDepth);
          break;
        case 'viola':
          await audioEngine.playViola(frequency, duration, velocity, vibratoRate, vibratoDepth);
          break;
        case 'cello':
          await audioEngine.playCello(frequency, duration, velocity, vibratoRate, vibratoDepth);
          break;
      }
    } catch (error) {
      Alert.alert('Playback Error', error.message);
    }
  };

  const renderInstrumentSection = (instrument, color, notes) => (
    <View style={styles.instrumentSection}>
      <Text style={[styles.instrumentTitle, { color }]}>
        {instrument.toUpperCase()}
      </Text>
      
      <View style={styles.notesGrid}>
        {notes.map(({ note, freq }) => (
          <TouchableOpacity
            key={`${instrument}-${note}`}
            style={[styles.noteButton, { borderColor: color }]}
            onPress={() => playNote(instrument, freq, note)}
          >
            <Text style={styles.noteText}>{note}</Text>
            <Text style={styles.freqText}>{freq.toFixed(1)} Hz</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, HAOS_COLORS.darkGray, HAOS_COLORS.dark]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>STRING SYNTHESIS TEST</Text>
          <Text style={styles.subtitle}>
            {isInitialized ? '✅ Ready' : '⏳ Initializing...'}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>PARAMETERS</Text>
          
          <View style={styles.control}>
            <Text style={styles.controlLabel}>Velocity: {velocity.toFixed(2)}</Text>
            <Slider
              style={styles.slider}
              value={velocity}
              onValueChange={setVelocity}
              minimumValue={0.1}
              maximumValue={1.0}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor="#333"
            />
          </View>

          <View style={styles.control}>
            <Text style={styles.controlLabel}>Duration: {duration.toFixed(1)}s</Text>
            <Slider
              style={styles.slider}
              value={duration}
              onValueChange={setDuration}
              minimumValue={0.3}
              maximumValue={3.0}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor="#333"
            />
          </View>

          <View style={styles.control}>
            <Text style={styles.controlLabel}>Vibrato Rate: {vibratoRate.toFixed(1)} Hz</Text>
            <Slider
              style={styles.slider}
              value={vibratoRate}
              onValueChange={setVibratoRate}
              minimumValue={3.0}
              maximumValue={8.0}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor="#333"
            />
          </View>

          <View style={styles.control}>
            <Text style={styles.controlLabel}>Vibrato Depth: {(vibratoDepth * 100).toFixed(1)}%</Text>
            <Slider
              style={styles.slider}
              value={vibratoDepth}
              onValueChange={setVibratoDepth}
              minimumValue={0.005}
              maximumValue={0.03}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor="#333"
            />
          </View>
        </View>

        {/* Violin */}
        {renderInstrumentSection('violin', HAOS_COLORS.gold, [
          { note: 'G3', freq: NOTES.G3 },
          { note: 'A3', freq: NOTES.A3 },
          { note: 'B3', freq: NOTES.B3 },
          { note: 'C4', freq: NOTES.C4 },
          { note: 'D4', freq: NOTES.D4 },
          { note: 'E4', freq: NOTES.E4 },
          { note: 'F4', freq: NOTES.F4 },
          { note: 'G4', freq: NOTES.G4 },
          { note: 'A4', freq: NOTES.A4 },
          { note: 'B4', freq: NOTES.B4 },
          { note: 'C5', freq: NOTES.C5 },
        ])}

        {/* Viola */}
        {renderInstrumentSection('viola', HAOS_COLORS.orange, [
          { note: 'C3', freq: NOTES.C3 },
          { note: 'D3', freq: NOTES.D3 },
          { note: 'E3', freq: NOTES.E3 },
          { note: 'F3', freq: NOTES.F3 },
          { note: 'G3', freq: NOTES.G3 },
          { note: 'A3', freq: NOTES.A3 },
          { note: 'B3', freq: NOTES.B3 },
          { note: 'C4', freq: NOTES.C4 },
          { note: 'D4', freq: NOTES.D4 },
          { note: 'E4', freq: NOTES.E4 },
        ])}

        {/* Cello */}
        {renderInstrumentSection('cello', HAOS_COLORS.silver, [
          { note: 'C3', freq: NOTES.C3 },
          { note: 'D3', freq: NOTES.D3 },
          { note: 'E3', freq: NOTES.E3 },
          { note: 'F3', freq: NOTES.F3 },
          { note: 'G3', freq: NOTES.G3 },
          { note: 'A3', freq: NOTES.A3 },
          { note: 'B3', freq: NOTES.B3 },
          { note: 'C4', freq: NOTES.C4 },
        ])}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎻 Backend: Python FastAPI (port 8000)
          </Text>
          <Text style={styles.footerText}>
            🎵 8-Harmonic Additive Synthesis + Vibrato + Bow Noise
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backButtonText: {
    color: HAOS_COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: HAOS_COLORS.silver,
  },
  controlsSection: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    marginBottom: 15,
  },
  control: {
    marginBottom: 20,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  instrumentSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  instrumentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noteButton: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  freqText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default StringInstrumentsTestScreen;
