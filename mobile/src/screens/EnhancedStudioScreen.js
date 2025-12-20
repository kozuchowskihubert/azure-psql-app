/**
 * HAOS.fm Enhanced Studio Screen
 * Advanced synthesis interface with HAOS design system
 * Features: Multiple engines, preset browser, modulation matrix, effects
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { COLORS } from '../styles/HAOSDesignSystem';
import {
  wavetableEngine,
  bassArpEngine,
  modulationMatrix,
  virtualInstruments,
  presetManager,
  initializeAudioEngines,
  getEngineStats,
} from '../AudioEngine';

const { width, height } = Dimensions.get('window');

export default function EnhancedStudioScreen({ navigation }) {
  // Engine selection
  const [activeEngine, setActiveEngine] = useState('bassArp'); // 'bassArp', 'wavetable', 'instruments'
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Preset management
  const [presetCategory, setPresetCategory] = useState('bass');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPresetBrowser, setShowPresetBrowser] = useState(false);
  
  // Modulation
  const [showModulation, setShowModulation] = useState(false);
  const [modulationRoutings, setModulationRoutings] = useState([]);
  
  // Visual feedback
  const [activeNotes, setActiveNotes] = useState([]);
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Initialize engines
  useEffect(() => {
    initEngines();
  }, []);
  
  const initEngines = async () => {
    const success = await initializeAudioEngines();
    setIsInitialized(success);
    
    if (success) {
      // Load default preset
      loadPreset('bass', 'acidBass');
    }
  };
  
  // Load preset
  const loadPreset = (category, presetName) => {
    const preset = presetManager.loadPreset(category, presetName);
    if (preset) {
      setSelectedPreset(preset);
      setPresetCategory(category);
      
      // Apply to active engine
      if (activeEngine === 'bassArp') {
        Object.keys(preset.params).forEach(key => {
          bassArpEngine.setParameter(key, preset.params[key]);
        });
        
        // Apply modulation if present
        if (preset.modulation) {
          // Load modulation routings
        }
      }
    }
  };
  
  // Play note
  const playNote = (note) => {
    let voiceId;
    
    switch (activeEngine) {
      case 'bassArp':
        voiceId = bassArpEngine.playNote(note, 1.0);
        break;
      case 'wavetable':
        voiceId = wavetableEngine.playNote(note, 1.0);
        break;
      case 'instruments':
        voiceId = virtualInstruments.playNote(note, 1.0);
        break;
    }
    
    if (voiceId) {
      setActiveNotes([...activeNotes, { note, id: voiceId }]);
      
      // Trigger animation
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  // Stop note
  const stopNote = (note) => {
    const voice = activeNotes.find(v => v.note === note);
    if (voice) {
      switch (activeEngine) {
        case 'bassArp':
          bassArpEngine.stopNote(voice.id);
          break;
        case 'wavetable':
          wavetableEngine.stopNote(voice.id);
          break;
        case 'instruments':
          virtualInstruments.stopNote(voice.id);
          break;
      }
      
      setActiveNotes(activeNotes.filter(v => v.note !== note));
    }
  };
  
  // Render engine selector
  const renderEngineSelector = () => {
    const engines = [
      { id: 'bassArp', name: 'BASS/ARP', emoji: '🔊', color: COLORS.accentGreen },
      { id: 'wavetable', name: 'WAVETABLE', emoji: '🌊', color: COLORS.accentCyan },
      { id: 'instruments', name: 'INSTRUMENTS', emoji: '🎻', color: COLORS.accentOrange },
    ];
    
    return (
      <View style={styles.engineSelector}>
        {engines.map(engine => (
          <TouchableOpacity
            key={engine.id}
            style={[
              styles.engineButton,
              activeEngine === engine.id && styles.engineButtonActive,
            ]}
            onPress={() => setActiveEngine(engine.id)}
          >
            <Text style={styles.engineEmoji}>{engine.emoji}</Text>
            <Text style={[
              styles.engineName,
              activeEngine === engine.id && { color: engine.color }
            ]}>
              {engine.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render preset browser
  const renderPresetBrowser = () => {
    const categories = presetManager.getCategories();
    const presetsInCategory = presetManager.getPresetsInCategory(presetCategory);
    
    return (
      <Modal
        visible={showPresetBrowser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPresetBrowser(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PRESET BROWSER</Text>
              <TouchableOpacity onPress={() => setShowPresetBrowser(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryTab,
                    presetCategory === cat && styles.categoryTabActive,
                  ]}
                  onPress={() => setPresetCategory(cat)}
                >
                  <Text style={[
                    styles.categoryTabText,
                    presetCategory === cat && styles.categoryTabTextActive,
                  ]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Presets Grid */}
            <ScrollView style={styles.presetsGrid}>
              {Object.keys(presetsInCategory).map(presetName => {
                const preset = presetsInCategory[presetName];
                return (
                  <TouchableOpacity
                    key={presetName}
                    style={[
                      styles.presetCard,
                      selectedPreset?.name === preset.name && styles.presetCardActive,
                    ]}
                    onPress={() => {
                      loadPreset(presetCategory, presetName);
                      setShowPresetBrowser(false);
                    }}
                  >
                    <View style={[styles.presetColorBar, { backgroundColor: preset.color }]} />
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDescription}>{preset.description}</Text>
                      {preset.tags && (
                        <View style={styles.presetTags}>
                          {preset.tags.map(tag => (
                            <View key={tag} style={styles.presetTag}>
                              <Text style={styles.presetTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Render keyboard
  const renderKeyboard = () => {
    const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];
    
    return (
      <View style={styles.keyboard}>
        {notes.map(note => {
          const isActive = activeNotes.some(v => v.note === note);
          const isBlack = note.includes('#');
          
          return (
            <TouchableOpacity
              key={note}
              style={[
                styles.key,
                isBlack && styles.keyBlack,
                isActive && styles.keyActive,
              ]}
              onPressIn={() => playNote(note)}
              onPressOut={() => stopNote(note)}
            >
              <Text style={[
                styles.keyLabel,
                isBlack && styles.keyLabelBlack,
              ]}>
                {note}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  // Render parameter controls
  const renderParameterControls = () => {
    if (!selectedPreset) return null;
    
    const params = selectedPreset.params;
    const paramKeys = Object.keys(params).slice(0, 6); // Show first 6 params
    
    return (
      <View style={styles.parameterSection}>
        <Text style={styles.sectionTitle}>PARAMETERS</Text>
        <View style={styles.parameterGrid}>
          {paramKeys.map(key => (
            <View key={key} style={styles.parameterControl}>
              <Text style={styles.parameterLabel}>{key.toUpperCase()}</Text>
              <Slider
                style={styles.parameterSlider}
                minimumValue={0}
                maximumValue={1}
                value={typeof params[key] === 'number' ? params[key] / 10 : 0.5}
                onValueChange={(value) => {
                  bassArpEngine.setParameter(key, value * 10);
                }}
                minimumTrackTintColor={COLORS.accentGreen}
                maximumTrackTintColor={COLORS.border}
                thumbTintColor={COLORS.accentGreen}
              />
              <Text style={styles.parameterValue}>
                {typeof params[key] === 'number' ? params[key].toFixed(2) : params[key]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Audio Engines...</Text>
      </View>
    );
  }
  
  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.surfaceDark, COLORS.background]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>HAOS STUDIO</Text>
          <Text style={styles.subtitle}>ENHANCED SYNTHESIS</Text>
          {selectedPreset && (
            <View style={[styles.presetBadge, { borderColor: selectedPreset.color }]}>
              <Text style={[styles.presetBadgeText, { color: selectedPreset.color }]}>
                {selectedPreset.name}
              </Text>
            </View>
          )}
        </View>
        
        {/* Engine Selector */}
        {renderEngineSelector()}
        
        {/* Preset/Modulation Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPresetBrowser(true)}
          >
            <Text style={styles.actionButtonText}>🎛️ PRESETS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowModulation(!showModulation)}
          >
            <Text style={styles.actionButtonText}>🔀 MODULATION</Text>
          </TouchableOpacity>
        </View>
        
        {/* Parameter Controls */}
        {renderParameterControls()}
        
        {/* Keyboard */}
        {renderKeyboard()}
        
        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Engine: {activeEngine.toUpperCase()} | Presets: {presetManager.getPresetCount()}
          </Text>
        </View>
        
      </ScrollView>
      
      {/* Preset Browser Modal */}
      {renderPresetBrowser()}
      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.accentGreen,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.accentGreen,
    letterSpacing: 4,
    textShadowColor: COLORS.accentGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.accentOrange,
    letterSpacing: 2,
    marginTop: 5,
  },
  presetBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
  },
  presetBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  engineSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  engineButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  engineButtonActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.surfaceLight,
  },
  engineEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  engineName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
    letterSpacing: 1,
  },
  parameterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accentOrange,
    letterSpacing: 2,
    marginBottom: 12,
  },
  parameterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  parameterControl: {
    width: width / 2 - 30,
    marginBottom: 16,
    marginHorizontal: 5,
  },
  parameterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  parameterSlider: {
    width: '100%',
    height: 40,
  },
  parameterValue: {
    fontSize: 12,
    color: COLORS.accentGreen,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  key: {
    width: (width - 40) / 6,
    height: 60,
    backgroundColor: COLORS.surface,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  keyBlack: {
    backgroundColor: COLORS.surfaceDark,
  },
  keyActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreen,
    transform: [{ scale: 0.95 }],
  },
  keyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  keyLabelBlack: {
    color: COLORS.textSecondary,
  },
  statsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontFamily: 'monospace',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accentGreen,
    letterSpacing: 2,
  },
  modalClose: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  categoryTabs: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 5,
  },
  categoryTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.accentGreen,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  categoryTabTextActive: {
    color: COLORS.accentGreen,
  },
  presetsGrid: {
    flex: 1,
    padding: 20,
  },
  presetCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
  },
  presetCardActive: {
    borderColor: COLORS.accentGreen,
  },
  presetColorBar: {
    width: 6,
  },
  presetInfo: {
    flex: 1,
    padding: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  presetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetTag: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginTop: 4,
  },
  presetTagText: {
    fontSize: 9,
    color: COLORS.accentGreen,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
