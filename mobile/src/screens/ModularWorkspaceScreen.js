import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Knob from '../components/Knob';
import ADSREnvelope from '../components/ADSREnvelope';
import Keyboard from '../components/Keyboard';
import audioEngine from '../services/audioEngine';

export default function ModularWorkspaceScreen({ route }) {
  const [loadedPreset, setLoadedPreset] = useState(null);
  
  // Oscillator 1
  const [osc1Waveform, setOsc1Waveform] = useState('sawtooth');
  const [osc1Frequency, setOsc1Frequency] = useState(440);
  const [osc1Level, setOsc1Level] = useState(0.7);
  
  // Oscillator 2
  const [osc2Waveform, setOsc2Waveform] = useState('square');
  const [osc2Detune, setOsc2Detune] = useState(0);
  const [osc2Level, setOsc2Level] = useState(0.5);
  
  // Filter
  const [filterType, setFilterType] = useState('lowpass');
  const [filterFrequency, setFilterFrequency] = useState(2000);
  const [filterQ, setFilterQ] = useState(5);
  
  // ADSR
  const [adsr, setAdsr] = useState({
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
  });
  
  // Master
  const [volume, setVolume] = useState(0.7);

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
    
    // Load oscillators
    if (preset.parameters.osc1) {
      setOsc1Waveform(preset.parameters.osc1.waveform || 'sawtooth');
      setOsc1Level(preset.parameters.osc1.level || 0.7);
    }
    
    if (preset.parameters.osc2) {
      setOsc2Waveform(preset.parameters.osc2.waveform || 'square');
      setOsc2Detune(preset.parameters.osc2.detune || 0);
      setOsc2Level(preset.parameters.osc2.level || 0.5);
    }
    
    // Load filter
    if (preset.parameters.filter) {
      setFilterType(preset.parameters.filter.type || 'lowpass');
      setFilterFrequency(preset.parameters.filter.frequency || 2000);
      setFilterQ(preset.parameters.filter.Q || 5);
    }
    
    // Load ADSR
    if (preset.parameters.adsr) {
      setAdsr(preset.parameters.adsr);
    }
    
    // Load volume
    if (preset.parameters.volume !== undefined) {
      setVolume(preset.parameters.volume);
    }
    
    setLoadedPreset(preset);
    Alert.alert('✅ Preset Loaded', `"${preset.name}" loaded successfully`);
  };

  // Update audio engine when parameters change
  useEffect(() => {
    audioEngine.setOscillator(osc1Waveform);
    audioEngine.setFilter(filterType, filterFrequency, filterQ);
    audioEngine.setADSR(adsr.attack, adsr.decay, adsr.sustain, adsr.release);
    audioEngine.setVolume(volume);
  }, [osc1Waveform, filterType, filterFrequency, filterQ, adsr, volume]);

  const handleNoteOn = (note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioEngine.playNote(note);
  };

  const handleNoteOff = (note) => {
    audioEngine.stopNote(note);
  };

  const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];
  const filterTypes = ['lowpass', 'highpass', 'bandpass', 'notch'];

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {loadedPreset ? `Preset: ${loadedPreset.name}` : '🔌 MODULAR Synthesizer'}
          </Text>
          <Text style={styles.subtitle}>ARP 2600 Style</Text>
        </View>

        {/* Oscillator 1 Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OSCILLATOR 1</Text>
          
          <View style={styles.waveformSelector}>
            {waveforms.map((waveform) => (
              <TouchableOpacity
                key={waveform}
                style={[
                  styles.waveformButton,
                  osc1Waveform === waveform && styles.waveformButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setOsc1Waveform(waveform);
                }}
              >
                <Text
                  style={[
                    styles.waveformText,
                    osc1Waveform === waveform && styles.waveformTextActive,
                  ]}
                >
                  {waveform.charAt(0).toUpperCase() + waveform.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.knobRow}>
            <Knob
              label="Level"
              value={osc1Level}
              onChange={setOsc1Level}
              min={0}
              max={1}
              size={80}
            />
          </View>
        </View>

        {/* Oscillator 2 Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OSCILLATOR 2</Text>
          
          <View style={styles.waveformSelector}>
            {waveforms.map((waveform) => (
              <TouchableOpacity
                key={waveform}
                style={[
                  styles.waveformButton,
                  osc2Waveform === waveform && styles.waveformButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setOsc2Waveform(waveform);
                }}
              >
                <Text
                  style={[
                    styles.waveformText,
                    osc2Waveform === waveform && styles.waveformTextActive,
                  ]}
                >
                  {waveform.charAt(0).toUpperCase() + waveform.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.knobRow}>
            <Knob
              label="Detune"
              value={osc2Detune}
              onChange={setOsc2Detune}
              min={-50}
              max={50}
              size={80}
            />
            <Knob
              label="Level"
              value={osc2Level}
              onChange={setOsc2Level}
              min={0}
              max={1}
              size={80}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILTER</Text>
          
          <View style={styles.filterSelector}>
            {filterTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.filterButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilterType(type);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterType === type && styles.filterTextActive,
                  ]}
                >
                  {type.replace('pass', '').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.knobRow}>
            <Knob
              label="Cutoff"
              value={filterFrequency}
              onChange={setFilterFrequency}
              min={20}
              max={20000}
              size={80}
            />
            <Knob
              label="Resonance"
              value={filterQ}
              onChange={setFilterQ}
              min={0.1}
              max={20}
              size={80}
            />
          </View>
        </View>

        {/* ADSR Envelope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENVELOPE</Text>
          <ADSREnvelope
            values={adsr}
            onChange={setAdsr}
          />
        </View>

        {/* Master Volume */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MASTER</Text>
          <View style={styles.knobRow}>
            <Knob
              label="Volume"
              value={volume}
              onChange={setVolume}
              min={0}
              max={1}
              size={100}
            />
          </View>
        </View>

        {/* Keyboard */}
        <View style={styles.keyboardSection}>
          <Keyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
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
  waveformSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  waveformButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  waveformButtonActive: {
    backgroundColor: '#00ff94',
    borderColor: '#00ff94',
  },
  waveformText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  waveformTextActive: {
    color: '#0a0a0a',
  },
  filterSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#00ff94',
    borderColor: '#00ff94',
  },
  filterText: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0a0a0a',
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },
  keyboardSection: {
    marginTop: 8,
    marginBottom: 20,
  },
});
