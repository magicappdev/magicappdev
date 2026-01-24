/**
 * Template types for the MagicAppDev template system
 */

import type { ProjectFramework } from "@magicappdev/shared";

/** Template category */
export type TemplateCategory = "app" | "component" | "screen" | "hook" | "api";

/** Template variable type */
export type TemplateVariableType = "string" | "boolean" | "number" | "select";

/** Template variable definition */
export interface TemplateVariable {
  name: string;
  description: string;
  type: TemplateVariableType;
  default?: string | boolean | number;
  options?: string[];
  required?: boolean;
}

/** Template file definition */
export interface TemplateFile {
  /** Relative path within the template (can contain variables like {{name}}) */
  path: string;
  /** File content (can contain Handlebars expressions) */
  content: string;
  /** Whether the file is optional */
  isOptional?: boolean;
  /** Condition for including this file (e.g., "typescript === true") */
  condition?: string;
}

/** Template metadata */
export interface TemplateMetadata {
  /** Unique template identifier */
  id: string;
  /** Display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Template description */
  description: string;
  /** Template category */
  category: TemplateCategory;
  /** Compatible frameworks */
  frameworks: ProjectFramework[];
  /** Template version */
  version: string;
  /** Author name */
  author?: string;
  /** Tags for search */
  tags?: string[];
}

/** Complete template definition */
export interface Template extends TemplateMetadata {
  /** Template files */
  files: TemplateFile[];
  /** Template variables */
  variables: TemplateVariable[];
  /** Dependencies to install */
  dependencies?: Record<string, string>;
  /** Dev dependencies to install */
  devDependencies?: Record<string, string>;
}

/** Template generation options */
export interface GenerateOptions {
  /** Target output directory */
  outputDir: string;
  /** Variable values */
  variables: Record<string, string | boolean | number>;
  /** User preferences */
  preferences?: Record<string, boolean>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Dry run (don't write files) */
  dryRun?: boolean;
}

/** Generation result */
export interface GenerateResult {
  /** Files that were generated */
  files: string[];
  /** Files that were skipped (already exist) */
  skipped: string[];
  /** Dependencies to install */
  dependencies: Record<string, string>;
  /** Dev dependencies to install */
  devDependencies: Record<string, string>;
}
