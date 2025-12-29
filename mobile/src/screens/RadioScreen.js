/**
 * HAOS.fm Radio - Electronic Music Streaming
 * Azure Blob Storage Integration
 * HAOS Themed Design
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
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// HAOS Components & Theme
import HAOSHeader from '../components/HAOSHeader';
import { HAOS_COLORS, HAOS_GRADIENTS } from '../styles/HAOSTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://haos.fm/api';


const RadioScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // State
  const [channels, setChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Fetch channels from API on mount
  useEffect(() => {
    fetchChannels();
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  /**
   * Fetch radio channels from Azure Blob Storage API
   */
  const fetchChannels = async () => {
    try {
      setIsLoadingChannels(true);
      const response = await fetch(`${API_BASE_URL}/radio/channels`);
      const data = await response.json();
      
      if (data.success && data.channels) {
        // Add metadata to channels
        const enhancedChannels = data.channels.map(ch => ({
          ...ch,
          subtitle: getChannelSubtitle(ch.id),
          description: getChannelDescription(ch.id),
        }));
        setChannels(enhancedChannels);
        console.log(`✅ Loaded ${data.channels.length} radio channels from Azure`);
      } else {
        console.warn('No channels available, using fallback');
        setChannels(getMockChannels());
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      // Fallback to mock channels if API fails
      setChannels(getMockChannels());
    } finally {
      setIsLoadingChannels(false);
    }
  };

  /**
   * Get subtitle for channel
   */
  const getChannelSubtitle = (channelId) => {
    const subtitles = {
      techno: 'Underground Beats',
      house: 'Deep Grooves',
      trance: 'Uplifting Energy',
      trap: 'Heavy Bass',
      ambient: 'Atmospheric',
      dnb: 'Breakbeat Energy',
    };
    return subtitles[channelId] || 'Electronic Music';
  };

  /**
   * Get description for channel
   */
  const getChannelDescription = (channelId) => {
    const descriptions = {
      techno: 'Deep underground techno from Berlin to Detroit',
      house: 'Classic house vibes and modern deep grooves',
      trance: 'Euphoric trance anthems and progressive journeys',
      trap: 'Hard-hitting trap and bass music',
      ambient: 'Ambient soundscapes and downtempo chill',
      dnb: 'Fast-paced jungle and liquid DnB',
    };
    return descriptions[channelId] || 'Curated electronic music';
  };

  /**
   * Mock channels for development
   */
  const getMockChannels = () => {
    return [
      {
        id: 'techno',
        name: 'TECHNO',
        icon: '⚡',
        color: HAOS_COLORS.gold,
        trackCount: 0,
        tracks: [],
        subtitle: 'Underground Beats',
        description: 'Deep underground techno from Berlin to Detroit',
      },
      {
        id: 'house',
        name: 'HOUSE',
        icon: '🏠',
        color: HAOS_COLORS.orange,
        trackCount: 0,
        tracks: [],
        subtitle: 'Deep Grooves',
        description: 'Classic house vibes and modern deep grooves',
      },
      {
        id: 'trance',
        name: 'TRANCE',
        icon: '🌀',
        color: HAOS_COLORS.silver,
        trackCount: 0,
        tracks: [],
        subtitle: 'Uplifting Energy',
        description: 'Euphoric trance anthems and progressive journeys',
      },
      {
        id: 'trap',
        name: 'TRAP',
        icon: '💥',
        color: HAOS_COLORS.gold,
        trackCount: 0,
        tracks: [],
        subtitle: 'Heavy Bass',
        description: 'Hard-hitting trap and bass music',
      },
      {
        id: 'ambient',
        name: 'AMBIENT',
        icon: '🌊',
        color: HAOS_COLORS.silver,
        trackCount: 0,
        tracks: [],
        subtitle: 'Atmospheric',
        description: 'Ambient soundscapes and downtempo chill',
      },
      {
        id: 'dnb',
        name: 'DRUM & BASS',
        icon: '🔊',
        color: HAOS_COLORS.orange,
        trackCount: 0,
        tracks: [],
        subtitle: 'Breakbeat Energy',
        description: 'Fast-paced jungle and liquid DnB',
      },
    ];
  };

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isPlaying]);

  // Load and play channel
  const playChannel = async (channel) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsLoading(true);

      // Check if channel has tracks
      if (!channel.tracks || channel.tracks.length === 0) {
        console.warn(`No tracks available for ${channel.name}`);
        alert(`${channel.name} channel has no tracks yet. Please add tracks to this channel.`);
        setIsLoading(false);
        return;
      }

      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Get track URL from Azure Blob Storage
      const trackIndex = currentChannel?.id === channel.id ? currentTrackIndex : 0;
      const track = channel.tracks[trackIndex];
      
      if (!track || !track.url) {
        console.error('Invalid track data:', track);
        alert('Error loading track. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log(`🎵 Playing: ${track.name} from ${channel.name}`);
      console.log(`📍 URL: ${track.url}`);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { 
          shouldPlay: true, 
          volume: volume,
          isLooping: false, // We'll handle track progression
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentChannel(channel);
      setCurrentTrackIndex(trackIndex);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing channel:', error);
      alert(`Failed to play ${channel.name}. ${error.message}`);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Playback status callback
  const onPlaybackStatusUpdate = async (status) => {
    if (status.isLoaded) {
      // Track finished - play next track in playlist
      if (status.didJustFinish && !status.isLooping) {
        await playNextTrack();
      }
      if (status.error) {
        console.error('Playback error:', status.error);
        setIsPlaying(false);
      }
    }
  };

  /**
   * Play next track in current channel
   */
  const playNextTrack = async () => {
    if (!currentChannel || !currentChannel.tracks) return;

    const nextIndex = (currentTrackIndex + 1) % currentChannel.tracks.length;
    setCurrentTrackIndex(nextIndex);
    
    // Play next track
    await playChannel(currentChannel);
  };

  /**
   * Play previous track in current channel
   */
  const playPreviousTrack = async () => {
    if (!currentChannel || !currentChannel.tracks) return;

    const prevIndex = currentTrackIndex === 0 
      ? currentChannel.tracks.length - 1 
      : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    
    // Play previous track
    await playChannel(currentChannel);
  };

  // Stop playback
  const stopPlayback = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setIsPlaying(false);
      setCurrentChannel(null);
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  // Update volume
  const updateVolume = async (newVolume) => {
    setVolume(newVolume);
    if (sound) {
      try {
        await sound.setVolumeAsync(newVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HAOSHeader
        title="RADIO"
        subtitle="ELECTRONIC STREAMS"
        navigation={navigation}
        showBack={true}
        rightButtons={[
          {
            icon: isPlaying ? '⏸' : '📻',
            onPress: () => {
              if (isPlaying) {
                stopPlayback();
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
          },
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 80, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Now Playing Section */}
        {currentChannel && (
          <Animated.View
            style={[
              styles.nowPlayingSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[currentChannel.color + '40', currentChannel.color + '10']}
              style={styles.nowPlayingGradient}
            >
              <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
              <View style={styles.nowPlayingContent}>
                <Text style={styles.nowPlayingIcon}>{currentChannel.icon}</Text>
                <View style={styles.nowPlayingInfo}>
                  <Text style={styles.nowPlayingName}>{currentChannel.name}</Text>
                  <Text style={styles.nowPlayingSubtitle}>{currentChannel.subtitle}</Text>
                  {/* Track Name */}
                  {currentChannel.tracks && currentChannel.tracks[currentTrackIndex] && (
                    <Text style={styles.nowPlayingTrack}>
                      🎵 {currentChannel.tracks[currentTrackIndex].name}
                    </Text>
                  )}
                  {/* Track Counter */}
                  {currentChannel.tracks && currentChannel.tracks.length > 0 && (
                    <Text style={styles.nowPlayingCounter}>
                      Track {currentTrackIndex + 1} of {currentChannel.tracks.length}
                    </Text>
                  )}
                </View>
              </View>

              {/* Audio Visualizer Placeholder */}
              <View style={styles.visualizer}>
                {[...Array(16)].map((_, i) => {
                  const animatedHeight = waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      10 + Math.sin(i * 0.5) * 20,
                      30 + Math.sin(i * 0.5 + Math.PI) * 20,
                    ],
                  });
                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.visualizerBar,
                        {
                          height: isPlaying ? animatedHeight : 10,
                          backgroundColor: currentChannel.color,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Stop Button */}
              <View style={styles.playbackControls}>
                <TouchableOpacity
                  style={[styles.controlButton, { borderColor: currentChannel.color }]}
                  onPress={playPreviousTrack}
                  disabled={!currentChannel.tracks || currentChannel.tracks.length <= 1}
                >
                  <Text style={[styles.controlButtonText, { color: currentChannel.color }]}>
                    ⏮
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.stopButton, { borderColor: currentChannel.color }]}
                  onPress={stopPlayback}
                >
                  <Text style={[styles.stopButtonText, { color: currentChannel.color }]}>
                    ⏹ STOP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { borderColor: currentChannel.color }]}
                  onPress={playNextTrack}
                  disabled={!currentChannel.tracks || currentChannel.tracks.length <= 1}
                >
                  <Text style={[styles.controlButtonText, { color: currentChannel.color }]}>
                    ⏭
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Volume Control */}
        <View style={styles.volumeSection}>
          <Text style={styles.volumeLabel}>🔊 VOLUME</Text>
          <View style={styles.volumeControl}>
            <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
            <Slider
              style={styles.volumeSlider}
              value={volume}
              onValueChange={updateVolume}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor={HAOS_COLORS.gold}
              maximumTrackTintColor={HAOS_COLORS.surface}
              thumbTintColor={HAOS_COLORS.gold}
            />
          </View>
        </View>

        {/* Channels Grid */}
        <Text style={styles.sectionTitle}>
          SELECT CHANNEL {isLoadingChannels && '(Loading...)'}
        </Text>
        
        {isLoadingChannels ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={HAOS_COLORS.gold} />
            <Text style={styles.loadingText}>Loading channels from Azure...</Text>
          </View>
        ) : channels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📻</Text>
            <Text style={styles.emptyText}>No radio channels available</Text>
            <Text style={styles.emptySubtext}>
              Upload audio files to Azure Blob Storage to create channels
            </Text>
          </View>
        ) : (
          <View style={styles.channelsGrid}>
            {channels.map((channel, index) => (
              <Animated.View
                key={channel.id}
                style={[
                  styles.channelCardWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.channelCard,
                    currentChannel?.id === channel.id && styles.channelCardActive,
                    channel.trackCount === 0 && styles.channelCardDisabled,
                  ]}
                  onPress={() => playChannel(channel)}
                  disabled={isLoading || channel.trackCount === 0}
                >
                  <LinearGradient
                    colors={[channel.color + '30', channel.color + '10']}
                    style={styles.channelGradient}
                  >
                    <Text style={styles.channelIcon}>{channel.icon}</Text>
                    <Text style={[styles.channelName, { color: channel.color }]}>
                      {channel.name}
                    </Text>
                    <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
                    <Text style={styles.channelDescription}>{channel.description}</Text>

                    {/* Track Count Badge */}
                    <View style={[styles.trackCountBadge, { backgroundColor: channel.color }]}>
                      <Text style={styles.trackCountText}>
                        {channel.trackCount || 0} tracks
                      </Text>
                    </View>

                    {/* Loading Indicator */}
                    {isLoading && currentChannel?.id === channel.id && (
                      <ActivityIndicator
                        color={channel.color}
                        style={styles.loadingIndicator}
                      />
                    )}

                    {/* Playing Indicator */}
                    {isPlaying && currentChannel?.id === channel.id && !isLoading && (
                      <Animated.View
                        style={[
                          styles.playingIndicator,
                          {
                            opacity: pulseAnim.interpolate({
                              inputRange: [1, 1.15],
                              outputRange: [0.6, 1],
                            }),
                          },
                        ]}
                      >
                        <Text style={[styles.playingText, { color: channel.color }]}>
                          ▶ LIVE
                        </Text>
                      </Animated.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📻 ABOUT HAOS RADIO</Text>
          <Text style={styles.infoText}>
            Stream curated electronic music channels 24/7. From underground techno to ambient
            soundscapes, discover the best electronic music from around the world.
          </Text>
          <Text style={styles.infoNote}>
            Note: Streams require internet connection. Data rates may apply.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Now Playing Section
  nowPlayingSection: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
  },
  nowPlayingGradient: {
    padding: 20,
  },
  nowPlayingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 2,
    marginBottom: 15,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nowPlayingIcon: {
    fontSize: 60,
    marginRight: 20,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 5,
  },
  nowPlayingSubtitle: {
    fontSize: 14,
    color: HAOS_COLORS.silver,
    letterSpacing: 1,
  },
  nowPlayingTrack: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    fontWeight: '600',
  },
  nowPlayingCounter: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    marginTop: 5,
  },

  // Visualizer
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  visualizerBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: HAOS_COLORS.gold,
  },

  // Stop Button & Controls
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    minWidth: 50,
  },
  controlButtonText: {
    fontSize: 20,
    color: HAOS_COLORS.gold,
  },
  stopButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 2,
  },

  // Volume Section
  volumeSection: {
    backgroundColor: HAOS_COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: HAOS_COLORS.gold,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 1,
    marginBottom: 15,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    width: 60,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 2,
    marginBottom: 20,
  },

  // Channels Grid
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  channelCardWrapper: {
    width: (SCREEN_WIDTH - 60) / 2,
    marginBottom: 20,
  },
  channelCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: HAOS_COLORS.gold,
  },
  channelCardActive: {
    borderColor: HAOS_COLORS.orange,
    borderWidth: 3,
  },
  channelCardDisabled: {
    opacity: 0.5,
  },
  channelGradient: {
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
  },
  channelSubtitle: {
    fontSize: 12,
    color: HAOS_COLORS.silver,
    marginBottom: 10,
    textAlign: 'center',
  },
  channelDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 10,
  },
  trackCountBadge: {
    backgroundColor: HAOS_COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  trackCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  playingIndicator: {
    marginTop: 10,
  },
  playingText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Loading & Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: HAOS_COLORS.silver,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HAOS_COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: HAOS_COLORS.silver,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Info Section
  infoSection: {
    backgroundColor: HAOS_COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: HAOS_COLORS.silver,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    marginBottom: 10,
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 10,
  },
  infoNote: {
    fontSize: 11,
    color: HAOS_COLORS.silver,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default RadioScreen;
