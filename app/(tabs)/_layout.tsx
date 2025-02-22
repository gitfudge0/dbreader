import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceVariant,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.onSurface,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "All Torrents", // Changed from 'Torrents' to 'All Torrents'
          tabBarLabel: "Torrents", // This keeps the tab label shorter
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="download"
              size={size}
              color={focused ? colors.primary : colors.onSurfaceVariant}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, size }) => (
            <MaterialCommunityIcons
              name="cog"
              size={size}
              color={focused ? colors.primary : colors.onSurfaceVariant}
            />
          ),
        }}
      />
    </Tabs>
  );
}
