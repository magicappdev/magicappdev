/**
 * File History table schema
 */

import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { projectFiles } from "./project-files.js";

export const fileHistory = sqliteTable("file_history", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => projectFiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  changeType: text("change_type", { enum: ["created", "updated", "deleted"] }).notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: text("changed_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type FileHistory = typeof fileHistory.$inferSelect;
export type NewFileHistory = typeof fileHistory.$inferInsert;
