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

- **Monorepo**: Fully established with pnpm, Turbo, and Nx. Clean linting and typechecking across all 8 projects.
- **API**: Functional Hono-based API on Cloudflare Workers with D1/Drizzle integration for Auth, Projects, and AI.
- **Auth System**: Comprehensive GitHub OAuth system implemented for Web, Mobile, and CLI. Support for JWT and session management.
- **Web**: Modern Next.js application with real-time AI Chat streaming and full Project management.
- **Mobile**: Expo-based app with GitHub Auth, Projects listing, streaming AI Chat, and **Dark Mode support**.
- **CI/CD**: GitHub Actions active for automated testing and deployments.

### Recent Improvements (January 23, 2026)

#### Mobile App Enhancements ✅

- **Dark Mode**: Implemented full dark mode support with Light/Dark/Auto theme modes
- **App Icons**: Converted all icons from JPG to PNG with transparency support
- **Metro Bundler**: Fixed SHA-1 errors and file watching issues on Windows/pnpm
- **Android Build**: Fixed CMake path length issues (205→~180 chars)
- **Theme System**: Created comprehensive theme constants and ThemeProvider context

#### CLI Enhancements ✅

- **Shell Completions**: Added completions command for bash, zsh, fish, and pwsh
- **Note**: Build cache issue needs investigation for compiled output

### Known Issues & Optimizations Needed

#### Nx Integration Gaps 🔧

- Missing `project.json` files for apps/mobile and apps/web
- Inconsistent build system usage (Nx + Turborepo hybrid)
- Mobile project not properly registered in Nx workspace
- Missing Nx targets for mobile-specific operations

#### Mobile CI/CD Gaps 📱

- No automated mobile app builds in GitHub Actions
- Missing iOS/Android deployment workflows
- No mobile app testing configuration
- No app store deployment automation

#### Recommended Next Steps 🎯

1. Create proper `project.json` for apps/mobile with Nx targets
2. Add mobile build/test/deploy to GitHub Actions
3. Consider consolidating to primary build system (Nx or Turborepo)
4. Set up E2E testing with Playwright for mobile
5. Add mobile app store deployment automation

## Implementation Steps

1. [x] Set up Turborepo monorepo with pnpm.
2. [ ] Develop CLI tool with core generators and management features.
3. [x] Build Next.js webpage with AI chat and deployment tools.
4. [x] Create React Native app with shared features.
5. [x] Implement API and database on Cloudflare.
6. [x] Add GitHub OAuth authentication system.
7. [x] Set up CI/CD pipelines.
8. [ ] Add MCP integration across components.
9. [ ] Ensure extensibility with plugin system.

todoo:

- [x] apps/web packages/database wrangler configuration and linking.
- [x] Building apps/mobile - react-native app with expo-router.
- [x] Implement Settings/Profile Menu in Mobile.
- [x] Implement real AI backend logic with streaming.
- [ ] Implement actual code generation in CLI.
- [ ] MCP integration for developer tools.
- [x] Update the .devcontainer.
- [x] Set up CI/CD GitHub Actions.
- [x] Fix mobile app Android build path length issues.
- [x] Fix Metro bundler SHA-1 errors on Windows.
- [x] Implement dark mode support in mobile app.
- [x] Convert app icons to PNG format.
- [x] Add shell completions command to CLI.
- [ ] Add Docker-Compose Quickstart for App Developing
- [ ] Discord Bot for Community Server

## ADD

Interactions Endpoint URL
You can optionally configure an interactions endpoint to receive interactions via HTTP POSTs rather than over Gateway with a bot user.
https://nice-example.local/api/interactions
Linked Roles Verification URL
You can configure a verification URL to enable your application as a requirement in a server role's Links settings
https://nice-example.local/verify-user
Terms of Service URL
A link to your application's Terms of Service
https://my-cool-app.com/terms-of-service
Privacy Policy URL
A link to your application's Privacy Policy
https://my-cool-app.com/privacy-policy
