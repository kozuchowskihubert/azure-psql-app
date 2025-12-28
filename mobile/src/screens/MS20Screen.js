/**
 * HAOS.fm MS-20 - Semi-Modular Analog Synthesizer
 * 2 VCOs, dual filters, patch bay, ESP
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
  yellow: '#ffff00',
  orange: '#ff8800',
  green: '#00ff94',
  cyan: '#00ffff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const MS20Screen = ({ navigation }) => {
  // VCO 1
  const [vco1Pitch, setVco1Pitch] = useState(50);
  const [vco1Wave, setVco1Wave] = useState('saw');
  const [vco1PWM, setVco1PWM] = useState(50);
  
  // VCO 2
  const [vco2Pitch, setVco2Pitch] = useState(50);
  const [vco2Wave, setVco2Wave] = useState('saw');
  const [vco2Sync, setVco2Sync] = useState(false);
  
  // Filters
  const [hpfCutoff, setHpfCutoff] = useState(0);
  const [hpfPeak, setHpfPeak] = useState(0);
  const [lpfCutoff, setLpfCutoff] = useState(80);
  const [lpfPeak, setLpfPeak] = useState(50);
  
  // Envelope
  const [attack, setAttack] = useState(5);
  const [decay, setDecay] = useState(50);
  const [sustain, setSustain] = useState(70);
  const [release, setRelease] = useState(30);
  
  // Patch Bay
  const [patchBayOpen, setPatchBayOpen] = useState(false);
  const [patches, setPatches] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const loadPreset = (presetName) => {
    const presets = {
      aggressive: {
        vco1: { pitch: 60, wave: 'pulse', pwm: 30 },
        vco2: { pitch: 59, wave: 'pulse', sync: true },
        hpf: { cutoff: 10, peak: 20 },
        lpf: { cutoff: 75, peak: 85 },
        env: { attack: 0, decay: 40, sustain: 60, release: 20 },
      },
      bass: {
        vco1: { pitch: 30, wave: 'saw', pwm: 50 },
        vco2: { pitch: 30, wave: 'square', sync: false },
        hpf: { cutoff: 0, peak: 0 },
        lpf: { cutoff: 60, peak: 70 },
        env: { attack: 0, decay: 60, sustain: 70, release: 30 },
      },
      screaming: {
        vco1: { pitch: 70, wave: 'pulse', pwm: 20 },
        vco2: { pitch: 70.5, wave: 'pulse', sync: true },
        hpf: { cutoff: 30, peak: 50 },
        lpf: { cutoff: 90, peak: 95 },
        env: { attack: 10, decay: 30, sustain: 80, release: 20 },
      },
    };
    
    if (presets[presetName]) {
      const p = presets[presetName];
      setVco1Pitch(p.vco1.pitch);
      setVco1Wave(p.vco1.wave);
      setVco1PWM(p.vco1.pwm);
      setVco2Pitch(p.vco2.pitch);
      setVco2Wave(p.vco2.wave);
      setVco2Sync(p.vco2.sync);
      setHpfCutoff(p.hpf.cutoff);
      setHpfPeak(p.hpf.peak);
      setLpfCutoff(p.lpf.cutoff);
      setLpfPeak(p.lpf.peak);
      setAttack(p.env.attack);
      setDecay(p.env.decay);
      setSustain(p.env.sustain);
      setRelease(p.env.release);
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
          <Text style={styles.headerIcon}>⚡</Text>
          <Text style={styles.headerTitle}>MS-20</Text>
          <Text style={styles.headerSubtitle}>SEMI-MODULAR ANALOG • KORG</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* VCO 1 */}
        <LinearGradient
          colors={[HAOS_COLORS.yellow + '30', HAOS_COLORS.yellow + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>VCO 1</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PITCH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vco1Pitch}
              onValueChange={setVco1Pitch}
              minimumTrackTintColor={HAOS_COLORS.yellow}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.yellow}
            />
            <Text style={styles.controlValue}>{Math.round(vco1Pitch)}</Text>
          </View>
          
          <View style={styles.waveformSelector}>
            <Text style={styles.controlLabel}>WAVEFORM</Text>
            <View style={styles.waveButtons}>
              {['saw', 'pulse', 'square', 'triangle'].map(wave => (
                <TouchableOpacity
                  key={wave}
                  style={[
                    styles.waveButton,
                    vco1Wave === wave && styles.waveButtonActive,
                  ]}
                  onPress={() => setVco1Wave(wave)}
                >
                  <Text style={[
                    styles.waveText,
                    vco1Wave === wave && styles.waveTextActive,
                  ]}>
                    {wave.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PWM</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vco1PWM}
              onValueChange={setVco1PWM}
              minimumTrackTintColor={HAOS_COLORS.yellow}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.yellow}
            />
            <Text style={styles.controlValue}>{Math.round(vco1PWM)}%</Text>
          </View>
        </LinearGradient>
        
        {/* VCO 2 */}
        <LinearGradient
          colors={[HAOS_COLORS.orange + '30', HAOS_COLORS.orange + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>VCO 2</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PITCH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vco2Pitch}
              onValueChange={setVco2Pitch}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.orange}
            />
            <Text style={styles.controlValue}>{Math.round(vco2Pitch)}</Text>
          </View>
          
          <View style={styles.waveformSelector}>
            <Text style={styles.controlLabel}>WAVEFORM</Text>
            <View style={styles.waveButtons}>
              {['saw', 'pulse', 'square', 'triangle'].map(wave => (
                <TouchableOpacity
                  key={wave}
                  style={[
                    styles.waveButton,
                    vco2Wave === wave && styles.waveButtonActive,
                  ]}
                  onPress={() => setVco2Wave(wave)}
                >
                  <Text style={[
                    styles.waveText,
                    vco2Wave === wave && styles.waveTextActive,
                  ]}>
                    {wave.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.syncButton, vco2Sync && styles.syncButtonActive]}
            onPress={() => setVco2Sync(!vco2Sync)}
          >
            <Text style={[
              styles.syncText,
              vco2Sync && styles.syncTextActive,
            ]}>
              {vco2Sync ? '✓ SYNC TO VCO 1' : 'SYNC TO VCO 1'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
        
        {/* High-Pass Filter */}
        <LinearGradient
          colors={[HAOS_COLORS.cyan + '30', HAOS_COLORS.cyan + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>HIGH-PASS FILTER</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>CUTOFF</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={hpfCutoff}
              onValueChange={setHpfCutoff}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(hpfCutoff)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PEAK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={hpfPeak}
              onValueChange={setHpfPeak}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(hpfPeak)}</Text>
          </View>
        </LinearGradient>
        
        {/* Low-Pass Filter */}
        <LinearGradient
          colors={[HAOS_COLORS.green + '30', HAOS_COLORS.green + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>LOW-PASS FILTER</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>CUTOFF</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={lpfCutoff}
              onValueChange={setLpfCutoff}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.controlValue}>{Math.round(lpfCutoff)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PEAK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={lpfPeak}
              onValueChange={setLpfPeak}
              minimumTrackTintColor={HAOS_COLORS.green}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.green}
            />
            <Text style={styles.controlValue}>{Math.round(lpfPeak)}</Text>
          </View>
        </LinearGradient>
        
        {/* Envelope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENVELOPE GENERATOR</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ATTACK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={attack}
              onValueChange={setAttack}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(attack)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DECAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={decay}
              onValueChange={setDecay}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(decay)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SUSTAIN</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={sustain}
              onValueChange={setSustain}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(sustain)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RELEASE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={release}
              onValueChange={setRelease}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(release)}</Text>
          </View>
        </View>
        
        {/* Patch Bay */}
        <TouchableOpacity
          style={styles.patchBayButton}
          onPress={() => setPatchBayOpen(!patchBayOpen)}
        >
          <Text style={styles.patchBayIcon}>🔌</Text>
          <Text style={styles.patchBayTitle}>PATCH BAY</Text>
          <Text style={styles.patchBaySubtitle}>16 modulation points</Text>
          <Text style={styles.patchBayArrow}>{patchBayOpen ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {patchBayOpen && (
          <View style={styles.patchBayContent}>
            <Text style={styles.patchBayInfo}>
              Connect modulation sources to destinations{'\n'}
              ESP • VCO • VCF • VCA • LFO • EG
            </Text>
            <View style={styles.patchPoints}>
              {['VCO1→VCF', 'LFO→VCO1', 'EG→VCF', 'ESP→VCF', 'LFO→VCA', 'VCO2→VCO1'].map((patch, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.patchPoint}
                  onPress={() => {/* Toggle patch */}}
                >
                  <Text style={styles.patchPointText}>{patch}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>MS-20 PRESETS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.yellow }]}
              onPress={() => loadPreset('aggressive')}
            >
              <Text style={styles.presetIcon}>⚡</Text>
              <Text style={styles.presetText}>AGGRESSIVE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.orange }]}
              onPress={() => loadPreset('bass')}
            >
              <Text style={styles.presetIcon}>🎸</Text>
              <Text style={styles.presetText}>BASS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.green }]}
              onPress={() => loadPreset('screaming')}
            >
              <Text style={styles.presetIcon}>🔥</Text>
              <Text style={styles.presetText}>SCREAMING</Text>
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
    borderBottomColor: HAOS_COLORS.yellow,
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
    borderColor: HAOS_COLORS.yellow,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.yellow,
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
    color: HAOS_COLORS.yellow,
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
  waveformSelector: {
    marginBottom: 15,
  },
  waveButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  waveButton: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  waveButtonActive: {
    backgroundColor: HAOS_COLORS.yellow,
    borderColor: HAOS_COLORS.yellow,
  },
  waveText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  waveTextActive: {
    color: '#000',
  },
  syncButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.orange,
    alignItems: 'center',
  },
  syncButtonActive: {
    backgroundColor: HAOS_COLORS.orange,
  },
  syncText: {
    fontSize: 14,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  syncTextActive: {
    color: '#000',
  },
  patchBayButton: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: HAOS_COLORS.darkGray,
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    alignItems: 'center',
  },
  patchBayIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  patchBayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
    letterSpacing: 1,
    marginBottom: 4,
  },
  patchBaySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  patchBayArrow: {
    fontSize: 16,
    color: HAOS_COLORS.cyan,
    marginTop: 10,
  },
  patchBayContent: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan,
  },
  patchBayInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
  },
  patchPoints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patchPoint: {
    width: '48%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan,
    alignItems: 'center',
  },
  patchPointText: {
    fontSize: 11,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
  },
  presetsSection: {
    padding: 20,
  },
  presetsTitle: {
    fontSize: 18,
    color: HAOS_COLORS.yellow,
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

export default MS20Screen;
