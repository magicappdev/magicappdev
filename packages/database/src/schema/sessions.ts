/**
 * Sessions table schema for authentication
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

/** Sessions table */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

/** Session type inferred from schema */
export type Session = typeof sessions.$inferSelect;

/** New session type for inserts */
export type NewSession = typeof sessions.$inferInsert;
