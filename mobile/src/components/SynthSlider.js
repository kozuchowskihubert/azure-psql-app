/**
 * SynthSlider - Unified slider component for all synthesizers
 * Professional, consistent design with haptic feedback
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../styles/SynthDesignSystem';

const SynthSlider = ({
  label,
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step,
  unit = '',
  formatValue,
  color = null,
  disabled = false,
  hapticFeedback = true,
}) => {
  const actualColor = color || COLORS.primary;
  const handleValueChange = (newValue) => {
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    onValueChange(newValue);
  };

  const displayValue = formatValue
    ? formatValue(value)
    : `${Math.round(value * 100)}${unit}`;

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Slider */}
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={handleValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={actualColor}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={actualColor}
        disabled={disabled}
      />

      {/* Value Display */}
      <Text style={[styles.value, { color: actualColor }]}>{displayValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 100,
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  value: {
    ...TYPOGRAPHY.valueSmall,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default SynthSlider;
