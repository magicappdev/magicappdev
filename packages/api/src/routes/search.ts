/**
 * Global search routes
 *
 * Provides a unified search endpoint across user content.
 * Template catalogs are static per-platform lists bundled with the
 * web/mobile apps, so they are filtered client-side; this endpoint
 * searches server-side data (projects) that requires auth scoping.
 */

import { and, desc, eq, like, or } from "@magicappdev/database";
import { projects } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const searchRoutes = new Hono<AppContext>();

export const SEARCH_MAX_QUERY_LENGTH = 100;
export const SEARCH_DEFAULT_LIMIT = 20;
export const SEARCH_MAX_LIMIT = 50;

/** Trim and validate a raw search query. Returns null when invalid. */
export function normalizeSearchQuery(raw: string | undefined): string | null {
  const q = (raw || "").trim();
  if (!q || q.length > SEARCH_MAX_QUERY_LENGTH) {
    return null;
  }
  return q;
}

/**
 * Global search across projects
 *
 * Query params:
 *   q     - search term, matched against name/description/slug (required)
 *   limit - max results per type (default 20, max 50)
 */
searchRoutes.get("/", async c => {
  const q = normalizeSearchQuery(c.req.query("q"));
  if (!q) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_QUERY",
          message: "Query param 'q' is required (1-100 characters)",
        },
      },
      400,
    );
  }

  const limit = Math.min(
    Math.max(
      parseInt(c.req.query("limit") || "20", 10) || SEARCH_DEFAULT_LIMIT,
      1,
    ),
    SEARCH_MAX_LIMIT,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;
  const userId = c.var.userId;
  const userRole = c.var.userRole;

  const pattern = `%${q}%`;
  const match = or(
    like(projects.name, pattern),
    like(projects.description, pattern),
    like(projects.slug, pattern),
  );
  const where =
    userRole === "admin"
      ? match
      : and(eq(projects.userId, userId || ""), match);

  const results = await db.query.projects.findMany({
    where,
    orderBy: [desc(projects.updatedAt)],
    limit,
  });

  return c.json({
    success: true,
    data: {
      projects: results.map((p: typeof projects.$inferSelect) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: p.status,
        framework: p.framework,
        updatedAt: p.updatedAt,
      })),
    },
  });
});
