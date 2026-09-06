import type { projectFiles, projects } from "@magicappdev/database";
import { projectFilesRoutes } from "../routes/project-files.js";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

type Project = typeof projects.$inferSelect;
type ProjectFile = typeof projectFiles.$inferSelect;

const now = new Date().toISOString();

const project: Project = {
  id: "project-1",
  userId: "user-1",
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

const file: ProjectFile = {
  id: "file-1",
  projectId: "project-1",
  path: "src/app.ts",
  content: "console.log(1);",
  language: "ts",
  size: 15,
  createdAt: now,
  updatedAt: now,
};

function createApp() {
  const mockDb = {
    query: {
      projects: {
        findFirst: vi.fn(async () => project),
      },
      projectFiles: {
        findFirst: vi.fn(async () => file),
      },
      fileHistory: {
        findMany: vi.fn(async () => []),
      },
    },
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        run: vi.fn(async () => undefined),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async () => undefined),
    })),
  };

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
  app.route("/projects", projectFilesRoutes);

  return { app, mockDb };
}

describe("wildcard file path extraction", () => {
  it("GET file resolves an encoded nested path", async () => {
    const { app, mockDb } = createApp();
    const res = await app.request("/projects/project-1/files/src%2Fapp.ts");
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: ProjectFile };
    expect(json.data.path).toBe("src/app.ts");
    expect(mockDb.query.projectFiles.findFirst).toHaveBeenCalled();
  });

  it("GET file resolves a flat path", async () => {
    const { app } = createApp();
    const res = await app.request("/projects/project-1/files/app.ts");
    expect(res.status).toBe(200);
  });

  it("GET history resolves an encoded nested path", async () => {
    const { app } = createApp();
    const res = await app.request(
      "/projects/project-1/files/src%2Fapp.ts/history",
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: unknown[] };
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("DELETE resolves an encoded nested path", async () => {
    const { app } = createApp();
    const res = await app.request("/projects/project-1/files/src%2Fapp.ts", {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: { path: string };
    };
    expect(json.data).toEqual({ path: "src/app.ts" });
  });
});
