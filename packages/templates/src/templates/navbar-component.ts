/**
 * Navbar component template - React + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const navbarComponentTemplate: Template = {
  id: "navbar-component",
  name: "Navbar",
  slug: "navbar",
  description: "Responsive navbar with logo, nav links, and CTA button",
  category: "component",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "navbar", "navigation", "header", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Navbar",
    },
    {
      name: "withCta",
      description: "Include CTA button slot",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";

interface {{pascalCase name}}Props {
  brand: string;
  links: Array<{ label: string; href: string }>;
  {{#if withCta}}ctaLabel?: string;{{/if}}
  onCtaClick?: () => void;
}

export function {{pascalCase name}}({
  brand,
  links,
  {{#if withCta}}ctaLabel = "Get Started",{{/if}}
  onCtaClick,
}: {{pascalCase name}}Props) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="text-sm font-bold tracking-tight text-slate-900">
          {brand}
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          {links.map(link => (
            <a key={link.href} href={link.href} className="hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {{#if withCta}}
          {ctaLabel && (
            <button
              type="button"
              onClick={onCtaClick}
              className="hidden md:inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {ctaLabel}
            </button>
          )}
          {{/if}}
          <button
            type="button"
            aria-label="Menu"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          >
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current mt-1" />
            <span className="block h-0.5 w-4 bg-current mt-1" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default {{pascalCase name}};
`,
    },
    {
      path: "index.ts",
      content: `export { {{pascalCase name}}, default } from "./{{pascalCase name}}";
`,
    },
  ],
};
