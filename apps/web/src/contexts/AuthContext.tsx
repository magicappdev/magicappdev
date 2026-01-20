import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@magicappdev/shared";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load: check if we have tokens in localStorage
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken) {
      api.setToken(accessToken);
      api
        .getCurrentUser()
        .then(setUser)
        .catch(async () => {
          // Token might be expired, try refresh
          if (refreshToken) {
            try {
              const newToken = await api.refresh(refreshToken);
              localStorage.setItem("access_token", newToken);
              const userData = await api.getCurrentUser();
              setUser(userData);
            } catch {
              // Refresh failed, clear everything
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
