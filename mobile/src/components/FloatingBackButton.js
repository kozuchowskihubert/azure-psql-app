/**
 * FloatingBackButton - Consistent back button for all synth screens
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { 
  PRIMARY, 
  TEXT_PRIMARY, 
  SPACING_SM, 
  SPACING_MD, 
  FLOATING_BUTTON_SIZE,
  SHADOW_LARGE 
} from '../styles/SafeColors';

const FloatingBackButton = ({ onPress, color = null }) => {
  const insets = useSafeAreaInsets();
  const actualColor = color || PRIMARY;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        {
          top: insets.top + SPACING_SM,
          backgroundColor: actualColor,
        },
      ]}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>✕</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: SPACING_MD,
    zIndex: 1000,
    width: FLOATING_BUTTON_SIZE,
    height: FLOATING_BUTTON_SIZE,
    borderRadius: FLOATING_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_LARGE,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: TEXT_PRIMARY,
    lineHeight: 28,
  },
});

export default FloatingBackButton;
