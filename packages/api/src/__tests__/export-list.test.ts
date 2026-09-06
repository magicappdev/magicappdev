import type { projects, projectFiles } from "@magicappdev/database";
import { exportRoutes } from "../routes/export.js";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

type Project = typeof projects.$inferSelect;
type ProjectFile = typeof projectFiles.$inferSelect;

function createMockDb(projectsData: Project[], filesData: ProjectFile[]) {
  return {
    query: {
      projects: {
        findMany: vi.fn(async (): Promise<Project[]> => projectsData),
      },
      projectFiles: {
        findMany: vi.fn(async (): Promise<ProjectFile[]> => filesData),
      },
    },
  };
}

function createApp(projectsData: Project[], filesData: ProjectFile[]) {
  const mockDb = createMockDb(projectsData, filesData);
  const app = new Hono<AppContext>();

  app.use("*", async (c, next) => {
    c.set("db", mockDb as unknown as AppContext["Variables"]["db"]);
    c.set("userId", "user-1");
    c.set("userRole", "user");
    c.env = {
      DB: {} as AppContext["Bindings"]["DB"],
      AI: {} as AppContext["Bindings"]["AI"],
      ENVIRONMENT: "test",
      JWT_SECRET: "test-jwt",
    } as AppContext["Bindings"];
    await next();
  });

  app.route("/projects", exportRoutes);

  return { app, mockDb };
}

describe("export list pagination", () => {
  const now = new Date().toISOString();

  const makeProject = (id: string, updatedAt: string): Project => ({
    id,
    userId: "user-1",
    name: id,
    slug: id,
    description: null,
    status: "active",
    framework: "next",
    templateId: null,
    config: null,
    githubUrl: null,
    deploymentUrl: null,
    createdAt: now,
    updatedAt,
  });

  it("returns first page with nextCursor when more results exist", async () => {
    const projectsData = [
      makeProject("project-0", now),
      makeProject("project-1", new Date(Date.now() - 1000).toISOString()),
      makeProject("project-2", new Date(Date.now() - 2000).toISOString()),
    ];

    const { app } = createApp(projectsData, []);

    const res = await app.request("/projects/export/list?limit=2");
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string; name: string }>;
      nextCursor: string | null;
    };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(json.nextCursor).not.toBeNull();
  });

  it("returns empty nextCursor on the last page", async () => {
    const projectsData = [makeProject("project-0", now)];

    const { app } = createApp(projectsData, []);

    const res = await app.request("/projects/export/list?limit=100");
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string }>;
      nextCursor: string | null;
    };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.nextCursor).toBeNull();
  });

  it("respects the max page size of 100", async () => {
    const projectsData = Array.from({ length: 5 }, (_, i) =>
      makeProject(`project-${i}`, now),
    );

    const { app } = createApp(projectsData, []);

    const res = await app.request("/projects/export/list?limit=200");
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string }>;
    };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(5);
  });

  it("batches file counts across paginated projects", async () => {
    const projectsData = [
      makeProject("project-a", now),
      makeProject("project-b", new Date(Date.now() - 1000).toISOString()),
    ];

    const filesData: ProjectFile[] = [
      {
        id: "file-1",
        projectId: "project-a",
        path: "a.ts",
        content: "a",
        language: "typescript",
        size: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "file-2",
        projectId: "project-a",
        path: "b.ts",
        content: "b",
        language: "typescript",
        size: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "file-3",
        projectId: "project-b",
        path: "c.ts",
        content: "c",
        language: "typescript",
        size: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const { app } = createApp(projectsData, filesData);

    const res = await app.request("/projects/export/list?limit=1");
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string; fileCount: number }>;
    };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].fileCount).toBeGreaterThan(0);
  });
});
