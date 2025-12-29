/**
 * HAOS.fm Workspaces Screen
 * Production environments: DAW Studio, Techno, Modular, Beat Maker
 */

import React, { useState, useEffect } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bgDark: '#0A0A0A',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.7)',
  orange: '#FF6B35',
  green: '#39FF14',
  blue: '#00D9FF',
  purple: '#FF1493',
};

const WORKSPACES = [
  {
    id: 'haos-studio',
    name: 'HAOS STUDIO',
    description: 'Complete production environment',
    icon: '🎹',
    gradient: ['#FF6B35', '#FFAA00'],
    features: ['Full DAW', 'Mixer', 'Arrangement', 'Automation'],
    screen: 'DAWStudio'
  },
  {
    id: 'techno-workspace',
    name: 'TECHNO WORKSPACE',
    description: 'Detroit techno with TB-303 & TR-909',
    icon: '⚡',
    gradient: [COLORS.green, '#00FF00'],
    features: ['TB-303', 'TR-909', 'Effects', 'Sequencer'],
    screen: 'TechnoWorkspace'
  },
  {
    id: 'modular-synth',
    name: 'MODULAR SYNTH',
    description: 'ARP 2600, Juno-106, Minimoog',
    icon: '🎛️',
    gradient: [COLORS.blue, '#0088FF'],
    features: ['ARP 2600', 'Juno-106', 'Minimoog', 'TB-303'],
    screen: 'ModularSynth'
  },
  {
    id: 'beat-maker',
    name: 'BEAT MAKER',
    description: 'Pattern sequencer & drum machine',
    icon: '🥁',
    gradient: [COLORS.purple, '#FF3399'],
    features: ['16 Steps', 'Patterns', 'Arrangement', 'Export'],
    screen: 'BeatMaker'
  },
  {
    id: 'bass-studio',
    name: 'BASS STUDIO',
    description: 'Professional bass synthesizer',
    icon: '🎸',
    gradient: [COLORS.green, '#4AFF14'],
    features: ['Dual OSC', 'Filter', 'ADSR', 'Effects', 'Presets'],
    screen: 'BassStudio'
  },
];

export default function WorkspaceScreen({ navigation }) {
  const [animations] = useState(
    WORKSPACES.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    // Staggered entrance animation
    Animated.stagger(
      100,
      animations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 30,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleWorkspaceSelect = (workspace) => {
    console.log(`🚀 Opening workspace: ${workspace.name}`);
    navigation.navigate(workspace.screen, { workspaceId: workspace.id });
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
          <Text style={styles.headerIcon}>🎬</Text>
          <Text style={styles.headerTitle}>WORKSPACES</Text>
          <Text style={styles.headerSubtitle}>Production Environments</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {WORKSPACES.map((workspace, index) => {
          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          });

          return (
            <Animated.View
              key={workspace.id}
              style={[
                styles.workspaceCard,
                {
                  opacity: animations[index],
                  transform: [{ translateY }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleWorkspaceSelect(workspace)}
              >
                <LinearGradient
                  colors={[
                    `${workspace.gradient[0]}20`,
                    `${workspace.gradient[1]}10`,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  {/* Border glow */}
                  <View 
                    style={[
                      styles.cardBorder,
                      { borderColor: `${workspace.gradient[0]}50` }
                    ]} 
                  />

                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{workspace.icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <Text style={[styles.workspaceName, { color: workspace.gradient[0] }]}>
                      {workspace.name}
                    </Text>
                    <Text style={styles.workspaceDescription}>
                      {workspace.description}
                    </Text>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                      {workspace.features.map((feature, idx) => (
                        <View 
                          key={idx}
                          style={[
                            styles.featureBadge,
                            { backgroundColor: `${workspace.gradient[0]}20` }
                          ]}
                        >
                          <Text 
                            style={[
                              styles.featureText,
                              { color: workspace.gradient[0] }
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
                    <Text style={[styles.arrow, { color: workspace.gradient[0] }]}>
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
    color: '#FF6B35',
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
  workspaceCard: {
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    minHeight: 140,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
  },
  cardContent: {
    paddingRight: 90,
  },
  workspaceName: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  workspaceDescription: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
    lineHeight: 20,
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
