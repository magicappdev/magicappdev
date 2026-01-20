/**
 * Accounts table schema for OAuth providers
 * Note: Uniqueness of (provider, providerAccountId) is handled in application logic
 * due to build issues with Drizzle's extraConfig/uniqueIndex in this environment.
 */
/** Accounts table */
export declare const accounts: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string;
  access_token: string;
  expires_at: number;
  token_type: string;
  scope: string;
  id_token: string;
  session_state: string;
}> & {
  id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  userId: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  type: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  provider: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  providerAccountId: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  refresh_token: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  access_token: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  expires_at: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<number>;
  token_type: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  scope: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  id_token: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  session_state: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
};
/** Account type inferred from schema */
export type Account = typeof accounts.$inferSelect;
/** New account type for inserts */
export type NewAccount = typeof accounts.$inferInsert;
//# sourceMappingURL=accounts.d.ts.map
