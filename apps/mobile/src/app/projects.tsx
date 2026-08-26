import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../lib/api";
import type { Project } from "@magicappdev/shared";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
      if (message.includes("expired") || message.includes("Unauthorized")) {
        await secureStorage.removeItem("magicappdev_access_token");
        router.replace("/");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No projects found. Create one on web!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.projectName}>{item.name}</Text>
            {item.description && <Text style={styles.projectDesc}>{item.description}</Text>}
            <Text style={styles.projectStatus}>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
  projectStatus: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
  },
});
