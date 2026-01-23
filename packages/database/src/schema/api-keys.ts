/**
 * API Keys table schema for storing AI provider API keys
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/** API key type inferred from schema */
export type ApiKey = typeof apiKeys.$inferSelect;

/** New API key type for inserts */
export type NewApiKey = typeof apiKeys.$inferInsert;
