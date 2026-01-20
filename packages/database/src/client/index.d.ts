/**
 * Database client for Cloudflare D1
 */
import { type DrizzleD1Database } from "drizzle-orm/d1";
import { schema } from "../schema/index";
/** Database client type with schema */
export type Database = DrizzleD1Database<typeof schema>;
/** Create a database client from a D1 binding */
export declare function createDatabase(d1: D1Database): Database;
/** Re-export schema for convenience */
export { schema };
/** Database client configuration */
export interface DatabaseConfig {
  /** D1 database binding */
  database: D1Database;
  /** Enable query logging */
  logger?: boolean;
}
/** Create a configured database client */
export declare function createDatabaseClient(config: DatabaseConfig): Database;
//# sourceMappingURL=index.d.ts.map
