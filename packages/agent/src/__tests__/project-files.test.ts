import { upsertProjectFile } from "../lib/project-files.js";
import { fileHistory } from "@magicappdev/database";
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
  const historyWrites: Array<{
    fileId: string;
    content: string;
    changeType: string;
    changedBy: string;
  }> = [];

  const db = {
    query: {
      projectFiles: {
        findFirst: vi.fn(async () => undefined as StoredFile | undefined),
      },
      fileHistory: {
        findMany: vi.fn(async () => historyWrites),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: vi.fn(
        async (row: StoredFile | (typeof historyWrites)[number]) => {
          if (table === fileHistory) {
            historyWrites.push(row as (typeof historyWrites)[number]);
          } else {
            const file = row as StoredFile;
            files.set(`${file.projectId}:${file.path}`, file);
          }
        },
      ),
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

  it("records a created history entry on insert", async () => {
    const { db, files, historyWrites } = createFakeDb();
    (
      db.query.projectFiles.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);

    await upsertProjectFile(
      db as never,
      "project-1",
      "src/app.ts",
      "console.log(1);",
    );

    expect(historyWrites).toHaveLength(1);
    expect(historyWrites[0]).toMatchObject({
      fileId: files.get("project-1:src/app.ts")?.id,
      content: "console.log(1);",
      changeType: "created",
      changedBy: "agent",
    });
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

    expect(updatedRow).toMatchObject({
      content: "new!",
      language: "ts",
      size: 4,
    });
    expect(files.get("project-1:src/app.ts")?.content).toBe("new!");
  });

  it("records an updated history entry on update, not a new file", async () => {
    const existing: StoredFile = {
      id: "file-1",
      projectId: "project-1",
      path: "src/app.ts",
      content: "old",
      language: "ts",
      size: 3,
    };
    const { db, files, historyWrites } = createFakeDb([existing]);
    (
      db.query.projectFiles.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(existing);

    (db.update as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      set: vi.fn((row: Partial<StoredFile>) => {
        files.set("project-1:src/app.ts", { ...existing, ...row });
        return { where: vi.fn(async () => undefined) };
      }),
    });

    await upsertProjectFile(db as never, "project-1", "src/app.ts", "new!");

    // The only insert is the history entry — no new project_files row.
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalledWith(fileHistory);
    expect(historyWrites).toHaveLength(1);
    expect(historyWrites[0]).toMatchObject({
      fileId: "file-1",
      content: "new!",
      changeType: "updated",
      changedBy: "agent",
    });
  });
});
