# Android Docker Build

This Docker-based build system bypasses Windows path length limitations when building the Android app.

## Prerequisites

- Docker Desktop for Windows installed and running
- At least 8GB of RAM allocated to Docker
- At least 20GB of disk space for Docker images

## Quick Start

### 1. Build the Docker Image

```powershell
.\scripts\build-android-docker.ps1
```

Or using bash:

```bash
./scripts/build-android-docker.sh
```

### 2. Build the Android APK

```powershell
.\scripts\build-android-apk-docker.ps1
```

Or using bash:

```bash
./scripts/build-android-apk-docker.sh
```

The APK will be output to:

- `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- `Magic-App-Dev-Debug.apk` (copied to project root for convenience)

## Manual Docker Commands

### Start an Interactive Shell

```powershell
docker-compose -f docker-compose.android.yml run android-builder bash
```

### Install Dependencies

```powershell
docker-compose -f docker-compose.android.yml run android-builder pnpm install
```

### Run Expo Start

```powershell
docker-compose -f docker-compose.android.yml run --service-ports android-builder pnpm start
```

### Clean Build

```powershell
docker-compose -f docker-compose.android.yml run android-builder bash -c "cd android && ./gradlew clean"
```

## Troubleshooting

### Docker out of space

Clean up unused Docker resources:

```powershell
docker system prune -a
```

### Build is slow

The first build will be slow as Docker downloads dependencies. Subsequent builds use cached volumes and are much faster.

### Permission issues on Windows

Make sure Docker Desktop has access to your drives:

1. Open Docker Desktop
2. Go to Settings → Resources → File Sharing
3. Add the drive where your project is located

### Port conflicts

If port 8081 is already in use:

1. Either stop the process using it, or
2. Change the port in `docker-compose.android.yml`

## Why Docker?

The nested `node_modules/.pnpm/` structure creates paths like:

```
D:/repos/magicappdev/node_modules/.pnpm/react-native-reanimated@3.1_d10c710d43f16e049fed1fa084b440b8/node_modules/react-native-reanimated/android/.cxx/Debug/2k542s37/arm64-v8a/src/main/cpp/reanimated/CMakeFiles/reanimated.dir/./
```

These exceed Windows' 250-character limit for CMake builds. Linux (in Docker) doesn't have this limitation.

## Cache Volumes

The setup uses Docker volumes for:

- `android-cache`: Android SDK and AVD files
- `gradle-cache`: Gradle dependencies and build cache
- `node-modules-cache`: node_modules

These persist between builds, making subsequent builds much faster.

## Building Release APK

For a release build, modify the script to use `assembleRelease` instead of `assembleDebug`:

```bash
cd android && ./gradlew assembleRelease --no-daemon
```

Note: Release builds require signing configuration.
