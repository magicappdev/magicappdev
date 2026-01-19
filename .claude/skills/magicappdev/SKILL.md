---
name: magicappdev
description: Specialized expertise for the MagicAppDev platform. Use when modifying the monorepo structure, adding new templates to the CLI, updating the database schema, or extending the AI chat features in the web app.
---

# MagicAppDev Platform Development

You are an expert developer for the MagicAppDev platform. This skill provides guidance on the monorepo architecture, development workflows, and core conventions.

## Platform Architecture

The project is a monorepo managed by `pnpm`, `Turbo`, and `Nx`.

### Core Components

- `apps/web`: Next.js application for the platform's landing page and AI Chat interface.
- `apps/mobile`: Expo-based React Native application.
- `packages/cli`: The `magicappdev` CLI tool for project generation and management.
- `packages/api`: Hono-based backend running on Cloudflare Workers.
- `packages/database`: Drizzle ORM and migrations for Cloudflare D1.
- `packages/templates`: Project and component templates used by both CLI and Web.
- `packages/shared`: Shared types, constants, and utilities.

## Development Workflow

### Adding a New Template

1.  Create the template file in `packages/templates/src/templates/`.
2.  Define the `Template` object following the structure in `packages/templates/src/types.ts`.
3.  Export the template from `packages/templates/src/templates/index.ts`.
4.  Rebuild the templates package: `pnpm build` in `packages/templates`.

### Updating the Database Schema

1.  Modify files in `packages/database/src/schema/`.
2.  Ensure all changes are exported from `packages/database/src/schema/index.ts`.
3.  Generate migrations: `pnpm run generate` in `packages/database`.
4.  Apply migrations locally: `pnpm run migrate:local` in `packages/database`.

### Extending the API

1.  Add new routes in `packages/api/src/routes/`.
2.  Mount the routes in `packages/api/src/app.ts`.
3.  Update environment bindings in `packages/api/src/types.ts` and `wrangler.toml` if needed.

## Key Conventions

### ESM Support (NodeNext)

The project uses `moduleResolution: "nodenext"`. All relative imports MUST include the `.js` extension (even if the source is `.ts`).

Example:

```typescript
import { someUtil } from "./utils.js";
```

### Type Safety

- Prefer `Zod` for runtime validation (located in `packages/shared/src/schemas/`).
- Use Drizzle's `$inferSelect` and `$inferInsert` for database types.
- Export all common interfaces from `packages/shared`.

### UI Development (Web)

- Use Radix UI primitives.
- Style with Tailwind CSS.
- Use the `cn` utility from `@/lib/utils` for class merging.

## Common Commands

```bash
# Full build
pnpm build

# Run linting
pnpm lint

# Start development servers
pnpm dev

# Generate Drizzle migrations
pnpm --filter @magicappdev/database run generate
```
