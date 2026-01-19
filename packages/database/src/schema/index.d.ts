/**
 * Database schema exports
 */
export declare const schema: {
  users: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
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
  projects: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
    id: string;
    userId: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    framework: string;
    config: import("./projects.js").ProjectConfig;
    githubUrl: string;
    deploymentUrl: string;
    createdAt: string;
    updatedAt: string;
  }> & {
    id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    userId: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    name: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    slug: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    description: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    status: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    framework: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    config: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<
      import("./projects.js").ProjectConfig
    >;
    githubUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    deploymentUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    createdAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  };
  sessions: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
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
};
export * from "./users.js";
export * from "./projects.js";
export * from "./sessions.js";
//# sourceMappingURL=index.d.ts.map
