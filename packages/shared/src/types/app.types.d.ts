/**
 * Core application types for MagicAppDev platform
 */
import type { Id, Timestamp } from "./common.types.js";
/** User account */
export interface User {
  id: Id;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
/** Project status */
export type ProjectStatus = "draft" | "active" | "archived" | "deployed";
/** Project framework */
export type ProjectFramework = "react-native" | "expo" | "next" | "remix";
/** Project configuration */
export interface ProjectConfig {
  framework: ProjectFramework;
  typescript: boolean;
  styling: "tailwind" | "nativewind" | "styled-components" | "css";
  stateManagement?: "zustand" | "jotai" | "redux" | "context";
  navigation?: "expo-router" | "react-navigation" | "next-router";
  testing?: "vitest" | "jest" | "none";
}
/** Project */
export interface Project {
  id: Id;
  userId: Id;
  name: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  config: ProjectConfig;
  githubUrl?: string;
  deploymentUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
/** Template category */
export type TemplateCategory = "app" | "component" | "screen" | "api";
/** Template */
export interface Template {
  id: Id;
  name: string;
  slug: string;
  description: string;
  category: TemplateCategory;
  framework: ProjectFramework;
  version: string;
  files: TemplateFile[];
  variables: TemplateVariable[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
/** Template file */
export interface TemplateFile {
  path: string;
  content: string;
  isOptional?: boolean;
}
/** Template variable */
export interface TemplateVariable {
  name: string;
  description: string;
  type: "string" | "boolean" | "number" | "select";
  default?: string | boolean | number;
  options?: string[];
  required?: boolean;
}
/** Deployment provider */
export type DeploymentProvider =
  | "cloudflare-pages"
  | "cloudflare-workers"
  | "vercel"
  | "netlify"
  | "expo-eas";
/** Deployment status */
export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "success"
  | "failed"
  | "cancelled";
/** Deployment */
export interface Deployment {
  id: Id;
  projectId: Id;
  provider: DeploymentProvider;
  status: DeploymentStatus;
  url?: string;
  commitHash?: string;
  branch?: string;
  logs?: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}
//# sourceMappingURL=app.types.d.ts.map
