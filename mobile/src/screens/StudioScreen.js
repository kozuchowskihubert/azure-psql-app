/**
 * HAOS.fm Unified Studio Screen
 * Combines workspace selection + DAW interface
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, TYPO, SPACING, SHADOW } from '../styles/HAOSDesignSystem';
import technoWorkspace from '../engine/TechnoWorkspace';
import { loadPreset, getPresetInfo } from '../engine/WorkspacePresets';
import bridge from '../audio/WebAudioBridge';

// Note options for pitch selection
const NOTES = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
                'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
                'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
                'C5', 'C#5', 'D5', 'D#5', 'E5'];

const { width, height } = Dimensions.get('window');

const STUDIOS = [
  { id: 'techno', name: 'TECHNO STUDIO', emoji: '🎹', color: '#00ff94' },      // HAOS Green
  { id: 'hiphop', name: 'HIP-HOP STUDIO', emoji: '🎤', color: '#ff8800' },      // HAOS Orange
  { id: 'house', name: 'HOUSE STUDIO', emoji: '🏠', color: '#00ff94' },         // HAOS Green
  { id: 'ambient', name: 'AMBIENT STUDIO', emoji: '🌊', color: '#ff8800' },     // HAOS Orange
  { id: 'lofi', name: 'LO-FI STUDIO', emoji: '☕', color: '#00ff94' },          // HAOS Green
];

// Bass Presets - Different vibes for bass synthesis
const BASS_PRESETS = [
  {
    id: 'acid',
    name: 'ACID 303',
    emoji: '🔊',
    color: '#00ff94',
    description: 'TB-303 style squelch',
    params: {
      slide: 0.08,
      pitchBend: 0,
      vibrato: 0.3,
      subOsc: 0,
      octaves: 1,
    },
  },
  {
    id: 'sub',
    name: 'SUB BASS',
    emoji: '💥',
    color: '#ff00ff',
    description: 'Deep sub-bass rumble',
    params: {
      slide: 0,
      pitchBend: 0,
      vibrato: 0,
      subOsc: 0.8,
      octaves: 2,
    },
  },
  {
    id: 'wobble',
    name: 'WOBBLE',
    emoji: '🌊',
    color: '#00ffff',
    description: 'Dubstep LFO wobble',
    params: {
      slide: 0,
      pitchBend: -5,
      vibrato: 0.8,
      subOsc: 0.6,
      octaves: 1,
    },
  },
  {
    id: '808',
    name: 'TR-808',
    emoji: '🥁',
    color: '#ff8800',
    description: 'Classic 808 boom',
    params: {
      slide: 0.02,
      pitchBend: -12,
      vibrato: 0,
      subOsc: 0.9,
      octaves: 1,
    },
  },
  {
    id: 'reese',
    name: 'REESE',
    emoji: '🎸',
    color: '#9370DB',
    description: 'Detuned saw stack',
    params: {
      slide: 0.15,
      pitchBend: 2,
      vibrato: 0.15,
      subOsc: 0.3,
      octaves: 3,
    },
  },
  {
    id: 'pluck',
    name: 'PLUCK',
    emoji: '🎹',
    color: '#FFD700',
    description: 'Short percussive bass',
    params: {
      slide: 0,
      pitchBend: 5,
      vibrato: 0.05,
      subOsc: 0,
      octaves: 1,
    },
  },
];

// Synth Presets - For ARP 2600, Juno-106, Minimoog, etc.
const SYNTH_PRESETS = [
  {
    id: 'arp_lead',
    name: 'ARP LEAD',
    emoji: '🎹',
    color: '#00ff94',
    synth: 'ARP 2600',
    description: 'Bright analog lead',
    params: {
      cutoff: 2500,
      resonance: 7,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.5,
    },
  },
  {
    id: 'arp_bass',
    name: 'ARP BASS',
    emoji: '🎛️',
    color: '#00ff94',
    synth: 'ARP 2600',
    description: 'Fat modular bass',
    params: {
      cutoff: 800,
      resonance: 12,
      attack: 0.001,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },
  {
    id: 'juno_pad',
    name: 'JUNO PAD',
    emoji: '🎼',
    color: '#00ff94',
    synth: 'Juno-106',
    description: 'Warm chorus pad',
    params: {
      cutoff: 3000,
      resonance: 3,
      attack: 0.8,
      decay: 0.5,
      sustain: 0.7,
      release: 2.0,
    },
  },
  {
    id: 'juno_string',
    name: 'JUNO STRING',
    emoji: '🎻',
    color: '#00ff94',
    synth: 'Juno-106',
    description: 'Lush string ensemble',
    params: {
      cutoff: 2000,
      resonance: 2,
      attack: 0.4,
      decay: 0.3,
      sustain: 0.9,
      release: 1.5,
    },
  },
  {
    id: 'moog_bass',
    name: 'MOOG BASS',
    emoji: '💥',
    color: '#00ff94',
    synth: 'Minimoog',
    description: 'Legendary fat bass',
    params: {
      cutoff: 600,
      resonance: 10,
      attack: 0.001,
      decay: 0.15,
      sustain: 0.7,
      release: 0.3,
    },
  },
  {
    id: 'moog_lead',
    name: 'MOOG LEAD',
    emoji: '🎸',
    color: '#00ff94',
    synth: 'Minimoog',
    description: 'Screaming solo lead',
    params: {
      cutoff: 4000,
      resonance: 8,
      attack: 0.01,
      decay: 0.4,
      sustain: 0.5,
      release: 0.6,
    },
  },
  {
    id: 'dx7_bell',
    name: 'DX7 BELL',
    emoji: '🔔',
    color: '#00ff94',
    synth: 'DX7',
    description: 'FM electric piano',
    params: {
      cutoff: 5000,
      resonance: 1,
      attack: 0.001,
      decay: 1.2,
      sustain: 0.3,
      release: 0.8,
    },
  },
  {
    id: 'dx7_brass',
    name: 'DX7 BRASS',
    emoji: '🎺',
    color: '#00ff94',
    synth: 'DX7',
    description: 'FM brass stab',
    params: {
      cutoff: 3500,
      resonance: 4,
      attack: 0.02,
      decay: 0.2,
      sustain: 0.8,
      release: 0.4,
    },
  },
  {
    id: 'ms20_acid',
    name: 'MS-20 ACID',
    emoji: '🔊',
    color: '#00ff94',
    synth: 'MS-20',
    description: 'Squelchy filter sweep',
    params: {
      cutoff: 1500,
      resonance: 15,
      attack: 0.001,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
    },
  },
  {
    id: 'ms20_bass',
    name: 'MS-20 BASS',
    emoji: '💣',
    color: '#00ff94',
    synth: 'MS-20',
    description: 'Aggressive bass',
    params: {
      cutoff: 700,
      resonance: 12,
      attack: 0.001,
      decay: 0.1,
      sustain: 0.8,
      release: 0.2,
    },
  },
  {
    id: 'prophet_lead',
    name: 'PROPHET LEAD',
    emoji: '✨',
    color: '#00ff94',
    synth: 'Prophet-5',
    description: 'Vintage poly lead',
    params: {
      cutoff: 3000,
      resonance: 6,
      attack: 0.01,
      decay: 0.3,
      sustain: 0.6,
      release: 0.7,
    },
  },
  {
    id: 'prophet_bass',
    name: 'PROPHET BASS',
    emoji: '🎚️',
    color: '#00ff94',
    synth: 'Prophet-5',
    description: 'Thick poly bass',
    params: {
      cutoff: 800,
      resonance: 9,
      attack: 0.001,
      decay: 0.2,
      sustain: 0.7,
      release: 0.4,
    },
  },
];

const StudioScreen = ({ navigation, route }) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState('techno');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [workspace, setWorkspace] = useState(technoWorkspace);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false);
  
  // Note picker state
  const [showNotePicker, setShowNotePicker] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null); // { track, stepIndex }
  const [selectedNote, setSelectedNote] = useState('C3');
  
  // Synth parameter controls - start expanded if coming from Home
  const [showSynthControls, setShowSynthControls] = useState(!!route?.params?.synthType);
  const [selectedSynthPreset, setSelectedSynthPreset] = useState('arp_lead');
  const [synthCutoff, setSynthCutoff] = useState(1000);
  const [synthResonance, setSynthResonance] = useState(5);
  const [synthAttack, setSynthAttack] = useState(0.01);
  const [synthDecay, setSynthDecay] = useState(0.2);
  const [synthSustain, setSynthSustain] = useState(0.7);
  const [synthRelease, setSynthRelease] = useState(0.3);
  
  // Bass modulation controls
  const [showBassControls, setShowBassControls] = useState(false);
  const [selectedBassPreset, setSelectedBassPreset] = useState('acid');
  const [bassSlide, setBassSlide] = useState(0.08);
  const [bassPitchBend, setBassPitchBend] = useState(0);
  const [bassVibrato, setBassVibrato] = useState(0.3);
  const [bassSubOsc, setBassSubOsc] = useState(0);
  const [bassOctaves, setBassOctaves] = useState(1);

  useEffect(() => {
    const initializeWorkspace = async () => {
      console.log('🎛️ Initializing Studio Screen...');
      
      // Workspace is already a singleton, no need to instantiate
      // Just ensure it's initialized
      if (technoWorkspace && !technoWorkspace.isInitialized) {
        console.log('⏳ Workspace not initialized, initializing now...');
        await technoWorkspace.init();
      } else {
        console.log('✅ Workspace already initialized');
      }
      
      // Load preset based on synthType from route params or default to techno
      const synthType = route?.params?.synthType;
      let presetName = 'techno';
      
      if (synthType === 'juno106') {
        presetName = 'hiphop'; // Juno-106 is used in Hip-Hop preset
      } else if (synthType === 'minimoog') {
        presetName = 'house'; // Minimoog is used in House preset
      }
      
      console.log(`🎵 Loading ${presetName.toUpperCase()} preset for ${synthType || 'ARP 2600'}...`);
      const success = loadPreset(technoWorkspace, presetName);
      
      if (success) {
        console.log('✅ Preset loaded successfully');
        setSelectedWorkspace(presetName);
        const presetInfo = getPresetInfo(presetName);
        if (presetInfo) {
          setBpm(presetInfo.bpm);
          console.log(`🎵 BPM set to ${presetInfo.bpm}`);
        }
      } else {
        console.error('❌ Failed to load initial preset');
      }
    };

    initializeWorkspace();

    return () => {
      if (technoWorkspace) {
        console.log('🛑 Stopping workspace on unmount');
        technoWorkspace.stop();
      }
    };
  }, [route?.params?.synthType]);

  // Bass preset loading from BassSelectorScreen
  useEffect(() => {
    const preset = route?.params?.preset;
    const presetName = route?.params?.presetName;
    
    if (preset && presetName) {
      console.log(`🎸 Loading bass preset: ${presetName}`);
      console.log('Preset values:', preset);
      
      // Apply preset values with small delay for smooth transition
      setTimeout(() => {
        setBassSlide(preset.slide || 0.08);
        setBassPitchBend(preset.pitchBend || 0);
        setBassVibrato(preset.vibrato || 0.3);
        setBassSubOsc(preset.subOsc || 0);
        setBassOctaves(preset.octaves || 1);
        setSelectedBassPreset(presetName.toLowerCase().replace(' bass', ''));
        setShowBassControls(true); // Auto-expand bass controls
        console.log(`✅ Bass preset "${presetName}" loaded successfully`);
      }, 100);
    }
  }, [route?.params?.preset, route?.params?.presetName]);

  const handlePlayPause = () => {
    if (!workspace) return;

    if (isPlaying) {
      workspace.stop();
      setIsPlaying(false);
    } else {
      // Resume audio context before playing (critical for iOS)
      // MUST happen synchronously within user gesture handler
      if (workspace.webAudioBridge) {
        console.log('🔊 Resuming audio before play...');
        workspace.webAudioBridge.sendMessage({ type: 'resume' });
      }
      
      // Start playing immediately (audio context will resume from the message above)
      workspace.play();
      setIsPlaying(true);
    }
  };

  const handleWorkspaceChange = async (workspaceId) => {
    setIsLoadingPreset(true);
    
    try {
      // Stop current workspace
      if (workspace) {
        workspace.stop();
        setIsPlaying(false);
      }
      
      // Load preset for selected workspace
      const success = loadPreset(workspace, workspaceId);
      
      if (success) {
        setSelectedWorkspace(workspaceId);
        
        // Update BPM in UI
        const presetInfo = getPresetInfo(workspaceId);
        if (presetInfo) {
          setBpm(presetInfo.bpm);
        }
        
        console.log(`✅ Switched to ${workspaceId.toUpperCase()} workspace`);
      } else {
        console.warn(`⚠️ Failed to load ${workspaceId} preset`);
      }
    } catch (error) {
      console.error('Error changing workspace:', error);
    } finally {
      setIsLoadingPreset(false);
    }
  };

  const renderStudioSelector = () => (
    <View style={styles.studioSelector}>
      <View style={styles.selectorHeader}>
        <Text style={styles.selectorTitle}>🎛️ STUDIO PRESETS</Text>
        <Text style={styles.selectorSubtitle}>Tap to load different genre setups</Text>
      </View>
      
      {isLoadingPreset && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>⚡ Loading preset...</Text>
          <Text style={styles.loadingSubtext}>Configuring synths & patterns</Text>
        </View>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studioScroll}>
        {STUDIOS.map((ws) => {
          const presetInfo = getPresetInfo(ws.id);
          const isActive = selectedWorkspace === ws.id;
          return (
            <TouchableOpacity
              key={ws.id}
              style={[
                styles.studioCard,
                isActive && styles.studioCardActive,
                { borderColor: ws.color },
                isLoadingPreset && styles.studioCardDisabled
              ]}
              onPress={() => !isLoadingPreset && handleWorkspaceChange(ws.id)}
              disabled={isLoadingPreset}
            >
              <Text style={styles.studioEmoji}>{ws.emoji}</Text>
              <Text style={[styles.studioName, { color: ws.color }]}>{ws.name}</Text>
              {presetInfo && (
                <>
                  <Text style={styles.studioBPM}>{presetInfo.bpm} BPM</Text>
                  <View style={styles.presetBadge}>
                    <Text style={styles.presetBadgeText}>
                      {presetInfo.synth || 'ARP 2600'}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: ws.color }]}>
                      <Text style={styles.activeIndicatorText}>● ACTIVE</Text>
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderTransportControls = () => (
    <View style={styles.transportBar}>
      <TouchableOpacity style={styles.transportButton} onPress={handlePlayPause}>
        <Text style={styles.transportIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.transportButton} onPress={() => workspace?.stop()}>
        <Text style={styles.transportIcon}>⏹️</Text>
      </TouchableOpacity>

      <View style={styles.bpmContainer}>
        <Text style={styles.bpmLabel}>BPM</Text>
        <Text style={styles.bpmValue}>{bpm}</Text>
      </View>

      <TouchableOpacity 
        style={styles.effectsButton}
        onPress={() => navigation.navigate('Effects')}
      >
        <Text style={styles.effectsIcon}>🎛️</Text>
        <Text style={styles.effectsLabel}>Effects</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSequencer = () => {
    const tracks = ['kick', 'snare', 'hihat', 'clap', 'bass', 'synth'];
    const trackLabels = ['KICK', 'SNARE', 'HIHAT', 'CLAP', 'BASS', 'SYNTH'];
    const steps = 16;

    return (
      <View style={styles.sequencer}>
        <Text style={styles.sequencerTitle}>SEQUENCER</Text>
        {tracks.map((track, trackIndex) => (
          <View key={track} style={styles.sequencerRow}>
            <Text style={styles.trackLabel}>{trackLabels[trackIndex]}</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.stepsScrollView}
            >
              <View style={styles.stepsContainer}>
                {[...Array(steps)].map((_, stepIndex) => {
                  // Get step state from workspace
                  const stepState = workspace?.getStep(track, stepIndex);
                  const isActive = stepState?.active || false;
                  const stepNote = stepState?.note;
                  const canEditNote = (track === 'bass' || track === 'synth') && isActive;
                  
                  return (
                    <TouchableOpacity
                      key={stepIndex}
                      style={[
                        styles.stepButton,
                        stepIndex % 4 === 0 && styles.stepButtonAccent,
                      ]}
                      onPress={() => {
                        if (workspace) {
                          workspace.toggleStep(track, stepIndex);
                          console.log(`Toggle ${track.toUpperCase()} step ${stepIndex}`);
                          // Force re-render
                          setBpm(workspace.getBPM());
                        }
                      }}
                      onLongPress={() => {
                        if (canEditNote) {
                          setSelectedStep({ track, stepIndex });
                          setSelectedNote(stepNote || 'C3');
                          setShowNotePicker(true);
                          console.log(`📝 Edit note for ${track} step ${stepIndex}: ${stepNote}`);
                        }
                      }}
                      delayLongPress={300}
                    >
                      <View style={[
                        styles.stepInner,
                        isActive && styles.stepInnerActive
                      ]}>
                        {canEditNote && stepNote && (
                          <Text style={styles.stepNoteLabel}>{stepNote}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  const renderMixer = () => {
    const tracks = [
      { name: 'KICK', emoji: '🥁', level: 1.0 },
      { name: 'SNARE', emoji: '🎤', level: 0.8 },
      { name: 'HIHAT', emoji: '🔔', level: 0.6 },
      { name: 'CLAP', emoji: '👏', level: 0.7 },
      { name: 'BASS', emoji: '🎸', level: 0.9 },
      { name: 'SYNTH', emoji: '🎹', level: 0.8 },
    ];

    return (
      <View style={styles.mixer}>
        <Text style={styles.mixerTitle}>MIXER</Text>
        <View style={styles.mixerChannels}>
          {tracks.map((track) => (
            <View key={track.name} style={styles.mixerChannel}>
              <Text style={styles.channelEmoji}>{track.emoji}</Text>
              <View style={styles.fader}>
                <View style={[styles.faderFill, { height: `${track.level * 100}%` }]} />
              </View>
              <Text style={styles.channelLabel}>{track.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSynthControls = () => {
    const updateSynthParam = (param, value) => {
      const activeSynth = workspace?.getActiveSynth();
      if (!activeSynth) return;

      switch(param) {
        case 'cutoff':
          setSynthCutoff(value);
          if (activeSynth.setCutoff) activeSynth.setCutoff(value);
          break;
        case 'resonance':
          setSynthResonance(value);
          if (activeSynth.setResonance) activeSynth.setResonance(value);
          break;
        case 'attack':
          setSynthAttack(value);
          if (activeSynth.setEnvelope) {
            activeSynth.setEnvelope(value, synthDecay, synthSustain, synthRelease);
          }
          break;
        case 'decay':
          setSynthDecay(value);
          if (activeSynth.setEnvelope) {
            activeSynth.setEnvelope(synthAttack, value, synthSustain, synthRelease);
          }
          break;
        case 'sustain':
          setSynthSustain(value);
          if (activeSynth.setEnvelope) {
            activeSynth.setEnvelope(synthAttack, synthDecay, value, synthRelease);
          }
          break;
        case 'release':
          setSynthRelease(value);
          if (activeSynth.setEnvelope) {
            activeSynth.setEnvelope(synthAttack, synthDecay, synthSustain, value);
          }
          break;
      }
    };

    const getSynthName = () => {
      const presetInfo = getPresetInfo(selectedWorkspace);
      return presetInfo?.synth || 'ARP 2600';
    };

    return (
      <View style={styles.synthControls}>
        <TouchableOpacity 
          style={styles.synthControlsHeader}
          onPress={() => setShowSynthControls(!showSynthControls)}
        >
          <Text style={styles.synthControlsTitle}>
            🎛️ SYNTH CONTROLS - {getSynthName()}
          </Text>
          <Text style={styles.synthControlsToggle}>
            {showSynthControls ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {showSynthControls && (
          <View style={styles.synthControlsContent}>
            {/* Synth Presets */}
            <View style={styles.presetSection}>
              <Text style={styles.bassPresetTitle}>🎹 SYNTH PRESETS</Text>
              <Text style={styles.bassPresetSubtitle}>Classic synth sounds from legendary machines</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.bassPresetScroll}
              >
                {SYNTH_PRESETS.map((preset) => {
                  const isActive = selectedSynthPreset === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.bassPresetCard,
                        isActive && styles.bassPresetCardActive,
                        { borderColor: preset.color }
                      ]}
                      onPress={() => {
                        setSelectedSynthPreset(preset.id);
                        // Apply preset values
                        setSynthCutoff(preset.params.cutoff);
                        setSynthResonance(preset.params.resonance);
                        setSynthAttack(preset.params.attack);
                        setSynthDecay(preset.params.decay);
                        setSynthSustain(preset.params.sustain);
                        setSynthRelease(preset.params.release);
                      }}
                    >
                      <Text style={styles.bassPresetEmoji}>{preset.emoji}</Text>
                      <Text style={[styles.bassPresetName, { color: preset.color }]}>
                        {preset.name}
                      </Text>
                      <Text style={styles.bassPresetDesc}>{preset.synth}</Text>
                      <Text style={styles.bassPresetDesc}>{preset.description}</Text>
                      {isActive && (
                        <View style={[styles.bassPresetActive, { backgroundColor: preset.color }]}>
                          <Text style={styles.bassPresetActiveText}>● ACTIVE</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Filter Section */}
            <View style={styles.controlSection}>
              <Text style={styles.controlSectionTitle}>FILTER</Text>
              
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Cutoff: {Math.round(synthCutoff)} Hz
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={10000}
                  value={synthCutoff}
                  onValueChange={(value) => updateSynthParam('cutoff', value)}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.primary}
                />
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Resonance: {synthResonance.toFixed(1)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={20}
                  value={synthResonance}
                  onValueChange={(value) => updateSynthParam('resonance', value)}
                  minimumTrackTintColor={COLORS.primary}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.primary}
                />
              </View>
            </View>

            {/* Envelope Section */}
            <View style={styles.controlSection}>
              <Text style={styles.controlSectionTitle}>ENVELOPE (ADSR)</Text>
              
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Attack: {(synthAttack * 1000).toFixed(0)} ms
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.001}
                  maximumValue={2}
                  value={synthAttack}
                  onValueChange={(value) => updateSynthParam('attack', value)}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.accent}
                />
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Decay: {(synthDecay * 1000).toFixed(0)} ms
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.01}
                  maximumValue={2}
                  value={synthDecay}
                  onValueChange={(value) => updateSynthParam('decay', value)}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.accent}
                />
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Sustain: {(synthSustain * 100).toFixed(0)}%
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={synthSustain}
                  onValueChange={(value) => updateSynthParam('sustain', value)}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.accent}
                />
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>
                  Release: {(synthRelease * 1000).toFixed(0)} ms
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.01}
                  maximumValue={5}
                  value={synthRelease}
                  onValueChange={(value) => updateSynthParam('release', value)}
                  minimumTrackTintColor={COLORS.accent}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={COLORS.accent}
                />
              </View>
            </View>

            {/* Bass Modulation Section */}
            <View style={styles.controlSection}>
              <TouchableOpacity 
                style={styles.bassModHeader}
                onPress={() => setShowBassControls(!showBassControls)}
              >
                <View style={styles.bassHeaderContent}>
                  <Text style={styles.controlSectionTitle}>
                    🎸 BASS MODULATION
                  </Text>
                  {route?.params?.presetName && (
                    <View style={styles.loadedPresetBadge}>
                      <Text style={styles.loadedPresetText}>
                        ✨ {route.params.presetName}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.bassModToggle}>
                  {showBassControls ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {showBassControls && (
                <View style={styles.bassModContent}>
                  {/* Bass Preset Selector */}
                  <View style={styles.bassPresetSection}>
                    <Text style={styles.bassPresetTitle}>🎛️ BASS PRESETS</Text>
                    <Text style={styles.bassPresetSubtitle}>Tap to load different bass vibes</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.bassPresetScroll}
                    >
                      {BASS_PRESETS.map((preset) => {
                        const isActive = selectedBassPreset === preset.id;
                        return (
                          <TouchableOpacity
                            key={preset.id}
                            style={[
                              styles.bassPresetCard,
                              isActive && styles.bassPresetCardActive,
                              { borderColor: preset.color }
                            ]}
                            onPress={() => {
                              setSelectedBassPreset(preset.id);
                              // Apply preset values
                              setBassSlide(preset.params.slide);
                              setBassPitchBend(preset.params.pitchBend);
                              setBassVibrato(preset.params.vibrato);
                              setBassSubOsc(preset.params.subOsc);
                              setBassOctaves(preset.params.octaves);
                            }}
                          >
                            <Text style={styles.bassPresetEmoji}>{preset.emoji}</Text>
                            <Text style={[styles.bassPresetName, { color: preset.color }]}>
                              {preset.name}
                            </Text>
                            <Text style={styles.bassPresetDesc}>{preset.description}</Text>
                            {isActive && (
                              <View style={[styles.bassPresetActive, { backgroundColor: preset.color }]}>
                                <Text style={styles.bassPresetActiveText}>● ACTIVE</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Slide/Portamento */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Slide: {(bassSlide * 1000).toFixed(0)} ms
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={bassSlide}
                      onValueChange={setBassSlide}
                      minimumTrackTintColor="#00ff94"
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor="#00ff94"
                    />
                  </View>

                  {/* Pitch Bend */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Pitch Bend: {bassPitchBend > 0 ? '+' : ''}{bassPitchBend} semitones
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={-12}
                      maximumValue={12}
                      value={bassPitchBend}
                      onValueChange={setBassPitchBend}
                      minimumTrackTintColor="#ff00ff"
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor="#ff00ff"
                    />
                  </View>

                  {/* Vibrato */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Vibrato: {(bassVibrato * 100).toFixed(0)}%
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={bassVibrato}
                      onValueChange={setBassVibrato}
                      minimumTrackTintColor="#00ffff"
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor="#00ffff"
                    />
                  </View>

                  {/* Sub-Oscillator */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Sub-Osc: {(bassSubOsc * 100).toFixed(0)}%
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={bassSubOsc}
                      onValueChange={setBassSubOsc}
                      minimumTrackTintColor="#ff8800"
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor="#ff8800"
                    />
                  </View>

                  {/* Octave Stacking */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>
                      Octave Stack: {Math.round(bassOctaves)} octave{Math.round(bassOctaves) > 1 ? 's' : ''}
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={3}
                      step={1}
                      value={bassOctaves}
                      onValueChange={setBassOctaves}
                      minimumTrackTintColor="#00ff94"
                      maximumTrackTintColor={COLORS.border}
                      thumbTintColor="#00ff94"
                    />
                  </View>

                  {/* Test Buttons */}
                  <View style={styles.bassTestButtons}>
                    <TouchableOpacity
                      style={[styles.bassTestButton, styles.bassTestAcid]}
                      onPress={() => {
                        bridge.playBassSlide('C2', {
                          velocity: 0.8,
                          accent: true,
                          duration: 0.25,
                          slide: bassSlide,
                          pitchBend: bassPitchBend,
                          vibrato: bassVibrato,
                          subOsc: bassSubOsc > 0.5
                        });
                      }}
                    >
                      <Text style={styles.bassTestButtonText}>🔊 Test Slide</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.bassTestButton, styles.bassTestStack]}
                      onPress={() => {
                        bridge.playBassStack('C1', {
                          velocity: 0.9,
                          accent: true,
                          duration: 1.0,
                          octaves: Math.round(bassOctaves)
                        });
                      }}
                    >
                      <Text style={styles.bassTestButtonText}>💥 Test Stack</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.bassTestButton, styles.bassTestWobble]}
                      onPress={() => {
                        bridge.playBassSlide('E1', {
                          velocity: 0.95,
                          accent: true,
                          duration: 1.5,
                          slide: 0,
                          pitchBend: bassPitchBend,
                          vibrato: bassVibrato,
                          subOsc: bassSubOsc > 0.5
                        });
                      }}
                    >
                      <Text style={styles.bassTestButtonText}>🌊 Test Wobble</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.bassModHint}>
                    💡 Adjust sliders above, then press Test buttons to hear changes instantly!
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/thumb-1920-953506.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dark overlay for better contrast */}
      <View style={styles.overlay} />
      
      {/* Studio Selector */}
      {renderStudioSelector()}

      {/* Main Studio Area */}
      <ScrollView style={styles.studioArea} showsVerticalScrollIndicator={false}>
        {/* Sequencer */}
        {renderSequencer()}

        {/* Synth Controls */}
        {renderSynthControls()}

        {/* Mixer */}
        {renderMixer()}
      </ScrollView>

      {/* Transport Controls (Fixed at bottom) */}
      {renderTransportControls()}
      
      {/* Note Picker Modal */}
      <Modal
        visible={showNotePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotePicker(false)}
        >
          <View style={styles.notePickerContainer}>
            <Text style={styles.notePickerTitle}>
              Select Note for {selectedStep?.track.toUpperCase()} Step {selectedStep?.stepIndex + 1}
            </Text>
            <ScrollView style={styles.notePickerScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.noteGrid}>
                {NOTES.map((note) => (
                  <TouchableOpacity
                    key={note}
                    style={[
                      styles.noteButton,
                      note === selectedNote && styles.noteButtonSelected
                    ]}
                    onPress={() => {
                      setSelectedNote(note);
                      if (workspace && selectedStep) {
                        // Update the note in the workspace
                        workspace.setStepNote(selectedStep.track, selectedStep.stepIndex, note);
                        console.log(`✅ Set ${selectedStep.track} step ${selectedStep.stepIndex} to ${note}`);
                        setBpm(workspace.getBPM()); // Force re-render
                      }
                      setShowNotePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.noteButtonText,
                      note === selectedNote && styles.noteButtonTextSelected
                    ]}>
                      {note}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  studioSelector: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 255, 148, 0.3)',
    shadowColor: '#00ff94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  selectorHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  selectorTitle: {
    ...TYPO.h3,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  selectorSubtitle: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.xs,
  },
  loadingText: {
    ...TYPO.body,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingSubtext: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  studioScroll: {
    paddingHorizontal: SPACING.md,
  },
  studioCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: COLORS.background,
    minWidth: 100,
  },
  studioCardActive: {
    backgroundColor: COLORS.surface,
    ...SHADOW.medium,
  },
  studioCardDisabled: {
    opacity: 0.5,
  },
  studioEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  studioName: {
    ...TYPO.body,
    fontWeight: 'bold',
  },
  studioBPM: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  presetBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.3)',
  },
  presetBadgeText: {
    ...TYPO.caption,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  activeIndicatorText: {
    ...TYPO.caption,
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  studioArea: {
    flex: 1,
  },
  sequencer: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  sequencerTitle: {
    ...TYPO.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sequencerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trackLabel: {
    ...TYPO.body,
    color: COLORS.textPrimary,
    width: 60,
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepsScrollView: {
    flex: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    paddingRight: SPACING.md,
  },
  stepButton: {
    width: 32,
    height: 32,
    margin: 3,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonAccent: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  stepInner: {
    width: 24,
    height: 24,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  stepInnerActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  mixer: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 136, 0, 0.2)',
  },
  mixerTitle: {
    ...TYPO.h3,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  mixerChannels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mixerChannel: {
    alignItems: 'center',
  },
  channelEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  fader: {
    width: 40,
    height: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    justifyContent: 'flex-end',
  },
  faderFill: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  channelLabel: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    fontSize: 9,
  },
  transportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    ...SHADOW.medium,
  },
  transportButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.medium,
  },
  transportIcon: {
    fontSize: 24,
  },
  bpmContainer: {
    alignItems: 'center',
  },
  bpmLabel: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
  },
  bpmValue: {
    ...TYPO.h2,
    color: COLORS.primary,
  },
  effectsButton: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  effectsIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  effectsLabel: {
    ...TYPO.caption,
    color: COLORS.textPrimary,
  },
  stepNoteLabel: {
    fontSize: 8,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Note Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notePickerContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOW.large,
  },
  notePickerTitle: {
    ...TYPO.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  notePickerScroll: {
    maxHeight: height * 0.5,
  },
  noteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noteButton: {
    width: '22%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noteButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOW.medium,
  },
  noteButtonText: {
    ...TYPO.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  noteButtonTextSelected: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  // Synth Controls Styles
  synthControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: SPACING.md,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 136, 0, 0.3)',
    overflow: 'hidden',
  },
  synthControlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
  },
  synthControlsTitle: {
    ...TYPO.h3,
    color: COLORS.accent,
    fontSize: 16,
  },
  synthControlsToggle: {
    ...TYPO.h2,
    color: COLORS.accent,
  },
  synthControlsContent: {
    padding: SPACING.md,
  },
  controlSection: {
    marginBottom: SPACING.lg,
  },
  controlSectionTitle: {
    ...TYPO.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
  },
  controlRow: {
    marginBottom: SPACING.md,
  },
  controlLabel: {
    ...TYPO.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  // Bass Modulation Styles
  bassModHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  bassHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadedPresetBadge: {
    backgroundColor: 'rgba(255, 20, 147, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF1493',
  },
  loadedPresetText: {
    ...TYPO.caption,
    color: '#FF1493',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bassModToggle: {
    ...TYPO.body,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bassModContent: {
    marginTop: SPACING.sm,
  },
  bassTestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  bassTestButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bassTestAcid: {
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
    borderColor: '#00ff94',
    shadowColor: '#00ff94',
  },
  bassTestStack: {
    backgroundColor: 'rgba(255, 0, 255, 0.15)',
    borderColor: '#ff00ff',
    shadowColor: '#ff00ff',
  },
  bassTestWobble: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
  },
  bassTestButtonText: {
    ...TYPO.body,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
  },
  bassModHint: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  // Bass Preset Styles
  bassPresetSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 148, 0.2)',
  },
  bassPresetTitle: {
    ...TYPO.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bassPresetSubtitle: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  bassPresetScroll: {
    marginTop: SPACING.sm,
  },
  bassPresetCard: {
    width: 110,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bassPresetCardActive: {
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  bassPresetEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  bassPresetName: {
    ...TYPO.body,
    fontWeight: 'bold',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bassPresetDesc: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
  },
  bassPresetActive: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bassPresetActiveText: {
    ...TYPO.caption,
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default StudioScreen;
