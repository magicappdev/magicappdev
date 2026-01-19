/**
 * Users table schema
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Users table */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** User type inferred from schema */
export type User = typeof users.$inferSelect;

/** New user type for inserts */
export type NewUser = typeof users.$inferInsert;
