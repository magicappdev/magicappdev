/**
 * Project Commands table schema
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "./projects.js";

export const projectCommands = sqliteTable("project_commands", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  command: text("command").notNull(),
  exitCode: integer("exit_code"),
  output: text("output"),
  error: text("error"),
  executedAt: text("executed_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type ProjectCommand = typeof projectCommands.$inferSelect;
export type NewProjectCommand = typeof projectCommands.$inferInsert;
