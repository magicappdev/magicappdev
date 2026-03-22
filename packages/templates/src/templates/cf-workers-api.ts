/**
 * Cloudflare Workers API template - Hono on Workers with D1
 */

import type { Template } from "../types.js";

export const cfWorkersApiTemplate: Template = {
  id: "cf-workers-api",
  name: "Cloudflare Workers API",
  slug: "cf-workers-api",
  description:
    "REST API built with Hono on Cloudflare Workers. Includes D1 database integration and type-safe routes.",
  category: "api",
  frameworks: ["cloudflare-workers"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: [
    "starter",
    "api",
    "hono",
    "cloudflare",
    "workers",
    "d1",
    "typescript",
    "rest",
  ],
  variables: [
    {
      name: "name",
      description: "Worker name (used in wrangler.toml)",
      type: "string",
      default: "my-api",
    },
    {
      name: "appName",
      description: "API display name",
      type: "string",
      default: "My API",
    },
    {
      name: "description",
      description: "Short description of the API",
      type: "string",
      default: "A REST API built with MagicAppDev",
    },
  ],
  dependencies: {
    hono: "^4.6.14",
  },
  devDependencies: {
    "@cloudflare/workers-types": "^4.20241218.0",
    typescript: "^5.6.3",
    wrangler: "^3.90.0",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "{{description}}",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.6.14"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241218.0",
    "typescript": "^5.6.3",
    "wrangler": "^3.90.0"
  }
}
`,
    },
    {
      path: "wrangler.toml",
      content: `name = "{{kebabCase name}}"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

# Uncomment to enable D1 database
# [[d1_databases]]
# binding = "DB"
# database_name = "{{kebabCase name}}-db"
# database_id = "YOUR_DATABASE_ID"
`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
    },
    {
      path: "src/index.ts",
      content: `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

type Bindings = {
  ENVIRONMENT: string;
  // DB: D1Database; // Uncomment if using D1
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', prettyJSON());

// Health check
app.get('/', c => {
  return c.json({ status: 'ok', app: '{{appName}}', env: c.env.ENVIRONMENT });
});

// Example resource routes
app.get('/api/items', c => {
  return c.json({
    items: [
      { id: '1', name: 'Item One', createdAt: new Date().toISOString() },
      { id: '2', name: 'Item Two', createdAt: new Date().toISOString() },
    ],
  });
});

app.get('/api/items/:id', c => {
  const id = c.req.param('id');
  return c.json({ id, name: \`Item \${id}\`, createdAt: new Date().toISOString() });
});

app.post('/api/items', async c => {
  const body = await c.req.json<{ name: string }>();
  if (!body.name) {
    return c.json({ error: 'name is required' }, 400);
  }
  const newItem = { id: crypto.randomUUID(), name: body.name, createdAt: new Date().toISOString() };
  return c.json(newItem, 201);
});

// 404 handler
app.notFound(c => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
`,
    },
    {
      path: ".gitignore",
      content: `node_modules
.wrangler
dist
`,
    },
    {
      path: "README.md",
      content: `# {{appName}}

{{description}}

## Getting Started

\`\`\`bash
npm install
npm run dev          # Starts local dev server at http://localhost:8787
\`\`\`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Health check |
| GET | /api/items | List all items |
| GET | /api/items/:id | Get item by ID |
| POST | /api/items | Create new item |

## Deploy

\`\`\`bash
npm run deploy
\`\`\`

## Add a D1 Database

1. Create database: \`wrangler d1 create {{kebabCase name}}-db\`
2. Uncomment the \`[[d1_databases]]\` block in \`wrangler.toml\`
3. Update the \`database_id\` with the ID from step 1

Built with [MagicAppDev](https://magicappdev.com) ✨
`,
    },
  ],
};
