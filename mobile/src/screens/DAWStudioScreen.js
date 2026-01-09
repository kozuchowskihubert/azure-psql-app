/**
 * HAOS.fm DAW Studio Screen
 * Complete Digital Audio Workstation Interface
 * 
 * Features:
 * - Multi-track sequencer (16-step grid per track)
 * - Real-time playback with accurate timing
 * - Transport controls (play/pause/stop/loop/BPM)
 * - Per-track volume/mute/solo
 * - Instrument selector
 * - Pattern editor (step sequencer)
 * - Genre templates (Hip-Hop, Techno, Trap)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import DAWEngine from '../engine/DAWEngine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DAWStudioScreen() {
  const [project, setProject] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(128);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loopEnabled, setLoopEnabled] = useState(true);
  
  useEffect(() => {
    initializeDAW();
    
    return () => {
      DAWEngine.cleanup();
    };
  }, []);
  
  const initializeDAW = async () => {
    try {
      await DAWEngine.initialize();
      
      // Set playback update callback
      DAWEngine.onPlaybackUpdate = (state) => {
        setCurrentBar(state.bar);
        setCurrentStep(state.step);
      };
      
      // Load project
      const proj = DAWEngine.getProject();
      setProject(proj);
      setBpm(proj.bpm);
      
    } catch (error) {
      console.error('Failed to initialize DAW:', error);
    }
  };
  
  const handlePlay = () => {
    if (isPlaying) {
      DAWEngine.pause();
      setIsPlaying(false);
    } else {
      DAWEngine.play();
      setIsPlaying(true);
    }
  };
  
  const handleStop = () => {
    DAWEngine.stop();
    setIsPlaying(false);
    setCurrentBar(0);
    setCurrentStep(0);
  };
  
  const handleBPMChange = (newBPM) => {
    const bpmValue = parseInt(newBPM) || 128;
    setBpm(bpmValue);
    DAWEngine.setBPM(bpmValue);
  };
  
  const toggleLoop = () => {
    const newLoop = !loopEnabled;
    setLoopEnabled(newLoop);
    DAWEngine.loopEnabled = newLoop;
  };
  
  const toggleStep = (trackId, stepIndex) => {
    const proj = DAWEngine.getProject();
    const track = proj.tracks.find(t => t.id === trackId);
    
    if (track) {
      const newSteps = [...track.pattern.steps];
      newSteps[stepIndex] = newSteps[stepIndex] === 1 ? 0 : 1;
      DAWEngine.updatePattern(trackId, newSteps);
      setProject(DAWEngine.getProject());
    }
  };
  
  const toggleMute = (trackId) => {
    DAWEngine.toggleMute(trackId);
    setProject(DAWEngine.getProject());
  };
  
  const toggleSolo = (trackId) => {
    DAWEngine.toggleSolo(trackId);
    setProject(DAWEngine.getProject());
  };
  
  const setTrackVolume = (trackId, volume) => {
    DAWEngine.setTrackVolume(trackId, volume);
  };
  
  const loadGenreTemplate = (genre) => {
    DAWEngine.createDefaultProject(genre);
    setProject(DAWEngine.getProject());
    setBpm(DAWEngine.project.bpm);
  };
  
  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading DAW Studio...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎹 BUILD</Text>
        <Text style={styles.projectName}>{project.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>💾</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Genre Templates */}
      <View style={styles.templatesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.templateButton}
            onPress={() => loadGenreTemplate('hiphop')}
          >
            <Text style={styles.templateText}>🎤 Hip-Hop</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.templateButton}
            onPress={() => loadGenreTemplate('techno')}
          >
            <Text style={styles.templateText}>🎧 Techno</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.templateButton}
            onPress={() => loadGenreTemplate('trap')}
          >
            <Text style={styles.templateText}>🔊 Trap</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Tracks & Sequencer */}
      <ScrollView style={styles.tracksContainer}>
        {project.tracks.map((track, trackIndex) => (
          <View key={track.id} style={styles.trackRow}>
            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{track.name}</Text>
              <Text style={styles.trackInstrument}>{track.instrument}</Text>
              
              <View style={styles.trackControls}>
                <TouchableOpacity 
                  style={[styles.trackButton, track.mute && styles.trackButtonActive]}
                  onPress={() => toggleMute(track.id)}
                >
                  <Text style={styles.trackButtonText}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.trackButton, track.solo && styles.trackButtonActive]}
                  onPress={() => toggleSolo(track.id)}
                >
                  <Text style={styles.trackButtonText}>S</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Step Sequencer Grid */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sequencerScroll}
            >
              <View style={styles.sequencerGrid}>
                {track.pattern.steps.map((step, stepIndex) => {
                  const isActive = step === 1;
                  const isCurrent = stepIndex === currentStep && isPlaying;
                  const isBeat = stepIndex % 4 === 0;
                  
                  return (
                    <TouchableOpacity
                      key={stepIndex}
                      style={[
                        styles.stepButton,
                        isActive && styles.stepButtonActive,
                        isCurrent && styles.stepButtonCurrent,
                        isBeat && styles.stepButtonBeat,
                      ]}
                      onPress={() => toggleStep(track.id, stepIndex)}
                    >
                      <Text style={[
                        styles.stepButtonText,
                        isActive && styles.stepButtonTextActive
                      ]}>
                        {isActive ? '●' : '○'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      
      {/* Transport Controls */}
      <View style={styles.transport}>
        <View style={styles.transportTop}>
          {/* Playback position */}
          <View style={styles.positionDisplay}>
            <Text style={styles.positionText}>
              Bar: {currentBar + 1} | Beat: {Math.floor(currentStep / 4) + 1} | Step: {currentStep + 1}
            </Text>
          </View>
          
          {/* BPM Control */}
          <View style={styles.bpmControl}>
            <Text style={styles.bpmLabel}>BPM</Text>
            <TextInput
              style={styles.bpmInput}
              value={bpm.toString()}
              onChangeText={handleBPMChange}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          
          {/* Loop Toggle */}
          <TouchableOpacity 
            style={[styles.loopButton, loopEnabled && styles.loopButtonActive]}
            onPress={toggleLoop}
          >
            <Text style={styles.loopButtonText}>🔄 Loop</Text>
          </TouchableOpacity>
        </View>
        
        {/* Playback Buttons */}
        <View style={styles.transportButtons}>
          <TouchableOpacity 
            style={[styles.transportButton, styles.stopButton]}
            onPress={handleStop}
          >
            <Text style={styles.transportButtonText}>⏹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.transportButton, styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlay}
          >
            <Text style={styles.transportButtonText}>
              {isPlaying ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  
  // Header
  header: {
    height: 60,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  projectName: {
    fontSize: 14,
    color: '#888',
    flex: 1,
    marginLeft: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  
  // Templates Bar
  templatesBar: {
    height: 50,
    backgroundColor: '#151515',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  templateButton: {
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  templateText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Tracks
  tracksContainer: {
    flex: 1,
  },
  trackRow: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  trackInfo: {
    width: 120,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trackName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  trackInstrument: {
    fontSize: 11,
    color: '#888',
    marginBottom: 5,
  },
  trackControls: {
    flexDirection: 'row',
    gap: 5,
  },
  trackButton: {
    width: 30,
    height: 24,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#ff4444',
  },
  trackButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Sequencer
  sequencerScroll: {
    flex: 1,
  },
  sequencerGrid: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    gap: 3,
  },
  stepButton: {
    width: 40,
    height: 60,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  stepButtonBeat: {
    borderColor: '#666',
    borderWidth: 2,
  },
  stepButtonActive: {
    backgroundColor: '#00d9ff',
    borderColor: '#00d9ff',
  },
  stepButtonCurrent: {
    borderColor: '#ffcc00',
    borderWidth: 3,
  },
  stepButtonText: {
    fontSize: 18,
    color: '#666',
  },
  stepButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Transport
  transport: {
    height: 140,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  transportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  positionDisplay: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  positionText: {
    fontSize: 12,
    color: '#00d9ff',
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  bpmControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  bpmLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold',
    marginRight: 10,
  },
  bpmInput: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'center',
  },
  loopButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  loopButtonActive: {
    backgroundColor: '#00d9ff',
  },
  loopButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  transportButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  transportButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  stopButton: {
    backgroundColor: '#ff4444',
  },
  playButton: {
    backgroundColor: '#00d9ff',
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  playButtonActive: {
    backgroundColor: '#ffcc00',
  },
  transportButtonText: {
    fontSize: 32,
  },
  
  loadingText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 100,
  },
});
