/**
 * HAOS.fm DAW Studio Screen
 * HAOS Themed Design
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar,
} from 'react-native';
import HAOSHeader from '../components/HAOSHeader';
import { HAOS_COLORS } from '../styles/HAOSTheme';
import ArrangementView from '../components/ArrangementView';
import audioRoutingEngine from '../audio/AudioRoutingEngine';
import nativeAudioContext from '../audio/NativeAudioContext';
import * as Haptics from 'expo-haptics';

// Local colors to avoid initialization timing issues
const COLORS = {
  cyan: '#00D9FF',
  orange: '#FF6B35',
};

const { width, height } = Dimensions.get('window');

const VIEWS = [
  { id: 'arrangement', name: 'ARRANGEMENT', icon: '🎬' },
  { id: 'mixer', name: 'MIXER', icon: '🎛️' },
  { id: 'instruments', name: 'INSTRUMENTS', icon: '🎹' },
  { id: 'effects', name: 'EFFECTS', icon: '✨' }
];

export default function DAWStudio({ navigation }) {
  const [currentView, setCurrentView] = useState('arrangement');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeDAW();
  }, []);

  const initializeDAW = async () => {
    console.log('🎹 Initializing DAW Studio...');
    try {
      await nativeAudioContext.initialize();
      await audioRoutingEngine.initialize();
      setIsInitialized(true);
      console.log('✅ DAW Studio initialized');
    } catch (error) {
      console.error('❌ DAW Studio initialization failed:', error);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? '⏸️ Paused' : '▶️ Playing');
  };

  const renderArrangementView = () => {
    return (
      <ArrangementView
        bpm={bpm}
        isPlaying={isPlaying}
        onPlaybackToggle={togglePlayback}
      />
    );
  };

  const renderMixerView = () => {
    const mixerState = audioRoutingEngine.getMixerState();

    return (
      <ScrollView style={styles.mixerView}>
        <Text style={styles.sectionTitle}>🎛️ MIXER</Text>

        {/* Channels */}
        <View style={styles.mixerSection}>
          <Text style={styles.mixerSectionTitle}>CHANNELS</Text>
          {mixerState.channels.map(channel => (
            <View key={channel.id} style={[styles.channelStrip, { borderLeftColor: channel.color }]}>
              <View style={styles.channelHeader}>
                <Text style={[styles.channelName, { color: channel.color }]}>
                  {channel.name}
                </Text>
                <View style={styles.channelButtons}>
                  <TouchableOpacity
                    style={[styles.channelBtn, channel.mute && styles.channelBtnActive]}
                    onPress={() => audioRoutingEngine.setChannelMute(channel.id, !channel.mute)}
                  >
                    <Text style={styles.channelBtnText}>M</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.channelBtn, channel.solo && styles.channelBtnActive]}
                    onPress={() => audioRoutingEngine.setChannelSolo(channel.id, !channel.solo)}
                  >
                    <Text style={styles.channelBtnText}>S</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Fader */}
              <View style={styles.faderContainer}>
                <Text style={styles.faderLabel}>GAIN</Text>
                <View style={styles.faderTrack}>
                  <View style={[styles.faderFill, { height: `${channel.gain * 100}%` }]} />
                </View>
                <Text style={styles.faderValue}>{(channel.gain * 100).toFixed(0)}%</Text>
              </View>

              {/* Sends */}
              <View style={styles.sendsContainer}>
                <Text style={styles.sendsLabel}>SENDS</Text>
                {Object.entries(channel.sends).map(([sendId, amount]) => (
                  <View key={sendId} style={styles.sendRow}>
                    <Text style={styles.sendName}>{sendId.toUpperCase()}</Text>
                    <Text style={styles.sendValue}>{(amount * 100).toFixed(0)}%</Text>
                  </View>
                ))}
              </View>

              {/* Routing */}
              <View style={styles.routingContainer}>
                <Text style={styles.routingLabel}>→ {channel.busId.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buses */}
        <View style={styles.mixerSection}>
          <Text style={styles.mixerSectionTitle}>BUSES</Text>
          {mixerState.buses.map(bus => (
            <View key={bus.id} style={[styles.channelStrip, { borderLeftColor: bus.color }]}>
              <Text style={[styles.channelName, { color: bus.color }]}>{bus.name}</Text>
              <Text style={styles.busInfo}>{bus.channels.length} channels</Text>
            </View>
          ))}
        </View>

        {/* Send Effects */}
        <View style={styles.mixerSection}>
          <Text style={styles.mixerSectionTitle}>SEND EFFECTS</Text>
          {mixerState.sends.map(send => (
            <View key={send.id} style={[styles.channelStrip, { borderLeftColor: send.color }]}>
              <Text style={[styles.channelName, { color: send.color }]}>{send.name}</Text>
              <Text style={styles.busInfo}>Wet/Dry: {(send.wetDry * 100).toFixed(0)}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderInstrumentsView = () => {
    const instruments = [
      { id: 'arp2600', name: 'ARP 2600', screen: 'ARP2600Screen', color: '#00D9FF' },
      { id: 'juno106', name: 'JUNO-106', screen: 'Juno106Screen', color: '#0088FF' },
      { id: 'minimoog', name: 'MINIMOOG', screen: 'MinimoogScreen', color: '#0044FF' },
      { id: 'tb303', name: 'TB-303', screen: 'TB303Screen', color: '#00FFFF' },
      { id: 'piano', name: 'PIANO', screen: 'PianoScreen', color: '#39FF14' },
      { id: 'strings', name: 'STRINGS', screen: 'StringsScreen', color: '#8B5CF6' },
      { id: 'violin', name: 'VIOLIN', screen: 'ViolinScreen', color: '#A855F7' },
    ];

    return (
      <ScrollView style={styles.instrumentsView} contentContainerStyle={styles.instrumentsGrid}>
        <Text style={styles.sectionTitle}>🎹 INSTRUMENTS</Text>
        
        {instruments.map(inst => (
          <TouchableOpacity
            key={inst.id}
            style={[styles.instrumentCard, { borderColor: inst.color }]}
            onPress={() => {
              if (inst.screen) {
                navigation.navigate(inst.screen);
              }
            }}
          >
            <View style={[styles.instrumentIcon, { backgroundColor: inst.color + '20' }]}>
              <Text style={styles.instrumentIconText}>🎵</Text>
            </View>
            <Text style={[styles.instrumentName, { color: inst.color }]}>
              {inst.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderEffectsView = () => {
    const effects = [
      { id: 'reverb', name: 'REVERB', icon: '🌊', color: '#00FFFF' },
      { id: 'delay', name: 'DELAY', icon: '⏱️', color: '#FF00FF' },
      { id: 'chorus', name: 'CHORUS', icon: '🎭', color: '#FFFF00' },
      { id: 'distortion', name: 'DISTORTION', icon: '🔥', color: '#FF0000' },
      { id: 'compressor', name: 'COMPRESSOR', icon: '🗜️', color: '#00FF00' },
      { id: 'eq', name: 'EQ', icon: '📊', color: '#0088FF' },
    ];

    return (
      <ScrollView style={styles.effectsView} contentContainerStyle={styles.effectsGrid}>
        <Text style={styles.sectionTitle}>✨ EFFECTS</Text>
        
        {effects.map(effect => (
          <TouchableOpacity
            key={effect.id}
            style={[styles.effectCard, { borderColor: effect.color }]}
          >
            <Text style={styles.effectIcon}>{effect.icon}</Text>
            <Text style={[styles.effectName, { color: effect.color }]}>
              {effect.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HAOSHeader
        title="DAW STUDIO"
        navigation={navigation}
        showBack={true}
        rightButtons={[
          {
            icon: '🎹',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            },
          },
        ]}
      />

      {/* View Tabs */}
      <View style={styles.tabs}>
        {VIEWS.map(view => (
          <TouchableOpacity
            key={view.id}
            style={[styles.tab, currentView === view.id && styles.tabActive]}
            onPress={() => setCurrentView(view.id)}
          >
            <Text style={styles.tabIcon}>{view.icon}</Text>
            <Text style={[styles.tabText, currentView === view.id && styles.tabTextActive]}>
              {view.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!isInitialized ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>🎹 Initializing DAW Studio...</Text>
          </View>
        ) : (
          <>
            {currentView === 'arrangement' && renderArrangementView()}
            {currentView === 'mixer' && renderMixerView()}
            {currentView === 'instruments' && renderInstrumentsView()}
            {currentView === 'effects' && renderEffectsView()}
          </>
        )}
      </View>
    </View>
  );
}

console.log('🎬 DAWStudio about to create styles, HAOS_COLORS:', !!HAOS_COLORS);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HAOS_COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: HAOS_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: HAOS_COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: HAOS_COLORS.gold,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  tabText: {
    ...TYPO.label,
    fontSize: 11,
    color: HAOS_COLORS.textSecondary,
  },
  tabTextActive: {
    color: HAOS_COLORS.gold,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPO.body,
    fontSize: 16,
    color: HAOS_COLORS.gold,
  },
  sectionTitle: {
    ...TYPO.heading,
    fontSize: 24,
    color: HAOS_COLORS.gold,
    padding: SPACING.lg,
    textAlign: 'center',
  },
  // Mixer styles
  mixerView: {
    flex: 1,
  },
  mixerSection: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  mixerSectionTitle: {
    ...TYPO.label,
    fontSize: 14,
    color: COLORS.cyan,
    marginBottom: SPACING.md,
  },
  channelStrip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  channelName: {
    ...TYPO.label,
    fontSize: 14,
    fontWeight: 'bold',
  },
  channelButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  channelBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  channelBtnActive: {
    backgroundColor: COLORS.orange,
  },
  channelBtnText: {
    ...TYPO.mono,
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  faderContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  faderLabel: {
    ...TYPO.mono,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.xs,
  },
  faderTrack: {
    width: 40,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  faderFill: {
    width: '100%',
    backgroundColor: COLORS.orange,
  },
  faderValue: {
    ...TYPO.mono,
    fontSize: 10,
    color: COLORS.cyan,
    marginTop: SPACING.xs,
  },
  sendsContainer: {
    marginTop: SPACING.sm,
  },
  sendsLabel: {
    ...TYPO.mono,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.xs,
  },
  sendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sendName: {
    ...TYPO.mono,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  sendValue: {
    ...TYPO.mono,
    fontSize: 10,
    color: COLORS.cyan,
  },
  routingContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  routingLabel: {
    ...TYPO.mono,
    fontSize: 10,
    color: COLORS.orange,
    textAlign: 'center',
  },
  busInfo: {
    ...TYPO.mono,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: SPACING.xs,
  },
  // Instruments styles
  instrumentsView: {
    flex: 1,
  },
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
  },
  instrumentCard: {
    width: (width - SPACING.md * 3) / 2,
    aspectRatio: 1,
    margin: SPACING.xs,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instrumentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instrumentIconText: {
    fontSize: 30,
  },
  instrumentName: {
    ...TYPO.label,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Effects styles
  effectsView: {
    flex: 1,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
  },
  effectCard: {
    width: (width - SPACING.md * 4) / 3,
    aspectRatio: 1,
    margin: SPACING.xs,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectIcon: {
    fontSize: 36,
    marginBottom: SPACING.xs,
  },
  effectName: {
    ...TYPO.mono,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
