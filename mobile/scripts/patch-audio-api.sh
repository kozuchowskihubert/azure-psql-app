#!/bin/bash
# Patch react-native-audio-api to allow React Native 0.81

GRADLE_FILE="node_modules/react-native-audio-api/android/build.gradle"

if [ -f "$GRADLE_FILE" ]; then
  echo "Patching react-native-audio-api to support RN 0.81..."
  sed -i.bak 's/def minimalReactNativeVersion = 76/def minimalReactNativeVersion = 74/' "$GRADLE_FILE"
  echo "✓ Patch applied successfully"
else
  echo "⚠️  Warning: $GRADLE_FILE not found"
fi
