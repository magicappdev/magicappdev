import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { api, type Project } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const name = projectName.trim();
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newProject = await api.createProject({
        name,
        description: projectDescription.trim() || undefined,
      });
      setProjects([newProject, ...projects]);
      setIsModalVisible(false);
      setProjectName("");
      setProjectDescription("");
    } catch (error) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", "Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = useCallback(
    async (projectId: string, projectName: string) => {
      Alert.alert(
        "Delete Project",
        `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await api.deleteProject(projectId);
                setProjects(projects.filter(p => p.id !== projectId));
              } catch (error) {
                console.error("Failed to delete project:", error);
                Alert.alert(
                  "Error",
                  "Failed to delete project. Please try again.",
                );
              }
            },
          },
        ],
      );
    },
    [projects],
  );

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: theme.colors.card }]}
      accessibilityRole="button"
      accessibilityLabel={`Open project ${item.name}`}
      accessibilityHint="Opens details for this project"
      onLongPress={() => handleDeleteProject(item.id, item.name)}
    >
      <View style={styles.projectIcon}>
        <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.projectInfo}>
        <Text style={[styles.projectName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.projectDescription,
            { color: theme.colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {item.description || "No description"}
        </Text>
        <Text
          style={[styles.projectMeta, { color: theme.colors.textSecondary }]}
        >
          {item.status} • {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteProject(item.id, item.name)}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={`Delete ${item.name}`}
        accessibilityHint="Deletes this project"
      >
        <Ionicons
          name="trash-outline"
          size={18}
          color={theme.colors.error || "#ef4444"}
        />
      </TouchableOpacity>
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={loadProjects}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No projects yet
            </Text>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Your generated projects will appear here.
            </Text>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: theme.colors.primary },
              ]}
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Create New Project
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text
                style={[
                  styles.modalLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Project Name
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Enter project name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalCancel,
                  { backgroundColor: theme.colors.background },
                ]}
                onPress={() => {
                  setIsModalVisible(false);
                  setProjectName("");
                }}
              >
                <Text
                  style={[styles.modalButtonText, { color: theme.colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirm,
                  { backgroundColor: theme.colors.primary },
                ]}
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

// Base styles - colors applied dynamically via theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  projectCard: {
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
    backgroundColor: "rgba(0, 122, 255, 0.1)",
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
  },
  projectDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  projectMeta: {
    fontSize: 12,
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
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
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
    color: "#FFFFFF",
  },
});
