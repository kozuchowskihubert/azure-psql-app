/**
 * Preset Card Component
 * Displays preset info with download/delete actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const PresetCard = ({
  preset,
  isDownloaded = false,
  onDownload,
  onDelete,
  onLoad,
  onPress,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    try {
      if (onDownload) {
        await onDownload(preset.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download preset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(preset.id);
            }
          },
        },
      ]
    );
  };

  const handleLoad = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onLoad) {
      onLoad(preset);
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(preset);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {preset.name}
          </Text>
          {preset.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐</Text>
            </View>
          )}
        </View>
        
        {/* Download/Delete Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={isDownloaded ? handleDelete : handleDownload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#00ff94" />
          ) : (
            <Text style={styles.actionIcon}>
              {isDownloaded ? '🗑️' : '⬇️'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.category}>{preset.category || 'Synth'}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.workspace}>{preset.workspace || 'TECHNO'}</Text>
        {preset.author && (
          <>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.author} numberOfLines={1}>
              {preset.author}
            </Text>
          </>
        )}
      </View>

      {/* Description */}
      {preset.description && (
        <Text style={styles.description} numberOfLines={2}>
          {preset.description}
        </Text>
      )}

      {/* Tags */}
      {preset.tags && preset.tags.length > 0 && (
        <View style={styles.tags}>
          {preset.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      {isDownloaded && (
        <TouchableOpacity style={styles.loadButton} onPress={handleLoad}>
          <Text style={styles.loadButtonText}>Load Preset</Text>
        </TouchableOpacity>
      )}

      {/* Downloaded indicator */}
      {isDownloaded && (
        <View style={styles.downloadedBadge}>
          <Text style={styles.downloadedText}>Downloaded</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  featuredBadge: {
    marginLeft: 8,
  },
  featuredText: {
    fontSize: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 20,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    color: '#00ff94',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  separator: {
    color: '#666',
    marginHorizontal: 6,
  },
  workspace: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  author: {
    color: '#666',
    fontSize: 12,
    flex: 1,
  },
  description: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: {
    color: '#666',
    fontSize: 11,
  },
  loadButton: {
    backgroundColor: '#00ff94',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  loadButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  downloadedBadge: {
    position: 'absolute',
    top: 12,
    right: 60,
    backgroundColor: '#00ff94',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  downloadedText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PresetCard;
