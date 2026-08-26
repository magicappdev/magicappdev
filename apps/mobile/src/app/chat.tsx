import React, { useState } from "react";
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
import { api } from "../lib/api";
import type { AiMessage } from "@magicappdev/shared";

interface MessageItem extends AiMessage {
  id: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: "init-1", role: "assistant", content: "Hello! What would you like to build today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${err?.message || "Failed to get response"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: "#E2E8F0",
    alignSelf: "flex-start",
  },
  bubbleText: {
    fontSize: 15,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#0F172A",
  },
  inputArea: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: "#0F172A",
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
