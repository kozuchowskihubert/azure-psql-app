/**
 * Additional ARP 2600 Modules
 * Ring Modulator, Sample & Hold, Noise Generator, VCA
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  ringMod: '#FF8C5A',
  sampleHold: '#00ff94',
  noise: '#FFFFFF',
  vca: '#FF6B35',
  background: '#1a1a1a',
  panel: '#2a2a2a',
  text: '#FFFFFF',
  textMuted: '#808080',
};

// Ring Modulator Module
export const RingModulator = ({ onSettingsChange }) => {
  return (
    <View style={styles.module}>
      <LinearGradient
        colors={['#FF8C5A' + '40', '#2a2a2a']}
        style={styles.moduleHeader}
      >
        <Text style={[styles.moduleTitle, { color: '#FF8C5A' }]}>RING MODULATOR</Text>
        <Text style={styles.moduleSubtitle}>X × Y MULTIPLICATION</Text>
      </LinearGradient>
      
      <View style={styles.moduleContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Multiplies two input signals to create metallic, bell-like tones.
          </Text>
        </View>
        
        <View style={styles.patchPoints}>
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>X INPUT</Text>
          </View>
          
          <View style={styles.ringIcon}>
            <Text style={styles.ringIconText}>⊗</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>Y INPUT</Text>
          </View>
          
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.outputJack]} />
            <Text style={styles.jackLabel}>OUTPUT</Text>
          </View>
        </View>
        
        <View style={styles.routingInfo}>
          <Text style={styles.routingLabel}>TYPICAL ROUTING:</Text>
          <Text style={styles.routingText}>• VCO1 SAW → X INPUT</Text>
          <Text style={styles.routingText}>• VCO2 SINE → Y INPUT</Text>
          <Text style={styles.routingText}>• OUTPUT → VCF INPUT</Text>
        </View>
      </View>
    </View>
  );
};

// Sample & Hold Module
export const SampleAndHold = ({ rate, onRateChange }) => {
  return (
    <View style={styles.module}>
      <LinearGradient
        colors={['#00ff94' + '40', '#2a2a2a']}
        style={styles.moduleHeader}
      >
        <Text style={[styles.moduleTitle, { color: '#00ff94' }]}>SAMPLE & HOLD</Text>
        <Text style={styles.moduleSubtitle}>RANDOM VOLTAGE GENERATOR</Text>
      </LinearGradient>
      
      <View style={styles.moduleContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Samples input voltage on clock trigger, holds value until next trigger.
            Perfect for random pitch sequences and unpredictable modulation.
          </Text>
        </View>
        
        <View style={styles.patchPoints}>
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>SIGNAL IN</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>CLOCK IN</Text>
          </View>
          
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.outputJack]} />
            <Text style={styles.jackLabel}>S&H OUT</Text>
          </View>
        </View>
        
        <View style={styles.shDisplay}>
          <Text style={styles.shDisplayLabel}>CURRENT VALUE</Text>
          <View style={styles.shBar}>
            <View style={[styles.shFill, { width: '67%', backgroundColor: '#00ff94' }]} />
          </View>
        </View>
        
        <View style={styles.routingInfo}>
          <Text style={styles.routingLabel}>TYPICAL ROUTING:</Text>
          <Text style={styles.routingText}>• NOISE WHT → SIGNAL IN</Text>
          <Text style={styles.routingText}>• LFO SQR → CLOCK IN</Text>
          <Text style={styles.routingText}>• S&H OUT → VCO1 FM</Text>
        </View>
      </View>
    </View>
  );
};

// Noise Generator Module
export const NoiseGenerator = ({ whiteLevel, pinkLevel, onLevelChange }) => {
  return (
    <View style={styles.module}>
      <LinearGradient
        colors={['#FFFFFF' + '40', '#2a2a2a']}
        style={styles.moduleHeader}
      >
        <Text style={[styles.moduleTitle, { color: '#FFFFFF' }]}>NOISE GENERATOR</Text>
        <Text style={styles.moduleSubtitle}>WHITE & PINK NOISE SOURCES</Text>
      </LinearGradient>
      
      <View style={styles.moduleContent}>
        <View style={styles.noiseTypes}>
          <View style={styles.noiseType}>
            <View style={[styles.noiseLED, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.noiseTypeLabel}>WHITE NOISE</Text>
            <Text style={styles.noiseTypeDesc}>Full spectrum</Text>
            <View style={styles.patchPoint}>
              <View style={[styles.jack, styles.outputJack, { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.jackLabel}>WHITE OUT</Text>
            </View>
          </View>
          
          <View style={styles.noiseType}>
            <View style={[styles.noiseLED, { backgroundColor: '#FF69B4' }]} />
            <Text style={styles.noiseTypeLabel}>PINK NOISE</Text>
            <Text style={styles.noiseTypeDesc}>-3dB/octave</Text>
            <View style={styles.patchPoint}>
              <View style={[styles.jack, styles.outputJack, { backgroundColor: '#FF69B4' }]} />
              <Text style={styles.jackLabel}>PINK OUT</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.routingInfo}>
          <Text style={styles.routingLabel}>USES:</Text>
          <Text style={styles.routingText}>• Percussion & hi-hats (short envelope)</Text>
          <Text style={styles.routingText}>• Wind/ocean effects (pink noise)</Text>
          <Text style={styles.routingText}>• Random modulation via S&H</Text>
          <Text style={styles.routingText}>• Filter resonance excitement</Text>
        </View>
      </View>
    </View>
  );
};

// VCA Module
export const VCA = ({ level, onLevelChange }) => {
  return (
    <View style={styles.module}>
      <LinearGradient
        colors={['#FF6B35' + '40', '#2a2a2a']}
        style={styles.moduleHeader}
      >
        <Text style={[styles.moduleTitle, { color: '#FF6B35' }]}>VCA</Text>
        <Text style={styles.moduleSubtitle}>VOLTAGE CONTROLLED AMPLIFIER</Text>
      </LinearGradient>
      
      <View style={styles.moduleContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Controls signal amplitude via voltage control. Essential for shaping the final output.
          </Text>
        </View>
        
        <View style={styles.patchPoints}>
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>AUDIO IN</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.inputJack]} />
            <Text style={styles.jackLabel}>CV IN</Text>
          </View>
          
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
          
          <View style={styles.patchPoint}>
            <View style={[styles.jack, styles.outputJack]} />
            <Text style={styles.jackLabel}>OUTPUT</Text>
          </View>
        </View>
        
        <View style={styles.vcaMeter}>
          <Text style={styles.vcaMeterLabel}>OUTPUT LEVEL</Text>
          <View style={styles.vcaMeterBar}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <View
                key={i}
                style={[
                  styles.vcaMeterSegment,
                  {
                    backgroundColor: i < 7 ? '#FF6B35' : i < 9 ? '#FFD700' : '#FF3B30',
                    opacity: i < (level * 10) ? 1 : 0.2,
                  },
                ]}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.routingInfo}>
          <Text style={styles.routingLabel}>NORMALLED ROUTING:</Text>
          <Text style={styles.routingText}>• VCF OUT → AUDIO IN</Text>
          <Text style={styles.routingText}>• ADSR OUT → CV IN</Text>
          <Text style={styles.routingText}>• VCA OUT → MAIN OUTPUT</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  module: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  moduleHeader: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#404040',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  moduleSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCCCCC',
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  moduleContent: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  patchPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  patchPoint: {
    alignItems: 'center',
  },
  jack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  inputJack: {
    backgroundColor: '#0066FF',
  },
  outputJack: {
    backgroundColor: '#FF6B35',
  },
  jackLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#CCCCCC',
    marginTop: 6,
    textAlign: 'center',
  },
  ringIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8C5A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIconText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  arrow: {
    marginHorizontal: 8,
  },
  arrowText: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  routingInfo: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C5A',
  },
  routingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  routingText: {
    fontSize: 10,
    color: '#CCCCCC',
    marginBottom: 4,
    fontFamily: 'Menlo',
  },
  shDisplay: {
    marginBottom: 16,
  },
  shDisplayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
    letterSpacing: 1,
  },
  shBar: {
    height: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shFill: {
    height: '100%',
  },
  noiseTypes: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  noiseType: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  noiseLED: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  noiseTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  noiseTypeDesc: {
    fontSize: 9,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  vcaMeter: {
    marginBottom: 16,
  },
  vcaMeterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
    letterSpacing: 1,
  },
  vcaMeterBar: {
    flexDirection: 'row',
    gap: 4,
    height: 32,
  },
  vcaMeterSegment: {
    flex: 1,
    borderRadius: 4,
  },
});

export default {
  RingModulator,
  SampleAndHold,
  NoiseGenerator,
  VCA,
};
