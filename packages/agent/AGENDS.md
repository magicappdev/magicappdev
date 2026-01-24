# Agends.md - @magicappdev/agent

## Overview

The `@magicappdev/agent` package provides AI agent integration using the Cloudflare Agents SDK. It is designed to facilitate intelligent code generation and project management within the MagicAppDev ecosystem.

## Tech Stack

- **AI Framework**: Cloudflare Agents SDK
- **Runtime**: Cloudflare Workers
- **State Management**: Durable Objects
- **Integration**: Cloudflare AI Gateway
- **Language**: TypeScript

## Responsibilities

- Implementing stateful AI agents for app building tasks.
- Managing model routing (Fast/Complex/Code) via AI Gateway.
- Providing tool-calling capabilities for project scaffolding and template selection.
- Serving as the intelligent backend for the "MagicAgent" features.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Stateful MagicAgent implementation with Agents SDK.
- [x] Model Routing configuration.
- [x] Minimal and test deployment configurations.
- [ ] Implement advanced tool use for `registry.generate()`.
- [ ] Agent-led project setup wizard.

## Usage Guidelines

- Deploy using `pnpm run deploy` via Turborepo.
- Use `wrangler.test.toml` for verifying deployments in a test environment.
- Leverage Durable Objects for cross-session state persistence.

## Next Steps

- Refine agent prompts for better code generation accuracy.
- Integrate with `@magicappdev/templates` for direct scaffolding.
- Implement automated issue reviewer capabilities.
