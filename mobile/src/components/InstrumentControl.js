/**
 * HAOS Unified Instrument Control Component
 * Standardized parameter controls for all instruments
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { HAOS_COLORS } from '../styles/HAOSTheme';

const InstrumentControl = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  color = HAOS_COLORS.gold,
  onValueChange,
  formatValue,
}) => {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 2 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>
          {displayValue}{unit}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
        thumbTintColor={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)', // HAOS_COLORS.textSecondary
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default InstrumentControl;
