import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
  FlatList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, secureStorage } from "../lib/api";
import type { User } from "@magicappdev/shared";
import type {
  AdminUser,
  SystemLog,
  GlobalConfig,
  AnalyticsSummary,
} from "@magicappdev/shared/api";
import { useTheme } from "../context/ThemeContext";
import { showToast } from "../components/Toast";

type AdminView = "overview" | "users" | "logs" | "config" | "templates" | "analytics";

export default function AdminScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [view, setView] = useState<AdminView>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    openTickets: 0,
    databaseSize: "0 MB",
    activeSessions: 0,
    userGrowth: "0%",
    ticketUrgency: "0 priority",
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = user?.role === "admin";

  const loadUser = useCallback(async () => {
    try {
      const u = await api.getCurrentUser();
      setUser(u);
    } catch {
      secureStorage.removeItem("magicappdev_access_token");
      router.replace("/");
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setActionLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
      setView("users");
    } catch (err) {
      console.error("Failed to fetch users", err);
      showToast("Failed to load users", { kind: "error" });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setActionLoading(true);
    try {
      const data = await api.getSystemLogs({ limit: 50 });
      setLogs(data);
      setView("logs");
    } catch (err) {
      console.error("Failed to fetch logs", err);
      showToast("Failed to load logs", { kind: "error" });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    setActionLoading(true);
    try {
      const data = await api.getGlobalConfig();
      setConfig(data);
      setView("config");
    } catch (err) {
      console.error("Failed to fetch config", err);
      showToast("Failed to load config", { kind: "error" });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setActionLoading(true);
    try {
      const data = await api.getAnalyticsSummary();
      setAnalytics(data);
      setView("analytics");
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      showToast("Failed to load analytics", { kind: "error" });
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadUser();
      if (!cancelled) {
        await fetchStats();
      }
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUser, fetchStats]);

  useEffect(() => {
    if (!isAdmin && !loading) {
      showToast("Admin access required", { kind: "error" });
      router.back();
    }
  }, [isAdmin, loading, router]);

  const handleToggleRole = async (targetUser: AdminUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    const confirmChange = () =>
      Alert.alert(
        "Confirm Role Change",
        `Change ${targetUser.name || targetUser.email} to ${newRole}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            style: "default",
            onPress: async () => {
              try {
                await api.updateUserRole(targetUser.id, newRole);
                showToast("Role updated", { kind: "success" });
                fetchUsers();
                fetchStats();
              } catch {
                showToast("Failed to update role", { kind: "error" });
              }
            },
          },
        ],
      );

    if (Platform.OS === "web") {
      const ok = window.confirm(
        `Change ${targetUser.name || targetUser.email} to ${newRole}?`,
      );
      if (ok) {
        try {
          await api.updateUserRole(targetUser.id, newRole);
          showToast("Role updated", { kind: "success" });
          fetchUsers();
          fetchStats();
        } catch {
          showToast("Failed to update role", { kind: "error" });
        }
      }
    } else {
      confirmChange();
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    const confirmDelete = () =>
      Alert.alert(
        "Delete User",
        `Delete ${targetUser.name || targetUser.email}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await api.deleteUser(targetUser.id);
                showToast("User deleted", { kind: "success" });
                fetchUsers();
                fetchStats();
              } catch {
                showToast("Failed to delete user", { kind: "error" });
              }
            },
          },
        ],
      );

    if (Platform.OS === "web") {
      const ok = window.confirm(
        `Delete ${targetUser.name || targetUser.email}?`,
      );
      if (ok) {
        try {
          await api.deleteUser(targetUser.id);
          showToast("User deleted", { kind: "success" });
          fetchUsers();
          fetchStats();
        } catch {
          showToast("Failed to delete user", { kind: "error" });
        }
      }
    } else {
      confirmDelete();
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setActionLoading(true);
    try {
      await api.updateGlobalConfig(config);
      showToast("Configuration saved", { kind: "success" });
    } catch {
      showToast("Failed to save config", { kind: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredUsers = users.filter(
    u =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalUsers}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Total Users</Text>
          <Text style={[styles.statSub, { color: colors.subText }]}>{stats.userGrowth} this month</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="ticket" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.openTickets}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Open Tickets</Text>
          <Text style={[styles.statSub, { color: colors.subText }]}>{stats.ticketUrgency}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="hardware-chip" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.databaseSize}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Database Size</Text>
          <Text style={[styles.statSub, { color: colors.subText }]}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeSessions}</Text>
          <Text style={[styles.statLabel, { color: colors.subText }]}>Active Sessions</Text>
          <Text style={[styles.statSub, { color: colors.subText }]}>Real-time</Text>
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>User Management</Text>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
        placeholderTextColor={colors.subText}
        style={[styles.searchInput, { backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }]}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        renderItem={({ item }) => (
          <View style={[styles.listItem, { backgroundColor: colors.cardBg }]}>
            <View style={styles.listItemLeft}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{(item.name || item.email || "?")[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={[styles.listItemTitle, { color: colors.text }]}>{item.name || "Unnamed"}</Text>
                <Text style={[styles.listItemSubtitle, { color: colors.subText }]}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={[styles.roleBadge, { backgroundColor: item.role === "admin" ? "#7C3AED22" : "#2563EB22" }]}
                onPress={() => handleToggleRole(item)}
              >
                <Text style={[styles.roleBadgeText, { color: item.role === "admin" ? "#A855F7" : "#3B82F6" }]}>
                  {item.role}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDeleteUser(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subText }]}>No users found.</Text>
        }
      />
    </View>
  );

  const renderLogs = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>System Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
        renderItem={({ item }) => {
          const levelColor =
            item.level === "error"
              ? "#EF4444"
              : item.level === "warn"
                ? "#F59E0B"
                : colors.primary;
          return (
            <View style={[styles.listItem, { backgroundColor: colors.cardBg }]}>
              <View style={styles.listItemLeft}>
                <Text style={[styles.logTime, { color: colors.subText }]}>
                  {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
                <Text style={[styles.logMessage, { color: colors.text }]} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: `${levelColor}22` }]}>
                <Text style={[styles.levelBadgeText, { color: levelColor }]}>{item.level}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subText }]}>No logs found.</Text>
        }
      />
    </View>
  );

  const renderConfig = () => {
    if (!config) return null;
    const update = (patch: Partial<GlobalConfig>) =>
      setConfig({ ...config, ...patch });

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Configuration</Text>
        <View style={[styles.configCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.configRow}>
            <View>
              <Text style={[styles.configLabel, { color: colors.text }]}>Maintenance Mode</Text>
              <Text style={[styles.configHint, { color: colors.subText }]}>Disable all non-admin access</Text>
            </View>
            <Switch
              value={config.maintenanceMode}
              onValueChange={val => update({ maintenanceMode: val })}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.configRow}>
            <View>
              <Text style={[styles.configLabel, { color: colors.text }]}>Enable Registration</Text>
              <Text style={[styles.configHint, { color: colors.subText }]}>Allow new users to sign up</Text>
            </View>
            <Switch
              value={config.enableRegistration}
              onValueChange={val => update({ enableRegistration: val })}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.configRow}>
            <View>
              <Text style={[styles.configLabel, { color: colors.text }]}>Require Email Verification</Text>
              <Text style={[styles.configHint, { color: colors.subText }]}>Require email verification on signup</Text>
            </View>
            <Switch
              value={config.requireEmailVerification}
              onValueChange={val => update({ requireEmailVerification: val })}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.configRow}>
            <View style={styles.configInputBlock}>
              <Text style={[styles.configLabel, { color: colors.text }]}>Rate Limit (per min)</Text>
              <TextInput
                value={String(config.rateLimitPerMinute)}
                onChangeText={text =>
                  update({ rateLimitPerMinute: parseInt(text || "0", 10) })
                }
                keyboardType="number-pad"
                style={[styles.configInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              />
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.configRow}>
            <View style={styles.configInputBlock}>
              <Text style={[styles.configLabel, { color: colors.text }]}>Rate Limit (per hour)</Text>
              <TextInput
                value={String(config.rateLimitPerHour)}
                onChangeText={text =>
                  update({ rateLimitPerHour: parseInt(text || "0", 10) })
                }
                keyboardType="number-pad"
                style={[styles.configInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              />
            </View>
          </View>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <View style={styles.configRow}>
            <View style={styles.configInputBlock}>
              <Text style={[styles.configLabel, { color: colors.text }]}>Session Expiry (days)</Text>
              <TextInput
                value={String(config.sessionExpiryDays)}
                onChangeText={text =>
                  update({ sessionExpiryDays: parseInt(text || "0", 10) })
                }
                keyboardType="number-pad"
                style={[styles.configInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveConfig}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Configuration</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTemplates = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Template Gallery</Text>
      <View style={{ paddingHorizontal: 4 }}>
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          Template preview and management are available on the web admin.
        </Text>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Onboarding Analytics</Text>
      {analytics ? (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="bar-chart" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.totalEvents}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Total Events</Text>
            <Text style={[styles.statSub, { color: colors.subText }]}>All time</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.onboarding.complete}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Completed</Text>
            <Text style={[styles.statSub, { color: colors.subText }]}>
              {analytics.onboarding.completionRate.toFixed(1)}% rate
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Ionicons name="close-circle" size={24} color="#EF4444" />
            <Text style={[styles.statValue, { color: colors.text }]}>{analytics.onboarding.skipped}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Skipped</Text>
            <Text style={[styles.statSub, { color: colors.subText }]}>Users who skipped</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.subText }]}>
          No analytics data available yet.
        </Text>
      )}
    </View>
  );

  const renderView = () => {
    switch (view) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUsers();
      case "logs":
        return renderLogs();
      case "config":
        return renderConfig();
      case "templates":
        return renderTemplates();
      case "analytics":
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  const tabs: { key: AdminView; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "overview", label: "Overview", icon: "grid-outline" },
    { key: "users", label: "Users", icon: "people-outline" },
    { key: "logs", label: "Logs", icon: "document-text-outline" },
    { key: "config", label: "Config", icon: "settings-outline" },
    { key: "templates", label: "Templates", icon: "cube-outline" },
    { key: "analytics", label: "Analytics", icon: "bar-chart-outline" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Console</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView horizontal style={styles.tabBar} showsHorizontalScrollIndicator={false}>
        {tabs.map(tab => {
          const active = view === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                active && { backgroundColor: colors.primary + "18" },
              ]}
              onPress={() => {
                if (tab.key === "users") fetchUsers();
                else if (tab.key === "logs") fetchLogs();
                else if (tab.key === "config") fetchConfig();
                else if (tab.key === "analytics") fetchAnalytics();
                else setView(tab.key);
              }}
              disabled={actionLoading && (tab.key === "users" || tab.key === "logs" || tab.key === "config" || tab.key === "analytics")}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={active ? colors.primary : colors.subText}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.primary : colors.subText },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {actionLoading && (
        <View style={styles.inlineLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderView()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  tabBar: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  inlineLoader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  statSub: {
    fontSize: 11,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
  },
  listItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  listItemSubtitle: {
    fontSize: 13,
  },
  listItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  logTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 14,
  },
  separator: {
    height: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
  },
  configCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  configRow: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  configLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  configHint: {
    fontSize: 12,
  },
  configInputBlock: {
    flex: 1,
  },
  configInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 6,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
