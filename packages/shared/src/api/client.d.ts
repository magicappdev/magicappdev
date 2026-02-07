import type {
  AiMessage,
  ApiResponse,
  AuthResponse,
  Project,
  User,
} from "../types/index";
export interface Ticket {
  id: string;
  userId?: string;
  subject: string;
  message?: string;
  status: "open" | "in_progress" | "closed" | "resolved";
  createdAt: string;
  updatedAt?: string;
  userName?: string;
  userEmail?: string;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatarUrl?: string | null;
  createdAt: string;
}
export interface AdminApiKey {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  description: string | null;
  scopes: string;
  isActive: number;
  createdBy: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface SystemLog {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  category: string;
  message: string;
  details: string | null;
  userId: string | null;
  metadata: string | null;
  createdAt: string;
}
export interface GlobalConfig {
  maintenanceMode: boolean;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  maxConcurrentSessions: number;
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  loginAttemptsLimit: number;
  sessionExpiryDays: number;
}
export interface LogsStats {
  totalLogs: number;
  byLevel: Record<string, number>;
}
export declare class ApiClient {
  private baseUrl;
  private accessToken;
  constructor(baseUrl: string);
  setToken(token: string | null): void;
  request<T>(path: string, options?: RequestInit): Promise<T>;
  getGitHubLoginUrl(platform?: "web" | "mobile"): string;
  getDiscordLoginUrl(platform?: "web" | "mobile"): string;
  login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>>;
  register(data: { email: string; password: string; name: string }): Promise<
    ApiResponse<{
      success: boolean;
      message: string;
    }>
  >;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<string>;
  getCurrentUser(): Promise<User>;
  getProjects(): Promise<Project[]>;
  createProject(data: { name: string; description?: string }): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  sendMessage(messages: AiMessage[]): Promise<AiMessage>;
  submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{
    success: boolean;
  }>;
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket>;
  createTicket(data: { subject: string; message: string }): Promise<{
    id: string;
  }>;
  updateTicketStatus(
    id: string,
    status: "open" | "in_progress" | "closed" | "resolved",
  ): Promise<void>;
  getAdminUsers(): Promise<AdminUser[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    openTickets: number;
    databaseSize: string;
    activeSessions: number;
    userGrowth: string;
    ticketUrgency: string;
  }>;
  updateUserRole(id: string, role: "admin" | "user"): Promise<void>;
  getAdminApiKeys(params?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }): Promise<AdminApiKey[]>;
  createAdminApiKey(data: {
    name: string;
    description?: string;
    scopes: string[];
    expiresAt?: string;
  }): Promise<AdminApiKey>;
  deleteAdminApiKey(id: string): Promise<void>;
  getSystemLogs(params?: {
    limit?: number;
    offset?: number;
    level?: string;
    category?: string;
    userId?: string;
  }): Promise<SystemLog[]>;
  getLogsStats(): Promise<LogsStats>;
  getGlobalConfig(): Promise<GlobalConfig>;
  updateGlobalConfig(config: Partial<GlobalConfig>): Promise<GlobalConfig>;
  changePassword(data: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<void>;
  updateProfile(data: {
    name?: string;
    bio?: string;
    region?: string;
  }): Promise<void>;
  deleteAccount(): Promise<void>;
  getLinkedAccounts(): Promise<
    Array<{
      id: string;
      provider: string;
      providerAccountId: string;
      createdAt: string;
    }>
  >;
  unlinkAccount(provider: string): Promise<void>;
  getUserApiKeys(): Promise<
    Array<{
      id: string;
      name: string;
      keyPrefix: string;
      isActive: number;
      createdAt: string;
      lastUsedAt: string | null;
    }>
  >;
  createUserApiKey(name: string): Promise<{
    id: string;
    name: string;
    key: string;
    keyPrefix: string;
  }>;
  deleteUserApiKey(id: string): Promise<void>;
  getLinkAccountUrl(provider: "github" | "discord"): string;
  streamMessage(messages: AiMessage[]): AsyncGenerator<string>;
  getProjectFiles(projectId: string): Promise<
    Array<{
      id: string;
      projectId: string;
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>
  >;
  getProjectFile(
    projectId: string,
    path: string,
  ): Promise<{
    id: string;
    projectId: string;
    path: string;
    content: string;
    language: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>;
  saveProjectFile(
    projectId: string,
    file: {
      path: string;
      content: string;
      language?: string;
    },
  ): Promise<{
    id: string;
    projectId: string;
    path: string;
    content: string;
    language: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }>;
  deleteProjectFile(projectId: string, path: string): Promise<void>;
  bulkSaveProjectFiles(
    projectId: string,
    files: Array<{
      path: string;
      content: string;
      language?: string;
    }>,
  ): Promise<
    Array<{
      id: string;
      projectId: string;
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>
  >;
  createChatSession(data: { projectId?: string; title?: string }): Promise<{
    id: string;
    projectId: string | null;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }>;
  getChatSessions(): Promise<
    Array<{
      id: string;
      projectId: string | null;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>
  >;
  getChatSession(sessionId: string): Promise<{
    session: {
      id: string;
      projectId: string | null;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    };
    messages: Array<{
      id: string;
      sessionId: string;
      role: "user" | "assistant" | "system";
      content: string;
      timestamp: number;
    }>;
  }>;
  getChatContext(sessionId: string): Promise<{
    files: Array<{
      id: string;
      projectId: string;
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>;
    errors: Array<{
      id: string;
      projectId: string;
      errorType: string;
      message: string;
      stackTrace: string | null;
      filePath: string | null;
      lineNumber: number | null;
      occurredAt: string;
      resolved: boolean;
    }>;
    commands: Array<{
      id: string;
      projectId: string;
      command: string;
      exitCode: number | null;
      output: string | null;
      error: string | null;
      executedAt: string;
    }>;
    unresolvedErrors: number;
  }>;
  addChatMessage(
    sessionId: string,
    message: {
      role: "user" | "assistant" | "system";
      content: string;
    },
  ): Promise<{
    id: string;
    sessionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
  }>;
  exportProject(projectId: string): Promise<{
    version: string;
    exportedAt: string;
    project: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      status: string;
      framework: string;
      config: Record<string, unknown> | null;
      githubUrl: string | null;
      deploymentUrl: string | null;
      createdAt: string;
      updatedAt: string;
    };
    files: Array<{
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>;
    metadata: {
      fileCount: number;
      totalSize: number;
      commandCount: number;
      errorCount: number;
      unresolvedErrorCount: number;
    };
    commands: Array<{
      command: string;
      exitCode: number | null;
      output: string | null;
      error: string | null;
      executedAt: string;
    }>;
    errors: Array<{
      errorType: string;
      message: string;
      stackTrace: string | null;
      filePath: string | null;
      lineNumber: number | null;
      occurredAt: string;
      resolved: boolean;
    }>;
  }>;
  listExportableProjects(): Promise<
    Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      framework: string;
      status: string;
      fileCount: number;
      updatedAt: string;
    }>
  >;
}
//# sourceMappingURL=client.d.ts.map
