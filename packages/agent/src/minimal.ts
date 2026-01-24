/**
 * Minimal Durable Object test without agents package
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

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_HISTORY_MESSAGES = 20; // Limit context window

/**
 * Minimal MagicAgent Durable Object
 */
export class MagicAgent extends DurableObject {
  state: DurableObjectState;
  env: Env;
  private initialized = false;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
    console.log("MagicAgent initialized");
  }

  private async ensureSchema(): Promise<void> {
    if (this.initialized) return;

    // Create messages table if not exists
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
    this.state.storage.sql.exec(
      `INSERT INTO messages (id, role, content, timestamp) VALUES (?, ?, ?, ?)`,
      message.id,
      message.role,
      message.content,
      message.timestamp,
    );
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

  private async sendHistoryOnConnect(server: WebSocket): Promise<void> {
    // Send connected message
    server.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to minimal agent",
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
      message: "Minimal Durable Object is working",
      id: this.state.id.toString(),
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

      // Get conversation history for context
      const history = await this.getMessages();
      const aiMessages = [
        {
          role: "system",
          content: "You are a helpful AI assistant. Be concise.",
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

      server.send(
        JSON.stringify({ type: "chat_done", suggestedTemplate: null }),
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
        message: "Minimal worker is running",
      });
    }

    return new Response("MagicAppDev Minimal Agent Worker", { status: 200 });
  },
};
