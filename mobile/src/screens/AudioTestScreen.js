/**
 * HAOS.fm Audio Test Screen
 * Tests WebAudioBridge with Web Audio API
 * Demonstrates drum synthesis, bass, and effects
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import webAudioBridge from '../services/WebAudioBridge';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

const COLORS = {
  primary: '#FF6B35',
  background: '#050508',
  cardBg: 'rgba(20, 20, 25, 0.85)',
  border: 'rgba(255, 107, 53, 0.3)',
  text: '#F4E8D8',
  green: '#00ff94',
  cyan: '#00D9FF',
  purple: '#B24BF3',
};

export default function AudioTestScreen() {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [audioLevel, setAudioLevel] = useState(-Infinity);
  
  useEffect(() => {
    // Set WebView reference
    webAudioBridge.setWebViewRef(webViewRef);
    
    // Register message handlers
    webAudioBridge.on('ready', (payload) => {
      console.log('✅ Audio engine ready:', payload);
      setIsReady(true);
    });
    
    webAudioBridge.on('waveform', (payload) => {
      setWaveformData(payload.data || []);
    });
    
    webAudioBridge.on('audioLevel', (payload) => {
      setAudioLevel(payload.db);
    });
    
    webAudioBridge.on('soundPlayed', (payload) => {
      console.log('🎵 Sound played:', payload);
    });
    
    // Start waveform updates
    setTimeout(() => {
      webAudioBridge.startWaveformUpdates(50);
    }, 1000);
    
    return () => {
      webAudioBridge.stopWaveformUpdates();
      webAudioBridge.off('ready');
      webAudioBridge.off('waveform');
      webAudioBridge.off('audioLevel');
      webAudioBridge.off('soundPlayed');
    };
  }, []);
  
  const handlePlayKick = () => {
    webAudioBridge.playKick({ pitch: 150, decay: 0.3 });
  };
  
  const handlePlaySnare = () => {
    webAudioBridge.playSnare({ tone: 0.2 });
  };
  
  const handlePlayHiHat = () => {
    webAudioBridge.playHiHat({ decay: 0.05 });
  };
  
  const handlePlayClap = () => {
    webAudioBridge.playClap();
  };
  
  const handlePlayBass = () => {
    webAudioBridge.playBass(130.81, 0.2);
  };
  
  const handlePlaySynth = () => {
    webAudioBridge.playSynthNote(440, 0.5);
  };
  
  const handleSetFilter = () => {
    webAudioBridge.setFilter('lowpass', 500, 10);
  };
  
  const handleSetReverb = () => {
    webAudioBridge.setReverb(50);
  };
  
  return (
    <View style={styles.container}>
      <CircuitBoardBackground density="low" />
      
      {/* Hidden WebView for audio processing */}
      <WebView
        ref={webViewRef}
        source={require('../../assets/audio-engine.html')}
        style={styles.webView}
        onMessage={(event) => webAudioBridge.onMessage(event)}
        onError={(error) => console.error('WebView error:', error)}
        onLoad={() => console.log('WebView loaded')}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        originWhitelist={['*']}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>HAOS.fm</Text>
          <Text style={styles.subtitle}>AUDIO TEST</Text>
          <Text style={[styles.status, { color: isReady ? COLORS.green : COLORS.primary }]}>
            {isReady ? '✅ READY' : '⏳ LOADING...'}
          </Text>
        </View>
        
        {/* Waveform Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 WAVEFORM</Text>
          <View style={styles.card}>
            <View style={styles.waveformContainer}>
              {waveformData.map((amplitude, index) => {
                const height = Math.max(2, amplitude * 100);
                return (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height,
                        backgroundColor: amplitude > 0.7 ? '#ff4444' : 
                                       amplitude > 0.5 ? COLORS.primary : 
                                       COLORS.green,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.audioLevelText}>
              {audioLevel === -Infinity ? '-∞ dB' : `${audioLevel.toFixed(1)} dB`}
            </Text>
          </View>
        </View>
        
        {/* Drum Sounds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥁 DRUMS</Text>
          <View style={styles.card}>
            <View style={styles.buttonGrid}>
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.cyan }]}
                onPress={handlePlayKick}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🥁</Text>
                <Text style={styles.drumButtonText}>KICK</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.primary }]}
                onPress={handlePlaySnare}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🥁</Text>
                <Text style={styles.drumButtonText}>SNARE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.purple }]}
                onPress={handlePlayHiHat}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🔔</Text>
                <Text style={styles.drumButtonText}>HI-HAT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.green }]}
                onPress={handlePlayClap}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>👏</Text>
                <Text style={styles.drumButtonText}>CLAP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Synth Sounds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎹 SYNTH</Text>
          <View style={styles.card}>
            <View style={styles.buttonGrid}>
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.primary }]}
                onPress={handlePlayBass}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🎸</Text>
                <Text style={styles.drumButtonText}>BASS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.cyan }]}
                onPress={handlePlaySynth}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🎹</Text>
                <Text style={styles.drumButtonText}>SYNTH</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Effects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ EFFECTS</Text>
          <View style={styles.card}>
            <View style={styles.buttonGrid}>
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.purple }]}
                onPress={handleSetFilter}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🎚️</Text>
                <Text style={styles.drumButtonText}>FILTER</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.drumButton, { borderColor: COLORS.cyan }]}
                onPress={handleSetReverb}
                disabled={!isReady}
              >
                <Text style={styles.drumButtonEmoji}>🌊</Text>
                <Text style={styles.drumButtonText}>REVERB</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              🎵 WebAudio Bridge Test
            </Text>
            <Text style={styles.infoSubtext}>
              This screen demonstrates real audio synthesis using Web Audio API in a hidden WebView
            </Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webView: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    color: '#808080',
    letterSpacing: 2,
    marginTop: 4,
  },
  status: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 12,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 2,
  },
  audioLevelText: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  drumButton: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  drumButtonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  drumButtonText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.3)',
    padding: 16,
  },
  infoText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
    marginBottom: 8,
  },
  infoSubtext: {
    fontFamily: 'System',
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
});
