import { describe, it, expect, beforeEach } from "vitest";
import { TemplateRegistry } from "../registry/index.js";
import type { Template } from "../types.js";

const blankTemplate: Template = {
  id: "blank-app",
  name: "Blank App",
  slug: "blank",
  description: "A minimal Expo app starter",
  category: "app",
  frameworks: ["expo"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["starter", "minimal"],
  files: [],
  variables: [],
};

const tabsTemplate: Template = {
  id: "tabs-app",
  name: "Tabs App",
  slug: "tabs",
  description: "An Expo app with tab navigation",
  category: "app",
  frameworks: ["expo"],
  version: "1.0.0",
  files: [],
  variables: [],
};

const buttonTemplate: Template = {
  id: "button-component",
  name: "Button",
  slug: "button",
  description: "A customizable button component",
  category: "component",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  files: [],
  variables: [],
};

const screenTemplate: Template = {
  id: "screen",
  name: "Screen",
  slug: "screen",
  description: "A full screen component",
  category: "component",
  frameworks: ["expo", "react-native"],
  version: "1.0.0",
  files: [],
  variables: [],
};

describe("TemplateRegistry", () => {
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = new TemplateRegistry();
  });

  describe("register()", () => {
    it("adds a template by ID", () => {
      registry.register(blankTemplate);
      expect(registry.has("blank-app")).toBe(true);
      expect(registry.count).toBe(1);
    });

    it("throws on duplicate ID", () => {
      registry.register(blankTemplate);
      expect(() => registry.register(blankTemplate)).toThrow(
        'Template with id "blank-app" already registered',
      );
    });

    it("registers multiple templates via registerAll()", () => {
      registry.registerAll([blankTemplate, tabsTemplate, buttonTemplate]);
      expect(registry.count).toBe(3);
      expect(registry.has("blank-app")).toBe(true);
      expect(registry.has("tabs-app")).toBe(true);
      expect(registry.has("button-component")).toBe(true);
    });
  });

  describe("get()", () => {
    it("returns template by ID", () => {
      registry.register(blankTemplate);
      const result = registry.get("blank-app");
      expect(result).toBeDefined();
      expect(result?.id).toBe("blank-app");
      expect(result?.name).toBe("Blank App");
    });

    it("returns undefined for unknown ID", () => {
      expect(registry.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getBySlug()", () => {
    it("returns template by slug", () => {
      registry.register(blankTemplate);
      registry.register(tabsTemplate);
      const result = registry.getBySlug("tabs");
      expect(result).toBeDefined();
      expect(result?.id).toBe("tabs-app");
    });

    it("returns undefined for unknown slug", () => {
      expect(registry.getBySlug("nonexistent")).toBeUndefined();
    });
  });

  describe("getByCategory()", () => {
    it("returns templates in category", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const apps = registry.getByCategory("app");
      expect(apps).toHaveLength(2);
      expect(apps.map(t => t.id)).toContain("blank-app");
      expect(apps.map(t => t.id)).toContain("tabs-app");
    });

    it("returns empty array for category with no templates", () => {
      registry.registerAll([blankTemplate]);
      const hooks = registry.getByCategory("hook");
      expect(hooks).toHaveLength(0);
    });
  });

  describe("getByFramework()", () => {
    it("returns templates for framework", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const rnTemplates = registry.getByFramework("react-native");
      expect(rnTemplates).toHaveLength(2);
      expect(rnTemplates.map(t => t.id)).toContain("button-component");
      expect(rnTemplates.map(t => t.id)).toContain("screen");
    });

    it("returns all expo templates", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const expoTemplates = registry.getByFramework("expo");
      expect(expoTemplates).toHaveLength(4);
    });
  });

  describe("filter()", () => {
    it("filters by category", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const result = registry.filter({ category: "component" });
      expect(result).toHaveLength(2);
    });

    it("filters by framework", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const result = registry.filter({ framework: "react-native" });
      expect(result).toHaveLength(2);
    });

    it("filters by search term matching name", () => {
      registry.registerAll([blankTemplate, tabsTemplate, buttonTemplate]);
      const result = registry.filter({ search: "Blank" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("blank-app");
    });

    it("filters by search term matching description", () => {
      registry.registerAll([blankTemplate, tabsTemplate]);
      const result = registry.filter({ search: "tab navigation" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("tabs-app");
    });

    it("filters by search term matching tags", () => {
      registry.registerAll([blankTemplate, tabsTemplate]);
      const result = registry.filter({ search: "minimal" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("blank-app");
    });

    it("combines category and framework filters", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const result = registry.filter({ category: "app", framework: "expo" });
      expect(result).toHaveLength(2);
    });

    it("returns all templates when no filters", () => {
      registry.registerAll([
        blankTemplate,
        tabsTemplate,
        buttonTemplate,
        screenTemplate,
      ]);
      const result = registry.filter({});
      expect(result).toHaveLength(4);
    });
  });

  describe("getMetadata()", () => {
    it("returns metadata without files/variables", () => {
      registry.register(blankTemplate);
      const metadata = registry.getMetadata();
      expect(metadata).toHaveLength(1);
      expect(metadata[0]).toHaveProperty("id", "blank-app");
      expect(metadata[0]).toHaveProperty("name", "Blank App");
      expect(metadata[0]).not.toHaveProperty("files");
      expect(metadata[0]).not.toHaveProperty("variables");
    });
  });

  describe("clear()", () => {
    it("removes all templates", () => {
      registry.registerAll([blankTemplate, tabsTemplate, buttonTemplate]);
      expect(registry.count).toBe(3);
      registry.clear();
      expect(registry.count).toBe(0);
    });
  });

  describe("count", () => {
    it("returns registration count", () => {
      expect(registry.count).toBe(0);
      registry.register(blankTemplate);
      expect(registry.count).toBe(1);
      registry.register(tabsTemplate);
      expect(registry.count).toBe(2);
    });
  });
});
