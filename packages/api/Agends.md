# Agends.md - @magicappdev/api

## Overview

The `@magicappdev/api` package is the core backend service for MagicAppDev, built with the Hono framework and deployed as a Cloudflare Worker. It handles authentication, project management, and AI gateway routing.

## Tech Stack

- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (via `@magicappdev/database`)
- **Authentication**: GitHub OAuth 2.0 + JWT
- **AI Gateway**: Cloudflare AI Gateway
- **Language**: TypeScript

## Responsibilities

- Managing GitHub OAuth authentication flows.
- Providing project CRUD operations.
- Proxying AI requests through Cloudflare AI Gateway.
- Handling real-time streaming for AI chat responses.
- Securely managing admin operations and API keys.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Full authentication system with GitHub OAuth.
- [x] JWT session management with refresh tokens.
- [x] AI integration with streaming responses.
- [x] Project management endpoints.
- [x] Admin API endpoints with key-based authentication.
- [ ] Implement rate limiting.
- [ ] Add comprehensive API request/response logging.

## Usage Guidelines

- Protect sensitive routes with `authMiddleware`.
- Use the shared `ApiClient` from `@magicappdev/shared` for consuming this API.
- Ensure CORS is correctly configured for `apps/web`.

## Next Steps

- Integrate with `@magicappdev/agent` for enhanced AI capabilities.
- Implement more robust error handling and reporting.
- Standardize API response formats across all endpoints.
