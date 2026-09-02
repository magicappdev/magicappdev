/**
 * Database seeding utilities — SQL generation logic
 *
 * This module exports pure functions for generating SQL seed data.
 * The CLI entry point in `seed.ts` imports these functions.
 */

const SEED_USER_ID = "user-1";
const SEED_USER_2_ID = "user-2";
const SEED_PROJECT_ID = "project-1";
const SEED_PROJECT_2_ID = "project-2";
const SEED_SESSION_ID = "session-1";
const SEED_SESSION_2_ID = "session-2";

export interface SeedOptions {
  /** Override the timestamp; defaults to current ISO string */
  now?: string;
  /** Reset database before seeding */
  reset?: boolean;
}

/**
 * Tables in dependency-safe deletion order (children before parents).
 * Foreign key constraints require deleting referencing rows before referenced rows.
 */
export function getTableList(): string[] {
  return [
    "chat_messages",
    "chat_sessions",
    "project_files",
    "project_errors",
    "project_commands",
    "file_history",
    "projects",
    "tickets",
    "system_logs",
    "user_ai_keys",
    "api_keys",
    "admin_api_keys",
    "profiles",
    "accounts",
    "sessions",
    "users",
  ];
}

/**
 * Generate SQL DELETE statements for all tables in safe order.
 */
export function buildResetSQL(): string {
  const tables = getTableList();
  return tables.map(t => `DELETE FROM ${t};`).join("\n");
}

/**
 * Generate full seed SQL: reset + insert demo data.
 */
export function generateSeedSQL(options?: SeedOptions): string {
  const now = options?.now || new Date().toISOString();
  const timestamp = Date.now();

  const parts: string[] = [];

  if (options?.reset) {
    parts.push(buildResetSQL());
  }

  parts.push(`INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at)
VALUES
  ('${SEED_USER_ID}', 'alice@example.com', 'Alice Admin', 'admin', 1, '${now}', '${now}'),
  ('${SEED_USER_2_ID}', 'bob@example.com', 'Bob User', 'user', 1, '${now}', '${now}');`);

  parts.push(`INSERT INTO profiles (id, user_id, bio, location, github_username, created_at, updated_at)
VALUES
  ('profile-1', '${SEED_USER_ID}', 'Platform administrator', 'Cloudflare HQ', 'alice-dev', '${now}', '${now}'),
  ('profile-2', '${SEED_USER_2_ID}', 'Building cool things', 'Remote', 'bob-codes', '${now}', '${now}');`);

  parts.push(`INSERT INTO projects (id, user_id, name, slug, description, status, framework, config, created_at, updated_at)
VALUES
  ('${SEED_PROJECT_ID}', '${SEED_USER_ID}', 'Demo App', 'demo-app', 'A demo project for testing', 'active', 'expo', '{\"typescript\": true}', '${now}', '${now}'),
  ('${SEED_PROJECT_2_ID}', '${SEED_USER_2_ID}', 'My SaaS', 'my-saas', 'SaaS starter project', 'draft', 'next', '{\"typescript\": true}', '${now}', '${now}');`);

  parts.push(`INSERT INTO chat_sessions (id, project_id, user_id, title, created_at, updated_at)
VALUES
  ('${SEED_SESSION_ID}', '${SEED_PROJECT_ID}', '${SEED_USER_ID}', 'Demo App Chat', '${now}', '${now}'),
  ('${SEED_SESSION_2_ID}', '${SEED_PROJECT_2_ID}', '${SEED_USER_2_ID}', 'My SaaS Chat', '${now}', '${now}');`);

  parts.push(`INSERT INTO chat_messages (id, session_id, role, content, timestamp)
VALUES
  ('msg-1', '${SEED_SESSION_ID}', 'user', 'Create a login screen', ${timestamp}),
  ('msg-2', '${SEED_SESSION_ID}', 'assistant', 'I will create a login screen for your Expo app.', ${timestamp + 1}),
  ('msg-3', '${SEED_SESSION_2_ID}', 'user', 'Add a dashboard', ${timestamp}),
  ('msg-4', '${SEED_SESSION_2_ID}', 'assistant', 'I will add a dashboard to your Next.js app.', ${timestamp + 1});`);

  return parts.join("\n\n");
}
