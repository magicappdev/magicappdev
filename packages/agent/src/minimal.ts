/**
 * Enhanced MagicAgent with D1 Database and Project Context
 *
 * Features:
 * - D1 database for persistent chat session storage
 * - Project context loading from database
 * - Session-based conversations with project linking
 * - Dynamic prompts based on project files, errors, and commands
 */

import { DurableObject } from "cloudflare:workers";

export interface Env {
  AI: WorkerAi;
  DB: D1Database;
  MagicAgent: DurableObjectNamespace;
}

export interface WorkerAiResponse {
  role: string;
  content: string;
  [key: string]: unknown;
}

export interface WorkerAi {
  run(
    model: string,
    options: {
      messages: { role: string; content: string }[];
      stream?: boolean;
    },
  ): Promise<WorkerAiResponse | ReadableStream>;
}

interface AiStreamChunk {
  response?: string;
}

interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface ProjectContext {
  files: Array<{
    id: string;
    projectId: string;
    path: string;
    content: string;
    language: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>;
  errors: Array<{
    id: string;
    projectId: string;
    errorType: string;
    message: string;
    stackTrace: string | null;
    filePath: string | null;
    lineNumber: number | null;
    occurredAt: string;
    resolved: boolean;
  }>;
  commands: Array<{
    id: string;
    projectId: string;
    command: string;
    exitCode: number | null;
    output: string | null;
    error: string | null;
    executedAt: string;
  }>;
  unresolvedErrors: number;
}

interface SessionData {
  sessionId: string | null;
  projectId: string | null;
  userId: string;
  title: string;
}

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_HISTORY_MESSAGES = 20;
const MAX_CONTEXT_FILES = 20;

/**
 * Enhanced MagicAgent Durable Object with D1 and Project Context
 */
export class MagicAgent extends DurableObject {
  state: DurableObjectState;
  env: Env;
  private initialized = false;
  private sessionData: SessionData = {
    sessionId: null,
    projectId: null,
    userId: "",
    title: "New Chat",
  };

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
    console.log("MagicAgent initialized with D1 and context support");
  }

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;

    // Create messages table if not exists (local DO storage)
    this.state.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
    this.initialized = true;
  }

  private async saveMessage(message: StoredMessage): Promise<void> {
    await this.ensureSchema();

    // Save to local DO storage
    this.state.storage.sql.exec(
      `INSERT INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?)`,
      message.id,
      message.role,
      message.content,
      message.timestamp,
    );

    // Also save to D1 if we have a session
    if (this.sessionData.sessionId && this.env.DB) {
      try {
        await this.env.DB
          .prepare(
            `INSERT INTO chat_messages (id, session_id, role, content, timestamp)
             VALUES (?, ?, ?, ?, ?)`,
          )
          .bind(message.id, this.sessionData.sessionId, message.role, message.content, message.timestamp)
          .run();
      } catch (err) {
        console.error("Failed to save message to D1:", err);
      }
    }
  }

  private async getMessages(
    limit = MAX_HISTORY_MESSAGES,
  ): Promise<StoredMessage[]> {
    await this.ensureSchema();
    const rows = this.state.storage.sql
      .exec(
        `SELECT id, role, content, timestamp FROM messages ORDER BY timestamp DESC LIMIT ?`,
        limit,
      )
      .toArray();
    // Map rows to StoredMessage type and reverse to get chronological order
    return rows
      .map(row => ({
        id: row.id as string,
        role: row.role as "user" | "assistant" | "system",
        content: row.content as string,
        timestamp: row.timestamp as number,
      }))
      .reverse();
  }

  private async clearMessages(): Promise<void> {
    await this.ensureSchema();
    this.state.storage.sql.exec(`DELETE FROM messages`);
  }

  /**
   * Load project context from D1 database
   */
  private async loadProjectContext(sessionId: string): Promise<ProjectContext | null> {
    if (!this.env.DB) return null;

    try {
      // Get session info
      const sessionResult = await this.env.DB
        .prepare(
          `SELECT id, project_id, user_id, title FROM chat_sessions WHERE id = ?`,
        )
        .bind(sessionId)
        .first<{ id: string; project_id: string | null; user_id: string; title: string }>();

      if (!sessionResult) {
        console.log("Session not found:", sessionId);
        return null;
      }

      // Update session data
      this.sessionData = {
        sessionId: sessionResult.id,
        projectId: sessionResult.project_id,
        userId: sessionResult.user_id,
        title: sessionResult.title,
      };

      if (!sessionResult.project_id) {
        console.log("Session has no project linked");
        return null;
      }

      // Load project files - map snake_case columns to camelCase
      const filesResult = await this.env.DB
        .prepare(
          `SELECT id, project_id, path, content, language, size, created_at, updated_at
           FROM project_files WHERE project_id = ?`,
        )
        .bind(sessionResult.project_id)
        .all();

      // Load project errors - map snake_case columns to camelCase
      const errorsResult = await this.env.DB
        .prepare(
          `SELECT id, project_id, error_type, message, stack_trace, file_path as filePath, line_number as lineNumber, occurred_at, resolved
           FROM project_errors WHERE project_id = ? ORDER BY occurred_at DESC LIMIT 20`,
        )
        .bind(sessionResult.project_id)
        .all();

      // Load recent commands
      const commandsResult = await this.env.DB
        .prepare(
          `SELECT id, project_id, command, exit_code, output, error, executed_at
           FROM project_commands WHERE project_id = ? ORDER BY executed_at DESC LIMIT 10`,
        )
        .bind(sessionResult.project_id)
        .all();

      // Count unresolved errors
      const unresolvedErrorsResult = await this.env.DB
        .prepare(
          `SELECT COUNT(*) as count FROM project_errors WHERE project_id = ? AND resolved = 0`,
        )
        .bind(sessionResult.project_id)
        .first<{ count: number }>();

      return {
        files: filesResult.results as ProjectContext["files"],
        errors: errorsResult.results as ProjectContext["errors"],
        commands: commandsResult.results as ProjectContext["commands"],
        unresolvedErrors: unresolvedErrorsResult?.count || 0,
      };
    } catch (err) {
      console.error("Failed to load project context:", err);
      return null;
    }
  }

  /**
   * Build enhanced system prompt with project context
   */
  private buildSystemPrompt(context: ProjectContext | null): string {
    let prompt = "You are a helpful AI assistant for MagicAppDev. ";
    prompt += "You help users build and debug their applications. ";
    prompt += "Be concise but thorough.\n\n";

    if (context && context.files.length > 0) {
      prompt += `## Project Context\n`;
      prompt += `The user is working on a project with ${context.files.length} files.\n\n`;

      // Show file tree
      const fileTree = context.files.map(f => `  - ${f.path} (${f.language})`).join("\n");
      prompt += `### Files:\n${fileTree}\n\n`;

      // Include some file contents for context
      const keyFiles = context.files.slice(0, MAX_CONTEXT_FILES);
      if (keyFiles.length > 0) {
        prompt += `### Key Files:\n`;
        for (const file of keyFiles) {
          const preview =
            file.content.length > 500
              ? file.content.slice(0, 500) + "\n... (truncated)"
              : file.content;
          prompt += `\n**${file.path}**:\n\`\`\`${file.language}\n${preview}\n\`\`\`\n`;
        }
      }
    }

    if (context && context.errors.length > 0) {
      prompt += `\n### Recent Errors (${context.unresolvedErrors} unresolved):\n`;
      for (const err of context.errors.slice(0, 5)) {
        prompt += `- [${err.errorType}] ${err.message}`;
        if (err.filePath) {
          prompt += ` at ${err.filePath}`;
          if (err.lineNumber) {
            prompt += `:${err.lineNumber}`;
          }
        }
        prompt += `\n`;
      }
    }

    if (context && context.commands.length > 0) {
      prompt += `\n### Recent Commands:\n`;
      for (const cmd of context.commands.slice(0, 5)) {
        const status = cmd.exitCode === 0 ? "✓" : "✗";
        prompt += `- ${status} \`${cmd.command}\`\n`;
      }
    }

    prompt += `\n### Dynamic Suggestions:\n`;
    if (context && context.unresolvedErrors > 0) {
      prompt += `- Consider helping fix the ${context.unresolvedErrors} unresolved error(s)\n`;
    }
    if (context && context.files.length > 0) {
      prompt += "- You can suggest code changes to files\n";
      prompt += "- You can help debug issues using error messages\n";
    }

    return prompt;
  }

  private async sendHistoryOnConnect(server: WebSocket): Promise<void> {
    // Send connected message
    server.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to MagicAgent with D1 context",
        session: this.sessionData,
      }),
    );

    // Load and send message history
    const history = await this.getMessages();
    if (history.length > 0) {
      server.send(
        JSON.stringify({
          type: "history",
          messages: history,
        }),
      );
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade - check for upgrade header case-insensitively
    const upgradeHeader = request.headers.get("Upgrade");
    if (
      url.pathname === "/ws" ||
      upgradeHeader?.toLowerCase() === "websocket"
    ) {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();

      // Send welcome message and load history
      this.sendHistoryOnConnect(server).catch(err => {
        console.error("Failed to send history:", err);
      });

      // Handle messages with AI
      server.addEventListener("message", event => {
        this.handleMessage(server, event).catch(err => {
          console.error("Handler error:", err);
          server.send(
            JSON.stringify({ type: "error", message: "Internal error" }),
          );
        });
      });

      server.addEventListener("close", () => {
        console.log("WebSocket closed");
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // HTTP endpoint
    return Response.json({
      status: "ok",
      message: "Enhanced MagicAgent with D1 and context support",
      id: this.state.id.toString(),
      session: this.sessionData,
    });
  }

  private async handleMessage(
    server: WebSocket,
    event: MessageEvent,
  ): Promise<void> {
    try {
      // Validate event.data is a string before parsing
      if (typeof event.data !== "string") {
        server.send(
          JSON.stringify({
            type: "error",
            message: "Unsupported message type; expected string",
          }),
        );
        return;
      }
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      // Handle set_session command
      if (data.type === "set_session" && data.sessionId) {
        const context = await this.loadProjectContext(data.sessionId);
        server.send(
          JSON.stringify({
            type: "session_set",
            session: this.sessionData,
            context: context
              ? {
                  fileCount: context.files.length,
                  errorCount: context.errors.length,
                  commandCount: context.commands.length,
                  unresolvedErrors: context.unresolvedErrors,
                }
              : null,
          }),
        );
        return;
      }

      // Handle clear history command
      if (data.type === "clear_history") {
        await this.clearMessages();
        server.send(JSON.stringify({ type: "history_cleared" }));
        return;
      }

      if (data.type !== "chat" || !data.content) {
        server.send(
          JSON.stringify({ type: "error", message: "Expected chat message" }),
        );
        return;
      }

      // Save user message
      const userMessage: StoredMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: data.content,
        timestamp: Date.now(),
      };
      await this.saveMessage(userMessage);

      // Load project context if we have a session
      let projectContext: ProjectContext | null = null;
      if (this.sessionData.sessionId) {
        projectContext = await this.loadProjectContext(this.sessionData.sessionId);
      }

      // Get conversation history for context
      const history = await this.getMessages();

      // Build enhanced system prompt with project context
      const systemPrompt = this.buildSystemPrompt(projectContext);

      const aiMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ];

      const stream = (await this.env.AI.run(DEFAULT_MODEL, {
        messages: aiMessages,
        stream: true,
      })) as ReadableStream;

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (line.startsWith("data: ")) {
            const jsonData = line.slice(6);
            if (jsonData === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonData) as AiStreamChunk;
              if (parsed.response) {
                fullResponse += parsed.response;
                server.send(
                  JSON.stringify({
                    type: "chat_chunk",
                    content: parsed.response,
                  }),
                );
              }
            } catch (parseError) {
              // Partial JSON chunks are expected during streaming
              console.debug("Partial JSON chunk:", parseError);
            }
          }
        }
      }

      // Save assistant response
      if (fullResponse) {
        const assistantMessage: StoredMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
        };
        await this.saveMessage(assistantMessage);
      }

      // Generate dynamic suggestions based on context
      const suggestions = [];
      if (projectContext) {
        if (projectContext.unresolvedErrors > 0) {
          suggestions.push({
            type: "fix_errors",
            text: `Help fix ${projectContext.unresolvedErrors} error(s)`,
          });
        }
        if (projectContext.files.length > 0) {
          suggestions.push({
            type: "improve_code",
            text: "Suggest code improvements",
          });
        }
        suggestions.push({
          type: "add_feature",
          text: "Add a new feature",
        });
      }

      server.send(
        JSON.stringify({
          type: "chat_done",
          suggestedTemplate: null,
          suggestions,
        }),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("AI error:", msg);
      server.send(
        JSON.stringify({ type: "error", message: `AI error: ${msg}` }),
      );
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route to MagicAgent Durable Object
    // Expected path format: /agents/magic-agent/:id
    if (path.startsWith("/agents/magic-agent/")) {
      const segments = path.split("/");
      const AGENT_ID_INDEX = 3; // Path: ['', 'agents', 'magic-agent', ':id']
      const id = segments[AGENT_ID_INDEX] || "default";
      const stub = env.MagicAgent.get(env.MagicAgent.idFromName(id));
      return stub.fetch(request);
    }

    // Test endpoint
    if (path === "/test") {
      return Response.json({
        status: "ok",
        message: "Enhanced MagicAgent worker is running",
        features: ["D1 storage", "Project context", "Session management", "Dynamic prompts"],
      });
    }

    return new Response("MagicAppDev Enhanced Agent Worker", { status: 200 });
  },
};
