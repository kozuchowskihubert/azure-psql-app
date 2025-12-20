/**
 * HAOS.fm TR-808 Drum Machine
 * Visual recreation of the legendary Roland TR-808
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
import tr808Bridge from '../drums/TR808Bridge';
import nativeAudioContext from '../audio/NativeAudioContext';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  red: '#FF0000',
  dark: '#0a0a0a',
  metal: '#2a2a2a',
  silver: '#c0c0c0',
  led: '#ff0033',
};

const TR808Screen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [pattern, setPattern] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
    rimshot: Array(16).fill(false),
    cowbell: Array(16).fill(false),
    cymbal: Array(16).fill(false),
    tom: Array(16).fill(false),
  });
  
  const [levels, setLevels] = useState({
    kick: 1.0,
    snare: 0.9,
    hihat: 0.7,
    clap: 0.8,
    rimshot: 0.6,
    cowbell: 0.5,
    cymbal: 0.6,
    tom: 0.7,
  });

  const stepRefs = useRef({});
  const intervalRef = useRef(null);
  const ledAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeDrums();
    startLedAnimation();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeDrums = async () => {
    try {
      await tr808Bridge.init();
      console.log('✅ TR-808 initialized');
    } catch (error) {
      console.error('❌ TR-808 init failed:', error);
    }
  };

  const startLedAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ledAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ledAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const toggleStep = (instrument, step) => {
    setPattern(prev => ({
      ...prev,
      [instrument]: prev[instrument].map((active, i) => 
        i === step ? !active : active
      ),
    }));
  };

  const playSequence = async () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }

    // Resume audio context before starting (iOS requirement)
    await nativeAudioContext.resume();

    setIsPlaying(true);
    const stepTime = (60 / bpm) * 250; // 16th notes

    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = (prev + 1) % 16;
        
        // Play active instruments
        Object.keys(pattern).forEach(instrument => {
          if (pattern[instrument][nextStep]) {
            playDrum(instrument, levels[instrument]);
          }
        });
        
        return nextStep;
      });
    }, stepTime);
  };

  const playDrum = async (drum, velocity) => {
    // Resume audio context if suspended (iOS requirement)
    await nativeAudioContext.resume();
    
    switch (drum) {
      case 'kick':
        tr808Bridge.playKick(velocity);
        break;
      case 'snare':
        tr808Bridge.playSnare(velocity);
        break;
      case 'hihat':
        tr808Bridge.playHihat(velocity, false);
        break;
      case 'clap':
        tr808Bridge.playClap(velocity);
        break;
      case 'rimshot':
        tr808Bridge.playSnare(velocity * 0.5); // Simulated
        break;
      case 'cowbell':
        tr808Bridge.playHihat(velocity, true); // Simulated
        break;
      case 'cymbal':
        tr808Bridge.playHihat(velocity * 1.2, true);
        break;
      case 'tom':
        tr808Bridge.playKick(velocity * 0.8); // Simulated
        break;
    }
  };

  const clearPattern = () => {
    setPattern({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
      rimshot: Array(16).fill(false),
      cowbell: Array(16).fill(false),
      cymbal: Array(16).fill(false),
      tom: Array(16).fill(false),
    });
  };

  const renderStepButton = (instrument, step) => {
    const isActive = pattern[instrument][step];
    const isCurrent = step === currentStep && isPlaying;
    
    return (
      <TouchableOpacity
        key={`${instrument}-${step}`}
        style={[
          styles.stepButton,
          isActive && styles.stepButtonActive,
          isCurrent && styles.stepButtonCurrent,
        ]}
        onPress={() => toggleStep(instrument, step)}
      >
        {isCurrent && (
          <View style={styles.stepIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderInstrumentRow = (name, label, color) => {
    return (
      <View key={name} style={styles.instrumentRow}>
        <View style={styles.instrumentLabel}>
          <Text style={[styles.instrumentText, { color }]}>{label}</Text>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playDrum(name, levels[name])}
          >
            <Text style={styles.playButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.stepsContainer}>
          {Array(16).fill(0).map((_, i) => renderStepButton(name, i))}
        </View>
        
        <View style={styles.levelSlider}>
          <Text style={styles.levelText}>{Math.round(levels[name] * 100)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[HAOS_COLORS.dark, HAOS_COLORS.metal]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TR-808</Text>
          <Text style={styles.subtitle}>RHYTHM COMPOSER</Text>
        </View>
        
        <Animated.View 
          style={[
            styles.powerLed,
            {
              opacity: isPlaying ? ledAnim : 0.3,
            },
          ]}
        />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <View style={styles.controlRow}>
            <View style={styles.control}>
              <Text style={styles.controlLabel}>TEMPO</Text>
              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmText}>{bpm}</Text>
              </View>
              <View style={styles.bpmButtons}>
                <TouchableOpacity
                  style={styles.bpmButton}
                  onPress={() => setBpm(Math.max(40, bpm - 5))}
                >
                  <Text style={styles.bpmButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bpmButton}
                  onPress={() => setBpm(Math.min(240, bpm + 5))}
                >
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.mainButton, isPlaying && styles.mainButtonActive]}
              onPress={playSequence}
            >
              <Text style={styles.mainButtonText}>
                {isPlaying ? '■ STOP' : '▶ START'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearPattern}
            >
              <Text style={styles.clearButtonText}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pattern Editor */}
        <View style={styles.patternEditor}>
          <View style={styles.stepNumbers}>
            <View style={styles.instrumentLabel} />
            {Array(16).fill(0).map((_, i) => (
              <View key={i} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
            ))}
          </View>

          {renderInstrumentRow('kick', 'BASS DRUM', HAOS_COLORS.orange)}
          {renderInstrumentRow('snare', 'SNARE', HAOS_COLORS.orange)}
          {renderInstrumentRow('hihat', 'CLOSED HH', HAOS_COLORS.green)}
          {renderInstrumentRow('clap', 'HAND CLAP', HAOS_COLORS.orange)}
          {renderInstrumentRow('rimshot', 'RIM SHOT', HAOS_COLORS.orange)}
          {renderInstrumentRow('cowbell', 'COWBELL', HAOS_COLORS.green)}
          {renderInstrumentRow('cymbal', 'CYMBAL', HAOS_COLORS.green)}
          {renderInstrumentRow('tom', 'LOW TOM', HAOS_COLORS.orange)}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🥁 Classic analog drum machine • Legendary 808 sound
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.orange,
  },
  backButton: {
    color: HAOS_COLORS.green,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    letterSpacing: 2,
    marginTop: 2,
  },
  powerLed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: HAOS_COLORS.led,
  },
  content: {
    flex: 1,
  },
  controlPanel: {
    padding: 20,
    backgroundColor: HAOS_COLORS.metal,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.orange,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  control: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
    marginBottom: 8,
  },
  bpmDisplay: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: HAOS_COLORS.orange,
    marginBottom: 8,
  },
  bpmText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    fontFamily: 'monospace',
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bpmButton: {
    backgroundColor: HAOS_COLORS.orange,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  mainButton: {
    backgroundColor: HAOS_COLORS.green,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: HAOS_COLORS.green,
  },
  mainButtonActive: {
    backgroundColor: HAOS_COLORS.red,
    borderColor: HAOS_COLORS.red,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  clearButton: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#555',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
  },
  patternEditor: {
    padding: 10,
  },
  stepNumbers: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instrumentLabel: {
    width: 100,
    justifyContent: 'center',
    paddingRight: 8,
  },
  stepNumber: {
    width: 16,
    alignItems: 'center',
    marginRight: 2,
  },
  stepNumberText: {
    fontSize: 8,
    color: HAOS_COLORS.silver,
  },
  instrumentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instrumentText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  playButton: {
    marginTop: 4,
    backgroundColor: '#333',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 10,
    color: HAOS_COLORS.green,
  },
  stepsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  stepButton: {
    width: 16,
    height: 32,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
    borderColor: HAOS_COLORS.orange,
  },
  stepButtonCurrent: {
    borderColor: HAOS_COLORS.green,
    borderWidth: 2,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HAOS_COLORS.green,
  },
  levelSlider: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  levelText: {
    fontSize: 10,
    color: HAOS_COLORS.green,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    textAlign: 'center',
  },
});

export default TR808Screen;
