/**
 * SynthSection - Container for grouped synthesizer controls
 * Provides consistent spacing and styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../styles/SynthDesignSystem';

const SynthSection = ({
  title,
  subtitle,
  icon,
  children,
  style,
  contentStyle,
  backgroundColor = null,
}) => {
  const actualBgColor = backgroundColor || COLORS.surface;
  return (
    <View style={[styles.container, { backgroundColor: actualBgColor }, style]}>
      {/* Section Header */}
      {title && (
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {/* Section Content */}
      <View style={[styles.content, contentStyle]}>{children}</View>

      {/* Subtitle/Description */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    flex: 1,
  },
  content: {
    // Content wrapper
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    color: COLORS.textMuted,
  },
});

export default SynthSection;
