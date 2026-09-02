# MagicAppDev Roadmap

> **Scope:** Phases A → B → C  
> **Mode:** Local build & local deploy only (`wrangler dev` / `wrangler deploy` from each package).  
> **GitHub Releases:** Consider `gh release create` when pushing signed tags for versioned agent packages.  
> **Last updated:** 2026-08-29

---

## Phase A — Platform Reliability

**Goal:** Harden the existing API + agent surface so local development is stable and observable.  
**Estimated effort:** ~1 week  
**Deploy target:** Local Wrangler only.

### A1 – Rate Limiting + Structured Request Logging

- Add `rateLimitMiddleware` to `packages/api/src/middleware/rate-limit.ts` (KV-backed sliding window).
- Add structured JSON logging middleware after rate limit.
- Write unit tests under `packages/api/test/`.
- Verify locally with `cd packages/api && wrangler dev`.

**Files:** `packages/api/src/middleware/rate-limit.ts`, `packages/api/src/app.ts`, `packages/api/test/rate-limit.test.ts`

### A2 – Build System Consolidation (Turborepo single source of truth) ✅

- Removed `.nxignore`, `nx.json`, `project.json` files, and `migrations.json`.
- Removed `nx-mcp` from `.mcp.json`, `.gemini/settings.json`, and `.claude/settings.local.json`.
- Removed `"nx": true` from `knip.json`.
- Updated root scripts to use `turbo` exclusively.
- Verified `bun run build && bun run typecheck` from root.

**Files:** `turbo.json`, root `package.json`

---

## Phase B — Developer Experience

**Goal:** Make local contributor setup trivial and wire the CLI to actually generate code.  
**Estimated effort:** ~1–2 weeks  
**Deploy target:** Local Wrangler only.

### B1 – Docker Compose Quickstart ⚠️ Cancelled

Docker-based Android build files (`Dockerfile.android`, `docker-compose.android.yml`) have been
removed. Mobile builds now work natively via Expo CLI on Windows. The WebContainer-based
preview handles cross-platform consistency in-browser. New contributors use:

```bash
bun install
bun run dev       # starts web dev server
cd packages/api && bun run dev   # API on :8787
cd packages/agent && bun run dev  # Agent on :8788
```

### B2 – CLI Template Rendering

- Add `generate` command to `packages/cli/src/commands/`.
- Consume `@magicappdev/templates` registry; prompt for variables.
- Write rendered files to disk with explicit `.js` extensions.
- Test end-to-end with `npx create-magicappdev-app`.

**Files:** `packages/cli/src/commands/generate.ts`, `packages/cli/src/index.ts`

### B3 – Database Seeding Utilities

- Create `packages/database/src/seed.ts` with demo user, project, and chat data.
- Add `bun run seed` script in `packages/database/package.json`.
- Support `--reset` flag to wipe and reseed.

**Files:** `packages/database/src/seed.ts`, `packages/database/package.json`

---

## Phase C — AI Agent Expansion

**Goal:** Make the agent externally extensible via MCP and fix live preview.  
**Estimated effort:** ~2–3 weeks  
**Deploy target:** Local Wrangler only.

### C1 – MCP Tool Integration (embedded in `@magicappdev/agent`) ✅

- [x] Add MCP client capability to `packages/agent/src/`.
- [x] Create `mcpConnect`, `mcpCallTool`, `mcpListTools`, `mcpReadResource`, `mcpGetPrompt`, `mcpRemoveServer` agent tools in `packages/agent/src/tools.ts`.
- [x] Wire `executeToolAction` to use SDK-native `addMcpServer`, `removeMcpServer`, `getMcpServers`, `mcp.callTool`, `mcp.readResource`, `mcp.getPrompt`.
- [x] Remove `mcpConnections` from `AgentState`; add `onStart` lifecycle hook for MCP connection restoration.
- [x] Expose MCP server config in agent system prompt (connected servers and tool counts).
- [x] Reuse existing `executeToolAction` flow — no new Worker routes required.

**Files:** `packages/agent/src/tools.ts`, `packages/agent/src/index.ts`

### C2 – Lightweight Live Preview ✅

- Enhanced `LivePreview.tsx` with `srcdoc` iframe + `postMessage` relay.
- Added CSS file bundling and SCSS compilation (via `sass.js`) in `buildPreviewHtml`.
- Console interceptor + error relay already wired via `postMessage`.
- Hot reload via `MAGICAPPDEV_UPDATE_HTML` message with 800ms debounce.

**Files:** `apps/web/src/components/workspace/LivePreview.tsx`

---

## Deployment Notes

- All phases deploy locally via Wrangler CLI:
  - API: `cd packages/api && wrangler deploy`
  - Agent: `cd packages/agent && wrangler deploy`
- No GitHub Actions mobile or release pipelines are modified in this roadmap.
- When ready for tagged releases, evaluate:
  - `git tag -a v0.1.0 -m "Phase A complete"`
  - `gh release create v0.1.0 --generate-notes`
