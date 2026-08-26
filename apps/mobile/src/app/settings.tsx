import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api, secureStorage } from "../lib/api";
import type { User } from "@magicappdev/shared";

export default function SettingsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .getCurrentUser()
      .then(u => setUser(u))
      .catch(() => {
        secureStorage.removeItem("magicappdev_access_token");
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await secureStorage.removeItem("magicappdev_access_token");
    await secureStorage.removeItem("magicappdev_refresh_token");
    api.setToken(null);
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Account Profile</Text>
        <Text style={styles.value}>{user?.name || "User"}</Text>
        <Text style={styles.subvalue}>{user?.email || ""}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  subvalue: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
