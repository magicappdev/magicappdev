/**
 * Admin routes
 */

import { users, tickets, sessions } from "@magicappdev/database";
import { eq, desc, count, gt } from "drizzle-orm";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const adminRoutes = new Hono<AppContext>();

// Get platform stats
adminRoutes.get("/stats", async c => {
  const userRole = c.get("userRole") as string;
  const db = c.get("db");

  if (userRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    // Total Users
    const userCountResult = await db
      .select({ value: count() })
      .from(users)
      .get();
    const totalUsers = userCountResult?.value || 0;

    // New Users (last 30 days)
    // Note: Drizzle with D1/SQLite might need a custom query for date comparison if iso strings are used
    const newUsersResult = await db
      .select({ value: count() })
      .from(users)
      .where(gt(users.createdAt, thirtyDaysAgoIso))
      .get();
    const newUsers = newUsersResult?.value || 0;
    const growth =
      totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;

    // Open Tickets
    const ticketCountResult = await db
      .select({ value: count() })
      .from(tickets)
      .where(eq(tickets.status, "open"))
      .get();
    const openTickets = ticketCountResult?.value || 0;

    // Active Sessions (all-time for now, or could filter by expiresAt)
    const activeSessionsResult = await db
      .select({ value: count() })
      .from(sessions)
      .get();
    const totalSessions = activeSessionsResult?.value || 0;

    return c.json({
      success: true,
      data: {
        totalUsers,
        openTickets,
        databaseSize: "0.8 MB", // Mocked as D1 doesn't expose this yet
        activeSessions: totalSessions,
        userGrowth: `+${growth}%`,
        ticketUrgency: `${openTickets} high priority`,
      },
    });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

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
