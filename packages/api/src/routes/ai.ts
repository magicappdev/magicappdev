/**
 * AI routes for chat and code generation
 */

import type { AppContext } from "../types";
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
  const body = await c.req.json<AiChatRequest>();
  const {
    messages,
    provider = "workers-ai",
    stream = false,
    temperature = 0.7,
    maxTokens = 4096,
  } = body;

  try {
    // Use Workers AI by default
    if (provider === "workers-ai") {
      const response = await c.env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
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

    // TODO: Add support for other providers (OpenAI, Anthropic, Gemini, OpenRouter)
    return c.json(
      {
        success: false,
        error: {
          code: "UNSUPPORTED_PROVIDER",
          message: `Provider "${provider}" is not yet supported`,
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

// List available models
aiRoutes.get("/models", async c => {
  return c.json({
    success: true,
    data: {
      models: [
        {
          id: "@cf/meta/llama-3.1-8b-instruct",
          name: "Llama 3.1 8B Instruct",
          provider: "workers-ai",
          description: "Meta's Llama 3.1 8B model for text generation",
        },
        {
          id: "@cf/meta/llama-3.1-70b-instruct",
          name: "Llama 3.1 70B Instruct",
          provider: "workers-ai",
          description: "Meta's Llama 3.1 70B model for complex tasks",
        },
        {
          id: "@cf/mistral/mistral-7b-instruct-v0.2",
          name: "Mistral 7B Instruct",
          provider: "workers-ai",
          description: "Mistral's 7B model for fast inference",
        },
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
