/**
 * Admin routes
 */

import {
  adminApiKeys,
  sessions,
  systemLogs,
  tickets,
  users,
} from "@magicappdev/database";
import { and, count, desc, eq, gt, isNull, sql } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const adminRoutes = new Hono<AppContext>();

// Get platform stats
adminRoutes.get("/stats", async c => {
  const userRole = c.get("userRole");
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
    await db
      .select({ value: count() })
      .from(users)
      .where(gt(users.createdAt, thirtyDaysAgoIso))
      .get();

    // Open Tickets
    const ticketCountResult = await db
      .select({ value: count() })
      .from(tickets)
      .where(eq(tickets.status, "open"))
      .get();
    const openTickets = ticketCountResult?.value || 0;

    // Active Sessions
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
        databaseSize: "0.8 MB",
        activeSessions: totalSessions,
      },
    });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// List all users
adminRoutes.get("/users", async c => {
  const userRole = c.get("userRole");
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
  const adminRole = c.get("userRole");
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
    .where(eq(users.id, targetUserId))
    .run();

  return c.json({ success: true });
});

// ==================== Admin API Keys ====================

// Generate a random API key
const generateApiKey = async () => {
  const uuid = crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hash;
};

// Get all admin API keys
adminRoutes.get("/api-keys", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");
  const limit = parseInt(c.req.query("limit") || "100");
  const offset = parseInt(c.req.query("offset") || "0");
  const isActive = c.req.query("isActive");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const active =
      isActive === "true" ? 1 : isActive === "false" ? 0 : undefined;

    const keys = await db
      .select()
      .from(adminApiKeys)
      .where(
        active !== undefined ? eq(adminApiKeys.isActive, active) : undefined,
      )
      .orderBy(desc(adminApiKeys.createdAt))
      .offset(offset)
      .limit(limit)
      .all();

    // Remove sensitive data (full key)
    const sanitizedKeys = keys.map(key => ({
      ...key,
      key: key.keyPrefix,
    }));

    return c.json({ success: true, data: sanitizedKeys, limit, offset });
  } catch (err) {
    console.error("Failed to fetch admin API keys:", err);
    return c.json({ error: "Failed to fetch API keys" }, 500);
  }
});

// Create a new admin API key
adminRoutes.post("/api-keys", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");
  const userId = c.get("userId") as string;

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const body = await c.req.json<{
      name: string;
      description?: string;
      scopes: string[];
      expiresAt?: string;
    }>();

    if (!body.name || !body.scopes || !Array.isArray(body.scopes)) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const apiKey = await generateApiKey();
    const keyPrefix = apiKey.substring(0, 8);

    const newKey = await db
      .insert(adminApiKeys)
      .values({
        id: crypto.randomUUID(),
        name: body.name,
        key: apiKey,
        keyPrefix,
        description: body.description,
        scopes: JSON.stringify(body.scopes),
        createdBy: userId,
        isActive: 1,
      })
      .returning()
      .get();

    return c.json({
      success: true,
      data: {
        ...newKey,
        key: keyPrefix,
      },
    });
  } catch (err) {
    console.error("Failed to create admin API key:", err);
    return c.json({ error: "Failed to create API key" }, 500);
  }
});

// Delete an admin API key
adminRoutes.delete("/api-keys/:id", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const keyId = c.req.param("id");
    await db.delete(adminApiKeys).where(eq(adminApiKeys.id, keyId)).run();
    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to delete admin API key:", err);
    return c.json({ error: "Failed to delete API key" }, 500);
  }
});

// Get system logs
adminRoutes.get("/logs", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");
  const limit = parseInt(c.req.query("limit") || "100");
  const offset = parseInt(c.req.query("offset") || "0");
  const level = c.req.query("level");
  const category = c.req.query("category");
  const userId = c.req.query("userId");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const conditions = [];
    if (level) conditions.push(eq(systemLogs.level, level));
    if (category) conditions.push(eq(systemLogs.category, category));
    if (userId) conditions.push(eq(systemLogs.userId, userId));

    const logs = await db
      .select()
      .from(systemLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(systemLogs.createdAt))
      .offset(offset)
      .limit(limit)
      .all();

    return c.json({ success: true, data: logs, limit, offset });
  } catch (err) {
    console.error("Failed to fetch system logs:", err);
    return c.json({ error: "Failed to fetch logs" }, 500);
  }
});

// Log an event
adminRoutes.post("/logs", async c => {
  const body = await c.req.json<{
    level: "debug" | "info" | "warn" | "error";
    category: string;
    message: string;
    details?: unknown;
    userId?: string;
    metadata?: unknown;
  }>();

  try {
    const db = c.get("db");

    await db.insert(systemLogs).values({
      id: crypto.randomUUID(),
      level: body.level,
      category: body.category,
      message: body.message,
      details: body.details ? JSON.stringify(body.details) : null,
      userId: body.userId || null,
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    });

    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to log event:", err);
    return c.json({ error: "Failed to log event" }, 500);
  }
});

// Get system logs count
adminRoutes.get("/logs/stats", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const totalLogsResult = await db
      .select({ value: count() })
      .from(systemLogs)
      .get();
    const totalLogs = totalLogsResult?.value || 0;

    const counts = await db
      .select({
        level: systemLogs.level,
        count: count(),
      })
      .from(systemLogs)
      .groupBy(systemLogs.level)
      .all();

    return c.json({
      success: true,
      data: {
        totalLogs,
        byLevel: counts.reduce(
          (acc, curr) => {
            acc[curr.level] = curr.count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    });
  } catch (err) {
    console.error("Failed to fetch logs stats:", err);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// ==================== Global Config ====================

// Get global config
adminRoutes.get("/config", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const configResult = await db
      .select()
      .from(adminApiKeys)
      .where(eq(adminApiKeys.name, "global_config"))
      .get();

    const defaultConfig = {
      maintenanceMode: false,
      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000,
      maxConcurrentSessions: 100,
      enableRegistration: true,
      requireEmailVerification: false,
      loginAttemptsLimit: 5,
      sessionExpiryDays: 7,
    };

    if (configResult) {
      try {
        return c.json({
          success: true,
          data: JSON.parse(configResult.keyPrefix),
        });
      } catch {
        return c.json({ success: true, data: defaultConfig });
      }
    }

    return c.json({ success: true, data: defaultConfig });
  } catch (err) {
    console.error("Failed to fetch config:", err);
    return c.json({ error: "Failed to fetch config" }, 500);
  }
});

// Update global config
adminRoutes.put("/config", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const body = await c.req.json<{
      maintenanceMode?: boolean;
      rateLimitPerMinute?: number;
      rateLimitPerHour?: number;
      maxConcurrentSessions?: number;
      enableRegistration?: boolean;
      requireEmailVerification?: boolean;
      loginAttemptsLimit?: number;
      sessionExpiryDays?: number;
    }>();

    const configResult = await db
      .select()
      .from(adminApiKeys)
      .where(eq(adminApiKeys.name, "global_config"))
      .get();

    const currentConfig = configResult
      ? JSON.parse(configResult.keyPrefix)
      : {
          maintenanceMode: false,
          rateLimitPerMinute: 60,
          rateLimitPerHour: 1000,
          maxConcurrentSessions: 100,
          enableRegistration: true,
          requireEmailVerification: false,
          loginAttemptsLimit: 5,
          sessionExpiryDays: 7,
        };

    const newConfig = { ...currentConfig, ...body };

    if (configResult) {
      await db
        .update(adminApiKeys)
        .set({
          keyPrefix: JSON.stringify(newConfig),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(adminApiKeys.id, configResult.id))
        .run();
    } else {
      await db.insert(adminApiKeys).values({
        id: crypto.randomUUID(),
        name: "global_config",
        key: JSON.stringify(newConfig),
        keyPrefix: JSON.stringify(newConfig),
        description: "Global application configuration",
        scopes: JSON.stringify(["read", "write"]),
        isActive: 1,
        createdBy: c.get("userId") as string,
      });
    }

    return c.json({ success: true, data: newConfig });
  } catch (err) {
    console.error("Failed to update config:", err);
    return c.json({ error: "Failed to update config" }, 500);
  }
});

// Get active session count
adminRoutes.get("/config/session-stats", async c => {
  const adminRole = c.get("userRole");
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const currentHourSessions = await db
      .select({ value: count() })
      .from(sessions)
      .where(gt(sessions.createdAt, oneHourAgo.toISOString()))
      .get();

    const activeSessions = await db
      .select({ value: count() })
      .from(sessions)
      .where(
        and(
          isNull(sessions.expiresAt),
          gt(sql`datetime(\${sessions.expiresAt})`, now.toISOString()),
        ),
      )
      .get();

    return c.json({
      success: true,
      data: {
        currentHourSessions: currentHourSessions?.value || 0,
        activeSessions: activeSessions?.value || 0,
      },
    });
  } catch (err) {
    console.error("Failed to fetch session stats:", err);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});
