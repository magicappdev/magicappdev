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

  parts.push(`INSERT INTO user_ai_keys (id, user_id, provider, api_key, base_url, model_name, is_default, created_at, updated_at)
VALUES
  ('uak-1', '${SEED_USER_ID}', 'openai', 'sk-demo-openai', NULL, 'gpt-4o', 1, '${now}', '${now}'),
  ('uak-2', '${SEED_USER_2_ID}', 'anthropic', 'sk-demo-anthropic', NULL, 'claude-3-5-sonnet', 1, '${now}', '${now}');`);

  parts.push(`INSERT INTO tickets (id, user_id, subject, message, status, created_at, updated_at)
VALUES
  ('ticket-1', '${SEED_USER_ID}', 'Deployment failing', 'The deploy button returns a 500 error.', 'open', '${now}', '${now}'),
  ('ticket-2', '${SEED_USER_2_ID}', 'Feature request: offline mode', 'Please add offline support for mobile.', 'in_progress', '${now}', '${now}');`);

  parts.push(`INSERT INTO project_files (id, project_id, path, content, language, size, created_at, updated_at)
VALUES
  ('file-1', '${SEED_PROJECT_ID}', 'app/LoginScreen.tsx', 'export default function LoginScreen() { return null; }', 'typescript', 78, '${now}', '${now}'),
  ('file-2', '${SEED_PROJECT_ID}', 'app/Dashboard.tsx', 'export default function Dashboard() { return null; }', 'typescript', 82, '${now}', '${now}');`);

  parts.push(`INSERT INTO system_logs (id, level, category, message, details, user_id, metadata, created_at)
VALUES
  ('log-1', 'info', 'system', 'Seed data loaded', NULL, NULL, NULL, '${now}'),
  ('log-2', 'warn', 'api', 'Rate limit threshold approaching', NULL, '${SEED_USER_ID}', NULL, '${now}');`);

  parts.push(`INSERT INTO admin_api_keys (id, name, key, key_prefix, description, scopes, is_active, created_by, created_at, updated_at)
VALUES
  ('ak-1', 'CI Deploy Key', 'magicappdev_ci_0123456789', 'magicapp', 'Used by GitHub Actions for deploy', '["read","write"]', 1, '${SEED_USER_ID}', '${now}', '${now}');`);

  parts.push(`INSERT INTO api_keys (id, user_id, provider, api_key, label, created_at, updated_at)
VALUES
  ('apik-1', '${SEED_USER_ID}', 'openai', 'encrypted-demo-openai-key', 'My OpenAI Key', '${now}', '${now}'),
  ('apik-2', '${SEED_USER_2_ID}', 'anthropic', 'encrypted-demo-anthropic-key', 'Work Anthropic Key', '${now}', '${now}');`);

  parts.push(`INSERT INTO project_commands (id, project_id, command, exit_code, output, error, executed_at)
VALUES
  ('cmd-1', '${SEED_PROJECT_ID}', 'npm run lint', 0, 'Lint passed', NULL, '${now}'),
  ('cmd-2', '${SEED_PROJECT_ID}', 'npm run build', 1, NULL, 'Build failed: missing env', '${now}');`);

  parts.push(`INSERT INTO project_errors (id, project_id, error_type, message, stack_trace, file_path, line_number, occurred_at, resolved)
VALUES
  ('err-1', '${SEED_PROJECT_ID}', 'build', 'Missing env var', NULL, 'apps/web/.env', 12, '${now}', 0),
  ('err-2', '${SEED_PROJECT_ID}', 'runtime', 'Hydration mismatch', NULL, 'app/Dashboard.tsx', 45, '${now}', 1);`);

  parts.push(`INSERT INTO file_history (id, file_id, content, change_type, changed_by, changed_at)
VALUES
  ('fh-1', 'file-1', 'export default function LoginScreen() { return null; }', 'created', '${SEED_USER_ID}', '${now}'),
  ('fh-2', 'file-2', 'export default function Dashboard() { return null; }', 'created', '${SEED_USER_ID}', '${now}');`);

  return parts.join("\n\n");
}
