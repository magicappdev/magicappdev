import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@magicappdev/shared";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => void;
  loginWithDiscord: () => void;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    api.setToken(token);
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Fetch user failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken) {
      fetchUser(accessToken)
        .catch(async error => {
          if (
            refreshToken &&
            error instanceof Error &&
            (error.message.includes("401") ||
              error.message.includes("Unauthorized"))
          ) {
            try {
              const newToken = await api.refresh(refreshToken);
              localStorage.setItem("access_token", newToken);
              await fetchUser(newToken);
            } catch {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithGitHub = () => {
    window.location.href = api.getGitHubLoginUrl("web");
  };

  const loginWithDiscord = () => {
    window.location.href = api.getDiscordLoginUrl("web");
  };

  const login = async (accessToken: string, refreshToken: string) => {
    setIsLoading(true);
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    try {
      await fetchUser(accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch (logoutError) {
        console.error("Logout failed", logoutError);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    api.setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        await fetchUser(accessToken);
      } catch (error) {
        console.error("Refresh user failed:", error);
      }
    }
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
        refreshUser,
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
