/**
 * API Keys table schema for storing AI provider API keys
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

/** API Keys table */
export const apiKeys = sqliteTable("api_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "openai", "anthropic", "gemini", "openrouter", "zai"
  apiKey: text("api_key").notNull(),
  label: text("label"), // User-friendly label like "My OpenAI Key"
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** API key type inferred from schema */
export type ApiKey = typeof apiKeys.$inferSelect;

/** New API key type for inserts */
export type NewApiKey = typeof apiKeys.$inferInsert;
