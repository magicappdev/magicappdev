import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { api, secureStorage } from "../lib/api";
import { TemplateCard } from "../components/TemplateCard";
import { MOBILE_TEMPLATES, type MobileTemplate } from "../lib/templates";

type WizardStep = "template" | "details";

export default function NewProjectScreen() {
  useTheme();
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<MobileTemplate | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectTemplate = (template: MobileTemplate) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (!selectedTemplate) {
      Alert.alert("Select a template", "Please choose a template to continue.");
      return;
    }
    setStep("details");
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("template");
    } else {
      router.back();
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }
    if (!selectedTemplate) return;

    setSubmitting(true);
    try {
      const token = await secureStorage.getItem("magicappdev_access_token");
      if (token) api.setToken(token);

      const result = await api.request<{ success: boolean; data: { id: string } }>("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          templateId: selectedTemplate.id,
          config: {},
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace(`/project/${result.data.id}` as any);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === "template" ? "New Project" : "Name Your App"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressRow}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressLine, step === "details" && styles.progressLineActive]} />
        <View style={[styles.progressDot, step === "details" && styles.progressDotActive]} />
      </View>

      {step === "template" ? (
        <TemplateSelectionStep
          selectedTemplate={selectedTemplate}
          onSelect={handleSelectTemplate}
          onContinue={handleContinue}
        />
      ) : (
        <DetailsStep
          selectedTemplate={selectedTemplate!}
          name={name}
          onNameChange={setName}
          description={description}
          onDescriptionChange={setDescription}
          onCreate={handleCreate}
          submitting={submitting}
        />
      )}
    </KeyboardAvoidingView>
  );
}

/* ── Step 1: Template Selection ──────────────────────────────── */

function TemplateSelectionStep({
  selectedTemplate,
  onSelect,
  onContinue,
}: {
  selectedTemplate: MobileTemplate | null;
  onSelect: (t: MobileTemplate) => void;
  onContinue: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepSubtitle, { color: colors.subText }]}>
        Pick a starting point for your app
      </Text>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {MOBILE_TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplate?.id === template.id}
              onPress={() => onSelect(template)}
            />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          { backgroundColor: selectedTemplate ? "#3B82F6" : colors.border },
        ]}
        onPress={onContinue}
        disabled={!selectedTemplate}
      >
        <Text
          style={[
            styles.continueButtonText,
            { color: selectedTemplate ? "#fff" : colors.subText },
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ── Step 2: App Details ─────────────────────────────────────── */

function DetailsStep({
  selectedTemplate,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  onCreate,
  submitting,
}: {
  selectedTemplate: MobileTemplate;
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  onCreate: () => void;
  submitting: boolean;
}) {
  const { colors } = useTheme();

  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Selected Template Badge */}
      <View style={[styles.templateBadge, { backgroundColor: `${selectedTemplate.color}15`, borderColor: `${selectedTemplate.color}30` }]}>
        <Ionicons name={selectedTemplate.icon} size={20} color={selectedTemplate.color} />
        <Text style={[styles.templateBadgeText, { color: selectedTemplate.color }]}>
          {selectedTemplate.name}
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.subText }]}>App Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }]}
        placeholder="My Awesome App"
        placeholderTextColor={colors.subText}
        value={name}
        onChangeText={onNameChange}
        autoFocus
      />

      <Text style={[styles.label, { color: colors.subText }]}>Description</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline, { backgroundColor: colors.cardBg, borderColor: colors.border, color: colors.text }]}
        placeholder="What does your app do?"
        placeholderTextColor={colors.subText}
        value={description}
        onChangeText={onDescriptionChange}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.createButton, { opacity: submitting || !name.trim() ? 0.6 : 1 }]}
        onPress={onCreate}
        disabled={submitting || !name.trim()}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="rocket-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.createButtonText}>Create Project</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#334155",
  },
  progressDotActive: {
    backgroundColor: "#3B82F6",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#334155",
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: "#3B82F6",
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  continueButton: {
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  templateBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  templateBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
