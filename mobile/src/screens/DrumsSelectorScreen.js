/**
 * HAOS.fm Drum Machines Selector Screen
 * Modern card-based selector for drum machines
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPO, SPACING } from '../styles/HAOSDesignSystem';

const { width } = Dimensions.get('window');

const DRUM_MACHINES = [
  {
    id: 'tr808',
    name: 'TR-808',
    emoji: '🥁',
    description: 'The legendary rhythm composer',
    color: '#FF8800',
    gradient: ['#FF8800', '#FFAA00'],
    specs: {
      sounds: '11 Analog',
      sequencer: '16 Steps',
      pattern: '32 Patterns',
      special: 'Analog Drums',
    },
    features: ['Kick', 'Snare', 'Toms', 'Cowbell', 'Claps'],
    screen: 'TR808',
    year: '1980',
    bpm: '40-240 BPM',
  },
  {
    id: 'tr909',
    name: 'TR-909',
    emoji: '🎛️',
    description: 'Hybrid analog/digital powerhouse',
    color: '#00D9FF',
    gradient: ['#00D9FF', '#0088FF'],
    specs: {
      sounds: '11 Hybrid',
      sequencer: '16 Steps',
      pattern: '32 Patterns',
      special: 'MIDI Sync',
    },
    features: ['Kick', 'Snare', 'Hats', 'Ride', 'Crash'],
    screen: 'TR909',
    year: '1983',
    bpm: '30-240 BPM',
  },
  {
    id: 'linndrum',
    name: 'LINNDRUM',
    emoji: '💿',
    description: '80s digital samples perfection',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A855F7'],
    specs: {
      sounds: '15 Sampled',
      sequencer: '16 Steps',
      pattern: 'Real-time',
      special: 'Digital Samples',
    },
    features: ['Digital', 'Punchy', 'Tunable', 'Clean'],
    screen: 'LinnDrum',
    year: '1982',
    bpm: '40-250 BPM',
  },
  {
    id: 'dmx',
    name: 'OBERHEIM DMX',
    emoji: '⚡',
    description: 'Hip-hop drum machine classic',
    color: '#FF1493',
    gradient: ['#FF1493', '#FF69B4'],
    specs: {
      sounds: '16 Sampled',
      sequencer: '16 Steps',
      pattern: 'Programmable',
      special: 'Wide Tuning',
    },
    features: ['Hip-Hop', 'Boom-Bap', 'Fat', 'Vintage'],
    screen: 'DMX',
    year: '1981',
    bpm: '30-240 BPM',
  },
  {
    id: 'cr78',
    name: 'ROLAND CR-78',
    emoji: '🎵',
    description: 'First programmable rhythm box',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    specs: {
      sounds: '34 Presets',
      sequencer: 'Pattern Bank',
      pattern: '34 Rhythms',
      special: 'Metal Mode',
    },
    features: ['Presets', 'Vintage', 'Disco', 'Metal'],
    screen: 'CR78',
    year: '1978',
    bpm: '40-200 BPM',
  },
];

export default function DrumsSelectorScreen({ navigation }) {
  const [selectedDrum, setSelectedDrum] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(DRUM_MACHINES.map(() => new Animated.Value(50))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      80,
      slideAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleDrumSelect = (drum) => {
    setSelectedDrum(drum.id);
    setTimeout(() => {
      navigation.navigate(drum.screen);
      setSelectedDrum(null);
    }, 200);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🥁 DRUM MACHINES</Text>
          <Text style={styles.headerSubtitle}>Classic rhythm composers</Text>
        </View>
      </View>

      {/* Drums Grid */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DRUM_MACHINES.map((drum, index) => (
          <Animated.View
            key={drum.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateY: slideAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleDrumSelect(drum)}
              style={[
                styles.card,
                selectedDrum === drum.id && styles.cardPressed,
              ]}
            >
              <LinearGradient
                colors={drum.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.drumEmoji}>{drum.emoji}</Text>
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{drum.year}</Text>
                  </View>
                </View>

                {/* Drum Name */}
                <Text style={styles.drumName}>{drum.name}</Text>
                <Text style={styles.drumDescription}>{drum.description}</Text>

                {/* BPM Range */}
                <View style={styles.bpmBadge}>
                  <Text style={styles.bpmText}>{drum.bpm}</Text>
                </View>

                {/* Specs Grid */}
                <View style={styles.specsGrid}>
                  {Object.entries(drum.specs).map(([key, value]) => (
                    <View key={key} style={styles.specItem}>
                      <Text style={styles.specLabel}>{key.toUpperCase()}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                {/* Features Pills */}
                <View style={styles.featuresRow}>
                  {drum.features.map((feature) => (
                    <View key={feature} style={styles.featurePill}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Launch Button */}
                <View style={styles.launchButton}>
                  <Text style={styles.launchText}>LAUNCH →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 136, 0, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#FF8800',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPO.h2,
    color: '#FF8800',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drumEmoji: {
    fontSize: 56,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  yearBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  drumName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  drumDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 22,
  },
  bpmBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bpmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  specItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: '47%',
  },
  specLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  launchButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  launchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
