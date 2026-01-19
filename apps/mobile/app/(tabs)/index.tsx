import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="flash" size={40} color="#007AFF" />
        </View>
        <Text style={styles.title}>MagicAppDev</Text>
        <Text style={styles.subtitle}>Build apps like magic</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Project Assistant</Text>
        <Text style={styles.cardText}>
          Describe your app idea and our AI will help you generate code,
          components, and full projects.
        </Text>
        <Link href={"/chat" as any} asChild>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Start Chatting</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </Link>
      </View>

      <View style={styles.features}>
        <FeatureItem
          icon="phone-portrait"
          title="Cross-Platform"
          description="Build once, deploy to iOS, Android, and Web."
        />
        <FeatureItem
          icon="code-working"
          title="AI Generation"
          description="Instant code generation for UI and logic."
        />
        <FeatureItem
          icon="cloud-upload"
          title="Cloud Ready"
          description="Seamless deployment to Cloudflare & Vercel."
        />
      </View>
    </ScrollView>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  subtitle: {
    fontSize: 18,
    color: "#8E8E93",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#3A3A3C",
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  features: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  featureDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
});
