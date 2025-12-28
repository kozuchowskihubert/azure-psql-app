/**
 * HAOS.fm Welcome Screen - Persona Selection
 * User selects: MUSICIAN / PRODUCER / ADVENTURER
 * Based on haos-platform.html design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// HAOS Color System - Monotone Orange + Gray
const COLORS = {
  bgDark: '#050508',
  bgCard: 'rgba(15, 15, 20, 0.8)',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  orangeDark: '#CC5529',
  gray: '#808080',
  grayLight: '#A0A0A0',
  grayDark: '#404040',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.6)',
  border: 'rgba(255, 107, 53, 0.2)',
};

// Persona definitions with routing
const PERSONAS = [
  {
    id: 'musician',
    title: 'MUSICIAN',
    emoji: '🎹',
    description: 'Create music, compose tracks',
    route: 'Creator', // CREATOR (STUDIO)
    gradient: [COLORS.orange, COLORS.orangeLight],
    features: ['Live Recording', 'MIDI Tools', 'Real-time FX'],
  },
  {
    id: 'producer',
    title: 'PRODUCER',
    emoji: '🎛️',
    description: 'Mix, master, produce beats',
    route: 'Instruments', // INSTRUMENTS
    gradient: [COLORS.orangeDark, COLORS.orange],
    features: ['Virtual Instruments', 'Synthesizers', 'Drum Machines'],
  },
  {
    id: 'adventurer',
    title: 'ADVENTURER',
    emoji: '✨',
    description: 'Explore sounds, discover presets',
    route: 'Sounds', // PRESETS (SOUNDS)
    gradient: [COLORS.gray, COLORS.grayLight],
    features: ['Preset Library', 'Sound Browser', 'Quick Jams'],
  },
];

const WelcomeScreen = ({ navigation }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);

  const handlePersonaSelect = async (persona) => {
    setSelectedPersona(persona.id);
    
    // Save persona preference
    await AsyncStorage.setItem('userPersona', persona.id);
    await AsyncStorage.setItem('welcomeCompleted', 'true');
    
    // Navigate to main app with persona-specific default tab
    setTimeout(() => {
      navigation.replace('Main', { 
        initialRoute: persona.route,
        persona: persona.id 
      });
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Circuit Board Background */}
      <View style={styles.backgroundPattern}>
        {/* Animated circuit lines */}
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.circuitLine,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() * 200 + 50,
                opacity: Math.random() * 0.3 + 0.1,
              },
            ]}
          />
        ))}
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>HAOS</Text>
          <Text style={styles.logoSubtext}>.fm</Text>
        </View>
        <Text style={styles.tagline}>DIGITAL AUDIO WORKSTATION</Text>
      </View>

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>WHO ARE YOU?</Text>
        <Text style={styles.subtitle}>
          Choose your path to start creating
        </Text>
      </View>

      {/* Persona Cards */}
      <View style={styles.personasContainer}>
        {PERSONAS.map((persona, index) => {
          const isSelected = selectedPersona === persona.id;
          
          return (
            <TouchableOpacity
              key={persona.id}
              activeOpacity={0.9}
              onPress={() => handlePersonaSelect(persona)}
              style={[
                styles.personaCard,
                isSelected && styles.personaCardSelected,
              ]}
            >
              <LinearGradient
                colors={[
                  `${persona.gradient[0]}20`,
                  `${persona.gradient[1]}10`,
                ]}
                style={styles.personaGradient}
              >
                {/* Emoji Icon */}
                <View style={[
                  styles.emojiContainer,
                  { backgroundColor: `${persona.gradient[0]}30` }
                ]}>
                  <Text style={styles.emoji}>{persona.emoji}</Text>
                </View>

                {/* Title */}
                <Text style={[
                  styles.personaTitle,
                  { color: persona.gradient[0] }
                ]}>
                  {persona.title}
                </Text>

                {/* Description */}
                <Text style={styles.personaDescription}>
                  {persona.description}
                </Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {persona.features.map((feature, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.featurePill,
                        { backgroundColor: `${persona.gradient[0]}15` }
                      ]}
                    >
                      <Text style={[
                        styles.featureText,
                        { color: persona.gradient[0] }
                      ]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓ SELECTED</Text>
                  </View>
                )}

                {/* Border Glow */}
                <View style={[
                  styles.cardBorder,
                  { borderColor: isSelected ? persona.gradient[0] : COLORS.border }
                ]} />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SSO Button */}
      <TouchableOpacity
        style={styles.ssoButton}
        onPress={() => {
          // For now, skip to default persona
          handlePersonaSelect(PERSONAS[0]);
        }}
      >
        <Text style={styles.ssoText}>CONTINUE AS GUEST</Text>
        <Text style={styles.ssoSubtext}>
          Or sign in later to save your work
        </Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>v1.5.0 • Build 6</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circuitLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  logoSubtext: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.orange,
    marginLeft: 4,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 3,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  personasContainer: {
    flex: 1,
    gap: 20,
  },
  personaCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 160,
  },
  personaCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  personaGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 20,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  personaTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
  },
  personaDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  featurePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  ssoButton: {
    marginTop: 20,
    padding: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  ssoText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
    letterSpacing: 1,
  },
  ssoSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  version: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
});

export default WelcomeScreen;
