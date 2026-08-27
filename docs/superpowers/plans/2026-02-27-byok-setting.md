# Bring Your Own Key (BYOK) Setting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Bring Your Own Key (BYOK) settings page and backend routing capability to support OpenAI-compatible models and custom API providers (OpenAI, Anthropic, DeepSeek, Groq, Custom Endpoints) across both the Next.js Web App and Ionic Mobile App.

**Architecture:**

1. **Database & API:** Extend `users` or `profiles` schema (or create user API keys table) to securely store user-provided encrypted/plain API provider keys and base URLs. Update `packages/api` AI routing middleware to check for user-specific BYOK credentials before falling back to the platform AI Gateway.
2. **Web App (`apps/web`):** Add a Settings/BYOK view where users can input their custom provider, base URL, and API key, and test connectivity.
3. **Mobile App (`apps/mobile`):** Add a corresponding Settings/BYOK screen using local storage / secure storage or synced profile preferences so mobile users can configure custom model endpoints.

**Tech Stack:** TypeScript, Hono, Drizzle ORM, SQLite / D1, Tailwind CSS (Web), React Native / Ionic (Mobile), Zod validation.

## Global Constraints

- Strictly adhere to Bun monorepo conventions (`bun run build`, `turbo build`, explicit `.js` extensions for local imports).
- Follow the API response contract (`{ success: true, data: T }` or `{ success: false, error: ... }`).
- Ensure all database schemas use string UUIDs for primary keys and `snake_case` column names.

---

## File Structure

- **Database / Shared:**
  - Create: `packages/database/src/schema/user-ai-keys.ts`
  - Modify: `packages/database/src/schema/index.ts`
  - Modify: `packages/shared/src/types/app.types.ts`
- **Backend API:**
  - Create: `packages/api/src/routes/ai-keys.ts`
  - Modify: `packages/api/src/app.ts`
  - Modify: `packages/api/src/routes/ai.ts`
- **Web App (`apps/web`):**
  - Create: `apps/web/src/pages/settings/ai-provider.tsx`
  - Modify: `apps/web/src/pages/settings/page.tsx`
- **Mobile App (`apps/mobile`):**
  - Create: `apps/mobile/src/app/settings/ai-provider.tsx`

---

### Task 1: Database Schema & Shared Types for BYOK

**Files:**

- Create: `packages/database/src/schema/user-ai-keys.ts`
- Modify: `packages/database/src/schema/index.ts`
- Modify: `packages/shared/src/types/app.types.ts`

**Interfaces:**

- Produces: `UserAiKey` type and Drizzle table definition for user custom AI keys and providers.

- [ ] **Step 1: Create the Drizzle table schema for user AI keys**

```typescript
// packages/database/src/schema/user-ai-keys.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userAiKeys = sqliteTable("user_ai_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(), // 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'custom'
  apiKey: text("api_key").notNull(),
  baseUrl: text("base_url"),
  modelName: text("model_name"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type UserAiKey = typeof userAiKeys.$inferSelect;
export type NewUserAiKey = typeof userAiKeys.$inferInsert;
```

- [ ] **Step 2: Export table schema in `packages/database/src/schema/index.ts`**
- [ ] **Step 3: Add corresponding TypeScript types in `packages/shared/src/types/app.types.ts`**
- [ ] **Step 4: Generate and apply local database migration**

Run: `cd packages/database && bun run generate && bun run migrate:local`
Expected: Migration created and applied successfully.

- [ ] **Step 5: Commit changes**

```bash
git add packages/database/ packages/shared/
git commit -m "feat(database): add user_ai_keys schema for BYOK support"
```

---

### Task 2: Backend API Routes for AI Key Management & OpenAI-Compatible Routing

**Files:**

- Create: `packages/api/src/routes/ai-keys.ts`
- Modify: `packages/api/src/app.ts`
- Modify: `packages/api/src/routes/ai.ts`

**Interfaces:**

- Consumes: `userAiKeys` table from `@magicappdev/database`.
- Produces: `/api/ai-keys` REST endpoints (GET, POST, DELETE) and updated AI completion proxy routing supporting custom base URLs and API keys.

- [ ] **Step 1: Implement CRUD routes for user AI keys in `packages/api/src/routes/ai-keys.ts`**
- [ ] **Step 2: Register `/api/ai-keys` routes in `packages/api/src/app.ts` using `authMiddleware`**
- [ ] **Step 3: Update `packages/api/src/routes/ai.ts` to check if the user has a configured BYOK provider and route requests to their custom endpoint/key instead of default AI Gateway when specified.**
- [ ] **Step 4: Run typecheck to verify backend changes**

Run: `bun run typecheck`
Expected: No TypeScript errors.

- [ ] **Step 5: Commit changes**

```bash
git add packages/api/
git commit -m "feat(api): add ai-keys management endpoints and custom provider routing"
```

---

### Task 3: Web App BYOK Settings UI

**Files:**

- Create: `apps/web/src/pages/settings/ai-provider.tsx`
- Modify: `apps/web/src/pages/settings/page.tsx`

**Interfaces:**

- Consumes: `/api/ai-keys` endpoints via `ApiClient`.
- Produces: Settings page tab/section enabling users to configure, test, and save OpenAI-compatible API keys and custom endpoints.

- [ ] **Step 1: Create AI Provider Settings component in web app**
- [ ] **Step 2: Add form fields for Provider selection (OpenAI, Anthropic, DeepSeek, Groq, Custom), API Key input, Base URL input (for custom/compatible endpoints), and Test Connection button.**
- [ ] **Step 3: Connect form submission and fetching to `ApiClient`**
- [ ] **Step 4: Run web build and test**

Run: `turbo build --filter=@magicappdev/web`
Expected: Successful build without errors.

- [ ] **Step 5: Commit changes**

```bash
git add apps/web/
git commit -m "feat(web): add BYOK AI provider settings interface"
```

---

### Task 4: Mobile App BYOK Settings Screen

**Files:**

- Create: `apps/mobile/src/app/settings/ai-provider.tsx`

**Interfaces:**

- Consumes: `/api/ai-keys` endpoints via shared `ApiClient`.
- Produces: Mobile settings screen for managing custom AI keys.

- [ ] **Step 1: Create mobile AI provider settings screen using Ionic/React Native components**
- [ ] **Step 2: Implement state management for provider list, adding/deleting keys, and testing connection**
- [ ] **Step 3: Test mobile build and typecheck**

Run: `turbo build --filter=@magicappdev/mobile`
Expected: Successful build.

- [ ] **Step 4: Commit changes**

```bash
git add apps/mobile/
git commit -m "feat(mobile): add BYOK AI provider settings screen"
```
