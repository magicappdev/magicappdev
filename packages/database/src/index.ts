/**
 * @magicappdev/database
 *
 * Database utilities with Drizzle ORM for Cloudflare D1
 */

// Schema
export * from "./schema/index.js";

// Client
export {
  createDatabase,
  createDatabaseClient,
  schema,
  type Database,
  type DatabaseConfig,
} from "./client/index.js";
