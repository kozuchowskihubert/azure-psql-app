/**
 * HAOS.fm Preset Library Manager
 * Central system for managing all presets, patterns, favorites, and collections
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { ALL_PRESETS } from '../data/presets/presetLibrary';
import { getPresetAudio } from '../data/presetAssets';
import {
  BasePreset,
  EnhancedPreset,
  PresetSample,
  PresetPattern,
  PresetUsage,
  Collection,
  SearchFilters,
  SearchResult,
  SortBy,
  Genre,
  Mood,
  PresetCategory,
  PatternType,
  CATEGORY_INFO,
  GENRE_STUDIOS,
  GenreStudio,
} from '../types/presets';

// Storage keys
const STORAGE_KEYS = {
  FAVORITES: '@haos_preset_favorites',
  COLLECTIONS: '@haos_preset_collections',
  USAGE_STATS: '@haos_preset_usage',
};

/**
 * Preset Library Manager
 * Singleton service for managing preset library
 */
class PresetLibraryManager {
  private presets: Map<string, EnhancedPreset> = new Map();
  private favorites: Set<string> = new Set();
  private collections: Map<string, Collection> = new Map();
  private usageStats: Map<string, PresetUsage> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the library manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🎵 Initializing Preset Library Manager...');

    try {
      // Load base presets
      await this.loadPresets();

      // Load user data
      await this.loadFavorites();
      await this.loadCollections();
      await this.loadUsageStats();

      this.initialized = true;
      console.log(`✅ Preset Library initialized with ${this.presets.size} presets`);
    } catch (error) {
      console.error('❌ Failed to initialize Preset Library:', error);
      throw error;
    }
  }

  /**
   * Load and enhance all presets
   */
  private async loadPresets(): Promise<void> {
    // @ts-ignore - ALL_PRESETS is dynamically imported
    const basePresets: BasePreset[] = ALL_PRESETS;

    console.log(`📦 Loading ${basePresets.length} presets...`);

    for (const preset of basePresets) {
      const enhanced = this.enhancePreset(preset);
      this.presets.set(preset.id, enhanced);
    }

    console.log(`✅ Loaded and enhanced ${this.presets.size} presets`);
  }

  /**
   * Enhance a preset with metadata, samples, and patterns
   */
  private enhancePreset(preset: BasePreset): EnhancedPreset {
    // Extract emoji from name
    const emoji = this.extractEmoji(preset.name);
    const cleanName = preset.name.replace(/[^\w\s-]/g, '').trim();

    // Generate samples and patterns
    const samples = this.generatePresetSamples(preset);
    const patterns = this.generatePresetPatterns(preset);

    // Generate metadata
    const tags = this.generateTags(preset);
    const genres = this.inferGenres(preset);
    const moods = this.inferMoods(preset);
    const energy = this.calculateEnergy(preset);
    const difficulty = this.calculateDifficulty(preset);

    // Find related presets
    const related = this.findRelatedPresets(preset);
    const complements = this.findComplementaryPresets(preset);

    // Get usage stats
    const usage = this.usageStats.get(preset.id) || {
      playCount: 0,
      favoriteCount: 0,
      lastPlayed: null,
      popularityScore: 0,
    };

    return {
      ...preset,
      emoji,
      description: this.generateDescription(preset),
      samples,
      patterns,
      tags,
      genres,
      moods,
      energy,
      difficulty,
      usage,
      related,
      complements,
    };
  }

  /**
   * Generate sample file references for a preset
   */
  private generatePresetSamples(preset: BasePreset): PresetSample[] {
    const samples: PresetSample[] = [];
    const category = preset.category;

    // Determine which notes to include based on category
    const noteConfigs = this.getNoteConfigsForCategory(category);

    for (const config of noteConfigs) {
      const filePath = this.getPresetSamplePath(preset.id, config.note);
      
      samples.push({
        note: config.note,
        midi: config.midi,
        frequency: config.frequency,
        filePath,
        duration: 2.0, // Default 2 seconds
      });
    }

    return samples;
  }

  /**
   * Get note configurations for a category
   */
  private getNoteConfigsForCategory(category: PresetCategory) {
    // Bass: 3 notes (C2, E2, G2)
    if (category === 'bass') {
      return [
        { note: 'C2', midi: 36, frequency: 65.4 },
        { note: 'E2', midi: 40, frequency: 82.4 },
        { note: 'G2', midi: 43, frequency: 98.0 },
      ];
    }

    // Lead: 3 notes (C4, E4, G4)
    if (category === 'lead') {
      return [
        { note: 'C4', midi: 60, frequency: 261.6 },
        { note: 'E4', midi: 64, frequency: 329.6 },
        { note: 'G4', midi: 67, frequency: 392.0 },
      ];
    }

    // Pad: 4 notes (C3, E3, G3, C4)
    if (category === 'pad') {
      return [
        { note: 'C3', midi: 48, frequency: 130.8 },
        { note: 'E3', midi: 52, frequency: 164.8 },
        { note: 'G3', midi: 55, frequency: 196.0 },
        { note: 'C4', midi: 60, frequency: 261.6 },
      ];
    }

    // Default: single note C3
    return [{ note: 'C3', midi: 48, frequency: 130.8 }];
  }

  /**
   * Generate pattern file references for a preset
   */
  private generatePresetPatterns(preset: BasePreset): PresetPattern[] {
    const patterns: PresetPattern[] = [];
    const category = preset.category;
    const bpm = this.getDefaultBPMForCategory(category);

    // Pattern 1: Major ascending (2 bars)
    patterns.push({
      type: 'up_major',
      scale: 'major',
      arpeggio: 'up',
      rhythm: '16th',
      bpm,
      bars: 2,
      filePath: this.getPatternPath(preset.id, 'up_major', bpm),
      duration: (2 * 4 * 60) / bpm, // bars * beats * seconds_per_beat
      fileName: `${preset.id}_arp_up_major_${bpm}bpm_2bar.wav`,
    });

    // Pattern 2: Minor ascending (2 bars)
    patterns.push({
      type: 'up_minor',
      scale: 'minor',
      arpeggio: 'up',
      rhythm: '16th',
      bpm,
      bars: 2,
      filePath: this.getPatternPath(preset.id, 'up_minor', bpm),
      duration: (2 * 4 * 60) / bpm,
      fileName: `${preset.id}_arp_up_minor_${bpm}bpm_2bar.wav`,
    });

    // Pattern 3: Pentatonic up-down (4 bars)
    patterns.push({
      type: 'updown_penta',
      scale: 'pentatonic_minor',
      arpeggio: 'up_down',
      rhythm: '8th',
      bpm,
      bars: 4,
      filePath: this.getPatternPath(preset.id, 'updown_penta', bpm),
      duration: (4 * 4 * 60) / bpm,
      fileName: `${preset.id}_arp_up_down_pentatonic_minor_${bpm}bpm_4bar.wav`,
    });

    // Pattern 4: Major chord (4 bars)
    patterns.push({
      type: 'chord',
      scale: 'major',
      arpeggio: 'chord',
      rhythm: '4th',
      bpm,
      bars: 4,
      filePath: this.getPatternPath(preset.id, 'chord', bpm),
      duration: (4 * 4 * 60) / bpm,
      fileName: `${preset.id}_arp_chord_major_${bpm}bpm_4bar.wav`,
    });

    return patterns;
  }

  /**
   * Get preset sample file path
   * Uses static asset mapping generated by scripts/generate-preset-assets.js
   */
  private getPresetSamplePath(presetId: string, note: string): any {
    const category = presetId.split('_')[0];
    const fileName = `${presetId}_${note}.wav`;
    const path = `${category}/${fileName}`;
    
    return getPresetAudio(path);
  }

  /**
   * Get pattern file path
   * Uses static asset mapping generated by scripts/generate-preset-assets.js
   */
  private getPatternPath(presetId: string, patternType: string, bpm: number): any {
    const category = presetId.split('_')[0];
    
    // Map pattern types to file names
    const patternMap: Record<string, string> = {
      'up_major': 'arp_up_major',
      'up_minor': 'arp_up_minor',
      'updown_penta': 'arp_up_down_pentatonic_minor',
      'chord': 'arp_chord_major',
    };

    const patternName = patternMap[patternType];
    const bars = patternType === 'up_major' || patternType === 'up_minor' ? 2 : 4;
    const fileName = `${presetId}_${patternName}_${bpm}bpm_${bars}bar.wav`;
    const path = `patterns/${category}/${fileName}`;
    
    return getPresetAudio(path);
  }

  /**
   * Get default BPM for category
   */
  private getDefaultBPMForCategory(category: PresetCategory): number {
    const bpmMap: Record<PresetCategory, number> = {
      bass: 120,
      lead: 120,
      pad: 120,
      pluck: 120,
      brass: 120,
      bell: 120,
      vocal: 120,
      fx: 120,
      techno: 128,
      trance: 128,
      dnb: 174,
      dubstep: 140,
      trap: 140,
      hardstyle: 155,
      futurebass: 120,
      lofi: 90,
      ambient: 60,
      percussion: 120,
    };

    return bpmMap[category] || 120;
  }

  /**
   * Generate tags for a preset
   */
  private generateTags(preset: BasePreset): string[] {
    const tags: string[] = [];
    
    // Add category as tag
    tags.push(preset.category);
    
    // Add tags based on name
    const name = preset.name.toLowerCase();
    if (name.includes('sub')) tags.push('sub');
    if (name.includes('bass')) tags.push('bass');
    if (name.includes('lead')) tags.push('lead');
    if (name.includes('pad')) tags.push('pad');
    if (name.includes('acid')) tags.push('acid');
    if (name.includes('wobble')) tags.push('wobble');
    if (name.includes('growl')) tags.push('growl');
    if (name.includes('supersaw')) tags.push('supersaw');
    if (name.includes('pluck')) tags.push('pluck');
    if (name.includes('brass')) tags.push('brass');
    if (name.includes('bell')) tags.push('bell');
    if (name.includes('vocal')) tags.push('vocal');
    
    // Add tags based on synthesis parameters
    if (preset.filter_cutoff < 500) tags.push('dark', 'deep');
    if (preset.filter_cutoff > 5000) tags.push('bright', 'high');
    if (preset.filter_resonance > 5) tags.push('resonant', 'filtered');
    if (preset.attack < 0.01) tags.push('punchy', 'percussive');
    if (preset.attack > 0.5) tags.push('soft', 'slow');
    if (preset.release > 2) tags.push('long', 'sustained');
    if (preset.lfo_depth > 0.5) tags.push('modulated', 'moving');
    if (preset.stereo_width > 0.7) tags.push('wide', 'stereo');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Infer genres from preset
   */
  private inferGenres(preset: BasePreset): Genre[] {
    const genres: Genre[] = [];
    const category = preset.category;
    
    // Genre-specific categories
    if (category === 'techno') genres.push('techno', 'minimal', 'acid');
    if (category === 'trance') genres.push('trance', 'uplifting', 'progressive');
    if (category === 'dnb') genres.push('dnb', 'jungle', 'neurofunk');
    if (category === 'dubstep') genres.push('dubstep', 'riddim', 'brostep');
    if (category === 'trap') genres.push('trap', 'hip-hop');
    if (category === 'hardstyle') genres.push('hardstyle', 'hardcore');
    if (category === 'futurebass') genres.push('futurebass', 'edm');
    if (category === 'lofi') genres.push('lofi', 'chillhop', 'beats');
    if (category === 'ambient') genres.push('ambient', 'downtempo', 'chill');
    
    // General categories can be used in multiple genres
    if (category === 'bass') genres.push('techno', 'house', 'dubstep', 'dnb');
    if (category === 'lead') genres.push('trance', 'edm', 'house');
    if (category === 'pad') genres.push('ambient', 'trance', 'downtempo');
    
    return [...new Set(genres)];
  }

  /**
   * Infer moods from preset
   */
  private inferMoods(preset: BasePreset): Mood[] {
    const moods: Mood[] = [];
    
    // Based on filter cutoff
    if (preset.filter_cutoff < 500) moods.push('dark', 'deep');
    if (preset.filter_cutoff > 5000) moods.push('bright', 'light');
    
    // Based on envelope
    if (preset.attack < 0.01 && preset.decay < 0.1) moods.push('aggressive', 'percussive');
    if (preset.attack > 0.5) moods.push('soft', 'calm');
    
    // Based on release
    if (preset.release > 2) moods.push('atmospheric');
    
    // Based on resonance
    if (preset.filter_resonance > 5) moods.push('energetic');
    
    // Based on category
    if (preset.category === 'bass') moods.push('heavy', 'deep');
    if (preset.category === 'lead') moods.push('bright', 'melodic');
    if (preset.category === 'pad') moods.push('atmospheric', 'warm');
    if (preset.category === 'ambient') moods.push('calm', 'atmospheric');
    
    return [...new Set(moods)];
  }

  /**
   * Calculate energy level (1-10)
   */
  private calculateEnergy(preset: BasePreset): number {
    let energy = 5; // Start at middle
    
    // Fast attack = more energy
    if (preset.attack < 0.01) energy += 2;
    else if (preset.attack < 0.05) energy += 1;
    else if (preset.attack > 0.5) energy -= 2;
    
    // High cutoff = more energy
    if (preset.filter_cutoff > 5000) energy += 2;
    else if (preset.filter_cutoff < 500) energy -= 1;
    
    // High resonance = more energy
    if (preset.filter_resonance > 5) energy += 1;
    
    // LFO modulation = more energy
    if (preset.lfo_depth > 0.5) energy += 1;
    
    return Math.max(1, Math.min(10, energy));
  }

  /**
   * Calculate difficulty (1-5)
   */
  private calculateDifficulty(preset: BasePreset): number {
    let difficulty = 2; // Default: beginner-friendly
    
    // Complex modulation = harder
    if (preset.lfo_depth > 0.5) difficulty += 1;
    
    // High resonance = requires skill
    if (preset.filter_resonance > 7) difficulty += 1;
    
    // Multiple oscillators = more complex
    const oscCount = (preset.osc1_level > 0 ? 1 : 0) +
                     (preset.osc2_level > 0 ? 1 : 0) +
                     (preset.osc3_level > 0 ? 1 : 0);
    if (oscCount >= 3) difficulty += 1;
    
    return Math.max(1, Math.min(5, difficulty));
  }

  /**
   * Find related presets (similar sounds)
   */
  private findRelatedPresets(preset: BasePreset): string[] {
    // This will be populated during search operations
    return [];
  }

  /**
   * Find complementary presets (sounds good together)
   */
  private findComplementaryPresets(preset: BasePreset): string[] {
    // This will be populated based on user patterns
    return [];
  }

  /**
   * Generate description for preset
   */
  private generateDescription(preset: BasePreset): string {
    const category = CATEGORY_INFO[preset.category];
    return category.description;
  }

  /**
   * Extract emoji from preset name
   */
  private extractEmoji(name: string): string {
    const emojiRegex = /[\p{Emoji}]/u;
    const match = name.match(emojiRegex);
    return match ? match[0] : '🎵';
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Get all presets
   */
  getAllPresets(): EnhancedPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get preset by ID
   */
  getPreset(id: string): EnhancedPreset | undefined {
    return this.presets.get(id);
  }

  /**
   * Search presets
   */
  searchPresets(filters: SearchFilters): EnhancedPreset[] {
    let results = Array.from(this.presets.values());

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.includes(query))
      );
    }

    // Category filter
    if (filters.categories?.length) {
      results = results.filter(p =>
        filters.categories!.includes(p.category)
      );
    }

    // Genre filter
    if (filters.genres?.length) {
      results = results.filter(p =>
        p.genres.some(g => filters.genres!.includes(g))
      );
    }

    // Mood filter
    if (filters.moods?.length) {
      results = results.filter(p =>
        p.moods.some(m => filters.moods!.includes(m))
      );
    }

    // Energy range filter
    if (filters.energyMin !== undefined) {
      results = results.filter(p => p.energy >= filters.energyMin!);
    }
    if (filters.energyMax !== undefined) {
      results = results.filter(p => p.energy <= filters.energyMax!);
    }

    // Favorites filter
    if (filters.onlyFavorites) {
      results = results.filter(p => this.favorites.has(p.id));
    }

    // Sort
    results = this.sortPresets(results, filters.sortBy || 'popular');

    return results;
  }

  /**
   * Sort presets
   */
  private sortPresets(presets: EnhancedPreset[], sortBy: SortBy): EnhancedPreset[] {
    switch (sortBy) {
      case 'popular':
        return presets.sort((a, b) => b.usage.popularityScore - a.usage.popularityScore);
      
      case 'recent':
        return presets.sort((a, b) => {
          const aTime = a.usage.lastPlayed?.getTime() || 0;
          const bTime = b.usage.lastPlayed?.getTime() || 0;
          return bTime - aTime;
        });
      
      case 'alphabetical':
        return presets.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'category':
        return presets.sort((a, b) => a.category.localeCompare(b.category));
      
      case 'genre':
        return presets.sort((a, b) => {
          const aGenre = a.genres[0] || '';
          const bGenre = b.genres[0] || '';
          return aGenre.localeCompare(bGenre);
        });
      
      case 'energy':
        return presets.sort((a, b) => b.energy - a.energy);
      
      default:
        return presets;
    }
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(category: PresetCategory): EnhancedPreset[] {
    return this.searchPresets({ categories: [category] });
  }

  /**
   * Get presets by genre
   */
  getPresetsByGenre(genre: Genre): EnhancedPreset[] {
    return this.searchPresets({ genres: [genre] });
  }

  /**
   * Get related presets
   */
  getRelatedPresets(presetId: string, limit: number = 6): EnhancedPreset[] {
    const preset = this.presets.get(presetId);
    if (!preset) return [];

    // Find presets with similar tags, genres, moods
    const related = Array.from(this.presets.values())
      .filter(p => p.id !== presetId)
      .map(p => ({
        preset: p,
        score: this.calculateSimilarityScore(preset, p),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.preset);

    return related;
  }

  /**
   * Calculate similarity score between two presets
   */
  private calculateSimilarityScore(preset1: EnhancedPreset, preset2: EnhancedPreset): number {
    let score = 0;

    // Same category
    if (preset1.category === preset2.category) score += 5;

    // Shared genres
    const sharedGenres = preset1.genres.filter(g => preset2.genres.includes(g));
    score += sharedGenres.length * 3;

    // Shared moods
    const sharedMoods = preset1.moods.filter(m => preset2.moods.includes(m));
    score += sharedMoods.length * 2;

    // Shared tags
    const sharedTags = preset1.tags.filter(t => preset2.tags.includes(t));
    score += sharedTags.length;

    // Similar energy
    const energyDiff = Math.abs(preset1.energy - preset2.energy);
    score += Math.max(0, 5 - energyDiff);

    return score;
  }

  // ============================================================
  // FAVORITES
  // ============================================================

  /**
   * Add preset to favorites
   */
  async addFavorite(presetId: string): Promise<void> {
    this.favorites.add(presetId);
    await this.saveFavorites();
    
    // Update usage stats
    const preset = this.presets.get(presetId);
    if (preset) {
      preset.usage.favoriteCount++;
      await this.saveUsageStats();
    }
  }

  /**
   * Remove preset from favorites
   */
  async removeFavorite(presetId: string): Promise<void> {
    this.favorites.delete(presetId);
    await this.saveFavorites();
    
    // Update usage stats
    const preset = this.presets.get(presetId);
    if (preset) {
      preset.usage.favoriteCount = Math.max(0, preset.usage.favoriteCount - 1);
      await this.saveUsageStats();
    }
  }

  /**
   * Check if preset is favorite
   */
  isFavorite(presetId: string): boolean {
    return this.favorites.has(presetId);
  }

  /**
   * Get all favorites
   */
  getFavorites(): EnhancedPreset[] {
    return Array.from(this.favorites)
      .map(id => this.presets.get(id))
      .filter((p): p is EnhancedPreset => p !== undefined);
  }

  /**
   * Load favorites from storage
   */
  private async loadFavorites(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (data) {
        const favoriteIds = JSON.parse(data);
        this.favorites = new Set(favoriteIds);
        console.log(`📌 Loaded ${this.favorites.size} favorites`);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }

  /**
   * Save favorites to storage
   */
  private async saveFavorites(): Promise<void> {
    try {
      const favoriteIds = Array.from(this.favorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  // ============================================================
  // COLLECTIONS
  // ============================================================

  /**
   * Create new collection
   */
  async createCollection(name: string, presetIds: string[] = []): Promise<Collection> {
    const collection: Collection = {
      id: Date.now().toString(),
      name,
      presetIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collections.set(collection.id, collection);
    await this.saveCollections();

    return collection;
  }

  /**
   * Add preset to collection
   */
  async addToCollection(collectionId: string, presetId: string): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (collection && !collection.presetIds.includes(presetId)) {
      collection.presetIds.push(presetId);
      collection.updatedAt = new Date();
      await this.saveCollections();
    }
  }

  /**
   * Remove preset from collection
   */
  async removeFromCollection(collectionId: string, presetId: string): Promise<void> {
    const collection = this.collections.get(collectionId);
    if (collection) {
      collection.presetIds = collection.presetIds.filter(id => id !== presetId);
      collection.updatedAt = new Date();
      await this.saveCollections();
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId: string): Promise<void> {
    this.collections.delete(collectionId);
    await this.saveCollections();
  }

  /**
   * Get all collections
   */
  getCollections(): Collection[] {
    return Array.from(this.collections.values());
  }

  /**
   * Get collection by ID
   */
  getCollection(collectionId: string): Collection | undefined {
    return this.collections.get(collectionId);
  }

  /**
   * Get presets in collection
   */
  getCollectionPresets(collectionId: string): EnhancedPreset[] {
    const collection = this.collections.get(collectionId);
    if (!collection) return [];

    return collection.presetIds
      .map(id => this.presets.get(id))
      .filter((p): p is EnhancedPreset => p !== undefined);
  }

  /**
   * Load collections from storage
   */
  private async loadCollections(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (data) {
        const collectionsArray = JSON.parse(data);
        this.collections = new Map(
          collectionsArray.map((c: Collection) => [c.id, c])
        );
        console.log(`📁 Loaded ${this.collections.size} collections`);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  }

  /**
   * Save collections to storage
   */
  private async saveCollections(): Promise<void> {
    try {
      const collectionsArray = Array.from(this.collections.values());
      await AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collectionsArray));
    } catch (error) {
      console.error('Failed to save collections:', error);
    }
  }

  // ============================================================
  // USAGE STATS
  // ============================================================

  /**
   * Record preset play
   */
  async recordPlay(presetId: string): Promise<void> {
    const preset = this.presets.get(presetId);
    if (!preset) return;

    preset.usage.playCount++;
    preset.usage.lastPlayed = new Date();
    preset.usage.popularityScore = this.calculatePopularityScore(preset.usage);

    await this.saveUsageStats();
  }

  /**
   * Calculate popularity score
   */
  private calculatePopularityScore(usage: PresetUsage): number {
    let score = 0;
    
    // Play count (max 50 points)
    score += Math.min(usage.playCount, 50);
    
    // Favorite count (max 30 points)
    score += Math.min(usage.favoriteCount * 5, 30);
    
    // Recency bonus (max 20 points)
    if (usage.lastPlayed) {
      const daysSincePlay = (Date.now() - usage.lastPlayed.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 20 - daysSincePlay);
    }
    
    return score;
  }

  /**
   * Load usage stats from storage
   */
  private async loadUsageStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      if (data) {
        const stats = JSON.parse(data);
        this.usageStats = new Map(Object.entries(stats));
        
        // Apply to presets
        for (const [id, usage] of this.usageStats) {
          const preset = this.presets.get(id);
          if (preset) {
            preset.usage = usage as PresetUsage;
          }
        }
        
        console.log(`📊 Loaded usage stats for ${this.usageStats.size} presets`);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  }

  /**
   * Save usage stats to storage
   */
  private async saveUsageStats(): Promise<void> {
    try {
      const stats: Record<string, PresetUsage> = {};
      for (const [id, preset] of this.presets) {
        stats[id] = preset.usage;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }

  // ============================================================
  // GENRE STUDIOS
  // ============================================================

  /**
   * Get genre studio configuration
   */
  getGenreStudio(genreId: string): GenreStudio | undefined {
    return GENRE_STUDIOS.find(s => s.id === genreId);
  }

  /**
   * Get all genre studios
   */
  getGenreStudios(): GenreStudio[] {
    return GENRE_STUDIOS;
  }

  /**
   * Get presets for genre studio
   */
  getGenreStudioPresets(genreId: string): EnhancedPreset[] {
    const studio = this.getGenreStudio(genreId);
    if (!studio) return [];

    return this.searchPresets({ genres: [studio.genre] });
  }
}

// Singleton instance
export const presetLibrary = new PresetLibraryManager();
