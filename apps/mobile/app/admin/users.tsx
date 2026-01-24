import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminUser } from "@magicappdev/shared";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";

export default function UsersScreen() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = (user: AdminUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    Alert.alert(
      "Change Role",
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await api.updateUserRole(user.id, newRole);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u)),
              );
            } catch (error) {
              Alert.alert("Error", "Failed to update user role: " + error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Users ({filteredUsers.length})
          </Text>

          {filteredUsers.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {searchQuery ? "No users found" : "No users yet"}
              </Text>
            </View>
          ) : (
            filteredUsers.map(user => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Image
                  source={{
                    uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.colors.text }]}>
                    {user.name}
                  </Text>
                  <Text
                    style={[
                      styles.userEmail,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {user.email}
                  </Text>
                  <Text
                    style={[
                      styles.userDate,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Joined {formatDate(user.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        user.role === "admin"
                          ? theme.colors.primary + "20"
                          : theme.colors.textSecondary + "20",
                    },
                  ]}
                  onPress={() => handleToggleRole(user)}
                >
                  <Ionicons
                    name={user.role === "admin" ? "shield" : "person"}
                    size={14}
                    color={
                      user.role === "admin"
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleText,
                      {
                        color:
                          user.role === "admin"
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {user.role}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
