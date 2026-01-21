import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { router } from "expo-router";
import { api } from "../lib/api";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert("All fields are required");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.register({ email, password, name });
      if (response.success) {
        alert("Registration successful! Please login.");
        router.replace("/login");
      } else {
        alert(response.error?.message || "Registration failed");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An error occurred";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Join MagicAppDev</Text>
        <Text style={styles.subtitle}>Start building apps like magic</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#8E8E93",
    marginBottom: 48,
  },
  card: {
    gap: 16,
  },
  input: {
    height: 56,
    backgroundColor: "#F2F2F7",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
