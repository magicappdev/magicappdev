import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Theme from "../constants/theme";
import { Stack, router } from "expo-router";
import React from "react";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const [notifications, setNotifications] = React.useState(true);

  if (!user) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Settings",
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Profile
          </Text>
          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Image
              source={{
                uri:
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                {user.name}
              </Text>
              <Text
                style={[
                  styles.itemSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user.email}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text
                style={[
                  styles.badgeText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            App Settings
          </Text>
          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="moon" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.itemTitle,
                { flex: 1, marginLeft: 12, color: theme.colors.text },
              ]}
            >
              Theme
            </Text>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === "light" && styles.themeButtonActive,
                ]}
                onPress={() => setMode("light")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    mode === "light" && styles.themeButtonTextActive,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === "dark" && styles.themeButtonActive,
                ]}
                onPress={() => setMode("dark")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    mode === "dark" && styles.themeButtonTextActive,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === "automatic" && styles.themeButtonActive,
                ]}
                onPress={() => setMode("automatic")}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    mode === "automatic" && styles.themeButtonTextActive,
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.success },
              ]}
            >
              <Ionicons
                name="notifications"
                size={20}
                color={theme.colors.text}
              />
            </View>
            <Text
              style={[
                styles.itemTitle,
                { flex: 1, marginLeft: 12, color: theme.colors.text },
              ]}
            >
              Notifications
            </Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        {/* Admin Section - Only visible for admin users */}
        {user.role === "admin" && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Administration
            </Text>
            <TouchableOpacity
              style={[
                styles.item,
                {
                  backgroundColor: theme.colors.card,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push("/admin" as const)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Ionicons name="shield" size={20} color={theme.colors.text} />
              </View>
              <Text
                style={[
                  styles.itemTitle,
                  { flex: 1, marginLeft: 12, color: theme.colors.text },
                ]}
              >
                Admin Dashboard
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Support
          </Text>
          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.warning },
              ]}
            >
              <Ionicons name="help-buoy" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.itemTitle,
                { flex: 1, marginLeft: 12, color: theme.colors.text },
              ]}
            >
              Help Center
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.item,
            {
              marginTop: 20,
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
          onPress={logout}
        >
          <Text
            style={[
              styles.itemTitle,
              { color: theme.colors.error, textAlign: "center", flex: 1 },
            ]}
          >
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          MagicAppDev v0.1.0 Alpha
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Base styles - colors applied dynamically via theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 17,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginVertical: 40,
  },
  themeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeButtonActive: {
    backgroundColor: Theme.lightTheme.colors.primary,
    borderColor: Theme.lightTheme.colors.primary,
  },
  themeButtonText: {
    fontSize: 13,
  },
  themeButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
