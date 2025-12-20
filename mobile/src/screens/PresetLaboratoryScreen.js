/**
 * HAOS.fm Preset Laboratory
 * Advanced preset morphing and management interface
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { presetManager } from '../AudioEngine';
import { AnimatedKnob } from '../UI/Components';

const { width, height } = Dimensions.get('window');

const HAOS_COLORS = {
  green: '#00ff94',
  orange: '#FF6B35',
  cyan: '#00D9FF',
  purple: '#6A0DAD',
  gold: '#FFD700',
  pink: '#FF1493',
  dark: '#0a0a0a',
  darkGray: '#1a1a1a',
  mediumGray: '#2a2a2a',
};

const PresetLaboratoryScreen = ({ navigation }) => {
  // State management
  const [presetA, setPresetA] = useState(null);
  const [presetB, setPresetB] = useState(null);
  const [morphAmount, setMorphAmount] = useState(0.5);
  const [presets, setPresets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    initializeLab();
  }, []);
  
  useEffect(() => {
    animateMorph();
  }, [morphAmount]);
  
  const initializeLab = async () => {
    await presetManager.initialize();
    loadPresets();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  
  const loadPresets = async () => {
    const allPresets = await presetManager.getAllPresets();
    setPresets(allPresets);
    
    // Set default presets
    if (allPresets.length >= 2) {
      setPresetA(allPresets[0]);
      setPresetB(allPresets[1]);
    }
  };
  
  const animateMorph = () => {
    Animated.spring(morphAnim, {
      toValue: morphAmount,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };
  
  const selectPresetA = (preset) => {
    setPresetA(preset);
    presetManager.setPresetA(preset.id);
    applyMorph();
  };
  
  const selectPresetB = (preset) => {
    setPresetB(preset);
    presetManager.setPresetB(preset.id);
    applyMorph();
  };
  
  const applyMorph = () => {
    if (presetA && presetB) {
      presetManager.morphPresets(morphAmount);
    }
  };
  
  const updateMorphAmount = (amount) => {
    setMorphAmount(amount);
    if (presetA && presetB) {
      presetManager.morphPresets(amount);
    }
  };
  
  const saveCurrentPreset = async () => {
    if (!newPresetName.trim()) return;
    
    const currentParams = presetManager.getCurrentParameters();
    await presetManager.savePreset({
      name: newPresetName,
      parameters: currentParams,
      tags: selectedTags,
      category: selectedCategory === 'all' ? 'custom' : selectedCategory,
    });
    
    await loadPresets();
    setShowSaveDialog(false);
    setNewPresetName('');
  };
  
  const deletePreset = async (presetId) => {
    await presetManager.deletePreset(presetId);
    await loadPresets();
  };
  
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => preset.tags?.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });
  
  const categories = [
    { id: 'all', label: 'ALL', icon: '📚', color: HAOS_COLORS.green },
    { id: 'bass', label: 'BASS', icon: '🔊', color: HAOS_COLORS.orange },
    { id: 'lead', label: 'LEAD', icon: '🎸', color: HAOS_COLORS.cyan },
    { id: 'pad', label: 'PAD', icon: '🌊', color: HAOS_COLORS.purple },
    { id: 'fx', label: 'FX', icon: '✨', color: HAOS_COLORS.gold },
    { id: 'custom', label: 'CUSTOM', icon: '⭐', color: HAOS_COLORS.pink },
  ];
  
  const tags = [
    { id: 'warm', label: 'WARM', color: HAOS_COLORS.orange },
    { id: 'bright', label: 'BRIGHT', color: HAOS_COLORS.cyan },
    { id: 'dark', label: 'DARK', color: HAOS_COLORS.purple },
    { id: 'aggressive', label: 'AGGRESSIVE', color: HAOS_COLORS.orange },
    { id: 'smooth', label: 'SMOOTH', color: HAOS_COLORS.green },
    { id: 'rhythmic', label: 'RHYTHMIC', color: HAOS_COLORS.pink },
    { id: 'atmospheric', label: 'ATMOSPHERIC', color: HAOS_COLORS.cyan },
    { id: 'punchy', label: 'PUNCHY', color: HAOS_COLORS.gold },
  ];
  
  return (
    <LinearGradient
      colors={[HAOS_COLORS.dark, '#220022', HAOS_COLORS.dark]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PRESET LABORATORY</Text>
          <Text style={styles.subtitle}>MORPH & MANAGE</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Morph Interface */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔀 PRESET MORPHING</Text>
            
            {/* Preset A & B Display */}
            <View style={styles.morphContainer}>
              <TouchableOpacity style={styles.presetSlot} disabled>
                <LinearGradient
                  colors={[HAOS_COLORS.cyan, HAOS_COLORS.cyan + '80']}
                  style={styles.presetSlotGradient}
                >
                  <Text style={styles.presetSlotLabel}>PRESET A</Text>
                  <Text style={styles.presetSlotName}>
                    {presetA?.name || 'Select Preset'}
                  </Text>
                  {presetA && (
                    <Text style={styles.presetSlotCategory}>
                      {presetA.category?.toUpperCase()}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <Animated.View
                style={[
                  styles.morphIndicator,
                  {
                    transform: [
                      {
                        translateX: morphAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 50],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.morphIndicatorText}>⬌</Text>
              </Animated.View>
              
              <TouchableOpacity style={styles.presetSlot} disabled>
                <LinearGradient
                  colors={[HAOS_COLORS.pink, HAOS_COLORS.pink + '80']}
                  style={styles.presetSlotGradient}
                >
                  <Text style={styles.presetSlotLabel}>PRESET B</Text>
                  <Text style={styles.presetSlotName}>
                    {presetB?.name || 'Select Preset'}
                  </Text>
                  {presetB && (
                    <Text style={styles.presetSlotCategory}>
                      {presetB.category?.toUpperCase()}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Morph Amount Control */}
            <View style={styles.morphControl}>
              <AnimatedKnob
                label="MORPH AMOUNT"
                value={morphAmount}
                min={0}
                max={1}
                onChange={updateMorphAmount}
                color={HAOS_COLORS.pink}
                size={120}
              />
            </View>
            
            {/* Morph Slider Visual */}
            <View style={styles.morphSlider}>
              <View style={styles.morphTrack}>
                <View
                  style={[
                    styles.morphFillA,
                    { width: `${(1 - morphAmount) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.morphFillB,
                    { width: `${morphAmount * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.morphLabels}>
                <Text style={styles.morphLabelA}>A: {((1 - morphAmount) * 100).toFixed(0)}%</Text>
                <Text style={styles.morphLabelB}>B: {(morphAmount * 100).toFixed(0)}%</Text>
              </View>
            </View>
          </View>
          
          {/* Save Current */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowSaveDialog(!showSaveDialog)}
            >
              <LinearGradient
                colors={[HAOS_COLORS.green, HAOS_COLORS.green + '80']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  💾 SAVE CURRENT SOUND
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {showSaveDialog && (
              <View style={styles.saveDialog}>
                <LinearGradient
                  colors={[HAOS_COLORS.darkGray, HAOS_COLORS.mediumGray]}
                  style={styles.saveDialogGradient}
                >
                  <Text style={styles.saveDialogTitle}>SAVE PRESET</Text>
                  <TextInput
                    style={styles.saveInput}
                    placeholder="Preset Name"
                    placeholderTextColor={HAOS_COLORS.cyan + '60'}
                    value={newPresetName}
                    onChangeText={setNewPresetName}
                  />
                  <View style={styles.saveDialogButtons}>
                    <TouchableOpacity
                      style={styles.saveDialogButton}
                      onPress={() => setShowSaveDialog(false)}
                    >
                      <Text style={styles.saveDialogButtonText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveDialogButton, styles.saveDialogButtonPrimary]}
                      onPress={saveCurrentPreset}
                    >
                      <Text style={[styles.saveDialogButtonText, { color: HAOS_COLORS.dark }]}>
                        SAVE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
          
          {/* Search & Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 BROWSE PRESETS</Text>
            
            {/* Search Bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search presets..."
              placeholderTextColor={HAOS_COLORS.pink + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <LinearGradient
                    colors={
                      selectedCategory === category.id
                        ? [category.color, category.color + '80']
                        : [HAOS_COLORS.mediumGray, HAOS_COLORS.darkGray]
                    }
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.id && { color: HAOS_COLORS.dark },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Tag Filter */}
            <View style={styles.tagContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag.id) && styles.tagButtonActive,
                  ]}
                  onPress={() => toggleTag(tag.id)}
                >
                  <Text
                    style={[
                      styles.tagLabel,
                      selectedTags.includes(tag.id) && { color: HAOS_COLORS.dark },
                      selectedTags.includes(tag.id) && { backgroundColor: tag.color },
                    ]}
                  >
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Preset List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📋 PRESETS ({filteredPresets.length})
            </Text>
            
            {filteredPresets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No presets found</Text>
                <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
              </View>
            ) : (
              <View style={styles.presetGrid}>
                {filteredPresets.map((preset, index) => (
                  <View key={preset.id || index} style={styles.presetCard}>
                    <LinearGradient
                      colors={[HAOS_COLORS.darkGray, HAOS_COLORS.mediumGray]}
                      style={styles.presetGradient}
                    >
                      <View style={styles.presetHeader}>
                        <Text style={styles.presetName}>{preset.name}</Text>
                        <View style={styles.presetActions}>
                          <TouchableOpacity
                            style={styles.presetActionButton}
                            onPress={() => selectPresetA(preset)}
                          >
                            <Text style={styles.presetActionText}>A</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.presetActionButton, { backgroundColor: HAOS_COLORS.pink }]}
                            onPress={() => selectPresetB(preset)}
                          >
                            <Text style={styles.presetActionText}>B</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.presetActionButton, { backgroundColor: HAOS_COLORS.orange }]}
                            onPress={() => deletePreset(preset.id)}
                          >
                            <Text style={styles.presetActionText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.presetMeta}>
                        <Text style={styles.presetCategory}>
                          {preset.category?.toUpperCase() || 'CUSTOM'}
                        </Text>
                        {preset.tags && preset.tags.length > 0 && (
                          <View style={styles.presetTags}>
                            {preset.tags.slice(0, 2).map((tag) => (
                              <Text key={tag} style={styles.presetTag}>
                                {tag}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: HAOS_COLORS.pink,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HAOS_COLORS.pink,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: HAOS_COLORS.cyan,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HAOS_COLORS.pink,
    marginBottom: 15,
    letterSpacing: 1,
  },
  morphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  presetSlot: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  presetSlotGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  presetSlotLabel: {
    color: HAOS_COLORS.dark,
    fontSize: 11,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  presetSlotName: {
    color: HAOS_COLORS.dark,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  presetSlotCategory: {
    color: HAOS_COLORS.dark,
    fontSize: 10,
    opacity: 0.7,
    marginTop: 4,
  },
  morphIndicator: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  morphIndicatorText: {
    fontSize: 24,
    color: HAOS_COLORS.pink,
  },
  morphControl: {
    alignItems: 'center',
    marginVertical: 20,
  },
  morphSlider: {
    marginTop: 15,
  },
  morphTrack: {
    height: 20,
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: HAOS_COLORS.pink + '40',
  },
  morphFillA: {
    backgroundColor: HAOS_COLORS.cyan,
  },
  morphFillB: {
    backgroundColor: HAOS_COLORS.pink,
  },
  morphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  morphLabelA: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
    fontWeight: 'bold',
  },
  morphLabelB: {
    color: HAOS_COLORS.pink,
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: HAOS_COLORS.dark,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  saveDialog: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveDialogGradient: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.green + '40',
  },
  saveDialogTitle: {
    color: HAOS_COLORS.green,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  saveInput: {
    backgroundColor: HAOS_COLORS.dark,
    color: HAOS_COLORS.green,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: HAOS_COLORS.green + '40',
  },
  saveDialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveDialogButton: {
    flex: 1,
    backgroundColor: HAOS_COLORS.mediumGray,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  saveDialogButtonPrimary: {
    backgroundColor: HAOS_COLORS.green,
  },
  saveDialogButtonText: {
    color: HAOS_COLORS.green,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: HAOS_COLORS.mediumGray,
    color: HAOS_COLORS.pink,
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: HAOS_COLORS.pink + '40',
  },
  categoryScroll: {
    marginBottom: 15,
  },
  categoryButton: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryButtonActive: {
    elevation: 3,
  },
  categoryGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    color: HAOS_COLORS.pink,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonActive: {
    // Styling handled in tagLabel
  },
  tagLabel: {
    color: HAOS_COLORS.pink,
    fontSize: 11,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: HAOS_COLORS.mediumGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    color: HAOS_COLORS.pink,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    color: HAOS_COLORS.cyan,
    fontSize: 12,
    marginTop: 8,
  },
  presetGrid: {
    // Single column layout
  },
  presetCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  presetGradient: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HAOS_COLORS.pink + '40',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  presetName: {
    color: HAOS_COLORS.pink,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  presetActions: {
    flexDirection: 'row',
  },
  presetActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HAOS_COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  presetActionText: {
    color: HAOS_COLORS.dark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  presetMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetCategory: {
    color: HAOS_COLORS.cyan,
    fontSize: 11,
    fontWeight: 'bold',
  },
  presetTags: {
    flexDirection: 'row',
  },
  presetTag: {
    color: HAOS_COLORS.green,
    fontSize: 10,
    backgroundColor: HAOS_COLORS.dark,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 5,
  },
});

export default PresetLaboratoryScreen;
