# Plan: Mobile Monorepo Reintegration + Capacitor/Ionic Upgrade

> Status: PROPOSED · Created: 2026-08-26 · Owner: TBD

## Goal

Absorb `apps/mobile` (currently a git submodule) back into the MagicAppDev monorepo as a
first-class Bun workspace, then upgrade Capacitor and Ionic to their latest versions:

| Package                                | Current | Latest                    | Jump         |
| -------------------------------------- | ------- | ------------------------- | ------------ |
| `@capacitor/core` / `cli` / `android`  | 8.2.0   | **8.5.0**                 | minor        |
| `@capacitor/*` plugins                 | 8.0.x   | 8.0.x latest              | patch/minor  |
| `@ionic/react` / `@ionic/react-router` | ^8.8.1  | **9.0.0**                 | **major**    |
| `ionicons`                             | ^8.0.13 | 8.1.0                     | minor        |
| `react-router-dom`                     | 5.3.4   | 6.x (required by Ionic 9) | **major ×2** |

## Critical Constraint Discovered

`@ionic/react-router@9` declares `react-router-dom: >=6.4.0 <7`. The mobile app is on
**react-router v5** (`Switch`/`useHistory` API). The Ionic 9 upgrade therefore **requires**
a react-router v5 → v6 migration first. Web already runs `react-router-dom@7`, but Ionic 9
does not yet support v7 — mobile must target **v6** (not match web).

## Non-Goals

- No functional changes to the mobile app beyond what upgrades force.
- No iOS tooling work (no macOS runner available); Android-only validation.
- Web/API packages untouched except lockfile/workspace manifests.

---

## Phase 0 — Safety Net

1. Tag pre-migration state: `git tag pre-mobile-reintegration`.
2. Keep `apps/mobile` remote fork intact (submodule source repo remains the history
   archive; we do not rewrite it).
3. Verify a clean `bun install && bun run build` baseline on `main` before starting.

## Phase 1 — Un-submodule & Absorb (mechanical)

1. `git submodule deinit -f apps/mobile`
2. `git rm -f apps/mobile` → removes `.gitmodules` entry + gitlink.
3. Delete stale `node_modules` inside mobile; re-add sources:
   - Preferred: re-add mobile source tree WITHOUT its `.git` (fresh copy at current
     submodule SHA `74da80b`) via `git clone --no-checkout` + checkout of pinned SHA,
     or simply restore files from the submodule working dir before deinit.
4. Root `package.json`: extend `"workspaces"` → `["apps/web", "apps/mobile", "packages/*"]`.
5. Remove mobile's local `bun.lock` (single root lockfile policy).
6. `bun install` at root — confirm mobile deps resolve into root lockfile; watch for:
   - Mobile pins `react 19.2.4` exact + root override `react ^19` → compatible.
   - Mobile devDeps (`cypress`?, `jest@30`, `@capacitor/cli`) join root graph — check
     `trustedDependencies` coverage for any new script-running packages.
7. Update `AGENTS.md`/`CLAUDE.md` "Mobile Repo Boundary" sections — no longer independent;
   commands run from monorepo root via `bun --filter`/turbo.
8. Commit: `chore: absorb apps/mobile into monorepo workspace`.

### Metro/Bundler adjustments

- `apps/mobile/metro.config.js`: replace legacy pnpm-cache `blockList` patterns with
  Bun-era equivalents; ensure `watchFolders` = monorepo root; `nodeModulesPaths` includes
  root `node_modules`.
- Confirm `resolutions`/overrides don't duplicate React copies across workspaces
  (root override already forces single React 19).

## Phase 2 — Turbo/Nx Registration

1. Add minimal `apps/mobile/project.json` (Nx) or rely on package.json scripts detection.
2. `turbo.json`: mobile scripts (`build`, `lint`, `typecheck`, `test.unit`) map onto
   existing task names — verify `tsc && vite build` fits `build` outputs glob
   (`dist/**` already covered).
3. `knip.json`: add `apps/*` already covers mobile; audit new false positives.
4. CI (`ci.yml`): Nx affected will now include mobile targets — confirm Android SDK-less
   lint/typecheck/build (vite) pass on ubuntu runners (no native build in CI).

## Phase 3 — Capacitor 8.2.0 → 8.5.0 (low risk)

1. `bun update @capacitor/core @capacitor/cli @capacitor/android @capacitor/app
@capacitor/browser @capacitor/haptics @capacitor/keyboard @capacitor/preferences
@capacitor/status-bar` (workspace-scoped).
2. `bunx cap sync android`.
3. Sanity: `cd apps/mobile/android && ./gradlew assembleDebug` (local or existing
   Docker flow). Patch-version drift inside 8.x should not change Gradle contracts.

## Phase 4 — React Router 5 → 6 (prerequisite for Ionic 9) 🔴 highest effort

1. Bump `react-router-dom` → `^6.30.x`; drop legacy `react-router@5` + `@types/react-router@5`.
2. Code migration checklist:
   - `<Switch>` → `<Routes>`; route children syntax.
   - `useHistory()` → `useNavigate()`; `history.push` → `navigate`.
   - `<Redirect>` → `<Navigate>`; `exact` prop removed.
   - `withRouter` HOC usages → hooks.
3. Grep-driven sweep: `rg "useHistory|Switch|Redirect|withRouter" apps/mobile/src`.
4. Full manual smoke of auth flow, project list, chat streaming navigation.

## Phase 5 — Ionic React 8 → 9

1. Bump `@ionic/react`, `@ionic/react-router` → `^9.0.0`, `ionicons` → `^8.1.0`.
2. Review Ionic 9 breaking changes (verify against official changelog during execution —
   release is fresh; expect CSS token renames + deprecated component removals).
3. `bunx cap sync android`; visual pass on light/dark themes.
4. Run `test.unit` suite; fix snapshots/theme-token fallout.

## Phase 6 — Workflow Consolidation

Current mobile-owned workflows: `codeql.yml`, `mobile-ci.yml`, `mobile-debug.yml`
(live under `apps/mobile/.github/workflows/`).

Options (decide before execution):

- **A (recommended):** Retire mobile-scoped workflows; add a root
  `.github/workflows/mobile.yml` with `paths: ['apps/mobile/**']` filter running
  lint/typecheck/unit + optional debug APK artifact. CodeQL folds into root config.
- **B:** Keep them functioning post-absorption (GitHub supports workflow dirs only at
  repository root — they WILL stop running after absorption, so Option B is not viable;
  documenting here to make the breakage explicit).
- Existing `Dockerfile.android` / `docker-compose.android.yml` at repo root remain the
  APK build path; re-point any workflow references.

## Verification Matrix

| Check                      | Command                                   | Gate                 |
| -------------------------- | ----------------------------------------- | -------------------- |
| Install determinism        | `bun install --frozen-lockfile`           | zero drift           |
| Typecheck all incl. mobile | `bun run typecheck`                       | 16/16 tasks          |
| Unit tests                 | `bun run test`                            | green                |
| Lint                       | `bun run lint`                            | green                |
| Web regression             | `bun run build` (turbo)                   | 15+/15+              |
| Native sync                | `bunx cap sync android`                   | no plugin mismatches |
| APK build                  | gradle/Docker assembleDebug               | artifact produced    |
| Manual                     | auth → projects → chat on device/emulator | flows OK             |

## Risks & Rollback

- Router v6 migration regressions → mitigated by Phase 4 isolation (separate commit,
  revertible independently).
- Single-lockfile merge conflicts with future upstream mobile commits (submodule was
  independently versioned) → after absorption, mobile evolves only in-monorepo; tag
  `pre-mobile-reintegration` enables full revert.
- Ionic 9 fresh-release churn → if blockers appear, ship Phases 1–3 (reintegration +
  Cap 8.5) and defer Phases 4–5 behind a tracked issue.

## Suggested Commit Series

```
chore: absorb apps/mobile into monorepo workspace
chore: register mobile in turbo/nx pipelines
chore(deps): bump capacitor toolchain to 8.5.0
refactor(mobile): migrate react-router v5 → v6
chore(deps): upgrade ionic react to 9.0.0
ci: consolidate mobile workflows into root pipeline
docs: update mobile boundary documentation
```

## Open Questions

1. Preserve submodule git history via `git subtree` merge, or start clean from the
   pinned SHA snapshot (recommended — history remains reachable in the old repo)?
2. Should mobile rejoin BEFORE or AFTER the pending Bun-migration PR merges to keep
   diffs isolated?
3. Ionic 9 vs staying on Ionic 8 until 9.1 patch releases — acceptable to defer?
