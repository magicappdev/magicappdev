/**
 * Tabs app template - Expo app with tab navigation
 */

import type { Template } from "../types.js";

export const tabsAppTemplate: Template = {
  id: "tabs-app",
  name: "Tabs App",
  slug: "tabs",
  description: "An Expo app with tab-based navigation and TypeScript",
  category: "app",
  frameworks: ["expo"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["tabs", "navigation", "starter"],
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      required: true,
    },
    {
      name: "description",
      description: "Project description",
      type: "string",
      default: "A tab-based MagicAppDev project",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
  ],
  dependencies: {
    expo: "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    react: "18.3.1",
    "react-native": "0.76.0",
    "@expo/vector-icons": "^14.0.0",
  },
  devDependencies: {
    "@types/react": "~18.3.0",
    typescript: "~5.8.0",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.8.0"
  }
}`,
    },
    {
      path: "app.json",
      content: `{
  "expo": {
    "name": "{{name}}",
    "slug": "{{kebabCase name}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
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
      "favicon": "./assets/favicon.png"
    }
  }
}`,
    },
    {
      path: "tsconfig.json",
      condition: "typescript",
      content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}`,
    },
    {
      path: "app/_layout.tsx",
      content: `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}`,
    },
    {
      path: "app/(tabs)/_layout.tsx",
      content: `import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}`,
    },
    {
      path: "app/(tabs)/index.tsx",
      content: `import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {{name}}</Text>
      <Text style={styles.subtitle}>This is the home tab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});`,
    },
    {
      path: "app/(tabs)/explore.tsx",
      content: `import { StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>Discover new content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});`,
    },
    {
      path: "app/(tabs)/settings.tsx",
      content: `import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure your preferences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});`,
    },
    {
      path: ".gitignore",
      content: `node_modules/
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env.local
.env.*.local`,
    },
    {
      path: "README.md",
      content: `# {{name}}

{{description}}

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Project Structure

\`\`\`
app/
  _layout.tsx          # Root layout
  (tabs)/
    _layout.tsx        # Tab navigator
    index.tsx          # Home tab
    explore.tsx        # Explore tab
    settings.tsx       # Settings tab
\`\`\`

## Scripts

- \`npm start\` - Start the development server
- \`npm run android\` - Start on Android
- \`npm run ios\` - Start on iOS
- \`npm run web\` - Start on web
`,
    },
  ],
};
