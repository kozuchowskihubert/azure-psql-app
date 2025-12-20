/**
 * HAOS.fm Synthesizers Selector
 * All hardware synth emulations in one place
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
  cyan: '#00ffff',
  orange: '#ff8800',
  purple: '#8B5CF6',
  pink: '#ff00ff',
  yellow: '#FFD700',
  blue: '#00D9FF',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const SynthselectorScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    Array(8).fill(0).map(() => new Animated.Value(1))
  ).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 80,
        useNativeDriver: true,
        friction: 8,
      }).start();
    });
  }, []);
  
  const synths = [
    {
      id: 'arp2600',
      title: 'ARP 2600',
      subtitle: 'MODULAR LEGEND',
      description: 'Semi-modular analog synthesizer with patchbay and 3 VCOs',
      icon: '🎛️',
      color: HAOS_COLORS.blue,
      gradient: [HAOS_COLORS.blue, '#0099cc'],
      screen: 'ARP2600',
      features: ['3 VCOs', 'Patch Matrix', 'Ring Mod', 'Sample & Hold'],
    },
    {
      id: 'juno106',
      title: 'JUNO-106',
      subtitle: 'ANALOG POLYSYNTH',
      description: 'Classic 6-voice polyphonic synth with iconic chorus effect',
      icon: '🎹',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#6A0DAD'],
      screen: 'Juno106',
      features: ['6-Voice Poly', 'Chorus', 'PWM', 'Sub Oscillator'],
    },
    {
      id: 'minimoog',
      title: 'MINIMOOG',
      subtitle: 'BASS KING',
      description: 'The legendary monophonic synthesizer - king of bass and leads',
      icon: '🔊',
      color: HAOS_COLORS.orange,
      gradient: [HAOS_COLORS.orange, '#cc6600'],
      screen: 'Minimoog',
      features: ['3 VCOs', 'Ladder Filter', 'Glide', 'Monophonic'],
    },
    {
      id: 'tb303',
      title: 'TB-303',
      subtitle: 'ACID MACHINE',
      description: 'Iconic acid bass synthesizer with pattern sequencer',
      icon: '🧪',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'TB303',
      features: ['Acid Bass', 'Sequencer', 'Accent', 'Slide'],
    },
    {
      id: 'dx7',
      title: 'DX7',
      subtitle: 'FM SYNTHESIS',
      description: 'Digital FM synthesis legend with 6 operators and 32 algorithms',
      icon: '✨',
      color: HAOS_COLORS.pink,
      gradient: [HAOS_COLORS.pink, '#cc0066'],
      screen: 'DX7',
      features: ['6 Operators', 'FM', '32 Algorithms', 'Digital'],
    },
    {
      id: 'ms20',
      title: 'MS-20',
      subtitle: 'SEMI-MODULAR',
      description: 'Aggressive semi-modular synth with dual filters and patchbay',
      icon: '⚡',
      color: HAOS_COLORS.yellow,
      gradient: [HAOS_COLORS.yellow, '#cc9900'],
      screen: 'MS20',
      features: ['2 VCOs', 'HPF + LPF', 'Patch Bay', 'Aggressive'],
    },
    {
      id: 'prophet5',
      title: 'PROPHET-5',
      subtitle: 'POLY LEGEND',
      description: 'First fully programmable polyphonic synthesizer - 5 voices',
      icon: '👑',
      color: HAOS_COLORS.cyan,
      gradient: [HAOS_COLORS.cyan, '#0099cc'],
      screen: 'Prophet5',
      features: ['5-Voice Poly', 'Programmable', 'Curtis Filter', 'Vintage'],
    },
    {
      id: 'studio',
      title: 'DAW STUDIO',
      subtitle: 'ALL SYNTHS',
      description: 'Complete studio with all synthesizers and sequencer',
      icon: '🎚️',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'Studio',
      features: ['All Synths', 'Sequencer', 'Presets', 'Effects'],
    },
  ];
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🎹</Text>
          <Text style={styles.headerTitle}>SYNTHESIZERS</Text>
          <Text style={styles.headerSubtitle}>8 Hardware Emulations</Text>
        </View>
      </Animated.View>
      
      {/* Studio Cards */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {synths.map((synth, index) => (
          <Animated.View
            key={synth.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(synth.screen)}
            >
              <LinearGradient
                colors={synth.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{synth.icon}</Text>
                  <View style={styles.cardTitles}>
                    <Text style={styles.cardTitle}>{synth.title}</Text>
                    <Text style={styles.cardSubtitle}>{synth.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.cardDescription}>{synth.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {synth.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureBadge}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.launchText}>LAUNCH →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.dark,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: HAOS_COLORS.darkGray,
    borderBottomWidth: 2,
    borderBottomColor: HAOS_COLORS.green,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HAOS_COLORS.green,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.green,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: HAOS_COLORS.green,
    letterSpacing: 1,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  cardTitles: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  launchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
});

export default SynthselectorScreen;
