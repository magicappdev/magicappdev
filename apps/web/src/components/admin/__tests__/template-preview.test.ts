/**
 * Unit tests for template-preview.ts utilities
 */

import {
  buildDefaultVariables,
  renderTemplateFiles,
  getFileLanguage,
} from "@/lib/template-preview";
import type { Template } from "@magicappdev/templates";
import { describe, it, expect } from "vitest";

const mockTemplate: Template = {
  id: "test-template",
  name: "Test Template",
  slug: "test-template",
  description: "A test template",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "Test",
  tags: ["test"],
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "my-app",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    { name: "port", description: "Server port", type: "number", default: 3000 },
    {
      name: "style",
      description: "CSS framework",
      type: "select",
      options: ["tailwind", "css"],
      default: "tailwind",
    },
  ],
  files: [
    {
      path: "src/{{pascalCase name}}.tsx",
      content:
        "export const {{pascalCase name}} = () => <div>{{appName}}</div>;",
      condition: "typescript === true",
    },
    {
      path: "src/{{pascalCase name}}.jsx",
      content:
        "export const {{pascalCase name}} = () => <div>{{appName}}</div>;",
      condition: "typescript !== true",
    },
    {
      path: "package.json",
      content: '{"name":"{{kebabCase name}}"}',
    },
  ],
  dependencies: {},
  devDependencies: {},
};

describe("buildDefaultVariables", () => {
  it("should return defaults for all variables", () => {
    const defaults = buildDefaultVariables(mockTemplate.variables);
    expect(defaults).toEqual({
      name: "my-app",
      typescript: true,
      port: 3000,
      style: "tailwind",
    });
  });

  it("should handle missing defaults", () => {
    const vars = [
      { name: "x", description: "No default", type: "string" as const },
    ];
    const defaults = buildDefaultVariables(vars);
    expect(defaults).toEqual({ x: "" });
  });

  it("should handle boolean without default", () => {
    const vars = [
      { name: "flag", description: "Flag", type: "boolean" as const },
    ];
    const defaults = buildDefaultVariables(vars);
    expect(defaults).toEqual({ flag: false });
  });

  it("should handle select with first option fallback", () => {
    const vars = [
      {
        name: "theme",
        description: "Theme",
        type: "select" as const,
        options: ["dark", "light"],
      },
    ];
    const defaults = buildDefaultVariables(vars);
    expect(defaults).toEqual({ theme: "dark" });
  });
});

describe("renderTemplateFiles", () => {
  it("should compile all files that pass conditions", () => {
    const files = renderTemplateFiles(mockTemplate, {
      name: "my-app",
      appName: "My App",
      typescript: true,
      port: 3000,
      style: "tailwind",
    });

    const paths = files.map(f => f.path);
    expect(paths).toContain("src/MyApp.tsx");
    expect(paths).not.toContain("src/MyApp.jsx"); // condition false
    expect(paths).toContain("package.json");
    expect(files.length).toBe(2);
  });

  it("should include conditional file when condition matches", () => {
    const files = renderTemplateFiles(mockTemplate, {
      name: "my-app",
      appName: "My App",
      typescript: false,
      port: 3000,
      style: "tailwind",
    });

    const paths = files.map(f => f.path);
    expect(paths).toContain("src/MyApp.jsx");
    expect(paths).not.toContain("src/MyApp.tsx");
  });

  it("should compile Handlebars expressions in content", () => {
    const files = renderTemplateFiles(mockTemplate, {
      name: "hello-world",
      appName: "Hello World",
      typescript: true,
      port: 3000,
      style: "tailwind",
    });

    const tsxFile = files.find(f => f.path === "src/HelloWorld.tsx");
    expect(tsxFile?.content).toContain("HelloWorld");
    expect(tsxFile?.content).toContain("Hello World");
  });

  it("should compile Handlebars expressions in file paths", () => {
    const files = renderTemplateFiles(mockTemplate, {
      name: "test-app",
      appName: "Test App",
      typescript: true,
      port: 3000,
      style: "tailwind",
    });

    expect(files.some(f => f.path === "src/TestApp.tsx")).toBe(true);
  });
});

describe("getFileLanguage", () => {
  it("should return correct language for extensions", () => {
    expect(getFileLanguage("app.tsx")).toBe("typescript");
    expect(getFileLanguage("utils.js")).toBe("javascript");
    expect(getFileLanguage("styles.css")).toBe("css");
    expect(getFileLanguage("readme.md")).toBe("markdown");
    expect(getFileLanguage("config.json")).toBe("json");
  });

  it("should fallback to plaintext for unknown extensions", () => {
    expect(getFileLanguage("unknown.xyz")).toBe("plaintext");
  });

  it("should handle files without extensions", () => {
    expect(getFileLanguage("Makefile")).toBe("plaintext");
  });
});
