/**
 * HAOS.fm Effects Selector
 * Professional effects chain and processing
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
  magenta: '#ff00ff',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const EffectsSelectorScreen = ({ navigation }) => {
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
  
  const effects = [
    {
      id: 'reverb',
      title: 'REVERB',
      subtitle: 'SPACE & AMBIENCE',
      description: 'Hall, Room, and Plate reverb algorithms for spatial depth',
      icon: '🌌',
      color: HAOS_COLORS.blue,
      gradient: [HAOS_COLORS.blue, '#0099cc'],
      screen: 'Effects',
      params: { effect: 'reverb' },
      features: ['Hall', 'Room', 'Plate', 'Spring'],
    },
    {
      id: 'delay',
      title: 'DELAY',
      subtitle: 'ECHO & REPEAT',
      description: 'Ping-pong, tape, and analog delay effects with feedback',
      icon: '⏱️',
      color: HAOS_COLORS.cyan,
      gradient: [HAOS_COLORS.cyan, '#0099cc'],
      screen: 'Effects',
      params: { effect: 'delay' },
      features: ['Ping-Pong', 'Tape', 'Analog', 'Sync'],
    },
    {
      id: 'distortion',
      title: 'DISTORTION',
      subtitle: 'DRIVE & SATURATION',
      description: 'Overdrive, fuzz, and bit-crush distortion effects',
      icon: '🔥',
      color: HAOS_COLORS.orange,
      gradient: [HAOS_COLORS.orange, '#cc6600'],
      screen: 'Effects',
      params: { effect: 'distortion' },
      features: ['Overdrive', 'Fuzz', 'Bit Crush', 'Saturation'],
    },
    {
      id: 'filter',
      title: 'FILTER',
      subtitle: 'FREQUENCY SHAPING',
      description: 'Low-pass, high-pass, and band-pass filters with resonance',
      icon: '🎚️',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'Effects',
      params: { effect: 'filter' },
      features: ['LP', 'HP', 'BP', 'Resonance'],
    },
    {
      id: 'modulation',
      title: 'MODULATION',
      subtitle: 'CHORUS & PHASE',
      description: 'Chorus, flanger, and phaser for movement and width',
      icon: '🌊',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#6A0DAD'],
      screen: 'Effects',
      params: { effect: 'modulation' },
      features: ['Chorus', 'Flanger', 'Phaser', 'Tremolo'],
    },
    {
      id: 'dynamics',
      title: 'DYNAMICS',
      subtitle: 'COMPRESSION & LIMITING',
      description: 'Compressor, limiter, and gate for dynamic control',
      icon: '📊',
      color: HAOS_COLORS.yellow,
      gradient: [HAOS_COLORS.yellow, '#cc9900'],
      screen: 'Effects',
      params: { effect: 'dynamics' },
      features: ['Compressor', 'Limiter', 'Gate', 'Expander'],
    },
    {
      id: 'eq',
      title: 'EQ',
      subtitle: 'FREQUENCY CONTROL',
      description: '3-band and parametric EQ for tonal shaping',
      icon: '🎛️',
      color: HAOS_COLORS.magenta,
      gradient: [HAOS_COLORS.magenta, '#cc0066'],
      screen: 'Effects',
      params: { effect: 'eq' },
      features: ['3-Band', 'Parametric', 'High Shelf', 'Low Shelf'],
    },
    {
      id: 'studio',
      title: 'EFFECTS STUDIO',
      subtitle: 'FULL CHAIN',
      description: 'Complete effects chain with all processors and routing',
      icon: '🎚️',
      color: HAOS_COLORS.pink,
      gradient: [HAOS_COLORS.pink, '#cc0066'],
      screen: 'Effects',
      params: { effect: 'chain' },
      features: ['Chain', 'Routing', 'Presets', 'Bypass'],
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
          <Text style={styles.headerIcon}>🎚️</Text>
          <Text style={styles.headerTitle}>EFFECTS</Text>
          <Text style={styles.headerSubtitle}>8 Effect Categories</Text>
        </View>
      </Animated.View>
      
      {/* Effects Cards */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {effects.map((effect, index) => (
          <Animated.View
            key={effect.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(effect.screen, effect.params)}
            >
              <LinearGradient
                colors={effect.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{effect.icon}</Text>
                  <View style={styles.cardTitles}>
                    <Text style={styles.cardTitle}>{effect.title}</Text>
                    <Text style={styles.cardSubtitle}>{effect.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.cardDescription}>{effect.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {effect.features.map((feature, idx) => (
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
    borderBottomColor: HAOS_COLORS.yellow,
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
    borderColor: HAOS_COLORS.yellow,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.yellow,
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
    color: HAOS_COLORS.yellow,
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

export default EffectsSelectorScreen;
