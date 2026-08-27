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
      // If opened via development client wrapper, check if there is an inner URL param
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
      const token = data.queryParams?.token as string | undefined;
      const refreshToken = data.queryParams?.refreshToken as string | undefined;

      let resolvedToken = token;
      let resolvedRefreshToken = refreshToken;

      if (!resolvedToken && finalUrl.includes("?")) {
        const queryPart = finalUrl.split("?")[1];
        const params = new URLSearchParams(queryPart);
        resolvedToken = params.get("token") || undefined;
        resolvedRefreshToken = params.get("refreshToken") || undefined;
      }
      if (!resolvedToken && finalUrl.includes("#")) {
        const hashPart = finalUrl.split("#")[1];
        const params = new URLSearchParams(hashPart);
        resolvedToken = params.get("token") || undefined;
        resolvedRefreshToken = params.get("refreshToken") || undefined;
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
        // If it's just the dev client root url without tokens, ignore or show loading instead of immediate error
        if (finalUrl.includes("expo-development-client")) {
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
