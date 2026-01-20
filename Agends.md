# Agends.md - Comprehensive Documentation

## Overview

This document provides detailed documentation for each package in the MagicAppDev project, covering architecture, dependencies, usage guidelines, and integration points.

## Packages

### 1. @magicappdev/database

#### Description

Database utilities with Drizzle ORM for Cloudflare D1.

#### Architecture

- **ORM**: Drizzle ORM
- **Database**: Cloudflare D1
- **Schema Management**: Drizzle Kit
- **Tables**: `users`, `accounts` (OAuth), `sessions`, `profiles`, `projects`

#### Usage Guidelines

- Use Drizzle ORM for database operations.
- Ensure proper schema management using Drizzle Kit (`pnpm generate`).
- Use `migrate:prod` to apply migrations to Cloudflare D1.
- Relations are currently handled manually via joined queries in the API to ensure stability in the Worker environment.

### 2. @magicappdev/shared

#### Description

Shared utilities, types, and constants for MagicAppDev.

#### Architecture

- **API Client**: Unified `ApiClient` with support for JWT authentication, token refreshing, and Server-Sent Events (SSE) streaming.
- **Types**: Unified application types (User, Project, AiMessage) and API request/response contracts.
- **Utilities**: Logger, validation, and standard string manipulation tools.

#### Integration Points

- **Web & Mobile**: Both applications use the shared `ApiClient` for all backend communication.

### 3. @magicappdev/api

#### Description

Backend API built with Hono and deployed on Cloudflare Workers.

#### Architecture

- **Authentication**: GitHub OAuth2 flow with JWT session management.
- **AI Gateway**: Routing through Cloudflare AI Gateway for optimized model access and usage tracking.
- **Security**: Robust CORS configuration and `authMiddleware` for protecting sensitive endpoints.

### 4. CI/CD & Infrastructure

- **GitHub Actions**:
  - `ci.yml`: Automated testing, linting, and typechecking.
  - `deploy.yml`: Automatic deployment to Cloudflare on merge to `main`.
- **Nx Sync**: Workspace-wide synchronization of TypeScript project references.

### 3. @magicappdev/templates

#### Description

App templates and generators for MagicAppDev.

#### Architecture

- **Templates**: Handlebars-based templates for apps, components, and screens
- **Generators**: Template generation utilities
- **Registry**: Template registry for management

#### Dependencies

- `@magicappdev/shared`: Shared utilities and types
- `handlebars`: Templating engine
- `tslib`: Runtime library for TypeScript

#### Dev Dependencies

- `@types/node`: Type definitions for Node.js
- `typescript`: TypeScript compiler
- `vitest`: Testing framework

#### Usage Guidelines

- Use Handlebars for template generation.
- Leverage shared utilities for consistent functionality.
- Ensure proper template management using the registry.

#### Integration Points

- **Shared Package**: Utilizes shared utilities and types from `@magicappdev/shared`.
- **Apps**: Designed to generate templates for apps, components, and screens.

## Conclusion

This document provides a comprehensive overview of the architecture, dependencies, usage guidelines, and integration points for each package in the MagicAppDev project. Use this documentation to ensure consistency and maintainability across all packages.
