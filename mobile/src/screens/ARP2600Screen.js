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
  StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import arp2600Bridge from '../synths/ARP2600Bridge';
import webAudioBridge from '../services/WebAudioBridge';
import Oscilloscope from '../components/Oscilloscope';
import Bass2DVisualizer from '../components/Bass2DVisualizer';
import UniversalSequencer from '../components/UniversalSequencer';

const { width } = Dimensions.get('window');

// Responsive sizing - ENHANCED for better touch targets
const KNOB_SIZE = Math.min(width * 0.18, 80); // 18% of width, max 80px (increased from 70px)
const IS_SMALL_SCREEN = width < 375;

const HAOS_COLORS = {
  orange: '#FF6B35',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  metal: '#1a1a1a',
  silver: '#c0c0c0',
};

// Musical keyboard notes - 2 Octaves (C3-C5, 25 keys)
const NOTES = [
  // Octave 3 (C3-B3)
  { note: 'C3', freq: 130.81, label: 'C', octave: 3, black: false },
  { note: 'C#3', freq: 138.59, label: 'C#', octave: 3, black: true },
  { note: 'D3', freq: 146.83, label: 'D', octave: 3, black: false },
  { note: 'D#3', freq: 155.56, label: 'D#', octave: 3, black: true },
  { note: 'E3', freq: 164.81, label: 'E', octave: 3, black: false },
  { note: 'F3', freq: 174.61, label: 'F', octave: 3, black: false },
  { note: 'F#3', freq: 185.00, label: 'F#', octave: 3, black: true },
  { note: 'G3', freq: 196.00, label: 'G', octave: 3, black: false },
  { note: 'G#3', freq: 207.65, label: 'G#', octave: 3, black: true },
  { note: 'A3', freq: 220.00, label: 'A', octave: 3, black: false },
  { note: 'A#3', freq: 233.08, label: 'A#', octave: 3, black: true },
  { note: 'B3', freq: 246.94, label: 'B', octave: 3, black: false },
  // Octave 4 (C4-B4)
  { note: 'C4', freq: 261.63, label: 'C', octave: 4, black: false },
  { note: 'C#4', freq: 277.18, label: 'C#', octave: 4, black: true },
  { note: 'D4', freq: 293.66, label: 'D', octave: 4, black: false },
  { note: 'D#4', freq: 311.13, label: 'D#', octave: 4, black: true },
  { note: 'E4', freq: 329.63, label: 'E', octave: 4, black: false },
  { note: 'F4', freq: 349.23, label: 'F', octave: 4, black: false },
  { note: 'F#4', freq: 369.99, label: 'F#', octave: 4, black: true },
  { note: 'G4', freq: 392.00, label: 'G', octave: 4, black: false },
  { note: 'G#4', freq: 415.30, label: 'G#', octave: 4, black: true },
  { note: 'A4', freq: 440.00, label: 'A', octave: 4, black: false },
  { note: 'A#4', freq: 466.16, label: 'A#', octave: 4, black: true },
  { note: 'B4', freq: 493.88, label: 'B', octave: 4, black: false },
  // Octave 5 (C5)
  { note: 'C5', freq: 523.25, label: 'C', octave: 5, black: false },
];

const ARP2600Screen = ({ navigation }) => {
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
  
  // Keyboard controls
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2
  const [velocity, setVelocity] = useState(100); // 0-127, default 100
  const [touchStartTime, setTouchStartTime] = useState(null);
  
  // Sequencer state
  const [sequencerPlaying, setSequencerPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Modulation parameters (for LFO and noise)
  const [lfoRate, setLFORate] = useState(5.0);
  const [lfoDepth, setLFODepth] = useState(0.5);
  const [noiseLevel, setNoiseLevel] = useState(0.3);
  
  // Visualizer and category state
  const [visualizerMode, setVisualizerMode] = useState('oscilloscope'); // 'oscilloscope' | 'bass'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const visualizerRef = useRef(null);
  
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

  // Professional Presets - Serum/Cymatics Style (IMPROVED)
  const SYNTH_PRESETS = {
    supersaw: {
      name: '🔥 Supersaw Lead',
      emoji: '🔥',
      color: '#FF6B35',
      category: 'lead',
      osc1Level: 0.9,
      osc2Level: 0.85,
      osc3Level: 0.75,
      osc2Detune: 0.015, // Wider detune for supersaw
      osc3Detune: 7, // +7 semitones (fifth)
      filterCutoff: 6500, // Brighter, more aggressive
      filterResonance: 12, // Higher res for character
      attack: 0.005, // Instant attack
      decay: 0.2,
      sustain: 0.9, // High sustain for leads
      release: 0.6,
      lfoRate: 5.5,
      lfoDepth: 0.2, // Subtle vibrato
      noiseLevel: 0.03,
    },
    pluck: {
      name: '✨ Pluck Stab',
      emoji: '✨',
      color: '#00D9FF',
      category: 'lead',
      osc1Level: 1.0, // Full level
      osc2Level: 0.8,
      osc3Level: 0.0,
      osc2Detune: 0.010, // Tight detune
      osc3Detune: 0,
      filterCutoff: 5500, // Very bright
      filterResonance: 18, // High resonance for pluck character
      attack: 0.001, // Instant
      decay: 0.25, // Quick decay
      sustain: 0.1, // Low sustain
      release: 0.15, // Short release
      lfoRate: 0,
      lfoDepth: 0,
      noiseLevel: 0.12, // More noise for attack
    },
    pad: {
      name: '🌊 Ambient Pad',
      emoji: '🌊',
      color: '#9D4EDD',
      category: 'pad',
      osc1Level: 0.7,
      osc2Level: 0.7,
      osc3Level: 0.65,
      osc2Detune: 0.020, // Wide detune for richness
      osc3Detune: 12, // +12 semitones (octave)
      filterCutoff: 1800, // Darker, warmer
      filterResonance: 3, // Low res for smoothness
      attack: 1.5, // Very slow attack
      decay: 1.0,
      sustain: 0.95, // Very high sustain
      release: 3.0, // Long release
      lfoRate: 0.3, // Slow LFO
      lfoDepth: 0.5, // Moderate modulation
      noiseLevel: 0.01,
    },
    brass: {
      name: '🎺 Brass Stab',
      emoji: '🎺',
      color: '#FFD700',
      category: 'brass',
      osc1Level: 0.95,
      osc2Level: 0.85,
      osc3Level: 0.0,
      osc2Detune: 0.004, // Very tight detune
      osc3Detune: 0,
      filterCutoff: 3800, // Mid-bright
      filterResonance: 22, // High resonance for brass character
      attack: 0.05, // Slight attack
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 6.0, // Faster LFO for vibrato
      lfoDepth: 0.35,
      noiseLevel: 0.15, // More breath noise
    },
    arp: {
      name: '🎹 Arp Sequence',
      emoji: '🎹',
      color: '#00ff94',
      category: 'arp',
      osc1Level: 0.85,
      osc2Level: 0.75,
      osc3Level: 0.0,
      osc2Detune: 0.012,
      osc3Detune: 0,
      filterCutoff: 7000, // Very bright
      filterResonance: 8, // Moderate res
      attack: 0.001, // Instant
      decay: 0.08, // Very short decay
      sustain: 0.3, // Low sustain
      release: 0.12, // Short release
      lfoRate: 10.0, // Fast LFO
      lfoDepth: 0.5,
      noiseLevel: 0.02,
    },
    neuro: {
      name: '🧠 Neuro Bass',
      emoji: '🧠',
      color: '#39FF14',
      category: 'bass',
      osc1Level: 1.0, // Full power
      osc2Level: 0.95,
      osc3Level: 0.85,
      osc2Detune: 0.030, // Wide detune for movement
      osc3Detune: -12, // -12 semitones (octave down)
      filterCutoff: 1200, // Low cutoff for bass
      filterResonance: 28, // Very high resonance
      attack: 0.002,
      decay: 0.08,
      sustain: 0.9,
      release: 0.1,
      lfoRate: 16.0, // Very fast LFO for wobble
      lfoDepth: 0.9, // Heavy modulation
      noiseLevel: 0.20, // Lots of grit
    },
    vocal: {
      name: '🎤 Vocal Formant',
      emoji: '🎤',
      color: '#FF006E',
      category: 'vocal',
      osc1Level: 0.8,
      osc2Level: 0.7,
      osc3Level: 0.6,
      osc2Detune: 0.005, // Tight
      osc3Detune: 12, // +12 semitones
      filterCutoff: 2200, // Formant range
      filterResonance: 25, // High resonance for formant
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.4,
      lfoRate: 2.5, // Slow LFO for vowel movement
      lfoDepth: 0.8, // Heavy modulation
      noiseLevel: 0.08,
    },
    bell: {
      name: '🔔 Bell Lead',
      emoji: '🔔',
      color: '#FFB347',
      category: 'fx',
      osc1Level: 0.9,
      osc2Level: 0.6,
      osc3Level: 0.4,
      osc2Detune: 0.014,
      osc3Detune: 19, // +19 semitones (fifth + octave)
      filterCutoff: 8500, // Very bright
      filterResonance: 6, // Low res for clarity
      attack: 0.001, // Instant
      decay: 0.8, // Long decay for bell ring
      sustain: 0.2, // Low sustain
      release: 2.5, // Very long release
      lfoRate: 0.1, // Very slow LFO
      lfoDepth: 0.10, // Subtle shimmer
      noiseLevel: 0.005,
    },
    // ACID & TECHNO PRESETS
    acid303: {
      name: '🧪 TB-303 Acid',
      emoji: '🧪',
      color: '#39FF14',
      category: 'techno',
      osc1Level: 1.0,
      osc2Level: 0.0,
      osc3Level: 0.0,
      osc2Detune: 0.01,
      osc3Detune: 0,
      filterCutoff: 1200, // Mid-low for acid squelch
      filterResonance: 28, // Very high resonance for 303 character
      attack: 0.001, // Instant attack
      decay: 0.08, // Quick decay
      sustain: 0.2, // Low sustain for pluck
      release: 0.05, // Very short release
      lfoRate: 12.0, // Fast LFO for filter modulation
      lfoDepth: 0.95, // Heavy modulation for squelch
      noiseLevel: 0.05,
    },
    hardTechno: {
      name: '💥 Hard Techno Bass',
      emoji: '💥',
      color: '#FF0066',
      category: 'techno',
      osc1Level: 1.0,
      osc2Level: 0.9,
      osc3Level: 0.8,
      osc2Detune: 0.025, // Wide detune for power
      osc3Detune: -12, // Octave down for depth
      filterCutoff: 500, // Very low for aggressive bass
      filterResonance: 25, // High resonance for edge
      attack: 0.001,
      decay: 0.1,
      sustain: 0.95, // High sustain for driving bass
      release: 0.15,
      lfoRate: 16.0, // Very fast wobble
      lfoDepth: 0.85, // Heavy modulation
      noiseLevel: 0.25, // Lots of grit and distortion
    },
    minimalTechno: {
      name: '🎚️ Minimal Techno',
      emoji: '🎚️',
      color: '#00D9FF',
      category: 'techno',
      osc1Level: 0.9,
      osc2Level: 0.85,
      osc3Level: 0.0,
      osc2Detune: 0.008, // Very tight detune
      osc3Detune: 0,
      filterCutoff: 800, // Clean minimal sound
      filterResonance: 12, // Moderate resonance
      attack: 0.002,
      decay: 0.15,
      sustain: 0.9,
      release: 0.3,
      lfoRate: 0.25, // Very slow subtle movement
      lfoDepth: 0.15,
      noiseLevel: 0.02, // Very clean
    },
    acidWobble: {
      name: '🌀 Acid Wobble',
      emoji: '🌀',
      color: '#9D4EDD',
      category: 'techno',
      osc1Level: 1.0,
      osc2Level: 0.95,
      osc3Level: 0.9,
      osc2Detune: 0.030, // Wide detune for movement
      osc3Detune: -24, // Two octaves down for sub power
      filterCutoff: 600, // Low for wobble bass
      filterResonance: 30, // Extreme resonance
      attack: 0.001,
      decay: 0.05,
      sustain: 0.95,
      release: 0.08,
      lfoRate: 8.0, // Medium-fast wobble (1/8 note at 120 BPM)
      lfoDepth: 0.98, // Maximum modulation
      noiseLevel: 0.18,
    },
    technoStab: {
      name: '🎹 Techno Stab',
      emoji: '🎹',
      color: '#FFD700',
      category: 'techno',
      osc1Level: 0.95,
      osc2Level: 0.85,
      osc3Level: 0.75,
      osc2Detune: 0.012,
      osc3Detune: 7, // Fifth for chord character
      filterCutoff: 4500, // Bright stab
      filterResonance: 18, // High res for punch
      attack: 0.001, // Instant
      decay: 0.15, // Short decay
      sustain: 0.3, // Low sustain for stab
      release: 0.20,
      lfoRate: 10.0, // Fast LFO
      lfoDepth: 0.4,
      noiseLevel: 0.08,
    },
    technoLead: {
      name: '🔊 Techno Lead',
      emoji: '🔊',
      color: '#FF6B35',
      category: 'techno',
      osc1Level: 0.9,
      osc2Level: 0.8,
      osc3Level: 0.0,
      osc2Detune: 0.015, // Moderate detune
      osc3Detune: 0,
      filterCutoff: 7500, // Very bright for cutting lead
      filterResonance: 10, // Moderate res
      attack: 0.002,
      decay: 0.2,
      sustain: 0.85,
      release: 0.4,
      lfoRate: 6.0, // Medium LFO for vibrato
      lfoDepth: 0.25,
      noiseLevel: 0.05,
    },
    // IMPORTED FROM PRESET LIBRARY
    subBass: {
      name: '💎 Sub Bass',
      emoji: '💎',
      color: '#0066FF',
      category: 'bass',
      osc1Level: 1.0,
      osc2Level: 0.0,
      osc3Level: 0.0,
      osc2Detune: 0.01,
      osc3Detune: 0,
      filterCutoff: 200, // Very low for pure sub
      filterResonance: 2, // Minimal resonance for clean sub
      attack: 0.005,
      decay: 0.1,
      sustain: 1.0, // Full sustain for sustained bass
      release: 0.2,
      lfoRate: 5.0,
      lfoDepth: 0.3,
      noiseLevel: 0.05,
    },
    reeseBass: {
      name: '🌊 Reese Bass',
      emoji: '🌊',
      color: '#00D9FF',
      category: 'bass',
      osc1Level: 0.9,
      osc2Level: 0.9,
      osc3Level: 0.0,
      osc2Detune: 0.025, // 2.5% detune for Reese character
      osc3Detune: 0,
      filterCutoff: 800,
      filterResonance: 15,
      attack: 0.01,
      decay: 0.15,
      sustain: 0.9,
      release: 0.3,
      lfoRate: 0.5, // Slow LFO for movement
      lfoDepth: 0.2,
      noiseLevel: 0.05,
    },
    growlBass: {
      name: '🐻 Growl Bass',
      emoji: '🐻',
      color: '#FF0066',
      category: 'bass',
      osc1Level: 1.0,
      osc2Level: 0.8,
      osc3Level: 0.6,
      osc2Detune: 0.02,
      osc3Detune: -12, // Octave down
      filterCutoff: 600,
      filterResonance: 20,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.2,
      lfoRate: 8.0, // Fast LFO for growl
      lfoDepth: 0.9,
      noiseLevel: 0.15,
    },
    syncLead: {
      name: '🔥 Sync Lead',
      emoji: '🔥',
      color: '#FF6B35',
      category: 'lead',
      osc1Level: 1.0,
      osc2Level: 0.7,
      osc3Level: 0.5,
      osc2Detune: 0.008,
      osc3Detune: 12, // Octave up for harmonics
      filterCutoff: 4500,
      filterResonance: 15,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.85,
      release: 0.4,
      lfoRate: 6.0,
      lfoDepth: 0.4,
      noiseLevel: 0.05,
    },
    warmPad: {
      name: '☀️ Warm Pad',
      emoji: '☀️',
      color: '#FF8C5A',
      category: 'pad',
      osc1Level: 0.8,
      osc2Level: 0.7,
      osc3Level: 0.6,
      osc2Detune: 0.012,
      osc3Detune: 12, // Octave up
      filterCutoff: 2200,
      filterResonance: 4,
      attack: 1.0, // Slow attack
      decay: 0.6,
      sustain: 0.9,
      release: 2.5, // Long release
      lfoRate: 5.0,
      lfoDepth: 0.3,
      noiseLevel: 0.05,
    },
    riserFx: {
      name: '📈 Riser FX',
      emoji: '📈',
      color: '#CC0044',
      category: 'fx',
      osc1Level: 0.8,
      osc2Level: 0.7,
      osc3Level: 0.6,
      osc2Detune: 0.03, // Wide detune
      osc3Detune: 12, // Octave up
      filterCutoff: 500, // Start low for sweep
      filterResonance: 25, // High resonance
      attack: 2.0, // Very slow attack for riser
      decay: 0.1,
      sustain: 1.0,
      release: 1.0,
      lfoRate: 0.2, // Very slow LFO
      lfoDepth: 0.9, // Heavy modulation
      noiseLevel: 0.3, // Lots of noise for tension
    },
    
    // ========================================
    // 🎻 VIOLIN PRESETS (20 variations)
    // Generated with Python using synthesis theory
    // ========================================
    
    soloViolin: {
      name: '🎻 SOLO VIOLIN',
      emoji: '🎻',
      color: '#8B4513',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3800,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.2,
      noiseLevel: 0.0,
    },
    
    violinEnsemble: {
      name: '🎻 VIOLIN ENSEMBLE',
      emoji: '🎻',
      color: '#A0522D',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.008,
      osc3Detune: -12,
      filterCutoff: 3400,
      filterResonance: 4.0,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      lfoRate: 5.5,
      lfoDepth: 0.15,
      noiseLevel: 0.0,
    },
    
    violinLegato: {
      name: '🎻 VIOLIN LEGATO',
      emoji: '🎻',
      color: '#8B4513',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3600,
      filterResonance: 4.0,
      attack: 0.15,
      decay: 0.3,
      sustain: 0.9,
      release: 0.6,
      lfoRate: 5.5,
      lfoDepth: 0.25,
      noiseLevel: 0.0,
    },
    
    violinStaccato: {
      name: '🎻 VIOLIN STACCATO',
      emoji: '🎻',
      color: '#D2691E',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 4200,
      filterResonance: 4.0,
      attack: 0.005,
      decay: 0.05,
      sustain: 0.3,
      release: 0.1,
      lfoRate: 5.5,
      lfoDepth: 0.1,
      noiseLevel: 0.0,
    },
    
    pizzicato: {
      name: '🎻 PIZZICATO',
      emoji: '🎻',
      color: '#CD853F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.0,
      osc3Detune: 0,
      filterCutoff: 4000,
      filterResonance: 4.0,
      attack: 0.001,
      decay: 0.08,
      sustain: 0.0,
      release: 0.1,
      lfoRate: 5.5,
      lfoDepth: 0.0,
      noiseLevel: 0.0,
    },
    
    pizzBright: {
      name: '🎻 PIZZ BRIGHT',
      emoji: '🎻',
      color: '#DEB887',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.0,
      osc3Detune: 0,
      filterCutoff: 4600,
      filterResonance: 4.0,
      attack: 0.001,
      decay: 0.08,
      sustain: 0.0,
      release: 0.1,
      lfoRate: 5.5,
      lfoDepth: 0.0,
      noiseLevel: 0.0,
    },
    
    tremolo: {
      name: '🎻 TREMOLO',
      emoji: '🎻',
      color: '#BC8F8F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3800,
      filterResonance: 4.0,
      attack: 0.005,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      lfoRate: 5.5,
      lfoDepth: 0.4,
      noiseLevel: 0.0,
    },
    
    tremoloFast: {
      name: '🎻 TREMOLO FAST',
      emoji: '🎻',
      color: '#A0522D',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 4000,
      filterResonance: 4.0,
      attack: 0.005,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      lfoRate: 5.5,
      lfoDepth: 0.6,
      noiseLevel: 0.0,
    },
    
    sulPonticello: {
      name: '🎻 SUL PONTICELLO',
      emoji: '🎻',
      color: '#CD853F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 4800,
      filterResonance: 4.0,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      lfoRate: 5.5,
      lfoDepth: 0.1,
      noiseLevel: 0.0,
    },
    
    sulTasto: {
      name: '🎻 SUL TASTO',
      emoji: '🎻',
      color: '#8B7355',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 2200,
      filterResonance: 4.0,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      lfoRate: 5.5,
      lfoDepth: 0.3,
      noiseLevel: 0.0,
    },
    
    harmonics: {
      name: '🎻 HARMONICS',
      emoji: '🎻',
      color: '#DEB887',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.0,
      osc3Detune: -12,
      filterCutoff: 4400,
      filterResonance: 4.0,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      lfoRate: 5.5,
      lfoDepth: 0.15,
      noiseLevel: 0.0,
    },
    
    spiccato: {
      name: '🎻 SPICCATO',
      emoji: '🎻',
      color: '#BC8F8F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3800,
      filterResonance: 4.0,
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
      lfoRate: 5.5,
      lfoDepth: 0.05,
      noiseLevel: 0.0,
    },
    
    vibratoSoft: {
      name: '🎻 VIBRATO SOFT',
      emoji: '🎻',
      color: '#A0522D',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3400,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.3,
      noiseLevel: 0.0,
    },
    
    vibratoWide: {
      name: '🎻 VIBRATO WIDE',
      emoji: '🎻',
      color: '#8B4513',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3600,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.5,
      noiseLevel: 0.0,
    },
    
    emotional: {
      name: '🎻 EMOTIONAL',
      emoji: '🎻',
      color: '#8B7355',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 3200,
      filterResonance: 4.0,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      lfoRate: 5.5,
      lfoDepth: 0.35,
      noiseLevel: 0.0,
    },
    
    dramatic: {
      name: '🎻 DRAMATIC',
      emoji: '🎻',
      color: '#A0522D',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.002,
      osc3Detune: -12,
      filterCutoff: 4200,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.4,
      noiseLevel: 0.0,
    },
    
    violinSection: {
      name: '🎻 VIOLIN SECTION',
      emoji: '🎻',
      color: '#8B4513',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.008,
      osc3Detune: -12,
      filterCutoff: 3400,
      filterResonance: 4.0,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      lfoRate: 5.5,
      lfoDepth: 0.2,
      noiseLevel: 0.0,
    },
    
    chamberViolins: {
      name: '🎻 CHAMBER VIOLINS',
      emoji: '🎻',
      color: '#A0522D',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.008,
      osc3Detune: -12,
      filterCutoff: 3600,
      filterResonance: 4.0,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.85,
      release: 0.5,
      lfoRate: 5.5,
      lfoDepth: 0.25,
      noiseLevel: 0.0,
    },
    
    synthViolin: {
      name: '🎻 SYNTH VIOLIN',
      emoji: '🎻',
      color: '#BC8F8F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.008,
      osc3Detune: -12,
      filterCutoff: 3000,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.3,
      noiseLevel: 0.0,
    },
    
    electricViolin: {
      name: '🎻 ELECTRIC VIOLIN',
      emoji: '🎻',
      color: '#CD853F',
      category: 'violin',
      osc1Level: 0.5,
      osc2Level: 0.3,
      osc3Level: 0.0,
      osc2Detune: 0.008,
      osc3Detune: -12,
      filterCutoff: 4400,
      filterResonance: 4.0,
      attack: 0.05,
      decay: 0.15,
      sustain: 0.8,
      release: 0.3,
      lfoRate: 5.5,
      lfoDepth: 0.2,
      noiseLevel: 0.0,
    },
  };

  const [selectedPreset, setSelectedPreset] = useState(null);
  
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

  // Load preset parameters
  const loadPreset = (presetKey) => {
    const preset = SYNTH_PRESETS[presetKey];
    if (!preset) return;
    
    console.log(`🎛️ Loading preset: ${preset.name}`);
    setSelectedPreset(presetKey);
    
    // Update all parameters
    setOsc1Level(preset.osc1Level);
    setOsc2Level(preset.osc2Level);
    setOsc3Level(preset.osc3Level);
    setOsc2Detune(preset.osc2Detune);
    setOsc3Detune(preset.osc3Detune);
    setFilterCutoff(preset.filterCutoff);
    setFilterResonance(preset.filterResonance);
    setAttack(preset.attack);
    setDecay(preset.decay);
    setSustain(preset.sustain);
    setRelease(preset.release);
    setLFORate(preset.lfoRate);
    setLFODepth(preset.lfoDepth);
    setNoiseLevel(preset.noiseLevel);
    
    // Update bridge parameters (use correct method names)
    arp2600Bridge.setOsc1Level(preset.osc1Level);
    arp2600Bridge.setOsc2Level(preset.osc2Level);
    arp2600Bridge.setOsc3Level(preset.osc3Level);
    arp2600Bridge.setDetune(preset.osc2Detune); // setDetune is for osc2
    arp2600Bridge.setOsc3Detune(preset.osc3Detune); // setOsc3Detune is for osc3
    arp2600Bridge.setFilterCutoff(preset.filterCutoff);
    arp2600Bridge.setFilterResonance(preset.filterResonance);
    arp2600Bridge.setAttack(preset.attack);
    arp2600Bridge.setDecay(preset.decay);
    arp2600Bridge.setSustain(preset.sustain);
    arp2600Bridge.setRelease(preset.release);
    arp2600Bridge.setLFORate(preset.lfoRate);
    arp2600Bridge.setLFODepth(preset.lfoDepth);
    arp2600Bridge.setNoiseLevel(preset.noiseLevel);
  };

  const playNote = async (note, freq, touchVelocity = null) => {
    // Apply octave shift to frequency
    const shiftedFreq = freq * Math.pow(2, octaveShift);
    const shiftedNote = note.replace(/\d+/, (match) => {
      const noteOctave = parseInt(match);
      return (noteOctave + octaveShift).toString();
    });
    
    setActiveNotes(prev => new Set([...prev, note]));
    
    // Use touch velocity if provided, otherwise use current velocity setting
    const finalVelocity = touchVelocity !== null ? touchVelocity : (velocity / 127);
    
    // Play with velocity and octave shift
    arp2600Bridge.playNote(shiftedNote, { velocity: finalVelocity, duration: 2.0 });
    console.log(`🎹 Playing ARP 2600: ${shiftedNote} @ ${shiftedFreq.toFixed(2)}Hz (velocity: ${(finalVelocity * 127).toFixed(0)})`);
    
    // Trigger bass visualizer for bass/techno presets
    if ((selectedPreset?.category === 'bass' || selectedPreset?.category === 'techno') 
        && visualizerMode === 'bass' && visualizerRef.current) {
      visualizerRef.current.triggerBassNote(shiftedFreq, finalVelocity * 0.8);
    }
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
    let touchStartTimeLocal = null;
    
    const handlePressIn = () => {
      touchStartTimeLocal = Date.now();
      // Start with current velocity, will update on release if quick tap
      playNote(noteData.note, noteData.freq, velocity / 127);
    };
    
    const handlePressOut = () => {
      if (touchStartTimeLocal) {
        // Calculate velocity based on press duration (quick = hard, slow = soft)
        const pressDuration = Date.now() - touchStartTimeLocal;
        let calculatedVelocity = velocity;
        
        // Very quick tap (< 50ms) = maximum velocity (127)
        // Normal press (50-200ms) = current velocity setting
        // Long press (> 200ms) = softer (80% of setting)
        if (pressDuration < 50) {
          calculatedVelocity = 127;
        } else if (pressDuration > 200) {
          calculatedVelocity = Math.max(40, Math.floor(velocity * 0.8));
        }
        
        setVelocity(calculatedVelocity);
        touchStartTimeLocal = null;
      }
      stopNote(noteData.note);
    };
    
    if (noteData.black) {
      return (
        <TouchableOpacity
          style={[styles.blackKey, isActive && styles.blackKeyActive]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.blackKeyLabel}>{noteData.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.whiteKey, isActive && styles.whiteKeyActive]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={styles.whiteKeyLabel}>{noteData.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hidden WebView for audio-engine.html */}
      <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
        <WebView
          ref={(ref) => {
            if (ref && !webAudioBridge.isReady) {
              webAudioBridge.setWebViewRef(ref);
            }
          }}
          source={require('../../assets/audio-engine.html')}
          style={{ width: 1, height: 1 }}
          onMessage={(event) => webAudioBridge.onMessage(event)}
          onLoad={() => webAudioBridge.initAudio()}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
        />
      </View>

      {/* Floating Back Button */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={[styles.floatingBackButton, { top: 50 }]}
      >
        <Text style={styles.floatingBackText}>✕</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ 
          paddingTop: 100,
          paddingBottom: 150,
          flexGrow: 1 
        }}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Preset Library Section */}
        <View style={styles.section}>
          <View style={styles.presetHeader}>
            <Text style={styles.sectionTitle}>🎚️ PRESET LIBRARY</Text>
            <Text style={styles.presetSubtitle}>172 Professional Synth Sounds (Bass • Lead • Pad • Brass • Violin • Techno • FX)</Text>
          </View>
          
          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {['all', 'bass', 'lead', 'pad', 'brass', 'violin', 'techno', 'fx'].map((category) => {
              const count = category === 'all' 
                ? Object.keys(SYNTH_PRESETS).length
                : Object.values(SYNTH_PRESETS).filter(p => p.category === category).length;
              
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.categoryTabActive
                  ]}
                >
                  <Text style={[
                    styles.categoryTabText,
                    selectedCategory === category && styles.categoryTabTextActive
                  ]}>
                    {category.toUpperCase()} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {/* Preset Grid - Filtered by Category */}
          <View style={styles.presetGrid}>
            {Object.entries(SYNTH_PRESETS)
              .filter(([key, preset]) => 
                selectedCategory === 'all' || preset.category === selectedCategory
              )
              .map(([key, preset]) => {
                const isActive = selectedPreset === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.presetCard,
                      isActive && styles.presetCardActive,
                      { borderColor: preset.color },
                    ]}
                    onPress={() => loadPreset(key)}
                  >
                    <LinearGradient
                      colors={isActive ? [preset.color + '40', preset.color + '20'] : ['#1a1a1a', '#0a0a0a']}
                      style={styles.presetGradient}
                    >
                      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                      <Text style={[
                        styles.presetName,
                        isActive && { color: preset.color }
                      ]}>
                        {preset.name.replace(/^[^\s]+\s/, '')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
          </View>
          
          <Text style={styles.sectionInfo}>
            Tap categories to filter • Select any preset for instant professional sound • Acid 303 • Techno Bass • Neuro Wobble & more
          </Text>
        </View>

        {/* Oscillator Section */}
        <View style={styles.section}>
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
          
          {/* Visualizer Mode Toggle */}
          <View style={styles.visualizerToggle}>
            <TouchableOpacity
              onPress={() => setVisualizerMode('oscilloscope')}
              style={[
                styles.visualizerButton,
                visualizerMode === 'oscilloscope' && styles.visualizerButtonActive
              ]}
            >
              <Text style={[
                styles.visualizerButtonText,
                visualizerMode === 'oscilloscope' && styles.visualizerButtonTextActive
              ]}>
                📊 WAVEFORM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVisualizerMode('bass')}
              style={[
                styles.visualizerButton,
                visualizerMode === 'bass' && styles.visualizerButtonActive
              ]}
            >
              <Text style={[
                styles.visualizerButtonText,
                visualizerMode === 'bass' && styles.visualizerButtonTextActive
              ]}>
                🔊 BASS FREQ
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Oscilloscope Waveform Display */}
          {visualizerMode === 'oscilloscope' && (
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
          )}
          
          {/* Bass Frequency Visualizer */}
          {visualizerMode === 'bass' && (
            <View style={styles.bassVisualizerContainer}>
              <Text style={styles.oscilloscopeLabel}>BASS FREQUENCY ANALYZER</Text>
              <Bass2DVisualizer
                ref={visualizerRef}
                isPlaying={activeNotes.size > 0}
                audioEngine="arp2600"
              />
            </View>
          )}
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
          <View style={styles.keyboardHeader}>
            <Text style={styles.sectionTitle}>🎹 KEYBOARD (2 Octaves)</Text>
            <View style={styles.keyboardInfo}>
              <Text style={styles.keyboardInfoText}>
                Octave: {octaveShift >= 0 ? `+${octaveShift}` : octaveShift} • Velocity: {velocity}
              </Text>
            </View>
          </View>
          
          {/* Octave Shift Controls */}
          <View style={styles.octaveControls}>
            <Text style={styles.controlLabel}>OCTAVE SHIFT:</Text>
            <View style={styles.octaveButtons}>
              {[-2, -1, 0, +1, +2].map((shift) => (
                <TouchableOpacity
                  key={shift}
                  onPress={() => setOctaveShift(shift)}
                  style={[
                    styles.octaveButton,
                    octaveShift === shift && styles.octaveButtonActive
                  ]}
                >
                  <Text style={[
                    styles.octaveButtonText,
                    octaveShift === shift && styles.octaveButtonTextActive
                  ]}>
                    {shift >= 0 ? `+${shift}` : shift}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Velocity Control */}
          <View style={styles.velocityControl}>
            <Text style={styles.controlLabel}>VELOCITY: {velocity}</Text>
            <Slider
              style={styles.velocitySlider}
              value={velocity}
              onValueChange={setVelocity}
              minimumValue={1}
              maximumValue={127}
              step={1}
              minimumTrackTintColor={HAOS_COLORS.orange}
              maximumTrackTintColor="#333"
              thumbTintColor={HAOS_COLORS.orange}
            />
            <View style={styles.velocityLabels}>
              <Text style={styles.velocityLabel}>pp (1)</Text>
              <Text style={styles.velocityLabel}>mf (64)</Text>
              <Text style={styles.velocityLabel}>ff (127)</Text>
            </View>
          </View>
          
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
  presetHeader: {
    marginBottom: 16,
  },
  presetSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  presetCard: {
    width: (width - 64) / 2, // 2 columns with gap
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    overflow: 'hidden',
    marginBottom: 12,
  },
  presetCardActive: {
    borderWidth: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  presetGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  presetEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
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
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyboardInfo: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  keyboardInfoText: {
    fontSize: 11,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  octaveControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,217,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.2)',
  },
  controlLabel: {
    fontSize: 12,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  octaveButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  octaveButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  octaveButtonActive: {
    backgroundColor: 'rgba(0,217,255,0.3)',
    borderColor: HAOS_COLORS.cyan,
  },
  octaveButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'bold',
  },
  octaveButtonTextActive: {
    color: HAOS_COLORS.cyan,
  },
  velocityControl: {
    marginBottom: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,107,53,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  velocitySlider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  velocityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  velocityLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
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
  // Visualizer Toggle Styles
  visualizerToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  visualizerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  visualizerButtonActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderColor: HAOS_COLORS.orange,
  },
  visualizerButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
  },
  visualizerButtonTextActive: {
    color: HAOS_COLORS.orange,
  },
  bassVisualizerContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(57,255,20,0.3)',
  },
  // Category Tabs Styles
  categoryTabs: {
    marginVertical: 12,
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderColor: HAOS_COLORS.orange,
  },
  categoryTabText: {
    color: '#999',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  categoryTabTextActive: {
    color: HAOS_COLORS.orange,
  },
});

export default ARP2600Screen;
