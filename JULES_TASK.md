# Jules Task: Codebase & Build Optimization

## 🎯 Objective

Optimize the MagicAppDev monorepo for reliable, fast, and cache-friendly development. Focus on solving hard dependency issues in `apps/mobile`, ensuring CI stability, and improving the Windows build experience.

## 🏗️ Setup Instructions for Jules

- **Node/Bun**: Use `Bun (>=1.3.0)` and `Node 18+`.
- **Setup Command**: Run `bun install` at the root.

## 🛠️ Tasks for Jules

### 1. Build System Consolidation

- **Nx Integration**: Ensure `apps/web` and `apps/mobile` are first-class citizens in Nx.
- **Action**: Add missing targets to `apps/mobile/project.json` for all Expo/Android/iOS commands.
- **Action**: Verify that `bun run check` correctly triggers all necessary builds and tests without cache-misses for unchanged code.

## 🚀 Verification Steps

1. **Full Check**: `bun run check` (root)
2. **Turborepo Verification**: `bun run typecheck && bun run lint && bun run build`

## 📝 Deliverables

- Replacement of `postinstall` patch with dependency overrides (now Bun overrides).
- Shortened Android build paths in `app.json`.
- Comprehensive `project.json` for all apps.
- Verified "Zero Manual Clean" development workflow.
