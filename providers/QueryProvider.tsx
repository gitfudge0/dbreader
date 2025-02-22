import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Platform } from "react-native";
import { useAppState } from "../hooks/useAppState";
import { useOnlineManager } from "../hooks/useOnlineManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5000,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: Platform.OS === "web",
      refetchOnReconnect: "always",
      refetchOnMount: true,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useOnlineManager();
  useAppState();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
