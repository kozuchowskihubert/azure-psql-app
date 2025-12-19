/**
 * HAOS.fm Synth Screen
 * Classic synthesizer library and control
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, TYPO, SPACING, SHADOW } from '../styles/HAOSDesignSystem';
import bridge from '../audio/WebAudioBridge';

const SYNTHESIZERS = [
  {
    id: 'tb303',
    name: 'Roland TB-303',
    year: '1981',
    type: 'Bass Synthesizer',
    emoji: '🎛️',
    color: '#00ff94', // HAOS Green
    description: 'Legendary acid bass machine',
    params: ['Cutoff', 'Resonance', 'Env Mod', 'Decay', 'Accent', 'Waveform'],
  },
  {
    id: 'tr808',
    name: 'Roland TR-808',
    year: '1980',
    type: 'Drum Machine',
    emoji: '🥁',
    color: '#ff8800', // HAOS Orange
    description: 'Iconic analog drum sounds',
    params: ['Kick Pitch', 'Kick Decay', 'Snare Tone', 'Snare Noise', 'Hihat Decay'],
  },
  {
    id: 'tr909',
    name: 'Roland TR-909',
    year: '1983',
    type: 'Drum Machine',
    emoji: '🎵',
    color: '#ff8800', // HAOS Orange
    description: 'Classic house & techno drums',
    params: ['Kick Tune', 'Snare Snap', 'Hihat Level', 'Cymbal Decay'],
  },
  {
    id: 'arp2600',
    name: 'ARP 2600',
    year: '1971',
    type: 'Semi-modular Synth',
    emoji: '🎹',
    color: '#00ff94', // HAOS Green
    description: 'Versatile semi-modular powerhouse',
    params: ['Osc 1', 'Osc 2', 'Detune', 'Filter', 'Resonance', 'ADSR'],
  },
  {
    id: 'juno106',
    name: 'Roland Juno-106',
    year: '1984',
    type: 'Polyphonic Synth',
    emoji: '🌟',
    color: '#00ff94', // HAOS Green
    description: 'Lush chorus pads & leads',
    params: ['PWM', 'PWM Rate', 'Chorus', 'Filter', 'Resonance', 'ADSR'],
  },
  {
    id: 'minimoog',
    name: 'Moog Minimoog',
    year: '1970',
    type: 'Monophonic Synth',
    emoji: '🎺',
    color: '#00ff94', // HAOS Green
    description: 'Fat analog bass & leads',
    params: ['Osc 1', 'Osc 2', 'Osc 3', 'Mix', 'Filter', 'Resonance', 'ADSR'],
  },
  {
    id: 'dx7',
    name: 'Yamaha DX7',
    year: '1983',
    type: 'FM Synthesizer',
    emoji: '💎',
    color: '#ff8800', // HAOS Orange
    description: 'Digital FM synthesis pioneer',
    params: ['Algorithm', 'Op 1-4', 'Mod Index', 'ADSR'],
  },
  {
    id: 'ms20',
    name: 'Korg MS-20',
    year: '1978',
    type: 'Semi-modular Synth',
    emoji: '⚡',
    color: '#00ff94', // HAOS Green
    description: 'Aggressive filter & modulation',
    params: ['Osc 1', 'Osc 2', 'HPF', 'LPF', 'Resonance', 'Patch'],
  },
  {
    id: 'prophet5',
    name: 'Prophet-5',
    year: '1978',
    type: 'Polyphonic Synth',
    emoji: '👑',
    color: '#ff8800', // HAOS Orange
    description: '5-voice polysynth legend',
    params: ['Osc 1', 'Osc 2', 'Mix', 'Filter', 'Poly Mode', 'ADSR'],
  },
];

const SynthScreen = ({ navigation }) => {
  const [selectedSynth, setSelectedSynth] = useState('tb303');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSynthSelect = (synthId) => {
    setSelectedSynth(synthId);
    setIsPlaying(false);
  };

  const handleTestNote = () => {
    const synth = SYNTHESIZERS.find(s => s.id === selectedSynth);
    if (!synth) return;

    // Play test note based on synth type
    if (synth.id === 'tb303') {
      bridge.sendMessage({ type: 'play_note', note: 'C3', velocity: 1.0, accent: false, duration: 0.3 });
    } else if (synth.id === 'tr808') {
      bridge.sendMessage({ type: 'play_kick', velocity: 1.0 });
    } else if (synth.id === 'arp2600') {
      bridge.sendMessage({ type: 'play_arp2600', note: 'A3', velocity: 1.0, accent: false, duration: 0.5 });
    }
    // TODO: Add play functions for new synths
  };

  const renderSynthCard = (synth) => (
    <TouchableOpacity
      key={synth.id}
      style={[
        styles.synthCard,
        selectedSynth === synth.id && styles.synthCardActive,
        { borderColor: synth.color }
      ]}
      onPress={() => handleSynthSelect(synth.id)}
    >
      <View style={styles.synthHeader}>
        <Text style={styles.synthEmoji}>{synth.emoji}</Text>
        <View style={styles.synthBadge}>
          <Text style={styles.synthYear}>{synth.year}</Text>
        </View>
      </View>
      <Text style={[styles.synthName, { color: synth.color }]}>{synth.name}</Text>
      <Text style={styles.synthType}>{synth.type}</Text>
      <Text style={styles.synthDescription}>{synth.description}</Text>
      
      {selectedSynth === synth.id && (
        <View style={styles.synthParams}>
          <Text style={styles.paramsTitle}>Parameters:</Text>
          {synth.params.map((param, idx) => (
            <Text key={idx} style={styles.paramItem}>• {param}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const selectedSynthData = SYNTHESIZERS.find(s => s.id === selectedSynth);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎹 SYNTHESIZER LIBRARY</Text>
        <Text style={styles.headerSubtitle}>Classic Analog & Digital Synths</Text>
      </View>

      {/* Synth Grid */}
      <ScrollView style={styles.synthList} showsVerticalScrollIndicator={false}>
        <View style={styles.synthGrid}>
          {SYNTHESIZERS.map(synth => renderSynthCard(synth))}
        </View>
      </ScrollView>

      {/* Control Panel */}
      {selectedSynthData && (
        <View style={styles.controlPanel}>
          <View style={styles.controlHeader}>
            <Text style={[styles.controlTitle, { color: selectedSynthData.color }]}>
              {selectedSynthData.name}
            </Text>
          </View>
          
          <View style={styles.controlButtons}>
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: selectedSynthData.color }]}
              onPress={handleTestNote}
            >
              <Text style={styles.testButtonText}>🎵 Test Note</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                // Navigate to parameter editing screen
                navigation.navigate('SynthParams', { synthId: selectedSynth });
              }}
            >
              <Text style={styles.editButtonText}>⚙️ Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                // Save to presets
                navigation.navigate('Presets');
              }}
            >
              <Text style={styles.saveButtonText}>💾 Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPO.h1,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  synthList: {
    flex: 1,
  },
  synthGrid: {
    padding: SPACING.md,
  },
  synthCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    ...SHADOW.medium,
  },
  synthCardActive: {
    borderWidth: 3,
    ...SHADOW.large,
  },
  synthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  synthEmoji: {
    fontSize: 48,
  },
  synthBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  synthYear: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  synthName: {
    ...TYPO.h2,
    marginBottom: SPACING.xs,
  },
  synthType: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  synthDescription: {
    ...TYPO.body,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  synthParams: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paramsTitle: {
    ...TYPO.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  paramItem: {
    ...TYPO.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  controlPanel: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
  },
  controlHeader: {
    marginBottom: SPACING.md,
  },
  controlTitle: {
    ...TYPO.h3,
    textAlign: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    ...SHADOW.medium,
  },
  testButtonText: {
    ...TYPO.body,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  editButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    ...SHADOW.medium,
  },
  editButtonText: {
    ...TYPO.body,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    ...SHADOW.medium,
  },
  saveButtonText: {
    ...TYPO.body,
    color: COLORS.background,
    fontWeight: 'bold',
  },
});

export default SynthScreen;
