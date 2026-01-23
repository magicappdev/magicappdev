/**
 * Theme Context Provider
 *
 * Provides theme management for the app including:
 * - Light/Dark/Automatic theme modes
 * - System theme detection
 *
 * Note: For persistent theme preference, install @react-native-async-storage/async-storage
 * and uncomment the AsyncStorage code below.
 */

// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, lightTheme, darkTheme, ThemeMode } from "../constants/theme";
import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// const THEME_STORAGE_KEY = "@magicappdev_theme_mode";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("automatic");
  // const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  // useEffect(() => {
  //   AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
  //     if (saved) {
  //       setModeState(saved as ThemeMode);
  //     }
  //     setIsLoading(false);
  //   });
  // }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    // await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  // Determine actual theme based on mode and system preference
  const isDark =
    mode === "dark" || (mode === "automatic" && systemColorScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  // if (isLoading) {
  //   return null; // or a loading spinner
  // }

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
