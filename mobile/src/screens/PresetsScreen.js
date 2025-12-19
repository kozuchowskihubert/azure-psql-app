import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PresetsScreen() {
  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>📦 Preset Library</Text>
        <Text style={styles.subtext}>Browse and download professional synth patches</Text>
        <Text style={styles.note}>Coming soon with full offline support</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { color: '#00ff94', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtext: { color: '#666', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  note: { color: '#999', fontSize: 14, fontStyle: 'italic' },
});
