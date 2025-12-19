# HAOS.fm - Build and Submission Guide

## Prerequisites

### Required Accounts
- ✅ Apple Developer Account ($99/year)
- ✅ Google Play Console Account ($25 one-time)
- ✅ Expo Account (free)

### Required Software
- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ Expo CLI
- ✅ EAS CLI
- ✅ Xcode (for iOS, macOS only)
- ✅ Android Studio (optional but recommended)

---

## Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

### 3. Configure EAS

```bash
cd /Users/haos/azure-psql-app/mobile
eas build:configure
```

This creates `eas.json` (already created).

---

## iOS Build Process

### Step 1: Update app.json

Ensure these fields are set in `mobile/app.json`:

```json
{
  "expo": {
    "name": "HAOS.fm",
    "slug": "haos-fm",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "fm.haos.mobile",
      "buildNumber": "1"
    }
  }
}
```

### Step 2: Create Apple App Store Listing

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Name:** HAOS.fm
   - **Primary Language:** English
   - **Bundle ID:** fm.haos.mobile (must match app.json)
   - **SKU:** haos-fm-ios
   - **User Access:** Full Access

### Step 3: Configure iOS Credentials

```bash
eas credentials
```

Choose:
- Select platform: **iOS**
- Select action: **Generate new credentials**

This creates:
- Distribution Certificate
- Provisioning Profile
- Push Notification Key (optional)

### Step 4: Build for iOS

```bash
# Development build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

Build process takes 10-20 minutes.

### Step 5: Download Build

When complete, download the `.ipa` file from:
https://expo.dev/accounts/[your-username]/projects/haos-fm/builds

### Step 6: Upload to TestFlight

#### Option A: Using EAS Submit
```bash
eas submit --platform ios
```

#### Option B: Using Transporter
1. Download Transporter from Mac App Store
2. Open Transporter
3. Drag and drop the `.ipa` file
4. Click "Deliver"

### Step 7: Configure TestFlight

1. Go to App Store Connect → TestFlight
2. Add test information:
   - Beta App Description
   - Feedback Email
   - Test Information (what to test)
3. Add internal testers
4. Add external testers (requires Beta App Review)

### Step 8: Submit for Review

1. Go to App Store Connect → App Store tab
2. Click "+" to create new version (1.0.0)
3. Fill in:
   - **What's New in This Version**
   - **Promotional Text**
   - **Description** (copy from APP_STORE_DESCRIPTION.md)
   - **Keywords**
   - **Support URL:** https://haos.fm/support
   - **Marketing URL:** https://haos.fm
4. Upload screenshots (required):
   - 6.5" Display: 3-10 screenshots
   - 5.5" Display: Optional
5. App Review Information:
   - **Demo Account:** demo@haos.fm / Demo123!
   - **Notes:** Testing instructions
6. Version Release: **Automatically release**
7. Click "Submit for Review"

**Review Time:** 1-3 days typically

---

## Android Build Process

### Step 1: Update app.json

Ensure these fields are set:

```json
{
  "expo": {
    "android": {
      "package": "fm.haos.mobile",
      "versionCode": 1
    }
  }
}
```

### Step 2: Create Google Play Listing

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name:** HAOS.fm
   - **Default language:** English
   - **App or game:** App
   - **Free or paid:** Free
4. Complete declarations:
   - Privacy Policy URL: https://haos.fm/privacy
   - Content rating questionnaire
   - Target audience
   - Data safety

### Step 3: Generate Keystore

```bash
# EAS handles this automatically, or generate manually:
keytool -genkeypair -v -storetype PKCS12 -keystore haos-upload-key.keystore -alias haos-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Save credentials securely!

### Step 4: Build for Android

```bash
# Development build (APK)
eas build --platform android --profile development

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

Build process takes 10-20 minutes.

### Step 5: Download Build

Download the `.aab` file from Expo dashboard.

### Step 6: Upload to Play Console

#### Option A: Using EAS Submit

1. Create service account:
   - Go to Google Cloud Console
   - Create service account
   - Download JSON key
   - Save as `google-play-service-account.json`
   - Grant access in Play Console

2. Submit:
```bash
eas submit --platform android
```

#### Option B: Manual Upload

1. Go to Play Console → Release → Production
2. Click "Create new release"
3. Upload the `.aab` file
4. Fill in release notes
5. Click "Save" then "Review release"

### Step 7: Complete Store Listing

1. **Main store listing:**
   - App name
   - Short description (80 chars)
   - Full description (4000 chars)
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots: 2-8 images
     - Phone: 16:9 or 9:16
     - Tablet: Optional

2. **Categorization:**
   - App category: Music & Audio
   - Tags: music, synthesizer, production

3. **Contact details:**
   - Email: hubertkozuchowski@gmail.com
   - Website: https://haos.fm
   - Phone: Optional

4. **Privacy Policy:**
   - URL: https://haos.fm/privacy

### Step 8: Content Rating

Complete IARC questionnaire:
- Violence: None
- Sexual content: None
- Language: None
- Controlled substances: None
- Result: Everyone

### Step 9: Submit for Review

1. Review all sections (must be complete)
2. Click "Send for review"
3. Select countries to distribute
4. Confirm release

**Review Time:** 3-7 days typically

---

## Build Troubleshooting

### iOS Issues

**Error: No bundle identifier found**
```bash
# Add to app.json:
"ios": {
  "bundleIdentifier": "fm.haos.mobile"
}
```

**Error: Missing provisioning profile**
```bash
eas credentials
# Generate new credentials
```

**Error: Build failed - cocoapods**
```bash
cd ios
pod install
cd ..
eas build --platform ios --clear-cache
```

### Android Issues

**Error: No package name found**
```bash
# Add to app.json:
"android": {
  "package": "fm.haos.mobile"
}
```

**Error: Build failed - Gradle**
```bash
eas build --platform android --clear-cache
```

**Error: AAPT out of memory**
```bash
# Increase heap size in eas.json:
"android": {
  "gradleCommand": ":app:bundleRelease -Dorg.gradle.jvmargs=-Xmx4096m"
}
```

---

## Testing Checklist

### Before Submission

- [ ] All features work on real device
- [ ] No crashes during normal use
- [ ] Audio works correctly
- [ ] Preset loading works
- [ ] Downloads work
- [ ] Offline mode works
- [ ] Login/logout works
- [ ] Premium features work
- [ ] Links open correctly
- [ ] App Store/Play Store metadata complete
- [ ] Screenshots uploaded
- [ ] Privacy policy accessible
- [ ] Support email responds
- [ ] Demo account works

### TestFlight Testing (iOS)

1. Invite 5-10 beta testers
2. Ask them to test:
   - Installation
   - All workspaces
   - Preset loading
   - Audio quality
   - UI/UX feedback
3. Fix critical bugs
4. Release new build if needed

### Internal Testing (Android)

1. Create Internal Testing track
2. Add testers via email
3. Distribute test build
4. Collect feedback
5. Fix issues
6. Promote to production when ready

---

## Post-Submission

### iOS App Review

**If Approved:**
- App goes live automatically (if selected)
- Or manually release when ready

**If Rejected:**
- Read rejection reason carefully
- Fix issues
- Resubmit with explanation

**Common Rejection Reasons:**
- Broken features
- Privacy policy issues
- Metadata inaccuracies
- Demo account doesn't work
- Incomplete functionality

### Android Review

**If Approved:**
- App goes live automatically
- Or use phased rollout (recommended)

**If Rejected:**
- Review reason in Play Console
- Fix issues
- Resubmit

---

## Updates

### Releasing Updates

1. Increment version numbers:
```json
{
  "version": "1.0.1",
  "ios": { "buildNumber": "2" },
  "android": { "versionCode": 2 }
}
```

2. Build new version:
```bash
eas build --platform all --profile production
```

3. Submit update:
```bash
eas submit --platform all
```

4. Fill in "What's New" notes

### Phased Rollout (Recommended)

**iOS:**
- App Store Connect → Phased Release
- Gradually releases to 1%, 2%, 5%, 10%, 20%, 50%, 100%
- Over 7 days

**Android:**
- Play Console → Managed Publishing
- Roll out to percentage of users
- Monitor crash reports
- Increase percentage if stable

---

## Monitoring

### Analytics

Track these metrics:
- Downloads
- Active users (DAU/MAU)
- Crash rate
- Retention rate
- Premium conversion rate

### Crash Reporting

Use built-in tools:
- iOS: Xcode Organizer
- Android: Play Console → Android vitals

Or integrate:
- Sentry
- Firebase Crashlytics
- Bugsnag

### User Feedback

Monitor:
- App Store reviews
- Play Store reviews
- Support emails
- Social media mentions

Respond to reviews (especially negative ones).

---

## Marketing

### Launch Strategy

1. **Soft Launch:**
   - Release in small market first
   - Test user acquisition
   - Optimize conversion
   - Fix issues

2. **Full Launch:**
   - Press release
   - Social media announcement
   - Email newsletter
   - Product Hunt launch
   - Reddit communities

3. **ASO (App Store Optimization):**
   - Optimize keywords
   - A/B test screenshots
   - Test app icon variants
   - Monitor rankings

### Pricing Strategy

**Free Version:**
- All core features
- 5 preset downloads/day
- Ads optional (currently none)

**Premium ($4.99/month or $39.99/year):**
- Unlimited preset downloads
- Priority support
- Early access to features
- No ads (if implemented)

### Conversion Optimization

- Show premium benefits
- Offer free trial (7 days)
- Limited-time discount (20% off)
- Show "Most users upgrade" message

---

## Support

### Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/

### Help

**EAS Issues:**
- Expo Discord: https://chat.expo.dev
- Expo Forums: https://forums.expo.dev

**App Store Issues:**
- Apple Developer Support
- App Store Connect Help

**Play Store Issues:**
- Google Play Support
- Developer Policy Center

---

## Costs Summary

### One-Time Costs
- Google Play Console: $25
- Domain (haos.fm): ~$12/year

### Recurring Costs
- Apple Developer Program: $99/year
- Expo EAS Build (optional): $0-29/month
- Azure hosting: ~$10-50/month
- Database: Included with Azure

### Revenue Potential
With 1000 users:
- 5% conversion rate = 50 premium users
- 50 × $4.99/month = $249.50/month
- 50 × $39.99/year = $1,999.50/year

ROI timeline: 3-6 months to break even

---

**Ready to build and ship!** 🚀

Run the builds and start the submission process. Good luck!
