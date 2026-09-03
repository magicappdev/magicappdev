/**
 * Browser-compatible template preview utilities.
 * Wraps @magicappdev/templates-engine compile functions for client-side rendering.
 */

import {
  compileTemplate,
  compileFilePath,
  evaluateCondition,
} from "@magicappdev/templates-engine";
import type { Template, TemplateVariable } from "@magicappdev/templates-engine";

/** Build default variable values from a template's variable definitions */
export function buildDefaultVariables(
  variables: TemplateVariable[],
): Record<string, string | boolean | number> {
  const defaults: Record<string, string | boolean | number> = {};
  for (const v of variables) {
    if (v.default !== undefined) {
      defaults[v.name] = v.default;
    } else if (v.type === "boolean") {
      defaults[v.name] = false;
    } else if (v.type === "number") {
      defaults[v.name] = 0;
    } else if (v.type === "select" && v.options?.length) {
      defaults[v.name] = v.options[0];
    } else {
      defaults[v.name] = "";
    }
  }
  return defaults;
}

/** Rendered file output */
export interface RenderedFile {
  path: string;
  content: string;
}

/** Render all template files with given variables (client-safe) */
export function renderTemplateFiles(
  template: Template,
  variables: Record<string, string | boolean | number>,
): RenderedFile[] {
  const files: RenderedFile[] = [];

  for (const file of template.files) {
    // Check condition
    if (file.condition) {
      if (!evaluateCondition(file.condition, variables)) {
        continue;
      }
    }

    // Compile file path
    let filePath: string;
    try {
      filePath = compileFilePath(file.path, variables);
    } catch {
      // If variable is missing, use raw path as fallback
      filePath = file.path;
    }

    // Compile content
    const content = compileTemplate(file.content, variables);

    files.push({ path: filePath, content });
  }

  return files;
}

/** Get file extension for syntax highlighting */
export function getFileLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    html: "html",
    css: "css",
    md: "markdown",
    toml: "toml",
    yaml: "yaml",
    yml: "yaml",
    sh: "bash",
    bash: "bash",
  };
  return map[ext] || "plaintext";
}
