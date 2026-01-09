/**
 * HAOS.fm Pattern Studio Screen
 * Main interface for browsing, playing, and mixing preset patterns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { presetLibrary } from '../services/PresetLibraryManager';
import { patternPlayer } from '../services/PatternPlayerService';
import {
  EnhancedPreset,
  PresetCategory,
  PatternType,
  CATEGORY_INFO,
} from '../types/presets';

const { width, height } = Dimensions.get('window');

export default function PatternStudioScreen() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
  const [presets, setPresets] = useState<EnhancedPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<EnhancedPreset | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('up_major');
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixerLayers, setMixerLayers] = useState<any[]>([]);
  const [showMixer, setShowMixer] = useState(false);
  const [bpm, setBpm] = useState(128);

  // Initialize
  useEffect(() => {
    initializeLibrary();
  }, []);

  const initializeLibrary = async () => {
    try {
      console.log('🎵 Initializing Pattern Studio...');
      await presetLibrary.initialize();
      loadPresets();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Pattern Studio:', error);
      setIsLoading(false);
    }
  };

  // Load presets based on filters
  const loadPresets = () => {
    const filters: any = {};
    
    if (searchQuery) {
      filters.query = searchQuery;
    }
    
    if (selectedCategory !== 'all') {
      filters.categories = [selectedCategory];
    }

    const results = presetLibrary.searchPresets(filters);
    setPresets(results);
  };

  // Update presets when filters change
  useEffect(() => {
    if (!isLoading) {
      loadPresets();
    }
  }, [searchQuery, selectedCategory]);

  // Play pattern
  const playPattern = async (preset: EnhancedPreset, patternType: PatternType) => {
    try {
      setSelectedPreset(preset);
      setSelectedPattern(patternType);
      await patternPlayer.playPattern(preset, patternType, true);
      await presetLibrary.recordPlay(preset.id);
      setIsPlaying(true);
    } catch (error: any) {
      console.error('Failed to play pattern:', error);
      alert(`⚠️ Audio Not Available\n\n${error.message || 'Audio playback is currently being configured.'}\n\nThe Pattern Studio UI is complete, but audio requires static asset mapping due to Metro bundler limitations.`);
    }
  };

  // Stop playback
  const stopPlayback = async () => {
    try {
      await patternPlayer.stopCurrentPattern();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  // Add to mixer
  const addToMixer = async (preset: EnhancedPreset, patternType: PatternType) => {
    try {
      const slot = mixerLayers.length;
      if (slot >= 4) {
        alert('Mixer is full (4 layers max)');
        return;
      }

      await patternPlayer.addPatternLayer(slot, preset, patternType, 0.8);
      setMixerLayers([...mixerLayers, { slot, preset, patternType }]);
      setShowMixer(true);
    } catch (error) {
      console.error('Failed to add to mixer:', error);
    }
  };

  // Remove from mixer
  const removeFromMixer = async (slot: number) => {
    try {
      await patternPlayer.removeLayer(slot);
      setMixerLayers(mixerLayers.filter(l => l.slot !== slot));
    } catch (error) {
      console.error('Failed to remove from mixer:', error);
    }
  };

  // Play all mixer layers
  const playMixer = async () => {
    try {
      await patternPlayer.setMasterBPM(bpm);
      await patternPlayer.playAllLayers();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play mixer:', error);
    }
  };

  // Stop mixer
  const stopMixer = async () => {
    try {
      await patternPlayer.stopAllLayers();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to stop mixer:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (preset: EnhancedPreset) => {
    try {
      const isFav = presetLibrary.isFavorite(preset.id);
      if (isFav) {
        await presetLibrary.removeFavorite(preset.id);
      } else {
        await presetLibrary.addFavorite(preset.id);
      }
      loadPresets(); // Refresh to update favorite status
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Category tabs
  const categories: Array<PresetCategory | 'all'> = [
    'all',
    'bass',
    'lead',
    'pad',
    'pluck',
    'techno',
    'trance',
    'dnb',
    'dubstep',
    'trap',
  ];

  const getCategoryEmoji = (category: PresetCategory | 'all'): string => {
    if (category === 'all') return '🎵';
    return CATEGORY_INFO[category]?.emoji || '🎵';
  };

  const getCategoryName = (category: PresetCategory | 'all'): string => {
    if (category === 'all') return 'All';
    return CATEGORY_INFO[category]?.name || category;
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d9ff" />
          <Text style={styles.loadingText}>Loading Pattern Studio...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Pattern Studio</Text>
        <Text style={styles.subtitle}>{presets.length} presets • 875 files</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search presets..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryEmoji}>
              {getCategoryEmoji(category)}
            </Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {getCategoryName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        {/* Preset Grid */}
        <View style={styles.presetGrid}>
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={selectedPreset?.id === preset.id}
              isFavorite={presetLibrary.isFavorite(preset.id)}
              onPress={() => setSelectedPreset(preset)}
              onPlay={(patternType) => playPattern(preset, patternType)}
              onAddToMixer={(patternType) => addToMixer(preset, patternType)}
              onToggleFavorite={() => toggleFavorite(preset)}
            />
          ))}
        </View>

        {presets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No presets found</Text>
            <Text style={styles.emptySubtext}>
              Try a different search or category
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Pattern Player (when preset selected) */}
      {selectedPreset && (
        <View style={styles.playerContainer}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerTitle}>
              {selectedPreset.emoji} {selectedPreset.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedPreset(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patternButtons}>
            {(['up_major', 'up_minor', 'updown_penta', 'chord'] as PatternType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.patternButton,
                  selectedPattern === type && styles.patternButtonActive,
                ]}
                onPress={() => playPattern(selectedPreset, type)}
              >
                <Text style={styles.patternButtonText}>
                  {type === 'up_major' && '⬆️ Major'}
                  {type === 'up_minor' && '⬆️ Minor'}
                  {type === 'updown_penta' && '⬍ Penta'}
                  {type === 'chord' && '🎹 Chord'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={isPlaying ? stopPlayback : () => playPattern(selectedPreset, selectedPattern)}
            >
              <Text style={styles.controlButtonText}>
                {isPlaying ? '⏸ Pause' : '▶️ Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.mixerButton]}
              onPress={() => addToMixer(selectedPreset, selectedPattern)}
            >
              <Text style={styles.controlButtonText}>➕ Add to Mixer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mixer Panel (when layers added) */}
      {showMixer && mixerLayers.length > 0 && (
        <View style={styles.mixerPanel}>
          <View style={styles.mixerHeader}>
            <Text style={styles.mixerTitle}>
              🎚️ Mixer ({mixerLayers.length}/4)
            </Text>
            <TouchableOpacity onPress={() => setShowMixer(false)}>
              <Text style={styles.minimizeButton}>−</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mixerLayers.map((layer) => (
              <View key={layer.slot} style={styles.mixerLayer}>
                <Text style={styles.mixerLayerTitle}>
                  Slot {layer.slot + 1}
                </Text>
                <Text style={styles.mixerLayerPreset}>
                  {layer.preset.emoji} {layer.preset.name}
                </Text>
                <Text style={styles.mixerLayerPattern}>
                  {layer.patternType}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromMixer(layer.slot)}
                >
                  <Text style={styles.removeButtonText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.mixerControls}>
            <View style={styles.bpmControl}>
              <Text style={styles.bpmLabel}>BPM: {bpm}</Text>
              <View style={styles.bpmButtons}>
                <TouchableOpacity
                  onPress={() => setBpm(Math.max(60, bpm - 5))}
                  style={styles.bpmButton}
                >
                  <Text style={styles.bpmButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setBpm(Math.min(200, bpm + 5))}
                  style={styles.bpmButton}
                >
                  <Text style={styles.bpmButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, styles.mixerPlayButton]}
              onPress={isPlaying ? stopMixer : playMixer}
            >
              <Text style={styles.controlButtonText}>
                {isPlaying ? '⏹ Stop All' : '▶️ Play All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mixer Toggle Button (when minimized) */}
      {!showMixer && mixerLayers.length > 0 && (
        <TouchableOpacity
          style={styles.mixerToggle}
          onPress={() => setShowMixer(true)}
        >
          <Text style={styles.mixerToggleText}>
            🎚️ Mixer ({mixerLayers.length})
          </Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

// Preset Card Component
interface PresetCardProps {
  preset: EnhancedPreset;
  isSelected: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onPlay: (patternType: PatternType) => void;
  onAddToMixer: (patternType: PatternType) => void;
  onToggleFavorite: () => void;
}

function PresetCard({
  preset,
  isSelected,
  isFavorite,
  onPress,
  onPlay,
  onToggleFavorite,
}: PresetCardProps) {
  return (
    <TouchableOpacity
      style={[styles.presetCard, isSelected && styles.presetCardSelected]}
      onPress={onPress}
    >
      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
      >
        <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
      </TouchableOpacity>

      {/* Preset Info */}
      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
      <Text style={styles.presetName} numberOfLines={1}>
        {preset.name}
      </Text>

      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>
          {CATEGORY_INFO[preset.category]?.name || preset.category}
        </Text>
      </View>

      {/* Energy Meter */}
      <View style={styles.energyMeter}>
        <View style={styles.energyBar}>
          <View
            style={[
              styles.energyFill,
              { width: `${preset.energy * 10}%` },
            ]}
          />
        </View>
        <Text style={styles.energyText}>⚡{preset.energy}/10</Text>
      </View>

      {/* Tags */}
      <View style={styles.tags}>
        {preset.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00d9ff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    color: '#888',
    fontSize: 20,
    padding: 4,
  },
  categoryScroll: {
    maxHeight: 60,
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#00d9ff',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  presetCard: {
    width: (width - 44) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: '#00d9ff',
    backgroundColor: 'rgba(0,217,255,0.1)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  presetEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  presetName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: '#00d9ff',
    fontSize: 10,
    fontWeight: '600',
  },
  energyMeter: {
    marginBottom: 8,
  },
  energyBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#00d9ff',
  },
  energyText: {
    color: '#888',
    fontSize: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    color: '#888',
    fontSize: 9,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
  },
  playerContainer: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#00d9ff',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    color: '#888',
    fontSize: 24,
    padding: 4,
  },
  patternButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  patternButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patternButtonActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderColor: '#00d9ff',
  },
  patternButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#00d9ff',
  },
  mixerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mixerPanel: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#ff6b6b',
    maxHeight: 300,
  },
  mixerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mixerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  minimizeButton: {
    color: '#888',
    fontSize: 32,
    padding: 4,
  },
  mixerLayer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 150,
  },
  mixerLayerTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  mixerLayerPreset: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mixerLayerPattern: {
    color: '#00d9ff',
    fontSize: 12,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mixerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  bpmControl: {
    flex: 1,
  },
  bpmLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bpmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bpmButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  bpmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mixerPlayButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
  },
  mixerToggle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mixerToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
