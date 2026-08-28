import { describe, it, expect, vi, beforeEach } from "vitest";
import type { userAiKeys } from "@magicappdev/database";
import { encryptApiKey } from "../utils/encryption.js";
import { aiKeysRoutes } from "../routes/ai-keys.js";
import type { AppContext } from "../types.js";
import { aiRoutes } from "../routes/ai.js";
import { Hono } from "hono";

type StoredAiKey = typeof userAiKeys.$inferInsert;

// Mock database
vi.mock("@magicappdev/database", () => ({
  userAiKeys: {
    id: "id",
    userId: "userId",
    provider: "provider",
    apiKey: "apiKey",
    baseUrl: "baseUrl",
    modelName: "modelName",
    isDefault: "isDefault",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
}));

describe("AI Keys & BYOK Proxy Unit/Integration Tests", () => {
  let app: Hono<AppContext>;
  let storedKeys: StoredAiKey[] = [];

  beforeEach(() => {
    storedKeys = [];
    const mockDb = {
      select: () => ({
        from: () => ({
          where: async () => storedKeys,
        }),
      }),
      insert: () => ({
        values: async (val: StoredAiKey) => {
          storedKeys.push(val);
          return true;
        },
      }),
      update: () => ({
        set: () => ({
          where: async () => true,
        }),
      }),
      delete: () => ({
        where: async () => true,
      }),
    };

    app = new Hono<AppContext>();
    app.use("*", async (c, next) => {
      c.set("db", mockDb as unknown as AppContext["Variables"]["db"]);
      c.set("userId", "test-user-id");
      c.env = {
        DB: {} as AppContext["Bindings"]["DB"],
        AI: {} as AppContext["Bindings"]["AI"],
        ENVIRONMENT: "test",
        JWT_SECRET: "test-jwt",
        AI_KEY_ENCRYPTION_SECRET: "test-secret",
      } as AppContext["Bindings"];
      await next();
    });
    app.route("/ai-keys", aiKeysRoutes);
    app.route("/ai", aiRoutes);
  });

  it("should successfully create and encrypt an AI key", async () => {
    const res = await app.request("/ai-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "openai",
        apiKey: "sk-test-1234567890",
        modelName: "gpt-4o",
        isDefault: true,
      }),
    });

    const json = (await res.json()) as {
      success: boolean;
      data: { provider: string };
    };
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.provider).toBe("openai");
    expect(storedKeys.length).toBe(1);
    expect(storedKeys[0].apiKey).not.toBe("sk-test-1234567890");
  });

  it("should list AI keys for authenticated user", async () => {
    storedKeys.push({
      id: "key-1",
      userId: "test-user-id",
      provider: "openai",
      apiKey: "encrypted-key",
      baseUrl: null,
      modelName: "gpt-4o",
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.request("/ai-keys");
    const json = (await res.json()) as {
      success: boolean;
      data: { keys: Array<{ provider: string }> };
    };
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.keys.length).toBe(1);
    expect(json.data.keys[0].provider).toBe("openai");
  });

  it("should handle BYOK chat completion routing", async () => {
    const encrypted = await encryptApiKey("sk-test-key", "test-secret");

    storedKeys.push({
      id: "key-1",
      userId: "test-user-id",
      provider: "openai",
      apiKey: encrypted,
      baseUrl: "https://api.openai.com/v1",
      modelName: "gpt-4o",
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello from OpenAI BYOK!" } }],
      }),
    } as unknown as Response);

    const res = await app.request("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "openai",
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    const json = (await res.json()) as {
      success: boolean;
      data: { message: { content: string } };
    };
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message.content).toBe("Hello from OpenAI BYOK!");

    globalThis.fetch = originalFetch;
  });
});
