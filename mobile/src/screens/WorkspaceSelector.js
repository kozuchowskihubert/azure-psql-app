/**
 * HAOS.fm Workspace Selector
 * Icon card interface for studio/instrument selection
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { COLORS, TYPO, SPACING } from '../styles/HAOSDesignSystem';

const { width } = Dimensions.get('window');

const WORKSPACES = [
  {
    id: 'haos-studio',
    name: 'HAOS STUDIO',
    description: 'Complete production environment',
    icon: '🎹',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#FF8C42'],
    category: 'production',
    features: ['Full DAW', 'Mixer', 'Arrangement', 'Automation'],
    screen: 'DAWStudio'
  },
  {
    id: 'techno-workspace',
    name: 'TECHNO WORKSPACE',
    description: 'Detroit techno with TB-303 & TR-909',
    icon: '⚡',
    color: '#39FF14',
    gradient: ['#39FF14', '#00FF00'],
    category: 'production',
    features: ['TB-303', 'TR-909', 'Effects', 'Sequencer'],
    screen: 'TechnoWorkspace'
  },
  {
    id: 'modular-synth',
    name: 'MODULAR SYNTH',
    description: 'ARP 2600, Juno-106, Minimoog',
    icon: '🎛️',
    color: '#00D9FF',
    gradient: ['#00D9FF', '#0088FF'],
    category: 'synths',
    features: ['ARP 2600', 'Juno-106', 'Minimoog', 'TB-303'],
    screen: 'ModularSynth'
  },
  {
    id: 'piano',
    name: 'PIANO STUDIO',
    description: 'Virtual piano with MIDI support',
    icon: '🎹',
    color: '#39FF14',
    gradient: ['#39FF14', '#88FF00'],
    category: 'melody',
    features: ['88 Keys', 'Pedals', 'MIDI Export', 'Chords'],
    screen: 'PianoStudio'
  },
  {
    id: 'strings',
    name: 'STRING ENSEMBLE',
    description: 'Orchestral strings section',
    icon: '🎻',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A855F7'],
    category: 'strings',
    features: ['Violins', 'Violas', 'Cellos', 'Basses'],
    screen: 'StringsEnsemble'
  },
  {
    id: 'violin',
    name: 'SOLO VIOLIN',
    description: 'Expressive solo violin',
    icon: '🎻',
    color: '#A855F7',
    gradient: ['#A855F7', '#C084FC'],
    category: 'strings',
    features: ['Bow Control', 'Vibrato', 'Expression', 'Articulations'],
    screen: 'SoloViolin'
  },
  {
    id: 'guitar',
    name: 'GUITAR STUDIO',
    description: 'Electric & acoustic guitars',
    icon: '🎸',
    color: '#FF8800',
    gradient: ['#FF8800', '#FFAA00'],
    category: 'melody',
    features: ['Strumming', 'Picking', 'Chords', 'Effects'],
    screen: 'GuitarStudio'
  },
  {
    id: 'bass-studio',
    name: 'BASS STUDIO',
    description: 'Professional bass synthesizer',
    icon: '🎸',
    color: '#39FF14',
    gradient: ['#39FF14', '#4AFF14'],
    category: 'melody',
    features: ['Dual OSC', 'Filter', 'ADSR', 'Effects', 'Presets'],
    screen: 'BassStudio'
  },
  {
    id: 'beat-maker',
    name: 'BEAT MAKER',
    description: 'Pattern sequencer & drum machine',
    icon: '🥁',
    color: '#FF0066',
    gradient: ['#FF0066', '#FF3399'],
    category: 'drums',
    features: ['16 Steps', 'Patterns', 'Arrangement', 'Export'],
    screen: 'BeatMaker'
  },
  {
    id: 'sampling-station',
    name: 'SAMPLING STATION',
    description: 'Sample recording & manipulation',
    icon: '🎙️',
    color: '#00FFFF',
    gradient: ['#00FFFF', '#00AAFF'],
    category: 'production',
    features: ['Record', 'Chop', 'Time Stretch', 'Pitch Shift'],
    screen: 'SamplingStation'
  },
  {
    id: 'mastering-suite',
    name: 'MASTERING SUITE',
    description: 'Final mix processing & export',
    icon: '🎚️',
    color: '#FFFF00',
    gradient: ['#FFFF00', '#FFDD00'],
    category: 'production',
    features: ['EQ', 'Compression', 'Limiting', 'Export'],
    screen: 'MasteringSuite'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'ALL STUDIOS', icon: '🏠' },
  { id: 'production', name: 'PRODUCTION', icon: '🎹' },
  { id: 'synths', name: 'SYNTHS', icon: '🎛️' },
  { id: 'melody', name: 'MELODY', icon: '🎵' },
  { id: 'strings', name: 'STRINGS', icon: '🎻' },
  { id: 'drums', name: 'DRUMS', icon: '🥁' }
];

export default function WorkspaceSelector({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter workspaces
  const filteredWorkspaces = WORKSPACES.filter(ws => {
    const matchesCategory = selectedCategory === 'all' || ws.category === selectedCategory;
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ws.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWorkspaceSelect = (workspace) => {
    console.log(`🚀 Opening workspace: ${workspace.name}`);
    if (workspace.screen) {
      navigation.navigate(workspace.screen, { workspaceId: workspace.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎹 SELECT STUDIO</Text>
        <Text style={styles.headerSubtitle}>Choose your creative workspace</Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryBtn,
              selectedCategory === category.id && styles.categoryBtnActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workspace Cards Grid */}
      <ScrollView
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContainer}
      >
        {filteredWorkspaces.map(workspace => (
          <TouchableOpacity
            key={workspace.id}
            style={[
              styles.workspaceCard,
              { borderColor: workspace.color }
            ]}
            onPress={() => handleWorkspaceSelect(workspace)}
            activeOpacity={0.8}
          >
            {/* Gradient background */}
            <View style={[styles.cardGradient, {
              backgroundColor: workspace.color,
              opacity: 0.1
            }]} />

            {/* Icon */}
            <View style={[styles.cardIcon, { backgroundColor: workspace.color + '20' }]}>
              <Text style={styles.cardIconText}>{workspace.icon}</Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: workspace.color }]}>
                {workspace.name}
              </Text>
              <Text style={styles.cardDescription}>
                {workspace.description}
              </Text>

              {/* Features */}
              <View style={styles.featuresList}>
                {workspace.features.slice(0, 3).map((feature, idx) => (
                  <View key={idx} style={[styles.featureTag, { borderColor: workspace.color }]}>
                    <Text style={[styles.featureText, { color: workspace.color }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Launch arrow */}
            <View style={[styles.launchArrow, { backgroundColor: workspace.color }]}>
              <Text style={styles.launchArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {filteredWorkspaces.length} studio{filteredWorkspaces.length !== 1 ? 's' : ''} available
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPO.display,
    fontSize: 32,
    color: COLORS.orange,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPO.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  categoryScroll: {
    maxHeight: 60,
    marginBottom: SPACING.md,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryBtnActive: {
    backgroundColor: COLORS.orange + '30',
    borderColor: COLORS.orange,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  categoryText: {
    ...TYPO.label,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  categoryTextActive: {
    color: COLORS.orange,
    fontWeight: 'bold',
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContainer: {
    padding: SPACING.md,
  },
  workspaceCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.lg,
  },
  cardIconText: {
    fontSize: 36,
  },
  cardContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  cardTitle: {
    ...TYPO.heading,
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    ...TYPO.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.md,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featureText: {
    ...TYPO.mono,
    fontSize: 10,
    fontWeight: 'bold',
  },
  launchArrow: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchArrowText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    ...TYPO.mono,
    fontSize: 12,
    color: COLORS.cyan,
  },
});
