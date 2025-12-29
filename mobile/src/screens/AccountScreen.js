import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState(null);
  const [theme, setTheme] = useState('dark'); // dark, light, auto

  const handleLogout = async () => {
    await logout();
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      // TODO: Upload to backend/cloud storage
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      // TODO: Upload to backend/cloud storage
    }
  };

  const showAvatarOptions = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Mock stats - replace with real data from backend
  const stats = {
    tracksCreated: 47,
    hoursListened: 127,
    favoriteGenre: 'Hip-Hop',
    streak: 12, // days
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={showAvatarOptions} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.display_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#0a0a0a" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.name}>{user?.display_name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {user?.subscription_tier && (
            <View style={[
              styles.badge,
              user.subscription_tier === 'premium' && styles.badgePremium,
              user.subscription_tier === 'pro' && styles.badgePro
            ]}>
              <Ionicons 
                name={user.subscription_tier === 'free' ? 'musical-note' : 'star'} 
                size={12} 
                color="#0a0a0a" 
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>
                {user.subscription_tier.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.tracksCreated}</Text>
            <Text style={styles.statLabel}>Tracks Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.hoursListened}</Text>
            <Text style={styles.statLabel}>Hours Listened</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.favoriteGenre}</Text>
            <Text style={styles.statLabel}>Top Genre</Text>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="diamond" size={18} color="#00ff94" /> Subscription
          </Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {user?.subscription_tier === 'free' ? 'Free Plan' : `${user?.subscription_tier?.toUpperCase()} Plan`}
              </Text>
              {user?.subscription_tier !== 'free' && (
                <Text style={styles.cardSubtitle}>Active</Text>
              )}
            </View>
            
            {user?.subscription_tier === 'free' ? (
              <>
                <Text style={styles.cardDescription}>
                  Upgrade to unlock premium features, unlimited tracks, and high-quality audio.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate('Premium')}
                >
                  <LinearGradient
                    colors={['#00ff94', '#00cc75']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.upgradeGradient}
                  >
                    <Ionicons name="arrow-up-circle" size={20} color="#0a0a0a" />
                    <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#00ff94" />
                    <Text style={styles.featureText}>Unlimited track creation</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#00ff94" />
                    <Text style={styles.featureText}>High-quality audio (320kbps)</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#00ff94" />
                    <Text style={styles.featureText}>Offline downloads</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#00ff94" />
                    <Text style={styles.featureText}>Priority support</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => Alert.alert('Manage Subscription', 'Coming soon!')}
                >
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                  <Ionicons name="arrow-forward" size={16} color="#00ff94" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Audio Quality Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="musical-notes" size={18} color="#00ff94" /> Audio Quality
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="volume-high" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Streaming Quality</Text>
            </View>
            <Text style={styles.menuValue}>High (256kbps)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="download" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Download Quality</Text>
            </View>
            <Text style={styles.menuValue}>
              {user?.subscription_tier === 'free' ? 'Standard' : 'Maximum'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="color-palette" size={18} color="#00ff94" /> Appearance
          </Text>
          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons name="moon" size={24} color={theme === 'dark' ? '#00ff94' : '#666'} />
              <Text style={[styles.themeText, theme === 'dark' && styles.themeTextActive]}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'light' && styles.themeOptionActive]}
              onPress={() => setTheme('light')}
            >
              <Ionicons name="sunny" size={24} color={theme === 'light' ? '#00ff94' : '#666'} />
              <Text style={[styles.themeText, theme === 'light' && styles.themeTextActive]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'auto' && styles.themeOptionActive]}
              onPress={() => setTheme('auto')}
            >
              <Ionicons name="phone-portrait" size={24} color={theme === 'auto' ? '#00ff94' : '#666'} />
              <Text style={[styles.themeText, theme === 'auto' && styles.themeTextActive]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="settings" size={18} color="#00ff94" /> Settings
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="language" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Language</Text>
            </View>
            <Text style={styles.menuValue}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="document-text" size={20} color="#00ff94" />
              <Text style={styles.menuText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle" size={20} color="#00ff94" />
              <Text style={styles.menuText}>About</Text>
            </View>
            <Text style={styles.menuValue}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>HAOS.fm © 2025</Text>
          <Text style={styles.footerSubtext}>Made with 🎵 in the cloud</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00ff94',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00ff94',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#00ff94',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  badgePremium: {
    backgroundColor: '#FFD700',
  },
  badgePro: {
    backgroundColor: '#9966FF',
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#00ff94',
    backgroundColor: '#00ff9420',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
  },
  upgradeGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeButtonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featureList: {
    marginTop: 8,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00ff94',
    borderRadius: 8,
    gap: 8,
  },
  manageButtonText: {
    color: '#00ff94',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  menuValue: {
    color: '#888',
    fontSize: 14,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    gap: 8,
  },
  themeOptionActive: {
    borderColor: '#00ff94',
    backgroundColor: '#00ff9410',
  },
  themeText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  themeTextActive: {
    color: '#00ff94',
  },
  logoutButton: {
    margin: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff4444',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSubtext: {
    color: '#444',
    fontSize: 10,
    marginTop: 4,
  },
});
