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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Bass2DVisualizer from '../components/Bass2DVisualizer';
import HAOSHeader from '../components/HAOSHeader';
import InstrumentControl from '../components/InstrumentControl';
import pythonAudioEngine from '../services/PythonAudioEngine';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';
import { INSTRUMENT_COLORS, PRESET_STYLES, CONTROL_TYPES } from '../styles/InstrumentTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://haos.fm/api';

// Use unified instrument colors
const BASS_COLORS = INSTRUMENT_COLORS.bass;

// Map COLORS to HAOS_COLORS for consistency (defined at module level for StyleSheet)
const COLORS = {
  gold: HAOS_COLORS.gold,
  accentGreen: BASS_COLORS.primary,
  accentGreenGlow: BASS_COLORS.secondary,
  textSecondary: HAOS_COLORS.textSecondary,
  bgDark: HAOS_COLORS.bgDark,
  borderSubtle: HAOS_COLORS.borderLight,
  borderGlow: BASS_COLORS.primary,
};

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

// Default notes for each bass preset (note name, frequency in Hz, MIDI number)
const PRESET_DEFAULT_NOTES = {
  sub: { note: 'E1', freq: 41.20, midi: 28 },      // Deep sub bass
  reese: { note: 'C1', freq: 32.70, midi: 24 },    // Low Reese wobble
  acid: { note: 'A1', freq: 55.00, midi: 33 },     // TB-303 classic note
  funk: { note: 'E1', freq: 41.20, midi: 28 },     // Funky slap bass
  growl: { note: 'G1', freq: 49.00, midi: 31 },    // Growling wobble
  '808': { note: 'C1', freq: 32.70, midi: 24 },    // 808 kick-bass
  wobble: { note: 'D1', freq: 36.71, midi: 26 },   // Dubstep wobble
  dnb: { note: 'C1', freq: 32.70, midi: 24 },      // DnB sub bass
};

// Bass pattern presets with melodic sequences (16 steps)
const BASS_PATTERNS = {
  techno: {
    name: 'Techno Bass',
    pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    melody: [36, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0], // C1, G1, F1
  },
  house: {
    name: 'House Bass',
    pattern: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    melody: [36, 0, 0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 43, 0, 0, 0], // C1, F1, G1
  },
  funk: {
    name: 'Funk Bass',
    pattern: [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    melody: [28, 0, 31, 0, 0, 0, 33, 0, 28, 0, 0, 0, 31, 0, 33, 0], // E1, G1, A1
  },
  dnb: {
    name: 'DnB Bass',
    pattern: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    melody: [24, 0, 0, 31, 0, 0, 0, 0, 24, 0, 0, 29, 0, 0, 0, 0], // C1, G1, F1
  },
  acid: {
    name: 'Acid Bass',
    pattern: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    melody: [33, 0, 36, 0, 38, 0, 41, 0, 43, 0, 41, 0, 38, 0, 36, 0], // A1-G1 slide
  },
  wobble: {
    name: 'Wobble Bass',
    pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    melody: [26, 0, 0, 0, 29, 0, 0, 0, 26, 0, 0, 0, 24, 0, 0, 0], // D1, F1, C1
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

  // Sequencer state
  const [bpm, setBpm] = useState(120);
  const [bassPattern, setBassPattern] = useState([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
  const [bassMelody, setBassMelody] = useState([36, 0, 0, 0, 36, 0, 0, 0, 36, 0, 0, 0, 36, 0, 0, 0]); // C1
  const [currentStep, setCurrentStep] = useState(-1);
  const sequencerInterval = useRef(null);
  const isPlayingRef = useRef(false);

  // Radio state for demo tracks
  const [radioSound, setRadioSound] = useState(null);
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [radioChannels, setRadioChannels] = useState([]);
  const [loadingRadio, setLoadingRadio] = useState(false);
  const [currentRadioTrack, setCurrentRadioTrack] = useState(null);

  useEffect(() => {
    console.log('🎸 BassStudioScreen mounted, WebAudioBridge ready');
    // WebAudioBridge is always ready, no initialization needed
    fetchRadioChannels();
    
    return () => {
      console.log('🎸 BassStudioScreen unmounting, stopping all voices...');
      
      // Stop sequencer
      if (sequencerInterval.current) {
        clearTimeout(sequencerInterval.current);
        sequencerInterval.current = null;
      }
      
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
  
  const playBassNote = async (frequency, velocity = 0.8, duration = 1.0) => {
    // Trigger visualizer animation
    if (visualizerRef.current) {
      visualizerRef.current.triggerBassNote(frequency, velocity);
    }
    
    // Use pythonAudioEngine dedicated bass methods
    try {
      switch (activePreset) {
        case 'sub':
        case 'funk':
        case '808':
        case 'dnb':
          await pythonAudioEngine.playBass808(frequency, duration, velocity);
          break;
        case 'reese':
        case 'growl':
        case 'wobble':
          await pythonAudioEngine.playReeseBass(frequency, duration, velocity);
          break;
        case 'acid':
          await pythonAudioEngine.playTB303(frequency, duration, velocity);
          break;
        default:
          await pythonAudioEngine.playBass808(frequency, duration, velocity);
      }
    } catch (error) {
      console.error('❌ Error playing bass:', error);
    }
  };

  const handleKnobChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    // Parameters will be used in next note play
  };

  // Convert MIDI note number to frequency (A4 = 440Hz)
  const midiToFreq = (midi) => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  // Load bass pattern preset
  const loadBassPattern = (patternName) => {
    const pattern = BASS_PATTERNS[patternName];
    if (pattern) {
      setBassPattern(pattern.pattern);
      setBassMelody(pattern.melody);
      console.log(`🎸 Loaded bass pattern: ${pattern.name}`);
    }
  };

  // Toggle step in pattern
  const toggleStep = (stepIndex) => {
    const newPattern = [...bassPattern];
    newPattern[stepIndex] = newPattern[stepIndex] === 1 ? 0 : 1;
    setBassPattern(newPattern);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Change note for a step
  const changeNote = (stepIndex, midiNote) => {
    const newMelody = [...bassMelody];
    newMelody[stepIndex] = midiNote;
    setBassMelody(newMelody);
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Stop sequencer
      if (sequencerInterval.current) {
        clearTimeout(sequencerInterval.current);
        sequencerInterval.current = null;
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      // Start sequencer
      isPlayingRef.current = true;
      setIsPlaying(true);
      setCurrentStep(0);
      startSequencer();
    }
  };
  
  const startSequencer = () => {
    const stepDuration = (60 / bpm) * 250; // Quarter note in ms (16th notes)
    let startTime = Date.now();
    let currentStepIndex = 0;

    const tick = () => {
      if (!isPlayingRef.current) return;

      const step = currentStepIndex;
      setCurrentStep(step);

      // Play bass note if pattern active at this step
      if (bassPattern[step] === 1 && bassMelody[step] > 0) {
        const midiNote = bassMelody[step];
        const frequency = midiToFreq(midiNote);
        playBassNote(frequency, 0.8, 0.4);
      }

      currentStepIndex = (currentStepIndex + 1) % bassPattern.length;

      // Drift compensation
      const expectedTime = startTime + (currentStepIndex * stepDuration);
      const drift = Date.now() - expectedTime;
      const correctedDelay = Math.max(0, stepDuration - drift);

      sequencerInterval.current = setTimeout(tick, correctedDelay);
    };

    tick();
  };

  const handleStop = () => {
    // Stop sequencer
    if (sequencerInterval.current) {
      clearTimeout(sequencerInterval.current);
      sequencerInterval.current = null;
    }
    
    // Stop all voices
    activeVoices.current.forEach(voice => {
      if (voice && voice.stopTime) {
        voice.stopTime();
      }
    });
    activeVoices.current = [];
    
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentStep(-1);
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

  // Fetch radio channels from Azure Blob Storage
  const fetchRadioChannels = async () => {
    try {
      setLoadingRadio(true);
      const response = await fetch(`${API_BASE_URL}/radio/channels`);
      const data = await response.json();
      
      if (data.success && data.channels) {
        setRadioChannels(data.channels);
        console.log(`✅ Bass Studio: Loaded ${data.channels.length} radio channels`);
      }
    } catch (error) {
      console.error('Error fetching radio channels:', error);
    } finally {
      setLoadingRadio(false);
    }
  };

  // Play radio track from blob storage
  const playRadioTrack = async (channel, trackIndex = 0) => {
    try {
      // Stop sequencer if playing
      if (isPlaying) {
        stopSequencer();
      }

      // Stop current track if playing
      if (radioSound) {
        await radioSound.unloadAsync();
        setRadioSound(null);
      }

      const track = channel.tracks[trackIndex];
      if (!track) {
        console.warn('No track found at index', trackIndex);
        return;
      }

      setLoadingRadio(true);
      setCurrentRadioTrack({ channel, trackIndex, track });

      // Get track URL from API
      const response = await fetch(`${API_BASE_URL}/radio/track/${track.id}`);
      const data = await response.json();

      if (!data.success || !data.url) {
        console.error('Failed to get track URL');
        return;
      }

      console.log(`🎵 Bass Studio: Playing ${track.title} from ${channel.name}`);

      // Load and play audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.url },
        { shouldPlay: true, volume: 0.8 },
        (status) => {
          if (status.didJustFinish) {
            // Auto-play next track
            const nextIndex = (trackIndex + 1) % channel.tracks.length;
            playRadioTrack(channel, nextIndex);
          }
        }
      );

      setRadioSound(newSound);
      setIsPlayingRadio(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error playing radio track:', error);
    } finally {
      setLoadingRadio(false);
    }
  };

  // Stop radio playback
  const stopRadio = async () => {
    if (radioSound) {
      await radioSound.stopAsync();
      await radioSound.unloadAsync();
      setRadioSound(null);
    }
    setIsPlayingRadio(false);
    setCurrentRadioTrack(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        {/* Sequencer Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>🎛️</Text>
            </View>
            <Text style={styles.panelTitle}>BASS SEQUENCER</Text>
          </View>
          
          {/* BPM Control */}
          <View style={styles.bpmControl}>
            <Text style={styles.bpmLabel}>BPM: {bpm}</Text>
            <View style={styles.bpmButtons}>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.max(60, bpm - 5))}
              >
                <Text style={styles.bpmButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.min(200, bpm + 5))}
              >
                <Text style={styles.bpmButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pattern Presets */}
          <View style={styles.patternPresets}>
            {Object.keys(BASS_PATTERNS).map((patternKey) => {
              const pattern = BASS_PATTERNS[patternKey];
              return (
                <TouchableOpacity
                  key={patternKey}
                  style={styles.patternPresetButton}
                  onPress={() => loadBassPattern(patternKey)}
                >
                  <Text style={styles.patternPresetText}>{pattern.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 16-Step Grid */}
          <View style={styles.sequencerGrid}>
            {bassPattern.map((active, index) => {
              const midiNote = bassMelody[index];
              const isCurrentStep = currentStep === index;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.stepButton,
                    active === 1 && styles.stepButtonActive,
                    isCurrentStep && styles.stepButtonCurrent,
                  ]}
                  onPress={() => toggleStep(index)}
                  onLongPress={() => {
                    // TODO: Open note picker for this step
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  {active === 1 && midiNote > 0 && (
                    <Text style={styles.stepNote}>{midiNote}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
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

        {/* Radio Demo Tracks Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}>
              <Text style={styles.panelIconText}>📻</Text>
            </View>
            <Text style={styles.panelTitle}>DEMO TRACKS</Text>
          </View>

          {loadingRadio && (
            <ActivityIndicator size="large" color={BASS_COLORS.primary} style={{ marginVertical: 20 }} />
          )}

          {currentRadioTrack && (
            <View style={styles.nowPlayingBass}>
              <LinearGradient
                colors={[BASS_COLORS.primary + '40', BASS_COLORS.primary + '20']}
                style={styles.nowPlayingGradient}
              >
                <Text style={styles.nowPlayingTitle}>NOW PLAYING</Text>
                <Text style={styles.nowPlayingTrack}>{currentRadioTrack.track.title}</Text>
                <Text style={styles.nowPlayingChannel}>{currentRadioTrack.channel.name}</Text>
                <TouchableOpacity style={styles.stopRadioButton} onPress={stopRadio}>
                  <Text style={styles.stopRadioButtonText}>⏹ STOP</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          <View style={styles.radioChannels}>
            {radioChannels.map(channel => (
              <TouchableOpacity
                key={channel.id}
                style={[
                  styles.radioChannelCard,
                  currentRadioTrack?.channel.id === channel.id && styles.radioChannelActive,
                ]}
                onPress={() => playRadioTrack(channel, 0)}
              >
                <Text style={styles.radioChannelIcon}>{channel.icon || '🎵'}</Text>
                <Text style={styles.radioChannelName}>{channel.name}</Text>
                <Text style={styles.radioChannelCount}>{channel.trackCount || 0} tracks</Text>
              </TouchableOpacity>
            ))}
          </View>

          {radioChannels.length === 0 && !loadingRadio && (
            <Text style={styles.emptyRadioMessage}>
              No demo tracks available. Upload tracks to Azure Blob Storage.
            </Text>
          )}

          <Text style={styles.panelInfo}>
            Stream professional bass tracks from Azure • Auto-play next track
          </Text>
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
  // Sequencer styles
  bpmControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  bpmLabel: {
    color: COLORS.gold,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  bpmButton: {
    backgroundColor: 'rgba(57, 255, 20, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    color: COLORS.accentGreen,
    fontSize: 20,
    fontWeight: 'bold',
  },
  patternPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  patternPresetButton: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  patternPresetText: {
    color: COLORS.accentGreen,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  sequencerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  stepButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: COLORS.borderSubtle,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.3)',
    borderColor: COLORS.accentGreen,
    borderWidth: 2,
  },
  stepButtonCurrent: {
    borderColor: COLORS.gold,
    borderWidth: 3,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  stepNumber: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  stepNote: {
    color: COLORS.accentGreen,
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 2,
  },
  nowPlayingBass: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nowPlayingGradient: {
    padding: 16,
    alignItems: 'center',
  },
  nowPlayingTitle: {
    fontSize: 11,
    color: BASS_COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nowPlayingTrack: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nowPlayingChannel: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 12,
  },
  stopRadioButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,0,0,0.4)',
  },
  stopRadioButtonText: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  radioChannels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radioChannelCard: {
    width: (SCREEN_WIDTH - 80) / 3, // 3 columns
    backgroundColor: HAOS_COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HAOS_COLORS.borderLight,
  },
  radioChannelActive: {
    borderColor: BASS_COLORS.primary,
    backgroundColor: BASS_COLORS.primary + '20',
  },
  radioChannelIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  radioChannelName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  radioChannelCount: {
    fontSize: 10,
    color: '#888',
  },
  emptyRadioMessage: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  panelInfo: {
    fontSize: 12,
    color: HAOS_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

