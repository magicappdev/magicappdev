# GEMINI.md - MagicAppDev Monorepo Context

## Project Overview

**MagicAppDev** is a comprehensive fullstack app-building platform inspired by Expo and Ignite CLI. It aims to provide a suite of tools (CLI, Web, App, API, Database) to rapidly generate, manage, and deploy applications.

### Key Technologies

- **Package Manager**: `Bun` (with workspaces)
- **Monorepo Orchestration**: `Turborepo` & `Nx`
- **Language**: `TypeScript`
- **Frameworks**: `Next.js` (intended for web), `React Native` (intended for mobile)
- **Deployment**: `Cloudflare Workers` / `Pages` (planned)

### Architecture

The project follows a monorepo structure:

- `apps/`: High-level applications (e.g., `@magicappdev/web`).
- `packages/`: Shared libraries and tools (e.g., `@magicappdev/cli`, `@magicappdev/shared`).
- `scripts/`: Internal workspace utility scripts.

### Mobile Repo Boundary

- `apps/mobile` is an independent repo/workflow surface inside this repository.
- For mobile-only tasks, interpret relative paths, local env files, and scripts from `apps/mobile`.
- Mobile GitHub Actions live under `apps/mobile/.github/workflows/`; when operating within the mobile surface, treat that as the workflow root.
- Avoid assuming the monorepo root `.github/workflows/` or root workspace commands apply to mobile-only work.

---

## Building and Running

The workspace uses `Turborepo` and `Nx` for task execution.

### Key Commands

- **Install Dependencies**: `bun install`
- **Build All**: `bun run build` (runs Turborepo build pipeline)
- **Typecheck All**: `bun run typecheck` (runs Turborepo typecheck pipeline)
- **Format Code**: `bun run format` (uses Prettier)
- **Check Formatting**: `bun run format:check`
- **Linting**: Tasks defined in `turbo.json` (e.g., `bun run turbo lint`)
- **Nx release**: `bunx nx release` (for versioning and publishing)

---

## Development Conventions

### Coding Style

- **Formatting**: Strictly enforced via `Prettier`. Configuration in `.prettierrc`.
- **Imports**: Sorted via `prettier-plugin-organize-imports` and `prettier-plugin-sort-imports`.
- **TypeScript**: Used workspace-wide. Base configuration in `tsconfig.base.json`.

### Workspace Management

- **Adding Packages**: Use `bun init` or manually create a new package under `packages/`.
- **Task Pipelines**: Defined in `turbo.json`. Build tasks typically depend on `typecheck` and `format`.
- **Caching**: Local and remote caching is enabled via Turborepo.

### Documentation

- **Core Vision**: See `Plan.md` for the detailed implementation roadmap.
- **Setup Guides**: See `docs/NX Setup.md` for Nx-specific workspace details.

---

## Project Status

The project is currently in the **initial scaffolding phase**.

- **Root structure**: Established with `Bun`, `Turbo`, and `Nx`.
- **Apps**: `@magicappdev/web` is initialized as a placeholder.
- **Packages**: Ready for implementation as per `Plan.md`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Turborepo

- When running tasks (for example build, lint, test, e2e, etc.), prefer running the task through `turbo` (i.e. `turbo build`, `turbo typecheck`, `turbo lint`) instead of using the underlying tooling directly
- Use `turbo run` with `--filter` to target specific packages

<!-- nx configuration end-->
