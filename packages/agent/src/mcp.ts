/**
 * MCP (Model Context Protocol) server implementation for MagicAgent
 *
 * Implements MCP over HTTP (Streamable HTTP transport) allowing IDE tools
 * like Cursor, VS Code, and Claude Desktop to connect and use agent tools.
 *
 * Protocol: https://spec.modelcontextprotocol.io/specification/
 */

import { AGENT_TOOLS } from "./tools.js";

const MCP_PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "magicappdev-agent", version: "0.0.1" };

/** JSON-RPC 2.0 request */
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: unknown;
}

/** JSON-RPC 2.0 response */
interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function err(
  id: string | number | null,
  code: number,
  message: string,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

/** Convert our ToolDefinition format to MCP tool schema */
function toolToMcpSchema(toolName: string) {
  const tool = AGENT_TOOLS[toolName];
  if (!tool) return null;

  const properties: Record<string, { type: string; description: string }> = {};
  const required: string[] = [];

  for (const [paramName, param] of Object.entries(tool.parameters)) {
    properties[paramName] = {
      type: param.type === "object" ? "object" : param.type,
      description: param.description,
    };
    if (param.required) {
      required.push(paramName);
    }
  }

  return {
    name: toolName,
    description:
      tool.description +
      (tool.requiresApproval ? " [Requires user approval]" : ""),
    inputSchema: {
      type: "object",
      properties,
      required,
    },
  };
}

/** Handle a single MCP JSON-RPC method call */
function handleMethod(
  req: JsonRpcRequest,
  agentId: string,
): JsonRpcResponse | null {
  const { id, method, params } = req;

  switch (method) {
    case "initialize": {
      return ok(id, {
        protocolVersion: MCP_PROTOCOL_VERSION,
        serverInfo: SERVER_INFO,
        capabilities: {
          tools: {},
        },
      });
    }

    case "notifications/initialized":
    case "initialized": {
      // Notification — no response required
      return null;
    }

    case "tools/list": {
      const tools = Object.keys(AGENT_TOOLS)
        .map(toolToMcpSchema)
        .filter(Boolean);
      return ok(id, { tools });
    }

    case "tools/call": {
      const p = params as {
        name?: string;
        arguments?: Record<string, unknown>;
      };
      const toolName = p?.name;

      if (!toolName || !(toolName in AGENT_TOOLS)) {
        return err(id, -32602, `Unknown tool: ${toolName}`);
      }

      const tool = AGENT_TOOLS[toolName]!;

      // For tools requiring approval, return a descriptive result explaining the requirement
      if (tool.requiresApproval) {
        return ok(id, {
          content: [
            {
              type: "text",
              text: `Tool "${toolName}" requires human approval before execution. A pending approval has been created for agent ${agentId}. The user must approve this action via the MagicAppDev web interface.`,
            },
          ],
          isError: false,
        });
      }

      // Read-only tools return descriptive results (actual execution happens via WebSocket in agent)
      return ok(id, {
        content: [
          {
            type: "text",
            text: `Tool "${toolName}" is available. Connect via WebSocket at wss://magicappdev-agent.workers.dev/ws to execute tools interactively with the AI agent. MCP tool calls are logged and can be reviewed.`,
          },
        ],
        isError: false,
      });
    }

    case "resources/list": {
      return ok(id, { resources: [] });
    }

    case "prompts/list": {
      return ok(id, {
        prompts: [
          {
            name: "generate-component",
            description: "Generate a new React/React Native component",
            arguments: [
              {
                name: "name",
                description: "Component name (PascalCase)",
                required: true,
              },
              {
                name: "type",
                description: "Component type: button, screen, modal, form",
                required: false,
              },
            ],
          },
          {
            name: "code-review",
            description: "Review code for bugs, performance, and best practices",
            arguments: [
              {
                name: "code",
                description: "The code to review",
                required: true,
              },
              {
                name: "language",
                description: "Programming language",
                required: false,
              },
            ],
          },
          {
            name: "explain-code",
            description: "Explain what a piece of code does",
            arguments: [
              {
                name: "code",
                description: "The code to explain",
                required: true,
              },
            ],
          },
        ],
      });
    }

    case "prompts/get": {
      const p = params as { name?: string; arguments?: Record<string, string> };
      const promptName = p?.name;
      const args = p?.arguments ?? {};

      if (promptName === "generate-component") {
        return ok(id, {
          description: "Generate a new component",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Generate a ${args.type || "React"} component named "${args.name || "MyComponent"}" following best practices. Include TypeScript types, proper exports, and basic styling.`,
              },
            },
          ],
        });
      }

      if (promptName === "code-review") {
        return ok(id, {
          description: "Review code",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please review this ${args.language || "TypeScript"} code for bugs, performance issues, and best practices:\n\n\`\`\`${args.language || "typescript"}\n${args.code || ""}\n\`\`\``,
              },
            },
          ],
        });
      }

      if (promptName === "explain-code") {
        return ok(id, {
          description: "Explain code",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please explain what this code does, step by step:\n\n\`\`\`\n${args.code || ""}\n\`\`\``,
              },
            },
          ],
        });
      }

      return err(id, -32602, `Unknown prompt: ${promptName}`);
    }

    default: {
      return err(id, -32601, `Method not found: ${method}`);
    }
  }
}

/** Handle an MCP HTTP request (Streamable HTTP transport) */
export async function handleMcpRequest(
  request: Request,
  agentId: string,
): Promise<Response> {
  // CORS headers for IDE clients
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify(err(null, -32700, "Parse error: invalid JSON")),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Handle batch requests
  if (Array.isArray(body)) {
    const responses = body
      .map(req => handleMethod(req as JsonRpcRequest, agentId))
      .filter(Boolean);

    return new Response(JSON.stringify(responses), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Handle single request
  const response = handleMethod(body as JsonRpcRequest, agentId);

  // Notifications don't need a response body
  if (response === null) {
    return new Response(null, { status: 202, headers: corsHeaders });
  }

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
