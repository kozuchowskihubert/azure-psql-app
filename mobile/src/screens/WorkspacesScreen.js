import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function WorkspacesScreen({ navigation }) {
  const { user } = useAuth();
  const isPremium = user?.subscription_tier !== 'free';

  const workspaces = [
    {
      id: 'techno',
      title: 'TECHNO',
      description: 'Classic analog synthesizer with powerful bass',
      icon: '🎛️',
      free: true,
      screen: 'TechnoWorkspace',
      webWorkspace: 'techno', // For WebView full studio
    },
    {
      id: 'modular',
      title: 'MODULAR',
      description: 'Modular synth with patch cables and routing',
      icon: '🔌',
      free: false,
      screen: 'ModularWorkspace',
      webWorkspace: 'modular',
    },
    {
      id: 'builder',
      title: 'BUILDER',
      description: 'Build custom synths from scratch',
      icon: '🏗️',
      free: false,
      screen: 'BuilderWorkspace',
      webWorkspace: 'platform',
    },
  ];

  const handleWorkspacePress = (workspace) => {
    if (!workspace.free && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    navigation.navigate(workspace.screen);
  };

  // Open full HAOS Studio in WebView (with real audio!)
  const handleFullStudioPress = (workspace) => {
    if (!workspace.free && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    navigation.navigate('StudioWebView', { 
      workspace: workspace.webWorkspace || 'techno' 
    });
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Music Workspaces</Text>
          <Text style={styles.subtitle}>
            Professional synthesizers and sound design tools
          </Text>
        </View>

        <View style={styles.content}>
          {workspaces.map((workspace) => (
            <TouchableOpacity
              key={workspace.id}
              style={[
                styles.workspaceCard,
                !workspace.free && !isPremium && styles.lockedCard,
              ]}
              onPress={() => handleWorkspacePress(workspace)}
            >
              <View style={styles.workspaceHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.workspaceIcon}>{workspace.icon}</Text>
                </View>
                {!workspace.free && !isPremium && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>Premium</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.workspaceTitle}>{workspace.title}</Text>
              <Text style={styles.workspaceDescription}>
                {workspace.description}
              </Text>

              <View style={styles.features}>
                <Text style={styles.feature}>• Full ADSR control</Text>
                <Text style={styles.feature}>• Real-time visualizer</Text>
                <Text style={styles.feature}>• Preset management</Text>
              </View>

              <View style={styles.cardFooter}>
                {workspace.free || isPremium ? (
                  <>
                    <TouchableOpacity 
                      style={styles.openButtonContainer}
                      onPress={() => handleWorkspacePress(workspace)}
                    >
                      <Text style={styles.openButton}>Open →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.fullStudioButton}
                      onPress={() => handleFullStudioPress(workspace)}
                    >
                      <Text style={styles.fullStudioText}>🔊 Full Studio</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.upgradeButton}>Upgrade to unlock</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Quick access to NATIVE HAOS Studio */}
          <TouchableOpacity
            style={styles.studioQuickAccess}
            onPress={() => navigation.navigate('NativeTechnoWorkspace')}
          >
            <Text style={styles.studioQuickIcon}>🎵</Text>
            <View style={styles.studioQuickContent}>
              <Text style={styles.studioQuickTitle}>NATIVE STUDIO ✨</Text>
              <Text style={styles.studioQuickDesc}>
                16-Step Sequencer • TR-808/909 • TB-303 • Native Audio
              </Text>
            </View>
            <Text style={styles.studioQuickArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  header: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  workspaceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  lockedCard: {
    opacity: 0.7,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceIcon: {
    fontSize: 32,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffaa00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  lockText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workspaceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  workspaceDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  features: {
    marginBottom: 16,
  },
  feature: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  openButton: {
    color: '#00ff94',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullStudioButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  fullStudioText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  upgradeButton: {
    color: '#ffaa00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studioQuickAccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  studioQuickIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  studioQuickContent: {
    flex: 1,
  },
  studioQuickTitle: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studioQuickDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  studioQuickArrow: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
