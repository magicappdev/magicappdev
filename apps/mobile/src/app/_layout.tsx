import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: "#2563EB",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Sign In",
            href: null, // Hidden on tab bar
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
      </Tabs>
    </GestureHandlerRootView>
  );
}
