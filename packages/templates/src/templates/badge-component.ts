/**
 * Badge component template - React + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const badgeComponentTemplate: Template = {
  id: "badge-component",
  name: "Badge",
  slug: "badge",
  description: "Compact status badge with color variants and sizes",
  category: "component",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "badge", "status", "tag", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Badge",
    },
    {
      name: "withDot",
      description: "Include leading status dot",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";

export type {{pascalCase name}}Variant = "neutral" | "success" | "warning" | "danger" | "info";
export type {{pascalCase name}}Size = "sm" | "md" | "lg";

interface {{pascalCase name}}Props extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: {{pascalCase name}}Variant;
  size?: {{pascalCase name}}Size;
  children: React.ReactNode;
}

const variantClasses: Record<{{pascalCase name}}Variant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
};

const dotClasses: Record<{{pascalCase name}}Variant, string> = {
  neutral: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-sky-500",
};

const sizeClasses: Record<{{pascalCase name}}Size, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function {{pascalCase name}}({
  variant = "neutral",
  size = "md",
  children,
  className = "",
  ...props
}: {{pascalCase name}}Props) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full font-medium " +
        variantClasses[variant] +
        " " +
        sizeClasses[size] +
        " " +
        className
      }
      {...props}
    >
      {{#if withDot}}
      <span className={"h-1.5 w-1.5 rounded-full " + dotClasses[variant]} />
      {{/if}}
      {children}
    </span>
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
