import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import type { MobileTemplate } from "../lib/templates";

interface TemplateCardProps {
  template: MobileTemplate;
  selected: boolean;
  onPress: () => void;
}

export function TemplateCard({ template, selected, onPress }: TemplateCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: selected ? template.color : colors.border,
        },
        selected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${template.color}20` },
        ]}
      >
        <Ionicons name={template.icon} size={28} color={template.color} />
      </View>
      <Text
        style={[styles.name, { color: colors.text }]}
        numberOfLines={1}
      >
        {template.name}
      </Text>
      <Text
        style={[styles.description, { color: colors.subText }]}
        numberOfLines={2}
      >
        {template.description}
      </Text>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: template.color }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "46%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: "center",
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
