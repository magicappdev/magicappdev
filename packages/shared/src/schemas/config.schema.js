/**
 * Configuration validation schemas
 */
import { z } from "zod";
/** Project framework schema */
export const projectFrameworkSchema = z.enum([
  "react-native",
  "expo",
  "next",
  "remix",
]);
/** Styling option schema */
export const stylingSchema = z.enum([
  "tailwind",
  "nativewind",
  "styled-components",
  "css",
]);
/** State management schema */
export const stateManagementSchema = z.enum([
  "zustand",
  "jotai",
  "redux",
  "context",
]);
/** Navigation schema */
export const navigationSchema = z.enum([
  "expo-router",
  "react-navigation",
  "next-router",
]);
/** Testing framework schema */
export const testingSchema = z.enum(["vitest", "jest", "none"]);
/** Project configuration schema */
export const projectConfigSchema = z.object({
  framework: projectFrameworkSchema,
  typescript: z.boolean().default(true),
  styling: stylingSchema.default("nativewind"),
  stateManagement: stateManagementSchema.optional(),
  navigation: navigationSchema.optional(),
  testing: testingSchema.optional(),
});
/** Project status schema */
export const projectStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
  "deployed",
]);
/** Project name schema */
export const projectNameSchema = z
  .string()
  .min(2, "Project name must be at least 2 characters")
  .max(64, "Project name must be at most 64 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9-_ ]*$/,
    "Project name must start with a letter and contain only letters, numbers, hyphens, underscores, and spaces",
  );
/** Project slug schema */
export const projectSlugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(64, "Slug must be at most 64 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug must contain only lowercase letters, numbers, and hyphens",
  );
/** Create project schema */
export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: z.string().max(500).optional(),
  config: projectConfigSchema,
  templateId: z.string().uuid().optional(),
});
/** Update project schema */
export const updateProjectSchema = z.object({
  name: projectNameSchema.optional(),
  description: z.string().max(500).optional(),
  config: projectConfigSchema.partial().optional(),
  status: projectStatusSchema.optional(),
});
/** Project manifest schema (magicappdev.json) */
export const projectManifestSchema = z.object({
  name: projectNameSchema,
  version: z.string().regex(/^\d+\.\d+\.\d+/, "Invalid semver version"),
  framework: projectFrameworkSchema,
  config: projectConfigSchema,
  scripts: z.record(z.string(), z.string()).optional(),
  generators: z
    .record(
      z.string(),
      z.object({
        templateDir: z.string().optional(),
        outputDir: z.string().optional(),
        variables: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
});
