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

#### Dependencies

- `@magicappdev/shared`: Shared utilities and types
- `drizzle-orm`: ORM for database operations
- `tslib`: Runtime library for TypeScript

#### Dev Dependencies

- `@cloudflare/workers-types`: Type definitions for Cloudflare Workers
- `@types/node`: Type definitions for Node.js
- `drizzle-kit`: CLI for Drizzle ORM
- `typescript`: TypeScript compiler

#### Usage Guidelines

- Use Drizzle ORM for database operations.
- Ensure proper schema management using Drizzle Kit.
- Integrate with Cloudflare D1 for database storage.

#### Integration Points

- **Shared Package**: Utilizes shared utilities and types from `@magicappdev/shared`.
- **Cloudflare Workers**: Designed to work seamlessly with Cloudflare Workers.

### 2. @magicappdev/shared

#### Description

Shared utilities, types, and constants for MagicAppDev.

#### Architecture

- **Utilities**: Logger, validation, string manipulation
- **Types**: API types, app types, CLI types, common types
- **Constants**: Defaults, errors, paths
- **Schemas**: AI schema, auth schema, config schema
- **Errors**: Base error handling

#### Dependencies

- `zod`: Schema validation library
- `tslib`: Runtime library for TypeScript

#### Dev Dependencies

- `typescript`: TypeScript compiler
- `vitest`: Testing framework

#### Usage Guidelines

- Use shared utilities for consistent functionality across packages.
- Leverage shared types and constants for maintainability.
- Ensure proper error handling using the base error class.

#### Integration Points

- **Database Package**: Provides shared utilities and types for database operations.
- **Templates Package**: Provides shared utilities and types for template generation.

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
