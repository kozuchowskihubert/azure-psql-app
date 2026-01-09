/**
 * HAOS.fm CREATOR Screen
 * Minimal & Modern Design - Gold, Silver, Orange Theme
 * Phase 1 Instruments Collection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// HAOS Minimal Color Palette
const COLORS = {
  bgDark: '#000000',
  bgCard: 'rgba(15, 15, 15, 0.95)',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  silver: '#C0C0C0',
  silverDark: '#A0A0A0',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(212, 175, 55, 0.3)',
};

const CreatorScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Phase 1 Pilot Instruments - Matching web version
  const instruments = [
    {
      id: 'piano',
      name: 'Piano',
      icon: '🎹',
      category: 'keys',
      description: 'Classic Grand Piano',
      route: 'Piano', // TODO: Create PianoScreen
      gradient: ['#D4AF37', '#FFD700'],
    },
    {
      id: 'violin',
      name: 'Violin',
      icon: '🎻',
      category: 'strings',
      description: 'Orchestral Strings',
      route: 'Violin', // TODO: Create ViolinScreen
      gradient: ['#C0C0C0', '#A0A0A0'],
    },
    {
      id: 'arp2600',
      name: 'ARP 2600',
      icon: '🎛️',
      category: 'synths',
      description: 'Semi-Modular Synth • 152 Presets',
      route: 'ARP2600Complete',
      gradient: ['#FF6B35', '#FF8C5A'],
    },
    {
      id: 'juno106',
      name: 'Juno-106',
      icon: '🎻',
      category: 'synths',
      description: 'Warm Analog Synth • 20 Presets',
      route: 'Juno106',
      gradient: ['#9D4EDD', '#C77DFF'],
    },
    {
      id: 'minimoog',
      name: 'Minimoog',
      icon: '💎',
      category: 'synths',
      description: 'Legendary Bass Synth • 20 Presets',
      route: 'Minimoog',
      gradient: ['#0066FF', '#3399FF'],
    },
    {
      id: 'patternstudio',
      name: 'Pattern Studio',
      icon: '🎵',
      category: 'production',
      description: '152 Presets • 875 Patterns • Multi-Layer Mixer',
      route: 'PatternStudio',
      gradient: ['#00d9ff', '#00a8cc'],
    },
    {
      id: 'genrestudios',
      name: 'Genre Studios',
      icon: '🎛️',
      category: 'production',
      description: '9 Studios • Techno • Trance • DnB • Dubstep',
      route: 'GenreStudioSelect',
      gradient: ['#FF00FF', '#CC00CC'],
    },
    {
      id: 'samplebrowser',
      name: 'Sample Browser',
      icon: '🔊',
      category: 'production',
      description: '1247 Samples • ARP-2600 • TB-303 • TR-808',
      route: 'SampleBrowser',
      gradient: ['#D4AF37', '#FFD700'],
    },
    {
      id: 'drums',
      name: 'Drums',
      icon: '🥁',
      category: 'drums',
      description: 'Beat Maker Studio',
      route: 'BeatMaker', // Using existing BeatMaker
      gradient: ['#FFD700', '#FF6B35'],
    },
    {
      id: 'bass',
      name: 'Bass Studio',
      icon: '🎸',
      category: 'bass',
      description: 'Professional Bass Synth',
      route: 'BassStudio',
      gradient: ['#C0C0C0', '#D4AF37'],
    },
    {
      id: 'daw',
      name: 'DAW Studio',
      icon: '🎚️',
      category: 'production',
      description: 'Complete DAW Environment',
      route: 'DAWStudio',
      gradient: ['#FF6B35', '#D4AF37'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '🎵' },
    { id: 'keys', name: 'Keys', icon: '🎹' },
    { id: 'strings', name: 'Strings', icon: '🎻' },
    { id: 'synths', name: 'Synths', icon: '🎛️' },
    { id: 'drums', name: 'Drums', icon: '🥁' },
    { id: 'bass', name: 'Bass', icon: '🎸' },
    { id: 'production', name: 'Studio', icon: '🎚️' },
  ];

  const filteredInstruments = selectedCategory === 'all'
    ? instruments
    : instruments.filter(i => i.category === selectedCategory);

  const handleInstrumentPress = (instrument) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (instrument.route) {
      navigation.navigate(instrument.route);
    } else {
      alert(`${instrument.name} coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Minimal Header with HAOS Logo */}
      <LinearGradient
        colors={['#000000', 'rgba(0, 0, 0, 0.8)']}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/haos-logo-white.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.headerTitle}>CREATOR</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => alert('Radio coming soon!')}
          >
            <Text style={styles.headerBtnText}>📻</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.headerBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter - Minimal Pill Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryPill,
              selectedCategory === cat.id && styles.categoryPillActive
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat.id);
            }}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextActive
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Instruments Grid - Minimal Cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Phase 1 Pilot Collection</Text>
        
        <View style={styles.grid}>
          {filteredInstruments.map((instrument) => (
            <TouchableOpacity
              key={instrument.id}
              style={styles.card}
              onPress={() => handleInstrumentPress(instrument)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={instrument.gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardIcon}>{instrument.icon}</Text>
                  <Text style={styles.cardName}>{instrument.name}</Text>
                  <Text style={styles.cardDescription}>
                    {instrument.description}
                  </Text>
                </View>
                
                {/* Shine effect */}
                <View style={styles.cardShine} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Radio Section - Coming Soon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HAOS Radio</Text>
          <TouchableOpacity
            style={styles.radioCard}
            onPress={() => alert('Radio streaming coming soon!')}
          >
            <LinearGradient
              colors={['#C0C0C0', '#D4AF37']}
              style={styles.radioGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.radioIcon}>📻</Text>
              <Text style={styles.radioTitle}>Live 24/7 Stream</Text>
              <Text style={styles.radioSubtitle}>Coming Soon</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  logoContainer: {
    width: 80,
    height: 40,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerBtnText: {
    fontSize: 18,
  },
  
  // Category Filter
  categoryScroll: {
    flexGrow: 0,
    marginTop: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#FFD700',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  categoryTextActive: {
    color: '#000000',
  },
  
  // Scrollable Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 1,
  },
  
  // Instruments Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 40,
  },
  card: {
    width: (width - 55) / 2, // 2 columns
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
  },
  cardShine: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
  },
  
  // Radio Section
  section: {
    marginTop: 20,
  },
  radioCard: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  radioGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  radioIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  radioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  radioSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export default CreatorScreen;
