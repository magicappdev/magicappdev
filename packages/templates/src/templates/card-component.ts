/**
 * Card component template - React + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const cardComponentTemplate: Template = {
  id: "card-component",
  name: "Card",
  slug: "card",
  description:
    "Versatile card component with header, body, footer, and hover effects",
  category: "component",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["ui", "card", "layout", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Component name",
      type: "string",
      default: "Card",
    },
    {
      name: "withHeader",
      description: "Include header slot",
      type: "boolean",
      default: true,
    },
    {
      name: "withFooter",
      description: "Include footer slot",
      type: "boolean",
      default: true,
    },
    {
      name: "hoverable",
      description: "Add hover effects",
      type: "boolean",
      default: true,
    },
  ],
  files: [
    {
      path: "{{pascalCase name}}.tsx",
      content: `import React from "react";

{{#if withHeader}}
interface {{pascalCase name}}HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function {{pascalCase name}}Header({
  title,
  subtitle,
  action,
}: {{pascalCase name}}HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
      <div>
        {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
{{/if}}

{{#if withFooter}}
interface {{pascalCase name}}FooterProps {
  children?: React.ReactNode;
  className?: string;
}

export function {{pascalCase name}}Footer({
  children,
  className = "",
}: {{pascalCase name}}FooterProps) {
  return (
    <div className={"px-5 py-4 border-t border-slate-100 " + className}>
      {children}
    </div>
  );
}
{{/if}}

interface {{pascalCase name}}Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  {{#if hoverable}}hoverable?: boolean;{{/if}}
}

export function {{pascalCase name}}({
  children,
  padding = "md",
  className = "",
  ...props
}: {{pascalCase name}}Props) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={
        "rounded-2xl border border-slate-200 bg-white shadow-sm " +
        paddingClasses[padding] +
        " " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}

export default {{pascalCase name}};
`,
    },
    {
      path: "index.ts",
      content: `export {
  {{pascalCase name}},
  {{pascalCase name}}Header,
  {{#if withFooter}}{{pascalCase name}}Footer,{{/if}}
} from "./{{pascalCase name}}";

export { default } from "./{{pascalCase name}}";
`,
    },
  ],
};
