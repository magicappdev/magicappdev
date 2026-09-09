import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { api, API_BASE_URL, secureStorage } from "../../lib/api";
import { getPromptPresets, type PromptPreset } from "@magicappdev/shared/utils";
import { useAgentConnection, useAgentMessages } from "../../lib/agent-websocket";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { showToast, Toast } from "../../components/Toast";

interface MessageItem {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratedProject {
  projectName: string;
  templateSlug: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/** Mirrors the agent's PendingApproval WS payload (see packages/agent). */
interface PendingApproval {
  id: string;
  tool: string;
  parameters: Record<string, unknown>;
  description: string;
  timestamp: number;
}

/**
 * Approvals left unanswered for longer than this are auto-rejected so agent
 * generations can't hang silently when the user walks away. The rejection is
 * posted as a system message and sent to the agent like a manual reject.
 */
const APPROVAL_TIMEOUT_MS = 5 * 60 * 1000;
/** How often stale approvals are swept for auto-rejection. */
const APPROVAL_SWEEP_MS = 30 * 1000;

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export default function ChatScreen() {
  const { sessionId, projectId } = useLocalSearchParams<{ sessionId?: string; projectId?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: "init-1", role: "assistant", content: "Hello! What would you like to build today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<AIModel[]>([
    { id: "@cf/meta/llama-3.3-70b-instruct-fp8", name: "Llama 3.3 70B (Workers AI)", provider: "workers-ai" },
    { id: "opencode-zen-default", name: "Opencode Zen", provider: "opencode" },
    { id: "gpt-4o", name: "GPT-4o (BYOK)", provider: "openai" },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (BYOK)", provider: "anthropic" },
  ]);
  const [selectedModel, setSelectedModel] = useState("@cf/meta/llama-3.3-70b-instruct-fp8");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [promptPresets, setPromptPresets] = useState<PromptPreset[]>([]);
  const [presetSeed, setPresetSeed] = useState(() => Date.now());
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    [],
  );
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());
  const respondingRef = useRef<Set<string>>(new Set());
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const isSavingProjectRef = useRef(false);
  const pendingFilesRef = useRef<GeneratedFile[]>([]);

  const { connected, send } = useAgentConnection();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/ai/models`, { signal: controller.signal })
      .then(res => res.json())
      .then((data: { success?: boolean; data?: { models?: AIModel[] } }) => {
        if (data?.success && data?.data?.models) {
          setModels(data.data.models);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPromptPresets(
      getPromptPresets({
        messageCount: messages.length,
        seed: presetSeed,
        count: 4,
      }),
    );
  }, [messages.length, presetSeed]);

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const data = await api.unwrap<{ session: { title: string }; messages: Array<{ role: string; content: string }> }>(
          `/chat/sessions/${sessionId}`,
        );
        if (data.messages.length > 0) {
          const loadedMessages: MessageItem[] = data.messages.map((m: { role: string; content: string }, i: number) => ({
            id: `loaded-${i}`,
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          }));
          setMessages(loadedMessages);
        }
      } catch {
        // Silently fail - keep default welcome message
      }
    };

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (projectId && !sessionId) {
      setMessages([
        {
          id: "init-project",
          role: "assistant",
          content: "Hello! I see you're starting a chat about your project. How can I help you build or modify your app?",
        },
      ]);
    }
  }, [projectId, sessionId]);

  const handleAgentMessage = useCallback((type: string, data: Record<string, unknown>) => {
    if (type === "chat_chunk") {
      const chunk = (data.content as string) || "";
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.id === "streaming") {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        }
        return [
          ...prev,
          {
            id: "streaming",
            role: "assistant",
            content: chunk,
            timestamp: Date.now(),
          },
        ];
      });
    } else if (type === "chat_done") {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.id === "streaming") {
          return [...prev.slice(0, -1), { ...last, id: crypto.randomUUID() }];
        }
        return prev;
      });
      setLoading(false);
    } else if (type === "generation_start") {
      setIsGenerating(true);
      pendingFilesRef.current = [];
      setGeneratedProject(null);
    } else if (type === "generation_file") {
      pendingFilesRef.current = [
        ...pendingFilesRef.current,
        { path: data.path as string, content: data.content as string },
      ];
    } else if (type === "generation_complete") {
      const files = pendingFilesRef.current;
      const projectName = (data.projectName as string) || "generated-app";
      setGeneratedProject({
        projectName,
        templateSlug: (data.templateSlug as string) || "",
        files,
        dependencies: (data.dependencies as Record<string, string>) || {},
        devDependencies: (data.devDependencies as Record<string, string>) || {},
      });
      setIsGenerating(false);
      setMessages(prev => [
        ...prev,
        {
          id: `gen-complete-${Date.now()}`,
          role: "system",
          content: `Generated ${files.length} files for ${projectName}. Use the actions below to review, copy dependencies, or save to your workspace.`,
        },
      ]);
    } else if (type === "generation_error") {
      setIsGenerating(false);
      setMessages(prev => [
        ...prev,
        {
          id: `gen-error-${Date.now()}`,
          role: "system",
          content: `Generation failed: ${(data.error as string) || "Unknown error"}`,
        },
      ]);
    } else if (type === "tool_pending_approval") {
      const approval = data.approval as PendingApproval | undefined;
      if (approval?.id) {
        setPendingApprovals(prev => {
          const rest = prev.filter(a => a.id !== approval.id);
          return [...rest, approval];
        });
      }
    } else if (type === "pending_approvals") {
      const approvals = Array.isArray(data.approvals)
        ? (data.approvals as PendingApproval[]).filter(a => a?.id)
        : [];
      setPendingApprovals(approvals);
    } else if (type === "approval_result") {
      const approvalId = data.approvalId as string | undefined;
      const approved = data.approved as boolean | undefined;
      const tool = data.tool as string | undefined;
      if (approvalId) {
        respondingRef.current.delete(approvalId);
        setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
        setRespondingIds(prev => {
          const next = new Set(prev);
          next.delete(approvalId);
          return next;
        });
        setMessages(prev => [
          ...prev,
          {
            id: `approval-${approvalId}-${Date.now()}`,
            role: "system",
            content: approved
              ? `Approved tool "${tool ?? "unknown"}" — executing…`
              : `Rejected tool "${tool ?? "unknown"}".`,
          },
        ]);
      }
    }
  }, []);

  useAgentMessages(handleAgentMessage);

  const respondToApproval = useCallback(
    (approvalId: string, approved: boolean) => {
      if (respondingRef.current.has(approvalId)) return;
      respondingRef.current.add(approvalId);
      setRespondingIds(prev => new Set(prev).add(approvalId));
      const ok = send({
        type: approved ? "approve_tool" : "reject_tool",
        approvalId,
      });
      if (!ok) {
        respondingRef.current.delete(approvalId);
        setRespondingIds(prev => {
          const next = new Set(prev);
          next.delete(approvalId);
          return next;
        });
        setMessages(prev => [
          ...prev,
          {
            id: `approval-send-fail-${Date.now()}`,
            role: "system",
            content: "Agent is not connected — reconnect and try again.",
          },
        ]);
      }
    },
    [send],
  );

  // Re-sync pending approvals whenever the socket (re)connects, so approvals
  // created while the screen was closed or disconnected still surface.
  useEffect(() => {
    if (connected) {
      send({ type: "get_pending_approvals" });
    }
  }, [connected, send]);

  // Auto-reject approvals left unanswered past APPROVAL_TIMEOUT_MS.
  const approvalsRef = useRef(pendingApprovals);
  useEffect(() => {
    approvalsRef.current = pendingApprovals;
  }, [pendingApprovals]);
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  useEffect(() => {
    const sweep = setInterval(() => {
      const now = Date.now();
      const stale = approvalsRef.current.filter(
        a => now - a.timestamp > APPROVAL_TIMEOUT_MS,
      );
      if (stale.length === 0) return;
      const staleIds = new Set(stale.map(a => a.id));
      setPendingApprovals(prev => prev.filter(a => !staleIds.has(a.id)));
      for (const approval of stale) {
        sendRef.current({
          type: "reject_tool",
          approvalId: approval.id,
        });
      }
      setMessages(prev => [
        ...prev,
        {
          id: `approval-timeout-${Date.now()}`,
          role: "system",
          content: `Auto-rejected ${stale.length === 1 ? `tool "${stale[0].tool}"` : `${stale.length} tools`} after 5 minutes with no response.`,
        },
      ]);
    }, APPROVAL_SWEEP_MS);
    return () => clearInterval(sweep);
  }, []);

  const handleRerollPrompts = useCallback(() => {
    setPresetSeed(prev => prev + 1);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setPromptPresets([]);
    setLoading(true);

    send({ type: "chat", content: userMsg.content, model: selectedModel });
  };

  const handleCopyDependencies = useCallback(async () => {
    if (!generatedProject) return;
    const allDeps = {
      ...generatedProject.dependencies,
      ...generatedProject.devDependencies,
    };
    const depText = Object.entries(allDeps)
      .map(([name, version]) => `${name}@${version}`)
      .join("\n");
    try {
      await Clipboard.setString(depText);
      showToast("Dependencies copied to clipboard", { kind: "success" });
    } catch {
      showToast("Clipboard unavailable", { kind: "error" });
    }
  }, [generatedProject]);

  const handleShareDependencies = useCallback(async () => {
    if (!generatedProject) return;
    const allDeps = {
      ...generatedProject.dependencies,
      ...generatedProject.devDependencies,
    };
    const depText = Object.entries(allDeps)
      .map(([name, version]) => `${name}@${version}`)
      .join("\n");
    try {
      await Clipboard.setString(depText);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        const fileName = `${generatedProject.projectName.replace(/[^a-zA-Z0-9_-]/g, "_")}-dependencies.txt`;
        const fileUri = `${FileSystem.documentDirectory ?? ""}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, depText);
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: `Share dependencies for ${generatedProject.projectName}`,
        });
      } else {
        showToast("Dependencies copied to clipboard. Sharing not available.", { kind: "info" });
      }
    } catch {
      showToast("Failed to share dependencies", { kind: "error" });
    }
  }, [generatedProject]);

  const handleSaveProject = useCallback(async () => {
    if (!generatedProject || isSavingProject || generatedProject.files.length === 0) return;
    setIsSavingProject(true);
    try {
      const project = await api.createProject({ name: generatedProject.projectName });
      await api.bulkSaveProjectFiles(
        project.id,
        generatedProject.files.map(f => ({ path: f.path, content: f.content })),
      );
      setMessages(prev => [
        ...prev,
        {
          id: `gen-save-${Date.now()}`,
          role: "system",
          content: `Project saved to your workspace as "${generatedProject.projectName}". You can open it from the Projects tab.`,
        },
      ]);
      showToast(`Saved "${generatedProject.projectName}"`, {
        kind: "success",
        durationMs: 4000,
        actionLabel: "Open Project",
        onAction: () => {
          router.push({
            pathname: `/project/${project.id}` as any,
            params: {
              initialFiles: JSON.stringify(
                generatedProject.files.map(f => ({ path: f.path, content: f.content })),
              ),
            },
          });
        },
      });
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `gen-save-fail-${Date.now()}`,
          role: "system",
          content: `Failed to save project: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsSavingProject(false);
    }
  }, [generatedProject, isSavingProject, router]);

  const handleDownloadZip = useCallback(async () => {
    if (!generatedProject) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      const zipUrl = `${API_BASE_URL}/projects/${generatedProject.projectName}/export/zip${token ? `?token=${token}` : ""}`;
      const downloadPath = `${FileSystem.documentDirectory ?? ""}${generatedProject.projectName.replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;
      const downloadResult = await FileSystem.downloadAsync(zipUrl, downloadPath);
      if (downloadResult.uri) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: "application/zip",
            dialogTitle: `Share ${generatedProject.projectName}`,
          });
        } else {
          showToast("ZIP downloaded. Sharing is not available on this device.", { kind: "info" });
        }
      }
    } catch {
      showToast("Could not download the project ZIP. Try saving to workspace instead.", { kind: "error" });
    }
  }, [generatedProject]);

  const currentModelObj = models.find(m => m.id === selectedModel);
  const isInitialChat = messages.length <= 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <Toast />
      {/* Model Selection Bar */}
      <View style={styles.modelBar}>
        <TouchableOpacity
          style={styles.modelSelectorButton}
          onPress={() => setShowModelPicker(!showModelPicker)}
        >
          <Ionicons name="sparkles" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
          <Text style={styles.modelSelectorText} numberOfLines={1}>
            Model: {currentModelObj ? currentModelObj.name : selectedModel}
          </Text>
          <Ionicons name={showModelPicker ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {projectId && (
        <View style={styles.projectBanner}>
          <Ionicons name="folder-outline" size={14} color="#3B82F6" />
          <Text style={styles.projectBannerText} numberOfLines={1}>
            Chatting about project
          </Text>
        </View>
      )}

      {showModelPicker && (
        <View style={styles.modelDropdown}>
          <ScrollView style={{ maxHeight: 180 }}>
            {models.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.modelOption, selectedModel === m.id && styles.modelOptionActive]}
                onPress={() => {
                  setSelectedModel(m.id);
                  setShowModelPicker(false);
                }}
              >
                <Text style={[styles.modelOptionText, selectedModel === m.id && styles.modelOptionTextActive]}>
                  {m.name}
                </Text>
                <Text style={styles.modelProviderBadge}>{m.provider.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                msg.role === "user" ? styles.userText : styles.assistantText,
              ]}
            >
              {msg.content}
            </Text>
          </View>
        ))}
        {promptPresets.length > 0 && !loading && isInitialChat && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>Suggestions</Text>
              <TouchableOpacity onPress={handleRerollPrompts} style={styles.rerollButton} accessibilityLabel="Reroll suggestions">
                <Ionicons name="refresh" size={14} color="#94A3B8" />
                <Text style={styles.rerollText}>Reroll</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestionsList}>
                {promptPresets.map(preset => (
                  <TouchableOpacity
                    key={`${preset.label}-${preset.prompt}`}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setInput(preset.prompt);
                    }}
                  >
                    <Text style={styles.suggestionText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {pendingApprovals.length > 0 && (
        <View style={styles.approvalsContainer}>
          {pendingApprovals.map(approval => {
            const responding = respondingIds.has(approval.id);
            const description =
              approval.description.length > 300
                ? `${approval.description.slice(0, 300)}…`
                : approval.description;
            return (
              <View key={approval.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                  <Ionicons name="shield-half" size={16} color="#FBBF24" />
                  <Text style={styles.approvalTool} numberOfLines={1}>
                    {approval.tool}
                  </Text>
                  <Text style={styles.approvalBadge}>needs approval</Text>
                </View>
                <Text style={styles.approvalDescription}>{description}</Text>
                <View style={styles.approvalActions}>
                  <TouchableOpacity
                    style={[
                      styles.approveButton,
                      responding && styles.actionButtonDisabled,
                    ]}
                    onPress={() => respondToApproval(approval.id, true)}
                    disabled={responding}
                    accessibilityLabel={`Approve ${approval.tool}`}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.rejectButton,
                      responding && styles.actionButtonDisabled,
                    ]}
                    onPress={() => respondToApproval(approval.id, false)}
                    disabled={responding}
                    accessibilityLabel={`Reject ${approval.tool}`}
                  >
                    <Ionicons name="close" size={14} color="#FCA5A5" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {generatedProject && (
        <View style={styles.generatedContainer}>
          <View style={styles.generatedHeader}>
            <Ionicons name="cube" size={16} color="#3B82F6" />
            <Text style={styles.generatedTitle} numberOfLines={1}>
              {generatedProject.projectName}
            </Text>
            <Text style={styles.generatedMeta}>
              {generatedProject.files.length} files
            </Text>
            <TouchableOpacity
              style={styles.generatedAction}
              onPress={handleCopyDependencies}
              accessibilityLabel="Copy dependencies"
            >
              <Ionicons name="copy-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.generatedAction}
              onPress={handleShareDependencies}
              accessibilityLabel="Share dependencies"
            >
              <Ionicons name="share-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.generatedAction}
              onPress={handleSaveProject}
              disabled={isSavingProject}
              accessibilityLabel="Save project"
            >
              {isSavingProject ? (
                <Ionicons name="reload" size={16} color="#94A3B8" style={{ transform: [{ rotate: "45deg" }] }} />
              ) : (
                <Ionicons name="save-outline" size={16} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dependenciesRow}>
            <View style={styles.dependencyChip}>
              <Text style={styles.dependencyText}>
                {generatedProject.templateSlug}
              </Text>
            </View>
            {Object.entries(generatedProject.dependencies).slice(0, 6).map(([name, version]) => (
              <View key={name} style={styles.dependencyChip}>
                <Text style={styles.dependencyText}>
                  {name}@{version}
                </Text>
              </View>
            ))}
            {Object.keys(generatedProject.devDependencies).length > 0 && (
              <View style={styles.dependencyChip}>
                <Text style={styles.dependencyText}>
                  +{Object.keys(generatedProject.devDependencies).length} dev
                </Text>
              </View>
            )}
          </ScrollView>

          <ScrollView style={styles.filesList}>
            {generatedProject.files.map(file => (
              <View key={file.path} style={styles.fileItem}>
                <Text style={styles.filePath}>{file.path}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Describe an app you want to build..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  modelBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderColor: "#334155",
  },
  modelSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modelSelectorText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  modelDropdown: {
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  modelOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  modelOptionActive: {
    backgroundColor: "#2563EB",
  },
  modelOptionText: {
    color: "#CBD5E1",
    fontSize: 13,
  },
  modelOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modelProviderBadge: {
    fontSize: 10,
    color: "#94A3B8",
    backgroundColor: "#0F172A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  projectBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 8,
  },
  projectBannerText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "600",
  },
  chatArea: {
    flex: 1,
    padding: 16,
  },
  chatContent: {
    paddingBottom: 20,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#3B82F6",
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#334155",
  },
  bubbleText: {
    fontSize: 15,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#F8FAFC",
  },
  inputArea: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#1E293B",
    borderTopWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: "#F8FAFC",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  suggestionsTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rerollButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  rerollText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
  },
  suggestionsList: {
    flexDirection: "row",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "500",
  },
  approvalsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  approvalCard: {
    backgroundColor: "#451A0355",
    borderWidth: 1,
    borderColor: "#B45309",
    borderRadius: 12,
    padding: 12,
  },
  approvalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  approvalTool: {
    color: "#FDE68A",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  approvalBadge: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "500",
  },
  approvalDescription: {
    color: "#E7E5E4",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  approvalActions: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#15803D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#B91C1C",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  generatedAction: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
  },
  generatedContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  generatedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  generatedTitle: {
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  generatedMeta: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },
  dependenciesRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  dependencyChip: {
    backgroundColor: "#0F172A",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dependencyText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontFamily: "monospace",
  },
  filesList: {
    maxHeight: 180,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  filePath: {
    color: "#E2E8F0",
    fontSize: 12,
    fontFamily: "monospace",
  },
});
