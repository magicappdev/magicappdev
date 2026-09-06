import type {
  fileHistory,
  projectFiles,
  projects,
} from "@magicappdev/database";
import { projectFilesRoutes } from "../routes/project-files.js";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

type Project = typeof projects.$inferSelect;
type ProjectFile = typeof projectFiles.$inferSelect;
type FileHistory = typeof fileHistory.$inferSelect;

const now = new Date().toISOString();

function makeProject(userId: string): Project {
  return {
    id: "project-1",
    userId,
    name: "project-1",
    slug: "project-1",
    description: null,
    status: "active",
    framework: "next",
    templateId: null,
    config: null,
    githubUrl: null,
    deploymentUrl: null,
    createdAt: now,
    updatedAt: now,
  };
}

function makeFile(content: string): ProjectFile {
  return {
    id: "file-1",
    projectId: "project-1",
    path: "src/app.ts",
    content,
    language: "ts",
    size: content.length,
    createdAt: now,
    updatedAt: now,
  };
}

function makeHistoryEntry(content: string): FileHistory {
  return {
    id: "history-1",
    fileId: "file-1",
    content,
    changeType: "updated",
    changedBy: "user-1",
    changedAt: now,
  };
}

function createApp(opts: {
  project?: Project | undefined;
  file?: ProjectFile | undefined;
  entry?: FileHistory | undefined;
  ownerId?: string;
}) {
  const { project, file, entry, ownerId = "user-1" } = opts;
  const setCalls: Array<{ content: string }> = [];
  const historyInserts: Array<{ content: string; changeType: string }> = [];

  const mockDb = {
    query: {
      projects: {
        findFirst: vi.fn(async () => project),
      },
      projectFiles: {
        findFirst: vi.fn(async () => file),
      },
      fileHistory: {
        findFirst: vi.fn(async () => entry),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn((row: { content: string }) => {
        setCalls.push(row);
        return {
          where: vi.fn(() => ({
            returning: vi.fn(() => ({
              get: vi.fn(async () => (file ? { ...file, ...row } : undefined)),
            })),
          })),
        };
      }),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (row: { content: string; changeType: string }) => {
        historyInserts.push(row);
      }),
    })),
  };

  const app = new Hono<AppContext>();
  app.use("*", async (c, next) => {
    c.set("db", mockDb as unknown as AppContext["Variables"]["db"]);
    c.set("userId", ownerId);
    c.set("userRole", "user");
    c.env = {
      DB: {} as AppContext["Bindings"]["DB"],
      AI: {} as AppContext["Bindings"]["AI"],
      ENVIRONMENT: "test",
      JWT_SECRET: "test-jwt",
    } as AppContext["Bindings"];
    await next();
  });
  app.route("/projects", projectFilesRoutes);

  return { app, setCalls, historyInserts };
}

describe("POST /projects/:projectId/files/:filePath/restore", () => {
  it("returns 404 when the project does not exist", async () => {
    const { app } = createApp({
      file: makeFile("new"),
      entry: makeHistoryEntry("old"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({ historyId: "history-1" }),
      },
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when the project belongs to someone else", async () => {
    const { app } = createApp({
      project: makeProject("other-user"),
      file: makeFile("new"),
      entry: makeHistoryEntry("old"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({ historyId: "history-1" }),
      },
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when historyId is missing", async () => {
    const { app } = createApp({
      project: makeProject("user-1"),
      file: makeFile("new"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when the file does not exist", async () => {
    const { app } = createApp({
      project: makeProject("user-1"),
      entry: makeHistoryEntry("old"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({ historyId: "history-1" }),
      },
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when the history entry does not exist", async () => {
    const { app } = createApp({
      project: makeProject("user-1"),
      file: makeFile("new"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({ historyId: "nope" }),
      },
    );
    expect(res.status).toBe(404);
  });

  it("restores content and appends a history entry", async () => {
    const { app, setCalls, historyInserts } = createApp({
      project: makeProject("user-1"),
      file: makeFile("new content"),
      entry: makeHistoryEntry("old content"),
    });
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/restore",
      {
        method: "POST",
        body: JSON.stringify({ historyId: "history-1" }),
      },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: { content: string };
    };
    expect(json.success).toBe(true);
    expect(json.data.content).toBe("old content");
    expect(setCalls).toEqual([
      expect.objectContaining({ content: "old content" }),
    ]);
    // Append-only: the restore itself is recorded, history is never rewritten.
    expect(historyInserts).toHaveLength(1);
    expect(historyInserts[0]).toMatchObject({
      content: "old content",
      changeType: "updated",
    });
  });
});
