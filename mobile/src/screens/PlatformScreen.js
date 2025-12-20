/**
 * HAOS.fm Platform Screen
 * Collaboration & Cloud
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PlatformScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🌐 PLATFORM</Text>
      <Text style={styles.subtitle}>Collaboration & Cloud - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 60, left: 20 },
  backArrow: { fontSize: 28, color: '#00FFFF' },
  title: { fontSize: 32, fontWeight: '900', color: '#F4E8D8', marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'rgba(244, 232, 216, 0.7)', textAlign: 'center' },
});
