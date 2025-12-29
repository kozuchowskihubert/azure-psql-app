/**
 * HAOS.fm Synthesizers Selector Screen
 * Modern card-based selector for all synth engines
 * Style inspired by WorkspaceSelector
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

const SYNTHS = [
  {
    id: 'arp2600',
    name: 'ARP 2600',
    emoji: '🎛️',
    description: 'Complete semi-modular synthesizer with patch bay',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#0066FF'],
    specs: {
      oscillators: '3 VCOs',
      filter: '4-Pole Ladder',
      modulation: 'Full Patch Bay',
      special: 'Semi-Modular',
    },
    features: ['5 Classic Presets', 'Patch Bay', 'Ring Mod', 'FM Control', 'LFO'],
    screen: 'ARP2600',
    year: '1971',
  },
  {
    id: 'juno106',
    name: 'JUNO-106',
    emoji: '🎹',
    description: 'Classic polyphonic with chorus',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A855F7'],
    specs: {
      oscillators: '6-Voice DCO',
      filter: 'Roland Lowpass',
      modulation: 'LFO + PWM',
      special: 'Chorus',
    },
    features: ['Polyphonic', 'Chorus', 'PWM', '6 Voices'],
    screen: 'Juno106',
    year: '1984',
  },
  {
    id: 'minimoog',
    name: 'MINIMOOG',
    emoji: '🔊',
    description: 'The king of bass and leads',
    color: '#FF6B35',
    gradient: ['#FF6B35', '#FFAA00'],
    specs: {
      oscillators: '3 VCOs',
      filter: 'Moog Ladder 24dB',
      modulation: 'LFO + Glide',
      special: 'Analog Warmth',
    },
    features: ['Monophonic', 'Fat Bass', 'Glide', 'Ladder Filter'],
    screen: 'Minimoog',
    year: '1970',
  },
  {
    id: 'tb303',
    name: 'TB-303',
    emoji: '🧪',
    description: 'Iconic acid bass machine',
    color: '#39FF14',
    gradient: ['#39FF14', '#4AFF14'],
    specs: {
      oscillators: '1 VCO',
      filter: 'Resonant 18dB',
      modulation: 'Envelope Mod',
      special: 'Accent + Slide',
    },
    features: ['Acid Bass', 'Sequencer', 'Accent', 'Slide'],
    screen: 'TB303',
    year: '1982',
  },
  {
    id: 'dx7',
    name: 'YAMAHA DX7',
    emoji: '✨',
    description: 'Digital FM synthesis legend',
    color: '#FF1493',
    gradient: ['#FF1493', '#FF69B4'],
    specs: {
      oscillators: '6 Operators',
      filter: 'FM Algorithms',
      modulation: '32 Algorithms',
      special: 'Digital FM',
    },
    features: ['FM Synthesis', '6 OP', 'Digital', 'Bright'],
    screen: 'DX7',
    year: '1983',
  },
  {
    id: 'ms20',
    name: 'KORG MS-20',
    emoji: '⚡',
    description: 'Aggressive semi-modular synth',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500'],
    specs: {
      oscillators: '2 VCOs',
      filter: 'HPF + LPF',
      modulation: 'Patch Bay',
      special: 'Self-Oscillation',
    },
    features: ['Semi-Modular', 'Dual Filter', 'Aggressive', 'Patch'],
    screen: 'MS20',
    year: '1978',
  },
  {
    id: 'prophet5',
    name: 'PROPHET-5',
    emoji: '👑',
    description: 'First programmable polysynth',
    color: '#4169E1',
    gradient: ['#4169E1', '#1E90FF'],
    specs: {
      oscillators: '5-Voice Poly',
      filter: 'Curtis Lowpass',
      modulation: 'Poly-Mod',
      special: 'Programmable',
    },
    features: ['Polyphonic', '5 Voices', 'Curtis', 'Vintage'],
    screen: 'Prophet5',
    year: '1978',
  },
  {
    id: 'bass-studio',
    name: 'BASS STUDIO',
    emoji: '🎸',
    description: 'Professional bass synthesis',
    color: '#00FF94',
    gradient: ['#00FF94', '#00FF00'],
    specs: {
      oscillators: 'Multi-Mode',
      filter: 'Resonant Multi',
      modulation: 'Full ADSR',
      special: 'Bass Focus',
    },
    features: ['Slide', 'Bend', 'Vibrato', 'Sub-Osc'],
    screen: 'Studio',
    year: '2025',
  },
];

export default function SynthsSelectorScreen({ navigation }) {
  const [selectedSynth, setSelectedSynth] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(SYNTHS.map(() => new Animated.Value(50))).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Stagger slide animations
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

  const handleSynthSelect = (synth) => {
    setSelectedSynth(synth.id);
    setTimeout(() => {
      navigation.navigate(synth.screen);
      setSelectedSynth(null);
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
          <Text style={styles.headerTitle}>🎹 SYNTHESIZERS</Text>
          <Text style={styles.headerSubtitle}>Choose your hardware</Text>
        </View>
      </View>

      {/* Synths Grid */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SYNTHS.map((synth, index) => (
          <Animated.View
            key={synth.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateY: slideAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleSynthSelect(synth)}
              style={[
                styles.card,
                selectedSynth === synth.id && styles.cardPressed,
              ]}
            >
              <LinearGradient
                colors={synth.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.synthEmoji}>{synth.emoji}</Text>
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{synth.year}</Text>
                  </View>
                </View>

                {/* Synth Name */}
                <Text style={styles.synthName}>{synth.name}</Text>
                <Text style={styles.synthDescription}>{synth.description}</Text>

                {/* Specs Grid */}
                <View style={styles.specsGrid}>
                  {Object.entries(synth.specs).map(([key, value]) => (
                    <View key={key} style={styles.specItem}>
                      <Text style={styles.specLabel}>{key.toUpperCase()}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                {/* Features Pills */}
                <View style={styles.featuresRow}>
                  {synth.features.map((feature) => (
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

        {/* Bottom Padding */}
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
    borderBottomColor: 'rgba(0, 255, 148, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPO.h2,
    color: COLORS.primary,
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
  synthEmoji: {
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
  synthName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  synthDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 22,
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
