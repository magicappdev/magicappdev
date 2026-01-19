/**
 * Button component template
 */

import type { Template } from "../types";

export const buttonComponentTemplate: Template = {
  id: "button-component",
  name: "Button",
  slug: "button",
  description: "A customizable button component with variants and sizes",
  category: "component",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "button", "pressable"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Button",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    {
      name: "withVariants",
      description: "Include variant styles",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";

{{#if withVariants}}
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface {{pascalCase name}}Props extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
{{else}}
interface {{pascalCase name}}Props extends Omit<PressableProps, "style"> {
  title: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
{{/if}}

export function {{pascalCase name}}({
  title,
{{#if withVariants}}
  variant = "primary",
  size = "md",
{{/if}}
  disabled = false,
  style,
  textStyle,
  ...props
}: {{pascalCase name}}Props) {
{{#if withVariants}}
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[\`\${size}Button\`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[\`\${variant}Label\`],
    styles[\`\${size}Label\`],
    disabled && styles.disabledLabel,
    textStyle,
  ];
{{else}}
  const buttonStyle = [
    styles.base,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    disabled && styles.disabledLabel,
    textStyle,
  ];
{{/if}}

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text style={labelStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
{{#if withVariants}}
  // Variants
  primary: {
    backgroundColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "#5856D6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  // Sizes
  smButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mdButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lgButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
{{else}}
  // Default style
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: "#007AFF",
{{/if}}
  // States
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  // Labels
  label: {
    fontWeight: "600",
  },
{{#if withVariants}}
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: "#FFFFFF",
  },
  outlineLabel: {
    color: "#007AFF",
  },
  ghostLabel: {
    color: "#007AFF",
  },
  smLabel: {
    fontSize: 14,
  },
  mdLabel: {
    fontSize: 16,
  },
  lgLabel: {
    fontSize: 18,
  },
{{else}}
  color: "#FFFFFF",
  fontSize: 16,
{{/if}}
  disabledLabel: {
    color: "#999",
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
