import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../lib/api";
import type { User } from "@magicappdev/shared";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerBanner}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      <Text style={styles.sectionHeader}>Preferences & Configuration</Text>

      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/profile" as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="person-outline" size={20} color="#2563EB" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Profile Settings</Text>
            <Text style={styles.menuSubtitle}>Update bio, website, location & username</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings/ai-provider" as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#F3E8FF" }]}>
            <Ionicons name="key-outline" size={20} color="#9333EA" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>AI Provider / BYOK</Text>
            <Text style={styles.menuSubtitle}>Configure OpenAI, Anthropic, DeepSeek & Groq keys</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Appearance", "Dark mode & theme options are currently set to Auto.")}
        >
          <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="color-palette-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Appearance</Text>
            <Text style={styles.menuSubtitle}>Theme preferences & display options</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#2563EB",
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
    color: "#0F172A",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    color: "#0F172A",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
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
