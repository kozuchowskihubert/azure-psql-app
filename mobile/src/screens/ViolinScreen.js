/**
 * HAOS.fm Violin - Virtual String Instrument
 * 4 articulations, vibrato, expression, ensemble mode
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
import InstrumentControl from '../components/InstrumentControl';
import { HAOS_COLORS } from '../styles/HAOSTheme';
import { INSTRUMENT_COLORS, CONTROL_TYPES } from '../styles/InstrumentTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ARTICULATIONS = [
  { id: 'sustain', name: 'SUSTAIN', color: INSTRUMENT_COLORS.violin.primary, icon: '🎻', description: 'Smooth, legato bowing' },
  { id: 'staccato', name: 'STACCATO', color: INSTRUMENT_COLORS.violin.accent, icon: '⚡', description: 'Short, detached notes' },
  { id: 'pizzicato', name: 'PIZZICATO', color: INSTRUMENT_COLORS.violin.highlight, icon: '✨', description: 'Plucked strings' },
  { id: 'tremolo', name: 'TREMOLO', color: INSTRUMENT_COLORS.violin.secondary, icon: '💫', description: 'Rapid bow movement' },
];

const ViolinScreen = ({ navigation }) => {
  const [articulation, setArticulation] = useState('sustain');
  const [ensembleMode, setEnsembleMode] = useState(false);
  
  // Main controls
  const [volume, setVolume] = useState(75);
  const [reverb, setReverb] = useState(40);
  const [brightness, setBrightness] = useState(60);
  
  // Expression
  const [vibratoRate, setVibratoRate] = useState(5);
  const [vibratoDepth, setVibratoDepth] = useState(30);
  const [expression, setExpression] = useState(80);
  const [bowPressure, setBowPressure] = useState(70);
  
  // Ensemble
  const [ensembleSize, setEnsembleSize] = useState(8);
  const [stereoWidth, setStereoWidth] = useState(60);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const vibratoAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Vibrato animation
  useEffect(() => {
    if (vibratoDepth > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(vibratoAnim, {
            toValue: 1,
            duration: (1000 / vibratoRate),
            useNativeDriver: true,
          }),
          Animated.timing(vibratoAnim, {
            toValue: 0,
            duration: (1000 / vibratoRate),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [vibratoRate, vibratoDepth]);
  
  const currentArticulation = ARTICULATIONS.find(a => a.id === articulation);
  
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
          <Animated.Text 
            style={[
              styles.headerIcon,
              {
                transform: [{
                  translateY: vibratoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, vibratoDepth / 10],
                  })
                }]
              }
            ]}
          >
            {currentArticulation.icon}
          </Animated.Text>
          <Text style={styles.headerTitle}>VIOLIN</Text>
          <Text style={styles.headerSubtitle}>{currentArticulation.name}</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Articulation Selector */}
        <View style={styles.articulationSelector}>
          <Text style={styles.sectionTitle}>ARTICULATION</Text>
          {ARTICULATIONS.map(art => (
            <TouchableOpacity
              key={art.id}
              style={[
                styles.articulationButton,
                articulation === art.id && styles.articulationButtonActive,
                { borderColor: art.color }
              ]}
              onPress={() => setArticulation(art.id)}
            >
              <Text style={styles.articulationIcon}>{art.icon}</Text>
              <View style={styles.articulationInfo}>
                <Text style={[
                  styles.articulationName,
                  articulation === art.id && { color: art.color }
                ]}>
                  {art.name}
                </Text>
                <Text style={styles.articulationDescription}>{art.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Main Controls */}
        <LinearGradient
          colors={[currentArticulation.color + '30', currentArticulation.color + '10']}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: CONTROL_TYPES.filter.color }]}>
            {CONTROL_TYPES.filter.emoji} MAIN CONTROLS
          </Text>
          
          <InstrumentControl
            label="VOLUME"
            value={volume}
            min={0}
            max={100}
            unit=""
            color={currentArticulation.color}
            onValueChange={setVolume}
          />
          
          <InstrumentControl
            label="REVERB"
            value={reverb}
            min={0}
            max={100}
            unit="%"
            color={currentArticulation.color}
            onValueChange={setReverb}
          />
          
          <InstrumentControl
            label="BRIGHTNESS"
            value={brightness}
            min={0}
            max={100}
            unit=""
            color={currentArticulation.color}
            onValueChange={setBrightness}
          />
        </LinearGradient>
        
        {/* Expression */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: CONTROL_TYPES.modulation.color }]}>
            {CONTROL_TYPES.modulation.emoji} EXPRESSION
          </Text>
          
          <InstrumentControl
            label="VIBRATO RATE"
            value={vibratoRate}
            min={0}
            max={10}
            step={0.1}
            unit=" Hz"
            color={INSTRUMENT_COLORS.violin.primary}
            onValueChange={setVibratoRate}
            formatValue={(val) => val.toFixed(1)}
          />
          
          <InstrumentControl
            label="VIBRATO DEPTH"
            value={vibratoDepth}
            min={0}
            max={100}
            unit="%"
            color={INSTRUMENT_COLORS.violin.primary}
            onValueChange={setVibratoDepth}
          />
          
          <InstrumentControl
            label="EXPRESSION"
            value={expression}
            min={0}
            max={127}
            unit=""
            color="#fff"
            onValueChange={setExpression}
          />
          
          <InstrumentControl
            label="BOW PRESSURE"
            value={bowPressure}
            min={0}
            max={100}
            unit=""
            color="#fff"
            onValueChange={setBowPressure}
          />
        </View>
        
        {/* Ensemble Mode */}
        <View style={styles.ensembleSection}>
          <TouchableOpacity
            style={[styles.ensembleToggle, ensembleMode && styles.ensembleToggleActive]}
            onPress={() => setEnsembleMode(!ensembleMode)}
          >
            <Text style={styles.ensembleIcon}>🎼</Text>
            <View style={styles.ensembleInfo}>
              <Text style={[
                styles.ensembleTitle,
                ensembleMode && styles.ensembleTitleActive,
              ]}>
                {ensembleMode ? '✓ ENSEMBLE MODE' : 'ENSEMBLE MODE'}
              </Text>
              <Text style={styles.ensembleSubtitle}>
                Multiple violins for orchestral sound
              </Text>
            </View>
          </TouchableOpacity>
          
          {ensembleMode && (
            <LinearGradient
              colors={['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)']}
              style={styles.ensembleControls}
            >
              <InstrumentControl
                label="SIZE"
                value={ensembleSize}
                min={2}
                max={16}
                step={1}
                unit=""
                color={INSTRUMENT_COLORS.violin.primary}
                onValueChange={setEnsembleSize}
              />
              
              <InstrumentControl
                label="STEREO WIDTH"
                value={stereoWidth}
                min={0}
                max={100}
                unit="%"
                color={INSTRUMENT_COLORS.violin.primary}
                onValueChange={setStereoWidth}
              />
            </LinearGradient>
          )}
        </View>
        
        {/* Playing Technique Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎻 VIOLIN TECHNIQUES</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold', color: INSTRUMENT_COLORS.violin.primary }}>SUSTAIN:</Text> Smooth legato bowing{'\n'}
            <Text style={{ fontWeight: 'bold', color: INSTRUMENT_COLORS.violin.accent }}>STACCATO:</Text> Short detached notes{'\n'}
            <Text style={{ fontWeight: 'bold', color: INSTRUMENT_COLORS.violin.highlight }}>PIZZICATO:</Text> Plucked strings{'\n'}
            <Text style={{ fontWeight: 'bold', color: INSTRUMENT_COLORS.violin.secondary }}>TREMOLO:</Text> Rapid bow movement{'\n'}
            {'\n'}
            • Vibrato for expressive playing{'\n'}
            • Bow pressure control{'\n'}
            • Ensemble mode for sections{'\n'}
            • Professional expression
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
    backgroundColor: HAOS_COLORS.backgroundSecondary,
    borderBottomWidth: 2,
    borderBottomColor: INSTRUMENT_COLORS.violin.primary,
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
    borderColor: INSTRUMENT_COLORS.violin.primary,
  },
  backIcon: {
    fontSize: 24,
    color: INSTRUMENT_COLORS.violin.primary,
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
    color: INSTRUMENT_COLORS.violin.primary,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  articulationSelector: {
    padding: 20,
    backgroundColor: HAOS_COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.border,
  },
  articulationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
  },
  articulationButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  articulationIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  articulationInfo: {
    flex: 1,
  },
  articulationName: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  articulationDescription: {
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
  ensembleSection: {
    margin: 20,
  },
  ensembleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: INSTRUMENT_COLORS.violin.primary,
    marginBottom: 15,
  },
  ensembleToggleActive: {
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  ensembleIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  ensembleInfo: {
    flex: 1,
  },
  ensembleTitle: {
    fontSize: 16,
    color: INSTRUMENT_COLORS.violin.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  ensembleTitleActive: {
    color: INSTRUMENT_COLORS.violin.primary,
  },
  ensembleSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  ensembleControls: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INSTRUMENT_COLORS.violin.primary,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: INSTRUMENT_COLORS.violin.primary,
  },
  infoTitle: {
    fontSize: 18,
    color: INSTRUMENT_COLORS.violin.primary,
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

export default ViolinScreen;
