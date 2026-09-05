/**
 * Input component template - React + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const inputComponentTemplate: Template = {
  id: "input-component",
  name: "Input",
  slug: "input",
  description:
    "Form input component with label, validation states, and variants",
  category: "component",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "input", "form", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Input",
    },
    {
      name: "withLabel",
      description: "Include label prop",
      type: "boolean",
      default: true,
    },
    {
      name: "withIcon",
      description: "Include icon slot",
      type: "boolean",
      default: false,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";

export type {{pascalCase name}}Variant = "default" | "error" | "success";

interface {{pascalCase name}}Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: {{pascalCase name}}Variant;
  {{#if withIcon}}leftIcon?: React.ReactNode;{{/if}}
}

export function {{pascalCase name}}({
  label,
  hint,
  error,
  variant = "default",
  {{#if withIcon}}leftIcon,{{/if}}
  className = "",
  id,
  ...props
}: {{pascalCase name}}Props) {
  const inputId = id || label?.toLowerCase().replace(/\\s+/g, "-");

  const base =
    "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition";
  const variants: Record<{{pascalCase name}}Variant, string> = {
    default: "border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
    error: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10",
    success: "border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10",
  };

  return (
    <div className="w-full">
      {{#if withLabel}}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      {{/if}}

      <div className="relative">
        {{#if withIcon}}
        {leftIcon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </div>
        )}
        {{/if}}

        <input
          id={inputId}
          className={
            base +
            " " +
            variants[variant] +
            " " +
            ({{#if withIcon}}leftIcon ? "pl-10" : ""{{else}}""{{/if}}) +
            " " +
            className
          }
          aria-invalid={variant === "error"}
          {...props}
        />
      </div>

      {(error || hint) && (
        <p className={"mt-1.5 text-xs " + (error ? "text-red-600" : "text-slate-500")}>
          {error || hint}
        </p>
      )}
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
