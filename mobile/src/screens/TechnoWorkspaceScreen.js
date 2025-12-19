import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import audioEngine from '../services/audioEngine';
import Knob from '../components/Knob';
import ADSREnvelope from '../components/ADSREnvelope';
import Keyboard from '../components/Keyboard';

export default function TechnoWorkspaceScreen() {
  const [waveform, setWaveform] = useState('sawtooth');
  const [filter, setFilter] = useState({
    type: 'lowpass',
    frequency: 1000,
    q: 1,
  });
  const [adsr, setAdsr] = useState({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
  });
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    // Initialize audio engine
    audioEngine.initialize();
    
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  useEffect(() => {
    audioEngine.setADSR(adsr.attack, adsr.decay, adsr.sustain, adsr.release);
  }, [adsr]);

  useEffect(() => {
    audioEngine.setFilter(filter.type, filter.frequency, filter.q);
  }, [filter]);

  useEffect(() => {
    audioEngine.setMasterVolume(volume);
  }, [volume]);

  const handleNotePress = (frequency) => {
    audioEngine.playNote(frequency, waveform);
  };

  const handleNoteRelease = () => {
    audioEngine.stopNote();
  };

  const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎛️ TECHNO</Text>
          <Text style={styles.subtitle}>Analog Synthesizer</Text>
        </View>

        {/* Waveform Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WAVEFORM</Text>
          <View style={styles.waveformButtons}>
            {waveforms.map((wave) => (
              <TouchableOpacity
                key={wave}
                style={[
                  styles.waveformButton,
                  waveform === wave && styles.waveformButtonActive,
                ]}
                onPress={() => setWaveform(wave)}
              >
                <Text
                  style={[
                    styles.waveformText,
                    waveform === wave && styles.waveformTextActive,
                  ]}
                >
                  {wave.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILTER</Text>
          <View style={styles.knobRow}>
            <Knob
              label="Cutoff"
              value={filter.frequency}
              min={20}
              max={20000}
              step={10}
              size={80}
              color="#00ff94"
              unit=" Hz"
              onChange={(val) => setFilter({ ...filter, frequency: val })}
            />
            <Knob
              label="Resonance"
              value={filter.q}
              min={0.1}
              max={20}
              step={0.1}
              size={80}
              color="#00ff94"
              onChange={(val) => setFilter({ ...filter, q: val })}
            />
            <Knob
              label="Volume"
              value={volume * 100}
              min={0}
              max={100}
              step={1}
              size={80}
              color="#00ff94"
              unit="%"
              onChange={(val) => setVolume(val / 100)}
            />
          </View>
        </View>

        {/* ADSR Envelope */}
        <ADSREnvelope values={adsr} onChange={setAdsr} />

        {/* Keyboard */}
        <Keyboard
          onNotePress={handleNotePress}
          onNoteRelease={handleNoteRelease}
          octave={4}
        />
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
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#00ff94',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  waveformButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  waveformButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  waveformButtonActive: {
    backgroundColor: '#00ff94',
    borderColor: '#00ff94',
  },
  waveformText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waveformTextActive: {
    color: '#0a0a0a',
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
});
