/**
 * Database backup/restore entry point for local development.
 *
 * Usage:
 *   bun run backup                    # Export local D1 to backups/
 *   bun run backup --remote           # Export production D1 to backups/
 *   bun run restore --file <path>     # Restore local D1 from a dump file
 *
 * Production restores are intentionally unsupported here — restore
 * production data manually via the Cloudflare dashboard.
 */

import {
  buildBackupFilename,
  getRestoreFile,
  isRemoteBackup,
  isRestore,
} from "./src/backup.js";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const DB_NAME = "magicappdev-db";
const WRANGLER_TOML = path.join(process.cwd(), "wrangler.toml");
const PERSIST_DIR = path.join(process.cwd(), "..", "..", ".wrangler", "state");
const BACKUP_DIR = path.join(process.cwd(), "backups");

function runWrangler(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("bunx", ["wrangler", ...args], {
      stdio: "inherit",
      shell: true,
    });
    proc.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`wrangler exited with code ${code}`));
      }
    });
  });
}

async function backup(remote: boolean): Promise<void> {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, buildBackupFilename());
  const scope = remote ? "--remote" : "--local";
  const args = ["d1", "export", DB_NAME, scope, "--output", file];
  if (!remote) {
    args.push("--persist-to", PERSIST_DIR);
  }
  args.push("-c", WRANGLER_TOML);
  console.log(
    `Exporting ${remote ? "production" : "local"} database to ${file}...`,
  );
  await runWrangler(args);
  console.log(`Backup complete: ${file}`);
}

async function restore(file: string): Promise<void> {
  const resolved = path.isAbsolute(file)
    ? file
    : path.join(process.cwd(), file);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Dump file not found: ${resolved}`);
  }
  console.log(`Restoring local database from ${resolved}...`);
  await runWrangler([
    "d1",
    "execute",
    DB_NAME,
    "--local",
    "--file",
    resolved,
    "--persist-to",
    PERSIST_DIR,
    "-c",
    WRANGLER_TOML,
  ]);
  console.log("Restore complete.");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (isRestore(args)) {
    const file = getRestoreFile(args);
    if (!file) {
      throw new Error("Usage: bun run restore --file <path-to-dump.sql>");
    }
    await restore(file);
    return;
  }
  await backup(isRemoteBackup(args));
  console.log("Done.");
}

main().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
