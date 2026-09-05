/**
 * Astro site template - Astro + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const astroSiteTemplate: Template = {
  id: "astro-site",
  name: "Astro Site",
  slug: "astro-site",
  description:
    "Astro static site with TypeScript, Tailwind CSS, and content collections. Great for blogs and docs.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: [
    "starter",
    "astro",
    "typescript",
    "tailwind",
    "static",
    "blog",
    "docs",
  ],
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-astro-site",
    },
    {
      name: "appName",
      description: "Site name",
      type: "string",
      default: "My Astro Site",
    },
    {
      name: "description",
      description: "Short description of the site",
      type: "string",
      default: "An Astro site built with MagicAppDev",
    },
  ],
  dependencies: {
    astro: "^5.5.0",
    "@astrojs/tailwind": "^5.1.0",
  },
  devDependencies: {
    "@astrojs/vercel": "^8.0.0",
    typescript: "^5.6.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.0.1",
  "private": true,
  "description": "{{description}}",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^5.5.0",
    "@astrojs/tailwind": "^5.1.0"
  },
  "devDependencies": {
    "@astrojs/vercel": "^8.0.0",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}`,
    },
    {
      path: "astro.config.mjs",
      content: `import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  output: 'server',
  adapter: {
    name: '@astrojs/vercel/serverless',
    serverless: true,
  },
  integrations: [tailwind()],
})`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist"]
}`,
    },
    {
      path: "src/pages/index.astro",
      content: `---
const title = '{{appName}}'
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <header class="bg-white border-b">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">{{appName}}</h1>
        <nav class="space-x-4">
          <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
        </nav>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold mb-4">Welcome to {{appName}}</h2>
      <p class="text-gray-600 mb-6">{{description}}</p>
      <a href="/about" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
        Learn more
      </a>
    </main>
  </body>
</html>`,
    },
    {
      path: "src/pages/about.astro",
      content: `---
const title = 'About - {{appName}}'
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <header class="bg-white border-b">
      <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">{{appName}}</h1>
        <nav class="space-x-4">
          <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
        </nav>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold mb-4">About</h2>
      <p class="text-gray-600">
        This is an Astro site built with MagicAppDev.
      </p>
    </main>
  </body>
</html>`,
    },
  ],
};
