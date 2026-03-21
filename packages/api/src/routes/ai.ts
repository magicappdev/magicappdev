/**
 * AI routes for chat and code generation
 */

import { Hono } from "hono";
import type { AppContext } from "../types.js";

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
  /** User-provided API key (BYOK). Falls back to environment variable. */
  apiKey?: string;
}

/** OpenAI-compatible provider config */
interface OpenAICompatConfig {
  baseUrl: string;
  defaultModel: string;
}

const OPENAI_COMPAT_PROVIDERS: Record<string, OpenAICompatConfig> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.1-70b-versatile",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
  },
};

/** Resolve API key: prefer request-provided BYOK, then env var */
function resolveApiKey(
  provider: string,
  requestKey: string | undefined,
  env: AppContext["Bindings"],
): string | undefined {
  if (requestKey) return requestKey;
  switch (provider) {
    case "openai":
      return env.OPENAI_API_KEY;
    case "anthropic":
      return env.ANTHROPIC_API_KEY;
    case "google":
    case "gemini":
      return env.GOOGLE_AI_API_KEY;
    case "openrouter":
      return env.OPENROUTER_API_KEY;
    case "groq":
      return env.GROQ_API_KEY;
    default:
      return undefined;
  }
}

/** Call OpenAI-compatible API (OpenAI, Groq, OpenRouter) */
async function callOpenAICompat(
  config: OpenAICompatConfig,
  messages: AiMessage[],
  model: string | undefined,
  apiKey: string,
  stream: boolean,
  temperature: number,
  maxTokens: number,
  provider: string,
): Promise<Response> {
  const body = JSON.stringify({
    model: model || config.defaultModel,
    messages,
    stream,
    temperature,
    max_tokens: maxTokens,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter requires an extra header
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://magicappdev.workers.dev";
    headers["X-Title"] = "MagicAppDev";
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`${provider} API error ${response.status}: ${errText}`);
  }

  if (stream) {
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const data = (await response.json()) as {
    choices: { message: { role: string; content: string } }[];
  };
  return Response.json({
    success: true,
    data: {
      message: {
        role: "assistant" as const,
        content: data.choices[0]?.message?.content ?? "",
      },
    },
  });
}

/** Call Anthropic Messages API */
async function callAnthropic(
  messages: AiMessage[],
  model: string | undefined,
  apiKey: string,
  stream: boolean,
  temperature: number,
  maxTokens: number,
): Promise<Response> {
  // Separate system messages from conversation messages
  const systemMessages = messages.filter(m => m.role === "system");
  const conversationMessages = messages.filter(m => m.role !== "system");

  const body = JSON.stringify({
    model: model || "claude-3-5-haiku-20241022",
    system: systemMessages.map(m => m.content).join("\n") || undefined,
    messages: conversationMessages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    stream,
    temperature,
    max_tokens: maxTokens,
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }

  if (stream) {
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };
  const content =
    data.content.find(c => c.type === "text")?.text ??
    "";
  return Response.json({
    success: true,
    data: {
      message: { role: "assistant" as const, content },
    },
  });
}

/** Call Google Gemini API */
async function callGemini(
  messages: AiMessage[],
  model: string | undefined,
  apiKey: string,
  temperature: number,
  maxTokens: number,
): Promise<Response> {
  const geminiModel = model || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages
    .filter(m => m.role === "system")
    .map(m => m.content)
    .join("\n");

  const body = JSON.stringify({
    contents,
    ...(systemInstruction
      ? { system_instruction: { parts: [{ text: systemInstruction }] } }
      : {}),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "Unknown error");
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  const content =
    data.candidates[0]?.content?.parts?.[0]?.text ?? "";
  return Response.json({
    success: true,
    data: {
      message: { role: "assistant" as const, content },
    },
  });
}

// Chat completion
aiRoutes.post("/chat", async c => {
  const body = await c.req.json<AiChatRequest>();
  const {
    messages,
    provider = "workers-ai",
    model,
    stream = false,
    temperature = 0.7,
    maxTokens = 4096,
    apiKey: requestApiKey,
  } = body;

  try {
    // Workers AI (free, no key required)
    if (provider === "workers-ai") {
      const workerModel = model || "@cf/meta/llama-3.1-8b-instruct";
      const response = await c.env.AI.run(
        workerModel as Parameters<typeof c.env.AI.run>[0],
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
        return new Response(response as ReadableStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }

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

    // OpenAI-compatible providers (openai, groq, openrouter)
    if (provider in OPENAI_COMPAT_PROVIDERS) {
      const apiKey = resolveApiKey(provider, requestApiKey, c.env);
      if (!apiKey) {
        return c.json(
          {
            success: false,
            error: {
              code: "MISSING_API_KEY",
              message: `No API key configured for provider "${provider}". Pass apiKey in the request body or set the environment variable.`,
            },
          },
          400,
        );
      }
      const providerConfig = OPENAI_COMPAT_PROVIDERS[provider]!;
      return callOpenAICompat(
        providerConfig,
        messages,
        model,
        apiKey,
        stream,
        temperature,
        maxTokens,
        provider,
      );
    }

    // Anthropic
    if (provider === "anthropic") {
      const apiKey = resolveApiKey(provider, requestApiKey, c.env);
      if (!apiKey) {
        return c.json(
          {
            success: false,
            error: {
              code: "MISSING_API_KEY",
              message:
                'No API key configured for Anthropic. Pass apiKey in the request body or set ANTHROPIC_API_KEY.',
            },
          },
          400,
        );
      }
      return callAnthropic(
        messages,
        model,
        apiKey,
        stream,
        temperature,
        maxTokens,
      );
    }

    // Google Gemini
    if (provider === "google" || provider === "gemini") {
      const apiKey = resolveApiKey(provider, requestApiKey, c.env);
      if (!apiKey) {
        return c.json(
          {
            success: false,
            error: {
              code: "MISSING_API_KEY",
              message:
                'No API key configured for Google AI. Pass apiKey in the request body or set GOOGLE_AI_API_KEY.',
            },
          },
          400,
        );
      }
      return callGemini(messages, model, apiKey, temperature, maxTokens);
    }

    return c.json(
      {
        success: false,
        error: {
          code: "UNSUPPORTED_PROVIDER",
          message: `Provider "${provider}" is not supported. Valid providers: workers-ai, openai, anthropic, google, groq, openrouter`,
        },
      },
      400,
    );
  } catch (err) {
    console.error("AI Chat Error:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "AI_ERROR",
          message: err instanceof Error ? err.message : "AI request failed",
        },
      },
      500,
    );
  }
});

// List available providers and models
aiRoutes.get("/providers", async c => {
  return c.json({
    success: true,
    data: {
      providers: [
        {
          id: "workers-ai",
          name: "Cloudflare Workers AI",
          description: "Free AI models hosted on Cloudflare edge",
          requiresKey: false,
          models: [
            {
              id: "@cf/meta/llama-3.1-8b-instruct",
              name: "Llama 3.1 8B",
              description: "Fast, general-purpose model",
            },
            {
              id: "@cf/meta/llama-3.1-70b-instruct",
              name: "Llama 3.1 70B",
              description: "High-quality model for complex tasks",
            },
            {
              id: "@cf/mistral/mistral-7b-instruct-v0.2",
              name: "Mistral 7B",
              description: "Efficient model for coding and reasoning",
            },
            {
              id: "@cf/deepseek-ai/deepseek-coder-33b-instruct",
              name: "DeepSeek Coder 33B",
              description: "Specialized model for code generation",
            },
          ],
        },
        {
          id: "openai",
          name: "OpenAI",
          description: "GPT-4 and GPT-4o models from OpenAI",
          requiresKey: true,
          envVar: "OPENAI_API_KEY",
          models: [
            { id: "gpt-4o", name: "GPT-4o" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini (fast, cheap)" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
            { id: "o1-mini", name: "o1 Mini (reasoning)" },
          ],
        },
        {
          id: "anthropic",
          name: "Anthropic",
          description: "Claude models from Anthropic",
          requiresKey: true,
          envVar: "ANTHROPIC_API_KEY",
          models: [
            { id: "claude-opus-4-5", name: "Claude Opus 4.5 (most capable)" },
            {
              id: "claude-sonnet-4-5",
              name: "Claude Sonnet 4.5 (balanced)",
            },
            {
              id: "claude-3-5-haiku-20241022",
              name: "Claude Haiku 3.5 (fast)",
            },
          ],
        },
        {
          id: "google",
          name: "Google AI",
          description: "Gemini models from Google",
          requiresKey: true,
          envVar: "GOOGLE_AI_API_KEY",
          models: [
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
            { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (fast)" },
            { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (latest)" },
          ],
        },
        {
          id: "groq",
          name: "Groq",
          description: "Ultra-fast inference with Llama and Mixtral models",
          requiresKey: true,
          envVar: "GROQ_API_KEY",
          models: [
            {
              id: "llama-3.1-70b-versatile",
              name: "Llama 3.1 70B (versatile)",
            },
            {
              id: "llama-3.1-8b-instant",
              name: "Llama 3.1 8B (instant)",
            },
            { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
          ],
        },
        {
          id: "openrouter",
          name: "OpenRouter",
          description: "Access 100+ models via a single unified API",
          requiresKey: true,
          envVar: "OPENROUTER_API_KEY",
          models: [
            { id: "openai/gpt-4o-mini", name: "GPT-4o Mini via OpenRouter" },
            {
              id: "anthropic/claude-3.5-haiku",
              name: "Claude 3.5 Haiku via OpenRouter",
            },
            { id: "google/gemini-flash-1.5", name: "Gemini Flash via OpenRouter" },
            { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B via OpenRouter" },
          ],
        },
      ],
    },
  });
});

// List available models (legacy endpoint kept for compatibility)
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
  } catch (err) {
    console.error("Embeddings Error:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "EMBEDDINGS_ERROR",
          message:
            err instanceof Error ? err.message : "Embeddings request failed",
        },
      },
      500,
    );
  }
});
