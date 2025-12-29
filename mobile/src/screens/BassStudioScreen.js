/**
 * HAOS.fm Bass Studio
 * Professional Bass Synthesizer - Unified HAOS Theme
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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Bass2DVisualizer from '../components/Bass2DVisualizer';
import HAOSHeader from '../components/HAOSHeader';
import InstrumentControl from '../components/InstrumentControl';
import webAudioBridge from '../services/WebAudioBridge';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';
import { INSTRUMENT_COLORS, PRESET_STYLES, CONTROL_TYPES } from '../styles/InstrumentTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Presets matching web version - parameters for professional bass synthesis
const PRESET_PARAMS = {
  sub: {
    name: 'Sub Bass',
    osc1Level: 0.9,
    osc2Level: 0.3,
    detune: 0,
    cutoff: 200,
    resonance: 2,
    envAmount: 0.3,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.9,
    release: 0.3,
    distortion: 10,
    chorus: 10,
    compression: 60,
  },
  reese: {
    name: 'Reese Bass',
    osc1Level: 0.8,
    osc2Level: 0.8,
    detune: 15,
    cutoff: 800,
    resonance: 8,
    envAmount: 0.6,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    distortion: 30,
    chorus: 40,
    compression: 70,
  },
  acid: {
    name: 'Acid Bass',
    osc1Level: 0.7,
    osc2Level: 0.5,
    detune: 7,
    cutoff: 1500,
    resonance: 15,
    envAmount: 0.9,
    attack: 0.001,
    decay: 0.2,
    sustain: 0.3,
    release: 0.2,
    distortion: 40,
    chorus: 20,
    compression: 50,
  },
  funk: {
    name: 'Funk Bass',
    osc1Level: 0.8,
    osc2Level: 0.4,
    detune: 5,
    cutoff: 2000,
    resonance: 5,
    envAmount: 0.5,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.6,
    release: 0.1,
    distortion: 20,
    chorus: 30,
    compression: 65,
  },
  growl: {
    name: 'Growl Bass',
    osc1Level: 0.9,
    osc2Level: 0.7,
    detune: 20,
    cutoff: 600,
    resonance: 12,
    envAmount: 0.8,
    attack: 0.05,
    decay: 0.4,
    sustain: 0.5,
    release: 0.6,
    distortion: 60,
    chorus: 25,
    compression: 80,
  },
  '808': {
    name: '808 Bass',
    osc1Level: 1.0,
    osc2Level: 0.0,
    detune: 0,
    cutoff: 150,
    resonance: 1,
    envAmount: 0.2,
    attack: 0.001,
    decay: 0.5,
    sustain: 0.0,
    release: 0.5,
    distortion: 5,
    chorus: 0,
    compression: 90,
  },
  wobble: {
    name: 'Wobble Bass',
    osc1Level: 0.8,
    osc2Level: 0.6,
    detune: 10,
    cutoff: 1000,
    resonance: 18,
    envAmount: 0.7,
    attack: 0.01,
    decay: 0.2,
    sustain: 0.8,
    release: 0.3,
    distortion: 50,
    chorus: 35,
    compression: 75,
  },
  dnb: {
    name: 'DnB Bass',
    osc1Level: 0.9,
    osc2Level: 0.8,
    detune: 25,
    cutoff: 1200,
    resonance: 10,
    envAmount: 0.6,
    attack: 0.001,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    distortion: 45,
    chorus: 30,
    compression: 85,
  },
};

// Presets using unified theme
const PRESETS = [
  { id: 'sub', name: 'Sub Bass', emoji: PRESET_STYLES.sub.emoji, color: PRESET_STYLES.sub.gradient },
  { id: 'reese', name: 'Reese Bass', emoji: PRESET_STYLES.reese.emoji, color: PRESET_STYLES.reese.gradient },
  { id: 'wobble', name: 'Wobble Bass', emoji: PRESET_STYLES.wobble.emoji, color: PRESET_STYLES.wobble.gradient },
  { id: 'acid', name: 'Acid Bass', emoji: '🧪', color: ['#39FF14', '#00ff94'] },
  { id: 'funk', name: 'Funk Bass', emoji: '🎵', color: ['#39FF14', '#00ff94'] },  // bass.gradient - GREEN
  { id: 'growl', name: 'Growl Bass', emoji: PRESET_STYLES.growl.emoji, color: PRESET_STYLES.growl.gradient },
  { id: '808', name: '808 Bass', emoji: PRESET_STYLES['808'].emoji, color: PRESET_STYLES['808'].gradient },
  { id: 'dnb', name: 'DnB Bass', emoji: PRESET_STYLES.neurofunk.emoji, color: PRESET_STYLES.neurofunk.gradient },
];

export default function BassStudioScreen({ navigation }) {
  // Use unified instrument colors
  const BASS_COLORS = INSTRUMENT_COLORS.bass;
  
  const [activePreset, setActivePreset] = useState('sub');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const visualizerRef = useRef(null);
  const activeVoices = useRef([]);

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
    console.log('🎸 BassStudioScreen mounted, WebAudioBridge ready');
    // WebAudioBridge is always ready, no initialization needed
    
    return () => {
      console.log('🎸 BassStudioScreen unmounting, stopping all voices...');
      // Stop all active voices
      activeVoices.current.forEach(voice => {
        if (voice && voice.stopTime) {
          voice.stopTime();
        }
      });
      activeVoices.current = [];
    };
  }, []);

  const handlePresetSelect = (presetId) => {
    console.log(`🎛️ Preset selected: ${presetId}`);
    setActivePreset(presetId);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Load preset parameters
    const presetParams = PRESET_PARAMS[presetId];
    if (presetParams) {
      console.log('✅ Loading preset parameters:', presetParams.name);
      setParams(presetParams);
      
      // Play a demo note to preview the preset sound (E1 - MIDI 40 = 41.2 Hz)
      const frequency = 41.2; // E1
      playBassNote(frequency, 0.9, 1.8);
    } else {
      console.error('❌ Preset not found:', presetId);
    }
  };
  
  const playBassNote = (frequency, velocity = 0.8, duration = 1.0) => {
    console.log(`🎵 Playing bass note: ${frequency.toFixed(2)}Hz, velocity=${velocity}, duration=${duration}s`);
    console.log(`📊 Current params:`, params);
    
    // Trigger visualizer animation
    if (visualizerRef.current) {
      visualizerRef.current.triggerBassNote(frequency, velocity);
    }
    
    // Use WebAudioBridge to play bass note with current parameters
    webAudioBridge.playBassNote(frequency, duration, velocity, params);
  };

  const handleKnobChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    // Parameters will be used in next note play
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Stop playing
      activeVoices.current.forEach(voice => {
        if (voice && voice.stopTime) {
          voice.stopTime();
        }
      });
      activeVoices.current = [];
      setIsPlaying(false);
    } else {
      // Start playing demo pattern
      setIsPlaying(true);
      playDemoPattern();
    }
  };
  
  const playDemoPattern = () => {
    // Play bass notes in a pattern: E1, E1, G1, E1, D1, E1, G1, A1
    const notes = [41.2, 41.2, 49.0, 41.2, 36.7, 41.2, 49.0, 55.0];
    let noteIndex = 0;

    const playNextNote = () => {
      if (!isPlaying) return;

      const frequency = notes[noteIndex];
      playBassNote(frequency, 0.8, 0.5);

      noteIndex = (noteIndex + 1) % notes.length;
      
      // Schedule next note
      setTimeout(playNextNote, 500);
    };

    playNextNote();
  };

  const handleStop = () => {
    activeVoices.current.forEach(voice => {
      if (voice && voice.stopTime) {
        voice.stopTime();
      }
    });
    activeVoices.current = [];
    setIsPlaying(false);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement recording functionality with WebAudioBridge
    console.log(isRecording ? '🔴 Recording stopped' : '🔴 Recording started');
  };

  const handleExportWAV = () => {
    // TODO: Implement WAV export
    console.log('💾 Export WAV - Coming soon!');
    alert('WAV export coming soon!');
  };

  const handleExportMIDI = () => {
    // TODO: Implement MIDI export
    console.log('💾 Export MIDI - Coming soon!');
    alert('MIDI export coming soon!');
  };

  const handleSavePreset = () => {
    // TODO: Implement preset saving
    console.log('💾 Save preset - Coming soon!');
    alert('Save preset feature coming soon!');
  };

  const handleLoadPreset = () => {
    // TODO: Implement preset loading
    console.log('📂 Load preset - Coming soon!');
    alert('Load preset feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient - HAOS themed */}
      <LinearGradient
        colors={[COLORS.bgDark, COLORS.bgDark]}
        style={styles.background}
      />

      {/* HAOS Header */}
      <HAOSHeader
        title="BASS STUDIO"
        navigation={navigation}
        showBack={true}
        showLogo={false}
        rightButtons={[
          {
            icon: '⚙️',
            onPress: () => alert('Settings coming soon!'),
          },
        ]}
      />

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
          />
          <View style={styles.visualizerOverlay}>
            <Text style={styles.visualizerLabel}>🎸 BASS FREQUENCY ANALYZER</Text>
          </View>
        </View>

        {/* Bass Presets Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>{CONTROL_TYPES.oscillator.emoji}</Text>
            </View>
            <Text style={styles.panelTitle}>BASS PRESETS</Text>
          </View>
          <View style={styles.presetGrid}>
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => handlePresetSelect(preset.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isActive ? preset.color : [HAOS_COLORS.bgCard, HAOS_COLORS.bgCard]}
                    style={[
                      styles.presetButton,
                      isActive && styles.presetButtonActive,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.presetIcon}>{preset.emoji}</Text>
                    <Text
                      style={[
                        styles.presetText,
                        isActive && styles.presetTextActive,
                      ]}
                    >
                      {preset.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Oscillators Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>{CONTROL_TYPES.oscillator.emoji}</Text>
            </View>
            <Text style={[styles.panelTitle, { color: CONTROL_TYPES.oscillator.color }]}>
              {CONTROL_TYPES.oscillator.label}
            </Text>
          </View>
          <View style={styles.knobRow}>
            <InstrumentControl
              label="OSC 1 Level"
              value={params.osc1Level}
              min={0}
              max={1}
              step={0.01}
              color={BASS_COLORS.primary}
              onValueChange={(value) => handleKnobChange('osc1Level', value)}
            />
            <InstrumentControl
              label="OSC 2 Level"
              value={params.osc2Level}
              min={0}
              max={1}
              step={0.01}
              color={BASS_COLORS.primary}
              onValueChange={(value) => handleKnobChange('osc2Level', value)}
            />
            <InstrumentControl
              label="Detune"
              value={params.detune}
              min={0}
              max={50}
              step={1}
              unit=" Hz"
              color={BASS_COLORS.secondary}
              onValueChange={(value) => handleKnobChange('detune', value)}
            />
          </View>
        </View>

        {/* Filter Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>{CONTROL_TYPES.filter.emoji}</Text>
            </View>
            <Text style={[styles.panelTitle, { color: CONTROL_TYPES.filter.color }]}>
              {CONTROL_TYPES.filter.label}
            </Text>
          </View>
          <View style={styles.knobRow}>
            <InstrumentControl
              label="Cutoff"
              value={params.cutoff}
              min={20}
              max={20000}
              step={10}
              unit=" Hz"
              color={CONTROL_TYPES.filter.color}
              onValueChange={(value) => handleKnobChange('cutoff', value)}
            />
            <InstrumentControl
              label="Resonance"
              value={params.resonance}
              min={0}
              max={20}
              step={0.1}
              color={CONTROL_TYPES.filter.color}
              onValueChange={(value) => handleKnobChange('resonance', value)}
            />
            <InstrumentControl
              label="Env Amount"
              value={params.envAmount}
              min={0}
              max={1}
              step={0.01}
              color={CONTROL_TYPES.filter.color}
              onValueChange={(value) => handleKnobChange('envAmount', value)}
            />
          </View>
        </View>

        {/* ADSR Envelope Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>{CONTROL_TYPES.envelope.emoji}</Text>
            </View>
            <Text style={[styles.panelTitle, { color: CONTROL_TYPES.envelope.color }]}>
              {CONTROL_TYPES.envelope.label} (ADSR)
            </Text>
          </View>
          <View style={styles.knobRow}>
            <InstrumentControl
              label="Attack"
              value={params.attack}
              min={0.001}
              max={2}
              step={0.001}
              unit="s"
              color={CONTROL_TYPES.envelope.color}
              formatValue={(v) => v.toFixed(3)}
              onValueChange={(value) => handleKnobChange('attack', value)}
            />
            <InstrumentControl
              label="Decay"
              value={params.decay}
              min={0.001}
              max={2}
              step={0.001}
              unit="s"
              color={CONTROL_TYPES.envelope.color}
              formatValue={(v) => v.toFixed(3)}
              onValueChange={(value) => handleKnobChange('decay', value)}
            />
            <InstrumentControl
              label="Sustain"
              value={params.sustain}
              min={0}
              max={1}
              step={0.01}
              color={CONTROL_TYPES.envelope.color}
              onValueChange={(value) => handleKnobChange('sustain', value)}
            />
            <InstrumentControl
              label="Release"
              value={params.release}
              min={0.001}
              max={5}
              step={0.001}
              unit="s"
              color={CONTROL_TYPES.envelope.color}
              formatValue={(v) => v.toFixed(3)}
              onValueChange={(value) => handleKnobChange('release', value)}
            />
          </View>
        </View>

        {/* Effects Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>{CONTROL_TYPES.effects.emoji}</Text>
            </View>
            <Text style={[styles.panelTitle, { color: CONTROL_TYPES.effects.color }]}>
              {CONTROL_TYPES.effects.label}
            </Text>
          </View>
          <View style={styles.knobRow}>
            <InstrumentControl
              label="Distortion"
              value={params.distortion}
              min={0}
              max={100}
              step={1}
              unit="%"
              color={CONTROL_TYPES.effects.color}
              onValueChange={(value) => handleKnobChange('distortion', value)}
            />
            <InstrumentControl
              label="Chorus"
              value={params.chorus}
              min={0}
              max={100}
              step={1}
              unit="%"
              color={CONTROL_TYPES.effects.color}
              onValueChange={(value) => handleKnobChange('chorus', value)}
            />
            <InstrumentControl
              label="Compression"
              value={params.compression}
              min={0}
              max={100}
              step={1}
              unit="%"
              color={CONTROL_TYPES.effects.color}
              onValueChange={(value) => handleKnobChange('compression', value)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.bgDark,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Header styles removed - now using HAOSHeader component
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
    color: COLORS.gold,
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
  panel: {
    backgroundColor: HAOS_COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: HAOS_COLORS.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.borderLight,
  },
  panelIcon: {
    width: 40,
    height: 40,
    backgroundColor: `${BASS_COLORS.primary}20`,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelIconText: {
    fontSize: 20,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HAOS_COLORS.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    minWidth: 140,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.border,
    alignItems: 'center',
  },
  presetButtonActive: {
    borderColor: HAOS_COLORS.goldLight,
    shadowColor: HAOS_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  presetIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  presetText: {
    color: HAOS_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  presetTextActive: {
    color: HAOS_COLORS.black,
    fontWeight: '700',
  },
  knobRow: {
    flexDirection: 'column',
    gap: 8,
  },
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

