/**
 * HAOS.fm Instruments Screen
 * Virtual Instruments: Drums, Piano, Guitar, Bass, Strings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  bgDark: '#0A0A0A',
  textPrimary: '#F4E8D8',
  textSecondary: 'rgba(244, 232, 216, 0.7)',
  green: '#39FF14',
};

const INSTRUMENTS = [
  {
    id: 'drums',
    name: 'DRUM MACHINES',
    description: 'TR-808, TR-909 & more',
    icon: '🥁',
    gradient: ['#FF0066', '#FF3399'],
    count: '2 Machines',
  },
  {
    id: 'piano',
    name: 'PIANO',
    description: 'Virtual piano with MIDI',
    icon: '🎹',
    gradient: ['#FFD700', '#FFAA00'],
    count: 'Coming Soon',
  },
  {
    id: 'guitar',
    name: 'GUITAR',
    description: 'Electric & acoustic',
    icon: '🎸',
    gradient: ['#FF8800', '#FFAA00'],
    count: 'Coming Soon',
  },
  {
    id: 'bass',
    name: 'BASS',
    description: 'Bass Studio synthesizer',
    icon: '🎸',
    gradient: ['#39FF14', '#4AFF14'],
    count: '1 Studio',
  },
  {
    id: 'strings',
    name: 'STRINGS',
    description: 'Orchestral strings',
    icon: '🎻',
    gradient: ['#8B5CF6', '#A855F7'],
    count: 'Coming Soon',
  },
];

export default function InstrumentsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🎹</Text>
          <Text style={styles.headerTitle}>INSTRUMENTS</Text>
          <Text style={styles.headerSubtitle}>Virtual Instruments</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {INSTRUMENTS.map((instrument) => (
          <TouchableOpacity
            key={instrument.id}
            activeOpacity={0.9}
            style={styles.card}
          >
            <LinearGradient
              colors={[`${instrument.gradient[0]}20`, `${instrument.gradient[1]}10`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={[styles.cardBorder, { borderColor: `${instrument.gradient[0]}50` }]} />
              <Text style={styles.icon}>{instrument.icon}</Text>
              <Text style={[styles.name, { color: instrument.gradient[0] }]}>
                {instrument.name}
              </Text>
              <Text style={styles.description}>{instrument.description}</Text>
              <Text style={styles.count}>{instrument.count}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 15,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.green,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    minHeight: 140,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
  },
  icon: {
    fontSize: 48,
    marginBottom: 10,
  },
  name: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  description: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  count: {
    fontFamily: 'System',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
