import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "../../context/ThemeContext";
import { api, secureStorage, API_BASE_URL } from "../../lib/api";
import { getTemplateById } from "../../lib/templates";
import { SyntaxHighlightedText } from "../../components/SyntaxHighlightedText";
import { usePreviewErrorListener } from "../../lib/agent-websocket";
import { showToast, Toast } from "../../components/Toast";
import type { Project } from "@magicappdev/shared";
import * as Network from "expo-network";
import { CACHE_TTL_DAYS, WIFI_ONLY_KEY, CACHE_ANALYTICS_KEY, type CacheAnalytics } from "../../lib/cache-constants";

interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id, initialFiles, templateSlug } = useLocalSearchParams<{ id: string; initialFiles?: string; templateSlug?: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushRepoName, setPushRepoName] = useState("");
  const [pushIsPrivate, setPushIsPrivate] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [previewError, setPreviewError] = useState<{ filePath: string; errorMessage: string; errorType: string; fileId?: string } | null>(null);
  const [fileViewerWordWrap, setFileViewerWordWrap] = useState(true);
  const [isCachedOffline, setIsCachedOffline] = useState(false);
  const [cacheHitCount, setCacheHitCount] = useState(0);
  const [cacheMissCount, setCacheMissCount] = useState(0);
  const [lastCacheCheck, setLastCacheCheck] = useState<string | null>(null);
  const [refreshingCache, setRefreshingCache] = useState(false);
  const cacheLock = useRef(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const stored = await secureStorage.getItem(CACHE_ANALYTICS_KEY);
      if (stored) {
        const analytics = JSON.parse(stored) as CacheAnalytics;
        setCacheHitCount(analytics.hits);
        setCacheMissCount(analytics.misses);
        setLastCacheCheck(analytics.lastCheck);
      }
    } catch {
      // best-effort
    }
  }, []);

  const saveAnalytics = useCallback(async (analytics: CacheAnalytics) => {
    try {
      await secureStorage.setItem(CACHE_ANALYTICS_KEY, JSON.stringify(analytics));
    } catch {
      // best-effort
    }
  }, []);

  const template = project?.templateId ? getTemplateById(project.templateId) : (templateSlug ? getTemplateById(templateSlug as string) : null);

  const parseInitialFiles = useCallback((): ProjectFile[] => {
    if (!initialFiles || typeof initialFiles !== "string") return [];
    try {
      const parsed = JSON.parse(initialFiles) as Array<{ path: string; content: string; language?: string }>;
      return parsed.map((f, index) => ({
        id: `initial-${index}`,
        projectId: id,
        path: f.path,
        content: f.content,
        language: f.language || "plaintext",
        size: f.content.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }, [id, initialFiles]);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const data = await api.unwrap<Project>(`/projects/${id}`);
      setProject(data);
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

      const data = await api.unwrap<ChatSession[]>("/chat/sessions");
      const linked = data.filter((s: ChatSession) => {
        return s.title?.includes(id) || s.id.includes(id);
      });
      setChatSessions(linked);
    } catch {
      // Silently fail - not critical
    }
  }, [id]);

  const fetchFiles = useCallback(async () => {
    if (!id) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const data = await api.getProjectFiles(id);
      setFiles(data);
    } catch {
      // Silently fail - not critical
    }
  }, [id]);

  const checkOfflineCache = useCallback(async () => {
    if (!id) return;
    try {
      const cacheDir = `${FileSystem.cacheDirectory ?? ""}projects/${id}/`;
      const manifestPath = `${cacheDir}manifest.json`;
      const manifestInfo = await FileSystem.getInfoAsync(manifestPath);
      if (manifestInfo.exists) {
        const manifestContent = await FileSystem.readAsStringAsync(manifestPath);
        const manifest = JSON.parse(manifestContent) as { cachedAt?: string; fileCount?: number };
        if (manifest.cachedAt && typeof manifest.cachedAt === "string") {
          const cachedAt = new Date(manifest.cachedAt);
          const now = new Date();
          const ageMs = now.getTime() - cachedAt.getTime();
          const ageDays = ageMs / (1000 * 60 * 60 * 24);
          if (ageDays > CACHE_TTL_DAYS) {
            await FileSystem.deleteAsync(cacheDir, { idempotent: true });
            setIsCachedOffline(false);
            setCacheMissCount(prev => {
              const next = prev + 1;
              saveAnalytics({ hits: cacheHitCount, misses: next, lastCheck: new Date().toISOString() });
              return next;
            });
            setLastCacheCheck(new Date().toISOString());
            return;
          }
        }
        setIsCachedOffline(true);
        setCacheHitCount(prev => {
          const next = prev + 1;
          saveAnalytics({ hits: next, misses: cacheMissCount, lastCheck: new Date().toISOString() });
          return next;
        });
      } else {
        setIsCachedOffline(false);
        setCacheMissCount(prev => {
          const next = prev + 1;
          saveAnalytics({ hits: cacheHitCount, misses: next, lastCheck: new Date().toISOString() });
          return next;
        });
      }
      setLastCacheCheck(new Date().toISOString());
    } catch {
      setIsCachedOffline(false);
      setCacheMissCount(prev => {
        const next = prev + 1;
        saveAnalytics({ hits: cacheHitCount, misses: next, lastCheck: new Date().toISOString() });
        return next;
      });
    }
  }, [id, cacheHitCount, cacheMissCount, saveAnalytics]);

  useEffect(() => {
    const initial = parseInitialFiles();
    if (initial.length > 0) {
      setFiles(initial);
      setLoading(false);
      fetchProject();
      fetchChatSessions();
      checkOfflineCache();
      loadAnalytics();
      return;
    }
    fetchProject();
    fetchChatSessions();
    fetchFiles();
    checkOfflineCache();
    loadAnalytics();
  }, [fetchProject, fetchChatSessions, fetchFiles, parseInitialFiles, checkOfflineCache, loadAnalytics]);

  const persistInitialFiles = useCallback(async () => {
    if (!id || !initialFiles || typeof initialFiles !== "string" || !project) return;
    const initial = parseInitialFiles();
    if (initial.length === 0) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);
      await api.bulkSaveProjectFiles(
        id,
        initial.map(f => ({ path: f.path, content: f.content })),
      );
      showToast(`Saved ${initial.length} generated files to project`, { kind: "success" });
    } catch {
      showToast("Failed to persist generated files", { kind: "error" });
    }
  }, [id, initialFiles, project, parseInitialFiles]);

  const persistTemplateSlug = useCallback(async () => {
    if (!id || !templateSlug || !project || project.templateId) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);
      await api.updateProject(id, { templateId: templateSlug as string });
      setProject(prev => prev ? { ...prev, templateId: templateSlug as string } : prev);
    } catch {
      // best-effort persistence
    }
  }, [id, templateSlug, project]);

  useEffect(() => {
    const initial = parseInitialFiles();
    if (initial.length > 0 && project) {
      void persistInitialFiles();
      void persistTemplateSlug();
    }
  }, [parseInitialFiles, persistInitialFiles, persistTemplateSlug, project]);

  const refreshCache = useCallback(async () => {
    if (!id || !project || refreshingCache) return;
    setRefreshingCache(true);
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);
      const projectFiles = await api.getProjectFiles(id);
      const cacheDir = `${FileSystem.cacheDirectory ?? ""}projects/${id}/`;
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      for (const file of projectFiles) {
        const safePath = file.path.replace(/[^a-zA-Z0-9_/-]/g, "_").replace(/\.\.\//g, "");
        const fileUri = `${cacheDir}${safePath}`;
        await FileSystem.writeAsStringAsync(fileUri, file.content);
      }
      await FileSystem.writeAsStringAsync(`${cacheDir}manifest.json`, JSON.stringify({
        projectId: id,
        projectName: project.name,
        cachedAt: new Date().toISOString(),
        fileCount: projectFiles.length,
      }));
      setIsCachedOffline(true);
      showToast("Offline cache refreshed", { kind: "success" });
    } catch {
      showToast("Failed to refresh cache", { kind: "error" });
    } finally {
      setRefreshingCache(false);
    }
  }, [id, project, refreshingCache]);

  usePreviewErrorListener(payload => {
    const file = files.find(f => f.path === payload.filePath);
    setPreviewError({
      filePath: payload.filePath,
      errorMessage: payload.errorMessage,
      errorType: payload.errorType,
      fileId: file?.id,
    });
  });

  useEffect(() => {
    if (previewError?.fileId && id) {
      const timer = setTimeout(() => {
        setPreviewError(null);
        router.push({ pathname: `/project/${id}/editor/${previewError.fileId}` as any });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [previewError?.fileId, id, router]);

  const handleStartChat = async () => {
    if (!id) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      // Create a new chat session linked to this project
      const session = await api.unwrap<{ id: string }>("/chat/sessions", {
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
        params: { sessionId: session.id, projectId: id },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start chat";
      showToast(message, { kind: "error" });
    }
  };

  const handleDelete = () => {
    showToast("Delete is not available in this view.", { kind: "info" });
  };

  const handleDownloadZip = async () => {
    if (!id || !project) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      const zipUrl = `${API_BASE_URL}/projects/${id}/export/zip`;
      const downloadPath = `${(FileSystem as any).cacheDirectory ?? ""}${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;
      const response = await fetch(zipUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const base64Data = base64.split(",")[1];
      await FileSystem.writeAsStringAsync(downloadPath, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(`file://${downloadPath}`, {
          mimeType: "application/zip",
          dialogTitle: `Share ${project.name}`,
        });
      } else {
        showToast("ZIP downloaded. Sharing is not available on this device.", { kind: "info" });
      }
    } catch {
      showToast("Failed to download ZIP", { kind: "error" });
    }
  };

  const handleShareProject = async () => {
    if (!project) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      const zipUrl = `${API_BASE_URL}/projects/${id}/export/zip`;
      const downloadPath = `${(FileSystem as any).cacheDirectory ?? ""}${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;
      const response = await fetch(zipUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const base64Data = base64.split(",")[1];
      await FileSystem.writeAsStringAsync(downloadPath, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(`file://${downloadPath}`, {
          mimeType: "application/zip",
          dialogTitle: `Share ${project.name}`,
        });
      } else {
        showToast("Sharing is not available on this device.", { kind: "info" });
      }
    } catch {
      showToast("Failed to share project", { kind: "error" });
    }
  };

  const handleShareDependencies = async () => {
    if (!project || files.length === 0) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);
      const projectFiles = await api.getProjectFiles(id);
      const deps = new Set<string>();
      for (const file of projectFiles) {
        if (file.path.endsWith("package.json")) {
          try {
            const pkg = JSON.parse(file.content) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
            if (pkg.dependencies) {
              for (const [name, version] of Object.entries(pkg.dependencies)) {
                deps.add(`${name}@${version}`);
              }
            }
            if (pkg.devDependencies) {
              for (const [name, version] of Object.entries(pkg.devDependencies)) {
                deps.add(`${name}@${version}`);
              }
            }
          } catch {
            // skip malformed package.json
          }
        }
      }
      const depText = Array.from(deps).join("\n");
      const fileName = `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}-dependencies.txt`;
      const fileUri = `${FileSystem.documentDirectory ?? ""}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, depText);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: `Share dependencies for ${project.name}`,
        });
      } else {
        showToast("Dependencies extracted. Sharing is not available on this device.", { kind: "info" });
      }
    } catch {
      showToast("Failed to share dependencies", { kind: "error" });
    }
  };

  const cacheProjectFilesOffline = useCallback(async () => {
    if (!id || !project || files.length === 0 || cacheLock.current) return;
    cacheLock.current = true;
    try {
      const wifiOnly = await secureStorage.getItem(WIFI_ONLY_KEY);
      const shouldCacheOnWifiOnly = wifiOnly === "true";
      if (shouldCacheOnWifiOnly) {
        const state = await Network.getNetworkStateAsync();
        if (state.type !== Network.NetworkStateType.WIFI) {
          return;
        }
      }
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);
      const projectFiles = await api.getProjectFiles(id);
      const cacheDir = `${FileSystem.cacheDirectory ?? ""}projects/${id}/`;
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      for (const file of projectFiles) {
        const safePath = file.path.replace(/[^a-zA-Z0-9_/-]/g, "_").replace(/\.\.\//g, "");
        const fileUri = `${cacheDir}${safePath}`;
        await FileSystem.writeAsStringAsync(fileUri, file.content);
      }
      await FileSystem.writeAsStringAsync(`${cacheDir}manifest.json`, JSON.stringify({
        projectId: id,
        projectName: project.name,
        cachedAt: new Date().toISOString(),
        fileCount: projectFiles.length,
      }));
    } catch {
      // offline caching is best-effort
    } finally {
      cacheLock.current = false;
    }
  }, [id, project, files]);

  useEffect(() => {
    if (files.length > 0) {
      void cacheProjectFilesOffline();
    }
  }, [files, cacheProjectFilesOffline]);

  const handlePushToGitHub = async () => {
    if (!id || !project || !pushRepoName.trim()) return;
    setPushing(true);
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const res = await api.pushProjectToGitHub({
        projectId: id,
        repoName: pushRepoName.trim(),
        isPrivate: pushIsPrivate,
      });
      setShowPushModal(false);
      showToast(`Repository created: ${res.repoUrl}`, { kind: "success" });
    } catch {
      showToast("Failed to push to GitHub", { kind: "error" });
    } finally {
      setPushing(false);
    }
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
      <Toast />
      <PushGitHubModal
        visible={showPushModal}
        projectName={project.name}
        onClose={() => setShowPushModal(false)}
        onPush={handlePushToGitHub}
      />

      {previewError && (
        <Modal visible={!!previewError} transparent animationType="fade" onRequestClose={() => setPreviewError(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Preview Error</Text>
              <Text style={styles.modalDescription}>
                The agent detected an error in <Text style={{ fontWeight: "600" }}>{previewError.filePath}</Text>
              </Text>
              <View style={styles.errorBox}>
                <Text style={styles.errorType}>{previewError.errorType}</Text>
                <Text style={styles.errorMessage}>{previewError.errorMessage}</Text>
              </View>
              <Text style={styles.modalDescription}>
                {previewError.fileId
                  ? "Opening the file editor shortly so you can review the issue."
                  : "The agent is analyzing a patch. You can continue editing while the agent works on a fix."}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setPreviewError(null)}>
                  <Text style={styles.modalCancelText}>Dismiss</Text>
                </TouchableOpacity>
                {previewError?.fileId && (
                  <TouchableOpacity
                    style={styles.modalPush}
                    onPress={() => {
                      setPreviewError(null);
                      router.push({ pathname: `/project/${id}/editor/${previewError.fileId}` as any });
                    }}
                  >
                    <Text style={styles.modalPushText}>Go to file</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalPush, !previewError?.fileId && styles.modalPushDisabled]}
                  onPress={() => {
                    setPreviewError(null);
                    router.push({ pathname: "/chat" as any, params: { projectId: id } });
                  }}
                >
                  <Text style={styles.modalPushText}>Open AI Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {project.name}
        </Text>
        {isCachedOffline && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline-outline" size={12} color="#FBBF24" />
            <Text style={styles.offlineBadgeText}>Cached</Text>
          </View>
        )}
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
          <DetailRow
            icon="analytics-outline"
            label="Cache Stats"
            value={`Hits: ${cacheHitCount} | Misses: ${cacheMissCount}${lastCacheCheck ? ` | Checked: ${new Date(lastCacheCheck).toLocaleTimeString()}` : ""}`}
            last
          />
        </View>

        {/* Project Files Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Files ({files.length})</Text>
          {files.length > 0 ? (
            <ScrollView style={styles.fileList} nestedScrollEnabled>
              {files.map(file => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileRow}
                  onPress={() => router.push({ pathname: `/project/${id}/editor/${file.id}` as any })}
                >
                  <Ionicons name="document-outline" size={16} color="#3B82F6" />
                  <Text style={styles.fileRowText} numberOfLines={1}>
                    {file.path}
                  </Text>
                  <Text style={styles.fileSizeText}>
                    {file.size > 1024 ? `${(file.size / 1024).toFixed(1)}KB` : `${file.size}B`}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748B" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyChatText}>No files yet</Text>
          )}
        </View>

        {/* File Content Modal */}
        <Modal visible={!!selectedFile} animationType="slide" transparent onRequestClose={() => setSelectedFile(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.fileModalContent}>
              <View style={styles.fileModalHeader}>
                <Text style={styles.fileModalTitle} numberOfLines={1}>
                  {selectedFile?.path}
                </Text>
                <View style={styles.fileModalHeaderActions}>
                  <TouchableOpacity onPress={() => setFileViewerWordWrap(!fileViewerWordWrap)}>
                    <Ionicons
                      name={fileViewerWordWrap ? "document-text-outline" : "document-text-sharp"}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close" size={22} color="#F8FAFC" />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.fileModalBody}>
                <SyntaxHighlightedText
                  code={selectedFile?.content || ""}
                  language={selectedFile?.language || "plaintext"}
                  contentStyle={styles.fileModalContentText}
                  showLineNumbers
                  wordWrap={fileViewerWordWrap}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

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

        {/* Export Actions */}
        <View style={styles.exportActions}>
          <TouchableOpacity style={styles.exportButton} onPress={handleDownloadZip}>
            <Ionicons name="download-outline" size={20} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Download ZIP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleShareProject}>
            <Ionicons name="share-outline" size={20} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Share Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleShareDependencies}>
            <Ionicons name="list-outline" size={20} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Share Dependencies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={refreshCache} disabled={refreshingCache}>
            <Ionicons name={refreshingCache ? "hourglass-outline" : "refresh-outline"} size={20} color={refreshingCache ? "#64748B" : "#3B82F6"} />
            <Text style={[styles.exportButtonText, refreshingCache && { color: "#64748B" }]}>
              {refreshingCache ? "Refreshing..." : "Refresh Cache"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={() => setShowPushModal(true)}>
            <Ionicons name="logo-github" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Push to GitHub</Text>
          </TouchableOpacity>
        </View>

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
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#422006",
    borderWidth: 1,
    borderColor: "#B45309",
  },
  offlineBadgeText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "700",
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
  exportActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  exportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1E293B",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  exportButtonText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F8FAFC",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  modalCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#64748B",
    backgroundColor: "transparent",
  },
  modalCheckboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  modalCheckboxLabel: {
    color: "#CBD5E1",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#334155",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
  },
  modalPush: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  modalPushDisabled: {
    opacity: 0.5,
  },
  modalPushText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  errorType: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  errorMessage: {
    color: "#F8FAFC",
    fontSize: 13,
    lineHeight: 18,
  },
  fileList: {
    maxHeight: 200,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 10,
  },
  fileRowText: {
    flex: 1,
    fontSize: 13,
    color: "#CBD5E1",
    fontFamily: "monospace",
  },
  fileSizeText: {
    fontSize: 11,
    color: "#64748B",
  },
  fileModalContent: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  fileModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  fileModalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fileModalTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
    fontFamily: "monospace",
    marginRight: 12,
  },
  fileModalBody: {
    padding: 16,
    maxHeight: 400,
  },
  fileModalContentText: {
    fontSize: 12,
    color: "#CBD5E1",
    fontFamily: "monospace",
    lineHeight: 18,
  },
});

function PushGitHubModal({
  projectName,
  visible,
  onClose,
  onPush,
}: {
  projectName: string;
  visible: boolean;
  onClose: () => void;
  onPush: (repoName: string, isPrivate: boolean) => Promise<void>;
}) {
  const [repoName, setRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, "-"));
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushing, setPushing] = useState(false);

  const handlePush = async () => {
    setPushing(true);
    try {
      await onPush(repoName, isPrivate);
    } finally {
      setPushing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Push to GitHub</Text>
          <Text style={styles.modalDescription}>
            Create a repository for <Text style={{ fontWeight: "600" }}>{projectName}</Text> and push all files.
          </Text>

          <TextInput
            style={styles.modalInput}
            value={repoName}
            onChangeText={setRepoName}
            placeholder="Repository name"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.modalCheckboxRow}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View style={[styles.modalCheckbox, isPrivate && styles.modalCheckboxChecked]} />
            <Text style={styles.modalCheckboxLabel}>Make repository private</Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={onClose} disabled={pushing}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalPush, (!repoName.trim() || pushing) && styles.modalPushDisabled]}
              onPress={handlePush}
              disabled={!repoName.trim() || pushing}
            >
              <Text style={styles.modalPushText}>{pushing ? "Pushing…" : "Push"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
