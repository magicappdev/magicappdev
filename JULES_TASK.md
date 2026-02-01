# Jules Task: Codebase & Build Optimization

## 🎯 Objective

Optimize the MagicAppDev monorepo for reliable, fast, and cache-friendly development. Focus on solving hard dependency issues in `apps/mobile`, ensuring CI stability, and improving the Windows build experience.

## 🏗️ Setup Instructions for Jules

- **Node/pnpm**: Use `pnpm@10.x` and `Node 18+`.
- **Setup Command**: Run `pnpm install` at the root.

## 🛠️ Tasks for Jules

### 1. Robust `expo-router` Patching (High Priority)

- **Problem**: `scripts/patch-expo-router.cjs` is fragile and manually modifies `node_modules`. This often fails in CI or leaves packages unpatched if the folder structure slightly differs.
- **Action**: Use `pnpm patch expo-router` to apply the React 18 compatibility fixes (replacing `use()` with `useContext()`).
- **Action**: Remove `scripts/patch-expo-router.cjs` and the `postinstall` hook once the patch is successfully integrated into `pnpm-lock.yaml`.

### 2. Windows Path Length Optimization (High Priority)

- **Goal**: Prevent Gradle CXX cache failures (260 char limit).
- **Action**: In `apps/mobile/app.json`, use `expo-build-properties` to move the Android build directory or configure Gradle to use a shorter path (e.g., `./build` or a flat structure).
- **Action**: Consider setting `android.buildCacheDir` in `gradle.properties` if possible.

### 3. Build System Consolidation

- **Nx Integration**: Ensure `apps/web` and `apps/mobile` are first-class citizens in Nx.
- **Action**: Add missing targets to `apps/mobile/project.json` for all Expo/Android/iOS commands.
- **Action**: Verify that `pnpm run check` correctly triggers all necessary builds and tests without cache-misses for unchanged code.

### 4. Metro Config Verification

- **Done**: `apps/mobile/metro.config.js` has been updated to use dynamic `require.resolve` for `extraNodeModules`.
- **Action**: Verify this fix works in CI and doesn't introduce regressions locally.

## 🚀 Verification Steps

1. **Full Check**: `pnpm run check` (root)
2. **Nx Verification**: `npx nx run-many --target=lint,typecheck,build,test --all`
3. **Mobile Bundle Test**: `cd apps/mobile && npx expo export` (to verify Metro bundling works for production)
4. **Doctor**: `cd apps/mobile && npx expo-doctor`

## 📝 Deliverables

- Replacement of `postinstall` patch with `pnpm patch`.
- Shortened Android build paths in `app.json`.
- Comprehensive `project.json` for all apps.
- Verified "Zero Manual Clean" development workflow.
