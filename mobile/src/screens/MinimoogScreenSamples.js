/**
 * HAOS.fm Minimoog - Sample-Based Version
 * Uses real recorded samples instead of Web Audio synthesis
 * Horizontal scrolling presets with instant playback
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  blue: '#0066FF',
  red: '#FF0033',
  cyan: '#00D9FF',
  green: '#00ff94',
  dark: '#0a0a0a',
  gold: '#D4AF37',
  silver: '#c0c0c0',
};

// Sample-based presets using real recordings
const PRESETS = {
  // BASS Category
  subBass: {
    name: '🌀 SUB BASS',
    category: 'bass',
    color: ['#0066FF', '#00D9FF'],
    sample: require('../../assets/sounds/bass/bass_sub_C1.wav'),
    description: 'Deep sub frequencies',
  },
  acidBass: {
    name: '🔊 ACID BASS',
    category: 'bass',
    color: ['#FF6B35', '#FF8C5A'],
    sample: require('../../assets/sounds/bass/bass_acid_C2.wav'),
    description: 'Squelchy 303-style',
  },
  growlBass: {
    name: '🐻 GROWL BASS',
    category: 'bass',
    color: ['#FF006E', '#FF3385'],
    sample: require('../../assets/sounds/bass/bass_growl_low.wav'),
    description: 'Aggressive modulated',
  },
  
  // LEAD Category
  brightLead: {
    name: '⚡ BRIGHT LEAD',
    category: 'lead',
    color: ['#00D9FF', '#00ff94'],
    sample: require('../../assets/sounds/synths/synth_lead_A4.wav'),
    description: 'Cutting lead tone',
  },
  highLead: {
    name: '🎵 HIGH LEAD',
    category: 'lead',
    color: ['#FFD700', '#FFA500'],
    sample: require('../../assets/sounds/synths/synth_lead_C5.wav'),
    description: 'Upper register lead',
  },
  
  // PAD Category
  warmPad: {
    name: '🌊 WARM PAD',
    category: 'pad',
    color: ['#9D4EDD', '#C77DFF'],
    sample: require('../../assets/sounds/synths/synth_pad_A3.wav'),
    description: 'Lush atmosphere',
  },
  deepPad: {
    name: '💎 DEEP PAD',
    category: 'pad',
    color: ['#3F51B5', '#7986CB'],
    sample: require('../../assets/sounds/synths/synth_pad_C4.wav'),
    description: 'Rich harmonics',
  },
  etherealPad: {
    name: '✨ ETHEREAL PAD',
    category: 'pad',
    color: ['#E91E63', '#F48FB1'],
    sample: require('../../assets/sounds/synths/synth_pad_E4.wav'),
    description: 'Floating textures',
  },
  
  // PATTERN Category (Pre-recorded sequences)
  technoLoop: {
    name: '🔁 TECHNO LOOP',
    category: 'pattern',
    color: ['#FF6B35', '#00D9FF'],
    sample: require('../../assets/sounds/bass/bass_arpeggio_120bpm.wav'),
    description: '120 BPM sequence',
  },
  fastLoop: {
    name: '⚡ FAST LOOP',
    category: 'pattern',
    color: ['#9D4EDD', '#00ff94'],
    sample: require('../../assets/sounds/bass/bass_arpeggio_140bpm.wav'),
    description: '140 BPM techno',
  },
};

const CATEGORIES = ['all', 'bass', 'lead', 'pad', 'pattern'];

const MinimoogScreenSamples = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Setup audio mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadPreset = async (presetId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      setSelectedPreset(presetId);
      const preset = PRESETS[presetId];

      // Load and play sample
      const { sound: newSound } = await Audio.Sound.createAsync(
        preset.sample,
        { shouldPlay: true, isLooping: false, volume: 0.8 }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Reset playing state when done
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      console.log(`🎵 Loaded Minimoog preset: ${preset.name}`);
    } catch (error) {
      console.error('❌ Error loading preset:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const getFilteredPresets = () => {
    return Object.entries(PRESETS)
      .filter(([_, preset]) => 
        selectedCategory === 'all' || preset.category === selectedCategory
      )
      .map(([id, preset]) => ({ id, ...preset }));
  };

  const renderPresetCard = ({ item }) => {
    const isSelected = selectedPreset === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => loadPreset(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.color}
          style={[
            styles.compactPresetCard,
            isSelected && styles.selectedCard,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text style={styles.presetEmoji}>{item.name.split(' ')[0]}</Text>
          <Text style={styles.presetName}>
            {item.name.split(' ').slice(1).join(' ')}
          </Text>
          {isSelected && (
            <View style={styles.playingIndicator}>
              <Text style={styles.playingText}>
                {isPlaying ? '▶' : '⏸'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategoryButton = (category) => {
    const isActive = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
        onPress={() => {
          setSelectedCategory(category);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
          {category.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0066FF', '#00D9FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← BACK</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MINIMOOG</Text>
          <Text style={styles.headerSubtitle}>SAMPLE BASED</Text>
        </View>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Now Playing Card */}
        {selectedPreset && (
          <View style={styles.nowPlayingSection}>
            <LinearGradient
              colors={PRESETS[selectedPreset].color}
              style={styles.nowPlayingCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.nowPlayingHeader}>
                <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <Text style={styles.playPauseText}>
                    {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.nowPlayingName}>
                {PRESETS[selectedPreset].name}
              </Text>
              <Text style={styles.nowPlayingDescription}>
                {PRESETS[selectedPreset].description}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(renderCategoryButton)}
          </View>
        </View>

        {/* Preset Cards - Horizontal Scroll */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionLabel}>
            {selectedCategory === 'all' ? 'ALL PRESETS' : selectedCategory.toUpperCase()}
            {' '}({getFilteredPresets().length})
          </Text>
          <FlatList
            horizontal
            data={getFilteredPresets()}
            renderItem={renderPresetCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.presetList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['rgba(0, 102, 255, 0.1)', 'rgba(0, 217, 255, 0.1)']}
            style={styles.infoBannerGradient}
          >
            <Text style={styles.infoBannerTitle}>🎹 MINIMOOG SAMPLES</Text>
            <Text style={styles.infoBannerText}>
              Real recorded samples • {Object.keys(PRESETS).length} quality presets
            </Text>
            <Text style={styles.infoBannerText}>
              4 categories: Bass, Lead, Pad, Pattern
            </Text>
          </LinearGradient>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>ABOUT SAMPLE-BASED SYNTHESIS</Text>
          <Text style={styles.aboutText}>
            This version uses high-quality recorded samples instead of real-time synthesis.
            Perfect for instant sound, consistent playback, and authentic analog character.
          </Text>
          <Text style={styles.aboutText}>
            • Instant playback - no synthesis latency{'\n'}
            • Authentic analog warmth{'\n'}
            • Pre-recorded patterns ready to use{'\n'}
            • Consistent sound across devices
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  headerRight: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  
  // Now Playing Section
  nowPlayingSection: {
    padding: 20,
  },
  nowPlayingCard: {
    borderRadius: 20,
    padding: 25,
    minHeight: 140,
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  nowPlayingLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  playPauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  playPauseText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nowPlayingName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  nowPlayingDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Category Section
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    color: HAOS_COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: HAOS_COLORS.gold,
    borderColor: HAOS_COLORS.gold,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#000',
  },
  
  // Presets Section
  presetsSection: {
    marginBottom: 25,
  },
  presetList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  compactPresetCard: {
    width: 140,
    height: 160,
    marginRight: 12,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: HAOS_COLORS.gold,
  },
  presetEmoji: {
    fontSize: 36,
    textAlign: 'center',
  },
  presetName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  playingIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 4,
    alignItems: 'center',
  },
  playingText: {
    color: '#FFF',
    fontSize: 16,
  },
  
  // Info Banner
  infoBanner: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
  },
  infoBannerGradient: {
    padding: 20,
  },
  infoBannerTitle: {
    color: HAOS_COLORS.cyan,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 1,
  },
  infoBannerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 5,
  },
  
  // About Section
  aboutSection: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aboutTitle: {
    color: HAOS_COLORS.gold,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
  },
  aboutText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default MinimoogScreenSamples;
