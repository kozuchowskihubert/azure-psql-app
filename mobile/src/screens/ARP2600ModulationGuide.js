/**
 * ARP 2600 MODULATION GUIDE
 * Complete guide to patch bay routing and modulation techniques
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const COLORS = {
  arpOrange: '#FF6B35',
  arpBlue: '#0066FF',
  arpBackground: '#1a1a1a',
  arpPanel: '#2a2a2a',
  textPrimary: '#FFFFFF',
  textSecondary: '#C0C0C0',
  textMuted: '#808080',
  accent: '#00ff94',
  warning: '#FFD700',
};

const FONTS = {
  title: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  section: { fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  code: { fontSize: 13, fontWeight: '500', fontFamily: 'Menlo' },
};

const ARP2600ModulationGuide = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', title: 'INTRODUCTION', icon: '📖' },
    { id: 'patchbay', title: 'PATCH BAY BASICS', icon: '🔌' },
    { id: 'modulation', title: 'MODULATION ROUTING', icon: '〰️' },
    { id: 'classic', title: 'CLASSIC PATCHES', icon: '🎵' },
    { id: 'techno', title: 'TECHNO TECHNIQUES', icon: '⚡' },
    { id: 'advanced', title: 'ADVANCED TIPS', icon: '🚀' },
  ];

  const renderIntro = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Welcome to ARP 2600</Text>
      <Text style={styles.bodyText}>
        The ARP 2600 is a semi-modular analog synthesizer that revolutionized electronic music. 
        Unlike fully modular systems, the ARP 2600 has pre-wired signal paths, but also includes 
        a comprehensive patch bay for custom routing.
      </Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🎹 KEY FEATURES</Text>
        <Text style={styles.bodyText}>
          • 3 Voltage Controlled Oscillators (VCOs){'\n'}
          • 4-pole Low Pass Filter (24dB/oct){'\n'}
          • ADSR Envelope Generator{'\n'}
          • Ring Modulator{'\n'}
          • Sample & Hold{'\n'}
          • Noise Generator{'\n'}
          • Comprehensive Patch Bay
        </Text>
      </View>

      <Text style={styles.sectionSubtitle}>Signal Flow</Text>
      <View style={styles.flowBox}>
        <Text style={styles.flowText}>VCO → MIXER → FILTER → VCA → OUTPUT</Text>
      </View>
      <Text style={styles.bodyText}>
        This is the default signal path. The patch bay allows you to interrupt and redirect 
        signals anywhere in this chain, creating unique sounds.
      </Text>
    </View>
  );

  const renderPatchBay = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Patch Bay Basics</Text>
      <Text style={styles.bodyText}>
        The patch bay is the heart of the ARP 2600's flexibility. It consists of inputs and 
        outputs that can be connected using virtual cables.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🔌 PATCH POINT TYPES</Text>
        <Text style={styles.bodyText}>
          <Text style={{ color: COLORS.arpOrange }}>● OUTPUTS</Text> - Orange connectors{'\n'}
          Send signals to other modules{'\n\n'}
          
          <Text style={{ color: COLORS.arpBlue }}>● INPUTS</Text> - Blue connectors{'\n'}
          Receive signals from other modules{'\n\n'}
          
          <Text style={{ color: COLORS.warning }}>● CABLES</Text> - Yellow virtual cables{'\n'}
          Connect outputs to inputs
        </Text>
      </View>

      <Text style={styles.sectionSubtitle}>Common Patch Points</Text>
      
      <View style={styles.patchList}>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>VCO1_SAW</Text>
          <Text style={styles.patchDesc}>Sawtooth wave output from VCO 1</Text>
        </View>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>VCO2_PULSE</Text>
          <Text style={styles.patchDesc}>Pulse wave output from VCO 2</Text>
        </View>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>VCF_IN</Text>
          <Text style={styles.patchDesc}>Filter audio input</Text>
        </View>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>VCF_FM</Text>
          <Text style={styles.patchDesc}>Filter frequency modulation input</Text>
        </View>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>ADSR_OUT</Text>
          <Text style={styles.patchDesc}>Envelope generator output</Text>
        </View>
        <View style={styles.patchItem}>
          <Text style={styles.patchName}>VCA_IN</Text>
          <Text style={styles.patchDesc}>Amplifier control input</Text>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 TIP</Text>
        <Text style={styles.bodyText}>
          Start simple! Try connecting VCO1_SAW → VCF_IN and ADSR_OUT → VCA_IN for a basic patch.
        </Text>
      </View>
    </View>
  );

  const renderModulation = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Modulation Routing</Text>
      <Text style={styles.bodyText}>
        Modulation is the key to creating evolving, dynamic sounds. By routing LFOs, envelopes, 
        and other sources to various destinations, you can create movement in your patches.
      </Text>

      <Text style={styles.sectionSubtitle}>Common Modulation Sources</Text>
      
      <View style={styles.modGrid}>
        <View style={styles.modCard}>
          <Text style={styles.modTitle}>LFO (Low Frequency Oscillator)</Text>
          <Text style={styles.modDesc}>
            Creates cyclic modulation{'\n'}
            • Vibrato (pitch){'\n'}
            • Tremolo (amplitude){'\n'}
            • Filter sweeps
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>LFO_TRI → VCO1_FM</Text>
            <Text style={styles.codeDesc}>Vibrato effect</Text>
          </View>
        </View>

        <View style={styles.modCard}>
          <Text style={styles.modTitle}>ADSR Envelope</Text>
          <Text style={styles.modDesc}>
            Time-based modulation{'\n'}
            • Note dynamics{'\n'}
            • Filter sweeps{'\n'}
            • Amplitude control
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>ADSR_OUT → VCF_FM</Text>
            <Text style={styles.codeDesc}>Filter envelope</Text>
          </View>
        </View>

        <View style={styles.modCard}>
          <Text style={styles.modTitle}>Sample & Hold</Text>
          <Text style={styles.modDesc}>
            Random stepped voltages{'\n'}
            • Randomized sequences{'\n'}
            • Glitch effects{'\n'}
            • Experimental sounds
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>S&H_OUT → VCF_FM</Text>
            <Text style={styles.codeDesc}>Random filter</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Modulation Destinations</Text>
      
      <View style={styles.destList}>
        <View style={styles.destItem}>
          <Text style={styles.destName}>VCO_FM (Frequency Modulation)</Text>
          <Text style={styles.destDesc}>
            Modulate oscillator pitch for vibrato, FM synthesis, or pitch envelopes
          </Text>
        </View>
        <View style={styles.destItem}>
          <Text style={styles.destName}>VCF_FM (Filter Modulation)</Text>
          <Text style={styles.destDesc}>
            Sweep the filter cutoff for wah effects, envelope sweeps, or LFO wobbles
          </Text>
        </View>
        <View style={styles.destItem}>
          <Text style={styles.destName}>VCA_IN (Amplitude Control)</Text>
          <Text style={styles.destDesc}>
            Control volume with envelopes for note dynamics and tremolo
          </Text>
        </View>
        <View style={styles.destItem}>
          <Text style={styles.destName}>PWM (Pulse Width Modulation)</Text>
          <Text style={styles.destDesc}>
            Animate pulse wave width for chorus-like sounds
          </Text>
        </View>
      </View>
    </View>
  );

  const renderClassicPatches = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Classic ARP 2600 Patches</Text>
      
      <View style={styles.patchCard}>
        <Text style={styles.patchCardTitle}>🎹 Classic Lead</Text>
        <Text style={styles.bodyText}>Rich, fat lead sound with filter envelope</Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            VCO2_SAW → VCF_IN{'\n'}
            ADSR_OUT → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>SETTINGS:</Text>
          <Text style={styles.settingsText}>
            VCO1: 440 Hz, Sawtooth{'\n'}
            VCO2: 440 Hz + 5 cents detune{'\n'}
            VCF: Cutoff 2000 Hz, Resonance 18{'\n'}
            ADSR: A=10ms, D=300ms, S=0.7, R=500ms
          </Text>
        </View>
      </View>

      <View style={styles.patchCard}>
        <Text style={styles.patchCardTitle}>🔊 Acid Bass</Text>
        <Text style={styles.bodyText}>303-style acid bass with high resonance</Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            ADSR_OUT → VCF_FM (heavy amount){'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>SETTINGS:</Text>
          <Text style={styles.settingsText}>
            VCO1: 110 Hz (A2), Sawtooth{'\n'}
            VCF: Cutoff 400 Hz, Resonance 28{'\n'}
            Envelope Amount: 0.95{'\n'}
            ADSR: A=1ms, D=150ms, S=0, R=50ms
          </Text>
        </View>
      </View>

      <View style={styles.patchCard}>
        <Text style={styles.patchCardTitle}>🌊 Pad Strings</Text>
        <Text style={styles.bodyText}>Lush, evolving pad with LFO modulation</Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            VCO2_SINE → VCF_IN{'\n'}
            VCO3_TRI → VCF_IN{'\n'}
            LFO_TRI → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>SETTINGS:</Text>
          <Text style={styles.settingsText}>
            VCO1: 220 Hz (A3){'\n'}
            VCO2: 220.5 Hz (slightly detuned){'\n'}
            VCO3: 440 Hz (A4){'\n'}
            LFO: 0.5 Hz, Triangle{'\n'}
            ADSR: A=800ms, D=1s, S=0.8, R=2s
          </Text>
        </View>
      </View>

      <View style={styles.patchCard}>
        <Text style={styles.patchCardTitle}>⚡ Ring Modulation FX</Text>
        <Text style={styles.bodyText}>Metallic, inharmonic sounds</Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → RING_MOD_X{'\n'}
            VCO2_SINE → RING_MOD_Y{'\n'}
            RING_MOD_OUT → VCF_IN{'\n'}
            LFO_SQUARE → VCO2_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>SETTINGS:</Text>
          <Text style={styles.settingsText}>
            VCO1: 330 Hz{'\n'}
            VCO2: 440 Hz{'\n'}
            LFO: 8 Hz, Square wave{'\n'}
            VCF: Cutoff 5000 Hz, Resonance 15
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTechnoTechniques = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Techno Production Techniques</Text>
      
      <View style={styles.technoCard}>
        <Text style={styles.technoTitle}>⚡ Techno Kick Drum</Text>
        <Text style={styles.bodyText}>
          Punchy, frequency-swept kick fundamental for techno tracks
        </Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SINE → VCF_IN{'\n'}
            ADSR_OUT → VCO1_FM (pitch envelope){'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>KEY TECHNIQUE:</Text>
          <Text style={styles.settingsText}>
            Start at 65 Hz (C2){'\n'}
            Use ADSR to sweep pitch down{'\n'}
            Very short decay (250ms){'\n'}
            No sustain - percussion only
          </Text>
        </View>
      </View>

      <View style={styles.technoCard}>
        <Text style={styles.technoTitle}>🎵 Industrial Screech</Text>
        <Text style={styles.bodyText}>
          Aggressive high-frequency screech for techno risers
        </Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            NOISE_WHITE → VCF_IN{'\n'}
            LFO_SAW → VCF_FM (fast rate){'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>KEY TECHNIQUE:</Text>
          <Text style={styles.settingsText}>
            VCO1 at 2000+ Hz{'\n'}
            High resonance (28){'\n'}
            Fast LFO (16 Hz){'\n'}
            Short percussive envelope
          </Text>
        </View>
      </View>

      <View style={styles.technoCard}>
        <Text style={styles.technoTitle}>🔊 Wobble Bass</Text>
        <Text style={styles.bodyText}>
          LFO-modulated filter for dubstep/techno wobbles
        </Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            VCO2_PULSE → VCF_IN{'\n'}
            LFO_SINE → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>KEY TECHNIQUE:</Text>
          <Text style={styles.settingsText}>
            Low bass frequency (55-110 Hz){'\n'}
            High resonance (26){'\n'}
            LFO at 4 Hz (16th note = 120 BPM){'\n'}
            Sync LFO to tempo for rhythmic wobble
          </Text>
        </View>
      </View>

      <View style={styles.technoCard}>
        <Text style={styles.technoTitle}>🎹 Chord Stab</Text>
        <Text style={styles.bodyText}>
          Classic rave stab chord sound
        </Text>
        <View style={styles.routingBox}>
          <Text style={styles.routingTitle}>ROUTING:</Text>
          <Text style={styles.routingText}>
            VCO1_SAW → VCF_IN{'\n'}
            VCO2_SAW → VCF_IN{'\n'}
            VCO3_SAW → VCF_IN{'\n'}
            ADSR_OUT → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
        </View>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>KEY TECHNIQUE:</Text>
          <Text style={styles.settingsText}>
            Tune VCOs to chord intervals{'\n'}
            (e.g., C, E, G = 220, 277, 330 Hz){'\n'}
            High filter cutoff (5500 Hz){'\n'}
            Very short percussive envelope{'\n'}
            High resonance for brightness
          </Text>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 TECHNO PRODUCTION TIP</Text>
        <Text style={styles.bodyText}>
          For sequenced techno patterns, use the Sequencer module with short gate times 
          and velocity variations. Combine multiple instances of ARP 2600 for layered sounds: 
          kick on one, bass on another, lead melody on a third.
        </Text>
      </View>
    </View>
  );

  const renderAdvanced = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>Advanced Techniques</Text>
      
      <View style={styles.advancedCard}>
        <Text style={styles.advancedTitle}>🔄 Cross-Modulation</Text>
        <Text style={styles.bodyText}>
          Use one VCO to modulate another for complex FM-style timbres.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            VCO1_SAW → VCO2_FM{'\n'}
            VCO2_SAW → VCF_IN
          </Text>
          <Text style={styles.codeDesc}>
            VCO1 acts as modulator, VCO2 as carrier. Adjust VCO1 frequency for different 
            harmonic content.
          </Text>
        </View>
      </View>

      <View style={styles.advancedCard}>
        <Text style={styles.advancedTitle}>🎛️ Hard Sync</Text>
        <Text style={styles.bodyText}>
          Force VCO2 to reset its cycle based on VCO1's frequency.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            VCO1_SAW → VCO2_SYNC{'\n'}
            VCO2_SAW → VCF_IN{'\n'}
            ADSR_OUT → VCO2_FM
          </Text>
          <Text style={styles.codeDesc}>
            Creates aggressive, harmonically rich tones. Modulate VCO2's pitch with envelope 
            for classic sync sweep sounds.
          </Text>
        </View>
      </View>

      <View style={styles.advancedCard}>
        <Text style={styles.advancedTitle}>🎲 Random Modulation</Text>
        <Text style={styles.bodyText}>
          Use Sample & Hold for randomized, generative patches.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            NOISE_WHITE → S&H_IN{'\n'}
            LFO_SQUARE → S&H_CLOCK{'\n'}
            S&H_OUT → VCO1_FM{'\n'}
            S&H_OUT → VCF_FM
          </Text>
          <Text style={styles.codeDesc}>
            Creates stepped random voltages. LFO clock rate controls how fast values change. 
            Perfect for experimental/ambient patches.
          </Text>
        </View>
      </View>

      <View style={styles.advancedCard}>
        <Text style={styles.advancedTitle}>🔔 Self-Oscillating Filter</Text>
        <Text style={styles.bodyText}>
          Push resonance to maximum to make the filter oscillate as a sine wave.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            No audio input needed{'\n'}
            VCF Resonance = 30{'\n'}
            ADSR_OUT → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
          <Text style={styles.codeDesc}>
            The filter itself becomes an oscillator. Use filter cutoff to control pitch. 
            Great for clean sine-wave basses and bells.
          </Text>
        </View>
      </View>

      <View style={styles.advancedCard}>
        <Text style={styles.advancedTitle}>🌊 Audio-Rate Modulation</Text>
        <Text style={styles.bodyText}>
          Use VCO3 at audio frequencies as a modulation source for extreme timbres.
        </Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>
            VCO1_SAW → VCF_IN{'\n'}
            VCO3_SINE (1000 Hz) → VCF_FM{'\n'}
            ADSR_OUT → VCA_IN
          </Text>
          <Text style={styles.codeDesc}>
            Creates sidebands and complex harmonics. Unlike typical LFO modulation (0.1-20 Hz), 
            audio-rate modulation (20+ Hz) creates new frequencies.
          </Text>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>⚠️ IMPORTANT</Text>
        <Text style={styles.bodyText}>
          When experimenting, start with low modulation amounts and gradually increase. 
          Extreme settings can produce unpredictable or harsh results. Save your patches 
          as presets when you find something you like!
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'intro': return renderIntro();
      case 'patchbay': return renderPatchBay();
      case 'modulation': return renderModulation();
      case 'classic': return renderClassicPatches();
      case 'techno': return renderTechnoTechniques();
      case 'advanced': return renderAdvanced();
      default: return renderIntro();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.arpOrange, COLORS.arpBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.goBack();
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MODULATION GUIDE</Text>
          <Text style={styles.headerSubtitle}>ARP 2600 REFERENCE</Text>
        </View>

        <View style={{ width: 44 }} />
      </LinearGradient>

      {/* Section Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.navScroll}
        contentContainerStyle={styles.navContent}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.navButton,
              activeSection === section.id && styles.navButtonActive
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSection(section.id);
            }}
          >
            <Text style={styles.navIcon}>{section.icon}</Text>
            <Text style={[
              styles.navText,
              activeSection === section.id && styles.navTextActive
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.arpBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.arpPanel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.title,
    color: '#FFFFFF',
    fontSize: 22,
  },
  headerSubtitle: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  navScroll: {
    backgroundColor: COLORS.arpPanel,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.arpOrange,
  },
  navContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.arpBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  navButtonActive: {
    backgroundColor: COLORS.arpOrange,
    borderColor: COLORS.arpOrange,
  },
  navIcon: {
    fontSize: 18,
  },
  navText: {
    ...FONTS.label,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  contentSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...FONTS.section,
    color: COLORS.arpOrange,
    marginBottom: 16,
  },
  sectionSubtitle: {
    ...FONTS.section,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  bodyText: {
    ...FONTS.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: COLORS.arpPanel,
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.arpBlue,
  },
  infoTitle: {
    ...FONTS.label,
    color: COLORS.accent,
    marginBottom: 12,
  },
  flowBox: {
    backgroundColor: COLORS.arpPanel,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  flowText: {
    ...FONTS.code,
    color: COLORS.accent,
    fontSize: 14,
  },
  tipBox: {
    backgroundColor: COLORS.warning + '20',
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipTitle: {
    ...FONTS.label,
    color: COLORS.warning,
    marginBottom: 12,
  },
  patchList: {
    gap: 12,
    marginTop: 12,
  },
  patchItem: {
    backgroundColor: COLORS.arpPanel,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.arpOrange,
  },
  patchName: {
    ...FONTS.code,
    color: COLORS.accent,
    marginBottom: 6,
  },
  patchDesc: {
    ...FONTS.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  modGrid: {
    gap: 16,
    marginTop: 16,
  },
  modCard: {
    backgroundColor: COLORS.arpPanel,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.arpBlue,
  },
  modTitle: {
    ...FONTS.section,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modDesc: {
    ...FONTS.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: COLORS.arpBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  codeText: {
    ...FONTS.code,
    color: COLORS.accent,
    marginBottom: 8,
  },
  codeDesc: {
    ...FONTS.body,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  destList: {
    gap: 12,
    marginTop: 12,
  },
  destItem: {
    backgroundColor: COLORS.arpPanel,
    padding: 16,
    borderRadius: 8,
  },
  destName: {
    ...FONTS.code,
    color: COLORS.arpOrange,
    marginBottom: 8,
  },
  destDesc: {
    ...FONTS.body,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  patchCard: {
    backgroundColor: COLORS.arpPanel,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.arpOrange,
  },
  patchCardTitle: {
    ...FONTS.section,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  routingBox: {
    backgroundColor: COLORS.arpBackground,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  routingTitle: {
    ...FONTS.label,
    color: COLORS.accent,
    marginBottom: 8,
  },
  routingText: {
    ...FONTS.code,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  settingsBox: {
    backgroundColor: COLORS.arpBackground,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  settingsTitle: {
    ...FONTS.label,
    color: COLORS.warning,
    marginBottom: 8,
  },
  settingsText: {
    ...FONTS.code,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    fontSize: 12,
  },
  technoCard: {
    backgroundColor: COLORS.arpPanel,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  technoTitle: {
    ...FONTS.section,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  advancedCard: {
    backgroundColor: COLORS.arpPanel,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.arpBlue,
  },
  advancedTitle: {
    ...FONTS.section,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
});

export default ARP2600ModulationGuide;
