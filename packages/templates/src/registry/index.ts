/**
 * Template registry for managing and accessing templates
 */

import type { ProjectFramework } from "@magicappdev/shared";
import type { Template, TemplateCategory, TemplateMetadata } from "../types";

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
      templates = templates.filter(t => t.frameworks.includes(options.framework!));
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
    return this.getAll().map(({ files, variables, dependencies, devDependencies, ...metadata }) => metadata);
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
