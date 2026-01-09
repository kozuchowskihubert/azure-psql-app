/**
 * HAOS Individual Genre Studio
 * Genre-specific production environment with:
 * - Filtered presets by genre
 * - BPM-appropriate tempo controls
 * - Quick-start pattern combinations
 * - Genre-specific workflow tips
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import PresetLibraryManager from '../services/PresetLibraryManager';

const { width, height } = Dimensions.get('window');

// Genre-specific color schemes (must match GenreStudioSelectScreen)
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

export default function GenreStudioScreen({ route, navigation }) {
  const { genreId } = route.params;
  
  const [studio, setStudio] = useState(null);
  const [presets, setPresets] = useState([]);
  const [bpm, setBpm] = useState(120);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load studio data and presets
  useEffect(() => {
    loadStudio();
  }, [genreId]);

  const loadStudio = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get studio definition
      const studioData = PresetLibraryManager.getGenreStudio(genreId);
      if (!studioData) {
        console.error('❌ Genre studio not found:', genreId);
        navigation.goBack();
        return;
      }
      
      setStudio(studioData);
      
      // Set BPM to middle of range
      const midBpm = Math.floor(
        (studioData.bpmRange[0] + studioData.bpmRange[1]) / 2
      );
      setBpm(midBpm);
      
      // Load genre-specific presets
      const genrePresets = PresetLibraryManager.getGenreStudioPresets(genreId);
      console.log(`🎛️ Loaded ${genrePresets.length} presets for ${studioData.name}`);
      setPresets(genrePresets);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading genre studio:', error);
      setLoading(false);
    }
  }, [genreId, navigation]);

  if (loading || !studio) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>{studio?.emoji || '🎛️'}</Text>
          <Text style={styles.loadingText}>Loading Studio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const colors = GENRE_COLORS[genreId] || ['#D4AF37', '#B8941F'];

  const renderPresetCard = ({ item }) => {
    const isSelected = selectedPreset?.id === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedPreset(item)}
        activeOpacity={0.7}
        style={[
          styles.presetCard,
          isSelected && styles.presetCardSelected,
        ]}
      >
        <LinearGradient
          colors={isSelected 
            ? [`${colors[0]}30`, `${colors[1]}40`]
            : ['rgba(30, 30, 30, 0.8)', 'rgba(20, 20, 20, 0.9)']
          }
          style={styles.presetGradient}
        >
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: `${colors[0]}30` }]}>
            <Text style={[styles.categoryText, { color: colors[0] }]}>
              {item.category}
            </Text>
          </View>

          {/* Preset Name */}
          <Text style={styles.presetName}>{item.name}</Text>

          {/* Description */}
          {item.description && (
            <Text style={styles.presetDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {isSelected && (
            <View style={[styles.selectedBorder, { borderColor: colors[0] }]} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[`${colors[0]}15`, 'transparent']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.studioEmoji}>{studio.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.studioTitle}>{studio.name}</Text>
            <Text style={styles.studioSubtitle}>{studio.description}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BPM Control */}
        <View style={styles.bpmSection}>
          <View style={styles.bpmHeader}>
            <Text style={styles.sectionTitle}>⏱️ Tempo</Text>
            <View style={[styles.bpmDisplay, { borderColor: colors[0] }]}>
              <Text style={[styles.bpmValue, { color: colors[0] }]}>
                {Math.round(bpm)}
              </Text>
              <Text style={styles.bpmLabel}>BPM</Text>
            </View>
          </View>
          
          <View style={styles.bpmControl}>
            <Text style={styles.bpmRangeText}>{studio.bpmRange[0]}</Text>
            <Slider
              style={styles.slider}
              minimumValue={studio.bpmRange[0]}
              maximumValue={studio.bpmRange[1]}
              value={bpm}
              onValueChange={setBpm}
              minimumTrackTintColor={colors[0]}
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor={colors[0]}
            />
            <Text style={styles.bpmRangeText}>{studio.bpmRange[1]}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>✨ Key Features</Text>
          <View style={styles.featuresList}>
            {studio.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors[0] }]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Presets Library */}
        <View style={styles.presetsSection}>
          <View style={styles.presetsSectionHeader}>
            <Text style={styles.sectionTitle}>🎹 Presets</Text>
            <Text style={styles.presetCount}>
              {presets.length} available
            </Text>
          </View>

          {presets.length > 0 ? (
            <FlatList
              data={presets}
              renderItem={renderPresetCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.presetsList}
            />
          ) : (
            <View style={styles.noPresets}>
              <Text style={styles.noPresetsEmoji}>🎵</Text>
              <Text style={styles.noPresetsText}>
                No presets available for this genre yet
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick Actions Footer */}
      {selectedPreset && (
        <BlurView intensity={95} tint="dark" style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.selectedPresetInfo}>
              <Text style={styles.selectedPresetLabel}>Selected:</Text>
              <Text style={styles.selectedPresetName}>
                {selectedPreset.name}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.loadButton, { backgroundColor: colors[0] }]}
              onPress={() => {
                console.log('🎛️ Loading preset:', selectedPreset.name);
                // TODO: Navigate to appropriate synth/instrument with preset
              }}
            >
              <Text style={styles.loadButtonText}>Load Preset</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studioEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  studioTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  studioSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  bpmSection: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bpmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bpmDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bpmValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 6,
  },
  bpmLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  bpmRangeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  featuresSection: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  presetsSection: {
    marginBottom: 16,
  },
  presetsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  presetsList: {
    gap: 12,
  },
  presetCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  presetCardSelected: {
    transform: [{ scale: 0.98 }],
  },
  presetGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    position: 'relative',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  presetName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  presetDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 12,
    pointerEvents: 'none',
  },
  noPresets: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noPresetsEmoji: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  noPresetsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPresetInfo: {
    flex: 1,
    marginRight: 16,
  },
  selectedPresetLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedPresetName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loadButtonText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
