/**
 * Hono app configuration
 */

import { rateLimitMiddleware } from "./middlewares/rate-limit.js";
import { projectFilesRoutes } from "./routes/project-files.js";
import { chatContextRoutes } from "./routes/chat-context.js";
import { createDatabase } from "@magicappdev/database";
import { authMiddleware } from "./middlewares/auth.js";
import { projectsRoutes } from "./routes/projects.js";
import { ticketsRoutes } from "./routes/tickets.js";
import { exportRoutes } from "./routes/export.js";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import type { AppContext } from "./types.js";
import { aiRoutes } from "./routes/ai.js";
import { cors } from "hono/cors";
import { Hono } from "hono";

/** Create the Hono app */
export function createApp() {
  const app = new Hono<AppContext>();

  // CORS middleware
  app.use(
    "*",
    cors({
      origin: origin => {
        const allowedOrigins = [
          "http://localhost:3000",
          "http://localhost:3100",
          "http://localhost:8100", // Standard Ionic Dev
          "https://app.magicappdev.workers.dev",
          "capacitor://localhost",
          "http://localhost",
        ];

        if (!origin) return allowedOrigins[3];

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith(".magicappdev.workers.dev")
        ) {
          return origin;
        }

        // For development, allow all origins if origin is provided
        return origin;
      },
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
      credentials: true,
      maxAge: 86400,
    }),
  );

  // Rate limiting middleware (applies to all routes)
  app.use("*", rateLimitMiddleware);

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

  // Auth routes
  app.use("/auth/me", authMiddleware);
  app.use("/auth/accounts", authMiddleware);
  app.use("/auth/accounts/*", authMiddleware);
  app.use("/auth/api-keys", authMiddleware);
  app.use("/auth/api-keys/*", authMiddleware);
  app.use("/auth/profile", authMiddleware);
  app.use("/auth/change-password", authMiddleware);
  app.use("/auth/account", authMiddleware);
  app.use("/auth/link/*", authMiddleware);
  app.route("/auth", authRoutes);

  // Protected routes
  app.use("/projects*", authMiddleware);
  app.route("/projects", projectsRoutes);
  app.route("/projects", projectFilesRoutes);
  app.route("/projects", exportRoutes);

  app.use("/chat*", authMiddleware);
  app.route("/chat", chatContextRoutes);

  app.use("/ai*", authMiddleware);
  app.route("/ai", aiRoutes);

  app.use("/tickets*", authMiddleware);
  app.route("/tickets", ticketsRoutes);

  app.use("/admin*", authMiddleware);
  app.route("/admin", adminRoutes);

  // Public routes
  app.post("/contact", async c => {
    const { name, email, subject, message } = await c.req.json();
    console.log(`Contact form submission from ${name} (${email}): ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Email would be sent to: dev.magicapp@gmail.com`);
    return c.json({ success: true, message: "Message received" });
  });

  // Error handling
  app.onError((err, c) => {
    console.error("API Error:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: err.message || "An internal error occurred",
          stack: c.env.ENVIRONMENT === "development" ? err.stack : undefined,
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
