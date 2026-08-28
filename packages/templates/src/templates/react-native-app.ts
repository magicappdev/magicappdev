/**
 * React Native + Expo Router template - cross-platform mobile app
 * Uses Expo Router for file-based navigation
 */

import type { Template } from "../types.js";

export const reactNativeTemplate: Template = {
  id: "react-native",
  name: "React Native App",
  slug: "react-native",
  description:
    "Cross-platform React Native app with Expo Router, TypeScript, and native navigation.",
  category: "app",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["mobile", "react-native", "expo", "expo-router", "typescript"],
  variables: [
    {
      name: "name",
      description: "App name (kebab-case)",
      type: "string",
      default: "my-mobile-app",
    },
    {
      name: "appName",
      description: "App display name",
      type: "string",
      default: "My Mobile App",
    },
    {
      name: "description",
      description: "App description",
      type: "string",
      default: "A React Native app built with MagicAppDev",
    },
  ],
  dependencies: {
    expo: "~51.0.0",
    "expo-router": "~4.0.0",
    react: "18.3.1",
    "react-native": "0.74.0",
    "react-native-safe-area-context": "4.10.0",
    "react-native-screens": "3.31.0",
  },
  devDependencies: {
    "@babel/core": "7.25.2",
    "@types/react": "18.3.12",
    typescript: "~5.3.0",
  },
  postInstall: [
    "npx expo install --fix",
    "npx expo run:android || npx expo run:ios",
  ],
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "lint": "eslint ."
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.74.0",
    "react-native-safe-area-context": "4.10.0",
    "react-native-screens": "3.31.0"
  },
  "devDependencies": {
    "@babel/core": "7.25.2",
    "@types/react": "18.3.12",
    "typescript": "~5.3.0"
  }
}
`,
    },
    {
      path: "app.json",
      content: `{
  "expo": {
    "name": "{{kebabCase name}}",
    "slug": "{{kebabCase name}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
`,
    },
    {
      path: "app/_layout.tsx",
      content: `import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: '{{appName}}' }} />
    </Stack>
  );
}
`,
    },
    {
      path: "app/index.tsx",
      content: `import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{{appName}}</Text>
      <Text style={styles.subtitle}>{{description}}</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
    },
  ],
};
