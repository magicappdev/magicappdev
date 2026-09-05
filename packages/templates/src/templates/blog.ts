/**
 * Blog template - Astro + TypeScript + Tailwind CSS + Content Collections
 */

import type { Template } from "../types.js";

export const blogTemplate: Template = {
  id: "blog",
  name: "Blog",
  slug: "blog",
  description:
    "Astro-based blog with TypeScript, Tailwind CSS, and content collections. Includes posts, tags, and RSS.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["blog", "astro", "typescript", "tailwind", "content", "rss"],
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-blog",
    },
    {
      name: "appName",
      description: "Blog name",
      type: "string",
      default: "My Blog",
    },
    {
      name: "description",
      description: "Short description of the blog",
      type: "string",
      default: "A blog built with MagicAppDev",
    },
    {
      name: "author",
      description: "Blog author name",
      type: "string",
      default: "MagicAppDev",
    },
  ],
  dependencies: {
    astro: "^5.5.0",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/rss": "^4.0.11",
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
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/rss": "^4.0.11"
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
import rss from '@astrojs/rss'

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
      path: "src/content/config.ts",
      content: `import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = { blog }`,
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
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">{{appName}}</h1>
        <nav class="space-x-4">
          <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
        </nav>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold mb-4">Welcome to {{appName}}</h2>
      <p class="text-gray-600 mb-6">{{description}}</p>
      <p class="text-sm text-gray-500">By {{author}}</p>
    </main>
  </body>
</html>`,
    },
    {
      path: "src/pages/blog/[slug].astro",
      content: `---
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

const { post } = Astro.props
const { Content } = await post.render()
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{post.data.title} - {{appName}}</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <header class="bg-white border-b">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold">{{appName}}</h1>
        <nav class="space-x-4">
          <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
        </nav>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 py-12">
      <article class="bg-white rounded-xl border p-6">
        <h2 class="text-2xl font-bold mb-2">{post.data.title}</h2>
        <p class="text-sm text-gray-500 mb-4">{post.data.date.toLocaleDateString()}</p>
        <div class="prose">
          <Content />
        </div>
      </article>
    </main>
  </body>
</html>`,
    },
  ],
};
