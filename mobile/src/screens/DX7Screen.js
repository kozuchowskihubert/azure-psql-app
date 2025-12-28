/**
 * HAOS.fm DX7 - FM Synthesis Engine
 * 6 operators, 32 algorithms, classic digital sound
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
  green: '#00ff94',
  cyan: '#00ffff',
  blue: '#00D9FF',
  pink: '#ff00ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const DX7Screen = ({ navigation }) => {
  const [algorithm, setAlgorithm] = useState(1);
  const [selectedOperator, setSelectedOperator] = useState(1);
  
  // Operator parameters (6 operators)
  const [operators, setOperators] = useState(
    Array(6).fill(null).map(() => ({
      level: 99,
      ratio: 1.0,
      detune: 0,
      attack: 50,
      decay: 50,
      sustain: 70,
      release: 50,
    }))
  );
  
  // Global parameters
  const [lfo, setLfo] = useState({
    rate: 3.5,
    depth: 0,
    waveform: 'sine',
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const updateOperator = (opIndex, param, value) => {
    setOperators(prev => 
      prev.map((op, i) => i === opIndex ? { ...op, [param]: value } : op)
    );
  };
  
  const loadPreset = (presetName) => {
    const presets = {
      epiano: {
        algorithm: 5,
        ops: [
          { level: 99, ratio: 1.0, attack: 95, decay: 50, sustain: 70, release: 70 },
          { level: 85, ratio: 14.0, attack: 95, decay: 20, sustain: 50, release: 70 },
          { level: 99, ratio: 1.0, attack: 95, decay: 50, sustain: 70, release: 70 },
          { level: 58, ratio: 1.0, attack: 95, decay: 28, sustain: 50, release: 70 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
        ]
      },
      bass: {
        algorithm: 1,
        ops: [
          { level: 99, ratio: 1.0, attack: 99, decay: 70, sustain: 90, release: 40 },
          { level: 99, ratio: 1.0, attack: 99, decay: 70, sustain: 90, release: 40 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
        ]
      },
      bells: {
        algorithm: 8,
        ops: [
          { level: 99, ratio: 1.0, attack: 99, decay: 85, sustain: 0, release: 85 },
          { level: 80, ratio: 3.5, attack: 99, decay: 85, sustain: 0, release: 85 },
          { level: 75, ratio: 11.0, attack: 99, decay: 60, sustain: 0, release: 60 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
        ]
      },
      brass: {
        algorithm: 22,
        ops: [
          { level: 99, ratio: 1.0, attack: 96, decay: 70, sustain: 85, release: 70 },
          { level: 90, ratio: 1.0, attack: 96, decay: 70, sustain: 85, release: 70 },
          { level: 95, ratio: 1.0, attack: 96, decay: 70, sustain: 85, release: 70 },
          { level: 85, ratio: 1.0, attack: 96, decay: 70, sustain: 85, release: 70 },
          { level: 75, ratio: 1.0, attack: 96, decay: 70, sustain: 85, release: 70 },
          { level: 0, ratio: 1.0, attack: 50, decay: 50, sustain: 70, release: 50 },
        ]
      },
    };
    
    if (presets[presetName]) {
      setAlgorithm(presets[presetName].algorithm);
      setOperators(presets[presetName].ops);
    }
  };
  
  const currentOp = operators[selectedOperator - 1];
  
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
          <Text style={styles.headerIcon}>✨</Text>
          <Text style={styles.headerTitle}>DX7</Text>
          <Text style={styles.headerSubtitle}>FM SYNTHESIS • 6 OPERATORS</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Algorithm Selector */}
        <LinearGradient
          colors={[HAOS_COLORS.pink + '30', HAOS_COLORS.pink + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>ALGORITHM {algorithm}</Text>
          <Text style={styles.sectionSubtitle}>32 FM routing configurations</Text>
          
          <View style={styles.algorithmGrid}>
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(algo => (
              <TouchableOpacity
                key={algo}
                style={[
                  styles.algorithmButton,
                  algorithm === algo && styles.algorithmButtonActive,
                ]}
                onPress={() => setAlgorithm(algo)}
              >
                <Text style={[
                  styles.algorithmText,
                  algorithm === algo && styles.algorithmTextActive,
                ]}>
                  {algo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.moreAlgorithmsButton}
            onPress={() => {/* Show algorithms 17-32 */}}
          >
            <Text style={styles.moreAlgorithmsText}>ALGORITHMS 17-32 →</Text>
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Operator Selector */}
        <View style={styles.operatorSelector}>
          <Text style={styles.operatorSelectorTitle}>SELECT OPERATOR</Text>
          <View style={styles.operatorButtons}>
            {[1,2,3,4,5,6].map(op => (
              <TouchableOpacity
                key={op}
                style={[
                  styles.operatorButton,
                  selectedOperator === op && styles.operatorButtonActive,
                  { borderColor: HAOS_COLORS.cyan },
                ]}
                onPress={() => setSelectedOperator(op)}
              >
                <Text style={[
                  styles.operatorButtonText,
                  selectedOperator === op && { color: HAOS_COLORS.cyan }
                ]}>
                  OP {op}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Operator Controls */}
        <LinearGradient
          colors={[HAOS_COLORS.cyan + '30', HAOS_COLORS.cyan + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>OPERATOR {selectedOperator}</Text>
          
          {/* Level */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>LEVEL</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={99}
              value={currentOp.level}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'level', Math.round(val))}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{currentOp.level}</Text>
          </View>
          
          {/* Frequency Ratio */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RATIO</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={16.0}
              step={0.5}
              value={currentOp.ratio}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'ratio', val)}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{currentOp.ratio.toFixed(1)}</Text>
          </View>
          
          {/* Detune */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DETUNE</Text>
            <Slider
              style={styles.slider}
              minimumValue={-7}
              maximumValue={7}
              step={1}
              value={currentOp.detune}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'detune', val)}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{currentOp.detune > 0 ? '+' : ''}{currentOp.detune}</Text>
          </View>
        </LinearGradient>
        
        {/* Envelope */}
        <LinearGradient
          colors={[HAOS_COLORS.blue + '30', HAOS_COLORS.blue + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>ENVELOPE (OP {selectedOperator})</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ATTACK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={99}
              value={currentOp.attack}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'attack', Math.round(val))}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{currentOp.attack}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DECAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={99}
              value={currentOp.decay}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'decay', Math.round(val))}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{currentOp.decay}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SUSTAIN</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={99}
              value={currentOp.sustain}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'sustain', Math.round(val))}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{currentOp.sustain}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RELEASE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={99}
              value={currentOp.release}
              onValueChange={(val) => updateOperator(selectedOperator - 1, 'release', Math.round(val))}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{currentOp.release}</Text>
          </View>
        </LinearGradient>
        
        {/* LFO */}
        <LinearGradient
          colors={[HAOS_COLORS.green + '30', HAOS_COLORS.green + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>LFO</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RATE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={10}
              step={0.1}
              value={lfo.rate}
              onValueChange={(val) => setLfo(prev => ({ ...prev, rate: val }))}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.controlValue}>{lfo.rate.toFixed(1)} Hz</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DEPTH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={lfo.depth}
              onValueChange={(val) => setLfo(prev => ({ ...prev, depth: Math.round(val) }))}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.controlValue}>{lfo.depth}%</Text>
          </View>
        </LinearGradient>
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>CLASSIC DX7 PRESETS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.pink }]}
              onPress={() => loadPreset('epiano')}
            >
              <Text style={styles.presetIcon}>🎹</Text>
              <Text style={styles.presetText}>E.PIANO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.cyan }]}
              onPress={() => loadPreset('bass')}
            >
              <Text style={styles.presetIcon}>🎸</Text>
              <Text style={styles.presetText}>BASS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.blue }]}
              onPress={() => loadPreset('bells')}
            >
              <Text style={styles.presetIcon}>🔔</Text>
              <Text style={styles.presetText}>BELLS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.green }]}
              onPress={() => loadPreset('brass')}
            >
              <Text style={styles.presetIcon}>🎺</Text>
              <Text style={styles.presetText}>BRASS</Text>
            </TouchableOpacity>
          </View>
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
    borderBottomColor: HAOS_COLORS.pink,
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
    borderColor: HAOS_COLORS.pink,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.pink,
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
    color: HAOS_COLORS.pink,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
  },
  algorithmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  algorithmButton: {
    width: (SCREEN_WIDTH - 100) / 4,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  algorithmButtonActive: {
    backgroundColor: HAOS_COLORS.pink,
    borderColor: HAOS_COLORS.pink,
  },
  algorithmText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  algorithmTextActive: {
    color: '#000',
  },
  moreAlgorithmsButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.pink,
    alignItems: 'center',
  },
  moreAlgorithmsText: {
    fontSize: 14,
    color: HAOS_COLORS.pink,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  operatorSelector: {
    backgroundColor: HAOS_COLORS.darkGray,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  operatorSelectorTitle: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  operatorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  operatorButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  operatorButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderWidth: 2,
  },
  operatorButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    width: 80,
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
  presetsSection: {
    padding: 20,
  },
  presetsTitle: {
    fontSize: 18,
    color: HAOS_COLORS.pink,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: (SCREEN_WIDTH - 60) / 2,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    marginBottom: 15,
  },
  presetIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  presetText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default DX7Screen;
