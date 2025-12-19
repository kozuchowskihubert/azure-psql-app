/**
 * Example: Adding EffectsController to TechnoWorkspace
 * 
 * This example shows how to integrate the EffectsController
 * into the TechnoWorkspace screen as a modal or side panel.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import EffectsController from '../components/EffectsController';
import { COLORS, SPACING } from '../styles/HAOSDesignSystem';

// Option 1: Modal Overlay
const TechnoWorkspaceWithEffectsModal = () => {
  const [showEffects, setShowEffects] = useState(false);

  return (
    <View style={styles.container}>
      {/* Your existing TechnoWorkspace content */}
      
      {/* Effects Toggle Button */}
      <TouchableOpacity
        style={styles.effectsButton}
        onPress={() => setShowEffects(true)}
      >
        <Text style={styles.buttonText}>🎛️ FX</Text>
      </TouchableOpacity>

      {/* Effects Modal */}
      <Modal
        visible={showEffects}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEffects(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Effects Rack</Text>
            <TouchableOpacity onPress={() => setShowEffects(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <EffectsController />
        </View>
      </Modal>
    </View>
  );
};

// Option 2: Side Panel (for tablets/larger screens)
const TechnoWorkspaceWithEffectsPanel = () => {
  const [showEffects, setShowEffects] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* Your existing TechnoWorkspace content */}
        
        <TouchableOpacity
          style={styles.effectsToggle}
          onPress={() => setShowEffects(!showEffects)}
        >
          <Text style={styles.toggleText}>
            {showEffects ? '◀ Hide FX' : 'Show FX ▶'}
          </Text>
        </TouchableOpacity>
      </View>

      {showEffects && (
        <View style={styles.sidePanel}>
          <EffectsController />
        </View>
      )}
    </View>
  );
};

// Option 3: Tab Navigation
const TechnoWorkspaceWithTabs = () => {
  const [activeTab, setActiveTab] = useState('sequencer');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sequencer' && styles.tabActive]}
          onPress={() => setActiveTab('sequencer')}
        >
          <Text style={styles.tabText}>🎹 Sequencer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'effects' && styles.tabActive]}
          onPress={() => setActiveTab('effects')}
        >
          <Text style={styles.tabText}>🎛️ Effects</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'sequencer' ? (
          <View>{/* Your sequencer content */}</View>
        ) : (
          <EffectsController />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Modal styles
  effectsButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    zIndex: 1000,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },

  // Side panel styles
  mainContent: {
    flex: 1,
  },
  sidePanel: {
    width: 350,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  effectsToggle: {
    position: 'absolute',
    right: 0,
    top: '50%',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: COLORS.border,
  },
  toggleText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Tab styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

// Quick programmatic control example
export const programmaticEffectsExample = () => {
  // Import bridge at the top of your file
  // import bridge from '../audio/WebAudioBridge';

  // Set master effects
  bridge.updateEffectsParams({
    distortionAmount: 30,
    reverbMix: 0.4,
    delayTime: 0.5,
    delayFeedback: 0.6,
    delayMix: 0.3,
    masterFilterCutoff: 5000,
    compressionThreshold: -18,
    compressionRatio: 6,
  });

  // Set individual track sends
  bridge.setTrackSend('kick', 'reverbSend', 0.1);
  bridge.setTrackSend('snare', 'reverbSend', 0.5);
  bridge.setTrackSend('hihat', 'delaySend', 0.3);

  // Set track volumes
  bridge.setTrackParam('kick', 'volume', 1.2);
  bridge.setTrackParam('bass', 'volume', 0.8);

  // Set track filter cutoff
  bridge.setTrackParam('snare', 'filterCutoff', 4000);
};

export default {
  TechnoWorkspaceWithEffectsModal,
  TechnoWorkspaceWithEffectsPanel,
  TechnoWorkspaceWithTabs,
  programmaticEffectsExample,
};
