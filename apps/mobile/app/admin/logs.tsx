import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import type { SystemLog, LogsStats } from "@magicappdev/shared";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";

type LogLevel = "debug" | "info" | "warn" | "error" | "all";

export default function LogsScreen() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<LogsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>("all");

  const fetchData = useCallback(async () => {
    try {
      const [logsData, statsData] = await Promise.all([
        api.getSystemLogs({
          limit: 100,
          level: selectedLevel === "all" ? undefined : selectedLevel,
        }),
        api.getLogsStats(),
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return theme.colors.error;
      case "warn":
        return theme.colors.warning;
      case "info":
        return theme.colors.primary;
      case "debug":
        return theme.colors.textSecondary;
      default:
        return theme.colors.text;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return "close-circle";
      case "warn":
        return "warning";
      case "info":
        return "information-circle";
      case "debug":
        return "bug";
      default:
        return "ellipse";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const levels: LogLevel[] = ["all", "error", "warn", "info", "debug"];

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
      {/* Stats Summary */}
      <View style={[styles.statsBar, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {stats?.totalLogs ?? 0}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Total
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {stats?.byLevel?.error ?? 0}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Errors
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {stats?.byLevel?.warn ?? 0}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Warnings
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {stats?.byLevel?.info ?? 0}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Info
          </Text>
        </View>
      </View>

      {/* Level Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {levels.map(level => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedLevel === level
                    ? theme.colors.primary
                    : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedLevel === level ? "#fff" : theme.colors.text,
                },
              ]}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Logs List */}
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {logs.length === 0 ? (
          <View
            style={[styles.emptyState, { backgroundColor: theme.colors.card }]}
          >
            <Ionicons
              name="document-text-outline"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              No logs found
            </Text>
          </View>
        ) : (
          <View style={styles.logsList}>
            {logs.map(log => (
              <View
                key={log.id}
                style={[
                  styles.logItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderLeftColor: getLevelColor(log.level),
                  },
                ]}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logLevel}>
                    <Ionicons
                      name={getLevelIcon(log.level) as never}
                      size={16}
                      color={getLevelColor(log.level)}
                    />
                    <Text
                      style={[
                        styles.levelText,
                        { color: getLevelColor(log.level) },
                      ]}
                    >
                      {log.level.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.logTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {formatDate(log.createdAt)}
                  </Text>
                </View>
                <Text
                  style={[styles.logCategory, { color: theme.colors.primary }]}
                >
                  {log.category}
                </Text>
                <Text style={[styles.logMessage, { color: theme.colors.text }]}>
                  {log.message}
                </Text>
                {log.details && (
                  <Text
                    style={[
                      styles.logDetails,
                      { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {log.details}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
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
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logsList: {
    padding: 12,
  },
  logItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
  },
  logTime: {
    fontSize: 11,
  },
  logCategory: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  logMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  logDetails: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "monospace",
  },
  emptyState: {
    margin: 16,
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
});
