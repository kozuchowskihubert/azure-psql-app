/**
 * HAOS.fm LIBRARY Screen
 * V3 CREATOR Theme - Gold/Silver/Orange Design
 * 
 * Sections:
 * - Radio (Azure Blob Storage streaming)
 * - Samples (User uploads, preset packs)
 * - Projects (Saved sessions)
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://haos.fm/api';

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
  
  // Radio state
  const [radioSound, setRadioSound] = useState(null);
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [radioChannels, setRadioChannels] = useState([]);
  const [loadingRadio, setLoadingRadio] = useState(false);
  const [currentRadioTrack, setCurrentRadioTrack] = useState(null);

  // Initialize audio and fetch radio channels
  useEffect(() => {
    const initRadio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        fetchRadioChannels();
      } catch (error) {
        console.error('Radio init error:', error);
      }
    };

    initRadio();

    return () => {
      if (radioSound) {
        radioSound.unloadAsync();
      }
    };
  }, []);

  // Fetch radio channels from Azure Blob Storage
  const fetchRadioChannels = async () => {
    try {
      setLoadingRadio(true);
      const response = await fetch(`${API_BASE_URL}/radio/channels`);
      const data = await response.json();
      
      if (data.success && data.channels) {
        setRadioChannels(data.channels);
        console.log(`✅ Loaded ${data.channels.length} radio channels`);
      }
    } catch (error) {
      console.error('Error fetching radio channels:', error);
    } finally {
      setLoadingRadio(false);
    }
  };

  // Play radio track from blob storage
  const playRadioTrack = async (channel, trackIndex = 0) => {
    try {
      // Stop current track if playing
      if (radioSound) {
        await radioSound.unloadAsync();
        setRadioSound(null);
      }

      const track = channel.tracks[trackIndex];
      if (!track) {
        console.warn('No track found at index', trackIndex);
        return;
      }

      setLoadingRadio(true);
      setCurrentRadioTrack({ channel, trackIndex, track });

      // Get track URL from API
      const response = await fetch(`${API_BASE_URL}/radio/track/${track.id}`);
      const data = await response.json();

      if (!data.success || !data.url) {
        console.error('Failed to get track URL');
        return;
      }

      console.log(`🎵 Playing: ${track.title} from ${channel.name}`);

      // Load and play audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.url },
        { shouldPlay: true, volume: 0.8 },
        (status) => {
          if (status.didJustFinish) {
            // Auto-play next track
            const nextIndex = (trackIndex + 1) % channel.tracks.length;
            playRadioTrack(channel, nextIndex);
          }
        }
      );

      setRadioSound(newSound);
      setIsPlayingRadio(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error playing radio track:', error);
    } finally {
      setLoadingRadio(false);
    }
  };

  // Stop radio playback
  const stopRadio = async () => {
    if (radioSound) {
      await radioSound.stopAsync();
      await radioSound.unloadAsync();
      setRadioSound(null);
    }
    setIsPlayingRadio(false);
    setCurrentRadioTrack(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const libraryCategories = [
    { id: 'radio', name: 'Radio', icon: '📻' },
    { id: 'samples', name: 'Samples', icon: '🔊' },
    { id: 'projects', name: 'Projects', icon: '💾' },
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
            <Text style={styles.sectionTitle}>📻 Demo Tracks Radio</Text>
            <Text style={styles.sectionSubtitle}>
              Professional electronic music from Azure Blob Storage
            </Text>

            {/* Now Playing Card */}
            {currentRadioTrack && (
              <View style={styles.nowPlaying}>
                <LinearGradient
                  colors={['#D4AF3740', '#D4AF3720']}
                  style={styles.nowPlayingGradient}
                >
                  <Text style={styles.nowPlayingTitle}>NOW PLAYING</Text>
                  <Text style={styles.nowPlayingTrack}>{currentRadioTrack.track.title}</Text>
                  <Text style={styles.nowPlayingChannel}>{currentRadioTrack.channel.name}</Text>
                  <TouchableOpacity style={styles.stopButton} onPress={stopRadio}>
                    <LinearGradient
                      colors={['#ff0000', '#cc0000']}
                      style={styles.stopButtonGradient}
                    >
                      <Text style={styles.stopButtonText}>⏹ STOP</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
            
            {loadingRadio ? (
              <ActivityIndicator size="large" color={COLORS.gold} style={{ marginVertical: 40 }} />
            ) : (
              <>
                <View style={styles.radioGrid}>
                  {radioChannels.map((channel) => (
                    <TouchableOpacity
                      key={channel.id}
                      style={[
                        styles.radioChannelCard,
                        currentRadioTrack?.channel.id === channel.id && styles.radioChannelCardActive,
                      ]}
                      onPress={() => playRadioTrack(channel, 0)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.radioChannelIcon}>{channel.icon || '🎵'}</Text>
                      <Text style={styles.radioChannelName}>{channel.name}</Text>
                      <Text style={styles.radioChannelCount}>{channel.trackCount || 0} tracks</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {radioChannels.length === 0 && !loadingRadio && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateEmoji}>📻</Text>
                    <Text style={styles.emptyStateText}>
                      No demo tracks available yet
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Upload tracks to Azure Blob Storage to start streaming
                    </Text>
                  </View>
                )}
              </>
            )}
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
  
  // Radio specific styles
  nowPlaying: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  nowPlayingGradient: {
    padding: 20,
    alignItems: 'center',
  },
  nowPlayingTitle: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  nowPlayingTrack: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  nowPlayingChannel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  stopButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  radioChannelCard: {
    width: (width - 64) / 3,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  radioChannelCardActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  radioChannelIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  radioChannelName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  radioChannelCount: {
    fontSize: 10,
    color: COLORS.textDim,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textDim,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LibraryScreen;

