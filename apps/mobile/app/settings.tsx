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
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  if (!user) return null;

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
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
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
              <Text style={styles.itemTitle}>{user.name}</Text>
              <Text style={styles.itemSubtitle}>{user.email}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.item}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#5856D6" }]}
            >
              <Ionicons name="moon" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12 }]}>
              Dark Mode
            </Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          <View style={styles.item}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FF9500" }]}
            >
              <Ionicons name="notifications" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12 }]}>
              Notifications
            </Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.item}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#34C759" }]}
            >
              <Ionicons name="help-buoy" size={20} color="#fff" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 12 }]}>
              Help Center
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.item, { marginTop: 20 }]}
          onPress={logout}
        >
          <Text
            style={[
              styles.itemTitle,
              { color: "#FF3B30", textAlign: "center", flex: 1 },
            ]}
          >
            Log Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>MagicAppDev v0.1.0 Alpha</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    color: "#8E8E93",
    marginLeft: 16,
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C7C7CC",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E5EA",
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
    color: "#000",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  badge: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
  },
  version: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 12,
    marginVertical: 40,
  },
});
