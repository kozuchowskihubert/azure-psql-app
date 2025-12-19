# HAOS.fm Mobile App - Deployment Guide

## 📱 Project Overview

This is the React Native mobile application for HAOS.fm, built with Expo. It provides full music production capabilities on iOS and Android devices.

## 🏗️ Architecture

- **Framework**: React Native with Expo SDK 50
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Audio**: Expo AV
- **Storage**: Expo Secure Store + AsyncStorage
- **In-App Purchases**: react-native-iap
- **Authentication**: Cookie-based sessions + Google OAuth

## 📦 Project Structure

```
mobile/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
├── src/
│   ├── context/
│   │   └── AuthContext.js          # Authentication state
│   ├── screens/
│   │   ├── LoginScreen.js          # Login & Google OAuth
│   │   ├── SignUpScreen.js         # Registration
│   │   ├── HomeScreen.js           # Dashboard
│   │   ├── WorkspacesScreen.js     # Synth workspaces
│   │   ├── TechnoWorkspaceScreen.js
│   │   ├── ModularWorkspaceScreen.js
│   │   ├── BuilderWorkspaceScreen.js
│   │   ├── PresetsScreen.js        # Preset library
│   │   ├── AccountScreen.js        # User profile
│   │   └── PremiumScreen.js        # Subscription plans
│   ├── components/
│   │   ├── Knob.js                 # Touch-optimized knob
│   │   ├── ADSREnvelope.js         # ADSR controls
│   │   ├── Visualizer.js           # Audio visualizer
│   │   └── PresetCard.js           # Preset list item
│   └── services/
│       ├── api.js                  # API client
│       ├── audio.js                # Audio engine
│       └── iap.js                  # In-app purchases
└── assets/
    ├── icon.png                    # App icon (1024x1024)
    ├── splash.png                  # Splash screen
    └── adaptive-icon.png           # Android adaptive icon
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+)
2. **Expo CLI**:
   ```bash
   npm install -g expo-cli eas-cli
   ```
3. **iOS**: Xcode 14+ (macOS only)
4. **Android**: Android Studio with SDK 33+

### Installation

```bash
cd /Users/haos/azure-psql-app/mobile
npm install
```

### Run Development Build

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (for quick testing)
npm start
```

## 📲 Building for Production

### 1. Configure EAS (Expo Application Services)

```bash
eas login
eas build:configure
```

Update `app.json` with your project ID:
```json
{
  "extra": {
    "eas": {
      "projectId": "YOUR_PROJECT_ID"
    }
  }
}
```

### 2. Configure Google OAuth

#### iOS
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create iOS OAuth 2.0 Client ID
3. Add to `app.json`:
   ```json
   "ios": {
     "config": {
       "googleSignIn": {
         "reservedClientId": "YOUR_IOS_CLIENT_ID"
       }
     }
   }
   ```

#### Android
1. Create Android OAuth 2.0 Client ID
2. Get SHA-1 certificate fingerprint:
   ```bash
   eas credentials
   ```
3. Add to Google Cloud Console
4. Update `app.json` with Android config

### 3. Build iOS App

```bash
# Development build
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

**Create `eas.json`:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "fm.haos.mobile",
        "buildNumber": "1"
      }
    }
  }
}
```

### 4. Build Android App

```bash
# Development build
eas build --platform android --profile development

# Production build (for Google Play)
eas build --platform android --profile production
```

## 🍎 App Store Submission (iOS)

### Requirements

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/

2. **App Store Connect Setup**:
   - Create new app at https://appstoreconnect.apple.com/
   - Bundle ID: `fm.haos.mobile`
   - App Name: `HAOS.fm`
   - Category: Music
   - Age Rating: 4+

3. **Assets Needed**:
   - App icon (1024x1024 PNG)
   - Screenshots (6.5", 5.5" iPhones)
   - App preview video (optional)
   - Privacy policy URL
   - Support URL

4. **Build & Upload**:
   ```bash
   # Build production IPA
   eas build --platform ios --profile production
   
   # Submit to App Store
   eas submit --platform ios
   ```

5. **App Review Information**:
   - **Description**: 
     ```
     HAOS.fm - Professional Music Production on Mobile
     
     Create professional electronic music with powerful synthesizers 
     and effects, all in the palm of your hand.
     
     Features:
     • TECHNO, MODULAR, and BUILDER synthesizers
     • Full ADSR envelope control
     • Real-time audio visualizers
     • Professional preset library
     • Cloud sync across devices
     • In-app purchases for premium features
     ```
   
   - **Keywords**: 
     ```
     music, synthesizer, audio, production, techno, electronic, DAW, 
     MIDI, sound design, modular
     ```
   
   - **Demo Account** (for reviewers):
     ```
     Email: review@haos.fm
     Password: [Create test account]
     ```

6. **Privacy Policy Requirements**:
   - Data collection: Email, name, audio recordings
   - Third-party services: Google OAuth
   - Data usage: Cloud storage, analytics

### Submission Checklist

- [ ] App icon (1024x1024)
- [ ] Screenshots (all required sizes)
- [ ] Privacy policy URL
- [ ] Support email/URL
- [ ] Demo account credentials
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Age rating questionnaire
- [ ] Export compliance (encryption)
- [ ] Pricing & availability

### Expected Timeline

- **Review time**: 1-3 days
- **First approval**: 3-7 days (includes back-and-forth)
- **Updates**: 1-2 days

## 🤖 Google Play Submission (Android)

### Requirements

1. **Google Play Console Account** ($25 one-time)
   - Sign up at: https://play.google.com/console/

2. **Create Application**:
   - App name: `HAOS.fm`
   - Package name: `fm.haos.mobile`
   - Category: Music & Audio
   - Content rating: Everyone

3. **Assets Needed**:
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (phone + tablet)
   - Privacy policy URL

4. **Build & Upload**:
   ```bash
   # Build production AAB
   eas build --platform android --profile production
   
   # Submit to Google Play
   eas submit --platform android
   ```

5. **Store Listing**:
   - **Short description** (80 chars):
     ```
     Professional music production with powerful synthesizers and effects
     ```
   
   - **Full description** (4000 chars):
     ```
     🎹 HAOS.fm - Professional Music Production

     Create professional electronic music with powerful synthesizers, 
     all on your Android device.

     ⭐ FEATURES:
     • TECHNO - Classic analog synthesizer
     • MODULAR - Modular synth with patch routing
     • BUILDER - Build custom synthesizers
     • Full ADSR envelope control
     • Real-time audio visualizers
     • Professional preset library
     • Cloud sync across devices

     💎 PREMIUM FEATURES:
     • Unlimited preset downloads
     • All workspace access
     • Cloud storage
     • Priority support

     🎛️ PROFESSIONAL TOOLS:
     • Touch-optimized knobs and sliders
     • Low-latency audio engine
     • MIDI support
     • Export to WAV/MP3

     Download now and start creating music!
     ```

6. **Content Rating**:
   - Complete questionnaire
   - Expected: Everyone (PEGI 3, ESRB Everyone)

7. **Pricing**:
   - Free with in-app purchases
   - In-app products:
     - Basic: 19.99 PLN/month
     - Premium: 49.99 PLN/month
     - Pro: 99.99 PLN/month

### Submission Checklist

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + 7" tablet)
- [ ] Privacy policy URL
- [ ] Content rating certificate
- [ ] Store listing (title, description, graphics)
- [ ] Pricing & distribution
- [ ] In-app products configured

### Expected Timeline

- **Review time**: Few hours to 1 day
- **First approval**: 1-3 days
- **Updates**: Few hours

## 💰 In-App Purchases Setup

### iOS (App Store Connect)

1. **Create In-App Purchase Products**:
   - Go to App Store Connect → Features → In-App Purchases
   - Create 3 auto-renewable subscriptions:
     - `fm.haos.basic.monthly` - 19.99 PLN
     - `fm.haos.premium.monthly` - 49.99 PLN
     - `fm.haos.pro.monthly` - 99.99 PLN

2. **Subscription Group**:
   - Name: "HAOS Premium"
   - Subscriptions ranked by price

3. **Localization**:
   - English: Basic, Premium, Pro
   - Polish: Podstawowy, Premium, Pro

### Android (Google Play Console)

1. **Create Products**:
   - Go to Monetize → Subscriptions
   - Create matching subscription IDs:
     - `fm.haos.basic.monthly`
     - `fm.haos.premium.monthly`
     - `fm.haos.pro.monthly`

2. **Base Plans**:
   - Monthly recurring
   - Prices in PLN: 19.99, 49.99, 99.99

3. **Free Trial**:
   - Optional: 7-day free trial

## 🔐 Security & Privacy

### Data Collection
- Email address
- Display name
- Audio recordings (stored locally)
- Usage analytics

### Third-Party Services
- Google OAuth (authentication)
- Azure Database (user data)
- Vercel (API hosting)

### Privacy Policy
Host at: https://haos.fm/privacy-policy.html

Required sections:
- Data we collect
- How we use it
- Third-party services
- User rights
- Contact information

## 📊 Analytics & Monitoring

### Recommended Tools
- **Sentry**: Error tracking
- **Firebase**: Analytics & crash reporting
- **App Store Analytics**: iOS metrics
- **Google Play Console**: Android metrics

## 🔄 CI/CD Pipeline

### Automated Builds with GitHub Actions

Create `.github/workflows/mobile-build.yml`:

```yaml
name: Mobile Build

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        working-directory: mobile
        run: npm install
      
      - name: Run tests
        working-directory: mobile
        run: npm test
      
      - name: Build iOS
        working-directory: mobile
        run: eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 📝 Testing Checklist

### Before Submission

- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test all authentication flows
- [ ] Test in-app purchases (sandbox)
- [ ] Test offline functionality
- [ ] Test all workspaces
- [ ] Test preset downloads
- [ ] Test audio playback
- [ ] Test subscription flows
- [ ] Performance testing
- [ ] Battery usage testing
- [ ] Network error handling
- [ ] App Store screenshots
- [ ] Google Play screenshots

## 🆘 Common Issues

### iOS Build Fails
- Check Apple Developer certificates
- Run: `eas credentials`
- Verify bundle identifier

### Android Build Fails
- Check Google Play signing
- Verify package name
- Update Gradle dependencies

### Google OAuth Not Working
- Check OAuth client IDs
- Verify redirect URIs
- Test with real device (not simulator)

### Audio Not Playing
- Check iOS audio session category
- Verify Android audio permissions
- Test with headphones connected

## 🎯 Next Steps

1. **Complete remaining screens** (SignUp, Account, Premium, Presets)
2. **Implement audio engine** (Web Audio API bridge)
3. **Add touch-optimized knobs** (PanResponder)
4. **Integrate IAP** (react-native-iap)
5. **Create app icons** (1024x1024)
6. **Write privacy policy**
7. **Create demo account** for reviewers
8. **Record app preview videos**
9. **Build production apps**
10. **Submit to both stores**

## 📞 Support

- **Documentation**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/

## 🎉 Estimated Timeline

- **Development**: 2-3 weeks (complete all screens + features)
- **Testing**: 1 week (QA + fixes)
- **App Store preparation**: 3-5 days (assets, descriptions, policies)
- **Review process**: 3-7 days (iOS) + 1-3 days (Android)

**Total**: 4-6 weeks to launch

---

**Status**: ✅ Initial structure created
**Next**: Complete remaining screens and implement audio engine
