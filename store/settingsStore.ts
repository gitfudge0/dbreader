// store/settingsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  accessToken: string;
  setAccessToken: (token: string) => void;
}

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accessToken: process.env.EXPO_PUBLIC_API_TOKEN!,
      setAccessToken: (token: string) => set({ accessToken: token }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => storage),
    },
  ),
);
