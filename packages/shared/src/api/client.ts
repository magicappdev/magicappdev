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
  subject: string;
  status: "open" | "in_progress" | "closed" | "resolved";
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
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
