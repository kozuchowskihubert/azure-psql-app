# Quick Start - Building HAOS.fm

## 🚀 Fast Build Commands

Once EAS CLI is installed, use these commands:

### Build Both Platforms
```bash
cd /Users/haos/azure-psql-app/mobile
npx eas build --platform all --profile production
```

### Build iOS Only
```bash
npx eas build --platform ios --profile production
```

### Build Android Only
```bash
npx eas build --platform android --profile production
```

## 📱 First Time Setup

### 1. Create Expo Account
If you don't have one:
```bash
npx eas login
```

### 2. Configure Project
```bash
npx eas build:configure
```

### 3. Link Project to Expo
```bash
npx eas init
```

### 4. Start Build
```bash
npx eas build --platform all --profile production
```

## ⏱️ Build Status

Check your builds at:
**https://expo.dev/accounts/[your-username]/projects/haos-fm/builds**

## 📥 Download Builds

Once complete:
- **iOS**: Download `.ipa` file
- **Android**: Download `.aab` file

## 🔐 Credentials

### iOS
EAS will prompt you to:
- Generate Distribution Certificate
- Generate Provisioning Profile
- Set up Push Notifications (optional)

Just follow the prompts!

### Android
EAS will automatically:
- Generate keystore
- Store credentials securely

## ✅ What Happens During Build

1. **Upload Code**: Your project is uploaded to Expo servers
2. **Install Dependencies**: npm packages are installed
3. **iOS Build** (15-20 min):
   - Compiles native code
   - Generates IPA file
4. **Android Build** (15-20 min):
   - Compiles native code
   - Generates AAB file
5. **Download**: Get your build files

## 🐛 If Build Fails

### Check Logs
```bash
npx eas build:list
```

### Clear Cache and Retry
```bash
npx eas build --platform ios --clear-cache
```

### Common Issues

**"No bundle identifier"**
- Check `app.json` has `ios.bundleIdentifier`

**"Package name not found"**
- Check `app.json` has `android.package`

**"Build failed"**
- Read the error log
- Check dependencies in `package.json`
- Ensure all imports are correct

## 📤 Submit to Stores

### iOS (TestFlight & App Store)
```bash
npx eas submit --platform ios
```

### Android (Google Play)
```bash
npx eas submit --platform android
```

## 💡 Tips

1. **Start with iOS** - Faster approval (1-3 days)
2. **Test on TestFlight** - Before public release
3. **Use Internal Testing** - For Android before production
4. **Monitor Builds** - Check expo.dev regularly
5. **Keep Credentials Safe** - EAS stores them securely

## 🎯 Current Status

- ✅ Project configured
- ✅ eas.json created
- ✅ Bundle IDs set
- ✅ Icons ready
- ✅ All code complete
- ✅ Documentation ready
- ⏳ EAS CLI installing...

**Ready to build once EAS CLI is installed!**

## 📞 Need Help?

- **Expo Discord**: https://chat.expo.dev
- **Documentation**: https://docs.expo.dev/build/introduction/
- **Support Email**: hubertkozuchowski@gmail.com

---

**Build time: ~30-40 minutes for both platforms**

Good luck! 🚀
