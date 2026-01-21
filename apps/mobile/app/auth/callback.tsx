import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";

export default function AuthCallback() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // If user is now authenticated, redirect to home
    if (user && !isLoading) {
      router.replace("/");
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
});
