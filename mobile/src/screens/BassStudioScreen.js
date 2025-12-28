/**
 * HAOS.fm Bass Studio
 * Professional Bass Synthesizer - Web Version 1:1 Port
 * Matches bass-studio.html exactly
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
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Bass2DVisualizer from '../components/Bass2DVisualizer';
import BassAudioEngine from '../audio/BassAudioEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colors matching web version exactly
const COLORS = {
  bgDark: '#050508',
  bgCard: 'rgba(10, 20, 15, 0.8)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  accentGreen: '#39FF14',
  accentGreenLight: '#4AFF14',
  accentGreenGlow: 'rgba(57, 255, 20, 0.4)',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.6)',
  textDim: 'rgba(244, 232, 216, 0.3)',
  borderSubtle: 'rgba(57, 255, 20, 0.1)',
  borderGlow: 'rgba(57, 255, 20, 0.3)',
};

// Presets matching web version
const PRESETS = [
  { id: 'sub', name: 'Sub Bass', icon: '🔊' },
  { id: 'reese', name: 'Reese Bass', icon: '🌊' },
  { id: 'acid', name: 'Acid Bass', icon: '🧪' },
  { id: 'funk', name: 'Funk Bass', icon: '🎵' },
  { id: 'growl', name: 'Growl Bass', icon: '🦁' },
  { id: '808', name: '808 Bass', icon: '🥁' },
  { id: 'wobble', name: 'Wobble Bass', icon: '〰️' },
  { id: 'dnb', name: 'DnB Bass', icon: '⚡' },
];

export default function BassStudioScreen({ navigation }) {
  const [activePreset, setActivePreset] = useState('sub');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const audioEngine = useRef(null);
  const visualizerRef = useRef(null);

  // Knob parameters state - matching web version exactly
  const [params, setParams] = useState({
    osc1Level: 0.8,
    osc2Level: 0.6,
    detune: 5,
    cutoff: 1000,
    resonance: 5,
    envAmount: 0.5,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    distortion: 20,
    chorus: 30,
    compression: 50,
  });

  useEffect(() => {
    if (!audioEngine.current) {
      audioEngine.current = new BassAudioEngine();
    }
    audioEngine.current.initialize();
    
    return () => {
      if (audioEngine.current) {
        audioEngine.current.cleanup();
      }
    };
  }, []);

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    if (audioEngine.current) {
      // Small delay to ensure audio engine is fully initialized
      setTimeout(() => {
        audioEngine.current.loadPreset(presetId);
      }, 100);
    }
  };

  const handleKnobChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    if (audioEngine.current) {
      audioEngine.current.setParameter(param, value);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      if (audioEngine.current) audioEngine.current.stop();
      setIsPlaying(false);
    } else {
      if (audioEngine.current) audioEngine.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioEngine.current) audioEngine.current.stop();
    setIsPlaying(false);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (audioEngine.current) {
      if (!isRecording) {
        audioEngine.current.startRecording();
      } else {
        audioEngine.current.stopRecording();
      }
    }
  };

  const handleExportWAV = () => {
    if (audioEngine.current) audioEngine.current.exportWAV();
  };

  const handleExportMIDI = () => {
    if (audioEngine.current) audioEngine.current.exportMIDI();
  };

  const handleSavePreset = () => {
    if (audioEngine.current) audioEngine.current.savePreset(params);
  };

  const handleLoadPreset = () => {
    if (audioEngine.current) audioEngine.current.loadPresetFromFile();
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient - matching web version */}
      <LinearGradient
        colors={['#050508', '#0a140f', '#050508']}
        style={styles.background}
      />

      {/* Header - matching web nav */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🎸</Text>
          <Text style={styles.logoText}>BASS STUDIO</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>BASS STUDIO</Text>
          <Text style={styles.heroSubtitle}>
            Professional Bass Synthesizer with WAV/MIDI Export
          </Text>
        </View>

        {/* Bass Frequency Visualizer */}
        <View style={styles.visualizerContainer}>
          <Bass2DVisualizer
            ref={visualizerRef}
            isPlaying={isPlaying}
            audioEngine={audioEngine.current}
          />
          <View style={styles.visualizerOverlay}>
            <Text style={styles.visualizerLabel}>🎸 BASS FREQUENCY ANALYZER</Text>
          </View>
        </View>

        {/* Bass Presets Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>🎼</Text>
            </View>
            <Text style={styles.panelTitle}>BASS PRESETS</Text>
          </View>
          <View style={styles.presetGrid}>
            {PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  activePreset === preset.id && styles.presetButtonActive,
                ]}
                onPress={() => handlePresetSelect(preset.id)}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <Text
                  style={[
                    styles.presetText,
                    activePreset === preset.id && styles.presetTextActive,
                  ]}
                >
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Oscillators Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>🌊</Text>
            </View>
            <Text style={styles.panelTitle}>OSCILLATORS</Text>
          </View>
          <View style={styles.knobRow}>
            <KnobControl
              label="OSC 1 Level"
              value={params.osc1Level}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleKnobChange('osc1Level', value)}
            />
            <KnobControl
              label="OSC 2 Level"
              value={params.osc2Level}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleKnobChange('osc2Level', value)}
            />
            <KnobControl
              label="Detune"
              value={params.detune}
              min={0}
              max={50}
              step={1}
              onChange={(value) => handleKnobChange('detune', value)}
            />
          </View>
        </View>

        {/* Filter Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>🎛️</Text>
            </View>
            <Text style={styles.panelTitle}>FILTER</Text>
          </View>
          <View style={styles.knobRow}>
            <KnobControl
              label="Cutoff"
              value={params.cutoff}
              min={20}
              max={20000}
              step={10}
              onChange={(value) => handleKnobChange('cutoff', value)}
            />
            <KnobControl
              label="Resonance"
              value={params.resonance}
              min={0}
              max={20}
              step={0.1}
              onChange={(value) => handleKnobChange('resonance', value)}
            />
            <KnobControl
              label="Env Amount"
              value={params.envAmount}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleKnobChange('envAmount', value)}
            />
          </View>
        </View>

        {/* ADSR Envelope Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>📊</Text>
            </View>
            <Text style={styles.panelTitle}>ENVELOPE (ADSR)</Text>
          </View>
          <View style={styles.knobRow}>
            <KnobControl
              label="Attack"
              value={params.attack}
              min={0.001}
              max={2}
              step={0.001}
              unit="s"
              onChange={(value) => handleKnobChange('attack', value)}
            />
            <KnobControl
              label="Decay"
              value={params.decay}
              min={0.001}
              max={2}
              step={0.001}
              unit="s"
              onChange={(value) => handleKnobChange('decay', value)}
            />
            <KnobControl
              label="Sustain"
              value={params.sustain}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => handleKnobChange('sustain', value)}
            />
            <KnobControl
              label="Release"
              value={params.release}
              min={0.001}
              max={5}
              step={0.001}
              unit="s"
              onChange={(value) => handleKnobChange('release', value)}
            />
          </View>
        </View>

        {/* Effects Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>✨</Text>
            </View>
            <Text style={styles.panelTitle}>EFFECTS</Text>
          </View>
          <View style={styles.knobRow}>
            <KnobControl
              label="Distortion"
              value={params.distortion}
              min={0}
              max={100}
              step={1}
              onChange={(value) => handleKnobChange('distortion', value)}
            />
            <KnobControl
              label="Chorus"
              value={params.chorus}
              min={0}
              max={100}
              step={1}
              onChange={(value) => handleKnobChange('chorus', value)}
            />
            <KnobControl
              label="Compression"
              value={params.compression}
              min={0}
              max={100}
              step={1}
              onChange={(value) => handleKnobChange('compression', value)}
            />
          </View>
        </View>

        {/* Transport Controls */}
        <View style={styles.transportPanel}>
          <TouchableOpacity
            style={[styles.transportButton, isPlaying && styles.transportButtonActive]}
            onPress={handlePlay}
          >
            <Text style={styles.transportButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.transportButton}
            onPress={handleStop}
          >
            <Text style={styles.transportButtonText}>■</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.transportButton, isRecording && styles.transportButtonRecording]}
            onPress={handleRecord}
          >
            <Text style={styles.transportButtonText}>⏺</Text>
          </TouchableOpacity>
        </View>

        {/* Export Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>💾</Text>
            </View>
            <Text style={styles.panelTitle}>EXPORT & SAVE</Text>
          </View>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportWAV}>
              <Text style={styles.exportButtonText}>📁 Export WAV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportMIDI}>
              <Text style={styles.exportButtonText}>🎹 Export MIDI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={handleSavePreset}>
              <Text style={styles.exportButtonText}>💾 Save Preset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={handleLoadPreset}>
              <Text style={styles.exportButtonText}>� Load Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Knob Control Component - matching web version behavior
function KnobControl({ label, value, min, max, step, unit = '', onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);

  useEffect(() => {
    const angle = ((value - min) / (max - min)) * 270 - 135;
    Animated.spring(rotation, {
      toValue: angle,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        lastY.current = gestureState.y0;
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const delta = lastY.current - gestureState.moveY;
        const sensitivity = (max - min) / 200;
        const newValue = Math.max(min, Math.min(max, value + delta * sensitivity));
        onChange(newValue);
        lastY.current = gestureState.moveY;
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const formatValue = (val) => {
    if (unit === 's') {
      return `${val.toFixed(3)}${unit}`;
    }
    if (max > 100) {
      return `${Math.round(val)}${unit}`;
    }
    return `${val.toFixed(2)}${unit}`;
  };

  return (
    <View style={styles.knobControl}>
      <Text style={styles.knobLabel}>{label}</Text>
      <View
        style={styles.knobContainer}
        {...panResponder.panHandlers}
      >
        <View style={[styles.knobCircle, isDragging && styles.knobCircleActive]}>
          <Animated.View
            style={[
              styles.knobIndicator,
              {
                transform: [{
                  rotate: rotation.interpolate({
                    inputRange: [-135, 135],
                    outputRange: ['-135deg', '135deg'],
                  }),
                }],
              },
            ]}
          />
        </View>
      </View>
      <Text style={styles.knobValue}>{formatValue(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: 'rgba(5, 5, 8, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: COLORS.bgGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accentGreen,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: COLORS.accentGreenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 10,
    textAlign: 'center',
  },
  visualizerContainer: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
  },
  visualizerOverlay: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  visualizerLabel: {
    backgroundColor: 'rgba(5, 5, 8, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderGlow,
    color: COLORS.accentGreen,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  panel: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  panelIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelIconText: {
    fontSize: 20,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    minWidth: 140,
    padding: 15,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: 'transparent',
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  presetText: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  presetTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  knobRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 15,
  },
  knobControl: {
    alignItems: 'center',
    minWidth: 100,
  },
  knobLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.textDim,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  knobContainer: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  knobCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 3,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  knobCircleActive: {
    borderColor: COLORS.accentGreen,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  knobIndicator: {
    width: 3,
    height: 25,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
    shadowColor: COLORS.accentGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  knobValue: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  transportPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    padding: 30,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  transportButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportButtonActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: 'transparent',
  },
  transportButtonRecording: {
    backgroundColor: '#FF3B3B',
    borderColor: 'transparent',
  },
  transportButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  exportButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  exportButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
  },
  exportButtonText: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

