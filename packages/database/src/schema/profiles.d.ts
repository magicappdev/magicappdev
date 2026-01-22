/**
 * Profiles table schema for extended user info
 */
/** Profiles table */
export declare const profiles: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
    id: string;
    userId: string;
    bio: string;
    website: string;
    location: string;
    githubUsername: string;
    twitterUsername: string;
    createdAt: string;
    updatedAt: string;
}> & {
    id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    userId: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    bio: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    website: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    location: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    githubUsername: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    twitterUsername: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    createdAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
};
/** Profile type inferred from schema */
export type Profile = typeof profiles.$inferSelect;
/** New profile type for inserts */
export type NewProfile = typeof profiles.$inferInsert;
//# sourceMappingURL=profiles.d.ts.map