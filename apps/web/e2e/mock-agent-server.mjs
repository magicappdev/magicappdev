/**
 * Mock WebSocket agent server for E2E tests.
 *
 * - WS:  ws://localhost:8788/agents/magic-agent/default
 * - HTTP: http://localhost:8788/health  (Playwright health-check)
 */

import { WebSocketServer } from "ws";
import { createServer } from "http";

const PORT = 8788;
const WS_PATH = "/agents/magic-agent/default";

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server, path: WS_PATH });

/** All currently connected clients */
const clients = new Set();

const MOCK_RESPONSE =
  "I've analysed your request and generated a complete project structure with multiple files, a component architecture, and a working config. Here's what I built:\n\n**Project structure:**\n- `src/App.tsx` — main entry with routing\n- `src/components/` — reusable UI components\n- `src/pages/` — page-level screens\n- `src/lib/utils.ts` — shared helpers\n\n**Key decisions:**\n1. Used a modular component pattern for reusability.\n2. Added error boundaries at the page level.\n3. Included type-safe API client.\n\nYou can explore the generated files in the sidebar.";

/** Broadcast a message to every connected client */
function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const c of clients) {
    if (c.readyState === 1 /* OPEN */) {
      c.send(payload);
    }
  }
}

wss.on("connection", (ws, req) => {
  const clientId =
    req.headers["sec-websocket-key"] ?? Math.random().toString(36).slice(2);
  clients.add(ws);
  console.log(`[mock-agent] client connected (${clientId.slice(0, 8)})`);

  ws.on("message", raw => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // Handle preview_error: broadcast tool_result to ALL clients
    if (msg.type === "preview_error") {
      console.log(
        `[mock-agent] preview_error received from ${clientId.slice(0, 8)}:`,
        msg.params?.filePath,
      );
      broadcast({
        type: "tool_result",
        tool: "patchError",
        result: {
          success: true,
          errorType: msg.params?.errorType || "runtime",
          filePath: msg.params?.filePath || "src/App.tsx",
          summary: "Fixed undefined variable reference",
          patch: "const x = 1; // patched",
          applied: true,
        },
        success: true,
        autoExecuted: true,
      });
      return;
    }

    if (msg.type !== "chat") return;

    const words = MOCK_RESPONSE.split(" ");
    let i = 0;

    const streamInterval = setInterval(() => {
      if (i >= words.length) {
        clearInterval(streamInterval);
        ws.send(
          JSON.stringify({
            type: "chat_chunk",
            id: "mock-stream-id",
            content: "",
            done: true,
          }),
        );
        ws.send(
          JSON.stringify({
            type: "chat_done",
            id: "mock-stream-id",
            suggestedTemplate: null,
            suggestedPrompts: [],
          }),
        );
        console.log(
          `[mock-agent] response complete for ${clientId.slice(0, 8)}`,
        );
        return;
      }

      ws.send(
        JSON.stringify({
          type: "chat_chunk",
          id: "mock-stream-id",
          content: (i === 0 ? "" : " ") + words[i],
          done: false,
        }),
      );
      i++;
    }, 30);
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[mock-agent] client disconnected (${clientId.slice(0, 8)})`);
  });

  ws.on("error", err => {
    console.error(
      `[mock-agent] error for ${clientId.slice(0, 8)}:`,
      err.message,
    );
  });
});

server.listen(PORT, () => {
  console.log(`[mock-agent] HTTP listening on http://localhost:${PORT}/health`);
  console.log(
    `[mock-agent] WS   listening on ws://localhost:${PORT}${WS_PATH}`,
  );
});
