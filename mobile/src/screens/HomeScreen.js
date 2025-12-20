import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../styles/HAOSDesignSystem';
import bridge from '../audio/WebAudioBridge';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <ImageBackground
      source={require('../../assets/dark-fantasy-battle.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Animated glow overlay */}
      <Animated.View style={[styles.glowOverlay, { opacity: glowOpacity }]} />
      
      {/* Dark overlay for better readability */}
      <View style={styles.overlay} />
      
      {/* Animated particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              },
            ]}
          />
        ))}
      </View>

      <Animated.ScrollView style={[styles.scrollView, { opacity: fadeAnim }]}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Animated.View
            style={[
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/haos-logo-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.title}>Hardware Analog{'\n'}Oscillator Synthesis</Text>
          <Text style={styles.subtitle}>
            {user?.display_name ? `Welcome back, ${user.display_name}! 👋` : 'Professional Music Production Platform'}
          </Text>
          {user?.subscription_tier && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.subscription_tier.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          
          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => navigation.navigate('Studio')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>🎛️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>DAW Studio</Text>
              <Text style={styles.cardDescription}>
                Live sequencer with ARP 2600, Juno-106, and Minimoog
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Presets')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>📦</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Browse Presets</Text>
              <Text style={styles.cardDescription}>
                Download professional synth patches
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          {user?.subscription_tier === 'free' && (
            <TouchableOpacity
              style={[styles.card, styles.premiumCard]}
              onPress={() => navigation.navigate('Premium')}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.icon}>⭐</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Go Premium</Text>
                <Text style={styles.cardDescription}>
                  Unlock unlimited downloads & workspaces
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Synth Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎚️ Synth Parameters</Text>
          <Text style={styles.sectionSubtitle}>
            Real-time control over synthesizer parameters
          </Text>

          <View style={styles.synthControlsGrid}>
            <TouchableOpacity
              style={[styles.synthCard, styles.synthCardGreen]}
              onPress={() => navigation.navigate('Studio', { synthType: 'arp2600' })}
            >
              <Text style={styles.synthIcon}>🎹</Text>
              <Text style={styles.synthName}>ARP 2600</Text>
              <Text style={styles.synthDescription}>Modular analog</Text>
              <View style={styles.synthBadge}>
                <Text style={styles.synthBadgeText}>TECHNO</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.synthCard, styles.synthCardOrange]}
              onPress={() => navigation.navigate('Studio', { synthType: 'juno106' })}
            >
              <Text style={styles.synthIcon}>🎼</Text>
              <Text style={styles.synthName}>Juno-106</Text>
              <Text style={styles.synthDescription}>Warm chorus</Text>
              <View style={[styles.synthBadge, styles.synthBadgeOrange]}>
                <Text style={styles.synthBadgeText}>HIP-HOP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.synthCard, styles.synthCardGreen]}
              onPress={() => navigation.navigate('Studio', { synthType: 'minimoog' })}
            >
              <Text style={styles.synthIcon}>🎛️</Text>
              <Text style={styles.synthName}>Minimoog</Text>
              <Text style={styles.synthDescription}>Fat bass</Text>
              <View style={styles.synthBadge}>
                <Text style={styles.synthBadgeText}>HOUSE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bass Manipulation Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎸 Bass Manipulation</Text>
          <Text style={styles.sectionSubtitle}>Professional bass synthesis with slide, pitch bend & vibrato</Text>
          
          <View style={styles.bassControlsGrid}>
            {/* Acid Bassline */}
            <TouchableOpacity
              style={[styles.bassCard, styles.bassCardAcid]}
              onPress={() => {
                setIsPlaying(true);
                // Play TB-303 style acid bassline
                const pattern = [
                  { note: 'C2', slide: true, accent: true, delay: 0 },
                  { note: 'D#2', slide: false, accent: false, delay: 250 },
                  { note: 'G2', slide: true, accent: true, delay: 500 },
                  { note: 'C3', slide: false, accent: false, delay: 750 },
                ];
                
                pattern.forEach(step => {
                  setTimeout(() => {
                    bridge.playBassSlide(step.note, {
                      velocity: 0.8,
                      accent: step.accent,
                      duration: 0.25,
                      slide: step.slide ? 0.08 : 0,
                      vibrato: 0.3,
                    });
                  }, step.delay);
                });
                
                setTimeout(() => setIsPlaying(false), 1000);
              }}
            >
              <Text style={styles.bassIcon}>🔊</Text>
              <Text style={styles.bassTitle}>Acid Slide</Text>
              <Text style={styles.bassDescription}>TB-303 style portamento</Text>
            </TouchableOpacity>

            {/* Sub-Bass Drop */}
            <TouchableOpacity
              style={[styles.bassCard, styles.bassCardSub]}
              onPress={() => {
                setIsPlaying(true);
                bridge.playBassStack('C1', {
                  velocity: 1.0,
                  accent: true,
                  duration: 2.0,
                  octaves: 3,
                });
                setTimeout(() => setIsPlaying(false), 2000);
              }}
            >
              <Text style={styles.bassIcon}>💥</Text>
              <Text style={styles.bassTitle}>Sub Drop</Text>
              <Text style={styles.bassDescription}>3-octave stack</Text>
            </TouchableOpacity>

            {/* Wobble Bass */}
            <TouchableOpacity
              style={[styles.bassCard, styles.bassCardWobble]}
              onPress={() => {
                setIsPlaying(true);
                bridge.playBassSlide('E1', {
                  velocity: 0.95,
                  accent: true,
                  duration: 1.5,
                  pitchBend: -5,
                  vibrato: 0.8,
                  subOsc: true,
                });
                setTimeout(() => setIsPlaying(false), 1500);
              }}
            >
              <Text style={styles.bassIcon}>🌊</Text>
              <Text style={styles.bassTitle}>Wobble</Text>
              <Text style={styles.bassDescription}>Pitch bend + vibrato</Text>
            </TouchableOpacity>

            {/* 808 Bass */}
            <TouchableOpacity
              style={[styles.bassCard, styles.bassCard808]}
              onPress={() => {
                setIsPlaying(true);
                const hits = [0, 100, 300, 600];
                hits.forEach(delay => {
                  setTimeout(() => {
                    bridge.playBassStack('F1', {
                      velocity: 0.9,
                      accent: true,
                      duration: 0.15,
                      octaves: 1,
                    });
                  }, delay);
                });
                setTimeout(() => setIsPlaying(false), 700);
              }}
            >
              <Text style={styles.bassIcon}>🥁</Text>
              <Text style={styles.bassTitle}>808 Hits</Text>
              <Text style={styles.bassDescription}>Punchy trap bass</Text>
            </TouchableOpacity>
          </View>

          {/* Bass Parameters Info */}
          <View style={styles.bassInfo}>
            <Text style={styles.bassInfoTitle}>✨ New Features:</Text>
            <Text style={styles.bassInfoText}>
              • Slide/Portamento (0-1s){'\n'}
              • Pitch Bend (±12 semitones){'\n'}
              • Vibrato LFO (5.5 Hz){'\n'}
              • Sub-Oscillator (octave down){'\n'}
              • Octave Stacking (1-3 octaves)
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureGrid}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎛️</Text>
              <Text style={styles.featureText}>Live Controls</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎚️</Text>
              <Text style={styles.featureText}>ADSR Envelope</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>�</Text>
              <Text style={styles.featureText}>Filter Sweep</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>☁️</Text>
              <Text style={styles.featureText}>Cloud Sync</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.6,
    tintColor: COLORS.primary,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    zIndex: 1,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
    opacity: 0.4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  scrollView: {
    flex: 1,
    zIndex: 3,
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 240,
    height: 240,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 38,
    textTransform: 'uppercase',
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCard: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
  },
  premiumCard: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  icon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 20,
    marginTop: -8,
    letterSpacing: 0.3,
  },
  synthControlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  synthCard: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  synthIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  synthName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  synthDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textAlign: 'center',
  },
  synthBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  synthBadgeOrange: {
    backgroundColor: COLORS.secondary,
  },
  synthBadgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  // Bass Manipulation Styles
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bassControlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bassCard: {
    width: '48%',
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  bassCardAcid: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    shadowColor: COLORS.primary,
  },
  bassCardSub: {
    borderColor: '#ff00ff',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    shadowColor: '#ff00ff',
  },
  bassCardWobble: {
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    shadowColor: '#00ffff',
  },
  bassCard808: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
    shadowColor: COLORS.secondary,
  },
  bassIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  bassTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  bassDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  bassInfo: {
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.3)',
  },
  bassInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  bassInfoText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
});
