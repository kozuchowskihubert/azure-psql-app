import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumScreen() {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '19.99',
      period: 'month',
      features: [
        '25 preset downloads/day',
        'SOUNDS page access',
        'TECHNO workspace',
        '25 saved patches',
        'Basic synths access',
        'Email support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '49.99',
      period: 'month',
      featured: true,
      features: [
        'Unlimited downloads',
        'All workspaces unlocked',
        'All synths: Minimoog, ARP2600, Juno106, Prophet5, TB-303',
        'Universal sequencer on all synths',
        'On-screen keyboards',
        'Bass Studio with 8 presets',
        'Beat Maker with full production',
        'Drum machines: TR-808, TR-909, CR-78, LinnDrum',
        'MODULAR & BUILDER workspaces',
        'Exclusive presets library',
        'Unlimited patches & saves',
        'Fine-control knobs with manual input',
        '1 GB cloud storage',
        'Priority support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '99.99',
      period: 'month',
      features: [
        'Everything in Premium',
        'DAW Studio integration',
        'Advanced effects routing',
        '3D visualization',
        '10 GB cloud storage',
        'Collaboration tools',
        'Advanced export: WAV, MIDI, stems',
        'API access for developers',
        'Dedicated support',
        'Early access to new synths',
      ],
    },
  ];

  const handleSubscribe = (planId) => {
    // TODO: Implement in-app purchase with react-native-iap
    console.log('Subscribe to:', planId);
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.badge}>⭐ HAOS.fm PREMIUM</Text>
          <Text style={styles.title}>Unlock Professional Sound Design</Text>
          <Text style={styles.subtitle}>
            Get full access to all legendary synths, sequencers, and professional production tools
          </Text>
        </View>

        <View style={styles.plans}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.featured && styles.featuredCard,
              ]}
            >
              {plan.featured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>MOST POPULAR</Text>
                </View>
              )}
              
              <Text style={styles.planName}>{plan.name}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.currency}> PLN</Text>
              </View>
              <Text style={styles.period}>/{plan.period}</Text>

              <View style={styles.features}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.feature}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  plan.featured && styles.featuredButton,
                ]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Text
                  style={[
                    styles.subscribeButtonText,
                    plan.featured && styles.featuredButtonText,
                  ]}
                >
                  Subscribe Now
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Cancel anytime{'\n'}
            • 7-day money-back guarantee{'\n'}
            • Prices in PLN (Polish Złoty){'\n'}
            • All synths include: Fine-control knobs, Manual value input, Universal sequencer, On-screen keyboard{'\n'}
            • New features added regularly
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  badge: {
    fontSize: 14,
    color: '#ffaa00',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff94',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  plans: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  featuredCard: {
    borderColor: '#00ff94',
    borderWidth: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#00ff94',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff94',
  },
  currency: {
    fontSize: 24,
    color: '#00ff94',
    marginTop: 8,
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    color: '#00ff94',
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  featuredButton: {
    backgroundColor: '#00ff94',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuredButtonText: {
    color: '#0a0a0a',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
});
