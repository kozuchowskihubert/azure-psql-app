/**
 * HAOS.fm Vocals - Autotune & Vocal Processing
 * Pitch correction, formant shifting, expression control
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  cyan: '#00D9FF',
  pink: '#ff00ff',
  yellow: '#ffcc00',
  red: '#ff0066',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = [
  { id: 'major', name: 'MAJOR', notes: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'minor', name: 'MINOR', notes: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'dorian', name: 'DORIAN', notes: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'mixolydian', name: 'MIXOLYDIAN', notes: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'phrygian', name: 'PHRYGIAN', notes: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian', name: 'LYDIAN', notes: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'chromatic', name: 'CHROMATIC', notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
];

const VocalsScreen = ({ navigation }) => {
  const [autotuneOn, setAutotuneOn] = useState(false);
  const [key, setKey] = useState(0); // C
  const [scale, setScale] = useState('major');
  
  // Autotune controls
  const [retuneSpeed, setRetuneSpeed] = useState(50);
  const [humanize, setHumanize] = useState(30);
  const [snapToScale, setSnapToScale] = useState(true);
  
  // Main controls
  const [inputGain, setInputGain] = useState(75);
  const [outputVolume, setOutputVolume] = useState(80);
  const [reverb, setReverb] = useState(30);
  const [delay, setDelay] = useState(20);
  
  // Formant/Tone
  const [formantShift, setFormantShift] = useState(0);
  const [throatLength, setThroatLength] = useState(50);
  const [breathiness, setBreathiness] = useState(20);
  
  // Pitch detection (simulated)
  const [detectedPitch, setDetectedPitch] = useState('A4');
  const [pitchCorrectionAmount, setPitchCorrectionAmount] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Pulse animation for autotune indicator
  useEffect(() => {
    if (autotuneOn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [autotuneOn]);
  
  const currentScale = SCALES.find(s => s.id === scale);
  const keyNote = NOTES[key];
  
  const loadPreset = (preset) => {
    switch (preset) {
      case 'natural':
        setAutotuneOn(false);
        setRetuneSpeed(80);
        setHumanize(50);
        setFormantShift(0);
        setBreathiness(20);
        break;
      case 'tpain':
        setAutotuneOn(true);
        setRetuneSpeed(0);
        setHumanize(0);
        setSnapToScale(true);
        setFormantShift(0);
        break;
      case 'choir':
        setAutotuneOn(true);
        setRetuneSpeed(40);
        setHumanize(60);
        setFormantShift(2);
        setReverb(70);
        break;
      case 'robot':
        setAutotuneOn(true);
        setRetuneSpeed(0);
        setHumanize(0);
        setFormantShift(-5);
        setBreathiness(0);
        break;
    }
  };
  
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
          <Text style={styles.headerIcon}>🎤</Text>
          <Text style={styles.headerTitle}>VOCALS</Text>
          <Text style={styles.headerSubtitle}>AUTOTUNE & PROCESSING</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Presets */}
        <View style={styles.presetsSection}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => loadPreset('natural')}
          >
            <Text style={styles.presetIcon}>🎵</Text>
            <Text style={styles.presetName}>NATURAL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => loadPreset('tpain')}
          >
            <Text style={styles.presetIcon}>🤖</Text>
            <Text style={styles.presetName}>T-PAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => loadPreset('choir')}
          >
            <Text style={styles.presetIcon}>👥</Text>
            <Text style={styles.presetName}>CHOIR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => loadPreset('robot')}
          >
            <Text style={styles.presetIcon}>🦾</Text>
            <Text style={styles.presetName}>ROBOT</Text>
          </TouchableOpacity>
        </View>
        
        {/* Autotune Toggle */}
        <Animated.View style={[
          styles.autotuneToggleSection,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.autotuneToggle,
              autotuneOn && styles.autotuneToggleActive,
            ]}
            onPress={() => setAutotuneOn(!autotuneOn)}
          >
            <Text style={styles.autotuneIcon}>{autotuneOn ? '✓' : '○'}</Text>
            <Text style={[
              styles.autotuneText,
              autotuneOn && styles.autotuneTextActive,
            ]}>
              {autotuneOn ? 'AUTOTUNE ON' : 'AUTOTUNE OFF'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {autotuneOn && (
          <View>
            {/* Key & Scale Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KEY & SCALE</Text>
              
              {/* Key Selector */}
              <View style={styles.noteGrid}>
                {NOTES.map((note, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.noteButton,
                      key === idx && styles.noteButtonActive,
                    ]}
                    onPress={() => setKey(idx)}
                  >
                    <Text style={[
                      styles.noteText,
                      key === idx && styles.noteTextActive,
                    ]}>
                      {note}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Scale Selector */}
              <View style={styles.scaleGrid}>
                {SCALES.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.scaleButton,
                      scale === s.id && styles.scaleButtonActive,
                    ]}
                    onPress={() => setScale(s.id)}
                  >
                    <Text style={[
                      styles.scaleText,
                      scale === s.id && styles.scaleTextActive,
                    ]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.currentKeyDisplay}>
                <Text style={styles.currentKeyText}>
                  KEY: {keyNote} {currentScale.name}
                </Text>
              </View>
            </View>
            
            {/* Autotune Parameters */}
            <LinearGradient
              colors={['rgba(0,217,255,0.3)', 'rgba(0,217,255,0.1)']}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>AUTOTUNE PARAMETERS</Text>
              
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>RETUNE SPEED</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={retuneSpeed}
                  onValueChange={setRetuneSpeed}
                  minimumTrackTintColor={HAOS_COLORS.cyan}
                  maximumTrackTintColor={HAOS_COLORS.mediumGray}
                  thumbTintColor={HAOS_COLORS.cyan}
                />
                <Text style={styles.controlValue}>
                  {retuneSpeed === 0 ? 'INST' : Math.round(retuneSpeed)}
                </Text>
              </View>
              <Text style={styles.parameterHint}>
                {retuneSpeed < 30 ? '🤖 Robotic (T-Pain effect)' : 
                 retuneSpeed < 70 ? '🎵 Subtle correction' : 
                 '🎤 Natural (slow correction)'}
              </Text>
              
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>HUMANIZE</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={humanize}
                  onValueChange={setHumanize}
                  minimumTrackTintColor={HAOS_COLORS.cyan}
                  maximumTrackTintColor={HAOS_COLORS.mediumGray}
                  thumbTintColor={HAOS_COLORS.cyan}
                />
                <Text style={styles.controlValue}>{Math.round(humanize)}%</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.snapToggle, snapToScale && styles.snapToggleActive]}
                onPress={() => setSnapToScale(!snapToScale)}
              >
                <Text style={styles.snapIcon}>{snapToScale ? '✓' : '○'}</Text>
                <Text style={styles.snapText}>SNAP TO SCALE</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
        
        {/* Main Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MAIN CONTROLS</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>INPUT GAIN</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={inputGain}
              onValueChange={setInputGain}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(inputGain)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>OUTPUT VOLUME</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={outputVolume}
              onValueChange={setOutputVolume}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(outputVolume)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>REVERB</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={reverb}
              onValueChange={setReverb}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(reverb)}%</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DELAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={delay}
              onValueChange={setDelay}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(delay)}%</Text>
          </View>
        </View>
        
        {/* Formant & Tone */}
        <LinearGradient
          colors={['rgba(255,0,255,0.3)', 'rgba(255,0,255,0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>FORMANT & TONE</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>FORMANT SHIFT</Text>
            <Slider
              style={styles.slider}
              minimumValue={-12}
              maximumValue={12}
              step={1}
              value={formantShift}
              onValueChange={setFormantShift}
              minimumTrackTintColor={HAOS_COLORS.pink}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.pink}
            />
            <Text style={styles.controlValue}>
              {formantShift > 0 ? '+' : ''}{formantShift}
            </Text>
          </View>
          <Text style={styles.parameterHint}>
            {formantShift < -4 ? '🤖 Robotic/deep' : 
             formantShift > 4 ? '🧚 High/thin' : 
             '🎤 Natural'}
          </Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>THROAT LENGTH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={throatLength}
              onValueChange={setThroatLength}
              minimumTrackTintColor={HAOS_COLORS.pink}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.pink}
            />
            <Text style={styles.controlValue}>{Math.round(throatLength)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>BREATHINESS</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={breathiness}
              onValueChange={setBreathiness}
              minimumTrackTintColor={HAOS_COLORS.pink}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.pink}
            />
            <Text style={styles.controlValue}>{Math.round(breathiness)}%</Text>
          </View>
        </LinearGradient>
        
        {/* Pitch Detection Display */}
        <View style={styles.pitchSection}>
          <Text style={styles.pitchTitle}>🎯 PITCH DETECTION</Text>
          <View style={styles.pitchDisplay}>
            <Text style={styles.detectedPitch}>{detectedPitch}</Text>
            <Text style={styles.pitchHint}>
              {autotuneOn ? 
                `Correcting to ${keyNote} ${currentScale.name}` : 
                'Monitoring input'}
            </Text>
          </View>
        </View>
        
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎤 VOCAL PROCESSING</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.cyan }}>AUTOTUNE:</Text> Real-time pitch correction{'\n'}
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.cyan }}>FORMANT:</Text> Voice character control{'\n'}
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.cyan }}>KEY/SCALE:</Text> Musical context for correction{'\n'}
            {'\n'}
            • Fast retune = T-Pain effect{'\n'}
            • Slow retune = Natural correction{'\n'}
            • Formant shift changes voice gender{'\n'}
            • Snap to scale for melodic vocals
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
    borderBottomColor: HAOS_COLORS.cyan,
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
    borderColor: HAOS_COLORS.cyan,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.cyan,
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
    color: HAOS_COLORS.cyan,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  presetsSection: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: HAOS_COLORS.darkGray,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan,
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  presetName: {
    fontSize: 10,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  autotuneToggleSection: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  autotuneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: HAOS_COLORS.mediumGray,
  },
  autotuneToggleActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderColor: HAOS_COLORS.cyan,
  },
  autotuneIcon: {
    fontSize: 32,
    color: HAOS_COLORS.cyan,
    marginRight: 15,
    fontWeight: 'bold',
  },
  autotuneText: {
    fontSize: 24,
    color: HAOS_COLORS.mediumGray,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  autotuneTextActive: {
    color: HAOS_COLORS.cyan,
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
  noteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  noteButton: {
    width: (SCREEN_WIDTH - 80) / 6,
    height: 45,
    margin: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HAOS_COLORS.mediumGray,
  },
  noteButtonActive: {
    backgroundColor: 'rgba(0,217,255,0.3)',
    borderColor: HAOS_COLORS.cyan,
  },
  noteText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  noteTextActive: {
    color: HAOS_COLORS.cyan,
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  scaleButton: {
    width: (SCREEN_WIDTH - 80) / 2,
    height: 45,
    margin: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HAOS_COLORS.mediumGray,
  },
  scaleButtonActive: {
    backgroundColor: 'rgba(0,217,255,0.3)',
    borderColor: HAOS_COLORS.cyan,
  },
  scaleText: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
  },
  scaleTextActive: {
    color: HAOS_COLORS.cyan,
  },
  currentKeyDisplay: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,217,255,0.2)',
    alignItems: 'center',
  },
  currentKeyText: {
    fontSize: 16,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
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
    width: 120,
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
    width: 70,
    textAlign: 'right',
  },
  parameterHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: -10,
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  snapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.mediumGray,
  },
  snapToggleActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderColor: HAOS_COLORS.cyan,
  },
  snapIcon: {
    fontSize: 20,
    color: HAOS_COLORS.cyan,
    marginRight: 10,
    fontWeight: 'bold',
  },
  snapText: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  pitchSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
  },
  pitchTitle: {
    fontSize: 18,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  pitchDisplay: {
    alignItems: 'center',
  },
  detectedPitch: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  pitchHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan,
  },
  infoTitle: {
    fontSize: 18,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
});

export default VocalsScreen;
