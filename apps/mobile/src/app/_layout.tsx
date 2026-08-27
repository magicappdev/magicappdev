import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: "#0B0F19",
          },
          headerTintColor: "#F8FAFC",
          headerTitleStyle: {
            fontWeight: "700",
          },
          tabBarStyle: {
            backgroundColor: "#0B0F19",
            borderTopColor: "#1E293B",
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#3B82F6",
          tabBarInactiveTintColor: "#64748B",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "albums-outline";

            if (route.name === "projects") {
              iconName = focused ? "folder" : "folder-outline";
            } else if (route.name === "chat") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            } else if (route.name === "settings") {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Sign In",
            href: null,
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: "Projects",
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "AI Chat",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
        <Tabs.Screen
          name="settings/profile"
          options={{
            href: null,
            title: "Profile Settings",
          }}
        />
        <Tabs.Screen
          name="settings/ai-provider"
          options={{
            href: null,
            title: "AI Provider Settings",
          }}
        />
        <Tabs.Screen
          name="auth/callback"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
