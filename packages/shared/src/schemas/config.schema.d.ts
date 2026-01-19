/**
 * Configuration validation schemas
 */
import { z } from "zod";
/** Project framework schema */
export declare const projectFrameworkSchema: z.ZodEnum<
  ["react-native", "expo", "next", "remix"]
>;
/** Styling option schema */
export declare const stylingSchema: z.ZodEnum<
  ["tailwind", "nativewind", "styled-components", "css"]
>;
/** State management schema */
export declare const stateManagementSchema: z.ZodEnum<
  ["zustand", "jotai", "redux", "context"]
>;
/** Navigation schema */
export declare const navigationSchema: z.ZodEnum<
  ["expo-router", "react-navigation", "next-router"]
>;
/** Testing framework schema */
export declare const testingSchema: z.ZodEnum<["vitest", "jest", "none"]>;
/** Project configuration schema */
export declare const projectConfigSchema: z.ZodObject<
  {
    framework: z.ZodEnum<["react-native", "expo", "next", "remix"]>;
    typescript: z.ZodDefault<z.ZodBoolean>;
    styling: z.ZodDefault<
      z.ZodEnum<["tailwind", "nativewind", "styled-components", "css"]>
    >;
    stateManagement: z.ZodOptional<
      z.ZodEnum<["zustand", "jotai", "redux", "context"]>
    >;
    navigation: z.ZodOptional<
      z.ZodEnum<["expo-router", "react-navigation", "next-router"]>
    >;
    testing: z.ZodOptional<z.ZodEnum<["vitest", "jest", "none"]>>;
  },
  "strip",
  z.ZodTypeAny,
  {
    framework: "react-native" | "expo" | "next" | "remix";
    typescript: boolean;
    styling: "nativewind" | "tailwind" | "styled-components" | "css";
    stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
    navigation?: "expo-router" | "react-navigation" | "next-router" | undefined;
    testing?: "vitest" | "jest" | "none" | undefined;
  },
  {
    framework: "react-native" | "expo" | "next" | "remix";
    typescript?: boolean | undefined;
    styling?:
      | "nativewind"
      | "tailwind"
      | "styled-components"
      | "css"
      | undefined;
    stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
    navigation?: "expo-router" | "react-navigation" | "next-router" | undefined;
    testing?: "vitest" | "jest" | "none" | undefined;
  }
>;
/** Project status schema */
export declare const projectStatusSchema: z.ZodEnum<
  ["draft", "active", "archived", "deployed"]
>;
/** Project name schema */
export declare const projectNameSchema: z.ZodString;
/** Project slug schema */
export declare const projectSlugSchema: z.ZodString;
/** Create project schema */
export declare const createProjectSchema: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<
      {
        framework: z.ZodEnum<["react-native", "expo", "next", "remix"]>;
        typescript: z.ZodDefault<z.ZodBoolean>;
        styling: z.ZodDefault<
          z.ZodEnum<["tailwind", "nativewind", "styled-components", "css"]>
        >;
        stateManagement: z.ZodOptional<
          z.ZodEnum<["zustand", "jotai", "redux", "context"]>
        >;
        navigation: z.ZodOptional<
          z.ZodEnum<["expo-router", "react-navigation", "next-router"]>
        >;
        testing: z.ZodOptional<z.ZodEnum<["vitest", "jest", "none"]>>;
      },
      "strip",
      z.ZodTypeAny,
      {
        framework: "react-native" | "expo" | "next" | "remix";
        typescript: boolean;
        styling: "nativewind" | "tailwind" | "styled-components" | "css";
        stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
        navigation?:
          | "expo-router"
          | "react-navigation"
          | "next-router"
          | undefined;
        testing?: "vitest" | "jest" | "none" | undefined;
      },
      {
        framework: "react-native" | "expo" | "next" | "remix";
        typescript?: boolean | undefined;
        styling?:
          | "nativewind"
          | "tailwind"
          | "styled-components"
          | "css"
          | undefined;
        stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
        navigation?:
          | "expo-router"
          | "react-navigation"
          | "next-router"
          | undefined;
        testing?: "vitest" | "jest" | "none" | undefined;
      }
    >;
    templateId: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    name: string;
    config: {
      framework: "react-native" | "expo" | "next" | "remix";
      typescript: boolean;
      styling: "nativewind" | "tailwind" | "styled-components" | "css";
      stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
      navigation?:
        | "expo-router"
        | "react-navigation"
        | "next-router"
        | undefined;
      testing?: "vitest" | "jest" | "none" | undefined;
    };
    description?: string | undefined;
    templateId?: string | undefined;
  },
  {
    name: string;
    config: {
      framework: "react-native" | "expo" | "next" | "remix";
      typescript?: boolean | undefined;
      styling?:
        | "nativewind"
        | "tailwind"
        | "styled-components"
        | "css"
        | undefined;
      stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
      navigation?:
        | "expo-router"
        | "react-navigation"
        | "next-router"
        | undefined;
      testing?: "vitest" | "jest" | "none" | undefined;
    };
    description?: string | undefined;
    templateId?: string | undefined;
  }
>;
/** Update project schema */
export declare const updateProjectSchema: z.ZodObject<
  {
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    config: z.ZodOptional<
      z.ZodObject<
        {
          framework: z.ZodOptional<
            z.ZodEnum<["react-native", "expo", "next", "remix"]>
          >;
          typescript: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
          styling: z.ZodOptional<
            z.ZodDefault<
              z.ZodEnum<["tailwind", "nativewind", "styled-components", "css"]>
            >
          >;
          stateManagement: z.ZodOptional<
            z.ZodOptional<z.ZodEnum<["zustand", "jotai", "redux", "context"]>>
          >;
          navigation: z.ZodOptional<
            z.ZodOptional<
              z.ZodEnum<["expo-router", "react-navigation", "next-router"]>
            >
          >;
          testing: z.ZodOptional<
            z.ZodOptional<z.ZodEnum<["vitest", "jest", "none"]>>
          >;
        },
        "strip",
        z.ZodTypeAny,
        {
          framework?: "react-native" | "expo" | "next" | "remix" | undefined;
          typescript?: boolean | undefined;
          styling?:
            | "nativewind"
            | "tailwind"
            | "styled-components"
            | "css"
            | undefined;
          stateManagement?:
            | "zustand"
            | "jotai"
            | "redux"
            | "context"
            | undefined;
          navigation?:
            | "expo-router"
            | "react-navigation"
            | "next-router"
            | undefined;
          testing?: "vitest" | "jest" | "none" | undefined;
        },
        {
          framework?: "react-native" | "expo" | "next" | "remix" | undefined;
          typescript?: boolean | undefined;
          styling?:
            | "nativewind"
            | "tailwind"
            | "styled-components"
            | "css"
            | undefined;
          stateManagement?:
            | "zustand"
            | "jotai"
            | "redux"
            | "context"
            | undefined;
          navigation?:
            | "expo-router"
            | "react-navigation"
            | "next-router"
            | undefined;
          testing?: "vitest" | "jest" | "none" | undefined;
        }
      >
    >;
    status: z.ZodOptional<
      z.ZodEnum<["draft", "active", "archived", "deployed"]>
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    name?: string | undefined;
    status?: "draft" | "active" | "archived" | "deployed" | undefined;
    description?: string | undefined;
    config?:
      | {
          framework?: "react-native" | "expo" | "next" | "remix" | undefined;
          typescript?: boolean | undefined;
          styling?:
            | "nativewind"
            | "tailwind"
            | "styled-components"
            | "css"
            | undefined;
          stateManagement?:
            | "zustand"
            | "jotai"
            | "redux"
            | "context"
            | undefined;
          navigation?:
            | "expo-router"
            | "react-navigation"
            | "next-router"
            | undefined;
          testing?: "vitest" | "jest" | "none" | undefined;
        }
      | undefined;
  },
  {
    name?: string | undefined;
    status?: "draft" | "active" | "archived" | "deployed" | undefined;
    description?: string | undefined;
    config?:
      | {
          framework?: "react-native" | "expo" | "next" | "remix" | undefined;
          typescript?: boolean | undefined;
          styling?:
            | "nativewind"
            | "tailwind"
            | "styled-components"
            | "css"
            | undefined;
          stateManagement?:
            | "zustand"
            | "jotai"
            | "redux"
            | "context"
            | undefined;
          navigation?:
            | "expo-router"
            | "react-navigation"
            | "next-router"
            | undefined;
          testing?: "vitest" | "jest" | "none" | undefined;
        }
      | undefined;
  }
>;
/** Project manifest schema (magicappdev.json) */
export declare const projectManifestSchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodString;
    framework: z.ZodEnum<["react-native", "expo", "next", "remix"]>;
    config: z.ZodObject<
      {
        framework: z.ZodEnum<["react-native", "expo", "next", "remix"]>;
        typescript: z.ZodDefault<z.ZodBoolean>;
        styling: z.ZodDefault<
          z.ZodEnum<["tailwind", "nativewind", "styled-components", "css"]>
        >;
        stateManagement: z.ZodOptional<
          z.ZodEnum<["zustand", "jotai", "redux", "context"]>
        >;
        navigation: z.ZodOptional<
          z.ZodEnum<["expo-router", "react-navigation", "next-router"]>
        >;
        testing: z.ZodOptional<z.ZodEnum<["vitest", "jest", "none"]>>;
      },
      "strip",
      z.ZodTypeAny,
      {
        framework: "react-native" | "expo" | "next" | "remix";
        typescript: boolean;
        styling: "nativewind" | "tailwind" | "styled-components" | "css";
        stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
        navigation?:
          | "expo-router"
          | "react-navigation"
          | "next-router"
          | undefined;
        testing?: "vitest" | "jest" | "none" | undefined;
      },
      {
        framework: "react-native" | "expo" | "next" | "remix";
        typescript?: boolean | undefined;
        styling?:
          | "nativewind"
          | "tailwind"
          | "styled-components"
          | "css"
          | undefined;
        stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
        navigation?:
          | "expo-router"
          | "react-navigation"
          | "next-router"
          | undefined;
        testing?: "vitest" | "jest" | "none" | undefined;
      }
    >;
    scripts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    generators: z.ZodOptional<
      z.ZodRecord<
        z.ZodString,
        z.ZodObject<
          {
            templateDir: z.ZodOptional<z.ZodString>;
            outputDir: z.ZodOptional<z.ZodString>;
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          },
          "strip",
          z.ZodTypeAny,
          {
            templateDir?: string | undefined;
            outputDir?: string | undefined;
            variables?: Record<string, unknown> | undefined;
          },
          {
            templateDir?: string | undefined;
            outputDir?: string | undefined;
            variables?: Record<string, unknown> | undefined;
          }
        >
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    framework: "react-native" | "expo" | "next" | "remix";
    name: string;
    config: {
      framework: "react-native" | "expo" | "next" | "remix";
      typescript: boolean;
      styling: "nativewind" | "tailwind" | "styled-components" | "css";
      stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
      navigation?:
        | "expo-router"
        | "react-navigation"
        | "next-router"
        | undefined;
      testing?: "vitest" | "jest" | "none" | undefined;
    };
    version: string;
    scripts?: Record<string, string> | undefined;
    generators?:
      | Record<
          string,
          {
            templateDir?: string | undefined;
            outputDir?: string | undefined;
            variables?: Record<string, unknown> | undefined;
          }
        >
      | undefined;
  },
  {
    framework: "react-native" | "expo" | "next" | "remix";
    name: string;
    config: {
      framework: "react-native" | "expo" | "next" | "remix";
      typescript?: boolean | undefined;
      styling?:
        | "nativewind"
        | "tailwind"
        | "styled-components"
        | "css"
        | undefined;
      stateManagement?: "zustand" | "jotai" | "redux" | "context" | undefined;
      navigation?:
        | "expo-router"
        | "react-navigation"
        | "next-router"
        | undefined;
      testing?: "vitest" | "jest" | "none" | undefined;
    };
    version: string;
    scripts?: Record<string, string> | undefined;
    generators?:
      | Record<
          string,
          {
            templateDir?: string | undefined;
            outputDir?: string | undefined;
            variables?: Record<string, unknown> | undefined;
          }
        >
      | undefined;
  }
>;
/** Inferred types from schemas */
export type ProjectConfigSchemaInput = z.input<typeof projectConfigSchema>;
export type ProjectConfigSchemaOutput = z.infer<typeof projectConfigSchema>;
export type CreateProjectSchemaInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchemaInput = z.infer<typeof updateProjectSchema>;
export type ProjectManifestSchemaInput = z.infer<typeof projectManifestSchema>;
//# sourceMappingURL=config.schema.d.ts.map
