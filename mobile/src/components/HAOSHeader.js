/**
 * HAOS Themed Header Component
 * Reusable header with HAOS branding for all screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const COLORS = {
  bgDark: '#000000',
  bgCard: 'rgba(15, 15, 15, 0.95)',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  silver: '#C0C0C0',
  orange: '#FF6B35',
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  border: 'rgba(212, 175, 55, 0.3)',
};

export default function HAOSHeader({
  title,
  navigation,
  showLogo = true,
  showBack = true,
  rightButtons = [],
  gradient = null,  // Will default inside function body
}) {
  const actualGradient = gradient || [COLORS.bgDark, 'rgba(0, 0, 0, 0.8)'];
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <LinearGradient colors={actualGradient} style={styles.header}>
      {/* Left side - Logo or Back button */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : showLogo ? (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/haos-logo-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Center - Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right side - Action buttons */}
      <View style={styles.rightSection}>
        {rightButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              button.onPress();
            }}
          >
            <Text style={styles.actionButtonText}>{button.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)', // COLORS.border
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 60,
    height: 30,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // COLORS.bgCard
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // COLORS.border
  },
  backIcon: {
    fontSize: 24,
    color: '#D4AF37', // COLORS.gold
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37', // COLORS.gold
    letterSpacing: 2,
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)', // COLORS.bgCard
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', // COLORS.border
  },
  actionButtonText: {
    fontSize: 18,
  },
});
