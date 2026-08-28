# MagicAppDev Feature Suggestions Report

> **Last updated:** 2026-08-28  
> **Live Workers:**
>
> - API (`@magicappdev/api`): https://magicappdev-api.magicappdev.workers.dev
> - Agent (`@magicappdev/agent`): https://magicappdev-agent.magicappdev.workers.dev

---

## Summary Matrix

| ID           | Category              | Description                                                                                                                                                | Impact | Status                                                  |
| :----------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :------------------------------------------------------ |
| **FEAT-001** | Developer Experience  | **One-Click GitHub Repository Export**: Push generated apps to a user's GitHub repo via OAuth. Already wired into chat page + `/github/create-repo` route. | High   | ✅ Done                                                 |
| **FEAT-002** | AI / Agentic Workflow | **Self-Healing Agent Loops**: Catch runtime/build errors and feed them back to MagicAgent Durable Object for auto-patching.                                | High   | 🔄 In Progress (agent Worker live, tool-use scaffolded) |
| **FEAT-003** | UI / Preview          | **Live WebContainers / StackBlitz Integration**: Run full React/Vite apps in-browser via WebContainer API.                                                 | High   | 📋 Backlog                                              |
| **FEAT-004** | Authentication        | **Discord OAuth Integration**: JWT-signed state, KV session polling, linked-accounts endpoint. GitHub OAuth also hardened.                                 | Medium | ✅ Done                                                 |
| **FEAT-005** | Production Readiness  | **Automated Playwright E2E Suite**: 10/10 tests passing (auth, chat, projects, AI Studio canvas + mock WS server).                                         | High   | ✅ Done                                                 |
| **FEAT-006** | Developer Tools       | **Visual Template Customizer**: Admin UI to preview and tweak Handlebars templates with live variable injection.                                           | Medium | 📋 Backlog                                              |
| **FEAT-007** | Performance / Caching | **AI Response Caching with Cloudflare KV**: Cache prompt→template mappings to reduce AI Gateway token spend.                                               | Medium | 📋 Backlog                                              |

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

- 10/10 E2E tests passing (8 auth/navigation + 2 AI Studio canvas)
- `apps/web/e2e/mock-agent-server.mjs`: lightweight WebSocket mock speaking Agents SDK protocol (`chat` → `chat_chunk` / `chat_done`) with HTTP `/health` for Playwright `webServer` health checks
- Pre-existing flaky tests fixed: strict `h1` locator → `getByRole("heading")`, disabled Create button → `toBeVisible` + click, projects nav → auth redirect assertion

---

## Pending Work (Detailed)

### FEAT-002 – Self-Healing Agent Loops

**Blocker:** Client-side sandbox/iframe error boundary not yet instrumented.  
**Next step:** Add `window.onerror` / postMessage error relay in LivePreview iframe → MagicAgent Durable Object over WebSocket → LLM patch prompt.

### FEAT-003 – Live WebContainers

**Blocker:** `@webcontainer/api` not yet installed.  
**Next step:** Evaluate bundle-size impact (currently 775 KiB main chunk); add as async `import()` in `components/workspace/LivePreview.tsx`.

### FEAT-006 – Visual Template Customizer

**Next step:** Scaffold admin route under `apps/web/src/pages/admin/` consuming `registry.getMetadata()` from `@magicappdev/templates`.

### FEAT-007 – KV Caching for AI Responses

**Next step:** Wrap `env.AI.run()` in `packages/agent/src/index.ts` with `env.KV_CACHE.get(promptHash) || run()` memoization layer; add KV binding to `wrangler.toml`.

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

_Generated by Feature Suggestions Agent. Updated post security-hardening + E2E + deploy sprint (2026-08-28)._
