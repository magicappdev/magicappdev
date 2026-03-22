/**
 * Next.js App Router template with Cloudflare Pages adapter
 */

import type { Template } from "../types.js";

export const nextAppTemplate: Template = {
  id: "next-app",
  name: "Next.js App",
  slug: "next-app",
  description:
    "Next.js 14 with App Router and Cloudflare Pages adapter. Full-stack React with SSR/SSG.",
  category: "app",
  frameworks: ["nextjs"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: [
    "starter",
    "nextjs",
    "react",
    "typescript",
    "tailwind",
    "ssr",
    "cloudflare",
  ],
  variables: [
    {
      name: "name",
      description: "Project name (used in package.json)",
      type: "string",
      default: "my-next-app",
    },
    {
      name: "appName",
      description: "App display name",
      type: "string",
      default: "My Next.js App",
    },
    {
      name: "description",
      description: "Short description of the app",
      type: "string",
      default: "A Next.js app built with MagicAppDev",
    },
  ],
  dependencies: {
    next: "^14.2.18",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "@cloudflare/next-on-pages": "^1.13.5",
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/node": "^22.10.1",
    typescript: "^5.6.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
    eslint: "^8.57.1",
    "eslint-config-next": "^14.2.18",
    wrangler: "^3.90.0",
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
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npm run pages:build && wrangler pages dev",
    "deploy": "npm run pages:build && wrangler pages deploy"
  },
  "dependencies": {
    "next": "^14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@cloudflare/next-on-pages": "^1.13.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/node": "^22.10.1",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.18",
    "wrangler": "^3.90.0"
  }
}
`,
    },
    {
      path: "next.config.ts",
      content: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  output: 'export',
};

export default nextConfig;
`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
    },
    {
      path: "tailwind.config.ts",
      content: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
`,
    },
    {
      path: "postcss.config.mjs",
      content: `const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
`,
    },
    {
      path: "src/app/layout.tsx",
      content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '{{appName}}',
  description: '{{description}}',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
    },
    {
      path: "src/app/globals.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: "src/app/page.tsx",
      content: `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">{{appName}}</h1>
        <p className="text-slate-400 text-lg mb-8">{{description}}</p>
        <a
          href="/api/hello"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          API Route →
        </a>
      </div>
    </main>
  );
}
`,
    },
    {
      path: "src/app/api/hello/route.ts",
      content: `import { NextResponse } from 'next/server';

export const runtime = 'edge';

export function GET() {
  return NextResponse.json({ message: 'Hello from {{appName}}!' });
}
`,
    },
    {
      path: ".gitignore",
      content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# cloudflare
.wrangler
`,
    },
    {
      path: "README.md",
      content: `# {{appName}}

{{description}}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy to Cloudflare Pages

\`\`\`bash
npm run deploy
\`\`\`

Built with [MagicAppDev](https://magicappdev.com) ✨
`,
    },
  ],
};
