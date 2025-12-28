import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Knob from '../components/Knob';
import audioEngine from '../services/audioEngine';

export default function BuilderWorkspaceScreen({ route }) {
  const [loadedPreset, setLoadedPreset] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState('KICK');
  
  // Instrument parameters
  const [frequency, setFrequency] = useState(60);
  const [decay, setDecay] = useState(0.5);
  const [punch, setPunch] = useState(0.3);
  const [distortion, setDistortion] = useState(0.1);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    audioEngine.initialize();
    
    // Load preset if passed from navigation
    if (route?.params?.preset) {
      loadPreset(route.params.preset);
    }
    
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  const loadPreset = (preset) => {
    if (!preset?.parameters) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (preset.parameters.instrument) {
      setSelectedInstrument(preset.parameters.instrument);
    }
    
    if (preset.parameters.frequency) setFrequency(preset.parameters.frequency);
    if (preset.parameters.decay) setDecay(preset.parameters.decay);
    if (preset.parameters.punch) setPunch(preset.parameters.punch);
    if (preset.parameters.distortion) setDistortion(preset.parameters.distortion);
    if (preset.parameters.volume) setVolume(preset.parameters.volume);
    
    setLoadedPreset(preset);
    Alert.alert('✅ Preset Loaded', `"${preset.name}" loaded successfully`);
  };

  const instruments = [
    { id: 'KICK', emoji: '🥁', color: '#ff0055' },
    { id: 'SUB', emoji: '🔊', color: '#8800ff' },
    { id: 'LEAD', emoji: '🎸', color: '#00ff94' },
    { id: 'SYNTH', emoji: '🎹', color: '#00aaff' },
    { id: 'FX', emoji: '✨', color: '#ffaa00' },
    { id: 'PERC', emoji: '🪘', color: '#ff6600' },
    { id: 'HAT', emoji: '🎩', color: '#00ff88' },
    { id: 'RIDE', emoji: '🥏', color: '#ff0088' },
  ];

  const handleInstrumentSelect = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedInstrument(id);
    
    // Adjust default parameters based on instrument type
    switch (id) {
      case 'KICK':
        setFrequency(60);
        setDecay(0.5);
        setPunch(0.3);
        break;
      case 'SUB':
        setFrequency(40);
        setDecay(0.8);
        setPunch(0.1);
        break;
      case 'LEAD':
        setFrequency(440);
        setDecay(0.3);
        setPunch(0.5);
        break;
      case 'SYNTH':
        setFrequency(220);
        setDecay(0.6);
        setPunch(0.2);
        break;
      case 'FX':
        setFrequency(1000);
        setDecay(1.5);
        setPunch(0.0);
        break;
      case 'PERC':
        setFrequency(200);
        setDecay(0.2);
        setPunch(0.8);
        break;
      case 'HAT':
        setFrequency(8000);
        setDecay(0.05);
        setPunch(0.9);
        break;
      case 'RIDE':
        setFrequency(5000);
        setDecay(0.3);
        setPunch(0.4);
        break;
    }
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Play the custom instrument
    audioEngine.setOscillator('sine');
    audioEngine.setFilter('lowpass', frequency * 2, 2);
    audioEngine.setADSR(0.001, decay, 0, decay);
    audioEngine.setVolume(volume);
    audioEngine.playNote(frequency);
    
    setTimeout(() => {
      audioEngine.stopNote(frequency);
    }, decay * 1000);
  };

  const selectedInstrumentData = instruments.find(i => i.id === selectedInstrument);

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {loadedPreset ? `Preset: ${loadedPreset.name}` : '🏗️ BUILDER'}
          </Text>
          <Text style={styles.subtitle}>Frequency-Based Instrument Builder</Text>
        </View>

        {/* Instrument Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT INSTRUMENT</Text>
          <View style={styles.instrumentGrid}>
            {instruments.map((instrument) => (
              <TouchableOpacity
                key={instrument.id}
                style={[
                  styles.instrumentButton,
                  selectedInstrument === instrument.id && {
                    backgroundColor: instrument.color,
                    borderColor: instrument.color,
                  },
                ]}
                onPress={() => handleInstrumentSelect(instrument.id)}
              >
                <Text style={styles.instrumentEmoji}>{instrument.emoji}</Text>
                <Text
                  style={[
                    styles.instrumentText,
                    selectedInstrument === instrument.id && styles.instrumentTextActive,
                  ]}
                >
                  {instrument.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Instrument Display */}
        <View style={[styles.section, { backgroundColor: selectedInstrumentData?.color + '22' }]}>
          <View style={styles.selectedInstrument}>
            <Text style={styles.selectedEmoji}>{selectedInstrumentData?.emoji}</Text>
            <Text style={[styles.selectedText, { color: selectedInstrumentData?.color }]}>
              {selectedInstrument}
            </Text>
          </View>
        </View>

        {/* Frequency Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREQUENCY</Text>
          <View style={styles.knobRow}>
            <Knob
              label="Hz"
              value={frequency}
              onChange={setFrequency}
              min={20}
              max={20000}
              size={100}
            />
          </View>
          <Text style={styles.paramValue}>{Math.round(frequency)} Hz</Text>
        </View>

        {/* Shape Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHAPE</Text>
          <View style={styles.knobRow}>
            <Knob
              label="Decay"
              value={decay}
              onChange={setDecay}
              min={0.01}
              max={3}
              size={90}
            />
            <Knob
              label="Punch"
              value={punch}
              onChange={setPunch}
              min={0}
              max={1}
              size={90}
            />
          </View>
        </View>

        {/* Tone Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TONE</Text>
          <View style={styles.knobRow}>
            <Knob
              label="Distortion"
              value={distortion}
              onChange={setDistortion}
              min={0}
              max={1}
              size={90}
            />
            <Knob
              label="Volume"
              value={volume}
              onChange={setVolume}
              min={0}
              max={1}
              size={90}
            />
          </View>
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: selectedInstrumentData?.color }]}
          onPress={handlePlay}
          activeOpacity={0.8}
        >
          <Text style={styles.playEmoji}>▶️</Text>
          <Text style={styles.playText}>PLAY {selectedInstrument}</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🎨 Build custom instruments by adjusting frequency, decay, punch, and distortion
          </Text>
          <Text style={styles.infoText}>
            🎵 Each instrument type has optimized starting parameters
          </Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    color: '#00ff94',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#00ff94',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 2,
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  instrumentButton: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  instrumentEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  instrumentText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  instrumentTextActive: {
    color: '#0a0a0a',
  },
  selectedInstrument: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  selectedEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  selectedText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  paramValue: {
    color: '#00ff94',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  playEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  playText: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00ff94',
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});
