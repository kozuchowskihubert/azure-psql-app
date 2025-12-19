# 📱 HAOS.fm Mobile App

Professional music production on iOS and Android.

![HAOS.fm](https://img.shields.io/badge/HAOS.fm-Mobile-00ff94)
![React Native](https://img.shields.io/badge/React_Native-0.73-61DAFB)
![Expo](https://img.shields.io/badge/Expo-50-000020)

## 🎯 Features

- 🎹 **Professional Synthesizers**: TECHNO, MODULAR, and BUILDER workspaces
- 🎛️ **Touch-Optimized Controls**: Knobs and sliders designed for mobile
- 📦 **Preset Library**: Download and manage professional synth patches
- ☁️ **Cloud Sync**: Sync your patches across all devices
- 💎 **Premium Subscriptions**: In-app purchases with multiple tiers
- 🔐 **Google OAuth**: Secure authentication
- 🌍 **Offline Support**: Work without internet connection
- 🎨 **Dark Theme**: Professional audio production interface

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio with SDK 33+

### Installation

```bash
cd mobile
npm install
```

### Run Development

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (quick testing)
npm start
```

## 📁 Project Structure

```
mobile/
├── App.js                          # Main app entry
├── app.json                        # Expo config
├── package.json                    # Dependencies
├── src/
│   ├── context/
│   │   └── AuthContext.js          # Authentication
│   ├── screens/
│   │   ├── LoginScreen.js          # Login & OAuth
│   │   ├── HomeScreen.js           # Dashboard
│   │   ├── WorkspacesScreen.js     # Synth list
│   │   ├── TechnoWorkspaceScreen.js
│   │   ├── ModularWorkspaceScreen.js
│   │   ├── BuilderWorkspaceScreen.js
│   │   ├── PresetsScreen.js        # Preset library
│   │   ├── AccountScreen.js        # User profile
│   │   └── PremiumScreen.js        # Subscriptions
│   └── components/                 # Reusable components
└── assets/                         # Images & icons
```

## 🏗️ Build for Production

### iOS (App Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android (Google Play)

```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## 📲 App Store Information

### iOS App Store

- **Bundle ID**: `fm.haos.mobile`
- **Category**: Music
- **Age Rating**: 4+
- **Price**: Free with in-app purchases

### Google Play Store

- **Package Name**: `fm.haos.mobile`
- **Category**: Music & Audio
- **Content Rating**: Everyone
- **Price**: Free with in-app purchases

## 💰 In-App Purchases

### Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Basic** | 19.99 PLN/month | 25 downloads/day, TECHNO workspace |
| **Premium** | 49.99 PLN/month | Unlimited downloads, All workspaces |
| **Pro** | 99.99 PLN/month | Everything + 10GB storage, API access |

### Product IDs

- `fm.haos.basic.monthly`
- `fm.haos.premium.monthly`
- `fm.haos.pro.monthly`

## 🔐 Configuration

### Environment Variables

Create `app.json` with:

```json
{
  "extra": {
    "apiUrl": "https://haos.fm/api",
    "eas": {
      "projectId": "YOUR_PROJECT_ID"
    }
  }
}
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client IDs for iOS and Android
3. Add to `app.json`:

```json
{
  "ios": {
    "config": {
      "googleSignIn": {
        "reservedClientId": "YOUR_IOS_CLIENT_ID"
      }
    }
  },
  "android": {
    "config": {
      "googleSignIn": {
        "apiKey": "YOUR_ANDROID_API_KEY"
      }
    }
  }
}
```

## 📊 API Integration

The app connects to the existing HAOS.fm API:

- **Base URL**: `https://haos.fm/api`
- **Authentication**: Cookie-based sessions (`haos_session`)
- **Endpoints**:
  - `POST /auth/login` - Login
  - `POST /auth/register` - Sign up
  - `GET /auth/me` - Get user info
  - `GET /api/premium/state` - Check premium status
  - `GET /api/presets` - List presets
  - `GET /api/subscriptions/current` - Current subscription

## 🎨 Design System

### Colors

- **Primary**: `#00ff94` (HAOS Green)
- **Background**: `#0a0a0a` (Dark)
- **Card**: `#1a1a1a` (Dark Gray)
- **Text**: `#ffffff` (White)
- **Muted**: `#666666` (Gray)
- **Error**: `#ff4444` (Red)

### Typography

- **Title**: 32px, Bold
- **Heading**: 24px, Bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

## 🧪 Testing

```bash
# Run tests
npm test

# Run type checking (if using TypeScript)
npm run type-check

# Lint code
npm run lint
```

### Testing Checklist

- [ ] Login/Logout flows
- [ ] Google OAuth
- [ ] Navigation between screens
- [ ] Premium gate (free vs premium users)
- [ ] In-app purchases (sandbox mode)
- [ ] Offline functionality
- [ ] Audio playback
- [ ] Touch gestures (knobs, sliders)
- [ ] Performance on real devices

## 📝 Development Status

### ✅ Completed

- [x] Project structure
- [x] Navigation setup (Stack + Tabs)
- [x] Authentication context
- [x] Login screen
- [x] Home dashboard
- [x] Workspaces list
- [x] Account screen
- [x] Premium subscription screen
- [x] API integration layer

### 🚧 In Progress

- [ ] Audio engine (Web Audio API bridge)
- [ ] Touch-optimized knobs and sliders
- [ ] ADSR envelope controls
- [ ] Audio visualizers
- [ ] Preset browser and downloads
- [ ] In-app purchase implementation
- [ ] Google OAuth integration
- [ ] Offline storage

### 📋 To Do

- [ ] Complete all workspace screens
- [ ] Implement audio synthesis
- [ ] Add haptic feedback
- [ ] Create app icons (1024x1024)
- [ ] Record app preview videos
- [ ] Write privacy policy
- [ ] Create demo account for reviewers
- [ ] Test on real devices
- [ ] Submit to app stores

## 🆘 Troubleshooting

### Common Issues

**Expo not starting:**
```bash
expo start --clear
```

**iOS build fails:**
```bash
eas credentials
# Regenerate certificates
```

**Android build fails:**
```bash
# Check Android SDK
eas build --platform android --clear-cache
```

**Google OAuth not working:**
- Verify OAuth client IDs
- Check redirect URIs
- Test on real device (not simulator)

## 📚 Documentation

- **Full Deployment Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Expo Docs**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **EAS Build**: https://docs.expo.dev/build/introduction/

## 🎯 Timeline

- **Development**: 2-3 weeks
- **Testing**: 1 week
- **App Store prep**: 3-5 days
- **Review process**: 3-7 days (iOS) + 1-3 days (Android)

**Total**: 4-6 weeks to launch

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test on iOS and Android
4. Submit pull request

## 📄 License

Proprietary - HAOS.fm © 2025

## 📞 Support

- **Website**: https://haos.fm
- **Email**: support@haos.fm
- **Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Built with ❤️ and 🎵 by the HAOS.fm team**
