#!/usr/bin/env pwsh

Write-Host "🐳 Building Android app with Docker..." -ForegroundColor Green

# Build and start the Docker container
docker-compose -f docker-compose.android.yml build --no-cache android-builder

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green
Write-Host ""
Write-Host "📦 To build the Android APK, run:" -ForegroundColor Yellow
Write-Host "   .\scripts\build-android-apk-docker.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To start the dev server, run:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.android.yml run android-builder pnpm start" -ForegroundColor Cyan
