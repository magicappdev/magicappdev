/**
 * System Logs table for tracking application events
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const systemLogs = sqliteTable("system_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  level: text("level").notNull(), // "debug", "info", "warn", "error"
  category: text("category").notNull(), // "auth", "api", "agent", "system"
  message: text("message").notNull(),
  details: text("details"), // JSON string of additional context
  userId: text("user_id"), // Optional user who triggered the action
  metadata: text("metadata"), // JSON string of additional data
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
