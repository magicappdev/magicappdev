# MagicAppDev Vibe-Coding Platform - Comprehensive Execution Plan

## Mission

Provide a production-ready, zero-cost (Cloudflare Free Tier) platform enabling non-technical users ("vibe coders") to build, scaffold, preview, and deploy full-stack web and mobile apps purely through natural language prompts. Projects are scaffolded via CLI or stored in Cloudflare D1 and synchronized directly to the user's GitHub account upon login.

---

## Phase 1: Repository Refactoring & Pipeline Enforcement (✅ Completed)

- Consolidated documentation files (`Agents.md`, `.agents/skills/`).
- Added strict pipeline verification scripts and marker (`bun run verify`, `bun run verify:mark`) in root `package.json`.
- Set up root `opencode.json` with strict tool rules and agent permissions.
- Implemented Pipeline Gate plugin (`.opencode/plugin/pipeline-gate.ts`) enforcing verification before deployment.
- Initialized persistent state tracker at `plan/repo-refactoring.md`.

---

## Phase 2: Free Cloudflare AI Models & Chat Agent Model List Update

- **Goal**: Update outdated model lists in the AI chat agent and worker backend to support current free Cloudflare Workers AI models (e.g., `@cf/meta/llama-3.3-70b-instruct-fp8`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`, etc.) alongside BYOK (Bring Your Own Key) options.
- **Tasks**:
  1. Inspect AI provider router in backend (`packages/api/src/routes/ai.ts` or agent modules).
  2. Update available default models to current Cloudflare Workers AI endpoints.
  3. Verify streaming responses and fallback behavior when BYOK keys are absent.

---

## Phase 3: Fix Admin Portal Infinite Loading on Web App (`apps/web`)

- **Goal**: Resolve infinite spinner/loading state on the admin portal route.
- **Tasks**:
  1. Inspect admin routes and page components under `apps/web/src/pages/admin/` or similar.
  2. Check authentication token passing and API client error handling on admin endpoints (`/admin/...`).
  3. Ensure proper error catching and fallback UI instead of unhandled promise rejections blocking the render thread.

---

## Phase 4: Fix Project Page Auth Session Recognition

- **Goal**: Ensure the project workspace page (`apps/web/src/pages/projects/workspace.tsx`) correctly reads the user's JWT session from `ApiClient` / `localStorage` without hanging or redirecting unexpectedly.
- **Tasks**:
  1. Review auth check middleware in `apps/web` project views.
  2. Fix token synchronization with `@magicappdev/shared` `ApiClient`.

---

## Phase 5: Fix BYOK Settings Page Session & Saving Issues

- **Goal**: Ensure the BYOK settings page (`apps/web/src/pages/settings/ai-provider.tsx`) correctly loads user settings, persists API keys securely via backend encryption, and handles session expiry gracefully.
- **Tasks**:
  1. Check API contract for saving user AI keys in `packages/database/src/schema/user-ai-keys.ts` and API handlers.
  2. Fix form submission state and token attachment.
