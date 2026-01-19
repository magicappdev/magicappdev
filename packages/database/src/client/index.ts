/**
 * Database client for Cloudflare D1
 */

import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";

/** Database client type with schema */
export type Database = DrizzleD1Database<typeof schema>;

/** Create a database client from a D1 binding */
export function createDatabase(d1: D1Database): Database {
  return drizzle(d1, { schema });
}

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
export function createDatabaseClient(config: DatabaseConfig): Database {
  return drizzle(config.database, {
    schema,
    logger: config.logger,
  });
}
