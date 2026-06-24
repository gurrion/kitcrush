#!/bin/bash
# KitCrush — Android Build Script
set -e

echo "🐱 KitCrush — Building for Android..."
echo ""

# Step 1: Build web app
echo "📦 Step 1: Building web app..."
npm run build
echo "✅ Web build complete"
echo ""

# Step 2: Install Capacitor Android (if not already)
echo "📱 Step 2: Setting up Capacitor Android..."
npm install @capacitor/android 2>/dev/null || true

# Check if Android platform exists
if [ ! -d "android" ]; then
  echo "  Adding Android platform..."
  npx cap add android
else
  echo "  Android platform already exists"
fi
echo "✅ Android platform ready"
echo ""

# Step 3: Sync web → Android
echo "🔄 Step 3: Syncing web assets to Android..."
npx cap sync android
echo "✅ Sync complete"
echo ""

# Step 4: Open in Android Studio (if available)
echo "🏗️ Step 4: Opening in Android Studio..."
if command -v studio &> /dev/null; then
  npx cap open android
elif command -v android-studio &> /dev/null; then
  npx cap open android
else
  echo "  ⚠️ Android Studio not found in PATH"
  echo "  Open android/ folder manually in Android Studio"
  echo ""
  echo "  Or build from command line:"
  echo "    cd android && ./gradlew assembleDebug"
  echo "    APK: android/app/build/outputs/apk/debug/app-debug.apk"
fi
echo ""

echo "🎉 Done! Your KitCrush Android app is ready."
echo ""
echo "📱 Next steps:"
echo "  1. Open Android Studio → Run on emulator/device"
echo "  2. Build → Generate Signed Bundle/APK for Play Store"
echo "  3. APK location: android/app/build/outputs/"
