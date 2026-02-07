export class ApiClient {
  baseUrl;
  accessToken = null;
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  setToken(token) {
    this.accessToken = token;
  }
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
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
        errorData?.error?.message ||
        errorData?.error ||
        `API Request failed: ${response.statusText}`;
      throw new Error(message);
    }
    const data = await response.json();
    return data;
  }
  getGitHubLoginUrl(platform = "web") {
    return `${this.baseUrl}/auth/login/github?platform=${platform}`;
  }
  getDiscordLoginUrl(platform = "web") {
    return `${this.baseUrl}/auth/login/discord?platform=${platform}`;
  }
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
  async register(data) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async logout(refreshToken) {
    await this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    this.setToken(null);
  }
  async refresh(refreshToken) {
    const response = await this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    this.setToken(response.data.accessToken);
    return response.data.accessToken;
  }
  async getCurrentUser() {
    const response = await this.request("/auth/me");
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to fetch user profile",
      );
    }
    return response.data;
  }
  async getProjects() {
    const response = await this.request("/projects");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data.data;
  }
  async createProject(data) {
    const response = await this.request("/projects", {
      method: "POST",
      body: JSON.stringify({ ...data, config: {} }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async deleteProject(id) {
    const response = await this.request(`/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async sendMessage(messages) {
    const response = await this.request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data.message;
  }
  async submitContactForm(data) {
    return this.request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async getTickets() {
    const response = await this.request("/tickets");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getTicket(id) {
    const response = await this.request(`/tickets/${id}`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async createTicket(data) {
    const response = await this.request("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async updateTicketStatus(id, status) {
    const response = await this.request(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async getAdminUsers() {
    const response = await this.request("/admin/users");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getAdminStats() {
    const response = await this.request("/admin/stats");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async updateUserRole(id, role) {
    const response = await this.request(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async getAdminApiKeys(params) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive));
    const query = searchParams.toString();
    const response = await this.request(
      `/admin/api-keys${query ? `?${query}` : ""}`,
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async createAdminApiKey(data) {
    const response = await this.request("/admin/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async deleteAdminApiKey(id) {
    const response = await this.request(`/admin/api-keys/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async getSystemLogs(params) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    if (params?.level) searchParams.set("level", params.level);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.userId) searchParams.set("userId", params.userId);
    const query = searchParams.toString();
    const response = await this.request(
      `/admin/logs${query ? `?${query}` : ""}`,
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getLogsStats() {
    const response = await this.request("/admin/logs/stats");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getGlobalConfig() {
    const response = await this.request("/admin/config");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async updateGlobalConfig(config) {
    const response = await this.request("/admin/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async changePassword(data) {
    const response = await this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async updateProfile(data) {
    const response = await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async deleteAccount() {
    const response = await this.request("/auth/account", {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async getLinkedAccounts() {
    const response = await this.request("/auth/accounts");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async unlinkAccount(provider) {
    const response = await this.request(`/auth/accounts/${provider}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async getUserApiKeys() {
    const response = await this.request("/auth/api-keys");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async createUserApiKey(name) {
    const response = await this.request("/auth/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async deleteUserApiKey(id) {
    const response = await this.request(`/auth/api-keys/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  getLinkAccountUrl(provider) {
    // Include token in query param for middleware to pick up during browser navigation
    return `${this.baseUrl}/auth/link/${provider}${this.accessToken ? `?token=${this.accessToken}` : ""}`;
  }
  async *streamMessage(messages) {
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
  async getProjectFiles(projectId) {
    const response = await this.request(`/projects/${projectId}/files`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getProjectFile(projectId, path) {
    const response = await this.request(
      `/projects/${projectId}/files/${encodeURIComponent(path)}`,
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async saveProjectFile(projectId, file) {
    const response = await this.request(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify(file),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async deleteProjectFile(projectId, path) {
    const response = await this.request(
      `/projects/${projectId}/files/${encodeURIComponent(path)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
  async bulkSaveProjectFiles(projectId, files) {
    const response = await this.request(`/projects/${projectId}/files/bulk`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  // Chat Context API
  async createChatSession(data) {
    const response = await this.request("/chat/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getChatSessions() {
    const response = await this.request("/chat/sessions");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getChatSession(sessionId) {
    const response = await this.request(`/chat/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async getChatContext(sessionId) {
    const response = await this.request(`/chat/sessions/${sessionId}/context`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async addChatMessage(sessionId, message) {
    const response = await this.request(`/chat/sessions/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify(message),
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  // Export API
  async exportProject(projectId) {
    const response = await this.request(`/projects/${projectId}/export`);
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
  async listExportableProjects() {
    const response = await this.request("/projects/export/list");
    if (!response.success) {
      throw new Error(response.error.message);
    }
    return response.data;
  }
}
