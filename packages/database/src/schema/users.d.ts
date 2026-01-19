/**
 * Users table schema
 */
/** Users table */
export declare const users: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl: string;
  emailVerified: number;
  createdAt: string;
  updatedAt: string;
}> & {
  id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  email: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  name: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  passwordHash: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  avatarUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  emailVerified: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<number>;
  createdAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
};
/** User type inferred from schema */
export type User = typeof users.$inferSelect;
/** New user type for inserts */
export type NewUser = typeof users.$inferInsert;
//# sourceMappingURL=users.d.ts.map
