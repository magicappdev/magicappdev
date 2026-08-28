/**
 * Unit tests for built-in templates
 */

import {
  builtInTemplates,
  registry,
  saasTemplate,
} from "@magicappdev/templates";
import { describe, it, expect } from "vitest";

describe("Template Registry", () => {
  it("should register all built-in templates", () => {
    expect(registry.count).toBeGreaterThanOrEqual(builtInTemplates.length);
    for (const template of builtInTemplates) {
      expect(registry.has(template.id)).toBe(true);
    }
  });

  it("should get all templates", () => {
    const all = registry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(builtInTemplates.length);
  });

  it("should filter templates by category", () => {
    const apps = registry.getByCategory("app");
    expect(apps.length).toBeGreaterThanOrEqual(1);
    for (const t of apps) {
      expect(t.category).toBe("app");
    }
  });

  it("should filter templates by framework", () => {
    const reactTemplates = registry.getByFramework("react");
    expect(reactTemplates.length).toBeGreaterThanOrEqual(1);
    for (const t of reactTemplates) {
      expect(t.frameworks).toContain("react");
    }
  });

  it("should search templates by name/description/tags", () => {
    const results = registry.filter({ search: "saas" });
    expect(results.some(t => t.id === "saas-starter")).toBe(true);
  });

  it("should get template by slug", () => {
    const template = registry.getBySlug("saas-starter");
    expect(template).toBeDefined();
    expect(template?.id).toBe("saas-starter");
  });

  it("should get template by ID", () => {
    const template = registry.get("saas-starter");
    expect(template).toBeDefined();
    expect(template?.name).toBe("SaaS Starter");
  });

  it("should return metadata without file content", () => {
    const metadata = registry.getMetadata();
    for (const m of metadata) {
      expect(m).not.toHaveProperty("files");
      expect(m).not.toHaveProperty("variables");
    }
  });
});

describe("SaaS Template", () => {
  it("should have correct metadata", () => {
    expect(saasTemplate.id).toBe("saas-starter");
    expect(saasTemplate.category).toBe("app");
    expect(saasTemplate.frameworks).toContain("react");
    expect(saasTemplate.variables.length).toBeGreaterThanOrEqual(3);
  });

  it("should have valid default variables", () => {
    for (const v of saasTemplate.variables) {
      if (v.required) {
        expect(v.default).toBeDefined();
      }
    }
  });

  it("should have files with paths and content", () => {
    for (const file of saasTemplate.files) {
      expect(file.path).toBeTruthy();
      expect(file.content).toBeTruthy();
    }
  });

  it("should include appName variable in content", () => {
    const appFile = saasTemplate.files.find(
      (f: { path: string }) => f.path === "src/App.tsx",
    );
    expect(appFile).toBeDefined();
    expect(appFile?.content).toContain("{{appName}}");
  });
});

describe("Template Validation", () => {
  it("should have unique IDs for all templates", () => {
    const ids = builtInTemplates.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all templates should have required metadata fields", () => {
    for (const template of builtInTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.slug).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.frameworks.length).toBeGreaterThanOrEqual(1);
      expect(template.files.length).toBeGreaterThanOrEqual(1);
    }
  });
});
