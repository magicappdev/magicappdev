import type { ProjectFramework, TemplateCategory } from "../types.js";
import { builtInTemplates, registry } from "../index.js";
import { describe, it, expect } from "vitest";

const VALID_CATEGORIES: TemplateCategory[] = [
  "app",
  "component",
  "screen",
  "hook",
  "api",
];

const VALID_FRAMEWORKS: ProjectFramework[] = [
  "expo",
  "react-native",
  "next",
  "remix",
  "hono",
  "cloudflare",
];

describe("built-in template metadata", () => {
  it("has at least one template", () => {
    expect(builtInTemplates.length).toBeGreaterThan(0);
  });

  it("all templates have required fields", () => {
    for (const template of builtInTemplates) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.slug).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.category).toBeTruthy();
      expect(template.frameworks).toBeDefined();
      expect(template.version).toBeTruthy();
    }
  });

  it("all template IDs are unique", () => {
    const ids = builtInTemplates.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all template slugs are unique", () => {
    const slugs = builtInTemplates.map(t => t.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("all templates reference valid ProjectFramework values", () => {
    for (const template of builtInTemplates) {
      for (const framework of template.frameworks) {
        expect(VALID_FRAMEWORKS).toContain(framework);
      }
    }
  });

  it("all templates have valid categories", () => {
    for (const template of builtInTemplates) {
      expect(VALID_CATEGORIES).toContain(template.category);
    }
  });

  it("all templates have files array", () => {
    for (const template of builtInTemplates) {
      expect(Array.isArray(template.files)).toBe(true);
    }
  });

  it("all templates have variables array", () => {
    for (const template of builtInTemplates) {
      expect(Array.isArray(template.variables)).toBe(true);
    }
  });

  it("all app templates have a name variable", () => {
    const appTemplates = builtInTemplates.filter(t => t.category === "app");
    for (const template of appTemplates) {
      const hasNameVar = template.variables.some(v => v.name === "name");
      expect(hasNameVar).toBe(true);
    }
  });
});

describe("registry built-in templates", () => {
  it("has all built-in templates registered", () => {
    const registered = registry.getAll();
    for (const template of builtInTemplates) {
      expect(registered.some(r => r.id === template.id)).toBe(true);
    }
  });

  it("metadata matches registered templates", () => {
    const metadata = registry.getMetadata();
    expect(metadata.length).toBe(builtInTemplates.length);

    for (const template of builtInTemplates) {
      const meta = metadata.find(m => m.id === template.id);
      expect(meta).toBeDefined();
      expect(meta?.name).toBe(template.name);
      expect(meta?.slug).toBe(template.slug);
      expect(meta?.description).toBe(template.description);
      expect(meta?.category).toBe(template.category);
    }
  });

  it("can look up each template by slug", () => {
    for (const template of builtInTemplates) {
      const found = registry.getBySlug(template.slug);
      expect(found?.id).toBe(template.id);
    }
  });
});
