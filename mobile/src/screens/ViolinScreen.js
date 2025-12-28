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
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HAOS_COLORS = {
  orange: '#ff8800',
  red: '#ff0066',
  yellow: '#ffcc00',
  pink: '#ff00ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const ARTICULATIONS = [
  { id: 'sustain', name: 'SUSTAIN', color: '#ff8800', icon: '🎻', description: 'Smooth, legato bowing' },
  { id: 'staccato', name: 'STACCATO', color: '#ff0066', icon: '⚡', description: 'Short, detached notes' },
  { id: 'pizzicato', name: 'PIZZICATO', color: '#ffcc00', icon: '✨', description: 'Plucked strings' },
  { id: 'tremolo', name: 'TREMOLO', color: '#ff00ff', icon: '💫', description: 'Rapid bow movement' },
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
          <Text style={styles.sectionTitle}>MAIN CONTROLS</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VOLUME</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={volume}
              onChange={setVolume}
              minimumTrackTintColor={currentArticulation.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentArticulation.color}
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
              minimumTrackTintColor={currentArticulation.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentArticulation.color}
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
              minimumTrackTintColor={currentArticulation.color}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={currentArticulation.color}
            />
            <Text style={styles.controlValue}>{Math.round(brightness)}</Text>
          </View>
        </LinearGradient>
        
        {/* Expression */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPRESSION</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VIBRATO RATE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={0.1}
              value={vibratoRate}
              onChange={setVibratoRate}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.orange}
            />
            <Text style={styles.controlValue}>{vibratoRate.toFixed(1)} Hz</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VIBRATO DEPTH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vibratoDepth}
              onChange={setVibratoDepth}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.orange}
            />
            <Text style={styles.controlValue}>{Math.round(vibratoDepth)}%</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>EXPRESSION</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={127}
              value={expression}
              onChange={setExpression}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(expression)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>BOW PRESSURE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={bowPressure}
              onChange={setBowPressure}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(bowPressure)}</Text>
          </View>
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
              colors={['rgba(255,136,0,0.2)', 'rgba(255,136,0,0.05)']}
              style={styles.ensembleControls}
            >
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>SIZE</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={2}
                  maximumValue={16}
                  step={1}
                  value={ensembleSize}
                  onChange={setEnsembleSize}
                  minimumTrackTintColor={HAOS_COLORS.orange}
                  maximumTrackTintColor={HAOS_COLORS.mediumGray}
                  thumbTintColor={HAOS_COLORS.orange}
                />
                <Text style={styles.controlValue}>{ensembleSize}</Text>
              </View>
              
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>STEREO WIDTH</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={stereoWidth}
                  onChange={setStereoWidth}
                  minimumTrackTintColor={HAOS_COLORS.orange}
                  maximumTrackTintColor={HAOS_COLORS.mediumGray}
                  thumbTintColor={HAOS_COLORS.orange}
                />
                <Text style={styles.controlValue}>{Math.round(stereoWidth)}%</Text>
              </View>
            </LinearGradient>
          )}
        </View>
        
        {/* Playing Technique Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎻 VIOLIN TECHNIQUES</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.orange }}>SUSTAIN:</Text> Smooth legato bowing{'\n'}
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.red }}>STACCATO:</Text> Short detached notes{'\n'}
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.yellow }}>PIZZICATO:</Text> Plucked strings{'\n'}
            <Text style={{ fontWeight: 'bold', color: HAOS_COLORS.pink }}>TREMOLO:</Text> Rapid bow movement{'\n'}
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
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.orange,
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
    borderColor: HAOS_COLORS.orange,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.orange,
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
    color: HAOS_COLORS.orange,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  articulationSelector: {
    padding: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
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
    borderColor: HAOS_COLORS.orange,
    marginBottom: 15,
  },
  ensembleToggleActive: {
    backgroundColor: 'rgba(255,136,0,0.2)',
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
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  ensembleTitleActive: {
    color: HAOS_COLORS.orange,
  },
  ensembleSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  ensembleControls: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HAOS_COLORS.orange,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,136,0,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.orange,
  },
  infoTitle: {
    fontSize: 18,
    color: HAOS_COLORS.orange,
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
