/**
 * HAOS.fm ARP 2600 - Complete Semi-Modular Analog Synthesizer
 * HAOS Themed Design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Components
import InteractiveSlider from '../components/arp2600/InteractiveSlider';
import PatchBay from '../components/arp2600/PatchBay';
import Sequencer from '../components/arp2600/Sequencer';
import HAOSHeader from '../components/HAOSHeader';
import {
  RingModulator,
  SampleAndHold,
  NoiseGenerator,
  VCA,
} from '../components/arp2600/AdditionalModules';

// Audio Bridge
import arp2600Bridge from '../synths/ARP2600Bridge';
import webAudioBridge from '../services/WebAudioBridge';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';
import PRESET_PATCHES from '../data/arp2600-presets.json';

const { width, height } = Dimensions.get('window');

// ARP 2600 HAOS Color System
const COLORS = {
  ...HAOS_COLORS,
  // ARP specific accents
  arpOrange: '#FF6B35',
  arpOrangeLight: '#FF8C5A',
  arpOrangeDark: '#CC5528',
  arpBackground: '#0a0a0a',
  arpPanel: '#1a1a1a',
  arpPanelDark: '#121212',
  metalGray: '#2a2a2a',
  metalLight: '#3a3a3a',
  wood: '#332211',
  woodDark: '#221100',
  
  // Background alias
  background: '#0a0a0a',
  
  // Module Colors (Vibrant like original)
  vco1: '#FF6B35',      // Orange
  vco2: '#00D9FF',      // Cyan
  vco3: '#FFD700',      // Yellow/Gold
  vcf: '#00ff94',       // Green
  vca: '#FF8C5A',       // Light Orange
  envelope: '#C0C0C0',  // Silver
  lfo: '#A855F7',       // Purple
  
  // UI Elements
  textPrimary: '#FFFFFF',
  textSecondary: '#C0C0C0',
  textMuted: '#808080',
  border: '#333333',
  borderLight: '#444444',
  active: '#00ff94',
  activeGlow: '#00ff9440',
  
  // LEDs and Indicators
  ledRed: '#FF0000',
  ledGreen: '#00FF00',
  ledYellow: '#FFD700',
  ledBlue: '#00AAFF',
  ledOff: '#1a1a1a',
  
  // Patch Bay
  patchInput: '#0066FF',
  patchOutput: '#FF6B35',
  patchCable: '#FFD700',
  
  // Shadows and Highlights
  shadowDark: 'rgba(0, 0, 0, 0.8)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  highlightBright: 'rgba(255, 255, 255, 0.2)',
  highlightMedium: 'rgba(255, 255, 255, 0.1)',
};

// Typography
const FONTS = {
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  module: { fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  value: { fontSize: 12, fontWeight: '500', fontFamily: 'Menlo' },
};

const ARP2600Complete = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Helper function for category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Techno': '#FF6B35',
      'Bass': '#FFD700',
      'Lead': '#00D9FF',
      'Percussion': '#C0C0C0',
      'Pad': '#A855F7',
      'FX': '#00ff94',
      'Pluck': '#FF8C5A',
    };
    return colors[category] || '#808080';
  };
  
  // LED Indicator Component
  const LEDIndicator = ({ active, color = null }) => {
    const actualColor = color || COLORS.ledGreen;
    const ledAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
    
    useEffect(() => {
      Animated.timing(ledAnim, {
        toValue: active ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, [active]);
    
    return (
      <Animated.View
        style={[
          styles.ledIndicator,
          {
            backgroundColor: active ? actualColor : COLORS.ledOff,
            opacity: ledAnim,
            shadowColor: actualColor,
            shadowOpacity: ledAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
          },
        ]}
      />
    );
  };
  
  // ============ VCO 1 ============
  const [vco1Frequency, setVco1Frequency] = useState(440);
  const [vco1Tune, setVco1Tune] = useState(0);
  const [vco1PulseWidth, setVco1PulseWidth] = useState(50);
  const [vco1Waveform, setVco1Waveform] = useState('saw'); // saw, pulse, sine
  
  // ============ VCO 2 ============
  const [vco2Frequency, setVco2Frequency] = useState(440);
  const [vco2Tune, setVco2Tune] = useState(0.005);
  const [vco2PulseWidth, setVco2PulseWidth] = useState(50);
  const [vco2Waveform, setVco2Waveform] = useState('saw');
  
  // ============ VCO 3 (LFO/VCO) ============
  const [vco3Frequency, setVco3Frequency] = useState(110);
  const [vco3PulseWidth, setVco3PulseWidth] = useState(50);
  const [vco3Waveform, setVco3Waveform] = useState('sine');
  
  // ============ VCF (Voltage Controlled Filter) ============
  const [vcfCutoff, setVcfCutoff] = useState(2000);
  const [vcfResonance, setVcfResonance] = useState(18);
  const [vcfEnvAmount, setVcfEnvAmount] = useState(0.5);
  const [vcfKeyFollow, setVcfKeyFollow] = useState(0.5);
  
  // ============ ADSR Envelope ============
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.2);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);
  
  // ============ LFO ============
  const [lfoRate, setLfoRate] = useState(5.0);
  const [lfoWaveform, setLfoWaveform] = useState('triangle');
  
  // ============ Mix & Levels ============
  const [vco1Level, setVco1Level] = useState(0.6);
  const [vco2Level, setVco2Level] = useState(0.4);
  const [vco3Level, setVco3Level] = useState(0.2);
  const [noiseLevel, setNoiseLevel] = useState(0.1);
  
  // ============ EFFECTS ============
  const [reverbMix, setReverbMix] = useState(0.2);
  const [reverbTime, setReverbTime] = useState(1.5);
  const [chorusMix, setChorusMix] = useState(0.0);
  const [chorusRate, setChorusRate] = useState(0.8);
  const [delayMix, setDelayMix] = useState(0.0);
  const [delayTime, setDelayTime] = useState(0.375);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [distortion, setDistortion] = useState(0.0);
  
  // ============ UI State ============
  const [activeModule, setActiveModule] = useState(null);
  const [patchBayVisible, setPatchBayVisible] = useState(false);
  const [sequencerVisible, setSequencerVisible] = useState(false);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [activePatches, setActivePatches] = useState([]);
  const [presetCategory, setPresetCategory] = useState('All'); // Filter category
  
  // Animations
  const moduleGlow = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    arp2600Bridge.init();
    
    // Initialize bridge parameters with current state values
    arp2600Bridge.setAttack(attack);
    arp2600Bridge.setDecay(decay);
    arp2600Bridge.setSustain(sustain);
    arp2600Bridge.setRelease(release);
    arp2600Bridge.setFilterCutoff(vcfCutoff);
    arp2600Bridge.setFilterResonance(vcfResonance);
    
    console.log('✅ ARP 2600 Complete initialized');
    
    // Continuous module glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(moduleGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(moduleGlow, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Re-initialize bridge parameters when entering modals (to ensure WebView has correct values)
  useEffect(() => {
    if (sequencerVisible || patchBayVisible) {
      // Small delay to ensure WebView is loaded
      setTimeout(() => {
        arp2600Bridge.setAttack(attack);
        arp2600Bridge.setDecay(decay);
        arp2600Bridge.setSustain(sustain);
        arp2600Bridge.setRelease(release);
        arp2600Bridge.setFilterCutoff(vcfCutoff);
        arp2600Bridge.setFilterResonance(vcfResonance);
        console.log('✅ ARP 2600: Re-initialized parameters for modal');
      }, 100);
    }
  }, [sequencerVisible, patchBayVisible]);

  // Update audio parameters
  useEffect(() => { arp2600Bridge.setOsc1Level(vco1Level); }, [vco1Level]);
  useEffect(() => { arp2600Bridge.setOsc2Level(vco2Level); }, [vco2Level]);
  useEffect(() => { arp2600Bridge.setOsc3Level(vco3Level); }, [vco3Level]);
  useEffect(() => { arp2600Bridge.setFilterCutoff(vcfCutoff); }, [vcfCutoff]);
  useEffect(() => { arp2600Bridge.setFilterResonance(vcfResonance); }, [vcfResonance]);
  useEffect(() => {
    // Update envelope in bridge (fix NaN values)
    arp2600Bridge.setAttack(attack);
    arp2600Bridge.setDecay(decay);
    arp2600Bridge.setSustain(sustain);
    arp2600Bridge.setRelease(release);
  }, [attack, decay, sustain, release]);

  const loadPreset = (presetKey) => {
    const preset = PRESET_PATCHES[presetKey];
    if (!preset) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Load parameters
    const params = preset.parameters;
    if (params.vco1_freq) setVco1Frequency(params.vco1_freq);
    if (params.vco1_tune !== undefined) setVco1Tune(params.vco1_tune);
    if (params.vco1_pulseWidth) setVco1PulseWidth(params.vco1_pulseWidth);
    if (params.vco2_freq) setVco2Frequency(params.vco2_freq);
    if (params.vco2_tune !== undefined) setVco2Tune(params.vco2_tune);
    if (params.vco2_pulseWidth) setVco2PulseWidth(params.vco2_pulseWidth);
    if (params.vco3_freq) setVco3Frequency(params.vco3_freq);
    if (params.vcf_cutoff) setVcfCutoff(params.vcf_cutoff);
    if (params.vcf_resonance) setVcfResonance(params.vcf_resonance);
    if (params.vcf_envAmount !== undefined) setVcfEnvAmount(params.vcf_envAmount);
    if (params.attack !== undefined) {
      setAttack(params.attack);
      arp2600Bridge.setAttack(params.attack);
    }
    if (params.decay !== undefined) {
      setDecay(params.decay);
      arp2600Bridge.setDecay(params.decay);
    }
    if (params.sustain !== undefined) {
      setSustain(params.sustain);
      arp2600Bridge.setSustain(params.sustain);
    }
    if (params.release !== undefined) {
      setRelease(params.release);
      arp2600Bridge.setRelease(params.release);
    }
    if (params.lfo_rate) setLfoRate(params.lfo_rate);
    
    // Load patches
    setActivePatches(preset.patches);
    setSelectedPreset(presetKey);
    setPresetModalVisible(false);
    
    console.log(`📋 Loaded preset: ${preset.name}`);
  };

  const playNote = (note, frequency) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    arp2600Bridge.playNote(note, { velocity: 1.0, duration: 2.0 });
    
    // Filter animation
    Animated.sequence([
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: attack * 1000,
        useNativeDriver: false,
      }),
      Animated.timing(filterAnim, {
        toValue: sustain,
        duration: decay * 1000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const renderWaveformSelector = (selected, onSelect, color) => (
    <View style={styles.waveformSelector}>
      {['saw', 'pulse', 'sine', 'triangle'].map((wave) => (
        <TouchableOpacity
          key={wave}
          style={[
            styles.waveButton,
            { borderColor: color },
            selected === wave && { backgroundColor: color + '40' },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(wave);
          }}
        >
          <Text style={[styles.waveButtonText, { color }]}>
            {wave === 'saw' ? '◢' : wave === 'pulse' ? '⎍' : wave === 'sine' ? '〜' : '△'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Patch Bay Modal
  if (patchBayVisible) {
    return (
      <View style={styles.container}>
        {/* Hidden WebView - needed for audio */}
        <View style={{ height: 0, overflow: 'hidden' }}>
          <WebView
            ref={(ref) => {
              if (ref && !webAudioBridge.isReady) {
                webAudioBridge.setWebViewRef(ref);
              }
            }}
            source={require('../../assets/audio-engine.html')}
            style={{ width: 1, height: 1, opacity: 0 }}
            onMessage={(event) => webAudioBridge.onMessage(event)}
            onLoad={() => webAudioBridge.initAudio()}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
          />
        </View>

        <HAOSHeader
          title="PATCH BAY"
          navigation={{ goBack: () => setPatchBayVisible(false) }}
          showBack={true}
        />

        <PatchBay
          onPatchChange={(patches) => {
            setActivePatches(patches);
            console.log('Patch configuration updated:', patches);
          }}
        />
      </View>
    );
  }

  // Sequencer Modal
  if (sequencerVisible) {
    return (
      <View style={styles.container}>
        {/* Hidden WebView - needed for audio */}
        <View style={{ height: 0, overflow: 'hidden' }}>
          <WebView
            ref={(ref) => {
              if (ref && !webAudioBridge.isReady) {
                webAudioBridge.setWebViewRef(ref);
              }
            }}
            source={require('../../assets/audio-engine.html')}
            style={{ width: 1, height: 1, opacity: 0 }}
            onMessage={(event) => webAudioBridge.onMessage(event)}
            onLoad={() => webAudioBridge.initAudio()}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
          />
        </View>

        <HAOSHeader
          title="SEQUENCER"
          navigation={{ goBack: () => setSequencerVisible(false) }}
          showBack={true}
        />

        <Sequencer
          onStepChange={(steps) => {
            console.log('Sequencer pattern updated:', steps);
          }}
          onPlayNote={(pitch, modulation) => {
            console.log(`🎹 Sequencer triggering: pitch=${pitch}, modulation=${modulation}`);
            const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
            arp2600Bridge.playNote(`note${pitch}`, { velocity: modulation, duration: 0.25 });
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hidden WebView - wrapped in height:0 container to prevent layout issues */}
      <View style={{ height: 0, overflow: 'hidden' }}>
        <WebView
          ref={(ref) => {
            if (ref && !webAudioBridge.isReady) {
              webAudioBridge.setWebViewRef(ref);
            }
          }}
          source={require('../../assets/audio-engine.html')}
          style={{ width: 1, height: 1, opacity: 0 }}
          onMessage={(event) => webAudioBridge.onMessage(event)}
          onLoad={() => webAudioBridge.initAudio()}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
        />
      </View>

      {/* Header */}
      <StatusBar barStyle="light-content" />
      <HAOSHeader
        title="ARP 2600"
        navigation={navigation}
        showBack={true}
        rightButtons={[
          {
            icon: '📖',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ARP2600ModulationGuide');
            },
          },
          {
            icon: '📋',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPresetModalVisible(true);
            },
          },
          {
            icon: '🎹',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSequencerVisible(true);
            },
            active: sequencerVisible,
          },
          {
            icon: '🔌',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setPatchBayVisible(true);
            },
            active: patchBayVisible,
          },
        ]}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* VCO 1 */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.vco1 + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.vco1 }]}>VCO 1</Text>
                <LEDIndicator active={vco1Level > 0} color={COLORS.vco1} />
              </View>
              <Text style={styles.moduleSubtitle}>VOLTAGE CONTROLLED OSCILLATOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            {renderWaveformSelector(vco1Waveform, setVco1Waveform, COLORS.vco1)}
            <InteractiveSlider
              value={vco1Frequency}
              onChange={setVco1Frequency}
              min={20}
              max={2000}
              label="FREQUENCY"
              unit="Hz"
              color={COLORS.vco1}
              logarithmic={true}
            />
            <InteractiveSlider
              value={vco1Tune}
              onChange={setVco1Tune}
              min={-0.1}
              max={0.1}
              label="FINE TUNE"
              unit="ct"
              color={COLORS.vco1}
            />
            <InteractiveSlider
              value={vco1PulseWidth}
              onChange={setVco1PulseWidth}
              min={0}
              max={100}
              label="PULSE WIDTH"
              unit="%"
              color={COLORS.vco1}
            />
            <InteractiveSlider
              value={vco1Level}
              onChange={setVco1Level}
              min={0}
              max={1}
              label="LEVEL"
              unit=""
              color={COLORS.vco1}
            />
          </View>
        </View>

        {/* VCO 2 */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.vco2 + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.vco2 }]}>VCO 2</Text>
                <LEDIndicator active={vco2Level > 0} color={COLORS.vco2} />
              </View>
              <Text style={styles.moduleSubtitle}>VOLTAGE CONTROLLED OSCILLATOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            {renderWaveformSelector(vco2Waveform, setVco2Waveform, COLORS.vco2)}
            <InteractiveSlider
              value={vco2Frequency}
              onChange={setVco2Frequency}
              min={20}
              max={2000}
              label="FREQUENCY"
              unit="Hz"
              color={COLORS.vco2}
              logarithmic={true}
            />
            <InteractiveSlider
              value={vco2Tune}
              onChange={setVco2Tune}
              min={-0.1}
              max={0.1}
              label="FINE TUNE"
              unit="ct"
              color={COLORS.vco2}
            />
            <InteractiveSlider
              value={vco2PulseWidth}
              onChange={setVco2PulseWidth}
              min={0}
              max={100}
              label="PULSE WIDTH"
              unit="%"
              color={COLORS.vco2}
            />
            <InteractiveSlider
              value={vco2Level}
              onChange={setVco2Level}
              min={0}
              max={1}
              label="LEVEL"
              unit=""
              color={COLORS.vco2}
            />
          </View>
        </View>

        {/* VCO 3 */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.vco3 + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.vco3 }]}>VCO 3 (LFO)</Text>
                <LEDIndicator active={vco3Level > 0} color={COLORS.vco3} />
              </View>
              <Text style={styles.moduleSubtitle}>LOW FREQUENCY / AUDIO OSCILLATOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            {renderWaveformSelector(vco3Waveform, setVco3Waveform, COLORS.vco3)}
            <InteractiveSlider
              value={vco3Frequency}
              onChange={setVco3Frequency}
              min={0.1}
              max={1000}
              label="FREQUENCY"
              unit="Hz"
              color={COLORS.vco3}
              logarithmic={true}
            />
            <InteractiveSlider
              value={vco3PulseWidth}
              onChange={setVco3PulseWidth}
              min={0}
              max={100}
              label="PULSE WIDTH"
              unit="%"
              color={COLORS.vco3}
            />
            <InteractiveSlider
              value={vco3Level}
              onChange={setVco3Level}
              min={0}
              max={1}
              label="LEVEL"
              unit=""
              color={COLORS.vco3}
            />
          </View>
        </View>

        {/* VCF */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.vcf + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.vcf }]}>VCF</Text>
                <LEDIndicator active={vcfCutoff > 1000} color={COLORS.vcf} />
              </View>
              <Text style={styles.moduleSubtitle}>4-POLE LOWPASS FILTER (24dB/oct)</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            <Animated.View 
              style={[
                styles.filterVisualization,
                {
                  height: filterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 80],
                  }),
                  backgroundColor: COLORS.vcf,
                },
              ]}
            />
            <InteractiveSlider
              value={vcfCutoff}
              onChange={(val) => {
                setVcfCutoff(val);
                arp2600Bridge.setFilterCutoff(val);
              }}
              min={20}
              max={10000}
              label="CUTOFF FREQUENCY"
              unit="Hz"
              color={COLORS.vcf}
              logarithmic={true}
            />
            <InteractiveSlider
              value={vcfResonance}
              onChange={(val) => {
                setVcfResonance(val);
                arp2600Bridge.setFilterResonance(val);
              }}
              min={0}
              max={30}
              label="RESONANCE"
              unit="Q"
              color={COLORS.vcf}
            />
            <InteractiveSlider
              value={vcfEnvAmount}
              onChange={setVcfEnvAmount}
              min={0}
              max={1}
              label="ENVELOPE AMOUNT"
              unit=""
              color={COLORS.vcf}
            />
            <InteractiveSlider
              value={vcfKeyFollow}
              onChange={setVcfKeyFollow}
              min={0}
              max={1}
              label="KEYBOARD FOLLOW"
              unit=""
              color={COLORS.vcf}
            />
          </View>
        </View>

        {/* ADSR Envelope */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.envelope + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.envelope }]}>ADSR</Text>
                <LEDIndicator active={attack > 0 || decay > 0} color={COLORS.envelope} />
              </View>
              <Text style={styles.moduleSubtitle}>ENVELOPE GENERATOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            <View style={styles.adsrGrid}>
              <View style={styles.adsrColumn}>
                <InteractiveSlider
                  value={attack}
                  onChange={(val) => {
                    setAttack(val);
                    arp2600Bridge.setAttack(val);
                  }}
                  min={0.001}
                  max={2}
                  label="ATTACK"
                  unit="s"
                  color={COLORS.envelope}
                  logarithmic={true}
                />
                <InteractiveSlider
                  value={decay}
                  onChange={(val) => {
                    setDecay(val);
                    arp2600Bridge.setDecay(val);
                  }}
                  min={0.001}
                  max={2}
                  label="DECAY"
                  unit="s"
                  color={COLORS.envelope}
                  logarithmic={true}
                />
              </View>
              <View style={styles.adsrColumn}>
                <InteractiveSlider
                  value={sustain}
                  onChange={(val) => {
                    setSustain(val);
                    arp2600Bridge.setSustain(val);
                  }}
                  min={0}
                  max={1}
                  label="SUSTAIN"
                  unit=""
                  color={COLORS.envelope}
                />
                <InteractiveSlider
                  value={release}
                  onChange={(val) => {
                    setRelease(val);
                    arp2600Bridge.setRelease(val);
                  }}
                  min={0.001}
                  max={5}
                  label="RELEASE"
                  unit="s"
                  color={COLORS.envelope}
                  logarithmic={true}
                />
              </View>
            </View>
          </View>
        </View>

        {/* LFO */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.lfo + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.lfo }]}>LFO</Text>
                <LEDIndicator active={lfoRate > 0.5} color={COLORS.lfo} />
              </View>
              <Text style={styles.moduleSubtitle}>LOW FREQUENCY OSCILLATOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            {renderWaveformSelector(lfoWaveform, setLfoWaveform, COLORS.lfo)}
            <InteractiveSlider
              value={lfoRate}
              onChange={setLfoRate}
              min={0.1}
              max={20}
              label="RATE"
              unit="Hz"
              color={COLORS.lfo}
              logarithmic={true}
            />
          </View>
        </View>

        {/* Additional Modules */}
        <RingModulator />
        <SampleAndHold />
        <NoiseGenerator />
        <VCA level={0.8} />

        {/* EFFECTS SECTION */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.active + '40', COLORS.metalGray, COLORS.arpPanelDark]}
            style={styles.moduleHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.moduleHeaderRow}>
              <View style={styles.moduleTitleContainer}>
                <Text style={[styles.moduleTitle, { color: COLORS.active }]}>EFFECTS</Text>
                <LEDIndicator 
                  active={reverbMix > 0 || chorusMix > 0 || delayMix > 0 || distortion > 0} 
                  color={COLORS.active} 
                />
              </View>
              <Text style={styles.moduleSubtitle}>BUILT-IN EFFECTS PROCESSOR</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.moduleContent}>
            {/* Reverb */}
            <View style={styles.effectGroup}>
              <Text style={[styles.effectLabel, { color: COLORS.active }]}>REVERB</Text>
              <InteractiveSlider
                value={reverbMix}
                onChange={setReverbMix}
                min={0}
                max={1}
                label="MIX"
                unit=""
                color={COLORS.active}
              />
              <InteractiveSlider
                value={reverbTime}
                onChange={setReverbTime}
                min={0.1}
                max={5.0}
                label="TIME"
                unit="s"
                color={COLORS.active}
              />
            </View>

            {/* Chorus */}
            <View style={styles.effectGroup}>
              <Text style={[styles.effectLabel, { color: COLORS.vco2 }]}>CHORUS</Text>
              <InteractiveSlider
                value={chorusMix}
                onChange={setChorusMix}
                min={0}
                max={1}
                label="MIX"
                unit=""
                color={COLORS.vco2}
              />
              <InteractiveSlider
                value={chorusRate}
                onChange={setChorusRate}
                min={0.1}
                max={5.0}
                label="RATE"
                unit="Hz"
                color={COLORS.vco2}
              />
            </View>

            {/* Delay */}
            <View style={styles.effectGroup}>
              <Text style={[styles.effectLabel, { color: COLORS.vco3 }]}>DELAY</Text>
              <InteractiveSlider
                value={delayMix}
                onChange={setDelayMix}
                min={0}
                max={1}
                label="MIX"
                unit=""
                color={COLORS.vco3}
              />
              <InteractiveSlider
                value={delayTime}
                onChange={setDelayTime}
                min={0.01}
                max={2.0}
                label="TIME"
                unit="s"
                color={COLORS.vco3}
              />
              <InteractiveSlider
                value={delayFeedback}
                onChange={setDelayFeedback}
                min={0}
                max={0.9}
                label="FEEDBACK"
                unit=""
                color={COLORS.vco3}
              />
            </View>

            {/* Distortion */}
            <View style={styles.effectGroup}>
              <Text style={[styles.effectLabel, { color: COLORS.arpOrange }]}>DISTORTION</Text>
              <InteractiveSlider
                value={distortion}
                onChange={setDistortion}
                min={0}
                max={1}
                label="DRIVE"
                unit=""
                color={COLORS.arpOrange}
              />
            </View>
          </View>
        </View>

        {/* Professional Piano Keyboard (C1-C4) */}
        <View style={styles.module}>
          <LinearGradient
            colors={[COLORS.arpOrange + '40', COLORS.arpPanel]}
            style={styles.moduleHeader}
          >
            <Text style={[styles.moduleTitle, { color: COLORS.arpOrange }]}>KEYBOARD</Text>
            <Text style={styles.moduleSubtitle}>3 OCTAVES (C1-C4)</Text>
          </LinearGradient>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keyboardScroll}>
            <View style={styles.pianoContainer}>
              {/* Generate 3 octaves + C4 */}
              {[1, 2, 3, 4].map((octave) => {
                const notes = [
                  { note: 'C', freq: 0, isBlack: false },
                  { note: 'C#', freq: 1, isBlack: true },
                  { note: 'D', freq: 2, isBlack: false },
                  { note: 'D#', freq: 3, isBlack: true },
                  { note: 'E', freq: 4, isBlack: false },
                  { note: 'F', freq: 5, isBlack: false },
                  { note: 'F#', freq: 6, isBlack: true },
                  { note: 'G', freq: 7, isBlack: false },
                  { note: 'G#', freq: 8, isBlack: true },
                  { note: 'A', freq: 9, isBlack: false },
                  { note: 'A#', freq: 10, isBlack: true },
                  { note: 'B', freq: 11, isBlack: false },
                ];
                
                // Only render C for octave 4 (stopping at C4)
                const notesToRender = octave === 4 ? [notes[0]] : notes;
                
                return (
                  <View key={`octave-${octave}`} style={styles.octaveContainer}>
                    {/* White keys */}
                    {notesToRender
                      .filter(n => !n.isBlack)
                      .map((noteData) => {
                        const noteName = `${noteData.note}${octave}`;
                        const noteIndex = (octave - 1) * 12 + noteData.freq;
                        const baseFreq = 32.70; // C1
                        const frequency = baseFreq * Math.pow(2, noteIndex / 12);
                        
                        return (
                          <TouchableOpacity
                            key={noteName}
                            style={styles.whiteKey}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              arp2600Bridge.playNote(noteName, { velocity: 1.0, duration: 2.0 });
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.whiteKeyLabel}>{noteName}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    
                    {/* Black keys */}
                    {octave !== 4 && notesToRender
                      .filter(n => n.isBlack)
                      .map((noteData) => {
                        const noteName = `${noteData.note}${octave}`;
                        const noteIndex = (octave - 1) * 12 + noteData.freq;
                        const baseFreq = 32.70;
                        const frequency = baseFreq * Math.pow(2, noteIndex / 12);
                        
                        // Calculate black key position based on which white key pair it's between
                        let leftOffset = 0;
                        if (noteData.note === 'C#') leftOffset = 34;
                        else if (noteData.note === 'D#') leftOffset = 84;
                        else if (noteData.note === 'F#') leftOffset = 184;
                        else if (noteData.note === 'G#') leftOffset = 234;
                        else if (noteData.note === 'A#') leftOffset = 284;
                        
                        return (
                          <TouchableOpacity
                            key={noteName}
                            style={[styles.blackKey, { left: leftOffset }]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              arp2600Bridge.playNote(noteName, { velocity: 1.0, duration: 2.0 });
                            }}
                            activeOpacity={0.7}
                          />
                        );
                      })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Preset Modal with Category Filter */}
      <Modal
        visible={presetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPresetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PRESET LIBRARY</Text>
            <Text style={styles.modalSubtitle}>30 TECHNO-FOCUSED SOUNDS</Text>
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryContainer}>
                {['All', 'Techno', 'Bass', 'Lead', 'Percussion', 'Pad', 'FX'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      presetCategory === cat && styles.categoryButtonActive
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPresetCategory(cat);
                    }}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      presetCategory === cat && styles.categoryButtonTextActive
                    ]}>
                      {cat.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {/* Preset List */}
            <ScrollView style={styles.presetList}>
              {Object.keys(PRESET_PATCHES)
                .filter((key) => {
                  const preset = PRESET_PATCHES[key];
                  if (presetCategory === 'All') return true;
                  return preset.category === presetCategory;
                })
                .map((key) => {
                  const preset = PRESET_PATCHES[key];
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.presetButton,
                        selectedPreset === key && styles.presetButtonActive,
                      ]}
                      onPress={() => loadPreset(key)}
                    >
                      <View style={styles.presetHeader}>
                        <Text style={styles.presetName}>{preset.name}</Text>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(preset.category) }]}>
                          <Text style={styles.categoryBadgeText}>{preset.category}</Text>
                        </View>
                      </View>
                      <Text style={styles.presetDescription}>{preset.description}</Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPresetModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
    top: -1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  module: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.metalGray,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    // Hardware-like 3D effect
    borderTopWidth: 2,
    borderTopColor: COLORS.highlightMedium,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.shadowLight,
  },
  moduleHeader: {
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
    // Metallic gradient effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  moduleHeaderRow: {
    gap: 8,
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleTitle: {
    ...FONTS.module,
    color: '#D4AF37',
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  moduleSubtitle: {
    ...FONTS.label,
    color: COLORS.textMuted,
    marginTop: 6,
    textShadowColor: COLORS.shadowLight,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moduleContent: {
    padding: 20,
    backgroundColor: COLORS.arpPanelDark,
  },
  waveformSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  waveButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.arpPanelDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  waveButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ledIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  filterVisualization: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.vcf,
    shadowColor: COLORS.vcf,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.highlightBright,
    // Gradient effect with inner shadow
    borderTopWidth: 1,
    borderTopColor: COLORS.highlightBright,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.shadowDark,
  },
  vuMeter: {
    height: 8,
    backgroundColor: COLORS.ledOff,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginVertical: 8,
  },
  vuMeterFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: COLORS.ledGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  adsrGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  adsrColumn: {
    flex: 1,
  },
  effectGroup: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  effectLabel: {
    ...FONTS.module,
    fontSize: 14,
    marginBottom: 12,
    textShadowColor: COLORS.shadowDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  keyboardScroll: {
    padding: 16,
  },
  pianoContainer: {
    flexDirection: 'row',
    height: 200,
  },
  octaveContainer: {
    width: 350, // 7 white keys * 50px
    height: 200,
    position: 'relative',
    flexDirection: 'row',
  },
  whiteKey: {
    width: 50,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  whiteKeyLabel: {
    ...FONTS.label,
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: '700',
  },
  blackKey: {
    width: 32,
    height: 120,
    backgroundColor: '#0a0a0a',
    borderRadius: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    position: 'absolute',
    top: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 10,
  },
  key: {
    width: 60,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  keyLabel: {
    ...FONTS.label,
    color: COLORS.arpBackground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: COLORS.arpPanel,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    ...FONTS.title,
    color: COLORS.arpOrange,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.arpBackground,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.arpOrange,
    borderColor: COLORS.arpOrange,
  },
  categoryButtonText: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetList: {
    maxHeight: height * 0.5,
  },
  presetButton: {
    backgroundColor: COLORS.arpBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  presetButtonActive: {
    borderColor: COLORS.active,
    backgroundColor: COLORS.active + '20',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetName: {
    ...FONTS.module,
    color: '#FFFFFF',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    ...FONTS.label,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  presetDescription: {
    ...FONTS.label,
    color: COLORS.textMuted,
  },
  modalCloseButton: {
    backgroundColor: COLORS.arpOrange,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  modalCloseButtonText: {
    ...FONTS.module,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ARP2600Complete;
