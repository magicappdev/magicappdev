import {
  BACKUP_FILE_PREFIX,
  buildBackupFilename,
  getRestoreFile,
  isRemoteBackup,
  isRestore,
} from "../backup.js";
import { describe, expect, it } from "vitest";

describe("backup utilities", () => {
  it("builds a timestamped filename", () => {
    const name = buildBackupFilename(new Date(2026, 8, 6, 10, 30, 5));
    expect(name).toBe(`${BACKUP_FILE_PREFIX}-20260906-103005.sql`);
  });

  it("detects --remote flag", () => {
    expect(isRemoteBackup(["--remote"])).toBe(true);
    expect(isRemoteBackup([])).toBe(false);
  });

  it("detects restore mode and --file value", () => {
    expect(isRestore(["--restore", "--file", "a.sql"])).toBe(true);
    expect(isRestore([])).toBe(false);
    expect(getRestoreFile(["--restore", "--file", "a.sql"])).toBe("a.sql");
    expect(getRestoreFile(["--restore"])).toBeNull();
    expect(getRestoreFile([])).toBeNull();
  });
});
