import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { focusManager } from "@tanstack/react-query";

export function useAppState() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      const subscription = AppState.addEventListener("change", (status) => {
        focusManager.setFocused(status === "active");
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);
}
