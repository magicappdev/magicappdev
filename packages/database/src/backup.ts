/**
 * Database backup/restore helpers — pure functions.
 *
 * The CLI entry point in `backup.ts` imports these functions.
 * Dumps are produced/consumed with `wrangler d1 export` /
 * `wrangler d1 execute --file`, so restore only targets the local
 * database. Production restores must be done manually via the
 * Cloudflare dashboard to avoid accidental data loss.
 */

export const BACKUP_FILE_PREFIX = "magicappdev-db";

/** Build a timestamped dump filename, e.g. `magicappdev-db-20260906-103000.sql`. */
export function buildBackupFilename(now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${BACKUP_FILE_PREFIX}-${stamp}.sql`;
}

/** True when `--remote` is passed (export from production D1). */
export function isRemoteBackup(args: string[]): boolean {
  return args.includes("--remote");
}

/** True when `--restore --file <path>` is passed. */
export function isRestore(args: string[]): boolean {
  return args.includes("--restore");
}

/** Extract the `--file <path>` value, or null when absent. */
export function getRestoreFile(args: string[]): string | null {
  const idx = args.indexOf("--file");
  if (idx === -1 || idx + 1 >= args.length) {
    return null;
  }
  return args[idx + 1];
}
