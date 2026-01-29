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

  constructor(private baseUrl: string) {}

  setToken(token: string | null) {
    this.accessToken = token;
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

  getGitHubLoginUrl(platform: "web" | "mobile" = "web"): string {
    return `${this.baseUrl}/auth/login/github?platform=${platform}`;
  }

  getDiscordLoginUrl(platform: "web" | "mobile" = "web"): string {
    return `${this.baseUrl}/auth/login/discord?platform=${platform}`;
  }

  async login(credentials: {
    email: string;
    password: string;
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
    const response = await this.request<ApiResponse<User>>("/auth/me");
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to fetch user profile",
      );
    }
    return response.data;
  }

  async getProjects(): Promise<Project[]> {
    const response =
      await this.request<ApiResponse<ListProjectsResponse>>("/projects");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data.data;
  }

  async createProject(data: {
    name: string;
    description?: string;
  }): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify({ ...data, config: {} }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(`/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async sendMessage(messages: AiMessage[]): Promise<AiMessage> {
    const response = await this.request<ApiResponse<AiChatResponse>>(
      "/ai/chat",
      {
        method: "POST",
        body: JSON.stringify({ messages }),
      },
    );

    if (!response.success) {
      throw new Error(response.error.message);
    }

    return response.data.message;
  }

  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean }> {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTickets(): Promise<Ticket[]> {
    const response = await this.request<ApiResponse<Ticket[]>>("/tickets");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async getTicket(id: string): Promise<Ticket> {
    const response = await this.request<ApiResponse<Ticket>>(`/tickets/${id}`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async createTicket(data: {
    subject: string;
    message: string;
  }): Promise<{ id: string }> {
    const response = await this.request<ApiResponse<{ id: string }>>(
      "/tickets",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async updateTicketStatus(
    id: string,
    status: "open" | "in_progress" | "closed" | "resolved",
  ): Promise<void> {
    const response = await this.request<ApiResponse<void>>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    const response =
      await this.request<ApiResponse<AdminUser[]>>("/admin/users");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    openTickets: number;
    databaseSize: string;
    activeSessions: number;
    userGrowth: string;
    ticketUrgency: string;
  }> {
    const response = await this.request<
      ApiResponse<{
        totalUsers: number;
        openTickets: number;
        databaseSize: string;
        activeSessions: number;
        userGrowth: string;
        ticketUrgency: string;
      }>
    >("/admin/stats");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async updateUserRole(id: string, role: "admin" | "user"): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/admin/users/${id}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({ role }),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
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
    const response = await this.request<ApiResponse<AdminApiKey[]>>(
      `/admin/api-keys${query ? `?${query}` : ""}`,
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async createAdminApiKey(data: {
    name: string;
    description?: string;
    scopes: string[];
    expiresAt?: string;
  }): Promise<AdminApiKey> {
    const response = await this.request<ApiResponse<AdminApiKey>>(
      "/admin/api-keys",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async deleteAdminApiKey(id: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/admin/api-keys/${id}`,
      {
        method: "DELETE",
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
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
    const response = await this.request<ApiResponse<SystemLog[]>>(
      `/admin/logs${query ? `?${query}` : ""}`,
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async getLogsStats(): Promise<LogsStats> {
    const response =
      await this.request<ApiResponse<LogsStats>>("/admin/logs/stats");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async getGlobalConfig(): Promise<GlobalConfig> {
    const response =
      await this.request<ApiResponse<GlobalConfig>>("/admin/config");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async updateGlobalConfig(
    config: Partial<GlobalConfig>,
  ): Promise<GlobalConfig> {
    const response = await this.request<ApiResponse<GlobalConfig>>(
      "/admin/config",
      {
        method: "PUT",
        body: JSON.stringify(config),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async changePassword(data: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      "/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async updateProfile(data: {
    name?: string;
    bio?: string;
    region?: string;
  }): Promise<void> {
    const response = await this.request<ApiResponse<void>>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async deleteAccount(): Promise<void> {
    const response = await this.request<ApiResponse<void>>("/auth/account", {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }

  async getLinkedAccounts(): Promise<
    Array<{
      id: string;
      provider: string;
      providerAccountId: string;
      createdAt: string;
    }>
  > {
    const response = await this.request<
      ApiResponse<
        Array<{
          id: string;
          provider: string;
          providerAccountId: string;
          createdAt: string;
        }>
      >
    >("/auth/accounts");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async unlinkAccount(provider: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/auth/accounts/${provider}`,
      {
        method: "DELETE",
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
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
    const response = await this.request<
      ApiResponse<
        Array<{
          id: string;
          name: string;
          keyPrefix: string;
          isActive: number;
          createdAt: string;
          lastUsedAt: string | null;
        }>
      >
    >("/auth/api-keys");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async createUserApiKey(name: string): Promise<{
    id: string;
    name: string;
    key: string;
    keyPrefix: string;
  }> {
    const response = await this.request<
      ApiResponse<{
        id: string;
        name: string;
        key: string;
        keyPrefix: string;
      }>
    >("/auth/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }

  async deleteUserApiKey(id: string): Promise<void> {
    const response = await this.request<ApiResponse<void>>(
      `/auth/api-keys/${id}`,
      {
        method: "DELETE",
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
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
}
