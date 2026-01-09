/**
 * Static asset mappings for Pattern Studio
 * Metro bundler requires all require() calls to be static
 */

// This is a simplified version - you'll need to generate the full mapping
// For now, let's create a helper that uses Asset.fromModule

import { Asset } from 'expo-asset';

/**
 * Get asset URI for a preset sample
 */
export async function getPresetSampleAsset(category: string, fileName: string): Promise<string> {
  // Since we can't use dynamic require(), we'll construct the asset path
  // and use expo-file-system to access it
  const assetPath = `../../assets/sounds/presets/${category}/${fileName}`;
  
  // For now, return the constructed path
  // expo-av can handle paths in the assets directory
  return assetPath;
}

/**
 * Get asset URI for a pattern
 */
export async function getPatternAsset(category: string, fileName: string): Promise<string> {
  const assetPath = `../../assets/sounds/presets/patterns/${category}/${fileName}`;
  return assetPath;
}
