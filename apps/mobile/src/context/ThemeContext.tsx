import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export type ThemeType = "light" | "dark" | "hacker";

export interface ThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  subText: string;
  border: string;
  separator: string;
  primary: string;
  iconBg1: string;
  iconColor1: string;
  iconBg2: string;
  iconColor2: string;
  iconBg3: string;
  iconColor3: string;
}

const lightTheme: ThemeColors = {
  bg: "#F8FAFC",
  cardBg: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  separator: "#F1F5F9",
  primary: "#2563EB",
  iconBg1: "#DBEAFE",
  iconColor1: "#2563EB",
  iconBg2: "#F3E8FF",
  iconColor2: "#9333EA",
  iconBg3: "#FEF3C7",
  iconColor3: "#D97706",
};

const darkTheme: ThemeColors = {
  bg: "#0B0F19",
  cardBg: "#1E293B",
  text: "#F8FAFC",
  subText: "#94A3B8",
  border: "#334155",
  separator: "#334155",
  primary: "#3B82F6",
  iconBg1: "#1E3A8A",
  iconColor1: "#60A5FA",
  iconBg2: "#581C87",
  iconColor2: "#C084FC",
  iconBg3: "#78350F",
  iconColor3: "#FBBF24",
};

const hackerTheme: ThemeColors = {
  bg: "#020617",
  cardBg: "#030712",
  text: "#34D399",
  subText: "#059669",
  border: "#065F46",
  separator: "#064E3B",
  primary: "#10B981",
  iconBg1: "#064E3B",
  iconColor1: "#34D399",
  iconBg2: "#064E3B",
  iconColor2: "#34D399",
  iconBg3: "#064E3B",
  iconColor3: "#34D399",
};

interface ThemeContextProps {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (t: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "dark",
  colors: darkTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("dark");

  useEffect(() => {
    SecureStore.getItemAsync("magicappdev_theme").then(saved => {
      if (saved === "light" || saved === "dark" || saved === "hacker") {
        setThemeState(saved);
      }
    });
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    SecureStore.setItemAsync("magicappdev_theme", newTheme).catch(() => {});
  };

  const colors =
    theme === "hacker"
      ? hackerTheme
      : theme === "dark"
        ? darkTheme
        : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
