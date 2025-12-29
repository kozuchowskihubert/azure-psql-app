/**
 * Preset Library Test Screen
 * Tests the new Preset Library with 15+ professional patterns
 * Location: mobile/src/screens/PresetLibraryTestScreen.js
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PythonAudioEngine from '../services/PythonAudioEngine';
import {
  NOTES,
  HIP_HOP_PRESETS,
  TECHNO_PRESETS,
  DNB_PRESETS,
  getPresetsByGenre,
  getPresetById,
} from '../data/presetPatterns';

const HAOS_COLORS = {
  gold: '#D4AF37',
  orange: '#FF6B35',
  silver: '#C0C0C0',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
};

const GENRES = ['Hip-Hop', 'Techno', 'Drum & Bass'];

const PresetLibraryTestScreen = ({ navigation }) => {
  const [audioEngine] = useState(() => new PythonAudioEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Hip-Hop');
  const [playingPreset, setPlayingPreset] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    audioEngine.initialize().then(() => {
      setIsInitialized(true);
    }).catch(error => {
      Alert.alert('Error', 'Failed to initialize audio engine: ' + error.message);
    });
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);

  const playPreset = async (preset) => {
    if (!isInitialized) {
      Alert.alert('Audio Engine', 'Please wait, initializing...');
      return;
    }

    if (isPlaying) {
      Alert.alert('Busy', 'Please wait for current pattern to finish');
      return;
    }

    setPlayingPreset(preset.id);
    setIsPlaying(true);

    const { bpm, pattern } = preset;
    const beatDuration = 60 / bpm; // seconds per beat
    const stepDuration = beatDuration / 4; // 16th notes

    try {
      // Play 2 bars (32 steps)
      for (let bar = 0; bar < 2; bar++) {
        // Play drums (16-step pattern)
        for (let step = 0; step < 16; step++) {
          const globalStep = bar * 16 + step;
          const time = globalStep * stepDuration * 1000;

          if (pattern.drums.kick[step] === 1) {
            setTimeout(() => audioEngine.playKick(0.8).catch(() => {}), time);
          }
          if (pattern.drums.snare[step] === 1) {
            setTimeout(() => audioEngine.playSnare(0.7).catch(() => {}), time);
          }
          if (pattern.drums.hihat[step] === 1) {
            setTimeout(() => audioEngine.playHiHat(0.6, false).catch(() => {}), time);
          }
          if (pattern.drums.clap && pattern.drums.clap[step] === 1) {
            setTimeout(() => audioEngine.playClap(0.7).catch(() => {}), time);
          }
        }

        // Play chords (once per bar)
        if (pattern.chords && pattern.chords.length > 0) {
          pattern.chords.forEach(chord => {
            const time = (bar * 16 + chord.beat * 4) * stepDuration * 1000;
            setTimeout(() => {
              audioEngine.playChord(
                chord.root,
                chord.type,
                chord.duration,
                0.5
              ).catch(() => {});
            }, time);
          });
        }

        // Play melody
        if (pattern.melody && pattern.melody.length > 0) {
          pattern.melody.forEach(note => {
            const time = (bar * 16 + note.beat * 4) * stepDuration * 1000;
            setTimeout(() => {
              // Map instrument names to audio engine methods
              const instrumentMap = {
                'trumpet': 'playTrumpet',
                'saxophone': 'playSaxophone',
                'trombone': 'playTrombone',
                'synth': 'playSynth',
              };
              
              const method = instrumentMap[note.instrument] || 'playSynth';
              
              if (audioEngine[method]) {
                audioEngine[method](
                  note.freq,
                  note.duration,
                  note.velocity || 0.7
                ).catch(() => {});
              }
            }, time);
          });
        }
      }

      // Mark as finished after 2 bars
      const totalDuration = 32 * stepDuration * 1000;
      setTimeout(() => {
        setIsPlaying(false);
        setPlayingPreset(null);
      }, totalDuration);

    } catch (error) {
      setIsPlaying(false);
      setPlayingPreset(null);
      Alert.alert('Playback Error', error.message);
    }
  };

  const presets = getPresetsByGenre(selectedGenre);

  const renderPresetCard = (preset) => {
    const isActive = playingPreset === preset.id;
    
    return (
      <TouchableOpacity
        key={preset.id}
        style={[
          styles.presetCard,
          isActive && styles.presetCardActive,
        ]}
        onPress={() => playPreset(preset)}
        disabled={isPlaying && !isActive}
      >
        <View style={styles.presetHeader}>
          <Text style={styles.presetName}>{preset.name}</Text>
          <Text style={styles.presetBPM}>{preset.bpm} BPM</Text>
        </View>
        
        <Text style={styles.presetGenre}>{preset.genre}</Text>
        
        <View style={styles.presetInfo}>
          <Text style={styles.presetInfoText}>
            🥁 {Object.keys(preset.pattern.drums).length} drum tracks
          </Text>
          {preset.pattern.chords && preset.pattern.chords.length > 0 && (
            <Text style={styles.presetInfoText}>
              🎹 {preset.pattern.chords.length} chords
            </Text>
          )}
          {preset.pattern.melody && preset.pattern.melody.length > 0 && (
            <Text style={styles.presetInfoText}>
              🎺 {preset.pattern.melody.length} melody notes
            </Text>
          )}
        </View>
        
        {isActive && (
          <View style={styles.playingIndicator}>
            <Text style={styles.playingText}>▶ PLAYING...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, HAOS_COLORS.darkGray, HAOS_COLORS.dark]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>PRESET LIBRARY</Text>
          <Text style={styles.subtitle}>
            {isInitialized ? `✅ ${HIP_HOP_PRESETS.length + TECHNO_PRESETS.length + DNB_PRESETS.length} Patterns Ready` : '⏳ Initializing...'}
          </Text>
        </View>

        {/* Genre Tabs */}
        <View style={styles.genreTabs}>
          {GENRES.map(genre => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreTab,
                selectedGenre === genre && styles.genreTabActive,
              ]}
              onPress={() => setSelectedGenre(genre)}
            >
              <Text style={[
                styles.genreTabText,
                selectedGenre === genre && styles.genreTabTextActive,
              ]}>
                {genre}
              </Text>
              <Text style={styles.genreTabCount}>
                {getPresetsByGenre(genre).length}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Presets */}
        <View style={styles.presetsContainer}>
          {presets.map(renderPresetCard)}
        </View>

        {/* Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📁 File: mobile/src/data/presetPatterns.js
          </Text>
          <Text style={styles.footerText}>
            🎵 Total: {HIP_HOP_PRESETS.length + TECHNO_PRESETS.length + DNB_PRESETS.length} professional patterns
          </Text>
          <Text style={styles.footerText}>
            💡 Tap any preset to hear a 2-bar preview
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backButtonText: {
    color: HAOS_COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HAOS_COLORS.gold,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: HAOS_COLORS.silver,
  },
  genreTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genreTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  genreTabActive: {
    backgroundColor: HAOS_COLORS.gold,
  },
  genreTabText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  genreTabTextActive: {
    color: '#000',
  },
  genreTabCount: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  presetsContainer: {
    paddingHorizontal: 20,
  },
  presetCard: {
    backgroundColor: HAOS_COLORS.darkGray,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardActive: {
    borderColor: HAOS_COLORS.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  presetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  presetBPM: {
    fontSize: 16,
    color: HAOS_COLORS.orange,
    fontWeight: 'bold',
  },
  presetGenre: {
    fontSize: 14,
    color: HAOS_COLORS.silver,
    marginBottom: 15,
  },
  presetInfo: {
    marginTop: 10,
  },
  presetInfoText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 5,
  },
  playingIndicator: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  playingText: {
    color: HAOS_COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default PresetLibraryTestScreen;
