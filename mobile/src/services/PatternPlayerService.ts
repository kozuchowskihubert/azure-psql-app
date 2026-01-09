/**
 * HAOS.fm Pattern Player Service
 * Manages pattern playback, layering, and mixing
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import {
  EnhancedPreset,
  PatternType,
  PatternLayer,
  MixerState,
} from '../types/presets';

/**
 * Pattern Player Service
 * Handles pattern playback and multi-layer mixing
 */
class PatternPlayerService {
  private currentPattern: Audio.Sound | null = null;
  private patternLayers: Map<number, PatternLayer> = new Map();
  private masterBPM: number = 128;
  private masterVolume: number = 1.0;
  private isPlaying: boolean = false;
  private isSynced: boolean = true;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio system
   */
  private async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('🎵 Pattern Player initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // ============================================================
  // SINGLE PATTERN PLAYBACK
  // ============================================================

  /**
   * Play single pattern
   */
  async playPattern(
    preset: EnhancedPreset,
    patternType: PatternType,
    loop: boolean = true
  ): Promise<void> {
    try {
      // Stop current pattern
      await this.stopCurrentPattern();

      // Get pattern
      const pattern = preset.patterns.find(p => p.type === patternType);
      if (!pattern) {
        console.warn(`Pattern not found: ${patternType}`);
        return;
      }
      
      if (!pattern.filePath) {
        console.error(`❌ Audio not available: Metro bundler requires static require() statements.`);
        console.error(`   Preset: ${preset.name}, Pattern: ${patternType}`);
        console.error(`   TODO: Generate static asset mapping file`);
        throw new Error('Audio files not yet configured for Pattern Studio. Please see PATTERN_STUDIO_METRO_FIX.md');
      }

      console.log(`▶️ Playing pattern: ${preset.name} - ${patternType}`);

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        pattern.filePath,
        {
          shouldPlay: true,
          isLooping: loop,
          volume: this.masterVolume,
        },
        this.onPlaybackStatusUpdate
      );

      this.currentPattern = sound;
      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to play pattern:', error);
      throw error;
    }
  }

  /**
   * Stop current pattern
   */
  async stopCurrentPattern(): Promise<void> {
    if (this.currentPattern) {
      try {
        await this.currentPattern.stopAsync();
        await this.currentPattern.unloadAsync();
        this.currentPattern = null;
        this.isPlaying = false;
      } catch (error) {
        console.error('Failed to stop pattern:', error);
      }
    }
  }

  /**
   * Pause current pattern
   */
  async pauseCurrentPattern(): Promise<void> {
    if (this.currentPattern) {
      try {
        await this.currentPattern.pauseAsync();
        this.isPlaying = false;
      } catch (error) {
        console.error('Failed to pause pattern:', error);
      }
    }
  }

  /**
   * Resume current pattern
   */
  async resumeCurrentPattern(): Promise<void> {
    if (this.currentPattern) {
      try {
        await this.currentPattern.playAsync();
        this.isPlaying = true;
      } catch (error) {
        console.error('Failed to resume pattern:', error);
      }
    }
  }

  /**
   * Playback status update callback
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    if (status.isLoaded) {
      // Handle playback completion
      if (status.didJustFinish && !status.isLooping) {
        this.isPlaying = false;
      }
    }
  };

  // ============================================================
  // MULTI-LAYER MIXING
  // ============================================================

  /**
   * Add pattern to layer slot
   */
  async addPatternLayer(
    slot: number,
    preset: EnhancedPreset,
    patternType: PatternType,
    volume: number = 0.8
  ): Promise<void> {
    if (slot < 0 || slot > 3) {
      console.warn('Invalid slot number. Must be 0-3');
      return;
    }

    try {
      // Remove existing layer in slot
      await this.removeLayer(slot);

      // Get pattern
      const pattern = preset.patterns.find(p => p.type === patternType);
      if (!pattern || !pattern.filePath) {
        console.warn(`Pattern not found: ${patternType}`);
        return;
      }

      console.log(`➕ Adding layer ${slot}: ${preset.name} - ${patternType}`);

      // Load pattern
      const { sound } = await Audio.Sound.createAsync(
        pattern.filePath,
        {
          shouldPlay: false,
          isLooping: true,
          volume: volume * this.masterVolume,
        }
      );

      // Create layer
      const layer: PatternLayer = {
        slot,
        preset,
        patternType,
        sound,
        volume,
        isMuted: false,
        isPlaying: false,
      };

      this.patternLayers.set(slot, layer);

      // Start if mixer is playing
      if (this.isPlaying) {
        await sound.playAsync();
        layer.isPlaying = true;
      }
    } catch (error) {
      console.error(`Failed to add pattern layer ${slot}:`, error);
    }
  }

  /**
   * Play all layers
   */
  async playAllLayers(): Promise<void> {
    if (this.patternLayers.size === 0) {
      console.warn('No layers to play');
      return;
    }

    try {
      this.isPlaying = true;

      // Start all layers simultaneously
      const promises: Promise<void>[] = [];
      
      for (const layer of this.patternLayers.values()) {
        if (!layer.isMuted) {
          promises.push(
            layer.sound.playAsync().then(() => {
              layer.isPlaying = true;
            })
          );
        }
      }

      await Promise.all(promises);
      console.log(`▶️ Playing ${this.patternLayers.size} layers`);
    } catch (error) {
      console.error('Failed to play all layers:', error);
    }
  }

  /**
   * Stop all layers
   */
  async stopAllLayers(): Promise<void> {
    try {
      this.isPlaying = false;

      const promises: Promise<void>[] = [];
      
      for (const layer of this.patternLayers.values()) {
        promises.push(
          layer.sound.stopAsync().then(() => {
            layer.isPlaying = false;
          })
        );
      }

      await Promise.all(promises);
      console.log('⏹️ Stopped all layers');
    } catch (error) {
      console.error('Failed to stop all layers:', error);
    }
  }

  /**
   * Pause all layers
   */
  async pauseAllLayers(): Promise<void> {
    try {
      this.isPlaying = false;

      const promises: Promise<void>[] = [];
      
      for (const layer of this.patternLayers.values()) {
        promises.push(
          layer.sound.pauseAsync().then(() => {
            layer.isPlaying = false;
          })
        );
      }

      await Promise.all(promises);
      console.log('⏸️ Paused all layers');
    } catch (error) {
      console.error('Failed to pause all layers:', error);
    }
  }

  /**
   * Resume all layers
   */
  async resumeAllLayers(): Promise<void> {
    try {
      this.isPlaying = true;

      const promises: Promise<void>[] = [];
      
      for (const layer of this.patternLayers.values()) {
        if (!layer.isMuted) {
          promises.push(
            layer.sound.playAsync().then(() => {
              layer.isPlaying = true;
            })
          );
        }
      }

      await Promise.all(promises);
      console.log('▶️ Resumed all layers');
    } catch (error) {
      console.error('Failed to resume all layers:', error);
    }
  }

  /**
   * Remove layer
   */
  async removeLayer(slot: number): Promise<void> {
    const layer = this.patternLayers.get(slot);
    if (!layer) return;

    try {
      await layer.sound.stopAsync();
      await layer.sound.unloadAsync();
      this.patternLayers.delete(slot);
      console.log(`➖ Removed layer ${slot}`);
    } catch (error) {
      console.error(`Failed to remove layer ${slot}:`, error);
    }
  }

  /**
   * Clear all layers
   */
  async clearAllLayers(): Promise<void> {
    try {
      await this.stopAllLayers();

      const promises: Promise<void>[] = [];
      for (const slot of this.patternLayers.keys()) {
        promises.push(this.removeLayer(slot));
      }

      await Promise.all(promises);
      console.log('🗑️ Cleared all layers');
    } catch (error) {
      console.error('Failed to clear all layers:', error);
    }
  }

  // ============================================================
  // LAYER CONTROLS
  // ============================================================

  /**
   * Set layer volume
   */
  async setLayerVolume(slot: number, volume: number): Promise<void> {
    const layer = this.patternLayers.get(slot);
    if (!layer) return;

    try {
      const actualVolume = volume * this.masterVolume;
      await layer.sound.setVolumeAsync(actualVolume);
      layer.volume = volume;
      console.log(`🔊 Layer ${slot} volume: ${volume.toFixed(2)}`);
    } catch (error) {
      console.error(`Failed to set layer ${slot} volume:`, error);
    }
  }

  /**
   * Toggle layer mute
   */
  async toggleLayerMute(slot: number): Promise<void> {
    const layer = this.patternLayers.get(slot);
    if (!layer) return;

    try {
      layer.isMuted = !layer.isMuted;
      const newVolume = layer.isMuted ? 0 : layer.volume * this.masterVolume;
      await layer.sound.setVolumeAsync(newVolume);
      
      console.log(`🔇 Layer ${slot} ${layer.isMuted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error(`Failed to toggle layer ${slot} mute:`, error);
    }
  }

  /**
   * Solo layer (mute all others)
   */
  async soloLayer(slot: number): Promise<void> {
    try {
      for (const [layerSlot, layer] of this.patternLayers) {
        if (layerSlot === slot) {
          // Unmute this layer
          if (layer.isMuted) {
            await this.toggleLayerMute(layerSlot);
          }
        } else {
          // Mute other layers
          if (!layer.isMuted) {
            await this.toggleLayerMute(layerSlot);
          }
        }
      }
      console.log(`🎯 Solo layer ${slot}`);
    } catch (error) {
      console.error(`Failed to solo layer ${slot}:`, error);
    }
  }

  /**
   * Unsolo all layers
   */
  async unsoloAll(): Promise<void> {
    try {
      for (const [slot, layer] of this.patternLayers) {
        if (layer.isMuted) {
          await this.toggleLayerMute(slot);
        }
      }
      console.log('🔊 Unsolo all layers');
    } catch (error) {
      console.error('Failed to unsolo all layers:', error);
    }
  }

  // ============================================================
  // MASTER CONTROLS
  // ============================================================

  /**
   * Set master volume
   */
  async setMasterVolume(volume: number): Promise<void> {
    try {
      this.masterVolume = Math.max(0, Math.min(1, volume));

      // Update all layer volumes
      const promises: Promise<void>[] = [];
      for (const layer of this.patternLayers.values()) {
        const actualVolume = layer.isMuted ? 0 : layer.volume * this.masterVolume;
        promises.push(layer.sound.setVolumeAsync(actualVolume));
      }

      await Promise.all(promises);
      console.log(`🔊 Master volume: ${this.masterVolume.toFixed(2)}`);
    } catch (error) {
      console.error('Failed to set master volume:', error);
    }
  }

  /**
   * Set master BPM (time-stretch all patterns)
   */
  async setMasterBPM(bpm: number): Promise<void> {
    try {
      this.masterBPM = Math.max(60, Math.min(200, bpm));

      // Calculate and apply playback rate for each layer
      const promises: Promise<void>[] = [];
      
      for (const layer of this.patternLayers.values()) {
        const pattern = layer.preset.patterns.find(p => p.type === layer.patternType);
        if (pattern) {
          const originalBPM = pattern.bpm;
          const playbackRate = this.masterBPM / originalBPM;
          
          // Expo-av supports playback rate between 0.5 and 2.0
          const clampedRate = Math.max(0.5, Math.min(2.0, playbackRate));
          promises.push(layer.sound.setRateAsync(clampedRate, true));
        }
      }

      await Promise.all(promises);
      console.log(`⏱️ Master BPM: ${this.masterBPM}`);
    } catch (error) {
      console.error('Failed to set master BPM:', error);
    }
  }

  /**
   * Toggle sync mode
   */
  toggleSync(): void {
    this.isSynced = !this.isSynced;
    console.log(`🔄 Sync: ${this.isSynced ? 'ON' : 'OFF'}`);
  }

  // ============================================================
  // STATE GETTERS
  // ============================================================

  /**
   * Get mixer state
   */
  getMixerState(): MixerState {
    return {
      layers: new Map(this.patternLayers),
      masterVolume: this.masterVolume,
      masterBPM: this.masterBPM,
      isPlaying: this.isPlaying,
      isSynced: this.isSynced,
    };
  }

  /**
   * Get layer
   */
  getLayer(slot: number): PatternLayer | undefined {
    return this.patternLayers.get(slot);
  }

  /**
   * Get all layers
   */
  getAllLayers(): PatternLayer[] {
    return Array.from(this.patternLayers.values());
  }

  /**
   * Check if playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get master BPM
   */
  getMasterBPM(): number {
    return this.masterBPM;
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  // ============================================================
  // PLAYBACK INFO
  // ============================================================

  /**
   * Get layer playback position
   */
  async getLayerPosition(slot: number): Promise<number> {
    const layer = this.patternLayers.get(slot);
    if (!layer) return 0;

    try {
      const status = await layer.sound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis;
      }
    } catch (error) {
      console.error(`Failed to get layer ${slot} position:`, error);
    }

    return 0;
  }

  /**
   * Get layer duration
   */
  async getLayerDuration(slot: number): Promise<number> {
    const layer = this.patternLayers.get(slot);
    if (!layer) return 0;

    try {
      const status = await layer.sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis;
      }
    } catch (error) {
      console.error(`Failed to get layer ${slot} duration:`, error);
    }

    return 0;
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopCurrentPattern();
      await this.clearAllLayers();
      console.log('🧹 Pattern Player cleaned up');
    } catch (error) {
      console.error('Failed to cleanup Pattern Player:', error);
    }
  }
}

// Singleton instance
export const patternPlayer = new PatternPlayerService();
