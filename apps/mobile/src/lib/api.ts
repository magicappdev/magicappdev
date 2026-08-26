import { ApiClient } from "@magicappdev/shared/api";
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

// Initialize stored tokens on boot
secureStorage.getItem(TOKEN_KEY).then(token => {
  if (token) api.setToken(token);
});

secureStorage.getItem(REFRESH_TOKEN_KEY).then(refreshToken => {
  if (refreshToken) api.setRefreshToken(refreshToken);
});

api.onTokenRefresh = async (token: string) => {
  if (token) await secureStorage.setItem(TOKEN_KEY, token);
};
