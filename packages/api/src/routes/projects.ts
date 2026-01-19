/**
 * Projects routes
 */

import { projects, PROJECT_STATUS, PROJECT_FRAMEWORK } from "@magicappdev/database/schema";
import type { AppContext } from "../types";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";

export const projectsRoutes = new Hono<AppContext>();

// List projects
projectsRoutes.get("/", async c => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = (page - 1) * limit;
  const db = c.var.db;

  // TODO: Filter by userId from context once auth middleware is active
  // const userId = c.var.userId;

  const results = await db.query.projects.findMany({
    limit,
    offset,
    orderBy: [desc(projects.updatedAt)],
    // where: eq(projects.userId, userId),
  });

  // Get total count (simplified for now)
  // const total = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));

  return c.json({
    success: true,
    data: {
      data: results,
      pagination: {
        page,
        limit,
        total: results.length, // Placeholder
        totalPages: 1, // Placeholder
        hasMore: false,
      },
    },
  });
});

// Get project by ID
projectsRoutes.get("/:id", async c => {
  const id = c.req.param("id");
  const db = c.var.db;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: project,
  });
});

// Create project
projectsRoutes.post("/", async c => {
  const body = await c.req.json<{
    name: string;
    description?: string;
    config: Record<string, unknown>;
    userId: string; // Temporary: explicit userId until auth middleware
  }>();
  const db = c.var.db;

  const id = crypto.randomUUID();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Use body.userId if provided (for testing), or fallback to context user
  const userId = body.userId || c.var.userId || "placeholder-user-id";

  const newProject = await db
    .insert(projects)
    .values({
      id,
      userId,
      name: body.name,
      slug,
      description: body.description,
      status: "draft",
      framework: "expo", // Default
      config: body.config,
    })
    .returning()
    .get();

  return c.json(
    {
      success: true,
      data: newProject,
    },
    201,
  );
});

// Update project
projectsRoutes.patch("/:id", async c => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    name?: string;
    description?: string;
    status?: typeof PROJECT_STATUS[number];
    config?: Record<string, unknown>;
  }>();
  const db = c.var.db;

  // Verify existence
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      },
      404,
    );
  }

  const updatedProject = await db
    .update(projects)
    .set({
      name: body.name,
      description: body.description,
      status: body.status,
      config: body.config,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id))
    .returning()
    .get();

  return c.json({
    success: true,
    data: updatedProject,
  });
});

// Delete project
projectsRoutes.delete("/:id", async c => {
  const id = c.req.param("id");
  const db = c.var.db;

  const result = await db.delete(projects).where(eq(projects.id, id)).returning().get();

  if (!result) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      },
      404,
    );
  }

  return c.json({ success: true, data: { id } });
});
