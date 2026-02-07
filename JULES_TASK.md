# Jules Task: Codebase & Build Optimization

## 🎯 Objective

Optimize the MagicAppDev monorepo for reliable, fast, and cache-friendly development. Focus on solving hard dependency issues in `apps/mobile`, ensuring CI stability, and improving the Windows build experience.

## 🏗️ Setup Instructions for Jules

- **Node/pnpm**: Use `pnpm@10.x` and `Node 18+`.
- **Setup Command**: Run `pnpm install` at the root.

## 🛠️ Tasks for Jules

### 1. Build System Consolidation

- **Nx Integration**: Ensure `apps/web` and `apps/mobile` are first-class citizens in Nx.
- **Action**: Add missing targets to `apps/mobile/project.json` for all Expo/Android/iOS commands.
- **Action**: Verify that `pnpm run check` correctly triggers all necessary builds and tests without cache-misses for unchanged code.

## 🚀 Verification Steps

1. **Full Check**: `pnpm run check` (root)
2. **Nx Verification**: `npx nx run-many --target=lint,typecheck,build,test --all`

## 📝 Deliverables

- Replacement of `postinstall` patch with `pnpm patch`.
- Shortened Android build paths in `app.json`.
- Comprehensive `project.json` for all apps.
- Verified "Zero Manual Clean" development workflow.
