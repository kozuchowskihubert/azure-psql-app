/**
 * HAOS.fm ARP 2600 - Redesigned Compact Version
 * Focus: Real samples, compact presets, clear UX
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const HAOS_COLORS = {
  orange: '#FF6B35',
  cyan: '#00D9FF',
  green: '#00ff94',
  purple: '#9D4EDD',
  pink: '#FF006E',
  dark: '#0a0a0a',
  cardBg: '#1a1a1a',
  border: '#333',
};

// Compact preset definitions with real sample mapping
const PRESETS = {
  // BASS Category
  acidBass: {
    name: '🔊 ACID BASS',
    category: 'bass',
    color: ['#FF6B35', '#FF8C5A'],
    sample: require('../../assets/sounds/bass/bass_acid_C2.wav'),
    description: 'Squelchy 303-style acid',
  },
  subBass: {
    name: '💎 SUB BASS',
    category: 'bass',
    color: ['#9D4EDD', '#B24BF3'],
    sample: require('../../assets/sounds/bass/bass_sub_C1.wav'),
    description: 'Deep sub frequencies',
  },
  growlBass: {
    name: '🐻 GROWL BASS',
    category: 'bass',
    color: ['#FF006E', '#FF3385'],
    sample: require('../../assets/sounds/bass/bass_growl_low.wav'),
    description: 'Aggressive modulated',
  },
  acidG2: {
    name: '🎵 ACID HIGH',
    category: 'bass',
    color: ['#FF8C5A', '#FFB380'],
    sample: require('../../assets/sounds/bass/bass_acid_G2.wav'),
    description: 'High note acid bass',
  },
  growlMid: {
    name: '🔥 GROWL MID',
    category: 'bass',
    color: ['#E91E63', '#F48FB1'],
    sample: require('../../assets/sounds/bass/bass_growl_mid.wav'),
    description: 'Mid-range growl',
  },
  subE1: {
    name: '🌊 SUB E1',
    category: 'bass',
    color: ['#3F51B5', '#7986CB'],
    sample: require('../../assets/sounds/bass/bass_sub_E1.wav'),
    description: 'Deep E1 sub bass',
  },
  subG1: {
    name: '💎 SUB G1',
    category: 'bass',
    color: ['#009688', '#4DB6AC'],
    sample: require('../../assets/sounds/bass/bass_sub_G1.wav'),
    description: 'Deep G1 sub bass',
  },
  
  // LEAD Category
  leadAcid: {
    name: '⚡ ACID LEAD',
    category: 'lead',
    color: ['#00D9FF', '#00ff94'],
    sample: require('../../assets/sounds/bass/bass_acid_E2.wav'),
    description: 'Bright resonant lead',
  },
  
  // TECHNO Category
  technoLoop: {
    name: '🔁 TECHNO LOOP',
    category: 'techno',
    color: ['#FF6B35', '#00D9FF'],
    sample: require('../../assets/sounds/bass/bass_arpeggio_120bpm.wav'),
    description: '120 BPM arpeggio',
  },
  technoFast: {
    name: '⚡ FAST LOOP',
    category: 'techno',
    color: ['#9D4EDD', '#00ff94'],
    sample: require('../../assets/sounds/bass/bass_arpeggio_140bpm.wav'),
    description: '140 BPM techno',
  },
};

const CATEGORIES = ['all', 'bass', 'lead', 'techno'];

const ARP2600ScreenCompact = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadPreset = async (presetId) => {
    try {
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      setSelectedPreset(presetId);
      const preset = PRESETS[presetId];

      // Load and play sample
      const { sound: newSound } = await Audio.Sound.createAsync(
        preset.sample,
        { shouldPlay: true, isLooping: false }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Reset playing state when done
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      console.log(`🎵 Loaded preset: ${preset.name}`);
    } catch (error) {
      console.error('❌ Error loading preset:', error);
    }
  };

  const playCurrentPreset = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.replayAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('❌ Error playing sound:', error);
    }
  };

  const getFilteredPresets = () => {
    if (selectedCategory === 'all') {
      return Object.keys(PRESETS);
    }
    return Object.keys(PRESETS).filter(
      (key) => PRESETS[key].category === selectedCategory
    );
  };

  const renderPresetCard = ({ item: presetId }) => {
    const preset = PRESETS[presetId];
    const isActive = selectedPreset === presetId;

    return (
      <TouchableOpacity
        onPress={() => loadPreset(presetId)}
        activeOpacity={0.7}
        style={styles.compactPresetCard}
      >
        <LinearGradient
          colors={preset.color}
          style={[
            styles.presetGradient,
            isActive && styles.presetActive,
          ]}
        >
          <Text style={styles.presetEmoji}>
            {preset.name.split(' ')[0]}
          </Text>
          <Text style={styles.presetName} numberOfLines={1}>
            {preset.name.split(' ').slice(1).join(' ')}
          </Text>
          <Text style={styles.presetDescription} numberOfLines={1}>
            {preset.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[HAOS_COLORS.orange, '#FF8C5A', HAOS_COLORS.dark]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>ARP 2600</Text>
          <Text style={styles.subtitle}>SEMI-MODULAR SYNTH</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>SAMPLES</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🎵 Real audio samples • Tap preset to play
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compact Preset Grid - Horizontal Scroll */}
        <View style={styles.presetSection}>
          <Text style={styles.sectionTitle}>
            {getFilteredPresets().length} Presets
          </Text>

          <FlatList
            horizontal
            data={getFilteredPresets()}
            renderItem={renderPresetCard}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetList}
          />
        </View>

        {/* Currently Playing */}
        {selectedPreset && (
          <View style={styles.nowPlaying}>
            <LinearGradient
              colors={PRESETS[selectedPreset].color}
              style={styles.nowPlayingGradient}
            >
              <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
              <Text style={styles.nowPlayingName}>
                {PRESETS[selectedPreset].name}
              </Text>
              <Text style={styles.nowPlayingDesc}>
                {PRESETS[selectedPreset].description}
              </Text>

              <TouchableOpacity
                onPress={playCurrentPreset}
                style={styles.playButton}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Quick Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎛️ About ARP 2600</Text>
          <Text style={styles.infoDetails}>
            Semi-modular analog synthesizer featuring three oscillators, a
            ladder filter, and a flexible patch bay. Famous for its warm,
            rich bass sounds and expressive leads.
          </Text>
          <Text style={[styles.infoDetails, { marginTop: 8 }]}>
            💡 Tip: Each preset uses real audio samples for authentic sound.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    backgroundColor: 'rgba(255,107,53,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,107,53,0.3)',
  },
  infoText: {
    fontSize: 14,
    color: HAOS_COLORS.orange,
    textAlign: 'center',
    fontWeight: '600',
  },
  categoryScroll: {
    marginTop: 16,
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  categoryTabActive: {
    backgroundColor: HAOS_COLORS.orange,
    borderColor: HAOS_COLORS.orange,
  },
  categoryText: {
    fontSize: 12,
    color: HAOS_COLORS.orange,
    fontWeight: '600',
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: '#fff',
  },
  presetSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 1,
  },
  presetList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  compactPresetCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: HAOS_COLORS.border,
  },
  presetGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  presetActive: {
    borderColor: '#fff',
    borderWidth: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  presetEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  nowPlaying: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: HAOS_COLORS.orange,
  },
  nowPlayingGradient: {
    padding: 24,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  nowPlayingName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  nowPlayingDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  playButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    backgroundColor: HAOS_COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HAOS_COLORS.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.orange,
    marginBottom: 12,
  },
  infoDetails: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
});

export default ARP2600ScreenCompact;
