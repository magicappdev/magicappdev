/**
 * Tabs app template - Tab-based navigation
 */

import type { Template } from "../types.js";

export const tabsAppTemplate: Template = {
  id: "tabs",
  name: "Tabs",
  slug: "tabs",
  description: "Tab-based navigation with multiple screens",
  category: "app",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["tabs", "navigation", "starter"],
  variables: [
    {
      name: "name",
      description: "App name",
      type: "string",
      default: "my-app",
    },
    {
      name: "appName",
      description: "App display name",
      type: "string",
      default: "My App",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    {
      name: "framework",
      description: "Framework to use",
      type: "string",
      default: "expo",
    },
  ],
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "1.0.0",
  {{#if (eq framework 'expo')}}
  "main": "expo-router/entry",
  {{else}}
  "main": "index.js",
  {{/if}}
  "scripts": {
    {{#if (eq framework 'expo')}}
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
    {{else}}
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios"
    {{/if}}
  },
  "dependencies": {
    {{#if (eq framework 'expo')}}
    "expo": "~53.0.0",
    "expo-router": "~5.0.0",
    "expo-status-bar": "~2.2.0",
    "@expo/vector-icons": "^14.0.0",
    {{else}}
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "react-native-safe-area-context": "^5.0.0",
    "react-native-screens": "^4.0.0",
    "react-native-vector-icons": "^10.0.0",
    {{/if}}
    "react": "18.3.1",
    "react-native": "0.79.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.8.0"
  }
}
`,
    },
    {
      path: "app.json",
      condition: "framework === 'expo'",
      content: `{
  "expo": {
    "name": "{{name}}",
    "slug": "{{kebabCase name}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro"
    },
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
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
`,
    },
    {
      path: "app/_layout.tsx",
      condition: "framework === 'expo'",
      content: `{{{{raw}}}}import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
{{{{/raw}}}}`,
    },
    {
      path: "app/(tabs)/_layout.tsx",
      condition: "framework === 'expo'",
      content: `{{{{raw}}}}import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
{{{{/raw}}}}`,
    },
    {
      path: "app/(tabs)/index.tsx",
      condition: "framework === 'expo'",
      content: `{{{{raw}}}}import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {{{{/raw}}}}{{name}}{{{{raw}}}}</Text>
      <Text style={styles.subtitle}>Start building something amazing!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
{{{{/raw}}}}`,
    },
    {
      path: "app/(tabs)/explore.tsx",
      condition: "framework === 'expo'",
      content: `{{{{raw}}}}import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>Discover new features and content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
{{{{/raw}}}}`,
    },
    {
      path: "app/(tabs)/settings.tsx",
      condition: "framework === 'expo'",
      content: `{{{{raw}}}}import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your app preferences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
{{{{/raw}}}}`,
    },
    {
      path: "index.js",
      condition: "framework !== 'expo'",
      content: `import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);
`,
    },
    {
      path: "App.tsx",
      condition: "framework !== 'expo'",
      content: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome to {{name}}</Text>
      <Text style={styles.subtitle}>Start building something amazing!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your app preferences</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
`,
    },
    {
      path: "assets/.gitkeep",
      content: "",
    },
  ],
  dependencies: {
    expo: "~53.0.0",
    "expo-router": "~5.0.0",
    "expo-status-bar": "~2.2.0",
    react: "18.3.1",
    "react-native": "0.79.0",
    "@expo/vector-icons": "^14.0.0",
  },
  devDependencies: {
    "@types/react": "~18.3.0",
    typescript: "~5.8.0",
  },
};
