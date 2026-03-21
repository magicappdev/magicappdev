/**
 * Next.js page template
 */

import type { Template } from "../types.js";

export const pageTemplate: Template = {
  id: "page",
  name: "Next.js Page",
  slug: "page",
  description: "A Next.js App Router page component with metadata",
  category: "page",
  frameworks: ["next"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["page", "nextjs", "app-router", "react"],
  variables: [
    {
      name: "name",
      description: "Page name",
      type: "string",
      default: "MyPage",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    {
      name: "withSearchParams",
      description: "Include search params handling",
      type: "boolean",
      default: false,
    },
    {
      name: "withParams",
      description: "Include route params (dynamic route)",
      type: "boolean",
      default: false,
    },
  ],
  files: [
    {
      path: "{{kebabCase name}}/page.tsx",
      content: `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "{{name}}",
  description: "{{name}} page",
};

{{#if withParams}}
interface PageParams {
  params: Promise<{ id: string }>;
  {{#if withSearchParams}}
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  {{/if}}
}

export default async function {{pascalCase name}}Page({
  params,
  {{#if withSearchParams}}
  searchParams,
  {{/if}}
}: PageParams) {
  const { id } = await params;
  {{#if withSearchParams}}
  const resolvedSearchParams = await searchParams;
  {{/if}}
{{else}}
{{#if withSearchParams}}
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function {{pascalCase name}}Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
{{else}}
export default function {{pascalCase name}}Page() {
{{/if}}
{{/if}}
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{{name}}</h1>
      <p className="text-gray-600">
        Welcome to the {{name}} page.
      </p>
    </main>
  );
}
`,
    },
    {
      path: "{{kebabCase name}}/loading.tsx",
      content: `export default function {{pascalCase name}}Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}
`,
    },
  ],
};
