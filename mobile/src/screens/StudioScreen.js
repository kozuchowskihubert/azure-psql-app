/**
 * HAOS.fm Unified Studio Screen
 * Combines workspace selection + DAW interface
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, ImageBackground, Modal, Slider } from 'react-native';
import { COLORS, TYPO, SPACING, SHADOW } from '../styles/HAOSDesignSystem';
import technoWorkspace from '../engine/TechnoWorkspace';
import { loadPreset, getPresetInfo } from '../engine/WorkspacePresets';

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
  const [synthCutoff, setSynthCutoff] = useState(1000);
  const [synthResonance, setSynthResonance] = useState(5);
  const [synthAttack, setSynthAttack] = useState(0.01);
  const [synthDecay, setSynthDecay] = useState(0.2);
  const [synthSustain, setSynthSustain] = useState(0.7);
  const [synthRelease, setSynthRelease] = useState(0.3);

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

  const handlePlayPause = () => {
    if (!workspace) return;

    if (isPlaying) {
      workspace.stop();
      setIsPlaying(false);
    } else {
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
        <Text style={styles.selectorTitle}>SELECT STUDIO</Text>
        {isLoadingPreset && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading preset...</Text>
          </View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studioScroll}>
        {STUDIOS.map((ws) => {
          const presetInfo = getPresetInfo(ws.id);
          return (
            <TouchableOpacity
              key={ws.id}
              style={[
                styles.studioCard,
                selectedWorkspace === ws.id && styles.studioCardActive,
                { borderColor: ws.color },
                isLoadingPreset && styles.studioCardDisabled
              ]}
              onPress={() => !isLoadingPreset && handleWorkspaceChange(ws.id)}
              disabled={isLoadingPreset}
            >
              <Text style={styles.studioEmoji}>{ws.emoji}</Text>
              <Text style={[styles.studioName, { color: ws.color }]}>{ws.name}</Text>
              {presetInfo && (
                <Text style={styles.studioBPM}>{presetInfo.bpm} BPM</Text>
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
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  selectorTitle: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    ...TYPO.caption,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
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
});

export default StudioScreen;
