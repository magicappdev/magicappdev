/**
 * Screen template
 */

import type { Template } from "../types.js";

export const screenTemplate: Template = {
  id: "screen",
  name: "Screen",
  slug: "screen",
  description: "A full screen component with safe area handling",
  category: "component",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "screen", "navigation"],
  variables: [
    {
      name: "name",
      description: "Screen name",
      type: "string",
      default: "HomeScreen",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface {{pascalCase name}}Props {
  navigation?: any; // Replace with proper navigation type
  route?: any;      // Replace with proper route type
}

export function {{pascalCase name}}({ navigation, route }: {{pascalCase name}}Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{{pascalCase name}}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default {{pascalCase name}};
`,
    },
    {
      path: "index.ts",
      content: `export { {{pascalCase name}}, default } from "./{{pascalCase name}}";
`,
    },
  ],
};
