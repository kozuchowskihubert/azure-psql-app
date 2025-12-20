/**
 * HAOS.fm Drum Machines Selector
 * Classic rhythm composers and drum machines
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
  red: '#ff0044',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const DrumMachinesScreen = ({ navigation }) => {
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
    
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 80,
        useNativeDriver: true,
        friction: 8,
      }).start();
    });
  }, []);
  
  const drumMachines = [
    {
      id: 'tr808',
      title: 'TR-808',
      subtitle: 'ANALOG LEGEND',
      description: 'The most iconic drum machine of all time - warm analog sound',
      icon: '🥁',
      color: HAOS_COLORS.orange,
      gradient: [HAOS_COLORS.orange, '#cc6600'],
      screen: 'TR808',
      features: ['16 Steps', 'Analog', 'Bass Punch', 'Classic'],
    },
    {
      id: 'tr909',
      title: 'TR-909',
      subtitle: 'DIGITAL/ANALOG HYBRID',
      description: 'House and techno staple - perfect for electronic music',
      icon: '🎚️',
      color: HAOS_COLORS.cyan,
      gradient: [HAOS_COLORS.cyan, '#0099cc'],
      screen: 'TR909',
      features: ['Digital Cymbals', 'Analog Drums', 'Shuffle', 'MIDI'],
    },
    {
      id: 'linndrum',
      title: 'LINNDRUM',
      subtitle: 'DIGITAL CLASSIC',
      description: 'The sound of 80s pop - crisp digital samples',
      icon: '💾',
      color: HAOS_COLORS.purple,
      gradient: [HAOS_COLORS.purple, '#6A0DAD'],
      screen: 'LinnDrum',
      features: ['15 Sounds', 'Samples', '80s Pop', 'Swing'],
    },
    {
      id: 'cr78',
      title: 'CR-78',
      subtitle: 'VINTAGE RHYTHM',
      description: 'Early programmable rhythm composer with preset patterns',
      icon: '🎵',
      color: HAOS_COLORS.green,
      gradient: [HAOS_COLORS.green, '#00b36b'],
      screen: 'CR78',
      features: ['34 Presets', 'Accent', 'Metal', 'Vintage'],
    },
    {
      id: 'dmx',
      title: 'OBERHEIM DMX',
      subtitle: 'HIP-HOP CLASSIC',
      description: 'The sound of hip-hop and rap - digital samples with punch',
      icon: '🎤',
      color: HAOS_COLORS.red,
      gradient: [HAOS_COLORS.red, '#cc0033'],
      screen: 'DMX',
      features: ['24 Sounds', 'Hip-Hop', 'Tight', 'Punchy'],
    },
    {
      id: 'beatmaker',
      title: 'BEAT MAKER',
      subtitle: 'MODERN STUDIO',
      description: 'Complete beat production studio with all machines',
      icon: '🎛️',
      color: HAOS_COLORS.yellow,
      gradient: [HAOS_COLORS.yellow, '#cc9900'],
      screen: 'BeatMaker',
      features: ['All Drums', 'Sequencer', 'Effects', 'Export'],
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
          <Text style={styles.headerIcon}>🥁</Text>
          <Text style={styles.headerTitle}>DRUM MACHINES</Text>
          <Text style={styles.headerSubtitle}>6 Rhythm Composers</Text>
        </View>
      </Animated.View>
      
      {/* Drum Machine Cards */}
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {drumMachines.map((drum, index) => (
          <Animated.View
            key={drum.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(drum.screen)}
            >
              <LinearGradient
                colors={drum.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{drum.icon}</Text>
                  <View style={styles.cardTitles}>
                    <Text style={styles.cardTitle}>{drum.title}</Text>
                    <Text style={styles.cardSubtitle}>{drum.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.cardDescription}>{drum.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {drum.features.map((feature, idx) => (
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
    borderBottomColor: HAOS_COLORS.orange,
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
    borderColor: HAOS_COLORS.orange,
  },
  backIcon: {
    fontSize: 24,
    color: HAOS_COLORS.orange,
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
    color: HAOS_COLORS.orange,
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

export default DrumMachinesScreen;
