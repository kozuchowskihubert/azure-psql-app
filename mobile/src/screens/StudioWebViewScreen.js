import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * HAOS Studio WebView Screen
 * Loads the full HAOS Studio web app with all features:
 * - 16-Step Sequencer
 * - TR-808/TR-909 Drum Machines
 * - TB-303 Bass Synthesizer
 * - ARP 2600 Modular Synth
 * - Full audio engine with Web Audio API
 * - Pattern presets (Detroit, Acid, Industrial, etc.)
 */
export default function StudioWebViewScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  
  // Which workspace to load
  const workspace = route?.params?.workspace || 'techno';
  
  const STUDIO_URLS = {
    techno: 'https://haos.fm/techno-workspace.html',
    intuitive: 'https://haos.fm/techno-intuitive.html',
    modular: 'https://haos.fm/modular-workspace.html',
    platform: 'https://haos.fm/haos-platform.html',
    daw: 'https://haos.fm/daw-studio.html',
  };
  
  const studioUrl = STUDIO_URLS[workspace] || STUDIO_URLS.techno;

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load HAOS Studio');
    setLoading(false);
  };

  const handleReload = () => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleGoBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  // Inject CSS to optimize for mobile
  const mobileOptimizationJS = `
    (function() {
      // Add mobile-friendly meta viewport
      var meta = document.querySelector('meta[name=viewport]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.head.appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      
      // Add touch-friendly CSS
      var style = document.createElement('style');
      style.textContent = \`
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* Make buttons bigger for touch */
        button, .btn, .step, .track-btn {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Improve step sequencer touch targets */
        .step {
          min-width: 36px !important;
          min-height: 36px !important;
        }
        
        /* Hide desktop-only elements */
        .nav-desktop, .keyboard-shortcuts {
          display: none !important;
        }
        
        /* Optimize for mobile viewport */
        body {
          overflow-x: hidden;
        }
      \`;
      document.head.appendChild(style);
      
      // Enable audio on first touch (iOS requirement)
      document.addEventListener('touchstart', function() {
        if (window.audioContext && window.audioContext.state === 'suspended') {
          window.audioContext.resume();
        }
      }, { once: true });
      
      console.log('📱 HAOS Studio mobile optimization applied');
    })();
    true;
  `;

  if (error) {
    return (
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={styles.container}
      >
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Make sure you have internet connection to access HAOS Studio
          </Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>🔄 Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          HAOS Studio - {workspace.toUpperCase()}
        </Text>
        
        <TouchableOpacity style={styles.headerButton} onPress={handleReload}>
          <Text style={styles.headerButtonText}>↻</Text>
        </TouchableOpacity>
      </SafeAreaView>
      
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: studioUrl }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        injectedJavaScript={mobileOptimizationJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading HAOS Studio...</Text>
            <Text style={styles.loadingHint}>Full audio & sequencer features</Text>
          </View>
        )}
      />
      
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Initializing Audio Engine...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
  },
  loadingText: {
    color: '#FF6B35',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  loadingHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
