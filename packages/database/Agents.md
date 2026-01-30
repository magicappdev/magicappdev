# Agents.md - @magicappdev/database

## Overview

The `@magicappdev/database` package provides the data persistence layer for MagicAppDev, utilizing Drizzle ORM for Cloudflare D1. It manages schemas, migrations, and database connections.

## Tech Stack

- **ORM**: Drizzle ORM
- **Database**: Cloudflare D1
- **Migration Tool**: Drizzle Kit
- **Runtime**: Cloudflare Workers / Node.js (via Wrangler)
- **Language**: TypeScript

## Responsibilities

- Defining the core data schemas (Users, Projects, Sessions, AI Messages).
- Managing database migrations for local and production environments.
- Providing type-safe database access for `@magicappdev/api`.
- Implementing admin-specific tables and security keys.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: <https://nice-example.local/api/interactions>
- **Linked Roles**: <https://nice-example.local/verify-user>
- **TOS**: <https://my-cool-app.com/terms-of-service>
- **Privacy**: <https://my-cool-app.com/privacy-policy>

## Implementation Steps & Progress

- [x] Database schema for users, accounts, sessions, and projects.
- [x] Admin API keys schema integration.
- [x] Migration system setup via Drizzle Kit.
- [x] Local and remote Cloudflare D1 linking.
- [ ] Implement advanced relational queries in Drizzle.
- [ ] Add database seeding scripts for development.

## Usage Guidelines

- Run `pnpm generate` to create migrations from schema changes.
- Use `pnpm push:local` or `pnpm migrate:prod` for applying changes.
- Handle relations carefully within Cloudflare Worker memory constraints.

## Next Steps

- Implement soft-delete logic for projects.
- Optimize indexing for AI message retrieval.
- Add audit logging for administrative changes.
