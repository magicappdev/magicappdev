/**
 * Admin API Keys table for application-level API keys
 * Used for external integrations, monitoring, and admin access
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminApiKeys = sqliteTable("admin_api_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  key: text("key").notNull(), // Encrypted or hashed key
  keyPrefix: text("key_prefix").notNull(), // First 8 characters for display
  description: text("description"),
  scopes: text("scopes").notNull(), // JSON string of scopes ["read", "write", "admin"]
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
  createdBy: text("created_by"), // Admin user ID who created this key
  lastUsedAt: text("last_used_at"), // When the key was last used
  expiresAt: text("expires_at"), // Optional expiration date
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type AdminApiKey = typeof adminApiKeys.$inferSelect;
export type NewAdminApiKey = typeof adminApiKeys.$inferInsert;
