/**
 * Hono + Drizzle ORM + D1 template - type-safe API on Cloudflare Workers
 */

import type { Template } from "../types.js";

export const honoApiTemplate: Template = {
  id: "hono-drizzle-api",
  name: "Hono + Drizzle API",
  slug: "hono-drizzle-api",
  description:
    "Minimal REST API starter with Hono and Drizzle ORM on Cloudflare Workers D1. Includes CORS and basic error handling.",
  category: "api",
  frameworks: ["cloudflare-workers"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: [
    "api",
    "hono",
    "drizzle",
    "d1",
    "cloudflare",
    "workers",
    "typescript",
    "rest",
  ],
  free: false,
  variables: [
    {
      name: "name",
      description: "Worker name",
      type: "string",
      default: "my-api",
    },
    {
      name: "description",
      description: "API description",
      type: "string",
      default: "A Hono + Drizzle API on Cloudflare Workers",
    },
    {
      name: "compatibility_date",
      description: "Cloudflare Workers compatibility date",
      type: "string",
      default: "2025-03-01",
    },
  ],
  dependencies: {
    hono: "^4.3.0",
    drizzle: "~0.36.0",
  },
  devDependencies: {
    "@cloudflare/workers-types": "^4.20250101.0",
    "drizzle-kit": "~0.36.0",
    typescript: "~5.3.0",
    vite: "^6.0.0",
    wrangler: "^3.80.0",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply {{kebabCase name}}-db --local",
    "db:studio": "drizzle-kit studio",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.3.0",
    "drizzle": "~0.36.0",
    "drizzle-orm": "~0.36.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250101.0",
    "drizzle-kit": "~0.36.0",
    "typescript": "~5.3.0",
    "vite": "^6.0.0",
    "wrangler": "^3.80.0"
  }
}
`,
    },
    {
      path: "wrangler.toml",
      content: `name = "{{kebabCase name}}"
main = "src/index.ts"
compatibility_date = "{{compatibility_date}}"

[[d1_databases]]
binding = "DB"
database_name = "{{kebabCase name}}-db"
database_id = "REPLACE_WITH_D1_DATABASE_ID"

[dev]
port = 8787
`,
    },
    {
      path: "drizzle.config.ts",
      content: `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  driver: "d1",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  },
});
`,
    },
    {
      path: "src/db/schema.ts",
      content: `import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`,
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
    "forceConsistentCasingInFileNames": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
`,
    },
    {
      path: "src/index.ts",
      content: `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => {
  return c.json({ name: '{{name}}', status: 'ok' });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

app.post('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json<{ email: string }>();

  if (!body.email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const result = await db.insert(users).values({ email: body.email });
  return c.json({ id: result.meta.last_row_id, email: body.email }, 201);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
`,
    },
  ],
};
