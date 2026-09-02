import {
  AGENT_TOOLS,
  type PendingApproval,
  type ToolCall,
  type ToolDefinition,
  createPendingApproval,
  getTool,
  getToolsPrompt,
  parseToolCalls,
  requiresApproval,
} from "./tools";
import {
  compileTemplate,
  compileFilePath,
  evaluateCondition,
  generateFromTemplate,
} from "@magicappdev/templates";
import { createDatabase, projectFiles, eq, and } from "@magicappdev/database";
import type { Template, TemplateMetadata } from "@magicappdev/templates";
import { registry } from "@magicappdev/templates/registry";
import type { Connection, WSMessage } from "agents";
import { Agent, routeAgentRequest } from "agents";

/** Generated file result */
interface GeneratedFile {
  path: string;
  content: string;
}

/** Project generation result */
interface GenerateProjectResult {
  success: boolean;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  error?: string;
}

// Re-export tool types for external use
export { AGENT_TOOLS, getTool, requiresApproval };
export type { PendingApproval, ToolCall, ToolDefinition };

export interface Env {
  AI: WorkerAi;
  DB: D1Database;
  AI_CACHE: KVNamespace;
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
  suggestedPrompts?: string[];
  toolCalls: ToolCall[];
  pendingApprovals: PendingApproval[];
  toolsEnabled: boolean;
}

const MODELS = {
  chat: "@cf/meta/llama-3.1-8b-instruct-fp8",
  complex: "@cf/meta/llama-3.3-70b-instruct-fp8",
  fast: "@cf/meta/llama-3.2-3b-instruct",
  code: "@cf/qwen/qwen2.5-coder-32b-instruct",
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

// Dynamic prompt templates based on context
export const PROMPT_TEMPLATES = {
  // UI/Theme generation context
  ui_theme: {
    system: `You are a professional UI/UX designer and frontend developer. Your task is to generate modern, responsive React components with Tailwind CSS styling based on the user's requirements. Focus on creating clean, accessible, and visually appealing interfaces. Consider the following context:

    1. User is asking for UI components or theme design
    2. Generate components that follow modern design patterns
    3. Use appropriate Tailwind CSS classes for styling
    4. Ensure components are reusable and well-structured
    5. Consider responsive design principles
    6. Use proper accessibility practices

    When generating code, create components that are:
    - Clean and maintainable
    - Responsive across devices
    - Accessible with proper ARIA attributes
    - Visually appealing with modern design
    - Well-documented with clear props

    Generate React components with TypeScript and Tailwind CSS. Include proper imports and export statements.`,

    user: `Generate modern UI components with Tailwind CSS based on my requirements. I need:`,
  },

  // CSS generator context
  css_generator: {
    system: `You are a professional CSS developer specializing in modern CSS frameworks and design systems. Your task is to generate clean, efficient CSS with modern design principles. Focus on creating styles that are:

    1. Modern and visually appealing
    2. Responsive and mobile-first
    3. Accessible and inclusive
    4. Well-organized and maintainable
    5. Following best practices for performance

    Generate CSS that:
    - Uses modern CSS features (flexbox, grid, custom properties)
    - Is responsive across all device sizes
    - Follows BEM or similar naming conventions
    - Includes proper media queries
    - Uses CSS custom properties for theming
    - Is optimized for performance

    Create a complete CSS file with all necessary styles for the requested components.`,

    user: `Generate modern CSS styles for the following components:`,
  },

  // App preview context
  app_preview: {
    system: `You are MagicAppDev, an AI that scaffolds real, downloadable app projects.

When the user wants to BUILD, CREATE, MAKE, or GENERATE an app, website, API, or tool, you MUST output on its own line:
GENERATE: <slug> "<Project Name>"

Available template slugs:
- react-spa   → React 18 + Vite + TypeScript + Tailwind CSS, deploys to Cloudflare Pages
- next-app    → Next.js 14 App Router + Cloudflare Pages adapter (full-stack)
- cf-workers-api → Hono REST API on Cloudflare Workers with D1 database
- expo-app    → Expo SDK 52 + Expo Router for iOS/Android/Web
- ionic       → Ionic + Capacitor mobile app

Examples:
- "Build a compound interest calculator" → GENERATE: react-spa "Compound Interest Calculator"
- "Create a React Native todo list" → GENERATE: expo-app "Todo List"
- "Build a REST API for my blog" → GENERATE: cf-workers-api "Blog API"
- "Make a Next.js e-commerce site" → GENERATE: next-app "E-Commerce Site"

Default to react-spa for general web apps. After the GENERATE line, briefly explain what was scaffolded and suggest next steps. At the end output: SUGGEST_PROMPTS: ["prompt1", "prompt2", "prompt3"]`,
  },
};

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

  // Rate limiting for MCP WebSocket handlers (max 5 ops per 10s per connection)
  private mcpRateLimits = new Map<string, number[]>();
  private readonly MCP_RATE_LIMIT = { max: 5, windowMs: 10_000 };

  override async onStart() {
    const servers = this.getMcpServers();
    const readyCount = Object.values(servers.servers).filter(
      s => s.state === "ready",
    ).length;
    if (readyCount > 0) {
      console.log(`MCP: ${readyCount} server(s) restored from storage`);
    }
    this.cleanupMcpRateLimits();
  }

  override async onMessage(connection: Connection, message: WSMessage) {
    if (typeof message !== "string") return;
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "chat":
          await this.handleChat(
            connection,
            data.content,
            data.userId,
            data.model,
          );
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
        case "generate_project":
          await this.handleGenerateProject(
            connection,
            data.templateSlug,
            data.projectName,
            data.variables || {},
          );
          break;
        case "list_templates":
          this.handleListTemplates(connection);
          break;
        case "mcp_list_servers":
          if (!this.mcpRateLimitCheck(connection)) {
            this.sendRateLimited(connection);
            break;
          }
          this.handleMcpListServers(connection);
          break;
        case "mcp_connect":
          if (!this.mcpRateLimitCheck(connection)) {
            this.sendRateLimited(connection);
            break;
          }
          await this.handleMcpConnect(connection, data);
          break;
        case "mcp_remove_server":
          if (!this.mcpRateLimitCheck(connection)) {
            this.sendRateLimited(connection);
            break;
          }
          await this.handleMcpRemoveServer(connection, data);
          break;
        case "mcp_list_tools":
          if (!this.mcpRateLimitCheck(connection)) {
            this.sendRateLimited(connection);
            break;
          }
          this.handleMcpListTools(connection, data);
          break;
        case "preview_error":
          await this.handlePreviewError(connection, data);
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
   * List available templates
   */
  private handleListTemplates(connection: Connection) {
    const templates = registry.getMetadata();
    connection.send(
      JSON.stringify({
        type: "templates_list",
        templates: templates.map((t: TemplateMetadata) => ({
          slug: t.slug,
          name: t.name,
          description: t.description,
          category: t.category,
          frameworks: t.frameworks,
        })),
      }),
    );
  }

  /**
   * Rate limit check for MCP operations — max N calls per window per connection.
   */
  private mcpRateLimitCheck(connection: Connection): boolean {
    const now = Date.now();
    const windowStart = now - this.MCP_RATE_LIMIT.windowMs;
    const key = connection.id || "unknown";
    const calls = this.mcpRateLimits.get(key) || [];

    // Prune old entries
    const recent = calls.filter(t => t > windowStart);
    recent.push(now);
    this.mcpRateLimits.set(key, recent);

    return recent.length <= this.MCP_RATE_LIMIT.max;
  }

  /**
   * Send a rate-limit error response to the client
   */
  private sendRateLimited(connection: Connection) {
    connection.send(
      JSON.stringify({
        type: "mcp_error",
        message: "Rate limit exceeded. Please wait before trying again.",
      }),
    );
  }

  /**
   * Prune stale rate-limit entries to prevent unbounded map growth
   */
  private cleanupMcpRateLimits() {
    if (this.mcpRateLimits.size < 100) return;
    const cutoff = Date.now() - this.MCP_RATE_LIMIT.windowMs;
    for (const [key, timestamps] of this.mcpRateLimits) {
      const recent = timestamps.filter(t => t > cutoff);
      if (recent.length === 0) {
        this.mcpRateLimits.delete(key);
      } else {
        this.mcpRateLimits.set(key, recent);
      }
    }
  }

  /**
   * List all connected MCP servers and their tool counts
   */
  private handleMcpListServers(connection: Connection) {
    const servers = this.getMcpServers();
    const serverList = Object.entries(servers.servers).map(([id, server]) => {
      const toolCount = servers.tools.filter(t => t.serverId === id).length;
      return {
        id,
        name: server.name,
        url: server.server_url,
        state: server.state,
        toolCount,
      };
    });

    connection.send(
      JSON.stringify({
        type: "mcp_servers_list",
        servers: serverList,
        count: serverList.length,
      }),
    );
  }

  /**
   * Handle client-initiated MCP server connection
   */
  private async handleMcpConnect(
    connection: Connection,
    data: Record<string, unknown>,
  ) {
    const url = (data.url as string) || "";
    const name = (data.name as string) || "";

    if (!url || !name) {
      connection.send(
        JSON.stringify({
          type: "mcp_error",
          message: "mcp_connect requires 'url' and 'name'",
        }),
      );
      return;
    }

    try {
      const result = await Promise.race([
        this.addMcpServer(name, url),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("MCP connection timed out (30s)")),
            30_000,
          ),
        ),
      ]);

      connection.send(
        JSON.stringify({
          type: "mcp_connection_result",
          name,
          url,
          state: result.state,
          authUrl: result.authUrl,
          serverId: result.id,
        }),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      connection.send(
        JSON.stringify({
          type: "mcp_error",
          message: `MCP connection failed: ${msg}`,
        }),
      );
    }
  }

  /**
   * Handle client-initiated MCP server removal
   */
  private async handleMcpRemoveServer(
    connection: Connection,
    data: Record<string, unknown>,
  ) {
    const name = (data.name as string) || "";

    if (!name) {
      connection.send(
        JSON.stringify({
          type: "mcp_error",
          message: "mcp_remove_server requires 'name'",
        }),
      );
      return;
    }

    const serverId = this.findMcpServerId(name);
    if (!serverId) {
      connection.send(
        JSON.stringify({
          type: "mcp_remove_result",
          name,
          success: true,
          message: `No MCP connection named "${name}" was found.`,
        }),
      );
      return;
    }

    try {
      await this.removeMcpServer(serverId);
      connection.send(
        JSON.stringify({
          type: "mcp_remove_result",
          name,
          success: true,
          message: `Disconnected from MCP server "${name}".`,
        }),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      connection.send(
        JSON.stringify({
          type: "mcp_error",
          message: `MCP server removal failed: ${msg}`,
        }),
      );
    }
  }

  /**
   * List tools from all (or a specific) MCP server(s)
   */
  private handleMcpListTools(
    connection: Connection,
    data: Record<string, unknown>,
  ) {
    const name = (data.name as string) || undefined;
    const servers = this.getMcpServers();

    let tools = servers.tools;
    if (name) {
      const serverId = this.findMcpServerId(name);
      if (!serverId) {
        connection.send(
          JSON.stringify({
            type: "mcp_tools_list",
            name,
            tools: [],
            count: 0,
            message: `No MCP connection named "${name}" found.`,
          }),
        );
        return;
      }
      tools = tools.filter(t => t.serverId === serverId);
    }

    connection.send(
      JSON.stringify({
        type: "mcp_tools_list",
        name,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          serverId: t.serverId,
          serverName: servers.servers[t.serverId]?.name,
        })),
        count: tools.length,
      }),
    );
  }

  /** Infer the best template slug from user message content */
  private inferTemplateSlug(content: string): string {
    const m = content.toLowerCase();
    if (
      m.includes("react native") ||
      m.includes("expo") ||
      m.includes("ios app") ||
      m.includes("android app") ||
      m.includes("mobile app")
    )
      return "expo-app";
    if (m.includes("ionic")) return "ionic";
    if (
      m.includes("next.js") ||
      m.includes("nextjs") ||
      m.includes("ssr") ||
      m.includes("full stack") ||
      m.includes("fullstack")
    )
      return "next-app";
    if (
      m.includes(" api") ||
      m.includes("rest api") ||
      m.includes("backend") ||
      m.includes("cloudflare workers") ||
      m.includes("hono")
    )
      return "cf-workers-api";
    return "react-spa";
  }

  /** Extract a project name from user message */
  private extractProjectName(content: string): string {
    const patterns = [
      /(?:build|create|make|generate|scaffold)\s+(?:a\s+|an\s+)?(.+?)(?:\s+app|\s+application|\s+website|\s+api|\s+site|$)/i,
      /(?:new|start)\s+(?:a\s+|an\s+)?(.+?)(?:\s+app|\s+application|\s+website|\s+api|$)/i,
    ];
    for (const pattern of patterns) {
      const m = content.match(pattern);
      if (m) {
        const name = m[1]
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-]/g, "")
          .slice(0, 50);
        if (name.length > 2) return name;
      }
    }
    return "my-app";
  }

  /**
   * Find the MCP server ID by friendly connection name.
   * Uses the Agents SDK's getMcpServers() to look up
   * the server ID from the server's `name` field.
   */
  private findMcpServerId(connectionName: string): string | undefined {
    const servers = this.getMcpServers();
    for (const [id, server] of Object.entries(servers.servers)) {
      if (server.name === connectionName) {
        return id;
      }
    }
    return undefined;
  }

  /**
   * Generate a project from a template
   */
  private async handleGenerateProject(
    connection: Connection,
    templateSlug: string,
    projectName: string,
    variables: Record<string, unknown>,
  ) {
    connection.send(
      JSON.stringify({
        type: "generation_start",
        templateSlug,
        projectName,
      }),
    );

    try {
      // Get the template
      const template = registry.get(templateSlug) as Template | undefined;
      if (!template) {
        connection.send(
          JSON.stringify({
            type: "generation_error",
            error: `Template "${templateSlug}" not found`,
          }),
        );
        return;
      }

      // Merge variables with defaults
      const finalVariables: Record<string, unknown> = {
        name: projectName,
        appName: projectName,
        ...variables,
      };

      // Apply default values from template
      for (const varDef of template.variables || []) {
        if (
          finalVariables[varDef.name] === undefined &&
          varDef.default !== undefined
        ) {
          finalVariables[varDef.name] = varDef.default;
        }
      }

      // Generate files in memory
      const result = this.generateFilesInMemory(template, finalVariables);

      if (!result.success) {
        connection.send(
          JSON.stringify({
            type: "generation_error",
            error: result.error,
          }),
        );
        return;
      }

      // Send each file to the client
      for (const file of result.files) {
        connection.send(
          JSON.stringify({
            type: "generation_file",
            path: file.path,
            content: file.content,
          }),
        );
      }

      // Send completion message
      connection.send(
        JSON.stringify({
          type: "generation_complete",
          projectName,
          templateSlug,
          fileCount: result.files.length,
          dependencies: result.dependencies,
          devDependencies: result.devDependencies,
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      connection.send(
        JSON.stringify({
          type: "generation_error",
          error: message,
        }),
      );
    }
  }

  /**
   * Generate files in memory from a template
   */
  private generateFilesInMemory(
    template: Template,
    variables: Record<string, unknown>,
  ): GenerateProjectResult {
    try {
      const files: GeneratedFile[] = [];

      for (const templateFile of template.files) {
        // Check condition
        if (templateFile.condition) {
          const shouldInclude = evaluateCondition(
            templateFile.condition,
            variables,
          );
          if (!shouldInclude) continue;
        }

        // Compile the file path
        const filePath = compileFilePath(templateFile.path, variables);

        // Compile the content
        const content = compileTemplate(templateFile.content, variables);

        files.push({ path: filePath, content });
      }

      return {
        success: true,
        files,
        dependencies: template.dependencies || {},
        devDependencies: template.devDependencies || {},
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        files: [],
        dependencies: {},
        devDependencies: {},
        error: message,
      };
    }
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
   * Execute specific tool actions using D1 project storage
   */
  private async executeToolAction(
    toolName: string,
    parameters: Record<string, unknown>,
  ): Promise<unknown> {
    const projectId = this.state.projectId;
    const db = createDatabase(this.env.DB);

    switch (toolName) {
      case "readFile": {
        if (!projectId) return { error: "No project selected" };
        const filePath = parameters.path as string;
        const file = await db.query.projectFiles.findFirst({
          where: and(
            eq(projectFiles.projectId, projectId),
            eq(projectFiles.path, filePath),
          ),
        });
        if (!file) return { error: `File not found: ${filePath}` };
        return {
          content: file.content,
          path: file.path,
          language: file.language,
        };
      }

      case "writeFile": {
        if (!projectId) return { error: "No project selected" };
        const filePath = parameters.path as string;
        const content = parameters.content as string;
        const language = filePath.split(".").pop() || "text";
        const size = content.length;

        const existing = await db.query.projectFiles.findFirst({
          where: and(
            eq(projectFiles.projectId, projectId),
            eq(projectFiles.path, filePath),
          ),
        });

        if (existing) {
          await db
            .update(projectFiles)
            .set({
              content,
              language,
              size,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(projectFiles.id, existing.id));
          return { success: true, path: filePath, message: "File updated" };
        }

        await db.insert(projectFiles).values({
          id: crypto.randomUUID(),
          projectId,
          path: filePath,
          content,
          language,
          size,
        });
        return { success: true, path: filePath, message: "File created" };
      }

      case "listFiles": {
        if (!projectId) return { error: "No project selected" };
        const dirPath = (parameters.path as string) || "";
        const pattern = parameters.pattern as string | undefined;

        let files = await db.query.projectFiles.findMany({
          where: eq(projectFiles.projectId, projectId),
        });

        // Filter by directory
        if (dirPath) {
          files = files.filter(f => f.path.startsWith(dirPath));
        }

        // Filter by glob pattern (simple implementation)
        if (pattern) {
          const regex = new RegExp(
            pattern
              .replace(/\./g, "\\.")
              .replace(/\*/g, ".*")
              .replace(/\?/g, "."),
          );
          files = files.filter(f => regex.test(f.path));
        }

        return {
          files: files.map(f => f.path),
          path: dirPath || ".",
          count: files.length,
        };
      }

      case "searchCode": {
        if (!projectId) return { error: "No project selected" };
        const query = parameters.query as string;
        const filePattern = parameters.filePattern as string | undefined;

        let files = await db.query.projectFiles.findMany({
          where: eq(projectFiles.projectId, projectId),
        });

        // Filter by file pattern
        if (filePattern) {
          const regex = new RegExp(
            filePattern
              .replace(/\./g, "\\.")
              .replace(/\*/g, ".*")
              .replace(/\?/g, "."),
          );
          files = files.filter(f => regex.test(f.path));
        }

        const matches: Array<{ path: string; line: number; content: string }> =
          [];
        const searchRegex = new RegExp(query, "gi");

        for (const file of files) {
          const lines = file.content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (searchRegex.test(lines[i])) {
              matches.push({
                path: file.path,
                line: i + 1,
                content: lines[i].trim(),
              });
            }
            searchRegex.lastIndex = 0;
          }
        }

        return { matches, query, totalMatches: matches.length };
      }

      case "runCommand":
        // Command execution is not supported in Cloudflare Workers sandbox
        // Return a helpful message instead of executing
        return {
          output: `Command execution is not available in the cloud sandbox. To run "${parameters.command}", clone the project locally.`,
          exitCode: 1,
          note: "Commands must be run locally for security",
        };

      case "generateComponent": {
        const name = parameters.name as string;
        const directory = (parameters.directory as string) || "src";
        const componentType = (parameters.type as string) || "react";

        // Find a matching template
        const templates = registry.filter({
          category: "component",
          search: componentType,
        });

        if (templates.length === 0) {
          return {
            error: `No component template found for type "${componentType}"`,
            suggestion: "Available types: react, expo, ionic",
          };
        }

        const template = templates[0];
        const result = await generateFromTemplate(template, {
          outputDir: directory,
          variables: { name, componentName: name },
          dryRun: false,
          overwrite: true,
        });

        return {
          created: result.files,
          template: template.name,
          directory,
        };
      }

      case "generateMultiFileProject": {
        const templateSlug = (parameters.templateSlug as string) || "react-spa";
        const projectName =
          (parameters.projectName as string) || "generated-app";
        const variables =
          (parameters.variables as Record<string, unknown>) || {};

        const template = registry.get(templateSlug) as Template | undefined;
        if (!template) {
          return { error: `Template "${templateSlug}" not found` };
        }

        const finalVariables: Record<string, unknown> = {
          name: projectName,
          appName: projectName,
          ...variables,
        };

        const result = this.generateFilesInMemory(template, finalVariables);
        if (!result.success) {
          return { error: result.error };
        }

        if (projectId) {
          for (const file of result.files) {
            const language = file.path.split(".").pop() || "text";
            const size = file.content.length;
            const existing = await db.query.projectFiles.findFirst({
              where: and(
                eq(projectFiles.projectId, projectId),
                eq(projectFiles.path, file.path),
              ),
            });
            if (existing) {
              await db
                .update(projectFiles)
                .set({
                  content: file.content,
                  language,
                  size,
                  updatedAt: new Date().toISOString(),
                })
                .where(eq(projectFiles.id, existing.id));
            } else {
              await db.insert(projectFiles).values({
                id: crypto.randomUUID(),
                projectId,
                path: file.path,
                content: file.content,
                language,
                size,
              });
            }
          }
        }

        return {
          success: true,
          projectName,
          templateSlug,
          fileCount: result.files.length,
          files: result.files.map(f => f.path),
          dependencies: result.dependencies,
          devDependencies: result.devDependencies,
        };
      }

      case "batchWriteFiles": {
        if (!projectId) return { error: "No project selected" };
        const fileList =
          (parameters.files as Array<{ path: string; content: string }>) || [];
        const writtenFiles: string[] = [];

        for (const file of fileList) {
          if (!file.path || typeof file.content !== "string") continue;
          const language = file.path.split(".").pop() || "text";
          const size = file.content.length;

          const existing = await db.query.projectFiles.findFirst({
            where: and(
              eq(projectFiles.projectId, projectId),
              eq(projectFiles.path, file.path),
            ),
          });

          if (existing) {
            await db
              .update(projectFiles)
              .set({
                content: file.content,
                language,
                size,
                updatedAt: new Date().toISOString(),
              })
              .where(eq(projectFiles.id, existing.id));
          } else {
            await db.insert(projectFiles).values({
              id: crypto.randomUUID(),
              projectId,
              path: file.path,
              content: file.content,
              language,
              size,
            });
          }
          writtenFiles.push(file.path);
        }

        return {
          success: true,
          writtenFiles,
          count: writtenFiles.length,
        };
      }

      case "deleteFile": {
        if (!projectId) return { error: "No project selected" };
        const filePath = parameters.path as string;
        const existing = await db.query.projectFiles.findFirst({
          where: and(
            eq(projectFiles.projectId, projectId),
            eq(projectFiles.path, filePath),
          ),
        });

        if (!existing) return { error: `File not found: ${filePath}` };

        await db.delete(projectFiles).where(eq(projectFiles.id, existing.id));
        return { deleted: filePath, success: true };
      }

      case "patchError": {
        const errorMessage = (parameters.errorMessage as string) || "";
        const filePath = (parameters.filePath as string) || "unknown";
        const errorType = (parameters.errorType as string) || "runtime";
        const stackTrace = (parameters.stackTrace as string) || "";

        const fixPrompt = `You are debugging a ${errorType} error in MagicAppDev.

Error in file: ${filePath}
Error message: ${errorMessage}
${stackTrace ? "Stack trace:\n" + stackTrace.slice(0, 500) : ""}

Analyze the error, identify the root cause, and provide a concrete patch.
Respond with a JSON object: { "summary": "one-line cause", "patch": "exact code replacement or diff", "filePath": "${filePath}" }`;

        try {
          const analysisResult = await this.fetchAnalysis(fixPrompt);
          if (
            analysisResult &&
            typeof analysisResult === "object" &&
            "patch" in analysisResult
          ) {
            const patchText =
              (analysisResult as Record<string, unknown>).patch ?? "";
            const summary =
              (analysisResult as Record<string, unknown>).summary ??
              "Patch generated";
            const patchedPath =
              ((analysisResult as Record<string, unknown>)
                .filePath as string) || filePath;

            // Write the patched file to D1
            if (
              projectId &&
              patchText &&
              patchedPath &&
              patchedPath !== "unknown"
            ) {
              const language = patchedPath.split(".").pop() || "text";
              const size = (patchText as string).length;

              const existingFile = await db.query.projectFiles.findFirst({
                where: and(
                  eq(projectFiles.projectId, projectId),
                  eq(projectFiles.path, patchedPath),
                ),
              });

              if (existingFile) {
                await db
                  .update(projectFiles)
                  .set({
                    content: patchText as string,
                    language,
                    size,
                    updatedAt: new Date().toISOString(),
                  })
                  .where(eq(projectFiles.id, existingFile.id));
              } else {
                await db.insert(projectFiles).values({
                  id: crypto.randomUUID(),
                  projectId,
                  path: patchedPath,
                  content: patchText as string,
                  language,
                  size,
                });
              }
            }

            return {
              success: true,
              errorType,
              filePath: patchedPath,
              summary,
              patch: patchText,
              applied: !!(
                projectId &&
                patchText &&
                patchedPath &&
                patchedPath !== "unknown"
              ),
            };
          }
          return {
            success: true,
            errorType,
            filePath,
            summary: "Analysis complete; see full message for details",
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `Patch analysis failed: ${message}` };
        }
      }

      case "mcpConnect": {
        const url = (parameters.url as string) || "";
        const name = (parameters.name as string) || "";

        if (!url || !name) {
          return { error: "mcpConnect requires 'url' and 'name'" };
        }

        try {
          const result = await this.addMcpServer(name, url);

          if (result.state === "authenticating") {
            return {
              success: true,
              state: "authenticating",
              authUrl: result.authUrl,
              message: `MCP server "${name}" requires OAuth authorization. Redirect the user to: ${result.authUrl}`,
            };
          }

          return {
            success: true,
            state: "ready",
            serverId: result.id,
            message: `Connected to MCP server "${name}" (id: ${result.id})`,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `MCP connection failed: ${message}` };
        }
      }

      case "mcpCallTool": {
        const connectionName = (parameters.connectionName as string) || "";
        const toolName = (parameters.toolName as string) || "";
        const toolArgs =
          (parameters.arguments as Record<string, unknown>) || {};

        const serverId = this.findMcpServerId(connectionName);
        if (!serverId) {
          return {
            error: `MCP connection "${connectionName}" not found or not ready. Use mcpConnect first and wait for it to be ready.`,
          };
        }

        try {
          const result = await this.mcp.callTool({
            name: toolName,
            arguments: toolArgs,
            serverId,
          });

          return {
            success: true,
            tool: toolName,
            result,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `MCP tool call failed: ${message}` };
        }
      }

      case "mcpListTools": {
        const connectionName = parameters.connectionName as string | undefined;
        const servers = this.getMcpServers();
        const allTools = servers.tools;

        let tools = allTools;
        if (connectionName) {
          tools = allTools.filter(t => {
            const server = servers.servers[t.serverId];
            return server && server.name === connectionName;
          });
        }

        if (tools.length === 0) {
          return {
            tools: [],
            serverNames: Object.values(servers.servers).map(s => s.name),
            message: connectionName
              ? `No tools found on MCP server "${connectionName}".`
              : "No MCP servers connected or no tools discovered yet.",
          };
        }

        return {
          success: true,
          tools: tools.map(t => ({
            name: t.name,
            description: t.description,
            serverId: t.serverId,
            serverName: servers.servers[t.serverId]?.name,
            inputSchema: t.inputSchema,
          })),
          count: tools.length,
        };
      }

      case "mcpReadResource": {
        const connectionName = (parameters.connectionName as string) || "";
        const uri = (parameters.uri as string) || "";

        if (!uri) {
          return { error: "mcpReadResource requires 'uri'" };
        }

        const serverId = this.findMcpServerId(connectionName);
        if (!serverId) {
          return {
            error: `MCP connection "${connectionName}" not found or not ready.`,
          };
        }

        try {
          const result = await this.mcp.readResource(
            { uri, serverId },
            { timeout: 30_000 },
          );

          return {
            success: true,
            uri,
            contents: result.contents,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `MCP resource read failed: ${message}` };
        }
      }

      case "mcpGetPrompt": {
        const connectionName = (parameters.connectionName as string) || "";
        const promptName = (parameters.promptName as string) || "";
        const promptArgs =
          (parameters.arguments as Record<string, unknown>) || {};

        if (!promptName) {
          return { error: "mcpGetPrompt requires 'promptName'" };
        }

        const serverId = this.findMcpServerId(connectionName);
        if (!serverId) {
          return {
            error: `MCP connection "${connectionName}" not found or not ready.`,
          };
        }

        try {
          const result = await this.mcp.getPrompt(
            {
              name: promptName,
              arguments: promptArgs as Record<string, string>,
              serverId,
            },
            { timeout: 30_000 },
          );

          return {
            success: true,
            promptName,
            description: result.description,
            messages: result.messages,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `MCP prompt fetch failed: ${message}` };
        }
      }

      case "mcpRemoveServer": {
        const connectionName = (parameters.connectionName as string) || "";

        if (!connectionName) {
          return { error: "mcpRemoveServer requires 'connectionName'" };
        }

        const serverId = this.findMcpServerId(connectionName);
        if (!serverId) {
          return {
            success: true,
            message: `No MCP connection named "${connectionName}" found.`,
          };
        }

        try {
          await this.removeMcpServer(serverId);
          return {
            success: true,
            message: `Disconnected from MCP server "${connectionName}".`,
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { error: `MCP server removal failed: ${message}` };
        }
      }

      default:
        throw new Error(`Tool not implemented: ${toolName}`);
    }
  }

  private async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  private async getCachedAIResponse(cacheKey: string): Promise<string | null> {
    if (!this.env.AI_CACHE) return null;
    try {
      return await this.env.AI_CACHE.get(`ai:${cacheKey}`);
    } catch {
      return null;
    }
  }

  private async setCachedAIResponse(
    cacheKey: string,
    response: string,
  ): Promise<void> {
    if (!this.env.AI_CACHE) return;
    try {
      await this.env.AI_CACHE.put(`ai:${cacheKey}`, response, {
        expirationTtl: 3600, // 1 hour
      });
    } catch {
      // Cache write is best-effort
    }
  }

  private async fetchAnalysis(prompt: string): Promise<unknown> {
    const response = await this.env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8",
      {
        messages: [
          {
            role: "system",
            content: "You are a debugger. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      },
    );
    const str = (response as AiResponse).response;
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  private async handlePreviewError(
    connection: Connection,
    data: Record<string, unknown>,
  ) {
    const params = (data.params || {}) as Record<string, unknown>;
    const errorMessage =
      (params.errorMessage as string) || "Unknown iframe error";
    const filePath = (params.filePath as string) || "unknown";
    const errorType = (params.errorType as string) || "runtime";
    const stackTrace = (params.stackTrace as string) || "";

    if (!this.state.toolsEnabled) {
      connection.send(
        JSON.stringify({
          type: "error",
          message: `Preview error in ${filePath}: ${errorMessage}. Enable tools for auto-patching.`,
        }),
      );
      return;
    }

    const toolCall: ToolCall = {
      id: crypto.randomUUID(),
      tool: "patchError",
      parameters: { errorMessage, filePath, errorType, stackTrace },
      status: "pending",
      timestamp: Date.now(),
    };

    if (requiresApproval("patchError")) {
      const approval = createPendingApproval(
        this.ctx.id.toString(),
        connection.id || "unknown",
        toolCall,
      );
      const updated = [...this.state.pendingApprovals, approval];
      const updatedToolCalls = [...this.state.toolCalls, toolCall];
      this.setState({
        ...this.state,
        pendingApprovals: updated,
        toolCalls: updatedToolCalls,
      });

      connection.send(
        JSON.stringify({
          type: "tool_pending_approval",
          approval,
        }),
      );
    } else {
      const updatedToolCalls = [...this.state.toolCalls, toolCall];
      this.setState({
        ...this.state,
        toolCalls: updatedToolCalls,
      });

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
        const idx = updatedToolCalls.findIndex(tc => tc.id === toolCall.id);
        if (idx !== -1) {
          updatedToolCalls[idx] = {
            ...updatedToolCalls[idx],
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
            tool: toolCall.tool,
            error,
            autoExecuted: true,
          }),
        );
      }
    }
  }

  private async handleChat(
    connection: Connection,
    content: string,
    userId?: string,
    userSelectedModel?: string,
  ) {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    const updatedMessages = [...this.state.messages, userMessage];
    this.setState({ ...this.state, messages: updatedMessages });

    // Determine Model — use user-selected model when provided, else auto-route
    const MODEL_KEY_MAP: Record<string, keyof typeof MODELS> = {
      "cloudflare-llama-3.3": "complex",
      "deepseek-r1": "complex",
      "openai-gpt-4o": "complex",
      "anthropic-claude-3.5": "complex",
    };
    const modelKey = userSelectedModel
      ? (MODEL_KEY_MAP[userSelectedModel] ?? ModelRouter.route(content))
      : ModelRouter.route(content);
    const model = MODELS[modelKey];

    const templates = registry.getMetadata();
    const templateContext = templates
      .map((t: TemplateMetadata) => `- ${t.name} (${t.slug}): ${t.description}`)
      .join("\n");

    // Build tools context if enabled
    const mcpServers = this.getMcpServers();
    const connectedMcpServers = Object.entries(mcpServers.servers).filter(
      ([, server]) => server.state === "ready",
    );

    let toolsContext = "";
    if (this.state.toolsEnabled) {
      toolsContext = `

## Available Tools
You can use the following tools to help the user. To use a tool, output:
TOOL_CALL:toolName{"param1":"value1","param2":"value2"}

${getToolsPrompt()}

Note: Tools marked [REQUIRES APPROVAL] will need user approval before execution.`;

      if (connectedMcpServers.length > 0) {
        toolsContext += `

## Connected MCP Servers
You are also connected to ${connectedMcpServers.length} MCP server(s) that expose additional tools:
${connectedMcpServers
  .map(
    ([id, server]) =>
      `- ${server.name} (id: ${id}, tools: ${(mcpServers.tools as Array<{ serverId: string }>).filter(t => t.serverId === id).length})`,
  )
  .join("\n")}
You can call these MCP server tools using the mcpCallTool action with the server's name as connectionName.`;
      }
    }

    // Determine context and select appropriate prompt template
    let systemPromptFinal = `You are the MagicAppDev assistant, an expert AI App Builder.
You are running on Cloudflare Workers and using ${modelKey} model.

Available templates:
${templateContext}
${toolsContext}
GOAL: Help the user build their app.
1. Understand the user's intent.
2. If the user wants to BUILD, CREATE, MAKE, or GENERATE an app/website/API/tool, output on its own line: GENERATE: <slug> "<Project Name>"
   Available slugs: react-spa (React + Vite + Tailwind), next-app (Next.js 14), cf-workers-api (Hono REST API + D1), expo-app (Expo mobile), ionic (Ionic mobile)
   Default to react-spa for general web apps.
3. If a template fits, also suggest it using "SUGGEST_TEMPLATE: [slug]".
    4. Use tools when appropriate to read files, write code, or execute commands. For external operations (GitHub, databases, APIs), first use mcpConnect to link an MCP server, then use mcpCallTool to invoke its tools.
5. When a preview_error event arrives, use the patchError tool to analyze the error and suggest or apply a fix.
6. Be concise but helpful.
7. At the end of your response, suggest 3 relevant follow-up prompts: SUGGEST_PROMPTS: ["prompt1", "prompt2", "prompt3"]`;
    let userPrompt = content;

    // Detect context for dynamic prompt selection
    if (
      content.toLowerCase().includes("ui") ||
      content.toLowerCase().includes("theme") ||
      content.toLowerCase().includes("component")
    ) {
      systemPromptFinal = PROMPT_TEMPLATES.ui_theme.system;
      userPrompt = PROMPT_TEMPLATES.ui_theme.user + " " + content;
    } else if (
      content.toLowerCase().includes("css") ||
      content.toLowerCase().includes("style") ||
      content.toLowerCase().includes("design")
    ) {
      systemPromptFinal = PROMPT_TEMPLATES.css_generator.system;
      userPrompt = PROMPT_TEMPLATES.css_generator.user + " " + content;
    } else if (
      content.toLowerCase().includes("app") ||
      content.toLowerCase().includes("preview") ||
      content.toLowerCase().includes("generate")
    ) {
      systemPromptFinal = PROMPT_TEMPLATES.app_preview.system;
      userPrompt = content;
    }

    const systemPrompt = `${systemPromptFinal}

User Request: ${userPrompt}`;

    try {
      // Signal that we're processing
      connection.send(
        JSON.stringify({
          type: "chat_start",
          model: modelKey,
        }),
      );

      // Check AI response cache
      const cacheInput = JSON.stringify({
        model,
        system: systemPrompt,
        messages: updatedMessages.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      });
      const cacheKey = await this.hashString(cacheInput);
      const cachedResponse = await this.getCachedAIResponse(cacheKey);

      let assistantContent = "";

      if (cachedResponse) {
        // Cache hit — send cached response directly
        assistantContent = cachedResponse;
        connection.send(
          JSON.stringify({ type: "chat_chunk", content: assistantContent }),
        );
      } else {
        // Cache miss — call AI and stream
        const aiResult = await this.env.AI.run(model, {
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedMessages
              .slice(-20)
              .map(m => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        });

        // Check if result is a ReadableStream
        if (
          aiResult &&
          typeof aiResult === "object" &&
          "getReader" in aiResult &&
          typeof (aiResult as ReadableStream).getReader === "function"
        ) {
          const stream = aiResult as ReadableStream;
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = decoder.decode(value, { stream: true });
              const lines = text.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
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
                    // Ignore parse errors for incomplete JSON
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        } else {
          // Non-streaming response fallback
          const response = aiResult as AiResponse;
          if (response && response.response) {
            assistantContent = response.response;
            connection.send(
              JSON.stringify({
                type: "chat_chunk",
                content: assistantContent,
              }),
            );
          }
        }

        // Cache the response for future requests
        if (assistantContent) {
          await this.setCachedAIResponse(cacheKey, assistantContent);
        }
      }

      // Extract template suggestion
      const match = assistantContent.match(/SUGGEST_TEMPLATE: ([a-zA-Z0-9-]+)/);
      if (match) {
        this.setState({ ...this.state, suggestedTemplate: match[1] });
      }

      // Auto-trigger project generation from GENERATE directive
      const generateMatch = assistantContent.match(
        /GENERATE:\s*([a-zA-Z0-9-]+)\s+["']?([^"'\n]+?)["']?\s*(?:\n|$)/,
      );
      if (generateMatch) {
        await this.handleGenerateProject(
          connection,
          generateMatch[1].trim(),
          generateMatch[2].trim(),
          {},
        );
      } else {
        // Fallback: if user clearly wants to build an app but LLM skipped GENERATE directive
        const buildAppRegex =
          /\b(build|create|make|scaffold|generate)\b[^.]{0,150}\b(app|application|website|web\s*app|mobile\s*app|api|dashboard|portfolio|calculator|tracker|manager|todo|game|timer|converter|tool|platform|service)\b/i;
        if (buildAppRegex.test(content)) {
          const slug = this.inferTemplateSlug(content);
          const projectName = this.extractProjectName(content);
          await this.handleGenerateProject(connection, slug, projectName, {});
        }
      }

      // Extract prompt suggestions
      const promptMatch = assistantContent.match(/SUGGEST_PROMPTS: (\[.*?\])/);
      let suggestedPrompts: string[] = [];
      if (promptMatch) {
        try {
          suggestedPrompts = JSON.parse(promptMatch[1]);
          this.setState({ ...this.state, suggestedPrompts });
        } catch (e) {
          console.error("Failed to parse suggested prompts", e);
        }
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
          suggestedPrompts: this.state.suggestedPrompts,
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
        "@cf/meta/llama-3.1-8b-instruct-fp8",
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

    // Use routeAgentRequest for agents SDK routing
    if (path.startsWith("/agents/")) {
      const response = routeAgentRequest(
        request,
        env,
      ) as unknown as Response | null;
      return response ?? new Response("Agent not found", { status: 404 });
    }

    if (path.startsWith("/api/agent/")) {
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

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    // Scheduled handler to satisfy Cloudflare Workers cron bindings and prevent KV/cron invocation errors
    ctx.waitUntil(
      Promise.resolve().then(() => {
        console.log(
          "Scheduled agent cron executed at",
          new Date(controller.scheduledTime).toISOString(),
        );
      }),
    );
  },
};
