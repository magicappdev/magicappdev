/**
 * Authentication routes
 */

import { users, sessions } from "@magicappdev/database/schema";
import type { AppContext } from "../types";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { Hono } from "hono";

export const authRoutes = new Hono<AppContext>();

// Helper for hashing passwords (using Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Login
authRoutes.post("/login", async c => {
  const body = await c.req.json<{ email: string; password: string }>();
  const db = c.var.db;

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (!user) {
    return c.json(
      {
        success: false,
        error: { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid credentials" },
      },
      401,
    );
  }

  // Verify password
  const hashedPassword = await hashPassword(body.password);
  if (user.passwordHash !== hashedPassword) {
    return c.json(
      {
        success: false,
        error: { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid credentials" },
      },
      401,
    );
  }

  // Generate tokens
  const accessToken = await sign(
    { sub: user.id, role: "user", exp: Math.floor(Date.now() / 1000) + 60 * 60 }, // 1 hour
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Store session
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    refreshToken,
    expiresAt,
    userAgent: c.req.header("User-Agent"),
    ipAddress: c.req.header("CF-Connecting-IP"),
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
});

// Register
authRoutes.post("/register", async c => {
  const body = await c.req.json<{
    email: string;
    password: string;
    name: string;
  }>();
  const db = c.var.db;

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (existingUser) {
    return c.json(
      {
        success: false,
        error: { code: "AUTH_EMAIL_EXISTS", message: "Email already exists" },
      },
      400,
    );
  }

  // Hash password
  const passwordHash = await hashPassword(body.password);
  const userId = crypto.randomUUID();

  // Create user
  const newUser = await db
    .insert(users)
    .values({
      id: userId,
      email: body.email,
      name: body.name,
      passwordHash,
    })
    .returning()
    .get();

  // Generate tokens
  const accessToken = await sign(
    { sub: userId, role: "user", exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Store session
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: userId,
    refreshToken,
    expiresAt,
    userAgent: c.req.header("User-Agent"),
    ipAddress: c.req.header("CF-Connecting-IP"),
  });

  return c.json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
});

// Refresh token
authRoutes.post("/refresh", async c => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  const db = c.var.db;

  // Find session
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.refreshToken, refreshToken),
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json(
      {
        success: false,
        error: { code: "AUTH_INVALID_TOKEN", message: "Invalid or expired refresh token" },
      },
      401,
    );
  }

  // Generate new access token
  const accessToken = await sign(
    { sub: session.userId, role: "user", exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  return c.json({
    success: true,
    data: {
      accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    },
  });
});

// Logout
authRoutes.post("/logout", async c => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  const db = c.var.db;

  if (refreshToken) {
    await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
  }

  return c.json({ success: true });
});

// Get current user
authRoutes.get("/me", async c => {
  // Middleware should handle this, but placeholder for now
  // In a real app, you'd verify the JWT middleware populated c.var.userId
  return c.json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "Use JWT middleware to get user" },
  });
});
