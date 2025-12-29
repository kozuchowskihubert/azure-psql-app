import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import technoWorkspace from '../engine/TechnoWorkspace';
import ADSREnvelope from '../components/ADSREnvelope';
import Keyboard from '../components/Keyboard';

export default function TechnoWorkspaceScreen({ route, navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
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
  const [loadedPreset, setLoadedPreset] = useState(null);

  useEffect(() => {
    initializeWorkspace();
    
    return () => {
      if (technoWorkspace && technoWorkspace.isInitialized) {
        technoWorkspace.stop();
      }
    };
  }, []);

  const initializeWorkspace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎛️ Initializing Techno Workspace...');
      
      if (!technoWorkspace.isInitialized) {
        const success = await technoWorkspace.init();
        
        if (!success) {
          throw new Error('Failed to initialize Techno Workspace');
        }
      }
      
      setIsInitialized(true);
      console.log('✅ Techno Workspace initialized successfully');
      
      // Load preset if passed via navigation
      if (route?.params?.preset) {
        loadPreset(route.params.preset);
      }
      
    } catch (err) {
      console.error('❌ Techno Workspace initialization error:', err);
      setError(err.message || 'Failed to initialize workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (preset) => {
    if (!preset || !preset.parameters) return;
    
    const { parameters } = preset;
    
    // Load waveform
    if (parameters.waveform) {
      setWaveform(parameters.waveform);
    }
    
    // Load filter
    if (parameters.filter) {
      setFilter({
        type: parameters.filter.type || 'lowpass',
        frequency: parameters.filter.frequency || 1000,
        q: parameters.filter.q || 1,
      });
    }
    
    // Load ADSR
    if (parameters.adsr) {
      setAdsr({
        attack: parameters.adsr.attack || 0.1,
        decay: parameters.adsr.decay || 0.2,
        sustain: parameters.adsr.sustain || 0.7,
        release: parameters.adsr.release || 0.3,
      });
    }
    
    // Load volume
    if (parameters.volume !== undefined) {
      setVolume(parameters.volume);
    }
    
    setLoadedPreset(preset);
  };

  useEffect(() => {
    if (isInitialized && technoWorkspace.tb303) {
      // TB303Bridge has individual setter methods, not setADSR
      technoWorkspace.tb303.setDecay(adsr.decay);
      // Note: TB303 doesn't use full ADSR, only decay parameter
    }
  }, [adsr, isInitialized]);

  useEffect(() => {
    if (isInitialized && technoWorkspace.tb303) {
      // TB303Bridge has setCutoff and setResonance, not setFilter
      technoWorkspace.tb303.setCutoff(filter.frequency);
      technoWorkspace.tb303.setResonance(filter.q);
    }
  }, [filter, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      technoWorkspace.masterVolume = volume;
    }
  }, [volume, isInitialized]);

  const handleNotePress = (frequency) => {
    if (!isInitialized || !technoWorkspace.tb303) {
      console.warn('Workspace not ready');
      return;
    }
    
    // TB303Bridge.playNote expects note and options
    technoWorkspace.tb303.playNote(frequency, {
      velocity: volume,
      duration: 0.3,
    });
  };

  const handleNoteRelease = () => {
    // TB303Bridge doesn't have stopNote - notes auto-release based on duration
    // No action needed on release
  };

  const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];

  if (isLoading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff94" />
          <Text style={styles.loadingText}>Initializing Techno Workspace...</Text>
          <Text style={styles.loadingSubtext}>Loading TB-303, TR-909, and synths</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={initializeWorkspace}
          >
            <Text style={styles.retryText}>TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← GO BACK</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎛️ TECHNO</Text>
          <Text style={styles.subtitle}>
            {loadedPreset ? `Preset: ${loadedPreset.name}` : 'Analog Synthesizer'}
          </Text>
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
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Cutoff</Text>
            <Slider
              style={styles.slider}
              value={filter.frequency}
              onValueChange={(val) => setFilter({ ...filter, frequency: val })}
              minimumValue={20}
              maximumValue={20000}
              minimumTrackTintColor="#00ff94"
              maximumTrackTintColor="#333"
              thumbTintColor="#00ff94"
            />
            <Text style={styles.controlValue}>{Math.round(filter.frequency)} Hz</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Resonance</Text>
            <Slider
              style={styles.slider}
              value={filter.q}
              onValueChange={(val) => setFilter({ ...filter, q: val })}
              minimumValue={0.1}
              maximumValue={20}
              minimumTrackTintColor="#00ff94"
              maximumTrackTintColor="#333"
              thumbTintColor="#00ff94"
            />
            <Text style={styles.controlValue}>{filter.q.toFixed(1)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume</Text>
            <Slider
              style={styles.slider}
              value={volume}
              onValueChange={setVolume}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#00ff94"
              maximumTrackTintColor="#333"
              thumbTintColor="#00ff94"
            />
            <Text style={styles.controlValue}>{Math.round(volume * 100)}%</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#00ff94',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ff6b35',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00ff94',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backText: {
    color: '#666',
    fontSize: 14,
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
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  controlLabel: {
    color: '#00ff94',
    fontSize: 12,
    fontWeight: '600',
    width: 70,
    textTransform: 'uppercase',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  controlValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
    fontFamily: 'Menlo',
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
});
