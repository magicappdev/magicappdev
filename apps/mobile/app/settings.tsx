import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const [notifications, setNotifications] = React.useState(true);

  if (!user) return null;

  const themeNames = {
    light: "Light",
    dark: "Dark",
    automatic: "Auto",
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Settings",
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
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Profile
          </Text>
          <View style={styles.item}>
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
              <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                {user.email}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
                {user.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            App Settings
          </Text>
          <View style={styles.item}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="moon" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12, color: theme.colors.text }]}>
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

          <View style={styles.item}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.success },
              ]}
            >
              <Ionicons name="notifications" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12, color: theme.colors.text }]}>
              Notifications
            </Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Support
          </Text>
          <TouchableOpacity style={styles.item}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.colors.warning },
              ]}
            >
              <Ionicons name="help-buoy" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12, color: theme.colors.text }]}>
              Help Center
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.item, { marginTop: 20 }]}
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
    backgroundColor: "#fff", // Fallback
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C7C7CC", // Fallback
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E5EA", // Fallback
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
    color: "#000", // Fallback
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#8E8E93", // Fallback
  },
  badge: {
    backgroundColor: "#F2F2F7", // Fallback
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93", // Fallback
    textTransform: "uppercase",
  },
  version: {
    textAlign: "center",
    color: "#8E8E93", // Fallback
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
    backgroundColor: "#F2F2F7", // Fallback
    borderWidth: 1,
    borderColor: "#C7C7CC", // Fallback
  },
  themeButtonActive: {
    backgroundColor: "#007AFF", // Fallback
    borderColor: "#007AFF", // Fallback
  },
  themeButtonText: {
    fontSize: 13,
    color: "#000", // Fallback
  },
  themeButtonTextActive: {
    color: "#fff", // Fallback
    fontWeight: "600",
  },
});
