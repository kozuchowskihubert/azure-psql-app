/**
 * Interactive Patch Bay for ARP 2600
 * Full drag-and-drop cable routing system
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const COLORS = {
  input: '#0066FF',
  output: '#FF6B35',
  cable: '#FFD700',
  background: '#1a1a1a',
  panel: '#2a2a2a',
  text: '#FFFFFF',
  textMuted: '#808080',
};

// Patch points configuration
const PATCH_POINTS = {
  // Outputs
  VCO1_SAW: { type: 'output', label: 'VCO1 SAW', module: 'VCO1', color: '#FF6B35' },
  VCO1_PULSE: { type: 'output', label: 'VCO1 PULSE', module: 'VCO1', color: '#FF6B35' },
  VCO1_SINE: { type: 'output', label: 'VCO1 SINE', module: 'VCO1', color: '#FF6B35' },
  
  VCO2_SAW: { type: 'output', label: 'VCO2 SAW', module: 'VCO2', color: '#00D9FF' },
  VCO2_PULSE: { type: 'output', label: 'VCO2 PULSE', module: 'VCO2', color: '#00D9FF' },
  VCO2_SINE: { type: 'output', label: 'VCO2 SINE', module: 'VCO2', color: '#00D9FF' },
  VCO2_TRI: { type: 'output', label: 'VCO2 TRI', module: 'VCO2', color: '#00D9FF' },
  
  VCO3_SAW: { type: 'output', label: 'VCO3 SAW', module: 'VCO3', color: '#FFD700' },
  VCO3_PULSE: { type: 'output', label: 'VCO3 PULSE', module: 'VCO3', color: '#FFD700' },
  VCO3_SINE: { type: 'output', label: 'VCO3 SINE', module: 'VCO3', color: '#FFD700' },
  VCO3_TRI: { type: 'output', label: 'VCO3 TRI', module: 'VCO3', color: '#FFD700' },
  
  ADSR_OUT: { type: 'output', label: 'ADSR OUT', module: 'ENV', color: '#C0C0C0' },
  AR_OUT: { type: 'output', label: 'AR OUT', module: 'ENV', color: '#C0C0C0' },
  
  LFO_TRI: { type: 'output', label: 'LFO TRI', module: 'LFO', color: '#A855F7' },
  LFO_SQUARE: { type: 'output', label: 'LFO SQR', module: 'LFO', color: '#A855F7' },
  LFO_SAW: { type: 'output', label: 'LFO SAW', module: 'LFO', color: '#A855F7' },
  
  NOISE_WHITE: { type: 'output', label: 'NOISE WHT', module: 'NOISE', color: '#FFFFFF' },
  NOISE_PINK: { type: 'output', label: 'NOISE PNK', module: 'NOISE', color: '#FF69B4' },
  
  SH_OUT: { type: 'output', label: 'S&H OUT', module: 'SH', color: '#00ff94' },
  RING_MOD_OUT: { type: 'output', label: 'RING MOD', module: 'RING', color: '#FF8C5A' },
  
  // Inputs
  VCF_IN: { type: 'input', label: 'VCF IN', module: 'VCF', color: '#00ff94' },
  VCF_FM: { type: 'input', label: 'VCF FM', module: 'VCF', color: '#00ff94' },
  
  VCA_IN: { type: 'input', label: 'VCA IN', module: 'VCA', color: '#FF8C5A' },
  VCA_CTRL: { type: 'input', label: 'VCA CTRL', module: 'VCA', color: '#FF8C5A' },
  
  VCO1_FM: { type: 'input', label: 'VCO1 FM', module: 'VCO1', color: '#FF6B35' },
  VCO2_FM: { type: 'input', label: 'VCO2 FM', module: 'VCO2', color: '#00D9FF' },
  VCO2_SYNC: { type: 'input', label: 'VCO2 SYNC', module: 'VCO2', color: '#00D9FF' },
  
  RING_X: { type: 'input', label: 'RING X', module: 'RING', color: '#FF8C5A' },
  RING_Y: { type: 'input', label: 'RING Y', module: 'RING', color: '#FF8C5A' },
  
  SH_IN: { type: 'input', label: 'S&H IN', module: 'SH', color: '#00ff94' },
  SH_CLK: { type: 'input', label: 'S&H CLK', module: 'SH', color: '#00ff94' },
};

// Default normalled connections (pre-wired)
const DEFAULT_PATCHES = [
  { from: 'VCO1_SAW', to: 'VCF_IN', color: '#FFD700', normalled: true },
  { from: 'VCO2_SAW', to: 'VCF_IN', color: '#FFD700', normalled: true },
  { from: 'ADSR_OUT', to: 'VCA_CTRL', color: '#FFD700', normalled: true },
];

const PatchBay = ({ onPatchChange }) => {
  const [patches, setPatches] = useState(DEFAULT_PATCHES);
  const [draggingCable, setDraggingCable] = useState(null);
  const [cableEndPos, setCableEndPos] = useState({ x: 0, y: 0 });
  const [jackPositions, setJackPositions] = useState({});

  const handleJackPress = (jackId, position) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const jack = PATCH_POINTS[jackId];
    
    if (jack.type === 'output') {
      // Start dragging cable from output
      setDraggingCable({
        from: jackId,
        fromPos: position,
        color: jack.color,
      });
      setCableEndPos(position);
    } else if (jack.type === 'input' && draggingCable) {
      // Connect cable to input
      const newPatch = {
        from: draggingCable.from,
        to: jackId,
        color: draggingCable.color,
        normalled: false,
      };
      
      const updatedPatches = [...patches, newPatch];
      setPatches(updatedPatches);
      setDraggingCable(null);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (onPatchChange) {
        onPatchChange(updatedPatches);
      }
    }
  };

  const handleCableMove = (evt) => {
    if (draggingCable) {
      setCableEndPos({
        x: evt.nativeEvent.pageX,
        y: evt.nativeEvent.pageY,
      });
    }
  };

  const handleRemovePatch = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedPatches = patches.filter((_, i) => i !== index);
    setPatches(updatedPatches);
    
    if (onPatchChange) {
      onPatchChange(updatedPatches);
    }
  };

  const renderJack = (jackId, index, section) => {
    const jack = PATCH_POINTS[jackId];
    const isConnected = patches.some(
      (p) => p.from === jackId || p.to === jackId
    );
    
    return (
      <View
        key={jackId}
        style={styles.jackContainer}
        onLayout={(e) => {
          e.target.measure((x, y, width, height, pageX, pageY) => {
            setJackPositions((prev) => ({
              ...prev,
              [jackId]: { x: pageX + width / 2, y: pageY + height / 2 },
            }));
          });
        }}
      >
        <TouchableOpacity
          style={[
            styles.jack,
            {
              backgroundColor: jack.type === 'output' ? '#FF6B35' : '#0066FF',
              borderColor: isConnected ? jack.color : 'transparent',
              borderWidth: isConnected ? 3 : 0,
            },
          ]}
          onPress={() => {
            const position = jackPositions[jackId];
            if (position) {
              handleJackPress(jackId, position);
            }
          }}
        >
          <View style={styles.jackHole} />
        </TouchableOpacity>
        <Text style={styles.jackLabel}>{jack.label}</Text>
      </View>
    );
  };

  const renderCable = (patch, index) => {
    const fromPos = jackPositions[patch.from];
    const toPos = jackPositions[patch.to];
    
    if (!fromPos || !toPos) return null;
    
    // Bezier curve for cable
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const curve = 50; // Cable sag
    
    const pathData = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY + curve} ${toPos.x} ${toPos.y}`;
    
    return (
      <TouchableOpacity
        key={index}
        style={StyleSheet.absoluteFill}
        onPress={() => handleRemovePatch(index)}
      >
        <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
          <Path
            d={pathData}
            stroke={patch.color}
            strokeWidth={patch.normalled ? 2 : 4}
            strokeDasharray={patch.normalled ? '5,5' : null}
            fill="none"
            opacity={patch.normalled ? 0.5 : 1}
          />
          <Circle cx={fromPos.x} cy={fromPos.y} r={6} fill={patch.color} />
          <Circle cx={toPos.x} cy={toPos.y} r={6} fill={patch.color} />
        </Svg>
      </TouchableOpacity>
    );
  };

  const renderDraggingCable = () => {
    if (!draggingCable) return null;
    
    const pathData = `M ${draggingCable.fromPos.x} ${draggingCable.fromPos.y} L ${cableEndPos.x} ${cableEndPos.y}`;
    
    return (
      <Svg height={height} width={width} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path
          d={pathData}
          stroke={draggingCable.color}
          strokeWidth={4}
          fill="none"
          opacity={0.8}
        />
        <Circle cx={draggingCable.fromPos.x} cy={draggingCable.fromPos.y} r={6} fill={draggingCable.color} />
      </Svg>
    );
  };

  const outputJacks = Object.keys(PATCH_POINTS).filter(
    (key) => PATCH_POINTS[key].type === 'output'
  );
  const inputJacks = Object.keys(PATCH_POINTS).filter(
    (key) => PATCH_POINTS[key].type === 'input'
  );

  return (
    <View style={styles.container} onTouchMove={handleCableMove}>
      {/* Cables Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {patches.map((patch, index) => renderCable(patch, index))}
        {renderDraggingCable()}
      </View>

      {/* Patch Bay Panel */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info */}
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            🔌 {patches.length} Active Patches ({patches.filter(p => !p.normalled).length} Custom)
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setPatches(DEFAULT_PATCHES);
              if (onPatchChange) {
                onPatchChange(DEFAULT_PATCHES);
              }
            }}
          >
            <Text style={styles.resetButtonText}>RESET</Text>
          </TouchableOpacity>
        </View>

        {/* Outputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OUTPUTS</Text>
          <View style={styles.jackGrid}>
            {outputJacks.map((jackId, index) => renderJack(jackId, index, 'output'))}
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INPUTS</Text>
          <View style={styles.jackGrid}>
            {inputJacks.map((jackId, index) => renderJack(jackId, index, 'input'))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
            <Text style={styles.legendText}>Output Jack</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#0066FF' }]} />
            <Text style={styles.legendText}>Input Jack</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#FFD700', opacity: 0.5 }]} />
            <Text style={styles.legendText}>Normalled (Pre-wired)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  jackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  jackContainer: {
    alignItems: 'center',
    width: 70,
  },
  jack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  jackHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  jackLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#CCCCCC',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  legend: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendLine: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    marginRight: 12,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#CCCCCC',
  },
});

export default PatchBay;
