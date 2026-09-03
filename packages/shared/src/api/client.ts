import type {
  AiChatResponse,
  AiMessage,
  ApiResponse,
  AuthResponse,
  ListProjectsResponse,
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

export class ApiClient {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private isRefreshing = false;
  onTokenRefresh: ((newToken: string) => void) | null = null;
  onAuthFailure: (() => void) | null = null;

  constructor(private baseUrl: string) {}

  setToken(token: string | null) {
    this.accessToken = token;
  }

  setRefreshToken(token: string | null) {
    this.refreshTokenValue = token;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Auto-refresh on 401 (expired token), then retry once
    if (
      response.status === 401 &&
      this.refreshTokenValue &&
      !this.isRefreshing &&
      // Don't retry refresh/logout endpoints to avoid loops
      !path.includes("/auth/refresh") &&
      !path.includes("/auth/logout")
    ) {
      this.isRefreshing = true;
      try {
        const newToken = await this.refresh(this.refreshTokenValue);
        this.onTokenRefresh?.(newToken);
      } catch {
        // Refresh token is also expired or invalid — force logout
        this.isRefreshing = false;
        this.onAuthFailure?.();
        throw new Error("Session expired. Please log in again.");
      } finally {
        this.isRefreshing = false;
      }

      // Retry original request with refreshed token
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };
      if (this.accessToken) {
        retryHeaders["Authorization"] = `Bearer ${this.accessToken}`;
      }
      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        const message =
          (errorData as { error?: { message?: string } })?.error?.message ||
          (errorData as { error?: string })?.error ||
          `API Request failed: ${retryResponse.statusText}`;
        throw new Error(message);
      }

      const retryData = await retryResponse.json();
      return retryData as T;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData as { error?: { message?: string } })?.error?.message ||
        (errorData as { error?: string })?.error ||
        `API Request failed: ${response.statusText}`;

      throw new Error(message);
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Unwrap an API response envelope.
   *
   * The API wraps every success response in `{ success: true, data: T }`.
   * This helper calls `request`, checks `success`, and returns just `T`.
   * On failure it throws with the error message from the envelope.
   */
  async unwrap<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await this.request<ApiResponse<T>>(path, options);
    if (!response.success) {
      throw new Error(response.error?.message || "Request failed");
    }
    return response.data;
  }

  getGitHubLoginUrl(
    platform: "web" | "mobile" = "web",
    redirectUri?: string,
  ): string {
    const params = new URLSearchParams({ platform });
    if (redirectUri) {
      params.set("redirect_uri", redirectUri);
    }
    return `${this.baseUrl}/auth/login/github?${params.toString()}`;
  }

  getDiscordLoginUrl(
    platform: "web" | "mobile" = "web",
    redirectUri?: string,
  ): string {
    const params = new URLSearchParams({ platform });
    if (redirectUri) {
      params.set("redirect_uri", redirectUri);
    }
    return `${this.baseUrl}/auth/login/discord?${params.toString()}`;
  }

  async login(credentials: {
    email: string;
    password: string;
    turnstileToken?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    turnstileToken?: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    this.setToken(null);
  }

  async refresh(refreshToken: string): Promise<string> {
    const response = await this.request<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    this.setToken(response.data.accessToken);
    return response.data.accessToken;
  }

  async getCurrentUser(): Promise<User> {
    return this.unwrap<User>("/auth/me");
  }

  async getProjects(): Promise<Project[]> {
    const res = await this.unwrap<ListProjectsResponse>("/projects");
    return res.data;
  }

  async createProject(data: {
    name: string;
    description?: string;
  }): Promise<Project> {
    return this.unwrap<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ ...data, config: {} }),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.unwrap<void>(`/projects/${id}`, { method: "DELETE" });
  }

  async sendMessage(messages: AiMessage[]): Promise<AiMessage> {
    const res = await this.unwrap<AiChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
    return res.message;
  }

  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    turnstileToken?: string;
  }): Promise<{ success: boolean }> {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTickets(): Promise<Ticket[]> {
    return this.unwrap<Ticket[]>("/tickets");
  }

  async getTicket(id: string): Promise<Ticket> {
    return this.unwrap<Ticket>(`/tickets/${id}`);
  }

  async createTicket(data: {
    subject: string;
    message: string;
  }): Promise<{ id: string }> {
    return this.unwrap<{ id: string }>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTicketStatus(
    id: string,
    status: "open" | "in_progress" | "closed" | "resolved",
  ): Promise<void> {
    await this.unwrap<void>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return this.unwrap<AdminUser[]>("/admin/users");
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    openTickets: number;
    databaseSize: string;
    activeSessions: number;
    userGrowth: string;
    ticketUrgency: string;
  }> {
    return this.unwrap<{
      totalUsers: number;
      openTickets: number;
      databaseSize: string;
      activeSessions: number;
      userGrowth: string;
      ticketUrgency: string;
    }>("/admin/stats");
  }

  async updateUserRole(id: string, role: "admin" | "user"): Promise<void> {
    await this.unwrap<void>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  async getAdminApiKeys(params?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }): Promise<AdminApiKey[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive));
    const query = searchParams.toString();
    return this.unwrap<AdminApiKey[]>(
      `/admin/api-keys${query ? `?${query}` : ""}`,
    );
  }

  async createAdminApiKey(data: {
    name: string;
    description?: string;
    scopes: string[];
    expiresAt?: string;
  }): Promise<AdminApiKey> {
    return this.unwrap<AdminApiKey>("/admin/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAdminApiKey(id: string): Promise<void> {
    await this.unwrap<void>(`/admin/api-keys/${id}`, { method: "DELETE" });
  }

  async getSystemLogs(params?: {
    limit?: number;
    offset?: number;
    level?: string;
    category?: string;
    userId?: string;
  }): Promise<SystemLog[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.level) searchParams.set("level", params.level);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.userId) searchParams.set("userId", params.userId);
    const query = searchParams.toString();
    return this.unwrap<SystemLog[]>(`/admin/logs${query ? `?${query}` : ""}`);
  }

  async getLogsStats(): Promise<LogsStats> {
    return this.unwrap<LogsStats>("/admin/logs/stats");
  }

  async getGlobalConfig(): Promise<GlobalConfig> {
    return this.unwrap<GlobalConfig>("/admin/config");
  }

  async updateGlobalConfig(
    config: Partial<GlobalConfig>,
  ): Promise<GlobalConfig> {
    return this.unwrap<GlobalConfig>("/admin/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }

  async changePassword(data: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<void> {
    await this.unwrap<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: {
    name?: string;
    bio?: string;
    region?: string;
  }): Promise<void> {
    await this.unwrap<void>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(): Promise<void> {
    await this.unwrap<void>("/auth/account", { method: "DELETE" });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.unwrap<void>(`/admin/users/${userId}`, { method: "DELETE" });
  }

  async getLinkedAccounts(): Promise<
    Array<{
      id: string;
      provider: string;
      providerAccountId: string;
      createdAt: string;
    }>
  > {
    return this.unwrap<
      Array<{
        id: string;
        provider: string;
        providerAccountId: string;
        createdAt: string;
      }>
    >("/auth/accounts");
  }

  async unlinkAccount(provider: string): Promise<void> {
    await this.unwrap<void>(`/auth/accounts/${provider}`, {
      method: "DELETE",
    });
  }

  async getUserApiKeys(): Promise<
    Array<{
      id: string;
      name: string;
      keyPrefix: string;
      isActive: number;
      createdAt: string;
      lastUsedAt: string | null;
    }>
  > {
    return this.unwrap<
      Array<{
        id: string;
        name: string;
        keyPrefix: string;
        isActive: number;
        createdAt: string;
        lastUsedAt: string | null;
      }>
    >("/auth/api-keys");
  }

  async createUserApiKey(name: string): Promise<{
    id: string;
    name: string;
    key: string;
    keyPrefix: string;
  }> {
    return this.unwrap<{
      id: string;
      name: string;
      key: string;
      keyPrefix: string;
    }>("/auth/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async deleteUserApiKey(id: string): Promise<void> {
    await this.unwrap<void>(`/auth/api-keys/${id}`, { method: "DELETE" });
  }

  getLinkAccountUrl(provider: "github" | "discord"): string {
    // Include token in query param for middleware to pick up during browser navigation
    return `${this.baseUrl}/auth/link/${provider}${this.accessToken ? `?token=${this.accessToken}` : ""}`;
  }

  async *streamMessage(messages: AiMessage[]): AsyncGenerator<string> {
    const url = `${this.baseUrl}/ai/chat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body to read");
    }

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let eventEndIndex;
      while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, eventEndIndex);
        buffer = buffer.slice(eventEndIndex + 2);

        const lines = rawEvent.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                yield parsed.response;
              }
            } catch (e) {
              console.warn("Failed to parse SSE data chunk", e);
            }
          }
        }
      }
    }
  }

  // Project Files API
  async getProjectFiles(projectId: string): Promise<
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
  > {
    return this.unwrap<
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
    >(`/projects/${projectId}/files`);
  }

  async getProjectFile(
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
  }> {
    return this.unwrap<{
      id: string;
      projectId: string;
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>(`/projects/${projectId}/files/${encodeURIComponent(path)}`);
  }

  async saveProjectFile(
    projectId: string,
    file: { path: string; content: string; language?: string },
  ): Promise<{
    id: string;
    projectId: string;
    path: string;
    content: string;
    language: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }> {
    return this.unwrap<{
      id: string;
      projectId: string;
      path: string;
      content: string;
      language: string;
      size: number;
      createdAt: string;
      updatedAt: string;
    }>(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify(file),
    });
  }

  async deleteProjectFile(projectId: string, path: string): Promise<void> {
    await this.unwrap<void>(
      `/projects/${projectId}/files/${encodeURIComponent(path)}`,
      { method: "DELETE" },
    );
  }

  async bulkSaveProjectFiles(
    projectId: string,
    files: Array<{ path: string; content: string; language?: string }>,
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
  > {
    return this.unwrap<
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
    >(`/projects/${projectId}/files/bulk`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });
  }

  // Chat Context API
  async createChatSession(data: {
    projectId?: string;
    title?: string;
  }): Promise<{
    id: string;
    projectId: string | null;
    userId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return this.unwrap<{
      id: string;
      projectId: string | null;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getChatSessions(): Promise<
    Array<{
      id: string;
      projectId: string | null;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.unwrap<
      Array<{
        id: string;
        projectId: string | null;
        userId: string;
        title: string;
        createdAt: string;
        updatedAt: string;
      }>
    >("/chat/sessions");
  }

  async getChatSession(sessionId: string): Promise<{
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
  }> {
    return this.unwrap<{
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
    }>(`/chat/sessions/${sessionId}`);
  }

  async getChatContext(sessionId: string): Promise<{
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
  }> {
    return this.unwrap<{
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
    }>(`/chat/sessions/${sessionId}/context`);
  }

  async addChatMessage(
    sessionId: string,
    message: { role: "user" | "assistant" | "system"; content: string },
  ): Promise<{
    id: string;
    sessionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
  }> {
    return this.unwrap<{
      id: string;
      sessionId: string;
      role: "user" | "assistant" | "system";
      content: string;
      timestamp: number;
    }>(`/chat/sessions/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify(message),
    });
  }

  // Export API
  async exportProject(projectId: string): Promise<{
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
  }> {
    return this.unwrap<{
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
    }>(`/projects/${projectId}/export`);
  }

  async listExportableProjects(): Promise<
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
  > {
    return this.unwrap<
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
    >("/projects/export/list");
  }
}
