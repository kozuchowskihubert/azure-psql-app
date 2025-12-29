/**
 * HAOS.fm Modulation Matrix UI
 * Visual modulation routing interface
 * Features: Drag-and-drop routing, visual connections, amount control
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
import Slider from '@react-native-community/slider';
import { modulationMatrix } from '../../AudioEngine';

// Local color constants to avoid initialization timing issues
const COLORS = {
  accentGreen: '#39FF14',
  accentCyan: '#00D9FF',
  accentPurple: '#A855F7',
  accentOrange: '#FF6B35',
  accentGold: '#FFD700',
  accentRed: '#FF3366',
  surface: '#1a1a1a',
  surfaceLight: '#242424',
  border: '#2a2a2a',
  background: '#0a0a0a',
  textPrimary: '#ffffff',
  textSecondary: '#F4E8D8',
  textTertiary: '#6B6B6B',
};

const { width } = Dimensions.get('window');

export default function ModulationMatrixUI({ onClose }) {
  const [routings, setRoutings] = useState(modulationMatrix.getRoutings());
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  
  // Sources
  const sources = [
    { id: 'lfo1', name: 'LFO 1', color: COLORS.accentGreen },
    { id: 'lfo2', name: 'LFO 2', color: COLORS.accentCyan },
    { id: 'lfo3', name: 'LFO 3', color: COLORS.accentPurple },
    { id: 'lfo4', name: 'LFO 4', color: COLORS.accentOrange },
    { id: 'env1', name: 'Filter Env', color: COLORS.accentGold },
    { id: 'env2', name: 'Amp Env', color: COLORS.accentRed },
    { id: 'velocity', name: 'Velocity', color: '#ffffff' },
    { id: 'modwheel', name: 'Mod Wheel', color: '#888888' },
  ];
  
  // Destinations
  const destinations = [
    { id: 'osc1Pitch', name: 'Osc 1 Pitch', category: 'Oscillator' },
    { id: 'osc2Pitch', name: 'Osc 2 Pitch', category: 'Oscillator' },
    { id: 'osc1Level', name: 'Osc 1 Level', category: 'Oscillator' },
    { id: 'osc2Level', name: 'Osc 2 Level', category: 'Oscillator' },
    { id: 'filterCutoff', name: 'Filter Cutoff', category: 'Filter' },
    { id: 'filterResonance', name: 'Filter Res', category: 'Filter' },
    { id: 'ampLevel', name: 'Amp Level', category: 'Amp' },
    { id: 'pan', name: 'Pan', category: 'Amp' },
    { id: 'fxSend1', name: 'FX Send 1', category: 'Effects' },
    { id: 'fxSend2', name: 'FX Send 2', category: 'Effects' },
  ];
  
  // Add routing
  const addRouting = () => {
    if (selectedSource && selectedDestination) {
      modulationMatrix.addRouting(selectedSource, selectedDestination, 0.5);
      setRoutings(modulationMatrix.getRoutings());
      setSelectedSource(null);
      setSelectedDestination(null);
    }
  };
  
  // Remove routing
  const removeRouting = (routingId) => {
    modulationMatrix.removeRouting(routingId);
    setRoutings(modulationMatrix.getRoutings());
  };
  
  // Update routing amount
  const updateAmount = (routingId, amount) => {
    modulationMatrix.updateRouting(routingId, amount);
    setRoutings(modulationMatrix.getRoutings());
  };
  
  // Toggle routing
  const toggleRouting = (routingId) => {
    const routing = routings.find(r => r.id === routingId);
    if (routing) {
      modulationMatrix.toggleRouting(routingId, !routing.enabled);
      setRoutings(modulationMatrix.getRoutings());
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MODULATION MATRIX</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        
        {/* Source Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOURCE</Text>
          <View style={styles.buttonGrid}>
            {sources.map(source => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceButton,
                  selectedSource === source.id && {
                    borderColor: source.color,
                    backgroundColor: `${source.color}20`,
                  },
                ]}
                onPress={() => setSelectedSource(source.id)}
              >
                <Text style={[
                  styles.buttonText,
                  selectedSource === source.id && { color: source.color },
                ]}>
                  {source.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Destination Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DESTINATION</Text>
          <View style={styles.buttonGrid}>
            {destinations.map(dest => (
              <TouchableOpacity
                key={dest.id}
                style={[
                  styles.destButton,
                  selectedDestination === dest.id && {
                    borderColor: COLORS.accentOrange,
                    backgroundColor: `${COLORS.accentOrange}20`,
                  },
                ]}
                onPress={() => setSelectedDestination(dest.id)}
              >
                <Text style={[
                  styles.buttonText,
                  selectedDestination === dest.id && { color: COLORS.accentOrange },
                ]}>
                  {dest.name}
                </Text>
                <Text style={styles.categoryLabel}>{dest.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Add Routing Button */}
        {selectedSource && selectedDestination && (
          <TouchableOpacity style={styles.addButton} onPress={addRouting}>
            <Text style={styles.addButtonText}>
              ➕ ADD ROUTING: {selectedSource} → {selectedDestination}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Active Routings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ACTIVE ROUTINGS ({routings.length})
          </Text>
          
          {routings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No routings configured</Text>
              <Text style={styles.emptyHint}>
                Select a source and destination above to create a routing
              </Text>
            </View>
          ) : (
            routings.map(routing => (
              <View
                key={routing.id}
                style={[
                  styles.routingCard,
                  !routing.enabled && styles.routingCardDisabled,
                ]}
              >
                <View style={styles.routingHeader}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => toggleRouting(routing.id)}
                  >
                    <Text style={styles.toggleIcon}>
                      {routing.enabled ? '✓' : '○'}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.routingLabel}>
                    {routing.source} → {routing.destination}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeRouting(routing.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.amountControl}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Slider
                    style={styles.amountSlider}
                    minimumValue={-1}
                    maximumValue={1}
                    value={routing.amount}
                    onValueChange={(value) => updateAmount(routing.id, value)}
                    minimumTrackTintColor={COLORS.accentGreen}
                    maximumTrackTintColor={COLORS.border}
                    thumbTintColor={COLORS.accentGreen}
                  />
                  <Text style={styles.amountValue}>
                    {(routing.amount * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* LFO Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LFO SETTINGS</Text>
          <Text style={styles.comingSoon}>
            LFO rate/waveform controls coming soon...
          </Text>
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accentGreen,
    letterSpacing: 2,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentOrange,
    letterSpacing: 2,
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  sourceButton: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
    margin: 5,
    alignItems: 'center',
  },
  destButton: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
    margin: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  categoryLabel: {
    fontSize: 9,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.background,
    letterSpacing: 1,
  },
  routingCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routingCardDisabled: {
    opacity: 0.5,
  },
  routingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleIcon: {
    fontSize: 16,
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  routingLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  amountControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    width: 60,
  },
  amountSlider: {
    flex: 1,
    height: 40,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    width: 50,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
