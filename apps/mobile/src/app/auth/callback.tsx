import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../../lib/api";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processUrl = async (url: string) => {
      console.log("AuthCallback received URL:", url);
      
      let finalUrl = url;
      if (url.includes("expo-development-client/?url=")) {
        try {
          const match = url.match(/[?&]url=([^&]+)/);
          if (match && match[1]) {
            finalUrl = decodeURIComponent(match[1]);
            console.log("Extracted inner dev client URL:", finalUrl);
          }
        } catch (e) {
          console.error("Failed to parse inner dev client url", e);
        }
      }

      const data = Linking.parse(finalUrl);
      const token = (data.queryParams?.token || data.queryParams?.accessToken) as string | undefined;
      const refreshToken = data.queryParams?.refreshToken as string | undefined;
      const sessionId = data.queryParams?.sessionId as string | undefined;

      let resolvedToken = token;
      let resolvedRefreshToken = refreshToken;

      if (!resolvedToken && finalUrl.includes("?")) {
        const queryPart = finalUrl.split("?")[1];
        const params = new URLSearchParams(queryPart);
        resolvedToken = params.get("token") || params.get("accessToken") || undefined;
        resolvedRefreshToken = params.get("refreshToken") || undefined;
      }
      if (!resolvedToken && finalUrl.includes("#")) {
        const hashPart = finalUrl.split("#")[1];
        const params = new URLSearchParams(hashPart);
        resolvedToken = params.get("token") || params.get("accessToken") || undefined;
        resolvedRefreshToken = params.get("refreshToken") || undefined;
      }

      // If we received a sessionId instead of direct tokens, fetch tokens from backend /check-session endpoint
      if (!resolvedToken && sessionId) {
        console.log("Received sessionId, fetching tokens from server...", sessionId);
        try {
          const res = await api.request<{ success: boolean; data?: { accessToken: string; refreshToken: string } }>(`/auth/check-session?sessionId=${sessionId}`);
          if (res.success && res.data) {
            resolvedToken = res.data.accessToken;
            resolvedRefreshToken = res.data.refreshToken;
          }
        } catch (e) {
          console.error("Failed to fetch session from server", e);
        }
      }

      if (resolvedToken) {
        api.setToken(resolvedToken);
        await secureStorage.setItem("magicappdev_access_token", resolvedToken);
        if (resolvedRefreshToken) {
          api.setRefreshToken(resolvedRefreshToken);
          await secureStorage.setItem("magicappdev_refresh_token", resolvedRefreshToken);
        }
        router.replace("/projects");
      } else {
        if (finalUrl.includes("expo-development-client") && !sessionId) {
          console.log("Waiting for auth callback parameters inside dev client...");
          return;
        }
        setError(`No token received from authentication (URL: ${finalUrl})`);
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) processUrl(url);
    });

    const subscription = Linking.addEventListener("url", event => {
      processUrl(event.url);
    });

    return () => subscription.remove();
  }, [router]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.hint} onPress={() => router.replace("/")}>
          Go back to login
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  error: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 8,
  },
});
