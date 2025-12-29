/**
 * HAOS.fm LIBRARY Screen
 * V3 CREATOR Theme - Gold/Silver/Orange Design
 * 
 * Sections:
 * - Radio (Azure Blob Storage streaming)
 * - Samples (User uploads, preset packs)
 * - Projects (Saved sessions)
 */

import React, { useState } from 'react';
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

// HAOS V3 CREATOR Color Palette
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

const LibraryScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('radio');

  const libraryCategories = [
    { id: 'radio', name: 'Radio', icon: '📻' },
    { id: 'samples', name: 'Samples', icon: '🔊' },
    { id: 'projects', name: 'Projects', icon: '💾' },
  ];

  const radioChannels = [
    {
      id: 'techno',
      name: 'Techno',
      icon: '⚡',
      description: 'Hard-hitting 130-150 BPM',
      listeners: '1.2K',
      gradient: ['#FF6B35', '#FF8C5A'],
      route: 'Radio',
    },
    {
      id: 'house',
      name: 'House',
      icon: '🏠',
      description: 'Classic 4/4 grooves',
      listeners: '890',
      gradient: ['#D4AF37', '#FFD700'],
      route: 'Radio',
    },
    {
      id: 'ambient',
      name: 'Ambient',
      icon: '🌊',
      description: 'Atmospheric soundscapes',
      listeners: '650',
      gradient: ['#C0C0C0', '#A0A0A0'],
      route: 'Radio',
    },
    {
      id: 'dnb',
      name: 'Drum & Bass',
      icon: '🔥',
      description: 'Fast breakbeats 160-180',
      listeners: '1.5K',
      gradient: ['#FF8C5A', '#FF6B35'],
      route: 'Radio',
    },
  ];

  const samplePacks = [
    {
      id: 'bass_pack',
      name: 'Bass Essentials',
      icon: '🎸',
      samples: 50,
      size: '12 MB',
      gradient: ['#D4AF37', '#FFD700'],
    },
    {
      id: 'drums_pack',
      name: 'Drum Hits Vol. 1',
      icon: '🥁',
      samples: 120,
      size: '28 MB',
      gradient: ['#FF6B35', '#FF8C5A'],
    },
    {
      id: 'synth_pack',
      name: 'Analog Synths',
      icon: '🎛️',
      samples: 80,
      size: '18 MB',
      gradient: ['#C0C0C0', '#A0A0A0'],
    },
  ];

  const recentProjects = [
    {
      id: 'proj1',
      name: 'Techno Track 01',
      date: '2 hours ago',
      duration: '3:45',
      icon: '🎵',
      gradient: ['#FF6B35', '#FF8C5A'],
    },
    {
      id: 'proj2',
      name: 'Ambient Experiment',
      date: '1 day ago',
      duration: '5:20',
      icon: '🎵',
      gradient: ['#C0C0C0', '#A0A0A0'],
    },
    {
      id: 'proj3',
      name: 'Bass Jam Session',
      date: '3 days ago',
      duration: '2:15',
      icon: '🎵',
      gradient: ['#D4AF37', '#FFD700'],
    },
  ];

  const handleCategoryPress = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  };

  const handleRadioPress = (channel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Radio', { channelId: channel.id });
  };

  const handleSamplePress = (pack) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to sample pack screen
    alert(`${pack.name} - Coming Soon!`);
  };

  const handleProjectPress = (project) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Load project in Studio
    alert(`Loading ${project.name}...`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
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
        
        <Text style={styles.headerTitle}>LIBRARY</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => alert('Search coming soon!')}
          >
            <Text style={styles.headerBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {libraryCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryPill,
              selectedCategory === cat.id && styles.categoryPillActive
            ]}
            onPress={() => handleCategoryPress(cat.id)}
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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* RADIO SECTION */}
        {selectedCategory === 'radio' && (
          <>
            <Text style={styles.sectionTitle}>Live Radio Channels</Text>
            <Text style={styles.sectionSubtitle}>
              Streaming 24/7 from Azure Blob Storage
            </Text>
            
            <View style={styles.grid}>
              {radioChannels.map((channel) => (
                <TouchableOpacity
                  key={channel.id}
                  style={styles.card}
                  onPress={() => handleRadioPress(channel)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={channel.gradient}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardIcon}>{channel.icon}</Text>
                      <Text style={styles.cardName}>{channel.name}</Text>
                      <Text style={styles.cardDescription}>
                        {channel.description}
                      </Text>
                      <View style={styles.listenersBadge}>
                        <Text style={styles.listenersText}>
                          👥 {channel.listeners}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardShine} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* SAMPLES SECTION */}
        {selectedCategory === 'samples' && (
          <>
            <Text style={styles.sectionTitle}>Sample Packs</Text>
            <Text style={styles.sectionSubtitle}>
              Professional sounds for your productions
            </Text>
            
            <View style={styles.grid}>
              {samplePacks.map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={styles.card}
                  onPress={() => handleSamplePress(pack)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={pack.gradient}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardIcon}>{pack.icon}</Text>
                      <Text style={styles.cardName}>{pack.name}</Text>
                      <View style={styles.packInfo}>
                        <Text style={styles.packInfoText}>
                          {pack.samples} samples
                        </Text>
                        <Text style={styles.packInfoText}>
                          {pack.size}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardShine} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* PROJECTS SECTION */}
        {selectedCategory === 'projects' && (
          <>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <Text style={styles.sectionSubtitle}>
              Your saved sessions and exports
            </Text>
            
            <View style={styles.projectsList}>
              {recentProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => handleProjectPress(project)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={project.gradient}
                    style={styles.projectGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.projectIcon}>{project.icon}</Text>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectDate}>{project.date}</Text>
                    </View>
                    <Text style={styles.projectDuration}>{project.duration}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  
  // Grid Cards
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 40,
  },
  card: {
    width: (width - 55) / 2,
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
    marginBottom: 8,
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
  
  // Radio specific
  listenersBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listenersText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  
  // Sample Pack specific
  packInfo: {
    alignItems: 'center',
    gap: 4,
  },
  packInfoText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Projects List
  projectsList: {
    gap: 12,
  },
  projectCard: {
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  projectGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  projectIcon: {
    fontSize: 32,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  projectDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});

export default LibraryScreen;
