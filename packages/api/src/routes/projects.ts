/**
 * Projects routes
 */

import { projects, PROJECT_STATUS } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";

export const projectsRoutes = new Hono<AppContext>();

// List projects
projectsRoutes.get("/", async c => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const userId = c.var.userId;
  const userRole = c.var.userRole;

  const results = await db.query.projects.findMany({
    limit,
    offset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: [desc((projects as any).updatedAt)],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: userRole === "admin" ? undefined : eq((projects as any).userId, userId),
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
  const userId = c.var.userId;
  const userRole = c.var.userRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const project = await db.query.projects.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projects as any).id, id),
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

  // Check ownership
  if (userRole !== "admin" && project.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const id = crypto.randomUUID();
  const baseSlug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Add a small random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 7);
  const slug = `${baseSlug}-${suffix}`;

  // Use body.userId if provided (for testing), or fallback to context user
  const userId = body.userId || c.var.userId || "placeholder-user-id";

  try {
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
        config: body.config || {},
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
  } catch (err) {
    console.error("Database error creating project:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create project";

    if (message.includes("UNIQUE constraint failed")) {
      return c.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "A project with this name or slug already exists",
          },
        },
        409,
      );
    }

    return c.json(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: `Database error: ${message}`,
        },
      },
      500,
    );
  }
});

// Update project
projectsRoutes.patch("/:id", async c => {
  const id = c.req.param("id");
  const userId = c.var.userId;
  const userRole = c.var.userRole;
  const body = await c.req.json<{
    name?: string;
    description?: string;
    status?: (typeof PROJECT_STATUS)[number];
    config?: Record<string, unknown>;
  }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  // Verify existence
  const existing = await db.query.projects.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projects as any).id, id),
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

  // Check ownership
  if (userRole !== "admin" && existing.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((projects as any).id, id))
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
  const userId = c.var.userId;
  const userRole = c.var.userRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  // Verify existence
  const existing = await db.query.projects.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projects as any).id, id),
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

  // Check ownership
  if (userRole !== "admin" && existing.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
    );
  }

  await db
    .delete(projects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((projects as any).id, id))
    .run();

  return c.json({ success: true, data: { id } });
});
