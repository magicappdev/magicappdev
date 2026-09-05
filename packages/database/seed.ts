/**
 * Database seeding utilities for local development
 *
 * Usage:
 *   bun run seed              # Seed demo data
 *   bun run seed --reset      # Wipe all data and reseed
 */

import { generateSeedSQL, buildResetSQL } from "./src/seed.js";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

const DB_NAME = "magicappdev-db";
const WRANGLER_TOML = path.join(process.cwd(), "wrangler.toml");
const PERSIST_DIR = path.join(process.cwd(), "..", "..", ".wrangler", "state");

function runWranglerWithFile(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sqlFile = path.join(
      os.tmpdir(),
      `magicappdev-seed-${Date.now()}.sql`,
    );
    fs.writeFileSync(sqlFile, sql);

    const proc = spawn(
      "bunx",
      [
        "wrangler",
        "d1",
        "execute",
        DB_NAME,
        "--local",
        "--file",
        sqlFile,
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
      try {
        fs.unlinkSync(sqlFile);
      } catch {
        // ignore cleanup errors
      }

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
  await runWranglerWithFile(buildResetSQL());
  console.log("Database reset complete.");
}

async function seed(): Promise<void> {
  const sql = generateSeedSQL();
  await runWranglerWithFile(sql);
  console.log("Seed data inserted successfully.");
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
