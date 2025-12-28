/**
 * HAOS.fm Studio Screen - REFACTORED
 * Mixer + Effects Interface for Recording & Mixing
 * Based on haos-studio.html and studio.html design
 * Date: December 28, 2025
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { COLORS, GRADIENTS } from '../styles/colors';
import { TYPOGRAPHY } from '../styles/typography';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

const { width, height } = Dimensions.get('window');

// Effects Library
const EFFECTS = [
  { id: 'reverb', name: 'REVERB', emoji: '🌊', color: COLORS.cyan, active: false },
  { id: 'delay', name: 'DELAY', emoji: '🔁', color: COLORS.purple, active: false },
  { id: 'compress', name: 'COMPRESS', emoji: '📦', color: COLORS.orange, active: false },
  { id: 'eq', name: 'EQ', emoji: '🎚️', color: COLORS.green, active: false },
  { id: 'distortion', name: 'DISTORTION', emoji: '⚡', color: COLORS.red, active: false },
  { id: 'chorus', name: 'CHORUS', emoji: '🎭', color: COLORS.purple, active: false },
  { id: 'flanger', name: 'FLANGER', emoji: '🌀', color: COLORS.cyan, active: false },
  { id: 'phaser', name: 'PHASER', emoji: '🔄', color: COLORS.gold, active: false },
  { id: 'limiter', name: 'LIMITER', emoji: '🛡️', color: COLORS.orange, active: false },
];

// Track Configurations
const INITIAL_TRACKS = [
  { 
    id: 1, 
    name: 'VOCALS', 
    color: COLORS.cyan, 
    volume: 0.8, 
    pan: 0, 
    muted: false, 
    solo: false, 
    recording: false,
    effects: [],
    waveform: [0.4, 0.7, 0.3, 0.8, 0.5, 0.9, 0.2, 0.6, 0.4, 0.7],
  },
  { 
    id: 2, 
    name: 'SYNTH', 
    color: COLORS.orange, 
    volume: 0.7, 
    pan: 0, 
    muted: false, 
    solo: false, 
    recording: false,
    effects: [],
    waveform: [0.3, 0.5, 0.7, 0.4, 0.6, 0.5, 0.7, 0.3, 0.5, 0.6],
  },
  { 
    id: 3, 
    name: 'DRUMS', 
    color: COLORS.purple, 
    volume: 0.9, 
    pan: 0, 
    muted: false, 
    solo: false, 
    recording: false,
    effects: [],
    waveform: [0.8, 0.9, 0.5, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.5],
  },
  { 
    id: 4, 
    name: 'BASS', 
    color: COLORS.green, 
    volume: 0.75, 
    pan: 0, 
    muted: false, 
    solo: false, 
    recording: false,
    effects: [],
    waveform: [0.6, 0.7, 0.8, 0.5, 0.6, 0.7, 0.5, 0.8, 0.6, 0.7],
  },
];

// Mixer Channel Component
const MixerChannel = ({ track, onVolumeChange, onPanChange, onMuteToggle, onSoloToggle, onEffectsPress }) => {
  const [showWaveform, setShowWaveform] = useState(true);

  return (
    <View style={styles.mixerChannel}>
      <LinearGradient
        colors={[COLORS.bgCard, COLORS.bgDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.channelGradient}
      >
        {/* Channel Border */}
        <View style={[styles.channelBorder, { borderColor: track.color }]} />
        
        {/* Track Header */}
        <View style={styles.channelHeader}>
          <View style={[styles.trackIndicator, { backgroundColor: track.color }]} />
          <Text style={styles.trackName}>{track.name}</Text>
          <TouchableOpacity onPress={() => setShowWaveform(!showWaveform)}>
            <Text style={styles.waveformToggle}>{showWaveform ? '📊' : '📈'}</Text>
          </TouchableOpacity>
        </View>

        {/* Waveform Visualization */}
        {showWaveform && (
          <View style={styles.waveformContainer}>
            {track.waveform.map((amplitude, index) => (
              <View 
                key={index}
                style={[
                  styles.waveformBar,
                  { 
                    height: amplitude * 40,
                    backgroundColor: track.muted ? COLORS.grayDark : track.color,
                  }
                ]}
              />
            ))}
          </View>
        )}

        {/* Volume Fader */}
        <View style={styles.faderContainer}>
          <Text style={styles.faderLabel}>VOLUME</Text>
          <View style={styles.faderTrack}>
            <Slider
              style={styles.fader}
              value={track.volume}
              onValueChange={onVolumeChange}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor={track.color}
              maximumTrackTintColor={COLORS.grayDark}
              thumbTintColor={track.color}
              vertical={true}
            />
            <Text style={styles.faderValue}>
              {Math.round(track.volume * 100)}%
            </Text>
          </View>
        </View>

        {/* dB Meter */}
        <View style={styles.meterContainer}>
          <View style={styles.meterTrack}>
            <View 
              style={[
                styles.meterFill,
                { 
                  height: `${track.volume * 100}%`,
                  backgroundColor: track.volume > 0.9 ? COLORS.red : track.volume > 0.7 ? COLORS.orange : COLORS.green,
                }
              ]}
            />
          </View>
          <Text style={styles.meterLabel}>
            {Math.round((track.volume * 12) - 12)}dB
          </Text>
        </View>

        {/* Pan Control */}
        <View style={styles.panContainer}>
          <Text style={styles.panLabel}>PAN</Text>
          <Slider
            style={styles.panSlider}
            value={track.pan}
            onValueChange={onPanChange}
            minimumValue={-1}
            maximumValue={1}
            minimumTrackTintColor={COLORS.cyan}
            maximumTrackTintColor={COLORS.cyan}
            thumbTintColor={COLORS.textPrimary}
          />
          <View style={styles.panValueContainer}>
            <Text style={styles.panValue}>
              {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
            </Text>
          </View>
        </View>

        {/* Channel Controls */}
        <View style={styles.channelControls}>
          <TouchableOpacity
            onPress={onMuteToggle}
            style={[
              styles.controlButton,
              styles.muteButton,
              track.muted && styles.controlButtonActive,
            ]}
          >
            <Text style={[styles.controlButtonText, track.muted && styles.controlButtonTextActive]}>M</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSoloToggle}
            style={[
              styles.controlButton,
              styles.soloButton,
              track.solo && styles.controlButtonActive,
            ]}
          >
            <Text style={[styles.controlButtonText, track.solo && styles.controlButtonTextActive]}>S</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEffectsPress}
            style={[
              styles.controlButton,
              styles.effectsButton,
              track.effects.length > 0 && styles.controlButtonActive,
            ]}
          >
            <Text style={[styles.controlButtonText, track.effects.length > 0 && styles.controlButtonTextActive]}>FX</Text>
            {track.effects.length > 0 && (
              <View style={styles.effectsBadge}>
                <Text style={styles.effectsBadgeText}>{track.effects.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

// Effect Card Component
const EffectCard = ({ effect, onToggle }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onToggle}
    style={[styles.effectCard, effect.active && styles.effectCardActive]}
  >
    <LinearGradient
      colors={effect.active ? [effect.color + '40', effect.color + '20'] : [COLORS.bgCard, COLORS.bgDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.effectGradient}
    >
      <View style={[styles.effectBorder, { borderColor: effect.active ? effect.color : COLORS.borderGray }]} />
      <Text style={styles.effectEmoji}>{effect.emoji}</Text>
      <Text style={[styles.effectName, effect.active && { color: effect.color }]}>{effect.name}</Text>
      {effect.active && (
        <View style={[styles.effectIndicator, { backgroundColor: effect.color }]} />
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export default function StudioScreen({ navigation, route }) {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [effects, setEffects] = useState(EFFECTS);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const persona = route?.params?.persona || 'musician';

  // Track Control Handlers
  const updateTrack = (trackId, updates) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const handleVolumeChange = (trackId, volume) => {
    updateTrack(trackId, { volume });
  };

  const handlePanChange = (trackId, pan) => {
    updateTrack(trackId, { pan });
  };

  const handleMuteToggle = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    updateTrack(trackId, { muted: !track.muted });
  };

  const handleSoloToggle = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    updateTrack(trackId, { solo: !track.solo });
  };

  const handleEffectsPress = (trackId) => {
    setSelectedTrack(trackId);
    // TODO: Open effects modal
  };

  const handleEffectToggle = (effectId) => {
    setEffects(prev => prev.map(effect =>
      effect.id === effectId ? { ...effect, active: !effect.active } : effect
    ));
  };

  const handleAddTrack = () => {
    const newTrack = {
      id: tracks.length + 1,
      name: `TRACK ${tracks.length + 1}`,
      color: COLORS.orange,
      volume: 0.7,
      pan: 0,
      muted: false,
      solo: false,
      recording: false,
      effects: [],
      waveform: Array.from({ length: 10 }, () => Math.random()),
    };
    setTracks([...tracks, newTrack]);
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
        <Text style={styles.headerTitle}>STUDIO</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Master Section */}
      <View style={styles.masterSection}>
        <View style={styles.masterHeader}>
          <Text style={styles.masterTitle}>🎛️ MASTER BUS</Text>
          <Text style={styles.masterValue}>{Math.round(masterVolume * 100)}%</Text>
        </View>
        <Slider
          style={styles.masterSlider}
          value={masterVolume}
          onValueChange={setMasterVolume}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={COLORS.orange}
          maximumTrackTintColor={COLORS.grayDark}
          thumbTintColor={COLORS.orange}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Mixer Channels */}
        <View style={styles.mixerSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎚️ MIXER</Text>
            <TouchableOpacity onPress={handleAddTrack} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ ADD TRACK</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.channelsContainer}
          >
            {tracks.map(track => (
              <MixerChannel
                key={track.id}
                track={track}
                onVolumeChange={(volume) => handleVolumeChange(track.id, volume)}
                onPanChange={(pan) => handlePanChange(track.id, pan)}
                onMuteToggle={() => handleMuteToggle(track.id)}
                onSoloToggle={() => handleSoloToggle(track.id)}
                onEffectsPress={() => handleEffectsPress(track.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Effects Rack */}
        <View style={styles.effectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ EFFECTS RACK</Text>
            <Text style={styles.sectionSubtitle}>
              {effects.filter(e => e.active).length} active
            </Text>
          </View>

          <View style={styles.effectsGrid}>
            {effects.map(effect => (
              <EffectCard
                key={effect.id}
                effect={effect}
                onToggle={() => handleEffectToggle(effect.id)}
              />
            ))}
          </View>
        </View>

        {/* Waveform Analyzer */}
        <View style={styles.analyzerSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 WAVEFORM ANALYZER</Text>
          </View>

          <View style={styles.analyzerContainer}>
            <LinearGradient
              colors={[COLORS.bgCard, COLORS.bgDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.analyzerGradient}
            >
              <View style={styles.waveformDisplay}>
                {/* Master Waveform */}
                {Array.from({ length: 50 }).map((_, index) => {
                  const amplitude = Math.sin(index * 0.2) * 0.5 + 0.5;
                  return (
                    <View 
                      key={index}
                      style={[
                        styles.analyzerBar,
                        { 
                          height: amplitude * 80,
                          backgroundColor: amplitude > 0.7 ? COLORS.red : amplitude > 0.5 ? COLORS.orange : COLORS.green,
                        }
                      ]}
                    />
                  );
                })}
              </View>
              
              {/* Peak Indicator */}
              <View style={styles.peakIndicator}>
                <Text style={styles.peakLabel}>PEAK:</Text>
                <Text style={[styles.peakValue, { color: masterVolume > 0.9 ? COLORS.red : COLORS.green }]}>
                  {Math.round((masterVolume * 12) - 12)}dB
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Creator')}
          >
            <LinearGradient
              colors={GRADIENTS.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🎹</Text>
              <Text style={styles.actionText}>OPEN CREATOR</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Instruments')}
          >
            <LinearGradient
              colors={GRADIENTS.secondaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🎸</Text>
              <Text style={styles.actionText}>INSTRUMENTS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Panel */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Adjust track volumes, pan, and apply effects. Use M (mute), S (solo), and FX buttons for each track.
          </Text>
        </View>
      </ScrollView>
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
  // Master Section
  masterSection: {
    padding: 20,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  masterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masterTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  masterValue: {
    ...TYPOGRAPHY.mono,
    color: COLORS.orange,
    fontSize: 18,
  },
  masterSlider: {
    width: '100%',
    height: 40,
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  // Sections
  mixerSection: {
    paddingVertical: 20,
  },
  effectsSection: {
    padding: 20,
  },
  analyzerSection: {
    padding: 20,
  },
  actionsSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.orangeTransparent,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  addButtonText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.orange,
    fontWeight: 'bold',
  },
  // Mixer Channels
  channelsContainer: {
    paddingHorizontal: 15,
  },
  mixerChannel: {
    width: 180,
    marginRight: 15,
  },
  channelGradient: {
    borderRadius: 16,
    padding: 15,
    position: 'relative',
    minHeight: 400,
  },
  channelBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trackName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  waveformToggle: {
    fontSize: 16,
  },
  // Waveform
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: 15,
    gap: 2,
  },
  waveformBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  // Fader
  faderContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  faderLabel: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  faderTrack: {
    alignItems: 'center',
  },
  fader: {
    width: 100,
    height: 150,
    transform: [{ rotate: '-90deg' }],
  },
  faderValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 5,
  },
  // Meter
  meterContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  meterTrack: {
    width: 20,
    height: 100,
    backgroundColor: COLORS.grayDark,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  meterFill: {
    width: '100%',
    borderRadius: 10,
  },
  meterLabel: {
    ...TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  // Pan
  panContainer: {
    marginBottom: 15,
  },
  panLabel: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  panSlider: {
    width: '100%',
    height: 30,
  },
  panValueContainer: {
    alignItems: 'center',
  },
  panValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  // Channel Controls
  channelControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  controlButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.borderGray,
  },
  controlButtonActive: {
    backgroundColor: COLORS.orangeTransparent,
    borderColor: COLORS.orange,
  },
  controlButtonText: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controlButtonTextActive: {
    color: COLORS.orange,
  },
  muteButton: {},
  soloButton: {},
  effectsButton: {
    position: 'relative',
  },
  effectsBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectsBadgeText: {
    ...TYPOGRAPHY.tiny,
    fontSize: 10,
    color: COLORS.bgDark,
    fontWeight: 'bold',
  },
  // Effects Grid
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  effectCard: {
    width: (width - 60) / 3,
  },
  effectGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    minHeight: 100,
  },
  effectBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
  },
  effectCardActive: {},
  effectEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  effectName: {
    ...TYPOGRAPHY.label,
    fontSize: 10,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  effectIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Analyzer
  analyzerContainer: {
    marginHorizontal: 20,
  },
  analyzerGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  waveformDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    gap: 2,
  },
  analyzerBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  peakIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  peakLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  peakValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Actions
  actionButton: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    ...TYPOGRAPHY.button,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  // Info Panel
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
