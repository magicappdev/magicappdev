/**
 * API types for request/response contracts
 */
import type {
  Deployment,
  Project,
  ProjectConfig,
  Template,
  User,
} from "./app.types.js";
import type {
  Id,
  PaginatedResponse,
  PaginationParams,
} from "./common.types.js";
/** API error response structure */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
/** API response wrapper */
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ApiErrorResponse;
    };
/** Auth request - login */
export interface LoginRequest {
  email: string;
  password: string;
}
/** Auth request - register */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
/** Auth response */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
/** Create project request */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  config: ProjectConfig;
  templateId?: Id;
}
/** Update project request */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  config?: Partial<ProjectConfig>;
  status?: Project["status"];
}
/** List projects request */
export interface ListProjectsRequest extends PaginationParams {
  status?: Project["status"];
  search?: string;
}
/** List projects response */
export type ListProjectsResponse = PaginatedResponse<Project>;
/** List templates request */
export interface ListTemplatesRequest extends PaginationParams {
  category?: Template["category"];
  framework?: Template["framework"];
  search?: string;
}
/** List templates response */
export type ListTemplatesResponse = PaginatedResponse<Template>;
/** AI provider type */
export type AiProvider =
  | "workers-ai"
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter";
/** AI chat message role */
export type AiMessageRole = "system" | "user" | "assistant";
/** AI chat message */
export interface AiMessage {
  role: AiMessageRole;
  content: string;
}
/** AI chat request */
export interface AiChatRequest {
  projectId?: Id;
  messages: AiMessage[];
  provider?: AiProvider;
  model?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}
/** AI chat response (non-streaming) */
export interface AiChatResponse {
  message: AiMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
/** Deploy request */
export interface DeployRequest {
  projectId: Id;
  provider: Deployment["provider"];
  branch?: string;
  production?: boolean;
}
/** Deploy response */
export interface DeployResponse {
  deployment: Deployment;
}
/** GitHub connect request */
export interface GitHubConnectRequest {
  code: string;
  state: string;
}
/** GitHub repo */
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
  defaultBranch: string;
}
/** GitHub connect response */
export interface GitHubConnectResponse {
  connected: boolean;
  username?: string;
  repos?: GitHubRepo[];
}
//# sourceMappingURL=api.types.d.ts.map
