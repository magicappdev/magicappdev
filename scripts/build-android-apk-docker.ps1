#!/usr/bin/env pwsh

Write-Host "📦 Building Android APK with Docker..." -ForegroundColor Green

# Ensure Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Navigate to mobile app directory
Push-Location apps\mobile

# Install dependencies if needed
Write-Host "📚 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing node_modules..." -ForegroundColor Cyan
    pnpm install
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
docker-compose -f ../../docker-compose.android.yml run --rm android-builder bash -c "
    rm -rf android/.gradle android/.cxx android/app/build
"

# Build the APK
Write-Host "🔨 Building APK (this will take several minutes)..." -ForegroundColor Yellow
docker-compose -f ../../docker-compose.android.yml run --rm android-builder bash -c "
    pnpm install && cd android &&  ./gradlew --stop && ./gradlew clean assembleDebug --no-daemon --no-build-cache
"

# Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host "📱 APK location: apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan

    # Copy APK to project root for easy access
    if (Test-Path "android/app/build/outputs/apk/debug/app-debug.apk") {
        Copy-Item "android/app/build/outputs/apk/debug/app-debug.apk" -Destination "../Magic-App-Dev-Debug.apk" -Force
        Write-Host "📦 APK copied to: Magic-App-Dev-Debug.apk" -ForegroundColor Cyan
    }

    # Get APK size
    $apkSize = (Get-Item "android/app/build/outputs/apk/debug/app-debug.apk").Length / 1MB
    Write-Host "📊 APK size: $($apkSize.ToString('F2')) MB" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check the output above for errors." -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}

Pop-Location

Write-Host ""
Write-Host "💡 To install the APK on your device:" -ForegroundColor Yellow
Write-Host "   adb install -r Magic-App-Dev-Debug.apk" -ForegroundColor Cyan
