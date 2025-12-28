/**
 * HAOS.fm Platform Screen
 * Complete HAOS Platform Overview
 */

import React from 'react';
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
  cyan: '#00D9FF',
  green: '#39FF14',
  purple: '#8B5CF6',
  orange: '#FF6B35',
};

const PLATFORM_FEATURES = [
  {
    id: 'studios',
    name: 'Production Studios',
    icon: '🎹',
    color: COLORS.orange,
    stats: '7 Studios',
    description: 'Professional production environments',
    items: ['DAW Studio', 'Bass Studio', 'Arp Studio', 'Wavetable', 'Orchestral', 'Modulation Lab', 'Preset Lab'],
  },
  {
    id: 'synths',
    name: 'Synthesizers',
    icon: '🎛️',
    color: COLORS.cyan,
    stats: '10 Synths',
    description: 'Hardware emulation synthesizers',
    items: ['ARP 2600', 'Juno-106', 'Minimoog', 'TB-303', 'DX7', 'MS-20', 'Prophet-5'],
  },
  {
    id: 'drums',
    name: 'Drum Machines',
    icon: '🥁',
    color: COLORS.purple,
    stats: '5 Machines',
    description: 'Classic drum machine emulations',
    items: ['TR-808', 'TR-909', 'LinnDrum', 'CR-78', 'DMX'],
  },
  {
    id: 'effects',
    name: 'Effects & Modulation',
    icon: '⚡',
    color: COLORS.green,
    stats: '4+ Effects',
    description: 'Professional audio effects',
    items: ['Reverb', 'Delay', 'Chorus', 'Distortion', 'LFO', 'Envelopes'],
  },
];

const PLATFORM_STATS = [
  { label: 'Total Instruments', value: '22+', icon: '🎸' },
  { label: 'Presets', value: '100+', icon: '💾' },
  { label: 'Effects', value: '12+', icon: '🎚️' },
  { label: 'Workspaces', value: '6', icon: '🎬' },
];

export default function PlatformScreen({ navigation }) {
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
          <Text style={styles.headerIcon}>🌐</Text>
          <Text style={styles.headerTitle}>HAOS PLATFORM</Text>
          <Text style={styles.headerSubtitle}>Complete Music Production Suite</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stats */}
        <View style={styles.statsGrid}>
          {PLATFORM_STATS.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Platform Features */}
        {PLATFORM_FEATURES.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <LinearGradient
              colors={[`${feature.color}20`, `${feature.color}10`, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureHeader}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureHeaderText}>
                  <Text style={[styles.featureName, { color: feature.color }]}>
                    {feature.name}
                  </Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={[styles.featureStats, { backgroundColor: `${feature.color}20` }]}>
                  <Text style={[styles.featureStatsText, { color: feature.color }]}>
                    {feature.stats}
                  </Text>
                </View>
              </View>
              <View style={styles.featureItems}>
                {feature.items.map((item, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={[styles.featureDot, { backgroundColor: feature.color }]} />
                    <Text style={styles.featureItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Platform Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🚀 ABOUT HAOS.fm</Text>
          <Text style={styles.infoText}>
            HAOS.fm is a complete music production platform featuring professional-grade virtual instruments, 
            effects processors, and collaborative workspaces.
          </Text>
          <Text style={styles.infoText}>
            Built with React Native and Web Audio API, HAOS delivers authentic hardware emulations 
            with real-time processing and MIDI/WAV export capabilities.
          </Text>
          <View style={styles.infoFeatures}>
            <View style={styles.infoFeature}>
              <Text style={styles.infoFeatureIcon}>✅</Text>
              <Text style={styles.infoFeatureText}>Hardware-accurate synthesis</Text>
            </View>
            <View style={styles.infoFeature}>
              <Text style={styles.infoFeatureIcon}>✅</Text>
              <Text style={styles.infoFeatureText}>Real-time audio processing</Text>
            </View>
            <View style={styles.infoFeature}>
              <Text style={styles.infoFeatureIcon}>✅</Text>
              <Text style={styles.infoFeatureText}>MIDI & WAV export</Text>
            </View>
            <View style={styles.infoFeature}>
              <Text style={styles.infoFeatureIcon}>✅</Text>
              <Text style={styles.infoFeatureText}>Cloud preset library</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>⚡ QUICK ACCESS</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('WorkspaceScreen')}
          >
            <Text style={styles.actionIcon}>🎬</Text>
            <Text style={styles.actionText}>Browse Workspaces</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SynthsScreen')}
          >
            <Text style={styles.actionIcon}>🎛️</Text>
            <Text style={styles.actionText}>Explore Synthesizers</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('DrumsSelector')}
          >
            <Text style={styles.actionIcon}>🥁</Text>
            <Text style={styles.actionText}>Drum Machines</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
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
    color: COLORS.cyan,
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
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.cyan,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureGradient: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  featureHeaderText: {
    flex: 1,
  },
  featureName: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'System',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  featureStats: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featureStatsText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featureItems: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  featureItemText: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  infoTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.cyan,
    marginBottom: 12,
    letterSpacing: 1,
  },
  infoText: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoFeatures: {
    marginTop: 8,
  },
  infoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoFeatureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoFeatureText: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.cyan,
  },
});
