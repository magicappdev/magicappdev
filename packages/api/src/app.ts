/**
 * Hono app configuration
 */

import { createDatabase } from "@magicappdev/database";
import { projectsRoutes } from "./routes/projects";
import { authRoutes } from "./routes/auth";
import type { AppContext } from "./types";
import { aiRoutes } from "./routes/ai";
import { cors } from "hono/cors";
import { Hono } from "hono";

/** Create the Hono app */
export function createApp() {
  const app = new Hono<AppContext>();

  // CORS middleware
  app.use(
    "*",
    cors({
      origin: ["http://localhost:3000", "https://*.magicappdev.workers.dev"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  // Database middleware - initialize database client
  app.use("*", async (c, next) => {
    const db = createDatabase(c.env.DB);
    c.set("db", db);
    await next();
  });

  // Health check
  app.get("/", c => {
    return c.json({
      name: "MagicAppDev API",
      version: "0.0.1",
      status: "ok",
      environment: c.env.ENVIRONMENT,
    });
  });

  app.get("/health", c => {
    return c.json({ status: "healthy" });
  });

  // Mount routes
  app.route("/auth", authRoutes);
  app.route("/projects", projectsRoutes);
  app.route("/ai", aiRoutes);

  // Error handling
  app.onError((err, c) => {
    console.error("API Error:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            c.env.ENVIRONMENT === "development"
              ? err.message
              : "An internal error occurred",
        },
      },
      500,
    );
  });

  // 404 handler
  app.notFound(c => {
    return c.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The requested resource was not found",
        },
      },
      404,
    );
  });

  return app;
}
