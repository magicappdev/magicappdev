import { normalizeSearchQuery, searchRoutes } from "../routes/search.js";
import type { projects } from "@magicappdev/database";
import { describe, expect, it, vi } from "vitest";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

type Project = typeof projects.$inferSelect;

function createApp(projectsData: Project[]) {
  const findMany = vi.fn(async (): Promise<Project[]> => projectsData);
  const mockDb = {
    query: {
      projects: { findMany },
    },
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

  app.route("/search", searchRoutes);

  return { app, findMany };
}

describe("normalizeSearchQuery", () => {
  it("trims whitespace", () => {
    expect(normalizeSearchQuery("  demo  ")).toBe("demo");
  });

  it("rejects missing or blank queries", () => {
    expect(normalizeSearchQuery(undefined)).toBeNull();
    expect(normalizeSearchQuery("")).toBeNull();
    expect(normalizeSearchQuery("   ")).toBeNull();
  });

  it("rejects queries over 100 characters", () => {
    expect(normalizeSearchQuery("a".repeat(101))).toBeNull();
    expect(normalizeSearchQuery("a".repeat(100))).toBe("a".repeat(100));
  });
});

describe("GET /search", () => {
  const now = new Date().toISOString();

  const makeProject = (id: string, name: string): Project => ({
    id,
    userId: "user-1",
    name,
    slug: id,
    description: `${name} description`,
    status: "active",
    framework: "next",
    templateId: null,
    config: null,
    githubUrl: null,
    deploymentUrl: null,
    createdAt: now,
    updatedAt: now,
  });

  it("returns 400 when q is missing or blank", async () => {
    const { app } = createApp([]);

    for (const path of ["/search", "/search?q=", "/search?q=++"]) {
      const res = await app.request(path);
      expect(res.status).toBe(400);
      const json = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_QUERY");
    }
  });

  it("returns project summaries matching the query shape", async () => {
    const { app } = createApp([makeProject("project-1", "Demo App")]);

    const res = await app.request("/search?q=demo");
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: {
        projects: Array<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          status: string;
          framework: string;
          updatedAt: string;
        }>;
      };
    };

    expect(json.success).toBe(true);
    expect(json.data.projects).toHaveLength(1);
    expect(json.data.projects[0]).toMatchObject({
      id: "project-1",
      name: "Demo App",
      slug: "project-1",
    });
  });

  it("caps the limit at 50", async () => {
    const { app, findMany } = createApp([]);

    const res = await app.request("/search?q=demo&limit=200");
    expect(res.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("scopes results to the current user", async () => {
    const { app, findMany } = createApp([]);

    await app.request("/search?q=demo");
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.anything() }),
    );
  });
});
