# Deployment Guide - January 23, 2026

## 🚀 Pre-Deployment Verification Steps

### 1. Test Mobile App Locally

```bash
# Navigate to mobile directory
cd D:\repos\magicappdev\apps\mobile

# Option A: Clean all caches and reinstall
pnpm run clean:all

# Option B: Just clear Metro cache
nx run mobile:start:reset

# Start the development server
nx run mobile:start
```

### 2. Verify Dark Mode

1. Open the app
2. Navigate to Settings
3. Test all three theme modes:
   - Light (should force light theme)
   - Dark (should force dark theme)
   - Auto (should follow system theme)

### 3. Test Android Build

```bash
# Clean build artifacts first
nx run mobile:clean:android

# Build Android APK
nx run mobile:build:apk
```

**Expected Result**: No CMake path length warnings, build completes successfully

### 4. Run Lint and Typecheck

```bash
# Lint mobile app
nx run mobile:lint

# Typecheck mobile app
nx run mobile:typecheck
```

**Expected Result**: No errors

---

## 📦 Changes to Deploy

### Files Modified/Created

#### Mobile App
- `apps/mobile/metro.config.js` - Updated blockList with pnpm-cache patterns
- `apps/mobile/package.json` - Added React resolution, clean scripts
- `apps/mobile/contexts/ThemeContext.tsx` - Dark mode theme provider
- `apps/mobile/constants/theme.ts` - Theme definitions
- `apps/mobile/app/_layout.tsx` - ThemeProvider integration
- `apps/mobile/app/settings.tsx` - Theme toggle UI
- `apps/mobile/app.json` - PNG icons, removed light mode lock
- `apps/mobile/assets/*.png` - Converted from JPG

#### Database
- `packages/database/src/schema/api-keys.ts` - API keys table schema
- `packages/database/src/schema/index.ts` - Export api-keys schema
- `packages/database/drizzle/0003_api_keys_table.sql` - Migration file

#### CI/CD
- `.github/workflows/mobile-ci.yml` - Mobile CI/CD workflow

#### CLI
- `packages/cli/src/commands/completions.ts` - Shell completions command
- `packages/cli/src/cli.ts` - Completions command registration

#### Documentation
- `docs/plans/comprehensive-implementation-plan.md` - Updated plan
- `Plan.md` - Updated with recent improvements

---

## 🗄️ Deployment Steps

### 1. Commit Changes

```bash
# Stage all changes
git add .

# Review staged changes
git status

# Commit with descriptive message
git commit -m "feat: mobile enhancements and ci/cd improvements

- Convert app icons from JPG to PNG with transparency support
- Implement full dark mode support (Light/Dark/Auto modes)
- Fix Metro bundler SHA-1 errors on Windows/pnpm
- Fix Android build CMake path length issues
- Add React resolution to prevent duplicate React instances
- Add shell completions command to CLI
- Add API keys table schema for configurable AI providers
- Create mobile CI/CD workflow for automated testing/builds

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 2. Push Changes

```bash
# Push to main branch
git push origin main
```

### 3. Run Database Migration

The migration will be automatically applied by the CI/CD pipeline, but you can also run it manually:

```bash
# Using wrangler (from root)
cd packages/database
npx drizzle-kit generate
npx drizzle-kit push

# Or via nx
nx run database:migrate
```

### 4. Verify CI/CD

Check the GitHub Actions workflows:
- **CI Pipeline** (`.github/workflows/ci.yml`): Should run linting, typechecking, and building
- **Mobile CI** (`.github/workflows/mobile-ci.yml`): Should test and build mobile app

---

## 🔍 Verification Checklist

### Mobile App
- [ ] Metro bundler starts without SHA-1 errors
- [ ] File watching works (make changes, see fast refresh)
- [ ] Dark mode works in all three modes
- [ ] Android build completes without CMake warnings
- [ ] App icons display correctly with transparency
- [ ] Settings screen theme toggle works

### CLI
- [ ] CLI builds without errors (`nx run cli:build`)
- [ ] `magicappdev completions bash --print` outputs valid bash completion
- [ ] Linting passes (`nx run cli:lint`)

### Database
- [ ] Migration runs successfully
- ] API keys table created in D1 database

### CI/CD
- [ ] CI pipeline passes on push
- [ ] Mobile CI pipeline runs and completes

---

## 🎯 Post-Deployment Tasks

### 1. Configure API Keys (New Feature)

After the migration, users can add API keys through the UI:

**Providers Supported:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini Pro)
- OpenRouter
- Zai
- Workers AI (default, already configured)

**API Endpoint Usage:**
```typescript
// POST /api/ai/chat
{
  "messages": [...],
  "provider": "openai",  // or "anthropic", "gemini", etc.
  "model": "gpt-4",
  "stream": true
}
```

### 2. Monitor CI/CD

Check:
- [ ] GitHub Actions workflows run successfully
- [ ] Mobile app builds complete
- [ ] All tests pass

### 3. Test in Production

- [ ] Test dark mode on production mobile app
- [ ] Verify Metro bundler works in production
- [ ] Test Android app built via CI

---

## 🚨 Known Issues to Monitor

### 1. CLI Build Module Resolution
The completions command is complete in source and passes lint/typecheck, but running the compiled CLI directly may fail with module resolution errors for the shared package (zod dependency not found).

**Workaround**: Use `pnpm exec magicappdev <command>` or `nx run cli -- <command>` instead of running node directly on dist/cli.js.

**Root Cause**: pnpm workspace structure + Node.js ES subpath exports requires dist/package.json with dependencies. Added build script to create this, but direct node execution still has issues.

### 2. Bun Package Manager
Switching to bun caused React duplicate issues. **Stick with pnpm** for now.

### 3. Metro Bundler with pnpm dlx cache
Files in `C:\Users\lukas\AppData\Local\pnpm-cache\dlx\` are blocked but may still cause issues. Using polling helps mitigate this.

### 4. Fixed: Mobile package.json structure
- Removed `developmentClient` config from inside `dependencies` object (invalid location)
- Updated clean scripts to use `npx rimraf` for Windows compatibility
- Added react-dom to root resolutions

---

## 📝 Rollback Plan

If issues occur after deployment:

### Immediate Rollback
```bash
# Revert last commit
git revert HEAD

# Or rollback to specific commit
git reset --hard <commit-hash>

# Push rollback
git push origin main --force
```

### Database Rollback
```bash
# Revert migration
cd packages/database
npx drizzle-kit migrate --custom "0002_tickets_table.sql"
```

---

## 🎊 Success Criteria

Deployment is successful when:
- ✅ All CI/CD pipelines pass
- ✅ Mobile app builds successfully on local and CI
- ✅ Dark mode works in production
- ✅ No Metro bundler SHA-1 errors
- ✅ Database migration applies successfully
- ✅ CLI completions command works

---

## 📞 Support

If issues arise:
1. Check GitHub Actions logs
2. Review mobile app logs
3. Verify environment variables in Cloudflare Workers
4. Check database schema in D1 dashboard
