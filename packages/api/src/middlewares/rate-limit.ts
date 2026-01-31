/**
 * Rate limiting middleware
 * Uses Cloudflare KV for distributed rate limiting
 */

import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types.js";
import type { Context } from "hono";

interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  default: { requests: 100, window: 60 }, // 100 requests per minute
  auth: { requests: 10, window: 60 }, // 10 auth requests per minute
  ai: { requests: 20, window: 60 }, // 20 AI requests per minute
  projects: { requests: 50, window: 60 }, // 50 project requests per minute
  admin: { requests: 30, window: 60 }, // 30 admin requests per minute
};

function getEndpointKey(url: string): string {
  if (url.startsWith("/auth")) return "auth";
  if (url.startsWith("/ai")) return "ai";
  if (url.startsWith("/projects")) return "projects";
  if (url.startsWith("/admin")) return "admin";
  return "default";
}

function getClientIdentifier(
  c: Context<AppContext, string, Record<string, unknown>>,
): string {
  // Check for admin API key bypass
  const apiKey = c.req.header("X-API-Key");
  if (apiKey) {
    // Admin API keys bypass rate limiting
    const adminKeys = c.env.ADMIN_API_KEYS?.split(",") || [];
    if (adminKeys.includes(apiKey)) {
      return "admin-bypass";
    }
  }

  // Use userId for authenticated requests
  const userId = c.get("userId");
  if (userId) {
    return userId;
  }

  // Fall back to IP address
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For") ||
    "unknown";
  return ip;
}

async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowEnd = windowStart + windowMs;

  const counterKey = `ratelimit:${key}:${windowStart}`;
  const current = await kv.get(counterKey);

  const count = current ? parseInt(current, 10) : 0;

  if (count >= config.requests) {
    return {
      allowed: false,
      remaining: 0,
      reset: windowEnd,
    };
  }

  const newCount = count + 1;
  await kv.put(counterKey, newCount.toString(), {
    expirationTtl: config.window,
  });

  return {
    allowed: true,
    remaining: config.requests - newCount,
    reset: windowEnd,
  };
}

export const rateLimitMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const endpointKey = getEndpointKey(c.req.url);
    const config = DEFAULT_LIMITS[endpointKey] || DEFAULT_LIMITS.default;

    // Check for admin bypass
    const apiKey = c.req.header("X-API-Key");
    if (apiKey) {
      const adminKeys = c.env.ADMIN_API_KEYS?.split(",") || [];
      if (adminKeys.includes(apiKey)) {
        console.log("[Rate Limit] Admin API key bypass");
        c.header("X-RateLimit-Limit", config.requests.toString());
        c.header("X-RateLimit-Remaining", config.requests.toString());
        c.header(
          "X-RateLimit-Reset",
          (Date.now() + config.window * 1000).toString(),
        );
        return await next();
      }
    }

    const clientKey = getClientIdentifier(c);
    const kv = c.env.RATE_LIMIT_KV;

    if (!kv) {
      console.warn(
        "[Rate Limit] KV namespace not configured, skipping rate limit",
      );
      return await next();
    }

    const result = await checkRateLimit(kv, clientKey, config);

    c.header("X-RateLimit-Limit", config.requests.toString());
    c.header("X-RateLimit-Remaining", result.remaining.toString());
    c.header("X-RateLimit-Reset", result.reset.toString());

    if (!result.allowed) {
      console.log(
        `[Rate Limit] Blocked request from ${clientKey} to ${c.req.url}`,
      );
      return c.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        429,
      );
    }

    console.log(
      `[Rate Limit] Allowed request from ${clientKey} to ${c.req.url} (${result.remaining}/${config.requests} remaining)`,
    );

    return await next();
  },
);

export { DEFAULT_LIMITS };
export type { RateLimitConfig };
