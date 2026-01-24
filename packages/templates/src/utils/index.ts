/**
 * Template utilities
 */

import {
  slugify,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
} from "@magicappdev/shared";
import Handlebars from "handlebars";

// Register Handlebars helpers
Handlebars.registerHelper("camelCase", (str: string) => toCamelCase(str));
Handlebars.registerHelper("pascalCase", (str: string) => toPascalCase(str));
Handlebars.registerHelper("kebabCase", (str: string) => toKebabCase(str));
Handlebars.registerHelper("snakeCase", (str: string) => toSnakeCase(str));
Handlebars.registerHelper("slugify", (str: string) => slugify(str));
Handlebars.registerHelper("uppercase", (str: string) => str.toUpperCase());
Handlebars.registerHelper("lowercase", (str: string) => str.toLowerCase());

// Navigation helpers
Handlebars.registerHelper("headerShown", (value: boolean) => value);

// Conditional helpers
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("ne", (a: unknown, b: unknown) => a !== b);
Handlebars.registerHelper("and", (a: unknown, b: unknown) => a && b);
Handlebars.registerHelper("or", (a: unknown, b: unknown) => a || b);
Handlebars.registerHelper("not", (a: unknown) => !a);

/** Compile a template string with variables */
export function compileTemplate(
  template: string,
  variables: Record<string, unknown>,
): string {
  const compiled = Handlebars.compile(template, { noEscape: true });
  return compiled(variables);
}

/** Compile a file path with variables */
export function compileFilePath(
  path: string,
  variables: Record<string, unknown>,
): string {
  // Replace {{variable}} patterns in file paths
  return path.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined) {
      throw new Error(`Missing variable: ${key}`);
    }
    return String(value);
  });
}

/** Evaluate a condition string */
export function evaluateCondition(
  condition: string,
  variables: Record<string, unknown>,
): boolean {
  // Simple condition evaluation for patterns like:
  // - "typescript" (truthy check)
  // - "typescript === true"
  // - "framework === 'expo'"
  // - "!useNavigation"

  const trimmed = condition.trim();

  // Negation
  if (trimmed.startsWith("!")) {
    const varName = trimmed.slice(1).trim();
    return !variables[varName];
  }

  // Equality check
  if (trimmed.includes("===")) {
    const [left, right] = trimmed.split("===").map(s => s.trim());
    const leftValue = variables[left] ?? left;
    let rightValue: unknown = right;

    // Parse right side
    if (right === "true") rightValue = true;
    else if (right === "false") rightValue = false;
    else if (right.startsWith("'") && right.endsWith("'")) {
      rightValue = right.slice(1, -1);
    } else if (right.startsWith('"') && right.endsWith('"')) {
      rightValue = right.slice(1, -1);
    } else if (!isNaN(Number(right))) {
      rightValue = Number(right);
    }

    return leftValue === rightValue;
  }

  // Inequality check
  if (trimmed.includes("!==")) {
    const [left, right] = trimmed.split("!==").map(s => s.trim());
    const leftValue = variables[left] ?? left;
    let rightValue: unknown = right;

    if (right === "true") rightValue = true;
    else if (right === "false") rightValue = false;
    else if (right.startsWith("'") && right.endsWith("'")) {
      rightValue = right.slice(1, -1);
    } else if (right.startsWith('"') && right.endsWith('"')) {
      rightValue = right.slice(1, -1);
    }

    return leftValue !== rightValue;
  }

  // Simple truthy check
  return !!variables[trimmed];
}

/** Validate template variables against their definitions */
export function validateVariables(
  variables: Record<string, unknown>,
  definitions: Array<{
    name: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const def of definitions) {
    const value = variables[def.name];

    // Check required
    if (def.required && value === undefined) {
      errors.push(`Missing required variable: ${def.name}`);
      continue;
    }

    // Skip optional undefined values
    if (value === undefined) continue;

    // Type validation
    switch (def.type) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`Variable "${def.name}" must be a string`);
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Variable "${def.name}" must be a boolean`);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          errors.push(`Variable "${def.name}" must be a number`);
        }
        break;
      case "select":
        if (def.options && !def.options.includes(String(value))) {
          errors.push(
            `Variable "${def.name}" must be one of: ${def.options.join(", ")}`,
          );
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors };
}
