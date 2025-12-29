/**
 * HAOS.fm ARP 2600 Synthesizer
 * Visual recreation of the legendary ARP 2600 modular synth
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import arp2600Bridge from '../synths/ARP2600Bridge';
import webAudioBridge from '../services/WebAudioBridge';
import Oscilloscope from '../components/Oscilloscope';
import UniversalSequencer from '../components/UniversalSequencer';

const { width } = Dimensions.get('window');

// Responsive sizing
const KNOB_SIZE = Math.min(width * 0.15, 70); // 15% of width, max 70px
const IS_SMALL_SCREEN = width < 375;

const HAOS_COLORS = {
  orange: '#FF6B35',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
};

// Musical keyboard notes
const NOTES = [
  { note: 'C3', freq: 130.81, label: 'C', black: false },
  { note: 'C#3', freq: 138.59, label: 'C#', black: true },
  { note: 'D3', freq: 146.83, label: 'D', black: false },
  { note: 'D#3', freq: 155.56, label: 'D#', black: true },
  { note: 'E3', freq: 164.81, label: 'E', black: false },
  { note: 'F3', freq: 174.61, label: 'F', black: false },
  { note: 'F#3', freq: 185.00, label: 'F#', black: true },
  { note: 'G3', freq: 196.00, label: 'G', black: false },
  { note: 'G#3', freq: 207.65, label: 'G#', black: true },
  { note: 'A3', freq: 220.00, label: 'A', black: false },
  { note: 'A#3', freq: 233.08, label: 'A#', black: true },
  { note: 'B3', freq: 246.94, label: 'B', black: false },
  { note: 'C4', freq: 261.63, label: 'C', black: false },
];

const ARP2600Screen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  const [osc1Level, setOsc1Level] = useState(0.5);
  const [osc2Level, setOsc2Level] = useState(0.5);
  const [osc3Level, setOsc3Level] = useState(0.0); // VCO 3 - off by default
  const [osc2Detune, setOsc2Detune] = useState(0.005);
  const [osc3Detune, setOsc3Detune] = useState(-12); // VCO 3 typically one octave down
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [filterResonance, setFilterResonance] = useState(18);
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [waveformData, setWaveformData] = useState([]);
  
  // Sequencer state
  const [sequencerPlaying, setSequencerPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Modulation parameters (for LFO and noise)
  const [lfoRate, setLFORate] = useState(5.0);
  const [lfoDepth, setLFODepth] = useState(0.5);
  const [noiseLevel, setNoiseLevel] = useState(0.3);
  
  // Patch Bay System (inspired by Behringer 2600 HTML)
  const [patchMode, setPatchMode] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [patches, setPatches] = useState([
    // Default patches (pre-patched like ARP 2600)
    { id: 'default-1', from: 'vco1-saw', to: 'vcf', color: '#FF6B35' },
    { id: 'default-2', from: 'vco2-saw', to: 'vcf', color: '#00D9FF' },
    { id: 'default-3', from: 'adsr', to: 'vca', color: '#00ff94' },
  ]);
  
  // Enhanced patch points with waveform-specific outputs
  const patchPoints = {
    // Oscillator Outputs (Waveform-Specific)
    'vco1-saw': { type: 'output', label: 'VCO1 SAW', color: '#FF6B35', icon: '📐' },
    'vco1-pulse': { type: 'output', label: 'VCO1 PULSE', color: '#FF8C5A', icon: '⬜' },
    'vco2-saw': { type: 'output', label: 'VCO2 SAW', color: '#00D9FF', icon: '📐' },
    'vco2-tri': { type: 'output', label: 'VCO2 TRI', color: '#5AE4FF', icon: '△' },
    'vco3-sine': { type: 'output', label: 'VCO3 SINE', color: '#FFD700', icon: '〰️' },
    
    // Modulation Outputs
    adsr: { type: 'output', label: 'ADSR ENV', color: '#00ff94', icon: '📈' },
    lfo: { type: 'output', label: 'LFO', color: '#9D4EDD', icon: '🌀' },
    
    // Noise Outputs (Separate White/Pink)
    'noise-white': { type: 'output', label: 'WHITE NOISE', color: '#B0B0B0', icon: '❄️' },
    'noise-pink': { type: 'output', label: 'PINK NOISE', color: '#FFB6D9', icon: '🌸' },
    
    // Input Destinations (Audio Paths)
    vcf: { type: 'input', label: 'VCF AUDIO', color: '#00ff94', icon: '🎚️' },
    vca: { type: 'input', label: 'VCA AUDIO', color: '#00ff94', icon: '🔊' },
    'mixer-in': { type: 'input', label: 'MIXER IN', color: '#FFB347', icon: '🎛️' },
    
    // Input Destinations (CV Modulation)
    'vcf-cv': { type: 'input', label: 'VCF CV', color: '#5AFF5A', icon: '⚡' },
    'vca-cv': { type: 'input', label: 'VCA CV', color: '#5AFF5A', icon: '⚡' },
    'fm1': { type: 'input', label: 'VCO1 FM', color: '#FF6B35', icon: '🎵' },
    'fm2': { type: 'input', label: 'VCO2 FM', color: '#00D9FF', icon: '🎵' },
    'ringMod': { type: 'input', label: 'RING MOD', color: '#FF006E', icon: '💍' },
  };
  
  // Generate waveform data based on current parameters
  const updateWaveform = () => {
    const points = 100;
    const data = Array.from({ length: points }, (_, i) => {
      // Combine saw and square waves based on oscillator levels
      const sawWave = (2 * (i / points) - 1) * osc1Level;
      const squareWave = (Math.sin((i / points) * Math.PI * 8) > 0 ? 1 : -1) * osc2Level;
      return sawWave + squareWave;
    });
    setWaveformData(data);
  };

  useEffect(() => {
    initializeSynth();
    return () => {
      // Stop all notes on unmount
      activeNotes.forEach(note => stopNote(note));
    };
  }, []);
  
  // Update waveform when oscillator parameters change
  useEffect(() => {
    updateWaveform();
  }, [osc1Level, osc2Level, osc2Detune]);
  
  // Update audio routing when patches change
  useEffect(() => {
    if (arp2600Bridge.isInitialized) {
      arp2600Bridge.updatePatchRouting(patches);
    }
  }, [patches]);

  const initializeSynth = async () => {
    try {
      await arp2600Bridge.init();
      console.log('✅ ARP 2600 initialized');
    } catch (error) {
      console.error('❌ ARP 2600 init failed:', error);
    }
  };

  const playNote = async (note, freq) => {
    setActiveNotes(prev => new Set([...prev, note]));
    
    // Play with options object
    arp2600Bridge.playNote(note, { velocity: 1.0, duration: 2.0 });
    console.log(`🎹 Playing ARP 2600: ${note} @ ${freq.toFixed(2)}Hz`);
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Sequencer note handler
  const handleSequencerNote = (midiNote) => {
    // Convert MIDI note to frequency
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const noteName = `MIDI${midiNote}`;
    
    // Play note through ARP2600 bridge with options object
    arp2600Bridge.playNote(midiNote, { velocity: 1.0, duration: 0.25 });
    console.log(`🎵 Sequencer: MIDI ${midiNote} @ ${frequency.toFixed(2)}Hz`);
  };

  // Knob change handlers - update both state and bridge
  const handleOsc1LevelChange = (value) => {
    console.log('🎛️ ARP2600: Osc1 Level =', value);
    setOsc1Level(value);
    arp2600Bridge.setOsc1Level(value);
  };

  const handleOsc2LevelChange = (value) => {
    console.log('🎛️ ARP2600: Osc2 Level =', value);
    setOsc2Level(value);
    arp2600Bridge.setOsc2Level(value);
  };

  const handleOsc3LevelChange = (value) => {
    console.log('🎛️ ARP2600: Osc3 Level =', value);
    setOsc3Level(value);
    arp2600Bridge.setOsc3Level(value);
  };

  const handleDetuneChange = (value) => {
    const detuneValue = value / 200; // Knob 0-1, detune 0-0.005
    setOsc2Detune(detuneValue);
    arp2600Bridge.setDetune(detuneValue);
  };

  const handleOsc3DetuneChange = (value) => {
    const semitones = (value * 24) - 12; // Knob 0-1 maps to -12 to +12 semitones
    setOsc3Detune(semitones);
    arp2600Bridge.setOsc3Detune(semitones);
  };

  const handleFilterCutoffChange = (value) => {
    const cutoff = value * 10000; // Knob 0-1, cutoff 0-10000 Hz
    setFilterCutoff(cutoff);
    arp2600Bridge.setFilterCutoff(cutoff);
  };

  const handleFilterResonanceChange = (value) => {
    const resonance = value * 30; // Knob 0-1, Q 0-30
    setFilterResonance(resonance);
    arp2600Bridge.setFilterResonance(resonance);
  };

  const handleAttackChange = (value) => {
    const attackTime = value * 2; // Knob 0-1, time 0-2s
    setAttack(attackTime);
    arp2600Bridge.setAttack(attackTime);
  };

  const handleDecayChange = (value) => {
    const decayTime = value * 2; // Knob 0-1, time 0-2s
    setDecay(decayTime);
    arp2600Bridge.setDecay(decayTime);
  };

  const handleSustainChange = (value) => {
    setSustain(value);
    arp2600Bridge.setSustain(value);
  };

  const handleReleaseChange = (value) => {
    const releaseTime = value * 5; // Knob 0-1, time 0-5s
    setRelease(releaseTime);
    arp2600Bridge.setRelease(releaseTime);
  };
  
  // Modulation handlers
  const handleLFORateChange = (value) => {
    const rate = value * 20; // 0-20 Hz
    setLFORate(rate);
    arp2600Bridge.setLFORate(rate);
  };
  
  const handleLFODepthChange = (value) => {
    setLFODepth(value);
    arp2600Bridge.setLFODepth(value);
  };
  
  const handleNoiseLevelChange = (value) => {
    setNoiseLevel(value);
    arp2600Bridge.setNoiseLevel(value);
  };
  
  // Patch Bay Functions (inspired by Behringer 2600 HTML interactive patching)
  const handlePatchPointPress = (pointId) => {
    if (!patchMode) return;
    
    const point = patchPoints[pointId];
    
    if (!selectedPatch) {
      // First selection - must be an output
      if (point.type === 'output') {
        setSelectedPatch({ from: pointId, fromLabel: point.label, fromColor: point.color });
      }
    } else {
      // Second selection - must be an input
      if (point.type === 'input') {
        // Create patch
        const newPatch = {
          from: selectedPatch.from,
          to: pointId,
          color: selectedPatch.fromColor,
          id: Date.now(),
        };
        
        setPatches(prev => [...prev, newPatch]);
        applyPatchRouting(newPatch);
        setSelectedPatch(null);
      } else {
        // If output selected again, change selection
        setSelectedPatch({ from: pointId, fromLabel: point.label, fromColor: point.color });
      }
    }
  };
  
  const removePatch = (patchId) => {
    setPatches(prev => prev.filter(p => p.id !== patchId));
  };
  
  const clearAllPatches = () => {
    setPatches([]);
    setSelectedPatch(null);
  };
  
  const applyPatchRouting = (patch) => {
    // Enhanced audio routing with waveform-specific logic (from Behringer 2600 HTML)
    console.log(`🔌 Patched: ${patch.from} → ${patch.to}`);
    
    // Waveform-specific routing logic
    switch (`${patch.from}-${patch.to}`) {
      // VCO1 Sawtooth → Audio Paths
      case 'vco1-saw-vcf':
        console.log('📐 VCO1 SAW → Filter (bright, buzzy tone)');
        const saw1Level = Math.min(1.0, osc1Level * 1.1);
        setOsc1Level(saw1Level);
        arp2600Bridge.setOsc1Level(saw1Level);
        break;
        
      case 'vco1-saw-mixer-in':
        console.log('📐 VCO1 SAW → Mixer (bypass filter)');
        const mixerSaw1 = Math.min(1.0, osc1Level * 1.2);
        setOsc1Level(mixerSaw1);
        arp2600Bridge.setOsc1Level(mixerSaw1);
        break;
        
      // VCO1 Pulse → Audio Paths
      case 'vco1-pulse-vcf':
        console.log('⬜ VCO1 PULSE → Filter (hollow, woody tone)');
        const pulse1Level = Math.min(1.0, osc1Level * 0.9);
        setOsc1Level(pulse1Level);
        arp2600Bridge.setOsc1Level(pulse1Level);
        // Could adjust filter for pulse character
        const pulseCutoff = Math.min(10000, filterCutoff * 1.2);
        setFilterCutoff(pulseCutoff);
        arp2600Bridge.setCutoff(pulseCutoff);
        break;
        
      // VCO2 Sawtooth → Audio Paths
      case 'vco2-saw-vcf':
        console.log('📐 VCO2 SAW → Filter');
        const saw2Level = Math.min(1.0, osc2Level * 1.1);
        setOsc2Level(saw2Level);
        arp2600Bridge.setOsc2Level(saw2Level);
        break;
        
      // VCO2 Triangle → Audio Paths
      case 'vco2-tri-vcf':
        console.log('△ VCO2 TRI → Filter (pure, flute-like)');
        const tri2Level = Math.min(1.0, osc2Level * 0.8);
        setOsc2Level(tri2Level);
        arp2600Bridge.setOsc2Level(tri2Level);
        // Reduce filter resonance for purity
        const triRes = Math.max(1, filterResonance * 0.7);
        setFilterResonance(triRes);
        arp2600Bridge.setResonance(triRes);
        break;
        
      // VCO3 Sine (LFO as audio)
      case 'vco3-sine-vcf':
        console.log('〰️ VCO3 SINE → Filter (sub-bass)');
        const vco3Level = Math.min(1.0, osc2Level + 0.3);
        setOsc2Level(vco3Level);
        arp2600Bridge.setOsc2Level(vco3Level);
        break;
        
      // LFO → FM Modulation (Vibrato/FM Synthesis)
      case 'lfo-fm1':
        console.log('🌀 LFO → VCO1 FM (vibrato)');
        const fm1Detune = Math.min(0.02, osc2Detune * 2);
        setOsc2Detune(fm1Detune);
        arp2600Bridge.setDetune(fm1Detune);
        break;
        
      case 'lfo-fm2':
        console.log('🌀 LFO → VCO2 FM (vibrato)');
        const fm2Detune = Math.min(0.02, osc2Detune * 1.5);
        setOsc2Detune(fm2Detune);
        arp2600Bridge.setDetune(fm2Detune);
        break;
        
      // LFO → CV Modulation
      case 'lfo-vcf-cv':
        console.log('🌀 LFO → VCF CV (filter sweep)');
        const lfoFilterCutoff = Math.min(10000, filterCutoff * 1.4);
        setFilterCutoff(lfoFilterCutoff);
        arp2600Bridge.setCutoff(lfoFilterCutoff);
        break;
        
      case 'lfo-vca-cv':
        console.log('🌀 LFO → VCA CV (tremolo)');
        const tremoloLevel = Math.max(0.3, osc1Level * 0.85);
        setOsc1Level(tremoloLevel);
        arp2600Bridge.setOsc1Level(tremoloLevel);
        break;
        
      // ADSR → CV Modulation
      case 'adsr-vcf-cv':
        console.log('📈 ADSR → VCF CV (envelope filter)');
        const adsrCutoff = Math.min(10000, filterCutoff * 1.5);
        setFilterCutoff(adsrCutoff);
        arp2600Bridge.setCutoff(adsrCutoff);
        break;
        
      case 'adsr-fm1':
        console.log('📈 ADSR → VCO1 FM (envelope pitch bend)');
        const adsrDetune1 = Math.min(0.02, osc2Detune * 1.3);
        setOsc2Detune(adsrDetune1);
        arp2600Bridge.setDetune(adsrDetune1);
        break;
        
      case 'adsr-fm2':
        console.log('📈 ADSR → VCO2 FM (envelope pitch bend)');
        const adsrDetune2 = Math.min(0.02, osc2Detune * 1.2);
        setOsc2Detune(adsrDetune2);
        arp2600Bridge.setDetune(adsrDetune2);
        break;
        
      // Ring Modulation
      case 'vco1-saw-ringMod':
      case 'vco1-pulse-ringMod':
      case 'vco2-saw-ringMod':
      case 'vco2-tri-ringMod':
        console.log('💍 Ring Modulation active (metallic, bell-like)');
        const ringOsc1 = Math.min(1.0, osc1Level * 1.3);
        const ringOsc2 = Math.min(1.0, osc2Level * 1.3);
        setOsc1Level(ringOsc1);
        setOsc2Level(ringOsc2);
        arp2600Bridge.setOsc1Level(ringOsc1);
        arp2600Bridge.setOsc2Level(ringOsc2);
        const ringRes = Math.min(30, filterResonance * 1.5);
        setFilterResonance(ringRes);
        arp2600Bridge.setResonance(ringRes);
        break;
        
      // White Noise → Audio Paths
      case 'noise-white-vcf':
        console.log('❄️ WHITE NOISE → Filter (bright noise)');
        const whiteNoiseOsc1 = osc1Level * 0.6;
        const whiteNoiseOsc2 = osc2Level * 0.6;
        setOsc1Level(whiteNoiseOsc1);
        setOsc2Level(whiteNoiseOsc2);
        arp2600Bridge.setOsc1Level(whiteNoiseOsc1);
        arp2600Bridge.setOsc2Level(whiteNoiseOsc2);
        arp2600Bridge.setNoiseLevel(0.5);
        break;
        
      case 'noise-white-mixer-in':
        console.log('❄️ WHITE NOISE → Mixer (full spectrum)');
        arp2600Bridge.setNoiseLevel(0.6);
        break;
        
      // Pink Noise → Audio Paths
      case 'noise-pink-vcf':
        console.log('🌸 PINK NOISE → Filter (warm noise)');
        const pinkNoiseOsc1 = osc1Level * 0.7;
        const pinkNoiseOsc2 = osc2Level * 0.7;
        setOsc1Level(pinkNoiseOsc1);
        setOsc2Level(pinkNoiseOsc2);
        arp2600Bridge.setOsc1Level(pinkNoiseOsc1);
        arp2600Bridge.setOsc2Level(pinkNoiseOsc2);
        arp2600Bridge.setNoiseLevel(0.4);
        // Lower filter cutoff for pink character
        const pinkCutoff = Math.max(100, filterCutoff * 0.7);
        setFilterCutoff(pinkCutoff);
        arp2600Bridge.setCutoff(pinkCutoff);
        break;
        
      default:
        console.log(`⚠️ Unknown patch: ${patch.from} → ${patch.to}`);
    }
  };

  const renderKey = (noteData, index) => {
    const isActive = activeNotes.has(noteData.note);
    
    if (noteData.black) {
      return (
        <TouchableOpacity
          style={[styles.blackKey, isActive && styles.blackKeyActive]}
          onPressIn={() => playNote(noteData.note, noteData.freq)}
          onPressOut={() => stopNote(noteData.note)}
        >
          <Text style={styles.blackKeyLabel}>{noteData.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.whiteKey, isActive && styles.whiteKeyActive]}
        onPressIn={() => playNote(noteData.note, noteData.freq)}
        onPressOut={() => stopNote(noteData.note)}
      >
        <Text style={styles.whiteKeyLabel}>{noteData.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden WebView for audio-engine.html */}
      <WebView
        ref={(ref) => {
          if (ref && !webAudioBridge.isReady) {
            webAudioBridge.setWebViewRef(ref);
          }
        }}
        source={require('../../assets/audio-engine.html')}
        style={{ width: 1, height: 1, opacity: 0, position: 'absolute', top: -1000, left: -1000, pointerEvents: 'none' }}
        onMessage={(event) => webAudioBridge.onMessage(event)}
        onLoad={() => webAudioBridge.initAudio()}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />

      {/* Floating Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={[styles.floatingBackButton, { top: insets.top + 10 }]}
      >
        <Text style={styles.floatingBackText}>✕</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ 
          paddingTop: 0,
          paddingBottom: Math.max(150, insets.bottom + 100),
          flexGrow: 1 
        }}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Oscillator Section */}
        <View style={[styles.section, { paddingTop: insets.top + 70 }]}>
          <Text style={styles.sectionTitle}>🌊 OSCILLATORS (3x VCO)</Text>
          <View style={styles.controlsRow}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>VCO 1</Text>
              <Slider
                style={styles.slider}
                value={osc1Level}
                onValueChange={handleOsc1LevelChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.orange}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.orange}
              />
              <Text style={styles.sliderValue}>{(osc1Level * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>VCO 2</Text>
              <Slider
                style={styles.slider}
                value={osc2Level}
                onValueChange={handleOsc2LevelChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.orange}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.orange}
              />
              <Text style={styles.sliderValue}>{(osc2Level * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>VCO 3</Text>
              <Slider
                style={styles.slider}
                value={osc3Level}
                onValueChange={handleOsc3LevelChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.orange}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.orange}
              />
              <Text style={styles.sliderValue}>{(osc3Level * 100).toFixed(0)}%</Text>
            </View>
          </View>

          {/* Detune Controls Row */}
          <View style={styles.controlsRow}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>VCO 2 DETUNE</Text>
              <Slider
                style={styles.slider}
                value={osc2Detune * 200}
                onValueChange={handleDetuneChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{(osc2Detune * 100).toFixed(1)}%</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>VCO 3 PITCH</Text>
              <Slider
                style={styles.slider}
                value={(osc3Detune + 12) / 24}
                onValueChange={handleOsc3DetuneChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{osc3Detune.toFixed(1)} ST</Text>
            </View>
          </View>

          <Text style={styles.sectionInfo}>
            Triple oscillator: VCO1 (SAW) + VCO2 (SAW+detune) + VCO3 (SINE+pitch)
          </Text>
          
          {/* Oscilloscope Waveform Display */}
          <View style={styles.oscilloscopeContainer}>
            <Text style={styles.oscilloscopeLabel}>WAVEFORM</Text>
            <Oscilloscope
              waveformData={waveformData}
              width={width - 80}
              height={100}
              color={HAOS_COLORS.orange}
              backgroundColor="rgba(0,0,0,0.7)"
              lineWidth={2}
              showGrid={true}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎛️ FILTER</Text>
          <View style={styles.controlsRow}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>CUTOFF</Text>
              <Slider
                style={styles.slider}
                value={filterCutoff / 10000}
                onValueChange={handleFilterCutoffChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.green}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.green}
              />
              <Text style={styles.sliderValue}>{filterCutoff.toFixed(0)} Hz</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>RESONANCE</Text>
              <Slider
                style={styles.slider}
                value={filterResonance / 30}
                onValueChange={handleFilterResonanceChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.green}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.green}
              />
              <Text style={styles.sliderValue}>Q: {filterResonance.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            Ultra-resonant lowpass filter (Q=18 for screaming leads)
          </Text>
        </View>

        {/* Envelope Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 ENVELOPE</Text>
          <View style={styles.controlsRow}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>ATTACK</Text>
              <Slider
                style={styles.slider}
                value={attack / 2}
                onValueChange={handleAttackChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{(attack * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>DECAY</Text>
              <Slider
                style={styles.slider}
                value={decay / 2}
                onValueChange={handleDecayChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{(decay * 1000).toFixed(0)}ms</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>SUSTAIN</Text>
              <Slider
                style={styles.slider}
                value={sustain}
                onValueChange={handleSustainChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{(sustain * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>RELEASE</Text>
              <Slider
                style={styles.slider}
                value={release / 5}
                onValueChange={handleReleaseChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={HAOS_COLORS.cyan}
                maximumTrackTintColor="#333"
                thumbTintColor={HAOS_COLORS.cyan}
              />
              <Text style={styles.sliderValue}>{(release * 1000).toFixed(0)}ms</Text>
            </View>
          </View>
        </View>

        {/* Modulation Section (LFO & Noise) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌀 MODULATION</Text>
          <View style={styles.controlsRow}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>LFO RATE</Text>
              <Slider
                style={styles.slider}
                value={lfoRate / 20}
                onValueChange={handleLFORateChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#9D4EDD"
                maximumTrackTintColor="#333"
                thumbTintColor="#9D4EDD"
              />
              <Text style={styles.sliderValue}>{lfoRate.toFixed(1)} Hz</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>LFO DEPTH</Text>
              <Slider
                style={styles.slider}
                value={lfoDepth}
                onValueChange={handleLFODepthChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#9D4EDD"
                maximumTrackTintColor="#333"
                thumbTintColor="#9D4EDD"
              />
              <Text style={styles.sliderValue}>{(lfoDepth * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>NOISE</Text>
              <Slider
                style={styles.slider}
                value={noiseLevel}
                onValueChange={handleNoiseLevelChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#6B6B6B"
                maximumTrackTintColor="#333"
                thumbTintColor="#6B6B6B"
              />
              <Text style={styles.sliderValue}>{(noiseLevel * 100).toFixed(0)}%</Text>
            </View>
          </View>
          <Text style={styles.sectionInfo}>
            LFO for vibrato/tremolo • White noise generator • Patch to FM inputs
          </Text>
        </View>

        {/* Patch Bay Section (Behringer 2600 inspired) */}
        <View style={styles.section}>
          <View style={styles.patchHeader}>
            <Text style={styles.sectionTitle}>🔌 PATCH BAY</Text>
            <TouchableOpacity
              style={[styles.patchModeBtn, patchMode && styles.patchModeBtnActive]}
              onPress={() => {
                setPatchMode(!patchMode);
                setSelectedPatch(null);
              }}
            >
              <Text style={[styles.patchModeBtnText, patchMode && styles.patchModeBtnTextActive]}>
                {patchMode ? '✓ PATCHING' : 'TAP TO PATCH'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {patchMode && (
            <Text style={styles.patchInfo}>
              {selectedPatch 
                ? `🔗 ${selectedPatch.fromLabel} selected → Tap an INPUT to connect`
                : '📍 Tap an OUTPUT to start patching'}
            </Text>
          )}
          
          {/* Patch Points Grid */}
          <View style={styles.patchGrid}>
            {/* Outputs Column */}
            <View style={styles.patchColumn}>
              <Text style={styles.patchColumnTitle}>OUTPUTS</Text>
              {Object.entries(patchPoints)
                .filter(([_, point]) => point.type === 'output')
                .map(([id, point]) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.patchPoint,
                      styles.patchOutput,
                      { borderColor: point.color },
                      selectedPatch?.from === id && styles.patchPointSelected,
                    ]}
                    onPress={() => handlePatchPointPress(id)}
                  >
                    <View style={[styles.patchJack, { backgroundColor: point.color }]} />
                    <View style={styles.patchLabelContainer}>
                      <Text style={styles.patchIcon}>{point.icon}</Text>
                      <Text style={styles.patchLabel}>{point.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
            
            {/* Inputs Column */}
            <View style={styles.patchColumn}>
              <Text style={styles.patchColumnTitle}>INPUTS</Text>
              {Object.entries(patchPoints)
                .filter(([_, point]) => point.type === 'input')
                .map(([id, point]) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.patchPoint,
                      styles.patchInput,
                      { borderColor: point.color },
                    ]}
                    onPress={() => handlePatchPointPress(id)}
                  >
                    <View style={styles.patchLabelContainer}>
                      <Text style={styles.patchIcon}>{point.icon}</Text>
                      <Text style={styles.patchLabel}>{point.label}</Text>
                    </View>
                    <View style={[styles.patchJack, { backgroundColor: point.color }]} />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
          
          {/* Active Patches */}
          {patches.length > 0 && (
            <View style={styles.patchesContainer}>
              <Text style={styles.patchesTitle}>📡 ACTIVE PATCHES ({patches.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {patches.map((patch) => (
                  <View key={patch.id} style={styles.patchCable}>
                    <View style={[styles.patchCableStart, { backgroundColor: patch.color }]} />
                    <View style={[styles.patchCableBody, { backgroundColor: patch.color }]} />
                    <View style={[styles.patchCableEnd, { backgroundColor: patch.color }]} />
                    <Text style={styles.patchCableLabel}>
                      {patchPoints[patch.from].label} → {patchPoints[patch.to].label}
                    </Text>
                    {patch.id && (
                      <TouchableOpacity
                        style={styles.patchRemoveBtn}
                        onPress={() => removePatch(patch.id)}
                      >
                        <Text style={styles.patchRemoveText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.clearPatchesBtn} onPress={clearAllPatches}>
                <Text style={styles.clearPatchesText}>🗑️ Clear All Patches</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <Text style={styles.sectionInfo}>
            86 patch points • 3 VCOs • Ring Mod • S&H • Modular routing
          </Text>
        </View>

        {/* Universal Sequencer */}
        <UniversalSequencer
          isPlaying={sequencerPlaying}
          bpm={bpm}
          onPlayNote={handleSequencerNote}
          color={HAOS_COLORS.orange}
          title="ARP 2600 SEQUENCER"
        />

        {/* Sequencer Controls */}
        <View style={styles.section}>
          <View style={styles.sequencerControls}>
            <TouchableOpacity
              onPress={() => setSequencerPlaying(!sequencerPlaying)}
              style={[styles.transportButton, sequencerPlaying && styles.transportButtonActive]}
            >
              <Text style={styles.transportButtonText}>
                {sequencerPlaying ? '⏸ STOP' : '▶ PLAY'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.bpmControl}>
              <Text style={styles.bpmLabel}>BPM</Text>
              <View style={styles.bpmButtons}>
                <TouchableOpacity
                  onPress={() => setBpm(Math.max(60, bpm - 5))}
                  style={styles.bpmButton}
                >
                  <Text style={styles.bpmButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.bpmValue}>{bpm}</Text>
                <TouchableOpacity
                  onPress={() => setBpm(Math.min(200, bpm + 5))}
                  style={styles.bpmButton}
                >
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Keyboard */}
        <View style={styles.keyboardSection}>
          <Text style={styles.sectionTitle}>🎹 KEYBOARD</Text>
          <View style={styles.keyboard}>
            {NOTES.filter(n => !n.black).map((note, i) => (
              <React.Fragment key={note.note}>
                {renderKey(note, i)}
              </React.Fragment>
            ))}
            <View style={styles.blackKeysContainer}>
              {NOTES.filter(n => n.black).map((note, i) => (
                <React.Fragment key={note.note}>
                  {renderKey(note, i)}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎸 Classic modular synth • Aggressive resonant filter • Perfect for techno leads
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.orange,
  },
  backButton: {
    color: HAOS_COLORS.orange,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 60,
  },
  floatingBackButton: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  floatingBackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 9,
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
    marginTop: 2,
  },
  badge: {
    backgroundColor: HAOS_COLORS.orange,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  audioWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.3)',
  },
  audioWarningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  audioWarningText: {
    fontSize: 11,
    color: HAOS_COLORS.orange,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    marginBottom: 16,
    letterSpacing: 1,
  },
  sectionInfo: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    marginTop: 12,
    fontStyle: 'italic',
  },
  oscilloscopeContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  oscilloscopeLabel: {
    fontSize: 12,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  knobContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  knobValue: {
    fontSize: 12,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    minWidth: 120,
  },
  sliderLabel: {
    fontSize: 11,
    color: HAOS_COLORS.silver,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 12,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  keyboardSection: {
    padding: 20,
  },
  keyboard: {
    height: 120,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  whiteKey: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  whiteKeyActive: {
    backgroundColor: HAOS_COLORS.orange,
  },
  whiteKeyLabel: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  blackKeysContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: '6%',
  },
  blackKey: {
    width: 40,
    height: 70,
    backgroundColor: '#000',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    marginHorizontal: 20,
  },
  blackKeyActive: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  blackKeyLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
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
  // Patch Bay Styles (Behringer 2600 inspired)
  patchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patchModeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderWidth: 2,
    borderColor: HAOS_COLORS.cyan,
    borderRadius: 8,
  },
  patchModeBtnActive: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  patchModeBtnText: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  patchModeBtnTextActive: {
    color: HAOS_COLORS.dark,
  },
  patchInfo: {
    fontSize: 11,
    color: HAOS_COLORS.orange,
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
    textAlign: 'center',
  },
  patchGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  patchColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  patchColumnTitle: {
    fontSize: 10,
    color: HAOS_COLORS.silver,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  patchPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  patchOutput: {
    justifyContent: 'flex-start',
  },
  patchInput: {
    justifyContent: 'flex-end',
  },
  patchPointSelected: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    shadowColor: HAOS_COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  patchJack: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
  },
  patchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patchIcon: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 18,
  },
  patchLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  patchesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,217,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.2)',
  },
  patchesTitle: {
    fontSize: 11,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  patchCable: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
  },
  patchCableStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  patchCableBody: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginBottom: 4,
  },
  patchCableEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  patchCableLabel: {
    fontSize: 9,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  patchRemoveBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,0,0,0.2)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.5)',
  },
  patchRemoveText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearPatchesBtn: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    alignItems: 'center',
  },
  clearPatchesText: {
    color: '#ff6b6b',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sequencerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderRadius: 12,
    marginTop: 8,
  },
  transportButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,255,148,0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,255,148,0.3)',
  },
  transportButtonActive: {
    backgroundColor: 'rgba(0,255,148,0.3)',
    borderColor: '#00ff94',
  },
  transportButtonText: {
    color: '#00ff94',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bpmLabel: {
    color: HAOS_COLORS.orange,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bpmButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpmButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,107,53,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonText: {
    color: HAOS_COLORS.orange,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bpmValue: {
    color: HAOS_COLORS.orange,
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
});

export default ARP2600Screen;
