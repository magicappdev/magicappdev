/**
 * Projects table schema
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

/** Project status enum values */
export const PROJECT_STATUS = [
  "draft",
  "active",
  "archived",
  "deployed",
] as const;

/** Project framework enum values */
export const PROJECT_FRAMEWORK = [
  "react-native",
  "expo",
  "next",
  "remix",
] as const;

/** Projects table */
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  status: text("status", { enum: PROJECT_STATUS }).notNull().default("draft"),
  framework: text("framework", { enum: PROJECT_FRAMEWORK }).notNull(),
  config: text("config", { mode: "json" }).$type<ProjectConfig>(),
  githubUrl: text("github_url"),
  deploymentUrl: text("deployment_url"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** Project configuration stored as JSON */
interface ProjectConfig {
  typescript?: boolean;
  styling?: string;
  stateManagement?: string;
  navigation?: string;
  testing?: string;
}

/** Project type inferred from schema */
export type Project = typeof projects.$inferSelect;

/** New project type for inserts */
export type NewProject = typeof projects.$inferInsert;
