import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View
          style={[styles.logoContainer, { backgroundColor: theme.colors.card }]}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          MagicAppDev
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Build apps like magic
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          AI Project Assistant
        </Text>
        <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
          Describe your app idea and our AI will help you generate code,
          components, and full projects.
        </Text>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link href={"/chat" as any} asChild>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Start Chatting</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.features}>
        <FeatureItem
          icon="phone-portrait"
          title="Cross-Platform"
          description="Build once, deploy to iOS, Android, and Web."
          theme={theme}
        />
        <FeatureItem
          icon="code-working"
          title="AI Generation"
          description="Instant code generation for UI and logic."
          theme={theme}
        />
        <FeatureItem
          icon="cloud-upload"
          title="Cloud Ready"
          description="Seamless deployment to Cloudflare & Vercel."
          theme={theme}
        />
      </View>
    </ScrollView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  theme,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
}) {
  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: `${theme.colors.primary}20` },
        ]}
      >
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.featureText}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    elevation: 2,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
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
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 14,
    marginTop: 2,
  },
});
