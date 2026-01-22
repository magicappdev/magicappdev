/**
 * Type definitions for MagicAppDev platform
 */

// Common utility types
export type {
  AsyncResult,
  Awaited,
  DeepPartial,
  Environment,
  Id,
  LogLevel,
  PaginatedResponse,
  PaginationParams,
  RequiredKeys,
  Result,
  SortOrder,
  SortParams,
  Timestamp,
} from "./common.types";

// Application domain types
export type {
  Deployment,
  DeploymentProvider,
  DeploymentStatus,
  Project,
  ProjectConfig,
  ProjectFramework,
  ProjectStatus,
  Template,
  TemplateCategory,
  TemplateFile,
  TemplateVariable,
  User,
} from "./app.types";

// CLI types
export type {
  AddCommandOptions,
  BuildCommandOptions,
  CliCommand,
  CliGlobalOptions,
  CliTheme,
  DeployCommandOptions,
  DoctorCheckResult,
  DoctorCommandOptions,
  GenerateCommandOptions,
  GeneratorConfig,
  GeneratorType,
  InitCommandOptions,
  ProjectManifest,
} from "./cli.types";

// API types
export type {
  AiChatRequest,
  AiChatResponse,
  AiMessage,
  AiMessageRole,
  AiProvider,
  ApiErrorResponse,
  ApiResponse,
  AuthResponse,
  CreateProjectRequest,
  DeployRequest,
  DeployResponse,
  GitHubConnectRequest,
  GitHubConnectResponse,
  GitHubRepo,
  ListProjectsRequest,
  ListProjectsResponse,
  ListTemplatesRequest,
  ListTemplatesResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProjectRequest,
} from "./api.types";
