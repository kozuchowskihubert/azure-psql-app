/**
 * HAOS.fm Enhanced Home Screen V2
 * Professional 8-section navigation matching web platform
 * HOME / WORKSPACE / PLATFORM / SYNTHS / MODULATION / INSTRUMENTS / PRESETS / USER ACCOUNT
 */

import React, { useEffect, useRef, useState } from 'react';
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
import { useAuth } from '../context/AuthContext';
import bridge from '../audio/WebAudioBridge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bgDark: '#0A0A0A',
  bgMedium: '#121212',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.7)',
  
  // Section colors matching web
  orange: '#FF6B35',
  green: '#39FF14',
  blue: '#00D9FF',
  purple: '#FF1493',
  yellow: '#FFD700',
  cyan: '#00FFFF',
  red: '#FF0066',
  pink: '#FF69B4',
};

const NAVIGATION_SECTIONS = [
  {
    id: 'workspace',
    title: 'WORKSPACES',
    subtitle: 'Production Environments',
    icon: '🎬',
    gradient: ['#FF6B35', '#FFAA00'],
    screen: 'WorkspaceScreen',
    description: 'DAW, Techno, Modular & Beat Making'
  },
  {
    id: 'synths',
    title: 'SYNTHESIZERS',
    subtitle: 'Hardware Emulations',
    icon: '🎛️',
    gradient: [COLORS.blue, '#0088FF'],
    screen: 'SynthsScreen',
    description: 'ARP 2600, Juno-106, TB-303 & More'
  },
  {
    id: 'instruments',
    title: 'INSTRUMENTS',
    subtitle: 'Virtual Instruments',
    icon: '🎹',
    gradient: [COLORS.green, '#00FF00'],
    screen: 'InstrumentsScreen',
    description: 'Drums, Piano, Guitar, Bass & Strings'
  },
  {
    id: 'modulation',
    title: 'MODULATION',
    subtitle: 'Effects & Processing',
    icon: '⚡',
    gradient: [COLORS.purple, '#FF3399'],
    screen: 'ModulationScreen',
    description: 'Chorus, Reverb, Delay & Distortion'
  },
  {
    id: 'presets',
    title: 'PRESETS',
    subtitle: '1000+ Factory Sounds',
    icon: '📦',
    gradient: [COLORS.yellow, '#FFAA00'],
    screen: 'PresetsScreen',
    description: 'Browse, Search & Save Presets'
  },
  {
    id: 'platform',
    title: 'PLATFORM',
    subtitle: 'Collaboration & Cloud',
    icon: '🌐',
    gradient: [COLORS.cyan, '#0088FF'],
    screen: 'PlatformScreen',
    description: 'Share, Collaborate & Sync'
  },
  {
    id: 'account',
    title: 'ACCOUNT',
    subtitle: 'Profile & Settings',
    icon: '👤',
    gradient: [COLORS.pink, '#FF3399'],
    screen: 'UserAccountScreen',
    description: 'Subscription, Downloads & Premium'
  },
];

export default function HomeScreenV2({ navigation }) {
  const { user } = useAuth();
  const audioResumed = useRef(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [cardAnimations] = useState(
    NAVIGATION_SECTIONS.map(() => new Animated.Value(0))
  );

  // Resume audio on first interaction
  const handleFirstInteraction = () => {
    if (!audioResumed.current) {
      console.log('🔊 First user interaction - resuming audio...');
      bridge.resumeAudio();
      audioResumed.current = true;
    }
  };

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    Animated.stagger(
      80,
      cardAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const navigateTo = (section) => {
    handleFirstInteraction();
    console.log(`🚀 Navigating to: ${section.title}`);
    navigation.navigate(section.screen, { sectionId: section.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View 
          style={[
            styles.heroHeader,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 107, 53, 0.2)', 'rgba(255, 215, 0, 0.1)', 'rgba(57, 255, 20, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>HAOS.fm</Text>
            <Text style={styles.heroSubtitle}>
              HARDWARE ANALOG OSCILLATOR SYNTHESIS
            </Text>
            {user && (
              <Text style={styles.heroWelcome}>
                Welcome back, {user.displayName || user.email}
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Navigation Grid */}
        <View style={styles.sectionsGrid}>
          {NAVIGATION_SECTIONS.map((section, index) => {
            const translateY = cardAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            });

            return (
              <Animated.View
                key={section.id}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: cardAnimations[index],
                    transform: [{ translateY }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigateTo(section)}
                >
                  <LinearGradient
                    colors={[
                      `${section.gradient[0]}15`,
                      `${section.gradient[1]}10`,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    {/* Glow effect border */}
                    <View 
                      style={[
                        styles.cardBorder,
                        { borderColor: `${section.gradient[0]}40` }
                      ]} 
                    />

                    {/* Icon */}
                    <View style={styles.cardIconContainer}>
                      <Text style={styles.cardIcon}>{section.icon}</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: section.gradient[0] }]}>
                        {section.title}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {section.subtitle}
                      </Text>
                      <Text style={styles.cardDescription}>
                        {section.description}
                      </Text>
                    </View>

                    {/* Arrow indicator */}
                    <View style={styles.cardArrow}>
                      <Text style={[styles.arrowText, { color: section.gradient[0] }]}>
                        →
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Quick Stats Footer */}
        <Animated.View style={[styles.statsFooter, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Factory Presets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Workspaces</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Possibilities</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroHeader: {
    marginTop: 60,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'System',
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroSubtitle: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    textAlign: 'center',
  },
  heroWelcome: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#00FF94', // COLORS.green
    marginTop: 15,
    fontWeight: '500',
  },
  sectionsGrid: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    minHeight: 120,
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
  cardIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
    paddingRight: 80,
  },
  cardTitle: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 24,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
