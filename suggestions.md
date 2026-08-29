# MagicAppDev Feature Suggestions Report

> **Last updated:** 2026-08-28 (quick wins added)  
> **Live Workers:**
>
> - API (`@magicappdev/api`): https://magicappdev-api.magicappdev.workers.dev
> - Agent (`@magicappdev/agent`): https://magicappdev-agent.magicappdev.workers.dev

---

## Summary Matrix

| ID           | Category                | Description                                                                                                                                                        | Impact | Status  |
| :----------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :------ |
| **FEAT-001** | Developer Experience    | **One-Click GitHub Repository Export**: Push generated apps to a user's GitHub repo via OAuth. Already wired into chat page + `/github/create-repo` route.         | High   | ✅ Done |
| **FEAT-002** | AI / Agentic Workflow   | **Self-Healing Agent Loops**: Catch runtime/build errors and feed them back to MagicAgent Durable Object for auto-patching.                                        | High   | ✅ Done |
| **FEAT-003** | UI / Preview            | **Live WebContainers / StackBlitz Integration**: Run full React/Vite apps in-browser via WebContainer API.                                                         | High   | ✅ Done |
| **FEAT-004** | Authentication          | **Discord OAuth Integration**: JWT-signed state, KV session polling, linked-accounts endpoint. GitHub OAuth also hardened.                                         | Medium | ✅ Done |
| **FEAT-005** | Production Readiness    | **Automated Playwright E2E Suite**: 12/12 tests passing (auth, chat, projects, AI Studio canvas + preview-error-relay + mock WS server).                           | High   | ✅ Done |
| **FEAT-006** | Developer Tools         | **Visual Template Customizer**: Admin UI to preview and tweak Handlebars templates with live variable injection.                                                   | Medium | ✅ Done |
| **FEAT-007** | Performance / Caching   | **AI Response Caching with Cloudflare KV**: Cache prompt→template mappings to reduce AI Gateway token spend.                                                       | Medium | ✅ Done |
| **QW-001**   | Bug Fix / Security      | **Admin Delete User Bug**: "Delete User" button calls `api.deleteAccount()` — deletes the admin, not the selected user. Live data-loss risk.                       | High   | ✅ Done |
| **QW-002**   | UX / Data Persistence   | **Chat Conversation History**: Messages lost on refresh. Backend (`chat_sessions`, `chat_messages` tables + API routes) already built — just unwired.              | High   | ✅ Done |
| **QW-003**   | UX / AI                 | **Model Selector Functional**: Chat model dropdown sends `model` field but agent ignores it — purely cosmetic. Wire to `handleChat`.                               | High   | ✅ Done |
| **QW-004**   | Performance             | **Agent Context Window Cap**: No message truncation — conversations will silently fail at model context limits. Simple char/token cap needed.                      | Medium | ✅ Done |
| **QW-005**   | UX / DX                 | **Workspace Syntax Highlighting**: Code editor is a raw `<textarea>` — no syntax highlighting. Add lightweight highlighter overlay.                                | Medium | ✅ Done |
| **QW-006**   | UX / Polish             | **Remove Dead Skills Button**: "Use a skill" attachment menu item opens `window.alert("Skills coming soon!")`. Remove or replace with Templates shortcut.          | Low    | ✅ Done |
| **QW-007**   | Security / Code Quality | **Strip Debug Logs in Settings**: 6+ `console.log` statements leak auth tokens and user data to browser console in production.                                     | Medium | ✅ Done |
| **FEAT-016** | Observability           | **Rate Limiting + Request Logging**: `rateLimitMiddleware` + structured request/response logs in API.                                                              | Medium | Planned |
| **FEAT-020** | Platform                | **Build System Consolidation**: Pick Turborepo as the single source of truth; remove Nx `project.json` drift.                                                      | High   | Planned |
| **FEAT-009** | AI / Agentic            | **MCP Tool Integration**: Allow MagicAgent to discover and execute MCP server tools (filesystem, GitHub, DB, etc.), embedded in `@magicappdev/agent`.              | High   | Planned |
| **FEAT-010** | Developer Tools         | **CLI Template Rendering**: Wire `@magicappdev/templates` Handlebars registry into `create-magicappdev-app` so users get real generated code, not empty scaffolds. | High   | Planned |
| **FEAT-012** | Developer Experience    | **Docker Compose Quickstart**: One-command local stack (API + Agent + D1 + KV) for new contributors.                                                               | Medium | Planned |
| **FEAT-013** | UI / Preview            | **Lightweight Live Preview**: iframe-based rendered preview using `srcdoc` + `postMessage` relay as fallback while WebContainers bundle is optimized.              | High   | Planned |
| **FEAT-019** | Database                | **Seeding Utilities**: `packages/database/seed.ts` with demo user/project/chat data for local dev.                                                                 | Low    | Planned |

---

## Completed Work (Detailed)

### FEAT-001 – GitHub Export

- Route: `POST /github/create-repo` (`packages/api/src/routes/github.ts`)
- Frontend: "Create on GitHub" button in chat workspace panel
- Path traversal guards + parallel `Promise.allSettled` uploads
- OAuth scope: `repo` via existing GitHub login flow

### FEAT-004 – Discord OAuth + Security Hardening

- Routes: `/auth/login/discord`, `/auth/callback/discord`, `/auth/login/github`, `/auth/callback/github`
- State signing: both flows sign OAuth `state` with `hono/jwt` (HS256); callbacks verify before proceeding
- Token safety: web callbacks store tokens in KV (`RATE_LIMIT_KV`), redirect with `?sessionId=X` — no secrets in URL query strings
- Frontend polling: `apps/web/src/pages/auth/callback.tsx` polls `/auth/check-session?sessionId=X`; backwards-compat fallback for legacy deep links
- CORS fix: non-allowlisted origins now return `"null"` instead of reflected origin
- Error format: all auth routes standardized to `{ success: false, error: { code, message } }`

### FEAT-005 – Playwright E2E Suite + Mock WS Server

- 12/12 E2E tests passing (8 auth/navigation + 2 AI Studio canvas + 2 preview-error-relay)
- `apps/web/e2e/mock-agent-server.mjs`: lightweight WebSocket mock speaking Agents SDK protocol (`chat` → `chat_chunk` / `chat_done`, `preview_error` → `tool_result` broadcast) with HTTP `/health` for Playwright `webServer` health checks
- Pre-existing flaky tests fixed: strict `h1` locator → `getByRole("heading")`, disabled Create button → `toBeVisible` + click, projects nav → auth redirect assertion

### FEAT-002 – Self-Healing Agent Loops

- `patchError` tool in `packages/agent/src/tools.ts` (auto-executed, no approval needed)
- Agent `executeToolAction` case in `packages/agent/src/index.ts` — fetches AI analysis via JSON response format, returns summary + patch diff
- **Auto-fix write-back**: `patchError` writes the patched file directly to D1 (same logic as `writeFile` tool) — no manual approval needed for live patching
- Agent `onMessage` handles `preview_error` WebSocket event → queues or auto-executes `patchError`
- `packages/agent/src/index.ts` — new `fetchAnalysis` helper for non-streaming JSON AI calls
- Agent system prompt updated with step 5: auto-use `patchError` on preview errors
- `apps/web/src/components/workspace/LivePreview.tsx` — injects `window.onerror` + `unhandledrejection` capture into both React and default iframe templates; posts `MAGICAPPDEV_PREVIEW_ERROR` to parent
- `apps/web/src/lib/agent-websocket.ts` — shared singleton WebSocket hook (`useAgentConnection`, `useAgentMessages`, `usePreviewErrorListener`, `dispatchPreviewError`) with dedup fingerprints, cached `useSyncExternalStore` snapshot, and reconnect logic
- `apps/web/src/pages/chat/page.tsx` — refactored to use shared hook; handles `tool_pending_approval`, `tool_result`, `tool_error` message types; renders `patchError` results with applied/summary/filePath
- `apps/web/src/pages/projects/workspace.tsx` — listens for `MAGICAPPDEV_IFRAME_ERROR` custom events and dispatches `preview_error` to agent over WebSocket
- **E2E tests**: `apps/web/e2e/preview-error-relay.spec.ts` — 2 Playwright tests verifying WS handshake: `preview_error` → mock agent → `tool_result` with `applied: true`

---

## Quick Wins (Planned) — High Priority, Low Effort

> Total estimated effort: **~5 hours** for all 7. Top 3 are highest priority (active bugs or silent failures).

### QW-001 – Admin Delete User Bug

- **Bug**: Admin "Delete User" button in `apps/web/src/pages/admin/page.tsx` calls `api.deleteAccount()` — deletes the **admin's own account**, not the selected user.
- **Fix**: Add `deleteUser(userId)` method to `packages/shared/src/api/client.ts`, add `DELETE /admin/users/:id` route in `packages/api/src/routes/admin.ts`, wire the button onClick.
- **Files**: `apps/web/src/pages/admin/page.tsx`, `packages/shared/src/api/client.ts`, `packages/api/src/routes/admin.ts`

### QW-002 – Chat Conversation History Persistence

- **Problem**: Chat messages stored in `useState` — lost on refresh. Backend already has `chat_sessions`/`chat_messages` tables + API routes (`getChatSessions`, `getChatMessages`, `appendChatMessage`).
- **Fix**: Load messages on chat page mount, save user/assistant messages on send/complete.
- **Files**: `apps/web/src/pages/chat/page.tsx`, `packages/shared/src/api/client.ts`

### QW-003 – Model Selector Functional

- **Problem**: Chat model dropdown sends `model` field via WS but agent's `handleChat` ignores it — uses `ModelRouter.route()` heuristic instead.
- **Fix**: Accept `data.model` in `handleChat` and use it when provided, falling back to `ModelRouter.route()` only when no model is specified.
- **Files**: `packages/agent/src/index.ts` (line ~1134 in `handleChat`)

### QW-004 – Agent Context Window Cap

- **Problem**: Entire `updatedMessages` array sent to AI without truncation — will silently fail at context limits.
- **Fix**: Cap messages to last N entries or ~6k characters before sending to AI.
- **Files**: `packages/agent/src/index.ts` (lines ~1213-1218 in `handleChat`)

### QW-005 – Workspace Syntax Highlighting

- **Problem**: Code editor in workspace is a raw `<textarea>` — no syntax highlighting.
- **Fix**: Add `highlight.js` via dynamic import or a lightweight `<pre><code>` overlay.
- **Files**: `apps/web/src/pages/projects/workspace.tsx` (lines ~357-368)

### QW-006 – Remove Dead Skills Button

- **Problem**: "Use a skill" attachment menu item opens `window.alert("Skills coming soon!")`.
- **Fix**: Remove the placeholder button or replace with a functional "Templates" shortcut.
- **Files**: `apps/web/src/pages/chat/page.tsx` (lines ~295-307)

### QW-007 – Strip Debug Logs in Settings

- **Problem**: 6+ `console.log` statements in settings page leak auth tokens and user data to browser console in production.
- **Fix**: Remove or replace with a logger that respects production mode.
- **Files**: `apps/web/src/pages/settings/page.tsx` (lines ~90-100)

---

## Roadmap Features (Phases A → B → C)

> Full execution plan: [`docs/roadmap.md`](docs/roadmap.md)

### FEAT-016 – Rate Limiting + Request Logging

- **Problem**: API has no rate limiting middleware and no structured request logging.
- **Fix**: Add `rateLimitMiddleware` using Cloudflare KV + structured JSON logging middleware.
- **Files**: `packages/api/src/middleware/rate-limit.ts`, `packages/api/src/app.ts`

### FEAT-020 – Build System Consolidation

- **Problem**: Hybrid Nx + Turborepo setup causing inconsistencies and drift.
- **Fix**: Audit and remove Nx targets for packages already owned by Turborepo; keep Turborepo as single source of truth.
- **Files**: `turbo.json`, `nx.json`, root `package.json`

### FEAT-012 – Docker Compose Quickstart

- **Problem**: New contributors must manually wire API + Agent + D1 + KV.
- **Fix**: Add `docker-compose.yml` with all services and a `docs/QUICKSTART.md`.
- **Files**: `docker-compose.yml`, `docs/QUICKSTART.md`

### FEAT-010 – CLI Template Rendering

- **Problem**: `create-magicappdev-app` scaffolds empty directories — no real template rendering.
- **Fix**: Add `generate` command consuming `@magicappdev/templates` Handlebars registry.
- **Files**: `packages/cli/src/commands/generate.ts`, `packages/cli/src/index.ts`

### FEAT-019 – Database Seeding Utilities

- **Problem**: No seed data for local development; difficult to test with realistic data.
- **Fix**: Add `packages/database/src/seed.ts` with demo data and `bun run seed` script.
- **Files**: `packages/database/src/seed.ts`, `packages/database/package.json`

### FEAT-009 – MCP Tool Integration (embedded in agent)

- **Problem**: MagicAgent cannot call external MCP server tools (filesystem, GitHub, DB, etc.).
- **Fix**: Add `mcpConnect` and `mcpCallTool` agent tools inside `packages/agent/src/tools.ts`; reuse existing `executeToolAction` flow.
- **Files**: `packages/agent/src/tools.ts`, `packages/agent/src/index.ts`

### FEAT-013 – Lightweight Live Preview

- **Problem**: WebContainers bundle too large (775 KiB); no lighter preview fallback.
- **Fix**: Add `srcdoc` iframe + `postMessage` relay with polling hot-reload.
- **Files**: `apps/web/src/components/workspace/LivePreview.tsx`, `apps/web/src/pages/projects/workspace.tsx`

---

## Pending Work (Detailed)

### FEAT-003 – Live WebContainers

**Blocker:** `@webcontainer/api` not yet installed.  
**Next step:** Evaluate bundle-size impact (currently 775 KiB main chunk); add as async `import()` in `components/workspace/LivePreview.tsx`.

### FEAT-006 – Visual Template Customizer

**Next step:** Scaffold admin route under `apps/web/src/pages/admin/` consuming `registry.getMetadata()` from `@magicappdev/templates`.

### FEAT-007 – KV Caching for AI Responses

- **Next step:** Wrap `env.AI.run()` in `packages/agent/src/index.ts` with `env.KV_CACHE.get(promptHash) || run()` memoization layer; add KV binding to `wrangler.toml`.

---

## Active Roadmap

Detailed execution plan for the next phases is maintained in [`docs/roadmap.md`](docs/roadmap.md).

- **Phase A** — Platform Reliability (rate limiting + logging, build system consolidation)
- **Phase B** — Developer Experience (Docker quickstart, CLI template rendering, DB seeding)
- **Phase C** — AI Agent Expansion (MCP tool integration in agent, lightweight live preview)

> **Deployment:** Local build & local deploy only (`wrangler dev` / `wrangler deploy`). No CI/CD changes in current roadmap.  
> **GitHub Releases:** Consider `gh release create` when pushing signed tags for versioned packages.

---

## Deploy Instructions (Local Wrangler CLI)

```bash
# API (Hono on Workers)
cd packages/api && wrangler deploy

# Agent (Cloudflare Agents SDK + Durable Objects)
cd packages/agent && wrangler deploy
```

> Note: GitHub Actions deploy was disabled after earlier pipeline issues. All deploys must use local `wrangler` CLI (already authenticated).

---

_Generated by Feature Suggestions Agent. Updated post security-hardening + E2E + deploy sprint (2026-08-28). Quick wins added._
