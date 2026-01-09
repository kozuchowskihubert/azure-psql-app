/**
 * HAOS Genre Studio Selector
 * Grid of 9 genre-specific production environments
 * Each studio provides curated presets, BPM ranges, and workflows
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GENRE_STUDIOS } from '../types/presets';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px spacing

// Genre-specific color schemes
const GENRE_COLORS = {
  techno: ['#00FF41', '#00CC34'],
  trance: ['#FF00FF', '#CC00CC'],
  dnb: ['#FF6B35', '#FF4500'],
  dubstep: ['#9B59B6', '#7D3C98'],
  trap: ['#FF4757', '#FF3838'],
  hardstyle: ['#00D9FF', '#00A8CC'],
  futurebass: ['#FFB6C1', '#FF69B4'],
  lofi: ['#C4A484', '#9C8166'],
  ambient: ['#4A90E2', '#357ABD'],
};

export default function GenreStudioSelectScreen({ navigation }) {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const handleStudioPress = (studio) => {
    setSelectedGenre(studio.id);
    // Navigate to individual studio screen after brief highlight
    setTimeout(() => {
      navigation.navigate('GenreStudio', { genreId: studio.id });
      setSelectedGenre(null);
    }, 150);
  };

  const renderStudioCard = (studio) => {
    const colors = GENRE_COLORS[studio.id] || ['#D4AF37', '#B8941F'];
    const isSelected = selectedGenre === studio.id;

    return (
      <TouchableOpacity
        key={studio.id}
        onPress={() => handleStudioPress(studio)}
        activeOpacity={0.7}
        style={[
          styles.card,
          isSelected && styles.cardSelected,
        ]}
      >
        <LinearGradient
          colors={[
            `${colors[0]}15`,
            `${colors[1]}25`,
          ]}
          style={styles.cardGradient}
        >
          {/* Studio Emoji */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{studio.emoji}</Text>
          </View>

          {/* Studio Name */}
          <Text style={styles.studioName}>{studio.name}</Text>

          {/* BPM Range */}
          <View style={styles.bpmBadge}>
            <Text style={[styles.bpmText, { color: colors[0] }]}>
              {studio.bpmRange[0]}-{studio.bpmRange[1]} BPM
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {studio.description}
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {studio.features.slice(0, 2).map((feature, idx) => (
              <View key={idx} style={styles.featurePill}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Border Accent */}
          <View style={[styles.borderAccent, { backgroundColor: colors[0] }]} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎛️ Genre Studios</Text>
        <Text style={styles.subtitle}>
          Production environments tailored for each genre
        </Text>
      </View>

      {/* Studios Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {GENRE_STUDIOS.map(renderStudioCard)}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Info Footer */}
      <BlurView intensity={95} tint="dark" style={styles.footer}>
        <Text style={styles.footerText}>
          ✨ Each studio includes curated presets, optimized BPM ranges, and genre-specific workflows
        </Text>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardSelected: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  cardGradient: {
    padding: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    minHeight: 220,
    position: 'relative',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
  },
  studioName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  bpmBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  bpmText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
    marginBottom: 12,
  },
  features: {
    flexDirection: 'column',
    gap: 6,
  },
  featurePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  borderAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.6,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
