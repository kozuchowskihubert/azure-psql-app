/**
 * HAOS.fm Modulation Screen
 * Effects & Processing
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ModulationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>⚡ MODULATION</Text>
      <Text style={styles.subtitle}>Effects & Processing - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 60, left: 20 },
  backArrow: { fontSize: 28, color: '#FF1493' },
  title: { fontSize: 32, fontWeight: '900', color: '#F4E8D8', marginBottom: 10 },
  subtitle: { fontSize: 14, color: 'rgba(244, 232, 216, 0.7)', textAlign: 'center' },
});
