# Agends.md - @magicappdev/shared

## Overview

The `@magicappdev/shared` package serves as the universal foundation for MagicAppDev, providing shared types, utilities, and constants used across web, mobile, CLI, and API.

## Tech Stack

- **Framework**: Neutral / Pure TypeScript
- **Runtime**: Universal (Browser, Node.js, Cloudflare Workers)
- **Validation**: Zod
- **Language**: TypeScript

## Responsibilities

- Defining unified domain types (User, Project, AiMessage).
- Providing a shared `ApiClient` for consistent backend communication.
- Managing Zod validation schemas for API request/response contracts.
- Defining theme constants and shared configuration defaults.
- Implementing cross-platform utilities (Logger, String validation, etc.).

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Unified ApiClient with JWT and SSE support.
- [x] Core entity type definitions.
- [x] Zod schemas for auth and project validation.
- [x] Mobile theme constants and shared defaults.
- [ ] Implement internationalization (i18n) foundations.
- [ ] Add performance monitoring helpers.

## Usage Guidelines

- Always import types and schemas from this package to maintain consistency.
- Use the shared `ApiClient` instead of raw `fetch` for any `@magicappdev/api` calls.
- Keep utilities as side-effect free as possible for universal compatibility.

## Next Steps

- Expand the utility library for more common formatting tasks.
- Implement unified error handling classes and codes.
- Add comprehensive unit tests for all shared utilities.
