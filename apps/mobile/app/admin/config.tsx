import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import type { GlobalConfig } from "@magicappdev/shared";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";

export default function ConfigScreen() {
  const { theme } = useTheme();
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await api.getGlobalConfig();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
      Alert.alert("Error", "Failed to load configuration");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (updates: Partial<GlobalConfig>) => {
    if (!config) return;

    setSaving(true);
    try {
      const newConfig = await api.updateGlobalConfig(updates);
      setConfig(newConfig);
    } catch (error) {
      Alert.alert("Error", "Failed to update configuration" + error);
      // Revert local state
      fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof GlobalConfig) => {
    if (!config) return;
    const currentValue = config[key];
    if (typeof currentValue === "boolean") {
      setConfig({ ...config, [key]: !currentValue });
      updateConfig({ [key]: !currentValue });
    }
  };

  const handleNumberChange = (key: keyof GlobalConfig, value: string) => {
    if (!config) return;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setConfig({ ...config, [key]: numValue });
    }
  };

  const handleNumberBlur = (key: keyof GlobalConfig) => {
    if (!config) return;
    updateConfig({ [key]: config[key] });
  };

  if (loading || !config) {
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
        {saving && (
          <View
            style={[
              styles.savingBanner,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}

        {/* System Settings */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            System Settings
          </Text>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.warning + "20" },
                ]}
              >
                <Ionicons
                  name="construct"
                  size={20}
                  color={theme.colors.warning}
                />
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Maintenance Mode
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Disable access for non-admin users
                </Text>
              </View>
            </View>
            <Switch
              value={config.maintenanceMode}
              onValueChange={() => handleToggle("maintenanceMode")}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.success + "20" },
                ]}
              >
                <Ionicons
                  name="person-add"
                  size={20}
                  color={theme.colors.success}
                />
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Enable Registration
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Allow new users to sign up
                </Text>
              </View>
            </View>
            <Switch
              value={config.enableRegistration}
              onValueChange={() => handleToggle("enableRegistration")}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons name="mail" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Require Email Verification
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Verify email before account activation
                </Text>
              </View>
            </View>
            <Switch
              value={config.requireEmailVerification}
              onValueChange={() => handleToggle("requireEmailVerification")}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
        </View>

        {/* Rate Limiting */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Rate Limiting
          </Text>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Requests per Minute
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={String(config.rateLimitPerMinute)}
              onChangeText={v => handleNumberChange("rateLimitPerMinute", v)}
              onBlur={() => handleNumberBlur("rateLimitPerMinute")}
              keyboardType="number-pad"
            />
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Requests per Hour
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={String(config.rateLimitPerHour)}
              onChangeText={v => handleNumberChange("rateLimitPerHour", v)}
              onBlur={() => handleNumberBlur("rateLimitPerHour")}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Session Settings */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          >
            Session Settings
          </Text>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Max Concurrent Sessions
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={String(config.maxConcurrentSessions)}
              onChangeText={v => handleNumberChange("maxConcurrentSessions", v)}
              onBlur={() => handleNumberBlur("maxConcurrentSessions")}
              keyboardType="number-pad"
            />
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Session Expiry (Days)
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={String(config.sessionExpiryDays)}
              onChangeText={v => handleNumberChange("sessionExpiryDays", v)}
              onBlur={() => handleNumberBlur("sessionExpiryDays")}
              keyboardType="number-pad"
            />
          </View>

          <View
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                  Login Attempts Limit
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={String(config.loginAttemptsLimit)}
              onChangeText={v => handleNumberChange("loginAttemptsLimit", v)}
              onBlur={() => handleNumberBlur("loginAttemptsLimit")}
              keyboardType="number-pad"
            />
          </View>
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
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 8,
  },
  savingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  numberInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlign: "center",
    fontSize: 16,
  },
});
