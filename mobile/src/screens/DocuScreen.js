/**
 * HAOS.fm Documentation Screen
 * Tutorials, Guides, and Help Documentation
 * Based on docs.html structure
 * Date: December 28, 2025
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../styles/colors';
import { TYPOGRAPHY } from '../styles/typography';
import CircuitBoardBackground from '../components/CircuitBoardBackground';

// Documentation Categories
const DOC_CATEGORIES = [
  { id: 'all', name: 'ALL', icon: '📚', count: 24 },
  { id: 'quickstart', name: 'START', icon: '🚀', count: 5 },
  { id: 'instruments', name: 'INSTRUMENTS', icon: '🎹', count: 8 },
  { id: 'effects', name: 'EFFECTS', icon: '✨', count: 6 },
  { id: 'mixing', name: 'MIXING', icon: '🎛️', count: 5 },
];

// Documentation Articles
const ARTICLES = [
  // Quick Start
  {
    id: 1,
    category: 'quickstart',
    title: 'Getting Started with HAOS.fm',
    subtitle: 'Complete beginner\'s guide',
    icon: '🚀',
    color: COLORS.green,
    duration: '5 min read',
    content: `Welcome to HAOS.fm! This guide will help you get started with mobile music production.

**What is HAOS.fm?**
HAOS.fm is a complete Digital Audio Workstation (DAW) for mobile devices. Create, mix, and master professional music on your phone or tablet.

**Getting Started:**
1. Choose your persona (Musician, Producer, or Adventurer)
2. Explore the 6 main tabs: Creator, Studio, Instruments, Sounds, Docu, Account
3. Load a preset or create your own sound
4. Start recording vocals or playing instruments
5. Mix your tracks in the Studio
6. Export and share your creation

**Quick Tips:**
• Use headphones for best audio quality
• Start with presets to learn synthesis
• Experiment with effects on the Studio tab
• Save your work frequently

Ready to create? Head to the Creator tab!`,
  },
  {
    id: 2,
    category: 'quickstart',
    title: 'Understanding Personas',
    subtitle: 'Musician, Producer, Adventurer',
    icon: '🎭',
    color: COLORS.purple,
    duration: '3 min read',
    content: `HAOS.fm uses a persona system to customize your experience.

**MUSICIAN 🎹**
Perfect for: Composers, songwriters, performers
Default Tab: Creator (DAW interface)
Focus: Live recording, MIDI tools, real-time FX

**PRODUCER 🎛️**
Perfect for: Beat makers, sound designers, mixers
Default Tab: Instruments (synthesizers & drums)
Focus: Virtual instruments, synthesis, production

**ADVENTURER ✨**
Perfect for: Explorers, learners, preset hunters
Default Tab: Sounds (preset library)
Focus: Discover presets, quick jams, experimentation

You can change your persona anytime in Account settings.`,
  },
  {
    id: 3,
    category: 'quickstart',
    title: 'Creator Tab: DAW Interface',
    subtitle: 'Multi-track recording & arrangement',
    icon: '🎹',
    color: COLORS.orange,
    duration: '7 min read',
    content: `The Creator tab is your main production hub.

**Transport Controls:**
• Play/Pause (▶/⏸): Start/stop playback
• Stop (⏹): Return to beginning
• Record (⏺): Arm for recording

**Track Management:**
• M (Mute): Silence track
• S (Solo): Hear only this track
• R (Record): Arm track for recording

**Timeline:**
Horizontal view of your arrangement. Drag clips to move them, resize to trim.

**Quick Access:**
Shortcuts to Synths, Drums, Vocals, and Presets.

**Vocal Recording:**
Tap the vocal recording panel to record directly into your project.`,
  },

  // Instruments
  {
    id: 4,
    category: 'instruments',
    title: 'ARP 2600 Synthesizer',
    subtitle: 'Semi-modular analog synthesis',
    icon: '🎛️',
    color: COLORS.cyan,
    duration: '10 min read',
    content: `The ARP 2600 is a legendary semi-modular synthesizer.

**Key Features:**
• 3 oscillators (VCO1, VCO2, VCO3)
• Resonant lowpass filter
• Built-in spring reverb
• Ring modulator
• Sample & hold
• ADSR envelope

**Getting Started:**
1. Choose a waveform (saw, square, triangle)
2. Adjust filter cutoff and resonance
3. Set envelope (Attack, Decay, Sustain, Release)
4. Add modulation with LFO
5. Experiment with patch bay

**Classic Patches:**
• Techno Lead: Saw + filter sweep + short envelope
• Bass: Square + low cutoff + long release
• FX Sweep: Noise + filter + slow LFO

Patch bay allows custom routing between modules.`,
  },
  {
    id: 5,
    category: 'instruments',
    title: 'Roland Juno-106',
    subtitle: 'Polyphonic analog synthesizer',
    icon: '🎹',
    color: COLORS.cyan,
    duration: '8 min read',
    content: `The Juno-106 is famous for its warm, lush sound.

**Key Features:**
• 6-voice polyphony
• DCO oscillators (digitally controlled)
• Iconic chorus effect
• High-pass filter
• Simple, intuitive interface

**Signature Sound:**
The Juno's character comes from:
1. Stable DCO oscillators (no drift)
2. Rich PWM (pulse width modulation)
3. Built-in stereo chorus
4. Warm analog filter

**Classic Sounds:**
• Pad: Saw wave + chorus + slow attack
• String: Square wave + sub osc + chorus
• Bass: Square + no chorus + fast attack
• Brass: Saw + PWM + medium envelope

Perfect for warm pads and 80s-style sounds.`,
  },
  {
    id: 6,
    category: 'instruments',
    title: 'Minimoog Model D',
    subtitle: 'Legendary monophonic bass',
    icon: '🔊',
    color: COLORS.cyan,
    duration: '9 min read',
    content: `The Minimoog defined the sound of electronic music.

**Architecture:**
• 3 VCOs (voltage controlled oscillators)
• 24dB/octave ladder filter (Moog filter)
• 2 ADSR envelopes
• Pitch bend and modulation wheels

**The Moog Filter:**
The legendary 24dB ladder filter is the Moog's secret weapon:
• Warm, musical resonance
• Self-oscillates at high resonance
• Becomes an instrument itself

**Classic Sounds:**
• Fat Bass: 3 oscillators + low cutoff
• Lead: Single oscillator + filter sweep
• Sub Bass: Square wave + octave down
• Screaming Lead: High resonance + envelope

Used on countless records from Stevie Wonder to Daft Punk.`,
  },
  {
    id: 7,
    category: 'instruments',
    title: 'Roland TR-808 Drum Machine',
    subtitle: 'Iconic analog drums',
    icon: '🥁',
    color: COLORS.orange,
    duration: '8 min read',
    content: `The 808 revolutionized music production.

**Signature Sounds:**
• Kick: Deep, boomy, sub-heavy
• Snare: Crisp, snappy, punchy
• Hi-hat: Metallic, sizzling
• Cowbell: More cowbell!

**Programming:**
1. Select sound (BD, SD, HH, etc.)
2. Tap step buttons to create pattern
3. Adjust accent for dynamics
4. Chain patterns together

**808 in Different Genres:**
• Hip-Hop: Deep kick + snappy snare
• Techno: Punchy kick + hi-hat groove
• Trap: Layered kicks + rolling hi-hats
• House: Four-on-floor kick pattern

The 808 bass drum is the sound of modern music.`,
  },
  {
    id: 8,
    category: 'instruments',
    title: 'Roland TR-909 Drum Machine',
    subtitle: 'Hybrid analog/digital drums',
    icon: '🎼',
    color: COLORS.orange,
    duration: '7 min read',
    content: `The 909 defined techno and house music.

**Key Differences from 808:**
• Punchier, more aggressive kick
• Real hi-hat samples (not analog)
• Individual outputs per sound
• More precise timing

**Programming Patterns:**
1. Choose tempo (120-140 BPM for house/techno)
2. Program kick on downbeats
3. Add snare on 2 and 4
4. Create hi-hat groove
5. Use fills and variations

**909 Techniques:**
• Shuffle/swing for groove
• Accent programming for dynamics
• Flam for double-hit effects
• Individual tuning per sound

Essential for electronic dance music production.`,
  },

  // Effects
  {
    id: 9,
    category: 'effects',
    title: 'Reverb & Delay',
    subtitle: 'Time-based effects',
    icon: '🌊',
    color: COLORS.cyan,
    duration: '8 min read',
    content: `Reverb and delay create space and depth.

**REVERB:**
Simulates acoustic spaces (room, hall, plate, spring)

Parameters:
• Size: Room dimensions
• Decay: How long reverb lasts
• Pre-delay: Gap before reverb starts
• Mix: Dry/wet balance

**DELAY:**
Repeats the input signal at regular intervals

Parameters:
• Time: Delay between repeats
• Feedback: Number of repeats
• Filter: Tone of repeats
• Mix: Dry/wet balance

**Creative Uses:**
• Short reverb: Tighten sound
• Long reverb: Ambient, dreamy
• Dotted 8th delay: Rhythmic
• Ping-pong delay: Stereo width

Use reverb to place sounds in space, delay for rhythm.`,
  },
  {
    id: 10,
    category: 'effects',
    title: 'Compression & Limiting',
    subtitle: 'Dynamic range control',
    icon: '📦',
    color: COLORS.orange,
    duration: '10 min read',
    content: `Compression controls the dynamic range of audio.

**COMPRESSOR:**
Reduces the volume of loud parts, making overall signal more consistent.

Parameters:
• Threshold: Where compression starts
• Ratio: How much compression (2:1, 4:1, 8:1)
• Attack: How fast it responds
• Release: How fast it recovers
• Makeup Gain: Compensate for volume loss

**LIMITER:**
Extreme compression that prevents clipping.

Uses:
• Master bus: Prevent clipping
• Individual tracks: Control peaks
• Loudness: Maximize perceived volume

**Compression Tips:**
• Drums: Fast attack, medium release
• Vocals: Medium attack, fast release
• Bass: Slow attack, medium release
• Master: Gentle ratio (2:1-4:1)

Compression is essential for professional mixes.`,
  },
  {
    id: 11,
    category: 'effects',
    title: 'EQ (Equalization)',
    subtitle: 'Frequency sculpting',
    icon: '🎚️',
    color: COLORS.green,
    duration: '9 min read',
    content: `EQ shapes the frequency content of audio.

**Frequency Ranges:**
• Sub (20-60 Hz): Deep bass, rumble
• Bass (60-250 Hz): Punch, body
• Low Mid (250-500 Hz): Warmth, muddiness
• Mid (500-2k Hz): Presence, clarity
• High Mid (2k-6k Hz): Definition, bite
• High (6k-20k Hz): Air, sparkle

**EQ Types:**
• High-pass: Remove low frequencies
• Low-pass: Remove high frequencies
• Parametric: Boost/cut specific frequencies
• Shelving: Boost/cut above/below frequency

**EQ Techniques:**
• Cut before you boost
• Use high-pass to clean up lows
• Boost presence for vocals (3-5 kHz)
• Add air to cymbals (10-15 kHz)
• Remove muddiness (200-400 Hz)

Good EQ makes everything sit together.`,
  },

  // Mixing
  {
    id: 12,
    category: 'mixing',
    title: 'Mixing Fundamentals',
    subtitle: 'Balance, clarity, depth',
    icon: '🎛️',
    color: COLORS.purple,
    duration: '12 min read',
    content: `Mixing combines individual tracks into a cohesive whole.

**The Mixing Process:**
1. Set levels: Balance track volumes
2. Panning: Create stereo width
3. EQ: Carve out frequency space
4. Compression: Control dynamics
5. Effects: Add space and depth
6. Automation: Create movement

**Level Balancing:**
• Start with drums as foundation
• Add bass to complement kick
• Layer melodic elements
• Vocals on top (if present)
• Leave headroom (-6dB master)

**Panning Techniques:**
• Kick & bass: Center
• Snare: Center
• Hi-hats: Slight left/right
• Synths: Spread wide
• Create space with width

**Frequency Balance:**
Each element should have its own space in the frequency spectrum.

A good mix sounds clear, balanced, and powerful.`,
  },
  {
    id: 13,
    category: 'mixing',
    title: 'Vocal Recording & Mixing',
    subtitle: 'Professional vocal production',
    icon: '🎤',
    color: COLORS.gold,
    duration: '10 min read',
    content: `Record and mix vocals like a pro.

**Recording Setup:**
• Quiet room (minimize noise)
• Pop filter (reduce plosives)
• Good mic position (6-8 inches)
• Monitor with headphones
• Record multiple takes

**Vocal Processing Chain:**
1. **EQ**: High-pass at 80Hz, boost presence (3-5kHz)
2. **Compression**: 3:1-4:1 ratio, medium attack/release
3. **De-esser**: Tame sibilance (6-8kHz)
4. **Reverb**: Short plate or room
5. **Delay**: Subtle slap or dotted 8th

**Vocal Mixing Tips:**
• Cut mud around 200-400Hz
• Add clarity at 3-5kHz
• Use automation for level consistency
• Layer backgrounds wide
• Lead vocal always on top

**Auto-Tune (if desired):**
• Subtle for correction
• Extreme for effect
• Adjust retune speed

Great vocals start with a great performance.`,
  },
  {
    id: 14,
    category: 'mixing',
    title: 'Mastering Basics',
    subtitle: 'Final polish for your mix',
    icon: '✨',
    color: COLORS.orange,
    duration: '8 min read',
    content: `Mastering prepares your mix for distribution.

**Mastering Chain:**
1. **EQ**: Subtle adjustments
2. **Multiband Compression**: Control frequency groups
3. **Stereo Imaging**: Enhance width
4. **Limiter**: Maximize loudness

**Mastering Goals:**
• Consistent volume across tracks
• Balanced frequency response
• Competitive loudness
• Translation to all systems

**Loudness Standards:**
• Streaming: -14 LUFS (Spotify, Apple Music)
• Club: -8 to -10 LUFS
• Radio: -12 LUFS

**Mastering Tips:**
• Take breaks to reset ears
• Reference professional tracks
• Don't over-compress
• Leave 0.1dB headroom
• Export at 44.1kHz 16-bit minimum

Mastering is the final 10% that makes a huge difference.`,
  },

  // More articles...
  {
    id: 15,
    category: 'quickstart',
    title: 'Keyboard Shortcuts',
    subtitle: 'Speed up your workflow',
    icon: '⌨️',
    color: COLORS.gray,
    duration: '3 min read',
    content: `Essential keyboard shortcuts for HAOS.fm.

**Transport:**
• Space: Play/Pause
• Stop: Return to start
• R: Record

**Navigation:**
• Tab: Switch between tabs
• Cmd+1-6: Jump to specific tab

**Editing:**
• Cmd+Z: Undo
• Cmd+Shift+Z: Redo
• Cmd+D: Duplicate
• Delete: Remove selected

**Mixer:**
• M: Mute selected track
• S: Solo selected track
• Up/Down: Adjust volume
• Left/Right: Pan

**Playback:**
• L: Loop mode
• [ ]: Set loop points

Learn these shortcuts to work faster!`,
  },
];

// Article Card Component
const ArticleCard = ({ article, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={styles.articleCard}
  >
    <LinearGradient
      colors={[COLORS.bgCard, COLORS.bgDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.articleGradient}
    >
      <View style={[styles.articleBorder, { borderColor: article.color }]} />
      
      <View style={styles.articleHeader}>
        <View style={[styles.articleIconCircle, { backgroundColor: `${article.color}30` }]}>
          <Text style={styles.articleIcon}>{article.icon}</Text>
        </View>
        <View style={styles.articleMeta}>
          <Text style={styles.articleDuration}>{article.duration}</Text>
        </View>
      </View>

      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleSubtitle}>{article.subtitle}</Text>

      <View style={styles.articleFooter}>
        <Text style={[styles.readMore, { color: article.color }]}>READ MORE →</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default function DocuScreen({ navigation, route }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const persona = route?.params?.persona || 'adventurer';

  // Filter articles by category
  const filteredArticles = ARTICLES.filter(article =>
    activeCategory === 'all' || article.category === activeCategory
  );

  const handleArticlePress = (article) => {
    setSelectedArticle(article);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  const handleOpenYouTube = () => {
    Linking.openURL('https://www.youtube.com/@HAOSfm');
  };

  return (
    <View style={styles.container}>
      {/* Circuit Board Background */}
      <CircuitBoardBackground density="low" animated={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>HAOS</Text>
          <Text style={styles.logoDot}>.fm</Text>
        </View>
        <Text style={styles.headerTitle}>DOCU</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {DOC_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              onPress={() => setActiveCategory(category.id)}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive,
              ]}
            >
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text style={[
                styles.categoryName,
                activeCategory === category.id && styles.categoryNameActive,
              ]}>
                {category.name}
              </Text>
              <View style={[
                styles.categoryBadge,
                activeCategory === category.id && styles.categoryBadgeActive,
              ]}>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Articles List */}
      {!selectedArticle ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.articlesList}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Tutorials Banner */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenYouTube}
            style={styles.videoBanner}
          >
            <LinearGradient
              colors={[COLORS.red + '40', COLORS.red + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.videoBannerGradient}
            >
              <Text style={styles.videoBannerIcon}>📺</Text>
              <View style={styles.videoBannerContent}>
                <Text style={styles.videoBannerTitle}>VIDEO TUTORIALS</Text>
                <Text style={styles.videoBannerSubtitle}>Watch on YouTube</Text>
              </View>
              <Text style={styles.videoBannerArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Articles Grid */}
          {filteredArticles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => handleArticlePress(article)}
            />
          ))}

          {/* Community Section */}
          <View style={styles.communitySection}>
            <Text style={styles.communitySectionTitle}>🌐 COMMUNITY</Text>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityButtonText}>Discord Server</Text>
              <Text style={styles.communityButtonIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityButtonText}>Reddit Community</Text>
              <Text style={styles.communityButtonIcon}>📱</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.communityButton}>
              <Text style={styles.communityButtonText}>User Forum</Text>
              <Text style={styles.communityButtonIcon}>👥</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Article View
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.articleView}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={handleCloseArticle} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>

          <View style={[styles.articleHeaderLarge, { backgroundColor: `${selectedArticle.color}20` }]}>
            <Text style={styles.articleIconLarge}>{selectedArticle.icon}</Text>
            <Text style={styles.articleTitleLarge}>{selectedArticle.title}</Text>
            <Text style={styles.articleSubtitleLarge}>{selectedArticle.subtitle}</Text>
            <Text style={styles.articleDurationLarge}>{selectedArticle.duration}</Text>
          </View>

          <View style={styles.articleContent}>
            <Text style={styles.articleText}>{selectedArticle.content}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  logoDot: {
    ...TYPOGRAPHY.h2,
    color: COLORS.orange,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  // Categories
  categoryContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderGray,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.orangeTransparent,
    borderColor: COLORS.orange,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  categoryNameActive: {
    color: COLORS.orange,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.grayDark,
    borderRadius: 8,
  },
  categoryBadgeActive: {
    backgroundColor: COLORS.orange,
  },
  categoryCount: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  articlesList: {
    padding: 20,
  },
  // Video Banner
  videoBanner: {
    marginBottom: 20,
  },
  videoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.red,
  },
  videoBannerIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  videoBannerContent: {
    flex: 1,
  },
  videoBannerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  videoBannerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  videoBannerArrow: {
    fontSize: 24,
    color: COLORS.red,
  },
  // Article Card
  articleCard: {
    marginBottom: 15,
  },
  articleGradient: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  articleBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  articleIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleIcon: {
    fontSize: 28,
  },
  articleMeta: {
    alignItems: 'flex-end',
  },
  articleDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  articleTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  articleSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMore: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
  },
  // Article View
  articleView: {
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: COLORS.orange,
    marginRight: 8,
  },
  backText: {
    ...TYPOGRAPHY.label,
    color: COLORS.orange,
  },
  articleHeaderLarge: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  articleIconLarge: {
    fontSize: 64,
    marginBottom: 15,
  },
  articleTitleLarge: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  articleSubtitleLarge: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  articleDurationLarge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  articleContent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  articleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  // Community
  communitySection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  communitySectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  communityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: COLORS.bgDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  communityButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  communityButtonIcon: {
    fontSize: 20,
  },
});
