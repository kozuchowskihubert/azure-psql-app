/**
 * HAOS.fm Synthesizers Screen
 * All hardware emulations: ARP 2600, Juno-106, Minimoog, TB-303, Bass Studio
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  bgDark: '#0A0A0A',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.7)',
  blue: '#00D9FF',
  green: '#39FF14',
  orange: '#FF6B35',
  purple: '#8B5CF6',
  pink: '#FF1493',
};

const SYNTHS = [
  {
    id: 'arp2600',
    name: 'ARP 2600',
    description: 'Legendary modular synthesizer with patch cables',
    icon: '🎛️',
    gradient: [COLORS.blue, '#0088FF'],
    features: ['Modular', 'Patch Cables', '12 Presets', 'Semi-Modular'],
    specs: '3 VCOs • Filter • Envelope • Ring Mod',
    screen: 'ModularSynth',
    params: { synthType: 'arp2600' }
  },
  {
    id: 'juno106',
    name: 'JUNO-106',
    description: 'Classic analog polysynth with chorus',
    icon: '🎹',
    gradient: [COLORS.purple, '#A855F7'],
    features: ['Polyphonic', 'Chorus', 'PWM', 'DCO'],
    specs: '6-Voice • HPF • LFO • Chorus',
    screen: 'ModularSynth',
    params: { synthType: 'juno106' }
  },
  {
    id: 'minimoog',
    name: 'MINIMOOG',
    description: 'The king of bass and lead sounds',
    icon: '🔊',
    gradient: ['#FF6B35', '#FFAA00'],
    features: ['Monophonic', '3 OSC', 'Ladder Filter', 'Glide'],
    specs: '3 VCOs • Moog Filter • ADSR',
    screen: 'ModularSynth',
    params: { synthType: 'minimoog' }
  },
  {
    id: 'tb303',
    name: 'TB-303',
    description: 'Iconic acid bass line machine',
    icon: '🧪',
    gradient: [COLORS.green, '#4AFF14'],
    features: ['Acid Bass', 'Sequencer', 'Accent', 'Slide'],
    specs: 'VCO • VCF • Envelope • Resonance',
    screen: 'ModularSynth',
    params: { synthType: 'tb303' }
  },
  {
    id: 'dx7',
    name: 'DX7',
    description: 'Digital FM synthesis legend',
    icon: '✨',
    gradient: ['#FF1493', '#FF69B4'],
    features: ['FM Synthesis', '6 Operators', 'Digital', 'Bright'],
    specs: '6 OP • FM • 32 Algorithms • Digital',
    screen: 'ModularSynth',
    params: { synthType: 'dx7' }
  },
  {
    id: 'ms20',
    name: 'MS-20',
    description: 'Semi-modular monophonic synthesizer',
    icon: '⚡',
    gradient: ['#FFD700', '#FFA500'],
    features: ['Semi-Modular', 'Patch', 'High-Pass', 'Aggressive'],
    specs: '2 VCOs • HPF + LPF • Patch Bay',
    screen: 'ModularSynth',
    params: { synthType: 'ms20' }
  },
  {
    id: 'prophet5',
    name: 'PROPHET-5',
    description: 'First fully programmable polyphonic',
    icon: '👑',
    gradient: ['#4169E1', '#1E90FF'],
    features: ['Polyphonic', 'Programmable', '5-Voice', 'Vintage'],
    specs: '5-Voice • 2 VCOs • Curtis Filter',
    screen: 'ModularSynth',
    params: { synthType: 'prophet5' }
  },
  {
    id: 'bass-studio',
    name: 'BASS STUDIO',
    description: 'Professional bass synthesizer with presets',
    icon: '🎸',
    gradient: [COLORS.green, '#00FF00'],
    features: ['Bass Focus', 'Presets', 'Modulation', 'Effects'],
    specs: 'Slide • Bend • Vibrato • Sub-Osc',
    screen: 'BassStudio',
    params: {}
  },
];

export default function SynthsScreen({ navigation }) {
  const [animations] = useState(
    SYNTHS.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    Animated.stagger(
      80,
      animations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 35,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleSynthSelect = (synth) => {
    console.log(`🎛️ Opening synth: ${synth.name}`);
    navigation.navigate(synth.screen, synth.params);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🎛️</Text>
          <Text style={styles.headerTitle}>SYNTHESIZERS</Text>
          <Text style={styles.headerSubtitle}>Hardware Emulations</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SYNTHS.map((synth, index) => {
          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });

          return (
            <Animated.View
              key={synth.id}
              style={[
                styles.synthCard,
                {
                  opacity: animations[index],
                  transform: [{ translateY }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleSynthSelect(synth)}
              >
                <LinearGradient
                  colors={[
                    `${synth.gradient[0]}20`,
                    `${synth.gradient[1]}10`,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  {/* Glow border */}
                  <View 
                    style={[
                      styles.cardBorder,
                      { borderColor: `${synth.gradient[0]}50` }
                    ]} 
                  />

                  {/* Icon */}
                  <View 
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${synth.gradient[0]}20` }
                    ]}
                  >
                    <Text style={styles.icon}>{synth.icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <Text style={[styles.synthName, { color: synth.gradient[0] }]}>
                      {synth.name}
                    </Text>
                    <Text style={styles.synthDescription}>
                      {synth.description}
                    </Text>

                    {/* Specs */}
                    <Text style={styles.synthSpecs}>
                      {synth.specs}
                    </Text>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                      {synth.features.map((feature, idx) => (
                        <View 
                          key={idx}
                          style={[
                            styles.featureBadge,
                            { backgroundColor: `${synth.gradient[0]}15` }
                          ]}
                        >
                          <Text 
                            style={[
                              styles.featureText,
                              { color: synth.gradient[0] }
                            ]}
                          >
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Arrow */}
                  <View style={styles.arrowContainer}>
                    <Text style={[styles.arrow, { color: synth.gradient[0] }]}>
                      →
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 15,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.blue,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  synthCard: {
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    minHeight: 160,
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
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
  },
  cardContent: {
    paddingRight: 90,
  },
  synthName: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  synthDescription: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    lineHeight: 20,
  },
  synthSpecs: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  arrow: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
