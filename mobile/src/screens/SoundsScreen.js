/**
 * HAOS.fm Sounds Screen - Preset Browser
 * Based on preset-library.html and sounds.html
 * Search, filter, preview, and favorite presets
 * Date: December 28, 2025
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../styles/colors';
import { TYPOGRAPHY } from '../styles/typography';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

// Preset Categories
const CATEGORIES = [
  { id: 'all', name: 'ALL', icon: '🎼', count: 48 },
  { id: 'bass', name: 'BASS', icon: '🎸', count: 12 },
  { id: 'lead', name: 'LEAD', icon: '🎹', count: 10 },
  { id: 'pad', name: 'PAD', icon: '🌊', count: 8 },
  { id: 'fx', name: 'FX', icon: '✨', count: 6 },
  { id: 'drums', name: 'DRUMS', icon: '🥁', count: 12 },
];

// Preset Library (Mock Data - would come from API)
const PRESETS = [
  // BASS
  { id: 1, name: 'Acid Bass 303', category: 'bass', instrument: 'TB-303', bpm: 138, favorites: 245, emoji: '🧪', screen: 'TB303' },
  { id: 2, name: 'Deep Sub Bass', category: 'bass', instrument: 'Minimoog', bpm: 120, favorites: 189, emoji: '🔊', screen: 'Minimoog' },
  { id: 3, name: 'Techno Bass', category: 'bass', instrument: 'ARP 2600', bpm: 132, favorites: 167, emoji: '🎛️', screen: 'ARP2600' },
  { id: 4, name: 'Squelchy Bass', category: 'bass', instrument: 'MS-20', bpm: 128, favorites: 156, emoji: '⚡', screen: 'MS20' },
  { id: 5, name: 'Wobble Bass', category: 'bass', instrument: 'Bass Studio', bpm: 140, favorites: 203, emoji: '🎸', screen: 'BassStudio' },
  { id: 6, name: 'Synth Bass', category: 'bass', instrument: 'JUNO-106', bpm: 124, favorites: 178, emoji: '🎹', screen: 'Juno106' },
  
  // LEAD
  { id: 7, name: 'Techno Lead', category: 'lead', instrument: 'ARP 2600', bpm: 130, favorites: 312, emoji: '🎛️', screen: 'ARP2600' },
  { id: 8, name: 'Bright Synth', category: 'lead', instrument: 'DX7', bpm: 125, favorites: 289, emoji: '✨', screen: 'DX7' },
  { id: 9, name: 'Epic Lead', category: 'lead', instrument: 'Prophet-5', bpm: 128, favorites: 267, emoji: '👑', screen: 'Prophet5' },
  { id: 10, name: 'Analog Lead', category: 'lead', instrument: 'Minimoog', bpm: 135, favorites: 298, emoji: '🔊', screen: 'Minimoog' },
  { id: 11, name: 'Supersaw', category: 'lead', instrument: 'JUNO-106', bpm: 128, favorites: 345, emoji: '🎹', screen: 'Juno106' },
  
  // PAD
  { id: 12, name: 'Warm Pad', category: 'pad', instrument: 'JUNO-106', bpm: 120, favorites: 234, emoji: '🌊', screen: 'Juno106' },
  { id: 13, name: 'Space Pad', category: 'pad', instrument: 'Prophet-5', bpm: 90, favorites: 198, emoji: '🌌', screen: 'Prophet5' },
  { id: 14, name: 'Ambient Pad', category: 'pad', instrument: 'DX7', bpm: 80, favorites: 176, emoji: '☁️', screen: 'DX7' },
  { id: 15, name: 'String Pad', category: 'pad', instrument: 'Violin', bpm: 95, favorites: 145, emoji: '🎻', screen: 'Violin' },
  
  // FX
  { id: 16, name: 'Riser FX', category: 'fx', instrument: 'ARP 2600', bpm: 128, favorites: 189, emoji: '📈', screen: 'ARP2600' },
  { id: 17, name: 'Noise Sweep', category: 'fx', instrument: 'MS-20', bpm: 130, favorites: 156, emoji: '🌪️', screen: 'MS20' },
  { id: 18, name: 'Impact Hit', category: 'fx', instrument: 'BeatMaker', bpm: 140, favorites: 201, emoji: '💥', screen: 'BeatMaker' },
  
  // DRUMS
  { id: 19, name: '808 Kick', category: 'drums', instrument: 'TR-808', bpm: 128, favorites: 567, emoji: '🥁', screen: 'TR808' },
  { id: 20, name: '909 Clap', category: 'drums', instrument: 'TR-909', bpm: 130, favorites: 489, emoji: '👏', screen: 'TR909' },
  { id: 21, name: 'Techno Kit', category: 'drums', instrument: 'TR-909', bpm: 135, favorites: 678, emoji: '🎼', screen: 'TR909' },
  { id: 22, name: 'Vintage Drums', category: 'drums', instrument: 'LinnDrum', bpm: 120, favorites: 345, emoji: '🎛️', screen: 'LinnDrum' },
  { id: 23, name: 'Break Beat', category: 'drums', instrument: 'DMX', bpm: 140, favorites: 432, emoji: '🎚️', screen: 'DMX' },
];

// Preset Card Component
const PresetCard = ({ preset, onPress, onFavorite, isFavorite }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={styles.presetCard}
  >
    <LinearGradient
      colors={[COLORS.bgCard, COLORS.bgDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.presetGradient}
    >
      <View style={[styles.presetBorder, { borderColor: COLORS.orange }]} />
      
      {/* Top Row - Emoji + Favorite */}
      <View style={styles.presetTop}>
        <View style={styles.presetEmojiCircle}>
          <Text style={styles.presetEmoji}>{preset.emoji}</Text>
        </View>
        <TouchableOpacity onPress={onFavorite} style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Preset Name */}
      <Text style={styles.presetName}>{preset.name}</Text>
      
      {/* Instrument Tag */}
      <View style={styles.instrumentTag}>
        <Text style={styles.instrumentIcon}>🎹</Text>
        <Text style={styles.instrumentText}>{preset.instrument}</Text>
      </View>
      
      {/* BPM + Favorites */}
      <View style={styles.presetMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>BPM</Text>
          <Text style={styles.metaValue}>{preset.bpm}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>♥</Text>
          <Text style={styles.metaValue}>{preset.favorites}</Text>
        </View>
      </View>
      
      {/* Preview Button */}
      <TouchableOpacity style={styles.previewButton} onPress={onPress}>
        <Text style={styles.previewIcon}>▶</Text>
        <Text style={styles.previewText}>PREVIEW</Text>
      </TouchableOpacity>
    </LinearGradient>
  </TouchableOpacity>
);

export default function SoundsScreen({ navigation, route }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set([1, 7, 19, 21])); // Mock favorites
  const persona = route?.params?.persona || 'adventurer';

  // Filter presets by category and search
  const filteredPresets = PRESETS.filter((preset) => {
    const matchesCategory = activeCategory === 'all' || preset.category === activeCategory;
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.instrument.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePresetPress = (preset) => {
    // Navigate to instrument screen and load preset
    if (preset.screen) {
      navigation.navigate(preset.screen, {
        presetId: preset.id,
        presetName: preset.name,
      });
    }
  };

  const toggleFavorite = (presetId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(presetId)) {
        newFavorites.delete(presetId);
      } else {
        newFavorites.add(presetId);
      }
      return newFavorites;
    });
  };

  return (
    <View style={styles.container}>
      {/* Circuit Board Background */}
      <CircuitBoardBackground density="low" animated={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HAOS</Text>
          <Text style={styles.logoDot}>.fm</Text>
        </View>
        <Text style={styles.headerTitle}>SOUNDS</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search presets..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              onPress={() => setActiveCategory(category.id)}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive,
              ]}
            >
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                activeCategory === category.id && styles.categoryNameActive,
              ]}>
                {category.name}
              </Text>
              <View style={[
                styles.categoryBadge,
                activeCategory === category.id && styles.categoryBadgeActive,
              ]}>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {filteredPresets.length} {filteredPresets.length === 1 ? 'preset' : 'presets'} found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>POPULAR ↓</Text>
        </TouchableOpacity>
      </View>

      {/* Presets List */}
      <FlatList
        data={filteredPresets}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.presetRow}
        contentContainerStyle={styles.presetsList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PresetCard
            preset={item}
            onPress={() => handlePresetPress(item)}
            onFavorite={() => toggleFavorite(item.id)}
            isFavorite={favorites.has(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No presets found</Text>
            <Text style={styles.emptyHint}>Try a different search or category</Text>
          </View>
        )}
      />

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionText}>MY FAVORITES</Text>
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{favorites.size}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionText}>IMPORT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  logoDot: {
    ...TYPOGRAPHY.h2,
    color: COLORS.orange,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Search
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: 5,
  },
  // Categories
  categoryContainer: {
    paddingBottom: 15,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderGray,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.orangeTransparent,
    borderColor: COLORS.orange,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  categoryNameActive: {
    color: COLORS.orange,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.grayDark,
    borderRadius: 8,
  },
  categoryBadgeActive: {
    backgroundColor: COLORS.orange,
  },
  categoryCount: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  // Results Bar
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  resultsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.bgCard,
    borderRadius: 8,
  },
  sortText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.orange,
    fontWeight: 'bold',
  },
  // Presets List
  presetsList: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  presetRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  presetCard: {
    width: '48%',
  },
  presetGradient: {
    borderRadius: 16,
    padding: 15,
    position: 'relative',
  },
  presetBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
  },
  presetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  presetEmojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.orangeTransparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetEmoji: {
    fontSize: 28,
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 24,
    color: COLORS.orange,
  },
  presetName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  instrumentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instrumentIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  instrumentText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  presetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  metaValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.orange,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    paddingVertical: 8,
  },
  previewIcon: {
    fontSize: 12,
    color: COLORS.bgDark,
    marginRight: 5,
  },
  previewText: {
    ...TYPOGRAPHY.label,
    fontSize: 11,
    color: COLORS.bgDark,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 25,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.bgDark,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginHorizontal: 5,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.orangeTransparent,
    borderColor: COLORS.orange,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  actionBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.orange,
    borderRadius: 10,
  },
  actionBadgeText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.bgDark,
    fontWeight: 'bold',
  },
});
