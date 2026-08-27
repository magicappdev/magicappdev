/**
 * AI Keys management routes
 */

import { encryptApiKey } from "../utils/encryption.js";
import { userAiKeys } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";

export const aiKeysRoutes = new Hono<AppContext>();

// Get all AI keys for the authenticated user
aiKeysRoutes.get("/", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      },
      401,
    );
  }

  try {
    const keys = await db
      .select({
        id: userAiKeys.id,
        provider: userAiKeys.provider,
        baseUrl: userAiKeys.baseUrl,
        modelName: userAiKeys.modelName,
        isDefault: userAiKeys.isDefault,
        createdAt: userAiKeys.createdAt,
        updatedAt: userAiKeys.updatedAt,
      })
      .from(userAiKeys)
      .where(eq(userAiKeys.userId, userId));

    return c.json({
      success: true,
      data: { keys },
    });
  } catch (error) {
    console.error("List AI Keys Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch AI keys",
        },
      },
      500,
    );
  }
});

// Add or update an AI key
aiKeysRoutes.post("/", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      },
      401,
    );
  }

  const body = await c.req.json<{
    provider: string;
    apiKey: string;
    baseUrl?: string;
    modelName?: string;
    isDefault?: boolean;
  }>();

  const { provider, apiKey, baseUrl, modelName, isDefault = false } = body;

  if (!provider || !apiKey) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Provider and apiKey are required",
        },
      },
      400,
    );
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const encryptionSecret =
      c.env.AI_KEY_ENCRYPTION_SECRET || c.env.JWT_SECRET || "fallback-secret";
    const encryptedApiKey = await encryptApiKey(apiKey, encryptionSecret);

    if (isDefault) {
      await db
        .update(userAiKeys)
        .set({ isDefault: false, updatedAt: now })
        .where(eq(userAiKeys.userId, userId));
    }

    await db.insert(userAiKeys).values({
      id,
      userId,
      provider,
      apiKey: encryptedApiKey,
      baseUrl: baseUrl || null,
      modelName: modelName || null,
      isDefault,
      createdAt: now,
      updatedAt: now,
    });

    return c.json({
      success: true,
      data: {
        id,
        provider,
        baseUrl: baseUrl || null,
        modelName: modelName || null,
        isDefault,
      },
    });
  } catch (error) {
    console.error("Create AI Key Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to save AI key",
        },
      },
      500,
    );
  }
});

// Delete an AI key
aiKeysRoutes.delete("/:id", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");
  const keyId = c.req.param("id");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      },
      401,
    );
  }

  try {
    await db
      .delete(userAiKeys)
      .where(and(eq(userAiKeys.id, keyId), eq(userAiKeys.userId, userId)));

    return c.json({
      success: true,
      data: { message: "AI key deleted successfully" },
    });
  } catch (error) {
    console.error("Delete AI Key Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete AI key",
        },
      },
      500,
    );
  }
});
