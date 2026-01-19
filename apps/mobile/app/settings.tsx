import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

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
          <TouchableOpacity style={styles.item}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#007AFF" }]}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>Account Info</Text>
              <Text style={styles.itemSubtitle}>
                Manage your profile details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
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

        <TouchableOpacity style={[styles.item, { marginTop: 20 }]}>
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
  version: {
    textAlign: "center",
    color: "#8E8E93",
    fontSize: 12,
    marginVertical: 40,
  },
});
