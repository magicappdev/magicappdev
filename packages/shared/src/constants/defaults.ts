/**
 * Default configuration values
 */

import type { ProjectConfig, ProjectFramework } from "../types/index";

/** Default project framework */
export const DEFAULT_FRAMEWORK: ProjectFramework = "expo";

/** Default project configuration */
export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  framework: "expo",
  typescript: true,
  styling: "nativewind",
  stateManagement: "zustand",
  navigation: "expo-router",
  testing: "vitest",
};

/** Default pagination */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Default AI settings */
export const DEFAULT_AI_PROVIDER = "workers-ai" as const;
export const DEFAULT_AI_TEMPERATURE = 0.7;
export const DEFAULT_AI_MAX_TOKENS = 4096;

/** Default timeouts (in milliseconds) */
export const DEFAULT_REQUEST_TIMEOUT = 30000;
export const DEFAULT_AI_TIMEOUT = 60000;
export const DEFAULT_DEPLOY_TIMEOUT = 300000;

/** Project name constraints */
export const PROJECT_NAME_MIN_LENGTH = 2;
export const PROJECT_NAME_MAX_LENGTH = 64;
export const PROJECT_SLUG_PATTERN = /^[a-z0-9-]+$/;

/** File size limits (in bytes) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TEMPLATE_SIZE = 50 * 1024 * 1024; // 50MB
