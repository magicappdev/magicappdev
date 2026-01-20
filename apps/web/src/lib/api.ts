import { ApiClient } from "@magicappdev/shared/api";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:8787";

export const api = new ApiClient(API_URL);

// Re-export common types and methods for compatibility
import type { AiMessage, Project } from "@magicappdev/shared";
export type { AiMessage, Project };

export const getProjects = () => api.getProjects();
export const createProject = (data: { name: string; description?: string }) =>
  api.createProject(data);
export const sendMessage = (messages: AiMessage[]) => api.sendMessage(messages);
export const streamMessage = (messages: AiMessage[]) =>
  api.streamMessage(messages);
