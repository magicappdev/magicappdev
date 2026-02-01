import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import type { User } from "@magicappdev/shared";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for storage with web fallback
const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();

    // Set up deep link listener for OAuth callbacks
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    if (url.includes("auth/callback")) {
      const params = Linking.parse(url);
      const accessToken = params.queryParams?.accessToken as string;
      const refreshToken = params.queryParams?.refreshToken as string;

      if (accessToken && refreshToken) {
        await saveTokens(accessToken, refreshToken);
      }
    }
  };

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    await storage.setItemAsync("access_token", accessToken);
    await storage.setItemAsync("refresh_token", refreshToken);
    api.setToken(accessToken);
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (e) {
      console.error("Failed to fetch user after login", e);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });
      if (response.success) {
        await saveTokens(response.data.accessToken, response.data.refreshToken);
      } else {
        alert(response.error?.message || "Login failed");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An error occurred";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuth = async () => {
    const accessToken = await storage.getItemAsync("access_token");
    const refreshToken = await storage.getItemAsync("refresh_token");

    if (accessToken) {
      api.setToken(accessToken);
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch {
        if (refreshToken) {
          try {
            const newToken = await api.refresh(refreshToken);
            await storage.setItemAsync("access_token", newToken);
            const userData = await api.getCurrentUser();
            setUser(userData);
          } catch {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }
    }
    setIsLoading(false);
  };

  const loginWithGitHub = async () => {
    const redirectUri = Linking.createURL("auth/callback");
    const authUrl =
      api.getGitHubLoginUrl("mobile") +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log("Starting GitHub login with redirect:", redirectUri);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type === "success") {
        await handleDeepLink(result.url);
      }
    } catch (e) {
      console.error("Browser login failed", e);
    }
  };

  const loginWithDiscord = async () => {
    const redirectUri = Linking.createURL("auth/callback");
    const authUrl =
      api.getDiscordLoginUrl("mobile") +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log("Starting Discord login with redirect:", redirectUri);

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      if (result.type === "success") {
        await handleDeepLink(result.url);
      }
    } catch (e) {
      console.error("Discord login failed", e);
    }
  };

  const handleLogout = async () => {
    const refreshToken = await storage.getItemAsync("refresh_token");
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    await storage.deleteItemAsync("access_token");
    await storage.deleteItemAsync("refresh_token");
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGitHub,
        loginWithDiscord,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
