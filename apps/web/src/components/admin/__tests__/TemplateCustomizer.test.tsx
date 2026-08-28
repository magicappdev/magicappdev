/**
 * Vitest component tests for TemplateCustomizer.tsx
 */

import { TemplateCustomizer } from "@/components/admin/TemplateCustomizer";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockTemplate = {
  id: "saas-starter",
  name: "SaaS Starter",
  slug: "saas-starter",
  description: "Full-featured SaaS starter",
  category: "app" as const,
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["saas", "dashboard"],
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string" as const,
      default: "my-app",
    },
    {
      name: "appName",
      description: "App name",
      type: "string" as const,
      default: "My App",
    },
    {
      name: "darkMode",
      description: "Dark mode",
      type: "boolean" as const,
      default: true,
    },
    {
      name: "port",
      description: "Port",
      type: "number" as const,
      default: 3000,
    },
    {
      name: "theme",
      description: "Theme",
      type: "select" as const,
      options: ["light", "dark"],
      default: "dark",
    },
  ],
  files: [
    { path: "package.json", content: '{"name":"{{name}}"}' },
    {
      path: "src/App.tsx",
      content: "export const App = () => <div>{{appName}}</div>;",
    },
  ],
  dependencies: { react: "^18.0.0" },
  devDependencies: { typescript: "^5.0.0" },
};

vi.mock("@magicappdev/templates", async () => {
  const actual = await vi.importActual("@magicappdev/templates");
  return {
    ...actual,
    registry: {
      get: vi.fn((id: string) =>
        id === "saas-starter" ? mockTemplate : undefined,
      ),
    },
  };
});

vi.mock("jszip", () => ({
  default: class MockJSZip {
    file() {
      return this;
    }
    async generateAsync() {
      return new Blob(["mock zip"]);
    }
  },
}));

describe("TemplateCustomizer", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("should render template name and file count", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    expect(screen.getByText("SaaS Starter")).toBeDefined();
    expect(screen.getByText("2 files")).toBeDefined();
  });

  it("should render variable form inputs", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Variables")).toBeDefined();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("should render boolean toggle for darkMode", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    const darkModeElements = screen.getAllByText("Dark mode");
    expect(darkModeElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should render select dropdown for theme", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Theme")).toBeDefined();
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("should render file tabs", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    const tabs = screen.getAllByText("package.json");
    expect(tabs.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("App.tsx")).toBeDefined();
  });

  it("should call onClose when back button is clicked", async () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    const backButton = screen.getByRole("button", { name: "" });
    await userEvent.click(backButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should show Download ZIP button", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Download ZIP")).toBeDefined();
  });

  it("should show dependencies section", () => {
    render(
      <TemplateCustomizer templateId="saas-starter" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Dependencies")).toBeDefined();
    expect(screen.getByText("react")).toBeDefined();
  });

  it("should show not found for invalid template ID", () => {
    render(
      <TemplateCustomizer templateId="nonexistent" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Template not found")).toBeDefined();
  });
});
