/**
 * Project AI code generation routes
 * POST /projects/:id/ai/generate  — generate/modify project files from a prompt
 */

import { projectFiles } from "@magicappdev/database/schema";
import { authMiddleware } from "../middlewares/auth.js";
import { createDatabase } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";

export const projectAiRoutes = new Hono<AppContext>();

interface GenerateRequest {
  prompt: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}

interface FileChange {
  path: string;
  content: string;
  language?: string;
}

interface GenerateResult {
  description: string;
  files: FileChange[];
}

/** Infer Monaco language ID from file path */
function inferLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    htm: "html",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    py: "python",
    sh: "shell",
    bash: "shell",
    toml: "ini",
    yaml: "yaml",
    yml: "yaml",
    sql: "sql",
    txt: "plaintext",
  };
  return map[ext] ?? "plaintext";
}

/** Resolve API key from request or environment */
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
    case "groq":
      return env.GROQ_API_KEY;
    case "openrouter":
      return env.OPENROUTER_API_KEY;
    default:
      return undefined;
  }
}

/** Call an LLM with the generation prompt, return parsed JSON result */
async function callLLM(
  prompt: string,
  filesContext: string,
  env: AppContext["Bindings"],
  provider: string,
  model: string | undefined,
  apiKey: string | undefined,
): Promise<GenerateResult> {
  const systemPrompt = `You are an expert software engineer that helps users build web applications.
Given the user's prompt and the current project files, generate or modify files to fulfill the request.

RESPOND WITH ONLY VALID JSON — no markdown, no explanation outside the JSON.
Your response must be a single JSON object with this exact shape:
{
  "description": "Brief one-sentence summary of what was changed",
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "...full file content..."
    }
  ]
}

Rules:
- Output ALL files that need to be created or updated (full content, not diffs)
- Use relative paths (no leading slash)
- Keep existing files that don't need changes out of the response
- Write production-quality code with proper imports and exports
- For TypeScript/React projects prefer .tsx for components, .ts for utilities`;

  const userMessage = `Current project files:\n${filesContext}\n\n---\n\nUser request: ${prompt}`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userMessage },
  ];

  let rawContent = "";

  if (provider === "workers-ai") {
    const workerModel = model || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
    const response = await env.AI.run(
      workerModel as Parameters<typeof env.AI.run>[0],
      { messages, max_tokens: 8192, temperature: 0.3 },
      env.AI_GATEWAY_ID
        ? {
            gateway: {
              id: env.AI_GATEWAY_ID,
              skipCache: false,
              cacheTtl: 3600,
            },
          }
        : {},
    );
    const result = response as { response: string };
    rawContent = result.response ?? "";
  } else if (provider === "anthropic") {
    if (!apiKey) throw new Error("Anthropic API key required");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-3-5-haiku-20241022",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.3,
      }),
    });
    const data = (await res.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    rawContent = data.content?.[0]?.text ?? "";
  } else {
    // OpenAI-compat (openai, groq, openrouter)
    if (!apiKey) throw new Error(`API key required for provider "${provider}"`);
    const baseUrls: Record<string, string> = {
      openai: "https://api.openai.com/v1",
      groq: "https://api.groq.com/openai/v1",
      openrouter: "https://openrouter.ai/api/v1",
    };
    const defaultModels: Record<string, string> = {
      openai: "gpt-4o-mini",
      groq: "llama-3.3-70b-versatile",
      openrouter: "openai/gpt-4o-mini",
    };
    const baseUrl = baseUrls[provider] ?? "https://api.openai.com/v1";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://magicappdev.workers.dev";
      headers["X-Title"] = "MagicAppDev";
    }
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model || defaultModels[provider] || "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 8192,
      }),
    });
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    rawContent = data.choices?.[0]?.message?.content ?? "";
  }

  // Parse JSON from response (handle markdown code fences)
  const jsonMatch =
    rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) ??
    rawContent.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;

  try {
    const parsed = JSON.parse(jsonStr.trim()) as GenerateResult;
    if (!parsed.files || !Array.isArray(parsed.files)) {
      throw new Error("Invalid response: missing files array");
    }
    return parsed;
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw: ${rawContent.slice(0, 200)}`,
    );
  }
}

/** POST /projects/:id/ai/generate */
projectAiRoutes.post("/:id/ai/generate", authMiddleware, async c => {
  const projectId = c.req.param("id");
  const userId = c.get("userId");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      },
      401,
    );
  }

  const body = await c.req.json<GenerateRequest>();
  const {
    prompt,
    provider = "workers-ai",
    model,
    apiKey: requestApiKey,
  } = body;

  if (!prompt?.trim()) {
    return c.json(
      {
        success: false,
        error: { code: "MISSING_PROMPT", message: "Prompt is required" },
      },
      400,
    );
  }

  const db = c.get("db");

  // Load existing project files
  const files = await db
    .select()
    .from(projectFiles)
    .where(eq(projectFiles.projectId, projectId));

  // Build file context string (limit per file to avoid token overflow)
  const filesContext = files
    .map(f => {
      const content =
        f.content.length > 3000
          ? f.content.slice(0, 3000) + "\n... (truncated)"
          : f.content;
      return `=== ${f.path} ===\n${content}`;
    })
    .join("\n\n");

  const resolvedApiKey = resolveApiKey(provider, requestApiKey, c.env);

  try {
    const result = await callLLM(
      prompt,
      filesContext || "(no files yet)",
      c.env,
      provider,
      model,
      resolvedApiKey,
    );

    // Save each changed file to DB
    const savedFiles = await Promise.all(
      result.files.map(async change => {
        const language = change.language || inferLanguage(change.path);
        const size = new TextEncoder().encode(change.content).length;
        const existing = files.find(f => f.path === change.path);

        if (existing) {
          const rawDb = db as ReturnType<typeof createDatabase>;
          await rawDb
            .update(projectFiles)
            .set({
              content: change.content,
              language,
              size,
              updatedAt: new Date().toISOString(),
            })
            .where(
              and(
                eq(projectFiles.id, existing.id),
                eq(projectFiles.projectId, projectId),
              ),
            );
          return { ...existing, content: change.content, language, size };
        } else {
          const newFile = {
            id: crypto.randomUUID(),
            projectId,
            path: change.path,
            content: change.content,
            language,
            size,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const rawDb = db as ReturnType<typeof createDatabase>;
          await rawDb.insert(projectFiles).values(newFile);
          return newFile;
        }
      }),
    );

    return c.json({
      success: true,
      data: {
        description: result.description,
        files: savedFiles,
      },
    });
  } catch (err) {
    console.error("AI generation error:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: err instanceof Error ? err.message : "AI generation failed",
        },
      },
      500,
    );
  }
});
