# Agents.md - @magicappdev/templates

## Overview

The `@magicappdev/templates` package manages the codebase templates and generation logic for MagicAppDev, enabling the no-code code generation features.

## Tech Stack

- **Templating Engine**: Handlebars
- **Language**: TypeScript
- **Dependencies**: `@magicappdev/shared`
- **Testing**: Vitest

## Responsibilities

- Maintaining a registry of application, component, and screen templates.
- Providing utilities for rendering Handlebars templates with dynamic data.
- Managing project structure templates for different frameworks.
- Supporting consistent code generation across CLI and Web.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: <https://nice-example.local/api/interactions>
- **Linked Roles**: <https://nice-example.local/verify-user>
- **TOS**: <https://my-cool-app.com/terms-of-service>
- **Privacy**: <https://my-cool-app.com/privacy-policy>

## Implementation Steps & Progress

- [x] Basic template registry and structure.
- [x] Handlebars integration for dynamic rendering.
- [x] Integration with shared utilities and types.
- [ ] Expand template library for various app types (E-commerce, SaaS, etc.).
- [ ] Implement component-level granular templates.
- [ ] Add template validation and smoke testing.

## Usage Guidelines

- Add new templates to the `src/registry` for discovery.
- Use the `generate()` method from the registry for project scaffolding.
- Ensure all templates adhere to the coding standards defined in the monorepo.

## Next Steps

- Integrate directly with `@magicappdev/agent` for AI-driven template selection.
- Implement a preview system for rendered templates.
- Add support for plugin-based template extensions.
