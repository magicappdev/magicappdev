import {
  QUICK_SUGGESTIONS,
  TEMPLATE_CATEGORIES,
  TEMPLATES,
} from "../templates";
import { describe, it, expect } from "vitest";

describe("chat templates", () => {
  it("QUICK_SUGGESTIONS is derived from shared presets and has prompt strings", () => {
    expect(QUICK_SUGGESTIONS.length).toBeGreaterThan(0);
    for (const prompt of QUICK_SUGGESTIONS) {
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  it("TEMPLATE_CATEGORIES contains expected categories", () => {
    const ids = TEMPLATE_CATEGORIES.map(c => c.id);
    expect(ids).toEqual(["all", "app", "landing", "component", "dashboard"]);
  });

  it("TEMPLATES includes entries for every non-all category", () => {
    const categoryIds = new Set(TEMPLATES.map(t => t.category));
    const expectedCategories = [
      "app",
      "landing",
      "component",
      "dashboard",
    ] as const;
    for (const cat of expectedCategories) {
      expect(categoryIds.has(cat)).toBe(true);
    }
  });

  it("TEMPLATES entries have human-readable names, not prompt fragments", () => {
    for (const t of TEMPLATES) {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.name).not.toMatch(/^(create|build)\s+a(n)?$/i);
      const promptStart = t.prompt.split(" ").slice(0, 2).join(" ");
      expect(t.name).not.toBe(promptStart);
      expect(t.description).not.toBe(t.prompt.slice(0, 80) + "...");
    }
  });
});
