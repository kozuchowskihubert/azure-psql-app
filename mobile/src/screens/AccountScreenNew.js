import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

const COLORS = {
  primary: '#FF6B35',
  secondary: '#808080',
  background: '#050508',
  cardBg: 'rgba(20, 20, 25, 0.85)',
  border: 'rgba(255, 107, 53, 0.3)',
  text: '#F4E8D8',
  textSecondary: '#808080',
  green: '#00ff94',
  cyan: '#00D9FF',
  purple: '#B24BF3',
  gold: '#FFD700',
};

export default function AccountScreenNew({ navigation }) {
  const { user, logout } = useAuth();
  
  // Settings state
  const [audioSettings, setAudioSettings] = useState({
    highQuality: true,
    lowLatency: false,
    backgroundAudio: true,
  });
  
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: true,
  });

  const handleLogout = async () => {
    await logout();
  };

  // Get persona info
  const getPersonaInfo = () => {
    const persona = user?.persona?.toUpperCase() || 'ADVENTURER';
    const icons = {
      MUSICIAN: '🎸',
      PRODUCER: '🎛️',
      ADVENTURER: '🚀',
    };
    const colors = {
      MUSICIAN: '#00D9FF',
      PRODUCER: '#B24BF3',
      ADVENTURER: '#D4AF37',
    };
    return {
      name: persona,
      icon: icons[persona] || '🚀',
      color: colors[persona] || '#D4AF37',
    };
  };

  const persona = getPersonaInfo();

  // Mock statistics
  const stats = {
    projects: 12,
    recordings: 34,
    presets: 48,
    hours: 127,
  };

  return (
    <View style={styles.container}>
      <CircuitBoardBackground density="low" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>HAOS.fm</Text>
          <Text style={styles.subtitle}>ACCOUNT & SETTINGS</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: persona.color }]}>
                  <Text style={styles.avatarText}>
                    {user?.display_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={[styles.personaBadge, { backgroundColor: persona.color }]}>
                  <Text style={styles.personaIcon}>{persona.icon}</Text>
                </View>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.display_name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@haos.fm'}</Text>
                <View style={[styles.personaTag, { borderColor: persona.color }]}>
                  <Text style={[styles.personaTagText, { color: persona.color }]}>
                    {persona.name}
                  </Text>
                </View>
              </View>
            </View>

            {/* Change Persona Button */}
            <TouchableOpacity 
              style={styles.changePersonaButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.changePersonaText}>🔄 Change Persona</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 YOUR STATS</Text>
          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.projects}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.recordings}</Text>
                <Text style={styles.statLabel}>Recordings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.presets}</Text>
                <Text style={styles.statLabel}>Presets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.hours}h</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💎 SUBSCRIPTION</Text>
          <View style={styles.card}>
            <View style={styles.subscriptionHeader}>
              <View>
                <Text style={styles.subscriptionTitle}>
                  {user?.subscription_tier === 'free' ? 'FREE PLAN' : `${user?.subscription_tier?.toUpperCase()} PLAN`}
                </Text>
                <Text style={styles.subscriptionSubtitle}>
                  {user?.subscription_tier === 'free' 
                    ? 'Limited features & storage' 
                    : 'All features unlocked'}
                </Text>
              </View>
              {user?.subscription_tier !== 'free' && (
                <View style={[styles.statusBadge, { backgroundColor: '#00ff94' }]}>
                  <Text style={styles.statusBadgeText}>ACTIVE</Text>
                </View>
              )}
            </View>

            {user?.subscription_tier === 'free' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Premium')}
              >
                <Text style={styles.upgradeButtonText}>⚡ Upgrade to Premium</Text>
              </TouchableOpacity>
            )}

            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>
                {user?.subscription_tier === 'free' ? '❌' : '✅'} Unlimited Projects
              </Text>
              <Text style={styles.featureItem}>
                {user?.subscription_tier === 'free' ? '❌' : '✅'} Cloud Sync
              </Text>
              <Text style={styles.featureItem}>
                {user?.subscription_tier === 'free' ? '❌' : '✅'} Premium Instruments
              </Text>
              <Text style={styles.featureItem}>
                {user?.subscription_tier === 'free' ? '❌' : '✅'} HD Export (WAV/FLAC)
              </Text>
            </View>
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 AUDIO SETTINGS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>High Quality Audio</Text>
                <Text style={styles.settingDescription}>48kHz / 24-bit</Text>
              </View>
              <Switch
                value={audioSettings.highQuality}
                onValueChange={(val) => setAudioSettings({ ...audioSettings, highQuality: val })}
                trackColor={{ false: '#808080', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Low Latency Mode</Text>
                <Text style={styles.settingDescription}>Reduce audio delay</Text>
              </View>
              <Switch
                value={audioSettings.lowLatency}
                onValueChange={(val) => setAudioSettings({ ...audioSettings, lowLatency: val })}
                trackColor={{ false: '#808080', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Background Audio</Text>
                <Text style={styles.settingDescription}>Play when app minimized</Text>
              </View>
              <Switch
                value={audioSettings.backgroundAudio}
                onValueChange={(val) => setAudioSettings({ ...audioSettings, backgroundAudio: val })}
                trackColor={{ false: '#808080', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ APP SETTINGS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Get updates & tips</Text>
              </View>
              <Switch
                value={appSettings.notifications}
                onValueChange={(val) => setAppSettings({ ...appSettings, notifications: val })}
                trackColor={{ false: '#808080', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto-Save</Text>
                <Text style={styles.settingDescription}>Save changes automatically</Text>
              </View>
              <Switch
                value={appSettings.autoSave}
                onValueChange={(val) => setAppSettings({ ...appSettings, autoSave: val })}
                trackColor={{ false: '#808080', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>🌍 Language</Text>
              <Text style={styles.menuValue}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>💾 Storage</Text>
              <Text style={styles.menuValue}>2.4 GB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 LEGAL & SUPPORT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy Policy</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Terms of Service</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>About HAOS.fm</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HAOS.fm Mobile v1.7.0</Text>
          <Text style={styles.versionText}>Build 13 • iOS</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 SIGN OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508', // '#050508'
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B35', // '#FF6B35'
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 107, 53, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    color: '#808080', // '#808080'
    letterSpacing: 2,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35', // '#FF6B35'
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 25, 0.85)', // 'rgba(20, 20, 25, 0.85)'
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    shadowColor: '#FF6B35', // '#FF6B35'
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  // Profile Section
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#050508', // '#050508'
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#050508', // '#050508'
  },
  personaBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#050508', // '#050508'
  },
  personaIcon: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '700',
    color: '#F4E8D8',
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  personaTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  personaTagText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  changePersonaButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changePersonaText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },

  // Statistics
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Subscription
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '700',
    color: '#F4E8D8',
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '700',
    color: '#050508',
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  upgradeButtonText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    color: '#050508',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontFamily: 'System',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600',
    color: '#F4E8D8',
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'System',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.1)',
  },
  menuText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '500',
    color: '#F4E8D8',
  },
  menuValue: {
    fontFamily: 'System',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuArrow: {
    fontFamily: 'System',
    fontSize: 18,
    color: '#FF6B35',
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontFamily: 'System',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },

  // Logout
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff4444',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  logoutText: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    color: '#ff4444',
  },
});
