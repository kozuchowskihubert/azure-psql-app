import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import presetService from '../services/presetService';
import PresetCard from '../components/PresetCard';
import { useAuth } from '../context/AuthContext';

export default function PresetsScreen({ navigation }) {
  const { user } = useAuth();
  const [presets, setPresets] = useState([]);
  const [downloadedPresets, setDownloadedPresets] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'downloaded'

  const categories = ['all', 'bass', 'lead', 'pad', 'fx', 'drum'];
  const workspaces = ['all', 'TECHNO', 'MODULAR', 'BUILDER'];

  useEffect(() => {
    loadPresets();
    loadDownloadedPresets();
  }, [selectedCategory, selectedWorkspace, activeTab]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'downloaded') {
        const downloaded = await presetService.getDownloadedPresets();
        setPresets(Object.values(downloaded));
      } else {
        const filters = {};
        if (selectedCategory !== 'all') filters.category = selectedCategory;
        if (selectedWorkspace !== 'all') filters.workspace = selectedWorkspace;
        if (searchQuery) filters.search = searchQuery;
        
        const data = await presetService.fetchPresets(filters);
        setPresets(data.presets || data || []);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
      Alert.alert('Error', 'Failed to load presets. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const loadDownloadedPresets = async () => {
    const downloaded = await presetService.getDownloadedPresets();
    setDownloadedPresets(downloaded);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await presetService.clearCache();
    await loadPresets();
    await loadDownloadedPresets();
    setRefreshing(false);
  };

  const handleDownload = async (presetId) => {
    try {
      // Check subscription limits
      const downloadedCount = Object.keys(downloadedPresets).length;
      const dailyLimit = user?.subscription_tier === 'free' ? 5 : Infinity;
      
      if (downloadedCount >= dailyLimit && dailyLimit !== Infinity) {
        Alert.alert(
          'Download Limit Reached',
          'Upgrade to Premium for unlimited downloads!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go Premium', onPress: () => navigation.navigate('Premium') },
          ]
        );
        return;
      }

      await presetService.downloadPreset(presetId);
      await presetService.trackDownload(presetId);
      await loadDownloadedPresets();
      
      Alert.alert('Success', 'Preset downloaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download preset');
    }
  };

  const handleDelete = async (presetId) => {
    const success = await presetService.deleteDownloadedPreset(presetId);
    if (success) {
      await loadDownloadedPresets();
      if (activeTab === 'downloaded') {
        await loadPresets();
      }
    }
  };

  const handleLoad = (preset) => {
    Alert.alert(
      'Load Preset',
      `Load "${preset.name}" into which workspace?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'TECHNO', onPress: () => loadIntoWorkspace(preset, 'TechnoWorkspace') },
        { text: 'MODULAR', onPress: () => loadIntoWorkspace(preset, 'ModularWorkspace') },
        { text: 'BUILDER', onPress: () => loadIntoWorkspace(preset, 'BuilderWorkspace') },
      ]
    );
  };

  const loadIntoWorkspace = (preset, workspace) => {
    navigation.navigate(workspace, { preset });
  };

  const handleSearch = () => {
    loadPresets();
  };

  const filteredPresets = presets;

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={styles.container}>
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search presets..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All Presets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'downloaded' && styles.tabActive]}
            onPress={() => setActiveTab('downloaded')}
          >
            <Text style={[styles.tabText, activeTab === 'downloaded' && styles.tabTextActive]}>
              Downloaded ({Object.keys(downloadedPresets).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {activeTab === 'all' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.filterTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Workspace Filter */}
        {activeTab === 'all' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {workspaces.map((workspace) => (
              <TouchableOpacity
                key={workspace}
                style={[
                  styles.filterButton,
                  selectedWorkspace === workspace && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedWorkspace(workspace)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedWorkspace === workspace && styles.filterTextActive,
                  ]}
                >
                  {workspace}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Presets List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00ff94"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff94" />
            <Text style={styles.loadingText}>Loading presets...</Text>
          </View>
        ) : filteredPresets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'downloaded' 
                ? 'No downloaded presets yet'
                : 'No presets found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'downloaded'
                ? 'Browse the library to download presets'
                : 'Try different filters or search terms'}
            </Text>
          </View>
        ) : (
          filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isDownloaded={!!downloadedPresets[preset.id]}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onLoad={handleLoad}
              onPress={() => console.log('Preset details:', preset)}
            />
          ))
        )}

        {/* Storage Info */}
        {activeTab === 'downloaded' && Object.keys(downloadedPresets).length > 0 && (
          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              {Object.keys(downloadedPresets).length} presets downloaded
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear All Downloads',
                  'Are you sure you want to delete all downloaded presets?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear All',
                      style: 'destructive',
                      onPress: async () => {
                        await presetService.clearAllDownloads();
                        await loadDownloadedPresets();
                        await loadPresets();
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#00ff94',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  tabActive: {
    backgroundColor: '#00ff94',
    borderColor: '#00ff94',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0a0a0a',
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#00ff94',
    borderColor: '#00ff94',
  },
  filterText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  storageText: {
    color: '#999',
    fontSize: 14,
  },
  clearButton: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
