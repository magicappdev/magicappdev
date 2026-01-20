import type {
  AiChatResponse,
  AiMessage,
  ApiResponse,
  ListProjectsResponse,
  Project,
} from "../types/index.js";

export class ApiClient {
  constructor(private baseUrl: string) {}

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
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
