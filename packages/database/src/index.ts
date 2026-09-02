/**
 * @magicappdev/database
 *
 * Database utilities with Drizzle ORM for Cloudflare D1
 */

// Schema
export * from "./schema/index.js";

// Seed utilities
export { generateSeedSQL, getTableList, buildResetSQL } from "./seed.js";

// Re-export common drizzle-orm members
export * from "drizzle-orm";

// Client
export {
  createDatabase,
  createDatabaseClient,
  schema,
  type Database,
  type DatabaseConfig,
} from "./client/index";
