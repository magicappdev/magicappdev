# Mobile Development Skill - React Native, Expo, Expo Router

## Overview

This skill provides comprehensive capabilities for developing mobile applications using React Native, Expo, and Expo Router within the MagicAppDev ecosystem. It enables the creation of cross-platform mobile applications with native performance and modern navigation patterns.

## Tech Stack

- **Framework**: React Native 0.81.5
- **Tooling**: Expo SDK
- **Navigation**: Expo Router (File-based)
- **Styling**: Native components with custom theme system
- **State Management**: React Context API
- **Authentication**: GitHub OAuth with JWT
- **Real-time**: WebSocket connection for AI chat
- **Themes**: Light/Dark/Auto theme support

## Capabilities

### 1. Project Setup & Configuration

- Initialize new React Native projects with Expo
- Configure Metro bundler for optimal performance
- Set up TypeScript support with proper type definitions
- Configure EAS (Expo Application Services) for builds and deployments

### 2. Navigation & Routing

- Implement file-based routing with Expo Router
- Create tab navigation with bottom tabs
- Set up stack navigation for nested routes
- Configure authentication flows with protected routes
- Implement deep linking for external navigation

### 3. UI Development

- Create responsive layouts using Flexbox
- Implement theme-aware components with dark/light mode support
- Build custom UI components with native styling
- Integrate with native device features (camera, location, etc.)
- Implement accessibility features for better UX

### 4. Authentication & Security

- Integrate GitHub OAuth for user authentication
- Implement JWT token management
- Set up secure API communication
- Handle session management and token refresh
- Implement biometric authentication options

### 5. Real-time Features

- Establish WebSocket connections for real-time updates
- Implement AI chat with streaming responses
- Handle real-time notifications
- Manage connection state and reconnection logic

### 6. Performance Optimization

- Optimize bundle size with Metro configuration
- Implement code splitting and lazy loading
- Optimize image assets for mobile devices
- Implement caching strategies for API responses
- Monitor and improve app performance metrics

### 7. Build & Deployment

- Configure EAS builds for iOS and Android
- Set up automated build pipelines
- Configure app signing and provisioning
- Implement app store deployment workflows
- Manage app versioning and updates

## Implementation Examples

### Basic Expo Router Setup

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="chat" options={{ title: 'AI Chat' }} />
      <Stack.Screen name="projects" options={{ title: 'Projects' }} />
    </Stack>
  );
}
```

### Theme-Aware Component

```typescript
// components/ThemeButton.tsx
import { useTheme } from '../contexts/ThemeContext';
import { Button } from 'react-native';

export function ThemeButton({ title, onPress }) {
  const { theme } = useTheme();

  return (
    <Button
      title={title}
      onPress={onPress}
      color={theme.colors.primary}
    />
  );
}
```

### WebSocket Integration

```typescript
// lib/websocket.ts
import { useEffect, useState } from "react";

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = error => console.error("WebSocket error:", error);

    setSocket(ws);

    return () => ws.close();
  }, [url]);

  return { socket, isConnected };
}
```

## Best Practices

1. **Performance**: Always optimize images and assets for mobile devices
2. **Navigation**: Use Expo Router's file-based system for consistent routing
3. **Theming**: Implement theme context for consistent UI across the app
4. **State Management**: Use React Context for global state when appropriate
5. **Testing**: Implement unit and integration tests for critical components
6. **Accessibility**: Ensure all components follow accessibility guidelines

## Integration with MagicAppDev

- Use `@magicappdev/shared` for shared utilities and API client
- Leverage `@magicappdev/templates` for consistent component generation
- Integrate with `@magicappdev/api` for backend services
- Follow the monorepo structure for code organization

## Next Steps

- Implement E2E testing with Playwright or Detox
- Automate app builds and store deployments in CI/CD
- Add deep-linking support for project sharing
- Implement push notifications for user engagement
- Add offline capabilities for better user experience

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [MagicAppDev Mobile Agents](apps/mobile/Agents.md)
