import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { api, type Project } from "../../lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    // For now, just create a project with a random name since we don't have a prompt dialog yet
    const name = `Project ${projects.length + 1}`;
    try {
      const newProject = await api.createProject({ name });
      setProjects([newProject, ...projects]);
    } catch (error) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", "Failed to create project.");
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity style={styles.projectCard}>
      <View style={styles.projectIcon}>
        <Ionicons name="cube-outline" size={24} color="#007AFF" />
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
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  if (isLoading && projects.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
            <Ionicons name="folder-open-outline" size={64} color="#D1D1D6" />
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyText}>
              Your generated projects will appear here.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateProject}
            >
              <Text style={styles.createButtonText}>Create New Project</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  projectCard: {
    backgroundColor: "#fff",
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
    color: "#1C1C1E",
  },
  projectDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  projectMeta: {
    fontSize: 12,
    color: "#AEAEB2",
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
    color: "#1C1C1E",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
