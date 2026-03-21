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
export const deleteProject = (id: string) => api.deleteProject(id);
export const sendMessage = (messages: AiMessage[]) => api.sendMessage(messages);
export const streamMessage = (messages: AiMessage[]) =>
  api.streamMessage(messages);

// ─── Workspace helpers ────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...((init?.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(err?.error?.message || `Request failed: ${res.statusText}`);
  }
  const data = (await res.json()) as {
    success: boolean;
    data: T;
    error?: { message: string };
  };
  if (!data.success)
    throw new Error(
      (data.error as { message: string })?.message || "Request failed",
    );
  return data.data;
}

export interface WorkspaceFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateResult {
  description: string;
  files: WorkspaceFile[];
}

/** Generate or modify project files using AI */
export async function generateCode(
  projectId: string,
  prompt: string,
  options?: { provider?: string; model?: string; apiKey?: string },
): Promise<GenerateResult> {
  return apiRequest<GenerateResult>(`/projects/${projectId}/ai/generate`, {
    method: "POST",
    body: JSON.stringify({ prompt, ...options }),
  });
}

/** Export project as JSON then offer a ZIP download */
export async function downloadProjectZip(
  projectId: string,
  projectName: string,
) {
  const exportData = await api.exportProject(projectId);
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}-export.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
