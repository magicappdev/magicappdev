/**
 * CLI-specific types for the MagicAppDev CLI tool
 */

import type { ProjectConfig, ProjectFramework } from "./app.types.js";

/** CLI command names */
export type CliCommand =
  | "init"
  | "generate"
  | "add"
  | "doctor"
  | "update"
  | "build"
  | "deploy";

/** Generator types */
export type GeneratorType = "app" | "component" | "screen" | "api" | "hook";

/** CLI global options */
export interface CliGlobalOptions {
  verbose?: boolean;
  debug?: boolean;
  noColor?: boolean;
  cwd?: string;
}

/** Init command options */
export interface InitCommandOptions extends CliGlobalOptions {
  template?: string;
  framework?: ProjectFramework;
  typescript?: boolean;
  packageManager?: "pnpm" | "npm" | "yarn" | "bun";
  git?: boolean;
  install?: boolean;
}

/** Generate command options */
export interface GenerateCommandOptions extends CliGlobalOptions {
  type: GeneratorType;
  name: string;
  path?: string;
  template?: string;
  props?: Record<string, unknown>;
}

/** Add command options */
export interface AddCommandOptions extends CliGlobalOptions {
  packages: string[];
  dev?: boolean;
}

/** Doctor command result */
export interface DoctorCheckResult {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
  fix?: string;
}

/** Doctor command options */
export interface DoctorCommandOptions extends CliGlobalOptions {
  fix?: boolean;
}

/** Build command options */
export interface BuildCommandOptions extends CliGlobalOptions {
  platform?: "ios" | "android" | "web" | "all";
  production?: boolean;
  clean?: boolean;
}

/** Deploy command options */
export interface DeployCommandOptions extends CliGlobalOptions {
  provider?: string;
  production?: boolean;
  preview?: boolean;
}

/** Project manifest (magicappdev.json) */
export interface ProjectManifest {
  name: string;
  version: string;
  framework: ProjectFramework;
  config: ProjectConfig;
  scripts?: Record<string, string>;
  generators?: Record<string, GeneratorConfig>;
}

/** Generator configuration */
export interface GeneratorConfig {
  templateDir?: string;
  outputDir?: string;
  variables?: Record<string, unknown>;
}

/** CLI theme colors */
export interface CliTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  muted: string;
}
