import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>Welcome to HAOS.fm</Text>
          <Text style={styles.subtitle}>
            {user?.display_name ? `Hey ${user.display_name}!` : 'Professional Music Production'}
          </Text>
          {user?.subscription_tier && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.subscription_tier.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Workspaces')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>🎹</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Music Workspaces</Text>
              <Text style={styles.cardDescription}>
                TECHNO, MODULAR, and BUILDER synths
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Presets')}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.icon}>📦</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Browse Presets</Text>
              <Text style={styles.cardDescription}>
                Download professional synth patches
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          {user?.subscription_tier === 'free' && (
            <TouchableOpacity
              style={[styles.card, styles.premiumCard]}
              onPress={() => navigation.navigate('Premium')}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.icon}>⭐</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Go Premium</Text>
                <Text style={styles.cardDescription}>
                  Unlock unlimited downloads & workspaces
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureGrid}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎛️</Text>
              <Text style={styles.featureText}>Professional Synths</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎚️</Text>
              <Text style={styles.featureText}>ADSR Controls</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>Visualizers</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>☁️</Text>
              <Text style={styles.featureText}>Cloud Sync</Text>
            </View>
          </View>
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
  hero: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#00ff94',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  premiumCard: {
    borderColor: '#00ff94',
    backgroundColor: '#0a1a14',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#00ff94',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
