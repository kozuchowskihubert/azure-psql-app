/**
 * HAOS.fm Instruments Screen - REFACTORED
 * 4 Categories: SYNTHESIZERS, DRUM MACHINES, SAMPLERS, ORCHESTRAL
 * Based on instruments.html and modular-workspace.html design
 * Date: December 28, 2025
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../styles/colors';
import { TYPOGRAPHY } from '../styles/typography';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

// 4 Main Categories
const CATEGORIES = [
  { 
    id: 'synths', 
    name: 'SYNTHS', 
    icon: '🎹', 
    count: 8,
    color: COLORS.cyan,
    gradient: GRADIENTS.synths,
  },
  { 
    id: 'drums', 
    name: 'DRUMS', 
    icon: '🥁', 
    count: 6,
    color: COLORS.orange,
    gradient: GRADIENTS.drums,
  },
  { 
    id: 'samplers', 
    name: 'SAMPLERS', 
    icon: '📀', 
    count: 4,
    color: COLORS.purple,
    gradient: GRADIENTS.samplers,
  },
  { 
    id: 'orchestral', 
    name: 'ORCH', 
    icon: '🎻', 
    count: 5,
    color: COLORS.gold,
    gradient: GRADIENTS.orchestral,
  },
];

// Instrument Library
const INSTRUMENTS = {
  synths: [
    { id: 'arp2600', name: 'ARP 2600', screen: 'ARP2600', emoji: '🎛️', color: COLORS.cyan },
    { id: 'juno106', name: 'JUNO-106', screen: 'Juno106', emoji: '🎹', color: COLORS.cyan },
    { id: 'minimoog', name: 'MINIMOOG', screen: 'Minimoog', emoji: '🔊', color: COLORS.cyan },
    { id: 'tb303', name: 'TB-303', screen: 'TB303', emoji: '🧪', color: COLORS.cyan },
    { id: 'td3', name: 'TD-3', screen: 'TD3', emoji: '🔊', color: COLORS.cyan },
    { id: 'dx7', name: 'DX7', screen: 'DX7', emoji: '✨', color: COLORS.cyan },
    { id: 'ms20', name: 'MS-20', screen: 'MS20', emoji: '⚡', color: COLORS.cyan },
    { id: 'prophet5', name: 'PROPHET-5', screen: 'Prophet5', emoji: '👑', color: COLORS.cyan },
    { id: 'bass', name: 'BASS STUDIO', screen: 'BassStudio', emoji: '🎸', color: COLORS.cyan },
    { id: 'radio', name: 'RADIO', screen: 'Radio', emoji: '📻', color: COLORS.orange },
  ],
  drums: [
    { id: 'tr808', name: 'TR-808', screen: 'TR808', emoji: '🥁', color: COLORS.orange },
    { id: 'tr909', name: 'TR-909', screen: 'TR909', emoji: '🎼', color: COLORS.orange },
    { id: 'linndrum', name: 'LINNDRUM', screen: 'LinnDrum', emoji: '🎛️', color: COLORS.orange },
    { id: 'cr78', name: 'CR-78', screen: 'CR78', emoji: '📻', color: COLORS.orange },
    { id: 'dmx', name: 'OBERHEIM DMX', screen: 'DMX', emoji: '🎚️', color: COLORS.orange },
    { id: 'beatmaker', name: 'BEAT MAKER', screen: 'BeatMaker', emoji: '✨', color: COLORS.orange },
  ],
  samplers: [
    { id: 'samples', name: 'SAMPLE LIBRARY', screen: null, emoji: '📚', color: COLORS.purple },
    { id: 'vocsampler', name: 'VOCAL SAMPLER', screen: 'Vocals', emoji: '�', color: COLORS.purple },
    { id: 'drumsampler', name: 'DRUM SAMPLER', screen: null, emoji: '🥁', color: COLORS.purple },
    { id: 'looper', name: 'LOOP STATION', screen: null, emoji: '🔁', color: COLORS.purple },
  ],
  orchestral: [
    { id: 'strings', name: 'STRINGS', screen: 'Violin', emoji: '🎻', color: COLORS.gold },
    { id: 'piano', name: 'PIANO', screen: 'Piano', emoji: '🎹', color: COLORS.gold },
    { id: 'brass', name: 'BRASS', screen: null, emoji: '�', color: COLORS.gold },
    { id: 'woodwinds', name: 'WOODWINDS', screen: null, emoji: '🎷', color: COLORS.gold },
    { id: 'choir', name: 'CHOIR', screen: null, emoji: '👥', color: COLORS.gold },
  ],
};

export default function InstrumentsScreen({ navigation, route }) {
  const [activeCategory, setActiveCategory] = useState('synths');
  const persona = route?.params?.persona || 'producer';

  const handleInstrumentPress = (instrument) => {
    // Use InteractionManager to ensure all animations complete before navigation
    InteractionManager.runAfterInteractions(() => {
      try {
        if (instrument.screen) {
          // Navigate to specific instrument screen
          navigation.navigate(instrument.screen);
        } else {
          // Coming soon - show ModularSynth as placeholder
          navigation.navigate('ModularSynth', { 
            synthType: instrument.name,
            fromInstruments: true 
          });
        }
      } catch (error) {
        console.log('Navigation error:', error);
      }
    });
  };

  const currentInstruments = INSTRUMENTS[activeCategory];

  return (
    <View style={styles.container}>
      {/* Circuit Board Background */}
      <CircuitBoardBackground density="medium" animated={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HAOS</Text>
          <Text style={styles.logoDot}>.fm</Text>
        </View>
        <Text style={styles.headerTitle}>INSTRUMENTS</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              onPress={() => setActiveCategory(category.id)}
              style={[
                styles.categoryTab,
                activeCategory === category.id && styles.categoryTabActive,
              ]}
            >
              <LinearGradient
                colors={activeCategory === category.id ? category.gradient : [COLORS.grayDark, COLORS.grayDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabGradient}
              >
                <Text style={styles.tabEmoji}>{category.icon}</Text>
                <Text style={[
                  styles.tabName,
                  activeCategory === category.id && styles.tabNameActive
                ]}>
                  {category.name}
                </Text>
                <View style={[
                  styles.tabBadge,
                  { backgroundColor: category.color }
                ]}>
                  <Text style={styles.tabBadgeText}>{category.count}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Instruments Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.instrumentsGrid}
        showsVerticalScrollIndicator={false}
      >
        {currentInstruments.map((instrument, index) => (
          <TouchableOpacity
            key={instrument.id}
            activeOpacity={0.8}
            onPress={() => handleInstrumentPress(instrument)}
            style={[
              styles.instrumentCard,
              { marginRight: (index % 2 === 0) ? 10 : 0 }
            ]}
          >
            <LinearGradient
              colors={[COLORS.bgCard, COLORS.bgDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Card border */}
              <View style={[styles.cardBorder, { borderColor: instrument.color }]} />
              
              {/* Instrument emoji */}
              <View style={[styles.emojiCircle, { backgroundColor: `${instrument.color}20` }]}>
                <Text style={styles.instrumentEmoji}>{instrument.emoji}</Text>
              </View>
              
              {/* Instrument name */}
              <Text style={styles.instrumentName}>{instrument.name}</Text>
              
              {/* Status indicator */}
              {instrument.screen ? (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>AVAILABLE</Text>
                </View>
              ) : (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>SOON</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
        
        {/* Add Custom Instrument Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.instrumentCard, styles.addCard]}
        >
          <LinearGradient
            colors={['rgba(255, 107, 53, 0.1)', 'rgba(255, 107, 53, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={[styles.cardBorder, { borderColor: COLORS.orange, borderStyle: 'dashed' }]} />
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>ADD CUSTOM</Text>
            <Text style={styles.addSubtext}>Import your own</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Tap any instrument to open its studio. All instruments feature real-time synthesis.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  logoDot: {
    ...TYPOGRAPHY.h2,
    color: COLORS.orange,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Category Tabs
  categoryTabs: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    marginRight: 12,
  },
  categoryTabActive: {
    // Active state handled by gradient
  },
  tabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  tabName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  tabNameActive: {
    color: COLORS.textPrimary,
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.bgDark,
    fontWeight: 'bold',
  },
  // Instruments Grid
  scrollView: {
    flex: 1,
  },
  instrumentsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  instrumentCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    marginBottom: 15,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
  },
  emojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  instrumentEmoji: {
    fontSize: 32,
  },
  instrumentName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 5,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },
  availableText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.green,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.orangeTransparent,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.orange,
  },
  // Add Custom Card
  addCard: {
    borderStyle: 'dashed',
  },
  addIcon: {
    fontSize: 48,
    color: COLORS.orange,
    textAlign: 'center',
    marginBottom: 10,
  },
  addText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.orange,
    textAlign: 'center',
    marginBottom: 5,
  },
  addSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Info Panel
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
