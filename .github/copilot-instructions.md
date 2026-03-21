# GitHub Copilot Instructions — MagicAppDev

## Platform Purpose: Vibe Coding / No-Code

**MagicAppDev is a vibe-coding platform.** End users are non-technical — they describe what they
want in plain English ("build me a task manager", "make an app where my team logs hours") and the
platform's AI agent builds the app for them. Users should never need to touch code.

The AI agent role in this platform is to:

1. Interpret ambiguous, natural-language intent from non-technical users
2. Ask at most 1–2 clarifying questions before acting
3. Scaffold the app using the `packages/templates` registry and `packages/agent` tool pipeline
4. Explain what was built in plain English — no code dumps, no jargon

**When implementing features in this repo, always keep this user persona in mind.** Error messages,
UI copy, agent responses, and CLI output should all be written for someone who does not know
TypeScript, React, or Cloudflare Workers.

See [`docs/VIBEDEV.md`](../docs/VIBEDEV.md) for the full vibe-coding reference, interaction
guidelines, and generation pipeline details.

## Repository Overview

MagicAppDev is a fullstack app-building platform (Expo/Ignite-inspired) deployed entirely on Cloudflare Workers. It is a **pnpm monorepo** orchestrated by both **Turborepo** (primary build pipeline) and **Nx** (project-graph awareness).

```
apps/
  web/        # React + Vite + Cloudflare Workers Pages (@magicappdev/web)
  mobile/     # Ionic + Capacitor (separate pnpm workspace)
packages/
  api/        # Hono on Cloudflare Workers (@magicappdev/api)
  database/   # Drizzle ORM + Cloudflare D1 (@magicappdev/database)
  shared/     # Types, ApiClient, utils — consumed by all packages
  cli/        # npx create-magicappdev-app CLI tool
  agent/      # Cloudflare Agents SDK integration
  llmchat/    # LLM chat via WebSocket
  templates/  # Handlebars-based code generation templates
```

## Build, Test & Lint Commands

```bash
# Full workspace
pnpm build              # Turborepo build pipeline (respects task deps)
pnpm typecheck          # All projects
pnpm lint               # All projects
pnpm lint:fix           # Auto-fix linting
pnpm format             # Prettier across repo
pnpm test               # All unit tests (Vitest)

# Single project (prefer nx over direct tooling)
nx run @magicappdev/api:build
nx run @magicappdev/web:typecheck
nx run @magicappdev/shared:test

# Single test file (from a package dir)
pnpm vitest run src/path/to/file.test.ts

# API dev server (Wrangler)
cd packages/api && pnpm dev          # http://localhost:8787

# Web dev server
cd apps/web && pnpm dev              # http://localhost:3100

# Database
cd packages/database
pnpm generate          # Generate Drizzle migration files
pnpm migrate:local     # Apply migrations to local Wrangler D1 state
pnpm migrate:prod      # Apply migrations to production D1

# Deploy individual packages
pnpm deploy:api
pnpm deploy:web
```

**Important**: Turborepo's `build` task depends on `typecheck`. Running `pnpm build` will typecheck all packages first. Use `nx run-many --target=build` if you need to skip or isolate.

## Architecture

### Request flow

```
Browser/Mobile
  → apps/web (Vite + @cloudflare/vite-plugin)
  → packages/api (Hono on Workers)
      ├── authMiddleware (JWT via hono/jwt)
      ├── rateLimitMiddleware
      └── routes: /auth, /projects, /ai, /chat, /tickets, /admin
          └── createDatabase(c.env.DB) → Drizzle + Cloudflare D1
```

### API response contract

All API responses use a discriminated union from `@magicappdev/shared`:

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
    };
```

Always check `response.ok` then parse JSON to get this shape. Do not throw on `success: false` — it's a typed error, not an HTTP error.

### Auth flow

- **GitHub OAuth** and **Discord OAuth** via `/auth/login/:provider` → redirect → `/auth/callback/:provider`
- JWT `accessToken` + `refreshToken` returned; stored in `localStorage` in the web app
- `ApiClient` from `@magicappdev/shared` is initialized with `VITE_API_URL` and tokens are set via `api.setToken(token)`
- `authMiddleware` extracts Bearer token from `Authorization` header **or** `?token=` query param
- Secrets (`JWT_SECRET`, `GITHUB_CLIENT_SECRET`, etc.) are Wrangler secrets — never in `[vars]`

### Database schema conventions

- ORM: Drizzle ORM with `sqliteTable`; target is Cloudflare D1 (SQLite dialect)
- All IDs are `text("id").primaryKey()` (string UUIDs)
- Timestamps use `text` columns with `$defaultFn(() => new Date().toISOString())`
- Export both `type User = typeof users.$inferSelect` and `type NewUser = typeof users.$inferInsert` from every schema file
- Schema is exported as a single `schema` object from `packages/database/src/schema/index.ts`
- Drizzle relations are currently handled manually via joined queries (not via `drizzle-orm/relations`) for Worker environment stability

### Shared package (`@magicappdev/shared`)

The single source of truth for types used across web, mobile, and API:

- `src/types/api.types.ts` — API request/response contracts
- `src/types/app.types.ts` — domain entities (`User`, `Project`, `ProjectConfig`, etc.)
- `src/api/client.ts` — `ApiClient` class used by all front-ends
- Import as `@magicappdev/shared` or `@magicappdev/shared/api`

## Key Conventions

### TypeScript

- `strict: true`, `target: "es2022"`, `moduleResolution: "bundler"` (root `tsconfig.base.json`)
- **Always use explicit `.js` extensions** in local imports within packages (e.g., `import { foo } from "./foo.js"`) — required for ESM in Workers
- Use `type` imports for type-only usage
- Avoid `any`; prefer `unknown` with narrowing
- Path aliases in `tsconfig.base.json` map `@magicappdev/*` → `packages/*/src/index.ts`

### Code style (Prettier)

- `printWidth: 80`, `tabWidth: 2`, `semi: true`
- `singleQuote: false` (double quotes)
- `trailingComma: "all"`
- `arrowParens: "avoid"` (omit parens for single-parameter arrow functions: `x => x`)
- Auto-sorted imports via `prettier-plugin-organize-imports` + `prettier-plugin-sort-imports`

### Naming

| Thing                    | Convention         |
| ------------------------ | ------------------ |
| Variables/functions      | `camelCase`        |
| Classes/Types/Interfaces | `PascalCase`       |
| Files                    | `kebab-case.ts`    |
| Constants                | `UPPER_SNAKE_CASE` |
| DB tables/columns        | `snake_case`       |

### Cloudflare Workers specifics

- All packages deployed as Workers have a `wrangler.toml`; run them with `wrangler dev` not `node`
- Environment bindings (`DB`, `AI`, secrets) come from `c.env` in Hono — never `process.env` in Workers code
- Local dev persists D1 state to `../../.wrangler/state` (repo root)

### Commits

Conventional Commits are enforced by `commitlint` + Husky pre-commit hooks:

```
feat: add new feature
fix: fix a bug
chore: maintenance
```

### Adding a new DB table

1. Create `packages/database/src/schema/<table>.ts` following the existing pattern
2. Add it to `packages/database/src/schema/index.ts` (both `schema` object and `export *`)
3. Run `pnpm generate` from `packages/database/` to create the migration
4. Apply locally with `pnpm migrate:local`

### Adding a new API route

1. Create `packages/api/src/routes/<name>.ts` exporting a `new Hono()` router
2. Register it in `packages/api/src/app.ts` with `app.use("/path*", authMiddleware)` + `app.route("/path", myRoutes)`
3. Add corresponding types to `@magicappdev/shared` if consumed by front-ends

## Environment Variables

| Package             | Key env vars                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/api`      | `GITHUB_CLIENT_SECRET`, `DISCORD_CLIENT_SECRET`, `JWT_SECRET` (Wrangler secrets)                   |
| `apps/web`          | `VITE_API_URL` (points to API Worker URL)                                                          |
| `packages/database` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN` (for migrations only) |

Copy `.env.example` files to `.env` before running dev servers.
