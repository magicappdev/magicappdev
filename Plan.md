# MagicAppDev Monorepo Implementation Plan

## Overview

Develop a comprehensive monorepo-based fullstack app building platform inspired by Expo, utilizing Turborepo for efficient monorepo management. The platform will include a CLI tool, web interface, mobile app, API, database, and deployment services, enabling rapid development, customization, and deployment of apps across web and mobile.

## Core Components

- **Monorepo Structure**: Use Turborepo with pnpm for package management, including local/remote caching, TypeScript, and Node.js/JS as preferred languages. Framework: Next.js for web components.
- **CLI Tool**: Named `npx create-magicappdev-app`, similar to Ignite CLI. Features:
  - Generate/manage app code, components, packages.
  - Component generators for existing apps.
  - Package updater (dependency fixer).
  - Icon, splash image, and theme generators.
  - UI with chalk.
  - Integration with MCP (Model Context Protocol).
  - Doctor command for diagnostics.
  - Build local apps.
- **Webpage**: Hosted at `*.magicappdev.workers.dev` (Cloudflare Workers).
  - Interactive AI Chat for app creation: Prompt completion, hot reload preview, prompt suggestions.
  - Auto lint and type error fixing in chat.
  - Support for custom AI providers (API keys) or built-in.
  - GitHub repo integration, inits, deploys, CI management.
  - Theme/UI component library generator (Material/Flat, responsive designs).
  - App build manager for deployments to various providers.
  - Based on Next.js.
- **Mobile App (Android/iOS)**: React Native-based, mirroring webpage features.
  - Includes optional packages: DevTools, Reanimated, Expo, Metro, test setups.
  - Component generators, package updater, icon/splash/theme generators.
  - MCP integration.
- **API & Database**: Deploy to Cloudflare.
  - API for backend services.
  - Database integration.
- **Shared Packages/Apps**:
  - `@magicappdev/cli`
  - `@magicappdev/mobile`
  - `@magicappdev/web`
  - `@magicappdev/api`
  - `@magicappdev/templates`
  - `@magicappdev/database`
  - `@magicappdev/shared`

## Key Features

- **Customization & Extensibility**: Highly customizable with plugins, good debugging utilities, easy deployments (Workers).
- **AI Integration**: AI-powered code generation, error fixing, and suggestions.
- **Deployment**: Seamless deploys to Cloudflare, with support for multiple providers.
- **Development Tools**: Hot reload, linting, type checking, testing setups.
- **Package Management**: pnpm + Turborepo with caching.

## Repository & Publishing

- GitHub: https://github.com/magicappdev
- NPM: https://www.npmjs.com/org/magicappdev

## Project Status (January 2026)

- **Monorepo**: Fully established with pnpm, Turbo, and Nx. Clean linting and typechecking across all 7 projects.
- **API**: Functional Hono-based API on Cloudflare Workers with D1/Drizzle integration for Auth and Projects.
- **Web**: Modern Next.js application with AI Chat interface and full Radix UI component library.
- **Mobile**: Expo-based React Native app with file-based routing (expo-router), Tab navigation, and AI Chat.
- **Database**: D1 schema defined, migrations generated, and successfully integrated with API and Web.
- **Dev Workflow**: Pre-commit hooks (lint-staged, husky), commitlint, and knip analysis are all active.

## Implementation Steps

1. [x] Set up Turborepo monorepo with pnpm.
2. [ ] Develop CLI tool with core generators and management features.
3. [x] Build Next.js webpage with AI chat and deployment tools.
4. [x] Create React Native app with shared features.
5. [x] Implement API and database on Cloudflare.
6. [ ] Add MCP integration across components.
7. [ ] Ensure extensibility with plugin system.
8. [ ] Test and deploy initial versions.

todoo:

- [x] apps/web packages/database wrangler configuration and linking.
- [x] Building apps/mobile - react-native app with expo-router.
- [x] Implement Settings/Profile Menu in Mobile.
- [ ] Add real AI backend logic (currently mock/direct streaming).
- [ ] Implement actual code generation in CLI.
- [ ] MCP integration for developer tools.
- [ ] Update the .devcontainer.
- [ ] Update Packages to latest versions (migrate).
