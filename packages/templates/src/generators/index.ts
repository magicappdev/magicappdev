/**
 * Template generators
 */

import {
  compileFilePath,
  compileTemplate,
  evaluateCondition,
  validateVariables,
} from ".././utils/index.js";
import type {
  GenerateOptions,
  GenerateResult,
  Template,
  TemplateFile,
} from "../types.js";
import * as path from "node:path";
import * as fs from "node:fs";

/** Generate files from a template */
export async function generateFromTemplate(
  template: Template,
  options: GenerateOptions,
): Promise<GenerateResult> {
  // Validate variables
  const validation = validateVariables(options.variables, template.variables);
  if (!validation.valid) {
    throw new Error(`Validation errors: ${validation.errors.join(", ")}`);
  }

  const result: GenerateResult = {
    files: [],
    skipped: [],
    dependencies: { ...template.dependencies },
    devDependencies: { ...template.devDependencies },
  };

  // Ensure output directory exists
  if (!options.dryRun) {
    await fs.promises.mkdir(options.outputDir, { recursive: true });
  }

  // Process each template file
  for (const templateFile of template.files) {
    const fileResult = await processTemplateFile(templateFile, options);

    if (fileResult.skipped) {
      result.skipped.push(fileResult.path);
    } else if (fileResult.generated) {
      result.files.push(fileResult.path);
    }
  }

  return result;
}

interface ProcessFileResult {
  path: string;
  generated: boolean;
  skipped: boolean;
}

/** Process a single template file */
async function processTemplateFile(
  templateFile: TemplateFile,
  options: GenerateOptions,
): Promise<ProcessFileResult> {
  // Check condition
  if (templateFile.condition) {
    const shouldInclude = evaluateCondition(
      templateFile.condition,
      options.variables,
    );
    if (!shouldInclude) {
      return { path: templateFile.path, generated: false, skipped: false };
    }
  }

  // Compile the file path
  const relativePath = compileFilePath(templateFile.path, options.variables);
  const absolutePath = path.join(options.outputDir, relativePath);

  // Check if file exists
  if (!options.overwrite && fs.existsSync(absolutePath)) {
    return { path: relativePath, generated: false, skipped: true };
  }

  // Compile the content
  const content = compileTemplate(templateFile.content, options.variables);

  // Write the file (unless dry run)
  if (!options.dryRun) {
    // Ensure parent directory exists
    const dir = path.dirname(absolutePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Write the file
    await fs.promises.writeFile(absolutePath, content, "utf-8");
  }

  return { path: relativePath, generated: true, skipped: false };
}

/** Generate a component from template */
export async function generateComponent(
  name: string,
  template: Template,
  outputDir: string,
  additionalVars: Record<string, unknown> = {},
): Promise<GenerateResult> {
  return generateFromTemplate(template, {
    outputDir,
    variables: {
      name,
      componentName: name,
      ...additionalVars,
    },
  });
}

/** Generate a screen from template */
export async function generateScreen(
  name: string,
  template: Template,
  outputDir: string,
  additionalVars: Record<string, unknown> = {},
): Promise<GenerateResult> {
  return generateFromTemplate(template, {
    outputDir,
    variables: {
      name,
      screenName: name,
      ...additionalVars,
    },
  });
}

/** Generate an app from template */
export async function generateApp(
  name: string,
  template: Template,
  outputDir: string,
  additionalVars: Record<string, unknown> = {},
): Promise<GenerateResult> {
  return generateFromTemplate(template, {
    outputDir: path.join(outputDir, name),
    variables: {
      name,
      appName: name,
      ...additionalVars,
    },
  });
}
