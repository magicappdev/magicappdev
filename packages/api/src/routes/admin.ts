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
import { and, count, desc, eq, gt, isNull, sql } from "drizzle-orm";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

// Crypto polyfill for Cloudflare Workers
const crypto = globalThis.crypto as Required<typeof globalThis.crypto>;

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
  const adminRole = c.get("userRole") as string;
  const db = c.get("db");
  const limit = parseInt(c.req.query("limit") || "100");
  const offset = parseInt(c.req.query("offset") || "0");
  const isActive = c.req.query("isActive");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    // Build base query
    const baseQuery = db
      .select()
      .from(adminApiKeys)
      .orderBy(desc(adminApiKeys.createdAt));

    // Apply filters and pagination
    let keys;
    if (isActive !== undefined) {
      const active = isActive === "true" ? 1 : 0;
      keys = await baseQuery
        .where(eq(adminApiKeys.isActive, active))
        .offset(offset)
        .limit(limit)
        .all();
    } else {
      keys = await baseQuery.offset(offset).limit(limit).all();
    }

    // Remove sensitive data (full key)
    const sanitizedKeys = keys.map(key => ({
      ...key,
      key: key.keyPrefix, // Only show prefix
    }));

    return c.json({ success: true, data: sanitizedKeys, limit, offset });
  } catch (err) {
    console.error("Failed to fetch admin API keys:", err);
    return c.json({ error: "Failed to fetch API keys" }, 500);
  }
});

// Create a new admin API key
adminRoutes.post("/api-keys", async c => {
  const adminRole = c.get("userRole") as string;
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
        name: body.name,
        key: apiKey, // Store the actual key (consider encryption for production)
        keyPrefix,
        description: body.description,
        scopes: JSON.stringify(body.scopes), // Store as JSON string
        createdBy: userId,
        isActive: 1,
      })
      .returning()
      .get();

    return c.json({
      success: true,
      data: {
        ...newKey,
        key: keyPrefix, // Don't return the full key
      },
    });
  } catch (err) {
    console.error("Failed to create admin API key:", err);
    return c.json({ error: "Failed to create API key" }, 500);
  }
});

// Delete an admin API key
adminRoutes.delete("/api-keys/:id", async c => {
  const adminRole = c.get("userRole") as string;
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const keyId = c.req.param("id");

    await db.delete(adminApiKeys).where(eq(adminApiKeys.id, keyId));

    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to delete admin API key:", err);
    return c.json({ error: "Failed to delete API key" }, 500);
  }
});

// Get system logs
adminRoutes.get("/logs", async c => {
  const adminRole = c.get("userRole") as string;
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
    // Build base query
    const baseQuery = db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.createdAt));

    // Build filter conditions
    const conditions = [];
    if (level) {
      conditions.push(eq(systemLogs.level, level));
    }
    if (category) {
      conditions.push(eq(systemLogs.category, category));
    }
    if (userId) {
      conditions.push(eq(systemLogs.userId, userId));
    }

    // Apply filters and pagination
    let logs;
    if (conditions.length > 0) {
      logs = await baseQuery
        .where(and(...conditions))
        .offset(offset)
        .limit(limit)
        .all();
    } else {
      logs = await baseQuery.offset(offset).limit(limit).all();
    }

    return c.json({ success: true, data: logs, limit, offset });
  } catch (err) {
    console.error("Failed to fetch system logs:", err);
    return c.json({ error: "Failed to fetch logs" }, 500);
  }
});

// Log an event (public endpoint that logs without auth)
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
  const adminRole = c.get("userRole") as string;
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

    // Count by level
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
  const adminRole = c.get("userRole") as string;
  const db = c.get("db");

  if (adminRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    // Get current config values
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
          data: JSON.parse(configResult.keyPrefix), // Store JSON in keyPrefix field for simplicity
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
  const adminRole = c.get("userRole") as string;
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
      // Update existing config
      await db
        .update(adminApiKeys)
        .set({
          keyPrefix: JSON.stringify(newConfig),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(adminApiKeys.id, configResult.id));
    } else {
      // Create new config
      await db.insert(adminApiKeys).values({
        name: "global_config",
        key: JSON.stringify(newConfig),
        keyPrefix: JSON.stringify(newConfig), // For simplicity, store as JSON string
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

// Get active session count (for rate limiting)
adminRoutes.get("/config/session-stats", async c => {
  const adminRole = c.get("userRole") as string;
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
          gt(sql`${sessions.expiresAt}`, now.toISOString()),
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
