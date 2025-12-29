/**
 * HAOS.fm Modulation Screen
 * Effects & Modulation Routing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bgDark: '#0A0A0A',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.7)',
  purple: '#8B5CF6',
  pink: '#FF1493',
  blue: '#00D9FF',
  green: '#39FF14',
};

const MODULATION_SOURCES = [
  { id: 'lfo1', name: 'LFO 1', icon: '〰️', color: COLORS.purple, rate: 'Sine • 2.5 Hz' },
  { id: 'lfo2', name: 'LFO 2', icon: '⚡', color: COLORS.pink, rate: 'Triangle • 4.0 Hz' },
  { id: 'env1', name: 'Envelope 1', icon: '📊', color: COLORS.blue, rate: 'ADSR • Attack 10ms' },
  { id: 'env2', name: 'Envelope 2', icon: '📈', color: COLORS.green, rate: 'ADSR • Attack 50ms' },
];

const MODULATION_TARGETS = [
  { id: 'cutoff', name: 'Filter Cutoff', icon: '🎚️', current: '1000 Hz' },
  { id: 'resonance', name: 'Resonance', icon: '🔊', current: '5.0' },
  { id: 'pitch', name: 'OSC Pitch', icon: '🎵', current: '±12 ST' },
  { id: 'volume', name: 'Amplitude', icon: '📢', current: '0.8' },
  { id: 'panning', name: 'Panning', icon: '↔️', current: 'Center' },
  { id: 'detune', name: 'Detune', icon: '🌊', current: '5 cents' },
];

const EFFECTS = [
  { id: 'reverb', name: 'Reverb', icon: '🌌', enabled: true, params: 'Room • Mix 30%' },
  { id: 'delay', name: 'Delay', icon: '⏱️', enabled: false, params: '1/4 • Feedback 40%' },
  { id: 'chorus', name: 'Chorus', icon: '🌊', enabled: true, params: 'Depth 50% • Rate 2Hz' },
  { id: 'distortion', name: 'Distortion', icon: '🔥', enabled: false, params: 'Drive 30%' },
];

export default function ModulationScreen({ navigation }) {
  const [activeSource, setActiveSource] = useState('lfo1');
  const [enabledEffects, setEnabledEffects] = useState(['reverb', 'chorus']);

  const toggleEffect = (effectId) => {
    setEnabledEffects(prev => 
      prev.includes(effectId) 
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>⚡</Text>
          <Text style={styles.headerTitle}>MODULATION</Text>
          <Text style={styles.headerSubtitle}>Effects & Routing</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modulation Sources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>〰️</Text>
            <Text style={styles.sectionTitle}>MODULATION SOURCES</Text>
          </View>
          {MODULATION_SOURCES.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[
                styles.sourceCard,
                activeSource === source.id && styles.sourceCardActive,
              ]}
              onPress={() => setActiveSource(source.id)}
            >
              <LinearGradient
                colors={[
                  activeSource === source.id ? `${source.color}30` : `${source.color}15`,
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sourceGradient}
              >
                <Text style={styles.sourceIcon}>{source.icon}</Text>
                <View style={styles.sourceInfo}>
                  <Text style={[styles.sourceName, { color: source.color }]}>
                    {source.name}
                  </Text>
                  <Text style={styles.sourceRate}>{source.rate}</Text>
                </View>
                {activeSource === source.id && (
                  <View style={[styles.activeIndicator, { backgroundColor: source.color }]} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modulation Targets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>MODULATION TARGETS</Text>
          </View>
          <View style={styles.targetGrid}>
            {MODULATION_TARGETS.map((target) => (
              <TouchableOpacity
                key={target.id}
                style={styles.targetCard}
                activeOpacity={0.7}
              >
                <Text style={styles.targetIcon}>{target.icon}</Text>
                <Text style={styles.targetName}>{target.name}</Text>
                <Text style={styles.targetCurrent}>{target.current}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Effects Chain */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎚️</Text>
            <Text style={styles.sectionTitle}>EFFECTS CHAIN</Text>
          </View>
          {EFFECTS.map((effect) => {
            const isEnabled = enabledEffects.includes(effect.id);
            return (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.effectCard,
                  isEnabled && styles.effectCardEnabled,
                ]}
                onPress={() => toggleEffect(effect.id)}
              >
                <View style={styles.effectHeader}>
                  <View style={styles.effectLeft}>
                    <Text style={styles.effectIcon}>{effect.icon}</Text>
                    <View>
                      <Text style={[
                        styles.effectName,
                        isEnabled && styles.effectNameEnabled,
                      ]}>
                        {effect.name}
                      </Text>
                      <Text style={styles.effectParams}>{effect.params}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.effectToggle,
                    isEnabled && styles.effectToggleEnabled,
                  ]}>
                    <Text style={styles.effectToggleText}>
                      {isEnabled ? 'ON' : 'OFF'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Routing Matrix Info */}
        <View style={[styles.section, styles.infoSection]}>
          <Text style={styles.infoTitle}>💡 ROUTING MATRIX</Text>
          <Text style={styles.infoText}>
            Select a modulation source above, then tap any target parameter to create a modulation routing.
          </Text>
          <Text style={styles.infoText}>
            Current source: <Text style={styles.infoHighlight}>{
              MODULATION_SOURCES.find(s => s.id === activeSource)?.name
            }</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 15,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.purple,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  sourceCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceCardActive: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderWidth: 2,
  },
  sourceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sourceIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sourceRate: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  targetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  targetCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  targetIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  targetName: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  targetCurrent: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  effectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  effectCardEnabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  effectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  effectIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  effectName: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  effectNameEnabled: {
    color: COLORS.purple,
  },
  effectParams: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  effectToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  effectToggleEnabled: {
    backgroundColor: COLORS.purple,
  },
  effectToggleText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  infoSection: {
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  infoTitle: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 10,
    letterSpacing: 1,
  },
  infoText: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoHighlight: {
    color: COLORS.purple,
    fontWeight: '700',
  },
});
