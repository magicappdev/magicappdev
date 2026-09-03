import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { api, secureStorage } from "../../lib/api";
import { getTemplateById } from "../../lib/templates";
import type { Project } from "@magicappdev/shared";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailScreen() {
  useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const template = project?.templateId ? getTemplateById(project.templateId) : null;

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const data = await api.request<{ success: boolean; data: Project }>(`/projects/${id}`);
      setProject(data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load project";
      setError(message);
      if (message.includes("expired") || message.includes("Unauthorized")) {
        await secureStorage.removeItem("magicappdev_access_token");
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchChatSessions = useCallback(async () => {
    if (!id) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const data = await api.request<{ success: boolean; data: ChatSession[] }>("/chat/sessions");
      const linked = data.data.filter((s: ChatSession) => {
        // Match sessions that reference this project by title pattern or id
        return s.title?.includes(id) || s.id.includes(id);
      });
      setChatSessions(linked);
    } catch {
      // Silently fail - not critical
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchChatSessions();
  }, [fetchProject, fetchChatSessions]);

  const handleStartChat = async () => {
    if (!id) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      // Create a new chat session linked to this project
      const session = await api.request<{ success: boolean; data: { id: string } }>("/chat/sessions", {
        method: "POST",
        body: JSON.stringify({
          projectId: id,
          title: `Chat about ${project?.name || "project"}`,
        }),
      });

      // Navigate to chat with the session id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push({
        pathname: "/chat" as any,
        params: { sessionId: session.data.id, projectId: id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start chat";
      Alert.alert("Error", message);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Project", "Are you sure you want to delete this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.request(`/projects/${id}`, { method: "DELETE" });
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete project");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error || "Project not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {project.name}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Template & Status Badges */}
        <View style={styles.badgeRow}>
          {template && (
            <View style={[styles.badge, { backgroundColor: `${template.color}15`, borderColor: `${template.color}30` }]}>
              <Ionicons name={template.icon} size={14} color={template.color} />
              <Text style={[styles.badgeText, { color: template.color }]}>
                {template.name}
              </Text>
            </View>
          )}
          <View style={[styles.badge, styles.statusBadge]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
        </View>

        {/* Description */}
        {project.description ? (
          <Text style={styles.description}>{project.description}</Text>
        ) : null}

        {/* Project Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Details</Text>

          <DetailRow
            icon="finger-print-outline"
            label="Project ID"
            value={project.id}
            mono
          />
          <DetailRow
            icon="link-outline"
            label="Slug"
            value={project.slug}
            mono
          />
          <DetailRow
            icon="calendar-outline"
            label="Created"
            value={new Date(project.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
          <DetailRow
            icon="time-outline"
            label="Last Updated"
            value={new Date(project.updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            last
          />
        </View>

        {/* Chat Sessions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Chat Sessions</Text>
          {chatSessions.length > 0 ? (
            chatSessions.map(session => (
              <TouchableOpacity
                key={session.id}
                style={styles.chatRow}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={() => router.push({ pathname: "/chat" as any, params: { sessionId: session.id } })}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#3B82F6" />
                <Text style={styles.chatRowText} numberOfLines={1}>
                  {session.title}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyChatText}>No chat sessions yet</Text>
          )}
        </View>

        {/* Start Chat CTA */}
        <TouchableOpacity style={styles.chatCta} onPress={handleStartChat}>
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.chatCtaText}>Start AI Chat</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Detail Row Component ─────────────────────────────────────── */

function DetailRow({
  icon,
  label,
  value,
  mono,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, mono && styles.mono]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0B0F19",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#1E3A8A20",
    borderColor: "#3B82F630",
  },
  statusText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 15,
    color: "#CBD5E1",
    marginBottom: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#F8FAFC",
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 10,
  },
  chatRowText: {
    flex: 1,
    fontSize: 14,
    color: "#CBD5E1",
  },
  emptyChatText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingVertical: 16,
  },
  chatCta: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  chatCtaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#334155",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#F8FAFC",
    fontWeight: "600",
  },
});
