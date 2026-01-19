/**
 * API client for interacting with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

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
