/**
 * HAOS.fm CREATOR Screen
 * Mobile DAW - Inspired by Ableton, based on techno-workspace.html
 * Live recording, sequencing, real-time effects
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  bgDark: '#050508',
  bgCard: 'rgba(15, 15, 20, 0.8)',
  orange: '#FF6B35',
  orangeLight: '#FF8C5A',
  gray: '#808080',
  green: '#39FF14',
  cyan: '#00D9FF',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.6)',
  border: 'rgba(255, 107, 53, 0.2)',
};

const CreatorScreen = ({ navigation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentBar, setCurrentBar] = useState(1);
  const [isRecording, setIsRecording] = useState(false);

  // Transport controls
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentBar(1);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HAOS</Text>
          <Text style={styles.logoSub}>.fm</Text>
        </View>
        <Text style={styles.headerTitle}>CREATOR</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Transport Bar - Based on techno-workspace */}
        <View style={styles.transportPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>🎚️</Text>
            <Text style={styles.panelTitle}>TRANSPORT</Text>
          </View>

          <View style={styles.transportControls}>
            {/* Play/Pause */}
            <TouchableOpacity
              style={[
                styles.transportBtn,
                isPlaying && styles.transportBtnActive
              ]}
              onPress={handlePlay}
            >
              <Text style={styles.transportIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
              <Text style={styles.transportText}>
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </Text>
            </TouchableOpacity>

            {/* Stop */}
            <TouchableOpacity
              style={styles.transportBtn}
              onPress={handleStop}
            >
              <Text style={styles.transportIcon}>⏹</Text>
              <Text style={styles.transportText}>STOP</Text>
            </TouchableOpacity>

            {/* Record */}
            <TouchableOpacity
              style={[
                styles.transportBtn,
                styles.recordBtn,
                isRecording && styles.recordBtnActive
              ]}
              onPress={handleRecord}
            >
              <Text style={styles.transportIcon}>⏺</Text>
              <Text style={styles.transportText}>REC</Text>
            </TouchableOpacity>
          </View>

          {/* BPM & Status */}
          <View style={styles.statusBar}>
            <View style={styles.bpmDisplay}>
              <Text style={styles.bpmLabel}>BPM</Text>
              <Text style={styles.bpmValue}>{bpm}</Text>
            </View>
            <View style={styles.barDisplay}>
              <Text style={styles.barLabel}>BAR</Text>
              <Text style={styles.barValue}>{currentBar}</Text>
            </View>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                isPlaying && styles.statusDotActive
              ]} />
              <Text style={styles.statusText}>
                {isPlaying ? 'LIVE' : 'READY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracks Panel - DAW Style */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>🎼</Text>
            <Text style={styles.panelTitle}>TRACKS</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ ADD TRACK</Text>
            </TouchableOpacity>
          </View>

          {/* Track List */}
          {['VOCALS', 'SYNTH', 'DRUMS', 'BASS'].map((track, index) => (
            <View key={index} style={styles.track}>
              <View style={styles.trackHeader}>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackNumber}>{index + 1}</Text>
                  <Text style={styles.trackName}>{track}</Text>
                </View>
                <View style={styles.trackControls}>
                  <TouchableOpacity style={styles.trackBtn}>
                    <Text style={styles.trackBtnText}>M</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.trackBtn}>
                    <Text style={styles.trackBtnText}>S</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.trackBtn}>
                    <Text style={styles.trackBtnText}>R</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.trackTimeline}>
                <View style={styles.trackClip} />
              </View>
            </View>
          ))}
        </View>

        {/* Quick Access - Instruments */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>🎹</Text>
            <Text style={styles.panelTitle}>QUICK ACCESS</Text>
          </View>

          <View style={styles.quickGrid}>
            {[
              { name: 'SYNTHS', icon: '🎹', route: 'Instruments' },
              { name: 'DRUMS', icon: '🥁', route: 'Instruments' },
              { name: 'VOCALS', icon: '🎤', route: 'Creator' },
              { name: 'PRESETS', icon: '✨', route: 'Sounds' },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickCard}
                onPress={() => navigation.navigate(item.route)}
              >
                <Text style={styles.quickIcon}>{item.icon}</Text>
                <Text style={styles.quickText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recording Panel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelIcon}>🎤</Text>
            <Text style={styles.panelTitle}>VOCAL RECORDING</Text>
          </View>

          <View style={styles.recordingPanel}>
            <TouchableOpacity style={styles.recordingBtn}>
              <Text style={styles.recordingIcon}>⏺</Text>
              <Text style={styles.recordingText}>START RECORDING</Text>
            </TouchableOpacity>
            <Text style={styles.recordingHint}>
              Record vocals directly into your project
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>
            💡 CREATOR mode gives you full DAW capabilities
          </Text>
          <Text style={styles.infoText}>
            🎚️ Record, sequence, and produce complete tracks
          </Text>
          <Text style={styles.infoText}>
            🎤 Built-in vocal recording with real-time effects
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(5, 5, 8, 0.95)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.orange,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.orange,
    letterSpacing: 2,
  },
  headerRight: {
    width: 40,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  transportPanel: {
    backgroundColor: COLORS.bgCard,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  panel: {
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    flex: 1,
  },
  transportControls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  transportBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    alignItems: 'center',
  },
  transportBtnActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    borderColor: COLORS.green,
  },
  recordBtn: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  recordBtnActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.25)',
    borderColor: '#FF0000',
  },
  transportIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  transportText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  statusBar: {
    flexDirection: 'row',
    gap: 10,
  },
  bpmDisplay: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
  },
  bpmLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bpmValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.orange,
  },
  barDisplay: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  barValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  statusIndicator: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
  },
  statusDotActive: {
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.orange,
    letterSpacing: 0.5,
  },
  track: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  trackName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  trackControls: {
    flexDirection: 'row',
    gap: 6,
  },
  trackBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trackTimeline: {
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 6,
    padding: 4,
  },
  trackClip: {
    height: '100%',
    width: '60%',
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  recordingPanel: {
    alignItems: 'center',
    padding: 20,
  },
  recordingBtn: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  recordingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  recordingHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoPanel: {
    backgroundColor: 'rgba(0, 217, 255, 0.05)',
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 16,
  },
});

export default CreatorScreen;
