/**
 * Projects routes
 */

import { Hono } from "hono";
import type { AppContext } from "../types";

export const projectsRoutes = new Hono<AppContext>();

// List projects
projectsRoutes.get("/", async c => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");

  // TODO: Implement actual database query
  return c.json({
    success: true,
    data: {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    },
  });
});

// Get project by ID
projectsRoutes.get("/:id", async c => {
  const id = c.req.param("id");

  // TODO: Implement actual database query
  return c.json({
    success: true,
    data: {
      id,
      name: "Sample Project",
      slug: "sample-project",
      status: "draft",
      framework: "expo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
});

// Create project
projectsRoutes.post("/", async c => {
  const body = await c.req.json<{
    name: string;
    description?: string;
    config: Record<string, unknown>;
  }>();

  // TODO: Implement actual database insert
  const id = crypto.randomUUID();
  const slug = body.name.toLowerCase().replace(/\s+/g, "-");

  return c.json(
    {
      success: true,
      data: {
        id,
        name: body.name,
        slug,
        description: body.description,
        status: "draft",
        config: body.config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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
    status?: string;
    config?: Record<string, unknown>;
  }>();

  // TODO: Implement actual database update
  return c.json({
    success: true,
    data: {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    },
  });
});

// Delete project
projectsRoutes.delete("/:id", async c => {
  const id = c.req.param("id");

  // TODO: Implement actual database delete
  console.log("Deleting project:", id);

  return c.json({ success: true, data: { id } });
});
