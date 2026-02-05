// Polyfills for React Native - ORDER MATTERS!
// 1. URL polyfill for proper URL parsing
// DO NOT import "partysocket/event-target-polyfill" - conflicts with React Native 0.81's native EventTarget
// DO NOT import "event-target-polyfill" (generic) - same issue
// DO NOT import "react-native-polyfill-globals/auto" - breaks fetch blob handling

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { AGENT_HOST } from "../../lib/api";
import "react-native-url-polyfill/auto";
// 2. Crypto polyfill for secure random generation
import "react-native-get-random-values";

function buildAgentWebSocketUrl(
  host: string | undefined | null,
): string | null {
  if (!host) {
    console.error("AGENT_HOST is not defined");
    return null;
  }
  let normalized = host.trim();
  // Strip common http/https prefixes if misconfigured that way
  if (normalized.startsWith("http://")) {
    normalized = normalized.substring("http://".length);
  } else if (normalized.startsWith("https://")) {
    normalized = normalized.substring("https://".length);
  }
  // Remove any trailing slashes
  while (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  // Basic validation: no spaces and non-empty
  if (!normalized || /\s/.test(normalized)) {
    console.error("AGENT_HOST is malformed:", host);
    return null;
  }
  const wsUrl = `wss://${normalized}/agents/magic-agent/default`;
  try {
    // Validate URL format
    new URL(wsUrl);
  } catch (e) {
    console.error("Constructed WebSocket URL is invalid:", wsUrl, e);
    return null;
  }
  return wsUrl;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export default function ChatScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI development assistant. Describe the app you want to build, and I'll help you create it.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestedTemplate, setSuggestedTemplate] = useState<string | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    // Small delay to ensure modal/layout is ready
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    // Use native WebSocket instead of AgentClient to avoid EventTarget polyfill conflicts
    // The agent endpoint accepts standard WebSocket connections
    // const wsUrl = `wss://${AGENT_HOST}/agents/magic-agent/default`;
    const wsUrl = buildAgentWebSocketUrl(AGENT_HOST);
    if (!wsUrl) {
      // Invalid or undefined host; do not attempt to connect
      return;
    }
    // Sanitize URL for logging to prevent log injection
    const sanitizedUrl = wsUrl.replace(/[\r\n]/g, "");
    console.log("Connecting to WebSocket:", sanitizedUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Agent");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("Disconnected from Agent");
      setIsConnected(false);
    };

    ws.onerror = error => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat_chunk") {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + data.content },
              ];
            } else {
              return [
                ...prev,
                {
                  id: "streaming",
                  role: "assistant",
                  content: data.content,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        } else if (data.type === "chat_done") {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, id: Date.now().toString() },
              ];
            }
            return prev;
          });
          setIsLoading(false);
          if (data.suggestedTemplate) {
            setSuggestedTemplate(data.suggestedTemplate);
          }
        } else if (data.type === "error") {
          setIsLoading(false);
          console.error("Agent error:", data.message);
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setSuggestedTemplate(null);

    // Send to Agent via native WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          content: userMessage.content,
        }),
      );
    } else {
      console.error("WebSocket is not connected");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: {
    nativeEvent: { key: string; shiftKey?: boolean };
  }) => {
    if (e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
      Keyboard.dismiss();
      sendMessage();
    }
  };

  const applyTemplate = (templateId: string) => {
    const msg = `Use the ${templateId} template.`;
    setInput(msg);
    // Focus the input after changing the text
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 60}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Magic AI Chat
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#34C759" : "#FF3B30" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? styles.userBubble
                    : [
                        styles.assistantBubble,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser
                      ? styles.userText
                      : [styles.assistantText, { color: theme.colors.text }],
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
        />

        {suggestedTemplate && (
          <View style={styles.suggestionContainer}>
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionLabel}>Suggested Template</Text>
                <Text
                  style={[styles.suggestionValue, { color: theme.colors.text }]}
                >
                  {suggestedTemplate}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => applyTemplate(suggestedTemplate)}
              >
                <Text style={styles.applyButtonText}>Use</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.colors.text }]}
              value={input}
              onChangeText={setInput}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              editable={isConnected}
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading || !isConnected) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!input.trim() || isLoading || !isConnected}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Base styles - colors applied dynamically via theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
    backgroundColor: "#007AFF",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {},
  suggestionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#007AFF",
  },
  suggestionValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "android" ? 8 : 0,
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "flex-end",
    gap: 8,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
    margin: 8,
    marginTop: 0,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
    backgroundColor: "#007AFF",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
