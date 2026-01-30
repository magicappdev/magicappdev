# Agents.md - @magicappdev/web

## Overview

The `@magicappdev/web` application is the primary Next.js-based interface for MagicAppDev, providing a full-featured web experience for no-code app building, AI chat, and project management.

## Tech Stack

- **Framework**: Next.js (App/Pages router hybrid)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **State Management**: React Context API
- **API Client**: `@magicappdev/shared` ApiClient
- **Runtime**: Cloudflare Workers / Pages
- **Language**: TypeScript

## Responsibilities

- Providing the primary AI Chat interface for app creation.
- Managing user projects and showing real-time previews.
- Handling GitHub OAuth login and session management.
- Exposing administrative tools for system management.
- Serving as the landing page and documentation hub.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: <https://nice-example.local/api/interactions>
- **Linked Roles**: <https://nice-example.local/verify-user>
- **TOS**: <https://my-cool-app.com/terms-of-service>
- **Privacy**: <https://my-cool-app.com/privacy-policy>

## Implementation Steps & Progress

- [x] Next.js application structure setup.
- [x] Real-time AI Chat streaming implementation.
- [x] GitHub OAuth integration.
- [x] Responsive layout with Tailwind CSS.
- [x] Project management dashboard.
- [ ] Implement live UI preview for generated code.
- [ ] Migrate fully to Cloudflare Workers (Next-on-Pages).
- [ ] Add collaborative editing features.

## Usage Guidelines

- Run `pnpm dev` for local development.
- Use `pnpm build` to prepare for Cloudflare deployment.
- Leverage the `components/ui` directory for consistent design language.

## Next Steps

- Setup E2E testing with Playwright.
- Integrate with `@magicappdev/agent` for advanced scaffolding previews.
- Add more comprehensive user settings and profile management.
