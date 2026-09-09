import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Easing } from "react-native";

type ToastKind = "info" | "success" | "error";

type ToastOptions = {
  kind?: ToastKind;
  durationMs?: number;
};

type ToastState = {
  visible: boolean;
  message: string;
  kind: ToastKind;
};

let toastCallback: ((toast: ToastState) => void) | null = null;

export function showToast(message: string, options?: ToastOptions) {
  const kind = options?.kind ?? "info";
  const durationMs = options?.durationMs ?? 2500;
  if (toastCallback) {
    toastCallback({ visible: true, message, kind });
    setTimeout(() => {
      toastCallback?.({ visible: false, message: "", kind });
    }, durationMs);
  }
}

export function Toast() {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: "",
    kind: "info",
  });
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    toastCallback = (toast: ToastState) => {
      setState(toast);
      if (toast.visible) {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    };
    return () => {
      toastCallback = null;
    };
  }, [animatedValue]);

  if (!state.visible) {
    return null;
  }

  const backgroundColor =
    state.kind === "success" ? "#15803D" : state.kind === "error" ? "#B91C1C" : "#334155";

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor, opacity: animatedValue },
          {
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.message}>{state.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#475569",
    width: "100%",
  },
  message: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
