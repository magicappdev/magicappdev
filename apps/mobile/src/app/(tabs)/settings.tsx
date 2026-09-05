import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../../lib/api";
import type { User } from "@magicappdev/shared";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isDarkMode = theme === "dark";
  const isHackerTheme = theme === "hacker";

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    api
      .getCurrentUser()
      .then(u => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          secureStorage.removeItem("magicappdev_access_token");
          router.replace("/");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    await secureStorage.removeItem("magicappdev_access_token");
    await secureStorage.removeItem("magicappdev_refresh_token");
    api.setToken(null);
    router.replace("/");
  };

  const handleDarkModeToggle = (val: boolean) => {
    setTheme(val ? "dark" : "light");
  };

  const handleHackerToggle = (val: boolean) => {
    setTheme(val ? "hacker" : isDarkMode ? "dark" : "light");
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerBanner, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || "User"}</Text>
        <Text style={[styles.userEmail, { color: colors.subText }]}>{user?.email || ""}</Text>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.subText }]}>Preferences & Configuration</Text>

      <View style={[styles.menuCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/profile" as unknown as never)}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg1 }]}>
            <Ionicons name="person-outline" size={20} color={colors.iconColor1} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Profile Settings</Text>
            <Text style={[styles.menuSubtitle, { color: colors.subText }]}>Update bio, website, location & username</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: colors.separator }]} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/ai-provider" as unknown as never)}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg2 }]}>
            <Ionicons name="key-outline" size={20} color={colors.iconColor2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>AI Provider / BYOK</Text>
            <Text style={[styles.menuSubtitle, { color: colors.subText }]}>Configure OpenAI, Anthropic, DeepSeek & Groq keys</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subText} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: colors.separator }]} />

        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBg3 }]}>
            <Ionicons name="moon-outline" size={20} color={colors.iconColor3} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.menuSubtitle, { color: colors.subText }]}>Enable standard dark theme</Text>
          </View>
          <Switch
            value={isDarkMode && !isHackerTheme}
            onValueChange={handleDarkModeToggle}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: colors.separator }]} />

        <View style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: "#064E3B" }]}>
            <Ionicons name="terminal-outline" size={20} color="#10B981" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Hacker Theme (Matrix)</Text>
            <Text style={[styles.menuSubtitle, { color: colors.subText }]}>Neon green terminal cyberpunk aesthetic</Text>
          </View>
          <Switch
            value={isHackerTheme}
            onValueChange={handleHackerToggle}
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
