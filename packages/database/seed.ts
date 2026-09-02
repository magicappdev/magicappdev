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
import * as fs from "node:fs";

const DB_NAME = "magicappdev-db";
const WRANGLER_TOML = path.join(process.cwd(), "wrangler.toml");
const PERSIST_DIR = path.join(process.cwd(), "..", "..", ".wrangler", "state");

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

  await runWrangler(["--command", buildResetSQL()]);

  console.log("Database reset complete.");
}

async function seed(): Promise<void> {
  const sql = generateSeedSQL();

  const sqlFile = path.join(process.cwd(), "seed.sql");
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
