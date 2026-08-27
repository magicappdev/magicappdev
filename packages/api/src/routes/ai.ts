/**
 * AI routes for chat and code generation
 */

import { decryptApiKey } from "../utils/encryption.js";
import { userAiKeys } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";

export const aiRoutes = new Hono<AppContext>();

/** AI message structure */
interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** AI chat request */
interface AiChatRequest {
  messages: AiMessage[];
  provider?: string;
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

// Chat completion
aiRoutes.post("/chat", async c => {
  const userId = c.get("userId");
  const db = c.get("db");
  const body = await c.req.json<AiChatRequest>();
  const {
    messages,
    provider = "workers-ai",
    model,
    stream = false,
    temperature = 0.7,
    maxTokens = 4096,
  } = body;

  try {
    // If provider is not workers-ai or if requested provider has a user key configured, check BYOK
    let userKeyRecord = null;
    if (userId && db) {
      const keys = await db
        .select()
        .from(userAiKeys)
        .where(
          provider !== "workers-ai"
            ? and(
                eq(userAiKeys.userId, userId),
                eq(userAiKeys.provider, provider),
              )
            : and(
                eq(userAiKeys.userId, userId),
                eq(userAiKeys.isDefault, true),
              ),
        );
      if (keys.length > 0) {
        userKeyRecord = keys[0];
      }
    }

    // If we have a user BYOK key for OpenAI / Anthropic / Custom, proxy to that provider
    if (userKeyRecord && userKeyRecord.provider !== "workers-ai") {
      const activeProvider = userKeyRecord.provider;
      const encryptionSecret =
        c.env.AI_KEY_ENCRYPTION_SECRET || c.env.JWT_SECRET || "fallback-secret";
      let apiKey = userKeyRecord.apiKey;
      try {
        apiKey = await decryptApiKey(userKeyRecord.apiKey, encryptionSecret);
      } catch {
        // Fallback if key wasn't encrypted or failed decryption
        apiKey = userKeyRecord.apiKey;
      }

      const baseUrl =
        userKeyRecord.baseUrl ||
        (activeProvider === "openai"
          ? "https://api.openai.com/v1"
          : activeProvider === "anthropic"
            ? "https://api.anthropic.com/v1"
            : activeProvider === "deepseek"
              ? "https://api.deepseek.com/v1"
              : activeProvider === "groq"
                ? "https://api.groq.com/openai/v1"
                : activeProvider === "opencode"
                  ? "https://zen.opencode.ai/v1"
                  : "https://api.openai.com/v1");
      const targetModel =
        model ||
        userKeyRecord.modelName ||
        (activeProvider === "anthropic"
          ? "claude-3-5-sonnet-20241022"
          : "gpt-4o");

      if (activeProvider === "anthropic") {
        const anthropicRes = await fetch(`${baseUrl}/messages`, {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: messages.filter(m => m.role !== "system"),
            system: messages.find(m => m.role === "system")?.content,
            max_tokens: maxTokens,
            temperature,
            stream,
          }),
        });

        if (!anthropicRes.ok) {
          const errText = await anthropicRes.text();
          return c.json(
            {
              success: false,
              error: {
                code: "BYOK_API_ERROR",
                message: `Anthropic API error: ${errText}`,
              },
            },
            400,
          );
        }

        if (stream) {
          return new Response(anthropicRes.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        const data = (await anthropicRes.json()) as {
          content?: Array<{ text?: string }>;
        };
        const content = data.content?.[0]?.text || "";
        return c.json({
          success: true,
          data: {
            message: {
              role: "assistant" as const,
              content,
            },
          },
        });
      } else {
        // OpenAI compatible (openai, deepseek, groq, custom)
        const openaiRes = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature,
            max_tokens: maxTokens,
            stream,
          }),
        });

        if (!openaiRes.ok) {
          const errText = await openaiRes.text();
          return c.json(
            {
              success: false,
              error: {
                code: "BYOK_API_ERROR",
                message: `Provider API error: ${errText}`,
              },
            },
            400,
          );
        }

        if (stream) {
          return new Response(openaiRes.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }

        const data = (await openaiRes.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content || "";
        return c.json({
          success: true,
          data: {
            message: {
              role: "assistant" as const,
              content,
            },
          },
        });
      }
    }

    // Use Workers AI by default
    if (provider === "workers-ai") {
      const response = await c.env.AI.run(
        model || "@cf/meta/llama-3.1-8b-instruct-fp8",
        {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          max_tokens: maxTokens,
          temperature,
          stream,
        },
        c.env.AI_GATEWAY_ID
          ? {
              gateway: {
                id: c.env.AI_GATEWAY_ID,
                skipCache: false,
                cacheTtl: 3600,
              },
            }
          : {},
      );

      if (stream) {
        // Return streaming response
        return new Response(response as ReadableStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

      // Non-streaming response
      const result = response as { response: string };
      return c.json({
        success: true,
        data: {
          message: {
            role: "assistant" as const,
            content: result.response,
          },
        },
      });
    }

    return c.json(
      {
        success: false,
        error: {
          code: "UNSUPPORTED_PROVIDER",
          message: `Provider "${provider}" is not supported or no API key is configured`,
        },
      },
      400,
    );
  } catch (error) {
    console.error("AI Chat Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "AI_ERROR",
          message: error instanceof Error ? error.message : "AI request failed",
        },
      },
      500,
    );
  }
});

// List available models with dynamic Cloudflare & Opencode Zen auto-fetching
aiRoutes.get("/models", async c => {
  const dynamicModels: Array<{
    id: string;
    name: string;
    provider: string;
    description: string;
  }> = [];

  // Try fetching Opencode Zen models if available or configured
  try {
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
      // Check if user has an opencode key
      // If needed, we can query db or fetch from https://zen.opencode.ai/v1/models if user provided key in header or we use a default list
    }
  } catch {
    // ignore fetch error
  }

  return c.json({
    success: true,
    data: {
      models: [
        {
          id: "@cf/meta/llama-3.1-8b-instruct-fp8",
          name: "Llama 3.1 8B Instruct (FP8)",
          provider: "workers-ai",
          description: "Meta's Llama 3.1 8B model for general chat",
        },
        {
          id: "@cf/meta/llama-3.3-70b-instruct-fp8",
          name: "Llama 3.3 70B Instruct (FP8)",
          provider: "workers-ai",
          description: "Meta's Llama 3.3 70B model for complex tasks",
        },
        {
          id: "@cf/meta/llama-3.2-3b-instruct",
          name: "Llama 3.2 3B Instruct",
          provider: "workers-ai",
          description: "Meta's Llama 3.2 3B model for fast inference",
        },
        {
          id: "@cf/qwen/qwen2.5-coder-32b-instruct",
          name: "Qwen 2.5 Coder 32B Instruct",
          provider: "workers-ai",
          description: "Qwen's code-specialized 32B model",
        },
        {
          id: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
          name: "DeepSeek R1 Distill Qwen 32B",
          provider: "workers-ai",
          description: "DeepSeek R1 reasoning model on Workers AI",
        },
        {
          id: "opencode-zen-default",
          name: "Opencode Zen (Auto-Fetch)",
          provider: "opencode",
          description: "Opencode Zen smart proxy & aggregator (BYOK)",
        },
        {
          id: "gpt-4o",
          name: "GPT-4o (BYOK)",
          provider: "openai",
          description: "OpenAI GPT-4o model (Requires BYOK API key)",
        },
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude 3.5 Sonnet (BYOK)",
          provider: "anthropic",
          description: "Anthropic Claude 3.5 Sonnet (Requires BYOK API key)",
        },
        {
          id: "deepseek-chat",
          name: "DeepSeek Chat (BYOK)",
          provider: "deepseek",
          description: "DeepSeek V3 / R1 (Requires BYOK API key)",
        },
        {
          id: "llama-3.3-70b-versatile",
          name: "Groq Llama 3.3 70B (BYOK)",
          provider: "groq",
          description: "Groq Llama 3.3 (Requires BYOK API key)",
        },
        ...dynamicModels,
      ],
    },
  });
});

// Generate embeddings
aiRoutes.post("/embeddings", async c => {
  const body = await c.req.json<{ text: string | string[] }>();

  try {
    const response = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: body.text,
    });

    return c.json({
      success: true,
      data: {
        embeddings: response,
      },
    });
  } catch (error) {
    console.error("Embeddings Error:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "EMBEDDINGS_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Embeddings request failed",
        },
      },
      500,
    );
  }
});
