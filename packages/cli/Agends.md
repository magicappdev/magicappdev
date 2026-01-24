# Agends.md - @magicappdev/cli

## Overview

The `@magicappdev/cli` package is a command-line interface tool named `mad` (or `createmagicapp`) used for creating and managing MagicAppDev projects. It simplifies the setup and maintenance of fullstack applications.

## Tech Stack

- **CLI Framework**: Commander.js
- **UI**: Chalk, Ora, Prompts
- **Execution**: Execa
- **Language**: TypeScript
- **Environment**: Node.js

## Responsibilities

- Project scaffolding via `npx create-magicappdev-app`.
- Managing app components, packages, and dependencies.
- Providing shell completions (bash, zsh, fish, pwsh).
- Diagnostic tools via the `doctor` command.
- Integrating with MCP (Model Context Protocol) for enhanced developer tooling.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Basic command parsing and structure.
- [x] Shell completions for major shells.
- [x] Version 0.0.8 published.
- [ ] Implement actual code generation logic.
- [ ] Complete MCP integration.
- [ ] Add icon/splash/theme generators.

## Usage Guidelines

- Run `mad --help` to see available commands.
- Use `mad completions install` to set up shell completions.
- Ensure `node` and `pnpm` are installed in the environment.

## Next Steps

- Add Docker-Compose quickstart generation.
- Implement automated dependency fixing logic.
- Integrate template registry from `@magicappdev/templates`.
