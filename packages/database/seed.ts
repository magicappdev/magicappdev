/**
 * Database seeding utilities for local development
 *
 * Usage:
 *   bun run seed              # Seed demo data
 *   bun run seed --reset      # Wipe all data and reseed
 */

import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const DB_NAME = "magicappdev-db";
const WRANGLER_TOML = path.join(import.meta.dirname, "..", "wrangler.toml");
const PERSIST_DIR = path.join(
  import.meta.dir,
  "..",
  "..",
  "..",
  ".wrangler",
  "state",
);

function runWrangler(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        DB_NAME,
        ...args,
        "-c",
        WRANGLER_TOML,
        "--persist-to",
        PERSIST_DIR,
      ],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    proc.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`wrangler exited with code ${code}`));
      }
    });
  });
}

async function reset(): Promise<void> {
  console.log("Resetting database...");
  const tables = [
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

  for (const table of tables) {
    await runWrangler(["--command", `DELETE FROM ${table};`]);
  }

  console.log("Database reset complete.");
}

async function seed(): Promise<void> {
  const now = new Date().toISOString();

  const sql = `
INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at)
VALUES
  ('user-1', 'alice@example.com', 'Alice Admin', 'admin', 1, '${now}', '${now}'),
  ('user-2', 'bob@example.com', 'Bob User', 'user', 1, '${now}', '${now}');

INSERT INTO profiles (id, user_id, bio, location, github_username, created_at, updated_at)
VALUES
  ('profile-1', 'user-1', 'Platform administrator', 'Cloudflare HQ', 'alice-dev', '${now}', '${now}'),
  ('profile-2', 'user-2', 'Building cool things', 'Remote', 'bob-codes', '${now}', '${now}');

INSERT INTO projects (id, user_id, name, slug, description, status, framework, config, created_at, updated_at)
VALUES
  ('project-1', 'user-1', 'Demo App', 'demo-app', 'A demo project for testing', 'active', 'expo', '{"typescript": true}', '${now}', '${now}'),
  ('project-2', 'user-2', 'My SaaS', 'my-saas', 'SaaS starter project', 'draft', 'next', '{"typescript": true}', '${now}', '${now}');

INSERT INTO chat_sessions (id, project_id, user_id, title, created_at, updated_at)
VALUES
  ('session-1', 'project-1', 'user-1', 'Demo App Chat', '${now}', '${now}'),
  ('session-2', 'project-2', 'user-2', 'My SaaS Chat', '${now}', '${now}');

INSERT INTO chat_messages (id, session_id, role, content, timestamp)
VALUES
  ('msg-1', 'session-1', 'user', 'Create a login screen', ${Date.now()}),
  ('msg-2', 'session-1', 'assistant', 'I will create a login screen for your Expo app.', ${Date.now() + 1}),
  ('msg-3', 'session-2', 'user', 'Add a dashboard', ${Date.now()}),
  ('msg-4', 'session-2', 'assistant', 'I will add a dashboard to your Next.js app.', ${Date.now() + 1});
`;

  const sqlFile = path.join(import.meta.dir, "seed.sql");
  fs.writeFileSync(sqlFile, sql);

  try {
    await runWrangler(["--file", sqlFile]);
    console.log("Seed data inserted successfully.");
  } finally {
    fs.unlinkSync(sqlFile);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const resetFlag = args.includes("--reset");

  if (resetFlag) {
    await reset();
  }

  await seed();
  console.log("Done.");
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
