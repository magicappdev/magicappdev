import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { secureStorage } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: "rocket-outline",
    color: "#3B82F6",
    title: "Build Apps with Plain English",
    description: "Describe the app you want, and MagicAppDev generates the code for you.",
  },
  {
    icon: "chatbubbles-outline",
    color: "#10B981",
    title: "AI-Powered Chat",
    description: "Iterate on your project with an AI assistant that understands your codebase.",
  },
  {
    icon: "cloud-outline",
    color: "#F59E0B",
    title: "Offline Access",
    description: "Cache your projects and keep coding even without an internet connection.",
  },
];

const ONBOARDING_KEY = "magicappdev_onboarding_complete";

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const done = await secureStorage.getItem(ONBOARDING_KEY);
      if (done === "true") {
        router.replace("/projects");
      }
    })();
  }, [router]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    handleDone();
  };

  const handleDone = async () => {
    await secureStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/projects");
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {slides.map((item, index) => (
          <View key={`slide-${index}`} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name={item.icon as any} size={48} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
  },
  activeDot: {
    backgroundColor: "#3B82F6",
    width: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
