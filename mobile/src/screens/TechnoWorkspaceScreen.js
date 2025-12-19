import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TechnoWorkspaceScreen() {
  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
      <Text style={styles.text}>🎛️ TECHNO Workspace</Text>
      <Text style={styles.subtext}>Touch-optimized synthesizer coming soon</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#00ff94', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtext: { color: '#666', fontSize: 16 },
});
