import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../lib/api";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    secureStorage.getItem("magicappdev_access_token").then((token: string | null) => {
      if (token) {
        api.setToken(token);
        router.replace("/projects");
      }
    });

    const handleDeepLink = async (event: { url: string }) => {
      const data = Linking.parse(event.url);
      const token = data.queryParams?.token as string;
      const refreshToken = data.queryParams?.refreshToken as string;

      if (token) {
        api.setToken(token);
        await secureStorage.setItem("magicappdev_access_token", token);
        if (refreshToken) {
          api.setRefreshToken(refreshToken);
          await secureStorage.setItem("magicappdev_refresh_token", refreshToken);
        }
        router.replace("/projects");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const redirectUri = Linking.createURL("auth/callback");
      const loginUrl = api.getGitHubLoginUrl("mobile", redirectUri);
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        redirectUri
      );

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const token = parsed.queryParams?.token as string;
        const refreshToken = parsed.queryParams?.refreshToken as string;

        if (token) {
          api.setToken(token);
          await secureStorage.setItem("magicappdev_access_token", token);
          if (refreshToken) {
            api.setRefreshToken(refreshToken);
            await secureStorage.setItem("magicappdev_refresh_token", refreshToken);
          }
          router.replace("/projects");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MagicAppDev</Text>
      <Text style={styles.subtitle}>Build apps with plain English</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleGitHubLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with GitHub</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#DC2626",
    marginBottom: 16,
    textAlign: "center",
  },
});
