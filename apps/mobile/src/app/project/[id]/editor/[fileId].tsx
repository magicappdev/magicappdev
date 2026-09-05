import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../../context/ThemeContext";
import { api, secureStorage } from "../../../../lib/api";
import { SyntaxHighlightedText } from "../../../../components/SyntaxHighlightedText";

interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function FileEditorScreen() {
  useTheme();
  const router = useRouter();
  const { projectId, fileId } = useLocalSearchParams<{ projectId?: string; fileId?: string }>();
  const [file, setFile] = useState<ProjectFile | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumber, setLineNumber] = useState("");
  const previewScrollRef = useRef<ScrollView>(null);
  const LINE_HEIGHT = 20;

  const loadFile = useCallback(async () => {
    if (!projectId || !fileId) return;
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const files = await api.getProjectFiles(projectId);
      const found = files.find((f: ProjectFile) => f.id === fileId);
      if (found) {
        setFile(found);
        setContent(found.content);
      }
    } catch {
      Alert.alert("Error", "Failed to load file");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fileId]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await secureStorage.getItem("magicappdev_editor_word_wrap");
        if (!cancelled && stored !== null) {
          setWordWrap(stored === "true");
        }
      } catch {
        // ignore storage errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    secureStorage.setItem("magicappdev_editor_word_wrap", wordWrap ? "true" : "false");
  }, [wordWrap]);

  const handleScrollToLine = () => {
    if (!lineNumber || !previewScrollRef.current) return;
    const line = parseInt(lineNumber, 10);
    if (Number.isNaN(line) || line < 1) return;
    const maxLine = content.split("\n").length;
    const target = Math.min(line, maxLine);
    const offset = Math.max(0, LINE_HEIGHT * (target - 1));
    previewScrollRef.current.scrollTo({ y: offset, animated: true });
  };

  const handleSave = async () => {
    if (!file || !projectId) return;
    setIsSaving(true);
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const updated = await api.saveProjectFile(projectId, {
        path: file.path,
        content,
        language: file.language,
      });
      setFile(updated);
      setHasChanges(false);
      Alert.alert("Saved", "File saved successfully");
    } catch {
      Alert.alert("Error", "Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert("Unsaved changes", "You have unsaved changes. Discard them?", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!file) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>File not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {file.path}
          </Text>
          <Text style={styles.headerSubtitle}>{file.language}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || !hasChanges}
          style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[styles.modeToggleButton, editorMode === "edit" && styles.modeToggleButtonActive]}
          onPress={() => setEditorMode("edit")}
        >
          <Text style={[styles.modeToggleText, editorMode === "edit" && styles.modeToggleTextActive]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeToggleButton, editorMode === "preview" && styles.modeToggleButtonActive]}
          onPress={() => setEditorMode("preview")}
        >
          <Text style={[styles.modeToggleText, editorMode === "preview" && styles.modeToggleTextActive]}>Preview</Text>
        </TouchableOpacity>
        {editorMode === "preview" ? (
          <View style={styles.lineJumpRow}>
            <TextInput
              style={styles.lineJumpInput}
              value={lineNumber}
              onChangeText={setLineNumber}
              placeholder="Line"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              returnKeyType="go"
              blurOnSubmit={false}
              onSubmitEditing={handleScrollToLine}
            />
            <TouchableOpacity
              style={[styles.modeToggleButton, styles.lineJumpButton]}
              onPress={handleScrollToLine}
            >
              <Ionicons name="arrow-down" size={16} color={lineNumber ? "#fff" : "#94A3B8"} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.modeToggleButton, styles.wordWrapButton, !wordWrap && styles.modeToggleButtonActive]}
            onPress={() => setWordWrap(!wordWrap)}
          >
            <Ionicons
              name={wordWrap ? "document-text-outline" : "document-text-sharp"}
              size={16}
              color={wordWrap ? "#94A3B8" : "#fff"}
            />
            <Text style={[styles.modeToggleText, !wordWrap && styles.modeToggleTextActive]}>
              {wordWrap ? "Wrap" : "No Wrap"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {editorMode === "preview" ? (
        <ScrollView ref={previewScrollRef} style={styles.previewContainer} contentContainerStyle={styles.previewContent}>
          <SyntaxHighlightedText
            code={content}
            language={file?.language || "plaintext"}
            contentStyle={styles.previewContentText}
            showLineNumbers
            wordWrap={wordWrap}
          />
        </ScrollView>
      ) : (
        <ScrollView style={styles.editorContainer} horizontal={!wordWrap} showsHorizontalScrollIndicator={!wordWrap}>
          <TextInput
            style={[styles.editor, !wordWrap && styles.editorNoWrap]}
            value={content}
            onChangeText={text => {
              setContent(text);
              setHasChanges(text !== file.content);
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textAlignVertical="top"
            placeholder="File content..."
            placeholderTextColor="#64748B"
          />
        </ScrollView>
      )}

      {hasChanges && (
        <View style={styles.unsavedBar}>
          <Text style={styles.unsavedText}>Unsaved changes</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text style={styles.unsavedSaveText}>Save now</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0B0F19",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  editorContainer: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  previewContent: {
    flexGrow: 1,
  },
  previewContentText: {
    padding: 16,
    fontSize: 13,
    color: "#CBD5E1",
    fontFamily: "monospace",
    lineHeight: 20,
  },
  modeToggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 8,
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  modeToggleButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
  },
  modeToggleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  wordWrapButton: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },
  lineJumpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  lineJumpInput: {
    flex: 1,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    color: "#F8FAFC",
    fontSize: 13,
    fontFamily: "monospace",
  },
  lineJumpButton: {
    width: 36,
    paddingVertical: 0,
  },
  editor: {
    flex: 1,
    padding: 16,
    color: "#F8FAFC",
    fontSize: 13,
    fontFamily: "monospace",
    lineHeight: 20,
    minHeight: "100%",
  },
  editorNoWrap: {
    minWidth: "100%",
    width: "auto",
  },
  unsavedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1E3A8A20",
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  unsavedText: {
    color: "#94A3B8",
    fontSize: 13,
  },
  unsavedSaveText: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#334155",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#F8FAFC",
    fontWeight: "600",
  },
});
