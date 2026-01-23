/**
 * Admin routes
 */

import { users } from "@magicappdev/database";
import type { AppContext } from "../types";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";

export const adminRoutes = new Hono<AppContext>();

// List all users
adminRoutes.get("/users", async c => {
  const userRole = c.get("userRole") as string;
  const db = c.get("db");

  if (userRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();

  return c.json({ success: true, data: allUsers });
});

// Update user role
adminRoutes.patch("/users/:id/role", async c => {
  const adminRole = c.get("userRole") as string;
  const db = c.get("db");
  const targetUserId = c.req.param("id");
  const { role } = await c.req.json();

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (!["admin", "user"].includes(role)) {
    return c.json({ error: "Invalid role" }, 400);
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(users.id, targetUserId));

  return c.json({ success: true });
});
