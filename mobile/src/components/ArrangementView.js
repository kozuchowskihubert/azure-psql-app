/**
 * HAOS.fm Arrangement View
 * Timeline-based DAW arrangement with drag-and-drop clips
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, PanResponder } from 'react-native';
import audioRoutingEngine from '../audio/AudioRoutingEngine';

// Local colors to avoid initialization timing issues
const COLORS = {
  background: '#0a0a0a',
  orange: '#FF6B35',
  cyan: '#00D9FF',
};

const { width } = Dimensions.get('window');

const TRACK_HEIGHT = 60;
const BEAT_WIDTH = 40; // pixels per beat
const BEATS_PER_BAR = 4;
const TOTAL_BARS = 64;

export default function ArrangementView({ bpm = 120, isPlaying, onPlaybackToggle }) {
  const [clips, setClips] = useState([]);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [snap, setSnap] = useState(true);
  const [gridSize, setGridSize] = useState(1); // 1 = beat, 4 = bar, 0.25 = 1/16th note
  
  const scrollViewRef = useRef(null);
  const playbackIntervalRef = useRef(null);

  // Track definitions (from routing engine)
  const [tracks] = useState([
    { id: 'kick', name: 'KICK', color: '#FF0000', category: 'drums' },
    { id: 'snare', name: 'SNARE', color: '#FF4400', category: 'drums' },
    { id: 'hihat', name: 'HI-HAT', color: '#FF8800', category: 'drums' },
    { id: 'arp2600', name: 'ARP 2600', color: '#00D9FF', category: 'synths' },
    { id: 'juno106', name: 'JUNO-106', color: '#0088FF', category: 'synths' },
    { id: 'minimoog', name: 'MINIMOOG', color: '#0044FF', category: 'synths' },
    { id: 'tb303', name: 'TB-303', color: '#00FFFF', category: 'synths' },
    { id: 'piano', name: 'PIANO', color: '#39FF14', category: 'melody' },
    { id: 'strings', name: 'STRINGS', color: '#8B5CF6', category: 'strings' },
    { id: 'violin', name: 'VIOLIN', color: '#A855F7', category: 'strings' }
  ]);

  // Playback simulation
  useEffect(() => {
    if (isPlaying) {
      const beatsPerSecond = bpm / 60;
      const updateInterval = 50; // ms
      const beatsPerUpdate = (beatsPerSecond * updateInterval) / 1000;

      playbackIntervalRef.current = setInterval(() => {
        setPlayheadPosition(prev => {
          const next = prev + beatsPerUpdate;
          const maxBeats = TOTAL_BARS * BEATS_PER_BAR;
          return next >= maxBeats ? 0 : next;
        });
      }, updateInterval);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, bpm]);

  // Snap position to grid
  const snapToGrid = (position) => {
    if (!snap) return position;
    const snapSize = gridSize;
    return Math.round(position / snapSize) * snapSize;
  };

  // Add clip
  const addClip = (trackId, startBeat, durationBeats = 4) => {
    const newClip = {
      id: Date.now().toString(),
      trackId,
      startBeat: snapToGrid(startBeat),
      durationBeats: snapToGrid(durationBeats),
      mute: false,
      color: tracks.find(t => t.id === trackId)?.color || '#666'
    };

    setClips(prev => [...prev, newClip]);
    return newClip;
  };

  // Remove clip
  const removeClip = (clipId) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  // Move clip
  const moveClip = (clipId, newTrackId, newStartBeat) => {
    setClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          trackId: newTrackId,
          startBeat: snapToGrid(newStartBeat)
        };
      }
      return clip;
    }));
  };

  // Resize clip
  const resizeClip = (clipId, newDurationBeats) => {
    setClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return {
          ...clip,
          durationBeats: Math.max(0.25, snapToGrid(newDurationBeats))
        };
      }
      return clip;
    }));
  };

  // Toggle clip mute
  const toggleClipMute = (clipId) => {
    setClips(prev => prev.map(clip => {
      if (clip.id === clipId) {
        return { ...clip, mute: !clip.mute };
      }
      return clip;
    }));
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Clear arrangement
  const clearArrangement = () => {
    setClips([]);
    setSelectedClipId(null);
    setPlayheadPosition(0);
  };

  // Render timeline ruler
  const renderTimelineRuler = () => {
    const bars = [];
    for (let bar = 0; bar < TOTAL_BARS; bar++) {
      bars.push(
        <View key={bar} style={[styles.barMarker, { width: BEAT_WIDTH * BEATS_PER_BAR * zoom }]}>
          <Text style={styles.barNumber}>{bar + 1}</Text>
        </View>
      );
    }
    return bars;
  };

  // Render track lanes
  const renderTracks = () => {
    return tracks.map((track, trackIndex) => (
      <View key={track.id} style={[styles.trackRow, { height: TRACK_HEIGHT }]}>
        {/* Track label */}
        <View style={[styles.trackLabel, { backgroundColor: track.color + '20' }]}>
          <Text style={[styles.trackName, { color: track.color }]} numberOfLines={1}>
            {track.name}
          </Text>
        </View>

        {/* Track lane (for clips) */}
        <View style={styles.trackLane}>
          {/* Grid lines */}
          {renderGridLines()}

          {/* Clips on this track */}
          {clips
            .filter(clip => clip.trackId === track.id)
            .map(clip => renderClip(clip, trackIndex))}

          {/* Drop zone for new clips */}
          <TouchableOpacity
            style={styles.dropZone}
            onPress={(e) => {
              const x = e.nativeEvent.locationX;
              const beat = x / (BEAT_WIDTH * zoom);
              addClip(track.id, beat);
            }}
          />
        </View>
      </View>
    ));
  };

  // Render grid lines
  const renderGridLines = () => {
    const lines = [];
    for (let beat = 0; beat < TOTAL_BARS * BEATS_PER_BAR; beat++) {
      const isBar = beat % BEATS_PER_BAR === 0;
      lines.push(
        <View
          key={beat}
          style={[
            styles.gridLine,
            {
              left: beat * BEAT_WIDTH * zoom,
              backgroundColor: isBar ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'
            }
          ]}
        />
      );
    }
    return lines;
  };

  // Render individual clip
  const renderClip = (clip, trackIndex) => {
    const clipWidth = clip.durationBeats * BEAT_WIDTH * zoom;
    const clipLeft = clip.startBeat * BEAT_WIDTH * zoom;
    const isSelected = clip.id === selectedClipId;

    return (
      <TouchableOpacity
        key={clip.id}
        style={[
          styles.clip,
          {
            left: clipLeft,
            width: clipWidth,
            backgroundColor: clip.mute ? '#333' : clip.color,
            borderColor: isSelected ? '#FFF' : 'transparent',
            opacity: clip.mute ? 0.4 : 1
          }
        ]}
        onPress={() => setSelectedClipId(clip.id)}
        onLongPress={() => {
          // Show clip context menu
          console.log('Clip long press:', clip.id);
        }}
      >
        <Text style={styles.clipText} numberOfLines={1}>
          {tracks.find(t => t.id === clip.trackId)?.name}
        </Text>
        
        {/* Clip actions */}
        {isSelected && (
          <View style={styles.clipActions}>
            <TouchableOpacity
              style={styles.clipActionBtn}
              onPress={(e) => {
                e.stopPropagation();
                toggleClipMute(clip.id);
              }}
            >
              <Text style={styles.clipActionText}>{clip.mute ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clipActionBtn}
              onPress={(e) => {
                e.stopPropagation();
                removeClip(clip.id);
              }}
            >
              <Text style={styles.clipActionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render playhead
  const renderPlayhead = () => {
    const left = playheadPosition * BEAT_WIDTH * zoom;
    return (
      <View style={[styles.playhead, { left }]}>
        <View style={styles.playheadHead} />
        <View style={styles.playheadLine} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={onPlaybackToggle}>
          <Text style={styles.toolbarBtnText}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setPlayheadPosition(0)}>
          <Text style={styles.toolbarBtnText}>⏮️</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarBtn} onPress={handleZoomOut}>
          <Text style={styles.toolbarBtnText}>🔍−</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomText}>{(zoom * 100).toFixed(0)}%</Text>
        
        <TouchableOpacity style={styles.toolbarBtn} onPress={handleZoomIn}>
          <Text style={styles.toolbarBtnText}>🔍+</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={[styles.toolbarBtn, snap && styles.toolbarBtnActive]}
          onPress={() => setSnap(!snap)}
        >
          <Text style={styles.toolbarBtnText}>🧲</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarBtn} onPress={clearArrangement}>
          <Text style={styles.toolbarBtnText}>🗑️</Text>
        </TouchableOpacity>

        <View style={styles.toolbarInfo}>
          <Text style={styles.toolbarInfoText}>
            {Math.floor(playheadPosition / BEATS_PER_BAR) + 1}.{(playheadPosition % BEATS_PER_BAR + 1).toFixed(0)}
          </Text>
          <Text style={styles.toolbarInfoText}>{clips.length} clips</Text>
        </View>
      </View>

      {/* Timeline ruler */}
      <View style={styles.rulerContainer}>
        <View style={styles.rulerSpacer} />
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ruler}
        >
          <View style={styles.rulerContent}>
            {renderTimelineRuler()}
          </View>
        </ScrollView>
      </View>

      {/* Tracks area */}
      <ScrollView style={styles.tracksScrollView}>
        <View style={styles.tracksContent}>
          {renderTracks()}
          {renderPlayhead()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,107,53,0.3)',
  },
  toolbarBtn: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toolbarBtnActive: {
    backgroundColor: COLORS.orange,
  },
  toolbarBtnText: {
    fontSize: 16,
    color: '#FFF',
  },
  toolbarSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  toolbarInfo: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  toolbarInfoText: {
    ...TYPO.mono,
    fontSize: 12,
    color: COLORS.cyan,
  },
  zoomText: {
    ...TYPO.mono,
    fontSize: 14,
    color: '#FFF',
    marginHorizontal: 8,
  },
  rulerContainer: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,107,53,0.3)',
  },
  rulerSpacer: {
    width: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ruler: {
    flex: 1,
  },
  rulerContent: {
    flexDirection: 'row',
  },
  barMarker: {
    height: 40,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,107,53,0.5)',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  barNumber: {
    ...TYPO.mono,
    fontSize: 12,
    color: COLORS.orange,
  },
  tracksScrollView: {
    flex: 1,
  },
  tracksContent: {
    position: 'relative',
  },
  trackRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  trackLabel: {
    width: 100,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  trackName: {
    ...TYPO.label,
    fontSize: 11,
    fontWeight: 'bold',
  },
  trackLane: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  dropZone: {
    ...StyleSheet.absoluteFillObject,
  },
  clip: {
    position: 'absolute',
    top: 5,
    height: 50,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clipText: {
    ...TYPO.mono,
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  clipActions: {
    position: 'absolute',
    top: 2,
    right: 2,
    flexDirection: 'row',
  },
  clipActionBtn: {
    padding: 4,
    marginLeft: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  clipActionText: {
    fontSize: 10,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 1000,
  },
  playheadHead: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.orange,
    borderRadius: 6,
    marginLeft: -5,
  },
  playheadLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.orange,
    opacity: 0.7,
  },
});
