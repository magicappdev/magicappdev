#!/usr/bin/env bash

set -e

echo "🐳 Building Android APK with Docker..."
echo ""

# Ensure Docker is running
if ! docker version &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to mobile app directory
cd apps/mobile || exit 1

# Install dependencies if needed
echo "📚 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing node_modules..."
    pnpm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
docker-compose -f ../docker-compose.android.yml run --rm android-builder bash -c "
    rm -rf android/.gradle android/.cxx android/app/build
"

# Build the APK
echo "🔨 Building APK (this will take several minutes)..."
docker-compose -f ../docker-compose.android.yml run --rm android-builder bash -c "
    cd android && ./gradlew clean assembleDebug --no-daemon
"

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📱 APK location: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk"

    # Copy APK to project root for easy access
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk ../Magic-App-Dev-Debug.apk
        echo "📦 APK copied to: Magic-App-Dev-Debug.apk"
    fi

    # Get APK size
    apk_size=$(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo "📊 APK size: $apk_size"

    echo ""
    echo "💡 To install the APK on your device:"
    echo "   adb install -r Magic-App-Dev-Debug.apk"
else
    echo ""
    echo "❌ Build failed. Check the output above for errors."
    exit 1
fi
