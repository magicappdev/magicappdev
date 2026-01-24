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
    const wsUrl = `wss://${AGENT_HOST}/agents/magic-agent/default`;
    console.log("Connecting to WebSocket:", wsUrl);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Magic AI Chat</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#34C759" : "#FF3B30" },
                ]}
              />
              <Text style={styles.statusText}>
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
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.assistantText,
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
                <Text style={styles.suggestionValue}>{suggestedTemplate}</Text>
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

        <View style={styles.inputContainer}>
          <View
            style={[styles.inputRow, { backgroundColor: theme.colors.card }]}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Fallback
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#fff", // Fallback
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000", // Fallback
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
    color: "#8E8E93", // Fallback
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
    backgroundColor: "#007AFF", // Fallback
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff", // Fallback
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5EA", // Fallback
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff", // Fallback
  },
  assistantText: {
    color: "#000", // Fallback
  },
  suggestionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionCard: {
    flexDirection: "row",
    backgroundColor: "#E1F5FE", // Fallback
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#B3E5FC", // Fallback
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 10,
    color: "#0288D1", // Fallback
    fontWeight: "700",
    textTransform: "uppercase",
  },
  suggestionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#01579B", // Fallback
  },
  applyButton: {
    backgroundColor: "#0288D1", // Fallback
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "#fff", // Fallback
    fontSize: 12,
    fontWeight: "600",
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA", // Fallback
    backgroundColor: "#fff", // Fallback
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Fallback
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "#000", // Fallback
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF", // Fallback
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
