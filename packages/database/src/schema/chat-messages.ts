/**
 * Chat Messages table schema
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { chatSessions } from "./chat-sessions.js";

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp").notNull().$defaultFn(() => Date.now()),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
