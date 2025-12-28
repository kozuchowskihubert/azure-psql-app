/**
 * HAOS.fm Preset Storage Utilities
 * AsyncStorage-based preset management for all instruments
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PRESET_KEY_PREFIX = '@haos_preset_';

/**
 * Save a user preset to AsyncStorage
 * @param {string} instrumentId - e.g., 'tb303', 'tr808', 'minimoog'
 * @param {string} presetName - User-defined preset name
 * @param {object} parameters - All instrument parameters
 * @returns {Promise<boolean>} Success status
 */
export const savePreset = async (instrumentId, presetName, parameters) => {
  try {
    const key = `${PRESET_KEY_PREFIX}${instrumentId}_${presetName}`;
    const preset = {
      name: presetName,
      instrumentId,
      parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(preset));
    console.log(`✅ Preset saved: ${instrumentId}/${presetName}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save preset:', error);
    return false;
  }
};

/**
 * Load all user presets for an instrument
 * @param {string} instrumentId - e.g., 'tb303', 'tr808', 'minimoog'
 * @returns {Promise<Array>} Array of preset objects
 */
export const loadPresets = async (instrumentId) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const presetKeys = allKeys.filter(key => 
      key.startsWith(`${PRESET_KEY_PREFIX}${instrumentId}_`)
    );
    
    const presets = await AsyncStorage.multiGet(presetKeys);
    const parsedPresets = presets
      .map(([key, value]) => JSON.parse(value))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    console.log(`📂 Loaded ${parsedPresets.length} presets for ${instrumentId}`);
    return parsedPresets;
  } catch (error) {
    console.error('❌ Failed to load presets:', error);
    return [];
  }
};

/**
 * Delete a specific preset
 * @param {string} instrumentId - e.g., 'tb303', 'tr808', 'minimoog'
 * @param {string} presetName - Preset name to delete
 * @returns {Promise<boolean>} Success status
 */
export const deletePreset = async (instrumentId, presetName) => {
  try {
    const key = `${PRESET_KEY_PREFIX}${instrumentId}_${presetName}`;
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Preset deleted: ${instrumentId}/${presetName}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete preset:', error);
    return false;
  }
};

/**
 * Export a preset to JSON string (for sharing/clipboard)
 * @param {object} preset - Preset object to export
 * @returns {string} JSON string
 */
export const exportPreset = (preset) => {
  try {
    const exportData = {
      version: '1.0',
      app: 'HAOS.fm',
      preset,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('❌ Failed to export preset:', error);
    return null;
  }
};

/**
 * Import a preset from JSON string
 * @param {string} jsonString - JSON string from clipboard/file
 * @returns {object|null} Parsed preset object or null if invalid
 */
export const importPreset = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data.preset || !data.preset.instrumentId || !data.preset.parameters) {
      throw new Error('Invalid preset format');
    }
    
    console.log(`📥 Imported preset: ${data.preset.instrumentId}/${data.preset.name}`);
    return data.preset;
  } catch (error) {
    console.error('❌ Failed to import preset:', error);
    return null;
  }
};

/**
 * Get preset count for an instrument
 * @param {string} instrumentId - e.g., 'tb303', 'tr808', 'minimoog'
 * @returns {Promise<number>} Number of saved presets
 */
export const getPresetCount = async (instrumentId) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const presetKeys = allKeys.filter(key => 
      key.startsWith(`${PRESET_KEY_PREFIX}${instrumentId}_`)
    );
    return presetKeys.length;
  } catch (error) {
    console.error('❌ Failed to get preset count:', error);
    return 0;
  }
};

/**
 * Clear all user presets for an instrument
 * @param {string} instrumentId - e.g., 'tb303', 'tr808', 'minimoog'
 * @returns {Promise<boolean>} Success status
 */
export const clearAllPresets = async (instrumentId) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const presetKeys = allKeys.filter(key => 
      key.startsWith(`${PRESET_KEY_PREFIX}${instrumentId}_`)
    );
    
    await AsyncStorage.multiRemove(presetKeys);
    console.log(`🧹 Cleared ${presetKeys.length} presets for ${instrumentId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear presets:', error);
    return false;
  }
};
