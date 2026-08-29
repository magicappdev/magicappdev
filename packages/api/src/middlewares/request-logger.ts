/**
 * Structured JSON request logging middleware
 */

import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types.js";

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  durationMs?: number;
  error?: {
    code: string;
    message: string;
  };
}

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export const requestLoggerMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const start = Date.now();
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: c.req.method,
      url: sanitizeUrl(c.req.url),
      userAgent: c.req.header("User-Agent") || undefined,
      ip: c.req.header("CF-Connecting-IP") || undefined,
      userId: c.get("userId") || undefined,
    };

    try {
      await next();
      entry.status = c.res.status;
      entry.durationMs = Date.now() - start;

      const logLine = JSON.stringify(entry);
      console.log(logLine);

      return;
    } catch (err) {
      entry.status = 500;
      entry.durationMs = Date.now() - start;
      entry.error = {
        code: "MIDDLEWARE_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      };

      const logLine = JSON.stringify(entry);
      console.error(logLine);

      throw err;
    }
  },
);
