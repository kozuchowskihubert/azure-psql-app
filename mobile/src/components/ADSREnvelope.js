/**
 * ADSR Envelope Component
 * Attack, Decay, Sustain, Release controls
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Knob from './Knob';

const ADSREnvelope = ({ values, onChange }) => {
  const handleChange = (param, value) => {
    if (onChange) {
      onChange({
        ...values,
        [param]: value,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADSR ENVELOPE</Text>
      
      <View style={styles.knobsContainer}>
        <Knob
          label="Attack"
          value={values.attack || 0.1}
          min={0.01}
          max={2}
          step={0.01}
          size={70}
          color="#00ff94"
          unit="s"
          onChange={(val) => handleChange('attack', val)}
        />
        
        <Knob
          label="Decay"
          value={values.decay || 0.2}
          min={0.01}
          max={2}
          step={0.01}
          size={70}
          color="#00ff94"
          unit="s"
          onChange={(val) => handleChange('decay', val)}
        />
        
        <Knob
          label="Sustain"
          value={values.sustain || 0.7}
          min={0}
          max={1}
          step={0.01}
          size={70}
          color="#00ff94"
          onChange={(val) => handleChange('sustain', val)}
        />
        
        <Knob
          label="Release"
          value={values.release || 0.3}
          min={0.01}
          max={3}
          step={0.01}
          size={70}
          color="#00ff94"
          unit="s"
          onChange={(val) => handleChange('release', val)}
        />
      </View>

      {/* Visual envelope display */}
      <View style={styles.envelopeDisplay}>
        <View style={styles.envelopePath}>
          <Text style={styles.envelopeLabel}>A</Text>
          <Text style={styles.envelopeLabel}>D</Text>
          <Text style={styles.envelopeLabel}>S</Text>
          <Text style={styles.envelopeLabel}>R</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#00ff94',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  knobsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  envelopeDisplay: {
    marginTop: 16,
    height: 60,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 8,
  },
  envelopePath: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  envelopeLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ADSREnvelope;
