/**
 * Minimal Durable Object test without agents package
 */

import { DurableObject } from "cloudflare:workers";

export interface Env {
  AI: WorkerAi;
  DB: D1Database;
  MagicAgent: DurableObjectNamespace;
}

export interface WorkerAi {
  run(
    model: string,
    options: {
      messages: { role: string; content: string }[];
      stream?: boolean;
    },
  ): Promise<unknown>;
}

/**
 * Minimal MagicAgent Durable Object
 */
export class MagicAgent extends DurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    console.log("MagicAgent initialized");
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (
      url.pathname === "/ws" ||
      request.headers.get("Upgrade") === "websocket"
    ) {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();

      // Send welcome message
      server.send(
        JSON.stringify({
          type: "connected",
          message: "Connected to minimal agent",
        }),
      );

      // Echo messages back
      server.addEventListener("message", event => {
        try {
          const data = JSON.parse(event.data as string);
          console.log("Received:", data);

          server.send(
            JSON.stringify({
              type: "echo",
              original: data,
            }),
          );
        } catch {
          server.send(
            JSON.stringify({
              type: "error",
              message: "Invalid JSON",
            }),
          );
        }
      });

      server.addEventListener("close", () => {
        console.log("WebSocket closed");
        server.close();
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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route to MagicAgent Durable Object
    if (path.startsWith("/agents/magic-agent/")) {
      const id = path.split("/")[3] || "default";
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
