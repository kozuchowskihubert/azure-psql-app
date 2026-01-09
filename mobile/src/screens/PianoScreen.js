/**
 * HAOS.fm Piano - Professional Piano Instrument
 * Grand, Rhodes, Upright - 88-key range, expression, sustain
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { usePiano } from '../hooks/useAudio';
import pythonAudioEngine from '../services/PythonAudioEngine';
import advancedAudioEngine from '../audio/AdvancedAudioEngine';
import webAudioBridge from '../services/WebAudioBridge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  blue: '#00D9FF',
  purple: '#9966ff',
  pink: '#ff00ff',
  cyan: '#00ffff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const PIANO_TYPES = [
  { id: 'grand', name: 'GRAND PIANO', color: '#00D9FF', icon: '🎹', description: 'Concert grand, warm & rich' },
  { id: 'rhodes', name: 'RHODES', color: '#ff00ff', icon: '✨', description: 'Electric piano, bell-like' },
  { id: 'upright', name: 'UPRIGHT', color: '#9966ff', icon: '🎼', description: 'Intimate, soft touch' },
];

// Professional Synth Modes
const SYNTH_MODES = [
  { id: 'arp2600', name: 'ARP 2600', color: '#FF6B35', icon: '🔥', description: 'Modular synth lead' },
  { id: 'juno106', name: 'JUNO-106', color: '#00ff94', icon: '🌊', description: 'Warm analog chorus' },
  { id: 'minimoog', name: 'MINIMOOG', color: '#FFD700', icon: '⚡', description: 'Fat analog bass' },
  { id: 'tb303', name: 'TB-303', color: '#39FF14', icon: '🧪', description: 'Acid bassline' },
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [1, 2, 3, 4, 5, 6, 7];

const PianoScreen = ({ navigation }) => {
  const [pianoType, setPianoType] = useState('grand');
  const [synthMode, setSynthMode] = useState(null); // null = piano, or synth ID
  const [octave, setOctave] = useState(4);
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2 shift control
  
  // Piano parameters
  const [volume, setVolume] = useState(80);
  const [reverb, setReverb] = useState(30);
  const [brightness, setBrightness] = useState(50);
  const [sustain, setSustain] = useState(false);
  const [velocity, setVelocity] = useState(80);
  
  // Expression
  const [attack, setAttack] = useState(10);
  const [release, setRelease] = useState(50);
  const [detune, setDetune] = useState(0);
  
  // Touch duration tracking for velocity
  const [touchStartTime, setTouchStartTime] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeNotes, setActiveNotes] = useState([]);
  
  // Audio hook integration
  const { playNote: playAudioNote } = usePiano({
    pianoType,
    volume,
    reverb,
    brightness,
    sustain,
    velocity,
    attack,
    release,
    detune
  });
  
  useEffect(() => {
    // Initialize audio engine
    const initAudio = async () => {
      try {
        await advancedAudioEngine.init();
        console.log('✅ Piano audio engine initialized');
      } catch (error) {
        console.error('❌ Piano audio engine init error:', error);
      }
    };
    
    initAudio();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const playNote = async (note, oct, touchVelocity = null) => {
    console.log(`🎹 Playing: ${note}, octave: ${oct}, touchVel: ${touchVelocity}`);
    
    // Apply octave shift
    const finalOctave = oct + octaveShift;
    const noteKey = `${note}${finalOctave}`;
    setActiveNotes(prev => [...prev, noteKey]);
    
    // Use touch velocity if provided, otherwise slider value
    const finalVelocity = touchVelocity !== null ? touchVelocity : velocity;
    const vel = finalVelocity / 127;
    
    console.log(`🎵 Final: ${noteKey}, velocity: ${finalVelocity}, shift: ${octaveShift}`);
    
    // If synth mode is active, use synthesis engine
    if (synthMode) {
      console.log(`🎛️ Synth mode: ${synthMode}`);
      const frequency = getNoteFrequency(note, finalOctave);
      const duration = sustain ? 2.0 : 0.5;
      
      try {
        switch (synthMode) {
          case 'arp2600':
            await pythonAudioEngine.playARP2600(frequency, duration, vel, detune / 1000);
            break;
          case 'juno106':
            await pythonAudioEngine.playJuno106(frequency, duration, vel, detune / 1000);
            break;
          case 'minimoog':
            await pythonAudioEngine.playMinimoog(frequency, duration, vel, detune / 1000);
            break;
          case 'tb303':
            await pythonAudioEngine.playTB303(frequency, duration, vel);
            break;
        }
      } catch (error) {
        console.error('Synth playback error:', error);
      }
    } else {
      // Use piano audio with velocity via WebAudioBridge
      console.log(`🎹 Piano mode: ${pianoType}, calling WebAudioBridge...`);
      try {
        const frequency = getNoteFrequency(note, finalOctave);
        const pianoVelocity = finalVelocity / 127; // Convert 0-127 to 0-1
        const pianoDuration = sustain ? 2.0 : 0.5;
        
        // Use WebAudioBridge for actual audio playback
        webAudioBridge.playPiano(
          frequency,
          pianoDuration,
          pianoVelocity,
          pianoType,
          reverb / 100,
          brightness / 100
        );
        
        console.log(`✅ Piano played: ${noteKey} at ${frequency.toFixed(1)}Hz`);
      } catch (error) {
        console.error('❌ Piano playback error:', error);
      }
    }
    
    // Simulate note release
    setTimeout(() => {
      setActiveNotes(prev => prev.filter(n => n !== noteKey));
    }, sustain ? 2000 : 500);
  };
  
  // Convert note name + octave to frequency
  const getNoteFrequency = (note, octave) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = notes.indexOf(note);
    const midiNote = (octave + 1) * 12 + noteIndex;
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  };
  
  const isBlackKey = (note) => note.includes('#');
  
  const currentPiano = PIANO_TYPES.find(p => p.id === pianoType);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{currentPiano.icon}</Text>
          <Text style={styles.headerTitle}>PIANO</Text>
          <Text style={styles.headerSubtitle}>{currentPiano.name}</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Piano Type Selector */}
        <View style={styles.typeSelector}>
          <Text style={styles.sectionTitle}>PIANO TYPE</Text>
          {PIANO_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                pianoType === type.id && !synthMode && styles.typeButtonActive,
                { borderColor: type.color }
              ]}
              onPress={() => {
                setPianoType(type.id);
                setSynthMode(null); // Disable synth mode
              }}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <View style={styles.typeInfo}>
                <Text style={[
                  styles.typeName,
                  pianoType === type.id && !synthMode && { color: type.color }
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Synth Mode Selector */}
        <View style={styles.typeSelector}>
          <View style={styles.synthHeader}>
            <Text style={styles.sectionTitle}>🎛️ SYNTHESIS MODE</Text>
            <Text style={styles.synthSubtitle}>Play with legendary synthesizers</Text>
          </View>
          {SYNTH_MODES.map(synth => (
            <TouchableOpacity
              key={synth.id}
              style={[
                styles.typeButton,
                synthMode === synth.id && styles.typeButtonActive,
                { borderColor: synth.color }
              ]}
              onPress={() => setSynthMode(synth.id)}
            >
              <Text style={styles.typeIcon}>{synth.icon}</Text>
              <View style={styles.typeInfo}>
                <Text style={[
                  styles.typeName,
                  synthMode === synth.id && { color: synth.color }
                ]}>
                  {synth.name}
                </Text>
                <Text style={styles.typeDescription}>{synth.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Main Controls */}
        <LinearGradient
          colors={[currentPiano.color + '30', currentPiano.color + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>MAIN CONTROLS</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VOLUME</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={volume}
              onChange={setVolume}
              minimumTrackTintColor={currentPiano.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentPiano.color}
            />
            <Text style={styles.controlValue}>{Math.round(volume)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>REVERB</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={reverb}
              onChange={setReverb}
              minimumTrackTintColor={currentPiano.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentPiano.color}
            />
            <Text style={styles.controlValue}>{Math.round(reverb)}%</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>BRIGHTNESS</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={brightness}
              onChange={setBrightness}
              minimumTrackTintColor={currentPiano.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentPiano.color}
            />
            <Text style={styles.controlValue}>{Math.round(brightness)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VELOCITY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={127}
              value={velocity}
              onChange={setVelocity}
              minimumTrackTintColor={currentPiano.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentPiano.color}
            />
            <Text style={styles.controlValue}>{Math.round(velocity)}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.sustainButton, sustain && styles.sustainButtonActive]}
            onPress={() => setSustain(!sustain)}
          >
            <Text style={[
              styles.sustainText,
              sustain && styles.sustainTextActive,
            ]}>
              {sustain ? '✓ SUSTAIN PEDAL' : 'SUSTAIN PEDAL'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Expression */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPRESSION</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ATTACK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={attack}
              onChange={setAttack}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(attack)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RELEASE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={release}
              onChange={setRelease}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(release)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DETUNE</Text>
            <Slider
              style={styles.slider}
              minimumValue={-50}
              maximumValue={50}
              step={1}
              value={detune}
              onChange={setDetune}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>
              {detune > 0 ? '+' : ''}{detune}¢
            </Text>
          </View>
        </View>
        
        {/* Octave Shift Controls */}
        <View style={styles.octaveShiftSection}>
          <View style={styles.keyboardHeader}>
            <Text style={styles.sectionTitle}>🎹 OCTAVE SHIFT</Text>
            <View style={styles.keyboardInfo}>
              <Text style={styles.keyboardInfoText}>
                Base: {octave} • Shift: {octaveShift >= 0 ? `+${octaveShift}` : octaveShift} • Final: {octave + octaveShift} • Velocity: {velocity}
              </Text>
            </View>
          </View>
          <View style={styles.octaveShiftButtons}>
            {[-2, -1, 0, +1, +2].map((shift) => (
              <TouchableOpacity
                key={shift}
                onPress={() => setOctaveShift(shift)}
                style={[
                  styles.octaveShiftButton,
                  octaveShift === shift && styles.octaveShiftButtonActive,
                ]}
              >
                <Text style={[
                  styles.octaveShiftText,
                  octaveShift === shift && styles.octaveShiftTextActive,
                ]}>
                  {shift >= 0 ? `+${shift}` : shift}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Octave Selector */}
        <View style={styles.octaveSection}>
          <Text style={styles.sectionTitle}>BASE OCTAVE</Text>
          <View style={styles.octaveButtons}>
            {OCTAVES.map(oct => (
              <TouchableOpacity
                key={oct}
                style={[
                  styles.octaveButton,
                  octave === oct && styles.octaveButtonActive,
                ]}
                onPress={() => setOctave(oct)}
              >
                <Text style={[
                  styles.octaveText,
                  octave === oct && styles.octaveTextActive,
                ]}>
                  {oct}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Piano Keyboard */}
        <View style={styles.keyboardSection}>
          <Text style={styles.sectionTitle}>KEYBOARD - OCTAVE {octave + octaveShift} (Base: {octave}, Shift: {octaveShift >= 0 ? `+${octaveShift}` : octaveShift})</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.keyboard}
          >
            <View style={styles.keyboardContainer}>
              {/* White keys */}
              {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, i) => {
                const noteKey = `${note}${octave + octaveShift}`;
                const isActive = activeNotes.includes(noteKey);
                
                let touchStartTimeLocal = null;
                
                return (
                  <TouchableOpacity
                    key={`white-${i}`}
                    style={[
                      styles.whiteKey,
                      isActive && styles.whiteKeyActive,
                    ]}
                    onPressIn={() => {
                      touchStartTimeLocal = Date.now();
                      playNote(note, octave, velocity);
                    }}
                    onPressOut={() => {
                      if (touchStartTimeLocal) {
                        const pressDuration = Date.now() - touchStartTimeLocal;
                        let calculatedVelocity = velocity;
                        
                        // Quick tap < 50ms = Loud (127)
                        if (pressDuration < 50) {
                          calculatedVelocity = 127;
                        } 
                        // Long hold > 200ms = Soft (80% of current)
                        else if (pressDuration > 200) {
                          calculatedVelocity = Math.max(40, Math.floor(velocity * 0.8));
                        }
                        
                        setVelocity(calculatedVelocity);
                      }
                    }}
                  >
                    <Text style={[
                      styles.whiteKeyText,
                      isActive && styles.keyTextActive,
                    ]}>
                      {note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {/* Black keys - positioned absolutely between white keys */}
              {[
                { note: 'C#', left: 35 },
                { note: 'D#', left: 85 },
                { note: 'F#', left: 185 },
                { note: 'G#', left: 235 },
                { note: 'A#', left: 285 },
              ].map((blackKey, i) => {
                const noteKey = `${blackKey.note}${octave + octaveShift}`;
                const isActive = activeNotes.includes(noteKey);
                
                let touchStartTimeLocal = null;
                
                return (
                  <TouchableOpacity
                    key={`black-${i}`}
                    style={[
                      styles.blackKey,
                      { left: blackKey.left },
                      isActive && styles.blackKeyActive,
                    ]}
                    onPressIn={() => {
                      touchStartTimeLocal = Date.now();
                      playNote(blackKey.note, octave, velocity);
                    }}
                    onPressOut={() => {
                      if (touchStartTimeLocal) {
                        const pressDuration = Date.now() - touchStartTimeLocal;
                        let calculatedVelocity = velocity;
                        
                        // Quick tap < 50ms = Loud (127)
                        if (pressDuration < 50) {
                          calculatedVelocity = 127;
                        } 
                        // Long hold > 200ms = Soft (80% of current)
                        else if (pressDuration > 200) {
                          calculatedVelocity = Math.max(40, Math.floor(velocity * 0.8));
                        }
                        
                        setVelocity(calculatedVelocity);
                      }
                    }}
                  >
                    <Text style={[
                      styles.blackKeyText,
                      isActive && styles.keyTextActive,
                    ]}>
                      {blackKey.note}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎹 PIANO FEATURES</Text>
          <Text style={styles.infoText}>
            • 88-key range (7 base octaves + shift){'\n'}
            • Octave shift: -2 to +2 (C-1 to C9 total){'\n'}
            • Touch velocity: Quick tap = loud, long hold = soft{'\n'}
            • Three piano types:{'\n'}
            {'  '}→ Grand: Concert hall sound{'\n'}
            {'  '}→ Rhodes: Electric warmth{'\n'}
            {'  '}→ Upright: Intimate character{'\n'}
            • Four synth modes: ARP2600, Juno-106, Minimoog, TB-303{'\n'}
            • Sustain pedal simulation{'\n'}
            • Velocity-sensitive response (1-127 MIDI){'\n'}
            • Reverb & brightness control{'\n'}
            • Professional expression controls{'\n'}
            • Real-time octave & velocity display
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.dark,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.blue,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAOS_COLORS.blue,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: HAOS_COLORS.blue,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  typeSelector: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 15,
  },
  synthHeader: {
    marginBottom: 15,
  },
  synthSubtitle: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    width: 100,
    letterSpacing: 0.5,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  sustainButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.blue,
    alignItems: 'center',
    marginTop: 10,
  },
  sustainButtonActive: {
    backgroundColor: HAOS_COLORS.blue,
  },
  sustainText: {
    fontSize: 14,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sustainTextActive: {
    color: '#000',
  },
  octaveSection: {
    padding: 20,
  },
  octaveButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  octaveButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  octaveButtonActive: {
    backgroundColor: HAOS_COLORS.blue,
    borderColor: HAOS_COLORS.blue,
  },
  octaveText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  octaveTextActive: {
    color: '#000',
  },
  // Octave Shift Controls
  octaveShiftSection: {
    padding: 20,
    backgroundColor: 'rgba(0,217,255,0.05)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
  },
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  keyboardInfo: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.5)',
  },
  keyboardInfoText: {
    fontSize: 11,
    color: '#00D9FF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  octaveShiftButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  octaveShiftButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  octaveShiftButtonActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  octaveShiftText: {
    fontSize: 18,
    color: '#00D9FF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  octaveShiftTextActive: {
    color: '#000',
    fontSize: 20,
  },
  keyboardSection: {
    padding: 20,
  },
  keyboard: {
    marginTop: 10,
  },
  keyboardContainer: {
    flexDirection: 'row',
    height: 150,
    position: 'relative',
    width: 350, // 7 white keys × 50px
  },
  whiteKey: {
    width: 50,
    height: 150,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  whiteKeyActive: {
    backgroundColor: HAOS_COLORS.blue,
  },
  blackKey: {
    width: 35,
    height: 100,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    marginLeft: -17.5,
  },
  blackKeyActive: {
    backgroundColor: HAOS_COLORS.purple,
  },
  whiteKeyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  blackKeyText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  keyTextActive: {
    color: '#fff',
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.blue,
  },
  infoTitle: {
    fontSize: 18,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
});

export default PianoScreen;
