/**
 * HAOS.fm Effects Controller
 * Real-time effects control panel for master effects and per-track sends
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import bridge from '../audio/WebAudioBridge';
import { COLORS, TYPO, SPACING, SHADOW } from '../styles/HAOSDesignSystem';

// Simple slider component using TouchableOpacity
const SimpleSlider = ({ value, minimumValue, maximumValue, onValueChange, minimumTrackTintColor, thumbTintColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handlePress = (event) => {
    const { locationX } = event.nativeEvent;
    const width = 280; // approximate slider width
    const percentage = Math.max(0, Math.min(1, locationX / width));
    const newValue = minimumValue + percentage * (maximumValue - minimumValue);
    onValueChange(newValue);
  };

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <TouchableOpacity 
      style={sliderStyles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={sliderStyles.track}>
        <View style={[sliderStyles.fill, { width: `${percentage}%`, backgroundColor: minimumTrackTintColor }]} />
        <View style={[sliderStyles.thumb, { left: `${percentage}%`, backgroundColor: thumbTintColor }]} />
      </View>
    </TouchableOpacity>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
});

const EffectsController = () => {
  // Master effects state
  const [distortionAmount, setDistortionAmount] = useState(0);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0.375);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [delayMix, setDelayMix] = useState(0.2);
  const [masterFilterCutoff, setMasterFilterCutoff] = useState(8000);
  const [compressionThreshold, setCompressionThreshold] = useState(-24);
  const [compressionRatio, setCompressionRatio] = useState(4);

  // Per-track sends
  const [trackSends, setTrackSends] = useState({
    kick: { reverbSend: 0, delaySend: 0, volume: 1.0 },
    snare: { reverbSend: 0.2, delaySend: 0, volume: 1.0 },
    hihat: { reverbSend: 0.1, delaySend: 0, volume: 0.7 },
    clap: { reverbSend: 0.3, delaySend: 0, volume: 0.8 },
    bass: { reverbSend: 0.05, delaySend: 0, volume: 0.9 },
  });

  const [activeTab, setActiveTab] = useState('master'); // 'master' or 'tracks'

  const handleMasterEffect = (param, value) => {
    const params = {};
    
    switch (param) {
      case 'distortion':
        setDistortionAmount(value);
        params.distortionAmount = value;
        break;
      case 'reverb':
        setReverbMix(value);
        params.reverbMix = value;
        break;
      case 'delayTime':
        setDelayTime(value);
        params.delayTime = value;
        break;
      case 'delayFeedback':
        setDelayFeedback(value);
        params.delayFeedback = value;
        break;
      case 'delayMix':
        setDelayMix(value);
        params.delayMix = value;
        break;
      case 'filter':
        setMasterFilterCutoff(value);
        params.masterFilterCutoff = value;
        break;
      case 'compThreshold':
        setCompressionThreshold(value);
        params.compressionThreshold = value;
        break;
      case 'compRatio':
        setCompressionRatio(value);
        params.compressionRatio = value;
        break;
    }

    bridge.updateEffectsParams(params);
  };

  const handleTrackSend = (track, sendType, value) => {
    setTrackSends(prev => ({
      ...prev,
      [track]: {
        ...prev[track],
        [sendType]: value,
      },
    }));

    bridge.setTrackSend(track, sendType, value);
  };

  const handleTrackParam = (track, param, value) => {
    setTrackSends(prev => ({
      ...prev,
      [track]: {
        ...prev[track],
        [param]: value,
      },
    }));

    bridge.setTrackParam(track, param, value);
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'master' && styles.tabActive]}
          onPress={() => setActiveTab('master')}
        >
          <Text style={[styles.tabText, activeTab === 'master' && styles.tabTextActive]}>
            🎛️ Master FX
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracks' && styles.tabActive]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.tabTextActive]}>
            🎚️ Track Sends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'master' ? (
          <View style={styles.section}>
            {/* Distortion */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>🔊 Distortion</Text>
              <Text style={styles.value}>{distortionAmount.toFixed(0)}</Text>
              <SimpleSlider
                minimumValue={0}
                maximumValue={100}
                value={distortionAmount}
                onValueChange={(value) => handleMasterEffect('distortion', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Reverb */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>✨ Reverb Mix</Text>
              <Text style={styles.value}>{(reverbMix * 100).toFixed(0)}%</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={reverbMix}
                onValueChange={(value) => handleMasterEffect('reverb', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Delay Time */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>⏱️ Delay Time</Text>
              <Text style={styles.value}>{(delayTime * 1000).toFixed(0)}ms</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={0.05}
                maximumValue={2.0}
                value={delayTime}
                onValueChange={(value) => handleMasterEffect('delayTime', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Delay Feedback */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>🔁 Delay Feedback</Text>
              <Text style={styles.value}>{(delayFeedback * 100).toFixed(0)}%</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={0.95}
                value={delayFeedback}
                onValueChange={(value) => handleMasterEffect('delayFeedback', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Delay Mix */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>🔀 Delay Mix</Text>
              <Text style={styles.value}>{(delayMix * 100).toFixed(0)}%</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={delayMix}
                onValueChange={(value) => handleMasterEffect('delayMix', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Master Filter */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>🎛️ Master Filter</Text>
              <Text style={styles.value}>{masterFilterCutoff.toFixed(0)} Hz</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={100}
                maximumValue={20000}
                value={masterFilterCutoff}
                onValueChange={(value) => handleMasterEffect('filter', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Compressor Threshold */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>📊 Comp Threshold</Text>
              <Text style={styles.value}>{compressionThreshold.toFixed(0)} dB</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={-60}
                maximumValue={0}
                value={compressionThreshold}
                onValueChange={(value) => handleMasterEffect('compThreshold', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Compressor Ratio */}
            <View style={styles.controlGroup}>
              <Text style={styles.label}>⚡ Comp Ratio</Text>
              <Text style={styles.value}>{compressionRatio.toFixed(1)}:1</Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={1}
                maximumValue={20}
                value={compressionRatio}
                onValueChange={(value) => handleMasterEffect('compRatio', value)}
                minimumTrackTintColor={COLORS.primary}
                thumbTintColor={COLORS.primary}
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            {/* Per-Track Controls */}
            {Object.keys(trackSends).map(track => (
              <View key={track} style={styles.trackGroup}>
                <Text style={styles.trackTitle}>
                  {track === 'kick' && '🥁 Kick'}
                  {track === 'snare' && '🥁 Snare'}
                  {track === 'hihat' && '🎩 Hi-hat'}
                  {track === 'clap' && '👏 Clap'}
                  {track === 'bass' && '🎸 Bass'}
                </Text>

                {/* Volume */}
                <View style={styles.controlGroupSmall}>
                  <Text style={styles.labelSmall}>Volume: {(trackSends[track].volume * 100).toFixed(0)}%</Text>
                  <SimpleSlider
                    style={styles.sliderSmall}
                    minimumValue={0}
                    maximumValue={1.5}
                    value={trackSends[track].volume}
                    onValueChange={(value) => handleTrackParam(track, 'volume', value)}
                    minimumTrackTintColor={COLORS.accentOrange}
                    thumbTintColor={COLORS.accentOrange}
                  />
                </View>

                {/* Reverb Send */}
                <View style={styles.controlGroupSmall}>
                  <Text style={styles.labelSmall}>Reverb: {(trackSends[track].reverbSend * 100).toFixed(0)}%</Text>
                  <SimpleSlider
                    style={styles.sliderSmall}
                    minimumValue={0}
                    maximumValue={1}
                    value={trackSends[track].reverbSend}
                    onValueChange={(value) => handleTrackSend(track, 'reverbSend', value)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                  />
                </View>

                {/* Delay Send */}
                <View style={styles.controlGroupSmall}>
                  <Text style={styles.labelSmall}>Delay: {(trackSends[track].delaySend * 100).toFixed(0)}%</Text>
                  <SimpleSlider
                    style={styles.sliderSmall}
                    minimumValue={0}
                    maximumValue={1}
                    value={trackSends[track].delaySend}
                    onValueChange={(value) => handleTrackSend(track, 'delaySend', value)}
                    minimumTrackTintColor={COLORS.primary}
                    thumbTintColor={COLORS.primary}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textTertiary,
    fontSize: TYPO.body,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACING.md,
  },
  controlGroup: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.soft,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: TYPO.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  value: {
    color: COLORS.primary,
    fontSize: TYPO.small,
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  trackGroup: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.soft,
  },
  trackTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPO.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  controlGroupSmall: {
    marginBottom: SPACING.sm,
  },
  labelSmall: {
    color: COLORS.textTertiary,
    fontSize: TYPO.small,
    marginBottom: SPACING.xs,
  },
  sliderSmall: {
    width: '100%',
    height: 30,
  },
});

export default EffectsController;
