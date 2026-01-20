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
    role: string;
    emailVerified: number;
    createdAt: string;
    updatedAt: string;
  }> & {
    id: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    email: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    name: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    passwordHash: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    avatarUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
    role: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
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
  accounts: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
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
  profiles: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
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
};
export * from "./accounts.js";
export * from "./profiles.js";
export * from "./projects.js";
export * from "./sessions.js";
export * from "./users.js";
//# sourceMappingURL=index.d.ts.map
