import { rateLimitMiddleware } from "../middlewares/rate-limit.js";
import { describe, it, expect, vi } from "vitest";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

type MockKV = {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

function createMockKV(): MockKV {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

function setupApp(overrides: Record<string, unknown> = {}) {
  const mockKv = createMockKV();
  const app = new Hono<AppContext>();

  app.use("*", async (c, next) => {
    c.env = {
      DB: {} as AppContext["Bindings"]["DB"],
      AI: {} as AppContext["Bindings"]["AI"],
      ENVIRONMENT: "test",
      JWT_SECRET: "test-jwt",
      RATE_LIMIT_KV:
        mockKv as unknown as AppContext["Bindings"]["RATE_LIMIT_KV"],
      ADMIN_API_KEYS: "",
      ...overrides,
    } as AppContext["Bindings"];
    await next();
  });

  app.use("*", rateLimitMiddleware);
  app.get("/test", c => c.json({ success: true }));
  app.post("/auth/login", c => c.json({ success: true }));
  app.get("/admin/test", c => c.json({ success: true }));

  return { app, mockKv };
}

describe("rateLimitMiddleware", () => {
  it("allows requests under the limit", async () => {
    const { app } = setupApp();
    const res = await app.request("/test", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
  });

  it("blocks requests over the default limit", async () => {
    const { app } = setupApp();
    for (let i = 0; i < 100; i++) {
      const res = await app.request("/test", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (i < 99) {
        expect(res.status).toBe(200);
      }
    }

    const blocked = await app.request("/test", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(blocked.status).toBe(429);
    const json = (await blocked.json()) as {
      success: boolean;
      error: { code: string };
    };
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("returns rate limit headers", async () => {
    const { app } = setupApp();
    const res = await app.request("/test", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).not.toBeNull();
    expect(res.headers.get("X-RateLimit-Reset")).not.toBeNull();
  });

  it("skips rate limiting when KV is not configured", async () => {
    const { app } = setupApp({ RATE_LIMIT_KV: undefined });
    const res = await app.request("/test", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);
  });

  it("applies lower limits to auth routes", async () => {
    const { app } = setupApp();
    for (let i = 0; i < 10; i++) {
      const res = await app.request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (i < 9) {
        expect(res.status).toBe(200);
      }
    }

    const blocked = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(blocked.status).toBe(429);
  });

  it("bypasses rate limiting for admin API keys", async () => {
    const { app } = setupApp({ ADMIN_API_KEYS: "valid-admin-key" });
    for (let i = 0; i < 50; i++) {
      const res = await app.request("/admin/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "valid-admin-key",
        },
      });
      expect(res.status).toBe(200);
    }
  });
});
