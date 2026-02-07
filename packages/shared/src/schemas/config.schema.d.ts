/**
 * Configuration validation schemas
 */
import { z } from "zod";
/** Project framework schema */
export declare const projectFrameworkSchema: z.ZodEnum<{
  "react-native": "react-native";
  expo: "expo";
  next: "next";
  remix: "remix";
}>;
/** Styling option schema */
export declare const stylingSchema: z.ZodEnum<{
  tailwind: "tailwind";
  nativewind: "nativewind";
  "styled-components": "styled-components";
  css: "css";
}>;
/** State management schema */
export declare const stateManagementSchema: z.ZodEnum<{
  zustand: "zustand";
  jotai: "jotai";
  redux: "redux";
  context: "context";
}>;
/** Navigation schema */
export declare const navigationSchema: z.ZodEnum<{
  "expo-router": "expo-router";
  "react-navigation": "react-navigation";
  "next-router": "next-router";
}>;
/** Testing framework schema */
export declare const testingSchema: z.ZodEnum<{
  vitest: "vitest";
  jest: "jest";
  none: "none";
}>;
/** Project configuration schema */
export declare const projectConfigSchema: z.ZodObject<
  {
    framework: z.ZodEnum<{
      "react-native": "react-native";
      expo: "expo";
      next: "next";
      remix: "remix";
    }>;
    typescript: z.ZodDefault<z.ZodBoolean>;
    styling: z.ZodDefault<
      z.ZodEnum<{
        tailwind: "tailwind";
        nativewind: "nativewind";
        "styled-components": "styled-components";
        css: "css";
      }>
    >;
    stateManagement: z.ZodOptional<
      z.ZodEnum<{
        zustand: "zustand";
        jotai: "jotai";
        redux: "redux";
        context: "context";
      }>
    >;
    navigation: z.ZodOptional<
      z.ZodEnum<{
        "expo-router": "expo-router";
        "react-navigation": "react-navigation";
        "next-router": "next-router";
      }>
    >;
    testing: z.ZodOptional<
      z.ZodEnum<{
        vitest: "vitest";
        jest: "jest";
        none: "none";
      }>
    >;
  },
  z.core.$strip
>;
/** Project status schema */
export declare const projectStatusSchema: z.ZodEnum<{
  draft: "draft";
  active: "active";
  archived: "archived";
  deployed: "deployed";
}>;
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
        framework: z.ZodEnum<{
          "react-native": "react-native";
          expo: "expo";
          next: "next";
          remix: "remix";
        }>;
        typescript: z.ZodDefault<z.ZodBoolean>;
        styling: z.ZodDefault<
          z.ZodEnum<{
            tailwind: "tailwind";
            nativewind: "nativewind";
            "styled-components": "styled-components";
            css: "css";
          }>
        >;
        stateManagement: z.ZodOptional<
          z.ZodEnum<{
            zustand: "zustand";
            jotai: "jotai";
            redux: "redux";
            context: "context";
          }>
        >;
        navigation: z.ZodOptional<
          z.ZodEnum<{
            "expo-router": "expo-router";
            "react-navigation": "react-navigation";
            "next-router": "next-router";
          }>
        >;
        testing: z.ZodOptional<
          z.ZodEnum<{
            vitest: "vitest";
            jest: "jest";
            none: "none";
          }>
        >;
      },
      z.core.$strip
    >;
    templateId: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
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
            z.ZodEnum<{
              "react-native": "react-native";
              expo: "expo";
              next: "next";
              remix: "remix";
            }>
          >;
          typescript: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
          styling: z.ZodOptional<
            z.ZodDefault<
              z.ZodEnum<{
                tailwind: "tailwind";
                nativewind: "nativewind";
                "styled-components": "styled-components";
                css: "css";
              }>
            >
          >;
          stateManagement: z.ZodOptional<
            z.ZodOptional<
              z.ZodEnum<{
                zustand: "zustand";
                jotai: "jotai";
                redux: "redux";
                context: "context";
              }>
            >
          >;
          navigation: z.ZodOptional<
            z.ZodOptional<
              z.ZodEnum<{
                "expo-router": "expo-router";
                "react-navigation": "react-navigation";
                "next-router": "next-router";
              }>
            >
          >;
          testing: z.ZodOptional<
            z.ZodOptional<
              z.ZodEnum<{
                vitest: "vitest";
                jest: "jest";
                none: "none";
              }>
            >
          >;
        },
        z.core.$strip
      >
    >;
    status: z.ZodOptional<
      z.ZodEnum<{
        draft: "draft";
        active: "active";
        archived: "archived";
        deployed: "deployed";
      }>
    >;
  },
  z.core.$strip
>;
/** Project manifest schema (magicappdev.json) */
export declare const projectManifestSchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodString;
    framework: z.ZodEnum<{
      "react-native": "react-native";
      expo: "expo";
      next: "next";
      remix: "remix";
    }>;
    config: z.ZodObject<
      {
        framework: z.ZodEnum<{
          "react-native": "react-native";
          expo: "expo";
          next: "next";
          remix: "remix";
        }>;
        typescript: z.ZodDefault<z.ZodBoolean>;
        styling: z.ZodDefault<
          z.ZodEnum<{
            tailwind: "tailwind";
            nativewind: "nativewind";
            "styled-components": "styled-components";
            css: "css";
          }>
        >;
        stateManagement: z.ZodOptional<
          z.ZodEnum<{
            zustand: "zustand";
            jotai: "jotai";
            redux: "redux";
            context: "context";
          }>
        >;
        navigation: z.ZodOptional<
          z.ZodEnum<{
            "expo-router": "expo-router";
            "react-navigation": "react-navigation";
            "next-router": "next-router";
          }>
        >;
        testing: z.ZodOptional<
          z.ZodEnum<{
            vitest: "vitest";
            jest: "jest";
            none: "none";
          }>
        >;
      },
      z.core.$strip
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
          z.core.$strip
        >
      >
    >;
  },
  z.core.$strip
>;
/** Inferred types from schemas */
export type ProjectConfigSchemaInput = z.input<typeof projectConfigSchema>;
export type ProjectConfigSchemaOutput = z.infer<typeof projectConfigSchema>;
export type CreateProjectSchemaInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchemaInput = z.infer<typeof updateProjectSchema>;
export type ProjectManifestSchemaInput = z.infer<typeof projectManifestSchema>;
//# sourceMappingURL=config.schema.d.ts.map
