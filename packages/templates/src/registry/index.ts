/**
 * Template registry for managing and accessing templates
 */

import {
  compileFilePath,
  compileTemplate,
  evaluateCondition,
} from "../utils/index.js";
import type { Template, TemplateCategory, TemplateMetadata } from "../types.js";
import type { ProjectFramework } from "@magicappdev/shared";

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerateProjectResult {
  success: boolean;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  error?: string;
}

/** Template registry */
class TemplateRegistry {
  private templates: Map<string, Template> = new Map();

  /** Register a template */
  register(template: Template): void {
    if (this.templates.has(template.id)) {
      throw new Error(`Template with id "${template.id}" already registered`);
    }
    this.templates.set(template.id, template);
  }

  /** Register multiple templates */
  registerAll(templates: Template[]): void {
    for (const template of templates) {
      this.register(template);
    }
  }

  /** Get a template by ID */
  get(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /** Get a template by slug */
  getBySlug(slug: string): Template | undefined {
    for (const template of this.templates.values()) {
      if (template.slug === slug) {
        return template;
      }
    }
    return undefined;
  }

  /** Check if a template exists */
  has(id: string): boolean {
    return this.templates.has(id);
  }

  /** Get all templates */
  getAll(): Template[] {
    return Array.from(this.templates.values());
  }

  /** Get templates by category */
  getByCategory(category: TemplateCategory): Template[] {
    return this.getAll().filter(t => t.category === category);
  }

  /** Get templates by framework */
  getByFramework(framework: ProjectFramework): Template[] {
    return this.getAll().filter(t => t.frameworks.includes(framework));
  }

  /** Get templates by category and framework */
  filter(options: {
    category?: TemplateCategory;
    framework?: ProjectFramework;
    search?: string;
  }): Template[] {
    let templates = this.getAll();

    if (options.category) {
      templates = templates.filter(t => t.category === options.category);
    }

    if (options.framework) {
      templates = templates.filter(t =>
        t.frameworks.includes(options.framework!),
      );
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      templates = templates.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.tags?.some(tag => tag.toLowerCase().includes(search)),
      );
    }

    return templates;
  }

  /** Get template metadata only (without files) */
  getMetadata(): TemplateMetadata[] {
    return this.getAll().map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ files, variables, dependencies, devDependencies, ...metadata }) =>
        metadata,
    );
  }

  /** Generate files from a template in memory */
  generate(
    slug: string,
    projectName: string,
    variables: Record<string, unknown> = {},
  ): GenerateProjectResult {
    const template = this.getBySlug(slug);
    if (!template) {
      return {
        success: false,
        files: [],
        dependencies: {},
        devDependencies: {},
        error: `Template "${slug}" not found`,
      };
    }

    const finalVariables: Record<string, unknown> = {
      name: projectName,
      appName: projectName,
      ...variables,
    };

    for (const varDef of template.variables || []) {
      if (
        finalVariables[varDef.name] === undefined &&
        varDef.default !== undefined
      ) {
        finalVariables[varDef.name] = varDef.default;
      }
    }

    const files: GeneratedFile[] = [];

    for (const templateFile of template.files) {
      if (templateFile.condition) {
        const shouldInclude = evaluateCondition(
          templateFile.condition,
          finalVariables,
        );
        if (!shouldInclude) continue;
      }

      try {
        const filePath = compileFilePath(templateFile.path, finalVariables);
        const content = compileTemplate(templateFile.content, finalVariables);
        files.push({ path: filePath, content });
      } catch (err) {
        return {
          success: false,
          files,
          dependencies: template.dependencies || {},
          devDependencies: template.devDependencies || {},
          error:
            err instanceof Error ? err.message : "Failed to generate template",
        };
      }
    }

    return {
      success: true,
      files,
      dependencies: template.dependencies || {},
      devDependencies: template.devDependencies || {},
    };
  }

  /** Clear all templates */
  clear(): void {
    this.templates.clear();
  }

  /** Get template count */
  get count(): number {
    return this.templates.size;
  }
}

/** Global template registry instance */
export const registry = new TemplateRegistry();

/** Export the class for custom instances */
export { TemplateRegistry };
