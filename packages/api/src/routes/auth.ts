/**
 * Authentication routes
 */

import { Hono } from "hono";
import type { AppContext } from "../types";

export const authRoutes = new Hono<AppContext>();

// Login
authRoutes.post("/login", async c => {
  const body = await c.req.json<{ email: string; password: string }>();

  // TODO: Implement actual authentication
  // For now, return a placeholder response
  return c.json({
    success: true,
    data: {
      user: {
        id: "placeholder-user-id",
        email: body.email,
        name: "Test User",
      },
      accessToken: "placeholder-access-token",
      refreshToken: "placeholder-refresh-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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

  // TODO: Implement actual registration
  return c.json({
    success: true,
    data: {
      user: {
        id: "new-user-id",
        email: body.email,
        name: body.name,
      },
      accessToken: "placeholder-access-token",
      refreshToken: "placeholder-refresh-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
});

// Refresh token
authRoutes.post("/refresh", async c => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();

  // TODO: Implement token refresh using refreshToken
  console.log("Refreshing token:", refreshToken.substring(0, 10) + "...");

  return c.json({
    success: true,
    data: {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
});

// Logout
authRoutes.post("/logout", async c => {
  // TODO: Invalidate refresh token
  return c.json({ success: true });
});

// Get current user
authRoutes.get("/me", async c => {
  // TODO: Get user from JWT token
  return c.json({
    success: true,
    data: {
      id: "current-user-id",
      email: "user@example.com",
      name: "Current User",
    },
  });
});
