/**
 * MagicAgent Tool Definitions
 *
 * Tools that the AI agent can use to interact with projects.
 * Some tools require human approval before execution.
 */

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "object";
  description: string;
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  requiresApproval: boolean;
}

export interface ToolCall {
  id: string;
  tool: string;
  parameters: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  result?: unknown;
  error?: string;
  timestamp: number;
}

export interface PendingApproval {
  id: string;
  agentId: string;
  sessionId: string;
  userId?: string;
  tool: string;
  parameters: Record<string, unknown>;
  description: string;
  timestamp: number;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: number;
}

/**
 * Available tools for the MagicAgent
 */
export const AGENT_TOOLS: Record<string, ToolDefinition> = {
  readFile: {
    name: "readFile",
    description: "Read content from a file in the project",
    parameters: {
      path: {
        type: "string",
        description: "Relative file path to read (e.g., 'src/app.ts')",
        required: true,
      },
    },
    requiresApproval: false,
  },

  writeFile: {
    name: "writeFile",
    description: "Write or create a file in the project",
    parameters: {
      path: {
        type: "string",
        description: "Relative file path to write (e.g., 'src/component.tsx')",
        required: true,
      },
      content: {
        type: "string",
        description: "Content to write to the file",
        required: true,
      },
    },
    requiresApproval: true,
  },

  deleteFile: {
    name: "deleteFile",
    description: "Delete a file from the project",
    parameters: {
      path: {
        type: "string",
        description: "Relative file path to delete",
        required: true,
      },
    },
    requiresApproval: true,
  },

  runCommand: {
    name: "runCommand",
    description: "Execute a shell command in the project directory",
    parameters: {
      command: {
        type: "string",
        description: "Shell command to execute (e.g., 'pnpm install lodash')",
        required: true,
      },
      cwd: {
        type: "string",
        description: "Working directory relative to project root",
        required: false,
      },
    },
    requiresApproval: true,
  },

  listFiles: {
    name: "listFiles",
    description: "List files in a directory",
    parameters: {
      path: {
        type: "string",
        description: "Directory path relative to project root",
        required: false,
      },
      pattern: {
        type: "string",
        description: "Glob pattern to filter files (e.g., '**/*.ts')",
        required: false,
      },
    },
    requiresApproval: false,
  },

  searchCode: {
    name: "searchCode",
    description: "Search for text or patterns in project files",
    parameters: {
      query: {
        type: "string",
        description: "Search query or regex pattern",
        required: true,
      },
      filePattern: {
        type: "string",
        description: "Glob pattern to filter files (e.g., '**/*.ts')",
        required: false,
      },
    },
    requiresApproval: false,
  },

  generateComponent: {
    name: "generateComponent",
    description: "Generate a new component using a template",
    parameters: {
      name: {
        type: "string",
        description: "Name of the component to generate",
        required: true,
      },
      type: {
        type: "string",
        description: "Component type (e.g., 'react', 'vue', 'solid')",
        required: true,
      },
      directory: {
        type: "string",
        description: "Directory to create the component in",
        required: false,
      },
    },
    requiresApproval: true,
  },

  deployToCloudflare: {
    name: "deployToCloudflare",
    description: "Deploy the project to Cloudflare Workers",
    parameters: {
      environment: {
        type: "string",
        description: "Deployment environment (e.g., 'production', 'staging')",
        required: false,
      },
    },
    requiresApproval: true,
  },
};

/**
 * Get tool definition by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  return AGENT_TOOLS[name];
}

/**
 * Check if a tool requires approval
 */
export function requiresApproval(toolName: string): boolean {
  const tool = AGENT_TOOLS[toolName];
  return tool?.requiresApproval ?? true; // Default to requiring approval for unknown tools
}

/**
 * Get all available tools as a formatted string for the AI prompt
 */
export function getToolsPrompt(): string {
  const toolDescriptions = Object.values(AGENT_TOOLS).map(tool => {
    const params = Object.entries(tool.parameters)
      .map(
        ([name, param]) =>
          `    - ${name} (${param.type}${param.required ? ", required" : ""}): ${param.description}`,
      )
      .join("\n");

    return `- ${tool.name}: ${tool.description}${tool.requiresApproval ? " [REQUIRES APPROVAL]" : ""}
  Parameters:
${params}`;
  });

  return toolDescriptions.join("\n\n");
}

/**
 * Parse tool calls from AI response text
 * Expected format: TOOL_CALL:toolName{"param1":"value1","param2":"value2"}
 */
export function parseToolCalls(text: string): ToolCall[] {
  const toolCallRegex = /TOOL_CALL:(\w+)(\{[^}]+\})/g;
  const calls: ToolCall[] = [];
  let match;

  while ((match = toolCallRegex.exec(text)) !== null) {
    const [, toolName, paramsJson] = match;
    try {
      const parameters = JSON.parse(paramsJson);
      calls.push({
        id: crypto.randomUUID(),
        tool: toolName,
        parameters,
        status: "pending",
        timestamp: Date.now(),
      });
    } catch {
      // Invalid JSON, skip this tool call
      console.warn(`Invalid tool call JSON: ${paramsJson}`);
    }
  }

  return calls;
}

/**
 * Generate a unique approval ID
 */
export function generateApprovalId(): string {
  return `approval_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Create a pending approval request
 */
export function createPendingApproval(
  agentId: string,
  sessionId: string,
  toolCall: ToolCall,
  userId?: string,
): PendingApproval {
  const tool = getTool(toolCall.tool);

  return {
    id: generateApprovalId(),
    agentId,
    sessionId,
    userId,
    tool: toolCall.tool,
    parameters: toolCall.parameters,
    description: tool
      ? `${tool.description} with parameters: ${JSON.stringify(toolCall.parameters)}`
      : `Unknown tool: ${toolCall.tool}`,
    timestamp: Date.now(),
    status: "pending",
  };
}
