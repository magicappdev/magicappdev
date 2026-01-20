/**
 * API client for interacting with the backend
 */

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:8787";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

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

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export async function getProjects(): Promise<Project[]> {
  const response = await apiRequest<{ data: Project[] }>("/projects");
  return response.data;
}

export async function createProject(
  data: Pick<Project, "name" | "description">,
): Promise<Project> {
  const response = await apiRequest<{ data: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify({ ...data, config: {} }),
  });
  return response.data;
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: AiMessage;
  };
}

export async function sendMessage(messages: AiMessage[]): Promise<AiMessage> {
  const response = await apiRequest<ChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  });

  if (!response.success) {
    throw new Error("Failed to get response from AI");
  }

  return response.data.message;
}
