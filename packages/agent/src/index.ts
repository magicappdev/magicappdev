import {
  type ToolCall,
  type PendingApproval,
  type ToolDefinition,
  getToolsPrompt,
  parseToolCalls,
  requiresApproval,
  createPendingApproval,
  getTool,
  AGENT_TOOLS,
} from "./tools";
import type { TemplateMetadata } from "@magicappdev/templates";
import { registry } from "@magicappdev/templates/registry";
import type { Connection, WSMessage } from "agents";
import { Agent } from "agents";

// Re-export tool types for external use
export type { ToolCall, PendingApproval, ToolDefinition };
export { AGENT_TOOLS, getTool, requiresApproval };

export interface Env {
  AI: WorkerAi;
  DB: D1Database;
  MagicAgent: DurableObjectNamespace;
  IssueReviewer: DurableObjectNamespace;
  FeatureSuggester: DurableObjectNamespace;
  MODEL_ID?: string;
}

export interface WorkerAi {
  run(
    model: string,
    options: {
      messages: { role: string; content: string }[];
      stream?: boolean;
      response_format?: { type: string };
    },
  ): Promise<unknown>; // Worker AI returns various types depending on options
}

export interface AiResponse {
  response?: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AgentState {
  messages: Message[];
  projectId?: string;
  config: Record<string, unknown>;
  suggestedTemplate?: string;
  toolCalls: ToolCall[];
  pendingApprovals: PendingApproval[];
  toolsEnabled: boolean;
}

const MODELS = {
  chat: "@cf/meta/llama-3.1-8b-instruct",
  complex: "@cf/meta/llama-3.1-70b-instruct",
  fast: "@cf/mistral/mistral-7b-instruct-v0.2",
  code: "@cf/deepseek-ai/deepseek-coder-33b-instruct",
};

class ModelRouter {
  static route(content: string): keyof typeof MODELS {
    const complexityScore = (
      content.match(/code|function|class|api|database|schema/gi) || []
    ).length;
    if (content.length > 500 || complexityScore > 3) return "complex";
    if (content.match(/write|generate|create/i) && complexityScore > 0)
      return "code";
    if (content.length < 50) return "fast";
    return "chat";
  }
}

/**
 * MagicAgent - Stateful AI App Builder with Tool Use
 */
export class MagicAgent extends Agent<Env, AgentState> {
  override initialState: AgentState = {
    messages: [],
    config: {},
    toolCalls: [],
    pendingApprovals: [],
    toolsEnabled: true,
  };

  override async onMessage(connection: Connection, message: WSMessage) {
    if (typeof message !== "string") return;
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "chat":
          await this.handleChat(connection, data.content, data.userId);
          break;
        case "approve_tool":
          await this.handleApproval(
            connection,
            data.approvalId,
            true,
            data.userId,
          );
          break;
        case "reject_tool":
          await this.handleApproval(
            connection,
            data.approvalId,
            false,
            data.userId,
          );
          break;
        case "get_pending_approvals":
          this.sendPendingApprovals(connection);
          break;
        case "enable_tools":
          this.setState({ ...this.state, toolsEnabled: data.enabled ?? true });
          connection.send(
            JSON.stringify({
              type: "tools_status",
              enabled: this.state.toolsEnabled,
            }),
          );
          break;
        default:
          connection.send(
            JSON.stringify({ type: "error", message: "Unknown message type" }),
          );
      }
    } catch {
      connection.send(
        JSON.stringify({ type: "error", message: "Invalid JSON" }),
      );
    }
  }

  /**
   * Send pending approvals to the client
   */
  private sendPendingApprovals(connection: Connection) {
    const pending = this.state.pendingApprovals.filter(
      a => a.status === "pending",
    );
    connection.send(
      JSON.stringify({
        type: "pending_approvals",
        approvals: pending,
      }),
    );
  }

  /**
   * Handle tool approval/rejection
   */
  private async handleApproval(
    connection: Connection,
    approvalId: string,
    approved: boolean,
    userId?: string,
  ) {
    const approvalIndex = this.state.pendingApprovals.findIndex(
      a => a.id === approvalId,
    );
    if (approvalIndex === -1) {
      connection.send(
        JSON.stringify({ type: "error", message: "Approval not found" }),
      );
      return;
    }

    const approval = this.state.pendingApprovals[approvalIndex];
    const updatedApproval: PendingApproval = {
      ...approval,
      status: approved ? "approved" : "rejected",
      approvedBy: userId,
      approvedAt: Date.now(),
    };

    const updatedApprovals = [...this.state.pendingApprovals];
    updatedApprovals[approvalIndex] = updatedApproval;
    this.setState({ ...this.state, pendingApprovals: updatedApprovals });

    connection.send(
      JSON.stringify({
        type: "approval_result",
        approvalId,
        approved,
        tool: approval.tool,
      }),
    );

    if (approved) {
      // Execute the approved tool
      await this.executeTool(connection, approval);
    }
  }

  /**
   * Execute an approved tool
   */
  private async executeTool(connection: Connection, approval: PendingApproval) {
    const tool = getTool(approval.tool);
    if (!tool) {
      connection.send(
        JSON.stringify({
          type: "tool_error",
          tool: approval.tool,
          error: "Unknown tool",
        }),
      );
      return;
    }

    connection.send(
      JSON.stringify({
        type: "tool_executing",
        tool: approval.tool,
        parameters: approval.parameters,
      }),
    );

    try {
      // Tool execution logic - this would integrate with actual file system/commands
      // For now, we send a placeholder result
      const result = await this.executeToolAction(
        approval.tool,
        approval.parameters,
      );

      connection.send(
        JSON.stringify({
          type: "tool_result",
          tool: approval.tool,
          result,
          success: true,
        }),
      );

      // Update tool call status
      const toolCallIndex = this.state.toolCalls.findIndex(
        tc => tc.tool === approval.tool && tc.status === "pending",
      );
      if (toolCallIndex !== -1) {
        const updatedToolCalls = [...this.state.toolCalls];
        updatedToolCalls[toolCallIndex] = {
          ...updatedToolCalls[toolCallIndex],
          status: "executed",
          result,
        };
        this.setState({ ...this.state, toolCalls: updatedToolCalls });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      connection.send(
        JSON.stringify({
          type: "tool_error",
          tool: approval.tool,
          error,
        }),
      );
    }
  }

  /**
   * Execute specific tool actions
   * This is a placeholder - real implementation would integrate with file system, etc.
   */
  private async executeToolAction(
    toolName: string,
    parameters: Record<string, unknown>,
  ): Promise<unknown> {
    switch (toolName) {
      case "readFile":
        // TODO: Integrate with actual file reading via project storage
        return {
          content: `[File content for ${parameters.path}]`,
          path: parameters.path,
        };

      case "writeFile":
        // TODO: Integrate with actual file writing
        return {
          success: true,
          path: parameters.path,
          message: "File written successfully",
        };

      case "listFiles":
        // TODO: Integrate with actual directory listing
        return {
          files: ["src/index.ts", "package.json"],
          path: parameters.path || ".",
        };

      case "searchCode":
        // TODO: Integrate with actual code search
        return { matches: [], query: parameters.query };

      case "runCommand":
        // TODO: Integrate with command execution (with strict sandboxing)
        return {
          output: `[Command output for: ${parameters.command}]`,
          exitCode: 0,
        };

      case "generateComponent":
        // TODO: Integrate with template generation
        return {
          created: [`${parameters.directory || "src"}/${parameters.name}.tsx`],
        };

      case "deployToCloudflare":
        // TODO: Integrate with Wrangler deployment
        return {
          url: "https://example.workers.dev",
          environment: parameters.environment || "production",
        };

      case "deleteFile":
        // TODO: Integrate with file deletion
        return { deleted: parameters.path };

      default:
        throw new Error(`Tool not implemented: ${toolName}`);
    }
  }

  private async handleChat(
    connection: Connection,
    content: string,
    userId?: string,
  ) {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    const updatedMessages = [...this.state.messages, userMessage];
    this.setState({ ...this.state, messages: updatedMessages });

    // Determine Model
    const modelKey = ModelRouter.route(content);
    const model = MODELS[modelKey];

    const templates = registry.getMetadata();
    const templateContext = templates
      .map((t: TemplateMetadata) => `- ${t.name} (${t.slug}): ${t.description}`)
      .join("\n");

    // Build tools context if enabled
    const toolsContext = this.state.toolsEnabled
      ? `

## Available Tools
You can use the following tools to help the user. To use a tool, output:
TOOL_CALL:toolName{"param1":"value1","param2":"value2"}

${getToolsPrompt()}

Note: Tools marked [REQUIRES APPROVAL] will need user approval before execution.
`
      : "";

    const systemPrompt = `You are the MagicAppDev assistant, an expert AI App Builder.
You are running on Cloudflare Workers and using ${modelKey} model.

Available templates:
${templateContext}
${toolsContext}
GOAL: Help the user build their app.
1. Understand the user's intent.
2. If a template fits, suggest it using "SUGGEST_TEMPLATE: [slug]" in your response.
3. Use tools when appropriate to read files, write code, or execute commands.
4. Provide code snippets, architectural advice, and commands using the CLI.
5. Be concise but helpful.

User Request: ${content}`;

    try {
      const stream = (await this.env.AI.run(model, {
        messages: [
          { role: "system", content: systemPrompt },
          ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      })) as ReadableStream;

      let assistantContent = "";
      const decoder = new TextDecoder();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of stream as any) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data) as AiResponse;
              if (parsed.response) {
                assistantContent += parsed.response;
                connection.send(
                  JSON.stringify({
                    type: "chat_chunk",
                    content: parsed.response,
                  }),
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Extract template suggestion
      const match = assistantContent.match(/SUGGEST_TEMPLATE: ([a-zA-Z0-9-]+)/);
      if (match) {
        this.setState({ ...this.state, suggestedTemplate: match[1] });
      }

      // Parse tool calls from the response
      const toolCalls = this.state.toolsEnabled
        ? parseToolCalls(assistantContent)
        : [];
      const newPendingApprovals: PendingApproval[] = [];
      const autoExecuteTools: ToolCall[] = [];

      for (const toolCall of toolCalls) {
        if (requiresApproval(toolCall.tool)) {
          // Create pending approval for dangerous tools
          const approval = createPendingApproval(
            this.ctx.id.toString(),
            connection.id || "unknown",
            toolCall,
            userId,
          );
          newPendingApprovals.push(approval);

          // Notify client about pending approval
          connection.send(
            JSON.stringify({
              type: "tool_pending_approval",
              approval,
            }),
          );
        } else {
          // Safe tools can be auto-executed
          autoExecuteTools.push(toolCall);
        }
      }

      this.setState({
        ...this.state,
        messages: [
          ...this.state.messages,
          {
            role: "assistant",
            content: assistantContent,
            timestamp: Date.now(),
          },
        ],
        toolCalls: [...this.state.toolCalls, ...toolCalls],
        pendingApprovals: [
          ...this.state.pendingApprovals,
          ...newPendingApprovals,
        ],
      });

      // Auto-execute safe tools
      for (const toolCall of autoExecuteTools) {
        try {
          const result = await this.executeToolAction(
            toolCall.tool,
            toolCall.parameters,
          );
          connection.send(
            JSON.stringify({
              type: "tool_result",
              tool: toolCall.tool,
              result,
              success: true,
              autoExecuted: true,
            }),
          );
        } catch (err) {
          const error = err instanceof Error ? err.message : String(err);
          connection.send(
            JSON.stringify({
              type: "tool_error",
              tool: toolCall.tool,
              error,
              autoExecuted: true,
            }),
          );
        }
      }

      connection.send(
        JSON.stringify({
          type: "chat_done",
          suggestedTemplate: this.state.suggestedTemplate,
          toolCalls: toolCalls.length,
          pendingApprovals: newPendingApprovals.length,
        }),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      connection.send(
        JSON.stringify({ type: "error", message: "AI failed: " + message }),
      );
    }
  }
}

/**
 * IssueReviewer - Autonomous Repo Maintenance
 */
export class IssueReviewer extends Agent<Env, { lastProcessedIssue?: string }> {
  override async onRequest(): Promise<Response> {
    // const { issue } = await request.json() as any;
    // Analysis logic here...
    return Response.json({
      status: "reviewed",
      suggestions: ["Add more tests", "Refactor auth"],
    });
  }
}

/**
 * FeatureSuggester - Roadmap Generator
 */
export class FeatureSuggester extends Agent<Env, { ideas: string[] }> {
  override async onRequest(request: Request): Promise<Response> {
    const { context } = (await request.json().catch(() => ({}))) as {
      context?: string;
    };

    const systemPrompt = `You are a product manager expert.
Generate 3-5 high-impact feature suggestions for a software project.
Context: ${context || "A fullstack app builder platform"}
Output JSON format: { "suggestions": ["Idea 1", "Idea 2"] }`;

    try {
      const response = (await this.env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [{ role: "system", content: systemPrompt }],
          response_format: { type: "json_object" },
        },
      )) as AiResponse | { response: string };

      const result =
        "response" in response && typeof response.response === "string"
          ? JSON.parse(response.response)
          : response;

      return Response.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      return Response.json(
        { error: "AI failed", details: message },
        { status: 500 },
      );
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/agent/")) {
      const id = path.split("/")[3] || "default";
      return env.MagicAgent.get(env.MagicAgent.idFromName(id)).fetch(request);
    }

    // Support standard agents SDK client
    if (path.startsWith("/agents/magic-agent/")) {
      const id = path.split("/")[3] || "default";
      return env.MagicAgent.get(env.MagicAgent.idFromName(id)).fetch(request);
    }
    if (path.startsWith("/api/reviewer/")) {
      return env.IssueReviewer.get(
        env.IssueReviewer.idFromName("global"),
      ).fetch(request);
    }
    if (path.startsWith("/api/suggester/")) {
      return env.FeatureSuggester.get(
        env.FeatureSuggester.idFromName("global"),
      ).fetch(request);
    }

    return new Response("MagicAppDev Agents Worker", { status: 200 });
  },
};
