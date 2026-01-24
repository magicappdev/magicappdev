# Agends.md - @magicappdev/mobile

## Overview

The `@magicappdev/mobile` application is a React Native app built with Expo, mirroring the web interface features and providing a native experience for app building on the go.

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (File-based)
- **Styling**: Native components with custom theme system
- **State Management**: React Context API
- **API Client**: `@magicappdev/shared` ApiClient
- **Environment**: Expo SDK
- **Language**: TypeScript

## Responsibilities

- Providing a mobile-first interface for AI chat and code generation.
- Displaying and managing user projects native-style.
- Implementing native authentication via GitHub OAuth.
- Supporting dark mode and auto-theming for native accessibility.
- Handling real-time AI streaming via WebSockets.

## Discord Bot Integration (Reference)

- **Interactions Endpoint**: https://nice-example.local/api/interactions
- **Linked Roles**: https://nice-example.local/verify-user
- **TOS**: https://my-cool-app.com/terms-of-service
- **Privacy**: https://my-cool-app.com/privacy-policy

## Implementation Steps & Progress

- [x] Expo Router integration and basic tab navigation.
- [x] GitHub Auth integration (Mobile-to-Web-to-Mobile).
- [x] Real-time AI Chat with streaming.
- [x] Full Dark Mode support (Light/Dark/Auto).
- [x] Transparent PNG icon system implementation.
- [x] Android build path length fixes.
- [ ] Implement mobile-native project preview.
- [ ] Add push notifications for project updates.

## Usage Guidelines

- Run `pnpm dev` to start the Metro bundler.
- Use `pnpm android` or `pnpm ios` for platform-specific testing.
- Follow the theme constants in `constants/theme.ts` for UI consistency.

## Next Steps

- Integrate E2E testing with Playwright or Detox.
- Automate app builds and store deployments in CI/CD.
- Add deep-linking support for project sharing.
