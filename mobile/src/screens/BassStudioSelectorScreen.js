/**
 * HAOS.fm Bass Studio Selector
 * Professional bass synthesis presets
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
  magenta: '#ff00ff',
  red: '#ff0044',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const BassStudioSelectorScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    Array(7).fill(0).map(() => new Animated.Value(1))
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
  
  const bassPresets = [
    {
      id: 'acid',
      title: 'ACID BASS',
      subtitle: 'TB-303 STYLE',
      description: 'Classic acid sound with slide, accent, and resonant filter sweep',
      icon: '🧪',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'BassStudio',
      params: { preset: 'acid' },
      features: ['Slide', 'Accent', 'Resonance', 'Filter Sweep'],
    },
    {
      id: 'sub',
      title: 'SUB BASS',
      subtitle: 'DEEP LOW END',
      description: 'Pure sub-oscillator bass for deep, clean low frequencies',
      icon: '📻',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#6A0DAD'],
      screen: 'BassStudio',
      params: { preset: 'sub' },
      features: ['Sub Osc', 'Clean', 'Deep', 'Sine Wave'],
    },
    {
      id: 'wobble',
      title: 'WOBBLE BASS',
      subtitle: 'DUBSTEP MODULATION',
      description: 'Aggressive modulated bass with LFO to filter for dubstep',
      icon: '🌊',
      color: HAOS_COLORS.cyan,
      gradient: [HAOS_COLORS.cyan, '#0099cc'],
      screen: 'BassStudio',
      params: { preset: 'wobble' },
      features: ['LFO', 'Filter Mod', 'Aggressive', 'Wobble'],
    },
    {
      id: '808',
      title: '808 BASS',
      subtitle: 'HIP-HOP TRAP',
      description: 'Punchy 808-style bass with short decay for trap and hip-hop',
      icon: '💥',
      color: HAOS_COLORS.orange,
      gradient: [HAOS_COLORS.orange, '#cc6600'],
      screen: 'BassStudio',
      params: { preset: '808' },
      features: ['Punchy', 'Short Decay', 'Trap', 'Hip-Hop'],
    },
    {
      id: 'reese',
      title: 'REESE BASS',
      subtitle: 'DnB CLASSIC',
      description: 'Detuned sawtooth waves for massive drum and bass sound',
      icon: '🎸',
      color: HAOS_COLORS.magenta,
      gradient: [HAOS_COLORS.magenta, '#cc0066'],
      screen: 'BassStudio',
      params: { preset: 'reese' },
      features: ['Detuned', 'Sawtooth', 'DnB', 'Massive'],
    },
    {
      id: 'pluck',
      title: 'PLUCK BASS',
      subtitle: 'PERCUSSIVE',
      description: 'Fast attack, short decay plucked bass for funk and disco',
      icon: '🎵',
      color: HAOS_COLORS.yellow,
      gradient: [HAOS_COLORS.yellow, '#cc9900'],
      screen: 'BassStudio',
      params: { preset: 'pluck' },
      features: ['Fast Attack', 'Short Decay', 'Funk', 'Disco'],
    },
    {
      id: 'studio',
      title: 'BASS STUDIO',
      subtitle: 'FULL SYNTH',
      description: 'Complete bass synthesis studio with all controls and presets',
      icon: '🎚️',
      color: HAOS_COLORS.red,
      gradient: [HAOS_COLORS.red, '#cc0033'],
      screen: 'BassStudio',
      params: { preset: 'custom' },
      features: ['All Presets', 'Modulation', 'Effects', 'ADSR'],
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
          <Text style={styles.headerIcon}>🎸</Text>
          <Text style={styles.headerTitle}>BASS STUDIO</Text>
          <Text style={styles.headerSubtitle}>7 Professional Presets</Text>
        </View>
      </Animated.View>
      
      {/* Bass Preset Cards */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bassPresets.map((bass, index) => (
          <Animated.View
            key={bass.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(bass.screen, bass.params)}
            >
              <LinearGradient
                colors={bass.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{bass.icon}</Text>
                  <View style={styles.cardTitles}>
                    <Text style={styles.cardTitle}>{bass.title}</Text>
                    <Text style={styles.cardSubtitle}>{bass.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.cardDescription}>{bass.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {bass.features.map((feature, idx) => (
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
    borderBottomColor: HAOS_COLORS.magenta,
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
    borderColor: HAOS_COLORS.magenta,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.magenta,
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
    color: HAOS_COLORS.magenta,
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

export default BassStudioSelectorScreen;
