/**
 * HAOS.fm Enhanced Effects Controller
 * 3-tab interface: Master FX / Advanced FX / Track Controls
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Picker } from 'react-native';
import bridge from '../audio/WebAudioBridge';
import { COLORS, TYPO, SPACING, SHADOW } from '../styles/HAOSDesignSystem';

// Simple slider component
const SimpleSlider = ({ value, minimumValue, maximumValue, onValueChange, minimumTrackTintColor, thumbTintColor }) => {
  const handlePress = (event) => {
    const { locationX } = event.nativeEvent;
    const width = 280;
    const percentage = Math.max(0, Math.min(1, locationX / width));
    const newValue = minimumValue + percentage * (maximumValue - minimumValue);
    onValueChange(newValue);
  };

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <TouchableOpacity style={sliderStyles.container} onPress={handlePress} activeOpacity={0.8}>
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

const EffectsControllerEnhanced = () => {
  const [activeTab, setActiveTab] = useState('master'); // 'master', 'advanced', 'tracks'

  // Master effects state
  const [distortionAmount, setDistortionAmount] = useState(0);
  const [reverbMix, setReverbMix] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0.375);
  const [delayFeedback, setDelayFeedback] = useState(0.3);
  const [delayMix, setDelayMix] = useState(0.2);
  const [masterFilterCutoff, setMasterFilterCutoff] = useState(8000);
  const [masterFilterRes, setMasterFilterRes] = useState(1);
  const [compressionThreshold, setCompressionThreshold] = useState(-24);
  const [compressionRatio, setCompressionRatio] = useState(4);

  // Advanced effects state
  const [phaserRate, setPhaserRate] = useState(0.5);
  const [phaserDepth, setPhaserDepth] = useState(0.5);
  const [phaserMix, setPhaserMix] = useState(0);
  const [flangerRate, setFlangerRate] = useState(0.2);
  const [flangerDepth, setFlangerDepth] = useState(0.003);
  const [flangerFeedback, setFlangerFeedback] = useState(0.5);
  const [flangerMix, setFlangerMix] = useState(0);
  const [chorusRate, setChorusRate] = useState(1.5);
  const [chorusDepth, setChorusDepth] = useState(0.002);
  const [chorusMix, setChorusMix] = useState(0);
  const [bitcrushBits, setBitcrushBits] = useState(16);
  const [bitcrushMix, setBitcrushMix] = useState(0);
  const [ringModFreq, setRingModFreq] = useState(30);
  const [ringModMix, setRingModMix] = useState(0);

  // Per-track controls
  const [trackControls, setTrackControls] = useState({
    kick: { volume: 1.0, pan: 0, filterCutoff: 8000, filterRes: 1, filterType: 'lowpass', attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.1, lfoRate: 0, lfoDepth: 0, reverbSend: 0, delaySend: 0 },
    snare: { volume: 1.0, pan: 0, filterCutoff: 8000, filterRes: 1, filterType: 'lowpass', attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.1, lfoRate: 0, lfoDepth: 0, reverbSend: 0.2, delaySend: 0 },
    hihat: { volume: 0.7, pan: 0.3, filterCutoff: 8000, filterRes: 1, filterType: 'highpass', attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, lfoRate: 0, lfoDepth: 0, reverbSend: 0.1, delaySend: 0 },
    clap: { volume: 0.8, pan: -0.2, filterCutoff: 8000, filterRes: 1, filterType: 'bandpass', attack: 0.01, decay: 0.15, sustain: 0, release: 0.1, lfoRate: 0, lfoDepth: 0, reverbSend: 0.3, delaySend: 0 },
    bass: { volume: 0.9, pan: 0, filterCutoff: 8000, filterRes: 1, filterType: 'lowpass', attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.2, lfoRate: 0, lfoDepth: 0, reverbSend: 0.05, delaySend: 0.1 },
  });

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
      case 'filterCutoff':
        setMasterFilterCutoff(value);
        params.masterFilterCutoff = value;
        break;
      case 'filterRes':
        setMasterFilterRes(value);
        params.masterFilterRes = value;
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

  const handleAdvancedEffect = (param, value) => {
    const params = {};
    
    switch (param) {
      case 'phaserRate':
        setPhaserRate(value);
        params.phaserRate = value;
        break;
      case 'phaserDepth':
        setPhaserDepth(value);
        params.phaserDepth = value;
        break;
      case 'phaserMix':
        setPhaserMix(value);
        params.phaserMix = value;
        break;
      case 'flangerRate':
        setFlangerRate(value);
        params.flangerRate = value;
        break;
      case 'flangerDepth':
        setFlangerDepth(value);
        params.flangerDepth = value;
        break;
      case 'flangerFeedback':
        setFlangerFeedback(value);
        params.flangerFeedback = value;
        break;
      case 'flangerMix':
        setFlangerMix(value);
        params.flangerMix = value;
        break;
      case 'chorusRate':
        setChorusRate(value);
        params.chorusRate = value;
        break;
      case 'chorusDepth':
        setChorusDepth(value);
        params.chorusDepth = value;
        break;
      case 'chorusMix':
        setChorusMix(value);
        params.chorusMix = value;
        break;
      case 'bitcrushBits':
        setBitcrushBits(value);
        params.bitcrushBits = value;
        break;
      case 'bitcrushMix':
        setBitcrushMix(value);
        params.bitcrushMix = value;
        break;
      case 'ringModFreq':
        setRingModFreq(value);
        params.ringModFreq = value;
        break;
      case 'ringModMix':
        setRingModMix(value);
        params.ringModMix = value;
        break;
    }

    bridge.updateEffectsParams(params);
  };

  const handleTrackParam = (track, param, value) => {
    setTrackControls(prev => ({
      ...prev,
      [track]: {
        ...prev[track],
        [param]: value,
      },
    }));

    bridge.setTrackParam(track, param, value);
  };

  const renderMasterFX = () => (
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
          minimumValue={0}
          maximumValue={1}
          value={delayMix}
          onValueChange={(value) => handleMasterEffect('delayMix', value)}
          minimumTrackTintColor={COLORS.primary}
          thumbTintColor={COLORS.primary}
        />
      </View>

      {/* Filter Cutoff */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>🎚️ Filter Cutoff</Text>
        <Text style={styles.value}>{masterFilterCutoff.toFixed(0)} Hz</Text>
        <SimpleSlider
          minimumValue={100}
          maximumValue={20000}
          value={masterFilterCutoff}
          onValueChange={(value) => handleMasterEffect('filterCutoff', value)}
          minimumTrackTintColor={COLORS.primary}
          thumbTintColor={COLORS.primary}
        />
      </View>

      {/* Filter Resonance */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>🌀 Filter Resonance</Text>
        <Text style={styles.value}>{masterFilterRes.toFixed(1)}</Text>
        <SimpleSlider
          minimumValue={0.1}
          maximumValue={20}
          value={masterFilterRes}
          onValueChange={(value) => handleMasterEffect('filterRes', value)}
          minimumTrackTintColor={COLORS.primary}
          thumbTintColor={COLORS.primary}
        />
      </View>

      {/* Compression Threshold */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>📉 Comp Threshold</Text>
        <Text style={styles.value}>{compressionThreshold.toFixed(0)} dB</Text>
        <SimpleSlider
          minimumValue={-60}
          maximumValue={0}
          value={compressionThreshold}
          onValueChange={(value) => handleMasterEffect('compThreshold', value)}
          minimumTrackTintColor={COLORS.primary}
          thumbTintColor={COLORS.primary}
        />
      </View>

      {/* Compression Ratio */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>⚖️ Comp Ratio</Text>
        <Text style={styles.value}>{compressionRatio.toFixed(1)}:1</Text>
        <SimpleSlider
          minimumValue={1}
          maximumValue={20}
          value={compressionRatio}
          onValueChange={(value) => handleMasterEffect('compRatio', value)}
          minimumTrackTintColor={COLORS.primary}
          thumbTintColor={COLORS.primary}
        />
      </View>
    </View>
  );

  const renderAdvancedFX = () => (
    <View style={styles.section}>
      {/* Phaser */}
      <Text style={styles.sectionTitle}>🌊 Phaser</Text>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Rate</Text>
        <Text style={styles.value}>{phaserRate.toFixed(2)} Hz</Text>
        <SimpleSlider
          minimumValue={0.1}
          maximumValue={10}
          value={phaserRate}
          onValueChange={(value) => handleAdvancedEffect('phaserRate', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Depth</Text>
        <Text style={styles.value}>{(phaserDepth * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={phaserDepth}
          onValueChange={(value) => handleAdvancedEffect('phaserDepth', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Mix</Text>
        <Text style={styles.value}>{(phaserMix * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={phaserMix}
          onValueChange={(value) => handleAdvancedEffect('phaserMix', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>

      {/* Flanger */}
      <Text style={styles.sectionTitle}>✈️ Flanger</Text>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Rate</Text>
        <Text style={styles.value}>{flangerRate.toFixed(2)} Hz</Text>
        <SimpleSlider
          minimumValue={0.1}
          maximumValue={5}
          value={flangerRate}
          onValueChange={(value) => handleAdvancedEffect('flangerRate', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Depth</Text>
        <Text style={styles.value}>{(flangerDepth * 1000).toFixed(1)}ms</Text>
        <SimpleSlider
          minimumValue={0.001}
          maximumValue={0.010}
          value={flangerDepth}
          onValueChange={(value) => handleAdvancedEffect('flangerDepth', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Feedback</Text>
        <Text style={styles.value}>{(flangerFeedback * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={0.95}
          value={flangerFeedback}
          onValueChange={(value) => handleAdvancedEffect('flangerFeedback', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Mix</Text>
        <Text style={styles.value}>{(flangerMix * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={flangerMix}
          onValueChange={(value) => handleAdvancedEffect('flangerMix', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>

      {/* Chorus */}
      <Text style={styles.sectionTitle}>🎭 Chorus</Text>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Rate</Text>
        <Text style={styles.value}>{chorusRate.toFixed(2)} Hz</Text>
        <SimpleSlider
          minimumValue={0.1}
          maximumValue={5}
          value={chorusRate}
          onValueChange={(value) => handleAdvancedEffect('chorusRate', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Depth</Text>
        <Text style={styles.value}>{(chorusDepth * 1000).toFixed(1)}ms</Text>
        <SimpleSlider
          minimumValue={0.001}
          maximumValue={0.005}
          value={chorusDepth}
          onValueChange={(value) => handleAdvancedEffect('chorusDepth', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Mix</Text>
        <Text style={styles.value}>{(chorusMix * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={chorusMix}
          onValueChange={(value) => handleAdvancedEffect('chorusMix', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>

      {/* Bitcrusher */}
      <Text style={styles.sectionTitle}>🔲 Bitcrusher</Text>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Bit Depth</Text>
        <Text style={styles.value}>{Math.round(bitcrushBits)} bits</Text>
        <SimpleSlider
          minimumValue={1}
          maximumValue={16}
          value={bitcrushBits}
          onValueChange={(value) => handleAdvancedEffect('bitcrushBits', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Mix</Text>
        <Text style={styles.value}>{(bitcrushMix * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={bitcrushMix}
          onValueChange={(value) => handleAdvancedEffect('bitcrushMix', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>

      {/* Ring Modulator */}
      <Text style={styles.sectionTitle}>💍 Ring Modulator</Text>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Carrier Frequency</Text>
        <Text style={styles.value}>{ringModFreq.toFixed(0)} Hz</Text>
        <SimpleSlider
          minimumValue={1}
          maximumValue={200}
          value={ringModFreq}
          onValueChange={(value) => handleAdvancedEffect('ringModFreq', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Mix</Text>
        <Text style={styles.value}>{(ringModMix * 100).toFixed(0)}%</Text>
        <SimpleSlider
          minimumValue={0}
          maximumValue={1}
          value={ringModMix}
          onValueChange={(value) => handleAdvancedEffect('ringModMix', value)}
          minimumTrackTintColor={COLORS.secondary}
          thumbTintColor={COLORS.secondary}
        />
      </View>
    </View>
  );

  const renderTrackControls = () => {
    const tracks = ['kick', 'snare', 'hihat', 'clap', 'bass'];
    const trackIcons = { kick: '🥁', snare: '🎤', hihat: '🔔', clap: '👏', bass: '🎸' };

    return (
      <ScrollView style={styles.section}>
        {tracks.map(track => {
          const ctrl = trackControls[track];
          return (
            <View key={track} style={styles.trackSection}>
              <Text style={styles.trackTitle}>{trackIcons[track]} {track.toUpperCase()}</Text>
              
              {/* Volume */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Volume</Text>
                <Text style={styles.value}>{(ctrl.volume * 100).toFixed(0)}%</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={1.5}
                  value={ctrl.volume}
                  onValueChange={(value) => handleTrackParam(track, 'volume', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>

              {/* Pan */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Pan</Text>
                <Text style={styles.value}>
                  {ctrl.pan === 0 ? 'Center' : ctrl.pan > 0 ? `R${(ctrl.pan * 100).toFixed(0)}` : `L${(-ctrl.pan * 100).toFixed(0)}`}
                </Text>
                <SimpleSlider
                  minimumValue={-1}
                  maximumValue={1}
                  value={ctrl.pan}
                  onValueChange={(value) => handleTrackParam(track, 'pan', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>

              {/* Filter Cutoff */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Filter Cutoff</Text>
                <Text style={styles.value}>{ctrl.filterCutoff.toFixed(0)} Hz</Text>
                <SimpleSlider
                  minimumValue={100}
                  maximumValue={20000}
                  value={ctrl.filterCutoff}
                  onValueChange={(value) => handleTrackParam(track, 'filterCutoff', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>

              {/* Filter Resonance */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Filter Resonance</Text>
                <Text style={styles.value}>{ctrl.filterRes.toFixed(1)}</Text>
                <SimpleSlider
                  minimumValue={0.1}
                  maximumValue={20}
                  value={ctrl.filterRes}
                  onValueChange={(value) => handleTrackParam(track, 'filterRes', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>

              {/* ADSR */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Attack</Text>
                <Text style={styles.value}>{(ctrl.attack * 1000).toFixed(0)}ms</Text>
                <SimpleSlider
                  minimumValue={0.001}
                  maximumValue={1}
                  value={ctrl.attack}
                  onValueChange={(value) => handleTrackParam(track, 'attack', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Decay</Text>
                <Text style={styles.value}>{(ctrl.decay * 1000).toFixed(0)}ms</Text>
                <SimpleSlider
                  minimumValue={0.01}
                  maximumValue={2}
                  value={ctrl.decay}
                  onValueChange={(value) => handleTrackParam(track, 'decay', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Sustain</Text>
                <Text style={styles.value}>{(ctrl.sustain * 100).toFixed(0)}%</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={1}
                  value={ctrl.sustain}
                  onValueChange={(value) => handleTrackParam(track, 'sustain', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Release</Text>
                <Text style={styles.value}>{(ctrl.release * 1000).toFixed(0)}ms</Text>
                <SimpleSlider
                  minimumValue={0.01}
                  maximumValue={2}
                  value={ctrl.release}
                  onValueChange={(value) => handleTrackParam(track, 'release', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>

              {/* LFO */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>LFO Rate</Text>
                <Text style={styles.value}>{ctrl.lfoRate.toFixed(2)} Hz</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={20}
                  value={ctrl.lfoRate}
                  onValueChange={(value) => handleTrackParam(track, 'lfoRate', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>
              <View style={styles.controlGroup}>
                <Text style={styles.label}>LFO Depth</Text>
                <Text style={styles.value}>{(ctrl.lfoDepth * 100).toFixed(0)}%</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={1}
                  value={ctrl.lfoDepth}
                  onValueChange={(value) => handleTrackParam(track, 'lfoDepth', value)}
                  minimumTrackTintColor={COLORS.secondary}
                  thumbTintColor={COLORS.secondary}
                />
              </View>

              {/* Sends */}
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Reverb Send</Text>
                <Text style={styles.value}>{(ctrl.reverbSend * 100).toFixed(0)}%</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={1}
                  value={ctrl.reverbSend}
                  onValueChange={(value) => handleTrackParam(track, 'reverbSend', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>
              <View style={styles.controlGroup}>
                <Text style={styles.label}>Delay Send</Text>
                <Text style={styles.value}>{(ctrl.delaySend * 100).toFixed(0)}%</Text>
                <SimpleSlider
                  minimumValue={0}
                  maximumValue={1}
                  value={ctrl.delaySend}
                  onValueChange={(value) => handleTrackParam(track, 'delaySend', value)}
                  minimumTrackTintColor={COLORS.primary}
                  thumbTintColor={COLORS.primary}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 3-Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'master' && styles.tabActive]}
          onPress={() => setActiveTab('master')}
        >
          <Text style={[styles.tabText, activeTab === 'master' && styles.tabTextActive]}>
            🎛️ Master
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'advanced' && styles.tabActive]}
          onPress={() => setActiveTab('advanced')}
        >
          <Text style={[styles.tabText, activeTab === 'advanced' && styles.tabTextActive]}>
            ⚡ Advanced
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracks' && styles.tabActive]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.tabTextActive]}>
            🎚️ Tracks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'master' && renderMasterFX()}
        {activeTab === 'advanced' && renderAdvancedFX()}
        {activeTab === 'tracks' && renderTrackControls()}
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TYPO.body,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPO.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  controlGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPO.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  value: {
    ...TYPO.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  trackSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOW.medium,
  },
  trackTitle: {
    ...TYPO.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
});

export default EffectsControllerEnhanced;
