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

  generateMultiFileProject: {
    name: "generateMultiFileProject",
    description:
      "Generate a complete multi-file project from a template and natural language prompt",
    parameters: {
      templateSlug: {
        type: "string",
        description:
          "Template slug (e.g., 'react-spa', 'next-app', 'ionic-app', 'cf-workers-api')",
        required: true,
      },
      projectName: {
        type: "string",
        description: "Name of the project",
        required: true,
      },
      variables: {
        type: "object",
        description: "Template variables and configuration options",
        required: false,
      },
    },
    requiresApproval: true,
  },

  batchWriteFiles: {
    name: "batchWriteFiles",
    description:
      "Write multiple files simultaneously into the project workspace",
    parameters: {
      files: {
        type: "object",
        description: "Array of files with path and content",
        required: true,
      },
    },
    requiresApproval: true,
  },

  patchError: {
    name: "patchError",
    description:
      "Analyze a preview/runtime error and auto-apply the fix to the project file in D1",
    parameters: {
      errorMessage: {
        type: "string",
        description:
          "The error message string (e.g. 'ReferenceError: foo is not defined')",
        required: true,
      },
      filePath: {
        type: "string",
        description: "File path where the error occurred (e.g. 'src/App.tsx')",
        required: false,
      },
      errorType: {
        type: "string",
        description:
          "Category of the error: 'runtime', 'build', 'syntax', or 'network'",
        required: false,
      },
      stackTrace: {
        type: "string",
        description: "The full stack trace, if available",
        required: false,
      },
    },
    requiresApproval: true,
  },

  mcpConnect: {
    name: "mcpConnect",
    description:
      "Connect to an external MCP (Model Context Protocol) server by URL. Use this before calling external tools. If the server requires OAuth, the user will be redirected to authorize.",
    parameters: {
      url: {
        type: "string",
        description: "MCP server URL (e.g. 'https://mcp.example.com/mcp')",
        required: true,
      },
      name: {
        type: "string",
        description: "Friendly name for this connection",
        required: true,
      },
    },
    requiresApproval: true,
  },

  mcpCallTool: {
    name: "mcpCallTool",
    description:
      "Call a tool exposed by a connected MCP server. Requires mcpConnect first.",
    parameters: {
      connectionName: {
        type: "string",
        description:
          "Friendly name of the MCP connection to use (as registered in mcpConnect)",
        required: true,
      },
      toolName: {
        type: "string",
        description: "Name of the tool to call on the MCP server",
        required: true,
      },
      arguments: {
        type: "object",
        description: "Arguments to pass to the MCP tool",
        required: false,
      },
    },
    requiresApproval: true,
  },

  mcpListTools: {
    name: "mcpListTools",
    description:
      "List all tools available from all connected MCP servers. Returns tool names, descriptions, and their source server.",
    parameters: {
      connectionName: {
        type: "string",
        description:
          "Optional: filter to a specific MCP connection name. If omitted, lists from all connections.",
        required: false,
      },
    },
    requiresApproval: false,
  },

  mcpReadResource: {
    name: "mcpReadResource",
    description:
      "Read a resource exposed by a connected MCP server (e.g. a file, database record, or API data).",
    parameters: {
      connectionName: {
        type: "string",
        description: "Name of the MCP connection to use",
        required: true,
      },
      uri: {
        type: "string",
        description:
          "URI of the resource to read (e.g. 'file:///path/to/file')",
        required: true,
      },
    },
    requiresApproval: true,
  },

  mcpGetPrompt: {
    name: "mcpGetPrompt",
    description: "Retrieve a prompt template from a connected MCP server.",
    parameters: {
      connectionName: {
        type: "string",
        description: "Name of the MCP connection to use",
        required: true,
      },
      promptName: {
        type: "string",
        description: "Name of the prompt to retrieve",
        required: true,
      },
      arguments: {
        type: "object",
        description: "Arguments to fill in the prompt template",
        required: false,
      },
    },
    requiresApproval: true,
  },

  mcpRemoveServer: {
    name: "mcpRemoveServer",
    description:
      "Disconnect from and remove an MCP server connection. The server's tools will no longer be available.",
    parameters: {
      connectionName: {
        type: "string",
        description: "Name of the MCP connection to remove",
        required: true,
      },
    },
    requiresApproval: true,
  },

  startWizard: {
    name: "startWizard",
    description:
      "Start the MagicAppDev project wizard in the web app. Use this when the user wants to create a new app and you want to guide them through template selection, naming, preview, and deployment.",
    parameters: {
      idea: {
        type: "string",
        description:
          "The user's idea or description of what they want to build",
        required: true,
      },
    },
    requiresApproval: false,
  },

  advanceWizard: {
    name: "advanceWizard",
    description: "Advance the project wizard to the next step.",
    parameters: {},
    requiresApproval: false,
  },

  selectWizardTemplate: {
    name: "selectWizardTemplate",
    description: "Select a template in the project wizard by slug or id.",
    parameters: {
      templateId: {
        type: "string",
        description: "Template slug or id to select",
        required: true,
      },
    },
    requiresApproval: false,
  },

  setWizardProjectName: {
    name: "setWizardProjectName",
    description: "Set the project name in the wizard.",
    parameters: {
      name: {
        type: "string",
        description: "Project name",
        required: true,
      },
    },
    requiresApproval: false,
  },

  completeWizard: {
    name: "completeWizard",
    description:
      "Complete the wizard by saving the generated project to the workspace.",
    parameters: {},
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
  let match = toolCallRegex.exec(text);

  while (match !== null) {
    const toolName = match[1];
    const paramsJson = match[2];
    try {
      const parameters = JSON.parse(paramsJson) as Record<string, unknown>;
      calls.push({
        id: crypto.randomUUID(),
        tool: toolName,
        parameters,
        status: "pending",
        timestamp: Date.now(),
      });
    } catch {
      console.warn(`Invalid tool call JSON: ${paramsJson}`);
    }
    match = toolCallRegex.exec(text);
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
