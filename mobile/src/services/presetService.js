/**
 * Preset Service - API client for preset management
 * Handles fetching, downloading, and caching presets
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://haos.fm/api';
const PRESETS_CACHE_KEY = '@haos_presets_cache';
const DOWNLOADED_PRESETS_KEY = '@haos_downloaded_presets';

class PresetService {
  constructor() {
    this.cachedPresets = null;
    this.downloadedPresets = new Map();
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders() {
    const sessionId = await SecureStore.getItemAsync('haos_session');
    return sessionId ? { Cookie: `haos_session=${sessionId}` } : {};
  }

  /**
   * Fetch presets from API with filters
   */
  async fetchPresets(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.workspace) params.append('workspace', filters.workspace);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured) params.append('featured', 'true');
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await axios.get(`${API_URL}/presets?${params}`, { headers });
      
      // Cache results
      this.cachedPresets = response.data;
      await AsyncStorage.setItem(PRESETS_CACHE_KEY, JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch presets:', error);
      
      // Return cached data if available
      if (this.cachedPresets) {
        return this.cachedPresets;
      }
      
      // Try to load from AsyncStorage
      const cached = await AsyncStorage.getItem(PRESETS_CACHE_KEY);
      if (cached) {
        this.cachedPresets = JSON.parse(cached);
        return this.cachedPresets;
      }
      
      throw error;
    }
  }

  /**
   * Get single preset by ID
   */
  async getPreset(presetId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/presets/${presetId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch preset:', error);
      throw error;
    }
  }

  /**
   * Download preset data
   */
  async downloadPreset(presetId) {
    try {
      const preset = await this.getPreset(presetId);
      
      // Store in local storage
      const downloaded = await this.getDownloadedPresets();
      downloaded[presetId] = {
        ...preset,
        downloadedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(DOWNLOADED_PRESETS_KEY, JSON.stringify(downloaded));
      this.downloadedPresets.set(presetId, downloaded[presetId]);
      
      return downloaded[presetId];
    } catch (error) {
      console.error('Failed to download preset:', error);
      throw error;
    }
  }

  /**
   * Get all downloaded presets
   */
  async getDownloadedPresets() {
    try {
      const stored = await AsyncStorage.getItem(DOWNLOADED_PRESETS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get downloaded presets:', error);
      return {};
    }
  }

  /**
   * Check if preset is downloaded
   */
  async isPresetDownloaded(presetId) {
    const downloaded = await this.getDownloadedPresets();
    return !!downloaded[presetId];
  }

  /**
   * Delete downloaded preset
   */
  async deleteDownloadedPreset(presetId) {
    try {
      const downloaded = await this.getDownloadedPresets();
      delete downloaded[presetId];
      await AsyncStorage.setItem(DOWNLOADED_PRESETS_KEY, JSON.stringify(downloaded));
      this.downloadedPresets.delete(presetId);
      return true;
    } catch (error) {
      console.error('Failed to delete preset:', error);
      return false;
    }
  }

  /**
   * Get preset categories
   */
  async getCategories() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_URL}/presets/categories`, { headers });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return default categories
      return [
        { id: 'bass', name: 'Bass', count: 0 },
        { id: 'lead', name: 'Lead', count: 0 },
        { id: 'pad', name: 'Pad', count: 0 },
        { id: 'fx', name: 'FX', count: 0 },
        { id: 'drum', name: 'Drum', count: 0 },
      ];
    }
  }

  /**
   * Search presets
   */
  async searchPresets(query) {
    return this.fetchPresets({ search: query });
  }

  /**
   * Get featured presets
   */
  async getFeaturedPresets(limit = 10) {
    return this.fetchPresets({ featured: true, limit });
  }

  /**
   * Get presets by workspace
   */
  async getPresetsByWorkspace(workspace, limit = 20, offset = 0) {
    return this.fetchPresets({ workspace, limit, offset });
  }

  /**
   * Track preset download (for analytics)
   */
  async trackDownload(presetId) {
    try {
      const headers = await this.getAuthHeaders();
      await axios.post(`${API_URL}/presets/${presetId}/download`, {}, { headers });
    } catch (error) {
      // Don't throw - this is just analytics
      console.warn('Failed to track download:', error);
    }
  }

  /**
   * Load preset into workspace
   */
  loadPresetIntoSynth(preset, audioEngine) {
    if (!preset || !audioEngine) return;

    try {
      // Parse preset data
      const { parameters } = preset;
      
      // Set oscillator
      if (parameters.waveform) {
        // Apply waveform to audio engine
      }
      
      // Set filter
      if (parameters.filter) {
        audioEngine.setFilter(
          parameters.filter.type || 'lowpass',
          parameters.filter.frequency || 1000,
          parameters.filter.q || 1
        );
      }
      
      // Set ADSR
      if (parameters.adsr) {
        audioEngine.setADSR(
          parameters.adsr.attack || 0.1,
          parameters.adsr.decay || 0.2,
          parameters.adsr.sustain || 0.7,
          parameters.adsr.release || 0.3
        );
      }
      
      // Set volume
      if (parameters.volume !== undefined) {
        audioEngine.setMasterVolume(parameters.volume);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to load preset:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  async clearCache() {
    this.cachedPresets = null;
    await AsyncStorage.removeItem(PRESETS_CACHE_KEY);
  }

  /**
   * Clear all downloaded presets
   */
  async clearAllDownloads() {
    this.downloadedPresets.clear();
    await AsyncStorage.removeItem(DOWNLOADED_PRESETS_KEY);
  }

  /**
   * Get storage usage
   */
  async getStorageUsage() {
    const downloaded = await this.getDownloadedPresets();
    const count = Object.keys(downloaded).length;
    
    // Estimate size (rough calculation)
    const estimatedSize = count * 50; // KB per preset (average)
    
    return {
      count,
      estimatedSizeKB: estimatedSize,
      estimatedSizeMB: (estimatedSize / 1024).toFixed(2),
    };
  }
}

// Singleton instance
const presetService = new PresetService();

export default presetService;
