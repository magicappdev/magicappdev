import { ApiClient } from "@magicappdev/shared/api";
import type { AiMessage, Project } from "@magicappdev/shared";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "magicappdev_access_token";
const REFRESH_TOKEN_KEY = "magicappdev_refresh_token";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://magicappdev-api.magicappdev.workers.dev";

export const api = new ApiClient(API_BASE_URL);
export { API_BASE_URL };

// Re-export common types and methods for compatibility
export type { AiMessage, Project };

export const getProjects = () => api.getProjects();
export const getProject = (id: string) => api.getProject(id);
export const createProject = (data: { name: string; description?: string }) =>
  api.createProject(data);
export const deleteProject = (id: string) => api.deleteProject(id);
export const sendMessage = (messages: AiMessage[]) => api.sendMessage(messages);
export const streamMessage = (messages: AiMessage[]) =>
  api.streamMessage(messages);

// Initialize stored tokens synchronously / on boot
export async function ensureApiToken() {
  const token = await secureStorage.getItem(TOKEN_KEY);
  if (token) {
    api.setToken(token);
  }
  const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
  if (refreshToken) {
    api.setRefreshToken(refreshToken);
  }
}

ensureApiToken();

api.onTokenRefresh = async (token: string) => {
  if (token) await secureStorage.setItem(TOKEN_KEY, token);
};
