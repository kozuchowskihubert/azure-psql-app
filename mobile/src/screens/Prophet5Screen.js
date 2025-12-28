/**
 * HAOS.fm Prophet-5 - Polyphonic Analog Legend
 * 5-voice poly, 2 VCOs, Curtis filter, Poly-Mod
 */

import React, { useState, useEffect, useRef } from 'react';
import UniversalSequencer from '../components/UniversalSequencer';
import ML185Sequencer from '../sequencer/ML185Sequencer';
import Keyboard from '../components/Keyboard';
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
  cyan: '#00ffff',
  blue: '#00D9FF',
  purple: '#9966ff',
  pink: '#ff00ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

// Dummy Prophet5Bridge for playNote (replace with real bridge if available)
const prophet5Bridge = {
  playNote: (midi, velocity = 1.0, duration = 0.3) => {
    // TODO: Replace with real Prophet5 audio engine/bridge
    if (global.nativeAudioContext && global.nativeAudioContext.playNote) {
      global.nativeAudioContext.playNote(midi, velocity, duration);
    } else {
      console.log('Prophet5 playNote:', midi, velocity, duration);
    }
  },
};

const Prophet5Screen = ({ navigation }) => {
  // Sequencer state
  const [isSequencerPlaying, setIsSequencerPlaying] = useState(false);
  const [sequencerBpm, setSequencerBpm] = useState(120);

  // Keyboard octave
  const [keyboardOctave, setKeyboardOctave] = useState(4);
  // Handle sequencer note trigger
  const handleSequencerNote = (midi) => {
    prophet5Bridge.playNote(midi, 1.0, 0.3);
  };

  // Handle keyboard note trigger
  const handleKeyboardNote = (freq, note) => {
    // Convert freq to closest MIDI note (C4=60, freq=261.63)
    // This is a rough mapping for demo; replace with proper mapping if needed
    let midi = 69 + 12 * Math.log2(freq / 440);
    midi = Math.round(midi);
    prophet5Bridge.playNote(midi, 1.0, 0.3);
  };
  // Voice mode
  const [voices, setVoices] = useState(5);
  const [unisonMode, setUnisonMode] = useState(false);
  
  // VCO A
  const [vcoAFreq, setVcoAFreq] = useState(50);
  const [vcoAShape, setVcoAShape] = useState('saw');
  const [vcoAPW, setVcoAPW] = useState(50);
  
  // VCO B
  const [vcoBFreq, setVcoBFreq] = useState(50);
  const [vcoBShape, setVcoBShape] = useState('saw');
  const [vcoBSync, setVcoBSync] = useState(false);
  
  // Mixer
  const [mixerA, setMixerA] = useState(70);
  const [mixerB, setMixerB] = useState(70);
  
  // Curtis Filter
  const [cutoff, setCutoff] = useState(60);
  const [resonance, setResonance] = useState(30);
  const [envAmount, setEnvAmount] = useState(50);
  
  // Poly-Mod
  const [polyModFilter, setPolyModFilter] = useState(0);
  const [polyModOscB, setPolyModOscB] = useState(0);
  
  // Envelopes
  const [ampAttack, setAmpAttack] = useState(5);
  const [ampDecay, setAmpDecay] = useState(50);
  const [ampSustain, setAmpSustain] = useState(70);
  const [ampRelease, setAmpRelease] = useState(30);
  
  const [filterAttack, setFilterAttack] = useState(10);
  const [filterDecay, setFilterDecay] = useState(40);
  const [filterSustain, setFilterSustain] = useState(60);
  const [filterRelease, setFilterRelease] = useState(25);
  
  // LFO
  const [lfoRate, setLfoRate] = useState(4);
  const [lfoShape, setLfoShape] = useState('triangle');
  
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
      sync: {
        vcoA: { freq: 50, shape: 'saw', pw: 50 },
        vcoB: { freq: 52, shape: 'pulse', sync: true },
        filter: { cutoff: 70, resonance: 40, envAmount: 60 },
        polyMod: { filter: 30, oscB: 0 },
      },
      brass: {
        vcoA: { freq: 50, shape: 'saw', pw: 50 },
        vcoB: { freq: 50, shape: 'saw', sync: false },
        filter: { cutoff: 65, resonance: 20, envAmount: 50 },
        polyMod: { filter: 0, oscB: 0 },
      },
      strings: {
        vcoA: { freq: 50, shape: 'saw', pw: 50 },
        vcoB: { freq: 50.5, shape: 'saw', sync: false },
        filter: { cutoff: 75, resonance: 10, envAmount: 30 },
        polyMod: { filter: 0, oscB: 0 },
      },
      pad: {
        vcoA: { freq: 48, shape: 'pulse', pw: 30 },
        vcoB: { freq: 50, shape: 'triangle', sync: false },
        filter: { cutoff: 55, resonance: 15, envAmount: 40 },
        polyMod: { filter: 20, oscB: 15 },
      },
    };
    
    if (presets[presetName]) {
      const p = presets[presetName];
      setVcoAFreq(p.vcoA.freq);
      setVcoAShape(p.vcoA.shape);
      setVcoAPW(p.vcoA.pw);
      setVcoBFreq(p.vcoB.freq);
      setVcoBShape(p.vcoB.shape);
      setVcoBSync(p.vcoB.sync);
      setCutoff(p.filter.cutoff);
      setResonance(p.filter.resonance);
      setEnvAmount(p.filter.envAmount);
      setPolyModFilter(p.polyMod.filter);
      setPolyModOscB(p.polyMod.oscB);
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
          <Text style={styles.headerIcon}>👑</Text>
          <Text style={styles.headerTitle}>PROPHET-5</Text>
          <Text style={styles.headerSubtitle}>5-VOICE POLYPHONIC LEGEND</Text>
        </View>
      </Animated.View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ML-185 Advanced Sequencer */}
        <ML185Sequencer
          isPlaying={isSequencerPlaying}
          bpm={sequencerBpm}
          onStepTrigger={(data) => {
            prophet5Bridge.playNote(data.note, data.velocity, data.duration);
          }}
          color={HAOS_COLORS.cyan}
          title="ML-185 ADVANCED SEQUENCER"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: isSequencerPlaying ? HAOS_COLORS.cyan : '#222', padding: 10, borderRadius: 8, marginRight: 10 }}
            onPress={() => setIsSequencerPlaying(!isSequencerPlaying)}
          >
            <Text style={{ color: isSequencerPlaying ? '#000' : HAOS_COLORS.cyan, fontWeight: 'bold' }}>{isSequencerPlaying ? 'Stop' : 'Play'}</Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff', marginRight: 8 }}>BPM</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={60}
            maximumValue={180}
            value={sequencerBpm}
            onValueChange={setSequencerBpm}
            minimumTrackTintColor={HAOS_COLORS.cyan}
            maximumTrackTintColor="#444"
            thumbTintColor={HAOS_COLORS.cyan}
          />
          <Text style={{ color: HAOS_COLORS.cyan, width: 40, textAlign: 'right' }}>{Math.round(sequencerBpm)}</Text>
        </View>
        {/* Voice Display */}
        <View style={styles.voiceDisplay}>
          <Text style={styles.voiceTitle}>VOICES</Text>
          <View style={styles.voiceIndicators}>
            {[1,2,3,4,5].map(v => (
              <View 
                key={v} 
                style={[
                  styles.voiceIndicator,
                  v <= voices && styles.voiceIndicatorActive,
                ]}
              >
                <Text style={[
                  styles.voiceNumber,
                  v <= voices && styles.voiceNumberActive,
                ]}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.unisonButton, unisonMode && styles.unisonButtonActive]}
            onPress={() => setUnisonMode(!unisonMode)}
          >
            <Text style={[
              styles.unisonText,
              unisonMode && styles.unisonTextActive,
            ]}>
              {unisonMode ? '✓ UNISON MODE' : 'UNISON MODE'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* VCO A */}
        <LinearGradient
          colors={[HAOS_COLORS.cyan + '30', HAOS_COLORS.cyan + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>VCO A</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>FREQUENCY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vcoAFreq}
              onChange={setVcoAFreq}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(vcoAFreq)}</Text>
          </View>
          
          <View style={styles.waveformSelector}>
            <Text style={styles.controlLabel}>SHAPE</Text>
            <View style={styles.waveButtons}>
              {['saw', 'triangle', 'pulse'].map(wave => (
                <TouchableOpacity
                  key={wave}
                  style={[
                    styles.waveButton,
                    vcoAShape === wave && styles.waveButtonActive,
                  ]}
                  onPress={() => setVcoAShape(wave)}
                >
                  <Text style={[
                    styles.waveText,
                    vcoAShape === wave && styles.waveTextActive,
                  ]}>
                    {wave.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>PULSE WIDTH</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vcoAPW}
              onChange={setVcoAPW}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(vcoAPW)}%</Text>
          </View>
        </LinearGradient>
        
        {/* VCO B */}
        <LinearGradient
          colors={[HAOS_COLORS.blue + '30', HAOS_COLORS.blue + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>VCO B</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>FREQUENCY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={vcoBFreq}
              onChange={setVcoBFreq}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{Math.round(vcoBFreq)}</Text>
          </View>
          
          <View style={styles.waveformSelector}>
            <Text style={styles.controlLabel}>SHAPE</Text>
            <View style={styles.waveButtons}>
              {['saw', 'triangle', 'pulse'].map(wave => (
                <TouchableOpacity
                  key={wave}
                  style={[
                    styles.waveButton,
                    vcoBShape === wave && styles.waveButtonActive,
                  ]}
                  onPress={() => setVcoBShape(wave)}
                >
                  <Text style={[
                    styles.waveText,
                    vcoBShape === wave && styles.waveTextActive,
                  ]}>
                    {wave.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.syncButton, vcoBSync && styles.syncButtonActive]}
            onPress={() => setVcoBSync(!vcoBSync)}
          >
            <Text style={[
              styles.syncText,
              vcoBSync && styles.syncTextActive,
            ]}>
              {vcoBSync ? '✓ SYNC TO VCO A' : 'SYNC TO VCO A'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Mixer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MIXER</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VCO A</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={mixerA}
              onChange={setMixerA}
              minimumTrackTintColor={HAOS_COLORS.cyan}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.cyan}
            />
            <Text style={styles.controlValue}>{Math.round(mixerA)}%</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>VCO B</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={mixerB}
              onChange={setMixerB}
              minimumTrackTintColor={HAOS_COLORS.blue}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.blue}
            />
            <Text style={styles.controlValue}>{Math.round(mixerB)}%</Text>
          </View>
        </View>
        
        {/* Curtis Filter */}
        <LinearGradient
          colors={[HAOS_COLORS.purple + '30', HAOS_COLORS.purple + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>CURTIS LOW-PASS FILTER</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>CUTOFF</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={cutoff}
              onChange={setCutoff}
              minimumTrackTintColor={HAOS_COLORS.purple}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.purple}
            />
            <Text style={styles.controlValue}>{Math.round(cutoff)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RESONANCE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={resonance}
              onChange={setResonance}
              minimumTrackTintColor={HAOS_COLORS.purple}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.purple}
            />
            <Text style={styles.controlValue}>{Math.round(resonance)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ENV AMOUNT</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={envAmount}
              onChange={setEnvAmount}
              minimumTrackTintColor={HAOS_COLORS.purple}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.purple}
            />
            <Text style={styles.controlValue}>{Math.round(envAmount)}</Text>
          </View>
        </LinearGradient>
        
        {/* Poly-Mod */}
        <LinearGradient
          colors={[HAOS_COLORS.pink + '30', HAOS_COLORS.pink + '10']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>POLY-MOD</Text>
          <Text style={styles.sectionSubtitle}>Polyphonic modulation matrix</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>FILTER</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={polyModFilter}
              onChange={setPolyModFilter}
              minimumTrackTintColor={HAOS_COLORS.pink}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.pink}
            />
            <Text style={styles.controlValue}>{Math.round(polyModFilter)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>OSC B</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={polyModOscB}
              onChange={setPolyModOscB}
              minimumTrackTintColor={HAOS_COLORS.pink}
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor={HAOS_COLORS.pink}
            />
            <Text style={styles.controlValue}>{Math.round(polyModOscB)}</Text>
          </View>
        </LinearGradient>
        
        {/* Amp Envelope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AMP ENVELOPE</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ATTACK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={ampAttack}
              onChange={setAmpAttack}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(ampAttack)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DECAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={ampDecay}
              onChange={setAmpDecay}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(ampDecay)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SUSTAIN</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={ampSustain}
              onChange={setAmpSustain}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(ampSustain)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RELEASE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={ampRelease}
              onChange={setAmpRelease}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(ampRelease)}</Text>
          </View>
        </View>
        
        {/* Filter Envelope */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FILTER ENVELOPE</Text>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>ATTACK</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={filterAttack}
              onChange={setFilterAttack}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(filterAttack)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>DECAY</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={filterDecay}
              onChange={setFilterDecay}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(filterDecay)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>SUSTAIN</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={filterSustain}
              onChange={setFilterSustain}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(filterSustain)}</Text>
          </View>
          
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>RELEASE</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={filterRelease}
              onChange={setFilterRelease}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor={HAOS_COLORS.mediumGray}
              thumbTintColor="#fff"
            />
            <Text style={styles.controlValue}>{Math.round(filterRelease)}</Text>
          </View>
        </View>
        
        {/* Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>PROPHET-5 CLASSICS</Text>
          <View style={styles.presetsGrid}>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.cyan }]}
              onPress={() => loadPreset('sync')}
            >
              <Text style={styles.presetIcon}>⚡</Text>
              <Text style={styles.presetText}>SYNC LEAD</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.purple }]}
              onPress={() => loadPreset('brass')}
            >
              <Text style={styles.presetIcon}>🎺</Text>
              <Text style={styles.presetText}>BRASS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.blue }]}
              onPress={() => loadPreset('strings')}
            >
              <Text style={styles.presetIcon}>🎻</Text>
              <Text style={styles.presetText}>STRINGS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { borderColor: HAOS_COLORS.pink }]}
              onPress={() => loadPreset('pad')}
            >
              <Text style={styles.presetIcon}>✨</Text>
              <Text style={styles.presetText}>PAD</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />

        {/* Keyboard */}
        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>🎹 KEYBOARD</Text>
          <Keyboard
            onNotePress={handleKeyboardNote}
            octave={keyboardOctave}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#222', padding: 8, borderRadius: 6, marginHorizontal: 8 }}
              onPress={() => setKeyboardOctave(o => Math.max(1, o - 1))}
            >
              <Text style={{ color: '#00ff94', fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 16, marginHorizontal: 8 }}>Octave: {keyboardOctave}</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#222', padding: 8, borderRadius: 6, marginHorizontal: 8 }}
              onPress={() => setKeyboardOctave(o => Math.min(7, o + 1))}
            >
              <Text style={{ color: '#00ff94', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
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
  voiceDisplay: {
    backgroundColor: HAOS_COLORS.darkGray,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.mediumGray,
  },
  voiceTitle: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  voiceIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  voiceIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceIndicatorActive: {
    backgroundColor: HAOS_COLORS.cyan,
    borderColor: HAOS_COLORS.cyan,
  },
  voiceNumber: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  voiceNumberActive: {
    color: '#000',
  },
  unisonButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    alignItems: 'center',
  },
  unisonButtonActive: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  unisonText: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  unisonTextActive: {
    color: '#000',
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: HAOS_COLORS.cyan,
    borderColor: HAOS_COLORS.cyan,
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
    borderColor: HAOS_COLORS.blue,
    alignItems: 'center',
  },
  syncButtonActive: {
    backgroundColor: HAOS_COLORS.blue,
  },
  syncText: {
    fontSize: 14,
    color: HAOS_COLORS.blue,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  syncTextActive: {
    color: '#000',
  },
  presetsSection: {
    padding: 20,
  },
  presetsTitle: {
    fontSize: 18,
    color: HAOS_COLORS.cyan,
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

export default Prophet5Screen;
