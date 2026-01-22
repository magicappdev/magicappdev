/**
 * Tickets table schema
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

/** Tickets table */
export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["open", "in_progress", "closed"] })
    .notNull()
    .default("open"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** Ticket type inferred from schema */
export type Ticket = typeof tickets.$inferSelect;

/** New ticket type for inserts */
export type NewTicket = typeof tickets.$inferInsert;
