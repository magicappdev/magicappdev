# GEMINI.md - MagicAppDev Monorepo Context

## Project Overview

**MagicAppDev** is a comprehensive fullstack app-building platform inspired by Expo and Ignite CLI. It aims to provide a suite of tools (CLI, Web, App, API, Database) to rapidly generate, manage, and deploy applications.

### Key Technologies

- **Package Manager**: `pnpm` (with workspaces)
- **Monorepo Orchestration**: `Turborepo` & `Nx`
- **Language**: `TypeScript`
- **Frameworks**: `Next.js` (intended for web), `React Native` (intended for mobile)
- **Deployment**: `Cloudflare Workers` / `Pages` (planned)

### Architecture

The project follows a monorepo structure:

- `apps/`: High-level applications (e.g., `@magicappdev/web`).
- `packages/`: Shared libraries and tools (e.g., `@magicappdev/cli`, `@magicappdev/shared`).
- `scripts/`: Internal workspace utility scripts.

---

## Building and Running

The workspace uses `Turborepo` and `Nx` for task execution.

### Key Commands

- **Install Dependencies**: `pnpm install`
- **Build All**: `pnpm build` (runs `nx run-many --target=build --all`)
- **Typecheck All**: `pnpm typecheck` (runs `nx run-many --target=typecheck --all`)
- **Format Code**: `pnpm format` (uses Prettier)
- **Check Formatting**: `pnpm format:check`
- **Linting**: Tasks defined in `turbo.json` (e.g., `pnpm turbo lint`)
- **Nx release**: `npx nx release` (for versioning and publishing)

---

## Development Conventions

### Coding Style

- **Formatting**: Strictly enforced via `Prettier`. Configuration in `.prettierrc`.
- **Imports**: Sorted via `prettier-plugin-organize-imports` and `prettier-plugin-sort-imports`.
- **TypeScript**: Used workspace-wide. Base configuration in `tsconfig.base.json`.

### Workspace Management

- **Adding Packages**: Use `pnpm nx g @nx/js:lib packages/<name>` for new libraries.
- **Task Pipelines**: Defined in `turbo.json`. Build tasks typically depend on `typecheck` and `format`.
- **Caching**: Local and remote caching is enabled via Turborepo and Nx.

### Documentation

- **Core Vision**: See `Plan.md` for the detailed implementation roadmap.
- **Setup Guides**: See `docs/NX Setup.md` for Nx-specific workspace details.

---

## Project Status

The project is currently in the **initial scaffolding phase**.

- **Root structure**: Established with `pnpm`, `Turbo`, and `Nx`.
- **Apps**: `@magicappdev/web` is initialized as a placeholder.
- **Packages**: Ready for implementation as per `Plan.md`.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
