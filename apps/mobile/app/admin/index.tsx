import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "../../lib/api";

interface AdminStats {
  totalUsers: number;
  openTickets: number;
  databaseSize: string;
  activeSessions: number;
  userGrowth: string;
  ticketUrgency: string;
}

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const menuItems = [
    {
      icon: "key-outline" as const,
      label: "API Keys",
      description: "Manage admin API keys",
      route: "/admin/api-keys",
      color: theme.colors.primary,
    },
    {
      icon: "document-text-outline" as const,
      label: "System Logs",
      description: "View system logs and events",
      route: "/admin/logs",
      color: theme.colors.warning,
    },
    {
      icon: "settings-outline" as const,
      label: "Global Config",
      description: "App configuration settings",
      route: "/admin/config",
      color: theme.colors.success,
    },
    {
      icon: "people-outline" as const,
      label: "User Management",
      description: "Manage users and roles",
      route: "/admin/users",
      color: "#9C27B0",
    },
    {
      icon: "lock-closed-outline" as const,
      label: "Change Password",
      description: "Update your password",
      route: "/admin/change-password",
      color: theme.colors.error,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Platform Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View
              style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="people"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats?.totalUsers ?? 0}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Total Users
              </Text>
              <Text
                style={[styles.statChange, { color: theme.colors.success }]}
              >
                {stats?.userGrowth}
              </Text>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.warning + "20" },
                ]}
              >
                <Ionicons
                  name="ticket"
                  size={24}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats?.openTickets ?? 0}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Open Tickets
              </Text>
              <Text
                style={[styles.statChange, { color: theme.colors.warning }]}
              >
                {stats?.ticketUrgency}
              </Text>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <Ionicons
                  name="server"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats?.databaseSize ?? "0 MB"}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Database Size
              </Text>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            >
              <View
                style={[styles.statIcon, { backgroundColor: "#9C27B0" + "20" }]}
              >
                <Ionicons name="pulse" size={24} color="#9C27B0" />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stats?.activeSessions ?? 0}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Active Sessions
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Admin Tools
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                {
                  backgroundColor: theme.colors.card,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push(item.route as never)}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.menuDescription,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});
