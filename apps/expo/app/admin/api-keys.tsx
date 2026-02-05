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
  Modal,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminApiKey } from "@magicappdev/shared";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";

export default function ApiKeysScreen() {
  const { theme } = useTheme();
  const [apiKeys, setApiKeys] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      const data = await api.getAdminApiKeys();
      setApiKeys(data);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      Alert.alert("Error", "Failed to load API keys");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleDeleteKey = (key: AdminApiKey) => {
    Alert.alert(
      "Delete API Key",
      `Are you sure you want to delete "${key.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAdminApiKey(key.id);
              setApiKeys(prev => prev.filter(k => k.id !== key.id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete API key" + error);
            }
          },
        },
      ],
    );
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      Alert.alert("Error", "Please enter a key name");
      return;
    }

    setCreating(true);
    try {
      const newKey = await api.createAdminApiKey({
        name: newKeyName.trim(),
        description: newKeyDescription.trim() || undefined,
        scopes: ["read", "write"],
      });
      setApiKeys(prev => [newKey, ...prev]);
      setModalVisible(false);
      setNewKeyName("");
      setNewKeyDescription("");
      Alert.alert("Success", "API key created successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create API key" + error);
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              API Keys ({apiKeys.length})
            </Text>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>New Key</Text>
            </TouchableOpacity>
          </View>

          {apiKeys.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <Ionicons
                name="key-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No API keys yet
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Create your first API key to get started
              </Text>
            </View>
          ) : (
            apiKeys.map(key => (
              <View
                key={key.id}
                style={[
                  styles.keyCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.keyHeader}>
                  <View style={styles.keyInfo}>
                    <Text
                      style={[styles.keyName, { color: theme.colors.text }]}
                    >
                      {key.name}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: key.isActive
                            ? theme.colors.success + "20"
                            : theme.colors.error + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: key.isActive
                              ? theme.colors.success
                              : theme.colors.error,
                          },
                        ]}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteKey(key)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.keyDetails}>
                  <View style={styles.keyRow}>
                    <Text
                      style={[
                        styles.keyLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Key Prefix
                    </Text>
                    <Text
                      style={[styles.keyValue, { color: theme.colors.text }]}
                    >
                      {key.keyPrefix}...
                    </Text>
                  </View>
                  {key.description && (
                    <View style={styles.keyRow}>
                      <Text
                        style={[
                          styles.keyLabel,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        Description
                      </Text>
                      <Text
                        style={[styles.keyValue, { color: theme.colors.text }]}
                      >
                        {key.description}
                      </Text>
                    </View>
                  )}
                  <View style={styles.keyRow}>
                    <Text
                      style={[
                        styles.keyLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Created
                    </Text>
                    <Text
                      style={[styles.keyValue, { color: theme.colors.text }]}
                    >
                      {formatDate(key.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Key Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={[styles.cancelText, { color: theme.colors.primary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              New API Key
            </Text>
            <TouchableOpacity onPress={handleCreateKey} disabled={creating}>
              {creating ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text
                  style={[styles.saveText, { color: theme.colors.primary }]}
                >
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={newKeyName}
              onChangeText={setNewKeyName}
              placeholder="API key name"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />

            <Text
              style={[styles.inputLabel, { color: theme.colors.textSecondary }]}
            >
              Description (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={newKeyDescription}
              onChangeText={setNewKeyDescription}
              placeholder="What is this key for?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </Modal>
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
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
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  keyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  keyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  keyInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  keyName: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  deleteButton: {
    padding: 4,
  },
  keyDetails: {
    marginTop: 12,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  keyLabel: {
    fontSize: 13,
  },
  keyValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
