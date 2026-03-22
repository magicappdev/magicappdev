/**
 * Expo / React Native template - Cross-platform mobile with Expo SDK
 */

import type { Template } from "../types.js";

export const expoAppTemplate: Template = {
  id: "expo-app",
  name: "Expo App",
  slug: "expo-app",
  description:
    "Cross-platform mobile app with Expo SDK and React Native. iOS, Android, and web from one codebase.",
  category: "app",
  frameworks: ["expo"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: [
    "starter",
    "expo",
    "react-native",
    "mobile",
    "ios",
    "android",
    "typescript",
  ],
  variables: [
    {
      name: "name",
      description: "Project name (used in package.json)",
      type: "string",
      default: "my-expo-app",
    },
    {
      name: "appName",
      description: "App display name (shown on device home screen)",
      type: "string",
      default: "My Expo App",
    },
    {
      name: "bundleIdentifier",
      description: "iOS bundle identifier (reverse domain)",
      type: "string",
      default: "com.magicappdev.myapp",
    },
    {
      name: "packageName",
      description: "Android package name",
      type: "string",
      default: "com.magicappdev.myapp",
    },
  ],
  dependencies: {
    expo: "~52.0.11",
    "expo-status-bar": "~2.0.0",
    "expo-router": "~4.0.9",
    react: "18.3.1",
    "react-native": "0.76.3",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0",
    "@expo/vector-icons": "^14.0.3",
  },
  devDependencies: {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    typescript: "^5.3.3",
  },
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
    "web": "expo start --web",
    "build": "eas build"
  },
  "dependencies": {
    "expo": "~52.0.11",
    "expo-status-bar": "~2.0.0",
    "expo-router": "~4.0.9",
    "react": "18.3.1",
    "react-native": "0.76.3",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.1.0",
    "@expo/vector-icons": "^14.0.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  }
}
`,
    },
    {
      path: "app.json",
      content: `{
  "expo": {
    "name": "{{appName}}",
    "slug": "{{kebabCase name}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1e293b"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "{{bundleIdentifier}}"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1e293b"
      },
      "package": "{{packageName}}"
    },
    "web": {
      "bundler": "metro"
    },
    "plugins": ["expo-router"],
    "scheme": "{{kebabCase name}}"
  }
}
`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
`,
    },
    {
      path: "babel.config.js",
      content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
`,
    },
    {
      path: "app/_layout.tsx",
      content: `import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
`,
    },
    {
      path: "app/(tabs)/_layout.tsx",
      content: `import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarStyle: { backgroundColor: '#1e293b' },
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
`,
    },
    {
      path: "app/(tabs)/index.tsx",
      content: `import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{{appName}}</Text>
        <Text style={styles.subtitle}>Built with Expo + MagicAppDev ✨</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 32, textAlign: 'center' },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
`,
    },
    {
      path: "app/(tabs)/explore.tsx",
      content: `import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover features of {{appName}}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
});
`,
    },
    {
      path: ".gitignore",
      content: `node_modules
.expo
dist
web-build
ios
android
`,
    },
    {
      path: "README.md",
      content: `# {{appName}}

{{description | default: "A cross-platform mobile app built with Expo."}}

## Getting Started

\`\`\`bash
npm install
npm start          # Opens Expo Go QR code
npm run ios        # iOS Simulator
npm run android    # Android Emulator
\`\`\`

## Build for Distribution

Install EAS CLI: \`npm install -g eas-cli\`

\`\`\`bash
eas build --platform ios
eas build --platform android
\`\`\`

Built with [MagicAppDev](https://magicappdev.com) ✨
`,
    },
  ],
};
