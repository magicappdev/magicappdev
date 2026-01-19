/**
 * Projects table schema
 */
/** Project status enum values */
export declare const PROJECT_STATUS: readonly [
  "draft",
  "active",
  "archived",
  "deployed",
];
/** Project framework enum values */
export declare const PROJECT_FRAMEWORK: readonly [
  "react-native",
  "expo",
  "next",
  "remix",
];
/** Projects table */
export declare const projects: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  framework: string;
  config: ProjectConfig;
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
  config: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<ProjectConfig>;
  githubUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  deploymentUrl: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  createdAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
  updatedAt: import("drizzle-orm/sqlite-core").SQLiteColumnBuilderBase<string>;
};
/** Project configuration stored as JSON */
export interface ProjectConfig {
  typescript?: boolean;
  styling?: string;
  stateManagement?: string;
  navigation?: string;
  testing?: string;
}
/** Project type inferred from schema */
export type Project = typeof projects.$inferSelect;
/** New project type for inserts */
export type NewProject = typeof projects.$inferInsert;
//# sourceMappingURL=projects.d.ts.map
