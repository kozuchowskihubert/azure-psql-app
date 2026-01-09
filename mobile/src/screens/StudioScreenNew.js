/**
 * HAOS.fm STUDIO Screen V3
 * CREATOR Theme - with WebAudio Engine
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import pythonAudioEngine from '../services/PythonAudioEngine';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const COLORS = {
  bgDark: '#000000',
  bgCard: 'rgba(15, 15, 15, 0.95)',
  cardDark: 'rgba(10, 10, 10, 0.95)',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  goldDark: '#B8951F',
  silver: '#C0C0C0',
  silverLight: '#E8E8E8',
  silverDark: '#A0A0A0',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  orangeDark: '#E55520',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(212, 175, 55, 0.3)',
  borderActive: 'rgba(212, 175, 55, 0.8)',
};

const SOUNDS = {
  synths: [
    { id: 'arp2600', name: 'ARP 2600', emoji: '🎛️', gradient: ['#D4AF37', '#FFD700'], note: 'C4', freq: 261.63 },
    { id: 'juno106', name: 'Juno-106', emoji: '🎹', gradient: ['#C0C0C0', '#A0A0A0'], note: 'E4', freq: 329.63 },
    { id: 'minimoog', name: 'Minimoog', emoji: '🎵', gradient: ['#FF6B35', '#FF8C5A'], note: 'G4', freq: 392.00 },
    { id: 'tb303', name: 'TB-303', emoji: '💚', gradient: ['#B8960E', '#D4AF37'], note: 'A4', freq: 440.00 },
  ],
  drums: [
    { id: 'kick', name: 'Kick', emoji: '🥁', gradient: ['#FF6B35', '#FF8C5A'], note: 'C2', freq: 65.41 },
    { id: 'snare', name: 'Snare', emoji: '🪘', gradient: ['#C0C0C0', '#A0A0A0'], note: 'D3', freq: 146.83 },
    { id: 'hihat', name: 'Hi-Hat', emoji: '🔔', gradient: ['#D4AF37', '#FFD700'], note: 'F#5', freq: 739.99 },
    { id: 'clap', name: 'Clap', emoji: '👏', gradient: ['#CC5528', '#FF6B35'], note: 'A3', freq: 220.00 },
  ],
  bass: [
    { id: 'bass808', name: '808 Bass', emoji: '🎸', gradient: ['#D4AF37', '#B8960E'], note: 'E1', freq: 41.20 },
    { id: 'bassReese', name: 'Reese Bass', emoji: '🔊', gradient: ['#C0C0C0', '#A0A0A0'], note: 'A1', freq: 55.00 },
  ],
};

const PRESET_PATTERNS = [
  { 
    id: 'techno', 
    name: 'Techno', 
    bpm: 135,
    swing: 0.15, // 15% swing for groove
    patterns: {
      // Drums
      kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap:    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Synths - Classic acid techno leads with melodic notes
      arp2600: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
      tb303:   [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0],
      // Bass - Deep 808 sub bass
      bass808: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    },
    // Melodic note sequences (MIDI note numbers)
    melodies: {
      arp2600: [48, 0, 0, 52, 0, 0, 55, 0, 48, 0, 0, 0, 60, 0, 55, 0], // C3, E3, G3, C4, G3
      tb303:   [36, 0, 41, 0, 36, 0, 0, 43, 36, 0, 48, 0, 0, 41, 0, 0], // Acid bassline
      bass808: [36, 0, 0, 0, 0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 0, 0], // C2, F2
    }
  },
  { 
    id: 'hiphop', 
    name: 'Hip-Hop', 
    bpm: 90,
    swing: 0.33, // 33% swing for classic boom bap feel
    patterns: {
      // Drums - Boom bap style
      kick:      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      snare:     [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat:     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap:      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      // Bass - 808 sub with swing
      bass808:   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      // Synth - Juno pads
      juno106:   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    melodies: {
      bass808: [36, 0, 0, 38, 0, 0, 0, 0, 36, 0, 0, 0, 0, 0, 39, 0], // C2, D2, Eb2
      juno106: [48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // C3 pad
    }
  },
  { 
    id: 'house', 
    name: 'House', 
    bpm: 125,
    swing: 0.08, // 8% subtle swing
    patterns: {
      // Drums - Four on the floor
      kick:      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare:     [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat:     [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      clap:      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      // Bass - Deep house bass
      bassReese: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      // Synth - Juno stabs
      juno106:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
    melodies: {
      bassReese: [36, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0], // C2, G2, F2
      juno106:   [0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0], // C4, E4 stabs
    }
  },
  { 
    id: 'dnb', 
    name: 'Drum & Bass', 
    bpm: 170,
    swing: 0.05, // 5% minimal swing for tight breakbeat
    patterns: {
      // Drums - Complex breakbeat
      kick:      [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
      snare:     [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat:     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      clap:      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Bass - Reese bass wobbles
      bassReese: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
      // Synth - Minimoog stabs
      minimoog:  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    },
    melodies: {
      bassReese: [24, 0, 0, 0, 29, 0, 26, 0, 24, 0, 0, 31, 0, 27, 0, 0], // Low C1 reese wobbles
      minimoog:  [0, 0, 0, 67, 0, 0, 0, 0, 0, 0, 72, 0, 0, 0, 0, 0], // G4, C5 stabs
    }
  },
];

const StudioScreenNew = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0); // 0-0.5 swing amount
  
  // Multi-track patterns - drums, synths, and bass
  const [patterns, setPatterns] = useState({
    // Drums
    kick: Array(16).fill(0),
    snare: Array(16).fill(0),
    hihat: Array(16).fill(0),
    clap: Array(16).fill(0),
    // Synths
    arp2600: Array(16).fill(0),
    juno106: Array(16).fill(0),
    minimoog: Array(16).fill(0),
    tb303: Array(16).fill(0),
    // Bass
    bass808: Array(16).fill(0),
    bassReese: Array(16).fill(0),
  });
  
  // Melodic note sequences (MIDI note numbers, 0 = rest)
  const [melodies, setMelodies] = useState({
    arp2600: Array(16).fill(48), // Default C3
    juno106: Array(16).fill(48),
    minimoog: Array(16).fill(48),
    tb303: Array(16).fill(36), // Default C2
    bass808: Array(16).fill(36),
    bassReese: Array(16).fill(24), // Default C1
  });
  
  const [selectedTrack, setSelectedTrack] = useState('kick'); // Which track is being edited
  const [selectedSound, setSelectedSound] = useState(SOUNDS.drums[0]);
  const [soundCategory, setSoundCategory] = useState('drums');
  const [showPresets, setShowPresets] = useState(false);
  
  const stepAnims = useRef(Array(16).fill(0).map(() => new Animated.Value(0))).current;
  const playbackInterval = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    // Configure audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Initialize Python audio engine on mount
    pythonAudioEngine.initialize().then(() => {
      console.log('✅ Studio audio engine ready (Python Backend)');
    });
    
    return () => {
      pythonAudioEngine.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startSequencer();
    } else {
      stopSequencer();
    }
    
    return () => {
      if (playbackInterval.current) {
        clearTimeout(playbackInterval.current); // Changed from clearInterval to clearTimeout
      }
    };
  }, [isPlaying, bpm]);

  const startSequencer = () => {
    const stepDuration = (60 / bpm) * 250; // milliseconds per 16th note
    const startTime = Date.now();
    let currentStepIndex = 0;
    
    const scheduleNextStep = () => {
      const step = currentStepIndex % 16;
      const expectedTime = startTime + (currentStepIndex * stepDuration);
      const now = Date.now();
      const drift = now - expectedTime;
      
      // Update UI step indicator
      setCurrentStep(step);
      
      // Animate step (non-blocking)
      Animated.sequence([
        Animated.timing(stepAnims[step], {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnims[step], {
          toValue: 0,
          duration: stepDuration - 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Add velocity variations for more natural feel
      // Steps 1, 5, 9, 13 get accent (higher velocity)
      const isAccent = step % 4 === 0;
      const velocity = isAccent ? 1.0 : 0.75;
      
      // Play all active tracks at this step in parallel (non-blocking)
      // All promises run simultaneously without waiting
      const playPromises = [];
      
      // DRUMS
      if (patterns?.kick && patterns.kick[step] === 1) {
        playPromises.push(pythonAudioEngine.playKick(velocity).catch(() => {}));
      }
      if (patterns?.snare && patterns.snare[step] === 1) {
        playPromises.push(pythonAudioEngine.playSnare(velocity).catch(() => {}));
      }
      if (patterns?.hihat && patterns.hihat[step] === 1) {
        const isOpen = step % 2 === 1 && Math.random() > 0.7;
        playPromises.push(pythonAudioEngine.playHiHat(velocity * 0.9, isOpen).catch(() => {}));
      }
      if (patterns?.clap && patterns.clap[step] === 1) {
        playPromises.push(pythonAudioEngine.playClap(velocity).catch(() => {}));
      }
      
      // SYNTHS - C3 note, short duration
      const synthNote = 48; // C3
      const synthFreq = 440 * Math.pow(2, (synthNote - 69) / 12);
      const synthDur = 0.2;
      
      if (patterns?.arp2600 && patterns.arp2600[step] === 1) {
        playPromises.push(pythonAudioEngine.playARP2600(synthFreq, synthDur, velocity, 0.02).catch(() => {}));
      }
      if (patterns?.juno106 && patterns.juno106[step] === 1) {
        playPromises.push(pythonAudioEngine.playJuno106(synthFreq, synthDur, velocity).catch(() => {}));
      }
      if (patterns?.minimoog && patterns.minimoog[step] === 1) {
        playPromises.push(pythonAudioEngine.playMinimoog(synthFreq, synthDur, velocity).catch(() => {}));
      }
      if (patterns?.tb303 && patterns.tb303[step] === 1) {
        playPromises.push(pythonAudioEngine.playTB303(synthFreq, synthDur, velocity, false, false, null, 'sawtooth').catch(() => {}));
      }
      
      // BASS - Low C (C2)
      const bassNote = 36; // C2
      const bassFreq = 440 * Math.pow(2, (bassNote - 69) / 12);
      const bassDur = 0.25;
      
      if (patterns?.bass808 && patterns.bass808[step] === 1) {
        playPromises.push(pythonAudioEngine.playBass808(bassFreq, bassDur, velocity).catch(() => {}));
      }
      if (patterns?.bassReese && patterns.bassReese[step] === 1) {
        playPromises.push(pythonAudioEngine.playReeseBass(bassFreq, bassDur, velocity).catch(() => {}));
      }
      
      // Don't wait for audio to finish - let them play in parallel
      Promise.all(playPromises).catch(() => {});
      
      // Schedule next step with drift compensation
      currentStepIndex++;
      const nextStepTime = stepDuration - drift;
      const correctedDelay = Math.max(10, nextStepTime); // Minimum 10ms
      
      playbackInterval.current = setTimeout(scheduleNextStep, correctedDelay);
    };
    
    // Start the sequencer
    scheduleNextStep();
  };

  const stopSequencer = () => {
    if (playbackInterval.current) {
      clearTimeout(playbackInterval.current); // Changed from clearInterval to clearTimeout
      playbackInterval.current = null;
    }
    setCurrentStep(-1);
  };

  // Helper: MIDI note to frequency
  const midiToFrequency = (note) => 440 * Math.pow(2, (note - 69) / 12);

  const playSound = async (step) => {
    // Light haptic feedback for manual triggering only
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const soundId = selectedSound.id;
      const velocity = 0.9; // Higher velocity for manual triggers
      
      // DRUMS - TR-808 style via PythonAudioEngine
      if (soundCategory === 'drums') {
        switch (soundId) {
          case 'kick':
            pythonAudioEngine.playKick(velocity).catch(() => {});
            break;
          case 'snare':
            await pythonAudioEngine.playSnare(velocity);
            break;
          case 'hihat':
            await pythonAudioEngine.playHiHat(velocity);
            break;
          case 'clap':
            await pythonAudioEngine.playClap(velocity);
            break;
        }
      }
      
      // SYNTHS - Classic synthesizers via PythonAudioEngine
      else if (soundCategory === 'synths') {
        const note = 48; // C3
        const frequency = midiToFrequency(note);
        const duration = 0.25;
        
        switch (soundId) {
          case 'arp2600':
            await pythonAudioEngine.playARP2600(frequency, duration, velocity, 0.02);
            break;
          case 'juno106':
            await pythonAudioEngine.playJuno106(frequency, duration, velocity);
            break;
          case 'minimoog':
            await pythonAudioEngine.playMinimoog(frequency, duration, velocity);
            break;
          case 'tb303':
            await pythonAudioEngine.playTB303(frequency, duration, velocity, false, false, null, 'sawtooth');
            break;
        }
      }
      
      // BASS - via PythonAudioEngine
      else if (soundCategory === 'bass') {
        const note = 36; // C2 - low bass note
        const frequency = midiToFrequency(note);
        const duration = 0.25;
        
        switch (soundId) {
          case 'bass808':
            await pythonAudioEngine.playBass808(frequency, duration, velocity);
            break;
          case 'bassReese':
            await pythonAudioEngine.playReeseBass(frequency, duration, velocity);
            break;
        }
      }
      
      console.log('🎵 ' + selectedSound.name + ' - Step ' + (step + 1));
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  const toggleStep = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPatterns(prev => {
      const newPatterns = { ...prev };
      // Deep copy the array for the selected track
      newPatterns[selectedTrack] = [...prev[selectedTrack]];
      newPatterns[selectedTrack][index] = newPatterns[selectedTrack][index] === 1 ? 0 : 1;
      return newPatterns;
    });
  };

  const togglePlayback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPlaying(!isPlaying);
  };

  const clearPattern = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPatterns({
      // Drums
      kick: Array(16).fill(0),
      snare: Array(16).fill(0),
      hihat: Array(16).fill(0),
      clap: Array(16).fill(0),
      // Synths
      arp2600: Array(16).fill(0),
      juno106: Array(16).fill(0),
      minimoog: Array(16).fill(0),
      tb303: Array(16).fill(0),
      // Bass
      bass808: Array(16).fill(0),
      bassReese: Array(16).fill(0),
    });
    setIsPlaying(false);
  };

  const loadPreset = (preset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Merge preset patterns with existing structure to preserve synth/bass tracks
    setPatterns(prev => ({
      ...prev,
      ...preset.patterns,
    }));
    
    // Load melodies if available
    if (preset.melodies) {
      setMelodies(prev => ({
        ...prev,
        ...preset.melodies,
      }));
    }
    
    // Load swing amount
    if (preset.swing !== undefined) {
      setSwing(preset.swing);
    }
    
    setBpm(preset.bpm);
    setShowPresets(false);
  };

  const selectSound = (sound, category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSound(sound);
    setSoundCategory(category);
    // Auto-select first track of this category
    if (category === 'drums') {
      setSelectedTrack('kick');
    } else if (category === 'synths') {
      setSelectedTrack('arp2600');
    } else if (category === 'bass') {
      setSelectedTrack('bass808');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>HAOS</Text>
        <Text style={styles.logoDot}>.fm</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>STUDIO V3</Text>
          <Text style={styles.headerSubtitle}>Visual Preview</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>🎵</Text>
        <Text style={styles.infoText}>
          Audio synthesis coming soon! For now, enjoy the sequencer with haptic feedback. 
          Tap steps to create patterns, press PLAY to see visual playback.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* BPM Control */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Tempo</Text>
          <View style={styles.bpmContainer}>
            <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.max(60, bpm - 5))}>
              <Text style={styles.bpmButtonText}>-</Text>
            </TouchableOpacity>
            
            <LinearGradient colors={['#D4AF37', '#FFD700']} style={styles.bpmDisplay}>
              <Text style={styles.bpmValue}>{bpm}</Text>
              <Text style={styles.bpmLabel}>BPM</Text>
            </LinearGradient>
            
            <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.min(200, bpm + 5))}>
              <Text style={styles.bpmButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sound Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 Sound</Text>
          <View style={styles.categoryTabs}>
            {['drums', 'synths', 'bass'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, soundCategory === cat && styles.categoryTabActive]}
                onPress={() => {
                  setSoundCategory(cat);
                  // Auto-select first track of this category
                  if (cat === 'drums') setSelectedTrack('kick');
                  else if (cat === 'synths') setSelectedTrack('arp2600');
                  else if (cat === 'bass') setSelectedTrack('bass808');
                }}
              >
                <Text style={[styles.categoryTabText, soundCategory === cat && styles.categoryTabTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.soundGrid}>
            {SOUNDS[soundCategory].map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={[styles.soundCard, selectedSound.id === sound.id && styles.soundCardActive]}
                onPress={() => selectSound(sound, soundCategory)}
              >
                <LinearGradient colors={sound.gradient} style={styles.soundCardGradient}>
                  <Text style={styles.soundEmoji}>{sound.emoji}</Text>
                  <Text style={styles.soundName}>{sound.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Track Selector - Dynamic based on category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {soundCategory === 'drums' ? '🥁' : soundCategory === 'synths' ? '🎛️' : '🎸'} Track
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.trackSelector}>
              {soundCategory === 'drums' && ['kick', 'snare', 'hihat', 'clap'].map((track) => (
                <TouchableOpacity
                  key={track}
                  style={[styles.trackButton, selectedTrack === track && styles.trackButtonActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTrack(track);
                  }}
                >
                  <Text style={[styles.trackButtonText, selectedTrack === track && styles.trackButtonTextActive]}>
                    {track.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
              {soundCategory === 'synths' && ['arp2600', 'juno106', 'minimoog', 'tb303'].map((track) => (
                <TouchableOpacity
                  key={track}
                  style={[styles.trackButton, selectedTrack === track && styles.trackButtonActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTrack(track);
                  }}
                >
                  <Text style={[styles.trackButtonText, selectedTrack === track && styles.trackButtonTextActive]}>
                    {track.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
              {soundCategory === 'bass' && ['bass808', 'bassReese'].map((track) => (
                <TouchableOpacity
                  key={track}
                  style={[styles.trackButton, selectedTrack === track && styles.trackButtonActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTrack(track);
                  }}
                >
                  <Text style={[styles.trackButtonText, selectedTrack === track && styles.trackButtonTextActive]}>
                    {track === 'bass808' ? '808' : 'REESE'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 16-Step Sequencer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎹 Pattern ({selectedTrack.toUpperCase()})</Text>
          <View style={styles.sequencer}>
            {(patterns[selectedTrack] || Array(16).fill(0)).map((active, index) => {
              const isCurrentStep = currentStep === index;
              const stepScale = stepAnims[index].interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
              
              return (
                <Animated.View key={index} style={[styles.stepWrapper, { transform: [{ scale: stepScale }] }]}>
                  <TouchableOpacity
                    style={[styles.step, active === 1 && styles.stepActive, isCurrentStep && styles.stepCurrent]}
                    onPress={() => toggleStep(index)}
                  >
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    {active === 1 && <View style={styles.stepIndicator} />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Transport Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎚️ Transport</Text>
          <View style={styles.transport}>
            <TouchableOpacity style={styles.transportBtnClear} onPress={clearPattern}>
              <Text style={styles.transportBtnText}>CLEAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.transportBtnPlay} onPress={togglePlayback}>
              <LinearGradient
                colors={isPlaying ? ['#FF6B35', '#FF8C5A'] : ['#D4AF37', '#FFD700']}
                style={styles.transportBtnGradient}
              >
                <Text style={styles.transportBtnTextLarge}>{isPlaying ? '⏸' : '▶️'}</Text>
                <Text style={styles.transportBtnLabel}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.transportBtnClear} onPress={() => setShowPresets(!showPresets)}>
              <Text style={styles.transportBtnText}>PRESETS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Presets */}
        {showPresets && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 Pattern Presets</Text>
            {PRESET_PATTERNS.map((preset) => (
              <TouchableOpacity key={preset.id} style={styles.presetCard} onPress={() => loadPreset(preset)}>
                <LinearGradient colors={['rgba(15, 15, 15, 0.95)', '#000000']} style={styles.presetGradient}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetBpm}>{preset.bpm} BPM</Text>
                  <View style={styles.presetPattern}>
                    {preset.patterns.kick.map((step, i) => (
                      <View key={i} style={[styles.presetStep, step === 1 && styles.presetStepActive]} />
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoDot: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B35',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  bpmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  bpmButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  bpmDisplay: {
    width: 120,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
  },
  bpmLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 4,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  categoryTabActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#FFD700',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  categoryTabTextActive: {
    color: '#000000',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  soundCard: {
    width: (width - 64) / 2,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundCardActive: {
    borderColor: '#D4AF37',
  },
  soundCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  soundEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  soundName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  sequencer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepWrapper: {
    width: (width - 88) / 4,
  },
  step: {
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#FFD700',
  },
  stepCurrent: {
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    marginTop: 4,
  },
  transport: {
    flexDirection: 'row',
    gap: 12,
  },
  transportBtnClear: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  transportBtnPlay: {
    flex: 2,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
  },
  transportBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  transportBtnTextLarge: {
    fontSize: 28,
  },
  transportBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
    letterSpacing: 1,
  },
  presetCard: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  presetGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  presetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  presetBpm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  presetPattern: {
    flexDirection: 'row',
    gap: 4,
  },
  presetStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  presetStepActive: {
    backgroundColor: '#D4AF37',
  },
  // Track Selector
  trackSelector: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  trackButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 10, 10, 0.95)', // COLORS.cardDark
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#B8960E',
    borderColor: '#D4AF37',
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trackButtonTextActive: {
    color: '#D4AF37',
  },
});

export default StudioScreenNew;
