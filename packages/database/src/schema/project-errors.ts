/**
 * Project Errors table schema
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "./projects.js";

export const projectErrors = sqliteTable("project_errors", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  errorType: text("error_type", { enum: ["build", "runtime", "lint", "type", "test"] }).notNull(),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  filePath: text("file_path"),
  lineNumber: integer("line_number"),
  occurredAt: text("occurred_at").notNull().$defaultFn(() => new Date().toISOString()),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
});

export type ProjectError = typeof projectErrors.$inferSelect;
export type NewProjectError = typeof projectErrors.$inferInsert;
