import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { TouchableOpacity } from "react-native";
import { router, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";

export default function AdminLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Redirect non-admin users
  if (!user || user.role !== "admin") {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Dashboard",
        }}
      />
      <Stack.Screen
        name="api-keys"
        options={{
          title: "API Keys",
        }}
      />
      <Stack.Screen
        name="logs"
        options={{
          title: "System Logs",
        }}
      />
      <Stack.Screen
        name="config"
        options={{
          title: "Global Config",
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: "User Management",
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: "Change Password",
        }}
      />
    </Stack>
  );
}
