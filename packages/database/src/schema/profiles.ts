/**
 * Profiles table schema for extended user info
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.js";

/** Profiles table */
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  website: text("website"),
  location: text("location"),
  region: text("region"),
  githubUsername: text("github_username"),
  twitterUsername: text("twitter_username"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** Profile type inferred from schema */
export type Profile = typeof profiles.$inferSelect;

/** New profile type for inserts */
export type NewProfile = typeof profiles.$inferInsert;
