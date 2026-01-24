import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { api, type Project } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      Alert.alert("Error", "Failed to load projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const name = projectName.trim() || `Project ${projects.length + 1}`;
    try {
      const newProject = await api.createProject({ name });
      setProjects([newProject, ...projects]);
      setIsModalVisible(false);
      setProjectName("");
    } catch (error) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", "Failed to create project.");
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectIcon}>
        <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.projectDescription} numberOfLines={1}>
          {item.description || "No description"}
        </Text>
        <Text style={styles.projectMeta}>
          {item.status} • {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={loadProjects}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyText}>
              Your generated projects will appear here.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.createButtonText}>Create New Project</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Create New Project
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: theme.colors.textSecondary }]}>
                Project Name
              </Text>
              <TextInput
                style={[styles.modalInput, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Enter project name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancel, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setProjectName("");
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateProject}
                disabled={!projectName.trim()}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Fallback
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7", // Fallback
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  projectCard: {
    backgroundColor: "#fff", // Fallback
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)", // Fallback
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E", // Fallback
  },
  projectDescription: {
    fontSize: 14,
    color: "#8E8E93", // Fallback
    marginTop: 2,
  },
  projectMeta: {
    fontSize: 12,
    color: "#AEAEB2", // Fallback
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E", // Fallback
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93", // Fallback
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: "#007AFF", // Fallback
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  createButtonText: {
    color: "#fff", // Fallback
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalBody: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  modalInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA", // Fallback
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirm: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
