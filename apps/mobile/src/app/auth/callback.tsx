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
      const data = Linking.parse(url);
      const token = data.queryParams?.token as string | undefined;
      const refreshToken = data.queryParams?.refreshToken as string | undefined;

      if (token) {
        api.setToken(token);
        await secureStorage.setItem("magicappdev_access_token", token);
        if (refreshToken) {
          api.setRefreshToken(refreshToken);
          await secureStorage.setItem("magicappdev_refresh_token", refreshToken);
        }
        router.replace("/projects");
      } else {
        setError("No token received from authentication");
      }
    };

    // Process the URL that opened the app
    Linking.getInitialURL().then(url => {
      if (url) processUrl(url);
    });

    // Listen for incoming URLs while the app is running
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
