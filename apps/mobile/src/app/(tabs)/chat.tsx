import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { getPromptPresets, type PromptPreset } from "@magicappdev/shared/utils";

interface MessageItem {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

export default function ChatScreen() {
  useTheme();
  const { sessionId, projectId } = useLocalSearchParams<{ sessionId?: string; projectId?: string }>();
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

  useEffect(() => {
    // Fetch dynamic models including Opencode Zen models
    fetch("https://magicappdev-api.magicappdev.workers.dev/ai/models")
      .then(res => res.json())
      .then((data: any) => {
        if (data?.success && data?.data?.models) {
          setModels(data.data.models);
        }
      })
      .catch(() => {});
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

  // Load existing session messages if sessionId is provided
  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const data = await api.request<{ data: { session: { title: string }; messages: Array<{ role: string; content: string }> } }>(
          `/chat/sessions/${sessionId}`,
        );
        if (data.data.messages.length > 0) {
          const loadedMessages: MessageItem[] = data.data.messages.map((m, i) => ({
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

  // Set initial message when projectId is provided (new chat from project)
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

    try {
      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      };
      setMessages([...updatedMessages, assistantMsg]);

      for await (const chunk of api.streamMessage(updatedMessages)) {
        assistantMsg.content += chunk;
        setMessages([...updatedMessages, { ...assistantMsg }]);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setMessages([
        ...updatedMessages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${errorObj?.message || "Failed to get response"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentModelObj = models.find(m => m.id === selectedModel);
  const isInitialChat = messages.length <= 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
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
});
