/**
 * Analytics table for tracking user events
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  event: text("event").notNull(), // "onboarding_start", "onboarding_complete", "onboarding_skip", etc.
  category: text("category").notNull(), // "onboarding", "feature", "error"
  userId: text("user_id"), // Optional user ID if logged in
  properties: text("properties"), // JSON string of event properties
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
