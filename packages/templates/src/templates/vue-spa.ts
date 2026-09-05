/**
 * Vue 3 + Vite + TypeScript template
 */

import type { Template } from "../types.js";

export const vueSpaTemplate: Template = {
  id: "vue-spa",
  name: "Vue 3 SPA",
  slug: "vue-spa",
  description:
    "Vue 3 single-page app with Vite, TypeScript, and Pinia. Deploys to Cloudflare Pages.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["starter", "vue", "vite", "typescript", "pinia", "spa", "web"],
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-vue-app",
    },
    {
      name: "appName",
      description: "App display name",
      type: "string",
      default: "My Vue App",
    },
    {
      name: "description",
      description: "Short description of the app",
      type: "string",
      default: "A Vue app built with MagicAppDev",
    },
  ],
  dependencies: {
    vue: "^3.5.13",
    "vue-router": "^4.5.0",
    pinia: "^2.3.0",
  },
  devDependencies: {
    "@vitejs/plugin-vue": "^5.2.3",
    typescript: "^5.6.3",
    vite: "^6.0.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.1.0",
  "private": true,
  "description": "{{description}}",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.3",
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "tailwindcss": "^3.4.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}`,
    },
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { port: 3000, host: true },
})`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{appName}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
    },
    {
      path: "src/main.ts",
      content: `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`,
    },
    {
      path: "src/App.vue",
      content: `<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between">
        <RouterLink to="/" class="text-xl font-bold text-gray-900">
          {{ appName }}
        </RouterLink>
        <div class="space-x-4">
          <RouterLink to="/" class="text-gray-600 hover:text-gray-900">Home</RouterLink>
          <RouterLink to="/about" class="text-gray-600 hover:text-gray-900">About</RouterLink>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>`,
    },
    {
      path: "src/router.ts",
      content: `import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') },
  ],
})`,
    },
    {
      path: "src/views/Home.vue",
      content: `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">Welcome to {{ appName }}</h1>
    <p class="text-gray-600">{{ description }}</p>
    <div class="flex items-center gap-4">
      <button @click="count++" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Count: {{ count }}
      </button>
    </div>
  </div>
</template>`,
    },
    {
      path: "src/views/About.vue",
      content: `<script setup lang="ts">
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">About</h1>
    <p class="text-gray-600">
      This is a Vue 3 app built with MagicAppDev.
    </p>
  </div>
</template>`,
    },
  ],
};
