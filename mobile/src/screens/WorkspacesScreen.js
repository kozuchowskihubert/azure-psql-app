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
    },
    {
      id: 'modular',
      title: 'MODULAR',
      description: 'Modular synth with patch cables and routing',
      icon: '🔌',
      free: false,
      screen: 'ModularWorkspace',
    },
    {
      id: 'builder',
      title: 'BUILDER',
      description: 'Build custom synths from scratch',
      icon: '🏗️',
      free: false,
      screen: 'BuilderWorkspace',
    },
  ];

  const handleWorkspacePress = (workspace) => {
    if (!workspace.free && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    navigation.navigate(workspace.screen);
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
                  <Text style={styles.openButton}>Open →</Text>
                ) : (
                  <Text style={styles.upgradeButton}>Upgrade to unlock</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
  },
  openButton: {
    color: '#00ff94',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeButton: {
    color: '#ffaa00',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
