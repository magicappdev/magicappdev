/**
 * Accounts table schema for OAuth providers
 * Note: Uniqueness of (provider, providerAccountId) is handled in application logic
 * due to build issues with Drizzle's extraConfig/uniqueIndex in this environment.
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

/** Accounts table */
export const accounts = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "oauth", "email", "oidc"
  provider: text("provider").notNull(), // "github", "google"
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

/** Account type inferred from schema */
export type Account = typeof accounts.$inferSelect;

/** New account type for inserts */
export type NewAccount = typeof accounts.$inferInsert;
