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
} from "react-native";
import EventSource, { type EventSourceListener } from "react-native-sse";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { CHAT_API_URL } from "../../lib/api";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI development assistant. Describe the app you want to build, and I'll help you create it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const payload = {
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage.content },
        ],
      };

      // Use EventSource for SSE
      // Note: We use CHAT_API_URL if it points to llmchat worker,
      // OR we can use the main API if it supports /api/ai/chat with SSE.
      // Based on shared/api/client.ts, the main API supports /ai/chat.
      // If CHAT_API_URL is different, we use it.
      // The llmchat worker uses /api/chat. The main api uses /ai/chat.
      // I'll assume we want to use the llmchat worker as requested.

      const es = new EventSource(`${CHAT_API_URL}/api/chat`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
        pollingInterval: 0,
      });

      const listener: EventSourceListener = event => {
        if (event.type === "open") {
          console.log("Connection opened");
        } else if (event.type === "message") {
          if (event.data === "[DONE]") {
            es.close();
            setIsLoading(false);
            return;
          }
          try {
            // Some SSE implementations send just the text, others send JSON.
            // packages/llmchat sends the raw stream from Workers AI.
            // Workers AI stream chunks are usually JSON strings like { response: "..." }
            // But sometimes they are just text.
            // Let's try parsing.
            const parsed = JSON.parse(event.data || "{}");
            if (parsed.response) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + parsed.response }
                    : msg,
                ),
              );
            }
          } catch {
            // If it's not JSON, maybe it's raw text?
            // Workers AI usually sends JSON.
            console.log("Received data:", event.data);
          }
        } else if (event.type === "error") {
          if (event.message !== "network error") {
            // Ignore some network errors on close
            console.error("Connection error:", event.message);
          }
          es.close();
          setIsLoading(false);
        }
      };

      es.addEventListener("open", listener);
      es.addEventListener("message", listener);
      es.addEventListener("error", listener);
    } catch (error) {
      console.error("Chat init error:", error);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the API.",
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Magic AI Chat</Text>
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
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "#000",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
