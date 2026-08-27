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
  }, [router]);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const redirectUri = Linking.createURL("auth/callback");
      console.log("Generated redirectUri:", redirectUri);
      const loginUrl = api.getGitHubLoginUrl("mobile", redirectUri);
      console.log("Opening loginUrl:", loginUrl);

      // On mobile development client, WebBrowser.openAuthSessionAsync often returns type 'cancel' or 'dismiss'
      // because the browser redirects externally to GitHub and back to the custom scheme.
      // Therefore, we also poll secureStorage or listen via Linking events rather than relying solely on openAuthSessionAsync result.
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        redirectUri
      );
      console.log("openAuthSessionAsync result:", result);

      let redirectResultUrl = result.type === "success" && result.url ? result.url : null;

      if (redirectResultUrl) {
        if (redirectResultUrl.includes("expo-development-client/?url=")) {
          const match = redirectResultUrl.match(/[?&]url=([^&]+)/);
          if (match && match[1]) {
            redirectResultUrl = decodeURIComponent(match[1]);
          }
        }

        const parsed = Linking.parse(redirectResultUrl);
        let token = (parsed.queryParams?.token || parsed.queryParams?.accessToken) as string;
        let refreshToken = parsed.queryParams?.refreshToken as string;
        const sessionId = parsed.queryParams?.sessionId as string;

        if (!token && redirectResultUrl.includes("?")) {
          const params = new URLSearchParams(redirectResultUrl.split("?")[1]);
          token = params.get("token") || params.get("accessToken") || "";
          refreshToken = params.get("refreshToken") || "";
        }

        if (!token && sessionId) {
          try {
            const res = await api.request<{ success: boolean; data?: { accessToken: string; refreshToken: string } }>(`/auth/check-session?sessionId=${sessionId}`);
            if (res.success && res.data) {
              token = res.data.accessToken;
              refreshToken = res.data.refreshToken;
            }
          } catch (e) {
            console.error("Failed to fetch session from server in login screen", e);
          }
        }

        if (token) {
          api.setToken(token);
          await secureStorage.setItem("magicappdev_access_token", token);
          if (refreshToken) {
            api.setRefreshToken(refreshToken);
            await secureStorage.setItem("magicappdev_refresh_token", refreshToken);
          }
          router.replace("/projects");
          return;
        }
      }

      // Fallback check: see if token was saved by AuthCallback listener in the background
      setTimeout(async () => {
        const savedToken = await secureStorage.getItem("magicappdev_access_token");
        if (savedToken) {
          api.setToken(savedToken);
          router.replace("/projects");
        }
      }, 1000);

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
