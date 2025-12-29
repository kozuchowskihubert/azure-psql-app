/**
 * HAOS.fm Universal Synthesizer Screen
 * Based on techno-workspace.html design
 * Supports: ARP2600, Juno-106, Minimoog, TB-303, DX7, MS-20, Prophet-5
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
// import Knob from '../components/Knob'; // REMOVED - Using Sliders instead

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  bgDark: '#0A0A0A',
  bgCard: 'rgba(15, 15, 20, 0.8)',
  bgGlass: 'rgba(255, 255, 255, 0.03)',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  green: '#00ff94',
  purple: '#8B5CF6',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.6)',
  borderSubtle: 'rgba(255, 107, 53, 0.1)',
};

// Musical notes with frequencies
const NOTES = [
  { note: 'C3', freq: 130.81, label: 'C', black: false },
  { note: 'C#3', freq: 138.59, label: 'C#', black: true },
  { note: 'D3', freq: 146.83, label: 'D', black: false },
  { note: 'D#3', freq: 155.56, label: 'D#', black: true },
  { note: 'E3', freq: 164.81, label: 'E', black: false },
  { note: 'F3', freq: 174.61, label: 'F', black: false },
  { note: 'F#3', freq: 185.00, label: 'F#', black: true },
  { note: 'G3', freq: 196.00, label: 'G', black: false },
  { note: 'G#3', freq: 207.65, label: 'G#', black: true },
  { note: 'A3', freq: 220.00, label: 'A', black: false },
  { note: 'A#3', freq: 233.08, label: 'A#', black: true },
  { note: 'B3', freq: 246.94, label: 'B', black: false },
  { note: 'C4', freq: 261.63, label: 'C', black: false },
];

// Synth configurations
const SYNTH_CONFIGS = {
  arp2600: {
    name: 'ARP 2600',
    icon: '🎛️',
    color: '#00D9FF',
    description: 'Semi-modular analog synthesizer',
  },
  juno106: {
    name: 'JUNO-106',
    icon: '🎹',
    color: '#8B5CF6',
    description: 'Classic polyphonic synthesizer',
  },
  minimoog: {
    name: 'MINIMOOG',
    icon: '🔊',
    color: '#FF6B35',
    description: 'Legendary bass synthesizer',
  },
  tb303: {
    name: 'TB-303',
    icon: '🧪',
    color: '#00ff94',
    description: 'Acid bass line machine',
  },
  dx7: {
    name: 'DX7',
    icon: '✨',
    color: '#FF1493',
    description: 'FM synthesis legend',
  },
  ms20: {
    name: 'MS-20',
    icon: '⚡',
    color: '#FFD700',
    description: 'Semi-modular synthesizer',
  },
  prophet5: {
    name: 'PROPHET-5',
    icon: '👑',
    color: '#4169E1',
    description: 'Polyphonic analog synth',
  },
};

const ModularSynthScreen = ({ route, navigation }) => {
  const { synthType = 'arp2600' } = route.params || {};
  const config = SYNTH_CONFIGS[synthType] || SYNTH_CONFIGS.arp2600;

  // Synth parameters
  const [cutoff, setCutoff] = useState(1000);
  const [resonance, setResonance] = useState(5);
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);
  const [distortion, setDistortion] = useState(0);
  const [reverb, setReverb] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNotes, setActiveNotes] = useState(new Set());

  // Audio context reference
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    initAudio();
    return () => {
      stopAllNotes();
    };
  }, []);

  const initAudio = () => {
    try {
      if (typeof window !== 'undefined' && window.AudioContext) {
        audioContextRef.current = new window.AudioContext();
      }
      console.log('✅ Audio initialized for', config.name);
    } catch (error) {
      console.error('❌ Audio init failed:', error);
    }
  };

  const playTestNote = () => {
    const frequency = 261.63; // C4
    playNote('C4', frequency);
    
    // Auto-stop after 1 second
    setTimeout(() => {
      stopNote('C4');
    }, 1000);
  };

  const playNote = (note, freq) => {
    if (!audioContextRef.current) return;

    setIsPlaying(true);
    setActiveNotes(prev => new Set([...prev, note]));

    try {
      const audioContext = audioContextRef.current;
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      // Configure oscillator
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

      // Configure filter
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(cutoff, audioContext.currentTime);
      filterNode.Q.setValueAtTime(resonance, audioContext.currentTime);

      // Configure envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + attack);
      gainNode.gain.linearRampToValueAtTime(sustain, audioContext.currentTime + attack + decay);

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start
      oscillator.start(audioContext.currentTime);

      // Store references
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      console.log(`🎹 Playing ${config.name}: ${note} @ ${freq.toFixed(2)}Hz`);
    } catch (error) {
      console.error('❌ Play note failed:', error);
    }
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });

    if (oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
      const audioContext = audioContextRef.current;
      const gainNode = gainNodeRef.current;
      
      // Apply release envelope
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + release);

      // Stop oscillator after release
      oscillatorRef.current.stop(audioContext.currentTime + release);
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    }

    if (activeNotes.size === 0) {
      setIsPlaying(false);
    }
  };

  const stopAllNotes = () => {
    activeNotes.forEach(note => stopNote(note));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(10, 10, 10, 0.95)', 'rgba(10, 10, 10, 0.8)']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{config.icon}</Text>
          <View>
            <Text style={[styles.headerTitle, { color: config.color }]}>
              {config.name}
            </Text>
            <Text style={styles.headerSubtitle}>{config.description}</Text>
          </View>
        </View>

        {/* Play Button - Prominent */}
        <TouchableOpacity 
          style={[
            styles.playButton,
            isPlaying && styles.playButtonActive,
            { borderColor: config.color }
          ]}
          onPress={playTestNote}
        >
          <Text style={[styles.playIcon, { color: config.color }]}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
          <Text style={[styles.playText, { color: config.color }]}>
            {isPlaying ? 'PLAYING' : 'TEST'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transport Controls Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: `${config.color}20` }]}>
              <Text style={styles.panelIconText}>🎚️</Text>
            </View>
            <Text style={styles.panelTitle}>TRANSPORT</Text>
          </View>

          <View style={styles.transportButtons}>
            <TouchableOpacity 
              style={[styles.transportBtn, isPlaying && styles.transportBtnActive]}
              onPress={playTestNote}
            >
              <Text style={styles.transportBtnText}>
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.transportBtn}
              onPress={stopAllNotes}
            >
              <Text style={styles.transportBtnText}>⏹ STOP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Section - Based on techno-workspace.html */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: `${config.color}20` }]}>
              <Text style={styles.panelIconText}>🎛️</Text>
            </View>
            <Text style={styles.panelTitle}>FILTER</Text>
          </View>

          <View style={styles.knobGrid}>
            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>CUTOFF</Text>
              <Text style={styles.knobValue}>{Math.round(cutoff)} Hz</Text>
            </View>

            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>RESONANCE</Text>
              <Text style={styles.knobValue}>{resonance.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Envelope Section - ADSR */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: `${HAOS_COLORS.green}20` }]}>
              <Text style={styles.panelIconText}>📈</Text>
            </View>
            <Text style={styles.panelTitle}>ENVELOPE (ADSR)</Text>
          </View>

          <View style={styles.knobGrid}>
            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>ATTACK</Text>
              <Text style={styles.knobValue}>{(attack * 1000).toFixed(0)} ms</Text>
            </View>

            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>DECAY</Text>
              <Text style={styles.knobValue}>{(decay * 1000).toFixed(0)} ms</Text>
            </View>

            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>SUSTAIN</Text>
              <Text style={styles.knobValue}>{(sustain * 100).toFixed(0)}%</Text>
            </View>

            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>RELEASE</Text>
              <Text style={styles.knobValue}>{(release * 1000).toFixed(0)} ms</Text>
            </View>
          </View>
        </View>

        {/* Effects Section */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: `${HAOS_COLORS.cyan}20` }]}>
              <Text style={styles.panelIconText}>✨</Text>
            </View>
            <Text style={styles.panelTitle}>EFFECTS</Text>
          </View>

          <View style={styles.knobGrid}>
            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>DISTORTION</Text>
              <Text style={styles.knobValue}>{distortion.toFixed(0)}%</Text>
            </View>

            <View style={styles.knobContainer}>
              {/* TODO: Replace with Slider */}
              <Text style={styles.knobLabel}>REVERB</Text>
              <Text style={styles.knobValue}>{reverb.toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        {/* Keyboard Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: `${config.color}20` }]}>
              <Text style={styles.panelIconText}>🎹</Text>
            </View>
            <Text style={styles.panelTitle}>KEYBOARD</Text>
          </View>

          <View style={styles.keyboardContainer}>
            <View style={styles.keyboard}>
              {NOTES.map((noteData, index) => {
                const isActive = activeNotes.has(noteData.note);
                
                if (noteData.black) {
                  // Position black keys between white keys
                  const whiteKeyWidth = (width - 80) / 8; // 8 white keys visible
                  const blackKeyWidth = 30;
                  const blackKeyOffset = (whiteKeyWidth - blackKeyWidth / 2);
                  
                  // Calculate which white key this black key follows
                  const whiteKeyIndex = [1, 3, 6, 8, 10].indexOf(index);
                  if (whiteKeyIndex === -1) return null;
                  
                  const left = (whiteKeyIndex + 0.7) * whiteKeyWidth;
                  
                  return (
                    <TouchableOpacity
                      key={noteData.note}
                      style={[
                        styles.keyBlack,
                        { left },
                        isActive && { backgroundColor: config.color }
                      ]}
                      onPressIn={() => playNote(noteData.note, noteData.freq)}
                      onPressOut={() => stopNote(noteData.note)}
                    >
                      <Text style={styles.keyLabelBlack}>{noteData.label}</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={noteData.note}
                    style={[
                      styles.keyWhite,
                      isActive && { backgroundColor: `${config.color}40` }
                    ]}
                    onPressIn={() => playNote(noteData.note, noteData.freq)}
                    onPressOut={() => stopNote(noteData.note)}
                  >
                    <Text style={styles.keyLabel}>{noteData.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Info Panel */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            💡 Press and hold keyboard keys to play notes
          </Text>
          <Text style={styles.infoText}>
            🎛️ Adjust knobs to shape your sound
          </Text>
          <Text style={styles.infoText}>
            ▶ Use TEST button for quick sound preview
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.bgDark,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.borderSubtle,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HAOS_COLORS.bgGlass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: HAOS_COLORS.borderSubtle,
  },
  backArrow: {
    fontSize: 24,
    color: HAOS_COLORS.textPrimary,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HAOS_COLORS.textPrimary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: HAOS_COLORS.textSecondary,
    marginTop: 2,
  },
  playButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    minWidth: 90,
  },
  playButtonActive: {
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
  },
  playIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  panel: {
    backgroundColor: HAOS_COLORS.bgCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: HAOS_COLORS.borderSubtle,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.borderSubtle,
  },
  panelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  panelIconText: {
    fontSize: 20,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.textPrimary,
    letterSpacing: 1,
  },
  transportButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  transportBtn: {
    flex: 1,
    padding: 18,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    alignItems: 'center',
  },
  transportBtnActive: {
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
    borderColor: 'rgba(0, 255, 148, 0.5)',
  },
  transportBtnText: {
    color: HAOS_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  knobGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },
  knobContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  knobLabel: {
    fontSize: 11,
    color: HAOS_COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  knobValue: {
    fontSize: 13,
    color: HAOS_COLORS.orange,
    marginTop: 4,
    fontWeight: '600',
  },
  keyboardContainer: {
    overflow: 'hidden',
  },
  keyboard: {
    flexDirection: 'row',
    height: 120,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'visible',
  },
  keyWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 1,
    borderRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  keyBlack: {
    position: 'absolute',
    width: 30,
    height: 70,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    zIndex: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  keyLabel: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  keyLabelBlack: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '600',
  },
  infoPanel: {
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  infoText: {
    fontSize: 12,
    color: HAOS_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default ModularSynthScreen;
