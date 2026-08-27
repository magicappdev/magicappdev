import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userAiKeys = sqliteTable("user_ai_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  provider: text("provider").notNull(), // 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'custom'
  apiKey: text("api_key").notNull(),
  baseUrl: text("base_url"),
  modelName: text("model_name"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type UserAiKey = typeof userAiKeys.$inferSelect;
export type NewUserAiKey = typeof userAiKeys.$inferInsert;
