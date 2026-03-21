/**
 * Service / API client template
 */

import type { Template } from "../types.js";

export const serviceTemplate: Template = {
  id: "service",
  name: "Service",
  slug: "service",
  description: "A typed API service class for fetching data from a REST API",
  category: "service",
  frameworks: ["react-native", "expo", "next", "remix"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["service", "api", "fetch", "typescript"],
  variables: [
    {
      name: "name",
      description: "Service name (e.g. User, Project, Post)",
      type: "string",
      default: "Resource",
    },
    {
      name: "typescript",
      description: "Use TypeScript",
      type: "boolean",
      default: true,
    },
    {
      name: "baseUrl",
      description: "Base URL for the API",
      type: "string",
      default: "/api",
    },
  ],
  files: [
    {
      path: "{{camelCase name}}.service.ts",
      content: `const BASE_URL = "{{baseUrl}}";

export interface {{pascalCase name}} {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

export interface Create{{pascalCase name}}Input {
  // Add input fields here
}

export interface Update{{pascalCase name}}Input {
  // Add update fields here
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;

  const response = await fetch(\`\${BASE_URL}\${path}\`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as {
      error?: { message?: string };
    };
    const message = errorData.error?.message || \`HTTP \${response.status}: \${response.statusText}\`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/** {{pascalCase name}} Service */
export const {{camelCase name}}Service = {
  /** Get all {{camelCase name}}s */
  async list(page = 1, perPage = 20): Promise<ApiResponse<PaginatedResponse<{{pascalCase name}}>>> {
    return request(\`/{{kebabCase name}}s?page=\${page}&perPage=\${perPage}\`);
  },

  /** Get a single {{camelCase name}} by ID */
  async get(id: string): Promise<ApiResponse<{{pascalCase name}}>> {
    return request(\`/{{kebabCase name}}s/\${id}\`);
  },

  /** Create a new {{camelCase name}} */
  async create(data: Create{{pascalCase name}}Input): Promise<ApiResponse<{{pascalCase name}}>> {
    return request(\`/{{kebabCase name}}s\`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update an existing {{camelCase name}} */
  async update(id: string, data: Update{{pascalCase name}}Input): Promise<ApiResponse<{{pascalCase name}}>> {
    return request(\`/{{kebabCase name}}s/\${id}\`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Delete a {{camelCase name}} */
  async delete(id: string): Promise<ApiResponse<void>> {
    return request(\`/{{kebabCase name}}s/\${id}\`, {
      method: "DELETE",
    });
  },
};

export default {{camelCase name}}Service;
`,
    },
  ],
};
