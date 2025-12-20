/**
 * HAOS.fm Audio Engine - Main Export
 * Central hub for all synthesis engines and audio modules
 */

import WavetableEngine from './WavetableEngine';
import BassArpEngine from './BassArpEngine';
import ModulationMatrix from './ModulationMatrix';
import VirtualInstruments from './VirtualInstruments';
import PresetManager from './PresetManager';

// Export all engines
export {
  WavetableEngine,
  BassArpEngine,
  ModulationMatrix,
  VirtualInstruments,
  PresetManager,
};

// Create singleton instances
export const wavetableEngine = new WavetableEngine();
export const bassArpEngine = new BassArpEngine();
export const modulationMatrix = new ModulationMatrix();
export const virtualInstruments = new VirtualInstruments();
export const presetManager = new PresetManager();

/**
 * Initialize all audio engines
 */
export async function initializeAudioEngines() {
  console.log('🎛️ Initializing HAOS Audio Engines...');
  
  try {
    await wavetableEngine.initialize();
    await bassArpEngine.initialize();
    await virtualInstruments.initialize();
    
    console.log('✅ All audio engines initialized');
    console.log(`📦 ${presetManager.getPresetCount()} presets loaded`);
    
    return true;
  } catch (error) {
    console.error('❌ Audio engine initialization error:', error);
    return false;
  }
}

/**
 * Get engine stats
 */
export function getEngineStats() {
  return {
    wavetable: {
      initialized: wavetableEngine.isInitialized,
      activeVoices: wavetableEngine.voices.length,
      wavetables: Object.keys(wavetableEngine.wavetables).length,
    },
    bassArp: {
      initialized: bassArpEngine.isInitialized,
      activeVoices: bassArpEngine.voices.length,
      bassPresets: Object.keys(bassArpEngine.getBassPresets()).length,
      arpPresets: Object.keys(bassArpEngine.getArpPresets()).length,
    },
    modulation: {
      routings: modulationMatrix.routings.length,
      activeRoutings: modulationMatrix.routings.filter(r => r.enabled).length,
      lfos: Object.keys(modulationMatrix.lfos).length,
    },
    instruments: {
      initialized: virtualInstruments.isInitialized,
      totalInstruments: Object.keys(virtualInstruments.instruments).length,
      currentInstrument: virtualInstruments.currentInstrument,
      activeVoices: virtualInstruments.voices.length,
    },
    presets: {
      categories: presetManager.getCategories().length,
      totalPresets: presetManager.getPresetCount(),
      currentPreset: presetManager.currentPreset?.name || 'None',
    }
  };
}

/**
 * Cleanup all engines
 */
export function destroyAllEngines() {
  wavetableEngine.destroy();
  bassArpEngine.destroy();
  virtualInstruments.destroy();
  console.log('🧹 All audio engines destroyed');
}

export default {
  WavetableEngine,
  BassArpEngine,
  ModulationMatrix,
  VirtualInstruments,
  PresetManager,
  initializeAudioEngines,
  getEngineStats,
  destroyAllEngines,
};
