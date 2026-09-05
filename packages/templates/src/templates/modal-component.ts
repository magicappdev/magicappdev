/**
 * Modal component template - React + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const modalComponentTemplate: Template = {
  id: "modal-component",
  name: "Modal",
  slug: "modal",
  description:
    "Accessible modal dialog with overlay, close button, and size variants",
  category: "component",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "modal", "dialog", "overlay", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Modal",
    },
    {
      name: "withFooter",
      description: "Include footer slot",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";

interface {{pascalCase name}}Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  {{#if withFooter}}footer?: React.ReactNode;{{/if}}
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function {{pascalCase name}}({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  {{#if withFooter}}footer,{{/if}}
}: {{pascalCase name}}Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        className={
          "relative w-full " +
          sizes[size] +
          " rounded-2xl bg-white shadow-xl border border-slate-200"
        }
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && (
              <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="text-sm text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="px-5 py-4 text-sm text-slate-700">{children}</div>

        {{#if withFooter}}
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
        {{/if}}
      </div>
    </div>
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
