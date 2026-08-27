import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../lib/api";
import type { User } from "@magicappdev/shared";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default dark mode standard
  const [isHackerTheme, setIsHackerTheme] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .getCurrentUser()
      .then(u => setUser(u))
      .catch(() => {
        secureStorage.removeItem("magicappdev_access_token");
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await secureStorage.removeItem("magicappdev_access_token");
    await secureStorage.removeItem("magicappdev_refresh_token");
    api.setToken(null);
    router.replace("/");
  };

  const currentTheme = isHackerTheme
    ? hackerTheme
    : isDarkMode
      ? darkTheme
      : lightTheme;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: currentTheme.bg }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.bg }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerBanner, { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={[styles.userName, { color: currentTheme.text }]}>{user?.name || "User"}</Text>
        <Text style={[styles.userEmail, { color: currentTheme.subText }]}>{user?.email || ""}</Text>
      </View>

      <Text style={[styles.sectionHeader, { color: currentTheme.subText }]}>Preferences & Configuration</Text>

      <View style={[styles.menuCard, { backgroundColor: currentTheme.cardBg, borderColor: currentTheme.border }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/profile" as unknown as never)}
        >
          <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBg1 }]}>
            <Ionicons name="person-outline" size={20} color={currentTheme.iconColor1} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: currentTheme.text }]}>Profile Settings</Text>
            <Text style={[styles.menuSubtitle, { color: currentTheme.subText }]}>Update bio, website, location & username</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={currentTheme.subText} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: currentTheme.separator }]} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/ai-provider" as unknown as never)}
        >
          <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBg2 }]}>
            <Ionicons name="key-outline" size={20} color={currentTheme.iconColor2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: currentTheme.text }]}>AI Provider / BYOK</Text>
            <Text style={[styles.menuSubtitle, { color: currentTheme.subText }]}>Configure OpenAI, Anthropic, DeepSeek & Groq keys</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={currentTheme.subText} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: currentTheme.separator }]} />

        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBg3 }]}>
            <Ionicons name="moon-outline" size={20} color={currentTheme.iconColor3} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: currentTheme.text }]}>Dark Mode</Text>
            <Text style={[styles.menuSubtitle, { color: currentTheme.subText }]}>Enable standard dark theme</Text>
          </View>
          <Switch
            value={isDarkMode && !isHackerTheme}
            onValueChange={val => {
              setIsDarkMode(val);
              if (val) setIsHackerTheme(false);
            }}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: currentTheme.separator }]} />

        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: "#064E3B" }]}>
            <Ionicons name="terminal-outline" size={20} color="#10B981" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: currentTheme.text }]}>Hacker Theme (Matrix)</Text>
            <Text style={[styles.menuSubtitle, { color: currentTheme.subText }]}>Neon green terminal cyberpunk aesthetic</Text>
          </View>
          <Switch
            value={isHackerTheme}
            onValueChange={val => {
              setIsHackerTheme(val);
              if (val) setIsDarkMode(true);
            }}
            trackColor={{ false: "#767577", true: "#059669" }}
            thumbColor={isHackerTheme ? "#34D399" : "#f4f3f4"}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const lightTheme = {
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

const darkTheme = {
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

const hackerTheme = {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBanner: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  separator: {
    height: 1,
    marginLeft: 66,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
