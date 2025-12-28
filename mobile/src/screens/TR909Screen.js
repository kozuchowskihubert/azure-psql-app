/**
 * HAOS.fm TR-909 Drum Machine
 * Visual recreation of the legendary Roland TR-909
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
import tr909Bridge from '../drums/TR909Bridge';
import nativeAudioContext from '../audio/NativeAudioContext';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  cyan: '#00D9FF',
  blue: '#0066FF',
  red: '#FF0000',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
  lcd: '#00ff00',
};

const TR909Screen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(135);
  const [pattern, setPattern] = useState({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
    rim: Array(16).fill(false),
    crash: Array(16).fill(false),
    ride: Array(16).fill(false),
    tom: Array(16).fill(false),
  });
  
  const [accent, setAccent] = useState(Array(16).fill(false));
  const [levels, setLevels] = useState({
    kick: 1.0,
    snare: 0.85,
    hihat: 0.65,
    clap: 0.75,
    rim: 0.6,
    crash: 0.7,
    ride: 0.65,
    tom: 0.8,
  });

  const intervalRef = useRef(null);
  const lcdAnim = useRef(new Animated.Value(0)).current;
  
  // Visual enhancement animations
  const stepGlowAnims = useRef(
    Array(16).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    initializeDrums();
    startLcdAnimation();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const initializeDrums = async () => {
    try {
      await tr909Bridge.init();
      console.log('✅ TR-909 initialized');
    } catch (error) {
      console.error('❌ TR-909 init failed:', error);
    }
  };

  const startLcdAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lcdAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(lcdAnim, {
          toValue: 0.7,
          duration: 800,
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

  const toggleAccent = (step) => {
    setAccent(prev => prev.map((active, i) => 
      i === step ? !active : active
    ));
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
        const hasAccent = accent[nextStep];
        const accentMultiplier = hasAccent ? 1.3 : 1.0;
        
        // Trigger glow animation for current step
        Animated.sequence([
          Animated.timing(stepGlowAnims[nextStep], {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(stepGlowAnims[nextStep], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Play active instruments
        Object.keys(pattern).forEach(instrument => {
          if (pattern[instrument][nextStep]) {
            playDrum(instrument, levels[instrument] * accentMultiplier);
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
        tr909Bridge.playKick(velocity);
        break;
      case 'snare':
        tr909Bridge.playSnare(velocity);
        break;
      case 'hihat':
        tr909Bridge.playHihat(velocity, false);
        break;
      case 'clap':
        tr909Bridge.playClap(velocity);
        break;
      case 'rim':
        tr909Bridge.playSnare(velocity * 0.4); // Simulated
        break;
      case 'crash':
        tr909Bridge.playHihat(velocity * 1.5, true);
        break;
      case 'ride':
        tr909Bridge.playHihat(velocity * 0.9, true);
        break;
      case 'tom':
        tr909Bridge.playKick(velocity * 0.7); // Simulated
        break;
    }
  };

  const clearPattern = () => {
    setPattern({
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      clap: Array(16).fill(false),
      rim: Array(16).fill(false),
      crash: Array(16).fill(false),
      ride: Array(16).fill(false),
      tom: Array(16).fill(false),
    });
    setAccent(Array(16).fill(false));
  };

  const fillPattern = (instrument) => {
    setPattern(prev => ({
      ...prev,
      [instrument]: Array(16).fill(true),
    }));
  };

  const renderStepButton = (instrument, step) => {
    const isActive = pattern[instrument][step];
    const isCurrent = step === currentStep && isPlaying;
    const hasAccent = accent[step];
    const glowOpacity = stepGlowAnims[step];
    
    return (
      <View key={`${instrument}-${step}`} style={styles.stepWrapper}>
        {/* Glow ring for current step */}
        {isCurrent && isActive && (
          <Animated.View
            style={[
              styles.stepGlowRing,
              {
                opacity: glowOpacity,
                transform: [{
                  scale: glowOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                }],
              },
            ]}
          />
        )}
        
        {/* Accent glow ring (cyan) */}
        {isCurrent && isActive && hasAccent && (
          <Animated.View
            style={[
              styles.accentGlowRing,
              {
                opacity: glowOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          />
        )}
        
        <TouchableOpacity
          style={[
            styles.stepButton,
            isActive && styles.stepButtonActive,
            isCurrent && styles.stepButtonCurrent,
            hasAccent && isActive && styles.stepButtonAccent,
            isActive && isCurrent && styles.stepButtonPlaying,
          ]}
          onPress={() => toggleStep(instrument, step)}
          onLongPress={() => toggleAccent(step)}
        >
          {/* Velocity indicator bar for active steps */}
          {isActive && (
            <View
              style={[
                styles.velocityBar,
                {
                  height: `${levels[instrument] * 100}%`,
                  backgroundColor: isCurrent 
                    ? (hasAccent ? HAOS_COLORS.cyan : HAOS_COLORS.blue) 
                    : HAOS_COLORS.cyan,
                },
              ]}
            />
          )}
          
          {/* Accent indicator dot */}
          {hasAccent && isActive && (
            <View style={[
              styles.accentDot,
              isCurrent && styles.accentDotActive,
            ]} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderInstrumentRow = (name, label, color) => {
    return (
      <View key={name} style={styles.instrumentRow}>
        <View style={styles.instrumentLabel}>
          <Text style={[styles.instrumentText, { color }]}>{label}</Text>
          <View style={styles.instrumentButtons}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playDrum(name, levels[name])}
            >
              <Text style={styles.playButtonText}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fillButton}
              onPress={() => fillPattern(name)}
            >
              <Text style={styles.fillButtonText}>■</Text>
            </TouchableOpacity>
          </View>
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
        colors={[HAOS_COLORS.dark, HAOS_COLORS.metal, HAOS_COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TR-909</Text>
          <Text style={styles.subtitle}>RHYTHM COMPOSER</Text>
          <Animated.View 
            style={[
              styles.lcdDisplay,
              { opacity: lcdAnim },
            ]}
          >
            <Text style={styles.lcdText}>
              {isPlaying ? `♪ ${bpm} BPM` : 'READY'}
            </Text>
          </Animated.View>
        </View>
        
        <View style={styles.statusLeds}>
          <View style={[styles.statusLed, isPlaying && styles.statusLedActive]} />
          <Text style={styles.statusLabel}>RUN</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <View style={styles.controlRow}>
            <View style={styles.control}>
              <Text style={styles.controlLabel}>TEMPO</Text>
              <View style={styles.bpmDisplay}>
                <Text style={styles.bpmText}>{bpm}</Text>
                {isPlaying && (
                  <Animated.View
                    style={[
                      styles.tempoPulse,
                      {
                        opacity: lcdAnim,
                        transform: [{
                          scale: lcdAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.2],
                          }),
                        }],
                      },
                    ]}
                  />
                )}
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
                  onPress={() => setBpm(Math.min(260, bpm + 5))}
                >
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.mainControls}>
              <TouchableOpacity
                style={[styles.mainButton, isPlaying && styles.mainButtonActive]}
                onPress={playSequence}
              >
                <Text style={styles.mainButtonText}>
                  {isPlaying ? '■' : '▶'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearPattern}
              >
                <Text style={styles.clearButtonText}>CLR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoPanel}>
            <Text style={styles.infoText}>
              💡 Long press step for ACCENT
            </Text>
          </View>
        </View>

        {/* Pattern Editor */}
        <View style={styles.patternEditor}>
          <View style={styles.stepNumbers}>
            <View style={styles.instrumentLabel} />
            {Array(16).fill(0).map((_, i) => (
              <View key={i} style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
                {accent[i] && (
                  <View style={styles.accentDot} />
                )}
              </View>
            ))}
          </View>

          {renderInstrumentRow('kick', 'BASS DRUM', HAOS_COLORS.cyan)}
          {renderInstrumentRow('snare', 'SNARE', HAOS_COLORS.cyan)}
          {renderInstrumentRow('hihat', 'HI-HAT', HAOS_COLORS.blue)}
          {renderInstrumentRow('clap', 'HAND CLAP', HAOS_COLORS.cyan)}
          {renderInstrumentRow('rim', 'RIM SHOT', HAOS_COLORS.cyan)}
          {renderInstrumentRow('crash', 'CRASH', HAOS_COLORS.blue)}
          {renderInstrumentRow('ride', 'RIDE', HAOS_COLORS.blue)}
          {renderInstrumentRow('tom', 'TOM', HAOS_COLORS.cyan)}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎛️ Digital/analog hybrid drum machine • Techno legend
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
    borderBottomColor: HAOS_COLORS.cyan,
  },
  backButton: {
    color: HAOS_COLORS.cyan,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    letterSpacing: 2,
    marginTop: 2,
  },
  lcdDisplay: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: HAOS_COLORS.lcd,
  },
  lcdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HAOS_COLORS.lcd,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  statusLeds: {
    alignItems: 'center',
  },
  statusLed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: HAOS_COLORS.red,
    marginBottom: 4,
  },
  statusLedActive: {
    backgroundColor: HAOS_COLORS.red,
    shadowColor: HAOS_COLORS.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  statusLabel: {
    fontSize: 8,
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  controlPanel: {
    padding: 20,
    backgroundColor: HAOS_COLORS.metal,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.cyan,
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
    borderColor: HAOS_COLORS.cyan,
    marginBottom: 8,
    position: 'relative',
    minWidth: 80,
    alignItems: 'center',
  },
  bpmText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
    fontFamily: 'monospace',
  },
  tempoPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: HAOS_COLORS.lcd,
    shadowColor: HAOS_COLORS.lcd,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bpmButton: {
    backgroundColor: HAOS_COLORS.cyan,
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  mainControls: {
    flexDirection: 'row',
    gap: 12,
  },
  mainButton: {
    backgroundColor: HAOS_COLORS.blue,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: HAOS_COLORS.cyan,
  },
  mainButtonActive: {
    backgroundColor: HAOS_COLORS.red,
    borderColor: HAOS_COLORS.red,
  },
  mainButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
  },
  infoPanel: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan,
  },
  infoText: {
    fontSize: 11,
    color: HAOS_COLORS.cyan,
    textAlign: 'center',
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
  accentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HAOS_COLORS.red,
    marginTop: 2,
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
  instrumentButtons: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  playButton: {
    backgroundColor: '#333',
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 10,
    color: HAOS_COLORS.cyan,
  },
  fillButton: {
    backgroundColor: '#333',
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillButtonText: {
    fontSize: 10,
    color: HAOS_COLORS.blue,
  },
  stepsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  stepWrapper: {
    position: 'relative',
    marginRight: 2,
  },
  stepGlowRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: HAOS_COLORS.blue,
    shadowColor: HAOS_COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  accentGlowRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  stepButton: {
    width: 16,
    height: 32,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  stepButtonActive: {
    backgroundColor: HAOS_COLORS.cyan,
    borderColor: HAOS_COLORS.cyan,
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  stepButtonAccent: {
    backgroundColor: HAOS_COLORS.red,
    borderColor: HAOS_COLORS.red,
  },
  stepButtonCurrent: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  stepButtonPlaying: {
    backgroundColor: HAOS_COLORS.blue,
    shadowColor: HAOS_COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  velocityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: HAOS_COLORS.cyan,
    borderRadius: 2,
  },
  accentDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HAOS_COLORS.red,
  },
  accentDotActive: {
    backgroundColor: HAOS_COLORS.cyan,
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  levelSlider: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  levelText: {
    fontSize: 10,
    color: HAOS_COLORS.cyan,
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

export default TR909Screen;
