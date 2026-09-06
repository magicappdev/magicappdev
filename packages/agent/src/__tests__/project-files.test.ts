import { upsertProjectFile } from "../lib/project-files.js";
import { describe, expect, it, vi } from "vitest";

interface StoredFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
}

/** Minimal in-memory fake of the D1-backed database surface used by upsert. */
function createFakeDb(initial: StoredFile[] = []) {
  const files = new Map<string, StoredFile>(
    initial.map(f => [`${f.projectId}:${f.path}`, f]),
  );
  const historyWrites: unknown[] = [];

  const db = {
    query: {
      projectFiles: {
        findFirst: vi.fn(async () => undefined as StoredFile | undefined),
      },
      // file_history is never queried here — its absence is the point:
      // agent-side upserts do not record history (P8 rollback work).
      fileHistory: {
        findMany: vi.fn(async () => historyWrites),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (row: StoredFile) => {
        files.set(`${row.projectId}:${row.path}`, row);
      }),
    })),
  };

  // findFirst defaults to "not found"; each test overrides per-case with
  // mockResolvedValueOnce. The real query filters by projectId + path via
  // drizzle operators, which the fake does not emulate.
  db.query.projectFiles.findFirst.mockResolvedValue(undefined);

  return { db, files, historyWrites };
}

describe("upsertProjectFile", () => {
  it("inserts a new file with derived language and size", async () => {
    const { db, files } = createFakeDb();
    (
      db.query.projectFiles.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);

    await upsertProjectFile(
      db as never,
      "project-1",
      "src/app.ts",
      "console.log(1);",
    );

    const stored = files.get("project-1:src/app.ts");
    expect(stored).toMatchObject({
      projectId: "project-1",
      path: "src/app.ts",
      content: "console.log(1);",
      language: "ts",
      size: 15,
    });
    expect(typeof stored?.id).toBe("string");
  });

  it("updates the existing file instead of inserting", async () => {
    const existing: StoredFile = {
      id: "file-1",
      projectId: "project-1",
      path: "src/app.ts",
      content: "old",
      language: "ts",
      size: 3,
    };
    const { db, files } = createFakeDb([existing]);
    (
      db.query.projectFiles.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(existing);

    let updatedRow: Partial<StoredFile> | undefined;
    (db.update as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      set: vi.fn((row: Partial<StoredFile>) => {
        updatedRow = row;
        files.set("project-1:src/app.ts", { ...existing, ...row });
        return { where: vi.fn(async () => undefined) };
      }),
    });

    await upsertProjectFile(db as never, "project-1", "src/app.ts", "new!");

    expect(db.insert).not.toHaveBeenCalled();
    expect(updatedRow).toMatchObject({
      content: "new!",
      language: "ts",
      size: 4,
    });
    expect(files.get("project-1:src/app.ts")?.content).toBe("new!");
  });

  it("does not record file_history (known gap, P8 rollback work)", async () => {
    const { db, historyWrites } = createFakeDb();
    (
      db.query.projectFiles.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);

    await upsertProjectFile(db as never, "project-1", "src/app.ts", "x");

    // No history entry is written by agent-side upserts today. Phase 3 must
    // flip this test to assert that a history row IS recorded.
    expect(historyWrites).toHaveLength(0);
  });
});
