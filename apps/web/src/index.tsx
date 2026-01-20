import { Hono } from "hono";

const app = new Hono();

// API routes for the Web app (e.g., local state, proxying, etc.)
app.get("/api/health", c => c.json({ status: "ok", service: "web-worker" }));

export default app;
