/**
 * ParameterGroup - Row/Column layout for synthesizer parameters
 * Handles responsive layout automatically
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SPACING } from '../styles/SynthDesignSystem';

const ParameterGroup = ({
  children,
  columns = 2,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs, // Compensate for child margins
  },
});

export default ParameterGroup;
