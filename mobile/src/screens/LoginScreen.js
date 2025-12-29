import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPO, SPACING, RADIUS } from '../styles/HAOSDesignSystem';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/haos-background.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="contain"
    >
        {/* Dark overlay for readability */}
        <View style={styles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Tagline - Logo is in background */}
          <View style={styles.logoContainer}>
            <Text style={styles.tagline}>Professional Music Production</Text>
            <Text style={styles.subtitle}>🎛️ Techno • House • Electronic</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>🚀 Sign In</Text>
                <Text style={styles.buttonSubtext}>Start producing now</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.googleButtonContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    transform: [{ scale: 1.5 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80, // SPACING.mega
    marginTop: 56, // SPACING.xxxl
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 32, // SPACING.xl
    paddingHorizontal: 32, // SPACING.xl
    borderRadius: 24, // RADIUS.xl
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 148, 0.2)',
  },
  tagline: {
    fontSize: 32, // TYPO.h3
    lineHeight: 40,
    color: '#FFFFFF', // COLORS.textPrimary
    textAlign: 'center',
    textShadowColor: '#00FF94', // COLORS.primary
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.7)', // COLORS.textSecondary
    marginTop: 8, // SPACING.sm
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    backgroundColor: '#FF3B30', // COLORS.accentRed
    padding: 16, // SPACING.md
    borderRadius: 12, // RADIUS.md
    marginBottom: 20, // SPACING.base
  },
  errorText: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: '#FFFFFF', // COLORS.textPrimary
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20, // SPACING.base
  },
  label: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: '#00FF94', // COLORS.primary
    marginBottom: 8, // SPACING.sm
    fontWeight: '600',
    textShadowColor: '#00FF94', // COLORS.primary
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 148, 0.3)',
    borderRadius: 16, // RADIUS.lg
    padding: 20, // SPACING.base
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: '#FFFFFF', // COLORS.textPrimary
    shadowColor: '#00FF94', // COLORS.primary
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  button: {
    padding: 24, // SPACING.lg
    borderRadius: 16, // RADIUS.lg
    alignItems: 'center',
    marginTop: 8, // SPACING.sm
    shadowColor: '#000000', // COLORS.shadowDark
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#00FF94', // COLORS.primary
    shadowColor: '#00FF94', // COLORS.primary
    shadowOpacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 24, // TYPO.h4
    lineHeight: 32,
    color: '#0a0a0a', // COLORS.background
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: 12, // TYPO.caption
    lineHeight: 16,
    color: '#0a0a0a', // COLORS.background
    marginTop: 4, // SPACING.xs
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // SPACING.md
  },
  googleIcon: {
    fontSize: 40, // TYPO.h2
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: '#1a1a1a', // COLORS.surface
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32, // SPACING.xl
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // COLORS.border
  },
  dividerText: {
    fontSize: 12, // TYPO.caption
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.5)', // COLORS.textTertiary
    paddingHorizontal: 20, // SPACING.base
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32, // SPACING.xl
  },
  footerText: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.5)', // COLORS.textTertiary
  },
  link: {
    fontSize: 16, // TYPO.body
    lineHeight: 24,
    color: '#00FF94', // COLORS.primary
    fontWeight: 'bold',
  },
});
