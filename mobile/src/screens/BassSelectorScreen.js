/**
 * HAOS.fm Bass Studio Selector Screen
 * Modern card-based selector for bass presets
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

const BASS_PRESETS = [
  {
    id: 'acid',
    name: 'ACID BASS',
    emoji: '🧪',
    description: 'Classic TB-303 squelchy acid lines',
    color: '#00FF88',
    gradient: ['#00FF88', '#00CC66'],
    params: {
      slide: '80ms',
      pitchBend: '±12',
      vibrato: '30%',
      subOsc: '40%',
    },
    features: ['Resonance', 'Slide', 'Accent', 'Decay'],
    values: {
      slide: 0.08,
      pitchBend: 0,
      vibrato: 0.3,
      subOsc: 0.4,
      octaves: 1,
    },
    year: '1982',
    genre: 'TECHNO • ACID',
  },
  {
    id: 'sub',
    name: 'SUB BASS',
    emoji: '💥',
    description: 'Deep rumbling sub frequencies',
    color: '#FF1493',
    gradient: ['#FF1493', '#8B008B'],
    params: {
      slide: '20ms',
      pitchBend: '±2',
      vibrato: '5%',
      subOsc: '100%',
    },
    features: ['Deep', 'Clean', 'Tight', 'Power'],
    values: {
      slide: 0.02,
      pitchBend: 0,
      vibrato: 0.05,
      subOsc: 1.0,
      octaves: 3,
    },
    year: '2025',
    genre: 'DUB • TRAP',
  },
  {
    id: 'wobble',
    name: 'WOBBLE BASS',
    emoji: '🌊',
    description: 'Dubstep LFO modulated madness',
    color: '#00D9FF',
    gradient: ['#00D9FF', '#0088FF'],
    params: {
      slide: '40ms',
      pitchBend: '±5',
      vibrato: '80%',
      subOsc: '60%',
    },
    features: ['LFO', 'Wide', 'Powerful', 'Movement'],
    values: {
      slide: 0.04,
      pitchBend: -5,
      vibrato: 0.8,
      subOsc: 0.6,
      octaves: 2,
    },
    year: '2010',
    genre: 'DUBSTEP • BASS',
  },
  {
    id: '808',
    name: '808 BASS',
    emoji: '🥁',
    description: 'Punchy trap 808 sub kicks',
    color: '#FF8800',
    gradient: ['#FF8800', '#FFAA00'],
    params: {
      slide: '10ms',
      pitchBend: '±1',
      vibrato: '0%',
      subOsc: '80%',
    },
    features: ['Punchy', 'Tight', 'Clean', 'Attack'],
    values: {
      slide: 0.01,
      pitchBend: 0,
      vibrato: 0,
      subOsc: 0.8,
      octaves: 1,
    },
    year: '1980',
    genre: 'TRAP • HIP-HOP',
  },
  {
    id: 'reese',
    name: 'REESE BASS',
    emoji: '🎸',
    description: 'Detuned wide DnB growl',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A855F7'],
    params: {
      slide: '60ms',
      pitchBend: '±8',
      vibrato: '50%',
      subOsc: '70%',
    },
    features: ['Detune', 'Wide', 'Growl', 'Movement'],
    values: {
      slide: 0.06,
      pitchBend: 0,
      vibrato: 0.5,
      subOsc: 0.7,
      octaves: 2,
    },
    year: '1992',
    genre: 'DnB • JUNGLE',
  },
  {
    id: 'pluck',
    name: 'PLUCK BASS',
    emoji: '⚡',
    description: 'Fast attack funk bass lines',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    params: {
      slide: '5ms',
      pitchBend: '±3',
      vibrato: '15%',
      subOsc: '20%',
    },
    features: ['Fast', 'Bright', 'Percussive', 'Funk'],
    values: {
      slide: 0.005,
      pitchBend: 0,
      vibrato: 0.15,
      subOsc: 0.2,
      octaves: 1,
    },
    year: '1975',
    genre: 'FUNK • DISCO',
  },
];

export default function BassSelectorScreen({ navigation }) {
  const [selectedBass, setSelectedBass] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(BASS_PRESETS.map(() => new Animated.Value(50))).current;

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

  const handleBassSelect = (bass) => {
    setSelectedBass(bass.id);
    setTimeout(() => {
      // Navigate to TB-303 screen with preset applied
      navigation.navigate('TB303', { 
        preset: bass.values,
        presetName: bass.name 
      });
      setSelectedBass(null);
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
          <Text style={styles.headerTitle}>🎸 BASS STUDIO</Text>
          <Text style={styles.headerSubtitle}>Professional bass presets</Text>
        </View>
      </View>

      {/* Bass Presets Grid */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {BASS_PRESETS.map((bass, index) => (
          <Animated.View
            key={bass.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateY: slideAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleBassSelect(bass)}
              style={[
                styles.card,
                selectedBass === bass.id && styles.cardPressed,
              ]}
            >
              <LinearGradient
                colors={bass.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.bassEmoji}>{bass.emoji}</Text>
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{bass.year}</Text>
                  </View>
                </View>

                {/* Bass Name */}
                <Text style={styles.bassName}>{bass.name}</Text>
                <Text style={styles.bassDescription}>{bass.description}</Text>

                {/* Genre Badge */}
                <View style={styles.genreBadge}>
                  <Text style={styles.genreText}>{bass.genre}</Text>
                </View>

                {/* Parameters Grid */}
                <View style={styles.paramsGrid}>
                  {Object.entries(bass.params).map(([key, value]) => (
                    <View key={key} style={styles.paramItem}>
                      <Text style={styles.paramLabel}>{key.toUpperCase()}</Text>
                      <Text style={styles.paramValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                {/* Features Pills */}
                <View style={styles.featuresRow}>
                  {bass.features.map((feature) => (
                    <View key={feature} style={styles.featurePill}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Launch Button */}
                <View style={styles.launchButton}>
                  <Text style={styles.launchText}>LOAD PRESET →</Text>
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
    borderBottomColor: 'rgba(255, 20, 147, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#FF1493',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPO.h2,
    color: '#FF1493',
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
  bassEmoji: {
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
  bassName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bassDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 22,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genreText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  paramItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: '47%',
  },
  paramLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  paramValue: {
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
