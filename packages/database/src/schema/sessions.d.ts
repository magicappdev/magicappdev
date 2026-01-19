/**
 * Sessions table schema for authentication
 */
/** Sessions table */
export declare const sessions: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  userAgent: string;
  ipAddress: string;
}> & {
  id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  userId: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  refreshToken: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  expiresAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  createdAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  userAgent: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  ipAddress: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
};
/** Session type inferred from schema */
export type Session = typeof sessions.$inferSelect;
/** New session type for inserts */
export type NewSession = typeof sessions.$inferInsert;
//# sourceMappingURL=sessions.d.ts.map
