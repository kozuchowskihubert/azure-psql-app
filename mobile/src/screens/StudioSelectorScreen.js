/**
 * HAOS.fm Studio Selector
 * Main hub for accessing different studio environments
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  gold: '#FFD700',
  pink: '#FF1493',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const StudioSelectorScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    Array(6).fill(0).map(() => new Animated.Value(1))
  ).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Stagger animate studio cards
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        friction: 8,
      }).start();
    });
  }, []);
  
  const studios = [
    {
      id: 'bass',
      title: 'BASS STUDIO',
      subtitle: 'QUAKE ENGINE',
      description: 'Sub-oscillator bass synthesis with dual filters and bass boost',
      icon: '⚡',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'BassStudio',
      features: ['Sub Oscillator', 'Dual Filters', 'Bass Boost', 'Distortion'],
    },
    {
      id: 'arp',
      title: 'ARP STUDIO',
      subtitle: 'SEQUENCER ENGINE',
      description: 'Pattern-based arpeggiator with step sequencer and swing control',
      icon: '🎵',
      color: HAOS_COLORS.cyan,
      gradient: [HAOS_COLORS.cyan, '#0099cc'],
      screen: 'ArpStudio',
      features: ['Step Sequencer', 'Arp Patterns', 'Gate Control', 'Swing'],
    },
    {
      id: 'wavetable',
      title: 'WAVETABLE STUDIO',
      subtitle: 'SERUM2 ENGINE',
      description: 'Advanced wavetable synthesis with FM and dual oscillators',
      icon: '🌊',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#4a0873'],
      screen: 'WavetableStudio',
      features: ['6 Wavetables', 'FM Synthesis', 'Dual Osc', 'Unison'],
    },
    {
      id: 'enhanced',
      title: 'ENHANCED STUDIO',
      subtitle: 'ALL-IN-ONE ENGINE',
      description: 'Complete synthesis studio with all engines and modulation',
      icon: '🎹',
      color: HAOS_COLORS.orange,
      gradient: [HAOS_COLORS.orange, '#cc4e26'],
      screen: 'EnhancedStudio',
      features: ['All Engines', 'Modulation Matrix', '50+ Presets', 'Virtual Inst.'],
    },
    {
      id: 'modulation',
      title: 'MODULATION LAB',
      subtitle: 'ROUTING ENGINE',
      description: 'Advanced modulation routing with 4 LFOs and visual matrix',
      icon: '〰️',
      color: HAOS_COLORS.gold,
      gradient: [HAOS_COLORS.gold, '#ccaa00'],
      screen: 'ModulationLab',
      features: ['4 LFOs', 'Visual Routing', '16 Destinations', 'Bipolar Mod'],
    },
    {
      id: 'preset',
      title: 'PRESET LABORATORY',
      subtitle: 'MORPH ENGINE',
      description: 'Preset creation and morphing with parameter automation',
      icon: '🧪',
      color: HAOS_COLORS.pink,
      gradient: [HAOS_COLORS.pink, '#cc0f6f'],
      screen: 'PresetLab',
      features: ['Preset Morphing', 'Parameter Automation', 'Tag Search', 'Cloud Save'],
    },
    {
      id: 'orchestral',
      title: 'ORCHESTRAL STUDIO',
      subtitle: 'VIRTUAL INSTRUMENTS',
      description: 'Virtual instrument studio with articulation controls',
      icon: '🎻',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#4a0873'],
      screen: 'OrchestralStudio',
      features: ['10 Instruments', '40+ Articulations', 'Expression', 'Ensemble'],
    },
  ];
  
  const navigateToStudio = (studio) => {
    if (studio.comingSoon) {
      return;
    }
    
    navigation.navigate(studio.screen);
  };
  
  const animatePress = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#000814', '#001029', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HAOS.fm</Text>
          <Text style={styles.subtitle}>STUDIO COLLECTION</Text>
          <Text style={styles.description}>
            Choose your synthesis environment
          </Text>
        </View>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Studio Cards */}
          {studios.map((studio, index) => (
            <Animated.View
              key={studio.id}
              style={[
                styles.studioCard,
                {
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  animatePress(index);
                  navigateToStudio(studio);
                }}
                disabled={studio.comingSoon}
              >
                <LinearGradient
                  colors={studio.gradient}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {studio.comingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>COMING SOON</Text>
                    </View>
                  )}
                  
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{studio.icon}</Text>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle}>{studio.title}</Text>
                      <Text style={styles.cardSubtitle}>{studio.subtitle}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.cardDescription}>
                    {studio.description}
                  </Text>
                  
                  <View style={styles.featuresContainer}>
                    {studio.features.map((feature, idx) => (
                      <View key={idx} style={styles.featurePill}>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.launchText}>
                      {studio.comingSoon ? 'IN DEVELOPMENT' : 'LAUNCH STUDIO →'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>COLLECTION STATS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Studios</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>60+</Text>
                <Text style={styles.statLabel}>Presets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>Instruments</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>LFOs</Text>
              </View>
            </View>
          </View>
          
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>💡 QUICK TIPS</Text>
            <Text style={styles.infoText}>
              • Bass Studio: Perfect for sub-bass and wobble sounds
            </Text>
            <Text style={styles.infoText}>
              • Arp Studio: Create evolving melodic patterns
            </Text>
            <Text style={styles.infoText}>
              • Wavetable Studio: Advanced wavetable morphing
            </Text>
            <Text style={styles.infoText}>
              • Orchestral Studio: Virtual instruments with articulations
            </Text>
            <Text style={styles.infoText}>
              • Modulation Lab: Complex modulation routing
            </Text>
            <Text style={styles.infoText}>
              • Preset Lab: Morph between presets seamlessly
            </Text>
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: HAOS_COLORS.green,
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
    marginTop: 5,
    letterSpacing: 2,
  },
  description: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    marginTop: 10,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  studioCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: HAOS_COLORS.dark,
    letterSpacing: 1,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.8)',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  featurePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    color: HAOS_COLORS.dark,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardFooter: {
    marginTop: 10,
  },
  launchText: {
    color: HAOS_COLORS.dark,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsSection: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: HAOS_COLORS.green + '40',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.green,
    marginBottom: 15,
    letterSpacing: 1,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
  },
  statLabel: {
    fontSize: 12,
    color: HAOS_COLORS.green,
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: HAOS_COLORS.mediumGray,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: HAOS_COLORS.cyan + '40',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.cyan,
    marginBottom: 15,
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 13,
    color: HAOS_COLORS.green,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default StudioSelectorScreen;
