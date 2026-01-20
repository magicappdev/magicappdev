import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import type { User } from "@magicappdev/shared";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    if (accessToken) {
      api.setToken(accessToken);
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch {
        if (refreshToken) {
          try {
            const newToken = await api.refresh(refreshToken);
            await SecureStore.setItemAsync("access_token", newToken);
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

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success") {
      const { url } = result;
      const params = Linking.parse(url);
      const accessToken = params.queryParams?.accessToken as string;
      const refreshToken = params.queryParams?.refreshToken as string;

      if (accessToken && refreshToken) {
        await SecureStore.setItemAsync("access_token", accessToken);
        await SecureStore.setItemAsync("refresh_token", refreshToken);
        api.setToken(accessToken);
        const userData = await api.getCurrentUser();
        setUser(userData);
      }
    }
  };

  const handleLogout = async () => {
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginWithGitHub, logout: handleLogout }}
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
